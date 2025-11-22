import axios from 'axios';

// CORS Proxy para Deezer (puedes cambiar a tu propio proxy si lo prefieres)
const DEEZER_PROXY = 'https://corsproxy.io/?';
const DEEZER_API = 'https://api.deezer.com';
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';

// Caché para mapeos Deezer → YouTube
const youtubeCache = new Map();

// ==================== DEEZER API (Para datos estructurados) ====================

/**
 * Buscar en Deezer (tracks, artists, albums)
 */
export const searchDeezer = async (query, type = 'track', limit = 20) => {
    try {
        if (!query || (typeof query === 'string' && !query.trim())) return [];
        const endpoint = type === 'track' ? 'search' : `search/${type}`;
        const response = await axios.get(`${DEEZER_PROXY}${DEEZER_API}/${endpoint}`, {
            params: { q: query, limit }
        });

        const items = response.data.data || [];

        if (type === 'track') {
            return items.map(track => formatDeezerTrack(track));
        } else if (type === 'artist') {
            return items.map(artist => formatDeezerArtist(artist));
        } else if (type === 'album') {
            return items.map(album => formatDeezerAlbum(album));
        }

        return items;
    } catch (error) {
        console.error('Deezer search error:', error);
        return [];
    }
};

/**
 * Obtener charts/top tracks de Deezer
 */
export const getDeezerCharts = async (limit = 30) => {
    try {
        const response = await axios.get(`${DEEZER_PROXY}${DEEZER_API}/chart/0/tracks`, {
            params: { limit }
        });
        return response.data.data.map(track => formatDeezerTrack(track));
    } catch (error) {
        console.error('Deezer charts error:', error);
        return [];
    }
};

/**
 * Obtener detalles de un artista
 */
export const getDeezerArtist = async (artistId) => {
    try {
        const response = await axios.get(`${DEEZER_PROXY}${DEEZER_API}/artist/${artistId}`);
        return formatDeezerArtist(response.data);
    } catch (error) {
        console.error('Deezer artist error:', error);
        return null;
    }
};

/**
 * Obtener top tracks de un artista
 */
export const getArtistTopTracks = async (artistId, limit = 20) => {
    try {
        const response = await axios.get(`${DEEZER_PROXY}${DEEZER_API}/artist/${artistId}/top`, {
            params: { limit }
        });
        return response.data.data.map(track => formatDeezerTrack(track));
    } catch (error) {
        console.error('Deezer artist top tracks error:', error);
        return [];
    }
};

/**
 * Obtener álbumes de un artista
 */
export const getArtistAlbums = async (artistId, limit = 20) => {
    try {
        const response = await axios.get(`${DEEZER_PROXY}${DEEZER_API}/artist/${artistId}/albums`, {
            params: { limit }
        });
        return response.data.data.map(album => formatDeezerAlbum(album));
    } catch (error) {
        console.error('Deezer artist albums error:', error);
        return [];
    }
};

/**
 * Obtener tracks similares (para Autoplay)
 * Estrategia:
 * 1. Intentar obtener el "Mix" del artista (Tracklist)
 * 2. Si falla, buscar tracks del mismo artista
 * 3. Si falla, buscar por género
 */
export const getSimilarTracks = async (track, limit = 10) => {
    try {
        if (!track) return [];

        // 1. Si tenemos artistId, intentar obtener top tracks del artista
        if (track.artistId) {
            const artistTop = await getArtistTopTracks(track.artistId, limit);
            // Filtrar el track actual
            const filtered = artistTop.filter(t => t.id !== track.id);
            if (filtered.length > 0) return filtered;
        }

        // 2. Si no, buscar por nombre de artista
        if (track.artist) {
            const searchResults = await searchDeezer(`artist:"${track.artist}"`, 'track', limit + 5);
            const filtered = searchResults.filter(t => t.id !== track.id);
            if (filtered.length > 0) return filtered.slice(0, limit);
        }

        // 3. Fallback: Buscar por género o título (menos preciso)
        const query = track.genre ? `genre:"${track.genre}"` : track.title;
        const fallbackResults = await searchDeezer(query, 'track', limit);
        return fallbackResults.filter(t => t.id !== track.id);

    } catch (error) {
        console.error('Get similar tracks error:', error);
        return [];
    }
};

/**
 * Obtener detalles de un álbum con sus tracks
 */
