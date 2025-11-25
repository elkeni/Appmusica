import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

/**
 * Custom Hook: usePageTransition
 * Adds smooth page transitions using GSAP
 */
export const usePageTransition = () => {
    const location = useLocation();

    useEffect(() => {
        // Fade in animation on route change
        const element = document.querySelector('.page-transition');
        if (element) {
            gsap.fromTo(
                element,
                { opacity: 0, y: 20 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.5, 
                    ease: 'power2.out',
                    clearProps: 'all'
                }
            );
        }
    }, [location.pathname]);
};

/**
 * Custom Hook: useScrollAnimation
 * Animates elements on scroll into view
 */
export const useScrollAnimation = (selector = '.scroll-animate', options = {}) => {
    useEffect(() => {
        const elements = document.querySelectorAll(selector);
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    gsap.fromTo(
                        entry.target,
                        { 
                            opacity: 0, 
                            y: options.y || 30,
                            scale: options.scale || 1
                        },
                        { 
                            opacity: 1, 
                            y: 0,
                            scale: 1,
                            duration: options.duration || 0.6, 
                            ease: options.ease || 'power2.out',
                            delay: options.delay || 0
                        }
                    );
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '0px'
        });

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [selector, options]);
};

/**
 * Custom Hook: useCardHoverAnimation
 * Adds smooth hover effects to cards
 */
export const useCardHoverAnimation = (selector = '.card-hover') => {
    useEffect(() => {
        const cards = document.querySelectorAll(selector);

        cards.forEach((card) => {
            const handleMouseEnter = () => {
                gsap.to(card, {
                    y: -8,
                    scale: 1.03,
                    duration: 0.3,
                    ease: 'power2.out',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                });
            };

            const handleMouseLeave = () => {
                gsap.to(card, {
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                });
            };

            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                card.removeEventListener('mouseenter', handleMouseEnter);
                card.removeEventListener('mouseleave', handleMouseLeave);
            };
        });
    }, [selector]);
};

/**
 * Custom Hook: useStaggerAnimation
 * Staggers animation of multiple elements
 */
export const useStaggerAnimation = (selector = '.stagger-item', delay = 0.1) => {
    useEffect(() => {
        const elements = document.querySelectorAll(selector);
        
        if (elements.length > 0) {
            gsap.fromTo(
                elements,
                { opacity: 0, y: 20 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.5,
                    stagger: delay,
                    ease: 'power2.out',
                    clearProps: 'all'
                }
            );
        }
    }, [selector, delay]);
};

/**
 * Helper function: animatePlayButton
 * Animates play button on click
 */
export const animatePlayButton = (element) => {
    gsap.timeline()
        .to(element, { scale: 0.9, duration: 0.1 })
        .to(element, { scale: 1.1, duration: 0.2 })
        .to(element, { scale: 1, duration: 0.1 });
};

/**
 * Helper function: animateNumberCount
 * Animates number counting up
 */
export const animateNumberCount = (element, targetNumber, duration = 1) => {
    gsap.to({ val: 0 }, {
        val: targetNumber,
        duration: duration,
        ease: 'power1.out',
        onUpdate: function() {
            element.textContent = Math.round(this.targets()[0].val);
        }
    });
};

/**
 * Helper function: pulseAnimation
 * Creates a pulse effect
 */
export const pulseAnimation = (element, scale = 1.05) => {
    gsap.to(element, {
        scale: scale,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
    });
};
