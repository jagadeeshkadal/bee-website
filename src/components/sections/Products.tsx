'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, RefreshCw, Mail, Lock, User as UserIcon, Phone, MapPin } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface Flavor {
  id: string;
  name: string;
  subName: string;
  color: string;
  gradient: string;
  price: string;
  description: string;
  characteristics: string[];
  rarity: string;
  bgGlow: string;
  stock?: number;
}

const FALLBACK_FLAVORS: Flavor[] = [
  {
    id: 'wild-forest',
    name: 'WILD FOREST',
    subName: 'Deep Amber Nectar',
    color: '#ffb703',
    gradient: 'from-[#ffb703] to-[#e85d04]',
    price: '$45.00',
    description: 'Harvested from oak, pine and wild blackberry blossoms. It offers a robust, dark-spiced profile with a lingering woody finish.',
    characteristics: ['Rich in Minerals', 'Bold & Woody', 'Slow-Crystallizing'],
    rarity: 'Limited Harvest',
    bgGlow: 'rgba(255, 183, 3, 0.15)',
    stock: 24
  },
  {
    id: 'clover-blossom',
    name: 'CLOVER BLOSSOM',
    subName: 'Golden Meadow Sweetness',
    color: '#ffd166',
    gradient: 'from-[#ffd166] to-[#ffb703]',
    price: '$38.00',
    description: 'Delicate, sweet floral notes gathered from white clover fields. It features a bright, buttery mouthfeel with hints of fresh grass and vanilla.',
    characteristics: ['Everyday Luxury', 'Sweet & Creamy', 'Bright Floral Notes'],
    rarity: 'Seasonal Run',
    bgGlow: 'rgba(255, 209, 102, 0.15)',
    stock: 58
  },
  {
    id: 'black-truffle',
    name: 'ROYAL BLACK',
    subName: 'Black Truffle Infusion',
    color: '#b07d08',
    gradient: 'from-[#3a2307] to-[#120a02]',
    price: '$85.00',
    description: 'An elite infusion of raw wild honey with premium Italian black winter truffles. Creates a sophisticated savory-sweet complexity.',
    characteristics: ['Ultra Rare Reserve', 'Savory & Earthy', 'Gourmet Pairing'],
    rarity: 'Reserve Release (100 Jars)',
    bgGlow: 'rgba(176, 125, 8, 0.1)',
    stock: 12
  }
];

interface OrderReceipt {
  orderNumber: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  customerName: string;
}

interface RawProduct {
  id: string;
  name: string;
  subName: string;
  color: string;
  gradient: string;
  price: number;
  description: string;
  characteristics: string[];
  rarity: string;
  bgGlow: string;
  stock?: number;
}

