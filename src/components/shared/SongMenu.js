import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Heart, ListMusic, Disc, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function SongMenu({
    item,
    onAddToPlaylist,
    onToggleFavorite,
    onGoToAlbum,
    onRemoveFromPlaylist,
    isFavorite,
    isInPlaylist
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', () => setIsOpen(false), true);
            window.addEventListener('resize', () => setIsOpen(false));
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', () => setIsOpen(false), true);
            window.removeEventListener('resize', () => setIsOpen(false));
        };
    }, [isOpen]);

    const toggleMenu = (e) => {
        e.stopPropagation();
            if (!isOpen) {
            const rect = buttonRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Default position (bottom-right relative to button)
            let top = rect.bottom + 8;
            let left = rect.right - 200; // Width of menu approx 200px

            // Adjust if off screen
            if (left < 10) left = 10;
            if (top + 200 > windowHeight) top = rect.top - 200; // Flip up if no space below

            setPosition({ top, left });
        }
        setIsOpen(!isOpen);
    };

    const handleAction = (action, e) => {
        e.stopPropagation();
        setIsOpen(false);
        action();
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                aria-label="More options"
            >
                <MoreVertical size={20} />
            </button>

            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    style={{ top: position.top, left: position.left }}
                    className="fixed z-[100] w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-2 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={(e) => handleAction(() => onAddToPlaylist(item), e)}
                        className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3 transition-colors"
                    >
                        <ListMusic size={18} className="text-purple-400" />
                        Add to Playlist...
                    </button>

                    <button
                        onClick={(e) => handleAction(() => onToggleFavorite(item), e)}
                        className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3 transition-colors"
                    >
                        <Heart size={18} className={isFavorite ? "text-red-500 fill-red-500" : "text-slate-400"} />
                        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>

                    {onGoToAlbum && (
                        <button
                            onClick={(e) => handleAction(() => onGoToAlbum(item), e)}
                            className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3 transition-colors"
                        >
                            <Disc size={18} className="text-cyan-400" />
                            Go to Album
                        </button>
                    )}

                    {isInPlaylist && onRemoveFromPlaylist && (
                        <>
                            <div className="h-px bg-white/10 my-1"></div>
                            <button
                                onClick={(e) => handleAction(() => onRemoveFromPlaylist(item), e)}
                                className="w-full px-4 py-3 text-left text-sm text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                            >
                                <Trash2 size={18} />
                                Remove from this playlist
                            </button>
                        </>
                    )}
                </div>,
                document.body
            )}
        </>
    );
}
