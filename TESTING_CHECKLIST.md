# ✅ Checklist de Pruebas - Radio Infinito

## 🧪 Testing Guide

### **PASO 1: Autoplay Básico**
```
□ Abre la aplicación
□ Reproduce una canción cualquiera
□ Verifica: ¿La canción inicia automáticamente sin clic extra?
□ Verifica: ¿El botón de play/pause está sincronizado?
□ Cambia a otra canción manualmente
□ Verifica: ¿La nueva canción inicia automáticamente?

✅ PASS: Las canciones se reproducen solas
❌ FAIL: Requiere clic manual
```

---

### **PASO 2: Radio Infinito**
```
□ Reproduce una canción individual (sin playlist)
□ Espera a que termine la canción
□ Verifica: ¿Aparece el badge "Radio" morado?
□ Verifica: ¿Ves "Finding songs..." mientras busca?
□ Verifica: ¿La siguiente canción empieza automáticamente?
□ Deja reproducir 3-4 canciones seguidas
□ Verifica: ¿Continúa sin detenerse?

✅ PASS: Música continua infinitamente
❌ FAIL: Se detiene después de la primera canción
```

---

### **PASO 3: Indicadores Visuales (Desktop)**
```
□ Activa el modo radio (deja que termine la lista)
□ Busca el reproductor inferior
□ Verifica: ¿Ves el badge [🟣 Radio] junto al título?
□ Verifica: ¿El badge tiene animación pulsante?
□ Reproduce una canción desde un álbum
□ Verifica: ¿El badge desaparece cuando hay lista manual?

✅ PASS: Badge visible y funcional
❌ FAIL: No se ve el indicador
```

---

### **PASO 4: Indicadores Visuales (Móvil)**
```
□ Abre en dispositivo móvil o modo responsive
□ Activa el modo radio
□ Busca el mini player inferior
□ Verifica: ¿Ves [🟣 Radio] o [🟣 ...] junto al título?
□ Verifica: ¿Es legible en pantalla pequeña?

✅ PASS: Badge visible en móvil
❌ FAIL: No se ve o está cortado
```

---

### **PASO 5: Pre-caching (Sin Pausas)**
```
□ Activa el modo radio
□ Deja reproducir varias canciones
□ Observa las transiciones entre canciones
□ Verifica: ¿Hay pausas o silencios?
□ Verifica: ¿La transición es fluida (<1 segundo)?
□ Abre la consola del navegador (F12)
□ Busca: "🔄 Pre-loading recommendations"

✅ PASS: Transiciones fluidas sin pausas
❌ FAIL: Pausas de 2+ segundos entre canciones
```

---

### **PASO 6: Estrategias de Recomendación**
```
□ Abre la consola del navegador (F12)
□ Activa el modo radio
□ Busca estos mensajes en orden:
   □ "🎵 Queue ended. Activating Infinite Radio Mode..."
   □ "🎯 Strategy 1: Trying YouTube related videos..."
   □ "✅ Found X YouTube recommendations"
   O
   □ "🎯 Strategy 2: Trying Deezer similar tracks..."
   □ "✅ Found X similar Deezer tracks"
   
□ Verifica: ¿Las recomendaciones son relevantes?
□ Verifica: ¿No se repiten canciones recientes?

✅ PASS: Recomendaciones funcionan y son relevantes
❌ FAIL: Recomendaciones aleatorias o se repiten
```

---

### **PASO 7: Búsqueda YouTube Mejorada**
```
□ Reproduce una canción famosa (ej: "Bohemian Rhapsody")
□ Verifica: ¿Es la versión oficial?
□ Reproduce otra canción conocida
□ Verifica: ¿No es un cover ni remix?
□ Abre la consola y busca en Network tab
□ Verifica: Query debe ser: "Title" "Artist" official audio

✅ PASS: Encuentra versiones oficiales correctas
❌ FAIL: Reproduce covers, remixes o versiones live
```

---

### **PASO 8: Manejo de Errores**
```
□ Desconecta internet temporalmente
□ Deja que termine una canción
□ Verifica: ¿Muestra algún mensaje de error?
□ Reconecta internet
□ Verifica: ¿Se recupera automáticamente?
□ Abre consola y busca "❌" para errores
□ Verifica: ¿Los errores están manejados gracefully?

✅ PASS: Errores manejados sin crashes
❌ FAIL: App se congela o crashea
```

---

