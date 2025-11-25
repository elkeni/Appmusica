/**
 * Service Worker
 * Cache de assets estáticos y funcionalidad offline básica
 */

const CACHE_NAME = 'music-app-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Assets estáticos a cachear en la instalación
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/static/css/main.css',
    '/static/js/main.js',
    '/manifest.json',
];

// Estrategias de caché
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only',
};

/**
 * Instalación del Service Worker
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS.map(url => {
                // Cachear sin fallar si algún asset no existe
                return cache.add(url).catch(err => {
                    console.warn(`[SW] Failed to cache ${url}:`, err);
                });
            }));
        }).then(() => {
            console.log('[SW] Service Worker installed');
            return self.skipWaiting(); // Activar inmediatamente
        })
    );
});

/**
 * Activación del Service Worker
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Eliminar cachés antiguos
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== IMAGE_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service Worker activated');
            return self.clients.claim(); // Tomar control de todas las páginas
        })
    );
});

/**
 * Interceptar peticiones (Fetch)
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar peticiones a APIs externas que no queremos cachear
    if (url.origin !== location.origin && 
        !url.hostname.includes('deezer') && 
        !url.hostname.includes('itunes') &&
        !url.hostname.includes('youtube')) {
        return;
    }

    // Determinar estrategia según el tipo de recurso
    if (request.destination === 'image') {
        event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    } else if (url.pathname.startsWith('/static/')) {
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    } else if (request.method === 'GET') {
        event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    }
});

/**
 * Estrategia: Cache First
 * Busca en caché primero, si no está hace fetch
 */
async function cacheFirstStrategy(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        
        // Cachear respuesta exitosa
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache First error:', error);
        
        // Intentar devolver desde caché como fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Respuesta offline
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
        });
    }
}

/**
 * Estrategia: Network First
 * Intenta fetch primero, si falla busca en caché
 */
async function networkFirstStrategy(request, cacheName) {
    try {
        const networkResponse = await fetch(request);

        // Cachear respuesta exitosa
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Network First error:', error);
        
        // Fallback a caché
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }

        // Si es navegación, devolver página offline
        if (request.mode === 'navigate') {
            const offlineCache = await caches.open(STATIC_CACHE);
            return offlineCache.match('/index.html');
        }

        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
        });
    }
}

/**
 * Limpiar cachés antiguos periódicamente
 */
self.addEventListener('message', (event) => {
    if (event.data.action === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log('[SW] Clearing cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                console.log('[SW] All caches cleared');
                event.ports[0].postMessage({ success: true });
            })
        );
    }

    if (event.data.action === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

/**
 * Background Sync (para futuras mejoras)
 */
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

async function syncFavorites() {
    // TODO: Implementar sincronización de favoritos cuando vuelva la conexión
    console.log('[SW] Syncing favorites...');
}

/**
 * Push Notifications (para futuras mejoras)
 */
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'Nueva notificación',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: data,
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Music App', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
