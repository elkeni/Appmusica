import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim().length > 0) {
            navigate(`/search/results?q=${encodeURIComponent(searchTerm.trim())}`);
            // Save to recent searches
            const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
            const updated = [searchTerm.trim(), ...recent.filter(s => s !== searchTerm.trim())].slice(0, 10);
            localStorage.setItem('recentSearches', JSON.stringify(updated));
        }
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-slate-900/95 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex items-center gap-2 text-slate-400">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                        title="Atrás"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => navigate(1)}
                        className="p-1 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                        title="Adelante"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            <div className="flex-1 max-w-xl mx-2 md:mx-4">
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        placeholder="Buscar artistas, canciones o álbumes..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-full leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 sm:text-sm transition-all"
                    />
                </form>
            </div>

            <div className="flex items-center gap-4">
                {/* Placeholder for user profile or other header actions */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border border-white/20 shadow-lg"></div>
            </div>
        </header>
    );
}
