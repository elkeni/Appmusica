import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Grid, User, Camera, Heart, Clock, Music, Plus } from 'lucide-react';
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
        { icon: Home, label: 'Home', path: '/' },
        { icon: Grid, label: 'Genres', path: '/search' },
        { icon: User, label: 'Artists', path: '/search' },
        { icon: Camera, label: 'Albums', path: '/library' },
        { icon: Heart, label: 'Favourites', path: '/favorites' },
        { icon: Clock, label: 'Recently Plays', path: '/library' },
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
        <div className="flex flex-col h-full p-6" style={{ backgroundColor: '#0f1419' }}>
            {/* Logo */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    Echo Music
                </h1>
                <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Your Sound, Your Way</p>
            </div>

            {/* Main Navigation */}
            <nav className="flex flex-col gap-1 mb-6">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                                isActive
                                    ? 'text-white'
                                    : 'hover:text-white'
                            }`
                        }
                        style={({ isActive }) => ({
                            color: isActive ? '#ffffff' : '#9ca3af',
                            backgroundColor: isActive ? 'rgba(74, 144, 226, 0.1)' : 'transparent'
                        })}
                    >
                        <item.icon size={20} />
                        <span className="font-medium text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-6" />

            {/* Playlists Section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4 px-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                        Playlists
                    </h3>
                    <button 
                        onClick={() => navigate('/library')}
                        className="hover:text-white transition-colors"
                        style={{ color: '#9ca3af' }}
                        title="Create playlist"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-1">
                    {/* Example Playlists */}
                    {['Rock & Roll', 'Best of 90s', 'Work Time', 'Exercise mode'].map((name) => (
                        <button
                            key={name}
                            onClick={() => navigate('/library')}
                            className="px-4 py-2 text-left hover:text-white transition-colors rounded-lg"
                            style={{ 
                                color: '#9ca3af',
                                backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div className="flex items-center gap-3">
                                <Music size={16} />
                                <span className="text-sm truncate">{name}</span>
                            </div>
                        </button>
                    ))}
                    {playlists && playlists.length > 0 && playlists.map((playlist) => (
                        <NavLink
                            key={playlist.id}
                            to={`/playlist/${playlist.id}`}
                            className="px-4 py-2 hover:text-white transition-colors rounded-lg"
                            style={{ color: '#9ca3af' }}
                        >
                            <div className="flex items-center gap-3">
                                <Music size={16} />
                                <span className="text-sm truncate">{playlist.name}</span>
                            </div>
                        </NavLink>
                    ))}
                    {(!playlists || playlists.length === 0) && (
                        <div className="px-4 py-6 text-center">
                            <Music size={32} className="mx-auto mb-2" style={{ color: '#4a5568' }} />
                            <p className="text-sm" style={{ color: '#9ca3af' }}>Create your first playlist</p>
                            <button 
                                onClick={() => navigate('/library')}
                                className="mt-3 text-xs transition-colors"
                                style={{ color: '#5edb5e' }}
                            >
                                Get started
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* User Profile */}
            <div className="mt-auto pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <NavLink
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-2"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <img
                        src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.email || 'User')}
                        alt={user?.displayName || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                        style={{ border: '2px solid rgba(255, 255, 255, 0.1)' }}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.displayName || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs" style={{ color: '#9ca3af' }}>View profile</p>
                    </div>
                </NavLink>
                
                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm hover:text-white rounded-lg transition-colors text-left"
                    style={{ 
                        color: '#9ca3af',
                        backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    Log out
                </button>
            </div>
        </div>
    );
}
