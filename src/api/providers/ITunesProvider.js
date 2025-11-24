import axios from 'axios';
import { API_CONFIG } from '../config';
import cacheManager from '../utils/cache';
import { handleHTTPError, retryWithBackoff } from '../utils/errorHandler';

/**
 * iTunes Provider - High Resolution Artwork, Quick Metadata
 */
class ITunesProvider {
    constructor() {
        this.name = 'itunes';
        this.config = API_CONFIG.itunes;
    }

    /**
     * Hacer petición a iTunes
     */
    async request(endpoint, params = {}) {
        const cacheKey = cacheManager.generateKey(this.name, endpoint, params);
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await retryWithBackoff(async () => {
                return await axios.get(`${this.config.baseUrl}${endpoint}`, {
                    params,
                });
            });

            cacheManager.set(cacheKey, response.data);
            return response.data;
        } catch (error) {
            throw handleHTTPError(error, this.name);
        }
    }

    /**
     * Normalizar track de iTunes a formato universal
     */
    normalizeTrack(itunesTrack) {
        // iTunes artwork viene en 100x100 por defecto, cambiar a 1000x1000 para alta resolución
        const imageBig = itunesTrack.artworkUrl100
            ? itunesTrack.artworkUrl100.replace('100x100', '1000x1000')
            : itunesTrack.artworkUrl60?.replace('60x60', '1000x1000') || '';
        
        const imageMedium = itunesTrack.artworkUrl100?.replace('100x100', '600x600') || imageBig;
        const imageUrl = imageBig || imageMedium;

        return {
            id: `itunes_${itunesTrack.trackId}`,
            title: itunesTrack.trackName || 'Unknown',
            artist: itunesTrack.artistName || 'Unknown Artist',
            album: itunesTrack.collectionName || '',
            image: imageUrl, // UI espera 'image' property
            artwork: imageUrl, // Mantener por compatibilidad (high resolution 1000x1000)
            coverBig: imageBig, // Para consistencia con Deezer/Spotify
            cover: imageUrl,
            duration: Math.floor((itunesTrack.trackTimeMillis || 0) / 1000),
            provider: 'itunes',
            audioUrl: null, // iTunes no proporciona streaming directo
            previewUrl: itunesTrack.previewUrl, // Preview de 30 segundos
            externalUrl: itunesTrack.trackViewUrl || '',
            originalData: itunesTrack,
        };
    }

    /**
     * Buscar canciones en iTunes
     */
    async search(query, limit = 25) {
        console.log(`🔍 [iTunes] Searching: "${query}"`);

        const data = await this.request('/search', {
            term: query,
            media: 'music',
            entity: 'song',
            limit,
        });

        const tracks = data.results?.map(track => this.normalizeTrack(track)) || [];
        console.log(`✅ [iTunes] Found ${tracks.length} tracks`);
        return tracks;
    }

    /**
     * Buscar álbumes
     */
    async searchAlbums(query, limit = 25) {
        console.log(`🔍 [iTunes] Searching albums: "${query}"`);

        const data = await this.request('/search', {
            term: query,
            media: 'music',
            entity: 'album',
            limit,
        });

        const albums = data.results?.map(album => ({
            id: `itunes_${album.collectionId}`,
            title: album.collectionName,
            artist: album.artistName,
            artwork: album.artworkUrl100?.replace('100x100', '1000x1000') || '',
            year: album.releaseDate ? new Date(album.releaseDate).getFullYear() : null,
            releaseDate: album.releaseDate,
            provider: 'itunes',
            externalUrl: album.collectionViewUrl || '',
            originalData: album,
        })) || [];

        console.log(`✅ [iTunes] Found ${albums.length} albums`);
        return albums;
    }

    /**
     * Buscar artistas
     */
    async searchArtists(query, limit = 25) {
        console.log(`🔍 [iTunes] Searching artists: "${query}"`);

        const data = await this.request('/search', {
            term: query,
            media: 'music',
            entity: 'musicArtist',
            limit,
        });

        const artists = data.results?.map(artist => ({
            id: `itunes_${artist.artistId}`,
            name: artist.artistName,
            image: '', // iTunes no proporciona imágenes de artistas directamente
            genres: [artist.primaryGenreName].filter(Boolean),
            provider: 'itunes',
            externalUrl: artist.artistLinkUrl || '',
            originalData: artist,
        })) || [];

        console.log(`✅ [iTunes] Found ${artists.length} artists`);
        return artists;
    }

    /**
     * Obtener detalles de un álbum por ID
     */
    async getAlbum(albumId) {
        console.log(`💿 [iTunes] Getting album: ${albumId}`);
        
        const data = await this.request('/lookup', {
            id: albumId.replace('itunes_', ''),
            entity: 'song',
        });

        const album = data.results?.[0];
        const tracks = data.results?.slice(1).map(track => this.normalizeTrack(track)) || [];

        if (!album) {
            throw new Error('Album not found');
        }

        return {
            id: `itunes_${album.collectionId}`,
            title: album.collectionName,
            artist: album.artistName,
            artwork: album.artworkUrl100?.replace('100x100', '1000x1000') || '',
            year: album.releaseDate ? new Date(album.releaseDate).getFullYear() : null,
            releaseDate: album.releaseDate,
            tracks,
            provider: 'itunes',
            externalUrl: album.collectionViewUrl || '',
            originalData: album,
        };
    }
}

const iTunesProvider = new ITunesProvider();
export default iTunesProvider;
