import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, Music, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
    const auth = useAuth();
    const { user, playlists = [], logout } = auth || {};
    const navigate = useNavigate();

    // Protección adicional
    if (!auth) {
        return null;
    }

    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Search, label: 'Buscar', path: '/search' },
        { icon: Heart, label: 'Favoritos', path: '/favorites' },
        { icon: Music, label: 'Biblioteca', path: '/library' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black p-6">
            {/* Logo */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    CloudTune
                </h1>
                <p className="text-xs text-gray-500 mt-1">Music Streaming</p>
            </div>

            {/* Main Navigation */}
            <nav className="flex flex-col gap-2 mb-8">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                                isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon size={24} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-6" />

            {/* Playlists Section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4 px-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        Playlists
                    </h3>
                    <button 
                        onClick={() => navigate('/library')}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Crear playlist"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-1">
                    {playlists && playlists.length > 0 ? (
                        playlists.map((playlist) => (
                            <NavLink
                                key={playlist.id}
                                to={`/playlist/${playlist.id}`}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <Music size={16} />
                                    <span className="text-sm truncate">{playlist.name}</span>
                                </div>
                            </NavLink>
                        ))
                    ) : (
                        <div className="px-4 py-6 text-center">
                            <Music size={32} className="mx-auto text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500">No tienes playlists</p>
                            <button 
                                onClick={() => navigate('/library')}
                                className="mt-3 text-xs text-green-500 hover:text-green-400 transition-colors"
                            >
                                Crear tu primera playlist
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* User Profile */}
            <div className="mt-auto pt-6 border-t border-white/10">
                <NavLink
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors mb-2"
                >
                    <img
                        src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.email || 'User')}
                        alt={user?.displayName || 'User'}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-400">Ver perfil</p>
                    </div>
                </NavLink>
                
                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}
