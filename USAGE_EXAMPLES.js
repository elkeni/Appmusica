/**
 * EJEMPLOS DE USO - YouTube Music Components
 * 
 * Este archivo muestra todas las formas de usar los componentes creados
 * Cópialo como referencia para tu proyecto
 */

// ============================================
// EJEMPLO 1: IMPORTACIÓN CENTRALIZADA
// ============================================

import {
  SplitText,
  Header,
  HeroSection,
  TrackGrid,
  DemoYTM,
  SplitTextExamples,
  SplitTextShowcase
} from './components';

// ============================================
// EJEMPLO 2: IMPORTACIÓN INDIVIDUAL
// ============================================

import SplitText from './components/SplitText';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import TrackGrid from './components/TrackGrid';
import DemoYTM from './components/DemoYTM';
import SplitTextShowcase from './components/SplitTextShowcase';

// Utilidades
import {
  SPLIT_TEXT_PRESETS,
  getAnimationPreset,
  EASING_FUNCTIONS,
  SPLIT_TYPES
} from './utils/splitTextUtils';

// ============================================
// EJEMPLO 3: DEMO COMPLETA (RECOMENDADO)
// ============================================

export function AppDemo1() {
  return (
    <div>
      <Header />
      <HeroSection />
      <TrackGrid />
    </div>
  );
}

// ============================================
// EJEMPLO 4: USAR DemoYTM COMPONENT
// ============================================

export function AppDemo2() {
  return <DemoYTM />;
}

// ============================================
// EJEMPLO 5: SPLIT TEXT BÁSICO
// ============================================

export function BasicSplitText() {
  return (
    <SplitText
      text="Bienvenido a YouTube Music"
      splitType="words"
      animationFrom={{ y: 30, opacity: 0 }}
      animationTo={{ y: 0, opacity: 1, duration: 0.8 }}
      stagger={0.1}
      ease="power3.out"
    />
  );
}

// ============================================
// EJEMPLO 6: SPLIT TEXT CON PRESETS
// ============================================

export function SplitTextWithPreset() {
  const preset = getAnimationPreset('slideUp');
  
  return (
    <SplitText
      text="Animación con preset"
      splitType="words"
      {...preset}
    />
  );
}

// ============================================
// EJEMPLO 7: MÚLTIPLES ANIMACIONES EN UNA PÁGINA
// ============================================

export function PageWithMultipleAnimations() {
  return (
    <div>
      {/* Título */}
      <h1>
        <SplitText
          text="Mi Página"
          splitType="words"
          {...getAnimationPreset('slideUp')}
        />
      </h1>

      {/* Subtítulo */}
      <h2>
        <SplitText
          text="Bienvenido"
          splitType="chars"
          {...getAnimationPreset('typeEffect')}
        />
      </h2>

      {/* Contenido */}
      <p>
        <SplitText
          text="Este es un ejemplo con múltiples animaciones."
          splitType="words"
          {...getAnimationPreset('fadeIn', { stagger: 0.1 })}
        />
      </p>
    </div>
  );
}

// ============================================
// EJEMPLO 8: ANIMACIÓN PERSONALIZADA
// ============================================

export function CustomAnimation() {
  const customConfig = {
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
    ease: EASING_FUNCTIONS.backOut
  };

  return (
    <SplitText
      text="Animación Personalizada"
      splitType="words"
      {...customConfig}
    />
  );
}

// ============================================
// EJEMPLO 9: TODOS LOS PRESETS EN UN LOOP
// ============================================

