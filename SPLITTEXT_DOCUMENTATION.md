# 🎵 YouTube Music React App - Documentación Completa

## 📋 Índice
1. [Instalación](#instalación)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Componentes Principales](#componentes-principales)
4. [Paleta de Colores](#paleta-de-colores)
5. [SplitText API](#splittext-api)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Personalización Avanzada](#personalización-avanzada)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Instalación

### Requisitos
- Node.js 14+
- npm o yarn

### Pasos

1. **Clonar/Abrir el proyecto**
```bash
cd tu-proyecto
```

2. **Instalar GSAP** (si no está instalado)
```bash
npm install gsap
```

3. **Iniciar el servidor de desarrollo**
```bash
npm start
```

---

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── SplitText.jsx                 # ⭐ Componente animado principal
│   ├── Header.jsx                    # Barra superior
│   ├── Header.css
│   ├── HeroSection.jsx               # Sección destacada
│   ├── HeroSection.css
│   ├── TrackGrid.jsx                 # Lista de canciones
│   ├── TrackGrid.css
│   ├── DemoYTM.jsx                   # Página demo
│   ├── DemoYTM.css
│   ├── SplitTextExamples.jsx         # Ejemplos de animaciones
│   ├── SplitTextExamples.css
│   ├── SplitTextShowcase.jsx         # Herramienta interactiva
│   └── SplitTextShowcase.css
├── utils/
│   └── splitTextUtils.js             # Presets y utilidades
├── index.css                         # Estilos globales + Paleta YTM
├── App.js                            # Aplicación principal
└── index.js                          # Punto de entrada
```

---

## 🎨 Componentes Principales

### 1. **SplitText** (Componente Estrella ⭐)

Componente reutilizable que divide el texto en partes y las anima usando GSAP + ScrollTrigger.

#### Props

| Prop | Tipo | Predeterminado | Descripción |
|------|------|-----------------|-------------|
| `text` | string | `''` | Texto a animar |
| `splitType` | 'words' \| 'chars' \| 'lines' | `'words'` | Cómo dividir el texto |
| `animationFrom` | object | `{ y: 20, opacity: 0 }` | Estado inicial |
| `animationTo` | object | `{ y: 0, opacity: 1, duration: 0.6 }` | Estado final |
| `stagger` | number | `0.05` | Retraso entre elementos (segundos) |
| `duration` | number | `0.6` | Duración total (segundos) |
| `ease` | string | `'power3.out'` | Función de easing GSAP |
| `className` | string | `''` | Clases CSS adicionales |

#### Ejemplo Básico

```jsx
import SplitText from './components/SplitText';

<SplitText
  text="Bienvenido a YouTube Music"
  splitType="words"
  animationFrom={{ y: 30, opacity: 0 }}
  animationTo={{ y: 0, opacity: 1, duration: 0.8 }}
  stagger={0.1}
  ease="power3.out"
/>
```

---

### 2. **Header** (Barra Superior)

Barra de navegación fija con efecto glassmorphism.

```jsx
<Header />
```

**Características:**
- Logo con icono
- Buscador responsive
- Avatar de perfil
- Glassmorphism backdrop filter

---

### 3. **HeroSection** (Sección Destacada)

Sección hero con artwork y SplitText animado.

```jsx
<HeroSection />
```

**Características:**
- Artwork con gradiente animado
- Título con SplitText
- Artista con SplitText
- Metadata del álbum
- Botón de reproducción

---

### 4. **TrackGrid** (Lista de Canciones)

Cuadrícula responsive de canciones.

```jsx
<TrackGrid />
```

**Características:**
- Lista numerada de canciones
- Información: título, artista, duración
- Efectos hover
- Responsive

---

### 5. **DemoYTM** (Página Completa)

Página que integra todos los componentes.

```jsx
import DemoYTM from './components/DemoYTM';

<DemoYTM />
```

---

### 6. **SplitTextShowcase** (Herramienta Interactiva)

Herramienta visual para experimentar con diferentes configuraciones de SplitText.

```jsx
import SplitTextShowcase from './components/SplitTextShowcase';

<SplitTextShowcase />
```

**Características:**
- Selector de presets
- Cambio de tipos de split
- Preview en vivo
- Generador de código
- Información detallada

---

## 🎨 Paleta de Colores

### Variables CSS (YouTube Music Dark Theme)

```css
/* Variables Primarias */
--ytm-base: #030303;                    /* Fondo base */
--ytm-surface-1: rgba(24, 24, 24, 0.9); /* Navbar/Sidebars */
--ytm-surface-2: #212121;               /* Tarjetas/Hover */
--ytm-text-primary: #ffffff;            /* Texto principal */
--ytm-text-secondary: #aaaaaa;          /* Texto secundario */
--ytm-accent: #ff0000;                  /* Rojo (acento principal) */
--ytm-hover: #303030;                   /* Color hover */
--ytm-glass-blur: 12px;                 /* Blur para glassmorphism */
--ytm-border-radius: 8px;               /* Radio de bordes */
```

### Cómo Personalizar

```css
:root {
  --ytm-accent: #00ff00;      /* Cambiar a verde */
  --ytm-base: #0a0a0a;       /* Fondo más oscuro */
  --ytm-text-primary: #f5f5f5; /* Blanco roto */
}
```

---

## 🎬 SplitText API

### Animationn Properties

Cualquier propiedad soportada por GSAP:

```javascript
{
  y: 30,              // Desplazamiento vertical
  x: -20,             // Desplazamiento horizontal
  opacity: 0,         // Opacidad
  scale: 0.5,         // Escala
  rotation: 45,       // Rotación (grados)
  skewX: 10,          // Sesgo X
  transformOrigin: '50% 50%', // Centro de transformación
  color: '#ff0000',   // Color de texto
  // ... más propiedades de GSAP
}
```

### Easing Functions

**Power (Recomendado para la mayoría de casos)**
- `power1.out` / `power1.in`
- `power2.out` / `power2.in`
- `power3.out` / `power3.in`
- `power4.out` / `power4.in`

**Special Effects**
- `back.out` / `back.in` - Efecto "regresión"
- `elastic.out` / `elastic.in` - Efecto elástico
- `bounce.out` / `bounce.in` - Efecto rebote
- `circ.out` / `circ.in` - Circular
- `expo.out` / `expo.in` - Exponencial
- `sine.out` / `sine.in` - Sinusoidal

---

## 💾 SplitTextUtils

### Presets Predefinidos

```javascript
import { SPLIT_TEXT_PRESETS, getAnimationPreset } from '../utils/splitTextUtils';

// Usar preset directamente
const config = SPLIT_TEXT_PRESETS.slideUp;

// Personalizar preset
const customConfig = getAnimationPreset('slideUp', {
  stagger: 0.2, // Override
  ease: 'elastic.out'
});
```

### Presets Disponibles

1. **slideUp** - Desliza hacia arriba + fade
2. **slideDown** - Desliza hacia abajo + fade
3. **slideLeft** - Desliza a la izquierda + fade
4. **slideRight** - Desliza a la derecha + fade
5. **scaleIn** - Efecto zoom
6. **rotateIn** - Rotación + slide
7. **bounce** - Efecto rebote
8. **fadeIn** - Solo opacidad
9. **typeEffect** - Efecto escritura
10. **complex** - Animación combinada compleja
11. **elegant** - Rotación suave y elegante
12. **flip** - Volteador 3D (rotationX)
13. **spring** - Efecto resorte (elastic)

---

## 📚 Ejemplos de Uso

### Ejemplo 1: Slide Up Básico

```jsx
<SplitText
  text="Tu título aquí"
  splitType="words"
  animationFrom={{ y: 30, opacity: 0 }}
  animationTo={{ y: 0, opacity: 1, duration: 0.8 }}
  stagger={0.1}
  ease="power3.out"
/>
```

### Ejemplo 2: Efecto Escritura (Caracteres)

```jsx
<SplitText
  text="HELLO"
  splitType="chars"
  animationFrom={{ x: -10, opacity: 0 }}
  animationTo={{ x: 0, opacity: 1, duration: 0.5 }}
  stagger={0.06}
  ease="power2.out"
/>
```

### Ejemplo 3: Efecto Rebote

```jsx
<SplitText
  text="Bounce Effect"
  splitType="words"
  animationFrom={{ y: -20, opacity: 0 }}
  animationTo={{ y: 0, opacity: 1, duration: 0.6 }}
  stagger={0.1}
  ease="bounce.out"
/>
```

### Ejemplo 4: Rotación Elegante

```jsx
<SplitText
  text="Elegant"
  splitType="chars"
  animationFrom={{ y: 60, opacity: 0, rotationZ: 360 }}
  animationTo={{ y: 0, opacity: 1, rotationZ: 0, duration: 1.5 }}
  stagger={0.1}
  ease="power4.out"
/>
```

### Ejemplo 5: Usando Presets

```jsx
import { getAnimationPreset } from '../utils/splitTextUtils';

const preset = getAnimationPreset('elastic', { stagger: 0.15 });

<SplitText
  text="Elástico"
  splitType="words"
  {...preset}
/>
```

---

## 🔧 Personalización Avanzada

### Cambiar Colores Globales

**En `index.css`:**

```css
:root {
  /* Cambiar toda la paleta */
  --ytm-base: #0a0a0a;
  --ytm-accent: #00ff00;
  --ytm-text-primary: #f0f0f0;
  /* ... etc */
}
```

### Crear un Tema Personalizado

```css
/* En un archivo separado: themes.css */
.theme-neon {
  --ytm-base: #0d0d0d;
  --ytm-accent: #00ffff;
  --ytm-text-primary: #00ffff;
  --ytm-text-secondary: #80ffff;
}

.theme-cyberpunk {
  --ytm-base: #0a0a0a;
  --ytm-accent: #ff00ff;
  --ytm-text-primary: #ff00ff;
  --ytm-text-secondary: #ffff00;
}
```

### Modificar Glassmorphism

```css
.glass {
  backdrop-filter: blur(20px);        /* Aumentar blur */
  -webkit-backdrop-filter: blur(20px);
  background: rgba(24, 24, 24, 0.95); /* Más opaco */
  border: 1px solid rgba(255, 0, 0, 0.2); /* Borde rojo */
}
```

### Crear Animación Personalizada

```jsx
import SplitText from './SplitText';

// Animación personalizada
const customAnimation = {
  animationFrom: {
    y: 100,
    opacity: 0,
    rotationZ: -45,
    scale: 0.5
  },
  animationTo: {
    y: 0,
    opacity: 1,
    rotationZ: 0,
    scale: 1,
    duration: 1.5
  },
  stagger: 0.15,
  ease: 'back.out'
};

<SplitText
  text="Mi Título"
  splitType="words"
  {...customAnimation}
/>
```

---

## 🐛 Troubleshooting

### Las animaciones no se ejecutan

**Solución 1:** Verificar que GSAP esté instalado
```bash
npm list gsap
# Debe mostrar: gsap@X.X.X
```

**Solución 2:** Asegurar que ScrollTrigger esté registrado
```javascript
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

**Solución 3:** Verificar que el elemento está en el viewport
- Scroll hacia abajo para que el elemento entre en la pantalla

### La scrollbar no se ve

- **Es normal**: La scrollbar es "overlay" (flotante)
- Aparece al desplazarse
- Algunos navegadores pueden no soportarla
- Fallback automático a scrollbar estándar

### Glassmorphism no funciona

- **Navegadores antiguos**: No soportan `backdrop-filter`
- Como fallback, usa el color base
- Prueba en Chrome, Firefox o Safari modernos

### Tipografía Roboto no carga

**Solución:** Verificar conexión a internet
```css
/* En index.css debe estar: */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
```

### Componentes no renderean

1. Verificar que todos los imports están correctos
2. Asegurar que CSS está siendo importado
3. Revisar la consola del navegador para errores

---

## 📊 Compatibilidad de Navegadores

| Navegador | Soporte |
|-----------|---------|
| Chrome 90+ | ✅ Completo |
| Firefox 88+ | ✅ Completo |
| Safari 14+ | ✅ Completo |
| Edge 90+ | ✅ Completo |
| IE 11 | ❌ No soportado |

---

## 🎯 Performance Tips

1. **Limitar el número de elementos**: Menos de 100 elementos por SplitText
2. **Usar stagger apropiado**: 0.05-0.15 segundos
3. **Evitar animaciones simultáneas**: Usar callbacks de GSAP
4. **Optimizar imágenes**: Hero section artwork debe ser < 500KB

---

## 📖 Recursos Útiles

- [GSAP Docs](https://gsap.com/docs)
- [ScrollTrigger Guide](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [MDN Web Docs - CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)

---

## 📝 Changelog

### v1.0.0 (Noviembre 2025)
- ✅ Componente SplitText con GSAP
- ✅ ScrollTrigger integration
- ✅ Header con glassmorphism
- ✅ Hero section con metadata
- ✅ Track grid responsive
- ✅ 13 presets de animación
- ✅ Showcases y ejemplos
- ✅ Utilidades y helpers

---

**¡Disfruta creando animaciones increíbles! 🚀**
