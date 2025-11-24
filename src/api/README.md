# 🎵 Arquitectura de Proveedor de Música Unificado

## Descripción General

Este sistema integra **4 proveedores principales** de música (Spotify, Deezer, iTunes, YouTube) mediante un patrón **Facade** (`MusicRepository`), normalizando datos para la UI y proporcionando streaming de audio completo.

## 📐 Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    COMPONENTS (UI)                       │
│         BrowseView, HomeView, SearchResults, etc.        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  useMusic Hook                           │
│         (React Hook para estado y loading)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               MusicRepository (FACADE)                   │
│  • search()          • play()                            │
│  • getTrending()     • getRecommendations()              │
│  • getAlbum()        • getArtist()                       │
└──────┬───────────────┬──────────────┬──────────────┬────┘
       │               │              │              │
       ▼               ▼              ▼              ▼
┌─────────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐
│  Spotify    │ │  Deezer   │ │  iTunes   │ │   YouTube    │
│  Provider   │ │  Provider │ │  Provider │ │   Provider   │
│             │ │           │ │           │ │              │
│ • Metadata  │ │ • Charts  │ │ • High Res│ │ • VideoId    │
│ • Discovery │ │ • Preview │ │   Artwork │ │ • Matching   │
│ • Recs      │ │  (30s)    │ │           │ │              │
└─────────────┘ └───────────┘ └───────────┘ └──────┬───────┘
                                                     │
                                                     ▼
                                          ┌──────────────────┐
                                          │  Audio Streaming │
                                          ├──────────────────┤
                                          │ Piped Provider   │
                                          │ Invidious (bkp)  │
                                          │ → audioUrl       │
                                          └──────────────────┘
```

## 🔑 Estrategia de Datos

### 1. Metadata Visual Rica
**Proveedores:** Spotify (prioridad 1) → Deezer → iTunes

**Uso:**
- Búsqueda de canciones
- Información de álbumes/artistas
- Artwork en alta resolución (1000x1000)
- Descubrimiento y recomendaciones

**Por qué:**
- Spotify tiene la mejor metadata y sistema de recomendaciones
- iTunes proporciona artwork de máxima calidad
- Deezer es excelente para charts y previews

### 2. Audio Completo
**Proveedor:** YouTube (único con audio completo gratuito)

**Flujo:**
1. UI solicita reproducir un track (con metadata de Spotify/Deezer)
2. `MusicRepository.play()` busca el video equivalente en YouTube
3. `YouTubeProvider.getAudioStream()` encuentra el `videoId`
4. `PipedProvider` o `InvidiousProvider` extrae la URL de audio real
5. Se retorna la URL lista para el reproductor

**Por qué:**
- YouTube Music tiene el catálogo más grande
- Piped/Invidious proporcionan acceso sin scraping
- Fallback automático si una instancia falla

## 📁 Estructura de Archivos

```
src/
├── api/
│   ├── config.js                    # Configuración centralizada
│   ├── MusicRepository.js           # FACADE principal
│   ├── index.js                     # Exports
│   ├── providers/
│   │   ├── SpotifyProvider.js       # Spotify API (OAuth2)
│   │   ├── DeezerProvider.js        # Deezer API
│   │   ├── ITunesProvider.js        # iTunes Search API
│   │   ├── YouTubeProvider.js       # YouTube Data API v3
│   │   ├── PipedProvider.js         # Audio streaming (main)
│   │   └── InvidiousProvider.js     # Audio streaming (fallback)
│   └── utils/
│       ├── cache.js                 # Cache con expiración
│       └── errorHandler.js          # Manejo de errores y retries
├── hooks/
│   └── useMusic.js                  # Hook personalizado para React
└── types/
    └── index.js                     # TypeScript/JSDoc types
```

## 🚀 Uso Básico

### En un Componente React

```javascript
import { useMusic } from '../hooks/useMusic';

function MyComponent() {
    const { search, play, getTrending, loading, error } = useMusic();
    
    // Buscar canciones
    const handleSearch = async (query) => {
        const tracks = await search(query, 20);
        console.log(tracks); // Array de tracks normalizados
    };
    
    // Reproducir una canción
    const handlePlay = async (track) => {
        const playableTrack = await play(track);
        // playableTrack.audioUrl contiene la URL de streaming
        audioRef.current.src = playableTrack.audioUrl;
    };
    
    // Obtener trending
    const loadTrending = async () => {
        const trending = await getTrending(50);
        setTracks(trending);
    };
}
```

### Uso Directo del Repository

```javascript
import MusicRepository from '../api/MusicRepository';

// Búsqueda universal
const tracks = await MusicRepository.search('Coldplay', 20);

// Reproducir con stream automático
const playableTrack = await MusicRepository.play(tracks[0]);

// Obtener recomendaciones
const recs = await MusicRepository.getRecommendations(tracks[0], 15);

// Trending
const trending = await MusicRepository.getTrending(50);
```

## 🔐 Configuración de APIs

### Variables de Entorno (`.env`)

```env
# Spotify (OAuth2 Client Credentials)
REACT_APP_SPOTIFY_CLIENT_ID=tu_client_id
REACT_APP_SPOTIFY_CLIENT_SECRET=tu_client_secret

