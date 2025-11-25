# Security Guidelines

## ⚠️ IMPORTANTE: API Keys Expuestas

**ACCIÓN INMEDIATA REQUERIDA**: Las API keys en `.env.production` fueron expuestas públicamente en el repositorio. Por favor, realiza las siguientes acciones:

### 1. Rotar API Keys Inmediatamente

#### Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `appmusica-5c872`
3. Settings → General → Your apps
4. Regenera las claves de API
5. Actualiza las restricciones de API en Google Cloud Console

#### Spotify
1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Accede a tu aplicación
3. Regenera el Client ID y Client Secret
4. Actualiza las URIs de redirección permitidas

#### YouTube/Google
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Revoca la API key actual y crea una nueva
4. Configura restricciones de API y dominio

### 2. Configuración Segura

#### Variables de Entorno Locales
```bash
# Copia el archivo de ejemplo
cp .env.production.example .env.production

# Edita con tus nuevas credenciales
nano .env.production
```

#### Para Producción (Firebase Hosting)
Configura las variables de entorno en Firebase:
```bash
firebase functions:config:set \
  spotify.client_id="TU_NUEVO_CLIENT_ID" \
  spotify.client_secret="TU_NUEVO_CLIENT_SECRET" \
  youtube.api_key="TU_NUEVA_API_KEY"
```

#### Para GitHub Actions
Configura los secrets en GitHub:
1. Ve a Settings → Secrets and variables → Actions
2. Añade cada variable como un secret
3. Actualiza los workflows para usar los secrets

### 3. Mejores Prácticas

✅ **HACER:**
- Usar variables de entorno para credenciales
- Añadir todos los archivos `.env*` a `.gitignore` (excepto `.example`)
- Rotar keys regularmente
- Usar restricciones de dominio/IP en las APIs
- Revisar los logs de acceso a las APIs

❌ **NO HACER:**
- Commitear archivos `.env` con credenciales reales
- Compartir API keys en mensajes/issues públicos
- Usar las mismas keys en desarrollo y producción
- Hardcodear credenciales en el código

### 4. Verificación

Verifica que tus archivos `.env` no estén trackeados:
```bash
git status
# No debe aparecer .env.production
```

### 5. Monitoreo

Después de rotar las keys, monitorea:
- Uso inusual de API (Firebase Console, Spotify Dashboard, Google Cloud)
- Errores de autenticación en logs
- Facturas/cuotas de API

## Contacto

Si detectas actividad sospechosa o necesitas ayuda, contacta al equipo de seguridad.
