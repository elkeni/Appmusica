/**
 * Toast Notification Service
 * Sistema de notificaciones user-friendly
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

class ToastService {
    constructor() {
        this.listeners = new Set();
        this.toasts = [];
        this.nextId = 1;
    }

    /**
     * Suscribirse a cambios en toasts
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notificar a todos los listeners
     */
    notify() {
        this.listeners.forEach(listener => listener(this.toasts));
    }

    /**
     * Agregar un toast
     */
    add(message, type = 'info', duration = 5000) {
        const toast = {
            id: this.nextId++,
            message,
            type,
            duration,
            timestamp: Date.now(),
        };

        this.toasts.push(toast);
        this.notify();

        // Auto-remove después de duration
        if (duration > 0) {
            setTimeout(() => this.remove(toast.id), duration);
        }

        return toast.id;
    }

    /**
     * Eliminar un toast
     */
    remove(id) {
        this.toasts = this.toasts.filter(toast => toast.id !== id);
        this.notify();
    }

    /**
     * Limpiar todos los toasts
     */
    clear() {
        this.toasts = [];
        this.notify();
    }

    /**
     * Métodos de conveniencia
     */
    success(message, duration) {
        return this.add(message, 'success', duration);
    }

    error(message, duration = 7000) {
        return this.add(message, 'error', duration);
    }

    warning(message, duration) {
        return this.add(message, 'warning', duration);
    }

    info(message, duration) {
        return this.add(message, 'info', duration);
    }

    /**
     * Toast para errores de API
     */
    apiError(error, fallbackMessage = 'Error al conectar con el servidor') {
        const message = error?.message || fallbackMessage;
        return this.error(message);
    }
}

// Exportar instancia única (Singleton)
const toastService = new ToastService();

export default toastService;

// Hook de React para usar el servicio
export function useToasts() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const unsubscribe = toastService.subscribe(setToasts);
        return unsubscribe;
    }, []);

    return {
        toasts,
        success: toastService.success.bind(toastService),
        error: toastService.error.bind(toastService),
        warning: toastService.warning.bind(toastService),
        info: toastService.info.bind(toastService),
        remove: toastService.remove.bind(toastService),
        clear: toastService.clear.bind(toastService),
    };
}

// Componente Toast
const TOAST_ICONS = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

const TOAST_STYLES = {
    success: 'from-green-500/20 to-green-900/20 border-green-500/30',
    error: 'from-red-500/20 to-red-900/20 border-red-500/30',
    warning: 'from-yellow-500/20 to-yellow-900/20 border-yellow-500/30',
    info: 'from-blue-500/20 to-blue-900/20 border-blue-500/30',
};

const ICON_STYLES = {
    success: 'text-green-500 bg-green-500/20',
    error: 'text-red-500 bg-red-500/20',
    warning: 'text-yellow-500 bg-yellow-500/20',
    info: 'text-blue-500 bg-blue-500/20',
};

export function Toast({ id, message, type, onClose }) {
    const Icon = TOAST_ICONS[type] || Info;
    const gradientStyle = TOAST_STYLES[type] || TOAST_STYLES.info;
    const iconStyle = ICON_STYLES[type] || ICON_STYLES.info;

    useEffect(() => {
        // Animación de entrada
        const element = document.getElementById(`toast-${id}`);
        if (element) {
            element.classList.add('animate-slideInRight');
        }
    }, [id]);

    return (
        <div
            id={`toast-${id}`}
            className={`bg-gradient-to-br ${gradientStyle} backdrop-blur-xl rounded-xl p-4 border shadow-2xl min-w-[320px] max-w-md`}
        >
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${iconStyle} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 pt-1">
                    <p className="text-white text-sm leading-relaxed">
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}

// Contenedor de Toasts
export function ToastContainer() {
    const { toasts, remove } = useToasts();

    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast {...toast} onClose={() => remove(toast.id)} />
                </div>
            ))}
        </div>
    );
}
