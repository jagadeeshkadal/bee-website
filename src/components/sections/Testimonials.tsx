'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { cmsConfig } from '@/lib/cmsConfig';

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative min-h-screen py-24 flex items-center justify-center overflow-hidden"
    >
      {/* Decorative vertical lines */}
      <div className="absolute inset-y-0 left-10 md:left-20 w-px bg-white/3 z-0" />
      <div className="absolute inset-y-0 right-10 md:right-20 w-px bg-white/3 z-0" />

      {/* Hexagonal grid background overlay (subtle) */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#ffb703_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      {/* Honey radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-honey-gold/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="container mx-auto px-6 relative z-20">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-20 select-none">
          <span className="text-honey-gold text-xs font-semibold tracking-[0.3em] uppercase block mb-3">
            {cmsConfig.testimonialsSection.tag}
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-none">
            {cmsConfig.testimonialsSection.titleLine1} <span className="text-honey-gold">{cmsConfig.testimonialsSection.titleLine2}</span>
          </h2>
          <p className="text-soft-cream/60 mt-4 text-sm md:text-base font-light">
            {cmsConfig.testimonialsSection.description}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cmsConfig.testimonialsSection.list.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              whileHover={{ y: -8 }}
              className="glassmorphism p-8 rounded-[2.5rem] border border-white/10 relative group transition-all duration-300 hover:border-honey-gold/30 cursor-default luxury-border-glow"
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-honey-gold text-honey-gold" />
                ))}
              </div>

              {/* Quote Icon with group-hover dynamic scaling */}
              <Quote className="w-10 h-10 text-white/5 absolute top-8 right-8 group-hover:text-honey-gold/20 group-hover:scale-115 group-hover:rotate-12 transition-all duration-500 pointer-events-none" />

              {/* Text content */}
              <p className="text-soft-cream/80 text-base leading-relaxed font-light mb-8 italic">
                {t.text}
              </p>

              {/* Separator line */}
              <div className="w-full h-px bg-white/5 mb-6" />

              {/* User details */}
              <div>
                <h4 className="font-bold text-white tracking-wide">
                  {t.name}
                </h4>
                <p className="text-xs text-honey-gold font-medium uppercase tracking-wider mt-1">
                  {t.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
