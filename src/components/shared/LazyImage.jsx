import React, { useState, useEffect, useRef, memo } from 'react';
import { Music } from 'lucide-react';

/**
 * LazyImage Component
 * Imagen optimizada con lazy loading y blur-up effect
 */
const LazyImage = memo(function LazyImage({
    src,
    alt,
    className = '',
    fallback = null,
    aspectRatio = '1/1',
    blur = true,
    onLoad,
    onError,
    ...props
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    // Intersection Observer para lazy loading
    useEffect(() => {
        const currentImg = imgRef.current;
        
        if (!currentImg) return;

        // Crear observer
        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    // Dejar de observar una vez que está en vista
                    observerRef.current?.unobserve(currentImg);
                }
            },
            {
                rootMargin: '50px', // Empezar a cargar 50px antes de entrar en vista
                threshold: 0.01,
            }
        );

        observerRef.current.observe(currentImg);

        return () => {
            if (observerRef.current && currentImg) {
                observerRef.current.unobserve(currentImg);
            }
        };
    }, []);

    const handleLoad = (e) => {
        setIsLoaded(true);
        onLoad?.(e);
    };

    const handleError = (e) => {
        setHasError(true);
        onError?.(e);
    };

    // Renderizar fallback si hay error o no hay src
    if (hasError || !src) {
        return (
            <div
                ref={imgRef}
                className={`flex items-center justify-center bg-white/5 ${className}`}
                style={{ aspectRatio }}
                {...props}
            >
                {fallback || (
                    <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                        <Music size={32} className="text-gray-500" />
                        <span className="text-xs text-gray-500">Sin imagen</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{ aspectRatio }}
            {...props}
        >
            {/* Blur placeholder */}
            {blur && !isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 animate-pulse" />
            )}

            {/* Imagen real */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`
                        w-full h-full object-cover
                        transition-opacity duration-500
                        ${isLoaded ? 'opacity-100' : 'opacity-0'}
                    `}
                    loading="lazy"
                />
            )}

            {/* Overlay de carga */}
            {!isLoaded && isInView && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
});

export default LazyImage;

/**
 * AlbumCover Component
 * Portada de álbum con tamaños predefinidos
 */
export const AlbumCover = memo(function AlbumCover({ src, alt, size = 'md', className = '', ...props }) {
    const sizeClasses = {
        xs: 'w-12 h-12',
        sm: 'w-16 h-16',
        md: 'w-20 h-20',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48',
        '2xl': 'w-64 h-64',
    };

    return (
        <LazyImage
            src={src}
            alt={alt}
            className={`rounded-lg ${sizeClasses[size]} ${className}`}
            aspectRatio="1/1"
            {...props}
        />
    );
});

/**
 * ArtistImage Component
 * Imagen de artista circular
 */
export const ArtistImage = memo(function ArtistImage({ src, alt, size = 'md', className = '', ...props }) {
    const sizeClasses = {
        xs: 'w-12 h-12',
        sm: 'w-16 h-16',
        md: 'w-20 h-20',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48',
        '2xl': 'w-64 h-64',
    };

    return (
        <LazyImage
            src={src}
            alt={alt}
            className={`rounded-full ${sizeClasses[size]} ${className}`}
            aspectRatio="1/1"
            fallback={
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-green-500/20 to-green-900/20">
                    <Music size={size === 'xs' ? 16 : size === 'sm' ? 20 : 32} className="text-green-500" />
                </div>
            }
            {...props}
        />
    );
});

/**
 * HeroImage Component
 * Imagen hero con gradiente overlay
 */
export const HeroImage = memo(function HeroImage({ src, alt, className = '', children, ...props }) {
    return (
        <div className={`relative ${className}`}>
            <LazyImage
                src={src}
                alt={alt}
                aspectRatio="16/9"
                className="w-full"
                {...props}
            />
            {/* Gradiente overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            {children && (
                <div className="absolute inset-0 flex items-end">
                    {children}
                </div>
            )}
        </div>
    );
});

/**
 * BackgroundImage Component
 * Imagen de fondo con blur
 */
export const BackgroundImage = memo(function BackgroundImage({ src, alt, className = '', blur = 'lg', ...props }) {
    const blurClasses = {
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
        '2xl': 'backdrop-blur-2xl',
    };

    return (
        <div className={`relative ${className}`}>
            <LazyImage
                src={src}
                alt={alt}
                className="w-full h-full"
                blur={false}
                {...props}
            />
            <div className={`absolute inset-0 ${blurClasses[blur]} bg-black/60`} />
        </div>
    );
});

/**
 * ThumbnailGrid Component
 * Grid de miniaturas con lazy loading optimizado
 */
export const ThumbnailGrid = memo(function ThumbnailGrid({ items, onItemClick, className = '' }) {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
            {items.map((item, index) => (
                <button
                    key={item.id || index}
                    onClick={() => onItemClick?.(item)}
                    className="group relative aspect-square rounded-lg overflow-hidden hover-lift"
                >
                    <LazyImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-sm font-semibold text-white truncate">
                            {item.title}
                        </p>
                        {item.subtitle && (
                            <p className="text-xs text-gray-300 truncate">
                                {item.subtitle}
                            </p>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
});
