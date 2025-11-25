import React, { memo } from 'react';
import { Music } from 'lucide-react';

const LoadingSpinner = memo(function LoadingSpinner({ size = 'md', fullScreen = false, message = '' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                {/* Outer ring */}
                <div className={`${sizes[size]} border-4 border-green-500/20 rounded-full`} />
                {/* Spinning ring */}
                <div className={`${sizes[size]} border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute inset-0`} />
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Music size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} className="text-green-500 animate-pulse" />
                </div>
            </div>
            {message && (
                <p className="text-white text-sm font-medium animate-pulse">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return spinner;
});

export default LoadingSpinner;

export const LoadingSkeleton = memo(function LoadingSkeleton({ type = 'card', count = 1 }) {
    const skeletons = {
        card: (
            <div className="animate-pulse">
                <div className="aspect-square bg-gray-800 rounded-lg mb-3" />
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
        ),
        row: (
            <div className="flex items-center gap-4 p-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-800 rounded" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
            </div>
        ),
        hero: (
            <div className="aspect-video bg-gray-800 rounded-lg animate-pulse" />
        ),
        profile: (
            <div className="flex items-center gap-4 animate-pulse">
                <div className="w-32 h-32 bg-gray-800 rounded-full" />
                <div className="flex-1">
                    <div className="h-8 bg-gray-800 rounded w-1/2 mb-3" />
                    <div className="h-4 bg-gray-800 rounded w-1/3" />
                </div>
            </div>
        )
    };

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i}>{skeletons[type]}</div>
            ))}
        </>
    );
});

export const LoadingBar = memo(function LoadingBar({ progress = 0 }) {
    return (
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
});

export const PulsingDot = memo(function PulsingDot() {
    return (
        <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
    );
});
