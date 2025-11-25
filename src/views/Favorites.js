import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import SongListItem from '../components/shared/SongListItem';
import { getItemId } from '../utils/formatUtils';

export default function Favorites({ favorites, toggleFavorite, onAddPlaylist }) {
  const navigate = useNavigate();
  const { playItem } = usePlayer();

  return (
    <div className="p-4 md:p-8 pb-24 bg-[#1a1d2e] min-h-screen">
      <div className="mb-4 md:mb-8 rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative h-32 md:h-64 bg-gradient-to-br from-[#4f9cf9] to-[#0f1117]">
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="flex items-end gap-4 md:gap-6">
              <div className="w-20 h-20 md:w-48 md:h-48 rounded-xl overflow-hidden shadow-2xl border-2 md:border-4 border-white/20 flex-shrink-0 bg-[#1e2139] flex items-center justify-center">
                <Heart size={32} className="text-[#4f9cf9] fill-[#4f9cf9] md:w-16 md:h-16" />
              </div>
              <div className="flex-1 pb-1 md:pb-4">
                <p className="text-[10px] md:text-sm text-[#b4b8c5] font-semibold mb-1 md:mb-2 uppercase tracking-wider">Collection</p>
                <h1 className="text-2xl md:text-6xl font-black text-white mb-1 md:mb-3">My Favorites</h1>
                <div className="flex items-center gap-4 text-xs md:text-sm text-[#b4b8c5] font-medium">
                  <span>• {favorites.length} songs you love</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-[#1e2139]/50 rounded-3xl p-2 md:p-4 backdrop-blur-sm">
        {favorites && favorites.length > 0 ? (
          favorites.map((track, idx) => (
            <SongListItem
              key={getItemId(track)}
              item={track}
              index={idx}
              onPlay={(t) => playItem(t, favorites)}
              onFavorite={toggleFavorite}
              onAddPlaylist={onAddPlaylist}
              isFavorite={true}
            />
          ))
        ) : (
          <div className="py-20 text-center text-[#b4b8c5]">
            <Heart size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No favorites yet</p>
            <p className="text-sm">Like songs to save them here</p>
            <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 rounded-full bg-[#4f9cf9] hover:bg-[#3d8ae6] text-white font-bold transition-colors">Explore Music</button>
          </div>
        )}
      </div>
    </div>
  );
}
