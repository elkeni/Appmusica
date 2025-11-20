import React from 'react';

export default function Playlist({ items = [], onPlay = () => {}, onRemove = () => {} }) {
  return (
    <div className="p-4 mobile-card">
      <h2 className="text-lg font-bold mb-3">My Playlist</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Tu playlist está vacía.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it, idx) => (
            <li key={it.id?.videoId || idx} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{it.snippet?.title}</div>
                <div className="text-xs text-slate-400">{it.snippet?.channelTitle}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-md accent-gradient" onClick={() => onPlay(it)}>Play</button>
                <button className="px-3 py-1 rounded-md glass-fluid-subtle" onClick={() => onRemove(it)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
