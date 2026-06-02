'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Sparkles, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // If the user is already logged in, redirect them to the home page.
  // Guard against Next.js dev/HMR edge-cases by waiting for first mount.
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!mounted) return;
      if (user) {
        // schedule navigation so it doesn't run during the initial router setup
        setTimeout(() => router.push('/'), 0);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [router]);


  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const payload = {
          name: result.user.displayName || 'Google Forager',
          email: result.user.email || '',
        };

        // Fetch / sync profile with Neon database
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success && data.user) {
          localStorage.setItem('bee_wild_user_session', JSON.stringify(data.user));
          window.dispatchEvent(new Event('bee-wild-auth-change'));
          
          const email = (result.user.email || '').toLowerCase().trim();
          if (email === 'jagadeeshkadali69@gmail.com' || email === 'jagadeeshkadali69@gmail.come') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else {
          setErrorMsg(data.error || 'Google database profile synchronization failed.');
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code === 'auth/popup-blocked') {
        setErrorMsg('The sign-in popup was blocked by your browser. Please allow popups.');
      } else if (error.code === 'auth/closed-by-user') {
        setErrorMsg('Sign-in cancelled. Please try again.');
      } else {
        setErrorMsg('Authentication failed. Unable to establish secure Google handshake.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden select-none">
      
      {/* Immersive Dark-Theme Ambient Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-honey-gold/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[70vw] h-[70vw] rounded-full bg-amber-600/5 blur-[180px] pointer-events-none" />

      {/* Subtle floating background honeycombs or light effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,183,3,0.02),transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        
        {/* Back to Sanctuary home */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-soft-cream/40 hover:text-honey-gold transition-colors duration-300 mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Sanctuary
        </Link>

        {/* Premium Glassmorphic Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="relative glassmorphism border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl overflow-hidden"
        >
          {/* Internal ambient corner light */}
          <div className="absolute top-[-50px] right-[-50px] w-36 h-36 bg-honey-gold/15 rounded-full blur-2xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div className="w-14 h-14 bg-linear-to-br from-honey-gold/10 to-amber-600/10 border border-honey-gold/30 rounded-2xl flex items-center justify-center text-honey-gold shadow-lg shadow-honey-gold/5 animate-pulse">
              <Sparkles className="w-7 h-7" />
            </div>
            
            <div>
              <h1 className="text-2xl font-black text-white tracking-[0.25em]">
                BEE<span className="text-honey-gold">WILD</span>
              </h1>
              <p className="text-[10px] text-soft-cream/40 font-mono tracking-[0.3em] uppercase mt-1">
                Security Gateway
              </p>
            </div>
          </div>

          {/* Error Notification */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[11px] font-semibold tracking-wider uppercase text-center leading-normal"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Login Card Core Content */}
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-lg font-extrabold text-white tracking-wide">
                Welcome Back, Forager
              </h2>
              <p className="text-xs text-soft-cream/60 font-light mt-1.5 leading-relaxed">
                Unlock exclusive access to your luxury nectar collections, dynamic order reservations, and premium membership tiers.
              </p>
            </div>

            {/* Google Sign-In Luxury Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="relative w-full group overflow-hidden bg-white hover:bg-neutral-100 text-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-extrabold text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer shadow-lg shadow-white/5 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {/* Colorful Authentic Google Icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.137 4.2-3.418 0-6.19-2.772-6.19-6.19 0-3.417 2.772-6.19 6.19-6.19 1.483 0 2.825.525 3.878 1.4l2.964-2.964C18.8 2.135 15.7 1 12.24 1A9.99 9.99 0 0 0 2.25 11c0 5.523 4.477 10 9.99 10 5.76 0 9.805-4.05 9.805-9.99 0-.61-.06-1.22-.165-1.725H12.24z"
                    />
                  </svg>
                  <span>Sign In with Google</span>
                </>
              )}
            </button>

            {/* Trust and encryption badge */}
            <div className="flex items-center justify-center gap-2 border-t border-white/5 pt-6 text-[10px] text-soft-cream/30 uppercase tracking-widest font-semibold select-none">
              <Shield className="w-3.5 h-3.5 text-soft-cream/20" />
              <span>Firebase 256-bit Auth Handshake</span>
            </div>
          </div>
        </motion.div>
        
        {/* Footer */}
        <p className="text-center text-[9px] text-soft-cream/20 uppercase tracking-[0.2em] mt-8">
          &copy; 2026 BEE WILD. All rights reserved.
        </p>

      </div>
    </main>
  );
}
