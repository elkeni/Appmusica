import { REQUEST_CONFIG } from '../config';

/**
 * Cache simple en memoria con expiración
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Generar clave de cache
     */
    generateKey(provider, method, params) {
        return `${provider}:${method}:${JSON.stringify(params)}`;
    }

    /**
     * Obtener valor del cache
     */
    get(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            return null;
        }

        // Verificar si expiró
        if (Date.now() > cached.expiration) {
            this.cache.delete(key);
            return null;
        }

        console.log(`📦 Cache HIT: ${key.substring(0, 50)}...`);
        return cached.data;
    }

    /**
     * Guardar en cache
     */
    set(key, data, ttl = REQUEST_CONFIG.cacheExpiration) {
        this.cache.set(key, {
            data,
            expiration: Date.now() + ttl,
        });
        console.log(`💾 Cache SET: ${key.substring(0, 50)}...`);
    }

    /**
     * Limpiar cache expirado
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, value] of this.cache.entries()) {
            if (now > value.expiration) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cache cleanup: ${cleaned} entries removed`);
        }
    }

    /**
     * Limpiar todo el cache
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`🗑️ Cache cleared: ${size} entries removed`);
    }

    /**
     * Obtener estadísticas del cache
     */
    getStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()).map(k => ({
                key: k.substring(0, 50),
                expiration: new Date(this.cache.get(k).expiration).toISOString(),
            })),
        };
    }
}

// Instancia singleton
const cacheManager = new CacheManager();

// Limpiar cache cada 5 minutos
setInterval(() => cacheManager.cleanup(), 5 * 60 * 1000);

export default cacheManager;
