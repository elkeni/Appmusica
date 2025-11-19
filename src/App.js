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
import ReactPlayer from 'react-player';
import { searchMusic } from './youtubeService';
import './index.css';

export default function App() {
  // Estados
  // Lista de resultados de YouTube devueltos por la API
  const [youtubeResults, setYoutubeResults] = useState([]);
  // Favoritos guardados en Firestore
  const [favorites, setFavorites] = useState([]);
  // Lista de reproducción personal
  const [playlist, setPlaylist] = useState([]);
  // Estado de carga mientras se realizan búsquedas
  const [loading, setLoading] = useState(false);

  // Estado del reproductor unificado
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Interfaz de usuario
  const [searchTerm, setSearchTerm] = useState('');
  // Vista actual: 'youtube', 'favorites' o 'playlist'
  const [view, setView] = useState('youtube');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [error, setError] = useState(null);

  // Mostrar pantalla de reproducción ampliada
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  // Referencia al reproductor de YouTube
  const playerRef = useRef(null);

  // --- CARGA INICIAL ---
  useEffect(() => {
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
    loadFavorites();
    // Cargar listas de reproducción
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
    loadPlaylist();
  }, []);

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
    if (!searchTerm) return;
    setLoading(true);
    setError(null);
    setShowMobileMenu(false);
    try {
      // Siempre buscamos en YouTube porque la radio se ha eliminado
      const data = await searchMusic(searchTerm);
      setYoutubeResults(data);
    } catch (err) {
      setError('Error buscando en YouTube.');
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
      case 'youtube':
        return youtubeResults;
      case 'favorites':
        // Excluye cualquier entrada de radio que pueda estar guardada
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

  // Alternar reproducción/pausa desde los controles globales
  const togglePlayPause = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

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

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-pink-500 selection:text-white overflow-hidden flex flex-col">
      
      {/* HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo: siempre regresa a la vista de YouTube */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setView('youtube')}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
              <Music size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
              CloudTune
            </h1>
          </div>

          {/* Barra de búsqueda para YouTube */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search YouTube..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-pink-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          {/* Botones de navegación */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('youtube')}
              className={`p-2 rounded-full transition-colors ${
                view === 'youtube' ? 'bg-green-500/10 text-green-500' : 'hover:bg-slate-800 text-slate-400'
              }`}
              title="YouTube"
            >
              <Youtube size={22} />
            </button>
            <button
              onClick={() => setView('favorites')}
              className={`p-2 rounded-full transition-colors ${
                view === 'favorites' ? 'bg-pink-500/10 text-pink-500' : 'hover:bg-slate-800 text-slate-400'
              }`}
              title="Favorites"
            >
              <Heart size={22} fill={view === 'favorites' ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setView('playlist')}
              className={`p-2 rounded-full transition-colors ${
                view === 'playlist' ? 'bg-green-500/10 text-green-500' : 'hover:bg-slate-800 text-slate-400'
              }`}
              title="Playlist"
            >
              <ListMusic size={22} />
            </button>
            <button className="md:hidden p-2 text-slate-300" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {showMobileMenu && (
          <div className="md:hidden bg-slate-800 border-b border-slate-700 p-4 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4 relative">
              <input
                type="text"
                placeholder="Search YouTube..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setView('youtube')}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  view === 'youtube' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                YouTube
              </button>
              <button
                onClick={() => setView('favorites')}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  view === 'favorites' ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                Favorites
              </button>
              <button
                onClick={() => setView('playlist')}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  view === 'playlist' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                Playlist
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-4 pb-32 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="max-w-7xl mx-auto">
          {/* Las categorías de radio se han eliminado, la app se centra solo en música de YouTube */}

          {/* Título */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {view === 'favorites' ? (
                <>
                  My Favorites ({favorites.filter((item) => !item.stationuuid).length})
                </>
              ) : view === 'playlist' ? (
                <>
                  My Playlist ({playlist.filter((item) => !item.stationuuid).length})
                </>
              ) : (
                <>
                  YouTube Results ({youtubeResults.length})
                </>
              )}
            </h2>
          </div>

          {error && <div className="bg-red-500/10 text-red-200 p-4 rounded-lg mb-6 text-center">{error}</div>}

          {/* GRID DE CONTENIDO */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {view === 'youtube' &&
                youtubeResults.map((item) => (
                  <Card key={item.id.videoId} item={item} />
                ))}
              {view === 'favorites' &&
                favorites
                  .filter((item) => !item.stationuuid)
                  .map((item, idx) => (
                    <Card key={item.id?.videoId || idx} item={item} />
                  ))}
              {view === 'playlist' &&
                playlist
                  .filter((item) => !item.stationuuid)
                  .map((item, idx) => (
                    <Card key={item.id?.videoId || idx} item={item} />
                  ))}
            </div>
          )}

          {view === 'favorites' && favorites.filter((item) => !item.stationuuid).length === 0 && !loading && (
            <div className="text-center py-20 text-slate-500">
              <Heart size={64} className="mx-auto mb-4 opacity-20" />
              <p>No tienes favoritos aún.</p>
              <button onClick={() => setView('youtube')} className="text-pink-500 hover:underline mt-2">Explorar música</button>
            </div>
          )}

          {view === 'playlist' && playlist.filter((item) => !item.stationuuid).length === 0 && !loading && (
            <div className="text-center py-20 text-slate-500">
              <ListMusic size={64} className="mx-auto mb-4 opacity-20" />
              <p>No tienes canciones en tu playlist.</p>
              <button onClick={() => setView('youtube')} className="text-green-500 hover:underline mt-2">Explorar música</button>
            </div>
          )}
        </div>
      </main>

      {/* PLAYER FOOTER */}
      <footer className={`fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 transition-transform duration-300 z-50 ${currentTrack ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Info Canción */}
          <div className="flex items-center gap-3 w-1/3 overflow-hidden" onClick={() => currentTrack && setShowNowPlaying(true)} style={{ cursor: currentTrack ? 'pointer' : 'default' }}>
            <div className={`w-12 h-12 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden shadow-md ${isPlaying ? 'animate-pulse-slow' : ''}`}>
              <img src={currentTrack?.image} alt="cover" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <div className="min-w-0">
              <div className="text-white font-medium truncate text-sm">{currentTrack?.title || 'Selecciona música'}</div>
              <div className="text-xs text-pink-400 flex items-center gap-1">
                 {isPlaying ? <Loader2 size={10} className="animate-spin"/> : null}
                 {isPlaying ? 'Reproduciendo...' : 'Pausado'}
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center gap-4 w-1/3">
            <button onClick={() => prevTrack()} className="text-slate-400 hover:text-white hidden sm:block"><SkipBack size={20} /></button>
            <button onClick={() => togglePlayPause()} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition">
              {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} className="ml-0.5" />}
            </button>
            <button onClick={() => nextTrack()} className="text-slate-400 hover:text-white hidden sm:block"><SkipForward size={20} /></button>
          </div>

          {/* Volumen */}
          <div className="flex items-center justify-end gap-2 w-1/3 group">
             <Volume2 size={18} className="text-slate-400"/>
             <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full" />
          </div>
        </div>
      </footer>

      {/* REPRODUCTOR OCULTO (Técnicamente visible para que YouTube no lo bloquee) */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        {/* Reproductor de YouTube */}
        <ReactPlayer
          ref={playerRef}
          url={currentTrack?.url || null}
          playing={isPlaying}
          volume={volume}
          onReady={() => console.log('Reproductor listo para: ', currentTrack?.title)}
          onBuffer={() => console.log('Cargando audio...')}
          onEnded={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Error de reproducción:', e);
            setError('No se pudo reproducir este contenido. Intenta otro.');
            setIsPlaying(false);
          }}
          width="100%"
          height="100%"
          config={{
            youtube: {
              playerVars: {
                showinfo: 0,
                autoplay: 1,
                origin: typeof window !== 'undefined' ? window.location.origin : '',
                modestbranding: 1,
                controls: 0,
              },
            },
            file: {
              forceAudio: true,
            },
          }}
        />
      </div>
      {/* Pantalla de reproducción ampliada */}
      {showNowPlaying && currentTrack && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="relative w-full max-w-md bg-slate-900 rounded-xl p-6 shadow-lg flex flex-col items-center">
            <button className="absolute right-4 top-4 text-slate-400 hover:text-white" onClick={() => setShowNowPlaying(false)}>
              <X size={24} />
            </button>
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-lg overflow-hidden shadow-lg mb-4">
              <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <h3 className="text-xl font-bold text-center mb-1 truncate w-full">{currentTrack.title}</h3>
            <p className="text-slate-400 text-sm mb-4 truncate w-full text-center">
              {currentTrack.originalData?.snippet?.channelTitle || ''}
            </p>
            <div className="flex items-center gap-6 mb-4">
              <button onClick={() => prevTrack()} className="text-slate-400 hover:text-white"><SkipBack size={28} /></button>
              <button onClick={() => togglePlayPause()} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition">
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </button>
              <button onClick={() => nextTrack()} className="text-slate-400 hover:text-white"><SkipForward size={28} /></button>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => toggleFavorite(e, currentTrack.originalData)}
                className={`p-3 rounded-full ${favorites.some((f) => {
                  const fid = f?.id?.videoId || f?.videoId;
                  return fid === currentTrack.id;
                }) ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
              >
                <Heart
                  size={24}
                  fill={favorites.some((f) => {
                    const fid = f?.id?.videoId || f?.videoId;
                    return fid === currentTrack.id;
                  })
                    ? 'currentColor'
                    : 'none'}
                />
              </button>
              <button
                onClick={(e) => togglePlaylist(e, currentTrack.originalData)}
                className={`p-3 rounded-full ${playlist.some((p) => {
                  const pid = p?.id?.videoId || p?.videoId;
                  return pid === currentTrack.id;
                }) ? 'text-green-500' : 'text-slate-400 hover:text-green-400'}`}
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}