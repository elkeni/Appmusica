import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Radio, Music, Search, LogOut } from 'lucide-react';

export default function BottomNav({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getActiveClass = (path) => 
    isActive(path) 
      ? 'text-red-500' 
      : 'text-slate-400';

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 glass-fluid-glow border-t border-slate-800 px-0 py-2 flex items-center justify-around shadow-2xl z-50 backdrop-blur-lg pb-safe">
      {/* Inicio (Home) */}
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${getActiveClass('/')} hover:scale-110`}
        title="Inicio"
      >
        <Home size={24} />
        <span className="text-[10px] font-semibold">Inicio</span>
      </button>

      {/* Novedades (Grid) */}
      <button
        onClick={() => navigate('/library')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${getActiveClass('/library')} hover:scale-110`}
        title="Novedades"
      >
        <Grid3X3 size={24} />
        <span className="text-[10px] font-semibold">Novedades</span>
      </button>

      {/* Radio (Wifi) */}
      <button
        onClick={() => navigate('/radio')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all text-slate-400 hover:scale-110 hover:text-slate-300`}
        title="Radio"
      >
        <Radio size={24} />
        <span className="text-[10px] font-semibold">Radio</span>
      </button>

      {/* Biblioteca (Music Folder) */}
      <button
        onClick={() => navigate('/favorites')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${getActiveClass('/favorites')} hover:scale-110`}
        title="Biblioteca"
      >
        <Music size={24} />
        <span className="text-[10px] font-semibold">Biblioteca</span>
      </button>

      {/* Buscar (Search) */}
      <button
        onClick={() => navigate('/search')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${getActiveClass('/search')} hover:scale-110`}
        title="Buscar"
      >
        <Search size={24} />
        <span className="text-[10px] font-semibold">Buscar</span>
      </button>

      {/* Salir (Logout) */}
      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-slate-400 hover:text-red-400 transition-all hover:scale-110"
        title="Salir"
      >
        <LogOut size={24} />
        <span className="text-[10px] font-semibold">Salir</span>
      </button>
    </nav>
  );
}
