/**
 * Cache Service
 * Sistema de caché mejorado con expiración y gestión de cuotas
 */

const CACHE_PREFIX = 'music_app_';
const DEFAULT_TTL = 1000 * 60 * 30; // 30 minutos
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB

class CacheService {
    constructor() {
        this.storage = localStorage;
        this.checkQuota();
    }

    /**
     * Verificar espacio disponible
     */
    checkQuota() {
        try {
            const totalSize = this.getCacheSize();
            if (totalSize > MAX_CACHE_SIZE) {
                console.warn('⚠️ Cache size exceeded, cleaning old entries...');
                this.cleanOldEntries();
            }
        } catch (error) {
            console.error('Error checking cache quota:', error);
        }
    }

    /**
     * Calcular tamaño total del caché
     */
    getCacheSize() {
        let total = 0;
        for (let key in this.storage) {
            if (key.startsWith(CACHE_PREFIX)) {
                total += (this.storage[key].length + key.length) * 2; // UTF-16
            }
        }
        return total;
    }

    /**
     * Generar clave de caché
     */
    generateKey(namespace, identifier) {
        return `${CACHE_PREFIX}${namespace}_${identifier}`;
    }

    /**
     * Guardar en caché
     */
    set(namespace, identifier, data, ttl = DEFAULT_TTL) {
        try {
            const key = this.generateKey(namespace, identifier);
            const cacheEntry = {
                data,
                timestamp: Date.now(),
                expires: Date.now() + ttl,
            };

            this.storage.setItem(key, JSON.stringify(cacheEntry));
            this.checkQuota();

            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.warn('⚠️ Storage quota exceeded, cleaning cache...');
                this.cleanOldEntries();
                // Intentar de nuevo después de limpiar
                try {
                    const key = this.generateKey(namespace, identifier);
                    const cacheEntry = {
                        data,
                        timestamp: Date.now(),
                        expires: Date.now() + ttl,
                    };
                    this.storage.setItem(key, JSON.stringify(cacheEntry));
                    return true;
                } catch (retryError) {
                    console.error('Failed to cache after cleanup:', retryError);
                    return false;
                }
            }
            console.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Obtener de caché
     */
    get(namespace, identifier) {
        try {
            const key = this.generateKey(namespace, identifier);
            const cached = this.storage.getItem(key);

            if (!cached) {
                return null;
            }

            const cacheEntry = JSON.parse(cached);

            // Verificar expiración
            if (Date.now() > cacheEntry.expires) {
                this.storage.removeItem(key);
                return null;
            }

            return cacheEntry.data;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Verificar si existe en caché
     */
    has(namespace, identifier) {
        const data = this.get(namespace, identifier);
        return data !== null;
    }

    /**
     * Eliminar entrada específica
     */
    remove(namespace, identifier) {
        try {
            const key = this.generateKey(namespace, identifier);
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Cache remove error:', error);
            return false;
        }
    }

    /**
     * Limpiar entradas expiradas
     */
    cleanOldEntries() {
        try {
            const keysToRemove = [];
            const now = Date.now();

            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);

                if (!key || !key.startsWith(CACHE_PREFIX)) {
                    continue;
                }

                try {
                    const cached = this.storage.getItem(key);
                    const cacheEntry = JSON.parse(cached);

                    if (now > cacheEntry.expires) {
                        keysToRemove.push(key);
                    }
                } catch (error) {
                    // Si hay error al parsear, eliminar entrada corrupta

                    /**
                     * Limpiar todo el caché del namespace
                     */
                    clearNamespace(namespace) {
                        try {
                            const keysToRemove = [];
                            const prefix = `${CACHE_PREFIX}${namespace}_`;

                            for (let i = 0; i < this.storage.length; i++) {
                                const key = this.storage.key(i);
                                /**
                                 * Limpiar todo el caché
                                 */
                                clearAll() {
                                    try {
                                        const keysToRemove = [];

                                        for (let i = 0; i < this.storage.length; i++) {
                                            const key = this.storage.key(i);
                                            /**
                                             * Obtener estadísticas del caché
                                             */
                                            getStats() {
                                                let totalEntries = 0;
                                                let expiredEntries = 0;
                                                const now = Date.now();

                                                for (let i = 0; i < this.storage.length; i++) {
                                                    const key = this.storage.key(i);

                                                    if (!key || !key.startsWith(CACHE_PREFIX)) {
                                                        continue;
                                                    }

                                                    totalEntries++;

                                                    try {
                                                        const cached = this.storage.getItem(key);
                                                        const cacheEntry = JSON.parse(cached);

                                                        if (now > cacheEntry.expires) {
                                                            expiredEntries++;
                                                        }
                                                    } catch (error) {
                                                        expiredEntries++;
                                                    }
                                                }

                                                return {
                                                    totalEntries,
                                                    expiredEntries,
                                                    activeEntries: totalEntries - expiredEntries,
                                                    totalSize: this.getCacheSize(),
                                                    maxSize: MAX_CACHE_SIZE,
                                                    usagePercentage: ((this.getCacheSize() / MAX_CACHE_SIZE) * 100).toFixed(2),
                                                };
                                            }
                                        }

                                        // Exportar instancia única (Singleton)
                                        const cacheService = new CacheService();

                                        // Limpiar caché expirado al iniciar
                                        cacheService.cleanOldEntries();

                                        export default cacheService;

                                        // Namespaces predefinidos
                                        export const CACHE_NAMESPACES = {
                                            SEARCH: 'search',
                                            TRACK: 'track',
                                            ARTIST: 'artist',
                                            ALBUM: 'album',
                                            PLAYLIST: 'playlist',
                                            TRENDING: 'trending',
                                            YOUTUBE: 'youtube',
                                        };

                                        // TTLs personalizados
                                        export const CACHE_TTL = {
                                            SHORT: 1000 * 60 * 5,      // 5 minutos
                                            MEDIUM: 1000 * 60 * 30,    // 30 minutos (default)
                                            LONG: 1000 * 60 * 60 * 2,  // 2 horas
                                            DAY: 1000 * 60 * 60 * 24,  // 24 horas
                                        };
