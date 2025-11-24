import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * FilterChips - YouTube Music style horizontal scrollable filter chips
 * @param {Array} chips - Array of chip objects with { id, label }
 * @param {String} activeChip - Currently active chip id
 * @param {Function} onChipClick - Callback when chip is clicked
 */
export default function FilterChips({ chips, activeChip, onChipClick }) {
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative flex items-center gap-2 px-6 py-3 bg-black border-b border-white/5">
            {/* Left Scroll Arrow */}
            {showLeftArrow && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 z-10 p-2 bg-gradient-to-r from-black via-black to-transparent hover:opacity-80 transition-opacity"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={20} className="text-white" />
                </button>
            )}

            {/* Chips Container */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {chips.map((chip) => {
                    const isActive = activeChip === chip.id;
                    return (
                        <button
                            key={chip.id}
                            onClick={() => onChipClick(chip.id)}
                            className={`
                                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                                transition-all duration-200 whitespace-nowrap
                                ${isActive
                                    ? 'bg-white text-black shadow-md'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }
                            `}
                        >
                            {chip.label}
                        </button>
                    );
                })}
            </div>

            {/* Right Scroll Arrow */}
            {showRightArrow && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 z-10 p-2 bg-gradient-to-l from-black via-black to-transparent hover:opacity-80 transition-opacity"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={20} className="text-white" />
                </button>
            )}
        </div>
    );
}
