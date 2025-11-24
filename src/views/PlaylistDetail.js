import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../hooks/useMusic';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/shared/SongCard';
import { getItemId } from '../utils/formatUtils';

export default function PlaylistDetail({ favorites, toggleFavorite, onAddPlaylist }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playItem } = usePlayer();
  const { search } = useMusic();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Playlist');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let query = '';
        let name = '';
        switch (id) {
          case 'trending': query = 'Top Hits 2024'; name = 'Tendencias'; break;
          case 'pop': query = 'Pop Music'; name = 'Pop Hits'; break;
          case 'rock': query = 'Rock Music'; name = 'Rock Clásico'; break;
          case 'reggaeton': query = 'Reggaeton'; name = 'Reggaeton Mix'; break;
          case 'edm': query = 'Electronic Dance Music'; name = 'EDM Vibes'; break;
          case 'indie': query = 'Indie Music'; name = 'Indie Pop'; break;
          default: query = 'Top Hits'; name = 'Playlist';
        }
        setTitle(name);
        // Buscar tracks con la nueva API unificada
        const data = await search(query, 30);
        setSongs(data);
      } catch (error) {
        console.error('Error loading playlist:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-8 pb-24">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><span>← Volver</span></button>
      <h1 className="text-3xl font-bold text-white mb-6">{title}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
        {songs.map((item) => (
          <SongCard
            key={getItemId(item)}
            item={item}
            onPlay={(t) => playItem(t, songs)}
            onFavorite={toggleFavorite}
            onAddPlaylist={onAddPlaylist}
            isFavorite={favorites.some(f => getItemId(f) === getItemId(item))}
          />
        ))}
      </div>
    </div>
  );
}
