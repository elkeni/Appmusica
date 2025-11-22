import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronDown, MoreHorizontal, Quote, ListMusic, Shuffle, Repeat, Heart, PlusCircle, User } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { extractPaletteFromImage } from '../utils/colorUtils';
import { getItemId } from '../utils/formatUtils';
import PlaybackModeToggle from './PlaybackModeToggle';

export default function MobileFullScreenPlayer({ onClose, favorites, toggleFavorite, togglePlaylist, playlist }) {
    const { currentTrack, isPlaying, togglePlayPause, nextTrack, prevTrack, currentTime, duration, playbackMode, setPlaybackMode } = usePlayer();
    const [colors, setColors] = useState({ primary: '#1a1a1a', secondary: '#000000' });
    const [activeView, setActiveView] = useState('artwork'); // 'artwork', 'lyrics', 'queue'
    const [showMenu, setShowMenu] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragY, setDragY] = useState(0);
    // (render guard moved below so hooks run unconditionally)

    const isFavorite = Array.isArray(favorites) && favorites.some(f => getItemId(f) === getItemId(currentTrack));

    // Extract colors for dynamic background (defensive)
    useEffect(() => {
        let cancelled = false;
        const applyPalette = async () => {
            try {
                if (!currentTrack?.image || !extractPaletteFromImage) return;
                const palette = await extractPaletteFromImage(currentTrack.image);
                if (cancelled) return;
                if (palette && typeof palette === 'object') setColors(palette);
            } catch (err) {
                console.error('Palette extraction failed:', err?.message || err);
            }
        };
        applyPalette();
        return () => { cancelled = true; };
    }, [currentTrack?.image]);

    const handleDragStart = (e) => {
        setIsDragging(true);
        setDragY(e.touches ? e.touches[0].clientY : e.clientY);
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        const currentY = e.touches ? e.touches[0].clientY : e.clientY;
        const delta = currentY - dragY;
        if (delta > 100) {
            onClose();
            setIsDragging(false);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const formatTime = (time) => {
        if (!time) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    // If there's no track to show, render nothing (after hooks)
    if (!currentTrack) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col bg-black text-white overflow-hidden"
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
        >
            {/* Dynamic Background */}
            <div
                className="absolute inset-0 transition-colors duration-1000 ease-in-out opacity-60"
                style={{
                    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
                }}
            />
            <div className="absolute inset-0 backdrop-blur-[60px] bg-black/30" />

            {/* Header */}
            <div className="relative z-10 flex flex-col items-center pt-2 pb-4 px-6">
                <div className="w-10 h-1 bg-white/20 rounded-full mb-6" />
                <button
                    onClick={onClose}
                    className="absolute left-6 top-6 text-white/70 hover:text-white z-50"
                >
                    <ChevronDown size={28} />
                </button>
                <div className="text-center px-10">
                    <p className="text-xs font-bold tracking-widest uppercase text-white/50">Reproduciendo</p>
                    <p className="text-sm font-bold text-white truncate">{currentTrack.originalData?.album?.title || 'Single'}</p>
                </div>
                <button
                    onClick={() => setShowMenu(true)}
                    className="absolute right-6 top-6 text-white/70 hover:text-white z-50"
                >
                    <MoreHorizontal size={28} />
                </button>
            </div>

            {/* Playback Mode Toggle */}
            <div className="relative z-10 flex justify-center mb-4">
                <PlaybackModeToggle
                    mode={playbackMode}
                    onModeChange={(mode) => setPlaybackMode(mode)}
                />
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 flex flex-col px-8 pb-safe overflow-hidden">

                {/* Views: Artwork / Lyrics / Queue */}
                <div className="flex-1 relative mb-6">
                    {/* Audio Mode: Artwork View */}
                    {playbackMode === 'audio' && (
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${activeView === 'artwork' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <div
                                className={`relative w-full aspect-square max-h-[350px] rounded-2xl shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isPlaying ? 'scale-100 shadow-purple-500/20' : 'scale-[0.85] opacity-90'}`}
                            >
                                <img
                                    src={currentTrack.image || currentTrack.cover || currentTrack.coverBig || 'https://placehold.co/600x600'}
                                    alt={currentTrack.title || 'Cover'}
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            </div>
                        </div>
                    )}

                    {/* Video Mode: YouTube Player */}
                    {playbackMode === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full aspect-video max-h-[350px] rounded-2xl shadow-2xl overflow-hidden bg-black">
                                {/* YouTube iframe is managed by PlayerContext */}
                                <div className="w-full h-full flex items-center justify-center text-white">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-400 mb-2">Modo Video</p>
                                        <p className="text-xs text-gray-500">El reproductor de YouTube está activo en segundo plano</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lyrics View */}
                    <div className={`absolute inset-0 overflow-y-auto custom-scrollbar transition-opacity duration-500 ${activeView === 'lyrics' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        <div className="text-center py-10 px-4">
                            <h3 className="text-2xl font-bold mb-8 text-white">Letra</h3>
                            <p className="text-xl leading-loose text-white/80 font-medium">
                                Letra no disponible por el momento.<br />
                                (Integración de API pendiente)
                            </p>
                        </div>
                    </div>

                    {/* Queue View */}
                    <div className={`absolute inset-0 overflow-y-auto custom-scrollbar transition-opacity duration-500 ${activeView === 'queue' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        <div className="py-4">
                            <h3 className="text-xl font-bold mb-6 text-white sticky top-0 bg-black/50 backdrop-blur-md p-4 rounded-xl z-20">A continuación</h3>
                            {/* Current */}
                            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl mb-4 border border-white/10">
                                <img src={currentTrack.image || currentTrack.cover || currentTrack.coverBig || 'https://placehold.co/64x64'} className="w-12 h-12 rounded-lg" alt={currentTrack.title || 'Cover'} />
                                <div>
                                    <p className="font-bold text-white text-sm">{currentTrack.title}</p>
                                    <p className="text-xs text-white/60">{currentTrack.artist}</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                                </div>
                            </div>
                            {/* Queue List */}
                            {/* Ideally map queue from context here */}
                            <p className="text-center text-white/40 mt-10">No hay más canciones en la cola</p>
                        </div>
                    </div>
                </div>

                {/* Track Info */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="overflow-hidden">
                            <h2 className="text-2xl font-bold text-white truncate leading-tight">
                                {currentTrack.title}
                            </h2>
                        </div>
                        <p className="text-lg text-white/60 truncate font-medium mt-1">
                            {currentTrack.originalData?.artist || currentTrack.artist || 'Unknown Artist'}
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(currentTrack.originalData || currentTrack);
                        }}
                        className={`p-3 rounded-full transition-all ${isFavorite ? 'text-green-500 bg-green-500/10 scale-110' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                    >
                        <Heart size={28} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6 group">
                    <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer group-hover:h-2 transition-all">
                        <div
                            className="absolute top-0 left-0 h-full bg-white rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium text-white/50">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <button className="text-white/40 hover:text-white transition-colors p-2">
                        <Shuffle size={24} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); prevTrack(); }}
                        className="text-white hover:scale-110 transition-transform p-2"
                    >
                        <SkipBack size={36} fill="currentColor" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                        className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform shadow-xl z-50"
                    >
                        {isPlaying ? (
                            <Pause size={32} fill="currentColor" />
                        ) : (
                            <Play size={32} fill="currentColor" className="ml-1" />
                        )}
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); nextTrack(); }}
                        className="text-white hover:scale-110 transition-transform p-2"
                    >
                        <SkipForward size={36} fill="currentColor" />
                    </button>

                    <button className="text-white/40 hover:text-white transition-colors p-2">
                        <Repeat size={24} />
                    </button>
                </div>

                {/* View Toggles */}
                <div className="flex items-center justify-center gap-6 pb-2">
                    <button
                        onClick={() => setActiveView(activeView === 'lyrics' ? 'artwork' : 'lyrics')}
                        className={`p-3 rounded-xl transition-all ${activeView === 'lyrics' ? 'bg-white/20 text-white scale-110' : 'text-white/40 hover:text-white'}`}
                    >
                        <Quote size={22} />
                    </button>
                    <button
                        onClick={() => setActiveView(activeView === 'queue' ? 'artwork' : 'queue')}
                        className={`p-3 rounded-xl transition-all ${activeView === 'queue' ? 'bg-white/20 text-white scale-110' : 'text-white/40 hover:text-white'}`}
                    >
                        <ListMusic size={22} />
                    </button>
                </div>
            </div>

            {/* Bottom Sheet Menu */}
            {showMenu && (
                <>
                    <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowMenu(false)} />
                    <div className="absolute bottom-0 left-0 right-0 z-[70] bg-[#121212] rounded-t-3xl border-t border-white/10 p-6 animate-slide-up pb-safe">
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />

                        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                            <img src={currentTrack.image || currentTrack.cover || currentTrack.coverBig || 'https://placehold.co/64x64'} alt={currentTrack.title || 'Cover'} className="w-16 h-16 rounded-lg shadow-lg" />
                            <div>
                                <p className="font-bold text-white text-lg line-clamp-1">{currentTrack.title || 'Título desconocido'}</p>
                                <p className="text-white/60">{currentTrack.artist || 'Artista desconocido'}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    toggleFavorite(currentTrack.originalData || currentTrack);
                                    setShowMenu(false);
                                }}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white font-medium"
                            >
                                <Heart size={24} className={isFavorite ? "text-green-500 fill-green-500" : "text-white"} />
                                {isFavorite ? 'Eliminar de Me Gusta' : 'Añadir a Me Gusta'}
                            </button>

                            <button
                                onClick={() => {
                                    togglePlaylist(currentTrack.originalData || currentTrack);
                                    setShowMenu(false);
                                }}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white font-medium"
                            >
                                <PlusCircle size={24} />
                                Añadir a Playlist
                            </button>

                            <button
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white font-medium"
                            >
                                <User size={24} />
                                Ver Artista
                            </button>
                        </div>

                        <button
                            onClick={() => setShowMenu(false)}
                            className="w-full mt-6 py-4 rounded-full bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
