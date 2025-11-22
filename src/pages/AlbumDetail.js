import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeezerAlbum } from '../services/hybridMusicService';
import { usePlayer } from '../context/PlayerContext';
import SongListItem from '../components/SongListItem';
import { getItemId } from '../utils/formatUtils';

export default function AlbumDetail({ favorites, toggleFavorite, onAddPlaylist }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playItem } = usePlayer();

    const [album, setAlbum] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const albumData = await getDeezerAlbum(id);
                setAlbum(albumData);
                setTracks(albumData.tracks || []);
            } catch (error) {
                console.error('Error loading album:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-full"><div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div></div>;
    if (!album) return <div className="text-center text-slate-400 mt-20">Álbum no encontrado</div>;

    return (
        <div className="p-4 md:p-8 pb-24">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <span>← Volver</span>
            </button>

            {/* Album Header */}
            <div className="mb-8 glass-fluid-glow rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative h-48 md:h-64">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 to-slate-900"></div>
                    <img
                        src={album.cover_xl || album.cover_big || album.cover}
                        alt={album.title}
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <div className="flex items-end gap-6">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 flex-shrink-0">
                                <img
                                    src={album.cover_xl || album.cover_big || album.cover}
                                    alt={album.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 pb-4">
                                <p className="text-sm text-purple-300 font-semibold mb-2">ÁLBUM</p>
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-3 line-clamp-2">{album.title}</h1>
                                <div className="flex gap-4 text-sm text-slate-300 items-center">
                                    <div className="flex items-center gap-2">
                                        {album.artist?.picture_small && <img src={album.artist.picture_small} alt={album.artist.name} className="w-6 h-6 rounded-full" />}
                                        <span className="font-bold text-white">{album.artist?.name}</span>
                                    </div>
                                    <span>• {album.release_date?.split('-')[0]}</span>
                                    <span>• {album.nb_tracks} canciones</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Track List */}
            <div className="mb-8">
                <div className="flex flex-col bg-slate-800/30 rounded-3xl p-2 md:p-4 backdrop-blur-sm">
                    {tracks && tracks.length > 0 ? tracks.map((track, idx) => (
                        <SongListItem
                            key={getItemId(track)}
                            item={{ ...track, cover: album.cover_medium, coverBig: album.cover_xl }}
                            index={idx}
                            onPlay={(t) => playItem(t, tracks)}
                            onFavorite={toggleFavorite}
                            onAddPlaylist={onAddPlaylist}
                            isFavorite={favorites.some(f => getItemId(f) === getItemId(track))}
                        />
                    )) : (
                        <div className="p-4 text-center text-slate-400">No hay canciones disponibles para este álbum.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
