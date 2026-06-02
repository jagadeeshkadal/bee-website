'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, X, Calendar, Inbox } from 'lucide-react';

interface Order {
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  timestamp: string;
  status: string;
}

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderLookupModal({ isOpen, onClose }: OrderLookupModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [orders, setOrders] = useState<Order[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to retrieve orders.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Network error. Unable to contact secure registry.');
    }
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
            className="glassmorphism w-full max-w-2xl border border-white/20 p-6 md:p-8 rounded-[2.5rem] relative shadow-2xl overflow-hidden z-10"
          >
            {/* Ambient Background Gold Glow */}
            <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-honey-gold/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-soft-cream/40 hover:text-white transition-colors cursor-pointer p-2 z-10"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title / Header */}
            <div className="mb-6 select-none">
              <div className="flex items-center gap-2 text-honey-gold text-xs font-bold tracking-[0.25em] uppercase mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span>SECURE FORAGER ALLOCATIONS REGISTRY</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Track your <span className="text-honey-gold">Reservations</span>
              </h2>
              <p className="text-soft-cream/60 text-xs mt-1 font-light">
                Retrieve and track your rare wild nectar batch allocations.
              </p>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleLookup} className="flex gap-3 mb-6 relative z-10">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/4 border border-white/10 px-5 py-3.5 pl-11 rounded-2xl text-white placeholder-soft-cream/20 text-sm focus:outline-none focus:border-honey-gold transition-colors font-light"
                />
                <Search className="w-4 h-4 text-soft-cream/30 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-linear-to-r from-honey-gold to-warm-yellow text-black font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 rounded-2xl shadow-xl shadow-honey-gold/10 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Searching...' : 'Lookup'}
              </button>
            </form>

            {/* Content Results Display */}
            <div className="max-h-[350px] overflow-y-auto pr-1 flex flex-col gap-4 relative z-10 custom-scrollbar">
              {status === 'loading' && (
                <div className="py-12 flex flex-col items-center gap-4 text-center">
                  <div className="w-10 h-10 border-4 border-honey-gold border-t-transparent rounded-full animate-spin" />
                  <span className="text-soft-cream/50 text-xs font-semibold tracking-wider uppercase animate-pulse">
                    Retrieving Ledger Allocations...
                  </span>
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-xs font-semibold uppercase tracking-wider text-center">
                  {errorMsg}
                </div>
              )}

              {status === 'success' && (
                <>
                  {orders.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-4 text-center text-soft-cream/40 bg-white/2 border border-white/5 rounded-3xl">
                      <Inbox className="w-10 h-10 text-soft-cream/20" />
                      <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider">No Allocations Discovered</h4>
                        <p className="text-xs text-soft-cream/40 max-w-sm mt-1 leading-relaxed font-light">
                          We couldn't locate any confirmed jar orders matching <span className="text-honey-gold font-semibold">{email}</span>. Please verify your email or reserve a new jar.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <span className="text-[10px] text-honey-gold/60 tracking-widest font-bold uppercase block mb-1">
                        CONFIRMED JAR BATCHES ({orders.length})
                      </span>
                      {orders.map((order) => (
                        <div
                          key={order.orderNumber}
                          className="bg-white/3 hover:bg-white/5 border border-white/10 hover:border-honey-gold/25 p-5 rounded-3xl transition-all duration-300 relative group"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-honey-gold font-bold text-xs">
                                  {order.orderNumber}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md">
                                  {order.status}
                                </span>
                              </div>
                              <h4 className="text-base font-extrabold text-white mt-1.5 tracking-wide">
                                {order.productName}
                              </h4>
                              <p className="text-[10px] text-soft-cream/50 flex items-center gap-1.5 mt-1 font-light">
                                <Calendar className="w-3 h-3 text-soft-cream/40" />
                                {new Date(order.timestamp).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex md:flex-col items-baseline md:items-end justify-between md:justify-center border-t md:border-t-0 border-white/5 pt-2.5 md:pt-0">
                              <span className="text-xs text-soft-cream/40 md:mb-1 block font-light">
                                {order.quantity} Jar{order.quantity > 1 ? 's' : ''} × ${order.unitPrice.toFixed(2)}
                              </span>
                              <span className="text-lg font-black text-honey-gold tracking-tight">
                                ${order.totalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Shipping address footer */}
                          <div className="mt-3.5 pt-3.5 border-t border-white/5 text-[10px] text-soft-cream/40 flex justify-between font-light">
                            <span>Shipment Destination:</span>
                            <span className="text-white truncate max-w-[250px] font-medium">{order.shippingAddress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {status === 'idle' && (
                <div className="py-12 text-center text-soft-cream/40 text-xs font-light select-none">
                  Submit your email above to fetch dynamic allocations from our registry.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
