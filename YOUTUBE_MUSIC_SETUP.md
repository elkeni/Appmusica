# YouTube Music Style React App con SplitText Animado

## 🚀 Descripción General

Aplicación React que replica la estética visual de YouTube Music (Modo Oscuro) e implementa un componente `SplitText` reutilizable con animaciones GSAP avanzadas.

## 📦 Instalación

### Dependencias Requeridas

```bash
npm install gsap
```

Si es un proyecto nuevo:

```bash
npx create-react-app ytmusic-app
cd ytmusic-app
npm install gsap
```

## 📁 Estructura de Archivos

```
src/
├── components/
│   ├── Header.jsx              # Barra superior con glassmorphism
│   ├── Header.css
│   ├── HeroSection.jsx         # Sección hero con SplitText
│   ├── HeroSection.css
│   ├── TrackGrid.jsx           # Cuadrícula de canciones
│   ├── TrackGrid.css
│   ├── SplitText.jsx           # Componente animado reutilizable
│   ├── DemoYTM.jsx             # Página de demostración completa
│   └── DemoYTM.css
├── index.css                   # Estilos globales y paleta YTM
├── App.js                      # Aplicación principal (actualizado)
└── index.js
```

## 🎨 Componentes Principales

### 1. **SplitText.jsx**
Componente reutilizable para animar texto dividido en palabras, caracteres o líneas.

#### Props:
- `text` (string): Texto a animar
- `splitType` (string): `'words'` | `'chars'` | `'lines'`
- `animationFrom` (object): Estado inicial
- `animationTo` (object): Estado final con duración
- `stagger` (number): Retraso entre elementos
- `duration` (number): Duración total
- `ease` (string): Función de easing (ej: `power3.out`)
- `className` (string): Clases CSS adicionales

#### Ejemplo de Uso:
```jsx
import SplitText from './components/SplitText';

<SplitText
  text="Supermassive Black Hole"
  splitType="words"
  animationFrom={{ y: 30, opacity: 0 }}
  animationTo={{ y: 0, opacity: 1, duration: 0.8 }}
  stagger={0.1}
  ease="power3.out"
/>
```

### 2. **Header.jsx**
Barra de navegación superior con efecto glassmorphism.

**Características:**
- Logo con icono animado
- Buscador de canciones
- Avatar de perfil
- Diseño responsive

### 3. **HeroSection.jsx**
Sección destacada con artwork y metadata de álbum.

**Características:**
- Artwork con gradiente animado
- Título del álbum con SplitText
- Nombre del artista con SplitText
- Información del álbum (año, cantidad de canciones, duración)
- Botón de reproducción

### 4. **TrackGrid.jsx**
Cuadrícula de canciones estilo YouTube Music.

**Características:**
- Lista de canciones con información
- Efectos hover
- Diseño responsive
- Información de duración

### 5. **DemoYTM.jsx**
Página de demostración que integra todos los componentes.

## 🎯 Paleta de Colores (YouTube Music)

```css
--ytm-base: #030303;                    /* Fondo base */
--ytm-surface-1: rgba(24, 24, 24, 0.9); /* Navbar/Sidebars */
--ytm-surface-2: #212121;               /* Tarjetas/Hover */
--ytm-text-primary: #ffffff;            /* Texto principal */
--ytm-text-secondary: #aaaaaa;          /* Texto secundario */
--ytm-accent: #ff0000;                  /* Rojo (acento) */
--ytm-hover: #303030;                   /* Color hover */
--ytm-glass-blur: 12px;                 /* Blur para glassmorphism */
--ytm-border-radius: 8px;               /* Radio de bordes */
```

## 🎬 Animaciones GSAP

### Easings Recomendados:
- `power1.out`, `power2.out`, `power3.out`, `power4.out`
- `back.out`, `elastic.out`, `bounce.out`
- `circ.out`, `sine.out`, `expo.out`

### ScrollTrigger
El componente SplitText utiliza ScrollTrigger para activar animaciones cuando el elemento entra al viewport.

## 🎨 Glassmorphism

La barra de navegación utiliza el efecto glassmorphism con:
```css
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
background: rgba(24, 24, 24, 0.9);
border: 1px solid rgba(255, 255, 255, 0.05);
```

## 📱 Scrollbar Personalizada

Scrollbar estilo "overlay" (flotante, sin ocupar espacio):
```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: #555555;
  border-radius: 10px;
}
```

## 🚀 Uso en Producción

### 1. Importar en App.jsx:
```jsx
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import TrackGrid from './components/TrackGrid';
import DemoYTM from './components/DemoYTM';
```

### 2. Agregar a Routes:
```jsx
<Routes>
  <Route path="/demo" element={<DemoYTM />} />
  {/* Otras rutas... */}
</Routes>
```

### 3. Ejecutar la aplicación:
```bash
npm start
```

## ✨ Características Implementadas

✅ Paleta YTM exacta con variables CSS  
✅ Glassmorphism en barra de navegación  
✅ Scrollbar personalizada (WebKit overlay)  
✅ SplitText con GSAP (palabras, caracteres, líneas)  
✅ ScrollTrigger para viewport-triggered animations  
✅ Animaciones suaves con easing `power3.out`  
✅ Diseño fully responsive (desktop, tablet, móvil)  
✅ Hero section con artwork y metadata  
✅ Cuadrícula de canciones estilo YouTube Music  
✅ Tipografía Roboto (Google Fonts)  

## 📊 Ejemplos de Personalización

### Cambiar colores:
```css
:root {
  --ytm-accent: #00ff00; /* Cambiar rojo a verde */
  --ytm-text-primary: #f0f0f0; /* Cambiar blanco puro */
}
```

### Modificar animación SplitText:
```jsx
<SplitText
  text="Texto personalizado"
  splitType="chars"
  animationFrom={{ y: 50, opacity: 0, rotation: -10 }}
  animationTo={{ y: 0, opacity: 1, rotation: 0, duration: 1 }}
  stagger={0.15}
  ease="back.out"
/>
```

### Ajustar glassmorphism:
```css
.glass {
  backdrop-filter: blur(20px); /* Aumentar blur */
  background: rgba(24, 24, 24, 0.95); /* Más opaco */
}
```

## 🛠️ Troubleshooting

### Las animaciones no se ejecutan:
1. Asegúrate de que GSAP está instalado: `npm list gsap`
2. Verifica que ScrollTrigger esté registrado en SplitText.jsx
3. Comprueba que el elemento está visible en el viewport

### Scrollbar no aparece:
- Es normal en sistemas con scrollbar overlay
- Prueba scrolleando con la rueda del ratón
- En Firefox puede verse diferente (personalización parcial)

### Glassmorphism no visible:
- Verifica que tu navegador soporte `backdrop-filter`
- Algunos navegadores antiguos pueden no soportarlo
- Como fallback, se muestra el color de fondo base

## 📚 Recursos Adicionales

- [GSAP Documentation](https://gsap.com/docs)
- [ScrollTrigger Guide](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [React Best Practices](https://react.dev)
- [YouTube Music Design System](https://material.io)

## 📄 Licencia

Este proyecto está disponible bajo licencia MIT.

## 👨‍💻 Autor

Creado como demostración de arquitectura React + GSAP + CSS moderno.

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0
