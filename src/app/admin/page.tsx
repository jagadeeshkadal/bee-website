'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Mail, 
  Package, 
  TrendingUp, 
  LogOut, 
  Lock, 
  Unlock, 
  Check, 
  AlertTriangle, 
  Eye, 
  DollarSign, 
  Database,
  ArrowLeft,
  Calendar,
  Users,
  ThumbsUp,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

// Pre-approved admin emails
const AUTHORIZED_ADMIN_EMAILS = ['jagadeeshkadali69@gmail.com', 'jagadeeshkadali69@gmail.come'];

interface Product {
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
  stock: number;
  image?: string | null;
  createdAt?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface Order {
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: string;
  timestamp: string;
  status: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  shippingAddress: string;
  registeredAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'contacts' | 'orders' | 'users'>('overview');
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [devBypass, setDevBypass] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Search and filter states
  const [productSearch, setProductSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'approved'>('all');
  
  // Forms & Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    subName: '',
    color: '#ffb703',
    gradient: 'from-[#ffb703] to-[#e85d04]',
    price: 45.00,
    description: '',
    characteristicsStr: 'Rich in Minerals, Bold & Woody',
    rarity: 'Limited Harvest',
    bgGlow: 'rgba(255, 183, 3, 0.15)',
    stock: 24,
    image: ''
  });