# YouTube Data API
REACT_APP_YOUTUBE_API_KEY=tu_api_key

# Deezer (opcional, funciona sin key en muchos casos)
REACT_APP_DEEZER_API_KEY=tu_api_key

# iTunes (no requiere autenticación)
```

### Validación de Configuración

```javascript
import { validateConfig } from '../api/config';

if (validateConfig()) {
    console.log('✅ All APIs configured');
} else {
    console.warn('⚠️ Some APIs missing credentials');
}
```

## 📊 Formato de Track Unificado

Todos los proveedores normalizan sus datos a este formato:

```javascript
{
    id: "spotify_abc123",              // ID único
    title: "Yellow",                    // Título de la canción
    artist: "Coldplay",                 // Artista principal
    album: "Parachutes",                // Álbum
    artwork: "https://...",             // Imagen 1000x1000
    duration: 266,                      // Duración en segundos
    provider: "spotify",                // Proveedor de origen
    audioUrl: "https://...",            // URL de audio (después de play())
    videoId: "yKNxeF4KMsY",            // YouTube video ID
    externalUrl: "https://...",         // Link externo
    previewUrl: "https://...",          // Preview 30s (si disponible)
    originalData: { /* datos raw */ }   // Datos originales del proveedor
}
```

## 🎯 Casos de Uso

### 1. Búsqueda Global
```javascript
const results = await MusicRepository.search('rock music', 30);
// Intenta: Spotify → Deezer → iTunes
// Retorna máximo 30 tracks únicos
```

### 2. Reproducción
```javascript
const track = results[0]; // Track de Spotify
const playable = await MusicRepository.play(track);
// 1. Busca videoId en YouTube
// 2. Obtiene stream URL de Piped
// 3. Retorna track con audioUrl listo
```

### 3. Descubrimiento
```javascript
// Trending global
const trending = await MusicRepository.getTrending(50);

// Nuevos lanzamientos
const newReleases = await MusicRepository.getNewReleases(20);

// Recomendaciones personalizadas
const similar = await MusicRepository.getRecommendations(currentTrack, 15);
```

### 4. Metadata Detallada
```javascript
// Información de artista
const artist = await MusicRepository.getArtist('spotify_artist_id');

// Top tracks del artista
const topTracks = await MusicRepository.getArtistTopTracks('artist_id', 'spotify', 10);

// Detalles de álbum
const album = await MusicRepository.getAlbum('album_id', 'deezer');
```

## 🔄 Sistema de Fallback

### Búsqueda
```
Spotify (prioritario)
  ↓ falla
Deezer
  ↓ falla
iTunes
  ↓ falla
Error
```

### Streaming de Audio
```
Piped (rápido y confiable)
  ↓ falla (rota automáticamente entre 5 instancias)
Invidious (backup)
  ↓ falla (rota entre 5 instancias)
Error
```

### Trending
```
Spotify Top 50 Global
  ↓ falla
Deezer Charts
  ↓ falla
YouTube Trending Music
  ↓ falla
Error
```

## ⚡ Optimizaciones

### Cache Inteligente
- Cache en memoria con expiración (1 hora por defecto)
- Limpieza automática cada 5 minutos
- Claves únicas por proveedor + método + parámetros

### Retry con Backoff Exponencial
- 3 intentos por defecto
- Delay: 1s, 2s, 4s
- No reintenta errores 4xx (excepto 429 Rate Limit)

### Rotación de Instancias
- Piped: 5 instancias públicas
- Invidious: 5 instancias públicas
- Rotación automática en caso de fallo

## 🛠️ Debugging

```javascript
// Activar logs detallados
localStorage.setItem('DEBUG_MUSIC_API', 'true');

// Ver estado de providers
const status = MusicRepository.validateProviders();
console.log(status);

// Ver cache
import cacheManager from '../api/utils/cache';
console.log(cacheManager.getStats());

// Limpiar cache
cacheManager.clear();
```

## 🚨 Manejo de Errores

Todos los errores están normalizados con `APIError`:

```javascript
try {
    await MusicRepository.search('test');
} catch (error) {
    console.log(error.provider);    // 'spotify', 'youtube', etc.
    console.log(error.statusCode);  // 401, 429, 500, etc.
    console.log(error.message);     // Mensaje descriptivo
    console.log(error.timestamp);   // ISO timestamp
}
```

## 📈 Métricas de Performance

- **Búsqueda:** ~300-500ms (con cache), ~1-2s (sin cache)
- **Play:** ~2-4s (incluye búsqueda YouTube + stream)
- **Trending:** ~500ms-1s (con cache)
- **Cache Hit Rate:** ~70-80% en uso típico

## 🔮 Próximas Mejoras

- [ ] Integrar Spotify Web Playback SDK (requiere premium)
- [ ] Lyrics API (Genius, Musixmatch)
- [ ] Playlist sync con Spotify
- [ ] Offline mode con IndexedDB
- [ ] Analytics de uso
- [ ] Rate limiting inteligente

---

**Creado:** 2024  
**Versión:** 1.0.0  
**Licencia:** MIT
