import React from 'react';
import { Music, Search, Heart, ListMusic, X } from 'lucide-react';

export default function BottomNav({ view, setView, onLogout }) {
  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 glass-fluid-glow border-t border-slate-800 px-0 py-2 flex items-center justify-around shadow-2xl z-50 backdrop-blur-lg">
      <button onClick={() => setView('discover')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${view === 'discover' ? 'text-yellow-400' : 'text-slate-400'}`}>
        <Music size={20} />
        <span className="text-xs">Inicio</span>
      </button>
      <button onClick={() => setView('search')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${view === 'search' ? 'text-yellow-400' : 'text-slate-400'}`}>
        <Search size={20} />
        <span className="text-xs">Buscar</span>
      </button>
      <button onClick={() => setView('favorites')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${view === 'favorites' ? 'text-yellow-400' : 'text-slate-400'}`}>
        <Heart size={20} />
        <span className="text-xs">Favoritos</span>
      </button>
      <button onClick={() => setView('playlist')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${view === 'playlist' ? 'text-yellow-400' : 'text-slate-400'}`}>
        <ListMusic size={20} />
        <span className="text-xs">Playlist</span>
      </button>
      <button onClick={onLogout} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-400">
        <X size={20} />
        <span className="text-xs">Salir</span>
      </button>
    </nav>
  );
}
