/**
 * MusicRepository - Patrón Facade
 * ÚNICO PUNTO DE CONTACTO para la UI
 * 
 * Estrategia:
 * 1. Metadata visual rica → Deezer/iTunes
 * 2. Audio completo → YouTube
 */

import DeezerProvider from './providers/DeezerProvider';
import ITunesProvider from './providers/ITunesProvider';
import YouTubeProvider from './providers/YouTubeProvider';
import { logError } from './utils/errorHandler';

class MusicRepository {
    constructor() {
        // Proveedores para metadata
        this.metadataProviders = [
            DeezerProvider,
            ITunesProvider,
        ];

        this.youtubeProvider = YouTubeProvider;
    }

    /**
     * BÚSQUEDA UNIVERSAL
     * Devuelve metadata rica de Deezer/iTunes
     */
    async search(query, limit = 20) {
        const results = [];
        const errors = [];

        // Intentar con cada proveedor en orden de prioridad
        for (const provider of this.metadataProviders) {
            try {
                const tracks = await provider.search(query, limit);
                
                if (tracks && tracks.length > 0) {
                    results.push(...tracks);
                    
                    // Si ya tenemos suficientes resultados, terminar
                    if (results.length >= limit) {
                        break;
                    }
                }
            } catch (error) {
                console.warn(`⚠️ [MusicRepository] ${provider.name} search failed:`, error.message);
                errors.push({ provider: provider.name, error });
            }
        }

        if (results.length === 0 && errors.length > 0) {
            logError(errors[0].error);
            throw new Error('All search providers failed');
        }

        // Eliminar duplicados y limitar resultados
        const uniqueResults = this.deduplicateTracks(results);
        const finalResults = uniqueResults.slice(0, limit);

        return finalResults;
    }

    /**
     * REPRODUCIR TRACK
     * 1. Toma la metadata del track (puede venir de Deezer/iTunes)
     * 2. Busca silenciosamente en YouTube el videoId equivalente
     * 3. Obtiene la URL de stream real
     */
    async play(track) {
        try {
            // Obtener videoId de YouTube
            let videoId = track.videoId;

            // Validar que el videoId sea de YouTube (no de Deezer, Spotify, etc.)
            // Solo validar si existe y no es un ID de otra plataforma
            const isValidYouTubeId = videoId && 
                                    typeof videoId === 'string' &&
                                    videoId.length >= 11 && // IDs de YouTube son típicamente 11 caracteres
                                    !videoId.startsWith('deezer_') && 
                                    !videoId.startsWith('itunes_') &&
                                    !/[^a-zA-Z0-9_-]/.test(videoId); // Solo caracteres válidos de YouTube

            if (!isValidYouTubeId) {
                const audioData = await this.youtubeProvider.getAudioStream(track);
                videoId = audioData.videoId;
            }

            // Validación final - más permisiva
            if (!videoId || typeof videoId !== 'string' || videoId.length < 11) {
                throw new Error('Could not find YouTube video for this track');
            }

            // Validación de formato - solo rechazar si es claramente de otra plataforma
            if (videoId.startsWith('deezer_') || videoId.startsWith('itunes_')) {
                console.error(`❌ [MusicRepository] Invalid videoId format: ${videoId}`);
                throw new Error(`Invalid videoId format: ${videoId}. Expected YouTube video ID.`);
            }

            // Retornar URL de YouTube para react-player
            const playbackUrl = `https://www.youtube.com/watch?v=${videoId}`;

            return {
                ...track,
                provider: 'youtube',
                youtubeId: videoId,
                playbackUrl: playbackUrl,
            };
        } catch (error) {
            logError(error);
            throw new Error(`Failed to play track: ${error.message}`);
        }
    }

    /**
     * OBTENER TRENDING
     * Prioridad: Deezer → YouTube
     */
    async getTrending(limit = 50) {
        try {
            const tracks = await DeezerProvider.getChart(limit);
            return tracks;
        } catch (deezerError) {
            const tracks = await this.youtubeProvider.getTrending(limit);
            return tracks;
        }
    }

