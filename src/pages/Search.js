import React from 'react';

export default function Search({ results = [], onPlay = () => {}, onSearch = () => {} }) {
  return (
    <div className="p-4 mobile-card">
      <h2 className="text-lg font-bold mb-3">Search</h2>
      <div className="mb-3">
        <input aria-label="Buscar" placeholder="Buscar canciones" className="w-full p-2 rounded-md bg-slate-800/50" onKeyDown={(e) => { if (e.key === 'Enter') onSearch(e.target.value); }} />
      </div>
      <div>
        {results.length === 0 ? (
          <p className="text-sm text-gray-300">Sin resultados</p>
        ) : (
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li key={r.id?.videoId || i} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.snippet?.title}</div>
                  <div className="text-xs text-slate-400">{r.snippet?.channelTitle}</div>
                </div>
                <button className="px-3 py-1 rounded-md accent-gradient" onClick={() => onPlay(r)}>Play</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
