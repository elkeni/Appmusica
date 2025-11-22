import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Radio as RadioIcon, Music, Search, LogOut, Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function BottomNav({ onLogout, onShowPlayer }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTrack, isPlaying, togglePlayPause, currentTime, duration, radioMode, fetchingRecommendations } = usePlayer();

  const isActive = (path) => location.pathname === path;

  const getActiveClass = (path) => 
    isActive(path) 
      ? 'text-red-500' 
      : 'text-slate-400';

  return (
    <>
      {/* Mini Player Bar - Shown when there's a track playing */}
      {currentTrack && (
        <div 
          className="fixed md:hidden bottom-16 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 z-40"
          onClick={onShowPlayer}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <img 
              src={currentTrack.image} 
              alt="cover" 
              className="w-12 h-12 rounded-lg object-cover shadow-lg"
              onError={(e) => (e.target.style.display = 'none')}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-white font-semibold text-sm truncate">{currentTrack.title}</h4>
                {radioMode && (
                  <span className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full animate-pulse">
                    <RadioIcon size={10} />
                    {fetchingRecommendations ? '...' : 'Radio'}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs truncate">{currentTrack.artist || 'Unknown Artist'}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
          </div>
          {/* Progress Bar */}
          <div className="h-1 bg-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-400 transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 glass-fluid-glow border-t border-slate-800 px-0 py-2 flex items-center justify-around shadow-2xl z-50 backdrop-blur-lg" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
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
        <RadioIcon size={24} />
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
    </>
  );
}