    /**
     * OBTENER RECOMENDACIONES
     * Basado en un track existente
     */
    async getRecommendations(track, limit = 20) {
        try {
            // Buscar canciones similares basadas en artista/álbum
            const searchQuery = `${track.artist} ${track.album || 'music'}`;
            const similar = await this.search(searchQuery, limit);
            
            // Filtrar el track original
            const filtered = similar.filter(t => 
                t.id !== track.id && 
                t.title.toLowerCase() !== track.title.toLowerCase()
            );

            console.log(`✅ [MusicRepository] Got ${filtered.length} similar tracks`);
            return filtered.slice(0, limit);
        } catch (error) {
            logError(error);
            // Si todo falla, retornar trending como último recurso
            console.log('⚠️ [MusicRepository] Recommendations failed, returning trending...');
            return this.getTrending(limit);
        }
    }

    /**
     * OBTENER NUEVOS LANZAMIENTOS
     */
    async getNewReleases(limit = 20) {
        // Usar trending como fuente de nuevos lanzamientos
        return this.getTrending(limit);
    }

    /**
     * OBTENER DETALLES DE ARTISTA
     */
    async getArtist(artistId, provider = 'deezer') {
        console.log(`👤 [MusicRepository] Getting artist: ${artistId} from ${provider}`);

        const providerMap = {
            deezer: DeezerProvider,
            itunes: ITunesProvider,
        };

        const selectedProvider = providerMap[provider] || DeezerProvider;
        
        try {
            const artist = await selectedProvider.getArtist(artistId);
            console.log(`✅ [MusicRepository] Got artist: ${artist.name}`);
            return artist;
        } catch (error) {
            logError(error);
            throw error;
        }
    }

    /**
     * OBTENER TOP TRACKS DE ARTISTA
     */
    async getArtistTopTracks(artistId, provider = 'deezer', limit = 10) {
        console.log(`🎵 [MusicRepository] Getting top tracks for artist: ${artistId}`);

        const providerMap = {
            deezer: DeezerProvider,
        };

        const selectedProvider = providerMap[provider] || DeezerProvider;
        
        try {
            const tracks = await selectedProvider.getArtistTopTracks(artistId, limit);
            console.log(`✅ [MusicRepository] Got ${tracks.length} top tracks`);
            return tracks;
        } catch (error) {
            logError(error);
            throw error;
        }
    }

    /**
     * OBTENER ÁLBUM
     */
    async getAlbum(albumId, provider = 'deezer') {
        console.log(`💿 [MusicRepository] Getting album: ${albumId} from ${provider}`);

        const providerMap = {
            deezer: DeezerProvider,
            itunes: ITunesProvider,
        };

        const selectedProvider = providerMap[provider] || DeezerProvider;
        
        try {
            const album = await selectedProvider.getAlbum(albumId);
            console.log(`✅ [MusicRepository] Got album: ${album.title}`);
            return album;
        } catch (error) {
            logError(error);
            throw error;
        }
    }

    /**
     * BUSCAR POR TIPO (tracks, artists, albums)
     */
    async searchByType(query, type = 'track', limit = 25) {
        console.log(`🔍 [MusicRepository] Searching ${type}s: "${query}"`);

        switch (type) {
            case 'track':
                return this.search(query, limit);
            
            case 'artist':
                try {
                    return await ITunesProvider.searchArtists(query, limit);
                } catch (error) {
                    logError(error);
                    return [];
                }
            
            case 'album':
                try {
                    return await ITunesProvider.searchAlbums(query, limit);
                } catch (error) {
                    logError(error);
                    return [];
                }
            
            default:
                throw new Error(`Invalid search type: ${type}`);
        }
    }

    /**
     * UTILIDAD: Eliminar duplicados de tracks
     */
    deduplicateTracks(tracks) {
        const seen = new Map();
        const result = [];

        for (const track of tracks) {
            // Usar título + artista como clave única
            const key = `${track.title.toLowerCase()}-${track.artist.toLowerCase()}`;
            
            if (!seen.has(key)) {
                seen.set(key, true);
                result.push(track);
            }
        }

        return result;
    }

    /**
     * VALIDAR PROVIDERS
     */
    validateProviders() {
        console.log('🔧 Validating providers...');
        
        const status = {
            metadata: this.metadataProviders.map(p => ({
                name: p.name,
                enabled: p.config?.enabled !== false,
            })),
            audio: this.audioProviders.map(p => ({
                name: p.name,
                enabled: true,
            })),
            youtube: {
                name: this.youtubeProvider.name,
                enabled: !!this.youtubeProvider.config?.apiKey,
            },
        };

        console.log('Provider Status:', status);
        return status;
    }
}

// Exportar instancia singleton
const musicRepository = new MusicRepository();
export default musicRepository;
