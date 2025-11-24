import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from './firebase';
import { PlayerProvider } from './context/PlayerContext';

// Components
import Sidebar from './components/layout/Sidebar';
import PlayerBar from './components/player/PlayerBar';
import BottomNav from './components/layout/BottomNav';
import Auth from './components/shared/Auth';
import Header from './components/layout/Header';
import NowPlayingModal from './components/player/NowPlayingModal';
import AddToPlaylistModal from './components/shared/AddToPlaylistModal';
import MobileFullScreenPlayer from './components/player/MobileFullScreenPlayer';
import QuotaMonitor from './components/shared/QuotaMonitor';

// Views
import HomeView from './views/HomeView';
import Search from './views/Search';
import SearchResults from './views/SearchResults';
import Radio from './views/Radio';
import Favorites from './views/Favorites';
import UserLibrary from './views/UserLibrary';
import PlaylistDetail from './views/PlaylistDetail';
import AlbumDetail from './views/AlbumDetail';
import ArtistDetail from './views/ArtistDetail';

// Styles
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error in child component:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div style={{ color: '#fff', padding: 20 }}>Componente falló</div>;
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [playlist, setPlaylist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  
  // Modal states
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        await loadUserData(currentUser.uid);
      } else {
        setPlaylist([]);
        setFavorites([]);
        setUserPlaylists([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user data from Firestore
  const loadUserData = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setPlaylist(data.playlist || []);
        setFavorites(data.favorites || []);
        setUserPlaylists(data.playlists || []);
      } else {
        // Create initial user document
        await setDoc(userDocRef, {
          email: auth.currentUser.email,
          playlist: [],
          favorites: [],
          playlists: [],
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (item) => {
    if (!user) return;

    const itemId = item?.id || item?.stationuuid;
    const exists = favorites.some(f => (f?.id || f?.stationuuid) === itemId);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      if (exists) {
        const updatedFavorites = favorites.filter(f => (f?.id || f?.stationuuid) !== itemId);
        setFavorites(updatedFavorites);
        await updateDoc(userDocRef, { favorites: updatedFavorites });
      } else {
        const updatedFavorites = [...favorites, item];
        setFavorites(updatedFavorites);
        await updateDoc(userDocRef, { favorites: updatedFavorites });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Add to playlist
  const addToPlaylist = async (item) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedPlaylist = [...playlist, item];
      setPlaylist(updatedPlaylist);
      await updateDoc(userDocRef, { playlist: updatedPlaylist });
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  };

  // Remove from playlist
  const removeFromPlaylist = async (item) => {
    if (!user) return;

    const itemId = item?.id || item?.stationuuid;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedPlaylist = playlist.filter(p => (p?.id || p?.stationuuid) !== itemId);
      setPlaylist(updatedPlaylist);
      await updateDoc(userDocRef, { playlist: updatedPlaylist });
    } catch (error) {
      console.error('Error removing from playlist:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Clear local state
      setPlaylist([]);
      setFavorites([]);
      setUserPlaylists([]);
      
      // Sign out from Firebase
      await auth.signOut();
      
      // Clear any localStorage items
      localStorage.removeItem('appmusica_user');
      
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
    }
  };

  // Show loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth />;
  }

  // Main app
  return (
    <Router>
      <PlayerProvider>
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-1 h-screen overflow-hidden">
            {/* Sidebar */}
            <ErrorBoundary fallback={<div className="w-64 bg-slate-900/50 p-4">Sidebar no disponible</div>}>
              <div className="w-64 flex-shrink-0 h-full overflow-y-auto">
                <Sidebar
                  user={user}
                  playlist={playlist}
                  favorites={favorites}
                  handleLogout={handleLogout}
                />
              </div>
            </ErrorBoundary>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
              <ErrorBoundary fallback={<div className="p-8 text-center">Error al cargar contenido</div>}>
                <Header />
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <Routes>
                  <Route path="/" element={<HomeView onToggleFavorite={toggleFavorite} favorites={favorites} onAddPlaylist={(item) => { setItemToAdd(item); setShowAddPlaylist(true); }} />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/search/results" element={<SearchResults onToggleFavorite={toggleFavorite} favorites={favorites} onAddPlaylist={(item) => { setItemToAdd(item); setShowAddPlaylist(true); }} />} />
                  <Route path="/radio" element={<Radio onToggleFavorite={toggleFavorite} favorites={favorites} />} />
                  <Route path="/favorites" element={<Favorites favorites={favorites} onToggleFavorite={toggleFavorite} onRemove={toggleFavorite} />} />
                  <Route path="/library" element={<UserLibrary userPlaylists={userPlaylists} setUserPlaylists={setUserPlaylists} saveUserPlaylists={async (playlists) => {
                    try {
                      const userDocRef = doc(db, 'users', user.uid);
                      await updateDoc(userDocRef, { playlists });
                    } catch (error) {
                      console.error('Error saving playlists:', error);
                    }
                  }} favorites={favorites} toggleFavorite={toggleFavorite} onAddPlaylist={(item) => { setItemToAdd(item); setShowAddPlaylist(true); }} />} />
                  <Route path="/playlist/:id" element={<PlaylistDetail playlist={playlist} onToggleFavorite={toggleFavorite} favorites={favorites} onRemove={removeFromPlaylist} />} />
                  <Route path="/album/:id" element={<AlbumDetail onToggleFavorite={toggleFavorite} favorites={favorites} onAddPlaylist={(item) => { setItemToAdd(item); setShowAddPlaylist(true); }} />} />
                  <Route path="/artist/:id" element={<ArtistDetail onToggleFavorite={toggleFavorite} favorites={favorites} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </ErrorBoundary>
            </main>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex-1 overflow-y-auto custom-scrollbar bg-slate-950" style={{ paddingBottom: '140px' }}>
            <ErrorBoundary fallback={<div className="p-8 text-center">Error al cargar contenido</div>}>
              <Routes>
                <Route path="/" element={<HomeView onToggleFavorite={toggleFavorite} favorites={favorites} onAddPlaylist={(item) => { setItemToAdd(item); setShowAddPlaylist(true); }} />} />
                <Route path="/search" element={<Search />} />
                <Route path="/search/results" element={<SearchResults onToggleFavorite={toggleFavorite} favorites={favorites} onAddPlaylist={(item) => { setItemToAdd(item); setShowAddPlaylist(true); }} />} />
                <Route path="/radio" element={<Radio onToggleFavorite={toggleFavorite} favorites={favorites} />} />
                <Route path="/favorites" element={<Favorites favorites={favorites} onToggleFavorite={toggleFavorite} onRemove={toggleFavorite} />} />
                <Route path="/library" element={<UserLibrary userPlaylists={userPlaylists} setUserPlaylists={setUserPlaylists} saveUserPlaylists={async (playlists) => {
                    try {
                      const userDocRef = doc(db, 'users', user.uid);
                      await updateDoc(userDocRef, { playlists });
                    } catch (error) {
                      console.error('Error saving playlists:', error);
                    }
                  }} favorites={favorites} toggleFavorite={toggleFavorite} onAddPlaylist={(item) => { setItemToAdd(item); setShowAddPlaylist(true); }} />} />
                <Route path="/playlist/:id" element={<PlaylistDetail playlist={playlist} onToggleFavorite={toggleFavorite} favorites={favorites} onRemove={removeFromPlaylist} />} />
                <Route path="/album/:id" element={<AlbumDetail onToggleFavorite={toggleFavorite} favorites={favorites} onAddPlaylist={(item) => { setItemToAdd(item); setShowAddPlaylist(true); }} />} />
                <Route path="/artist/:id" element={<ArtistDetail onToggleFavorite={toggleFavorite} favorites={favorites} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </div>

          {/* Player Bar (Desktop) */}
          <ErrorBoundary fallback={<div className="h-20 bg-slate-900/80 border-t border-white/10">Reproductor no disponible</div>}>
            <div className="hidden md:block fixed bottom-0 left-64 right-0 h-24 z-50">
              <PlayerBar
                onShowNowPlaying={() => setShowNowPlaying(true)}
                onShowLyrics={() => setShowMobilePlayer(true)}
                onShowQueue={() => setShowMobilePlayer(true)}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onAddToPlaylist={(item) => { setItemToAdd(item); setShowAddPlaylist(true); }}
              />
            </div>
          </ErrorBoundary>

          {/* Bottom Navigation (Mobile) */}
          <ErrorBoundary>
            <BottomNav onLogout={handleLogout} onShowPlayer={() => setShowMobilePlayer(true)} />
          </ErrorBoundary>

          {/* Modals */}
          {showNowPlaying && (
            <NowPlayingModal
              onClose={() => setShowNowPlaying(false)}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              togglePlaylist={addToPlaylist}
              playlist={playlist}
            />
          )}

          <AddToPlaylistModal
            isOpen={showAddPlaylist && itemToAdd !== null}
            onClose={() => { setShowAddPlaylist(false); setItemToAdd(null); }}
            playlists={userPlaylists}
            onAddToPlaylist={(playlistId) => {
              if (itemToAdd) {
                addToPlaylist(itemToAdd);
                setShowAddPlaylist(false);
                setItemToAdd(null);
              }
            }}
          />

          {showMobilePlayer && (
            <MobileFullScreenPlayer
              onClose={() => setShowMobilePlayer(false)}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              togglePlaylist={addToPlaylist}
              playlist={playlist}
            />
          )}

          {/* PHASE 1: YouTube API Quota Monitor */}
          <QuotaMonitor />
        </div>
      </PlayerProvider>
    </Router>
  );
}
