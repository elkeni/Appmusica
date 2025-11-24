import React, { useState } from 'react';
import { X, Plus, Music } from 'lucide-react';


export default function AddToPlaylistModal({ isOpen, onClose, playlists, onAddToPlaylist }) {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredPlaylists = playlists.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
                    <h3 className="text-xl font-bold text-white">Agregar a Playlist</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-white/5">
                    <input
                        type="text"
                        placeholder="Buscar playlist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        autoFocus
                    />
                </div>

                {/* List */}
                <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
                    {filteredPlaylists.length > 0 ? (
                        <div className="space-y-1">
                            {filteredPlaylists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    onClick={() => onAddToPlaylist(playlist.id)}
                                    className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group text-left"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-purple-500/30">
                                        {playlist.songs && playlist.songs.length > 0 ? (
                                            <img src={playlist.songs[0].image || playlist.songs[0].cover} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Music size={20} className="text-slate-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white truncate group-hover:text-purple-400 transition-colors">{playlist.name}</h4>
                                        <p className="text-xs text-slate-400">{playlist.songs?.length || 0} canciones</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-purple-500 group-hover:border-purple-500 transition-all">
                                        <Plus size={16} className="text-slate-400 group-hover:text-white" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center text-slate-500">
                            <p>No se encontraron playlists</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-slate-800/30">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white font-semibold transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