export const getDeezerAlbum = async (albumId) => {
    try {
        const response = await axios.get(`${DEEZER_PROXY}${DEEZER_API}/album/${albumId}`);
        const album = response.data;

        return {
            id: album.id,
            title: album.title,
            cover: album.cover_medium || album.cover_big,
            coverBig: album.cover_big,
            artist: album.artist?.name || 'Unknown',
            artistId: album.artist?.id,
            releaseDate: album.release_date,
            tracks: album.tracks?.data?.map(track => ({
                ...formatDeezerTrack(track),
                album: album.title,
                albumId: album.id
            })) || []
        };
    } catch (error) {
        console.error('Deezer album error:', error);
        return null;
    }
};

/**
 * Obtener géneros de Deezer
 */
export const getDeezerGenres = async () => {
    try {
        const response = await axios.get(`${DEEZER_PROXY}${DEEZER_API}/genre`);
        return response.data.data;
    } catch (error) {
        console.error('Deezer genres error:', error);
        return [];
    }
};

/**
 * Obtener playlists de un género
 */
export const getGenrePlaylists = async (genreId) => {
    try {
        const response = await axios.get(`${DEEZER_PROXY}${DEEZER_API}/genre/${genreId}/playlists`);
        return response.data.data;
    } catch (error) {
        console.error('Deezer genre playlists error:', error);
        return [];
    }
};

// ==================== YOUTUBE API (Solo para reproducción) ====================

/**
 * PHASE 3: Buscar video de YouTube con query optimizado y filtrado
 * Mejoras: Filtrar covers/remixes, mejor query string, manejo de errores robusto
 */
