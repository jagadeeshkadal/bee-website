'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User as UserIcon } from 'lucide-react';
import UserPortalModal from '../modals/UserPortalModal';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { cmsConfig } from '@/lib/cmsConfig';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
  registeredAt?: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState('hero');

  // Intersection Observer to track active section scroll positions
  useEffect(() => {
    const sections = ['hero', 'origin', 'flavors', 'process', 'testimonials', 'contact'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px', // Trigger precisely when section occupies central viewport
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Synchronize with SQLite Auth session state on mount
  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem('bee_wild_user_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser({
            name: parsed.name || 'Forager',
            email: parsed.email || '',
            phone: parsed.phone || '',
            shippingAddress: parsed.shippingAddress || '',
            registeredAt: parsed.registeredAt || new Date().toISOString()
          });
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    syncUser();
    window.addEventListener('bee-wild-auth-change', syncUser);
    return () => window.removeEventListener('bee-wild-auth-change', syncUser);
  }, []);

  const handleAuthChange = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('bee_wild_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('bee_wild_user_session');
    }
    window.dispatchEvent(new Event('bee-wild-auth-change'));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 flex justify-between items-center transition-all duration-300 pointer-events-auto ${
        isScrolled
          ? 'bg-black/60 backdrop-blur-md border-b border-white/5 py-3 shadow-lg shadow-black/10'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-honey-gold animate-pulse" />
        <span className="font-extrabold text-xl tracking-[0.25em] text-white">
          BEE<span className="text-honey-gold">WILD</span>
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-2 glassmorphism px-3 py-2 rounded-full relative">
        {cmsConfig.globalSettings.navItems.map((item) => {
          const sectionId = item.href.replace('#', '');
          const isActive = activeSection === sectionId;

          return (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(sectionId);
                if (target) {
                  // Dispatch event to trigger the section's premium dynamic load state
                  window.dispatchEvent(
                    new CustomEvent('trigger-section-load', { detail: { id: sectionId } })
                  );
                  
                  // Programmatically smooth scroll via Lenis
                  const lenis = (window as unknown as { lenis?: { scrollTo: (el: HTMLElement, options?: { offset: number; duration: number }) => void } }).lenis;
                  if (lenis) {
                    lenis.scrollTo(target, {
                      offset: 0,
                      duration: 1.4,
                    });
                  } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className={`text-xs font-semibold tracking-widest px-4 py-2.5 rounded-full relative transition-colors duration-500 pointer-events-auto select-none uppercase ${
                isActive ? 'text-black' : 'text-soft-cream/75 hover:text-honey-gold'
              }`}
            >
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className="absolute inset-0 bg-linear-to-r from-honey-gold to-warm-yellow rounded-full -z-0"
                />
              )}
            </a>
          );
        })}
      </nav>


      <div className="flex items-center gap-4">
        {/* Admin Dashboard Quick Link */}
        {currentUser && (currentUser.email === 'jagadeeshkadali69@gmail.com' || currentUser.email === 'jagadeeshkadali69@gmail.come') && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-4 py-2 border border-red-500/30 hover:border-red-500/80 hover:bg-red-500/5 text-red-400 hover:text-white rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer pointer-events-auto"
          >
            Admin Panel
          </Link>
        )}

        {/* Dynamic User Profile Dashboard Trigger */}
        {currentUser ? (
          <button
            onClick={() => setIsPortalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-honey-gold/10 hover:bg-honey-gold/20 border border-honey-gold/30 hover:border-honey-gold text-honey-gold hover:text-white rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer pointer-events-auto shadow-lg shadow-honey-gold/5"
            title="Open Forager Profile"
          >
            <div className="w-4 h-4 rounded-full bg-honey-gold text-black flex items-center justify-center font-black text-[9px] select-none">
              {currentUser.name[0].toUpperCase()}
            </div>
            <span className="truncate max-w-[80px] font-semibold">{currentUser.name.split(' ')[0]}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsPortalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-honey-gold/30 hover:border-honey-gold/80 hover:bg-honey-gold/5 text-honey-gold hover:text-white rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer pointer-events-auto"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        <a
          href="#flavors"
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById('flavors');
            if (target) {
              window.dispatchEvent(
                new CustomEvent('trigger-section-load', { detail: { id: 'flavors' } })
              );
              const lenis = (window as unknown as { lenis?: { scrollTo: (el: HTMLElement, options?: { offset: number; duration: number }) => void } }).lenis;
              if (lenis) {
                lenis.scrollTo(target, {
                  offset: 0,
                  duration: 1.4,
                });
              } else {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xs font-semibold uppercase tracking-widest text-white rounded-full group bg-linear-to-br from-honey-gold to-warm-yellow hover:text-black focus:ring-4 focus:outline-none focus:ring-honey-gold/50 pointer-events-auto"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-black rounded-full group-hover:bg-opacity-0">
            EXPLORE FLAVORS
          </span>
        </a>
      </div>

      {/* Luxury User Profile Dashboard Overlay Modal */}
      <UserPortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        currentUser={currentUser}
        onAuthChange={handleAuthChange}
      />
    </motion.header>
  );
}
