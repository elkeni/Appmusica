import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, User, Play, Pause } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function BottomNav({ onOpenPlayer }) {
    const { currentTrack, isPlaying, togglePlayPause } = usePlayer();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/search' },
        { icon: Heart, label: 'Favorites', path: '/favorites' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <>
            {/* Mini Player Preview (shown when track is playing) */}
            {currentTrack && (
                <div className="bg-gradient-to-r from-[#0d0f1a] via-[#1a1d2e] to-[#0d0f1a] border-t border-[#4f9cf9]/20 shadow-lg shadow-black/20">
                    <div
                        onClick={onOpenPlayer}
                        className="px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-white/5 transition-colors"
                    >
                        {/* Album Art with playing indicator */}
                        <div className="relative">
                            <img
                                src={currentTrack.image || 'https://via.placeholder.com/48'}
                                alt={currentTrack.title}
                                className={`w-12 h-12 rounded-xl object-cover shadow-lg ${isPlaying ? 'ring-2 ring-[#4f9cf9]/50' : ''}`}
                                onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
                            />
                            {isPlaying && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#4f9cf9] rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </div>
                            )}
                        </div>
                        
                        {/* Track info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {currentTrack.title || 'Unknown Track'}
                            </p>
                            <p className="text-xs text-[#b4b8c5] truncate">
                                {currentTrack.artist || 'Unknown Artist'}
                            </p>
                        </div>
                        
                        {/* Play/Pause button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePlayPause();
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                                isPlaying 
                                    ? 'bg-[#4f9cf9] text-white shadow-lg shadow-[#4f9cf9]/30' 
                                    : 'bg-[#1e2139] text-white border border-white/10'
                            }`}
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-0.5 bg-[#1e2139]">
                        <div className="h-full bg-gradient-to-r from-[#4f9cf9] to-[#3d8ae6] w-1/3 rounded-full" />
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="bg-[#0d0f1a]/95 backdrop-blur-xl border-t border-white/5 px-2 py-1 flex items-center justify-around safe-area-bottom">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl transition-all active:scale-95 ${
                                isActive
                                    ? 'text-[#4f9cf9] bg-[#4f9cf9]/10'
                                    : 'text-[#667085] hover:text-[#b4b8c5]'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`relative ${isActive ? 'transform scale-110' : ''} transition-transform`}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    {isActive && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#4f9cf9] rounded-full" />
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <style jsx>{`
                .safe-area-bottom {
                    padding-bottom: max(env(safe-area-inset-bottom, 8px), 8px);
                }
            `}</style>
        </>
    );
}