export const getYouTubeVideoForTrack = async (track, apiKey) => {
    try {
        // Require API key
        if (!apiKey) {
            console.warn('YouTube API key is missing. Using fallback mode.');
            // Return a fallback video ID for testing
            return {
                youtubeId: 'jNQXAC9IVRw', // "Me Gustas Tu" - Fallback video
                fallbackMode: true,
                error: 'NO_API_KEY'
            };
        }

        // PHASE 3: Crear query de búsqueda optimizada - Más estricto
        // Priorizar "official audio" sobre "official video" para mejor sincronización
        const searchQuery = `"${track.title}" "${track.artist}" official audio`;

        // Verificar caché primero
        const cacheKey = `${track.artist}-${track.title}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (youtubeCache.has(cacheKey)) {
            return {
                ...track,
                youtubeId: youtubeCache.get(cacheKey),
                cached: true
            };
        }

        // Buscar en YouTube con manejo de cuota
        const response = await axios.get(`${YOUTUBE_API}/search`, {
            params: {
                part: 'snippet',
                q: searchQuery,
                type: 'video',
                maxResults: 5, // Aumentar para filtrar mejor
                videoCategoryId: '10', // Categoría Música
                videoEmbeddable: 'true', // Solo videos embebibles
                key: apiKey
            }
        });

        if (response.data.items && response.data.items.length > 0) {
            // PHASE 3: Filtrar resultados no deseados
            const filteredResults = response.data.items.filter(item => {
                const title = item.snippet.title.toLowerCase();
                // Excluir covers, remixes, live versions (a menos que sea el original)
                const excludeKeywords = ['cover', 'remix', 'live', 'karaoke', 'instrumental', 'acoustic'];
                const hasExcluded = excludeKeywords.some(keyword => 
                    title.includes(keyword) && !title.includes('official')
                );
                return !hasExcluded;
            });

            const bestMatch = filteredResults.length > 0 ? filteredResults[0] : response.data.items[0];
            const videoId = bestMatch.id.videoId;

            // Guardar en caché
            youtubeCache.set(cacheKey, videoId);

            console.log(`✅ YouTube match found: ${bestMatch.snippet.title}`);

            return {
                ...track,
                youtubeId: videoId,
                videoTitle: bestMatch.snippet.title
            };
        }

        console.warn('⚠️ No YouTube video found for:', searchQuery);
        // Return fallback instead of null
        return {
            youtubeId: 'jNQXAC9IVRw',
            fallbackMode: true,
            error: 'NOT_FOUND'
        };
    } catch (error) {
        console.error('❌ YouTube search error:', error);
        
        // PHASE 3: Error handling - Detect quota exceeded
        if (error.response?.status === 403 || error.response?.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
            console.warn('⚠️ YouTube API quota exceeded. Using fallback.');
            return {
                youtubeId: 'jNQXAC9IVRw',
                fallbackMode: true,
                error: 'QUOTA_EXCEEDED'
            };
        }

        // Return fallback for any error
        return {
            youtubeId: 'jNQXAC9IVRw',
            fallbackMode: true,
            error: error.message || 'UNKNOWN_ERROR'
        };
    }
};

/**
 * Search YouTube with type-specific filtering  
 * @param {string} query - Search query
 * @param {string} type - 'song', 'video', or 'all'
 * @param {string} apiKey - YouTube API key
 * @param {number} maxResults - Number of results to return
 */
export const searchYouTubeByType = async (query, type = 'all', apiKey, maxResults = 20) => {
    try {
        if (!apiKey) {
            console.warn('YouTube API key is missing.');
            return [];
        }

        let searchQuery = query;
        let params = {
            part: 'snippet',
            q: searchQuery,
            type: 'video',
            maxResults: maxResults,
            videoCategoryId: '10', // Music category
            key: apiKey
        };

        // Type-specific modifications
        if (type === 'song') {
            params.q = `${query} official audio`;
        } else if (type === 'video') {
            params.q = `${query} official music video`;
        }

        const response = await axios.get(`${YOUTUBE_API}/search`, { params });

        if (!response.data.items) return [];

        let results = response.data.items;

        // For video type, filter out Topic channels
        if (type === 'video') {
            results = results.filter(item => {
                const channelTitle = item.snippet.channelTitle || '';
                return !channelTitle.includes('Topic') && !channelTitle.includes(' - Topic');
            });
        }

        return results.map(item => ({
            id: item.id.videoId,
            videoId: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
            thumbnail: item.snippet.thumbnails?.default?.url,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            channelId: item.snippet.channelId,
            type: 'youtube',
            snippet: item.snippet
        }));
    } catch (error) {
        console.error('YouTube search by type error:', error);
        return [];
    }
};

/**
 * Get recommendations based on user's play history
 * Uses YouTube's relatedToVideoId endpoint
 */
export const getRecommendationsBasedOnHistory = async (userHistory, apiKey, limit = 20) => {
    try {
        if (!apiKey || !userHistory || userHistory.length === 0) {
            return [];
        }

        const lastVideoId = userHistory[0]?.videoId || userHistory[0]?.id;
        if (!lastVideoId) return [];

        const response = await axios.get(`${YOUTUBE_API}/search`, {
            params: {
                part: 'snippet',
                relatedToVideoId: lastVideoId,
                type: 'video',
                maxResults: limit,
                videoCategoryId: '10',
                key: apiKey
            }
        });

        if (!response.data.items) return [];

        return response.data.items.map(item => ({
            id: item.id.videoId,
            videoId: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
            thumbnail: item.snippet.thumbnails?.default?.url,
            type: 'youtube',
            snippet: item.snippet
        }));
    } catch (error) {
        console.error('Get recommendations based on history error:', error);
        return [];
    }
};

// ==================== FORMATTERS ====================

function formatDeezerTrack(track) {
    return {
        // IDs
        id: track.id,
        deezerId: track.id,

        // Información básica
        title: track.title || track.title_short || 'Unknown Track',
        artist: track.artist?.name || 'Unknown Artist',
        artistId: track.artist?.id,

        // Álbum
        album: track.album?.title || '',
        albumId: track.album?.id,

        // Imágenes (Deezer tiene mejor calidad)
        image: track.album?.cover_medium || track.album?.cover_big,
        cover: track.album?.cover_medium,
        coverBig: track.album?.cover_big,
        thumbnail: track.album?.cover_small,

        // Audio
        preview: track.preview, // 30 segundos MP3
        duration: track.duration,

        // Metadata
        rank: track.rank,
        explicit: track.explicit_lyrics,

        // Para búsqueda en YouTube
        searchQuery: `${track.title} ${track.artist?.name}`,

        // Datos originales por si se necesitan
        _deezerData: track
    };
}

function formatDeezerArtist(artist) {
    return {
        id: artist.id,
        deezerId: artist.id,
        name: artist.name,
        image: artist.picture_medium || artist.picture_big,
        pictureBig: artist.picture_big,
        nbAlbum: artist.nb_album,
        nbFan: artist.nb_fan,
        _deezerData: artist
    };
}

function formatDeezerAlbum(album) {
    return {
        id: album.id,
        deezerId: album.id,
        title: album.title,
        artist: album.artist?.name || 'Unknown',
        artistId: album.artist?.id,
        cover: album.cover_medium || album.cover_big,
        coverBig: album.cover_big,
        releaseDate: album.release_date,
        nbTracks: album.nb_tracks,
        _deezerData: album
    };
}

// ==================== UTILITIES ====================

/**
 * Limpiar caché de YouTube (útil para liberar memoria)
 */
export const clearYouTubeCache = () => {
    youtubeCache.clear();
};

/**
 * Obtener tamaño del caché
 */
export const getCacheSize = () => {
    return youtubeCache.size;
};