export function AllPresetsDemo() {
  return (
    <div>
      {Object.entries(SPLIT_TEXT_PRESETS).map(([presetName, config]) => (
        <div key={presetName} style={{ marginBottom: '4rem' }}>
          <h3>{presetName}</h3>
          <SplitText
            text={presetName.toUpperCase()}
            splitType="words"
            {...config}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================
// EJEMPLO 10: SPLIT TEXT CON CARACTERES
// ============================================

export function CharacterSplitAnimation() {
  return (
    <SplitText
      text="CHARACTERS"
      splitType="chars"
      animationFrom={{ scale: 0, opacity: 0 }}
      animationTo={{ scale: 1, opacity: 1, duration: 1 }}
      stagger={0.08}
      ease={EASING_FUNCTIONS.bounceOut}
    />
  );
}

// ============================================
// EJEMPLO 11: EFECTO REBOTE
// ============================================

export function BounceEffect() {
  return (
    <SplitText
      text="BOUNCE"
      splitType="words"
      {...getAnimationPreset('bounce')}
    />
  );
}

// ============================================
// EJEMPLO 12: EFECTO ELÁSTICO
// ============================================

export function ElasticEffect() {
  return (
    <SplitText
      text="ELASTIC"
      splitType="chars"
      {...getAnimationPreset('spring')}
    />
  );
}

// ============================================
// EJEMPLO 13: EFECTO ROTACIÓN ELEGANTE
// ============================================

export function RotationEffect() {
  return (
    <SplitText
      text="ROTATE"
      splitType="words"
      {...getAnimationPreset('elegant')}
    />
  );
}

// ============================================
// EJEMPLO 14: HERRAMIENTA INTERACTIVA
// ============================================

export function InteractiveShowcase() {
  return <SplitTextShowcase />;
}

// ============================================
// EJEMPLO 15: COMBINADO CON OTROS COMPONENTES
// ============================================

export function CompleteExample() {
  return (
    <div>
      <Header />
      
      <section style={{ padding: '4rem 2rem' }}>
        <h1>
          <SplitText
            text="Descubre Música"
            splitType="words"
            {...getAnimationPreset('slideUp')}
          />
        </h1>
        
        <p style={{ marginTop: '2rem' }}>
          <SplitText
            text="Los mejores artistas en un solo lugar"
            splitType="words"
            {...getAnimationPreset('fadeIn')}
          />
        </p>
      </section>
      
      <HeroSection />
      <TrackGrid />
    </div>
  );
}

// ============================================
// EJEMPLO 16: USO CON ESTADO (React Hooks)
// ============================================

import React, { useState } from 'react';

export function DynamicSplitText() {
  const [text, setText] = useState('Escribe algo aquí');
  const [splitType, setSplitType] = useState('words');
  const [preset, setPreset] = useState('slideUp');

  const currentPreset = getAnimationPreset(preset);

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ingresa tu texto"
      />

      <select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
        <option value="words">Palabras</option>
        <option value="chars">Caracteres</option>
        <option value="lines">Líneas</option>
      </select>

      <select value={preset} onChange={(e) => setPreset(e.target.value)}>
        {Object.keys(SPLIT_TEXT_PRESETS).map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <div style={{ marginTop: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>
        <SplitText
          text={text}
          splitType={splitType}
          {...currentPreset}
        />
      </div>
    </div>
  );
}

// ============================================
// EJEMPLOS 17-20: CASOS DE USO REALES
// ============================================

// Landing Page Hero
export function LandingPageHero() {
  return (
    <section style={{ 
      background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
      padding: '8rem 2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>
        <SplitText
          text="Bienvenido a tu Música"
          splitType="words"
          {...getAnimationPreset('slideUp', { stagger: 0.15 })}
        />
      </h1>
    </section>
  );
}

// Product Showcase
export function ProductShowcase() {
  return (
    <div style={{ padding: '4rem' }}>
      <h2>
        <SplitText
          text="Características Increíbles"
          splitType="words"
          {...getAnimationPreset('bounce')}
        />
      </h2>
    </div>
  );
}

// Loading/Intro Screen
export function IntroScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#030303'
    }}>
      <h1 style={{ fontSize: '4rem' }}>
        <SplitText
          text="MUSIC"
          splitType="chars"
          {...getAnimationPreset('elegant')}
        />
      </h1>
    </div>
  );
}

// Animated Form Labels
export function FormWithAnimation() {
  return (
    <form>
      <label>
        <SplitText
          text="Nombre Completo"
          splitType="chars"
          {...getAnimationPreset('typeEffect')}
        />
      </label>
      <input type="text" />

      <label>
        <SplitText
          text="Email"
          splitType="chars"
          {...getAnimationPreset('typeEffect')}
        />
      </label>
      <input type="email" />
    </form>
  );
}

// ============================================
// MAIN APP - ELIGE UN EJEMPLO
// ============================================

export default function App() {
  // Descomentar el ejemplo que quieras usar:
  
  // return <AppDemo2 />; // Más simple
  // return <BasicSplitText />;
  // return <SplitTextWithPreset />;
  // return <PageWithMultipleAnimations />;
  // return <CustomAnimation />;
  // return <AllPresetsDemo />;
  // return <CharacterSplitAnimation />;
  // return <BounceEffect />;
  // return <ElasticEffect />;
  // return <RotationEffect />;
  // return <InteractiveShowcase />;
  // return <CompleteExample />; // Más completo
  // return <DynamicSplitText />;
  // return <LandingPageHero />;
  // return <ProductShowcase />;
  // return <IntroScreen />;
  // return <FormWithAnimation />;

  // Por defecto, mostrar DemoYTM
  return <DemoYTM />;
}