export default function Products() {
  const [flavors, setFlavors] = useState<Flavor[]>(FALLBACK_FLAVORS);
  const [activeFlavor, setActiveFlavor] = useState<Flavor>(FALLBACK_FLAVORS[0]);
  const [isRotating, setIsRotating] = useState(false);

  // Honey Jar 3D Mouse Tilt & Light Reflection State
  const [jarTilt, setJarTilt] = useState({ x: 0, y: 0, shadowX: 0, shadowY: 0, refX: 50, refY: 50 });

  const handleJarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    // Percentages for gradient shift (0% to 100%)
    const pctX = (x / box.width) * 100;
    const pctY = (y / box.height) * 100;

    // Rotations (max 18 degrees for high tactile response)
    const rotX = -((y - box.height / 2) / (box.height / 2)) * 18;
    const rotY = ((x - box.width / 2) / (box.width / 2)) * 18;

    // Shadow offset (moves inverse of tilt)
    const shadX = -((x - box.width / 2) / (box.width / 2)) * 15;
    const shadY = -((y - box.height / 2) / (box.height / 2)) * 15;

    setJarTilt({ x: rotX, y: rotY, shadowX: shadX, shadowY: shadY, refX: pctX, refY: pctY });
  };

  const handleJarMouseLeave = () => {
    setJarTilt({ x: 0, y: 0, shadowX: 0, shadowY: 0, refX: 50, refY: 50 });
  };

  // User Authentication sync
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Auth Form State inside Modal
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authAddress, setAuthAddress] = useState('');

  // checkout/allocation modal state variables
  const [showModal, setShowModal] = useState(false);
  const [qty, setQty] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [orderReceipt, setOrderReceipt] = useState<OrderReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic catalog state
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sync user state on mount
  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem('bee_wild_user_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          // Pre-populate checkout parameters
          setCustomerName(parsed.name || '');
          setCustomerEmail(parsed.email || '');
          setCustomerPhone(parsed.phone || '');
          setShippingAddress(parsed.shippingAddress || '');
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

  // Fetch dynamic catalog from the backend product API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setFetchError(null);
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          // Map backend numbers back into clean currency formats safely
          const mappedProducts = data.products.map((p: RawProduct) => {
            const priceNum = typeof p.price === 'number' ? p.price : parseFloat(p.price as unknown as string);
            const priceStr = isNaN(priceNum) ? '$0.00' : `$${priceNum.toFixed(2)}`;
            return {
              ...p,
              price: priceStr,
              characteristics: Array.isArray(p.characteristics) ? p.characteristics : [],
            };
          });
          setFlavors(mappedProducts);
          setActiveFlavor(mappedProducts[0]);
        } else {
          console.warn('API returned unsuccessful or empty product list, utilizing fallback');
          setFlavors(FALLBACK_FLAVORS);
          setActiveFlavor(FALLBACK_FLAVORS[0]);
        }
      } catch (err) {
        console.error('Dynamic API product fetch failed, utilizing client static fallback:', err);
        setFetchError('Failed to sync with catalog database. Showing local backup.');
        setFlavors(FALLBACK_FLAVORS);
        setActiveFlavor(FALLBACK_FLAVORS[0]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Handle Manual Login inside Modal
  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('bee_wild_user_session', JSON.stringify(data.user));
        window.dispatchEvent(new Event('bee-wild-auth-change'));
        setOrderStatus('idle');
      } else {
        setOrderStatus('error');
        setErrorMsg(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setOrderStatus('error');
      setErrorMsg('Database authentication handshake failed.');
    }
  };

  // Handle Manual Registration inside Modal
  const handleModalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword,
          phone: authPhone,
          shippingAddress: authAddress,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('bee_wild_user_session', JSON.stringify(data.user));
        window.dispatchEvent(new Event('bee-wild-auth-change'));
        setOrderStatus('idle');
      } else {
        setOrderStatus('error');
        setErrorMsg(data.error || 'Registration failed. Please check details.');
      }
    } catch (err) {
      setOrderStatus('error');
      setErrorMsg('Failed to registers profile credentials in SQLite.');
    }
  };

  // Handle Google Login inside Modal
  const handleModalGoogleSignIn = async () => {
    setOrderStatus('loading');
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const payload = {
          name: result.user.displayName || 'Google Forager',
          email: result.user.email || '',
        };

        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success && data.user) {
          localStorage.setItem('bee_wild_user_session', JSON.stringify(data.user));
          window.dispatchEvent(new Event('bee-wild-auth-change'));
          setOrderStatus('idle');
        } else {
          setOrderStatus('error');
          setErrorMsg(data.error || 'Google link auth rejected.');
        }
      }
    } catch (error) {
      setOrderStatus('error');
      setErrorMsg('Google Sign-In failed or cancelled.');
    }
  };

  const handleAcquire = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus('loading');
    setErrorMsg('');
    try {
      // Step 1: Update missing tokens inside SQLite User database if updated during checkout
      const addressChanged = shippingAddress.trim() !== (currentUser.shippingAddress || '').trim();
      const phoneChanged = customerPhone.trim() !== (currentUser.phone || '').trim();

      if (addressChanged || phoneChanged) {
        const profileRes = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            phone: customerPhone,
            shippingAddress: shippingAddress,
          })
        });
        const profileData = await profileRes.json();
        if (profileData.success && profileData.user) {
          localStorage.setItem('bee_wild_user_session', JSON.stringify(profileData.user));
          window.dispatchEvent(new Event('bee-wild-auth-change'));
        }
      }

      // Step 2: Confirm Allocation Receipt
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeFlavor.id,
          productName: activeFlavor.name,
          quantity: qty,
          price: activeFlavor.price,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress
        })
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrderStatus('success');
        setOrderReceipt(data.order);
        
        // Deduct remaining stock dynamically in client-side state
        setFlavors(prev =>
          prev.map(f =>
            f.id === activeFlavor.id
              ? { ...f, stock: Math.max(0, (f.stock || 15) - qty) }
              : f
          )
        );
      } else {
        setOrderStatus('error');
        setErrorMsg(data.error || 'Dynamic reserve transaction refused.');
      }
    } catch (err) {
      console.error(err);
      setOrderStatus('error');
      setErrorMsg('No network connectivity. Please try again.');
    }
  };

  return (
    <section
      className="relative min-h-screen py-24 flex items-center justify-center overflow-hidden"
    >
      {/* Decorative vertical lines */}
      <div className="absolute inset-y-0 left-10 md:left-20 w-px bg-white/3 z-0" />
      <div className="absolute inset-y-0 right-10 md:right-20 w-px bg-white/3 z-0" />

      {/* Dynamic Background Glow based on active flavor */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000 z-0"
        style={{ backgroundColor: activeFlavor.bgGlow }}
      />

      <div className="container mx-auto px-6 relative z-20">
        
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto mb-16 select-none relative animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-honey-gold text-xs font-semibold tracking-[0.3em] uppercase block">
              THE COLLECTION
            </span>
            {loading && (
              <RefreshCw className="w-3.5 h-3.5 text-honey-gold animate-spin" />
            )}
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-none">
            A Sensory <span className="text-honey-gold">Masterpiece</span>
          </h2>
          
          <p className="text-soft-cream/60 mt-4 text-sm md:text-base font-light">
            Indulge in our carefully curated expressions of single-origin honey, designed for the most discerning palates.
          </p>

          {fetchError && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-amber-500/80 text-xs mt-3 font-mono tracking-wider uppercase"
            >
              • {fetchError}
            </motion.p>
          )}
        </div>

        {/* Product interaction container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left / Selector Panel: Lists all flavors (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1 select-none">
            {flavors.map((flavor) => (
              <button
                key={flavor.id}
                onClick={() => setActiveFlavor(flavor)}
                className={`w-full text-left p-6 rounded-3xl border transition-all duration-500 cursor-pointer pointer-events-auto hover-glow luxury-border-glow ${
                  activeFlavor.id === flavor.id
                    ? 'bg-white/6 border-honey-gold/60 shadow-xl shadow-honey-gold/5'
                    : 'bg-black/30 border-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-soft-cream/40 block mb-1">
                      {flavor.rarity} {flavor.stock !== undefined && `• ${flavor.stock} Jars Left`}
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-wide">
                      {flavor.name}
                    </h3>
                    <p className="text-xs text-soft-cream/60 font-light mt-1">
                      {flavor.subName}
                    </p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full bg-linear-to-r ${flavor.gradient}`}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Middle Panel: Interactive 3D Honey Jar Display (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center items-center relative order-1 lg:order-2 py-8">
            <div className="relative w-72 h-96 flex items-center justify-center">
              
              {/* Spinning/pulsating backdrop rings */}
              <div className="absolute inset-0 bg-linear-to-tr from-honey-gold/10 to-transparent rounded-full blur-2xl animate-pulse" />
              <div className="absolute w-64 h-64 border border-white/5 rounded-full animate-[spin_40s_linear_infinite]" />
              <div className="absolute w-52 h-52 border border-honey-gold/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />

              {/* Honey Jar Mockup (High-End Premium Glass Card with 3D Mouse Tilt & Light Reflection Chase) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFlavor.id}
                  initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: isRotating ? 360 : 0 }}
                  exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  onMouseMove={handleJarMouseMove}
                  onMouseLeave={handleJarMouseLeave}
                  style={{
                    transform: `perspective(1000px) rotateX(${jarTilt.x}deg) rotateY(${jarTilt.y}deg)`,
                    boxShadow: `${jarTilt.shadowX}px ${jarTilt.shadowY}px 50px rgba(255, 183, 3, 0.15)`,
                    transition: isRotating ? 'all 0.8s ease' : 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s ease',
                  }}
                  className="w-56 h-80 glassmorphism rounded-[3rem] p-1 flex flex-col justify-between overflow-hidden relative shadow-2xl border border-white/20 select-none group cursor-grab pointer-events-auto"
                >
                  {/* Liquid honey simulation */}
                  <div className={`absolute bottom-0 inset-x-0 h-44 bg-linear-to-t ${activeFlavor.gradient} opacity-20 blur-sm rounded-b-[3rem]`} />
                  
                  {/* Dynamic Light Reflection Layer Chasing Cursor */}
                  <div 
                    className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none rounded-[3rem] transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at ${jarTilt.refX}% ${jarTilt.refY}%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 60%)`
                    }}
                  />
                  
                  {/* Glass highlights */}
                  <div className="absolute top-0 right-4 w-4 h-56 bg-white/5 rounded-full blur-[2px] transform rotate-12 pointer-events-none" />
                  <div className="absolute top-4 left-6 w-2 h-40 bg-white/10 rounded-full blur-[1px] transform -rotate-6 pointer-events-none" />

                  {/* Top lid mockup */}
                  <div className="h-6 w-32 mx-auto bg-neutral-900 border border-white/10 rounded-full mt-2 relative z-10 shadow-lg flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-1 bg-white/10 rounded-full" />
                  </div>

                  {/* Brand Label on Jar */}
                  <div className="relative z-10 mx-6 my-auto bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl text-center shadow-lg pointer-events-none">
                    <span className="text-[9px] tracking-[0.3em] text-honey-gold font-bold block mb-1">
                      BEE WILD
                    </span>
                    <h4 className="text-sm font-extrabold tracking-widest text-white leading-tight">
                      {activeFlavor.name}
                    </h4>
                    <div className="w-8 h-px bg-white/20 mx-auto my-2" />
                    <span className="text-[10px] text-soft-cream/60 tracking-wider">
                      RAW SINGLE-ORIGIN
                    </span>
                  </div>

                  {/* Bottom details */}
                  <div className="relative z-10 text-center pb-6 pointer-events-none">
                    <span className="text-white font-extrabold text-lg tracking-wider">
                      {activeFlavor.price}
                    </span>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-soft-cream/50 mt-1">
                      350g Net Wt.
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Interactive Rotation trigger button */}
              <button
                onClick={() => {
                  setIsRotating(true);
                  setTimeout(() => setIsRotating(false), 800);
                }}
                className="absolute bottom-[-16px] glassmorphism p-3 rounded-full text-soft-cream hover:text-honey-gold border border-white/10 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto z-20"
                title="Rotate Jar"
              >
                <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
              </button>

            </div>
          </div>


          {/* Right Panel: Flavor details & Description (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center order-3 animate-fade-in">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFlavor.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <span className="text-honey-gold text-xs font-semibold tracking-widest uppercase block mb-1">
                    FLAVOR DETAILS
                  </span>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight leading-none mb-4">
                    {activeFlavor.name}
                  </h3>
                  <p className="text-soft-cream/70 text-sm leading-relaxed font-light">
                    {activeFlavor.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">
                    Characteristics:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeFlavor.characteristics.map((char, i) => (
                      <span
                        key={i}
                        className="text-[10px] uppercase font-semibold tracking-wider text-soft-cream/90 bg-white/4 border border-white/10 px-3 py-1.5 rounded-full"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-white/10" />

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setQty(1);
                      if (currentUser) {
                        setCustomerName(currentUser.name || '');
                        setCustomerEmail(currentUser.email || '');
                        setCustomerPhone(currentUser.phone || '');
                        setShippingAddress(currentUser.shippingAddress || '');
                      } else {
                        setAuthEmail('');
                        setAuthPassword('');
                        setAuthName('');
                        setAuthPhone('');
                        setAuthAddress('');
                      }
                      setOrderStatus('idle');
                      setOrderReceipt(null);
                      setErrorMsg('');
                      setShowModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-honey-gold to-warm-yellow text-black font-extrabold text-xs tracking-widest uppercase py-4 rounded-2xl shadow-xl shadow-honey-gold/10 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer pointer-events-auto"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    ACQUIRE JAR
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Allocation / Checkout Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glassmorphism w-full max-w-lg border border-white/20 p-8 rounded-[2.5rem] relative shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-soft-cream/40 hover:text-white transition-colors text-lg cursor-pointer p-2 z-10"
              >
                ✕
              </button>

              {!currentUser ? (
                /* IN-MODAL LOGIN / REGISTRATION CHECKOUT PRE-REQUISITE */
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="text-center select-none">
                    <span className="text-[10px] tracking-[0.2em] text-honey-gold font-bold uppercase block mb-1">
                      Authentication Required
                    </span>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">
                      Log In to Secure Allocation
                    </h3>
                    <p className="text-xs text-soft-cream/60 font-light mt-1 max-w-sm mx-auto leading-relaxed">
                      To complete batch reservations and track your cellars collection, please establish a secure profile session below.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold uppercase tracking-wider text-center animate-bounce">
                      {errorMsg}
                    </div>
                  )}

                  {/* Tabs Selector */}
                  <div className="flex justify-center border-b border-white/10 select-none">
                    <div className="flex gap-8">
                      <button
                        onClick={() => { setAuthMode('login'); setErrorMsg(''); setOrderStatus('idle'); }}
                        className={`pb-2.5 text-xs font-bold uppercase tracking-widest relative transition-colors duration-300 cursor-pointer ${
                          authMode === 'login' ? 'text-honey-gold' : 'text-soft-cream/40 hover:text-white'
                        }`}
                      >
                        Login
                        {authMode === 'login' && (
                          <motion.span layoutId="checkout-tab-line" className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-honey-gold" />
                        )}
                      </button>
                      <button
                        onClick={() => { setAuthMode('register'); setErrorMsg(''); setOrderStatus('idle'); }}
                        className={`pb-2.5 text-xs font-bold uppercase tracking-widest relative transition-colors duration-300 cursor-pointer ${
                          authMode === 'register' ? 'text-honey-gold' : 'text-soft-cream/40 hover:text-white'
                        }`}
                      >
                        Register
                        {authMode === 'register' && (
                          <motion.span layoutId="checkout-tab-line" className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-honey-gold" />
                        )}
                      </button>
                    </div>
                  </div>

                  {authMode === 'login' ? (
                    /* Manual Login inside Modal */
                    <form onSubmit={handleModalLogin} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5 select-none">
                          <Mail className="w-3.5 h-3.5 text-soft-cream/30" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5 select-none">
                          <Lock className="w-3.5 h-3.5 text-soft-cream/30" />
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Enter password"
                          className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={orderStatus === 'loading'}
                        className="w-full flex items-center justify-center gap-2 bg-honey-gold text-black font-extrabold text-xs tracking-widest uppercase py-4 rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all cursor-pointer font-bold mt-2"
                      >
                        {orderStatus === 'loading' ? (
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Access Account & Order</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Manual Registration inside Modal */
                    <form onSubmit={handleModalRegister} className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-soft-cream/30" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Your name"
                            className="bg-white/3 border border-white/10 px-4 py-2.5 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-soft-cream/30" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="Your email"
                            className="bg-white/3 border border-white/10 px-4 py-2.5 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-soft-cream/30" />
                            Password
                          </label>
                          <input
                            type="password"
                            required
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="Create password"
                            className="bg-white/3 border border-white/10 px-4 py-2.5 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-soft-cream/30" />
                            Phone Number
                          </label>
                          <input
                            type="text"
                            required
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="Enter phone"
                            className="bg-white/3 border border-white/10 px-4 py-2.5 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-soft-cream/30" />
                          Delivery Shipping Address
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={authAddress}
                          onChange={(e) => setAuthAddress(e.target.value)}
                          placeholder="Enter physical address"
                          className="bg-white/3 border border-white/10 px-4 py-2.5 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors resize-none font-light"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={orderStatus === 'loading'}
                        className="w-full flex items-center justify-center gap-2 bg-honey-gold text-black font-extrabold text-xs tracking-widest uppercase py-3.5 rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all cursor-pointer font-bold mt-2"
                      >
                        {orderStatus === 'loading' ? (
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Register & Continue Checkout</span>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Sign In with Google option inside Checkout Modal */}
                  <div className="flex flex-col gap-3.5 border-t border-white/10 pt-4 mt-1 select-none">
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-white/5"></div>
                      <span className="flex-shrink mx-4 text-[8px] text-soft-cream/30 uppercase tracking-[0.25em] font-semibold">Or Connect Instantly</span>
                      <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleModalGoogleSignIn}
                      className="w-full bg-white hover:bg-neutral-100 text-black py-3.5 px-5 rounded-xl flex items-center justify-center gap-2.5 font-extrabold text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer shadow-lg active:scale-98"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.137 4.2-3.418 0-6.19-2.772-6.19-6.19 0-3.417 2.772-6.19 6.19-6.19 1.483 0 2.825.525 3.878 1.4l2.964-2.964C18.8 2.135 15.7 1 12.24 1A9.99 9.99 0 0 0 2.25 11c0 5.523 4.477 10 9.99 10 5.76 0 9.805-4.05 9.805-9.99 0-.61-.06-1.22-.165-1.725H12.24z"
                        />
                      </svg>
                      <span>Sign In with Google</span>
                    </button>
                  </div>
                </div>
              ) : orderStatus === 'success' ? (
                // Success state: detailed gold receipt
                <div className="text-center py-6 flex flex-col items-center gap-4 animate-fade-in relative z-10">
                  <div className="w-16 h-16 rounded-full bg-honey-gold/20 flex items-center justify-center border border-honey-gold text-honey-gold animate-bounce mb-2">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-widest uppercase">ALLOCATION CONfirmed</h3>
                  <span className="text-xs font-mono px-3 py-1 bg-honey-gold/10 border border-honey-gold/30 text-honey-gold rounded-full">
                    {orderReceipt?.orderNumber}
                  </span>
                  
                  <div className="w-full bg-white/2 border border-white/5 p-5 rounded-2xl text-left flex flex-col gap-2 mt-4 text-sm font-light">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-soft-cream/40">Product:</span>
                      <span className="text-white font-semibold">{orderReceipt?.productName}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-soft-cream/40">Quantity:</span>
                      <span className="text-white font-semibold">{orderReceipt?.quantity} Jars</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-soft-cream/40">Total Value:</span>
                      <span className="text-honey-gold font-extrabold">${orderReceipt?.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-soft-cream/40">Recipient:</span>
                      <span className="text-white truncate max-w-[200px]">{orderReceipt?.customerName}</span>
                    </div>
                  </div>

                  <p className="text-soft-cream/60 text-xs mt-4 leading-relaxed font-light">
                    A secure cryptographic invoice has been registered in the database. Thank you for preserving the wild legacy.
                  </p>
                  
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full mt-6 bg-linear-to-r from-honey-gold to-warm-yellow text-black font-extrabold text-xs tracking-widest uppercase py-4 rounded-xl cursor-pointer"
                  >
                    RETURN TO COLLECTION
                  </button>
                </div>
              ) : (
                /* AUTHENTICATED CHECKOUT FORM (Prefills database fields & prompts if missing!) */
                <form onSubmit={handleAcquire} className="flex flex-col gap-5 relative z-10 animate-fade-in">
                  <div>
                    <span className="text-[10px] tracking-[0.25em] text-honey-gold font-bold uppercase block mb-1">
                      EXCLUSIVE ALLOCATION
                    </span>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">
                      Acquire {activeFlavor.name}
                    </h3>
                    <p className="text-xs text-soft-cream/60 font-light mt-1">
                      Reserve Single-Origin wild nectar from our single-batch cellar.
                    </p>
                  </div>

                  {orderStatus === 'error' && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold text-center uppercase tracking-wide">
                      {errorMsg}
                    </div>
                  )}

                  {/* Quantity and Price Preview */}
                  <div className="flex justify-between items-center bg-white/3 border border-white/10 p-4 rounded-2xl">
                    <div className="flex flex-col gap-1 select-none">
                      <span className="text-[9px] uppercase tracking-widest text-soft-cream/40">Select Qty</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 text-white flex items-center justify-center font-bold text-lg cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-white font-extrabold text-lg">{qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(q => Math.min(5, q + 1))}
                          className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 text-white flex items-center justify-center font-bold text-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right select-none">
                      <span className="text-[9px] uppercase tracking-widest text-soft-cream/40 block mb-1">Total Pricing</span>
                      <span className="text-xl font-extrabold text-honey-gold">
                        ${(parseFloat(activeFlavor.price.replace('$', '')) * qty).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Form inputs prefilled from database */}
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-wider text-soft-cream/60">Recipient Full Name</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your full name"
                          className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-wider text-soft-cream/60">Email Address (Registry)</label>
                        <input
                          type="email"
                          required
                          readOnly
                          value={customerEmail}
                          className="bg-white/1 border border-white/5 px-4 py-3 rounded-xl text-soft-cream/40 text-xs focus:outline-none cursor-not-allowed select-none font-light"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-soft-cream/60">
                        Phone Number {(!currentUser.phone) && <span className="text-honey-gold text-[9px] font-bold tracking-normal uppercase ml-1.5">(Required Token - Missing from Google profile)</span>}
                      </label>
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Enter physical phone number"
                        className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-soft-cream/60">
                        Physical Shipping Address {(!currentUser.shippingAddress) && <span className="text-honey-gold text-[9px] font-bold tracking-normal uppercase ml-1.5">(Required Token - Missing from Google profile)</span>}
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter full physical address for secure delivery"
                        className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors resize-none font-light"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={orderStatus === 'loading'}
                    className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-honey-gold to-warm-yellow text-black font-extrabold text-xs tracking-widest uppercase py-4 rounded-2xl shadow-xl shadow-honey-gold/10 hover:scale-[1.01] active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  >
                    {orderStatus === 'loading' ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>CONFIRM SECURE ALLOCATION</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
