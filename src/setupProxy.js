/**
 * PHASE 3: Proxy Configuration
 * Configuración de proxy para desarrollo
 * 
 * Este archivo maneja:
 * 1. Proxy para APIs externas (si se necesita CORS)
 * 2. WebSocket para hot reload de React
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Solo configurar proxies si se necesitan para APIs específicas
  // El WebSocket de React ya funciona automáticamente
  
  // Ejemplo: Si necesitas proxy para una API específica
  // app.use(
  //   '/api',
  //   createProxyMiddleware({
  //     target: 'http://localhost:5000',
  //     changeOrigin: true,
  //   })
  // );

  // No es necesario configurar nada para WebSocket de hot reload
  // React DevServer lo maneja automáticamente
};
