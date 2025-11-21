import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Play } from 'lucide-react';
import { searchDeezer } from '../services/hybridMusicService';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import { getItemId } from '../utils/formatUtils';

export default function SearchResults({ favorites, toggleFavorite, onAddPlaylist }) {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const navigate = useNavigate();
    const { playItem } = usePlayer();

    const [loading, setLoading] = useState(false);
    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        if (!query) return;

        const performSearch = async () => {
            setLoading(true);
            try {
                const [tracksData, artistsData, albumsData] = await Promise.all([
                    searchDeezer(query, 'track', 20),
                    searchDeezer(query, 'artist', 10),
                    searchDeezer(query, 'album', 10)
                ]);
                setTracks(tracksData);
                setArtists(artistsData);
                setAlbums(albumsData);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            performSearch();
        }, 500);

        return () => clearTimeout(debounce);
    }, [query]);

    if (!query) {
        return (
            <div className="glass-fluid-subtle text-center py-20 rounded-2xl text-slate-400 m-8">
                <Search size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold mb-2">Busca canciones, artistas o álbumes</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (artists.length === 0 && albums.length === 0 && tracks.length === 0) {
        return (
            <div className="glass-fluid-subtle text-center py-20 rounded-2xl text-slate-400 m-8">
                <Search size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold mb-2">No se encontraron resultados para "{query}"</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-12 pb-24 overflow-y-auto h-full custom-scrollbar">
            {/* Artists Section */}
            {artists.length > 0 && (
                <section>
                    <h3 className="text-2xl font-bold text-white mb-6">Artistas</h3>
                    <div className="flex overflow-x-auto gap-6 pb-4 -mx-6 px-6 hide-scrollbar">
                        {artists.map((artist) => (
                            <div
                                key={artist.id}
                                className="flex flex-col items-center gap-3 flex-none group cursor-pointer"
                                onClick={() => navigate(`/artist/${artist.id}`)}
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
            {albums.length > 0 && (
                <section>
                    <h3 className="text-2xl font-bold text-white mb-6">Álbumes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {albums.map((album) => (
                            <div
                                key={album.id}
                                className="group relative glass-fluid-subtle rounded-2xl overflow-hidden shadow-lg hover-glow transition-all duration-300 cursor-pointer"
                                onClick={() => navigate(`/album/${album.id}`)}
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

            {/* Tracks Section */}
            {tracks.length > 0 && (
                <section>
                    <h3 className="text-2xl font-bold text-white mb-6">Canciones</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                        {tracks.map((item) => (
                            <SongCard
                                key={getItemId(item)}
                                item={item}
                                onPlay={(t) => playItem(t, tracks)}
                                onFavorite={toggleFavorite}
                                onAddPlaylist={onAddPlaylist}
                                isFavorite={favorites.some(f => getItemId(f) === getItemId(item))}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
