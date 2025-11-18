import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Search, Heart, Radio, Music, Menu, X, SkipForward, SkipBack, PlayCircle, Youtube
} from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import ReactPlayer from 'react-player';
import { searchMusic } from './youtubeService';
import './index.css';

export default function App() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // Unified state for radio or YouTube
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('top');
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState('radio'); // radio, favorites, youtube
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [error, setError] = useState(null);
  const [youtubeResults, setYoutubeResults] = useState([]);

  const playerRef = useRef(null);

  const saveFavoritesToFirestore = async (favs) => {
    try {
      const docRef = doc(db, 'favorites', 'default');
      await setDoc(docRef, { stations: favs }, { merge: true });
    } catch (err) {
      console.error("Error saving favorites:", err);
    }
  };

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const docRef = doc(db, 'favorites', 'default');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.stations) {
            setFavorites(data.stations);
          }
        }
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    };
    loadFavorites();
    fetchStations('top');
  }, []);

  const fetchStations = async (category, query = '') => {
    setLoading(true);
    setError(null);
    try {
      const limit = 30;
      const baseUrl = 'https://de1.api.radio-browser.info/json/stations';
      let url = '';

      if (query) {
        url = `${baseUrl}/byname/${query}?limit=${limit}&hidebroken=true&order=clickcount&reverse=true`;
      } else if (category === 'top') {
        url = `${baseUrl}/topclick?limit=${limit}&hidebroken=true`;
      } else {
        url = `${baseUrl}/bytag/${category}?limit=${limit}&hidebroken=true&order=clickcount&reverse=true`;
      }

      const response = await fetch(url);
      const data = await response.json();
      const validStations = data.filter(s => s.name && s.url_resolved);
      setStations(validStations);
    } catch (err) {
      setError("Error connecting to the music cloud. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleYoutubeSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchMusic(searchTerm);
      setYoutubeResults(data);
      setView('youtube');
    } catch (err) {
      setError("Failed to search YouTube. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setShowMobileMenu(false);
    }
  };

  const playItem = (item, type) => {
    if (currentItem?.id === item.id) {
      togglePlay();
    } else {
      setCurrentItem({ ...item, type });
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFavorite = (station, e) => {
    e.stopPropagation();
    let newFavs;
    if (favorites.some(f => f.stationuuid === station.stationuuid)) {
      newFavs = favorites.filter(f => f.stationuuid !== station.stationuuid);
    } else {
      newFavs = [...favorites, station];
    }
    setFavorites(newFavs);
    saveFavoritesToFirestore(newFavs);
  };

  const handleCategoryChange = (newGenre) => {
    setGenre(newGenre);
    setSearchTerm('');
    fetchStations(newGenre);
    setView('radio');
    setShowMobileMenu(false);
  };
  
  const handleSearchView = () => {
    if (view === 'youtube') {
      handleYoutubeSearch(new Event('submit'));
    } else {
      fetchStations('', searchTerm);
      setView('radio');
    }
    setShowMobileMenu(false);
  };

  const renderRadioStations = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {(view === 'favorites' ? favorites : stations).map((station) => {
        const isCurrent = currentItem?.type === 'radio' && currentItem?.stationuuid === station.stationuuid;
        const isFav = favorites.some(f => f.stationuuid === station.stationuuid);
        return (
          <div 
            key={station.stationuuid}
            onClick={() => playItem({ ...station, id: station.stationuuid }, 'radio')}
            className={`group relative bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700/50 hover:border-pink-500/50 rounded-xl p-3 transition-all cursor-pointer flex items-center gap-4 overflow-hidden ${isCurrent ? 'ring-2 ring-pink-500 bg-slate-700' : ''}`}
          >
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center shadow-lg">
              {station.favicon ? (
                <img src={station.favicon} alt={station.name} className="w-full h-full object-cover" onError={(e) => {e.target.onerror = null; e.target.src = ''}} />
              ) : (
                <Music className="text-slate-600" />
              )}
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {isCurrent && isPlaying ? <Pause className="text-white fill-white" size={24} /> : <Play className="text-white fill-white" size={24} />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate leading-tight mb-1">{station.name}</h3>
              <p className="text-xs text-slate-400 truncate capitalize">{station.tags || 'Online Radio'}</p>
              <p className="text-xs text-slate-500 truncate mt-1">{station.country || 'Worldwide'}</p>
            </div>
            <button 
              onClick={(e) => toggleFavorite(station, e)}
              className={`p-2 rounded-full hover:bg-slate-600 transition-colors ${isFav ? 'text-pink-500' : 'text-slate-600 hover:text-pink-400'}`}
            >
              <Heart size={18} fill={isFav ? "currentColor" : "none"} />
            </button>
            {isCurrent && isPlaying && (
              <div className="absolute right-2 top-2 flex gap-0.5 items-end h-3">
                <div className="w-1 bg-pink-500 animate-pulse h-full"></div>
                <div className="w-1 bg-violet-500 animate-pulse h-2/3" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 bg-pink-500 animate-pulse h-full" style={{animationDelay: '0.2s'}}></div>
              </div>
            )}
          </div>
        );
      })}
      {(view === 'favorites' && favorites.length === 0) && (
        <div className="col-span-full text-center py-20 text-slate-500">
          <Heart size={48} className="mx-auto mb-4 opacity-20" />
          <p>You don't have any favorites yet.</p>
          <button onClick={() => setView('radio')} className="text-pink-500 hover:underline mt-2">Explore stations</button>
        </div>
      )}
    </div>
  );

  const renderYoutubeResults = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
      {youtubeResults.map((item) => {
        const isCurrent = currentItem?.type === 'youtube' && currentItem?.id.videoId === item.id.videoId;
        return (
          <div key={item.id.videoId} className={`bg-gray-800 rounded-xl overflow-hidden hover:scale-105 transition duration-300 shadow-lg ${isCurrent ? 'ring-2 ring-green-500' : ''}`}>
            <img 
              src={item.snippet.thumbnails.high.url} 
              alt={item.snippet.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-lg truncate">{item.snippet.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{item.snippet.channelTitle}</p>
              <button 
                onClick={() => playItem({ ...item, id: item.id.videoId, url: `https://www.youtube.com/watch?v=${item.id.videoId}` }, 'youtube')}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-full flex items-center justify-center gap-2 font-bold"
              >
                <PlayCircle size={20} /> {isCurrent && isPlaying ? 'Playing' : 'Play'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-pink-500 selection:text-white overflow-hidden flex flex-col">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('radio')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Music size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
              CloudTune
            </h1>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSearchView(); }} className="hidden md:flex flex-1 max-w-md mx-8 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder={view === 'youtube' ? "Search on YouTube..." : "Search artists, genres..."}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('youtube')}
              className={`p-2 rounded-full transition-colors relative ${view === 'youtube' ? 'text-green-500 bg-green-500/10' : 'text-slate-400 hover:bg-slate-800'}`}
              title="Search YouTube"
            >
              <Youtube size={22} />
            </button>
            <button 
              onClick={() => setView('favorites')}
              className={`p-2 rounded-full transition-colors relative ${view === 'favorites' ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 hover:bg-slate-800'}`}
              title="My Favorites"
            >
              <Heart size={22} fill={view === 'favorites' ? "currentColor" : "none"} />
              {favorites.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full"></span>
              )}
            </button>
            <button 
              className="md:hidden p-2 text-slate-300"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {showMobileMenu && (
          <div className="md:hidden bg-slate-800 border-b border-slate-700 p-4 animate-fade-in">
            <form onSubmit={(e) => { e.preventDefault(); handleSearchView(); }} className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:border-pink-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            <div className="flex flex-wrap gap-2">
              {['top', 'latin', 'rock', 'jazz', 'news', '80s'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1 rounded-full text-sm capitalize ${genre === cat ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto">
          {view !== 'youtube' && view !== 'favorites' && (
            <div className="hidden md:flex gap-3 mb-6 overflow-x-auto pb-2">
              {['top', 'latin', 'reggaeton', 'rock', 'pop', 'classical', 'jazz', 'news', '80s', '90s'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize whitespace-nowrap
                    ${genre === cat 
                      ? 'bg-gradient-to-r from-pink-600 to-violet-600 text-white shadow-lg shadow-pink-500/25' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {view === 'favorites' ? <><Heart className="text-pink-500" fill="currentColor" /> My Favorites</> :
               view === 'youtube' ? <><Youtube className="text-green-500" /> YouTube Results</> :
               <><Radio className="text-violet-500" /> Explore: <span className="capitalize text-slate-400 ml-2">{searchTerm ? `"${searchTerm}"` : genre}</span></>}
            </h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">
              {view === 'favorites' ? favorites.length : view === 'youtube' ? youtubeResults.length : stations.length} items
            </span>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-center">{error}</div>}
          {loading ? <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div> : 
           view === 'youtube' ? renderYoutubeResults() : renderRadioStations()}
        </div>
      </main>

      <footer className={`fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 transition-transform duration-300 z-40 ${currentItem ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-1/3">
            <div className={`w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shadow-md ${isPlaying ? 'animate-pulse' : ''}`}>
               {currentItem?.favicon ? <img src={currentItem.favicon} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} alt="favicon" /> :
                currentItem?.type === 'youtube' ? <img src={currentItem.snippet.thumbnails.default.url} className="w-full h-full object-cover" alt="thumbnail" /> :
                <Music size={20} className="text-slate-500" />}
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="text-white font-medium truncate">{currentItem?.name || currentItem?.snippet?.title || 'Select an item'}</div>
              <div className="text-xs text-pink-400 animate-pulse">
                {isPlaying ? 'Playing...' : 'Paused'}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 w-1/3">
            <button className="text-slate-400 hover:text-white hidden sm:block" onClick={() => {}}>
              <SkipBack size={20} />
            </button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 hover:scale-105 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
            </button>
            <button className="text-slate-400 hover:text-white hidden sm:block" onClick={() => {}}>
              <SkipForward size={20} />
            </button>
          </div>
          <div className="flex items-center justify-end gap-3 w-1/3">
            <div className="hidden md:flex items-center gap-2 group">
              <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className="text-slate-400 hover:text-white">
                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-pink-500"
              />
            </div>
            <button 
              className="sm:hidden text-slate-400"
              onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
            >
              {volume === 0 ? <VolumeX /> : <Volume2 />}
            </button>
          </div>
        </div>
      </footer>
      
      <ReactPlayer
        ref={playerRef}
        url={currentItem?.type === 'radio' ? currentItem?.url_resolved : currentItem?.url}
        playing={isPlaying}
        volume={volume}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => setError(`Error playing ${currentItem?.type}. Please try another.`)}
        width="0"
        height="0"
        config={{
          youtube: { playerVars: { showinfo: 1 } }
        }}
      />

      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-violet-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/3 right-0 w-1/3 h-1/3 bg-pink-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-1/4 left-1/3 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}