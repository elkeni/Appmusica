/**
 * @typedef {Object} Track
 * @property {string} id - ID único del track
 * @property {string} title - Título de la canción
 * @property {string} artist - Nombre del artista
 * @property {string} album - Nombre del álbum
 * @property {string} artwork - URL de imagen en alta resolución (preferible 1000x1000)
 * @property {number} duration - Duración en segundos
 * @property {'spotify'|'deezer'|'youtube'|'itunes'} provider - Proveedor de origen
 * @property {string} [audioUrl] - URL de audio (si está disponible)
 * @property {string} externalUrl - URL externa al proveedor
 * @property {string} [previewUrl] - URL de preview (30s)
 * @property {string} [videoId] - YouTube video ID (para streaming)
 * @property {Object} [originalData] - Datos originales del proveedor
 */

/**
 * @typedef {Object} Artist
 * @property {string} id
 * @property {string} name
 * @property {string} image
 * @property {string} [genres]
 * @property {'spotify'|'deezer'|'youtube'|'itunes'} provider
 * @property {string} externalUrl
 */

/**
 * @typedef {Object} Album
 * @property {string} id
 * @property {string} title
 * @property {string} artist
 * @property {string} artwork
 * @property {number} [year]
 * @property {string} [releaseDate]
 * @property {'spotify'|'deezer'|'youtube'|'itunes'} provider
 * @property {string} externalUrl
 */

/**
 * @typedef {Object} SearchResults
 * @property {Track[]} tracks
 * @property {Artist[]} artists
 * @property {Album[]} albums
 */

/**
 * @typedef {Object} ProviderConfig
 * @property {string} name
 * @property {boolean} enabled
 * @property {number} priority
 */

export {};
