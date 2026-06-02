'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SmoothScroll from '@/components/layout/SmoothScroll';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import DynamicSection from '@/components/ui/DynamicSection';
import Story from '@/components/sections/Story';
import Products from '@/components/sections/Products';
import Process from '@/components/sections/Process';
import Testimonials from '@/components/sections/Testimonials';
import Contact from '@/components/sections/Contact';
import BackToTop from '@/components/layout/BackToTop';

// Dynamically import Three.js components to prevent SSR errors and optimize loading
const BeeScene = dynamic(() => import('@/components/three/BeeScene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-honey-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-honey-gold text-xs font-bold tracking-[0.3em] uppercase animate-pulse">
          HARVESTING EXPERIENCE...
        </span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sync with SQLite Auth session state on mount
  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem('bee_wild_user_session');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    syncUser();

    // Listen to unified custom auth change events
    window.addEventListener('bee-wild-auth-change', syncUser);
    return () => window.removeEventListener('bee-wild-auth-change', syncUser);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50 select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-honey-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-honey-gold text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
            RETRIEVING CANOPY SIGNALS...
          </span>
        </div>
      </div>
    );
  }

  return (
    <main className="relative bg-black min-h-screen w-full">
      {/* Immersive 3D Interactive Bee Canvas - Always Rendered & Active */}
      <BeeScene isAuthenticated={!!currentUser} />

      <div className="relative bg-black min-h-screen">
        {/* Global premium navigation bar placed static/fixed */}
        <Navbar />

        {/* Smooth scroll scrollytelling container */}
        <SmoothScroll>
          <div id="scrollytelling-container" className="relative z-20">
            
            <Hero />
            
            <DynamicSection id="origin" loadingText="SYNCHRONIZING CANOPY DATA...">
              <Story />
            </DynamicSection>
            
            <DynamicSection id="flavors" loadingText="RETRIEVING BATCH CHARACTERISTICS...">
              <Products />
            </DynamicSection>
            
            <DynamicSection id="process" loadingText="COMPILING MOLECULAR STEPS...">
              <Process />
            </DynamicSection>
            
            <DynamicSection id="testimonials" loadingText="RETRIEVING ENCRYPTED TESTIMONIALS...">
              <Testimonials />
            </DynamicSection>
            
            <DynamicSection id="contact" loadingText="ESTABLISHING SECURE GATEWAY...">
              <Contact />
            </DynamicSection>
          </div>
        </SmoothScroll>

        {/* Floating Back to Top Button */}
        <BackToTop />
      </div>
    </main>
  );
}
