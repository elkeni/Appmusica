import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Clock } from 'lucide-react';
import { getDeezerCharts, getDeezerGenres, searchDeezer } from '../services/hybridMusicService';
import { usePlayer } from '../context/PlayerContext';
import SongCard from './SongCard';

export default function BrowseView({ onToggleFavorite, favorites, onAddPlaylist }) {
    const navigate = useNavigate();
    const { playItem, history } = usePlayer();
    const [heroData, setHeroData] = useState(null);
    const [charts, setCharts] = useState([]);
    const [channels, setChannels] = useState([]); // Artists
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch Charts, Genres, and some Artists for "Channels"
                // We'll search for a generic term like "pop" to get some artists if no direct endpoint
                const [chartsData, genresData, artistsData] = await Promise.all([
                    getDeezerCharts(30),
                    getDeezerGenres(),
                    searchDeezer('top artists', 'artist', 10)
                ]);

                if (!isMounted) return;

                // 1. Pick Hero (Random from top 10)
                let hero = null;
                if (chartsData.length > 0) {
                    hero = chartsData[Math.floor(Math.random() * Math.min(10, chartsData.length))];
                    setHeroData(hero);
                }

                // 2. Deduplicate: Filter out Hero from Charts
                const filteredCharts = hero
                    ? chartsData.filter(track => track.id !== hero.id)
                    : chartsData;

                setCharts(filteredCharts);
                setGenres(genresData.filter(g => g.name !== 'All'));
                setChannels(artistsData);

            } catch (error) {
                console.error("Error loading browse data:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, []);

    // Gradient generator for genres
    const getGenreGradient = (index) => {
        const gradients = [
            'from-purple-600 to-blue-600',
            'from-red-500 to-orange-500',
            'from-green-500 to-emerald-700',
            'from-pink-500 to-rose-500',
            'from-yellow-400 to-orange-600',
            'from-indigo-500 to-purple-700',
            'from-cyan-500 to-blue-600',
            'from-teal-400 to-green-600'
        ];
        return gradients[index % gradients.length];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div id="browse-view-container" className="h-full overflow-y-auto custom-scrollbar pb-32 flex flex-col gap-12">

            {/* Section A: Cinematic Hero */}
            {heroData && (
                <section className="relative w-full aspect-video md:min-h-[50vh] shrink-0 group overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={heroData.artist?.picture_xl || heroData.coverBig || heroData.image}
                            alt={heroData.artist}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[3s]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/50 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/80 via-transparent to-transparent"></div>
                    </div>

                    <div className="absolute bottom-0 left-0 p-6 md:p-16 w-full md:w-2/3 z-10 flex flex-col justify-end h-full">
                        <div className="animate-fade-in-up">
                            <h2 className="text-xs md:text-sm font-bold tracking-widest text-purple-300 uppercase mb-2 md:mb-4 drop-shadow-md">
                                Destacado de Hoy
                            </h2>
                            <h1 className="text-3xl md:text-8xl font-black text-white mb-1 md:mb-2 leading-none drop-shadow-2xl tracking-tighter">
                                {heroData.title}
                            </h1>
                            <p className="text-lg md:text-3xl text-slate-200 mb-6 md:mb-10 font-bold drop-shadow-lg">
                                {heroData.artist}
                            </p>

                            <button
                                onClick={() => playItem(heroData, charts)}
                                className="px-6 py-3 md:px-10 md:py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-sm md:text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-2 md:gap-3 backdrop-blur-md border border-white/20 group-hover:shadow-purple-500/40"
                            >
                                <Play fill="currentColor" size={18} className="md:w-6 md:h-6" /> Reproducir Ahora
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Section B: Featured Channels (Artists) */}
            {channels.length > 0 && (
                <section className="px-6 md:px-12">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 tracking-tight">Canales Destacados</h2>
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 -mx-6 px-6 md:px-12 hide-scrollbar">
                        {channels.map((artist) => (
                            <div
                                key={artist.id}
                                className="flex flex-col items-center gap-2 md:gap-3 flex-none group cursor-pointer"
                                onClick={() => navigate(`/artist/${artist.id}`)}
                            >
                                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-orange-500 group-hover:scale-105 transition-transform duration-300">
                                    <div className="w-full h-full rounded-full border-4 border-[#0a0e1a] overflow-hidden">
                                        <img
                                            src={artist.picture_medium || artist.image}
                                            alt={artist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs md:text-sm font-semibold text-slate-300 group-hover:text-white transition-colors text-center truncate w-20 md:w-24">
                                    {artist.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Section C: History (Compact Slider) */}
            {history && history.length > 0 && (
                <section className="px-6 md:px-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center gap-2 mb-4 text-slate-400">
                        <Clock size={16} className="md:w-[18px]" />
                        <h2 className="text-base md:text-lg font-bold uppercase tracking-wider">Historial de Reproducción</h2>
                    </div>
                    <div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-6 px-6 md:px-12 hide-scrollbar">
                        {history.slice(0, 10).map((item, idx) => (
                            <div
                                key={`${item.id}-${idx}`}
                                className="flex-none w-24 md:w-32 group cursor-pointer"
                                onClick={() => playItem(item, history)}
                            >
                                <div className="aspect-square rounded-xl overflow-hidden mb-2 relative">
                                    <img src={item.cover || item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play fill="white" size={20} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-[10px] md:text-xs font-semibold text-slate-300 truncate">{item.title}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Section D: Featured Tracks */}
            <section className="px-6 md:px-12 flex flex-col gap-4 md:gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Featured Tracks</h2>
                    <button className="text-xs md:text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                        View All <ChevronRight size={16} />
                    </button>
                </div>

                <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 -mx-6 px-6 md:px-12 scroll-snap-x hide-scrollbar">
                    {charts.filter(Boolean).map((track) => (
                        <div key={track.id} className="flex-none w-36 md:w-56 scroll-snap-align-start">
                            <SongCard
                                item={track}
                                onPlay={(t) => playItem(t, charts)}
                                onFavorite={onToggleFavorite}
                                onAddPlaylist={onAddPlaylist}
                                isFavorite={favorites?.some(f => f?.id === track?.id)}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Section E: Moods & Genres (Gradient Grid) */}
            <section className="px-6 md:px-12 flex flex-col gap-6 md:gap-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Moods & Genres</h2>
                <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 md:gap-6">
                    {genres.map((genre, idx) => (
                        <div
                            key={genre.id}
                            className={`group relative h-24 md:aspect-[4/3] md:h-auto rounded-xl md:rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${getGenreGradient(idx)}`}
                        >
                            {/* Optional: Add subtle texture or pattern here */}
                            <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4">
                                <h3 className="text-lg md:text-2xl font-black text-white text-center drop-shadow-md transform group-hover:scale-110 transition-transform">
                                    {genre.name}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}


