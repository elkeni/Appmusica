import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [queue, setQueue] = useState([]);

    // Auth listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            
            if (currentUser) {
                await loadUserData(currentUser.uid, currentUser);
            } else {
                setFavorites([]);
                setPlaylists([]);
                setQueue([]);
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load user data from Firestore
    const loadUserData = async (uid, firebaseUser) => {
        try {
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                setFavorites(data.favorites || []);
                setPlaylists(data.playlists || []);
                setQueue(data.queue || []);
            } else {
                // Create initial user document
                await setDoc(userDocRef, {
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || 'Usuario',
                    photoURL: firebaseUser.photoURL || null,
                    favorites: [],
                    playlists: [],
                    queue: [],
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

    // Check if item is favorited
    const isFavorite = (item) => {
        const itemId = item?.id || item?.stationuuid;
        return favorites.some(f => (f?.id || f?.stationuuid) === itemId);
    };

    // Create playlist
    const createPlaylist = async (name, description = '') => {
        if (!user) return null;

        try {
            const newPlaylist = {
                id: `playlist_${Date.now()}`,
                name,
                description,
                tracks: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const updatedPlaylists = [...playlists, newPlaylist];
            setPlaylists(updatedPlaylists);

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { playlists: updatedPlaylists });

            return newPlaylist;
        } catch (error) {
            console.error('Error creating playlist:', error);
            return null;
        }
    };

    // Add track to playlist
    const addToPlaylist = async (playlistId, track) => {
        if (!user) return false;

        try {
            const updatedPlaylists = playlists.map(pl => {
                if (pl.id === playlistId) {
                    return {
                        ...pl,
                        tracks: [...pl.tracks, track],
                        updatedAt: new Date().toISOString()
                    };
                }
                return pl;
            });

            setPlaylists(updatedPlaylists);

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { playlists: updatedPlaylists });

            return true;
        } catch (error) {
            console.error('Error adding to playlist:', error);
            return false;
        }
    };

    // Remove track from playlist
    const removeFromPlaylist = async (playlistId, trackId) => {
        if (!user) return false;

        try {
            const updatedPlaylists = playlists.map(pl => {
                if (pl.id === playlistId) {
                    return {
                        ...pl,
                        tracks: pl.tracks.filter(t => t.id !== trackId),
                        updatedAt: new Date().toISOString()
                    };
                }
                return pl;
            });

            setPlaylists(updatedPlaylists);

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { playlists: updatedPlaylists });

            return true;
        } catch (error) {
            console.error('Error removing from playlist:', error);
            return false;
        }
    };

    // Delete playlist
    const deletePlaylist = async (playlistId) => {
        if (!user) return false;

        try {
            const updatedPlaylists = playlists.filter(pl => pl.id !== playlistId);
            setPlaylists(updatedPlaylists);

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { playlists: updatedPlaylists });

            return true;
        } catch (error) {
            console.error('Error deleting playlist:', error);
            return false;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await auth.signOut();
            setFavorites([]);
            setPlaylists([]);
            setQueue([]);
            localStorage.removeItem('appmusica_user');
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        favorites,
        playlists,
        queue,
        toggleFavorite,
        isFavorite,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        deletePlaylist,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
