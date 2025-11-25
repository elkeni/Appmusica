import axios from 'axios';
import { API_CONFIG } from '../config';
import cacheManager from '../utils/cache';
import { handleHTTPError, retryWithBackoff } from '../utils/errorHandler';
import { findVideoIdWithFallback, shouldUseFallback } from '../utils/youtubeFallback';

// ==================== PHASE 1: PERSISTENT CACHE LAYER ====================

/**
 * Persistent localStorage cache for YouTube video IDs
 * Saves video IDs permanently to avoid repeated API calls (0 quota cost)
 */
const YOUTUBE_CACHE_PREFIX = 'yt_video_cache_';
const YOUTUBE_CACHE_VERSION = 'v2'; // Increment to invalidate old cache

const getPersistentCache = (trackId) => {
    try {
        const cacheKey = `${YOUTUBE_CACHE_PREFIX}${YOUTUBE_CACHE_VERSION}_${trackId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            // Video IDs never expire (they don't change)
            return parsed.videoId;
        }
    } catch (error) {
        console.warn('⚠️ Error reading persistent cache:', error);
    }
    return null;
};

const setPersistentCache = (trackId, videoId) => {
    try {
        const cacheKey = `${YOUTUBE_CACHE_PREFIX}${YOUTUBE_CACHE_VERSION}_${trackId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
            videoId,
            timestamp: Date.now(),
            trackId
        }));
    } catch (error) {
        console.warn('⚠️ Error writing persistent cache:', error);
    }
};

const clearOldYouTubeCache = () => {
    try {
        const keys = Object.keys(localStorage);
        const oldKeys = keys.filter(key =>
            key.startsWith(YOUTUBE_CACHE_PREFIX) &&
            !key.includes(YOUTUBE_CACHE_VERSION)
        );
        oldKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
        console.warn('⚠️ Error clearing old cache:', error);
    }
};

// Clear old cache on load
clearOldYouTubeCache();

// ==================== QUOTA MONITORING ====================

let quotaUsedToday = 0;
const DAILY_QUOTA_LIMIT = 10000; // YouTube API default

const trackQuotaUsage = (cost) => {
    quotaUsedToday += cost;
    try {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('youtube_quota_usage');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.date === today) {
                quotaUsedToday = parsed.used + cost;
            } else {
                quotaUsedToday = cost; // New day, reset
            }
        }
        localStorage.setItem('youtube_quota_usage', JSON.stringify({
            date: today,
            used: quotaUsedToday
        }));
    } catch (error) {
        // Silently track quota
    }
};

const getQuotaUsage = () => {
    try {
        const stored = localStorage.getItem('youtube_quota_usage');
        if (stored) {
            const parsed = JSON.parse(stored);
            const today = new Date().toDateString();
            if (parsed.date === today) {
                return parsed.used;
            }
        }
    } catch (error) { }
    return 0;
};

export const getYouTubeQuotaStats = () => ({
    used: getQuotaUsage(),
    limit: DAILY_QUOTA_LIMIT,
    remaining: DAILY_QUOTA_LIMIT - getQuotaUsage(),
    percentage: (getQuotaUsage() / DAILY_QUOTA_LIMIT * 100).toFixed(2) + '%'
});

// ==================== YOUTUBE PROVIDER ====================

/**
 * YouTube Provider - ÚNICA FUENTE DE AUDIO COMPLETO
 * Estrategia: Buscar el video oficial de audio y proporcionar videoId para streaming
 * PHASE 1: Optimized with persistent cache and quota monitoring
 */
class YouTubeProvider {
    constructor() {
        this.name = 'youtube';
        this.config = API_CONFIG.youtube;
    }

