import React from 'react';

/**
 * PlaybackModeToggle - YouTube Music style segmented control for Audio/Video mode
 * @param {String} mode - Current playback mode: 'audio' or 'video'
 * @param {Function} onModeChange - Callback when mode changes
 */
export default function PlaybackModeToggle({ mode, onModeChange }) {
    return (
        <div className="inline-flex bg-white/10 rounded-full p-1">
            <button
                onClick={() => onModeChange('audio')}
                className={`
                    px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${mode === 'audio'
                        ? 'bg-white text-black shadow-md'
                        : 'text-white hover:bg-white/10'
                    }
                `}
            >
                Canción
            </button>
            <button
                onClick={() => onModeChange('video')}
                className={`
                    px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${mode === 'video'
                        ? 'bg-white text-black shadow-md'
                        : 'text-white hover:bg-white/10'
                    }
                `}
            >
                Video
            </button>
        </div>
    );
}
