import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Heart, MoreHorizontal, ArrowLeft, CheckCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../hooks/useMusic';
import { usePageTransition } from '../hooks/useAnimations';
import { LoadingSkeleton, FadeInContainer, SlideInContainer } from '../components/shared';

export default function Artist() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playItem } = usePlayer();
    const { isFavorite, toggleFavorite } = useAuth();
    const { getArtist, getArtistTopTracks } = useMusic();
    
    const [artist, setArtist] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    usePageTransition();

    useEffect(() => {
        loadArtist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadArtist = async () => {
        try {
            const artistData = await getArtist(id, 'deezer');
            const tracksData = await getArtistTopTracks(id, 'deezer', 10);
            
            setArtist(artistData);
            setTopTracks(tracksData);
        } catch (error) {
            console.error('Error loading artist:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <div className="h-[50vh] md:h-[60vh] bg-gray-900 animate-pulse" />
                <div className="px-6 md:px-12 py-8">
                    <LoadingSkeleton type="profile" count={1} />
                    <div className="mt-8 space-y-2">
                        <LoadingSkeleton type="row" count={10} />
                    </div>
                </div>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-gray-400 mb-4">Artista no encontrado</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen page-transition">
            {/* Parallax Header */}
            <FadeInContainer delay={0.1}>
                <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center scale-110"
                    style={{ 
                        backgroundImage: `url(${artist.pictureBig || artist.pictureXl || artist.image})`,
                        filter: 'blur(8px)'
                    }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
                
                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-6 md:p-12">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Artist Info */}
                    <div className="max-w-4xl">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle size={14} className="text-black" />
                            </span>
                            Artista Verificado
                        </p>
                        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
                            {artist.name}
                        </h1>
                        <p className="text-lg text-gray-300">
                            {artist.nbFan ? `${artist.nbFan.toLocaleString()} oyentes mensuales` : 'Artista popular'}
                        </p>
                    </div>
                </div>
                </div>
            </FadeInContainer>

            {/* Action Bar */}
            <SlideInContainer direction="down" delay={0.3}>
                <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => playItem(topTracks[0], topTracks)}
                        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                    >
                        <Play size={24} className="text-black ml-1" fill="currentColor" />
                    </button>
                    
                    <button
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`px-8 py-3 rounded-full font-semibold transition-all ${
                            isFollowing
                                ? 'bg-transparent border-2 border-white/20 hover:border-white/40'
                                : 'bg-transparent border-2 border-white hover:border-white/80'
                        }`}
                    >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </button>

                    <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
                </div>
            </SlideInContainer>

            {/* Top Tracks */}
            <FadeInContainer delay={0.4}>
                <div className="px-6 md:px-12 py-8">
                <h2 className="text-2xl font-bold mb-6">Populares</h2>
                <div className="space-y-1">
                    {topTracks.map((track, index) => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            index={index}
                            onPlay={() => playItem(track, topTracks)}
                            isFavorite={isFavorite(track)}
                            onToggleFavorite={() => toggleFavorite(track)}
                        />
                    ))}
                </div>
                </div>
            </FadeInContainer>
        </div>
    );
}

function TrackRow({ track, index, onPlay, isFavorite, onToggleFavorite }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onPlay}
            className="group grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-4 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
            {/* Index/Play Button */}
            <div className="w-8 text-center">
                {isHovered ? (
                    <Play size={16} className="text-white" fill="currentColor" />
                ) : (
                    <span className="text-gray-400 font-medium">{index + 1}</span>
                )}
            </div>

            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0">
                <img
                    src={track.image || track.album?.cover}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                />
                <div className="min-w-0">
                    <p className="font-semibold truncate group-hover:text-green-500 transition-colors">
                        {track.title}
                    </p>
                    {track.explicit && (
                        <span className="inline-block text-[10px] bg-gray-700 text-gray-300 px-1 rounded mr-1">E</span>
                    )}
                </div>
            </div>

            {/* Album (Desktop Only) */}
            <div className="hidden md:block text-sm text-gray-400 truncate">
                {track.album?.title || ''}
            </div>

            {/* Duration (Desktop Only) */}
            <div className="hidden md:block text-sm text-gray-400 tabular-nums">
                {formatDuration(track.duration)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite();
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        isFavorite ? 'text-green-500' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <MoreHorizontal size={20} className="text-gray-400 hover:text-white" />
                </button>
            </div>
        </div>
    );
}

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
