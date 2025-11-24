import axios from 'axios';
import { API_CONFIG } from '../config';
import cacheManager from '../utils/cache';
import { handleHTTPError, retryWithBackoff } from '../utils/errorHandler';

/**
 * Deezer Provider - Metadata, Previews (30s)
 */
class DeezerProvider {
    constructor() {
        this.name = 'deezer';
        this.config = API_CONFIG.deezer;
    }

    /**
     * Hacer petición a Deezer
     */
    async request(endpoint, params = {}) {
        const cacheKey = cacheManager.generateKey(this.name, endpoint, params);
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await retryWithBackoff(async () => {
                // Usar CORS proxy para Deezer (CORS bloqueado en navegador)
                const corsProxy = API_CONFIG.corsProxy || 'https://corsproxy.io/?';
                const url = `${corsProxy}${encodeURIComponent(this.config.baseUrl + endpoint)}`;
                
                return await axios.get(url, {
                    params: {
                        ...params,
                        output: 'json',
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
     * Normalizar track de Deezer a formato universal
     */
    normalizeTrack(deezerTrack) {
        // Priorizar imágenes de alta resolución
        const imageUrl = deezerTrack.album?.cover_xl || 
                        deezerTrack.album?.cover_big || 
                        deezerTrack.album?.cover_medium || 
                        deezerTrack.album?.cover_small || 
                        deezerTrack.album?.cover || '';

        return {
            id: `deezer_${deezerTrack.id}`,
            title: deezerTrack.title || 'Unknown',
            artist: deezerTrack.artist?.name || 'Unknown Artist',
            album: deezerTrack.album?.title || '',
            image: imageUrl, // UI espera 'image' property
            artwork: imageUrl, // Mantener por compatibilidad
            coverBig: deezerTrack.album?.cover_big || imageUrl,
            cover: imageUrl,
            duration: deezerTrack.duration || 0,
            provider: 'deezer',
            audioUrl: null,
            previewUrl: deezerTrack.preview,
            externalUrl: deezerTrack.link || '',
            originalData: deezerTrack,
        };
    }

    /**
     * Buscar canciones en Deezer
     */
    async search(query, limit = 25) {
        console.log(`🔍 [Deezer] Searching: "${query}"`);

        const data = await this.request('/search', {
            q: query,
            limit,
        });

            const tracks = data.data?.map(track => this.normalizeTrack(track)) || [];
        return tracks;
    }

    /**
     * Obtener chart (trending)
     */
    async getChart(limit = 50) {
        console.log('📈 [Deezer] Getting chart');

        const data = await this.request('/chart', {
            limit,
        });

        const tracks = data.tracks?.data?.slice(0, limit).map(track => this.normalizeTrack(track)) || [];
        console.log(`✅ [Deezer] Found ${tracks.length} chart tracks`);
        return tracks;
    }

    /**
     * Obtener detalles de un álbum
     */
    async getAlbum(albumId) {
        console.log(`💿 [Deezer] Getting album: ${albumId}`);
        
        const data = await this.request(`/album/${albumId}`);
        
        return {
            id: `deezer_${data.id}`,
            title: data.title,
            artist: data.artist?.name || 'Unknown',
            artwork: data.cover_xl || data.cover_big || '',
            year: data.release_date ? new Date(data.release_date).getFullYear() : null,
            releaseDate: data.release_date,
            tracks: data.tracks?.data?.map(track => this.normalizeTrack(track)) || [],
            provider: 'deezer',
            externalUrl: data.link || '',
            originalData: data,
        };
    }

    /**
     * Obtener detalles de un artista
     */
    async getArtist(artistId) {
        console.log(`👤 [Deezer] Getting artist: ${artistId}`);
        
        const data = await this.request(`/artist/${artistId}`);
        
        return {
            id: `deezer_${data.id}`,
            name: data.name,
            image: data.picture_xl || data.picture_big || '',
            genres: [], // Deezer no proporciona géneros directamente
            provider: 'deezer',
            externalUrl: data.link || '',
            originalData: data,
        };
    }

    /**
     * Obtener top tracks de un artista
     */
    async getArtistTopTracks(artistId, limit = 10) {
        console.log(`🎵 [Deezer] Getting top tracks for artist: ${artistId}`);
        
        const data = await this.request(`/artist/${artistId}/top`, {
            limit,
        });

        const tracks = data.data?.map(track => this.normalizeTrack(track)) || [];
        console.log(`✅ [Deezer] Found ${tracks.length} top tracks`);
        return tracks;
    }
}

export default new DeezerProvider();
