import { useState, useCallback, useEffect } from 'react';
import MusicRepository from '../api/MusicRepository';
import { validateConfig } from '../api/config';

/**
 * Custom Hook: useMusic
 * Expone la funcionalidad del MusicRepository a los componentes React
 */
export function useMusic() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [configValid, setConfigValid] = useState(false);

    // Validar configuración al montar
    useEffect(() => {
        const isValid = validateConfig();
        setConfigValid(isValid);
        
        if (isValid) {
            console.log('✅ Music API configured successfully');
        } else {
            console.warn('⚠️ Music API configuration incomplete');
        }
    }, []);

    /**
     * Buscar canciones
     */
    const search = useCallback(async (query, limit = 20) => {
        setLoading(true);
        setError(null);

        try {
            const results = await MusicRepository.search(query, limit);
            return results;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Reproducir un track (obtiene stream URL)
     */
    const play = useCallback(async (track) => {
        setLoading(true);
        setError(null);

        try {
            const playableTrack = await MusicRepository.play(track);
            return playableTrack;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener trending
     */
    const getTrending = useCallback(async (limit = 50) => {
        setLoading(true);
        setError(null);

        try {
            const tracks = await MusicRepository.getTrending(limit);
            return tracks;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener recomendaciones basadas en un track
     */
    const getRecommendations = useCallback(async (track, limit = 20) => {
        setLoading(true);
        setError(null);

        try {
            const recommendations = await MusicRepository.getRecommendations(track, limit);
            return recommendations;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener nuevos lanzamientos
     */
    const getNewReleases = useCallback(async (limit = 20) => {
        setLoading(true);
        setError(null);

        try {
            const releases = await MusicRepository.getNewReleases(limit);
            return releases;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener detalles de artista
     */
    const getArtist = useCallback(async (artistId, provider = 'spotify') => {
        setLoading(true);
        setError(null);

        try {
            const artist = await MusicRepository.getArtist(artistId, provider);
            return artist;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener top tracks de artista
     */
    const getArtistTopTracks = useCallback(async (artistId, provider = 'spotify', limit = 10) => {
        setLoading(true);
        setError(null);

        try {
            const tracks = await MusicRepository.getArtistTopTracks(artistId, provider, limit);
            return tracks;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener álbum
     */
    const getAlbum = useCallback(async (albumId, provider = 'spotify') => {
        setLoading(true);
        setError(null);

        try {
            const album = await MusicRepository.getAlbum(albumId, provider);
            return album;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Buscar por tipo específico
     */
    const searchByType = useCallback(async (query, type = 'track', limit = 25) => {
        setLoading(true);
        setError(null);

        try {
            const results = await MusicRepository.searchByType(query, type, limit);
            return results;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener stream URL directamente (para casos avanzados)
     */
    const getStreamUrl = useCallback(async (videoId) => {
        setLoading(true);
        setError(null);

        try {
            const streamData = await MusicRepository.getStreamUrl(videoId);
            return streamData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Validar estado de providers
     */
    const validateProviders = useCallback(() => {
        return MusicRepository.validateProviders();
    }, []);

    return {
        // Estado
        loading,
        error,
        configValid,
        
        // Métodos principales
        search,
        play,
        getTrending,
        getRecommendations,
        getNewReleases,
        
        // Métodos de metadata
        getArtist,
        getArtistTopTracks,
        getAlbum,
        searchByType,
        
        // Métodos avanzados
        getStreamUrl,
        validateProviders,
    };
}

export default useMusic;
