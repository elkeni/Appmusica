import React, { useState } from 'react';
import { Play, Pause, Volume2, SkipForward, SkipBack, Heart, Radio, Quote, ListMusic, Shuffle, Repeat, Maximize2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getItemId } from '../utils/formatUtils';

export default function PlayerBar({ onShowNowPlaying, onShowLyrics, onShowQueue, favorites, toggleFavorite, onAddToPlaylist, onGoToAlbum }) {
    const { currentTrack, isPlaying, togglePlayPause, nextTrack, prevTrack, volume, setVolume, currentTime, duration, radioMode, fetchingRecommendations, queue, seekTo } = usePlayer();
    const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
    const [shuffleEnabled, setShuffleEnabled] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);

    if (!currentTrack) return null;

    const isFavorite = favorites?.some(f => getItemId(f) === getItemId(currentTrack));

    const formatTime = (time) => {
        if (!time) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (e) => {
        if (!duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;
        seekTo(newTime);
    };

    const handleSeekStart = () => {
        setIsSeeking(true);
    };

    const handleSeekEnd = () => {
        setIsSeeking(false);
    };

    const handleMouseMove = (e) => {
        if (!isSeeking) return;
        handleSeek(e);
    };

    return (
        <div className="h-full w-full bg-black/90 backdrop-blur-2xl border-t border-white/10 flex items-center px-6 md:px-8 z-50 shadow-2xl shadow-black/50">
            <div className="w-full max-w-[1920px] mx-auto grid grid-cols-3 items-center gap-6">
                {/* LEFT: Track Info */}
                <div className="flex items-center gap-3 min-w-0">
                    <div 
                        className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-purple-500/20 cursor-pointer hover:ring-purple-400/60 hover:scale-105 transition-all" 
                        onClick={onShowLyrics || onShowNowPlaying}
                        title="Open Full-Screen Player"
                    >
                        <img src={currentTrack?.image} alt="cover" className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
                    </div>
                    <div className="flex-1 min-w-0 hidden md:block">
                        <div className="flex items-center gap-2">
                            <h4 className="text-white font-semibold text-sm truncate">{currentTrack?.title}</h4>
                            {radioMode && (
                                <span className="flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full animate-pulse">
                                    <Radio size={10} />
                                    {fetchingRecommendations ? '...' : 'Radio'}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 text-xs truncate">{currentTrack?.artist || currentTrack?.originalData?.artist || 'Unknown Artist'}</p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(currentTrack?.originalData || currentTrack);
                        }}
                        className="hidden md:block p-2 rounded-full hover:bg-white/10 transition-all"
                    >
                        <Heart
                            size={18}
                            className={isFavorite ? 'fill-purple-500 text-purple-500' : 'text-slate-400'}
                        />
                    </button>
                </div>

                {/* CENTER: Playback Controls + Timeline */}
                <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto">
                    {/* Control Buttons Row */}
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShuffleEnabled(!shuffleEnabled)}
                            className={`p-2 rounded-full transition-all hover:scale-110 ${
                                shuffleEnabled 
                                    ? 'text-purple-400 bg-purple-400/20 shadow-lg shadow-purple-500/30' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                            title="Shuffle"
                        >
                            <Shuffle size={16} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); prevTrack(); }} 
                            className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all hover:scale-110"
                        >
                            <SkipBack size={20} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} 
                            className="p-4 rounded-full accent-gradient text-white shadow-2xl hover:scale-110 hover:shadow-purple-500/50 transition-all"
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); nextTrack(); }} 
                            className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all hover:scale-110"
                        >
                            <SkipForward size={20} />
                        </button>
                        <button 
                            onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
                            className={`p-2 rounded-full transition-all hover:scale-110 relative ${
                                repeatMode !== 'off' 
                                    ? 'text-purple-400 bg-purple-400/20 shadow-lg shadow-purple-500/30' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                            title={`Repeat: ${repeatMode}`}
                        >
                            <Repeat size={16} />
                            {repeatMode === 'one' && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold shadow-lg">1</span>
                            )}
                        </button>
                    </div>
                    
                    {/* Timeline/Progress Bar Row */}
                    <div className="hidden md:flex items-center gap-3 w-full">
                        <span className="text-[11px] text-slate-400 font-mono w-12 text-right tabular-nums">
                            {formatTime(currentTime)}
                        </span>
                        <div 
                            className="flex-1 group cursor-pointer py-2"
                            onClick={handleSeek}
                            onMouseDown={handleSeekStart}
                            onMouseUp={handleSeekEnd}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleSeekEnd}
                        >
                            <div className="relative h-1 bg-slate-700/60 rounded-full overflow-visible group-hover:h-1.5 transition-all">
                                {/* Progress Fill */}
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400 rounded-full transition-none"
                                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                />
                                {/* Interactive Thumb */}
                                <div 
                                    className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100"
                                    style={{ 
                                        left: `${duration ? (currentTime / duration) * 100 : 0}%`, 
                                        transform: 'translate(-50%, -50%)',
                                        boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
                                    }}
                                />
                            </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono w-12 tabular-nums">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* RIGHT: Volume + Extras */}
                <div className="hidden md:flex items-center justify-end gap-2">
                    {/* Expand Full-Screen Button */}
                    {onShowLyrics && (
                        <button
                            onClick={onShowLyrics}
                            className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-110"
                            title="Expand Full-Screen"
                        >
                            <Maximize2 size={18} />
                        </button>
                    )}
                    
                    {/* Lyrics Button */}
                    {onShowLyrics && (
                        <button
                            onClick={onShowLyrics}
                            className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-110"
                            title="Lyrics"
                        >
                            <Quote size={18} />
                        </button>
                    )}
                    
                    {/* Queue Button */}
                    {onShowQueue && (
                        <button
                            onClick={onShowQueue}
                            className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-110 relative"
                            title="Queue"
                        >
                            <ListMusic size={18} />
                            {queue?.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold shadow-lg">
                                    {queue.length}
                                </span>
                            )}
                        </button>
                    )}
                    
                    {/* Volume Control */}
                    <div className="flex items-center gap-2.5 ml-3 pl-3 border-l border-slate-700/50">
                        <Volume2 size={18} className="text-slate-300" />
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={e => setVolume(Number(e.target.value))}
                            className="w-24 h-1 accent-purple-500 cursor-pointer"
                            style={{ accentColor: '#a78bfa' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
