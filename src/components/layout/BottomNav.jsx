import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Music, ListMusic } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function BottomNav({ onOpenPlayer }) {
    const { currentTrack, isPlaying } = usePlayer();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/search' },
        { icon: Music, label: 'Library', path: '/library' },
        { icon: ListMusic, label: 'Queue', path: '/library' },
    ];

    return (
        <>
            {/* Mini Player Preview (shown when track is playing) */}
            {currentTrack && (
                <div
                    onClick={onOpenPlayer}
                    className="backdrop-blur-xl px-4 py-3 flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
                    style={{ 
                        backgroundColor: 'var(--echo-bg-card)',
                        borderTop: '1px solid var(--echo-border)'
                    }}
                >
                    <img
                        src={currentTrack.image || 'https://via.placeholder.com/48'}
                        alt={currentTrack.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                            {currentTrack.title || 'Unknown Track'}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--echo-text-secondary)' }}>
                            {currentTrack.artist || 'Unknown Artist'}
                        </p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`} style={{ backgroundColor: isPlaying ? 'var(--echo-primary-green)' : '#374151' }}>
                        <div className="w-3 h-3 border-2 border-white rounded-full" />
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="backdrop-blur-xl px-2 py-2 flex items-center justify-around pb-safe" style={{ 
                backgroundColor: 'var(--echo-bg-sidebar)',
                borderTop: '1px solid var(--echo-border)'
            }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                                isActive ? 'text-[#5edb5e]' : 'text-[#9ca3af]'
                            }`
                        }
                    >
                        <item.icon size={24} />
                        <span className="text-xs font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <style jsx>{`
                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                }
            `}</style>
        </>
    );
}
