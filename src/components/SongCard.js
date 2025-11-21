import React from 'react';
import { Play, Heart } from 'lucide-react';
import SongMenu from './SongMenu';

export default function SongCard({ item, onPlay, onFavorite, onAddPlaylist, onGoToAlbum, isFavorite }) {
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

    return (
        <div className="group relative glass-fluid-subtle rounded-2xl overflow-hidden shadow-lg hover-glow transition-all duration-300 cursor-pointer" role="listitem" tabIndex={0} aria-label={getTitle()}>
            <div className="relative w-full" style={{ paddingBottom: '100%', position: 'relative' }}>
                <img src={getThumbnail()} alt={getTitle()} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} className="group-hover:scale-110 transition-transform duration-500" onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200?text=No+Image'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center gap-2 md:gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {onPlay && <button aria-label="Reproducir" onClick={(e) => { e.stopPropagation(); onPlay(item); }} className="accent-gradient rounded-full p-2 md:p-3 transition-all duration-200 transform hover:scale-110 shadow-lg"><Play size={16} className="fill-white text-white ml-0.5 md:w-5 md:h-5" /></button>}
                    {onFavorite && <button aria-label="Favorito" onClick={(e) => { e.stopPropagation(); onFavorite(item); }} className={`rounded-full p-2 md:p-3 transition-all duration-200 transform hover:scale-110 shadow-lg backdrop-blur-sm ${isFavorite ? 'bg-purple-500/90 hover:bg-purple-600' : 'bg-white/10 hover:bg-white/20'}`}><Heart size={16} className={`md:w-5 md:h-5 ${isFavorite ? 'text-white fill-white' : 'text-white'}`} /></button>}
                    <div onClick={e => e.stopPropagation()}>
                        <SongMenu
                            item={item}
                            onAddToPlaylist={onAddPlaylist}
                            onToggleFavorite={onFavorite}
                            onGoToAlbum={onGoToAlbum}
                            isFavorite={isFavorite}
                        />
                    </div>
                </div>
            </div>
            <div className="p-2 md:p-4">
                <h3 className="font-semibold text-white text-sm md:text-base truncate group-hover:text-gradient-primary transition-colors duration-300">{getTitle()}</h3>
                <p className="text-slate-300 text-xs truncate">{getArtist()}</p>
            </div>
        </div>
    );
}

