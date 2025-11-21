import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronDown, MoreHorizontal, Quote, ListMusic, Shuffle, Repeat } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { extractPaletteFromImage } from '../utils/colorUtils';

export default function MobileFullScreenPlayer({ onClose, favorites, toggleFavorite, togglePlaylist, playlist }) {
    const { currentTrack, isPlaying, togglePlayPause, nextTrack, prevTrack, currentTime, duration } = usePlayer();
    const [colors, setColors] = useState({ primary: '#1a1a1a', secondary: '#000000' });
    const [showLyrics, setShowLyrics] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragY, setDragY] = useState(0);

    // Extract colors for dynamic background
    useEffect(() => {
        if (currentTrack?.image) {
            extractPaletteFromImage(currentTrack.image).then(palette => {
                if (palette) {
                    setColors(palette);
                }
            });
        }
    }, [currentTrack?.image]);

    if (!currentTrack) return null;

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
                    className="absolute left-6 top-6 text-white/70 hover:text-white"
                >
                    <ChevronDown size={28} />
                </button>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col px-8 pb-safe">

                {/* Album Art Container */}
                <div className="flex-1 flex items-center justify-center py-4">
                    <div
                        className={`relative w-full aspect-square max-h-[350px] rounded-2xl shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isPlaying ? 'scale-100 shadow-purple-500/20' : 'scale-[0.85] opacity-90'}`}
                    >
                        <img
                            src={currentTrack.image}
                            alt={currentTrack.title}
                            className="w-full h-full object-cover rounded-2xl"
                        />
                    </div>
                </div>

                {/* Track Info */}
                <div className="flex items-center justify-between mb-8">
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
                        className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <MoreHorizontal size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 group">
                    <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer group-hover:h-2 transition-all">
                        <div
                            className="absolute top-0 left-0 h-full bg-white/90 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium text-white/50">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-10">
                    <button className="text-white/40 hover:text-white transition-colors">
                        <Shuffle size={24} />
                    </button>

                    <button
                        onClick={() => prevTrack()}
                        className="text-white hover:scale-110 transition-transform"
                    >
                        <SkipBack size={40} fill="currentColor" />
                    </button>

                    <button
                        onClick={() => togglePlayPause()}
                        className="w-20 h-20 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform shadow-xl"
                    >
                        {isPlaying ? (
                            <Pause size={36} fill="currentColor" />
                        ) : (
                            <Play size={36} fill="currentColor" className="ml-1" />
                        )}
                    </button>

                    <button
                        onClick={() => nextTrack()}
                        className="text-white hover:scale-110 transition-transform"
                    >
                        <SkipForward size={40} fill="currentColor" />
                    </button>

                    <button className="text-white/40 hover:text-white transition-colors">
                        <Repeat size={24} />
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-8 pb-4">
                    <button
                        onClick={() => setShowLyrics(!showLyrics)}
                        className={`p-3 rounded-xl transition-colors ${showLyrics ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        <Quote size={24} />
                    </button>

                    <button
                        onClick={() => setShowQueue(!showQueue)}
                        className={`p-3 rounded-xl transition-colors ${showQueue ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        <ListMusic size={24} />
                    </button>
                </div>
            </div>

            {/* Overlays (Placeholder for now) */}
            {(showLyrics || showQueue) && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xl flex flex-col pt-12 px-6 animate-fadeIn">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => { setShowLyrics(false); setShowQueue(false); }}
                            className="p-2 bg-white/10 rounded-full"
                        >
                            <ChevronDown size={24} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {showLyrics && (
                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-6 text-white/90">Lyrics</h3>
                                <p className="text-white/60 leading-loose">
                                    Lyrics feature coming soon...
                                </p>
                            </div>
                        )}
                        {showQueue && (
                            <div>
                                <h3 className="text-xl font-bold mb-6 text-white/90">Up Next</h3>
                                <p className="text-white/60">
                                    Queue feature coming soon...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
