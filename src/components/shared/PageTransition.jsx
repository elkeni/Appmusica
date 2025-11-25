import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export default function PageTransition({ children }) {
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransitionStage] = useState('fadeIn');

    useEffect(() => {
        if (location !== displayLocation) {
            setTransitionStage('fadeOut');
        }
    }, [location, displayLocation]);

    useEffect(() => {
        if (transitionStage === 'fadeOut') {
            const timeout = setTimeout(() => {
                setDisplayLocation(location);
                setTransitionStage('fadeIn');
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [transitionStage, location]);

    return (
        <div
            className={`page-transition ${
                transitionStage === 'fadeOut' 
                    ? 'animate-fadeOut' 
                    : 'animate-fadeIn'
            }`}
        >
            {children}
        </div>
    );
}

export function FadeInContainer({ children, delay = 0, className = '' }) {
    const ref = React.useRef(null);

    useEffect(() => {
        if (ref.current) {
            gsap.fromTo(
                ref.current,
                { opacity: 0, y: 20 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.6, 
                    delay,
                    ease: 'power2.out' 
                }
            );
        }
    }, [delay]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}

export function SlideInContainer({ children, direction = 'left', delay = 0, className = '' }) {
    const ref = React.useRef(null);

    useEffect(() => {
        if (ref.current) {
            const xValue = direction === 'left' ? -50 : direction === 'right' ? 50 : 0;
            const yValue = direction === 'up' ? -50 : direction === 'down' ? 50 : 0;

            gsap.fromTo(
                ref.current,
                { opacity: 0, x: xValue, y: yValue },
                { 
                    opacity: 1, 
                    x: 0, 
                    y: 0, 
                    duration: 0.6, 
                    delay,
                    ease: 'power2.out' 
                }
            );
        }
    }, [direction, delay]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}

export function ScaleInContainer({ children, delay = 0, className = '' }) {
    const ref = React.useRef(null);

    useEffect(() => {
        if (ref.current) {
            gsap.fromTo(
                ref.current,
                { opacity: 0, scale: 0.8 },
                { 
                    opacity: 1, 
                    scale: 1, 
                    duration: 0.5, 
                    delay,
                    ease: 'back.out(1.2)' 
                }
            );
        }
    }, [delay]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}

export function StaggerContainer({ children, className = '' }) {
    const ref = React.useRef(null);

    useEffect(() => {
        if (ref.current) {
            const items = ref.current.children;
            gsap.fromTo(
                items,
                { opacity: 0, y: 20 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'power2.out' 
                }
            );
        }
    }, []);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}
