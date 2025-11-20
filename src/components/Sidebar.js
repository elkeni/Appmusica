import React from 'react';
import { Music, ListMusic, Heart, Search, Radio as RadioIcon, Disc } from 'lucide-react';

export default function Sidebar({ user, view, setView, playlist, favorites, handleLogout }) {
  return (
    <aside className="hidden md:flex md:w-72 glass-fluid-strong flex-col overflow-y-auto p-0 m-6 rounded-3xl shadow-2xl border border-white/10">
      {/* Logo y nombre */}
      <div className="flex items-center gap-3 px-8 pt-8 pb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg accent-gradient">
          <Music size={26} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">CloudTune</h1>
          <p className="text-xs text-slate-400 font-medium">Music Streaming</p>
        </div>
      </div>

      {/* Sección Library */}
      <div className="mt-2 flex-1">
        <p className="uppercase text-xs font-bold text-slate-400 px-8 mb-3 tracking-widest">Library</p>
        <nav className="flex flex-col gap-1 px-2">
          <SidebarButton
            icon={<Music size={20} />}
            label="Browse"
            active={view === 'discover'}
            onClick={() => setView('discover')}
          />
          <SidebarButton
            icon={<ListMusic size={20} />}
            label="Songs"
            active={view === 'playlist'}
            onClick={() => setView('playlist')}
            badge={playlist.filter((item) => !item.stationuuid).length}
          />
          <SidebarButton
            icon={<Disc size={20} />}
            label="Albums"
            active={view === 'favorites'}
            onClick={() => setView('favorites')}
            badge={favorites.filter((item) => !item.stationuuid).length}
          />
          <SidebarButton
            icon={<ListMusic size={20} />}
            label="Playlists"
            active={view === 'user-playlists'}
            onClick={() => setView('user-playlists')}
          />
          <SidebarButton
            icon={<Search size={20} />}
            label="Artists"
            active={view === 'search'}
            onClick={() => setView('search')}
          />
          <SidebarButton
            icon={<RadioIcon size={20} />}
            label="Radio"
            active={view === 'radio'}
            onClick={() => setView('radio')}
          />
        </nav>
      </div>

      {/* Usuario y logout */}
      <div className="px-8 pb-8 pt-6">
        <div className="glass-fluid-subtle rounded-xl p-4 mb-3">
          <p className="text-xs text-slate-400 mb-1">Sesión activa</p>
          <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-semibold transition-all hover:scale-105"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function SidebarButton({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${active
        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-400/30 shadow-lg'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`}
    >
      {icon}
      <span className="font-semibold flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">{badge}</span>
      )}
    </button>
  );
}
