import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Search, Heart, Music, SkipForward, SkipBack, Loader2, Plus, ListMusic, X } from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { searchDeezer, getDeezerCharts, getDeezerArtist, getArtistTopTracks, getArtistAlbums, getDeezerAlbum, getYouTubeVideoForTrack, getSimilarTracks } from './services/hybridMusicService';
import './index.css';
import Auth from './Auth';
import { auth } from './firebase';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import SongCard from './components/SongCard';
import SongListItem from './components/SongListItem';
import SongMenu from './components/SongMenu';
import BrowseView from './components/BrowseView';

export default function App() {
  const [user, setUser] = useState(auth.currentUser);

  // Helper for item IDs - defined at top to avoid reference errors
  const getItemId = (item) => {
    if (!item) return Math.random().toString(36).slice(2);
    if (item?.stationuuid) return item.stationuuid;
    if (item?.deezerId) return `deezer_${item.deezerId}`;
    if (item?.id?.videoId) return item.id.videoId;
    if (item?.videoId) return item.videoId;
    if (item?.id) return String(item.id);
    if (item?.snippet?.title) return item.snippet.title + Math.random().toString(36).slice(2, 6);
    if (item?.title) return item.title + Math.random().toString(36).slice(2, 6);
    return Math.random().toString(36).slice(2);
  };

  useEffect(() => {
    const handleError = (event) => {
      if (event.message && (event.message.includes('interrupted') || event.message.includes('play() request was interrupted'))) {
        event.preventDefault();
        return true;
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const [discoverResults, setDiscoverResults] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [recentlyPlayedList, setRecentlyPlayedList] = useState([]);
  const [popularNow, setPopularNow] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [preCreatedPlaylists] = useState([
    { id: 'trending', name: 'Tendencias', description: 'Las canciones más populares ahora', icon: '🔥', bgClass: 'bg-gradient-to-br from-red-500 to-orange-500' },
    { id: 'pop', name: 'Pop Hits', description: 'Los mejores éxitos del Pop', icon: '🎤', bgClass: 'bg-gradient-to-br from-pink-500 to-rose-500' },
    { id: 'rock', name: 'Rock Clásico', description: 'Las mejores del Rock', icon: '🎸', bgClass: 'bg-gradient-to-br from-purple-500 to-indigo-500' },
    { id: 'reggaeton', name: 'Reggaeton Mix', description: 'Los mejores reggaeton hits', icon: '🎶', bgClass: 'bg-gradient-to-br from-yellow-500 to-amber-500' },
    { id: 'edm', name: 'EDM Vibes', description: 'Electronic Dance Music para disfrutar', icon: '⚡', bgClass: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
    { id: 'indie', name: 'Indie Pop', description: 'Artistas independientes', icon: '🎵', bgClass: 'bg-gradient-to-br from-green-500 to-emerald-500' }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [history, setHistory] = useState([]); // Playback history
  const [queue, setQueue] = useState([]); // Up Next Queue
  const [playbackContext, setPlaybackContext] = useState(null); // { type: 'ALBUM'|'PLAYLIST'|'AUTOPLAY', id: ... }

  // Artist detail state
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistTopTracks, setArtistTopTracks] = useState([]);
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState([]);

  // Categorized search results
  const [searchArtists, setSearchArtists] = useState([]);
  const [searchTracks, setSearchTracks] = useState([]);
  const [searchAlbums, setSearchAlbums] = useState([]);
  const [showAllTracks, setShowAllTracks] = useState(false);

  // User Playlists State
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [selectedUserPlaylist, setSelectedUserPlaylist] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(null); // stores the item to add
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Color extraction helpers: quantize and pick dominant colors from artwork
  const hexFromRgb = (r, g, b) => {
    const toHex = (v) => {
      const s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
      return s.length === 1 ? '0' + s : s;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const darkenHex = (hex, amount = 0.25) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const rr = Math.max(0, Math.min(255, Math.round(r * (1 - amount))));
    const gg = Math.max(0, Math.min(255, Math.round(g * (1 - amount))));
    const bb = Math.max(0, Math.min(255, Math.round(b * (1 - amount))));
    return hexFromRgb(rr, gg, bb);
  };

  const extractPaletteFromImage = (url, size = 40) => new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        const counts = {};
        for (let i = 0; i < data.length; i += 8) { // sample every 2nd pixel
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const qr = (r >> 4) & 0xF;
          const qg = (g >> 4) & 0xF;
          const qb = (b >> 4) & 0xF;
          const key = (qr << 8) | (qg << 4) | qb;
          counts[key] = (counts[key] || 0) + 1;
        }
        const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (entries.length === 0) return resolve(null);
        const primaryKey = parseInt(entries[0][0], 10);
        const secondaryKey = entries[1] ? parseInt(entries[1][0], 10) : primaryKey;
        const decode = (k) => {
          const qr = (k >> 8) & 0xF;
          const qg = (k >> 4) & 0xF;
          const qb = k & 0xF;
          return {
            r: Math.round((qr * 17)),
            g: Math.round((qg * 17)),
            b: Math.round((qb * 17))
          };
        };
        const p = decode(primaryKey);
        const s = decode(secondaryKey);
        const primary = hexFromRgb(p.r, p.g, p.b);
        const secondary = hexFromRgb(s.r, s.g, s.b);
        resolve({ primary, secondary });
      } catch (err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });

  // Apply palette to CSS variables when currentTrack changes
  useEffect(() => {
    let cancelled = false;
    const applyDefault = () => {
      document.documentElement.style.setProperty('--primary', '#ff2d8f');
      document.documentElement.style.setProperty('--primary-600', '#e61f79');
      document.documentElement.style.setProperty('--accent', '#06b6d4');
      document.documentElement.style.setProperty('--accent-600', '#0891b2');
      document.documentElement.style.setProperty('--gradient-start', '#0f1724');
      document.documentElement.style.setProperty('--gradient-end', '#071027');
      document.documentElement.style.setProperty('--selection', 'rgba(255,45,143,0.18)');
    };

    if (!currentTrack || !currentTrack.image) {
      applyDefault();
      return;
    }

    (async () => {
      const palette = await extractPaletteFromImage(currentTrack.image, 40);
      if (cancelled) return;
      if (palette && palette.primary) {
        const p = palette.primary;
        const s = palette.secondary || darkenHex(p, 0.35);
        const gEnd = darkenHex(p, 0.45);
        document.documentElement.style.setProperty('--primary', p);
        document.documentElement.style.setProperty('--primary-600', darkenHex(p, 0.18));
        document.documentElement.style.setProperty('--accent', s);
        document.documentElement.style.setProperty('--accent-600', darkenHex(s, 0.18));
        document.documentElement.style.setProperty('--gradient-start', p);
        document.documentElement.style.setProperty('--gradient-end', gEnd);
        document.documentElement.style.setProperty('--selection', p + '33');
      } else {
        applyDefault();
      }
    })();

    return () => { cancelled = true; };
  }, [currentTrack?.image]);

  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('discover');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState([]);
  const [error, setError] = useState(null);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  const playerRef = useRef(null);
  const ytPlayerRef = useRef(null);

  const getThumbnail = (item) => {
    if (!item) return 'https://via.placeholder.com/200?text=No+Image';
    if (item?.coverBig) return item.coverBig;
    if (item?.cover) return item.cover;
    if (item?.image) return item.image;
    if (item?.snippet?.thumbnails?.high?.url) return item.snippet.thumbnails.high.url;
    if (item?.snippet?.thumbnails?.medium?.url) return item.snippet.thumbnails.medium.url;
    if (item?.snippet?.thumbnails?.default?.url) return item.snippet.thumbnails.default.url;
    return 'https://via.placeholder.com/200?text=No+Image';
  };

  const [iframeKey, setIframeKey] = useState(null);
  useEffect(() => {
    if (currentTrack && currentTrack.id) {
      setIframeKey(`${currentTrack.id}-${isPlaying ? '1' : '0'}`);
    } else {
      setIframeKey(null);
    }
  }, [currentTrack?.id, isPlaying]);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformBaseline, setWaveformBaseline] = useState([]);

  const initWaveformFor = (trackId) => {
    if (!trackId) return;
    const seed = trackId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const arr = Array.from({ length: 32 }).map((_, i) => {
      const v = ((seed + i * 13) % 5) + 2;
      return v;
    });
    setWaveformBaseline(arr);
  };

  useEffect(() => {
    let intervalId = null;
    let cancelled = false;
    const ensureAPI = () => new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve();
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => resolve();
    });

    const createPlayer = async () => {
      if (!playerRef.current) return;
      await ensureAPI();
      if (cancelled) return;
      if (!ytPlayerRef.current) {
        ytPlayerRef.current = new window.YT.Player(playerRef.current, {
          height: '1', width: '1', videoId: currentTrack?.id || '',
          playerVars: { origin: window.location.origin, playsinline: 1, autoplay: isPlaying ? 1 : 0, controls: 0, modestbranding: 1 },
          events: {
            onReady: (event) => {
              try {
                if (typeof event.target.getDuration === 'function') {
                  const d = event.target.getDuration();
                  if (d && !isNaN(d)) setDuration(d);
                }
                event.target.setVolume(Math.round(volume * 100));
                if (isPlaying) event.target.playVideo();
              } catch (err) { console.warn('YT onReady err', err); }
            },
            onStateChange: (e) => {
              const YT = window.YT;
              if (!YT) return;
              if (e.data === YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                try {
                  const d = ytPlayerRef.current.getDuration();
                  if (d && !isNaN(d)) setDuration(d);
                } catch (err) { }
              } else if (e.data === YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (e.data === YT.PlayerState.ENDED) {
                setIsPlaying(false);
                handleNextTrack();
              }
            }
          }
        });
      } else {
        try {
          if (currentTrack && currentTrack.id) {
            // Use object form to be explicit and avoid origin issues
            if (typeof ytPlayerRef.current.loadVideoById === 'function') {
              try {
                ytPlayerRef.current.loadVideoById({ videoId: currentTrack.id, suggestedQuality: 'small' });
              } catch (inner) {
                // Fallback to string id if object form not supported
                ytPlayerRef.current.loadVideoById(currentTrack.id);
              }
            }
          }
        } catch (err) { console.warn('Error loading video by id', err); }
      }

      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        try {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
            const t = ytPlayerRef.current.getCurrentTime();
            setCurrentTime(Number(t) || 0);
          }
        } catch (err) { }
      }, 400);
    };

    if (currentTrack && currentTrack.id) {
      createPlayer();
      initWaveformFor(currentTrack.id || currentTrack.title || '');
    }

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  useEffect(() => {
    try {
      if (ytPlayerRef.current) {
        if (isPlaying) {
          if (typeof ytPlayerRef.current.playVideo === 'function') ytPlayerRef.current.playVideo();
        } else {
          if (typeof ytPlayerRef.current.pauseVideo === 'function') ytPlayerRef.current.pauseVideo();
        }
        if (typeof ytPlayerRef.current.setVolume === 'function') ytPlayerRef.current.setVolume(Math.round(volume * 100));
      }
    } catch (err) { }
  }, [isPlaying, volume]);

  useEffect(() => {
    return () => {
      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
          ytPlayerRef.current.destroy();
          ytPlayerRef.current = null;
        }
      } catch (err) { }
    };
  }, []);

  useEffect(() => {
    loadDiscoverPlaylists();
    loadFavorites();
    loadPlaylist();
  }, []);

  const loadDiscoverPlaylists = async () => {
    setLoading(true);
    try {
      const charts = await getDeezerCharts(50);
      setDiscoverResults(charts.slice(0, 30));
      setPopularNow(charts.slice(0, 20));

      const artistsMap = new Map();
      charts.forEach(track => {
        if (track.artistId && !artistsMap.has(track.artistId)) {
          artistsMap.set(track.artistId, {
            id: track.artistId,
            deezerId: track.artistId,
            title: track.artist,
            image: track.cover || track.image
          });
        }
      });
      setPopularArtists(Array.from(artistsMap.values()).slice(0, 12));
    } catch (err) {
      console.error("Error loading discover:", err);
      setDiscoverResults([]);
      setPopularNow([]);
      setPopularArtists([]);
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
    } catch (err) { console.error("Error loading favorites:", err); }
  };

  const loadPlaylist = async () => {
    try {
      const docRef = doc(db, 'playlists', 'default');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().items) {
        setPlaylist(docSnap.data().items);
        const saved = docSnap.data().items || [];
        setRecentlyPlayedList(saved.slice(0, 12));
      }
    } catch (err) { console.error("Error loading playlist:", err); }
  };

  const saveFavorites = async (newFavs) => {
    try {
      const docRef = doc(db, 'favorites', 'default');
      await setDoc(docRef, { stations: newFavs }, { merge: true });
    } catch (err) { console.error("Error saving:", err); }
  };

  const savePlaylist = async (newList) => {
    try {
      const docRef = doc(db, 'playlists', 'default');
      await setDoc(docRef, { items: newList }, { merge: true });
    } catch (err) { console.error("Error saving playlist:", err); }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (err) {
      setError('Error al cerrar sesión.');
    }
  };

  // Perform the actual search API call
  const performSearch = async (term) => {
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const [tracks, artists, albums] = await Promise.all([
        searchDeezer(term, 'track', 20),
        searchDeezer(term, 'artist', 10),
        searchDeezer(term, 'album', 10)
      ]);

      setSearchTracks(tracks);
      setSearchArtists(artists);
      setSearchAlbums(albums);
      setSearchResults(tracks);
    } catch (error) {
      setError('Error buscando música.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce logic for search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
        setView('search');
      } else {
        setSearchResults([]);
        setSearchArtists([]);
        setSearchAlbums([]);
        setSearchTracks([]);
        if (view === 'search') setView('discover');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e?.preventDefault();
    // The useEffect will handle the search based on searchTerm state
  };

  const handlePlaylistClick = async (playlistId, playlistName) => {
    setLoading(true);
    setError(null);
    try {
      let query = '';
      switch (playlistId) {
        case 'trending': query = 'Top Hits 2024'; break;
        case 'pop': query = 'Pop Music'; break;
        case 'rock': query = 'Rock Music'; break;
        case 'reggaeton': query = 'Reggaeton'; break;
        case 'edm': query = 'Electronic Dance Music'; break;
        case 'indie': query = 'Indie Music'; break;
        default: query = playlistName;
      }
      const data = await searchDeezer(query, 'track', 30);
      setSelectedPlaylist(playlistId);
      setSelectedPlaylistSongs(data);
      setView('playlist-detail');
    } catch (err) {
      setError('Error cargando playlist: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumClick = async (albumId) => {
    setLoading(true);
    setError(null);
    try {
      const albumDetails = await getDeezerAlbum(albumId);
      setSelectedAlbum(albumDetails);
      setAlbumTracks(albumDetails.tracks || []);
      setView('album-detail');
    } catch (err) {
      setError('Error cargando álbum: ' + err.message);
      console.error('Album load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistClick = async (artist) => {
    setLoading(true);
    setError(null);
    try {
      const artistId = artist.deezerId || artist.id;
      const artistDetails = await getDeezerArtist(artistId);
      setSelectedArtist(artistDetails);
      const topTracks = await getArtistTopTracks(artistId, 20);
      setArtistTopTracks(topTracks);
      const albums = await getArtistAlbums(artistId, 12);
      setArtistAlbums(albums);
      setShowAllTracks(false);
      setView('artist-detail');
    } catch (err) {
      setError('Error cargando artista: ' + err.message);
      console.error('Artist load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextTrack = async () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(prev => prev.slice(1));
      await playItem(nextTrack, 'KEEP');
    } else if (playbackContext?.type === 'AUTOPLAY' && currentTrack) {
      // Infinite Autoplay: Fetch more similar tracks
      try {
        const similar = await getSimilarTracks(currentTrack.originalData || currentTrack, 5);
        if (similar.length > 0) {
          const next = similar[0];
          setQueue(similar.slice(1));
          await playItem(next, 'KEEP');
        } else {
          setIsPlaying(false);
        }
      } catch (e) {
        console.error('Autoplay error:', e);
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const playItem = async (item, context = null) => {
    try {
      const isDeezer = item?.deezerId || (item?.id && !item?.id?.videoId && !item?.videoId);

      let videoId;
      let trackData;

      if (isDeezer) {
        setLoading(true);
        const cacheKey = `yt_${item.deezerId || item.id}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          videoId = cached;
        } else {
          const ytApiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
          const result = await getYouTubeVideoForTrack(item, ytApiKey);
          if (result && result.youtubeId) {
            videoId = result.youtubeId;
            localStorage.setItem(cacheKey, videoId);
          } else {
            setError(`No se encontró video para "${item.title}" de ${item.artist}`);
            setLoading(false);
            return;
          }
        }

        trackData = {
          id: videoId,
          title: item.title || 'Desconocido',
          image: item.coverBig || item.cover || item.image || '',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          type: 'hybrid',
          originalData: item,
        };

        setLoading(false);
      } else {
        videoId = item?.id?.videoId || item?.videoId;
        if (!videoId) {
          setError('No se pudo reproducir este elemento.');
          return;
        }

        trackData = {
          id: videoId,
          title: item.snippet?.title || item.title || 'Desconocido',
          image: item.snippet?.thumbnails?.high?.url || item.image || '',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          type: 'youtube',
          originalData: item,
        };
      }

      setCurrentTrack(trackData);
      setIsPlaying(true);
      setHistory(prev => [trackData, ...prev.filter(t => t.id !== trackData.id)].slice(0, 20));

      // Queue Logic
      const isContextArray = Array.isArray(context);
      const isContextObjectWithItems = context && typeof context === 'object' && Array.isArray(context.items);

      if (isContextArray || isContextObjectWithItems) {
        // Support both plain array context and { type, items, id }
        const items = isContextArray ? context : context.items;
        const index = items.findIndex(t => getItemId(t) === getItemId(item));
        if (index !== -1) {
          setQueue(items.slice(index + 1));
          setPlaybackContext({ type: 'COLLECTION', id: context?.id || null });
        }
      } else if (context === 'KEEP') {
        // Playing from Queue - do not reset
      } else {
        // Single Track / Autoplay
        setQueue([]);
        setPlaybackContext({ type: 'AUTOPLAY' });
        // Fetch similar tracks in background
        getSimilarTracks(item, 10).then(similar => {
          setQueue(similar);
        });
      }

    } catch (error) {
      console.error('Error playing item:', error);
      setError('Error al reproducir la canción.');
      setLoading(false);
    }
  };



  const togglePlayPause = () => {
    if (!currentTrack) {
      setError('No hay canción seleccionada');
      return;
    }
    try {
      if (ytPlayerRef.current) {
        if (isPlaying) ytPlayerRef.current.pauseVideo();
        else ytPlayerRef.current.playVideo();
        return;
      }
    } catch (err) { }
    setIsPlaying(prev => !prev);
  };

  const toggleFavorite = (e, item) => {
    e?.stopPropagation();
    const itemId = getItemId(item);
    let newFavs;
    const exists = favorites.some(f => getItemId(f) === itemId);
    if (exists) {
      newFavs = favorites.filter(f => getItemId(f) !== itemId);
    } else {
      newFavs = [...favorites, item];
    }
    setFavorites(newFavs);
    saveFavorites(newFavs);
  };

  const togglePlaylist = (e, item) => {
    e?.stopPropagation();
    const itemId = getItemId(item);
    let newList;
    const exists = playlist.some(p => getItemId(p) === itemId);
    if (exists) {
      newList = playlist.filter(p => getItemId(p) !== itemId);
    } else {
      newList = [...playlist, item];
    }
    setPlaylist(newList);
    savePlaylist(newList);
  };

  const getCurrentList = () => {
    switch (view) {
      case 'discover': return discoverResults;
      case 'search': return searchResults;
      case 'playlist-detail': return selectedPlaylistSongs;
      case 'favorites': return favorites.filter((item) => !item.stationuuid);
      case 'playlist': return playlist.filter((item) => !item.stationuuid);
      default: return [];
    }
  };

  const nextTrack = () => {
    const list = getCurrentList();
    if (!currentTrack || list.length === 0) return;
    const currentId = currentTrack.id;
    const index = list.findIndex((item) => {
      const id = item?.id?.videoId || item?.videoId || item?.id;
      return id === currentId;
    });
    const nextIndex = (index + 1) % list.length;
    playItem(list[nextIndex]);
  };

  const prevTrack = () => {
    const list = getCurrentList();
    if (!currentTrack || list.length === 0) return;
    const currentId = currentTrack.id;
    const index = list.findIndex((item) => {
      const id = item?.id?.videoId || item?.videoId || item?.id;
      return id === currentId;
    });
    const prevIndex = (index - 1 + list.length) % list.length;
    playItem(list[prevIndex]);
  };

  // User Playlists Logic
  const loadUserPlaylists = async () => {
    try {
      const docRef = doc(db, 'user_playlists', 'default');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().playlists) {
        setUserPlaylists(docSnap.data().playlists);
      } else {
        setUserPlaylists([]);
      }
    } catch (err) {
      console.error("Error loading user playlists:", err);
    }
  };

  const saveUserPlaylists = async (playlists) => {
    try {
      const docRef = doc(db, 'user_playlists', 'default');
      await setDoc(docRef, { playlists }, { merge: true });
    } catch (err) {
      console.error("Error saving user playlists:", err);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist = {
      id: Math.random().toString(36).slice(2),
      name: newPlaylistName,
      description: 'Lista de reproducción personalizada',
      createdAt: new Date().toISOString(),
      songs: []
    };
    const updatedPlaylists = [...userPlaylists, newPlaylist];
    setUserPlaylists(updatedPlaylists);
    await saveUserPlaylists(updatedPlaylists);
    setNewPlaylistName('');
    setShowPlaylistModal(false);
  };

  const handleAddToPlaylist = async (playlistId, song) => {
    const updatedPlaylists = userPlaylists.map(p => {
      if (p.id === playlistId) {
        if (p.songs.some(s => getItemId(s) === getItemId(song))) return p;
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    });
    setUserPlaylists(updatedPlaylists);
    await saveUserPlaylists(updatedPlaylists);
    setShowAddToPlaylistModal(null);
  };

  const handleRemoveFromPlaylist = async (playlistId, songId) => {
    const updatedPlaylists = userPlaylists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => getItemId(s) !== songId) };
      }
      return p;
    });
    setUserPlaylists(updatedPlaylists);
    await saveUserPlaylists(updatedPlaylists);
    if (selectedUserPlaylist && selectedUserPlaylist.id === playlistId) {
      setSelectedUserPlaylist(updatedPlaylists.find(p => p.id === playlistId));
    }
  };

  const handleGoToAlbum = async (item) => {
    if (item.album && item.album.id) {
      handleAlbumClick(item.album.id);
    } else if (item.albumId) {
      handleAlbumClick(item.albumId);
    } else {
      // Try to find album by search if no ID
      const query = `${item.artist} ${item.album?.title || ''}`;
      const albums = await searchDeezer(query, 'album', 1);
      if (albums && albums.length > 0) {
        handleAlbumClick(albums[0].id);
      }
    }
  };

  const handleRenamePlaylist = async (playlistId, newName) => {
    const updatedPlaylists = userPlaylists.map(p => {
      if (p.id === playlistId) {
        return { ...p, name: newName };
      }
      return p;
    });
    setUserPlaylists(updatedPlaylists);
    await saveUserPlaylists(updatedPlaylists);
    if (selectedUserPlaylist && selectedUserPlaylist.id === playlistId) {
      setSelectedUserPlaylist(updatedPlaylists.find(p => p.id === playlistId));
    }
  };

  const handleUpdatePlaylistDescription = async (playlistId, newDesc) => {
    const updatedPlaylists = userPlaylists.map(p => {
      if (p.id === playlistId) {
        return { ...p, description: newDesc };
      }
      return p;
    });
    setUserPlaylists(updatedPlaylists);
    await saveUserPlaylists(updatedPlaylists);
    if (selectedUserPlaylist && selectedUserPlaylist.id === playlistId) {
      setSelectedUserPlaylist(updatedPlaylists.find(p => p.id === playlistId));
    }
  };

  useEffect(() => {
    loadUserPlaylists();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Auth onAuthSuccess={() => { setUser(auth.currentUser); setError(null); }} />
        {error && <div className="mt-4 text-red-400">{error}</div>}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <Sidebar user={user} view={view} setView={setView} playlist={playlist} favorites={favorites} handleLogout={handleLogout} />

      <div className="flex flex-1 flex-row overflow-hidden w-full md:w-auto pb-20 md:pb-0">
        <main className="flex-1 flex flex-col gap-4 md:gap-6 h-full p-4 md:p-8 overflow-y-auto">
          <div className="glass-fluid rounded-2xl px-4 py-3 md:px-6 md:py-4 shadow-lg">
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar canciones, artistas, playlists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/50 text-white placeholder-slate-400 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
              <button type="submit" className="accent-gradient px-6 py-3 font-semibold text-sm transition-all hover:scale-105">
                Buscar
              </button>
            </form>
          </div>

          {/* Legacy discover sections removed to use BrowseView instead */}

          <div className="flex-1">
            {loading && (
              <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-slate-300 font-semibold">Cargando música increíble...</p>
                </div>
              </div>
            )}

            {error && <div className="glass-fluid-subtle border border-red-500/30 rounded-2xl p-4 mb-6 text-red-300 text-sm font-semibold">{error}</div>}

            {!loading && (
              <>
                {view === 'discover' && (
                  <BrowseView
                    onPlay={playItem}
                    onNavigate={(viewName, data) => {
                      // Handle navigation if needed, for now basic view switching
                      if (viewName === 'artist') handleArtistClick(data);
                      if (viewName === 'album') handleAlbumClick(data);
                    }}
                    onToggleFavorite={toggleFavorite}
                    favorites={favorites}
                    onAddPlaylist={(item) => setShowAddToPlaylistModal(item)}
                    history={history}
                  />
                )}

                {view === 'search' && (
                  <div className="space-y-12 pb-24">
                    {/* Artists Section */}
                    {searchArtists.length > 0 && (
                      <section>
                        <h3 className="text-2xl font-bold text-white mb-6">Artistas</h3>
                        <div className="flex overflow-x-auto gap-6 pb-4 -mx-6 px-6 hide-scrollbar">
                          {searchArtists.map((artist) => (
                            <div
                              key={artist.id}
                              className="flex flex-col items-center gap-3 flex-none group cursor-pointer"
                              onClick={() => handleArtistClick(artist)}
                            >
                              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-transparent group-hover:border-purple-500 transition-all shadow-lg">
                                <img src={artist.picture_medium || artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <p className="text-base font-bold text-white text-center truncate w-32">{artist.name}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Albums Section */}
                    {searchAlbums.length > 0 && (
                      <section>
                        <h3 className="text-2xl font-bold text-white mb-6">Álbumes</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {searchAlbums.map((album) => (
                            <div
                              key={album.id}
                              className="group relative glass-fluid-subtle rounded-2xl overflow-hidden shadow-lg hover-glow transition-all duration-300 cursor-pointer"
                            >
                              <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={album.coverBig || album.cover}
                                  alt={album.title}
                                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                  className="group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                  <div className="text-center px-2">
                                    <Play size={40} className="mx-auto mb-2 text-white fill-white" />
                                    <p className="text-xs text-white font-semibold">Ver álbum</p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-3">
                                <h4 className="font-semibold text-white text-xs md:text-sm truncate">{album.title}</h4>
                                <p className="text-slate-400 text-xs truncate">{album.artist}</p>
                                {album.releaseDate && (
                                  <p className="text-slate-500 text-xs">{album.releaseDate.split('-')[0]}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Empty state if no results */}
                    {searchArtists.length === 0 && searchTracks.length === 0 && searchAlbums.length === 0 && !loading && (
                      <div className="glass-fluid-subtle text-center py-20 rounded-2xl text-slate-400">
                        <Search size={64} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-semibold mb-2">No se encontraron resultados para "{searchTerm}"</p>
                        <p className="text-sm">Intenta con otros términos de búsqueda</p>
                      </div>
                    )}
                  </div>
                )}

                {view === 'playlist-detail' && (
                  <>
                    <button onClick={() => { setView('discover'); setSelectedPlaylist(null); setSelectedPlaylistSongs([]); }} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><span>← Volver</span></button>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                      {selectedPlaylistSongs.map((item) => (
                        <SongCard
                          key={getItemId(item)}
                          item={item}
                          onPlay={(t) => playItem(t, selectedPlaylistSongs)}
                          onFavorite={toggleFavorite}
                          onAddPlaylist={(item) => { setShowAddToPlaylistModal(item); }}
                          onGoToAlbum={handleGoToAlbum}
                          isFavorite={favorites.some(f => getItemId(f) === getItemId(item))}
                        />
                      ))}
                    </div>
                  </>
                )}

                {view === 'favorites' && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                    {favorites.filter((item) => !item.stationuuid).map((item, idx) => (
                      <SongCard key={item.id?.videoId || idx} item={item} onPlay={(t) => playItem(t, favorites.filter(i => !i.stationuuid))} onFavorite={toggleFavorite} onAddPlaylist={(e, item) => { e.stopPropagation(); setShowAddToPlaylistModal(item); }} />
                    ))}
                  </div>
                )}

                {view === 'playlist' && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                    {playlist.filter((item) => !item.stationuuid).map((item, idx) => (
                      <SongCard key={item.id?.videoId || idx} item={item} onPlay={(t) => playItem(t, playlist.filter(i => !i.stationuuid))} onFavorite={toggleFavorite} onAddPlaylist={(e, item) => { e.stopPropagation(); setShowAddToPlaylistModal(item); }} />
                    ))}
                  </div>
                )}

                {view === 'artist-detail' && selectedArtist && (
                  <>
                    <button onClick={() => { setView('discover'); setSelectedArtist(null); setArtistTopTracks([]); setArtistAlbums([]); }} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                      <span>← Volver</span>
                    </button>

                    {/* Artist Header */}
                    <div className="mb-8 glass-fluid-glow rounded-3xl overflow-hidden shadow-2xl">
                      <div className="relative h-48 md:h-64">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 to-slate-900"></div>
                        <img
                          src={selectedArtist.pictureBig || selectedArtist.image}
                          alt={selectedArtist.name}
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                          <div className="flex items-end gap-6">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl border-4 border-white/20 flex-shrink-0">
                              <img
                                src={selectedArtist.pictureBig || selectedArtist.image}
                                alt={selectedArtist.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm text-purple-300 font-semibold mb-2">ARTISTA</p>
                              <h1 className="text-4xl md:text-6xl font-black text-white mb-3">{selectedArtist.name}</h1>
                              <div className="flex gap-4 text-sm text-slate-300">
                                {selectedArtist.nbFan && <span>👥 {selectedArtist.nbFan?.toLocaleString()} fans</span>}
                                {selectedArtist.nbAlbum && <span>💿 {selectedArtist.nbAlbum} álbumes</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Tracks */}
                    {artistTopTracks.length > 0 && (
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl md:text-2xl font-bold text-white">Canciones Destacadas</h3>
                          {artistTopTracks.length > 7 && (
                            <button
                              onClick={() => setShowAllTracks(!showAllTracks)}
                              className="text-xs md:text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-full"
                            >
                              {showAllTracks ? 'Mostrar menos' : 'Mostrar más'}
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col bg-slate-800/30 rounded-3xl p-2 md:p-4 backdrop-blur-sm">
                          {artistTopTracks.slice(0, showAllTracks ? 20 : 7).map((track, idx) => (
                            <SongListItem
                              key={getItemId(track)}
                              item={track}
                              index={idx}
                              onPlay={(t) => playItem(t, artistTopTracks)}
                              onFavorite={toggleFavorite}
                              onAddPlaylist={(item) => { setShowAddToPlaylistModal(item); }}
                              onGoToAlbum={handleGoToAlbum}
                              isFavorite={favorites.some(f => getItemId(f) === getItemId(track))}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Albums */}
                    {artistAlbums.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Discografía</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                          {artistAlbums.map((album) => (
                            <div
                              key={album.id}
                              onClick={() => handleAlbumClick(album.id)}
                              className="group relative glass-fluid-subtle rounded-2xl overflow-hidden shadow-lg hover-glow transition-all duration-300 cursor-pointer"
                            >
                              <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={album.coverBig || album.cover}
                                  alt={album.title}
                                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                  className="group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                  <div className="text-center px-2">
                                    <Play size={40} className="mx-auto mb-2 text-white fill-white" />
                                    <p className="text-xs text-white font-semibold">Ver álbum</p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-3">
                                <h4 className="font-semibold text-white text-xs md:text-sm truncate">{album.title}</h4>
                                <p className="text-slate-400 text-xs truncate">{album.releaseDate?.split('-')[0] || 'Album'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {view === 'album-detail' && selectedAlbum && (
                  <>
                    <button onClick={() => { setView('discover'); setSelectedAlbum(null); setAlbumTracks([]); }} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                      <span>← Volver</span>
                    </button>

                    {/* Album Header */}
                    <div className="mb-8 glass-fluid-glow rounded-3xl overflow-hidden shadow-2xl">
                      <div className="relative h-48 md:h-64">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 to-slate-900"></div>
                        <img
                          src={selectedAlbum.cover_xl || selectedAlbum.cover_big || selectedAlbum.cover}
                          alt={selectedAlbum.title}
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                          <div className="flex items-end gap-6">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 flex-shrink-0">
                              <img
                                src={selectedAlbum.cover_xl || selectedAlbum.cover_big || selectedAlbum.cover}
                                alt={selectedAlbum.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm text-purple-300 font-semibold mb-2">ÁLBUM</p>
                              <h1 className="text-3xl md:text-5xl font-black text-white mb-3 line-clamp-2">{selectedAlbum.title}</h1>
                              <div className="flex gap-4 text-sm text-slate-300 items-center">
                                <div className="flex items-center gap-2">
                                  {selectedAlbum.artist?.picture_small && <img src={selectedAlbum.artist.picture_small} alt={selectedAlbum.artist.name} className="w-6 h-6 rounded-full" />}
                                  <span className="font-bold text-white">{selectedAlbum.artist?.name}</span>
                                </div>
                                <span>• {selectedAlbum.release_date?.split('-')[0]}</span>
                                <span>• {selectedAlbum.nb_tracks} canciones</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Track List */}
                    <div className="mb-8">
                      <div className="flex flex-col bg-slate-800/30 rounded-3xl p-2 md:p-4 backdrop-blur-sm">
                        {albumTracks && albumTracks.length > 0 ? albumTracks.map((track, idx) => (
                          <SongListItem
                            key={getItemId(track)}
                            item={{ ...track, cover: selectedAlbum.cover_medium, coverBig: selectedAlbum.cover_xl }}
                            index={idx}
                            onPlay={(t) => playItem(t, albumTracks)}
                            onFavorite={toggleFavorite}
                            onAddPlaylist={(item) => { setShowAddToPlaylistModal(item); }}
                            onGoToAlbum={handleGoToAlbum}
                            isFavorite={favorites.some(f => getItemId(f) === getItemId(track))}
                          />
                        )) : (
                          <div className="p-4 text-center text-slate-400">No hay canciones disponibles para este álbum.</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* User Playlists View */}
            {!loading && view === 'user-playlists' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Mis Playlists</h3>
                  <button
                    onClick={() => setShowPlaylistModal(true)}
                    className="accent-gradient px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <Plus size={18} /> Nueva Playlist
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Create New Card */}
                  <div
                    onClick={() => setShowPlaylistModal(true)}
                    className="glass-fluid-subtle rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all border-2 border-dashed border-white/10 hover:border-purple-500/50 group min-h-[200px]"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-purple-500/20">
                      <Plus size={32} className="text-slate-400 group-hover:text-purple-400" />
                    </div>
                    <span className="font-semibold text-slate-400 group-hover:text-white">Crear Playlist</span>
                  </div>

                  {userPlaylists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => { setSelectedUserPlaylist(pl); setView('user-playlist-detail'); }}
                      className="glass-fluid-subtle rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-all group hover-glow"
                    >
                      <div className="w-full aspect-square rounded-xl bg-slate-800 mb-4 overflow-hidden relative">
                        {pl.songs && pl.songs.length > 0 ? (
                          <div className="grid grid-cols-2 h-full w-full">
                            {pl.songs.slice(0, 4).map((s, i) => (
                              <img key={i} src={s.image || s.coverBig || s.cover} alt="" className="w-full h-full object-cover" />
                            ))}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <Music size={48} className="text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full accent-gradient flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">
                          <Play size={20} className="fill-white text-white ml-1" />
                        </div>
                      </div>
                      <h4 className="font-bold text-white truncate mb-1">{pl.name}</h4>
                      <p className="text-xs text-slate-400">{pl.songs?.length || 0} canciones</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Playlist Detail View */}
            {!loading && view === 'user-playlist-detail' && selectedUserPlaylist && (
              <>
                <button onClick={() => setView('user-playlists')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <span>← Volver a mis playlists</span>
                </button>

                <div className="mb-8 glass-fluid-glow rounded-3xl overflow-hidden shadow-2xl">
                  <div className="relative h-48 md:h-64 bg-gradient-to-b from-slate-800 to-slate-900">
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <div className="flex items-end gap-6">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 flex-shrink-0 bg-slate-800 flex items-center justify-center">
                          {selectedUserPlaylist.songs && selectedUserPlaylist.songs.length > 0 ? (
                            <img src={selectedUserPlaylist.songs[0].image || selectedUserPlaylist.songs[0].coverBig} alt={selectedUserPlaylist.name} className="w-full h-full object-cover" />
                          ) : (
                            <Music size={64} className="text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm text-purple-300 font-semibold mb-2 uppercase tracking-wider">Playlist Pública</p>
                          <h1
                            className="text-4xl md:text-6xl font-black text-white mb-3 cursor-pointer hover:text-purple-200 transition-colors"
                            onClick={() => {
                              const newName = prompt("Editar nombre de la playlist:", selectedUserPlaylist.name);
                              if (newName && newName.trim()) handleRenamePlaylist(selectedUserPlaylist.id, newName);
                            }}
                            title="Click para editar nombre"
                          >
                            {selectedUserPlaylist.name}
                          </h1>
                          <p
                            className="text-slate-300 text-sm md:text-base mb-4 cursor-pointer hover:text-white transition-colors"
                            onClick={() => {
                              const newDesc = prompt("Editar descripción:", selectedUserPlaylist.description);
                              if (newDesc !== null) handleUpdatePlaylistDescription(selectedUserPlaylist.id, newDesc);
                            }}
                            title="Click para editar descripción"
                          >
                            {selectedUserPlaylist.description || "Sin descripción"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                            <span>{user.displayName}</span>
                            <span>• {selectedUserPlaylist.songs?.length || 0} canciones</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col bg-slate-800/30 rounded-3xl p-2 md:p-4 backdrop-blur-sm">
                  {selectedUserPlaylist.songs && selectedUserPlaylist.songs.length > 0 ? (
                    selectedUserPlaylist.songs.map((track, idx) => (
                      <SongListItem
                        key={`${getItemId(track)}-${idx}`}
                        item={track}
                        index={idx}
                        onPlay={(t) => playItem(t, selectedUserPlaylist.songs)}
                        onFavorite={toggleFavorite}
                        onAddPlaylist={(item) => { setShowAddToPlaylistModal(item); }}
                        onGoToAlbum={handleGoToAlbum}
                        onRemoveFromPlaylist={(item) => handleRemoveFromPlaylist(selectedUserPlaylist.id, getItemId(item))}
                        isFavorite={favorites.some(f => getItemId(f) === getItemId(track))}
                        isInPlaylist={true}
                      />
                    ))
                  ) : (
                    <div className="py-20 text-center text-slate-400">
                      <Music size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-semibold">Esta playlist está vacía</p>
                      <p className="text-sm">Busca canciones y agrégalas aquí</p>
                      <button onClick={() => setView('discover')} className="mt-6 px-6 py-2 rounded-full accent-gradient text-white font-bold">Explorar Música</button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!loading && view === 'search' && searchResults.length === 0 && searchTerm && (
              <div className="glass-fluid-subtle text-center py-20 rounded-2xl text-slate-400"><Search size={56} className="mx-auto mb-4 opacity-20" /><p className="text-lg font-semibold mb-2">No se encontraron resultados para "{searchTerm}"</p><p className="text-sm">Intenta con otros términos de búsqueda</p></div>
            )}
            {!loading && view === 'favorites' && favorites.filter((item) => !item.stationuuid).length === 0 && (
              <div className="glass-fluid-subtle text-center py-20 rounded-2xl text-slate-400"><Heart size={64} className="mx-auto mb-4 opacity-20" /><p className="text-lg font-semibold mb-2">Aún no tienes favoritos</p><p className="text-sm mb-4">Marca canciones como favoritas para verlas aquí</p><button onClick={() => setView('discover')} className="accent-gradient px-6 py-3 rounded-full mt-4 font-semibold">Explorar música</button></div>
            )}
            {!loading && view === 'playlist' && playlist.filter((item) => !item.stationuuid).length === 0 && (
              <div className="glass-fluid-subtle text-center py-20 rounded-2xl text-slate-400"><ListMusic size={64} className="mx-auto mb-4 opacity-20" /><p className="text-lg font-semibold mb-2">Tu lista de reproducción está vacía</p><p className="text-sm mb-4">Añade canciones para crear tu playlist personalizada</p><button onClick={() => setView('discover')} className="accent-gradient px-6 py-3 rounded-full mt-4 font-bold text-white">Descubrir canciones</button></div>
            )}
          </div>
        </main>

        <RightPanel currentTrack={currentTrack} isPlaying={isPlaying} prevTrack={prevTrack} nextTrack={nextTrack} togglePlayPause={togglePlayPause} getCurrentList={getCurrentList} playItem={playItem} currentTime={currentTime} upNext={queue} />
      </div>

      {currentTrack && (
        <>
          <div className="fixed bottom-0 left-0 right-0 md:bottom-8 z-[60] flex justify-center pointer-events-none">
            <div className="glass-player w-full max-w-4xl mx-4 mb-4 rounded-[2.5rem] shadow-2xl flex items-center gap-4 md:gap-6 px-4 md:px-8 py-4 md:py-5 pointer-events-auto hover-glow transition-all border border-white/10 backdrop-blur-3xl bg-black/40">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl ring-2 ring-purple-500/30 cursor-pointer hover:ring-purple-400/50 transition-all" onClick={() => setShowNowPlaying(true)}>
                <img src={currentTrack?.image} alt="cover" className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowNowPlaying(true)}>
                  <p className="font-bold text-white text-base md:text-lg truncate">{currentTrack?.title}</p>
                  <p className="text-xs md:text-sm text-slate-300 truncate">{currentTrack?.originalData?.snippet?.channelTitle || currentTrack?.originalData?.artist || 'Artist'}</p>
                </div>
                <SongMenu
                  item={currentTrack}
                  onAddToPlaylist={(item) => setShowAddToPlaylistModal(item)}
                  onToggleFavorite={toggleFavorite}
                  onGoToAlbum={handleGoToAlbum}
                  isFavorite={favorites.some(f => getItemId(f) === getItemId(currentTrack))}
                />
              </div>
              <div className="hidden lg:flex flex-col items-center justify-center gap-2 w-48">
                <div className="w-full h-8 flex items-end gap-0.5">
                  {[...Array(32)].map((_, i) => {
                    const base = waveformBaseline[i] || (i % 3 === 0 ? 4 : 2);
                    const dynamic = Math.max(2, Math.round(base * (0.5 + 0.8 * Math.abs(Math.sin((currentTime || 0) * 3 + i)))));
                    const h = Math.min(32, dynamic);
                    return <div key={i} className={`w-0.5 rounded bg-gradient-to-t from-purple-500 to-blue-400 transition-all duration-200`} style={{ height: `${h}px` }}></div>;
                  })}
                </div>
                <div className="flex justify-between w-full text-[10px] text-slate-400 font-semibold">
                  <span>{new Date((currentTime || 0) * 1000).toISOString().substr(14, 5)}</span>
                  <span>{new Date((duration || 0) * 1000).toISOString().substr(14, 5)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="p-2 md:p-2.5 rounded-full bg-slate-700/60 hover:bg-purple-600 text-purple-300 hover:text-white transition-all hover:scale-110"><SkipBack size={20} /></button>
                <button onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} className="p-3 md:p-4 rounded-full accent-gradient text-white shadow-xl hover:scale-110 transition-transform">{isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}</button>
                <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="p-2 md:p-2.5 rounded-full bg-slate-700/60 hover:bg-purple-600 text-purple-300 hover:text-white transition-all hover:scale-110"><SkipForward size={20} /></button>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <Volume2 size={20} className="text-slate-300" />
                <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-24 accent-purple-500 cursor-pointer" style={{ accentColor: '#a78bfa' }} />
              </div>
            </div>
          </div>

          <nav className="fixed md:hidden bottom-0 left-0 right-0 glass-fluid-glow border-t border-purple-900/30 px-0 py-2 flex items-center justify-around shadow-2xl z-50 backdrop-blur-xl" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
            <button onClick={() => { setView('discover'); setSearchResults([]); setSearchTerm(''); }} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 text-xs ${view === 'discover' ? 'text-purple-400 bg-purple-500/20 shadow-lg scale-105' : 'text-slate-400 hover:text-purple-300 hover:bg-white/5'}`}><Music size={24} /><span className="font-semibold tracking-tight">Browse</span></button>
            <button onClick={() => setView('search')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 text-xs ${view === 'search' ? 'text-purple-400 bg-purple-500/20 shadow-lg scale-105' : 'text-slate-400 hover:text-purple-300 hover:bg-white/5'}`}><Search size={24} /><span className="font-semibold tracking-tight">Artists</span></button>
            <button onClick={() => setView('favorites')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 text-xs relative ${view === 'favorites' ? 'text-purple-400 bg-purple-500/20 shadow-lg scale-105' : 'text-slate-400 hover:text-purple-300 hover:bg-white/5'}`}><Heart size={24} /><span className="font-semibold tracking-tight">Albums</span>{favorites.filter((item) => !item.stationuuid).length > 0 && <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">{favorites.filter((item) => !item.stationuuid).length}</span>}</button>
            <button onClick={() => setView('playlist')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 text-xs relative ${view === 'playlist' ? 'text-purple-400 bg-purple-500/20 shadow-lg scale-105' : 'text-slate-400 hover:text-purple-300 hover:bg-white/5'}`}><ListMusic size={24} /><span className="font-semibold tracking-tight">Songs</span>{playlist.filter((item) => !item.stationuuid).length > 0 && <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">{playlist.filter((item) => !item.stationuuid).length}</span>}</button>
          </nav>
        </>
      )}

      {showNowPlaying && currentTrack && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-50 flex items-center justify-center p-4 md:p-8 animate-fadeIn">
          <div className="relative w-full max-w-lg glass-fluid-strong rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-transparent pointer-events-none"></div>
            <button className="absolute right-4 top-4 text-slate-300 hover:text-white transition-colors z-10 p-3 rounded-full hover:bg-white/10" onClick={() => setShowNowPlaying(false)}><X size={28} /></button>
            <div className="relative z-10">
              <div className="w-56 h-56 md:w-72 md:h-72 mx-auto rounded-3xl overflow-hidden shadow-2xl mb-8 ring-4 ring-purple-500/30">
                <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-center text-white mb-2 line-clamp-2">{currentTrack.title}</h3>
              <p className="text-slate-300 text-center mb-8 text-base md:text-lg font-semibold">{currentTrack.originalData?.snippet?.channelTitle || currentTrack.originalData?.artist || ''}</p>
              <div className="flex items-center justify-center gap-10 mb-10">
                <button onClick={() => prevTrack()} className="text-slate-300 hover:text-white transition-all hover:scale-125 transform"><SkipBack size={36} /></button>
                <button onClick={() => togglePlayPause()} className="w-20 h-20 rounded-full accent-gradient flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xl"> {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}</button>
                <button onClick={() => nextTrack()} className="text-slate-300 hover:text-white transition-all hover:scale-125 transform"><SkipForward size={36} /></button>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={(e) => toggleFavorite(e, currentTrack.originalData)} className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 backdrop-blur-sm ${favorites.some((f) => getItemId(f) === getItemId(currentTrack.originalData)) ? 'bg-purple-500/40 text-purple-200 border-2 border-purple-400/60 shadow-lg' : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600/50'}`}><Heart size={22} className="inline mr-2" fill="currentColor" />Favorito</button>
                <button onClick={(e) => togglePlaylist(e, currentTrack.originalData)} className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 backdrop-blur-sm ${playlist.some((p) => getItemId(p) === getItemId(currentTrack.originalData)) ? 'bg-amber-500/40 text-amber-200 border-2 border-amber-400/60 shadow-lg' : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600/50'}`}><Plus size={22} className="inline mr-2" />Playlist</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden YouTube iframe container */}
      {currentTrack && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
          <div id="yt-player" ref={playerRef} aria-hidden="true" />
        </div>
      )}

      {/* Create Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Crear Nueva Playlist</h3>
            <input
              type="text"
              placeholder="Nombre de la playlist"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="accent-gradient px-6 py-2 rounded-full font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {showAddToPlaylistModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Agregar a Playlist</h3>
              <button onClick={() => setShowAddToPlaylistModal(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <button
                onClick={(e) => { togglePlaylist(e, showAddToPlaylistModal); setShowAddToPlaylistModal(null); }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group w-full mb-2"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-400 group-hover:text-white group-hover:bg-amber-500 transition-all">
                  <ListMusic size={20} />
                </div>
                <div>
                  <p className="font-semibold text-white">Cola de Reproducción</p>
                  <p className="text-xs text-slate-400">Agregar a la lista actual</p>
                </div>
              </button>
              <div className="h-px bg-white/10 my-2"></div>
              {userPlaylists.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {userPlaylists.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id, showAddToPlaylistModal)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400 group-hover:text-white group-hover:bg-purple-500 transition-all">
                        <ListMusic size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{playlist.name}</p>
                        <p className="text-xs text-slate-400">{playlist.songs.length} canciones</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="mb-4">No tienes playlists creadas.</p>
                  <button
                    onClick={() => { setShowAddToPlaylistModal(null); setShowPlaylistModal(true); }}
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Crear una nueva playlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
