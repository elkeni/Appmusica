import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { getYouTubeVideoForTrack, getSimilarTracks, getDeezerCharts, getRecommendationsBasedOnHistory, searchDeezer } from '../services/hybridMusicService';
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
    const [playbackMode, setPlaybackMode] = useState('audio'); // 'audio' or 'video'
    const [radioMode, setRadioMode] = useState(false); // Indicates when Infinite Radio Mode is active
    const [fetchingRecommendations, setFetchingRecommendations] = useState(false); // Loading state for radio

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
            if (firstScriptTag && firstScriptTag.parentNode) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            } else if (document.head) {
                document.head.appendChild(tag);
            } else {
                // last resort
                document.body.appendChild(tag);
            }
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

    // CRITICAL FIX: Force autoplay when track changes (Phase 1)
    useEffect(() => {
        if (currentTrack && currentTrack.id && ytPlayerRef.current) {
            // Small delay to ensure player is ready
            const timer = setTimeout(() => {
                try {
                    if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
                        const playPromise = ytPlayerRef.current.playVideo();
                        if (playPromise && playPromise.catch) {
                            playPromise.catch(error => {
                                console.warn('⚠️ Autoplay blocked by browser:', error);
                                // Show toast or notification here if needed
                            });
                        }
                        setIsPlaying(true); // Ensure state is synced
                    }
                } catch (err) {
                    console.warn('Autoplay error:', err);
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentTrack?.id]);

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

    // Pre-cache recommendations when queue is running low (Performance optimization)
    useEffect(() => {
        const shouldPreload = queue.length <= 2 && queue.length > 0 && currentTrack && playbackContext?.type === 'AUTOPLAY';
        
        if (shouldPreload && !fetchingRecommendations) {
            console.log('🔄 Pre-loading recommendations (queue running low)...');
            const sourceTrack = currentTrack?.originalData || currentTrack;
            
            getSimilarTracks(sourceTrack, 10)
                .then(similar => {
                    if (similar && similar.length > 0) {
                        console.log(`✅ Pre-loaded ${similar.length} tracks`);
                        setQueue(prev => [...prev, ...similar]);
                    }
                })
                .catch(err => console.warn('Pre-load failed:', err));
        }
    }, [queue.length, currentTrack, playbackContext, fetchingRecommendations]);

    // Media Session API is attached later after handler functions are defined.

    const playItem = useCallback(async (item, context = null) => {
        try {
            //OPTIMIZATION: Skip API call if track already has video ID
            const existingVideoId = item?.id?.videoId || item?.videoId || item?.youtubeId;
            if (existingVideoId) {
                console.debug && console.debug(`⚡ Fast path: Track already has videoId ${existingVideoId}`);
                const trackData = {
                    id: existingVideoId,
                    title: item.snippet?.title || item.title || 'Desconocido',
                    artist: item.artist || item.snippet?.channelTitle || 'Desconocido',
                    image: item.snippet?.thumbnails?.high?.url || item.image || item.cover || item.coverBig || '',
                    url: `https://www.youtube.com/watch?v=${existingVideoId}`,
                    type: item.type || 'youtube',
                    originalData: item,
                };
                setCurrentTrack(trackData);
                setIsPlaying(true);
                setHistory(prev => [trackData, ...prev.filter(t => t.id !== trackData.id)].slice(0, 20));

                // Queue logic handled below
                const isContextArray = Array.isArray(context);
                const isContextObjectWithItems = context && typeof context === 'object' && Array.isArray(context.items);
                if (isContextArray || isContextObjectWithItems) {
                    const items = isContextArray ? context : context.items;
                    const targetId = getItemId(item);
                    const index = items.findIndex(t => {
                        const tId = getItemId(t);
                        return String(tId) === String(targetId) ||
                            (t.providerId && String(t.providerId) === String(targetId)) ||
                            (item.providerId && String(tId) === String(item.providerId));
                    });
                    if (index !== -1) {
                        setQueue(items.slice(index + 1));
                        setPlaybackContext({ type: 'COLLECTION', id: context?.id || 'list' });
                        setRadioMode(false); // Clear radio mode when playing from a collection
                    } else {
                        setQueue([]);
                    }
                } else if (context === 'KEEP') {
                    // Keep existing queue - radio mode state remains unchanged
                } else {
                    setQueue([]);
                    setPlaybackContext({ type: 'AUTOPLAY' });
                    setRadioMode(false); // Will activate later if needed
                    getSimilarTracks(item, 10).then(similar => setQueue(similar));
                }
                return;
            }

            const isDeezer = item?.deezerId || (item?.id && !item?.id?.videoId && !item?.videoId);
            let videoId;
            let trackData;

            if (isDeezer) {
                setLoading(true);
                setError(null); // Clear previous errors
                const cacheKey = `yt_${item.deezerId || item.id}`;
                const cached = localStorage.getItem(cacheKey);

                if (cached) {
                    videoId = cached;
                } else {
                    const ytApiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
                    const result = await getYouTubeVideoForTrack(item, ytApiKey);

                    // Handle all cases including fallback mode
                    if (result && result.youtubeId) {
                        videoId = result.youtubeId;

                        // Only cache real results, not fallback IDs
                        if (!result.fallbackMode) {
                            localStorage.setItem(cacheKey, videoId);
                        }

                        // Show user-friendly message if in fallback mode
                        if (result.fallbackMode) {
                            if (result.error === 'QUOTA_EXCEEDED') {
                                setError('⚠️ Límite de API alcanzado. Reproduciendo canción de prueba.');
                                console.warn('🎵 Fallback Mode: API quota exceeded,playing test track');
                            } else if (result.error === 'NOT_FOUND') {
                                setError(`⚠️ "${item.title}" no encontrada. Reproduciendo canción alternativa.`);
                            } else {
                                setError('⚠️ Modo de prueba activado.');
                            }
                            // Clear error after 5 seconds
                            setTimeout(() => setError(null), 5000);
                        }
                    } else {
                        // This should never happen with fallback, but keep as safety
                        setError(`No se pudo cargar "${item.title}"`);
                        setLoading(false);
                        return;
                    }
                }

                trackData = {
                    id: videoId,
                    title: item.title || 'Desconocido',
                    artist: item.artist || 'Desconocido',
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
                    artist: item.artist || item.snippet?.channelTitle || 'Desconocido',
                    image: item.snippet?.thumbnails?.high?.url || item.image || '',
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    type: 'youtube',
                    originalData: item,
                };
            }

            setCurrentTrack(trackData);
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
    }, [setLoading, setError, setCurrentTrack, setIsPlaying, setHistory, setQueue, setPlaybackContext]);

    const handleNextTrack = useCallback(async () => {
        if (queue.length > 0) {
            const nextTrack = queue[0];
            setQueue(prev => prev.slice(1));
            setRadioMode(false); // Clear radio mode when playing from queue
            await playItem(nextTrack, 'KEEP');
        } else {
            // PHASE 2: INFINITE RADIO MODE - Never stop the music!
            console.log('🎵 Queue ended. Activating Infinite Radio Mode...');
            setRadioMode(true);
            setFetchingRecommendations(true);
            
            try {
                const sourceTrack = currentTrack?.originalData || currentTrack;
                if (!sourceTrack) {
                    console.warn('No current track for recommendations');
                    setIsPlaying(false);
                    setRadioMode(false);
                    setFetchingRecommendations(false);
                    return;
                }

                let recommendations = [];
                
                // STRATEGY 1: YouTube Related Videos (Best quality recommendations)
                if (currentTrack?.videoId && history.length > 0) {
                    try {
                        console.log('🎯 Strategy 1: Trying YouTube related videos...');
                        const ytApiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
                        const ytRecs = await getRecommendationsBasedOnHistory(history, ytApiKey, 15);
                        
                        if (ytRecs && ytRecs.length > 0) {
                            console.log(`✅ Found ${ytRecs.length} YouTube recommendations`);
                            recommendations = ytRecs;
                        }
                    } catch (e) {
                        console.warn('YouTube recommendations failed:', e.message);
                    }
                }

                // STRATEGY 2: Deezer Similar Tracks (Artist + Genre based)
                if (recommendations.length === 0) {
                    try {
                        console.log('🎯 Strategy 2: Trying Deezer similar tracks...');
                        const similar = await getSimilarTracks(sourceTrack, 12);
                        
                        if (similar && similar.length > 0) {
                            console.log(`✅ Found ${similar.length} similar Deezer tracks`);
                            recommendations = similar;
                        }
                    } catch (e) {
                        console.warn('Deezer similar tracks failed:', e.message);
                    }
                }

                // STRATEGY 3: Search by Artist (If we know the artist)
                if (recommendations.length === 0 && sourceTrack.artist) {
                    try {
                        console.log('🎯 Strategy 3: Searching by artist...');
                        const artistTracks = await searchDeezer(sourceTrack.artist, 'artist', 10);
                        
                        if (artistTracks && artistTracks.length > 0) {
                            console.log(`✅ Found ${artistTracks.length} tracks by ${sourceTrack.artist}`);
                            recommendations = artistTracks;
                        }
                    } catch (e) {
                        console.warn('Artist search failed:', e.message);
                    }
                }

                // STRATEGY 4: Top Charts (Last resort fallback)
                if (recommendations.length === 0) {
                    try {
                        console.log('🎯 Strategy 4: Fallback to top charts...');
                        const charts = await getDeezerCharts(15);
                        
                        if (charts && charts.length > 0) {
                            console.log(`✅ Loaded ${charts.length} chart tracks`);
                            recommendations = charts;
                        }
                    } catch (e) {
                        console.error('Charts fallback failed:', e.message);
                    }
                }

                // Play recommendations if found
                if (recommendations.length > 0) {
                    // Filter out tracks we've already played recently
                    const recentIds = history.slice(0, 5).map(t => t.id || t.videoId);
                    const filtered = recommendations.filter(r => !recentIds.includes(r.id || r.videoId));
                    
                    const tracksToUse = filtered.length > 0 ? filtered : recommendations;
                    const next = tracksToUse[0];
                    
                    // Add remaining tracks to queue
                    setQueue(tracksToUse.slice(1));
                    
                    // Set context to AUTOPLAY for continuous radio
                    setPlaybackContext({ type: 'AUTOPLAY', source: 'radio' });
                    
                    setFetchingRecommendations(false);
                    
                    // Play next track immediately
                    console.log(`🎵 Playing: ${next.title} by ${next.artist}`);
                    await playItem(next, 'KEEP');
                } else {
                    console.error('❌ All recommendation strategies failed - stopping playback');
                    setIsPlaying(false);
                    setRadioMode(false);
                    setFetchingRecommendations(false);
                }
            } catch (e) {
                console.error('❌ Infinite Radio critical error:', e);
                setIsPlaying(false);
                setRadioMode(false);
                setFetchingRecommendations(false);
            }
        }
    }, [queue, currentTrack, history, playItem]);

    const handlePrevTrack = useCallback(() => {
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
    }, [currentTime, history]);

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
    }, [currentTrack, handleNextTrack, handlePrevTrack]);

    const togglePlayPause = () => {
        if (!currentTrack) return;
        setIsPlaying(prev => !prev);
    };

    const seekTo = useCallback((time) => {
        if (!ytPlayerRef.current || !duration) return;
        try {
            const seekTime = Math.max(0, Math.min(time, duration));
            ytPlayerRef.current.seekTo(seekTime, true);
            setCurrentTime(seekTime);
        } catch (err) {
            console.error('Seek error:', err);
        }
    }, [duration]);

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
        seekTo,
        playerRef,
        loading,
        error,
        playbackMode,
        setPlaybackMode,
        radioMode,
        setRadioMode,
        fetchingRecommendations
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
