/**
 * YouTube Music Components & Utils Index
 * 
 * Archivo centralizado para facilitar importaciones
 * Usa: import { SplitText, Header, SPLIT_TEXT_PRESETS } from './components/index';
 */

// ========================================
// COMPONENTES
// ========================================

// Componente Principal - Animaciones de Texto
export { default as SplitText } from './SplitText';

// Componentes de Layout
export { default as Header } from './Header';
export { default as HeroSection } from './HeroSection';
export { default as TrackGrid } from './TrackGrid';

// Componentes Demo
export { default as DemoYTM } from './DemoYTM';
export { default as SplitTextExamples } from './SplitTextExamples';
export { default as SplitTextShowcase } from './SplitTextShowcase';

// ========================================
// ESTILOS (CSS IMPORTS - Incluir en App.js)
// ========================================
// import './Header.css';
// import './HeroSection.css';
// import './TrackGrid.css';
// import './DemoYTM.css';
// import './SplitTextExamples.css';
// import './SplitTextShowcase.css';

export default {
  SplitText,
  Header,
  HeroSection,
  TrackGrid,
  DemoYTM,
  SplitTextExamples,
  SplitTextShowcase,
};
