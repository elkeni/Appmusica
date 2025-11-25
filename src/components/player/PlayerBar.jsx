import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, Shuffle, Repeat } from 'lucide-react';
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
        <div className="bg-[#0d0f1a] border-t border-white/5 px-8 py-4 h-[90px]">
            <div className="max-w-screen-2xl mx-auto grid grid-cols-3 items-center gap-4 h-full">
                {/* Left: Track Info */}
                <div className="flex items-center gap-4 min-w-0">
                    <img
                        src={currentTrack.image || 'https://via.placeholder.com/60'}
                        alt={currentTrack.title}
                        className="w-[60px] h-[60px] rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform shadow-lg"
                        onClick={onOpenMobile}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                    />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-white truncate hover:underline cursor-pointer">
                            {currentTrack.title || 'Unknown Track'}
                        </p>
                        <p className="text-xs text-[#b4b8c5] truncate">
                            {currentTrack.artist || 'Unknown Artist'}
                        </p>
                    </div>
                    <button 
                        onClick={() => toggleFavorite(currentTrack)}
                        className={`flex-shrink-0 transition-colors ${
                            isFav ? 'text-[#4f9cf9]' : 'text-[#b4b8c5] hover:text-[#4f9cf9]'
                        }`}
                    >
                        <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                </div>

                {/* Center: Controls */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-5">
                        <button className="text-[#b4b8c5] hover:text-white transition-colors">
                            <Shuffle size={18} />
                        </button>
                        <button
                            onClick={prevTrack}
                            className="text-[#b4b8c5] hover:text-white transition-colors"
                        >
                            <SkipBack size={20} fill="currentColor" />
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
                            className="text-[#b4b8c5] hover:text-white transition-colors"
                        >
                            <SkipForward size={20} fill="currentColor" />
                        </button>
                        <button className="text-[#b4b8c5] hover:text-white transition-colors">
                            <Repeat size={18} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md flex items-center gap-2">
                        <span className="text-xs text-[#b4b8c5] tabular-nums w-10 text-right">
                            {formatTime(currentTime)}
                        </span>
                        <div
                            className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer group"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const percent = clickX / rect.width;
                                seekTo(duration * percent);
                            }}
                        >
                            <div
                                className="h-full bg-[#4f9cf9] relative group-hover:bg-[#6fb3ff] transition-colors rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg" />
                            </div>
                        </div>
                        <span className="text-xs text-[#b4b8c5] tabular-nums w-10">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Right: Volume */}
                <div className="flex items-center justify-end gap-3">
                    <Volume2 size={20} className="text-[#b4b8c5]" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-3
                            [&::-webkit-slider-thumb]:h-3
                            [&::-webkit-slider-thumb]:bg-white
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:w-3
                            [&::-moz-range-thumb]:h-3
                            [&::-moz-range-thumb]:bg-white
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:border-none
                            [&::-moz-range-thumb]:cursor-pointer"
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
