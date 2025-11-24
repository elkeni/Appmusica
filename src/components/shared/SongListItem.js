import React from 'react';
import { Play, Heart } from 'lucide-react';

export default function SongListItem({ item, index, onPlay, onFavorite, onAddPlaylist, onGoToAlbum, onRemoveFromPlaylist, isFavorite, isInPlaylist }) {
    const getThumbnail = () => {
        if (item?.coverBig) return item.coverBig;
        if (item?.cover) return item.cover;
        if (item?.image) return item.image;
        if (item?.snippet?.thumbnails?.high?.url) return item.snippet.thumbnails.high.url;
        if (item?.snippet?.thumbnails?.medium?.url) return item.snippet.thumbnails.medium.url;
        if (item?.snippet?.thumbnails?.default?.url) return item.snippet.thumbnails.default.url;
        return 'https://placehold.co/200x200?text=No+Image';
    };

    const getTitle = () => item?.title || item?.snippet?.title || 'Canción sin título';
    const getArtist = () => item?.artist || item?.snippet?.channelTitle || 'Artista desconocido';

    const getDuration = () => {
        if (item?.duration) {
            const seconds = item.duration % 60;
            const minutes = Math.floor(item.duration / 60);
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        return '--:--';
    };

    return (
        <div
            onClick={() => onPlay(item)}
            className="group flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer border-b border-white/5 last:border-0"
        >
            <span className="text-slate-500 w-4 md:w-6 text-center font-medium text-xs md:text-sm group-hover:text-purple-400 transition-colors">{index + 1}</span>

            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img src={getThumbnail()} alt={getTitle()} className="w-full h-full object-cover" onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200?text=No+Image'; }} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={16} className="text-white fill-white" />
                </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-white font-medium text-sm md:text-base truncate group-hover:text-purple-300 transition-colors">{getTitle()}</h4>
                <p className="text-slate-400 text-xs truncate">{getArtist()}</p>
            </div>

            {onFavorite && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFavorite(item);
                    }}
                    className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-green-500' : 'text-slate-500 hover:text-white opacity-0 group-hover:opacity-100'}`}
                >
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                </button>
            )}

            <span className="text-slate-500 text-xs md:text-sm font-medium w-10 md:w-12 text-right">
                {getDuration()}
            </span>
        </div>
    );
}
