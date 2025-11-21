import React from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Heart, Plus } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getItemId } from '../utils/formatUtils';

export default function NowPlayingModal({ onClose, favorites, toggleFavorite, togglePlaylist, playlist }) {
    const { currentTrack, isPlaying, togglePlayPause, nextTrack, prevTrack } = usePlayer();

    if (!currentTrack) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-50 flex items-center justify-center p-4 md:p-8 animate-fadeIn">
            <div className="relative w-full max-w-lg glass-fluid-strong rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-transparent pointer-events-none"></div>
                <button className="absolute right-4 top-4 text-slate-300 hover:text-white transition-colors z-10 p-3 rounded-full hover:bg-white/10" onClick={onClose}><X size={28} /></button>
                <div className="relative z-10">
                    <div className="w-56 h-56 md:w-72 md:h-72 mx-auto rounded-3xl overflow-hidden shadow-2xl mb-8 ring-4 ring-purple-500/30">
                        <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-center text-white mb-2 line-clamp-2">{currentTrack.title}</h3>
                    <p className="text-slate-300 text-center mb-8 text-base md:text-lg font-semibold">{currentTrack.originalData?.snippet?.channelTitle || currentTrack.originalData?.artist || ''}</p>
                    <div className="flex items-center justify-center gap-10 mb-10">
                        <button onClick={() => prevTrack()} className="text-slate-300 hover:text-white transition-all hover:scale-125 transform"><SkipBack size={36} /></button>
                        <button onClick={() => togglePlayPause()} className="w-20 h-20 rounded-full accent-gradient flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xl"> {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}</button>
                        <button onClick={() => nextTrack()} className="text-slate-300 hover:text-white transition-all hover:scale-125 transform"><SkipForward size={36} /></button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(currentTrack.originalData || currentTrack); }} className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 backdrop-blur-sm ${favorites?.some((f) => getItemId(f) === getItemId(currentTrack.originalData || currentTrack)) ? 'bg-purple-500/40 text-purple-200 border-2 border-purple-400/60 shadow-lg' : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600/50'}`}><Heart size={22} className="inline mr-2" fill="currentColor" />Favorito</button>
                        <button onClick={(e) => { e.stopPropagation(); togglePlaylist(currentTrack.originalData); }} className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 backdrop-blur-sm ${playlist?.some((p) => getItemId(p) === getItemId(currentTrack.originalData)) ? 'bg-amber-500/40 text-amber-200 border-2 border-amber-400/60 shadow-lg' : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600/50'}`}><Plus size={22} className="inline mr-2" />Playlist</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
