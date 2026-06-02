'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, Mail, Lock, MapPin, Award, ShoppingBag, LogOut, Calendar, CheckCircle2, Phone, Shield } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { cmsConfig } from '@/lib/cmsConfig';
import Link from 'next/link';

interface Order {
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  timestamp: string;
  status: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
  registeredAt?: string;
}

interface UserPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthChange: (user: UserProfile | null) => void;
}

export default function UserPortalModal({ isOpen, onClose, currentUser, onAuthChange }: UserPortalModalProps) {
  // Tabs: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Status & Telemetry
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Sync inputs when user changes
  useEffect(() => {
    if (currentUser) {
      setEditAddress(currentUser.shippingAddress || '');
      setEditPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Fetch orders when a user is logged in
  const fetchUserOrders = async (email: string) => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && isOpen) {
      fetchUserOrders(currentUser.email);
    }
  }, [currentUser, isOpen]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setStatus('success');
        onAuthChange(data.user);
        setLoginEmail('');
        setLoginPassword('');
        setTimeout(() => {
          setStatus('idle');
          onClose();
        }, 1200);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Network error. Unable to establish secure gateway.');
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          shippingAddress: regAddress,
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setStatus('success');
        onAuthChange(data.user);
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegPhone('');
        setRegAddress('');
        setTimeout(() => {
          setStatus('idle');
          onClose();
        }, 1200);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to register account.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Network error. Failed to dispatch credentials.');
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setStatus('loading');
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
          setStatus('success');
          onAuthChange(data.user);
          setTimeout(() => {
            setStatus('idle');
            onClose();
          }, 1200);
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Failed to link Google account.');
        }
      }
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      setStatus('error');
      setErrorMsg('Google Sign-In failed or was cancelled.');
    }
  };

  // Update Profile Details in SQLite
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setStatus('loading');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          phone: editPhone,
          shippingAddress: editAddress,
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        onAuthChange(data.user);
        setIsEditingProfile(false);
        setStatus('success');
        setSuccessMsg('Profile updated in database!');
        setTimeout(() => {
          setStatus('idle');
          setSuccessMsg('');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Failed to update address.');
    }
  };

  // Calculate Loyalty details using dynamic config
  const totalJars = orders.reduce((sum, o) => sum + o.quantity, 0);
  
  // Find highest tier matched based on jars needed
  const matchedRank = [...cmsConfig.userPortalSettings.ranks]
    .sort((a, b) => b.jarsNeeded - a.jarsNeeded)
    .find(r => totalJars >= r.jarsNeeded) || cmsConfig.userPortalSettings.ranks[0];

  const loyaltyBadge = { 
    name: matchedRank.rankName, 
    color: matchedRank.badgeColor,
    glow: matchedRank.badgeGlow
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto"
        >
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="glassmorphism w-full max-w-2xl border border-white/20 p-6 md:p-8 rounded-[2.5rem] relative shadow-2xl overflow-hidden z-10 animate-fade-in"
          >
            {/* Ambient Gold Glows */}
            <div className="absolute top-[-80px] right-[-80px] w-[250px] h-[250px] bg-honey-gold/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-80px] left-[-80px] w-[250px] h-[250px] bg-honey-gold/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-soft-cream/40 hover:text-white transition-colors cursor-pointer p-2 z-10"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>

            {currentUser ? (
              /* LOGGED IN USER PROFILE DASHBOARD */
              <div className="flex flex-col gap-6 relative z-10">
                {/* Profile Header Block */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-4">
                    {/* Golden avatar */}
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-honey-gold to-warm-yellow flex items-center justify-center border border-honey-gold/30 text-black font-extrabold text-2xl tracking-wide select-none">
                      {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-wide leading-tight">
                        {currentUser.name}
                      </h2>
                      <span className="text-[11px] text-soft-cream/50 font-mono flex items-center gap-1.5 mt-1 select-none">
                        <Mail className="w-3.5 h-3.5 text-soft-cream/30" />
                        {currentUser.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <span 
                      style={{ boxShadow: `0 0 20px ${loyaltyBadge.glow}` }}
                      className={`text-[10px] tracking-widest font-extrabold px-3.5 py-1.5 border rounded-full uppercase ${loyaltyBadge.color} flex items-center gap-1.5 select-none`}
                    >
                      <Award className="w-3.5 h-3.5 animate-pulse" />
                      {loyaltyBadge.name}
                    </span>
                  </div>
                </div>

                {/* Notifications */}
                {successMsg && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{successMsg}</span>
                  </div>
                )}
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold uppercase tracking-wider text-center animate-bounce">
                    {errorMsg}
                  </div>
                )}

                {/* Grid Split Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Side: Profile Details & Address updates (5 cols) */}
                  <div className="md:col-span-5 flex flex-col gap-5">
                    
                    <div className="bg-white/3 border border-white/5 p-4 rounded-3xl flex flex-col gap-3">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-soft-cream/40 flex items-center gap-1 select-none">
                        <MapPin className="w-3 h-3 text-soft-cream/30" />
                        Contact & Delivery Details
                      </span>
                      
                      {!isEditingProfile ? (
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest text-soft-cream/30 block">Phone</span>
                            <span className="text-xs text-white leading-relaxed font-mono">
                              {currentUser.phone || 'No phone configured.'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase tracking-widest text-soft-cream/30 block">Shipping Address</span>
                            <p className="text-xs text-white leading-relaxed font-mono">
                              {currentUser.shippingAddress || 'No shipping address configured.'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setEditAddress(currentUser.shippingAddress);
                              setEditPhone(currentUser.phone);
                              setIsEditingProfile(true);
                            }}
                            className="mt-2 text-[10px] tracking-wider uppercase font-bold text-honey-gold hover:text-white transition-colors cursor-pointer text-left"
                          >
                            Update Info
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-3 mt-1">
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] uppercase tracking-wider text-soft-cream/40">Phone Number</label>
                            <input
                              type="text"
                              required
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 p-2.5 rounded-lg text-white text-xs placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold transition-colors font-mono"
                              placeholder="Enter phone number"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] uppercase tracking-wider text-soft-cream/40">Shipping Address</label>
                            <textarea
                              required
                              rows={2}
                              value={editAddress}
                              onChange={(e) => setEditAddress(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 p-2.5 rounded-lg text-white text-xs placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold transition-colors resize-none font-mono"
                              placeholder="Enter shipping address"
                            />
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(false);
                              }}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] uppercase tracking-wider font-bold text-white transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={status === 'loading'}
                              className="px-3 py-1.5 bg-linear-to-r from-honey-gold to-warm-yellow rounded-lg text-[9px] uppercase tracking-wider font-extrabold text-black hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    <div className="bg-white/3 border border-white/5 p-4 rounded-3xl flex justify-between items-center text-xs font-light select-none">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-soft-cream/40">Total allocations</span>
                        <span className="text-white font-extrabold mt-1 text-sm">{orders.length} Jar reservation{orders.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-soft-cream/40">Loyalty level</span>
                        <span className="text-honey-gold font-extrabold mt-1 uppercase tracking-wider text-[10px]">{totalJars} Jar{totalJars !== 1 ? 's' : ''} Collected</span>
                      </div>
                    </div>

                    {/* Dynamic Loyalty Benefits Display Card */}
                    <div className="bg-white/3 border border-white/5 p-4 rounded-3xl flex flex-col gap-2.5 shadow-lg select-none">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-honey-gold block font-mono">
                        Active Loyalty Benefits
                      </span>
                      <ul className="text-[10px] text-soft-cream/70 font-light list-disc pl-4 flex flex-col gap-2 leading-relaxed">
                        {matchedRank.benefits.map((benefit, i) => (
                          <li key={i}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    {(currentUser.email === 'jagadeeshkadali69@gmail.com' || currentUser.email === 'jagadeeshkadali69@gmail.come') && (
                      <Link
                        href="/admin"
                        onClick={() => onClose()}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-honey-gold/35 bg-honey-gold/5 hover:bg-honey-gold/15 text-honey-gold hover:text-white rounded-2xl transition-all duration-300 cursor-pointer font-bold text-xs tracking-wider uppercase mt-1 mb-2 text-center"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        onAuthChange(null);
                        onClose();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-2xl transition-all duration-300 cursor-pointer font-bold text-xs tracking-wider uppercase mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout Account</span>
                    </button>
                  </div>

                  {/* Right Side: Order History Allocations (7 cols) */}
                  <div className="md:col-span-7 flex flex-col gap-4">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-soft-cream/40 flex items-center gap-1.5 select-none">
                      <ShoppingBag className="w-3.5 h-3.5 text-soft-cream/30" />
                      Active Allocation Ledger
                    </span>

                    <div className="max-h-[340px] overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar">
                      {ordersLoading ? (
                        <div className="py-12 flex flex-col items-center gap-3 text-center">
                          <div className="w-8 h-8 border-3 border-honey-gold border-t-transparent rounded-full animate-spin" />
                          <span className="text-soft-cream/40 text-[10px] tracking-wider uppercase animate-pulse">Syncing reservations...</span>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="py-10 text-center text-soft-cream/40 bg-white/2 border border-white/5 rounded-3xl flex flex-col items-center gap-2 select-none">
                          <ShoppingBag className="w-8 h-8 text-soft-cream/10" />
                          <div>
                            <h5 className="text-white font-bold text-xs uppercase tracking-wide">No Active Reservations</h5>
                            <p className="text-[10px] text-soft-cream/40 max-w-[200px] mx-auto mt-1 leading-normal font-light">
                              Acquire raw nectar flavors from the collection to log your first luxury jar.
                            </p>
                          </div>
                        </div>
                      ) : (
                        orders.map((o) => (
                          <div
                            key={o.orderNumber}
                            className="bg-white/3 border border-white/5 p-4 rounded-2xl hover:border-honey-gold/20 transition-all duration-300 flex flex-col gap-2"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-honey-gold text-[10px] font-bold">{o.orderNumber}</span>
                                  {o.status === 'Approved' || o.status === 'Confirmed' ? (
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-md">
                                      {o.status}
                                    </span>
                                  ) : (
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/10 rounded-md animate-pulse">
                                      {o.status}
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-white font-extrabold mt-1 text-sm">{o.productName}</h5>
                                {o.customerPhone && (
                                  <span className="text-[9px] text-soft-cream/50 block font-mono">Phone: {o.customerPhone}</span>
                                )}
                                <p className="text-[9px] text-soft-cream/40 flex items-center gap-1 mt-0.5 font-light">
                                  <Calendar className="w-3.5 h-3.5 text-soft-cream/30" />
                                  {new Date(o.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-soft-cream/50 block font-light">{o.quantity} Jar{o.quantity > 1 ? 's' : ''}</span>
                                <span className="text-sm font-black text-honey-gold tracking-tight block mt-0.5">${o.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* AUTHENTICATION TABS (LOGIN / REGISTER) */
              <div className="relative z-10 flex flex-col gap-6">
                
                {/* Tab select header */}
                <div className="flex justify-center border-b border-white/10 select-none">
                  <div className="flex gap-8">
                    <button
                      onClick={() => {
                        setActiveTab('login');
                        setErrorMsg('');
                        setStatus('idle');
                      }}
                      className={`pb-3 text-sm font-bold uppercase tracking-widest relative transition-colors duration-300 cursor-pointer ${
                        activeTab === 'login' ? 'text-honey-gold' : 'text-soft-cream/40 hover:text-white'
                      }`}
                    >
                      Login
                      {activeTab === 'login' && (
                        <motion.span
                          layoutId="auth-tab-line"
                          className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-honey-gold"
                        />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('register');
                        setErrorMsg('');
                        setStatus('idle');
                      }}
                      className={`pb-3 text-sm font-bold uppercase tracking-widest relative transition-colors duration-300 cursor-pointer ${
                        activeTab === 'register' ? 'text-honey-gold' : 'text-soft-cream/40 hover:text-white'
                      }`}
                    >
                      Register
                      {activeTab === 'register' && (
                        <motion.span
                          layoutId="auth-tab-line"
                          className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-honey-gold"
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                {errorMsg && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold uppercase tracking-wider text-center animate-bounce">
                    {errorMsg}
                  </div>
                )}
                {status === 'success' && (
                  <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-xs font-semibold uppercase tracking-wider text-center">
                    Authentication verified! Syncing Forager profile...
                  </div>
                )}

                {activeTab === 'login' ? (
                  /* LOGIN SCREEN */
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5 select-none">
                        <Mail className="w-3.5 h-3.5 text-soft-cream/40" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5 select-none">
                        <Lock className="w-3.5 h-3.5 text-soft-cream/40" />
                        Secure Password
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading' || status === 'success'}
                      className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-honey-gold to-warm-yellow text-black font-extrabold text-xs tracking-widest uppercase py-4 rounded-2xl shadow-xl shadow-honey-gold/10 hover:scale-[1.01] active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3 font-bold"
                    >
                      {status === 'loading' ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Access Secure Portal</span>
                      )}
                    </button>
                  </form>
                ) : (
                  /* REGISTRATION SCREEN */
                  <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5 select-none">
                          <UserIcon className="w-3.5 h-3.5 text-soft-cream/40" />
                          Forager Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Enter your name"
                          className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5 select-none">
                          <Mail className="w-3.5 h-3.5 text-soft-cream/40" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="Enter email address"
                          className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5 select-none">
                          <Lock className="w-3.5 h-3.5 text-soft-cream/40" />
                          Create Password
                        </label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create secure password"
                          className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5 select-none">
                          <Phone className="w-3.5 h-3.5 text-soft-cream/40" />
                          Phone Number
                        </label>
                        <input
                          type="text"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="Enter phone number"
                          className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors font-light font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-soft-cream/60 font-semibold flex items-center gap-1.5 select-none">
                        <MapPin className="w-3.5 h-3.5 text-soft-cream/40" />
                        Physical Shipping Address
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Enter full physical address for secure deliveries"
                        className="bg-white/3 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-soft-cream/20 text-xs focus:outline-none focus:border-honey-gold transition-colors resize-none font-light"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading' || status === 'success'}
                      className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-honey-gold to-warm-yellow text-black font-extrabold text-xs tracking-widest uppercase py-4 rounded-2xl shadow-xl shadow-honey-gold/10 hover:scale-[1.01] active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 font-bold"
                    >
                      {status === 'loading' ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Register & Initialize Profile</span>
                      )}
                    </button>

                  </form>
                )}

                {/* Google Sign-In divider and button inside Portal (Cleaned up texts) */}
                <div className="flex flex-col gap-4 border-t border-white/10 pt-5 mt-2">
                  <div className="relative flex py-1 items-center select-none">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-[9px] text-soft-cream/30 uppercase tracking-[0.25em] font-semibold">Or Authenticate With</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full group overflow-hidden bg-white hover:bg-neutral-100 text-black py-3.5 px-5 rounded-xl flex items-center justify-center gap-2.5 font-extrabold text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer shadow-lg active:scale-98 disabled:opacity-50"
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
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
