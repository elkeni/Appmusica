import React from 'react';

export default function NowPlaying({ track = null, onPlayPause = () => {}, onPrev = () => {}, onNext = () => {} }) {
  if (!track) return (
    <div className="p-4 mobile-card">
      <p className="text-sm text-slate-400">Nothing is playing.</p>
    </div>
  );

  return (
    <div className="p-4 now-playing-ui">
      <div className="flex flex-col items-center gap-4">
        <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg">
          <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
        </div>
        <h3 className="text-xl font-bold">{track.title}</h3>
        <p className="text-sm text-slate-300">{track.originalData?.snippet?.channelTitle}</p>
        <div className="flex items-center gap-4 mt-4">
          <button className="px-3 py-2 rounded-md glass-fluid-subtle" onClick={onPrev}>Prev</button>
          <button className="px-4 py-2 rounded-full accent-gradient" onClick={onPlayPause}>Play/Pause</button>
          <button className="px-3 py-2 rounded-md glass-fluid-subtle" onClick={onNext}>Next</button>
        </div>
      </div>
    </div>
  );
}
