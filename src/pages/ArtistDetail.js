import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getDeezerArtist, getArtistTopTracks, getArtistAlbums } from '../services/hybridMusicService';
import { usePlayer } from '../context/PlayerContext';
import SongListItem from '../components/SongListItem';
import { getItemId } from '../utils/formatUtils';

export default function ArtistDetail({ favorites, toggleFavorite, onAddPlaylist }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playItem } = usePlayer();

    const [artist, setArtist] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllTracks, setShowAllTracks] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [artistData, tracksData, albumsData] = await Promise.all([
                    getDeezerArtist(id),
                    getArtistTopTracks(id, 20),
                    getArtistAlbums(id, 12)
                ]);
                setArtist(artistData);
                setTopTracks(tracksData);
                setAlbums(albumsData);
            } catch (error) {
                console.error('Error loading artist:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-full"><div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div></div>;
    if (!artist) return <div className="text-center text-slate-400 mt-20">Artista no encontrado</div>;

    return (
        <div className="p-4 md:p-8 pb-24">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <span>← Volver</span>
            </button>

            {/* Artist Header */}
            <div className="mb-8 glass-fluid-glow rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative h-48 md:h-64">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 to-slate-900"></div>
                    <img
                        src={artist.pictureBig || artist.image}
                        alt={artist.name}
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <div className="flex items-end gap-6">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl border-4 border-white/20 flex-shrink-0">
                                <img
                                    src={artist.pictureBig || artist.image}
                                    alt={artist.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 pb-4">
                                <p className="text-sm text-purple-300 font-semibold mb-2">ARTISTA</p>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-3">{artist.name}</h1>
                                <div className="flex gap-4 text-sm text-slate-300">
                                    {artist.nbFan && <span>👥 {artist.nbFan?.toLocaleString()} fans</span>}
                                    {artist.nbAlbum && <span>💿 {artist.nbAlbum} álbumes</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Tracks */}
            {topTracks.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl md:text-2xl font-bold text-white">Canciones Destacadas</h3>
                        {topTracks.length > 7 && (
                            <button
                                onClick={() => setShowAllTracks(!showAllTracks)}
                                className="text-xs md:text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-full"
                            >
                                {showAllTracks ? 'Mostrar menos' : 'Mostrar más'}
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col bg-slate-800/30 rounded-3xl p-2 md:p-4 backdrop-blur-sm">
                        {topTracks.slice(0, showAllTracks ? 20 : 7).map((track, idx) => (
                            <SongListItem
                                key={getItemId(track)}
                                item={track}
                                index={idx}
                                onPlay={(t) => playItem(t, topTracks)}
                                onFavorite={toggleFavorite}
                                onAddPlaylist={onAddPlaylist}
                                isFavorite={favorites.some(f => getItemId(f) === getItemId(track))}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Albums */}
            {albums.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Discografía</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                        {albums.map((album) => (
                            <div
                                key={album.id}
                                onClick={() => navigate(`/album/${album.id}`)}
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
        </div>
    );
}
