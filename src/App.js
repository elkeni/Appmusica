import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Search,
  Heart,
  Music,
  Menu,
  X,
  SkipForward,
  SkipBack,
  Youtube,
  Loader2,
  Plus,
  ListMusic,
} from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { searchMusic } from './youtubeService';
import './index.css';
import Auth from './Auth';
import { auth } from './firebase';

// Componente Card para mostrar canciones
function SongCard({ item, onPlay, onFavorite, onAddPlaylist }) {
  const getThumbnail = () => {
    if (item?.snippet?.thumbnails?.medium?.url) {
      return item.snippet.thumbnails.medium.url;
    }
    return 'https://via.placeholder.com/200?text=No+Image';
  };

  const getTitle = () => {
    return item?.snippet?.title || 'Canción sin título';
  };

  const getArtist = () => {
    return item?.snippet?.channelTitle || 'Artista desconocido';
  };

  return (
    <div className="group relative glass-fluid-subtle rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="relative w-full" style={{paddingBottom: '100%', position: 'relative'}}>
        <img
          src={getThumbnail()}
          alt={getTitle()}
          style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'}}
          className="group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center gap-2 md:gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onPlay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(item);
              }}
              className="bg-green-500 hover:bg-green-600 rounded-full p-2 md:p-3 transition-all duration-200 transform hover:scale-110 shadow-lg"
            >
              <Play size={16} className="fill-white text-white ml-0.5 md:w-5 md:h-5" />
            </button>
          )}
          {onFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(e, item);
              }}
              className="bg-pink-500 hover:bg-pink-600 rounded-full p-2 md:p-3 transition-all duration-200 transform hover:scale-110 shadow-lg"
            >
              <Heart size={16} className="text-white md:w-5 md:h-5" />
            </button>
          )}
          {onAddPlaylist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddPlaylist(e, item);
              }}
              className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 md:p-3 transition-all duration-200 transform hover:scale-110 shadow-lg"
            >
              <Plus size={16} className="text-white md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="p-2 md:p-4">
        <h3 className="font-semibold text-white text-xs md:text-base truncate group-hover:text-pink-400 transition-colors duration-300 font-display">
          {getTitle()}
        </h3>
        <p className="text-slate-300 text-xs truncate font-sans">
          {getArtist()}
        </p>
      </div>
    </div>
  );
}

// Componente de Botón de Navegación
function NavButton({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        active
          ? 'bg-gradient-to-r from-pink-500/20 to-violet-600/20 text-white border border-pink-500/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      {icon}
      <span className="font-medium flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">{badge}</span>
      )}
    </button>
  );
}

