import React from 'react';

/**
 * SearchFilterTabs - YouTube Music style search filter tabs
 * @param {String} activeFilter - Currently active filter
 * @param {Function} onFilterChange - Callback when filter changes
 */
export default function SearchFilterTabs({ activeFilter, onFilterChange }) {
    const filters = [
        { id: 'all', label: 'Todo' },
        { id: 'songs', label: 'Canciones' },
        { id: 'videos', label: 'Videos' },
        { id: 'albums', label: 'Álbumes' },
        { id: 'playlists', label: 'Listas' },
    ];

    return (
        <div className="border-b border-white/10 bg-black sticky top-0 z-20">
            <div className="flex gap-6 px-6 overflow-x-auto hide-scrollbar">
                {filters.map((filter) => {
                    const isActive = activeFilter === filter.id;
                    return (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`
                                relative py-3 px-2 text-sm font-medium whitespace-nowrap
                                transition-colors duration-200
                                ${isActive
                                    ? 'text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                }
                            `}
                        >
                            {filter.label}
                            {/* Active Underline */}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
