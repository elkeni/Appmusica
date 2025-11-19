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
    <div className="group relative bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-all duration-200 cursor-pointer">
      <div className="relative w-full" style={{paddingBottom: '100%', position: 'relative'}}>
        <img
          src={getThumbnail()}
          alt={getTitle()}
          style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'}}
          className="group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          {onPlay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(item);
              }}
              className="bg-green-500 hover:bg-green-600 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
            >
              <Play size={20} className="fill-white text-white ml-0.5" />
            </button>
          )}
          {onFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(e, item);
              }}
              className="bg-pink-500 hover:bg-pink-600 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
            >
              <Heart size={20} className="text-white" />
            </button>
          )}
          {onAddPlaylist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddPlaylist(e, item);
              }}
              className="bg-blue-500 hover:bg-blue-600 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
            >
              <Plus size={20} className="text-white" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm truncate group-hover:text-green-400 transition-colors">
          {getTitle()}
        </h3>
        <p className="text-slate-400 text-xs truncate">
          {getArtist()}
        </p>
      </div>
    </div>
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    setShowMobileMenu(false);
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
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black border-r border-slate-800 flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Music size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">CloudTune</h1>
            <p className="text-xs text-slate-400">Music Streaming</p>
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 p-4 space-y-2">
          <NavButton
            icon={<Music size={20} />}
            label="Descubrir"
            active={view === 'discover'}
            onClick={() => {
              setView('discover');
              setSearchResults([]);
              setSearchTerm('');
            }}
          />
          <NavButton
            icon={<Search size={20} />}
            label="Buscar"
            active={view === 'search'}
            onClick={() => setView('search')}
          />
          <NavButton
            icon={<Heart size={20} />}
            label="Favoritos"
            active={view === 'favorites'}
            onClick={() => setView('favorites')}
            badge={favorites.filter((item) => !item.stationuuid).length}
          />
          <NavButton
            icon={<ListMusic size={20} />}
            label="Mi Playlist"
            active={view === 'playlist'}
            onClick={() => setView('playlist')}
            badge={playlist.filter((item) => !item.stationuuid).length}
          />
        </nav>

        {/* Usuario */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Sesión activa</p>
            <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-all"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {view === 'discover' && '🎵 Descubrir'}
              {view === 'search' && '🔍 Resultados de búsqueda'}
              {view === 'playlist-detail' && `📋 ${selectedPlaylist}`}
              {view === 'favorites' && '❤️ Mis Favoritos'}
              {view === 'playlist' && '📋 Mi Playlist'}
            </h2>
            <p className="text-sm text-slate-400">
              {view === 'discover' && `${discoverResults.length} canciones populares`}
              {view === 'search' && `${searchResults.length} resultados encontrados`}
              {view === 'playlist-detail' && `${selectedPlaylistSongs.length} canciones`}
              {view === 'favorites' && `${favorites.filter((item) => !item.stationuuid).length} canciones guardadas`}
              {view === 'playlist' && `${playlist.filter((item) => !item.stationuuid).length} canciones en playlist`}
            </p>
          </div>
        </header>

        {/* SEARCH BAR (en vistas discover y search) */}
        {(view === 'discover' || view === 'search') && (
          <div className="bg-slate-800 px-8 py-4 border-b border-slate-700">
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Busca artistas, canciones, playlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-full focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 text-white placeholder-slate-400 transition-all"
              />
            </form>
          </div>
        )}

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-8">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                <p className="text-slate-400">Cargando canciones...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
              {error}
            </div>
          )}

          {/* Grid de canciones */}
          {!loading && (
            <>
              {/* Vista Descubrir - Muestra playlists precreadas + canciones populares */}
              {view === 'discover' && (
                <>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">📋 Playlists Para Ti</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {preCreatedPlaylists.map((playlist) => (
                        <div
                          key={playlist.id}
                          onClick={() => handlePlaylistClick(playlist.id, playlist.name)}
                          className={`${playlist.bgClass} rounded-lg p-6 cursor-pointer hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl`}
                        >
                          <div className="text-4xl mb-4">{playlist.name.split(' ')[0]}</div>
                          <h3 className="text-xl font-bold text-white mb-2">{playlist.name}</h3>
                          <p className="text-white/80 text-sm">{playlist.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">🔥 Populares Ahora</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {discoverResults.map((item) => (
                        <SongCard key={item.id.videoId} item={item} onPlay={playItem} onFavorite={toggleFavorite} onAddPlaylist={togglePlaylist} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Vista Búsqueda - Muestra resultados */}
              {view === 'search' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {selectedPlaylistSongs.map((item) => (
                      <SongCard key={item.id.videoId} item={item} onPlay={playItem} onFavorite={toggleFavorite} onAddPlaylist={togglePlaylist} />
                    ))}
                  </div>
                </>
              )}

              {/* Vista Favoritos */}
              {view === 'favorites' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favorites
                    .filter((item) => !item.stationuuid)
                    .map((item, idx) => (
                      <SongCard key={item.id?.videoId || idx} item={item} onPlay={playItem} onFavorite={toggleFavorite} onAddPlaylist={togglePlaylist} />
                    ))}
                </div>
              )}

              {/* Vista Playlist */}
              {view === 'playlist' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="text-center py-20 text-slate-500">
              <Search size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold mb-2">No se encontraron resultados</p>
              <p className="text-sm">Intenta con otro término de búsqueda</p>
            </div>
          )}

          {!loading && view === 'favorites' && favorites.filter((item) => !item.stationuuid).length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <Heart size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold mb-2">No tienes favoritos aún</p>
              <button onClick={() => setView('discover')} className="text-pink-500 hover:underline mt-4">
                Explora música
              </button>
            </div>
          )}

          {!loading && view === 'playlist' && playlist.filter((item) => !item.stationuuid).length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <ListMusic size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold mb-2">Tu playlist está vacía</p>
              <button onClick={() => setView('discover')} className="text-green-500 hover:underline mt-4">
                Añade canciones
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MINI PLAYER FOOTER */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto">
            {/* Info */}
            <div
              className="flex items-center gap-4 min-w-0 cursor-pointer hover:text-pink-400 transition-colors"
              onClick={() => setShowNowPlaying(true)}
            >
              <img
                src={currentTrack?.image}
                alt="cover"
                className="w-14 h-14 rounded-lg object-cover shadow-lg flex-shrink-0"
                onError={(e) => (e.target.style.display = 'none')}
              />
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{currentTrack?.title}</p>
                <p className="text-sm text-slate-400 truncate">{currentTrack?.originalData?.snippet?.channelTitle || 'Artista'}</p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-4">
              <button onClick={() => prevTrack()} className="text-slate-400 hover:text-white transition-colors">
                <SkipBack size={20} />
              </button>
              <button
                onClick={() => togglePlayPause()}
                className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white transition-all transform hover:scale-105"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button onClick={() => nextTrack()} className="text-slate-400 hover:text-white transition-colors">
                <SkipForward size={20} />
              </button>
            </div>

            {/* Volumen */}
            <div className="flex items-center gap-3 min-w-max">
              <Volume2 size={18} className="text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA DE REPRODUCCIÓN AMPLIADA */}
      {showNowPlaying && currentTrack && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-800">
            <button
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
              onClick={() => setShowNowPlaying(false)}
            >
              <X size={24} />
            </button>
            <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden shadow-2xl mb-6">
              <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
            </div>
            <h3 className="text-2xl font-bold text-center text-white mb-1">{currentTrack.title}</h3>
            <p className="text-slate-400 text-center mb-6">{currentTrack.originalData?.snippet?.channelTitle || ''}</p>

            <div className="flex items-center justify-center gap-8 mb-8">
              <button onClick={() => prevTrack()} className="text-slate-400 hover:text-white transition-colors">
                <SkipBack size={28} />
              </button>
              <button
                onClick={() => togglePlayPause()}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
              </button>
              <button onClick={() => nextTrack()} className="text-slate-400 hover:text-white transition-colors">
                <SkipForward size={28} />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={(e) => toggleFavorite(e, currentTrack.originalData)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                  favorites.some((f) => {
                    const fid = f?.id?.videoId || f?.videoId;
                    return fid === currentTrack.id;
                  })
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}
              >
                <Heart size={20} className="inline mr-2" fill="currentColor" />
                Favorito
              </button>
              <button
                onClick={(e) => togglePlaylist(e, currentTrack.originalData)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                  playlist.some((p) => {
                    const pid = p?.id?.videoId || p?.videoId;
                    return pid === currentTrack.id;
                  })
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}
              >
                <Plus size={20} className="inline mr-2" />
                Playlist
              </button>
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

  // --- COMPONENTE DE BOTÓN DE NAVEGACIÓN ---
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
  // --- COMPONENTE DE TARJETA UNIFICADO ---
  // Este componente renderiza únicamente canciones de YouTube
  const Card = ({ item }) => {
    // Extraemos la información de la canción de YouTube
    const videoId = item?.id?.videoId || item?.videoId;
    const title = item?.snippet?.title || item?.title || 'Sin título';
    const subtitle = item?.snippet?.channelTitle || item?.artist || '';
    const image = item?.snippet?.thumbnails?.high?.url || item?.image || '';
    const isCurrent = currentTrack?.id === videoId;
    const isFav = favorites.some((f) => {
      const fid = f?.id?.videoId || f?.videoId;
      return fid === videoId;
    });
    const isInPlaylist = playlist.some((p) => {
      const pid = p?.id?.videoId || p?.videoId;
      return pid === videoId;
    });

    // No renderizar elementos que no tengan un videoId válido (por ejemplo, antiguas radios)
    if (!videoId) return null;

    return (
      <div
        onClick={() => playItem(item)}
        className={`group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-pink-500/50 rounded-xl p-3 transition-all cursor-pointer flex items-center gap-4 overflow-hidden ${
          isCurrent ? 'ring-1 ring-pink-500 bg-slate-800' : ''
        }`}
      >
        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center shadow-lg">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : null}
          {/* Fallback Icono de YouTube */}
          <div className="absolute inset-0 flex items-center justify-center z-[-1]">
            <Youtube size={24} className="text-slate-600" />
          </div>
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isCurrent && isPlaying ? (
              <Pause className="text-white fill-white" size={24} />
            ) : (
              <Play className="text-white fill-white" size={24} />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-sm leading-tight mb-1">{title}</h3>
          <p className="text-xs text-slate-400 truncate capitalize">{subtitle}</p>
        </div>
        {/* Botón de favoritos */}
        <button
          onClick={(e) => toggleFavorite(e, item)}
          className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${
            isFav ? 'text-pink-500' : 'text-slate-600 hover:text-pink-400'
          }`}
        >
          <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
        </button>
        {/* Botón de playlist */}
        <button
          onClick={(e) => togglePlaylist(e, item)}
          className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${
            isInPlaylist ? 'text-green-500' : 'text-slate-600 hover:text-green-400'
          }`}
        >
          <Plus size={18} />
        </button>
        {isCurrent && isPlaying && (
          <div className="absolute right-2 top-2 flex gap-0.5 items-end h-3">
            <span className="w-1 bg-pink-500 animate-pulse h-full"></span>
            <span className="w-1 bg-violet-500 animate-pulse h-2/3 delay-75"></span>
            <span className="w-1 bg-pink-500 animate-pulse h-full delay-150"></span>
          </div>
        )}
      </div>
    );
  };
}