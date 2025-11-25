import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, MoreHorizontal } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';

export default function PlayerBar({ onOpenMobile }) {
    const {
        currentTrack,
        isPlaying,
        togglePlayPause,
        nextTrack,
        prevTrack,
        volume,
        setVolume,
        currentTime,
        duration,
        seekTo
    } = usePlayer();

    const { isFavorite, toggleFavorite } = useAuth();

    if (!currentTrack) return null;

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;
    const isFav = isFavorite(currentTrack);

    return (
        <div className="bg-black/95 backdrop-blur-xl border-t border-white/10 px-4 py-3">
            <div className="max-w-screen-2xl mx-auto grid grid-cols-3 items-center gap-4">
                {/* Left: Track Info */}
                <div className="flex items-center gap-3 min-w-0">
                    <img
                        src={currentTrack.image || 'https://via.placeholder.com/56'}
                        alt={currentTrack.title}
                        className="w-14 h-14 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform shadow-lg"
                        onClick={onOpenMobile}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/56'}
                    />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate hover:underline cursor-pointer">
                            {currentTrack.title || 'Unknown Track'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {currentTrack.artist || 'Unknown Artist'}
                        </p>
                    </div>
                    <button 
                        onClick={() => toggleFavorite(currentTrack)}
                        className={`flex-shrink-0 transition-colors ${
                            isFav ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                        }`}
                    >
                        <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                </div>

                {/* Center: Controls */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={prevTrack}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <SkipBack size={20} />
                        </button>
                        
                        <button
                            onClick={togglePlayPause}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                        >
                            {isPlaying ? (
                                <Pause size={20} className="text-black" fill="currentColor" />
                            ) : (
                                <Play size={20} className="text-black ml-0.5" fill="currentColor" />
                            )}
                        </button>
                        
                        <button
                            onClick={nextTrack}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-2">
                        <span className="text-xs text-gray-400 tabular-nums w-10 text-right">
                            {formatTime(currentTime)}
                        </span>
                        <div
                            className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer group"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const percent = clickX / rect.width;
                                seekTo(duration * percent);
                            }}
                        >
                            <div
                                className="h-full bg-green-500 relative group-hover:bg-green-400 transition-colors"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg" />
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 tabular-nums w-10">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Right: Volume */}
                <div className="flex items-center justify-end gap-3">
                    <Volume2 size={20} className="text-gray-400" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24 accent-green-500 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
