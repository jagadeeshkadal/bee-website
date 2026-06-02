'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const lenis = (window as unknown as { lenis?: { scrollTo: (target: number | HTMLElement, options?: { duration: number }) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full glassmorphism flex items-center justify-center border border-honey-gold/30 text-honey-gold hover:text-black hover:border-honey-gold shadow-[0_0_15px_rgba(255,183,3,0.1)] hover:shadow-[0_0_25px_rgba(255,183,3,0.35)] cursor-pointer group pointer-events-auto transition-all duration-300"
          aria-label="Back to Top"
        >
          {/* Animated Glowing Outer Ring on Hover */}
          <div className="absolute inset-0 rounded-full border border-dashed border-honey-gold/0 group-hover:border-honey-gold/40 group-hover:animate-[spin_8s_linear_infinite] transition-all duration-300" />
          
          {/* Hover solid gold background overlay */}
          <div className="absolute inset-[2px] rounded-full bg-linear-to-r from-honey-gold to-warm-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

          {/* Up Chevron Arrow with hover micro-animation */}
          <span className="relative z-10 block overflow-hidden h-6 w-6">
            <svg
              className="w-6 h-6 transform transition-transform duration-300 group-hover:-translate-y-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <svg
              className="w-6 h-6 absolute top-6 left-0 transform transition-transform duration-300 group-hover:-translate-y-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
