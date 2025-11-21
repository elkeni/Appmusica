import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Music, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import SongListItem from '../components/SongListItem';
import { getItemId } from '../utils/formatUtils';

export default function UserLibrary({ userPlaylists, setUserPlaylists, saveUserPlaylists, favorites, toggleFavorite, onAddPlaylist }) {
    const navigate = useNavigate();
    const { playItem } = usePlayer();
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

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
        setShowCreateModal(false);
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
        if (selectedPlaylist && selectedPlaylist.id === playlistId) {
            setSelectedPlaylist(updatedPlaylists.find(p => p.id === playlistId));
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
        if (selectedPlaylist && selectedPlaylist.id === playlistId) {
            setSelectedPlaylist(updatedPlaylists.find(p => p.id === playlistId));
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
        if (selectedPlaylist && selectedPlaylist.id === playlistId) {
            setSelectedPlaylist(updatedPlaylists.find(p => p.id === playlistId));
        }
    };

    if (selectedPlaylist) {
        return (
            <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-8 pb-24">
                <button onClick={() => setSelectedPlaylist(null)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <span>← Volver a mis playlists</span>
                </button>

                <div className="mb-8 glass-fluid-glow rounded-3xl overflow-hidden shadow-2xl">
                    <div className="relative h-48 md:h-64 bg-gradient-to-b from-slate-800 to-slate-900">
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                            <div className="flex items-end gap-6">
                                <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 flex-shrink-0 bg-slate-800 flex items-center justify-center">
                                    {selectedPlaylist.songs && selectedPlaylist.songs.length > 0 ? (
                                        <img src={selectedPlaylist.songs[0].image || selectedPlaylist.songs[0].coverBig} alt={selectedPlaylist.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Music size={64} className="text-slate-600" />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <p className="text-sm text-purple-300 font-semibold mb-2 uppercase tracking-wider">Playlist Pública</p>
                                    <h1
                                        className="text-4xl md:text-6xl font-black text-white mb-3 cursor-pointer hover:text-purple-200 transition-colors"
                                        onClick={() => {
                                            const newName = prompt("Editar nombre de la playlist:", selectedPlaylist.name);
                                            if (newName && newName.trim()) handleRenamePlaylist(selectedPlaylist.id, newName);
                                        }}
                                        title="Click para editar nombre"
                                    >
                                        {selectedPlaylist.name}
                                    </h1>
                                    <p
                                        className="text-slate-300 text-sm md:text-base mb-4 cursor-pointer hover:text-white transition-colors"
                                        onClick={() => {
                                            const newDesc = prompt("Editar descripción:", selectedPlaylist.description);
                                            if (newDesc !== null) handleUpdatePlaylistDescription(selectedPlaylist.id, newDesc);
                                        }}
                                        title="Click para editar descripción"
                                    >
                                        {selectedPlaylist.description || "Sin descripción"}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                                        <span>• {selectedPlaylist.songs?.length || 0} canciones</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col bg-slate-800/30 rounded-3xl p-2 md:p-4 backdrop-blur-sm">
                    {selectedPlaylist.songs && selectedPlaylist.songs.length > 0 ? (
                        selectedPlaylist.songs.map((track, idx) => (
                            <SongListItem
                                key={`${getItemId(track)}-${idx}`}
                                item={track}
                                index={idx}
                                onPlay={(t) => playItem(t, selectedPlaylist.songs)}
                                onFavorite={toggleFavorite}
                                onAddPlaylist={onAddPlaylist}
                                onRemoveFromPlaylist={(item) => handleRemoveFromPlaylist(selectedPlaylist.id, getItemId(item))}
                                isFavorite={favorites.some(f => getItemId(f) === getItemId(track))}
                                isInPlaylist={true}
                            />
                        ))
                    ) : (
                        <div className="py-20 text-center text-slate-400">
                            <Music size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-semibold">Esta playlist está vacía</p>
                            <p className="text-sm">Busca canciones y agrégalas aquí</p>
                            <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 rounded-full accent-gradient text-white font-bold">Explorar Música</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-8 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Mis Playlists</h3>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="accent-gradient px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <Plus size={18} /> Nueva Playlist
                </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Create New Card */}
                <div
                    onClick={() => setShowCreateModal(true)}
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
                        onClick={() => setSelectedPlaylist(pl)}
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

            {/* Create Playlist Modal */}
            {showCreateModal && (
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
                                onClick={() => setShowCreateModal(false)}
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
        </div>
    );
}
