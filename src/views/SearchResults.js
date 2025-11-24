import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Play } from 'lucide-react';
import { useMusic } from '../hooks/useMusic';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/shared/SongCard';
import SearchFilterTabs from '../components/shared/SearchFilterTabs';
import { getItemId } from '../utils/formatUtils';

export default function SearchResults({ favorites, toggleFavorite, onAddPlaylist }) {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const navigate = useNavigate();
    const { playItem } = usePlayer();
    const { search } = useMusic();

    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        if (!query) return;

        const performSearch = async () => {
            setLoading(true);
            try {
                console.log(`🔍 Universal search for: "${query}"`);
                
                // Búsqueda universal con la nueva API
                const results = await search(query, 30);
                
                setTracks(results || []);
                setArtists([]); // Artist pages coming in future
                setAlbums([]); // Album pages coming in future
                setVideos([]); 
                setPlaylists([]);
                
                console.log(`✅ Search complete: ${results.length} tracks found`);
            } catch (error) {
                console.error('❌ Search error:', error);
                setTracks([]);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            performSearch();
        }, 500);

        return () => clearTimeout(debounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const handleFilterChange = (filterId) => {
        setActiveFilter(filterId);
    };

    if (!query) {
        return (
            <div className="flex items-center justify-center h-full bg-black text-center py-20 text-gray-400">
                <div>
                    <Search size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-semibold mb-2">Busca canciones, artistas o álbumes</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-black">
                <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    const hasResults = artists.length > 0 || albums.length > 0 || tracks.length > 0 || videos.length > 0 || playlists.length > 0;

    if (!hasResults) {
        return (
            <div className="bg-black h-full">
                <SearchFilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />
                <div className="flex items-center justify-center h-full text-center py-20 text-gray-400">
                    <div>
                        <Search size={64} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-semibold mb-2">No se encontraron resultados para "{query}"</p>
                    </div>
                </div>
            </div>
        );
    }

    // Filter logic based on active tab
    const shouldShow = (type) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'songs' && type === 'tracks') return true;
        if (activeFilter === 'videos' && type === 'videos') return true;
        if (activeFilter === 'albums' && type === 'albums') return true;
        if (activeFilter === 'playlists' && type === 'playlists') return true;
        if (activeFilter === type) return true;
        return false;
    };

    return (
        <div className="bg-black">
            {/* Filter Tabs */}
            <SearchFilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />

            <div className="p-4 md:p-8 space-y-12 pb-24">
                {/* Artists Section */}
                {shouldShow('artists') && artists.length > 0 && (
                    <section>
                        <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Roboto, Inter, sans-serif' }}>
                            Artistas
                        </h3>
                        <div className="flex overflow-x-auto gap-6 pb-4 -mx-6 px-6 hide-scrollbar">
                            {artists.map((artist) => (
                                <div
                                    key={artist.id}
                                    className="flex flex-col items-center gap-3 flex-none group cursor-pointer"
                                    onClick={() => navigate(`/artist/${artist.id}`)}
                                >
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/40 transition-all shadow-lg">
                                        <img
                                            src={artist.picture_medium || artist.image}
                                            alt={artist.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <p className="text-base font-semibold text-white text-center truncate w-32">{artist.name}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Albums Section */}
                {shouldShow('albums') && albums.length > 0 && (
                    <section>
                        <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Roboto, Inter, sans-serif' }}>
                            Álbumes
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {albums.map((album) => (
                                <div
                                    key={album.id}
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/album/${album.id}`)}
                                >
                                    <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-zinc-900">
                                        <img
                                            src={album.coverBig || album.cover}
                                            alt={album.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-3 bg-white hover:bg-gray-100 rounded-full text-black shadow-lg">
                                                <Play fill="currentColor" size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-semibold text-white text-sm truncate">{album.title}</h4>
                                    <p className="text-gray-400 text-xs truncate">{album.artist}</p>
                                    {album.releaseDate && (
                                        <p className="text-gray-500 text-xs">{album.releaseDate.split('-')[0]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Videos Section (YouTube) */}
                {shouldShow('videos') && videos.length > 0 && (
                    <section>
                        <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Roboto, Inter, sans-serif' }}>
                            Videos musicales
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="group cursor-pointer"
                                    onClick={() => playItem(video, videos)}
                                >
                                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-zinc-900">
                                        <img
                                            src={video.image}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-3 bg-white hover:bg-gray-100 rounded-full text-black shadow-lg">
                                                <Play fill="currentColor" size={20} />
                                            </button>
                                        </div>
                                        {/* VEVO or Official badge */}
                                        {(video.artist?.includes('VEVO') || video.snippet?.channelTitle?.includes('VEVO')) && (
                                            <div className="absolute top-2 right-2">
                                                <span className="px-2 py-1 text-xs font-bold bg-red-600 rounded text-white">
                                                    VEVO
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-white text-sm line-clamp-2">{video.title}</h4>
                                    <p className="text-gray-400 text-xs truncate">{video.artist}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Tracks Section (Songs) */}
                {shouldShow('tracks') && tracks.length > 0 && (
                    <section>
                        <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Roboto, Inter, sans-serif' }}>
                            Canciones
                        </h3>
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

                {/* Playlists Section (Future) */}
                {shouldShow('playlists') && playlists.length > 0 && (
                    <section>
                        <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Roboto, Inter, sans-serif' }}>
                            Listas de reproducción
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {/* Playlists rendering logic */}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
