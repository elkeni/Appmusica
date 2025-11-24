import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, TrendingUp, Clock, Music } from 'lucide-react';

export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Trending searches or suggestions
  const trendingSearches = [
    'Reggaeton 2024',
    'Pop Hits',
    'Rock Clásico',
    'Electronic Music',
    'Latin Music',
    'Hip Hop',
  ];

  const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]').slice(0, 5);

  return (
    <div className="bg-slate-950 pb-24">
      <div className="p-4 md:p-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-6">Buscar</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué quieres escuchar?"
              className="w-full py-4 pl-12 pr-4 bg-slate-900/80 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              autoFocus
            />
          </form>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={20} />
              Búsquedas Recientes
            </h2>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search);
                    navigate(`/search/results?q=${encodeURIComponent(search)}`);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-slate-900/50 hover:bg-slate-800/80 rounded-xl transition-colors text-left group"
                >
                  <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-purple-600 transition-colors">
                    <Clock size={18} className="text-slate-400 group-hover:text-white" />
                  </div>
                  <span className="text-white font-medium">{search}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Trending Searches */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Búsquedas Populares
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {trendingSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(search);
                  navigate(`/search/results?q=${encodeURIComponent(search)}`);
                  // Save to recent searches
                  const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
                  const updated = [search, ...recent.filter(s => s !== search)].slice(0, 10);
                  localStorage.setItem('recentSearches', JSON.stringify(updated));
                }}
                className="p-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 rounded-xl transition-all text-left group border border-white/5 hover:border-white/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Music size={16} className="text-purple-400" />
                </div>
                <span className="text-white font-semibold text-sm">{search}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Browse Categories */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Explorar por Género</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Pop', color: 'from-pink-500 to-rose-500', icon: '🎵' },
              { name: 'Rock', color: 'from-red-500 to-orange-500', icon: '🎸' },
              { name: 'Hip Hop', color: 'from-purple-500 to-indigo-500', icon: '🎤' },
              { name: 'Electronic', color: 'from-cyan-500 to-blue-500', icon: '🎧' },
              { name: 'Latin', color: 'from-yellow-500 to-red-500', icon: '💃' },
              { name: 'R&B', color: 'from-pink-500 to-purple-500', icon: '🎹' },
              { name: 'Jazz', color: 'from-amber-500 to-orange-500', icon: '🎺' },
              { name: 'Classical', color: 'from-slate-500 to-gray-500', icon: '🎻' },
            ].map((genre) => (
              <button
                key={genre.name}
                onClick={() => {
                  navigate(`/search/results?q=${encodeURIComponent(genre.name + ' Music')}`);
                }}
                className={`relative h-24 md:h-32 rounded-2xl bg-gradient-to-br ${genre.color} overflow-hidden group hover:scale-105 transition-transform shadow-lg`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="relative h-full p-4 flex flex-col justify-between">
                  <span className="text-3xl">{genre.icon}</span>
                  <span className="text-white font-bold text-sm md:text-base">{genre.name}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