### **PASO 9: Queue Manual vs Radio**
```
□ Reproduce un álbum completo desde HomeView
□ Verifica: ¿NO aparece el badge "Radio"?
□ Deja que termine el álbum
□ Verifica: ¿Aparece el badge "Radio" al final?
□ Verifica: ¿Continúa con canciones similares?

✅ PASS: Radio solo se activa cuando debe
❌ FAIL: Radio activo durante reproducción manual
```

---

### **PASO 10: Rendimiento**
```
□ Abre Task Manager / Monitor de Actividad
□ Deja el radio activo por 30 minutos
□ Verifica: ¿Uso de CPU es razonable (<50%)?
□ Verifica: ¿Uso de memoria estable (no crece sin límite)?
□ Abre consola y busca warnings
□ Verifica: ¿No hay memory leaks?

✅ PASS: Rendimiento estable y eficiente
❌ FAIL: Alto uso de recursos o memory leaks
```

---

## 📊 Scorecard Final

```
TOTAL TESTS: 10
PASSED: ___/10
FAILED: ___/10

CRITICAL ISSUES: ___
MINOR ISSUES: ___

STATUS: [  ] READY FOR PRODUCTION
        [  ] NEEDS FIXES
```

---

## 🐛 Problemas Comunes y Soluciones

### **Problema: Autoplay no funciona**
```
Causa: Política del navegador
Solución: 
1. Hacer clic en cualquier parte de la página primero
2. Safari requiere interacción inicial siempre
3. Chrome puede bloquearlo si nunca has usado el sitio
```

### **Problema: Radio no se activa**
```
Causa: Queue todavía tiene canciones
Solución:
1. Asegurarte de que la lista termine completamente
2. Verifica en consola: "Queue ended. Activating..."
3. Si no aparece, revisa errores en consola
```

### **Problema: Badge no visible**
```
Causa: CSS o estado no sincronizado
Solución:
1. Inspeccionar elemento (F12)
2. Buscar: radioMode en React DevTools
3. Verificar que radioMode === true
4. Revisar z-index del badge
```

### **Problema: Pausas entre canciones**
```
Causa: Pre-caching no funcionando
Solución:
1. Revisar consola para "Pre-loading recommendations"
2. Verificar conexión a internet estable
3. Asegurarte de que queue.length trigger funcione
```

### **Problema: Videos incorrectos**
```
Causa: YouTube API o búsqueda fallando
Solución:
1. Verificar REACT_APP_YOUTUBE_API_KEY en .env
2. Revisar quota de YouTube API en Google Console
3. Buscar en consola: "YouTube search by type error"
```

---

## 🎯 Criterios de Éxito

Para considerar la implementación **EXITOSA**, debe cumplir:

✅ **CRITICAL (Must Have):**
- [ ] Autoplay funciona en 95%+ de casos
- [ ] Radio Mode se activa automáticamente
- [ ] Música continúa indefinidamente
- [ ] Sin crashes ni errores críticos

✅ **HIGH (Should Have):**
- [ ] Badge visible en desktop y móvil
- [ ] Transiciones <1 segundo entre canciones
- [ ] Versiones oficiales 90%+ del tiempo
- [ ] Pre-caching funcional

✅ **MEDIUM (Nice to Have):**
- [ ] Mensajes de console informativos
- [ ] Manejo graceful de errores
- [ ] Rendimiento optimizado
- [ ] No repetir canciones recientes

---

## 📞 Debugging Tips

### **Ver estado en vivo:**
```javascript
// Abre consola (F12) y pega:
window.__PLAYER_DEBUG__ = setInterval(() => {
  console.log({
    radioMode: window.__RADIO_MODE__,
    fetching: window.__FETCHING__,
    queueLength: window.__QUEUE_LENGTH__
  });
}, 2000);

// Para detener:
clearInterval(window.__PLAYER_DEBUG__);
```

### **Logs útiles:**
```
🎵 = Reproducción
🎯 = Estrategia de recomendación
✅ = Éxito
❌ = Error
🔄 = Pre-carga
⚠️ = Warning
📻 = Fallback a charts
```

---

## 🎉 Notas Finales

- **Navegador recomendado:** Chrome/Edge para mejores resultados
- **Conexión:** Internet estable requerida
- **API Keys:** Asegurarse de que YOUTUBE_API_KEY esté configurada
- **Cache:** Limpiar cache si hay comportamientos extraños

**¡Buena suerte con las pruebas! 🚀**
