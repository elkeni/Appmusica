import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { Sidebar, BottomNav } from '../components/layout';
import { PlayerBar, MobileFullScreenPlayer } from '../components/player';

export default function MainLayout() {
    const { currentTrack } = usePlayer();
    const location = useLocation();
    const [showMobilePlayer, setShowMobilePlayer] = useState(false);
    
    // Routes without full layout (Login, etc.)
    const noLayoutRoutes = ['/login', '/register', '/auth'];
    const isNoLayoutRoute = noLayoutRoutes.includes(location.pathname);
    
    if (isNoLayoutRoute) {
        return <Outlet />;
    }

    return (
        <div className="h-screen overflow-hidden bg-[#1a1d2e] text-white flex flex-col md:flex-row">
            {/* SIDEBAR - Desktop Only */}
            <aside className="hidden md:flex md:w-60 flex-shrink-0 flex-col h-screen bg-[#0d0f1a]/95 border-r border-white/5">
                <Sidebar />
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen md:h-auto overflow-hidden bg-[#1a1d2e]">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 md:pb-24">
                    <Outlet />
                </div>

                {/* PLAYER BAR - Desktop (Docked) */}
                <div className="hidden md:block fixed bottom-0 left-0 md:left-60 right-0 z-50">
                    <PlayerBar onOpenMobile={() => setShowMobilePlayer(true)} />
                </div>
            </main>

            {/* BOTTOM NAV - Mobile Only */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
                <BottomNav onOpenPlayer={() => setShowMobilePlayer(true)} />
            </nav>

            {/* MOBILE PLAYER - Full Screen Overlay */}
            {showMobilePlayer && currentTrack && (
                <MobileFullScreenPlayer onClose={() => setShowMobilePlayer(false)} />
            )}
        </div>
    );
}
