import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from './firebase';

// Context
import { PlayerProvider } from './context/PlayerContext';

// Components
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import NowPlayingModal from './components/NowPlayingModal';
import Auth from './components/Auth';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import MobileFullScreenPlayer from './components/MobileFullScreenPlayer';
import RightPanel from './components/RightPanel';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

// Pages
import HomeView from './pages/HomeView'; // New Apple Music-style home
import SearchResults from './pages/SearchResults';
import ArtistDetail from './pages/ArtistDetail';
import AlbumDetail from './pages/AlbumDetail';
import PlaylistDetail from './pages/PlaylistDetail';
import UserLibrary from './pages/UserLibrary';
import Favorites from './pages/Favorites';

// Utils
import { getItemId } from './utils/formatUtils';

export default function App() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [nowPlayingModalOpen, setNowPlayingModalOpen] = useState(false);
  const [trackToAdd, setTrackToAdd] = useState(null);

  // Auth & User Data Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Generate avatar if not present
        let photoURL = currentUser.photoURL;
        if (!photoURL && currentUser.displayName) {
          photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName)}&background=6366f1&color=fff&bold=true`;
        }

        // Store user data in localStorage for access in child components
        localStorage.setItem('appmusica_user', JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: photoURL
        }));

        // Load user data from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            setFavorites(data.favorites || []);
            setUserPlaylists(data.playlists || []);
          } else {
            // Initialize new user
            await setDoc(userDocRef, {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: photoURL,
              favorites: [],
              playlists: [],
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // Clear user data on logout
        localStorage.removeItem('appmusica_user');
        setFavorites([]);
        setUserPlaylists([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Favorites Management
  const toggleFavorite = async (track) => {
    if (!user) return;
    // Guard clause: Prevent Event objects or nulls
    if (!track || track.nativeEvent || track.preventDefault) {
      console.warn("Invalid track passed to toggleFavorite:", track);
      return;
    }
    const trackId = getItemId(track);
    const isFavorite = favorites.some(f => getItemId(f) === trackId);
    const userRef = doc(db, 'users', user.uid);

    try {
      if (isFavorite) {
        const newFavorites = favorites.filter(f => getItemId(f) !== trackId);
        setFavorites(newFavorites);
        await updateDoc(userRef, { favorites: newFavorites }); // Updating entire array to be safe with object equality
      } else {
        const newFavorites = [...favorites, track];
        setFavorites(newFavorites);
        await updateDoc(userRef, { favorites: arrayUnion(track) });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  // Playlist Management
  const saveUserPlaylists = async (updatedPlaylists) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { playlists: updatedPlaylists });
    } catch (error) {
      console.error("Error saving playlists:", error);
    }
  };

  const openAddToPlaylistModal = (track) => {
    setTrackToAdd(track);
    setPlaylistModalOpen(true);
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!trackToAdd) return;

    const updatedPlaylists = userPlaylists.map(p => {
      if (p.id === playlistId) {
        // Check if song already exists
        if (p.songs && p.songs.some(s => getItemId(s) === getItemId(trackToAdd))) {
          return p;
        }

        // Construct robust song object
        const songToSave = {
          id: getItemId(trackToAdd),
          title: trackToAdd.title || 'Unknown Title',
          artist: trackToAdd.artist || trackToAdd.originalData?.artist || trackToAdd.originalData?.creator?.name || 'Unknown Artist',
          image: trackToAdd.image || trackToAdd.coverBig || trackToAdd.cover || '',
          album: trackToAdd.album?.title || trackToAdd.originalData?.album?.title || '',
          duration: trackToAdd.duration || 0,
          providerId: trackToAdd.id, // Store original ID as providerId
          addedAt: new Date().toISOString(),
          originalData: trackToAdd.originalData || trackToAdd
        };

        return { ...p, songs: [...(p.songs || []), songToSave] };
      }
      return p;
    });

    setUserPlaylists(updatedPlaylists);
    await saveUserPlaylists(updatedPlaylists);
    setPlaylistModalOpen(false);
    setTrackToAdd(null);
  };

  const handleLogout = () => signOut(auth);

  if (!user) {
    return <Auth />;
  }

  return (
    <PlayerProvider>
      <Router>
        <div className="main-layout bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans selection:bg-purple-500/30">

          {/* Area: Nav */}
          <div className="area-nav hidden md:block">
            <Sidebar
              user={user}
              playlist={[]}
              favorites={favorites}
              handleLogout={handleLogout}
            />
          </div>

          {/* Area: Main Content */}
          <main className="area-main overflow-y-auto custom-scrollbar relative flex flex-col">
            <Header />
            <div className="flex-1 p-6">
              <Routes>
                <Route path="/" element={
                  <HomeView
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onAddPlaylist={openAddToPlaylistModal}
                  />
                } />
                <Route path="/search" element={<SearchResults favorites={favorites} toggleFavorite={toggleFavorite} onAddPlaylist={openAddToPlaylistModal} />} />
                <Route path="/artist/:id" element={<ArtistDetail favorites={favorites} toggleFavorite={toggleFavorite} onAddPlaylist={openAddToPlaylistModal} />} />
                <Route path="/album/:id" element={<AlbumDetail favorites={favorites} toggleFavorite={toggleFavorite} onAddPlaylist={openAddToPlaylistModal} />} />
                <Route path="/playlist/:id" element={<PlaylistDetail favorites={favorites} toggleFavorite={toggleFavorite} onAddPlaylist={openAddToPlaylistModal} />} />
                <Route path="/library" element={
                  <UserLibrary
                    userPlaylists={userPlaylists}
                    setUserPlaylists={setUserPlaylists}
                    saveUserPlaylists={saveUserPlaylists}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    onAddPlaylist={openAddToPlaylistModal}
                  />
                } />
                <Route path="/favorites" element={<Favorites favorites={favorites} toggleFavorite={toggleFavorite} onAddPlaylist={openAddToPlaylistModal} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>

          {/* Area: Right Panel (Now Playing) */}
          <div className="area-right-panel hidden md:block">
            <RightPanel
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              togglePlaylist={openAddToPlaylistModal}
              playlist={userPlaylists}
            />
          </div>

          {/* Area: Player */}
          <div className="area-player">
            <PlayerBar
              onShowNowPlaying={() => setNowPlayingModalOpen(true)}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onAddToPlaylist={openAddToPlaylistModal}
              onGoToAlbum={() => { }}
            />
          </div>

          {/* Modals */}
          {nowPlayingModalOpen && (
            <>
              {/* Desktop Modal */}
              <div className="hidden md:block">
                <NowPlayingModal
                  onClose={() => setNowPlayingModalOpen(false)}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  togglePlaylist={openAddToPlaylistModal}
                  playlist={userPlaylists}
                />
              </div>
              {/* Mobile Full Screen Player */}
              <div className="md:hidden">
                <MobileFullScreenPlayer
                  onClose={() => setNowPlayingModalOpen(false)}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  togglePlaylist={openAddToPlaylistModal}
                  playlist={userPlaylists}
                />
              </div>
            </>
          )}
          {playlistModalOpen && (
            <AddToPlaylistModal
              isOpen={playlistModalOpen}
              onClose={() => setPlaylistModalOpen(false)}
              playlists={userPlaylists}
              onAddToPlaylist={handleAddToPlaylist}
            />
          )}

          {/* Mobile Bottom Nav */}
          <BottomNav onLogout={handleLogout} />
        </div>
      </Router>
    </PlayerProvider>
  );
}


