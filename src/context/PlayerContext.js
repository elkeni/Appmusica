import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import MusicRepository from '../api/MusicRepository';
import { getItemId } from '../utils/formatUtils';
import { extractPaletteFromImage, darkenHex } from '../utils/colorUtils';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7); // Aumentar volumen inicial de 0.5 a 0.7
    const [queue, setQueue] = useState([]);
    const [history, setHistory] = useState([]);
    const [playbackContext, setPlaybackContext] = useState(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [waveformBaseline, setWaveformBaseline] = useState([]);
    const [radioMode, setRadioMode] = useState(false);
    const [fetchingRecommendations, setFetchingRecommendations] = useState(false);

    // ReactPlayer reference
    const playerRef = useRef(null);

    // Ref for handleNextTrack (needed before definition)
    const handleNextTrackRef = useRef(null);

    // ==================== PHASE 1: ENHANCED PROMISE GUARD ====================
    const playPromiseRef = useRef(null);      // Track pending play operations
    const isPausing = useRef(false);          // Track if pause is in progress
    const isPlayerReady = useRef(false);      // Track if ReactPlayer is mounted and ready
    const isSwitchingTrack = useRef(false);   // Track if we're changing tracks
    const playAttempts = useRef(0);           // Count failed play attempts

    // SIMPLIFIED: Just set playing state - ReactPlayer handles everything
    const safePlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    // SIMPLIFIED: Just set playing state to false
    const safePause = useCallback(() => {
        setIsPlaying(false);
    }, []);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTrack?.image]);

    // Note: ReactPlayer handlers are now defined inline in the JSX below

    // PHASE 2: Load new track when currentTrack changes - WITH DEBOUNCE
    useEffect(() => {
        let cancelled = false;

        const loadTrack = async () => {
            if (!currentTrack) {
                setDuration(0);
                setCurrentTime(0);
                isPlayerReady.current = false;
                return;
            }

            try {
                setError(null);

                // Si no tiene playbackUrl, obtenerlo vía MusicRepository
                if (!currentTrack.playbackUrl) {
                    setLoading(true);

                    const playableTrack = await MusicRepository.play(currentTrack);

                    if (cancelled) return;

                    // Update track con la URL de YouTube
                    setCurrentTrack(prev => ({
                        ...prev,
                        youtubeId: playableTrack.youtubeId,
                        playbackUrl: playableTrack.playbackUrl,
                        provider: 'youtube',
                    }));

                    setLoading(false);
                }

                if (cancelled) return;

                // Initialize waveform
                initWaveformFor(currentTrack.id || currentTrack.videoId || currentTrack.title || '');

                // Clear switching flag after a brief delay
                setTimeout(() => {
                    isSwitchingTrack.current = false;
                }, 500);

            } catch (err) {
                if (cancelled) return;
                console.error('❌ Error loading track:', err);
                setError('No se pudo cargar la canción');
                setLoading(false);
                isSwitchingTrack.current = false;
                safePause();
                setTimeout(() => handleNextTrackRef.current?.(), 2000);
            }
        };

        loadTrack();

        return () => {
            cancelled = true;
            isSwitchingTrack.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTrack?.id, safePause]);

    // Poll for duration until we get it (with safety checks)
    useEffect(() => {
        if (!currentTrack?.playbackUrl || duration > 0) return;

        let errorCount = 0;
        const maxErrors = 5;

        const checkDuration = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
                try {
                    const dur = playerRef.current.getDuration();
                    if (dur && dur > 0) {
                        setDuration(dur);
                    }
                } catch (error) {
                    errorCount++;
                    console.warn('⚠️ Error getting duration:', error);
                    if (errorCount >= maxErrors) {
                        clearInterval(checkDuration);
                    }
                }
            }
        }, 500);

        return () => clearInterval(checkDuration);
    }, [currentTrack?.playbackUrl, duration]);

    // ReactPlayer handles play/pause and volume via props automatically

    // Pre-cache recommendations when queue is running low
    useEffect(() => {
        const shouldPreload = queue.length <= 2 && queue.length > 0 && currentTrack && playbackContext?.type === 'AUTOPLAY';

        if (shouldPreload && !fetchingRecommendations) {
            MusicRepository.getRecommendations(currentTrack, 10)
                .then(similar => {
                    if (similar && similar.length > 0) {
                        setQueue(prev => [...prev, ...similar]);
                    }
                })
                .catch(err => console.warn('Pre-load failed:', err));
        }
    }, [queue.length, currentTrack, playbackContext, fetchingRecommendations]);

    // PHASE 3: Play item function with enhanced coordination
    const playItem = useCallback(async (item, context = null) => {
        try {
            setError(null);
            setLoading(true);

            // Stop current playback before switching
            safePause();
            isSwitchingTrack.current = true;

            // Universal track data normalization
            const trackData = {
                id: item.id || item.videoId,
                videoId: item.videoId || undefined, // SOLO usar videoId si existe (no fallback a id)
                title: item.title || 'Desconocido',
                artist: item.artist || 'Desconocido',
                album: item.album || '',
                image: item.image || item.thumbnail || item.coverBig || item.cover || '',
                cover: item.cover || item.coverBig || item.image || item.thumbnail || '',
                coverBig: item.coverBig || item.cover || item.image || '',
                playbackUrl: item.playbackUrl || null,
                youtubeId: item.youtubeId || null,
                audioUrl: item.audioUrl || item.streamUrl || null,
                streamUrl: item.audioUrl || item.streamUrl || null,
                duration: item.duration || 0,
                provider: item.provider || item.type || 'unknown',
                type: item.provider || item.type || 'unknown',
                hasLyrics: item.hasLyrics || false,
                originalData: item,
            };

            // Set track (this will trigger loadTrack useEffect)
            setCurrentTrack(trackData);
            setHistory(prev => [trackData, ...prev.filter(t => t.id !== trackData.id)].slice(0, 20));
            setLoading(false);

            // CRITICAL: Wait for loadTrack to complete before playing
            // The loadTrack effect will clear isSwitchingTrack flag
            await new Promise(resolve => setTimeout(resolve, 500));

            // Auto-play the track after loading
            safePlay();

            // Queue Logic
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
                    setRadioMode(false);
                } else {
                    console.warn('Track not found in context, clearing queue');
                    setQueue([]);
                }
            } else if (context === 'KEEP') {
                // Keep existing queue
            } else {
                setQueue([]);
                setPlaybackContext({ type: 'AUTOPLAY' });
                setRadioMode(false);

                // Get recommendations for autoplay
                MusicRepository.getRecommendations(item, 10).then(similar => {
                    if (similar && similar.length > 0) {
                        setQueue(similar);
                    }
                }).catch(err => console.warn('Get recommendations failed:', err));
            }
        } catch (error) {
            console.error('Error playing item:', error);
            setError('Error al reproducir la canción.');
            setLoading(false);
            isSwitchingTrack.current = false;
        }
    }, [safePlay, safePause]);

    // Next track handler
    const handleNextTrack = useCallback(async () => {
        if (queue.length > 0) {
            const nextTrack = queue[0];
            setQueue(prev => prev.slice(1));
            setRadioMode(false);
            await playItem(nextTrack, 'KEEP');
        } else {
            // INFINITE RADIO MODE
            setRadioMode(true);
            setFetchingRecommendations(true);

            try {
                const sourceTrack = currentTrack?.originalData || currentTrack;
                if (!sourceTrack) {
                    console.warn('No current track for recommendations');
                    safePause();
                    setRadioMode(false);
                    setFetchingRecommendations(false);
                    return;
                }

                let recommendations = [];

                // STRATEGY 1: Get recommendations from MusicRepository
                try {
                    const recs = await MusicRepository.getRecommendations(currentTrack, 15);

                    if (recs && recs.length > 0) {
                        recommendations = recs;
                    }
                } catch (e) {
                    console.warn('MusicRepository recommendations failed:', e.message);
                }

                // STRATEGY 2: Fallback to trending
                if (recommendations.length === 0) {
                    try {
                        const trending = await MusicRepository.getTrending(15);

                        if (trending && trending.length > 0) {
                            recommendations = trending;
                        }
                    } catch (e) {
                        console.error('Trending fallback failed:', e.message);
                    }
                }

                // Play recommendations if found
                if (recommendations.length > 0) {
                    const recentIds = history.slice(0, 5).map(t => t.id);
                    const filtered = recommendations.filter(r => !recentIds.includes(r.id));

                    const tracksToUse = filtered.length > 0 ? filtered : recommendations;
                    const next = tracksToUse[0];

                    setQueue(tracksToUse.slice(1));
                    setPlaybackContext({ type: 'AUTOPLAY', source: 'radio' });
                    setFetchingRecommendations(false);
                    await playItem(next, 'KEEP');
                } else {
                    console.error('❌ All recommendation strategies failed');
                    safePause();
                    setRadioMode(false);
                    setFetchingRecommendations(false);
                }
            } catch (e) {
                console.error('❌ Infinite Radio error:', e);
                safePause();
                setRadioMode(false);
                setFetchingRecommendations(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queue, currentTrack, history, playItem]);

    // Update ref after definition
    handleNextTrackRef.current = handleNextTrack;

    // Previous track handler
    const handlePrevTrack = useCallback(() => {
        if (currentTime > 3) {
            if (playerRef.current) {
                playerRef.current.seekTo(0, 'seconds');
            }
            return;
        }

        if (history.length > 1) {
            if (playerRef.current) {
                playerRef.current.seekTo(0, 'seconds');
            }
        }
    }, [currentTime, history]);

    // Sync volume with YouTube internal player
    useEffect(() => {
        if (playerRef.current && currentTrack?.playbackUrl) {
            try {
                // Safety check: verify getInternalPlayer exists
                if (typeof playerRef.current.getInternalPlayer !== 'function') {
                    return;
                }

                const internalPlayer = playerRef.current.getInternalPlayer();

                // Verify internal player is ready and has methods
                if (internalPlayer && typeof internalPlayer.setVolume === 'function') {
                    const volumePercent = Math.round(volume * 100);
                    internalPlayer.setVolume(volumePercent);

                    // Asegurar que no esté muted
                    if (typeof internalPlayer.isMuted === 'function' && internalPlayer.isMuted()) {
                        internalPlayer.unMute();
                    }
                }
            } catch (error) {
                // Silent fail - player not ready yet
            }
        }
    }, [volume, currentTrack?.playbackUrl]);

    // PHASE 3: Media Session API with safe play/pause
    useEffect(() => {
        if ('mediaSession' in navigator && currentTrack) {
            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.artist || 'Unknown Artist',
                album: currentTrack.album || '',
                artwork: [
                    { src: currentTrack.image, sizes: '512x512', type: 'image/jpeg' },
                    { src: currentTrack.image, sizes: '256x256', type: 'image/jpeg' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                safePlay();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                safePause();
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                handlePrevTrack();
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                handleNextTrack();
            });
        }
    }, [currentTrack, handleNextTrack, handlePrevTrack, safePlay, safePause]);

    // PHASE 5: Safe togglePlayPause with full coordination
    const togglePlayPause = async () => {
        // CRITICAL: Ignore if track is switching or loading
        if (isSwitchingTrack.current || loading) {
            return;
        }

        if (!currentTrack) {
            console.warn('⚠️ No track available');
            return;
        }

        // If no playbackUrl yet, canción está cargando
        if (!currentTrack.playbackUrl) {
            return;
        }

        // Wait for player to be ready (with forgiving timeout)
        if (!isPlayerReady.current) {
            const startTime = Date.now();
            while (!isPlayerReady.current && Date.now() - startTime < 500) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // If still not ready but we have a playerRef, assume it's ready
            if (!isPlayerReady.current && playerRef.current) {
                isPlayerReady.current = true;
            }

            if (!isPlayerReady.current) {
                console.warn('⚠️ Player not ready after 500ms, aborting toggle');
                return;
            }
        }

        // Wait for any pending operations
        if (playPromiseRef.current) {
            try {
                await playPromiseRef.current;
            } catch (error) {
                // Ignore
            }
        }

        if (isPausing.current) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Toggle based on current state
        if (isPlaying) {
            safePause();
        } else {
            await safePlay();
        }
    };

    const seekTo = useCallback((time) => {
        if (!playerRef.current || !duration) return;
        try {
            const seekTime = Math.max(0, Math.min(time, duration));
            playerRef.current.seekTo(seekTime, 'seconds');
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
        loading,
        error,
        radioMode,
        setRadioMode,
        fetchingRecommendations
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}

            {/* ReactPlayer - YouTube iframe player (hidden but DOM-visible to prevent throttling) */}
            {currentTrack?.playbackUrl && (
                <div style={{
                    position: 'fixed',
                    bottom: '0',
                    right: '0',
                    width: '1px',
                    height: '1px',
                    opacity: 0,
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    zIndex: -9999
                }}>
                    <ReactPlayer
                        key={currentTrack.playbackUrl}
                        ref={playerRef}
                        url={currentTrack.playbackUrl}
                        playing={isPlaying}
                        volume={volume}
                        muted={false}
                        loop={false}
                        controls={false}
                        playsinline
                        pip={false}
                        stopOnUnmount={false}
                        width="100%"
                        height="100%"
                        config={{
                            youtube: {
                                playerVars: {
                                    autoplay: 1,
                                    controls: 0,
                                    disablekb: 1,
                                    fs: 0,
                                    iv_load_policy: 3,
                                    modestbranding: 1,
                                    rel: 0,
                                    showinfo: 0,
                                    playsinline: 1,
                                    enablejsapi: 1
                                }
                            }
                        }}
                        onDuration={(dur) => {
                            if (dur && dur > 0) {
                                setDuration(dur);
                            }
                        }}
                        onReady={() => {
                            isPlayerReady.current = true;
                            setLoading(false);

                            // Force unmute and set volume on ready
                            if (playerRef.current && typeof playerRef.current.getInternalPlayer === 'function') {
                                try {
                                    const internalPlayer = playerRef.current.getInternalPlayer();

                                    if (internalPlayer) {
                                        // Force unmute
                                        if (typeof internalPlayer.unMute === 'function') {
                                            internalPlayer.unMute();
                                        }

                                        // Set volume to max for testing
                                        if (typeof internalPlayer.setVolume === 'function') {
                                            internalPlayer.setVolume(100);
                                        }
                                    }
                                } catch (error) {
                                    console.warn('Error in onReady:', error.message);
                                }
                            }
                        }}
                        onStart={() => {
                            setLoading(false);
                        }}
                        onPlay={() => {
                            // CRITICAL: Unmute immediately when play starts
                            if (playerRef.current && typeof playerRef.current.getInternalPlayer === 'function') {
                                try {
                                    const internalPlayer = playerRef.current.getInternalPlayer();
                                    if (internalPlayer) {
                                        // Force unmute
                                        if (typeof internalPlayer.isMuted === 'function' && internalPlayer.isMuted()) {
                                            internalPlayer.unMute();
                                        }

                                        // Force volume
                                        if (typeof internalPlayer.setVolume === 'function') {
                                            internalPlayer.setVolume(100);
                                        }

                                        // Check player state
                                        if (typeof internalPlayer.getPlayerState === 'function') {
                                            // 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING
                                            internalPlayer.getPlayerState();
                                        }
                                    }
                                } catch (error) {
                                    console.error('❌ Error in onPlay:', error);
                                }
                            }

                            // Clear pending operations
                            if (playPromiseRef.current) {
                                playPromiseRef.current = null;
                            }
                            playAttempts.current = 0;
                        }}
                        onPause={() => {
                            isPausing.current = false;
                        }}
                        onProgress={(state) => {
                            setCurrentTime(state.playedSeconds);

                            // Update duration if not set
                            if (!duration && state.loadedSeconds > 0) {
                                if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
                                    try {
                                        const dur = playerRef.current.getDuration();
                                        if (dur && dur > 0) {
                                            setDuration(dur);
                                        }
                                    } catch (error) {
                                        // Silently fail
                                    }
                                }
                            }

                            // Mark as ready when buffered
                            if (state.loadedSeconds > 1 && loading) {
                                setLoading(false);
                            }
                        }}
                        onEnded={async () => {
                            // Clear refs and trigger next track
                            playPromiseRef.current = null;
                            isPausing.current = false;
                            isPlayerReady.current = false;
                            safePause();
                            handleNextTrackRef.current?.();
                        }}
                        onError={async (error) => {
                            // Ignore AbortError (expected during fast skips)
                            if (error.name === 'AbortError') {
                                return;
                            }

                            console.error('❌ ReactPlayer error:', error);
                            setError('Error al reproducir');
                            setLoading(false);
                            isPlayerReady.current = false;
                            safePause();

                            // Skip to next track after error
                            setTimeout(() => handleNextTrackRef.current?.(), 2000);
                        }}
                        progressInterval={100}
                    />
                </div>
            )}
        </PlayerContext.Provider>
    );
};
