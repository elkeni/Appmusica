import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Search, Heart, Radio, Music, Menu, X, SkipForward, SkipBack } from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Componente principal de la aplicación.
export default function App() {
  // Estados de la aplicación
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('top'); // top, latin, oldies, classical, pop
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState('home'); // home, favorites
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [error, setError] = useState(null);

  // Referencia al elemento de audio HTML
  const audioRef = useRef(null);

  // Función para guardar favoritos en Firestore
  const saveFavoritesToFirestore = async (favs) => {
    try {
      const docRef = doc(db, 'favorites', 'default');
      await setDoc(docRef, { stations: favs }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  // Cargar favoritos y estaciones al iniciar
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
        console.error(err);
      }
    };
    loadFavorites();
    fetchStations('top');
  }, []);

  // Efecto para manejar el volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Función para buscar estaciones en la API pública
  const fetchStations = async (category, query = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = '';
      const limit = 30;

      // Servidor de la API de Radio Browser
      const baseUrl = 'https://de1.api.radio-browser.info/json/stations';

      if (query) {
        url = `${baseUrl}/byname/${query}?limit=${limit}&hidebroken=true&order=clickcount&reverse=true`;
      } else if (category === 'top') {
        url = `${baseUrl}/topclick?limit=${limit}&hidebroken=true`;
      } else {
        url = `${baseUrl}/bytag/${category}?limit=${limit}&hidebroken=true&order=clickcount&reverse=true`;
      }

      const response = await fetch(url);
      const data = await response.json();

      // Filtrar estaciones que no tengan un nombre claro
      const validStations = data.filter(s => s.name && s.url_resolved);
      setStations(validStations);
    } catch (err) {
      setError("Error al conectar con la nube de música. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Manejar reproducción
  const playStation = (station) => {
    if (currentStation?.stationuuid === station.stationuuid) {
      togglePlay();
    } else {
      setCurrentStation(station);
      setIsPlaying(true);
      // Pequeño timeout para asegurar que el audio cargue la nueva URL
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Esperando interacción del usuario", e));
        }
      }, 100);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Manejar Favoritos
  const toggleFavorite = (station, e) => {
    e.stopPropagation(); // Evitar que se reproduzca al dar like
    let newFavs;
    if (favorites.some(f => f.stationuuid === station.stationuuid)) {
      newFavs = favorites.filter(f => f.stationuuid !== station.stationuuid);
    } else {
      newFavs = [...favorites, station];
    }
    setFavorites(newFavs);
    // Actualiza Firestore
    saveFavoritesToFirestore(newFavs);
  };

  // Manejo de búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStations('', searchTerm);
    setView('home');
    setShowMobileMenu(false);
  };

  // Cambio de categoría
  const handleCategoryChange = (newGenre) => {
    setGenre(newGenre);
    setSearchTerm('');
    fetchStations(newGenre);
    setView('home');
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-pink-500 selection:text-white overflow-hidden flex flex-col">

      {/* Elemento de Audio Invisible */}
      <audio 
        ref={audioRef} 
        src={currentStation?.url_resolved} 
        onError={() => setError("Esta estación no está disponible ahora. Prueba otra.")}
        onEnded={() => setIsPlaying(false)}
      />

      {/* --- HEADER --- */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Music size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
              CloudTune
            </h1>
          </div>

          {/* Buscador Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar artistas, géneros o países..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          {/* Acciones Header */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('favorites')}
              className={`p-2 rounded-full transition-colors relative ${view === 'favorites' ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 hover:bg-slate-800'}`}
              title="Mis Favoritos"
            >
              <Heart size={22} fill={view === 'favorites' ? "currentColor" : "none"} />
              {favorites.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full"></span>
              )}
            </button>

            {/* Botón Menú Móvil */}
            <button 
              className="md:hidden p-2 text-slate-300"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Menú Móvil Desplegable */}
        {showMobileMenu && (
          <div className="md:hidden bg-slate-800 border-b border-slate-700 p-4 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar..."
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

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-4 pb-32 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto">

          {/* Categorías (Desktop) */}
          {view === 'home' && (
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

          {/* Título de Sección */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {view === 'favorites' ? (
                <>
                  <Heart className="text-pink-500" fill="currentColor" /> Mis Favoritos
                </>
              ) : (
                <>
                  <Radio className="text-violet-500" /> Explorar: <span className="capitalize text-slate-400 ml-2">{searchTerm ? `"${searchTerm}"` : genre}</span>
                </>
              )}
            </h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">
              {view === 'favorites' ? favorites.length : stations.length} emisoras
            </span>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {/* GRID DE ESTACIONES */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(view === 'favorites' ? favorites : stations).map((station) => {
                const isCurrent = currentStation?.stationuuid === station.stationuuid;
                const isFav = favorites.some(f => f.stationuuid === station.stationuuid);

                return (
                  <div 
                    key={station.stationuuid}
                    onClick={() => playStation(station)}
                    className={`group relative bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700/50 hover:border-pink-500/50 rounded-xl p-3 transition-all cursor-pointer flex items-center gap-4 overflow-hidden ${isCurrent ? 'ring-2 ring-pink-500 bg-slate-700' : ''}`}
                  >
                    {/* Imagen / Icono */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center shadow-lg">
                      {station.favicon ? (
                        <img src={station.favicon} alt={station.name} className="w-full h-full object-cover" onError={(e) => {e.target.onerror = null; e.target.src = ''}} />
                      ) : (
                        <Music className="text-slate-600" />
                      )}

                      {/* Overlay de Play */}
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isCurrent && isPlaying ? <Pause className="text-white fill-white" size={24} /> : <Play className="text-white fill-white" size={24} />}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate leading-tight mb-1">{station.name}</h3>
                      <p className="text-xs text-slate-400 truncate capitalize">{station.tags || 'Radio Online'}</p>
                      <p className="text-xs text-slate-500 truncate mt-1">{station.country || 'Mundial'}</p>
                    </div>

                    {/* Botón Favorito */}
                    <button 
                      onClick={(e) => toggleFavorite(station, e)}
                      className={`p-2 rounded-full hover:bg-slate-600 transition-colors ${isFav ? 'text-pink-500' : 'text-slate-600 hover:text-pink-400'}`}
                    >
                      <Heart size={18} fill={isFav ? "currentColor" : "none"} />
                    </button>

                    {/* Indicador de "Sonando" */}
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

              {/* Estado Vacío */}
              {(view === 'favorites' && favorites.length === 0) && (
                <div className="col-span-full text-center py-20 text-slate-500">
                  <Heart size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Aún no tienes favoritos.</p>
                  <button onClick={() => setView('home')} className="text-pink-500 hover:underline mt-2">Explorar emisoras</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- PLAYER BAR (Footer) --- */}
      <footer className={`fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 transition-transform duration-300 z-40 ${currentStation ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Info Estación Actual */}
          <div className="flex items-center gap-3 w-1/3">
            <div className={`w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shadow-md ${isPlaying ? 'animate-pulse' : ''}`}>
               {currentStation?.favicon ? (
                  <img src={currentStation.favicon} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} alt="favicon" />
               ) : (
                  <Music size={20} className="text-slate-500" />
               )}
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="text-white font-medium truncate">{currentStation?.name || 'Selecciona una radio'}</div>
              <div className="text-xs text-pink-400 animate-pulse">
                {isPlaying ? 'Reproduciendo en vivo...' : 'Pausado'}
              </div>
            </div>
          </div>

          {/* Controles Principales */}
          <div className="flex items-center justify-center gap-4 w-1/3">
            <button className="text-slate-400 hover:text-white hidden sm:block" onClick={() => {/* Skip back placeholder */}}>
              <SkipBack size={20} />
            </button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 hover:scale-105 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
            </button>
            <button className="text-slate-400 hover:text-white hidden sm:block" onClick={() => {/* Skip forward placeholder */}}>
              <SkipForward size={20} />
            </button>
          </div>

          {/* Volumen y Extras */}
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

      {/* Visualizador de fondo (Estético) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-violet-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/3 right-0 w-1/3 h-1/3 bg-pink-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-1/4 left-1/3 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}