  // Track Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCheckingAuth(false);
      if (firebaseUser) {
        setUser(firebaseUser);
        const email = (firebaseUser.email || '').toLowerCase().trim();
        if (AUTHORIZED_ADMIN_EMAILS.includes(email)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          // Redirect unauthorized logged-in users to home page
          router.push('/');
        }
      } else {
        setUser(null);
        setIsAuthorized(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch Database content when authorized
  useEffect(() => {
    if (isAuthorized || devBypass) {
      fetchDashboardData();
    }
  }, [isAuthorized, devBypass]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      // Products fetch
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.products);
      }

      // Messages fetch
      const msgRes = await fetch('/api/contact');
      const msgData = await msgRes.json();
      if (msgData.success) {
        setMessages(msgData.messages);
      }

      // Orders fetch
      const ordRes = await fetch('/api/admin/orders');
      const ordData = await ordRes.json();
      if (ordData.success) {
        setOrders(ordData.orders);
      }

      // Users fetch
      const usrRes = await fetch('/api/admin/users');
      const usrData = await usrRes.json();
      if (usrData.success) {
        setUsers(usrData.users);
      }
    } catch (error) {
      console.error('Failed to load database values:', error);
      triggerNotification('error', 'Synchronization with database failed.');
    } finally {
      setLoadingData(false);
    }
  };

  const triggerNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const email = (result.user.email || '').toLowerCase().trim();
        if (AUTHORIZED_ADMIN_EMAILS.includes(email)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Admin Auth Error:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setDevBypass(false);
    router.push('/');
  };

  const handleApproveOrder = async (orderNumber: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, status: 'Approved' })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification('success', 'Order allocation successfully approved!');
        fetchDashboardData();
      } else {
        triggerNotification('error', data.error || 'Failed to approve order.');
      }
    } catch (err) {
      triggerNotification('error', 'Network failure during order approval.');
    }
  };

  const handleDeleteOrder = async (orderNumber: string) => {
    if (!confirm('Are you sure you want to delete this order receipt? This action is permanent.')) return;
    try {
      const res = await fetch(`/api/admin/orders?orderNumber=${orderNumber}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerNotification('success', data.message);
        fetchDashboardData();
      } else {
        triggerNotification('error', data.error);
      }
    } catch (err) {
      triggerNotification('error', 'Network failure during order deletion.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you absolutely sure you want to terminate this forager profile? All sessions will be unauthorized.')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerNotification('success', data.message);
        fetchDashboardData();
      } else {
        triggerNotification('error', data.error);
      }
    } catch (err) {
      triggerNotification('error', 'Network failure during profile deletion.');
    }
  };

  // Product actions: Create/Update
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse characteristics from string to array
    const characteristics = productForm.characteristicsStr
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const payload = {
      id: productForm.id.trim().toLowerCase(),
      name: productForm.name.trim(),
      subName: productForm.subName.trim(),
      color: productForm.color.trim(),
      gradient: productForm.gradient.trim(),
      price: parseFloat(productForm.price.toString()),
      description: productForm.description.trim(),
      characteristics,
      rarity: productForm.rarity.trim(),
      bgGlow: productForm.bgGlow.trim(),
      stock: parseInt(productForm.stock.toString()),
      image: productForm.image.trim() || null
    };

    try {
      const url = modalMode === 'add' ? '/api/products' : `/api/products/${payload.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        triggerNotification('success', data.message || 'Product successfully crafted!');
        setShowProductModal(false);
        fetchDashboardData();
      } else {
        triggerNotification('error', data.error || 'Failed to save product changes.');
      }
    } catch (err) {
      triggerNotification('error', 'Network failure during product transaction.');
    }
  };

  // Product action: Delete
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to banish this luxury nectar expression?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerNotification('success', data.message);
        fetchDashboardData();
      } else {
        triggerNotification('error', data.error);
      }
    } catch (err) {
      triggerNotification('error', 'Network failure during deletion request.');
    }
  };

  // Message action: Delete
  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this inquiry message?')) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerNotification('success', data.message);
        setSelectedMessage(null);
        fetchDashboardData();
      } else {
        triggerNotification('error', data.error);
      }
    } catch (err) {
      triggerNotification('error', 'Network failure during message removal.');
    }
  };

  const openAddProduct = () => {
    setModalMode('add');
    setProductForm({
      id: '',
      name: '',
      subName: '',
      color: '#ffb703',
      gradient: 'from-[#ffb703] to-[#e85d04]',
      price: 45.00,
      description: '',
      characteristicsStr: 'Rich in Minerals, Bold & Woody',
      rarity: 'Limited Harvest',
      bgGlow: 'rgba(255, 183, 3, 0.15)',
      stock: 24,
      image: ''
    });
    setShowProductModal(true);
  };

  const openEditProduct = (prod: Product) => {
    setModalMode('edit');
    setProductForm({
      id: prod.id,
      name: prod.name,
      subName: prod.subName,
      color: prod.color,
      gradient: prod.gradient,
      price: prod.price,
      description: prod.description,
      characteristicsStr: (prod.characteristics || []).join(', '),
      rarity: prod.rarity,
      bgGlow: prod.bgGlow,
      stock: prod.stock,
      image: prod.image || ''
    });
    setShowProductModal(true);
  };

  // Filter lists
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.id.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.subName.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(messageSearch.toLowerCase()) || 
    m.email.toLowerCase().includes(messageSearch.toLowerCase()) ||
    m.subject.toLowerCase().includes(messageSearch.toLowerCase()) ||
    m.message.toLowerCase().includes(messageSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    // Search match
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customerPhone || '').toLowerCase().includes(orderSearch.toLowerCase());

    // Status filter match
    if (orderFilter === 'pending') {
      return matchesSearch && (o.status === 'Pending Approval' || o.status === 'Pending');
    }
    if (orderFilter === 'approved') {
      return matchesSearch && (o.status === 'Approved' || o.status === 'Confirmed');
    }
    return matchesSearch;
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phone || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    u.shippingAddress.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Authentication & Access state views
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-honey-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized && !devBypass) {
    return (
      <main className="relative min-h-screen bg-black flex items-center justify-center p-4 select-none">
        <div className="absolute inset-0 bg-radial-gradient blur-3xl opacity-10 bg-honey-gold pointer-events-none" />
        
        <div className="relative w-full max-w-md z-10 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-soft-cream/40 hover:text-honey-gold transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Sanctuary
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase">
                ADMIN <span className="text-honey-gold">LOCKDOWN</span>
              </h1>
              <p className="text-xs text-soft-cream/60 font-light mt-3 leading-relaxed">
                This sanctuary is restricted to authorized royal stewards. Please authenticate with a registered steward email.
              </p>
            </div>

            {user ? (
              <div className="w-full flex flex-col gap-4">
                <div className="p-4 bg-white/3 border border-white/5 rounded-2xl text-left">
                  <span className="text-[10px] text-soft-cream/40 uppercase tracking-widest block font-bold mb-1">
                    Authenticated As
                  </span>
                  <span className="text-xs text-white block truncate font-mono">
                    {user.email}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Switch Account
                  </button>
                  
                  {/* Development Bypass Button */}
                  <button
                    onClick={() => setDevBypass(true)}
                    className="w-full bg-honey-gold/10 hover:bg-honey-gold/20 border border-honey-gold/30 text-honey-gold py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5 animate-pulse" />
                    <span>Evaluate Admin Panel (Steward Bypass)</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="w-full group overflow-hidden bg-white hover:bg-neutral-100 text-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-extrabold text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer shadow-lg shadow-white/5 active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.137 4.2-3.418 0-6.19-2.772-6.19-6.19 0-3.417 2.772-6.19 6.19-6.19 1.483 0 2.825.525 3.878 1.4l2.964-2.964C18.8 2.135 15.7 1 12.24 1A9.99 9.99 0 0 0 2.25 11c0 5.523 4.477 10 9.99 10 5.76 0 9.805-4.05 9.805-9.99 0-.61-.06-1.22-.165-1.725H12.24z"
                  />
                </svg>
                <span>Authorize with Google</span>
              </button>
            )}
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-neutral-950/80 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between relative backdrop-blur-md select-none">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-xl font-black text-white tracking-[0.2em]">
              BEE<span className="text-honey-gold font-bold">WILD</span>
            </h1>
            <span className="text-[9px] text-soft-cream/30 font-mono tracking-[0.2em] uppercase block mt-1">
              Stewards Registry
            </span>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-honey-gold/10 text-honey-gold border border-honey-gold/20'
                  : 'text-soft-cream/60 hover:bg-white/3'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-honey-gold/10 text-honey-gold border border-honey-gold/20'
                  : 'text-soft-cream/60 hover:bg-white/3'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                activeTab === 'contacts'
                  ? 'bg-honey-gold/10 text-honey-gold border border-honey-gold/20'
                  : 'text-soft-cream/60 hover:bg-white/3'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Inquiries</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-honey-gold/10 text-honey-gold border border-honey-gold/20'
                  : 'text-soft-cream/60 hover:bg-white/3'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-honey-gold/10 text-honey-gold border border-honey-gold/20'
                  : 'text-soft-cream/60 hover:bg-white/3'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>
          </nav>
        </div>

        <div className="flex flex-col gap-4 mt-8">
          {devBypass && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
              <Unlock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider leading-tight">
                Steward Bypass Active
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5 select-none">
            <img 
              src={user?.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              className="w-8 h-8 rounded-full border border-white/10" 
              alt="avatar"
            />
            <div className="truncate flex-1">
              <span className="text-[10px] text-white block truncate leading-tight font-bold">
                {user?.displayName || 'Steward'}
              </span>
              <span className="text-[8px] text-soft-cream/40 block truncate">
                {user?.email || 'bypass@devmode.com'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Registry</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto relative">
        
        {/* Floating Notification Alerts */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border ${
                notification.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {notification.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span className="text-xs font-semibold tracking-wide">{notification.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab content rendering */}
        <AnimatePresence mode="wait">
          
          {/* Tab 1: Overview Dashboard */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-8"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black tracking-wide">Overview Sanctuary</h2>
                  <span className="text-[8px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-md flex items-center gap-1 uppercase font-mono tracking-wider select-none">
                    <Database className="w-3 h-3" /> Neon PostgreSQL Connected
                  </span>
                </div>
                <p className="text-xs text-soft-cream/60 font-light mt-1">
                  Active stewardship insights of live database tables.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 select-none">
                
                <motion.div 
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glassmorphism p-5 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-xl relative hover-glow transition-all"
                >
                  <div>
                    <span className="text-[9px] text-soft-cream/40 uppercase tracking-widest font-bold block">
                      Nectars Cataloged
                    </span>
                    <h3 className="text-2xl font-black mt-2 tracking-wide text-white">
                      {loadingData ? '...' : products.length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-honey-gold/10 border border-honey-gold/20 flex items-center justify-center text-honey-gold">
                    <Package className="w-5 h-5 animate-pulse" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glassmorphism p-5 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-xl relative hover-glow transition-all"
                >
                  <div>
                    <span className="text-[9px] text-soft-cream/40 uppercase tracking-widest font-bold block">
                      Forager Inquiries
                    </span>
                    <h3 className="text-2xl font-black mt-2 tracking-wide text-white">
                      {loadingData ? '...' : messages.length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-honey-gold/10 border border-honey-gold/20 flex items-center justify-center text-honey-gold">
                    <Mail className="w-5 h-5 animate-pulse" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glassmorphism p-5 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-xl relative hover-glow transition-all"
                >
                  <div>
                    <span className="text-[9px] text-soft-cream/40 uppercase tracking-widest font-bold block">
                      Registered Foragers
                    </span>
                    <h3 className="text-2xl font-black mt-2 tracking-wide text-white">
                      {loadingData ? '...' : users.length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-honey-gold/10 border border-honey-gold/20 flex items-center justify-center text-honey-gold">
                    <Users className="w-5 h-5 animate-pulse" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glassmorphism p-5 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-xl relative hover-glow transition-all"
                >
                  <div>
                    <span className="text-[9px] text-soft-cream/40 uppercase tracking-widest font-bold block">
                      Active Allocations
                    </span>
                    <h3 className="text-2xl font-black mt-2 tracking-wide text-white">
                      {loadingData ? '...' : orders.length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-honey-gold/10 border border-honey-gold/20 flex items-center justify-center text-honey-gold">
                    <ShoppingBag className="w-5 h-5 animate-pulse" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glassmorphism p-5 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-xl relative hover-glow transition-all"
                >
                  <div>
                    <span className="text-[9px] text-soft-cream/40 uppercase tracking-widest font-bold block">
                      Gross Nectar Revenue
                    </span>
                    <h3 className="text-2xl font-black mt-2 tracking-wide text-honey-gold font-mono">
                      ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-honey-gold/10 border border-honey-gold/20 flex items-center justify-center text-honey-gold">
                    <DollarSign className="w-5 h-5 animate-pulse" />
                  </div>
                </motion.div>

              </div>

              {/* Recent Inquiry Activity Feed */}
              <div className="glassmorphism rounded-[2.5rem] border border-white/5 p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative">
                <div className="flex justify-between items-center select-none">
                  <div>
                    <h3 className="text-xl font-bold tracking-wide">Recent Foragers Inquiries</h3>
                    <p className="text-[10px] text-soft-cream/40 tracking-wider mt-0.5 uppercase">
                      Incoming communications from BEE WILD website
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('contacts')}
                    className="text-honey-gold text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View All</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {loadingData ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-6 h-6 border-2 border-honey-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl select-none">
                      <span className="text-xs text-soft-cream/30 uppercase tracking-wider font-semibold">
                        No contact inquiries logged in SQLite database
                      </span>
                    </div>
                  ) : (
                    messages.slice(0, 3).map((msg) => (
                      <div 
                        key={msg.id}
                        onClick={() => { setSelectedMessage(msg); setActiveTab('contacts'); }}
                        className="p-4 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-honey-gold/20 rounded-2xl transition-all cursor-pointer flex justify-between items-center gap-4 group"
                      >
                        <div className="truncate flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white group-hover:text-honey-gold transition-colors">
                              {msg.subject}
                            </h4>
                            <span className="text-[8px] px-2 py-0.5 bg-honey-gold/10 border border-honey-gold/20 rounded-full text-honey-gold uppercase tracking-wider font-mono">
                              {msg.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-soft-cream/50 truncate mt-1 leading-normal">
                            {msg.message}
                          </p>
                        </div>
                        <div className="text-right shrink-0 select-none flex items-center gap-2">
                          <span className="text-[9px] text-soft-cream/30 font-mono">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                          <Eye className="w-3.5 h-3.5 text-soft-cream/20 group-hover:text-honey-gold transition-colors" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* Tab 2: Product Management */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
                <div>
                  <h2 className="text-3xl font-black tracking-wide">Products Catalog</h2>
                  <p className="text-xs text-soft-cream/60 font-light mt-1 font-mono uppercase">
                    Manage Single-Origin expressions in SQLite database
                  </p>
                </div>
                <button
                  onClick={openAddProduct}
                  className="bg-linear-to-r from-honey-gold to-warm-yellow hover:scale-[1.02] text-black font-extrabold text-xs tracking-wider uppercase py-3.5 px-6 rounded-2xl shadow-xl shadow-honey-gold/5 flex items-center gap-2 cursor-pointer transition-all active:scale-95 duration-200"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  <span>Craft New Nectar</span>
                </button>
              </div>

              {/* Product catalog controls */}
              <div className="flex gap-4 items-center p-3 bg-white/2 rounded-2xl border border-white/5 relative z-10 shadow-lg select-none">
                <Search className="w-4 h-4 text-soft-cream/40 ml-2" />
                <input 
                  type="text"
                  placeholder="Search products by Name, ID, or Rarity..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="bg-transparent border-none text-xs text-white placeholder-soft-cream/30 w-full focus:outline-none"
                />
              </div>

              {/* Products Table list */}
              <div className="glassmorphism rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] font-bold text-soft-cream/40 bg-neutral-950/20 select-none">
                        <th className="p-6">Product details</th>
                        <th className="p-6">ID Key</th>
                        <th className="p-6">Price</th>
                        <th className="p-6">Stock Status</th>
                        <th className="p-6 text-right">Sanctuary Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {loadingData ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-honey-gold border-t-transparent rounded-full animate-spin mx-auto" />
                          </td>
                        </tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center font-bold text-soft-cream/20 uppercase tracking-widest">
                            No honey products matched your query
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div 
                                  className={`w-10 h-10 rounded-xl bg-linear-to-tr ${prod.gradient} flex items-center justify-center shadow-lg border border-white/10 shrink-0 select-none`}
                                >
                                  <span className="text-[10px] font-bold text-black uppercase truncate max-w-full px-1">
                                    {prod.name.substring(0, 3)}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-white tracking-wide text-sm">
                                    {prod.name}
                                  </h4>
                                  <p className="text-[10px] text-soft-cream/50 mt-0.5">
                                    {prod.subName} • <span className="text-honey-gold font-mono">{prod.rarity}</span>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-6 font-mono text-[10px] text-soft-cream/60">
                              {prod.id}
                            </td>
                            <td className="p-6 text-honey-gold font-mono font-bold text-sm">
                              ${prod.price.toFixed(2)}
                            </td>
                            <td className="p-6">
                              {prod.stock === 0 ? (
                                <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[9px] font-bold tracking-wider uppercase select-none">
                                  Harvest Depleted
                                </span>
                              ) : prod.stock <= 15 ? (
                                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-bold tracking-wider uppercase select-none">
                                  Allocations Low ({prod.stock})
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-bold tracking-wider uppercase select-none">
                                  Reserve Stock ({prod.stock})
                                </span>
                              )}
                            </td>
                            <td className="p-6 text-right select-none">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEditProduct(prod)}
                                  className="w-9 h-9 rounded-xl glassmorphism border border-white/10 hover:border-honey-gold text-soft-cream/70 hover:text-honey-gold transition-colors flex items-center justify-center cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="w-9 h-9 rounded-xl glassmorphism border border-white/10 hover:border-red-500 text-soft-cream/70 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Contact Messages */}
          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="select-none">
                <h2 className="text-3xl font-black tracking-wide">Foragers Inquiries</h2>
                <p className="text-xs text-soft-cream/60 font-light mt-1 uppercase font-mono">
                  Review incoming messages securely logged in SQLite database
                </p>
              </div>

              {/* Inquiry search bar */}
              <div className="flex gap-4 items-center p-3 bg-white/2 rounded-2xl border border-white/5 relative z-10 shadow-lg select-none">
                <Search className="w-4 h-4 text-soft-cream/40 ml-2" />
                <input 
                  type="text"
                  placeholder="Search inquiries by Name, Email, Subject, or Message..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="bg-transparent border-none text-xs text-white placeholder-soft-cream/30 w-full focus:outline-none"
                />
              </div>

              {/* Message catalog */}
              <div className="grid grid-cols-1 gap-4">
                {loadingData ? (
                  <div className="py-24 text-center">
                    <div className="w-8 h-8 border-2 border-honey-gold border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center py-24 border border-dashed border-white/5 rounded-3xl select-none">
                    <span className="text-xs text-soft-cream/30 uppercase tracking-widest font-bold">
                      No forager inquiries matched your query
                    </span>
                  </div>
                ) : (
                  filteredMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glassmorphism p-6 rounded-[2rem] border border-white/5 hover:border-honey-gold/15 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative shadow-lg group hover-glow"
                    >
                      <div className="flex-1 truncate">
                        <div className="flex flex-wrap items-center gap-2.5 select-none">
                          <span className="px-2 py-0.5 bg-honey-gold/10 border border-honey-gold/20 text-honey-gold text-[9px] font-bold tracking-wider uppercase rounded-full">
                            {msg.name}
                          </span>
                          <span className="text-[10px] text-soft-cream/40 font-mono truncate">
                            {msg.email}
                          </span>
                          <span className="text-[9px] text-soft-cream/30 font-mono flex items-center gap-1 ml-auto md:ml-0">
                            <Calendar className="w-3 h-3" />
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-white mt-3 tracking-wide">
                          {msg.subject}
                        </h4>
                        <p className="text-xs text-soft-cream/70 mt-2 font-light leading-relaxed truncate md:whitespace-normal md:line-clamp-2">
                          {msg.message}
                        </p>
                      </div>

                      <div className="flex md:flex-col gap-2 w-full md:w-auto shrink-0 select-none border-t border-white/5 pt-4 md:pt-0 md:border-t-0 justify-end">
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="flex-1 md:flex-initial h-9 rounded-xl glassmorphism border border-white/10 hover:border-honey-gold text-soft-cream/70 hover:text-honey-gold text-[10px] font-bold tracking-wider uppercase px-4 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Detail</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="h-9 w-9 rounded-xl glassmorphism border border-white/10 hover:border-red-500 text-soft-cream/70 hover:text-red-400 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 4: Orders Allocations Ledger */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="select-none">
                <h2 className="text-3xl font-black tracking-wide">Allocations Ledger</h2>
                <p className="text-xs text-soft-cream/60 font-light mt-1 uppercase font-mono">
                  Approve, review, or delete client nectar reservations from Neon database
                </p>
              </div>

              {/* Order Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
                {/* Search */}
                <div className="col-span-1 sm:col-span-2 flex gap-4 items-center p-3 bg-white/2 rounded-2xl border border-white/5 shadow-lg">
                  <Search className="w-4 h-4 text-soft-cream/40 ml-2" />
                  <input 
                    type="text"
                    placeholder="Search by Order #, Name, Email, Product, or Phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="bg-transparent border-none text-xs text-white placeholder-soft-cream/30 w-full focus:outline-none"
                  />
                </div>
                {/* Filter */}
                <div className="flex gap-2 p-1 bg-white/2 rounded-2xl border border-white/5 shadow-lg">
                  {(['all', 'pending', 'approved'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOrderFilter(filter)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        orderFilter === filter
                          ? 'bg-honey-gold text-black font-extrabold'
                          : 'text-soft-cream/60 hover:text-white font-medium'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="glassmorphism rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] font-bold text-soft-cream/40 bg-neutral-950/20 select-none">
                        <th className="p-6">Order details</th>
                        <th className="p-6">Customer info</th>
                        <th className="p-6">Shipping Address</th>
                        <th className="p-6">Total Amount</th>
                        <th className="p-6">Status</th>
                        <th className="p-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {loadingData ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-honey-gold border-t-transparent rounded-full animate-spin mx-auto" />
                          </td>
                        </tr>
                      ) : filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center font-bold text-soft-cream/20 uppercase tracking-widest">
                            No allocations matched your query
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr key={o.orderNumber} className="hover:bg-white/2 transition-colors">
                            <td className="p-6">
                              <div>
                                <span className="font-mono text-honey-gold text-[10px] font-bold block">{o.orderNumber}</span>
                                <h4 className="font-extrabold text-white mt-1 text-sm">{o.productName}</h4>
                                <span className="text-[10px] text-soft-cream/40 block mt-0.5 font-light">
                                  {o.quantity} Jar{o.quantity > 1 ? 's' : ''} @ ${o.unitPrice.toFixed(2)}
                                </span>
                                <span className="text-[9px] text-soft-cream/30 block mt-0.5 font-mono">
                                  {new Date(o.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </td>
                            <td className="p-6">
                              <div>
                                <span className="text-white font-bold block">{o.customerName}</span>
                                <span className="text-soft-cream/50 block text-[10px] font-mono mt-0.5 truncate max-w-[160px]" title={o.customerEmail}>
                                  {o.customerEmail}
                                </span>
                                {o.customerPhone && (
                                  <span className="text-soft-cream/30 block text-[9px] font-mono mt-0.5">
                                    Phone: {o.customerPhone}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-6">
                              <p className="text-soft-cream/60 leading-normal font-light line-clamp-2 max-w-[200px]" title={o.shippingAddress}>
                                {o.shippingAddress}
                              </p>
                            </td>
                            <td className="p-6 text-honey-gold font-mono font-bold text-sm">
                              ${o.totalAmount.toFixed(2)}
                            </td>
                            <td className="p-6">
                              {o.status === 'Approved' || o.status === 'Confirmed' ? (
                                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-bold tracking-wider uppercase select-none">
                                  {o.status}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-bold tracking-wider uppercase select-none animate-pulse">
                                  {o.status}
                                </span>
                              )}
                            </td>
                            <td className="p-6 text-right select-none">
                              <div className="flex justify-end gap-2">
                                {(o.status === 'Pending Approval' || o.status === 'Pending') && (
                                  <button
                                    onClick={() => handleApproveOrder(o.orderNumber)}
                                    className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center cursor-pointer shadow-lg"
                                    title="Approve Allocation"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteOrder(o.orderNumber)}
                                  className="w-9 h-9 rounded-xl glassmorphism border border-white/10 hover:border-red-500 text-soft-cream/70 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                                  title="Banish/Delete Order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 5: Users Foragers Registry */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="select-none">
                <h2 className="text-3xl font-black tracking-wide">Foragers Registry</h2>
                <p className="text-xs text-soft-cream/60 font-light mt-1 uppercase font-mono">
                  Inspect active registered membership profiles or terminate accounts in Neon database
                </p>
              </div>

              {/* User search bar */}
              <div className="flex gap-4 items-center p-3 bg-white/2 rounded-2xl border border-white/5 relative z-10 shadow-lg select-none">
                <Search className="w-4 h-4 text-soft-cream/40 ml-2" />
                <input 
                  type="text"
                  placeholder="Search registered members by Name, Email, Phone, or Shipping Address..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-transparent border-none text-xs text-white placeholder-soft-cream/30 w-full focus:outline-none"
                />
              </div>

              {/* Users Table */}
              <div className="glassmorphism rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] font-bold text-soft-cream/40 bg-neutral-950/20 select-none">
                        <th className="p-6">Forager profile</th>
                        <th className="p-6">User email</th>
                        <th className="p-6">Contact Phone</th>
                        <th className="p-6">Primary Shipping Address</th>
                        <th className="p-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {loadingData ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-honey-gold border-t-transparent rounded-full animate-spin mx-auto" />
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center font-bold text-soft-cream/20 uppercase tracking-widest">
                            No foragers found matching criteria
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-honey-gold/10 border border-honey-gold/30 text-honey-gold flex items-center justify-center font-bold text-xs select-none">
                                  {u.name[0].toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-sm">{u.name}</h4>
                                  <span className="text-[9px] text-soft-cream/30 block font-mono">
                                    Joined: {new Date(u.registeredAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-6 font-mono text-[10px] text-soft-cream/60">
                              {u.email}
                            </td>
                            <td className="p-6 font-mono text-[10px] text-soft-cream/60">
                              {u.phone || 'No phone number provided.'}
                            </td>
                            <td className="p-6">
                              <p className="text-soft-cream/60 leading-normal font-light line-clamp-2 max-w-[260px]" title={u.shippingAddress}>
                                {u.shippingAddress || 'No primary shipping address configured.'}
                              </p>
                            </td>
                            <td className="p-6 text-right select-none">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="w-9 h-9 rounded-xl glassmorphism border border-white/10 hover:border-red-500 text-soft-cream/70 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                                  title="Terminate User Profile"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Modal 1: Product Add/Edit Side Overlay */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex justify-end select-none pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />
            
            {/* Form Sheet Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-neutral-950 border-l border-white/10 h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase tracking-wide">
                    {modalMode === 'add' ? 'Craft New Nectar' : 'Modify Nectar Details'}
                  </h3>
                  <button 
                    onClick={() => setShowProductModal(false)}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-soft-cream hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleProductSubmit} className="flex flex-col gap-4 text-xs font-medium">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-wider text-soft-cream/40 font-bold text-[10px]">
                        Product Key (Unique ID)
                      </label>
                      <input 
                        type="text"
                        required
                        disabled={modalMode === 'edit'}
                        value={productForm.id}
                        onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                        placeholder="e.g. royal-black"
                        className="bg-white/3 border border-white/10 p-3 rounded-xl text-white placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-wider text-soft-cream/40 font-bold text-[10px]">
                        Nectar Display Name
                      </label>
                      <input 
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="e.g. ROYAL BLACK"
                        className="bg-white/3 border border-white/10 p-3 rounded-xl text-white placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-wider text-soft-cream/40 font-bold text-[10px]">
                      Aesthetic Subtitle / Description Hook
                    </label>
                    <input 
                      type="text"
                      required
                      value={productForm.subName}
                      onChange={(e) => setProductForm({ ...productForm, subName: e.target.value })}
                      placeholder="e.g. Royal Black Truffle Infusion"
                      className="bg-white/3 border border-white/10 p-3 rounded-xl text-white placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-wider text-soft-cream/40 font-bold text-[10px]">
                        Price ($)
                      </label>
                      <input 
                        type="number"
                        step="0.01"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                        placeholder="45.00"
                        className="bg-white/3 border border-white/10 p-3 rounded-xl text-white placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-wider text-soft-cream/40 font-bold text-[10px]">
                        Available Jar Stock
                      </label>
                      <input 
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                        placeholder="24"
                        className="bg-white/3 border border-white/10 p-3 rounded-xl text-white placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-wider text-soft-cream/40 font-bold text-[10px]">
                        Honey Rarity Tier
                      </label>
                      <input 
                        type="text"
                        required
                        value={productForm.rarity}
                        onChange={(e) => setProductForm({ ...productForm, rarity: e.target.value })}
                        placeholder="e.g. Ultra Rare Reserve"
                        className="bg-white/3 border border-white/10 p-3 rounded-xl text-white placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase tracking-wider text-soft-cream/40 font-bold text-[10px]">
                        Product Image Path/URL
                      </label>
                      <input 
                        type="text"
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        placeholder="Leave blank for 3D jar simulation"
                        className="bg-white/3 border border-white/10 p-3 rounded-xl text-white placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-wider text-soft-cream/40 font-bold text-[10px]">
                      Characteristics (Comma-Separated)
                    </label>
                    <input 
                      type="text"
                      required
                      value={productForm.characteristicsStr}
                      onChange={(e) => setProductForm({ ...productForm, characteristicsStr: e.target.value })}
                      placeholder="E.g. Bold & Woody, Rich, Sweet"
                      className="bg-white/3 border border-white/10 p-3 rounded-xl text-white placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-wider text-soft-cream/40 font-bold text-[10px]">
                      Deep Description
                    </label>
                    <textarea 
                      rows={3}
                      required
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Provide raw sensory description, notes, harvest details..."
                      className="bg-white/3 border border-white/10 p-3 rounded-xl text-white placeholder-soft-cream/20 focus:outline-none focus:border-honey-gold focus:ring-1 focus:ring-honey-gold/30 transition-all resize-none"
                    />
                  </div>

                  {/* Brand styling variables (prepopulated default luxury values) */}
                  <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[7.5px] uppercase tracking-wider text-soft-cream/40 block font-bold">Hex Color</label>
                      <input 
                        type="text" 
                        value={productForm.color}
                        onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                        className="bg-white/3 border border-white/10 p-2 rounded-lg font-mono text-[9px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[7.5px] uppercase tracking-wider text-soft-cream/40 block font-bold">Radial Glow</label>
                      <input 
                        type="text" 
                        value={productForm.bgGlow}
                        onChange={(e) => setProductForm({ ...productForm, bgGlow: e.target.value })}
                        className="bg-white/3 border border-white/10 p-2 rounded-lg font-mono text-[9px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[7.5px] uppercase tracking-wider text-soft-cream/40 block font-bold">Tailwind Gradient</label>
                      <input 
                        type="text" 
                        value={productForm.gradient}
                        onChange={(e) => setProductForm({ ...productForm, gradient: e.target.value })}
                        className="bg-white/3 border border-white/10 p-2 rounded-lg font-mono text-[9px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 bg-linear-to-r from-honey-gold to-warm-yellow text-black font-extrabold text-xs tracking-widest uppercase py-4 rounded-2xl shadow-xl shadow-honey-gold/10 hover:scale-[1.01] transition-transform duration-300 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3px]" />
                    <span>Confirm Changes</span>
                  </button>

                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Message Detailed View Overlay */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs cursor-pointer"
            />

            {/* Inquiry Card Details */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl glassmorphism p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col gap-6 overflow-hidden select-none"
            >
              <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-honey-gold/15 rounded-full blur-2xl pointer-events-none animate-pulse" />
              
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] text-soft-cream/40 uppercase tracking-[0.2em] block font-bold mb-1">
                    Steward Inquiry Detail
                  </span>
                  <h3 className="text-xl font-black text-white tracking-wide">
                    {selectedMessage.subject}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-soft-cream hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 bg-white/2 p-4 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-[8.5px] uppercase tracking-wider text-soft-cream/40 block font-bold">
                      Forager Sender
                    </span>
                    <span className="text-xs text-white block mt-0.5 font-bold">
                      {selectedMessage.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] uppercase tracking-wider text-soft-cream/40 block font-bold">
                      Email Address
                    </span>
                    <span className="text-xs text-honey-gold block mt-0.5 font-mono truncate">
                      {selectedMessage.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 p-4 bg-white/2 rounded-2xl border border-white/5">
                  <span className="text-[8.5px] uppercase tracking-wider text-soft-cream/40 block font-bold">
                    Logged Inquiry Message
                  </span>
                  <p className="text-xs text-soft-cream/80 leading-relaxed font-light mt-1 overflow-y-auto max-h-48 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-soft-cream/30 font-mono mt-2">
                  <span>SQLite Record ID: {selectedMessage.id}</span>
                  <span>Received: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 select-none border-t border-white/5 pt-4">
                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs uppercase py-3.5 px-6 rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Message</span>
                </button>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase py-3.5 px-6 rounded-2xl transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
