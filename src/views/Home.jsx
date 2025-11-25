import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, ChevronRight, TrendingUp, Sparkles, Clock } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../hooks/useMusic';
import { usePageTransition } from '../hooks/useAnimations';
import { LoadingSkeleton, FadeInContainer, StaggerContainer } from '../components/shared';

export default function Home() {
    const navigate = useNavigate();
    const { playItem } = usePlayer();
    const { user } = useAuth();
    const { getTrending } = useMusic();
    
    usePageTransition();
    
    const [heroItems, setHeroItems] = useState([]);
    const [trending, setTrending] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadContent = async () => {
        try {
            const trendingData = await getTrending(30);
            
            setHeroItems(trendingData.slice(0, 6));
            setTrending(trendingData.slice(6, 18));
            setRecommended(trendingData.slice(18, 30));
        } catch (error) {
            console.error('Error loading home content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="px-4 md:px-8 py-6 space-y-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="h-10 w-48 bg-gray-800 rounded animate-pulse" />
                    <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <LoadingSkeleton type="hero" count={6} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <LoadingSkeleton type="card" count={12} />
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-8 py-6 space-y-8 page-transition">
            {/* Header */}
            <FadeInContainer delay={0.1}>
                <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-1">
                        {getGreeting()}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Descubre música nueva cada día
                    </p>
                </div>
                <button
                    onClick={() => navigate('/profile')}
                    className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-white/20 transition-all"
                >
                    <img
                        src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&background=1DB954&color=fff`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </button>
            </header>
            </FadeInContainer>

            {/* Hero Grid - Featured */}
            <FadeInContainer delay={0.2}>
                <section>
                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {heroItems.map((item) => (
                        <HeroCard
                            key={item.id}
                            item={item}
                            onPlay={() => playItem(item, heroItems)}
                        />
                    ))}
                    </StaggerContainer>
                </section>
            </FadeInContainer>

            {/* Trending Section */}
            <FadeInContainer delay={0.3}>
                <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="text-green-500" size={24} />
                        Tendencias
                    </h2>
                    <button 
                        onClick={() => navigate('/search')}
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        Ver todo <ChevronRight size={16} />
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {trending.map((item) => (
                        <AlbumCard
                            key={item.id}
                            item={item}
                            onPlay={() => playItem(item, trending)}
                            onClick={() => {
                                if (item.artist?.id) {
                                    navigate(`/artist/${item.artist.id}`);
                                }
                            }}
                        />
                    ))}
                </div>
                </section>
            </FadeInContainer>

            {/* Recommended Section */}
            <FadeInContainer delay={0.4}>
                <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="text-green-500" size={24} />
                        Recomendado para ti
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {recommended.map((item) => (
                        <AlbumCard
                            key={item.id}
                            item={item}
                            onPlay={() => playItem(item, recommended)}
                            onClick={() => {
                                if (item.artist?.id) {
                                    navigate(`/artist/${item.artist.id}`);
                                }
                            }}
                        />
                    ))}
                </div>
                </section>
            </FadeInContainer>

            {/* Recently Played */}
            <FadeInContainer delay={0.5}>
                <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="text-green-500" size={24} />
                        Escuchado recientemente
                    </h2>
                </div>
                <div className="bg-white/5 rounded-lg p-6 text-center">
                    <Clock size={48} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">
                        Tus canciones recientes aparecerán aquí
                    </p>
                </div>
                </section>
            </FadeInContainer>
        </div>
    );
}

// Helper Components
function HeroCard({ item, onPlay }) {
    const [imageError, setImageError] = useState(false);
    
    return (
        <div
            onClick={onPlay}
            className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 hover:scale-105 transition-transform shadow-lg"
        >
            {!imageError ? (
                <img
                    src={item.image || item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-900 to-green-950">
                    <Sparkles size={48} className="text-green-500/30" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-1 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-300 line-clamp-1">{item.artist}</p>
                </div>
            </div>
            <div className="absolute top-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                <Play size={20} className="text-black ml-1" fill="currentColor" />
            </div>
        </div>
    );
}

function AlbumCard({ item, onPlay, onClick }) {
    const [imageError, setImageError] = useState(false);
    
    return (
        <div className="group cursor-pointer" onClick={onClick}>
            <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-gray-800 shadow-md">
                {!imageError ? (
                    <img
                        src={item.image || item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <Sparkles size={32} className="text-gray-600" />
                    </div>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay();
                    }}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110"
                >
                    <Play size={20} className="text-black ml-1" fill="currentColor" />
                </button>
            </div>
            <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-green-500 transition-colors">
                {item.title}
            </h3>
            <p className="text-xs text-gray-400 truncate">{item.artist}</p>
        </div>
    );
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
}
