'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cmsConfig } from '@/lib/cmsConfig';

export default function Process() {
  return (
    <section
      id="process"
      className="relative min-h-screen py-24 flex items-center justify-center overflow-hidden"
    >
      {/* Decorative vertical lines */}
      <div className="absolute inset-y-0 left-10 md:left-20 w-px bg-white/3 z-0" />
      <div className="absolute inset-y-0 right-10 md:right-20 w-px bg-white/3 z-0" />

      {/* Nature light glow */}
      <div className="absolute bottom-1/4 left-10 w-[400px] h-[400px] bg-honey-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-20">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-20 select-none">
          <span className="text-honey-gold text-xs font-semibold tracking-[0.3em] uppercase block mb-3">
            {cmsConfig.processSection.tag}
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-none">
            {cmsConfig.processSection.titleLine1} <span className="text-honey-gold">{cmsConfig.processSection.titleLine2}</span>
          </h2>
          <p className="text-soft-cream/60 mt-4 text-sm md:text-base font-light">
            {cmsConfig.processSection.description}
          </p>
        </div>

        {/* Timeline body (Split layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left panel: Interactive Photo Showcase */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative aspect-4/5 w-full max-w-md mx-auto group overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-honey-gold/5"
            >
              {/* Parallax Image container */}
              <div className="absolute inset-0 scale-105 group-hover:scale-100 transition-transform duration-[2s] ease-out">
                <Image
                  src={cmsConfig.processSection.imageSrc}
                  alt={cmsConfig.processSection.imageAlt}
                  fill
                  className="object-cover opacity-60 filter brightness-95 saturate-100"
                />
              </div>

              {/* Shadow gradients for luxury vibe */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-tr from-honey-gold/20 via-transparent to-transparent mix-blend-color-dodge" />

              {/* Border frame */}
              <div className="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none z-10" />

              <div className="absolute bottom-8 left-8 right-8 z-20">
                <span className="text-xs font-semibold tracking-widest text-honey-gold uppercase block mb-1">
                  {cmsConfig.processSection.detailTag}
                </span>
                <p className="text-white text-lg font-medium leading-snug">
                  {cmsConfig.processSection.detailDescription}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right panel: Timeline/Steps items (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
            {cmsConfig.processSection.steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: idx * 0.15 }}
                className="flex gap-6 items-start relative select-none"
              >
                {/* Numeric badge */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border border-honey-gold bg-honey-gold/5 flex items-center justify-center text-honey-gold font-bold text-xs shrink-0 select-none shadow-md shadow-honey-gold/5 animate-pulse">
                    {step.num}
                  </div>
                  {/* Dotted lines connectors */}
                  {idx !== cmsConfig.processSection.steps.length - 1 && (
                    <div className="w-px h-16 border-l border-dashed border-white/20 my-2" />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <span className="text-[10px] uppercase tracking-widest text-honey-gold font-semibold block mb-0.5">
                    {step.subtitle}
                  </span>
                  <h3 className="text-lg font-extrabold text-white tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-xs text-soft-cream/60 leading-relaxed font-light mt-1.5 max-w-xl">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
