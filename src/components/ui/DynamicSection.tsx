'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DynamicSectionProps {
  id: string;
  loadingText: string;
  children: ReactNode;
}

export default function DynamicSection({ id, loadingText, children }: DynamicSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Safe isolated effect for handling the dynamic loading timeout to prevent premature clearing
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (hasLoaded) return;

    const triggerLoad = () => {
      setIsLoading(true);
      setHasLoaded(true);
    };

    // Global listener for click or programmatic navigation to trigger dynamic loader
    const handleForceLoad = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id === id) {
        triggerLoad();
      }
    };

    window.addEventListener('trigger-section-load', handleForceLoad);

    // Auto-detect when the user scrolls near the section
    let observer: IntersectionObserver | null = null;
    const element = document.getElementById(id);
    if (element) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            triggerLoad();
          }
        },
        {
          threshold: 0.12, // Trigger slightly before it is fully in center view
          rootMargin: '0px 0px -80px 0px',
        }
      );
      observer.observe(element);
    }

    return () => {
      window.removeEventListener('trigger-section-load', handleForceLoad);
      if (observer) observer.disconnect();
    };
  }, [id, hasLoaded]);

  return (
    <div id={id} className="relative w-full min-h-screen">
      {/* Elegant Glowing Loader Overlay (Positioned absolutely so it doesn't affect content flow) */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none z-30 pointer-events-none"
          >
            {/* Background radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-honey-gold/10 rounded-full blur-[100px] pointer-events-none z-0" />
            
            {/* Elegant glowing line decors */}
            <div className="absolute inset-y-0 left-10 md:left-20 w-px bg-white/2 z-0" />
            <div className="absolute inset-y-0 right-10 md:right-20 w-px bg-white/2 z-0" />

            {/* Mesmerizing Concentric Golden Hexagonal Loader */}
            <div className="relative flex items-center justify-center z-10 mb-6">
              <svg viewBox="0 0 120 120" className="w-20 h-20 text-honey-gold">
                {/* Hexagon 1: Outer dashed ring */}
                <path
                  d="M60,10 L103.3,35 L103.3,85 L60,110 L16.7,85 L16.7,35 Z"
                  fill="none"
                  stroke="url(#goldLoaderGradient)"
                  strokeWidth="2"
                  strokeDasharray="8, 6"
                  className="animate-[spin_16s_linear_infinite]"
                />
                {/* Hexagon 2: Middle solid ring (rotates reverse) */}
                <path
                  d="M60,25 L94.6,45 L94.6,85 L60,105 L25.4,85 L25.4,45 Z"
                  fill="none"
                  stroke="url(#goldLoaderGradient)"
                  strokeWidth="1.5"
                  className="animate-[spin_8s_linear_infinite_reverse] opacity-70"
                />
                {/* Hexagon 3: Inner glowing core */}
                <polygon
                  points="60,45 77.3,55 77.3,75 60,85 42.7,75 42.7,55"
                  fill="url(#goldLoaderGradient)"
                  className="opacity-90 animate-pulse transform origin-center scale-90"
                />
                
                <defs>
                  <linearGradient id="goldLoaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffb703" />
                    <stop offset="100%" stopColor="#ffd166" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Decorative particle rings */}
              <div className="absolute inset-0 border border-white/3 rounded-full scale-125 animate-ping opacity-25" />
            </div>

            {/* Pulsing loading typography */}
            <div className="text-center z-10 px-4">
              <span className="text-honey-gold text-[10px] font-bold tracking-[0.35em] uppercase block mb-2 animate-pulse">
                DYNAMIC HARVEST AGENT ACTIVE
              </span>
              <p className="text-soft-cream/60 font-light text-xs tracking-widest uppercase max-w-sm mx-auto leading-relaxed">
                {loadingText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Section Content - Always mounted in flow to maintain exact heights and prevent scroll jumping */}
      <motion.div
        animate={{ opacity: hasLoaded && !isLoading ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
