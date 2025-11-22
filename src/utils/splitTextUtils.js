/**
 * splitTextUtils.js
 * Utilidades y presets para el componente SplitText
 */

/**
 * Presets de animaciones predefinidas para SplitText
 */
export const SPLIT_TEXT_PRESETS = {
  // Slide Up Effect
  slideUp: {
    animationFrom: { y: 30, opacity: 0 },
    animationTo: { y: 0, opacity: 1, duration: 0.8 },
    stagger: 0.1,
    ease: 'power3.out',
  },

  // Slide Down Effect
  slideDown: {
    animationFrom: { y: -30, opacity: 0 },
    animationTo: { y: 0, opacity: 1, duration: 0.8 },
    stagger: 0.1,
    ease: 'power3.out',
  },

  // Slide Left Effect
  slideLeft: {
    animationFrom: { x: -30, opacity: 0 },
    animationTo: { x: 0, opacity: 1, duration: 0.8 },
    stagger: 0.1,
    ease: 'power3.out',
  },

  // Slide Right Effect
  slideRight: {
    animationFrom: { x: 30, opacity: 0 },
    animationTo: { x: 0, opacity: 1, duration: 0.8 },
    stagger: 0.1,
    ease: 'power3.out',
  },

  // Scale In Effect
  scaleIn: {
    animationFrom: { scale: 0, opacity: 0 },
    animationTo: { scale: 1, opacity: 1, duration: 1 },
    stagger: 0.08,
    ease: 'back.out',
  },

  // Rotate In Effect
  rotateIn: {
    animationFrom: { y: 30, opacity: 0, rotation: -90 },
    animationTo: { y: 0, opacity: 1, rotation: 0, duration: 1.2 },
    stagger: 0.12,
    ease: 'elastic.out',
  },

  // Bounce Effect
  bounce: {
    animationFrom: { y: -20, opacity: 0 },
    animationTo: { y: 0, opacity: 1, duration: 0.6 },
    stagger: 0.05,
    ease: 'bounce.out',
  },

  // Fade In Effect
  fadeIn: {
    animationFrom: { opacity: 0 },
    animationTo: { opacity: 1, duration: 1 },
    stagger: 0.2,
    ease: 'sine.out',
  },

  // Type Effect (Escritura)
  typeEffect: {
    animationFrom: { x: -10, opacity: 0 },
    animationTo: { x: 0, opacity: 1, duration: 0.5 },
    stagger: 0.06,
    ease: 'power2.out',
  },

  // Complex Effect
  complex: {
    animationFrom: { y: 40, x: -20, opacity: 0, scale: 0.8 },
    animationTo: { y: 0, x: 0, opacity: 1, scale: 1, duration: 1 },
    stagger: 0.1,
    ease: 'back.out',
  },

  // Elegant Slow Effect
  elegant: {
    animationFrom: { y: 60, opacity: 0, rotationZ: 360 },
    animationTo: { y: 0, opacity: 1, rotationZ: 0, duration: 1.5 },
    stagger: 0.1,
    ease: 'power4.out',
  },

  // Flip Effect
  flip: {
    animationFrom: { rotationX: 90, opacity: 0 },
    animationTo: { rotationX: 0, opacity: 1, duration: 1 },
    stagger: 0.08,
    ease: 'back.out',
  },

  // Spring Effect
  spring: {
    animationFrom: { scale: 0, opacity: 0 },
    animationTo: { scale: 1, opacity: 1, duration: 0.8 },
    stagger: 0.1,
    ease: 'elastic.out',
  },
};

/**
 * Easings recomendados por GSAP
 */
export const EASING_FUNCTIONS = {
  // Power Easing
  power1Out: 'power1.out',
  power2Out: 'power2.out',
  power3Out: 'power3.out',
  power4Out: 'power4.out',

  power1In: 'power1.in',
  power2In: 'power2.in',
  power3In: 'power3.in',
  power4In: 'power4.in',

  // Back Easing
  backOut: 'back.out',
  backIn: 'back.in',

  // Elastic Easing
  elasticOut: 'elastic.out',
  elasticIn: 'elastic.in',

  // Bounce Easing
  bounceOut: 'bounce.out',
  bounceIn: 'bounce.in',

  // Circ Easing
  circOut: 'circ.out',
  circIn: 'circ.in',

  // Sine Easing
  sineOut: 'sine.out',
  sineIn: 'sine.in',

  // Expo Easing
  expoOut: 'expo.out',
  expoIn: 'expo.in',

  // Linear
  linear: 'linear',
};

/**
 * Función para obtener un preset y personalizarlo
 */
export const getAnimationPreset = (presetName, overrides = {}) => {
  const preset = SPLIT_TEXT_PRESETS[presetName] || SPLIT_TEXT_PRESETS.slideUp;
  return { ...preset, ...overrides };
};

/**
 * Tipos de split disponibles
 */
export const SPLIT_TYPES = {
  WORDS: 'words',
  CHARS: 'chars',
  LINES: 'lines',
};

/**
 * Validador de props del componente
 */
export const validateSplitTextProps = (props) => {
  const { splitType, text } = props;

  if (!text || typeof text !== 'string') {
    console.warn('SplitText: text prop debe ser un string válido');
    return false;
  }

  if (!Object.values(SPLIT_TYPES).includes(splitType)) {
    console.warn(`SplitText: splitType debe ser uno de: ${Object.values(SPLIT_TYPES).join(', ')}`);
    return false;
  }

  return true;
};

/**
 * Utilidad para crear animaciones dinámicamente
 */
export const createCustomAnimation = (config) => {
  const {
    fromY = 0,
    fromX = 0,
    fromOpacity = 1,
    fromScale = 1,
    toY = 0,
    toX = 0,
    toOpacity = 1,
    toScale = 1,
    duration = 0.6,
    ease = 'power3.out',
  } = config;

  return {
    animationFrom: {
      y: fromY,
      x: fromX,
      opacity: fromOpacity,
      scale: fromScale,
    },
    animationTo: {
      y: toY,
      x: toX,
      opacity: toOpacity,
      scale: toScale,
      duration,
    },
    ease,
  };
};

/**
 * Generador de variaciones de animación
 */
export const generateAnimationVariants = (basePreset = 'slideUp', count = 5) => {
  const base = getAnimationPreset(basePreset);
  const variants = [];

  for (let i = 0; i < count; i++) {
    const staggerVariation = base.stagger * (0.8 + i * 0.1);
    const durationVariation = base.animationTo.duration * (0.9 + i * 0.05);

    variants.push({
      ...base,
      stagger: staggerVariation,
      animationTo: {
        ...base.animationTo,
        duration: durationVariation,
      },
    });
  }

  return variants;
};

export default {
  SPLIT_TEXT_PRESETS,
  EASING_FUNCTIONS,
  SPLIT_TYPES,
  getAnimationPreset,
  validateSplitTextProps,
  createCustomAnimation,
  generateAnimationVariants,
};
