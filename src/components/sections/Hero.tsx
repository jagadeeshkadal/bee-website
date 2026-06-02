'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cmsConfig } from '@/lib/cmsConfig';

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Tracking mouse coordinates relative to screen center for cinematic parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2); // scale to -1 -> 1
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden pointer-events-none"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-honey-gold/10 to-warm-yellow/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Decorative vertical lines */}
      <div className="absolute inset-y-0 left-10 md:left-20 w-px bg-white/3 z-0" />
      <div className="absolute inset-y-0 right-10 md:right-20 w-px bg-white/3 z-0" />

      {/* Floating Golden Pollen Particles Layer (HTML Parallax Atmosphere) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10">
        {cmsConfig.heroSection.pollenGrains.map((p, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-honey-gold/30 blur-[0.5px]"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.15, 0.6, 0.15],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Dripping honey SVG effect (top of the page) */}
      <div className="absolute top-0 left-0 w-full z-20 opacity-30 pointer-events-none">
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,117.3C960,107,1056,155,1152,176C1248,197,1344,192,1392,189.3L1440,187L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fill="url(#honey-drip)"
          />
          <defs>
            <linearGradient id="honey-drip" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffb703" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffd166" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content wrapper */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center max-w-5xl mt-16 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-4"
        >
          <span className="text-honey-gold text-xs font-semibold tracking-[0.4em] uppercase glassmorphism px-4 py-2 rounded-full">
            {cmsConfig.heroSection.badge}
          </span>
        </motion.div>

        {/* Giant premium typography with Cursor Parallax Translation */}
        <motion.h1
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          style={{
            transform: `translate3d(${mousePos.x * -25}px, ${mousePos.y * -20}px, 0)`,
            transition: 'transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)',
          }}
          className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white leading-none mb-6 relative"
        >
          {cmsConfig.heroSection.titleLine1}
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-honey-gold via-warm-yellow to-honey-gold text-glow">
            {cmsConfig.heroSection.titleLine2}
          </span>
        </motion.h1>

        {/* Subtitles & Descriptions with Inverse Cursor Parallax */}
        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
          style={{
            transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 10}px, 0)`,
            transition: 'transform 0.5s cubic-bezier(0.1, 0.8, 0.2, 1)',
          }}
          className="text-soft-cream/70 text-base md:text-xl max-w-xl mb-10 leading-relaxed font-light tracking-wide px-4"
        >
          {cmsConfig.heroSection.description}
        </motion.p>

        {/* Visual cue to scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col items-center gap-2 pointer-events-auto cursor-pointer"
          onClick={() => {
            const story = document.getElementById('origin');
            if (story) {
              window.dispatchEvent(
                new CustomEvent('trigger-section-load', { detail: { id: 'origin' } })
              );
              const lenis = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement, options?: { offset: number; duration: number }) => void } }).lenis;
              if (lenis) {
                lenis.scrollTo(story, { offset: 0, duration: 1.4 });
              } else {
                story.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
        >
          <span className="text-xs uppercase tracking-[0.25em] text-soft-cream/40 hover:text-honey-gold transition-colors duration-300">
            {cmsConfig.heroSection.scrollText}
          </span>
          <div className="w-[1.5px] h-12 bg-linear-to-b from-honey-gold to-transparent animate-bounce mt-1" />
        </motion.div>
      </div>
    </section>
  );
}
