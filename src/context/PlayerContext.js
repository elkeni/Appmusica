import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getYouTubeVideoForTrack, getSimilarTracks } from '../services/hybridMusicService';
import { getItemId } from '../utils/formatUtils';
import { extractPaletteFromImage, darkenHex } from '../utils/colorUtils';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [queue, setQueue] = useState([]);
    const [history, setHistory] = useState([]);
    const [playbackContext, setPlaybackContext] = useState(null); // { type: 'ALBUM'|'PLAYLIST'|'AUTOPLAY', id: ... }
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [waveformBaseline, setWaveformBaseline] = useState([]);

    const playerRef = useRef(null);
    const ytPlayerRef = useRef(null);

    // Initialize waveform
    const initWaveformFor = (trackId) => {
        if (!trackId) return;
        const seed = trackId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
        const arr = Array.from({ length: 32 }).map((_, i) => {
            const v = ((seed + i * 13) % 5) + 2;
            return v;
        });
        setWaveformBaseline(arr);
    };

    // Dynamic Theme Colors
    useEffect(() => {
        let cancelled = false;
        const applyDefault = () => {
            document.documentElement.style.setProperty('--primary', '#ff2d8f');
            document.documentElement.style.setProperty('--primary-600', '#e61f79');
            document.documentElement.style.setProperty('--accent', '#06b6d4');
            document.documentElement.style.setProperty('--accent-600', '#0891b2');
            document.documentElement.style.setProperty('--gradient-start', '#0f1724');
            document.documentElement.style.setProperty('--gradient-end', '#071027');
            document.documentElement.style.setProperty('--selection', 'rgba(255,45,143,0.18)');
        };

        if (!currentTrack || !currentTrack.image) {
            applyDefault();
            return;
        }

        (async () => {
            const palette = await extractPaletteFromImage(currentTrack.image, 40);
            if (cancelled) return;
            if (palette && palette.primary) {
                const p = palette.primary;
                const s = palette.secondary || darkenHex(p, 0.35);
                const gEnd = darkenHex(p, 0.45);
                document.documentElement.style.setProperty('--primary', p);
                document.documentElement.style.setProperty('--primary-600', darkenHex(p, 0.18));
                document.documentElement.style.setProperty('--accent', s);
                document.documentElement.style.setProperty('--accent-600', darkenHex(s, 0.18));
                document.documentElement.style.setProperty('--gradient-start', p);
                document.documentElement.style.setProperty('--gradient-end', gEnd);
                document.documentElement.style.setProperty('--selection', p + '33');
            } else {
                applyDefault();
            }
        })();

        return () => { cancelled = true; };
    }, [currentTrack?.image]); // eslint-disable-line react-hooks/exhaustive-deps

    // YouTube Player Setup
    useEffect(() => {
        let intervalId = null;
        let cancelled = false;
        const ensureAPI = () => new Promise((resolve) => {
            if (window.YT && window.YT.Player) return resolve();
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = () => resolve();
        });

        const createPlayer = async () => {
            if (!playerRef.current) return;
            await ensureAPI();
            if (cancelled) return;
            if (!ytPlayerRef.current) {
                ytPlayerRef.current = new window.YT.Player(playerRef.current, {
                    height: '1', width: '1', videoId: currentTrack?.id || '',
                    playerVars: { origin: window.location.origin, playsinline: 1, autoplay: isPlaying ? 1 : 0, controls: 0, modestbranding: 1 },
                    events: {
                        onReady: (event) => {
                            try {
                                if (typeof event.target.getDuration === 'function') {
                                    const d = event.target.getDuration();
                                    if (d && !isNaN(d)) setDuration(d);
                                }
                                event.target.setVolume(Math.round(volume * 100));
                                if (isPlaying) event.target.playVideo();
                            } catch (err) { console.warn('YT onReady err', err); }
                        },
                        onStateChange: (e) => {
                            const YT = window.YT;
                            if (!YT) return;
                            if (e.data === YT.PlayerState.PLAYING) {
                                setIsPlaying(true);
                                try {
                                    const d = ytPlayerRef.current.getDuration();
                                    if (d && !isNaN(d)) setDuration(d);
                                } catch (err) { }
                            } else if (e.data === YT.PlayerState.PAUSED) {
                                setIsPlaying(false);
                            } else if (e.data === YT.PlayerState.ENDED) {
                                setIsPlaying(false);
                                handleNextTrack();
                            }
                        }
                    }
                });
            } else {
                try {
                    if (currentTrack && currentTrack.id) {
                        if (typeof ytPlayerRef.current.loadVideoById === 'function') {
                            try {
                                ytPlayerRef.current.loadVideoById({ videoId: currentTrack.id, suggestedQuality: 'small' });
                            } catch (inner) {
                                ytPlayerRef.current.loadVideoById(currentTrack.id);
                            }
                        }
                    }
                } catch (err) { console.warn('Error loading video by id', err); }
            }

            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
                try {
                    if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
                        const t = ytPlayerRef.current.getCurrentTime();
                        setCurrentTime(Number(t) || 0);
                    }
                } catch (err) { }
            }, 400);
        };

        if (currentTrack && currentTrack.id) {
            createPlayer();
            initWaveformFor(currentTrack.id || currentTrack.title || '');
        }

        return () => {
            cancelled = true;
            if (intervalId) clearInterval(intervalId);
        };
    }, [currentTrack?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // When a new track is set, we rely on `setIsPlaying(true)` from `playItem`,
    // the YT player's `onReady` handler, and the `Player Controls Sync` effect
    // below to perform the actual play. Removing an extra effect that forced
    // autoplay prevents race conditions where re-renders could auto-resume playback.

    // Player Controls Sync
    useEffect(() => {
        try {
            if (ytPlayerRef.current) {
                if (isPlaying) {
                    if (typeof ytPlayerRef.current.playVideo === 'function') ytPlayerRef.current.playVideo();
                } else {
                    if (typeof ytPlayerRef.current.pauseVideo === 'function') ytPlayerRef.current.pauseVideo();
                }
                if (typeof ytPlayerRef.current.setVolume === 'function') ytPlayerRef.current.setVolume(Math.round(volume * 100));
            }
        } catch (err) { }
    }, [isPlaying, volume]); // eslint-disable-line react-hooks/exhaustive-deps

    // Media Session API
    useEffect(() => {
        if ('mediaSession' in navigator && currentTrack) {
            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.artist || currentTrack.originalData?.artist || 'Unknown Artist',
                album: currentTrack.album || currentTrack.originalData?.album?.title || '',
                artwork: [
                    { src: currentTrack.image, sizes: '512x512', type: 'image/jpeg' },
                    { src: currentTrack.image, sizes: '256x256', type: 'image/jpeg' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                setIsPlaying(true);
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                setIsPlaying(false);
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                handlePrevTrack();
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                handleNextTrack();
            });
        }
    }, [currentTrack]);

    const playItem = async (item, context = null) => {
        try {
            const isDeezer = item?.deezerId || (item?.id && !item?.id?.videoId && !item?.videoId);
            let videoId;
            let trackData;

            if (isDeezer) {
                setLoading(true);
                const cacheKey = `yt_${item.deezerId || item.id}`;
                const cached = localStorage.getItem(cacheKey);

                if (cached) {
                    videoId = cached;
                } else {
                    const ytApiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
                    const result = await getYouTubeVideoForTrack(item, ytApiKey);
                    if (result && result.youtubeId) {
                        videoId = result.youtubeId;
                        localStorage.setItem(cacheKey, videoId);
                    } else {
                        setError(`No se encontró video para "${item.title}" de ${item.artist}`);
                        setLoading(false);
                        return;
                    }
                }

                trackData = {
                    id: videoId,
                    title: item.title || 'Desconocido',
                    image: item.coverBig || item.cover || item.image || '',
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    type: 'hybrid',
                    originalData: item,
                };
                setLoading(false);
            } else {
                videoId = item?.id?.videoId || item?.videoId;
                if (!videoId) {
                    setError('No se pudo reproducir este elemento.');
                    return;
                }
                trackData = {
                    id: videoId,
                    title: item.snippet?.title || item.title || 'Desconocido',
                    image: item.snippet?.thumbnails?.high?.url || item.image || '',
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    type: 'youtube',
                    originalData: item,
                };
            }

            setCurrentTrack(trackData);
            // Mark playing intention; the Player Controls Sync effect and
            // YT onReady will handle calling the player's play method when
            // the player is ready. This avoids calling play() directly here
            // and prevents race conditions that cause flicker/auto-resume.
            setIsPlaying(true);

            setHistory(prev => [trackData, ...prev.filter(t => t.id !== trackData.id)].slice(0, 20));

            // Queue Logic
            const isContextArray = Array.isArray(context);
            const isContextObjectWithItems = context && typeof context === 'object' && Array.isArray(context.items);

            if (isContextArray || isContextObjectWithItems) {
                const items = isContextArray ? context : context.items;
                // Robust ID comparison
                const targetId = getItemId(item);
                // Check against id or providerId
                const index = items.findIndex(t => {
                    const tId = getItemId(t);
                    return String(tId) === String(targetId) ||
                        (t.providerId && String(t.providerId) === String(targetId)) ||
                        (item.providerId && String(tId) === String(item.providerId));
                });

                if (index !== -1) {
                    // Set queue to subsequent tracks
                    setQueue(items.slice(index + 1));
                    setPlaybackContext({ type: 'COLLECTION', id: context?.id || 'list' });
                } else {
                    console.warn('Track not found in provided context, clearing queue');
                    setQueue([]);
                }
            } else if (context === 'KEEP') {
                // Playing from Queue - do not reset
            } else {
                setQueue([]);
                setPlaybackContext({ type: 'AUTOPLAY' });
                getSimilarTracks(item, 10).then(similar => {
                    setQueue(similar);
                });
            }
        } catch (error) {
            console.error('Error playing item:', error);
            setError('Error al reproducir la canción.');
            setLoading(false);
        }
    };

    const handleNextTrack = async () => {
        if (queue.length > 0) {
            const nextTrack = queue[0];
            setQueue(prev => prev.slice(1));
            await playItem(nextTrack, 'KEEP');
        } else if (playbackContext?.type === 'AUTOPLAY' && currentTrack) {
            try {
                const similar = await getSimilarTracks(currentTrack.originalData || currentTrack, 5);
                if (similar.length > 0) {
                    const next = similar[0];
                    setQueue(similar.slice(1));
                    await playItem(next, 'KEEP');
                } else {
                    setIsPlaying(false);
                }
            } catch (e) {
                console.error('Autoplay error:', e);
                setIsPlaying(false);
            }
        } else {
            setIsPlaying(false);
        }
    };

    const handlePrevTrack = () => {
        // Basic implementation - ideally should go to history
        if (currentTime > 3) {
            if (ytPlayerRef.current) ytPlayerRef.current.seekTo(0);
            return;
        }
        // For now just restart if no history logic implemented fully
        if (history.length > 1) {
            // const prev = history[1];
            // This is a bit simplistic, history management needs to be robust
            // For now, let's just restart current track
            if (ytPlayerRef.current) ytPlayerRef.current.seekTo(0);
        }
    };

    const togglePlayPause = () => {
        if (!currentTrack) return;
        setIsPlaying(prev => !prev);
    };

    const value = {
        currentTrack,
        isPlaying,
        volume,
        setVolume,
        queue,
        setQueue,
        history,
        currentTime,
        duration,
        waveformBaseline,
        playItem,
        togglePlayPause,
        nextTrack: handleNextTrack,
        prevTrack: handlePrevTrack,
        playerRef,
        loading,
        error
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
            {/* Hidden Player */}
            {currentTrack && (
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                    <div id="yt-player" ref={playerRef} aria-hidden="true" />
                </div>
            )}
        </PlayerContext.Provider>
    );
};
