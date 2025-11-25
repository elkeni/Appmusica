/**
 * Service Worker Registration
 * Utilidad para registrar y gestionar el Service Worker
 */

import { useState, useEffect } from 'react';

const SW_PATH = '/service-worker.js';

/**
 * Verificar si el navegador soporta Service Workers
 */
export function isServiceWorkerSupported() {
    return 'serviceWorker' in navigator;
}

/**
 * Registrar Service Worker
 */
export async function registerServiceWorker() {
    if (!isServiceWorkerSupported()) {
        console.warn('⚠️ Service Workers not supported in this browser');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register(SW_PATH);
        console.log('✅ Service Worker registered:', registration);

        // Escuchar actualizaciones
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            if (!newWorker) {
                return;
            }

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🆕 New Service Worker available');

                    // Notificar al usuario que hay una actualización
                    notifyUpdate(registration);
                }
            });
        });

        return registration;
    } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        return null;
    }
}

/**
 * Desregistrar Service Worker
 */
export async function unregisterServiceWorker() {
    if (!isServiceWorkerSupported()) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const unregistered = await registration.unregister();

        if (unregistered) {
            console.log('🗑️ Service Worker unregistered');
        }

        return unregistered;
    } catch (error) {
        console.error('Error unregistering Service Worker:', error);
        return false;
    }
}

/**
 * Actualizar Service Worker
 */
export async function updateServiceWorker() {
    if (!isServiceWorkerSupported()) {
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        console.log('🔄 Service Worker update check triggered');
        return registration;
    } catch (error) {
        console.error('Error updating Service Worker:', error);
        return null;
    }
}

/**
 * Limpiar todo el caché del Service Worker
 */
export async function clearServiceWorkerCache() {
    if (!isServiceWorkerSupported()) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        if (registration.active) {
            const messageChannel = new MessageChannel();

            return new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.success);
                };

                registration.active.postMessage(
                    { action: 'CLEAR_CACHE' },
                    [messageChannel.port2]
                );
            });
        }

        return false;
    } catch (error) {
        console.error('Error clearing Service Worker cache:', error);
        return false;
    }
}

/**
 * Verificar si hay conexión a internet
 */
export function isOnline() {
    return navigator.onLine;
}

/**
 * Escuchar cambios de conectividad
 */
export function onConnectivityChange(callback) {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Retornar función de limpieza
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}

/**
 * Hook de React para detectar conectividad
 */
export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const cleanup = onConnectivityChange(setIsOnline);
        return cleanup;
    }, []);

    return isOnline;
}

/**
 * Notificar al usuario sobre actualización disponible
 */
function notifyUpdate(registration) {
    // Importar toast service de forma dinámica para evitar dependencia circular
    import('./toastService').then(({ default: toastService }) => {
        toastService.info(
            'Nueva versión disponible. Recarga la página para actualizar.',
            0 // No auto-cerrar
        );

        // Skip waiting y recargar cuando se active el nuevo service worker
        if (registration.waiting) {
            registration.waiting.postMessage({ action: 'SKIP_WAITING' });
            // Recargar la página cuando el nuevo worker tome control
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }

        // Log para desarrollo
        console.log('💡 Tip: Reload the page to get the latest version');
    }).catch(err => {
        console.error('Failed to import toast service:', err);
    });
}

/**
 * Auto-registrar en producción
 */
if (process.env.NODE_ENV === 'production') {
    if (document.readyState === 'complete') {
        registerServiceWorker();
    } else {
        window.addEventListener('load', registerServiceWorker);
    }
}

const serviceWorkerManager = {
    register: registerServiceWorker,
    unregister: unregisterServiceWorker,
    update: updateServiceWorker,
    clearCache: clearServiceWorkerCache,
    isSupported: isServiceWorkerSupported,
};

export default serviceWorkerManager;
