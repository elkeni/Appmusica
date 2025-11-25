import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, TrendingUp, Clock, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useMusic } from '../hooks/useMusic';
import { usePageTransition } from '../hooks/useAnimations';
import { LoadingSkeleton, FadeInContainer, SlideInContainer, StaggerContainer } from '../components/shared';

export default function SearchView() {
    const navigate = useNavigate();
    const { playItem } = usePlayer();
    const { search: searchMusic, getTrending } = useMusic();
    
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [trendingSearches, setTrendingSearches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    
    usePageTransition();

    useEffect(() => {
        // Load recent searches from localStorage
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }

        // Load trending
        loadTrending();

        // Focus input on mount
        inputRef.current?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadTrending = async () => {
        try {
            const trending = await getTrending(10);
            setTrendingSearches(trending);
        } catch (error) {
            console.error('Error loading trending:', error);
        }
    };

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const searchResults = await searchMusic(searchQuery, 20);
            setResults(searchResults);

            // Save to recent searches
            const updated = [
                searchQuery,
                ...recentSearches.filter(s => s !== searchQuery)
            ].slice(0, 10);
            setRecentSearches(updated);
            localStorage.setItem('recentSearches', JSON.stringify(updated));
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Debounce search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(value);
        }, 500);
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
        inputRef.current?.focus();
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    return (
        <div className="min-h-screen p-6 md:p-8 bg-[#1a1d2e]">
            <div className="max-w-6xl mx-auto">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <SearchIcon 
                            size={20} 
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b4b8c5]" 
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search tracks, albums, artists..."
                            className="w-full h-14 pl-12 pr-12 bg-[#1e2139]/60 backdrop-blur-xl rounded-full border-2 border-transparent focus:border-[#4f9cf9] focus:outline-none text-white placeholder-[#b4b8c5] transition-all"
                        />
                        {query && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b4b8c5] hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <LoadingSkeleton type="row" count={8} />
                )}

                {/* Search Results */}
                {hasSearched && !loading && (
                    <FadeInContainer delay={0.1}>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">
                            {results.length > 0 ? `${results.length} results` : 'No results'}
                        </h2>
                        <StaggerContainer staggerDelay={0.05}>
                        <div className="grid grid-cols-1 gap-2">
                            {results.map((track) => (
                                <SearchResultItem
                                    key={track.id}
                                    track={track}
                                    onPlay={() => playItem(track, results)}
                                    onArtistClick={() => {
                                        if (track.artist?.id) {
                                            navigate(`/artist/${track.artist.id}`);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                        </StaggerContainer>
                    </div>
                    </FadeInContainer>
                )}

                {/* Recent Searches */}
                {!hasSearched && recentSearches.length > 0 && (
                    <SlideInContainer direction="up" delay={0.2}>
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                                <Clock size={20} className="text-[#4f9cf9]" />
                                Recent Searches
                            </h2>
                            <button
                                onClick={clearRecentSearches}
                                className="text-sm text-[#b4b8c5] hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setQuery(search);
                                        handleSearch(search);
                                    }}
                                    className="px-4 py-2 bg-[#1e2139] hover:bg-[#4f9cf9]/10 rounded-full text-sm transition-colors text-[#b4b8c5] hover:text-white"
                                >
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>
                    </SlideInContainer>
                )}

                {/* Trending */}
                {!hasSearched && trendingSearches.length > 0 && (
                    <FadeInContainer delay={0.3}>
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                            <TrendingUp size={20} className="text-[#4f9cf9]" />
                            Trending
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {trendingSearches.map((track) => (
                                <TrendingCard
                                    key={track.id}
                                    track={track}
                                    onPlay={() => playItem(track, trendingSearches)}
                                    onClick={() => {
                                        if (track.artist?.id) {
                                            navigate(`/artist/${track.artist.id}`);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    </FadeInContainer>
                )}
            </div>
        </div>
    );
}

function SearchResultItem({ track, onPlay, onArtistClick }) {
    return (
        <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-[#4f9cf9]/5 transition-colors cursor-pointer">
            <button
                onClick={onPlay}
                className="relative flex-shrink-0"
            >
                <img
                    src={track.image || track.cover}
                    alt={track.title}
                    className="w-14 h-14 rounded object-cover bg-[#1e2139]"
                    onError={(e) => e.target.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                    <Play size={20} className="text-white" fill="currentColor" />
                </div>
            </button>
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-white group-hover:text-[#4f9cf9] transition-colors">{track.title}</p>
                <button
                    onClick={onArtistClick}
                    className="text-sm text-[#b4b8c5] hover:text-white hover:underline transition-colors truncate block"
                >
                    {track.artist}
                </button>
            </div>
            <div className="text-sm text-[#b4b8c5] tabular-nums">
                {formatDuration(track.duration)}
            </div>
        </div>
    );
}

function TrendingCard({ track, onPlay, onClick }) {
    return (
        <div className="group cursor-pointer" onClick={onClick}>
            <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-[#1e2139] shadow-md">
                <img
                    src={track.image || track.cover}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => e.target.style.display = 'none'}
                />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay();
                    }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-[#4f9cf9] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 hover:bg-[#3d8ae6]"
                >
                    <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                </button>
            </div>
            <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-[#4f9cf9] transition-colors text-white">
                {track.title}
            </h3>
            <p className="text-xs text-[#b4b8c5] truncate">{track.artist}</p>
        </div>
    );
}

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
