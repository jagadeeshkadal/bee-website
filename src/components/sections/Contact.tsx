'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cmsConfig } from '@/lib/cmsConfig';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMsg, setResponseMsg] = useState('');

  // 3D Card Tilt State for Luxury Form Panel
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Smooth maximum 6 degrees tilt
    const rotateX = -(y / (box.height / 2)) * 6;
    const rotateY = (x / (box.width / 2)) * 6;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend form validations
    if (!formData.name.trim()) {
      setStatus('error');
      setResponseMsg('Please provide your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setStatus('error');
      setResponseMsg('Please provide your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStatus('error');
      setResponseMsg('Invalid email format. Please provide a valid email.');
      return;
    }

    if (!formData.subject.trim()) {
      setStatus('error');
      setResponseMsg('Please specify the subject of your inquiry.');
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setStatus('error');
      setResponseMsg('Please write a message (minimum 10 characters).');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setResponseMsg(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 6000);
      } else {
        setStatus('error');
        setResponseMsg(data.error || 'Failed to submit request.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setResponseMsg('Network connection lost. Please try again.');
    }
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen pt-24 pb-12 flex flex-col justify-between overflow-hidden"
    >
      {/* Decorative vertical lines */}
      <div className="absolute inset-y-0 left-10 md:left-20 w-px bg-white/3 z-0" />
      <div className="absolute inset-y-0 right-10 md:right-20 w-px bg-white/3 z-0" />

      {/* Honey radial glow */}
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-honey-gold/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="container mx-auto px-6 relative z-20 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left panel: Info & Call to Action (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 select-none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-honey-gold text-xs font-semibold tracking-[0.3em] uppercase block mb-3">
                {cmsConfig.contactSection.tag}
              </span>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-none">
                {cmsConfig.contactSection.titleLine1} <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-honey-gold to-warm-yellow">
                  {cmsConfig.contactSection.titleLine2}
                </span>
              </h2>
              <p className="text-soft-cream/70 text-sm md:text-base leading-relaxed font-light mb-4">
                {cmsConfig.contactSection.description}
              </p>
              
              <div className="flex flex-col gap-2.5 text-xs text-soft-cream/60 font-light mt-6 border-l border-honey-gold/30 pl-4 font-mono">
                <span className="block truncate">EMAIL: {cmsConfig.contactSection.details.email}</span>
                <span className="block">PHONE: {cmsConfig.contactSection.details.phone}</span>
                <span className="block leading-relaxed">ADDRESS: {cmsConfig.contactSection.details.address}</span>
              </div>
            </motion.div>

            {/* Social handles */}
            <div className="flex gap-4 items-center mt-2">
              {cmsConfig.contactSection.socialLinks.map((social, idx) => {
                if (social.iconName === 'instagram') {
                  return (
                    <a
                      key={idx}
                      href={social.url}
                      className="w-12 h-12 rounded-full glassmorphism flex items-center justify-center border border-white/10 hover:border-honey-gold hover:text-honey-gold transition-colors duration-300 pointer-events-auto"
                      title={social.name}
                    >
                      <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                  );
                } else if (social.iconName === 'twitter') {
                  return (
                    <a
                      key={idx}
                      href={social.url}
                      className="w-12 h-12 rounded-full glassmorphism flex items-center justify-center border border-white/10 hover:border-honey-gold hover:text-honey-gold transition-colors duration-300 pointer-events-auto"
                      title={social.name}
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  );
                } else {
                  return (
                    <a
                      key={idx}
                      href={social.url}
                      className="w-12 h-12 rounded-full glassmorphism flex items-center justify-center border border-white/10 hover:border-honey-gold hover:text-honey-gold transition-colors duration-300 pointer-events-auto"
                      title={social.name}
                    >
                      <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                      </svg>
                    </a>
                  );
                }
              })}
            </div>
          </div>

          {/* Right panel: Minimal Contact Form (7 cols) with 3D Mouse Tilt & Floating motion */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            animate={{ y: [0, -8, 0] }}
            className="lg:col-span-7"
          >
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="glassmorphism p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl relative hover-glow luxury-border-glow glass-reflection cursor-crosshair pointer-events-auto"
            >
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center justify-center text-center py-12 gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-honey-gold/20 flex items-center justify-center border border-honey-gold text-honey-gold animate-bounce">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-wide">REQUEST RECEIVED</h3>
                    <p className="text-soft-cream/70 text-sm max-w-sm leading-relaxed">
                      {responseMsg}
                    </p>
                    <span className="text-xs text-honey-gold/50 tracking-wider animate-pulse mt-4 uppercase">
                      Securely logged to persistent database
                    </span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6 pointer-events-auto">
                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-semibold uppercase tracking-wider text-center"
                      >
                        {responseMsg}
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider text-soft-cream/60 font-medium">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your name"
                          className="bg-white/3 border border-white/10 px-5 py-4 rounded-2xl text-white placeholder-soft-cream/20 text-sm focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all duration-300"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider text-soft-cream/60 font-medium">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                          className="bg-white/3 border border-white/10 px-5 py-4 rounded-2xl text-white placeholder-soft-cream/20 text-sm focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-wider text-soft-cream/60 font-medium">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Inquiry Subject"
                        className="bg-white/3 border border-white/10 px-5 py-4 rounded-2xl text-white placeholder-soft-cream/20 text-sm focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all duration-300"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-wider text-soft-cream/60 font-medium">
                        Your Message
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your culinary interests or inquiries..."
                        className="bg-white/3 border border-white/10 px-5 py-4 rounded-2xl text-white placeholder-soft-cream/20 text-sm focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all duration-300 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-honey-gold to-warm-yellow text-black font-extrabold text-xs tracking-widest uppercase py-4 rounded-2xl shadow-xl shadow-honey-gold/10 hover:scale-[1.01] hover:shadow-honey-gold/25 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'loading' ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                          <span>SUBMIT REQUEST</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Footer and Honey Drip Bottom section */}
      <div className="w-full mt-24 relative select-none">
        
        {/* Organic Flowing Honey Drip Bottom SVG */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 opacity-15 pointer-events-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[80px]">
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86C254.19,69,170.82,44.25,84.4,24.07,55.05,17.2,26.9,8.75,0,0V120H1200V92.83Z"
              fill="#ffb703"
            />
          </svg>
        </div>

        <div className="container mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-soft-cream/40 font-light relative z-10">
          <p>{cmsConfig.globalSettings.copyright}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-honey-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-honey-gold transition-colors">Terms of Service</a>
            {cmsConfig.contactSection.socialLinks.map((link, idx) => (
              <a key={idx} href={link.url} className="hover:text-honey-gold transition-colors">
                {link.name}
              </a>
            ))}
            <Link href="/admin" className="hover:text-honey-gold font-semibold transition-colors">Admin Panel</Link>
          </div>
        </div>
      </div>

    </section>
  );
}
