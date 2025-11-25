/**
 * Analytics Service
 * Tracking de eventos y métricas de uso
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { app } from '../firebase';

class AnalyticsService {
    constructor() {
        this.analytics = null;
        try {
            this.analytics = getAnalytics(app);
        } catch (error) {
            console.error('Analytics initialization error:', error);
        }
    }

    /**
     * Verificar si analytics está habilitado
     */
    isEnabled() {
        return this.analytics !== null;
    }

    /**
     * Registrar evento genérico
     */
    logEvent(eventName, params = {}) {
        if (!this.isEnabled()) return;

        try {
            logEvent(this.analytics, eventName, params);
        } catch (error) {
            console.error('Analytics logEvent error:', error);
        }
    }

    /**
     * Establecer ID de usuario
     */
    setUserId(userId) {
        if (!this.isEnabled()) return;

        try {
            setUserId(this.analytics, userId);
        } catch (error) {
            console.error('Analytics setUserId error:', error);
        }
    }

    /**
     * Establecer propiedades del usuario
     */
    setUserProperties(properties) {
        if (!this.isEnabled()) return;

        try {
            setUserProperties(this.analytics, properties);
        } catch (error) {
            console.error('Analytics setUserProperties error:', error);
        }
    }

    // ===== EVENTOS DE USUARIO =====

    /**
     * Track: Búsqueda realizada
     */
    trackSearch(query, resultsCount) {
        this.logEvent('search', {
            search_term: query,
            results_count: resultsCount,
        });
    }

    /**
     * Track: Canción reproducida
     */
    trackPlay(track) {
        this.logEvent('play_track', {
            track_id: track.id,
            track_title: track.title,
            artist: track.artist?.name || 'Unknown',
            provider: track.provider || 'unknown',
        });
    }

    /**
     * Track: Canción añadida a favoritos
     */
    trackAddFavorite(track) {
        this.logEvent('add_favorite', {
            track_id: track.id,
            track_title: track.title,
            artist: track.artist?.name || 'Unknown',
        });
    }

    /**
     * Track: Canción removida de favoritos
     */
    trackRemoveFavorite(trackId) {
        this.logEvent('remove_favorite', {
            track_id: trackId,
        });
    }

    /**
     * Track: Playlist creada
     */
    trackCreatePlaylist(playlistName) {
        this.logEvent('create_playlist', {
            playlist_name: playlistName,
        });
    }

    /**
     * Track: Canción añadida a playlist
     */
    trackAddToPlaylist(trackId, playlistId) {
        this.logEvent('add_to_playlist', {
            track_id: trackId,
            playlist_id: playlistId,
        });
    }

    /**
     * Track: Compartir contenido
     */
    trackShare(contentType, contentId) {
        this.logEvent('share', {
            content_type: contentType,
            content_id: contentId,
        });
    }

    // ===== EVENTOS DE NAVEGACIÓN =====

    /**
     * Track: Vista de página
     */
    trackPageView(pageName, path) {
        this.logEvent('page_view', {
            page_name: pageName,
            page_path: path,
        });
    }

    /**
     * Track: Click en artista
     */
    trackArtistClick(artistId, artistName) {
        this.logEvent('artist_click', {
            artist_id: artistId,
            artist_name: artistName,
        });
    }

    /**
     * Track: Click en álbum
     */
    trackAlbumClick(albumId, albumTitle) {
        this.logEvent('album_click', {
            album_id: albumId,
            album_title: albumTitle,
        });
    }

    // ===== EVENTOS DE AUTENTICACIÓN =====

    /**
     * Track: Login
     */
    trackLogin(method = 'email') {
        this.logEvent('login', {
            method,
        });
    }

    /**
     * Track: Sign up
     */
    trackSignUp(method = 'email') {
        this.logEvent('sign_up', {
            method,
        });
    }

    /**
     * Track: Logout
     */
    trackLogout() {
        this.logEvent('logout');
    }

    // ===== EVENTOS DE ERRORES =====

    /**
     * Track: Error de API
     */
    trackAPIError(endpoint, errorMessage) {
        this.logEvent('api_error', {
            endpoint,
            error_message: errorMessage,
        });
    }

    /**
     * Track: Error de reproducción
     */
    trackPlaybackError(trackId, errorMessage) {
        this.logEvent('playback_error', {
            track_id: trackId,
            error_message: errorMessage,
        });
    }

    /**
     * Track: Error general
     */
    trackError(errorType, errorMessage, stackTrace = '') {
        this.logEvent('error', {
            error_type: errorType,
            error_message: errorMessage,
            stack_trace: stackTrace?.substring(0, 500), // Limitar tamaño
        });
    }

    // ===== EVENTOS DE PERFORMANCE =====

    /**
     * Track: Tiempo de carga de página
     */
    trackPageLoadTime(pageName, loadTime) {
        this.logEvent('page_load_time', {
            page_name: pageName,
            load_time_ms: loadTime,
        });
    }

    /**
     * Track: Cache hit
     */
    trackCacheHit(cacheType, key) {
        this.logEvent('cache_hit', {
            cache_type: cacheType,
            cache_key: key,
        });
    }

    /**
     * Track: Cache miss
     */
    trackCacheMiss(cacheType, key) {
        this.logEvent('cache_miss', {
            cache_type: cacheType,
            cache_key: key,
        });
    }

    // ===== EVENTOS DE ENGAGEMENT =====

    /**
     * Track: Sesión iniciada
     */
    trackSessionStart() {
        this.logEvent('session_start');
    }

    /**
     * Track: Sesión terminada
     */
    trackSessionEnd(duration) {
        this.logEvent('session_end', {
            session_duration_sec: Math.floor(duration / 1000),
        });
    }

    /**
     * Track: Tiempo de reproducción
     */
    trackPlaybackDuration(trackId, duration) {
        this.logEvent('playback_duration', {
            track_id: trackId,
            duration_sec: Math.floor(duration),
        });
    }
}

// Exportar instancia única (Singleton)
const analyticsService = new AnalyticsService();

export default analyticsService;

// Hook de React para usar analytics
export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        // Track page view cuando cambia la ruta
        const pageName = location.pathname.split('/')[1] || 'home';
        analyticsService.trackPageView(pageName, location.pathname);
    }, [location]);
}

// Hook para trackear sesión
export function useSessionTracking() {
    useEffect(() => {
        const startTime = Date.now();
        analyticsService.trackSessionStart();

        return () => {
            const duration = Date.now() - startTime;
            analyticsService.trackSessionEnd(duration);
        };
    }, []);
}
