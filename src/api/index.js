/**
 * API Module Exports
 * Punto de entrada único para toda la funcionalidad de música
 */

// Repository (Facade principal)
export { default as MusicRepository } from './MusicRepository';

// Configuración
export { API_CONFIG, REQUEST_CONFIG, validateConfig } from './config';

// Providers individuales (por si se necesitan directamente)
export { default as SpotifyProvider } from './providers/SpotifyProvider';
export { default as DeezerProvider } from './providers/DeezerProvider';
export { default as ITunesProvider } from './providers/ITunesProvider';
export { default as YouTubeProvider } from './providers/YouTubeProvider';

// Utilities
export { default as cacheManager } from './utils/cache';
export { APIError, handleHTTPError, logError, retryWithBackoff } from './utils/errorHandler';

// Hook
export { useMusic } from '../hooks/useMusic';
