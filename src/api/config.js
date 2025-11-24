/**
 * Configuración centralizada de APIs
 */

export const API_CONFIG = {
    spotify: {
        clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
        clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
        baseUrl: process.env.REACT_APP_SPOTIFY_BASE_URL || 'https://api.spotify.com/v1',
        authUrl: 'https://accounts.spotify.com/api/token',
        enabled: true,
        priority: 1, // Prioridad más alta para metadata
    },
    deezer: {
        apiKey: process.env.REACT_APP_DEEZER_API_KEY,
        baseUrl: process.env.REACT_APP_DEEZER_BASE_URL || 'https://api.deezer.com',
        enabled: true,
        priority: 2,
    },
    itunes: {
        baseUrl: process.env.REACT_APP_ITUNES_BASE_URL || 'https://itunes.apple.com',
        enabled: true,
        priority: 3,
    },
    youtube: {
        apiKey: process.env.REACT_APP_YOUTUBE_API_KEY,
        baseUrl: process.env.REACT_APP_YOUTUBE_BASE_URL || 'https://www.googleapis.com/youtube/v3',
        enabled: !!process.env.REACT_APP_YOUTUBE_API_KEY, // Deshabilitado si no hay API key
        priority: 1, // Prioridad alta para audio streaming
    },
    corsProxy: process.env.REACT_APP_CORS_PROXY || '',
};

/**
 * Timeouts y rate limiting
 */
export const REQUEST_CONFIG = {
    timeout: 10000, // 10 segundos
    retries: 3,
    retryDelay: 1000, // 1 segundo
    cacheExpiration: 3600000, // 1 hora en milisegundos
};

/**
 * Validar configuración al inicio
 */
export function validateConfig() {
    const warnings = [];
    
    if (!API_CONFIG.spotify.clientId || !API_CONFIG.spotify.clientSecret) {
        warnings.push('⚠️ Spotify credentials not configured');
    }
    
    if (!API_CONFIG.youtube.apiKey) {
        warnings.push('⚠️ YouTube API key not configured - audio streaming will be limited');
    }
    
    if (warnings.length > 0) {
        console.warn('🔧 API Configuration Warnings:');
        warnings.forEach(w => console.warn(w));
    }
    
    return warnings.length === 0;
}

export default API_CONFIG;
