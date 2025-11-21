import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 0) {
            navigate(`/search?q=${encodeURIComponent(term)}`);
        } else {
            if (location.pathname === '/search') {
                navigate('/');
            }
        }
    };

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                        title="Go Back"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => navigate(1)}
                        className="p-1 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                        title="Go Forward"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            <div className="flex-1 max-w-xl mx-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search for artists, songs, or albums..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-full leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 sm:text-sm transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Placeholder for user profile or other header actions */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border border-white/20 shadow-lg"></div>
            </div>
        </header>
    );
}
