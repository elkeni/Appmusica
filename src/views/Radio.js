import React, { useState, useEffect } from 'react';
import { Radio as RadioIcon, Play, Music2, Disc3, Wifi } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useMusic } from '../hooks/useMusic';

export default function Radio({ onToggleFavorite, favorites }) {
  const { playItem } = usePlayer();
  const { search } = useMusic();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRadioStations = async () => {
      setLoading(true);
      try {
        // Create radio stations based on genres
        const genres = [
          { name: 'Pop Radio', query: 'Pop Hits 2024', color: 'from-pink-500 to-rose-500', icon: '🎵' },
          { name: 'Rock Radio', query: 'Rock Music', color: 'from-red-500 to-orange-500', icon: '🎸' },
          { name: 'Reggaeton Radio', query: 'Reggaeton Mix', color: 'from-yellow-500 to-red-500', icon: '💃' },
          { name: 'Electronic Radio', query: 'Electronic Dance Music', color: 'from-cyan-500 to-blue-500', icon: '🎧' },
          { name: 'Hip Hop Radio', query: 'Hip Hop Beats', color: 'from-purple-500 to-indigo-500', icon: '🎤' },
          { name: 'Latin Radio', query: 'Latin Music Hits', color: 'from-amber-500 to-orange-500', icon: '🎺' },
          { name: 'Indie Radio', query: 'Indie Alternative', color: 'from-teal-500 to-green-500', icon: '🎹' },
          { name: 'R&B Soul Radio', query: 'R&B Soul Music', color: 'from-pink-600 to-purple-600', icon: '💜' },
        ];

        setStations(genres);
      } catch (error) {
        console.error('Error loading radio stations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRadioStations();
  }, []);

  const startRadio = async (station) => {
    try {
      // Buscar tracks con la nueva API unificada
      const tracks = await search(station.query, 50);
      if (tracks && tracks.length > 0) {
        // Play first track and set queue to remaining tracks
        playItem(tracks[0], tracks);
      }
    } catch (error) {
      console.error('Error starting radio:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-950">
        <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 pb-24">
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl">
              <RadioIcon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">Radio</h1>
              <p className="text-slate-400 text-sm">Descubre música sin parar</p>
            </div>
          </div>
        </div>

        {/* Featured Station */}
        <section className="mb-8">
          <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 shadow-2xl">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative h-full p-6 md:p-8 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-3">
                <Wifi size={20} className="text-white animate-pulse" />
                <span className="text-white/90 text-sm font-semibold uppercase tracking-wider">En Vivo</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">CloudTune Mix</h2>
              <p className="text-white/80 text-sm mb-4">Los mejores éxitos del momento</p>
              <button
                onClick={() => startRadio({ name: 'CloudTune Mix', query: 'Top Hits 2024' })}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform self-start shadow-xl"
              >
                <Play size={20} fill="currentColor" />
                Reproducir
              </button>
            </div>
          </div>
        </section>

        {/* Stations Grid */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Estaciones de Radio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations.map((station, index) => (
              <div
                key={index}
                className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={() => startRadio(station)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${station.color}`} />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                
                {/* Content */}
                <div className="relative h-full p-6 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{station.icon}</span>
                    <div className="p-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <RadioIcon size={20} className="text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{station.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/80 text-xs">En vivo</span>
                    </div>
                  </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="p-4 bg-white rounded-full shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                    <Play size={24} className="text-black" fill="currentColor" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section className="mt-12 p-6 bg-slate-900/50 rounded-2xl border border-white/5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-600/20 rounded-xl flex-shrink-0">
              <Music2 size={24} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-2">¿Cómo funciona Radio?</h3>
              <p className="text-slate-400 text-sm">
                Selecciona una estación y disfruta de música continua personalizada según el género. 
                Nuestro sistema crea listas de reproducción dinámicas con las mejores canciones.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
