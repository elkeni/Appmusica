import React from 'react';
import { Play, Pause, Volume2, SkipForward, SkipBack, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getItemId } from '../utils/formatUtils';

export default function PlayerBar({ onShowNowPlaying, favorites, toggleFavorite, onAddToPlaylist, onGoToAlbum }) {
    const { currentTrack, isPlaying, togglePlayPause, nextTrack, prevTrack, volume, setVolume, currentTime, duration } = usePlayer();

    if (!currentTrack) return null;

    const isFavorite = favorites?.some(f => getItemId(f) === getItemId(currentTrack));

    const formatTime = (time) => {
        if (!time) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="h-full w-full bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex items-center px-4 md:px-8 z-50">
            <div className="w-full max-w-[1800px] mx-auto flex items-center gap-4 md:gap-6">
                {/* Album Art & Track Info */}
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl ring-2 ring-purple-500/30 cursor-pointer hover:ring-purple-400/50 transition-all" onClick={onShowNowPlaying}>
                        <img src={currentTrack?.image} alt="cover" className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
                    </div>
                    <div className="flex-1 min-w-0 hidden md:block">
                        <h4 className="text-white font-semibold text-sm md:text-base truncate">{currentTrack?.title}</h4>
                        <p className="text-slate-400 text-xs md:text-sm truncate">{currentTrack?.artist || currentTrack?.originalData?.artist || 'Unknown Artist'}</p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(currentTrack?.originalData || currentTrack);
                        }}
                        className="hidden md:block p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <Heart
                            size={20}
                            className={isFavorite ? 'fill-purple-500 text-purple-500' : 'text-slate-400'}
                        />
                    </button>
                </div>

                {/* Playback Controls */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 md:gap-3">
                        <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="p-2 md:p-2.5 rounded-full bg-slate-700/60 hover:bg-purple-600 text-purple-300 hover:text-white transition-all hover:scale-110">
                            <SkipBack size={20} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} className="p-3 md:p-4 rounded-full accent-gradient text-white shadow-xl hover:scale-110 transition-transform">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="p-2 md:p-2.5 rounded-full bg-slate-700/60 hover:bg-purple-600 text-purple-300 hover:text-white transition-all hover:scale-110">
                            <SkipForward size={20} />
                        </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="hidden md:flex items-center gap-2 w-64">
                        <span className="text-[10px] text-slate-400 font-semibold w-10 text-right">
                            {formatTime(currentTime)}
                        </span>
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-400 transition-all"
                                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold w-10">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Volume Control */}
                <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
                    <Volume2 size={20} className="text-slate-300" />
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={e => setVolume(Number(e.target.value))}
                        className="w-24 accent-purple-500 cursor-pointer"
                        style={{ accentColor: '#a78bfa' }}
                    />
                </div>
            </div>
        </div>
    );
}
