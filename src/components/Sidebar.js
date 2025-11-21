import React from 'react';
import { NavLink } from 'react-router-dom';
import { Music, ListMusic, Search, Radio as RadioIcon, Disc } from 'lucide-react';

export default function Sidebar({ user, playlist, favorites, handleLogout }) {
  return (
    <aside className="h-full w-full flex flex-col overflow-y-auto border-r border-white/5 bg-slate-900/30">
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
            to="/"
            icon={<Music size={20} />}
            label="Browse"
          />
          <SidebarButton
            to="/playlist/default" // Assuming default playlist for now, or handle differently
            icon={<ListMusic size={20} />}
            label="Songs"
            badge={playlist.filter((item) => item && !item.stationuuid).length}
          />
          <SidebarButton
            to="/favorites"
            icon={<Disc size={20} />}
            label="Favorites"
            badge={favorites.filter((item) => item && !item.stationuuid).length}
          />
          <SidebarButton
            to="/library"
            icon={<ListMusic size={20} />}
            label="Playlists"
          />
          <SidebarButton
            to="/search"
            icon={<Search size={20} />}
            label="Search"
          />
          <SidebarButton
            to="/radio"
            icon={<RadioIcon size={20} />}
            label="Radio"
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

function SidebarButton({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `w-full flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${isActive
        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-400/30 shadow-lg'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`}
    >
      {icon}
      <span className="font-semibold flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">{badge}</span>
      )}
    </NavLink>
  );
}

