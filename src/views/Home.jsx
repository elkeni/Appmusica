import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, TrendingUp, Clock, Search, ChevronDown } from 'lucide-react';
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
    
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [trending, setTrending] = useState([]);
    const [topPlaylists, setTopPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadContent = async () => {
        try {
            const trendingData = await getTrending(30);
            
            setRecentlyPlayed(trendingData.slice(0, 6));
            setTrending(trendingData.slice(6, 16));
            setTopPlaylists(trendingData.slice(16, 22));
        } catch (error) {
            console.error('Error loading home content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1d2e]">
                <Header user={user} navigate={navigate} />
                <div className="px-6 md:px-12 py-6 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <LoadingSkeleton type="card" count={6} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1d2e]">
            {/* Header with Search and Profile */}
            <Header user={user} navigate={navigate} />

            <div className="px-4 md:px-12 py-4 md:py-6 space-y-8 md:space-y-10">
                {/* Recently Plays Section */}
                <FadeInContainer delay={0.1}>
                    <section>
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h2 className="text-xl md:text-[28px] font-bold text-white">
                                Recently plays
                            </h2>
                            <button 
                                onClick={() => navigate('/library')}
                                className="text-xs md:text-sm text-[#4f9cf9] hover:text-white transition-colors flex items-center gap-1 font-medium"
                            >
                                See all <ChevronRight size={14} />
                            </button>
                        </div>
                        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
                            {recentlyPlayed.map((item) => (
                                <AlbumCard
                                    key={item.id}
                                    item={item}
                                    onPlay={() => playItem(item, recentlyPlayed)}
                                />
                            ))}
                        </StaggerContainer>
                    </section>
                </FadeInContainer>

                {/* Trending Section */}
                <FadeInContainer delay={0.2}>
                    <section>
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h2 className="text-xl md:text-[28px] font-bold text-white flex items-center gap-2 md:gap-3">
                                <TrendingUp className="text-[#4f9cf9]" size={22} />
                                Trending
                            </h2>
                            <button 
                                onClick={() => navigate('/search')}
                                className="text-xs md:text-sm text-[#4f9cf9] hover:text-white transition-colors flex items-center gap-1 font-medium"
                            >
                                See all <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="space-y-1 md:space-y-2 bg-[#1e2139]/30 rounded-2xl p-2 md:p-0 md:bg-transparent">
                            {trending.slice(0, 5).map((item, index) => (
                                <SongItem
                                    key={item.id}
                                    item={item}
                                    index={index + 1}
                                    onPlay={() => playItem(item, trending)}
                                />
                            ))}
                            {/* Show more button on mobile */}
                            <button 
                                onClick={() => navigate('/search')}
                                className="w-full py-3 text-center text-sm text-[#4f9cf9] font-medium md:hidden"
                            >
                                View all trending →
                            </button>
                            {/* Show rest on desktop */}
                            <div className="hidden md:block">
                                {trending.slice(5).map((item, index) => (
                                    <SongItem
                                        key={item.id}
                                        item={item}
                                        index={index + 6}
                                        onPlay={() => playItem(item, trending)}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </FadeInContainer>

                {/* Top Playlists Section */}
                <FadeInContainer delay={0.3}>
                    <section className="pb-24 md:pb-8">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h2 className="text-xl md:text-[28px] font-bold text-white">
                                Top playlists for you
                            </h2>
                            <button 
                                onClick={() => navigate('/library')}
                                className="text-xs md:text-sm text-[#4f9cf9] hover:text-white transition-colors flex items-center gap-1 font-medium"
                            >
                                See all <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                            {topPlaylists.map((item, index) => (
                                <PlaylistCard
                                    key={item.id}
                                    item={item}
                                    songCount={Math.floor(Math.random() * 20) + 10}
                                    duration={`${Math.floor(Math.random() * 2) + 1}hr ${Math.floor(Math.random() * 50) + 10}min`}
                                    onPlay={() => playItem(item, topPlaylists)}
                                />
                            ))}
                        </div>
                    </section>
                </FadeInContainer>
            </div>
        </div>
    );
}

// Header Component with Search and Profile
function Header({ user, navigate }) {
    return (
        <header className="sticky top-0 z-30 bg-[#1a1d2e]/90 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center justify-between px-4 md:px-12 h-16 md:h-20">
                {/* Mobile: Logo/Title */}
                <div className="md:hidden">
                    <h1 className="text-lg font-bold text-white">Echo Music</h1>
                </div>
                
                {/* Search Bar - Hidden on mobile, visible on desktop */}
                <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto">
                    <div className="w-full bg-[#1e2139]/60 rounded-3xl px-5 py-3 flex items-center gap-3 border border-transparent focus-within:border-[#4f9cf9]/30 transition-all">
                        <Search size={18} className="text-[#b4b8c5]" />
                        <input
                            type="text"
                            placeholder="Search tracks, albums, artists..."
                            className="bg-transparent border-none outline-none text-white text-sm flex-1 placeholder:text-[#b4b8c5]"
                            onFocus={() => navigate('/search')}
                        />
                    </div>
                </div>
                
                {/* Mobile: Search Icon */}
                <button
                    onClick={() => navigate('/search')}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[#1e2139]/60 text-[#b4b8c5] active:scale-95 transition-transform"
                >
                    <Search size={20} />
                </button>

                {/* User Profile */}
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 md:gap-3 bg-[#1e2139]/80 rounded-full md:rounded-3xl p-1.5 md:px-3 md:py-2 hover:bg-[#1e2139] transition-colors ml-2 md:ml-4"
                >
                    <img
                        src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'Taylor')}&background=4f9cf9&color=fff`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-[#4f9cf9]/20"
                    />
                    <span className="text-sm font-medium text-white hidden md:block">
                        {user?.displayName || user?.email?.split('@')[0] || 'Taylor'}
                    </span>
                    <ChevronDown size={16} className="text-[#b4b8c5] hidden md:block" />
                </button>
            </div>
        </header>
    );
}

// Album Card Component
function AlbumCard({ item, onPlay }) {
    const [imageError, setImageError] = useState(false);
    
    return (
        <div
            onClick={onPlay}
            className="group cursor-pointer active:scale-95 transition-transform"
        >
            <div className="relative aspect-square rounded-xl md:rounded-xl overflow-hidden mb-2 md:mb-3 bg-[#1e2139] shadow-lg hover:shadow-xl transition-all duration-300 md:group-hover:scale-105">
                {!imageError ? (
                    <img
                        src={item.image || item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e2139] to-[#0f1117]">
                        <Clock size={28} className="text-[#4f9cf9]/30" />
                    </div>
                )}
                {/* Play button - Always visible on mobile, hover on desktop */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay();
                    }}
                    className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-9 h-9 md:w-11 md:h-11 bg-[#4f9cf9] rounded-full flex items-center justify-center opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-xl hover:scale-110 hover:bg-[#3d8ae6] active:scale-95"
                >
                    <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                </button>
            </div>
            <h3 className="font-semibold text-xs md:text-sm text-white mb-0.5 md:mb-1 truncate group-hover:text-[#4f9cf9] transition-colors">
                {item.title}
            </h3>
            <p className="text-xs text-[#b4b8c5] truncate">{item.artist}</p>
        </div>
    );
}

// Song Item Component for Trending
function SongItem({ item, index, onPlay }) {
    const [imageError, setImageError] = useState(false);
    
    return (
        <div
            onClick={onPlay}
            className="group flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl hover:bg-[#4f9cf9]/5 active:bg-[#4f9cf9]/10 transition-colors cursor-pointer"
        >
            {/* Thumbnail */}
            <div className="relative w-12 h-12 md:w-[60px] md:h-[60px] rounded-lg overflow-hidden flex-shrink-0 bg-[#1e2139]">
                {!imageError ? (
                    <img
                        src={item.image || item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Clock size={18} className="text-[#4f9cf9]/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={18} className="text-white" fill="currentColor" />
                </div>
            </div>

            {/* Title and Artist */}
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm truncate group-hover:text-[#4f9cf9] transition-colors">
                    {item.title}
                </h4>
                <p className="text-xs text-[#b4b8c5] truncate">{item.artist}</p>
            </div>

            {/* Duration - Hidden on mobile to save space */}
            <span className="hidden md:block text-sm text-[#b4b8c5] tabular-nums">
                {item.duration || '3:45'}
            </span>
            
            {/* Mobile play indicator */}
            <div className="md:hidden w-8 h-8 rounded-full bg-[#1e2139] flex items-center justify-center group-active:bg-[#4f9cf9]/20">
                <Play size={14} className="text-[#4f9cf9] ml-0.5" fill="currentColor" />
            </div>
        </div>
    );
}

// Playlist Card Component
function PlaylistCard({ item, songCount, duration, onPlay }) {
    const [imageError, setImageError] = useState(false);
    
    return (
        <div
            onClick={onPlay}
            className="group cursor-pointer active:scale-[0.98] transition-transform"
        >
            <div className="relative aspect-[16/10] md:aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-4 bg-[#1e2139] shadow-lg hover:shadow-xl transition-all duration-300">
                {!imageError ? (
                    <img
                        src={item.image || item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e2139] to-[#0f1117]">
                        <Clock size={40} className="text-[#4f9cf9]/30" />
                    </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Play button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay();
                    }}
                    className="absolute bottom-3 right-3 md:bottom-4 md:right-4 w-10 h-10 md:w-12 md:h-12 bg-[#4f9cf9] rounded-full flex items-center justify-center shadow-xl hover:scale-110 hover:bg-[#3d8ae6] active:scale-95 transition-all"
                >
                    <Play size={18} className="text-white ml-0.5" fill="currentColor" />
                </button>
                
                {/* Title overlay on mobile */}
                <div className="absolute bottom-3 left-3 right-16 md:hidden">
                    <h3 className="font-semibold text-sm text-white truncate">{item.title}</h3>
                    <p className="text-xs text-white/70">{songCount} songs</p>
                </div>
            </div>
            {/* Desktop title below image */}
            <div className="hidden md:block">
                <h3 className="font-semibold text-base text-white mb-1 truncate group-hover:text-[#4f9cf9] transition-colors">
                    {item.title}
                </h3>
                <p className="text-sm text-[#667085]">{songCount} songs, {duration}</p>
            </div>
        </div>
    );
}
