import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronDown, MoreHorizontal, Quote, ListMusic, Shuffle, Repeat, Heart, PlusCircle, User, Music, Monitor } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { extractPaletteFromImage } from '../utils/colorUtils';
import { getItemId } from '../utils/formatUtils';
import { getSyncedLyrics } from '../services/lyricsService';
import PlaybackModeToggle from './PlaybackModeToggle';
import LyricsView from './LyricsView';

export default function MobileFullScreenPlayer({ onClose, favorites, toggleFavorite, togglePlaylist, playlist }) {
    const { currentTrack, isPlaying, togglePlayPause, nextTrack, prevTrack, currentTime, duration, playbackMode, setPlaybackMode, queue } = usePlayer();
    const [colors, setColors] = useState({ primary: '#1a1a1a', secondary: '#000000' });
    const [activeView, setActiveView] = useState('artwork'); // 'artwork', 'lyrics', 'queue'
    const [showMenu, setShowMenu] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [lyrics, setLyrics] = useState([]);
    const [lyricsLoading, setLyricsLoading] = useState(false);
    const [lyricsError, setLyricsError] = useState(null);
    const [isInstrumental, setIsInstrumental] = useState(false);

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

    // Fetch lyrics when track changes
    useEffect(() => {
        let cancelled = false;
        const fetchLyrics = async () => {
            if (!currentTrack || !currentTrack.title) {
                setLyrics([]);
                return;
            }

            setLyricsLoading(true);
            setLyricsError(null);
            setIsInstrumental(false);

            try {
                const result = await getSyncedLyrics(
                    currentTrack.title,
                    currentTrack.artist || currentTrack.originalData?.artist,
                    duration
                );

                if (cancelled) return;

                if (result.isInstrumental) {
                    setIsInstrumental(true);
                    setLyrics([]);
                } else if (result.lyrics && result.lyrics.length > 0) {
                    setLyrics(result.lyrics);
                } else {
                    setLyricsError(result.error || 'No lyrics found');
                    setLyrics([]);
                }
            } catch (err) {
                if (!cancelled) {
                    setLyricsError(err.message || 'Failed to load lyrics');
                    setLyrics([]);
                }
            } finally {
                if (!cancelled) {
                    setLyricsLoading(false);
                }
            }
        };

        fetchLyrics();
        return () => { cancelled = true; };
    }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist, duration]);

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
        <div className="fixed inset-0 z-50 flex bg-black text-white overflow-hidden">
            {/* Dynamic Background - Animated Gradient Mesh */}
            <div
                className="absolute inset-0 transition-colors duration-1000 ease-in-out"
                style={{
                    background: `
                        radial-gradient(circle at 20% 50%, ${colors.primary}40 0%, transparent 50%),
                        radial-gradient(circle at 80% 50%, ${colors.secondary}40 0%, transparent 50%),
                        radial-gradient(circle at 50% 80%, ${colors.primary}20 0%, transparent 70%),
                        linear-gradient(180deg, #000000 0%, #0a0a0a 100%)
                    `
                }}
            />
            <div className="absolute inset-0 backdrop-blur-[80px] bg-black/40" />

            {/* MOBILE LAYOUT (< md) */}
            <div 
                className="relative z-10 w-full flex flex-col md:hidden"
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >

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
                    <div className={`absolute inset-0 transition-opacity duration-500 ${activeView === 'lyrics' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        {isInstrumental ? (
                            <div className="flex flex-col items-center justify-center h-full text-white/60">
                                <Music size={64} className="mb-4 opacity-30" />
                                <p className="text-xl font-semibold">Instrumental</p>
                                <p className="text-sm mt-2">Esta canción no tiene letra</p>
                            </div>
                        ) : (
                            <LyricsView
                                lyrics={lyrics}
                                currentTime={currentTime}
                                isLoading={lyricsLoading}
                                error={lyricsError}
                            />
                        )}
                    </div>

                    {/* Queue View */}
                    <div className={`absolute inset-0 overflow-y-auto custom-scrollbar transition-opacity duration-500 ${activeView === 'queue' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        <div className="py-4 px-2">
                            <h3 className="text-xl font-bold mb-6 text-white sticky top-0 bg-black/50 backdrop-blur-md p-4 rounded-xl z-20">A continuación</h3>
                            
                            {/* Current */}
                            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl mb-4 border border-white/10">
                                <img 
                                    src={currentTrack.image || currentTrack.cover || currentTrack.coverBig || 'https://placehold.co/64x64'} 
                                    className="w-12 h-12 rounded-lg" 
                                    alt={currentTrack.title || 'Cover'} 
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-sm truncate">{currentTrack.title}</p>
                                    <p className="text-xs text-white/60 truncate">{currentTrack.artist}</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                                </div>
                            </div>
                            
                            {/* Queue List */}
                            {queue && queue.length > 0 ? (
                                <div className="space-y-2">
                                    {queue.map((track, index) => (
                                        <div 
                                            key={`queue-${index}-${track.id || track.videoId}`}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                        >
                                            <span className="text-white/40 text-sm font-mono w-6">{index + 1}</span>
                                            <img 
                                                src={track.image || track.cover || track.coverBig || 'https://placehold.co/48x48'} 
                                                className="w-10 h-10 rounded-lg" 
                                                alt={track.title || 'Cover'} 
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white text-sm truncate group-hover:text-purple-300 transition-colors">
                                                    {track.title}
                                                </p>
                                                <p className="text-xs text-white/50 truncate">{track.artist}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <ListMusic size={48} className="mx-auto mb-4 text-white/20" />
                                    <p className="text-white/40">No hay más canciones en la cola</p>
                                    <p className="text-xs text-white/30 mt-2">Las siguientes canciones aparecerán aquí</p>
                                </div>
                            )}
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

            {/* DESKTOP LAYOUT (≥ md) - Split Screen */}
            <div className="hidden md:flex relative z-10 w-full h-full">
                {/* Header Bar - Desktop */}
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-all text-white"
                    >
                        <ChevronDown size={24} />
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <PlaybackModeToggle
                            mode={playbackMode}
                            onModeChange={(mode) => setPlaybackMode(mode)}
                        />
                        <button
                            onClick={() => setShowMenu(true)}
                            className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-all text-white"
                        >
                            <MoreHorizontal size={24} />
                        </button>
                    </div>
                </div>

                {/* LEFT COLUMN: Album Art + Song Info + Controls */}
                <div className="flex-[45%] flex flex-col items-center justify-center p-16">
                    {/* Album Art */}
                    <div className="w-full max-w-[500px] mb-10">
                        {playbackMode === 'audio' ? (
                            <div
                                className={`relative w-full aspect-square rounded-3xl shadow-2xl transition-all duration-700 ${
                                    isPlaying ? 'scale-100 shadow-purple-500/30' : 'scale-[0.95] opacity-90'
                                }`}
                            >
                                <img
                                    src={currentTrack.image || currentTrack.cover || currentTrack.coverBig || 'https://placehold.co/600x600'}
                                    alt={currentTrack.title || 'Cover'}
                                    className="w-full h-full object-cover rounded-3xl"
                                />
                            </div>
                        ) : (
                            <div className="relative w-full aspect-video rounded-2xl shadow-2xl overflow-hidden bg-black">
                                <div className="w-full h-full flex items-center justify-center text-white">
                                    <div className="text-center">
                                        <Monitor size={64} className="mx-auto mb-4 opacity-30" />
                                        <p className="text-sm text-gray-400 mb-2">Modo Video</p>
                                        <p className="text-xs text-gray-500">El reproductor de YouTube está activo</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Song Info */}
                    <div className="w-full max-w-[500px] text-center mb-10">
                        <h1 className="text-4xl font-bold text-white mb-3 line-clamp-2 drop-shadow-lg">
                            {currentTrack.title}
                        </h1>
                        <p className="text-2xl text-white/80 font-medium drop-shadow-md">
                            {currentTrack.originalData?.artist || currentTrack.artist || 'Unknown Artist'}
                        </p>
                        <p className="text-sm text-white/50 mt-2">
                            {currentTrack.originalData?.album?.title || 'Single'}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-[500px] mb-8 group">
                        <div className="relative h-2 bg-white/10 rounded-full overflow-visible cursor-pointer group-hover:h-2.5 transition-all">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            />
                            {/* Hover Thumb */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100"
                                style={{ 
                                    left: `${progressPercent}%`, 
                                    transform: 'translate(-50%, -50%)',
                                    boxShadow: '0 0 12px rgba(168, 85, 247, 0.8)'
                                }}
                            />
                        </div>
                        <div className="flex justify-between mt-3 text-sm font-medium text-white/60 tabular-nums">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6 mb-4">
                        <button className="text-white/40 hover:text-white transition-all hover:scale-110 p-2">
                            <Shuffle size={24} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); prevTrack(); }}
                            className="text-white hover:scale-110 transition-transform p-2"
                        >
                            <SkipBack size={32} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                            className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform shadow-2xl"
                        >
                            {isPlaying ? (
                                <Pause size={28} fill="currentColor" />
                            ) : (
                                <Play size={28} fill="currentColor" className="ml-1" />
                            )}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); nextTrack(); }}
                            className="text-white hover:scale-110 transition-transform p-2"
                        >
                            <SkipForward size={32} />
                        </button>

                        <button className="text-white/40 hover:text-white transition-all hover:scale-110 p-2">
                            <Repeat size={24} />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-5">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(currentTrack.originalData || currentTrack);
                            }}
                            className={`p-3.5 rounded-full transition-all hover:scale-110 ${
                                isFavorite
                                    ? 'text-purple-400 bg-purple-400/20 shadow-lg shadow-purple-500/30'
                                    : 'text-white/40 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/20'
                            }`}
                        >
                            <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={() => setActiveView('lyrics')}
                            className={`p-3.5 rounded-full transition-all hover:scale-110 ${
                                activeView === 'lyrics'
                                    ? 'text-purple-400 bg-purple-400/20 shadow-lg shadow-purple-500/30'
                                    : 'text-white/40 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/20'
                            }`}
                        >
                            <Quote size={24} />
                        </button>
                        <button
                            onClick={() => setActiveView('queue')}
                            className={`p-3.5 rounded-full transition-all hover:scale-110 ${
                                activeView === 'queue'
                                    ? 'text-purple-400 bg-purple-400/20 shadow-lg shadow-purple-500/30'
                                    : 'text-white/40 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/20'
                            }`}
                        >
                            <ListMusic size={24} />
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Lyrics or Queue */}
                <div className="flex-[55%] flex flex-col p-16 pl-8">
                    <div className="flex-1 backdrop-blur-2xl bg-black/30 rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
                        {/* Lyrics Panel */}
                        {activeView === 'lyrics' && (
                            <div className="absolute inset-0">
                                {isInstrumental ? (
                                    <div className="flex flex-col items-center justify-center h-full text-white/60">
                                        <Music size={80} className="mb-6 opacity-20" />
                                        <p className="text-2xl font-semibold">Instrumental</p>
                                        <p className="text-base mt-2">Esta canción no tiene letra</p>
                                    </div>
                                ) : (
                                    <LyricsView
                                        lyrics={lyrics}
                                        currentTime={currentTime}
                                        isLoading={lyricsLoading}
                                        error={lyricsError}
                                    />
                                )}
                            </div>
                        )}

                        {/* Queue Panel */}
                        {activeView === 'queue' && (
                            <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8">
                                <h2 className="text-3xl font-bold mb-8 text-white sticky top-0 bg-black/50 backdrop-blur-md py-4 rounded-2xl px-6 z-10">
                                    A continuación
                                </h2>

                                {/* Current Track */}
                                <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl mb-6 border border-white/10">
                                    <img
                                        src={currentTrack.image || currentTrack.cover || currentTrack.coverBig || 'https://placehold.co/80x80'}
                                        className="w-16 h-16 rounded-xl"
                                        alt={currentTrack.title || 'Cover'}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white text-lg truncate">{currentTrack.title}</p>
                                        <p className="text-sm text-white/60 truncate">{currentTrack.artist}</p>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-green-500 animate-pulse" />
                                </div>

                                {/* Queue List */}
                                {queue && queue.length > 0 ? (
                                    <div className="space-y-2">
                                        {queue.map((track, index) => (
                                            <div
                                                key={`queue-${index}-${track.id || track.videoId}`}
                                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                                            >
                                                <span className="text-white/40 text-base font-mono w-8 text-center">{index + 1}</span>
                                                <img
                                                    src={track.image || track.cover || track.coverBig || 'https://placehold.co/56x56'}
                                                    className="w-14 h-14 rounded-lg"
                                                    alt={track.title || 'Cover'}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-white text-base truncate group-hover:text-purple-300 transition-colors">
                                                        {track.title}
                                                    </p>
                                                    <p className="text-sm text-white/50 truncate">{track.artist}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <ListMusic size={64} className="mx-auto mb-6 text-white/20" />
                                        <p className="text-xl text-white/40">No hay más canciones en la cola</p>
                                        <p className="text-sm text-white/30 mt-2">Las siguientes canciones aparecerán aquí</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Default: Show Artwork Info */}
                        {activeView === 'artwork' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                <Quote size={80} className="mb-6 text-white/20" />
                                <h3 className="text-2xl font-bold text-white mb-4">Selecciona una vista</h3>
                                <p className="text-white/50 text-lg max-w-md">
                                    Usa los botones de abajo para ver las letras sincronizadas o la lista de reproducción
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Sheet Menu (Shared for Desktop/Mobile) */}
            {showMenu && (
                <>
                    <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowMenu(false)} />
                    <div className="absolute bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-lg md:rounded-3xl z-[70] bg-[#121212] rounded-t-3xl md:rounded-3xl border-t md:border border-white/10 p-6 animate-slide-up pb-safe">
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8 md:hidden" />

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
                                <Heart size={24} className={isFavorite ? 'text-green-500 fill-green-500' : 'text-white'} />
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

                            <button className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white font-medium">
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