export default function App() {
  // Estado de usuario autenticado
  const [user, setUser] = useState(auth.currentUser);

  // Suprimir errores de play/pause interrumpido del navegador
  useEffect(() => {
    const handleError = (event) => {
      if (
        event.message &&
        (event.message.includes('interrupted') ||
          event.message.includes('play() request was interrupted'))
      ) {
        event.preventDefault();
        return true;
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Manejo de login/logout
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (err) {
      setError('Error al cerrar sesión.');
    }
  };

  // Estados
  // Lista de resultados de descubrimiento
  const [discoverResults, setDiscoverResults] = useState([]);
  // Resultados de búsqueda
  const [searchResults, setSearchResults] = useState([]);
  // Favoritos guardados en Firestore
  const [favorites, setFavorites] = useState([]);
  // Lista de reproducción personal
  const [playlist, setPlaylist] = useState([]);
  // Playlists precreadas
  const [preCreatedPlaylists] = useState([
    {
      id: 'trending',
      name: '🔥 Tendencias',
      description: 'Las canciones más populares ahora',
      icon: '🔥',
      bgClass: 'bg-gradient-to-br from-red-500 to-orange-500'
    },
    {
      id: 'pop',
      name: '🎤 Pop Hits',
      description: 'Los mejores éxitos del Pop',
      icon: '🎤',
      bgClass: 'bg-gradient-to-br from-pink-500 to-rose-500'
    },
    {
      id: 'rock',
      name: '🎸 Rock Clásico',
      description: 'Las mejores del Rock',
      icon: '🎸',
      bgClass: 'bg-gradient-to-br from-purple-500 to-indigo-500'
    },
    {
      id: 'reggaeton',
      name: '🎶 Reggaeton Mix',
      description: 'Los mejores reggaeton hits',
      icon: '🎶',
      bgClass: 'bg-gradient-to-br from-yellow-500 to-amber-500'
    },
    {
      id: 'edm',
      name: '⚡ EDM Vibes',
      description: 'Electronic Dance Music para disfrutar',
      icon: '⚡',
      bgClass: 'bg-gradient-to-br from-cyan-500 to-blue-500'
    },
    {
      id: 'indie',
      name: '🎵 Indie Pop',
      description: 'Artistas independientes',
      icon: '🎵',
      bgClass: 'bg-gradient-to-br from-green-500 to-emerald-500'
    }
  ]);
  // Estado de carga mientras se realizan búsquedas
  const [loading, setLoading] = useState(false);

  // Estado del reproductor unificado
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Interfaz de usuario
  const [searchTerm, setSearchTerm] = useState('');
  // Vista actual: 'discover', 'search', 'favorites', 'playlist', 'playlist-detail'
  const [view, setView] = useState('discover');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState([]);
  const [error, setError] = useState(null);

  // Mostrar pantalla de reproducción ampliada
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  // Referencia al reproductor de YouTube
  const playerRef = useRef(null);
  // Control de transición de play/pause para evitar interrupciones
  const playRequestRef = useRef(null);
  // Ref para el audio element
  const audioRef = useRef(null);

  // --- CARGA INICIAL ---
  useEffect(() => {
    loadDiscoverPlaylists();
    loadFavorites();
    loadPlaylist();
  }, []);

  // Efecto para cambiar el iframe cuando la pista actual cambia
  useEffect(() => {
    // Cuando cambia currentTrack, el iframe se recargará automáticamente
    // gracias a que está en el JSX condicionalmente
    console.log('Pista cambió a:', currentTrack?.title);
  }, [currentTrack?.id]);

  // Cargar playlists de descubrimiento
  const loadDiscoverPlaylists = async () => {
    setLoading(true);
    try {
      const data = await searchMusic('Top Hits 2024');
      setDiscoverResults(data.slice(0, 20));
    } catch (err) {
      console.error("Error loading discover:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const docRef = doc(db, 'favorites', 'default');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().stations) {
        setFavorites(docSnap.data().stations);
      }
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  };

  const loadPlaylist = async () => {
    try {
      const docRef = doc(db, 'playlists', 'default');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().items) {
        setPlaylist(docSnap.data().items);
      }
    } catch (err) {
      console.error("Error loading playlist:", err);
    }
  };

  // Actualiza el volumen del audio cuando cambia el estado de volumen
  // No se necesita actualizar audioRef porque ya no hay radio

  // --- LÓGICA DE DATOS ---
  const saveFavorites = async (newFavs) => {
    try {
      const docRef = doc(db, 'favorites', 'default');
      await setDoc(docRef, { stations: newFavs }, { merge: true });
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  // Guardar lista de reproducción
  const savePlaylist = async (newList) => {
    try {
      const docRef = doc(db, 'playlists', 'default');
      await setDoc(docRef, { items: newList }, { merge: true });
    } catch (err) {
      console.error("Error saving playlist:", err);
    }
  };

  // La radio se eliminó, por lo que no necesitamos la función fetchStations

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchTerm) {
      setSearchResults([]);
      setView('discover');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchMusic(searchTerm);
      setSearchResults(data);
      setView('search');
    } catch (err) {
      setError('Error buscando en YouTube.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = async (playlistId, playlistName) => {
    setLoading(true);
    setError(null);
    try {
      let query = '';
      switch(playlistId) {
        case 'trending': query = 'Top Trending 2024'; break;
        case 'pop': query = 'Pop Hits'; break;
        case 'rock': query = 'Classic Rock'; break;
        case 'reggaeton': query = 'Reggaeton Mix'; break;
        case 'edm': query = 'Electronic Dance Music'; break;
        case 'indie': query = 'Indie Music'; break;
        default: query = playlistName;
      }
      const data = await searchMusic(query);
      setSelectedPlaylist(playlistId);
      setSelectedPlaylistSongs(data.slice(0, 30));
      setView('playlist-detail');
    } catch (err) {
      setError('Error cargando playlist: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ya no hay categorías ni radio, por lo que handleCategoryChange no se usa

  // --- LÓGICA DE REPRODUCCIÓN ---
  const playItem = (item) => {
    // Para canciones de YouTube únicamente.
    const videoId = item?.id?.videoId || item?.videoId;
    if (!videoId) {
      setError('No se pudo reproducir este elemento.');
      return;
    }
    const trackData = {
      id: videoId,
      title: item.snippet?.title || item.title || 'Desconocido',
      image: item.snippet?.thumbnails?.high?.url || item.image || '',
      url: `https://www.youtube.com/watch?v=${videoId}`,
      type: 'youtube',
      originalData: item,
    };
    if (currentTrack?.id === trackData.id) {
      // Alternar play/pausa si es la misma pista
      setIsPlaying(!isPlaying);
    } else {
      // Reproducir nueva pista
      setCurrentTrack(trackData);
      setIsPlaying(true);
    }
  };

  // Alternar reproducción/pausa
  const togglePlayPause = () => {
    if (!currentTrack) {
      setError('No hay canción seleccionada');
      return;
    }
    // Cambiar el estado - ReactPlayer manejará las transiciones asincrónicas
    setIsPlaying(prev => !prev);
  };

  const toggleFavorite = (e, item) => {
    e.stopPropagation();
    // Identificamos el ID único sea cual sea el tipo
    const itemId = item.stationuuid || item.id?.videoId;
    
    let newFavs;
    const exists = favorites.some(f => (f.stationuuid || f.id?.videoId) === itemId);

    if (exists) {
      newFavs = favorites.filter(f => (f.stationuuid || f.id?.videoId) !== itemId);
    } else {
      newFavs = [...favorites, item];
    }
    setFavorites(newFavs);
    saveFavorites(newFavs);
  };

  // Agregar o quitar un elemento de la lista de reproducción
  const togglePlaylist = (e, item) => {
    e.stopPropagation();
    const itemId = item.stationuuid || item.id?.videoId;
    let newList;
    const exists = playlist.some(p => (p.stationuuid || p.id?.videoId) === itemId);
    if (exists) {
      newList = playlist.filter(p => (p.stationuuid || p.id?.videoId) !== itemId);
    } else {
      newList = [...playlist, item];
    }
    setPlaylist(newList);
    savePlaylist(newList);
  };

  // Obtener la lista de elementos visible actualmente
  const getCurrentList = () => {
    switch (view) {
      case 'discover':
        return discoverResults;
      case 'search':
        return searchResults;
      case 'playlist-detail':
        return selectedPlaylistSongs;
      case 'favorites':
        return favorites.filter((item) => !item.stationuuid);
      case 'playlist':
        return playlist.filter((item) => !item.stationuuid);
      default:
        return [];
    }
  };

  // Reproducir el siguiente elemento de la lista actual
  const nextTrack = () => {
    const list = getCurrentList();
    if (!currentTrack || list.length === 0) return;
    const currentId = currentTrack.id;
    const index = list.findIndex((item) => {
      const id = item?.id?.videoId || item?.videoId;
      return id === currentId;
    });
    const nextIndex = (index + 1) % list.length;
    playItem(list[nextIndex]);
  };

  // Reproducir el elemento anterior
  const prevTrack = () => {
    const list = getCurrentList();
    if (!currentTrack || list.length === 0) return;
    const currentId = currentTrack.id;
    const index = list.findIndex((item) => {
      const id = item?.id?.videoId || item?.videoId;
      return id === currentId;
    });
    const prevIndex = (index - 1 + list.length) % list.length;
    playItem(list[prevIndex]);
  };

  // --- RENDER PRINCIPAL ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Auth onAuthSuccess={() => setUser(auth.currentUser)} />
      </div>
    );
  }


  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-200/60 to-slate-400/40 text-slate-900 overflow-hidden">
      {/* SIDEBAR - DESKTOP NUEVO DISEÑO */}
      <aside className="hidden md:flex md:w-72 glass-fluid-strong flex-col overflow-y-auto p-0 m-6 rounded-3xl shadow-2xl border border-white/10">
        {/* Logo y nombre */}
        <div className="flex items-center gap-3 px-8 pt-8 pb-6">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <Music size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">CloudTune</h1>
            <p className="text-xs text-slate-400 font-medium">Music Streaming</p>
          </div>
        </div>
        {/* Sección Library */}
        <div className="mt-2">
          <p className="uppercase text-xs font-bold text-slate-400 px-8 mb-2 tracking-widest">Library</p>
          <nav className="flex flex-col gap-1 px-2">
            <NavButton
              icon={<Music size={20} />}
              label="Browse"
              active={view === 'discover'}
              onClick={() => {
                setView('discover');
                setSearchResults([]);
                setSearchTerm('');
              }}
            />
            <NavButton
              icon={<ListMusic size={20} />}
              label="Songs"
              active={view === 'playlist'}
              onClick={() => setView('playlist')}
              badge={playlist.filter((item) => !item.stationuuid).length}
            />
            <NavButton
              icon={<Heart size={20} />}
              label="Albums"
              active={view === 'favorites'}
              onClick={() => setView('favorites')}
              badge={favorites.filter((item) => !item.stationuuid).length}
            />
            <NavButton
              icon={<Search size={20} />}
              label="Artists"
              active={view === 'search'}
              onClick={() => setView('search')}
            />
            <NavButton
              icon={<Youtube size={20} />}
              label="Radio"
              active={false}
              onClick={() => {}}
              badge={0}
            />
          </nav>
        </div>
        {/* Sección My music */}
        <div className="mt-8">
          <p className="uppercase text-xs font-bold text-slate-400 px-8 mb-2 tracking-widest">My music</p>
          <nav className="flex flex-col gap-1 px-2">
            <NavButton
              icon={<ListMusic size={20} />}
              label="Recently Played"
              active={view === 'playlist-detail'}
              onClick={() => setView('playlist-detail')}
              badge={0}
            />
            <NavButton
              icon={<Heart size={20} />}
              label="Favorite Songs"
              active={view === 'favorites'}
              onClick={() => setView('favorites')}
              badge={favorites.filter((item) => !item.stationuuid).length}
            />
            <NavButton
              icon={<Plus size={20} />}
              label="Local File"
              active={false}
              onClick={() => {}}
              badge={0}
            />
          </nav>
        </div>
        {/* Usuario y logout */}
        <div className="mt-auto px-8 pb-8 pt-6">
          <div className="glass-fluid-subtle rounded-xl p-4 mb-3">
            <p className="text-xs text-slate-400 mb-1">Sesión activa</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-sm font-semibold transition-all"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT + PANEL DERECHO NOW PLAYING */}
      <div className="flex-1 flex flex-row overflow-hidden w-full md:w-auto pb-20 md:pb-0">
        {/* Panel central */}
        <div className="flex-1 flex flex-col gap-8 h-full p-0 md:p-8">
                  {/* Panel derecho Now Playing - solo desktop */}
                  <aside className="hidden md:flex flex-col w-96 min-w-[320px] max-w-[420px] glass-fluid-strong rounded-3xl m-6 ml-0 shadow-2xl border border-white/10 overflow-hidden">
                    <div className="p-8 pb-4 border-b border-white/10">
                      <h3 className="text-lg font-extrabold text-slate-800 mb-2 flex items-center gap-2 tracking-tight font-display">
                        <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                        Now Playing
                      </h3>
                      {currentTrack ? (
                        <>
                          <div className="rounded-2xl overflow-hidden shadow-xl mb-4 aspect-square w-full bg-slate-200 group">
                            <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => (e.target.style.display = 'none')} />
                          </div>
                          <h4 className="font-bold text-2xl text-slate-900 truncate mb-1 font-display transition-colors duration-300 group-hover:text-pink-500">{currentTrack.title}</h4>
                          <p className="text-slate-500 text-base mb-4 truncate font-sans">{currentTrack.originalData?.snippet?.channelTitle || ''}</p>
                          <div className="flex items-center gap-3 mb-4">
                            <button onClick={prevTrack} className="p-2 rounded-full bg-slate-200 hover:bg-pink-100 text-pink-500 transition-all shadow hover:scale-110"><SkipBack size={20} /></button>
                            <button onClick={togglePlayPause} className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-lg hover:scale-110 transition-transform">
                              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                            </button>
                            <button onClick={nextTrack} className="p-2 rounded-full bg-slate-200 hover:bg-pink-100 text-pink-500 transition-all shadow hover:scale-110"><SkipForward size={20} /></button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                          <Music size={48} className="mb-4 opacity-20" />
                          <p className="font-semibold">No song playing</p>
                        </div>
                      )}
                    </div>
                    {/* Cola de reproducción (Up Next) */}
                    <div className="flex-1 overflow-y-auto p-8 pt-4">
                      <h4 className="text-base font-bold text-slate-700 mb-3 font-display tracking-tight">Up Next</h4>
                      <ul className="space-y-2">
                        {getCurrentList().slice(0, 6).map((item, idx) => (
                          <li key={item.id?.videoId || idx} className={`flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer group ${currentTrack?.id === (item.id?.videoId || item.videoId) ? 'bg-pink-500/10 ring-2 ring-pink-400/30 scale-105' : 'hover:bg-slate-200/60 hover:scale-105'}`}
                            onClick={() => playItem(item)}
                          >
                            <img src={item.snippet?.thumbnails?.default?.url} alt={item.snippet?.title} className="w-10 h-10 rounded-lg object-cover shadow group-hover:scale-110 transition-transform duration-300" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate font-display group-hover:text-pink-500 transition-colors duration-300">{item.snippet?.title}</p>
                              <p className="text-xs text-slate-500 truncate font-sans">{item.snippet?.channelTitle}</p>
                            </div>
                            <span className="text-xs text-slate-400">2:29</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </aside>
          {/* Tabs superiores */}
          <div className="flex items-center gap-4 mb-2">
            <button className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${view === 'discover' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/60 text-slate-700 hover:bg-pink-100'}`} onClick={() => setView('discover')}>New Releases</button>
            <button className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${view === 'search' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/60 text-slate-700 hover:bg-pink-100'}`} onClick={() => setView('search')}>New Feed</button>
            <button className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${view === 'playlist' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/60 text-slate-700 hover:bg-pink-100'}`} onClick={() => setView('playlist')}>Shuffle Play</button>
          </div>

          {/* Banner playlist destacado */}
          {discoverResults[0] && (
            <div className="relative rounded-3xl overflow-hidden shadow-xl mb-2 flex items-center glass-fluid-glow min-h-[180px]">
              <img src={discoverResults[0]?.snippet?.thumbnails?.high?.url} alt={discoverResults[0]?.snippet?.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="relative z-10 p-8 flex flex-col gap-2 w-full">
                <span className="uppercase text-xs font-bold text-pink-200 tracking-widest mb-1">Curated Playlist</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1">{discoverResults[0]?.snippet?.title}</h2>
                <p className="text-white/80 text-sm max-w-xl mb-2">{discoverResults[0]?.snippet?.description?.slice(0, 80) || 'Enjoy vivid emotions with this stunning music album. Each track is a story.'}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-pink-200 text-xs font-semibold"><Heart size={16} className="inline" /> 63,200 Likes</span>
                  <span className="text-xs text-white/80">Top 2023</span>
                </div>
              </div>
            </div>
          )}

          {/* Carrusel de artistas populares */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800">Popular artists</h3>
              <button className="text-pink-500 text-xs font-semibold hover:underline">See all</button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-2">
              {discoverResults.slice(1, 8).map((item, idx) => (
                <div key={item.id?.videoId || idx} className="flex flex-col items-center min-w-[80px]">
                  <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-white">
                    <img src={item.snippet?.thumbnails?.default?.url} alt={item.snippet?.channelTitle} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 mt-2 truncate w-16 text-center">{item.snippet?.channelTitle?.split(' ')[0] || 'Artist'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Played */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800">Recently played</h3>
              <button className="text-pink-500 text-xs font-semibold hover:underline">See all</button>
            </div>
            <div className="flex flex-col gap-2">
              {playlist.slice(0, 3).map((item, idx) => (
                <div key={item.id?.videoId || idx} className="flex items-center gap-4 p-3 rounded-xl glass-fluid-subtle hover:glass-fluid transition-all cursor-pointer">
                  <img src={item.snippet?.thumbnails?.default?.url} alt={item.snippet?.title} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{item.snippet?.title}</h4>
                    <p className="text-slate-500 text-xs truncate">{item.snippet?.channelTitle}</p>
                  </div>
                  <span className="text-xs text-slate-500">2:29</span>
                  <button onClick={(e) => { e.stopPropagation(); togglePlaylist(e, item); }} className="ml-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2 transition-all"><Plus size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Grid de canciones (descubrir, buscar, playlist, favoritos) */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                  <p className="text-slate-400">Cargando canciones...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="glass-fluid-subtle border border-red-500/30 rounded-lg p-4 mb-6 text-red-400 text-sm">{error}</div>
            )}
            {!loading && (
              <>
                {/* Vista Descubrir - Muestra playlists precreadas + canciones populares */}
                {view === 'discover' && (
                  <>
                    <div className="mb-8">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-4">📋 Playlists Para Ti</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mb-8">
                        {preCreatedPlaylists.map((playlist) => (
                          <div
                            key={playlist.id}
                            onClick={() => handlePlaylistClick(playlist.id, playlist.name)}
                            className={`${playlist.bgClass} rounded-xl p-3 md:p-6 cursor-pointer hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-2xl glass-fluid-glow overflow-hidden group`}
                          >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-white/5 to-transparent"></div>
                            <div className="relative z-10">
                              <div className="text-2xl md:text-4xl mb-2 md:mb-4">{playlist.name.split(' ')[0]}</div>
                              <h3 className="text-sm md:text-xl font-bold text-white mb-1 md:mb-2 line-clamp-2">{playlist.name}</h3>
                              <p className="text-white/80 text-xs md:text-sm hidden sm:block">{playlist.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-8">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-4">🔥 Populares Ahora</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                        {discoverResults.map((item) => (
                          <SongCard key={item.id.videoId} item={item} onPlay={playItem} onFavorite={toggleFavorite} onAddPlaylist={togglePlaylist} />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Vista Búsqueda - Muestra resultados */}
                {view === 'search' && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                    {searchResults.map((item) => (
                      <SongCard key={item.id.videoId} item={item} onPlay={playItem} onFavorite={toggleFavorite} onAddPlaylist={togglePlaylist} />
                    ))}
                  </div>
                )}

                {/* Vista Detalles de Playlist - Muestra canciones de la playlist seleccionada */}
                {view === 'playlist-detail' && (
                  <>
                    <button
                      onClick={() => {
                        setView('discover');
                        setSelectedPlaylist(null);
                        setSelectedPlaylistSongs([]);
                      }}
                      className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <span>←</span> Volver
                    </button>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                      {selectedPlaylistSongs.map((item) => (
                        <SongCard key={item.id.videoId} item={item} onPlay={playItem} onFavorite={toggleFavorite} onAddPlaylist={togglePlaylist} />
                      ))}
                    </div>
                  </>
                )}

                {/* Vista Favoritos */}
                {view === 'favorites' && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                    {favorites
                      .filter((item) => !item.stationuuid)
                      .map((item, idx) => (
                        <SongCard key={item.id?.videoId || idx} item={item} onPlay={playItem} onFavorite={toggleFavorite} onAddPlaylist={togglePlaylist} />
                      ))}
                  </div>
                )}

                {/* Vista Playlist */}
                {view === 'playlist' && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                    {playlist
                      .filter((item) => !item.stationuuid)
                      .map((item, idx) => (
                        <SongCard key={item.id?.videoId || idx} item={item} onPlay={playItem} onFavorite={toggleFavorite} onAddPlaylist={togglePlaylist} />
                      ))}
                  </div>
                )}
              </>
            )}

            {/* Estados vacíos */}
            {!loading && view === 'search' && searchResults.length === 0 && searchTerm && (
              <div className="glass-fluid-subtle text-center py-20 text-slate-500">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-base md:text-lg font-semibold mb-2">No se encontraron resultados</p>
                <p className="text-xs md:text-sm">Intenta con otro término de búsqueda</p>
              </div>
            )}

            {!loading && view === 'favorites' && favorites.filter((item) => !item.stationuuid).length === 0 && (
              <div className="glass-fluid-subtle text-center py-20 text-slate-500">
                <Heart size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold mb-2">No tienes favoritos aún</p>
                <button onClick={() => setView('discover')} className="text-pink-500 hover:underline mt-4">
                  Explora música
                </button>
              </div>
            )}

            {!loading && view === 'playlist' && playlist.filter((item) => !item.stationuuid).length === 0 && (
              <div className="glass-fluid-subtle text-center py-20 text-slate-500">
                <ListMusic size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold mb-2">Tu playlist está vacía</p>
                <button onClick={() => setView('discover')} className="text-green-500 hover:underline mt-4">
                  Añade canciones
                </button>
              </div>
            )}
          </div> {/* Cierre de flex-1 overflow-y-auto */}
        </div> {/* Cierre de flex flex-col gap-8 h-full p-0 md:p-8 */}
      </div> {/* Cierre de flex-1 flex flex-col overflow-hidden w-full md:w-auto pb-20 md:pb-0 */}

      {/* MINI PLAYER FOOTER - SIEMPRE VISIBLE */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-24 z-50 flex justify-center pointer-events-none">
          <div className="glass-player w-full max-w-3xl mx-auto my-4 rounded-2xl shadow-2xl flex items-center gap-4 px-6 py-3 pointer-events-auto">
            {/* Album Art */}
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-lg ring-1 ring-white/20 cursor-pointer" onClick={() => setShowNowPlaying(true)}>
              <img
                src={currentTrack?.image}
                alt="cover"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
            {/* Track Info */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowNowPlaying(true)}>
              <p className="font-semibold text-white text-base truncate">{currentTrack?.title}</p>
              <p className="text-xs text-slate-300 truncate">{currentTrack?.originalData?.snippet?.channelTitle || 'Artista'}</p>
            </div>
            {/* Waveform Progress Bar (simulada) */}
            <div className="hidden md:flex flex-col items-center justify-center gap-1 w-40">
              <div className="w-full h-4 flex items-end gap-0.5">
                {[...Array(32)].map((_, i) => (
                  <div key={i} className={`w-0.5 rounded bg-pink-400 transition-all duration-300 ${i % 3 === 0 ? 'h-4' : i % 2 === 0 ? 'h-2' : 'h-3'} ${isPlaying ? 'animate-pulse' : ''}`}></div>
                ))}
              </div>
              <div className="flex justify-between w-full text-[10px] text-slate-400 mt-1">
                <span>0:00</span>
                <span>3:12</span>
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-2 ml-2">
              <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="p-2 rounded-full bg-slate-800/60 hover:bg-pink-100 text-pink-400 transition-all"><SkipBack size={18} /></button>
              <button onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-lg hover:scale-110 transition-transform">
                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="p-2 rounded-full bg-slate-800/60 hover:bg-pink-100 text-pink-400 transition-all"><SkipForward size={18} /></button>
            </div>
            {/* Volumen y opciones */}
            <div className="hidden md:flex items-center gap-2 ml-2">
              <Volume2 size={18} className="text-slate-300" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="w-20 accent-pink-500"
                style={{ accentColor: '#ec4899' }}
              />
            </div>
            {/* Más opciones */}
            <button className="hidden md:inline-flex p-2 rounded-full hover:bg-slate-800/40 text-slate-400 transition-all ml-2">
              <Menu size={18} />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION - MOBILE ONLY */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 glass-fluid-glow border-t border-slate-800 px-0 py-2 flex items-center justify-around shadow-2xl z-50 backdrop-blur-lg" style={{paddingBottom: currentTrack ? 'calc(5rem + env(safe-area-inset-bottom))' : 'env(safe-area-inset-bottom)'}}>
        <button
          onClick={() => {
            setView('discover');
            setSearchResults([]);
            setSearchTerm('');
          }}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 font-display text-xs ${view === 'discover' ? 'text-pink-500 bg-white/10 shadow-lg scale-105' : 'text-slate-400 hover:text-pink-400 hover:bg-white/5'}`}
        >
          <Music size={24} />
          <span className="font-semibold tracking-tight">Inicio</span>
        </button>
        <button
          onClick={() => setView('search')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 font-display text-xs ${view === 'search' ? 'text-pink-500 bg-white/10 shadow-lg scale-105' : 'text-slate-400 hover:text-pink-400 hover:bg-white/5'}`}
        >
          <Search size={24} />
          <span className="font-semibold tracking-tight">Buscar</span>
        </button>
        <button
          onClick={() => setView('favorites')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 font-display text-xs relative ${view === 'favorites' ? 'text-pink-500 bg-white/10 shadow-lg scale-105' : 'text-slate-400 hover:text-pink-400 hover:bg-white/5'}`}
        >
          <Heart size={24} />
          <span className="font-semibold tracking-tight">Favoritos</span>
          {favorites.filter((item) => !item.stationuuid).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">
              {favorites.filter((item) => !item.stationuuid).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setView('playlist')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 font-display text-xs relative ${view === 'playlist' ? 'text-pink-500 bg-white/10 shadow-lg scale-105' : 'text-slate-400 hover:text-pink-400 hover:bg-white/5'}`}
        >
          <ListMusic size={24} />
          <span className="font-semibold tracking-tight">Playlist</span>
          {playlist.filter((item) => !item.stationuuid).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">
              {playlist.filter((item) => !item.stationuuid).length}
            </span>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 font-display text-xs text-slate-400 hover:text-red-400 hover:bg-white/5"
        >
          <X size={24} />
          <span className="font-semibold tracking-tight">Salir</span>
        </button>
      </nav>

      {/* PANTALLA DE REPRODUCCIÓN AMPLIADA */}
      {showNowPlaying && currentTrack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md glass-fluid-strong rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
            {/* Fondo decorativo con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-violet-600/10 pointer-events-none"></div>
            
            <button
              className="absolute right-4 top-4 text-slate-300 hover:text-white transition-colors z-10 p-2 rounded-full hover:bg-white/10"
              onClick={() => setShowNowPlaying(false)}
            >
              <X size={24} />
            </button>
            
            <div className="relative z-10">
              <div className="w-40 md:w-48 h-40 md:h-48 mx-auto rounded-2xl overflow-hidden shadow-2xl mb-6 ring-1 ring-white/20">
                <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-center text-white mb-1">{currentTrack.title}</h3>
              <p className="text-slate-300 text-center mb-6 text-sm md:text-base">{currentTrack.originalData?.snippet?.channelTitle || ''}</p>

              <div className="flex items-center justify-center gap-8 mb-8">
                <button onClick={() => prevTrack()} className="text-slate-300 hover:text-white transition-colors hover:scale-110 transform">
                  <SkipBack size={28} />
                </button>
                <button
                  onClick={() => togglePlayPause()}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-xl"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>
                <button onClick={() => nextTrack()} className="text-slate-300 hover:text-white transition-colors hover:scale-110 transform">
                  <SkipForward size={28} />
                </button>
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={(e) => toggleFavorite(e, currentTrack.originalData)}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 backdrop-blur-sm ${
                    favorites.some((f) => {
                      const fid = f?.id?.videoId || f?.videoId;
                      return fid === currentTrack.id;
                    })
                      ? 'bg-pink-500/30 text-pink-300 border border-pink-400/50'
                      : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                  }`}
                >
                  <Heart size={20} className="inline mr-2" fill="currentColor" />
                  Favorito
                </button>
                <button
                  onClick={(e) => togglePlaylist(e, currentTrack.originalData)}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 backdrop-blur-sm ${
                    playlist.some((p) => {
                      const pid = p?.id?.videoId || p?.videoId;
                      return pid === currentTrack.id;
                    })
                      ? 'bg-green-500/30 text-green-300 border border-green-400/50'
                      : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                  }`}
                >
                  <Plus size={20} className="inline mr-2" />
                  Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPRODUCTOR DE YOUTUBE EMBEBIDO */}
      {currentTrack && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
          <iframe
            ref={playerRef}
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=${isPlaying ? 1 : 0}&controls=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
            title={currentTrack.title}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>
      )}
    </div>
  );
}