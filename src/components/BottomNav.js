import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music, Search, Heart, ListMusic, LogOut } from 'lucide-react';

export default function BottomNav({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 glass-fluid-glow border-t border-slate-800 px-0 py-2 flex items-center justify-around shadow-2xl z-50 backdrop-blur-lg pb-safe">
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${isActive('/') ? 'text-yellow-400' : 'text-slate-400'}`}
      >
        <Music size={20} />
        <span className="text-[10px] font-medium">Inicio</span>
      </button>

      <button
        onClick={() => navigate('/search')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${isActive('/search') ? 'text-yellow-400' : 'text-slate-400'}`}
      >
        <Search size={20} />
        <span className="text-[10px] font-medium">Buscar</span>
      </button>

      <button
        onClick={() => navigate('/favorites')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${isActive('/favorites') ? 'text-yellow-400' : 'text-slate-400'}`}
      >
        <Heart size={20} />
        <span className="text-[10px] font-medium">Favoritos</span>
      </button>

      <button
        onClick={() => navigate('/library')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${isActive('/library') ? 'text-yellow-400' : 'text-slate-400'}`}
      >
        <ListMusic size={20} />
        <span className="text-[10px] font-medium">Biblioteca</span>
      </button>

      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-400 hover:text-red-400 transition-colors"
      >
        <LogOut size={20} />
        <span className="text-[10px] font-medium">Salir</span>
      </button>
    </nav>
  );
}
