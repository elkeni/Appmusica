import React, { useState, useEffect } from 'react';
import { getYouTubeQuotaStats } from '../../api/providers/YouTubeProvider';
import { isQuotaExceeded } from '../../api/utils/youtubeFallback';

/**
 * PHASE 2: Enhanced quota monitor with fallback status
 * Shows quota usage and fallback mode status
 */
export default function QuotaMonitor() {
    const [stats, setStats] = useState(null);
    const [fallbackMode, setFallbackMode] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const updateStats = () => {
            try {
                const quotaStats = getYouTubeQuotaStats();
                const quotaExceeded = isQuotaExceeded();
                
                setStats(quotaStats);
                setFallbackMode(quotaExceeded);
                
                // Show if quota is being used OR fallback is active
                setVisible(quotaStats.used > 0 || quotaExceeded);
            } catch (error) {
                console.warn('Error getting quota stats:', error);
            }
        };

        updateStats();
        const interval = setInterval(updateStats, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    if (!visible || !stats) return null;

    const isLow = stats.remaining < 1000;
    const isCritical = stats.remaining < 500 || fallbackMode;

    return (
        <div 
            className={`fixed bottom-24 right-4 p-3 rounded-lg text-xs z-50 backdrop-blur-sm ${
                fallbackMode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' :
                isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                isLow ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/40'
            }`}
            title="YouTube API Quota Usage"
        >
            <div className="font-bold mb-1 flex items-center gap-2">
                {fallbackMode ? <span>🔄</span> : <span>📊</span>}
                <span>{fallbackMode ? 'Fallback Mode' : 'YouTube API'}</span>
            </div>
            
            {fallbackMode ? (
                <div className="space-y-1">
                    <div className="text-[10px]">Using Invidious/Piped</div>
                    <div className="text-[10px] opacity-80">
                        Quota resets at midnight PST
                    </div>
                </div>
            ) : (
                <div className="space-y-1">
                    <div>Used: {stats.used} / {stats.limit}</div>
                    <div>Remaining: {stats.remaining}</div>
                    <div className="font-bold">{stats.percentage}</div>
                </div>
            )}
            
            {isCritical && !fallbackMode && (
                <div className="mt-2 text-[10px] opacity-80">
                    ⚠️ Critical: Generate new API key
                </div>
            )}
        </div>
    );
}
