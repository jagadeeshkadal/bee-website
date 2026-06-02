'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cmsConfig } from '@/lib/cmsConfig';

export default function Story() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Scale tilt to maximum 12 degrees
    const rotateX = -(y / (box.height / 2)) * 12;
    const rotateY = (x / (box.width / 2)) * 12;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section
      id="origin"
      className="relative min-h-screen py-24 flex items-center justify-center overflow-hidden"
    >
      {/* Decorative vertical lines */}
      <div className="absolute inset-y-0 left-10 md:left-20 w-px bg-white/3 z-0" />
      <div className="absolute inset-y-0 right-10 md:right-20 w-px bg-white/3 z-0" />

      {/* Radial ambient glow */}
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-nature-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left panel: Story contents */}
          <div className="order-2 lg:order-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-honey-gold text-xs font-semibold tracking-[0.3em] uppercase block mb-3">
                {cmsConfig.originSection.tag}
              </span>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                {cmsConfig.originSection.titleLine1}
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-honey-gold to-warm-yellow">
                  {cmsConfig.originSection.titleLine2}
                </span>
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-soft-cream/70 text-lg leading-relaxed mb-6 font-light"
            >
              {cmsConfig.originSection.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 gap-6 mt-4"
            >
              {cmsConfig.originSection.highlights.map((item, idx) => (
                <div 
                  key={idx}
                  className={`glassmorphism p-5 rounded-2xl hover-glow luxury-border-glow pointer-events-auto ${
                    idx === 0 ? 'animate-float' : 'animate-float-delayed'
                  }`}
                >
                  <h3 className="text-2xl font-bold text-honey-gold mb-1">{item.value}</h3>
                  <p className="text-xs uppercase tracking-wider text-soft-cream/60">
                    {item.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right panel: Nature-inspired Visual Card with 3D Mouse Tilt & Reflections */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            className="order-1 lg:order-2 relative aspect-4/5 max-w-md mx-auto w-full group overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-honey-gold/5 glass-reflection cursor-crosshair pointer-events-auto"
          >
            {/* Parallax Image container */}
            <div className="absolute inset-0 scale-110 group-hover:scale-105 transition-transform duration-[2s] ease-out">
              <Image
                src={cmsConfig.originSection.imageSrc}
                alt={cmsConfig.originSection.imageAlt}
                fill
                priority
                className="object-cover opacity-60 filter brightness-90 saturate-75 mix-blend-lighten"
              />
            </div>
            
            {/* Shadow gradients for luxury vibe */}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-tr from-honey-gold/20 via-transparent to-transparent mix-blend-color-dodge" />
            
            {/* Border frame */}
            <div className="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none z-10" />

            <div className="absolute bottom-8 left-8 right-8 z-20">
              <span className="text-xs font-semibold tracking-widest text-honey-gold uppercase block mb-1">
                {cmsConfig.originSection.detailTag}
              </span>
              <p className="text-white text-lg font-medium leading-snug">
                {cmsConfig.originSection.detailDescription}
              </p>
            </div>
          </motion.div>

          
        </div>
      </div>

      {/* Subtle floating wave line background */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 opacity-15">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C26.9,8.75,55.05,17.2,84.4,24.07,170.82,44.25,254.19,69,321.39,56.44Z"
            fill="#ffb703"
          />
        </svg>
      </div>
    </section>
  );
}
