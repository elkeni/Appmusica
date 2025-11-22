# 🚀 GUÍA RÁPIDA DE INICIO

## ⚡ Instalación Express (2 minutos)

```bash
# 1. Instalar GSAP (único paso requerido)
npm install gsap

# 2. Iniciar servidor
npm start

# ¡Listo! Visita http://localhost:3000
```

## 📁 Archivos Creados

```
✅ src/components/SplitText.jsx              (Componente estrella)
✅ src/components/Header.jsx + Header.css    (Barra superior)
✅ src/components/HeroSection.jsx + .css     (Sección hero)
✅ src/components/TrackGrid.jsx + .css       (Lista canciones)
✅ src/components/DemoYTM.jsx + .css         (Demo completa)
✅ src/components/SplitTextExamples.jsx      (8 ejemplos)
✅ src/components/SplitTextShowcase.jsx      (Herramienta interactiva)
✅ src/utils/splitTextUtils.js              (Presets + utilidades)
✅ src/index.css                             (Paleta YTM + estilos globales)
✅ YOUTUBE_MUSIC_SETUP.md                    (Documentación)
✅ SPLITTEXT_DOCUMENTATION.md                (Guía completa)
✅ QUICK_START.md                            (Este archivo)
```

## 🎯 Inicio Rápido

### Opción 1: Ver la Demo Completa

```jsx
// En App.js o cualquier página
import DemoYTM from './components/DemoYTM';

export default function App() {
  return <DemoYTM />;
}
```

### Opción 2: Usar SplitText Directamente

```jsx
import SplitText from './components/SplitText';

<SplitText
  text="Tu texto aquí"
  splitType="words"
  animationFrom={{ y: 30, opacity: 0 }}
  animationTo={{ y: 0, opacity: 1, duration: 0.8 }}
  stagger={0.1}
  ease="power3.out"
/>
```

### Opción 3: Usar Presets

```jsx
import SplitText from './components/SplitText';
import { getAnimationPreset } from './utils/splitTextUtils';

const preset = getAnimationPreset('slideUp'); // O cualquier preset

<SplitText
  text="Tu texto"
  splitType="words"
  {...preset}
/>
```

### Opción 4: Herramienta Interactiva

```jsx
// Para experimentar y crear animaciones
import SplitTextShowcase from './components/SplitTextShowcase';

<SplitTextShowcase />
```

## 🎨 Paleta YTM (Colores Predefinidos)

Los colores están automáticamente disponibles vía CSS variables:

```css
--ytm-base: #030303;                    /* Fondo */
--ytm-surface-1: rgba(24, 24, 24, 0.9); /* Navbar */
--ytm-surface-2: #212121;               /* Tarjetas */
--ytm-text-primary: #ffffff;            /* Texto blanco */
--ytm-text-secondary: #aaaaaa;          /* Texto gris */
--ytm-accent: #ff0000;                  /* Rojo YouTube */
--ytm-glass-blur: 12px;                 /* Efecto glass */
```

## 📊 13 Presets Listos para Usar

1. `slideUp` - Desliza hacia arriba
2. `slideDown` - Desliza hacia abajo
3. `slideLeft` - Desliza a la izquierda
4. `slideRight` - Desliza a la derecha
5. `scaleIn` - Zoom in
6. `rotateIn` - Rotación + slide
7. `bounce` - Efecto rebote
8. `fadeIn` - Fade in simple
9. `typeEffect` - Efecto escritura
10. `complex` - Animación compleja
11. `elegant` - Rotación elegante
12. `flip` - Volteador 3D
13. `spring` - Resorte elástico

## 🎬 Casos de Uso Comunes

### Título de Página
```jsx
<SplitText
  text="Bienvenido"
  splitType="words"
  {...getAnimationPreset('slideUp', { stagger: 0.15 })}
/>
```

### Subtítulo
```jsx
<SplitText
  text="Artista • Álbum • Año"
  splitType="chars"
  {...getAnimationPreset('fadeIn', { stagger: 0.08 })}
/>
```

### Efecto Escritura
```jsx
<SplitText
  text="DISCOVER"
  splitType="chars"
  {...getAnimationPreset('typeEffect')}
/>
```

### Efecto Rebote
```jsx
<SplitText
  text="¡Hola Mundo!"
  splitType="words"
  {...getAnimationPreset('bounce')}
/>
```

## 🔧 Personalización Rápida

### Cambiar Color Acento
```css
/* En index.css, en :root */
--ytm-accent: #00ff00; /* Verde */
```

### Cambiar Duración Global
```jsx
const preset = getAnimationPreset('slideUp');
preset.animationTo.duration = 1.5; // 1.5 segundos
```

### Cambiar Easing
```jsx
import { EASING_FUNCTIONS } from './utils/splitTextUtils';

<SplitText
  text="..."
  ease={EASING_FUNCTIONS.elasticOut}
/>
```

## ⚠️ Posibles Problemas & Soluciones

| Problema | Solución |
|----------|----------|
| No se ve animación | Scroll al viewport donde está el elemento |
| GSAP no encontrado | `npm install gsap` |
| Tipografía diferente | Revisa conexión a internet (Google Fonts) |
| Scrollbar no visible | Es normal, solo aparece al scroll |
| Glassmorphism no funciona | Usa navegador moderno (Chrome 76+) |

## 📚 Documentación Completa

Para documentación detallada, ver:
- `SPLITTEXT_DOCUMENTATION.md` - Guía completa
- `YOUTUBE_MUSIC_SETUP.md` - Setup inicial

## 🎓 Ejemplos en la App

Visita estos componentes para ver ejemplos:
- `SplitTextExamples.jsx` - 8 ejemplos diferentes
- `SplitTextShowcase.jsx` - Herramienta interactiva
- `HeroSection.jsx` - Uso en producción

## 💡 Tips Profesionales

1. **ScrollTrigger está automático** - Las animaciones se ejecutan al entrar en viewport
2. **Stagger recomendado** - 0.05 a 0.15 segundos entre elementos
3. **Ease recomendado** - `power3.out` para la mayoría de casos
4. **Combina splitTypes** - Usa `chars` para palabras cortas, `words` para largas
5. **Prueba localmente** - Experimenta en Showcase antes de usar en producción

## 🚀 Próximos Pasos

1. ✅ Lee la documentación completa
2. ✅ Experimenta en SplitTextShowcase
3. ✅ Copia ejemplos que te gusten
4. ✅ Personaliza para tu proyecto
5. ✅ Comparte con tu equipo

## 📞 Soporte

Si algo no funciona:
1. Revisa la consola del navegador (F12)
2. Verifica que GSAP esté instalado
3. Asegúrate que ScrollTrigger está registrado
4. Lee SPLITTEXT_DOCUMENTATION.md

---

**¡Ahora estás listo para crear animaciones increíbles! 🎬✨**
