import React from 'react';

export default function PlaylistDetail({ playlist = null, songs = [], onPlay = () => {} }) {
  return (
    <div className="p-4 mobile-card">
      <h2 className="text-lg font-bold mb-3">{playlist?.name || 'Playlist'}</h2>
      <p className="text-sm text-slate-400 mb-4">{playlist?.description}</p>
      {songs.length === 0 ? (
        <p className="text-sm text-slate-400">No tracks in this playlist.</p>
      ) : (
        <ul className="space-y-2">
          {songs.map((s, i) => (
            <li key={s.id?.videoId || i} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{s.snippet?.title}</div>
                <div className="text-xs text-slate-400">{s.snippet?.channelTitle}</div>
              </div>
              <button className="px-3 py-1 rounded-md accent-gradient" onClick={() => onPlay(s)}>Play</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
