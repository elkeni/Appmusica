import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getDeezerCharts } from '../services/hybridMusicService';
import { formatDateShortSpanish } from '../utils/formatUtils';

export default function HomeView({ onToggleFavorite, favorites, onAddPlaylist }) {
    const navigate = useNavigate();
    const { playItem } = usePlayer();
    const [user, setUser] = useState(null);
    const [recommendations, setRecommendations] = useState({
        highlighted: [],
        new: [],
        recent: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Refs for horizontal scroll containers
    const scrollContainerRef = useRef({});

    // Get user from context (we'll implement this)
    useEffect(() => {
        // For now, get user from localStorage or auth state
        const userStr = localStorage.getItem('appmusica_user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    // Load personalized recommendations on mount
    useEffect(() => {
        const loadRecommendations = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch top charts from Deezer as our primary recommendation source
                const chartsData = await getDeezerCharts(50);
                
                if (!chartsData || chartsData.length === 0) {
                    throw new Error('No recommendations available');
                }

                setRecommendations({
                    highlighted: chartsData.slice(0, 15),   // Top Charts tracks
                    new: chartsData.slice(15, 30),          // New releases
                    recent: chartsData.slice(30, 45)        // Recent popular
                });
            } catch (err) {
                console.error('Error loading recommendations:', err);
                setError('Error al cargar recomendaciones. Intenta de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        loadRecommendations();
    }, []);

    // Scroll handlers for carousel
    const scroll = (containerId, direction) => {
        const container = scrollContainerRef.current[containerId];
        if (!container) return;

        const scrollAmount = 300;
        const newScrollLeft = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
        
        container.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pb-32">
            {/* Apple Music Style Header */}
            <div className="bg-black sticky top-0 z-30">
                <div className="px-6 py-6 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            Inicio
                        </h1>
                    </div>
                    {user && (
                        <div className="flex items-center gap-4">
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    className="w-12 h-12 rounded-full border-2 border-purple-500/50 cursor-pointer hover:border-purple-500 transition-colors"
                                    onClick={() => navigate('/library')}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="px-6 py-3 mx-6 mt-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Section 1: Top Charts */}
            <section className="py-8">
                <div className="px-6 mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                        Top Charts
                    </h2>
                    {recommendations.highlighted.length > 0 && (
                        <button
                            onClick={() => scroll('highlighted', 'right')}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>

                <div
                    ref={(el) => (scrollContainerRef.current['highlighted'] = el)}
                    className="flex gap-4 px-6 overflow-x-auto scroll-snap-x mandatory pb-4 -mx-6 px-6 hide-scrollbar"
                    style={{
                        scrollBehavior: 'smooth',
                        scrollSnapType: 'x mandatory'
                    }}
                >
                    {recommendations.highlighted.map((track) => (
                        <div
                            key={track.id}
                            className="flex-none w-40 md:w-48 group cursor-pointer scroll-snap-align-start"
                            onClick={() => playItem(track, recommendations.highlighted)}
                        >
                            {/* Card */}
                            <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-slate-800">
                                <img
                                    src={track.image || track.cover || track.coverBig}
                                    alt={track.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                        className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playItem(track, recommendations.highlighted);
                                        }}
                                    >
                                        <Play fill="currentColor" size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Track Info */}
                            <h3 className="font-semibold text-white text-sm truncate group-hover:text-purple-400 transition-colors">
                                {track.title}
                            </h3>
                            <p className="text-xs text-slate-400 truncate">
                                {track.artist?.name || track.artist || 'Artista desconocido'}
                            </p>
                            {track.release_date && (
                                <p className="text-xs text-slate-500 mt-1">
                                    {formatDateShortSpanish(track.release_date)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 2: New Releases */}
            <section className="py-8">
                <div className="px-6 mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                        Nuevos lanzamientos
                    </h2>
                    {recommendations.new.length > 0 && (
                        <button
                            onClick={() => scroll('new', 'right')}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>

                <div
                    ref={(el) => (scrollContainerRef.current['new'] = el)}
                    className="flex gap-4 px-6 overflow-x-auto scroll-snap-x mandatory pb-4 -mx-6 px-6 hide-scrollbar"
                    style={{
                        scrollBehavior: 'smooth',
                        scrollSnapType: 'x mandatory'
                    }}
                >
                    {recommendations.new.map((track) => (
                        <div
                            key={track.id}
                            className="flex-none w-40 md:w-48 group cursor-pointer scroll-snap-align-start"
                            onClick={() => playItem(track, recommendations.new)}
                        >
                            {/* Card - Portrait style for new releases */}
                            <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-slate-800 shadow-lg">
                                <img
                                    src={track.image || track.cover || track.coverBig}
                                    alt={track.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {/* Overlay with gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg ml-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playItem(track, recommendations.new);
                                        }}
                                    >
                                        <Play fill="currentColor" size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Track Info */}
                            <h3 className="font-semibold text-white text-sm truncate group-hover:text-purple-400 transition-colors">
                                {track.title}
                            </h3>
                            <p className="text-xs text-slate-400 truncate">
                                {track.artist?.name || track.artist || 'Artista desconocido'}
                            </p>
                            {track.release_date && (
                                <p className="text-xs text-slate-500 mt-1">
                                    {formatDateShortSpanish(track.release_date)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 3: Popular Now */}
            {recommendations.recent.length > 0 && (
                <section className="py-8">
                    <div className="px-6 mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">
                            Populares ahora
                        </h2>
                        <button
                            onClick={() => scroll('recent', 'right')}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div
                        ref={(el) => (scrollContainerRef.current['recent'] = el)}
                        className="flex gap-4 px-6 overflow-x-auto scroll-snap-x mandatory pb-4 -mx-6 px-6 hide-scrollbar"
                        style={{
                            scrollBehavior: 'smooth',
                            scrollSnapType: 'x mandatory'
                        }}
                    >
                        {recommendations.recent.map((track) => (
                            <div
                                key={track.id}
                                className="flex-none w-32 md:w-40 group cursor-pointer scroll-snap-align-start"
                                onClick={() => playItem(track, recommendations.recent)}
                            >
                                {/* Square Card */}
                                <div className="relative aspect-square rounded-md overflow-hidden mb-2 bg-slate-800">
                                    <img
                                        src={track.image || track.cover || track.coverBig}
                                        alt={track.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button
                                            className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playItem(track, recommendations.recent);
                                            }}
                                        >
                                            <Play fill="currentColor" size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Track Info */}
                                <h3 className="font-semibold text-white text-xs truncate group-hover:text-purple-400 transition-colors">
                                    {track.title}
                                </h3>
                                <p className="text-xs text-slate-400 truncate">
                                    {track.artist?.name || track.artist || 'Artista'}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {recommendations.highlighted.length === 0 && recommendations.new.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="text-6xl mb-4">🎵</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        Sin recomendaciones aún
                    </h3>
                    <p className="text-slate-400 mb-6">
                        Estamos cargando las mejores recomendaciones del momento. Intenta de nuevo en unos segundos.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            )}
        </div>
    );
}