    /**
     * Hacer petición a YouTube Data API
     */
    async request(endpoint, params = {}) {
        const cacheKey = cacheManager.generateKey(this.name, endpoint, params);
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await retryWithBackoff(async () => {
                return await axios.get(`${this.config.baseUrl}${endpoint}`, {
                    params: {
                        ...params,
                        key: this.config.apiKey,
                    },
                });
            });

            cacheManager.set(cacheKey, response.data);
            return response.data;
        } catch (error) {
            throw handleHTTPError(error, this.name);
        }
    }

    /**
     * Normalizar video de YouTube a formato universal
     */
    normalizeTrack(youtubeVideo) {
        const snippet = youtubeVideo.snippet;

        // Extraer artista y título del título del video
        const title = snippet.title;
        let artist = 'Unknown Artist';
        let trackTitle = title;

        // Intentar extraer artista (formato común: "Artist - Title")
        if (title.includes(' - ')) {
            const parts = title.split(' - ');
            artist = parts[0].trim();
            trackTitle = parts.slice(1).join(' - ').trim();
        }

        // Limpiar títulos comunes de YouTube
        trackTitle = trackTitle
            .replace(/\(Official.*?\)/gi, '')
            .replace(/\[Official.*?\]/gi, '')
            .replace(/\(Audio\)/gi, '')
            .replace(/\(Lyric.*?\)/gi, '')
            .replace(/\(Video\)/gi, '')
            .trim();

        const imageUrl = snippet.thumbnails?.maxres?.url ||
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url || '';

        return {
            id: youtubeVideo.id.videoId || youtubeVideo.id,
            title: trackTitle,
            artist,
            album: '',
            image: imageUrl, // UI espera 'image' property
            artwork: imageUrl, // Mantener por compatibilidad
            thumbnail: imageUrl,
            duration: 0, // Necesitaría una llamada adicional para obtener duración
            provider: 'youtube',
            audioUrl: null, // Se construye dinámicamente con Piped/Invidious
            videoId: youtubeVideo.id.videoId || youtubeVideo.id,
            externalUrl: `https://www.youtube.com/watch?v=${youtubeVideo.id.videoId || youtubeVideo.id}`,
            originalData: youtubeVideo,
        };
    }

    /**
     * Buscar videos de música en YouTube
     * PHASE 2: With fallback support
     */
    async search(query, limit = 25) {

        // PHASE 2: Use fallback if quota exceeded or no API key
        if (shouldUseFallback(this.config.apiKey)) {

            try {
                const fallbackResult = await findVideoIdWithFallback(query);

                if (fallbackResult?.videoId) {
                    // Return as single result array
                    return [{
                        id: fallbackResult.videoId,
                        videoId: fallbackResult.videoId,
                        title: fallbackResult.title,
                        artist: fallbackResult.author || 'Unknown Artist',
                        album: '',
                        image: fallbackResult.thumbnail,
                        thumbnail: fallbackResult.thumbnail,
                        duration: fallbackResult.duration || 0,
                        provider: 'youtube',
                        fallbackUsed: true
                    }];
                }
            } catch (fallbackError) {
                console.warn('⚠️ [YouTube] Fallback search failed:', fallbackError.message);
            }

            // If no API key, return empty
            if (!this.config.apiKey) {
                console.warn('⚠️ [YouTube] No API key and fallback failed');
                return [];
            }
        }

        // Try official API
        try {
            const data = await this.request('/search', {
                part: 'id,snippet', // MINIMAL: Only ID and snippet
                q: query,
                type: 'video',
                videoCategoryId: '10', // Categoría "Music"
                maxResults: limit,
                order: 'relevance',
            });

            // Track quota usage
            trackQuotaUsage(100);

            const tracks = data.items?.map(video => this.normalizeTrack(video)) || [];
            return tracks;
        } catch (error) {
            // PHASE 2: Try fallback on 403
            if (error.statusCode === 403) {
                console.error('🚨 [YouTube] QUOTA EXCEEDED - Trying fallback');
                try {
                    localStorage.setItem('youtube_quota_exceeded', Date.now().toString());
                } catch (e) { }

                // Try fallback
                try {
                    const fallbackResult = await findVideoIdWithFallback(query);

                    if (fallbackResult?.videoId) {
                        return [{
                            id: fallbackResult.videoId,
                            videoId: fallbackResult.videoId,
                            title: fallbackResult.title,
                            artist: fallbackResult.author || 'Unknown Artist',
                            album: '',
                            image: fallbackResult.thumbnail,
                            thumbnail: fallbackResult.thumbnail,
                            duration: fallbackResult.duration || 0,
                            provider: 'youtube',
                            fallbackUsed: true,
                            apiExhausted: true
                        }];
                    }
                } catch (fallbackError) {
                    console.warn('⚠️ [YouTube] Fallback also failed');
                }

                return [];
            }
            throw error;
        }
    }

    /**
     * FUNCIÓN CRÍTICA: Obtener audio stream para un track
     * PHASE 1: Optimized with persistent cache to minimize API calls
     */
    async getAudioStream(track) {

        // Validar que el videoId sea de YouTube (no de Deezer, Spotify, etc.)
        const isValidYouTubeId = track.videoId &&
            typeof track.videoId === 'string' &&
            !track.videoId.startsWith('deezer_') &&
            !track.videoId.startsWith('spotify_') &&
            !track.videoId.startsWith('itunes_');

        if (isValidYouTubeId) {
            return {
                videoId: track.videoId,
                audioUrl: null, // Se resolverá con Piped/Invidious
                provider: 'youtube',
            };
        }

        // PHASE 1: Create cache key from track metadata
        const cacheKey = `${track.artist || ''}-${track.title || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '');

        // PHASE 1: Check persistent cache first (0 quota cost)
        const cachedVideoId = getPersistentCache(cacheKey);
        if (cachedVideoId) {
            return {
                videoId: cachedVideoId,
                audioUrl: null,
                provider: 'youtube',
                cached: true,
                quotaCost: 0
            };
        }

        const searchQuery = `${track.artist} ${track.title} official audio`;

        // PHASE 2: Check if we should use fallback methods
        if (shouldUseFallback(this.config.apiKey)) {

            try {
                const fallbackResult = await findVideoIdWithFallback(searchQuery);

                if (fallbackResult?.videoId) {
                    // Save to persistent cache
                    setPersistentCache(cacheKey, fallbackResult.videoId);

                    return {
                        videoId: fallbackResult.videoId,
                        audioUrl: null,
                        provider: 'youtube',
                        matchedTitle: fallbackResult.title,
                        quotaCost: 0,
                        fallbackUsed: true
                    };
                }
            } catch (fallbackError) {
                console.error('❌ [YouTube] Fallback methods failed:', fallbackError.message);
            }

            // If fallback fails and no API key, throw error
            if (!this.config.apiKey) {
                throw new Error('YouTube API key not configured and fallback methods failed');
            }
        }

        // PHASE 2: Try official API if available

        try {
            // PHASE 1: Optimized API call - minimal parameters
            const data = await this.request('/search', {
                part: 'id,snippet', // MINIMAL: Only ID and snippet
                q: searchQuery,
                type: 'video',
                videoCategoryId: '10',
                maxResults: 1, // CRITICAL: Only fetch 1 result
                order: 'relevance',
            });

            // Track quota usage
            trackQuotaUsage(100); // search.list costs 100 quota points

            if (!data.items || data.items.length === 0) {
                throw new Error('No YouTube video found for this track');
            }

            // Seleccionar el mejor match (primer resultado relevante)
            const bestMatch = data.items[0];
            const videoId = bestMatch.id.videoId;

            // PHASE 1: Save to persistent cache
            setPersistentCache(cacheKey, videoId);

            return {
                videoId,
                audioUrl: null, // Se resolverá con Piped/Invidious
                provider: 'youtube',
                matchedTitle: bestMatch.snippet.title,
                quotaCost: 100
            };
        } catch (error) {
            // PHASE 2: If API fails with 403, try fallback as last resort
            if (error.statusCode === 403) {
                console.error('🚨 [YouTube] QUOTA EXCEEDED - Switching to fallback');
                try {
                    localStorage.setItem('youtube_quota_exceeded', Date.now().toString());
                } catch (e) { }

                // Try fallback methods as last resort
                try {
                    const fallbackResult = await findVideoIdWithFallback(searchQuery);

                    if (fallbackResult?.videoId) {
                        setPersistentCache(cacheKey, fallbackResult.videoId);

                        return {
                            videoId: fallbackResult.videoId,
                            audioUrl: null,
                            provider: 'youtube',
                            matchedTitle: fallbackResult.title,
                            quotaCost: 0,
                            fallbackUsed: true,
                            apiExhausted: true
                        };
                    }
                } catch (fallbackError) {
                    console.error('❌ [YouTube] Fallback also failed:', fallbackError.message);
                }

                throw new Error('YouTube API quota exceeded and fallback methods failed');
            }

            console.error(`❌ [YouTube] Error getting audio stream:`, error.message);
            throw error;
        }
    }

    /**
     * Obtener trending videos musicales
     */
    async getTrending(limit = 50) {

        const data = await this.request('/videos', {
            part: 'snippet',
            chart: 'mostPopular',
            videoCategoryId: '10', // Music category
            maxResults: limit,
            regionCode: 'US',
        });

        const tracks = data.items?.map(video => this.normalizeTrack({
            ...video,
            id: { videoId: video.id },
        })) || [];

        return tracks;
    }

    /**
     * Obtener detalles de un video (incluyendo duración)
     */
    async getVideoDetails(videoId) {

        const data = await this.request('/videos', {
            part: 'snippet,contentDetails',
            id: videoId,
        });

        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found');
        }

        const video = data.items[0];

        // Parsear duración ISO 8601 (PT1M30S -> 90 segundos)
        const duration = this.parseDuration(video.contentDetails.duration);

        return {
            ...this.normalizeTrack({
                ...video,
                id: { videoId: video.id },
            }),
            duration,
        };
    }

    /**
     * Parsear duración ISO 8601
     */
    parseDuration(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

        if (!match) return 0;

        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;

        return hours * 3600 + minutes * 60 + seconds;
    }
}

const youTubeProvider = new YouTubeProvider();
export default youTubeProvider;
