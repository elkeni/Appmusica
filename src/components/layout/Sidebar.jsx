import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Grid3X3, User, Disc3, Heart, Clock, Plus, Music } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
    const auth = useAuth();
    const { user, playlists = [], logout } = auth || {};
    const navigate = useNavigate();

    if (!auth) {
        return null;
    }

    // Main navigation items
    const mainNavItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Grid3X3, label: 'Genres', path: '/search' },
        { icon: User, label: 'Artists', path: '/library' },
        { icon: Disc3, label: 'Albums', path: '/library' },
    ];

    // Secondary navigation items
    const secondaryNavItems = [
        { icon: Heart, label: 'Favourites', path: '/favorites' },
        { icon: Clock, label: 'Recently Plays', path: '/library' },
    ];

    // Default playlists for demo
    const defaultPlaylists = [
        { id: 'rock', name: 'Rock & Roll' },
        { id: '90s', name: 'Best of 90s' },
        { id: 'work', name: 'Work Time' },
        { id: 'exercise', name: 'Exercise mode' },
    ];

    const displayPlaylists = playlists && playlists.length > 0 ? playlists : defaultPlaylists;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="flex flex-col h-full p-6 bg-[#0d0f1a]/95">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4f9cf9] rounded-full flex items-center justify-center">
                    <Music size={20} className="text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-white">
                    Echo Music
                </h1>
            </div>

            {/* Main Navigation */}
            <nav className="flex flex-col gap-1 mb-6">
                {mainNavItems.map((item) => (
                    <NavLink
                        key={item.path + item.label}
                        to={item.path}
                        className={({ isActive }) =>
                            `relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-base font-medium ${
                                isActive
                                    ? 'text-white bg-[#4f9cf9]/10 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-6 before:bg-[#4f9cf9] before:rounded-r'
                                    : 'text-[#b4b8c5] hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon size={22} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Divider */}
            <div className="h-px bg-white/10 my-4" />

            {/* Secondary Navigation */}
            <nav className="flex flex-col gap-1 mb-6">
                {secondaryNavItems.map((item) => (
                    <NavLink
                        key={item.path + item.label}
                        to={item.path}
                        className={({ isActive }) =>
                            `relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-base font-medium ${
                                isActive
                                    ? 'text-white bg-[#4f9cf9]/10 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-6 before:bg-[#4f9cf9] before:rounded-r'
                                    : 'text-[#b4b8c5] hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon size={22} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Divider */}
            <div className="h-px bg-white/10 my-4" />

            {/* Playlists Section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4 px-4">
                    <h3 className="text-sm font-semibold text-[#b4b8c5] uppercase tracking-wider">
                        Playlists
                    </h3>
                    <button 
                        onClick={() => navigate('/library')}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-[#b4b8c5] hover:text-white transition-colors"
                        title="Create playlist"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="flex flex-col gap-1">
                    {displayPlaylists.map((playlist) => (
                        <NavLink
                            key={playlist.id}
                            to={`/playlist/${playlist.id}`}
                            className="px-4 py-2 text-[#b4b8c5] hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        >
                            <div className="flex items-center gap-3">
                                <Music size={16} />
                                <span className="text-sm truncate">{playlist.name}</span>
                            </div>
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* User Profile */}
            <div className="mt-auto pt-6 border-t border-white/10">
                <NavLink
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors mb-2"
                >
                    <img
                        src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.email || 'Taylor') + '&background=4f9cf9&color=fff'}
                        alt={user?.displayName || 'Taylor'}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.displayName || user?.email?.split('@')[0] || 'Taylor'}
                        </p>
                        <p className="text-xs text-[#b4b8c5]">View profile</p>
                    </div>
                </NavLink>
                
                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-[#b4b8c5] hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                    Sign out
                </button>
            </div>
        </div>
    );
}
