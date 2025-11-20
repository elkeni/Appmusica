import React, { useEffect, useRef } from 'react';
import { Music } from 'lucide-react';

export default function LyricsView({ lyrics, currentTime, isLoading, error }) {
    const containerRef = useRef(null);
    const activeLineRef = useRef(null);

    // Find active line index
    const activeIndex = lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });

    // Auto-scroll to active line
    useEffect(() => {
        if (activeLineRef.current && containerRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeIndex]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-pulse">
                <Music size={48} className="mb-4 opacity-50" />
                <p>Buscando letra...</p>
            </div>
        );
    }

    if (error || !lyrics || lyrics.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Music size={48} className="mb-4 opacity-20" />
                <p className="text-center px-6">Letra no disponible para esta canción.</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="h-full overflow-y-auto px-6 py-10 custom-scrollbar scroll-smooth"
        >
            <div className="flex flex-col gap-6 text-center">
                {lyrics.map((line, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <p
                            key={index}
                            ref={isActive ? activeLineRef : null}
                            className={`transition-all duration-500 ease-out origin-center cursor-default
                ${isActive
                                    ? 'text-white font-bold text-xl md:text-2xl scale-105 blur-none opacity-100'
                                    : 'text-slate-400 font-medium text-lg blur-[1px] opacity-60 hover:opacity-80 hover:blur-none'
                                }
              `}
                        >
                            {line.text}
                        </p>
                    );
                })}
            </div>
            {/* Spacer for bottom scrolling */}
            <div className="h-[50%]"></div>
        </div>
    );
}
