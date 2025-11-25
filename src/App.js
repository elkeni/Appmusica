import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { ToastContainer } from './services/toastService';
import LoadingSpinner from './components/shared/LoadingSpinner';
import { usePageTracking, useSessionTracking } from './services/analyticsService';
import './index.css';

// Code Splitting: Lazy load components
const Auth = lazy(() => import('./components/shared/Auth'));
const AddToPlaylistModal = lazy(() => import('./components/shared/AddToPlaylistModal'));

// Views (lazy loaded)
const Home = lazy(() => import('./views/Home'));
const Artist = lazy(() => import('./views/Artist'));
const Profile = lazy(() => import('./views/Profile'));
const SearchView = lazy(() => import('./views/SearchView'));
const SearchResults = lazy(() => import('./views/SearchResults'));
const Radio = lazy(() => import('./views/Radio'));
const Favorites = lazy(() => import('./views/Favorites'));
const UserLibrary = lazy(() => import('./views/UserLibrary'));
const PlaylistDetail = lazy(() => import('./views/PlaylistDetail'));
const AlbumDetail = lazy(() => import('./views/AlbumDetail'));

function AppContent() {
  const { user, loading, favorites, playlists, toggleFavorite } = useAuth();
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);

  // Analytics tracking
  usePageTracking();
  useSessionTracking();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg font-medium">Cargando CloudTune...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const addPlaylistHandler = (item) => { setItemToAdd(item); setShowAddPlaylist(true); };

  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><LoadingSpinner size="xl" /></div>}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<SearchView />} />
            <Route path="search/results" element={<SearchResults onToggleFavorite={toggleFavorite} favorites={favorites} onAddPlaylist={addPlaylistHandler} />} />
            <Route path="radio" element={<Radio onToggleFavorite={toggleFavorite} favorites={favorites} />} />
            <Route path="favorites" element={<Favorites favorites={favorites} onToggleFavorite={toggleFavorite} onRemove={toggleFavorite} />} />
            <Route path="library" element={<UserLibrary userPlaylists={playlists} favorites={favorites} toggleFavorite={toggleFavorite} onAddPlaylist={addPlaylistHandler} />} />
            <Route path="playlist/:id" element={<PlaylistDetail onToggleFavorite={toggleFavorite} favorites={favorites} />} />
            <Route path="album/:id" element={<AlbumDetail onToggleFavorite={toggleFavorite} favorites={favorites} onAddPlaylist={addPlaylistHandler} />} />
            <Route path="artist/:id" element={<Artist />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
        </Routes>
        <AddToPlaylistModal isOpen={showAddPlaylist && itemToAdd !== null} onClose={() => { setShowAddPlaylist(false); setItemToAdd(null); }} playlists={playlists} onAddToPlaylist={(playlistId) => { if (itemToAdd) { setShowAddPlaylist(false); setItemToAdd(null); } }} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <PlayerProvider>
            <AppContent />
            <ToastContainer />
          </PlayerProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
