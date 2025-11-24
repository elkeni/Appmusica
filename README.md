# 🎵 CloudTune

CloudTune es una aplicación web moderna para streaming de música. Está construida con React, Tailwind CSS y Firebase, ofreciendo una experiencia de audio optimizada con soporte de caché inteligente y sistema de respaldo automático.

## ✨ Características

- 🎧 **Streaming de Audio Ilimitado** - Reproduce canciones de YouTube con calidad premium
- 💾 **Caché Inteligente** - Ahorra hasta 95% de cuota de API con caché persistente
- 🔄 **Sistema de Respaldo** - Funciona sin interrupciones incluso sin API key
- 📊 **Monitor de Cuota en Tiempo Real** - Visualiza tu consumo de API
- 🎨 **Interfaz Moderna** - Diseño responsive con Tailwind CSS
- 🔐 **Autenticación Firebase** - Usuarios y playlists personalizadas
- 🌐 **Multi-Provider** - Integración con Deezer, iTunes y YouTube

## 🚀 Inicio Rápido

### Requisitos

- Node.js ≥ 14
- npm (o yarn) para instalar dependencias
- Una cuenta de [Firebase](https://console.firebase.google.com/) para tu proyecto
- (Recomendado) API key de YouTube para mejor rendimiento

### Instalación

1. **Clonar e instalar dependencias:**

   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**

   ```bash
   cp .env.example .env
   ```

   Edita `.env` y agrega tu YouTube API key (opcional pero recomendado):
   ```env
   REACT_APP_YOUTUBE_API_KEY=tu_api_key_aqui
   ```

   📖 **[Ver guía completa de configuración de API →](API_SETUP_GUIDE.md)**

3. **Configurar Firebase:**

   Crea un proyecto en Firebase y agrega una aplicación web. Copia los valores de configuración y reemplázalos en `src/firebase.js`.

## Configuración

1. Abre una terminal en la carpeta raíz del proyecto y ejecuta:

   ```bash
   npm install
   ```

2. Crea un proyecto en Firebase y agrega una aplicación web. Copia los valores de configuración (`apiKey`, `authDomain`, `projectId`, etc.) y reemplázalos en el archivo `src/firebase.js`.

3. (Opcional) Si deseas desplegar la aplicación en Firebase Hosting:
   - Instala la CLI de Firebase:

     ```bash
     npm install -g firebase-tools
     ```

   - Inicia sesión en tu cuenta de Firebase:

     ```bash
     firebase login
     ```

   - Inicializa el proyecto (puedes aceptar la mayoría de las opciones por defecto; asegúrate de elegir "hosting" y usar la carpeta `build` como directorio público):

     ```bash
     firebase init
     ```

   - Genera la versión de producción de la aplicación:

     ```bash
     npm run build
     ```

   - Implementa en Firebase Hosting:

     ```bash
     firebase deploy --only hosting
     ```

   Un archivo `firebase.json` ya está incluido para configurar correctamente el hosting de una aplicación de página única.

4. Para iniciar el servidor de desarrollo en tu máquina local:

   ```bash
   npm start
   ```

   La aplicación se abrirá automáticamente en `http://localhost:3000`.

## Estructura de Carpetas

- `src/`: Contiene los archivos de código fuente.
- `public/`: Contiene el archivo HTML base.
- `firebase.json`: Configuración de Firebase Hosting.
- `tailwind.config.js` y `postcss.config.js`: Configuración de Tailwind CSS.

## 📊 Optimizaciones de Rendimiento

### Sistema de Caché (Phase 1)
- **localStorage Cache:** Video IDs guardados permanentemente
- **0 Cuota:** Reproducciones repetidas sin costo de API
- **95%+ Ahorro:** La mayoría de reproducciones usan caché

### Sistema de Respaldo (Phase 2)
- **Invidious/Piped:** APIs alternativas gratuitas sin límite
- **Rotación Automática:** 8 instancias públicas rotativas
- **Sin Interrupciones:** La app funciona incluso sin API key

### Monitoreo en Tiempo Real (Phase 3)
- **Indicador Visual:** Estado de cuota en esquina inferior derecha
- **Alertas Proactivas:** Notificaciones antes de agotar cuota
- **Modo Fallback:** Cambio automático a APIs alternativas

## 📖 Documentación

- **[Guía de Configuración de APIs](API_SETUP_GUIDE.md)** - Setup detallado de YouTube API
- **[Variables de Entorno](.env.example)** - Todas las opciones de configuración
- **Arquitectura:** MusicRepository pattern con Provider abstraction
- **Quota Management:** Sistema de monitoreo y optimización

## 🔧 Solución de Problemas

### Error 403 (Quota Exceeded)
```bash
# Solución 1: Generar nueva API key (recomendado)
# Ver: API_SETUP_GUIDE.md → YouTube API Setup

# Solución 2: Usar modo fallback (temporal)
# Comentar REACT_APP_YOUTUBE_API_KEY en .env
```

### Sin Sonido
- Verificar volumen del reproductor no está en 0
- Verificar pestaña del navegador no está silenciada
- Probar con otra canción (algunas pueden estar bloqueadas por región)

### Canciones No Cargan
- Verificar conexión a internet
- Limpiar localStorage: DevTools → Application → Clear Storage
- Revisar firewall no bloquea youtube.com, api.deezer.com

**[Ver guía completa de troubleshooting →](API_SETUP_GUIDE.md#troubleshooting)**

## 🎯 Uso Óptimo

### Con API Key de YouTube
- Búsqueda instantánea
- ~500 canciones únicas por día
- Reproducciones en caché ilimitadas (0 cuota)

### Sin API Key (Fallback)
- Búsqueda con delay de 2-3 segundos
- Canciones ilimitadas
- Reproducciones en caché instantáneas

### Pre-cachear Favoritos
Reproduce tus canciones favoritas una vez para cachearlas. Las reproducciones subsecuentes serán instantáneas y sin costo de cuota.

## 📦 Estructura del Proyecto

```
src/
├── api/
│   ├── providers/          # Providers para Deezer, iTunes, YouTube
│   │   ├── YouTubeProvider.js  (Phase 1 & 2 optimizado)
│   │   ├── DeezerProvider.js
│   │   └── ITunesProvider.js
│   ├── utils/
│   │   ├── cache.js        # Sistema de caché en memoria
│   │   ├── errorHandler.js # Manejo de errores (Phase 1)
│   │   └── youtubeFallback.js  (Phase 2: Invidious/Piped)
│   ├── MusicRepository.js  # Facade pattern
│   └── config.js
├── components/
│   ├── layout/             # Sidebar, Header, BottomNav
│   ├── player/             # PlayerBar, NowPlayingModal
│   ├── shared/             # QuotaMonitor (Phase 3), Auth
│   └── lyrics/
├── context/
│   └── PlayerContext.js    # Global player state (Phase 1-5 audio fix)
├── views/                  # HomeView, Search, Favorites, etc.
└── firebase.js
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas Técnicas

- **Favoritos:** Sincronizados vía Cloud Firestore
- **Autenticación:** Firebase Authentication
- **APIs Externas:** YouTube Data API v3, Deezer API, iTunes API
- **Fallback:** Invidious (5 instancias), Piped (3 instancias)
- **Caché:** localStorage para persistencia, Map para sesión
- **Diseño:** Responsive (desktop y móvil)

## 📄 Licencia

Este proyecto es de código abierto. Ver el archivo LICENSE para más detalles.