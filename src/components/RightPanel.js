import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Heart, Plus, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getItemId } from '../utils/formatUtils';

export default function RightPanel({ favorites, toggleFavorite, togglePlaylist, playlist }) {
  const { currentTrack, isPlaying, togglePlayPause, nextTrack, prevTrack, queue } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="h-full border-l border-white/5 bg-slate-900/50 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Music size={32} className="text-slate-500" />
        </div>
        <p className="text-slate-400 font-medium">Reproduce música para ver la información aquí</p>
      </div>
    );
  }

  return (
    <div className="h-full border-l border-white/5 bg-slate-900/30 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {/* Now Playing Header */}
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Now Playing</h3>

        {/* Album Art */}
        <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-2xl mb-6 ring-1 ring-white/10">
          <img
            src={currentTrack.image}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>

        {/* Track Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{currentTrack.title}</h2>
          <p className="text-lg text-slate-300 font-medium">{currentTrack.originalData?.snippet?.channelTitle || currentTrack.originalData?.artist || 'Unknown Artist'}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(currentTrack.originalData); }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${favorites?.some((f) => getItemId(f) === getItemId(currentTrack.originalData)) ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            <Heart size={18} fill={favorites?.some((f) => getItemId(f) === getItemId(currentTrack.originalData)) ? "currentColor" : "none"} />
            Like
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); togglePlaylist(currentTrack.originalData); }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${playlist?.some((p) => getItemId(p) === getItemId(currentTrack.originalData)) ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            <Plus size={18} />
            Add
          </button>
        </div>

        {/* Queue / Up Next */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Up Next</h3>
          {queue.length > 0 ? (
            <div className="space-y-2">
              {queue.slice(0, 5).map((track, idx) => (
                <div key={`${track.id}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group cursor-pointer" onClick={() => nextTrack()}>
                  <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden flex-shrink-0">
                    <img src={track.image || track.cover} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">{track.title}</p>
                    <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Queue is empty</p>
          )}
        </div>
      </div>
    </div>
  );
}
