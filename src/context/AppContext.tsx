import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Product, Category, CartItem, Order, Language, CurrencyCode, Role, SystemSettings, Notification, ColorPalette, getProductUnitPrice, getBulkDiscountedPrice } from '../types';
import { INITIAL_USERS, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SYSTEM_SETTINGS } from '../data/initialData';
import { api, getDeletedProductIds } from '../services/api';
import { firebaseDb } from '../lib/firebase';
import { safeStorage } from '../lib/safeStorage';
import { applyLiveLanguage } from '../services/languageService';
import { applyLiveCurrency, formatCurrencyAmount } from '../services/currencyService';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  formatPrice: (amountInBDT: number) => string;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  colorPalette: ColorPalette;
  setColorPalette: (palette: ColorPalette) => void;
  customColorHex: string;
  setCustomColorHex: (hex: string) => void;
  
  // Data State
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[]; // product IDs
  notifications: Notification[];
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  removeFromCart: (productId: string, selectedVariants?: Record<string, string>) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedVariants?: Record<string, string>) => void;
  clearCart: () => void;
  
  // Wishlist Actions
  toggleWishlist: (productId: string) => void;
  
  // Modals & Panels
  activePanel: 'customer' | 'seller' | 'admin' | 'settings' | 'dashboard_home' | 'store_directory' | 'inventory_workspace' | 'product_reviews' | 'customer_messages' | 'register_vendor' | 'customer_profile' | 'outlets' | 'subscription_pricing' | 'seller_applications' | 'product_approvals';
  setActivePanel: (panel: 'customer' | 'seller' | 'admin' | 'settings' | 'dashboard_home' | 'store_directory' | 'inventory_workspace' | 'product_reviews' | 'customer_messages' | 'register_vendor' | 'customer_profile' | 'outlets' | 'subscription_pricing' | 'seller_applications' | 'product_approvals') => void;
  sellerActiveTab: 'overview' | 'products' | 'orders' | 'withdrawals' | 'roles_permissions' | 'settings' | 'subscription' | 'store_directory' | 'inventory_manager';
  setSellerActiveTab: (tab: 'overview' | 'products' | 'orders' | 'withdrawals' | 'roles_permissions' | 'settings' | 'subscription' | 'store_directory' | 'inventory_manager') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  sharingProduct: Product | null;
  setSharingProduct: (product: Product | null) => void;
  shareProduct: (product: Product) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isAiOpen: boolean;
  setIsAiOpen: (open: boolean) => void;
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;
  
  // Search & Filter state
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedSellerId: string | null;
  setSelectedSellerId: (sellerId: string | null) => void;
  activeCampaignTab: string;
  setActiveCampaignTab: (tab: string) => void;
  
  // Data Refresh & Mutation
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  deleteProduct: (id: string) => Promise<boolean>;
  createProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  
  // Dedicated customer-only marketplace mode
  isCustomerOnlyMode: boolean;
  setIsCustomerOnlyMode: (val: boolean) => void;

  // Track if mobile active chat is open
  isMobileChatActive: boolean;
  setIsMobileChatActive: (val: boolean) => void;
}

export function generateShadesFromHex(hex: string): Record<string, string> {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) {
    cleanHex = 'f59e0b'; // Amber fallback
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // RGB to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }

  // HSL to RGB to HEX helper
  const hslToHex = (h: number, s: number, l: number): string => {
    l = Math.max(0, Math.min(1, l));
    s = Math.max(0, Math.min(1, s));
    let r = l, g = l, b = l;
    if (s !== 0) {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = (x: number) => {
      const val = Math.round(x * 255).toString(16);
      return val.length === 1 ? '0' + val : val;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  return {
    '50': hslToHex(h, s, 0.97),
    '100': hslToHex(h, s, 0.93),
    '200': hslToHex(h, s, 0.86),
    '300': hslToHex(h, s, 0.74),
    '400': hslToHex(h, s, 0.60),
    '500': `#${cleanHex}`,
    '600': hslToHex(h, s, Math.max(0.05, l * 0.85)),
    '700': hslToHex(h, s, Math.max(0.04, l * 0.70)),
    '800': hslToHex(h, s, Math.max(0.03, l * 0.55)),
    '900': hslToHex(h, s, Math.max(0.02, l * 0.40)),
    '950': hslToHex(h, s, Math.max(0.01, l * 0.25)),
  };
}

const PALETTES: Record<ColorPalette, Record<string, string>> = {
  mint: {
    '50': '#ecfdf5',
    '100': '#d1fae5',
    '200': '#a7f3d0',
    '300': '#6ee7b7',
    '400': '#34d399',
    '500': '#10b981',
    '600': '#059669',
    '700': '#047857',
    '800': '#065f46',
    '900': '#064e3b',
    '950': '#022c22',
  },
  amber: {
    '50': '#fffbeb',
    '100': '#fef3c7',
    '200': '#fde68a',
    '300': '#fcd34d',
    '400': '#fbbf24',
    '500': '#f59e0b',
    '600': '#d97706',
    '700': '#b45309',
    '800': '#92400e',
    '900': '#78350f',
    '950': '#451a03',
  },
  sky: {
    '50': '#f0f9ff',
    '100': '#e0f2fe',
    '200': '#bae6fd',
    '300': '#7dd3fc',
    '400': '#38bdf8',
    '500': '#0ea5e9',
    '600': '#0284c7',
    '700': '#0369a1',
    '800': '#075985',
    '900': '#0c4a6e',
    '950': '#082f49',
  },
  blush: {
    '50': '#fff1f2',
    '100': '#ffe4e6',
    '200': '#fecdd3',
    '300': '#fda4af',
    '400': '#fb7185',
    '500': '#f43f5e',
    '600': '#e11d48',
    '700': '#be123c',
    '800': '#9f1239',
    '900': '#881337',
    '950': '#4c0519',
  },
  crimson: {
    '50': '#fef2f2',
    '100': '#fee2e2',
    '200': '#fecaca',
    '300': '#fca5a5',
    '400': '#f87171',
    '500': '#ef4444',
    '600': '#dc2626',
    '700': '#b91c1c',
    '800': '#991b1b',
    '900': '#7f1d1d',
    '950': '#450a0a',
  },
  indigo: {
    '50': '#eef2ff',
    '100': '#e0e7ff',
    '200': '#c7d2fe',
    '300': '#a5b4fc',
    '400': '#818cf8',
    '500': '#6366f1',
    '600': '#4f46e5',
    '700': '#4338ca',
    '800': '#3730a3',
    '900': '#312e81',
    '950': '#1e1b4b',
  },
  lavender: {
    '50': '#f5f3ff',
    '100': '#ede9fe',
    '200': '#ddd6fe',
    '300': '#c4b5fd',
    '400': '#a78bfa',
    '500': '#8b5cf6',
    '600': '#7c3aed',
    '700': '#6d28d9',
    '800': '#5b21b6',
    '900': '#4c1d95',
    '950': '#2e1065',
  },
  orange: {
    '50': '#fff7ed',
    '100': '#ffedd5',
    '200': '#fed7aa',
    '300': '#fdba74',
    '400': '#fb923c',
    '500': '#f97316',
    '600': '#ea580c',
    '700': '#c2410c',
    '800': '#9a3412',
    '900': '#7c2d12',
    '950': '#431407',
  },
  gold: {
    '50': '#fefce8',
    '100': '#fef9c3',
    '200': '#fef08a',
    '300': '#fde047',
    '400': '#facc15',
    '500': '#eab308',
    '600': '#ca8a04',
    '700': '#a16207',
    '800': '#854d0e',
    '900': '#713f12',
    '950': '#422006',
  },
  magenta: {
    '50': '#fdf4ff',
    '100': '#fae8ff',
    '200': '#f5d0fe',
    '300': '#f0abfc',
    '400': '#e879f9',
    '500': '#d946ef',
    '600': '#c026d3',
    '700': '#a21caf',
    '800': '#86198f',
    '900': '#701a75',
    '950': '#4a044e',
  },
  turquoise: {
    '50': '#ecfeff',
    '100': '#cffafe',
    '200': '#a5f3fc',
    '300': '#67e8f9',
    '400': '#22d3ee',
    '500': '#06b6d4',
    '600': '#0891b2',
    '700': '#0e7490',
    '800': '#155e75',
    '900': '#164e63',
    '950': '#083344',
  },
  lime: {
    '50': '#f7fee7',
    '100': '#ecfccb',
    '200': '#d9f99d',
    '300': '#bef264',
    '400': '#a3e635',
    '500': '#84cc16',
    '600': '#65a30d',
    '700': '#4d7c0f',
    '800': '#3f6212',
    '900': '#314f11',
    '950': '#1a2e05',
  },
  sapphire: {
    '50': '#eff6ff',
    '100': '#dbeafe',
    '200': '#bfdbfe',
    '300': '#93c5fd',
    '400': '#60a5fa',
    '500': '#3b82f6',
    '600': '#2563eb',
    '700': '#1d4ed8',
    '800': '#1e40af',
    '900': '#1e3a8a',
    '950': '#172554',
  },
  forest: {
    '50': '#f0fdf4',
    '100': '#dcfce7',
    '200': '#bbf7d0',
    '300': '#86efac',
    '400': '#4ade80',
    '500': '#22c55e',
    '600': '#16a34a',
    '700': '#15803d',
    '800': '#166534',
    '900': '#14532d',
    '950': '#052e16',
  },
  teal: {
    '50': '#f0fdfa',
    '100': '#ccfbf1',
    '200': '#99f6e4',
    '300': '#5eead4',
    '400': '#2dd4bf',
    '500': '#14b8a6',
    '600': '#0d9488',
    '700': '#0f766e',
    '800': '#115e59',
    '900': '#134e4a',
    '950': '#042f2e',
  },
  violet: {
    '50': '#faf5ff',
    '100': '#f3e8ff',
    '200': '#e9d5ff',
    '300': '#d8b4fe',
    '400': '#c084fc',
    '500': '#a855f7',
    '600': '#9333ea',
    '700': '#7e22ce',
    '800': '#6b21a8',
    '900': '#581c87',
    '950': '#3b0764',
  },
  emerald: {
    '50': '#ecfdf5',
    '100': '#d1fae5',
    '200': '#a7f3d0',
    '300': '#6ee7b7',
    '400': '#34d399',
    '500': '#059669',
    '600': '#047857',
    '700': '#065f46',
    '800': '#064e3b',
    '900': '#022c22',
    '950': '#011c15',
  },
  rose: {
    '50': '#fff1f2',
    '100': '#ffe4e6',
    '200': '#fecdd3',
    '300': '#fda4af',
    '400': '#fb7185',
    '500': '#f43f5e',
    '600': '#e11d48',
    '700': '#be123c',
    '800': '#9f1239',
    '900': '#881337',
    '950': '#4c0519',
  },
  coral: {
    '50': '#fff5f5',
    '100': '#ffe3e3',
    '200': '#ffc9c9',
    '300': '#ffa8a8',
    '400': '#ff8787',
    '500': '#ff6b6b',
    '600': '#fa5252',
    '700': '#f03e3e',
    '800': '#e03131',
    '900': '#c92a2a',
    '950': '#5c0e0e',
  },
  fuchsia: {
    '50': '#fdf4ff',
    '100': '#fae8ff',
    '200': '#f5d0fe',
    '300': '#f0abfc',
    '400': '#e879f9',
    '500': '#d946ef',
    '600': '#c026d3',
    '700': '#a21caf',
    '800': '#86198f',
    '900': '#701a75',
    '950': '#4a044e',
  },
  plum: {
    '50': '#fdf2f8',
    '100': '#fce7f3',
    '200': '#fbcfe8',
    '300': '#f9a8d4',
    '400': '#f472b6',
    '500': '#db2777',
    '600': '#be185d',
    '700': '#9d174d',
    '800': '#831843',
    '900': '#500724',
    '950': '#300212',
  },
  slate: {
    '50': '#f8fafc',
    '100': '#f1f5f9',
    '200': '#e2e8f0',
    '300': '#cbd5e1',
    '400': '#94a3b8',
    '500': '#64748b',
    '600': '#475569',
    '700': '#334155',
    '800': '#1e293b',
    '900': '#0f172a',
    '950': '#020617',
  },
  bronze: {
    '50': '#fdfbf7',
    '100': '#f5efe6',
    '200': '#e6dcd0',
    '300': '#d2c2b3',
    '400': '#b49f8a',
    '500': '#8c7355',
    '600': '#765e43',
    '700': '#604c35',
    '800': '#463725',
    '900': '#302619',
    '950': '#1b140b',
  },
  custom: {
    '50': '#f5f5f5',
    '100': '#e5e5e5',
    '200': '#d4d4d4',
    '300': '#a3a3a3',
    '400': '#737373',
    '500': '#737373',
    '600': '#525252',
    '700': '#404040',
    '800': '#262626',
    '900': '#171717',
    '950': '#0a0a0a',
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return safeStorage.getJSON<User | null>('currentUser', null);
  });
  const [activeRole, setActiveRole] = useState<Role>(() => {
    const parsed = safeStorage.getJSON<any>('currentUser', null);
    return parsed?.role || 'customer';
  });
  const [language, setLanguage] = useState<Language>(() => {
    const saved = safeStorage.getItem('language') as Language;
    return saved ? saved : 'bn';
  });
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = safeStorage.getItem('app_currency') as CurrencyCode;
    return saved ? saved : 'BDT';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = safeStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [colorPalette, setColorPalette] = useState<ColorPalette>(() => {
    const saved = safeStorage.getItem('colorPalette') as ColorPalette;
    return saved ? saved : 'amber';
  });
  const [customColorHex, setCustomColorHex] = useState<string>(() => {
    return safeStorage.getItem('customColorHex') || '#e11d48';
  });
  const [activePanel, setActivePanel] = useState<'customer' | 'seller' | 'admin' | 'settings' | 'dashboard_home' | 'store_directory' | 'inventory_workspace' | 'product_reviews' | 'customer_messages' | 'register_vendor' | 'customer_profile' | 'outlets' | 'subscription_pricing' | 'seller_applications' | 'product_approvals'>(() => {
    const parsed = safeStorage.getJSON<any>('currentUser', null);
    if (parsed) {
      if (parsed.role === 'admin') return 'admin';
      if (parsed.role === 'seller') return 'seller';
      return 'customer';
    }
    return 'customer';
  });

  const [sellerActiveTab, setSellerActiveTab] = useState<'overview' | 'products' | 'orders' | 'withdrawals' | 'roles_permissions' | 'settings' | 'subscription' | 'store_directory' | 'inventory_manager'>('overview');

  const [isCustomerOnlyMode, setIsCustomerOnlyMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('customer_mode') === 'true' || params.get('customer') === 'true';
    }
    return false;
  });

  // Automatically lock the panel to customer-only storefront if client-side mode is active
  useEffect(() => {
    if (isCustomerOnlyMode) {
      setActivePanel('customer');
    }
  }, [isCustomerOnlyMode]);

  useEffect(() => {
    safeStorage.setItem('language', language);
    applyLiveLanguage(language);
  }, [language]);

  useEffect(() => {
    applyLiveCurrency(currency);
  }, [currency]);

  const formatPrice = (amountInBDT: number): string => {
    return formatCurrencyAmount(amountInBDT, currency);
  };

  useEffect(() => {
    safeStorage.setItem('theme', theme);
  }, [theme]);

  const [products, setProducts] = useState<Product[]>(() => {
    const deletedSet = getDeletedProductIds();
    try {
      const parsed = safeStorage.getJSON<Product[]>('amarbazar_products_store', []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(p => !deletedSet.has(p.id));
      }
    } catch (e) {}
    return INITIAL_PRODUCTS.filter(p => !deletedSet.has(p.id));
  });
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['prod-102']);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      userId: 'usr-demo-cust',
      title: 'Welcome to AmarBazar BD!',
      titleBn: 'আমার বাজার এ আপনাকে স্বাগতম!',
      message: 'Get up to 15% off with code EID2026 on your first order.',
      messageBn: 'প্রথম অর্ডারে EID2026 কুপনে ১৫% পর্যন্ত ছাড় পান।',
      type: 'promo',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(INITIAL_SYSTEM_SETTINGS);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isMobileChatActive, setIsMobileChatActive] = useState<boolean>(false);

  // Quick Share helper
  const shareProduct = (product: Product) => {
    setSharingProduct(product);
  };

  // Detect shared URL params on initial load (e.g. ?product=prod-1 or #product=prod-1)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlProdId = urlParams.get('product') || (window.location.hash.startsWith('#product=') ? window.location.hash.replace('#product=', '') : null);
      if (urlProdId && products.length > 0) {
        const found = products.find(p => p.id === urlProdId);
        if (found) {
          setSelectedProduct(found);
          if (urlParams.get('openShare') === 'true') {
            setSharingProduct(found);
          }
        }
      }
    } catch (e) {
      console.log('Error parsing product URL param:', e);
    }
  }, [products]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [activeCampaignTab, setActiveCampaignTab] = useState<string>('all');

  // Initial Data Fetching from API
  const refreshProducts = async () => {
    try {
      const data = await api.getProducts();
      if (data && Array.isArray(data)) {
        const deletedSet = getDeletedProductIds();
        setProducts(data.filter(p => !deletedSet.has(p.id)));
      }
    } catch (e) {
      console.log('Using local products fallback');
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    // 1. Instantly remove from React memory state
    setProducts(prev => prev.filter(p => p.id !== id));
    // 2. Persist in api / local storage / Firebase Firestore / backend
    try {
      await api.deleteProduct(id);
      return true;
    } catch (err) {
      console.warn('Error deleting product:', err);
      return false;
    }
  };

  const createProduct = async (productData: Partial<Product>): Promise<Product> => {
    try {
      const created = await api.createProduct(productData);
      setProducts(prev => [created, ...prev.filter(p => p.id !== created.id)]);
      return created;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
    try {
      const updated = await api.updateProduct(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      return updated;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const refreshCategories = async () => {
    try {
      const data = await api.getCategories();
      if (data && Array.isArray(data)) {
        setCategories(data);
      }
    } catch (e) {
      console.log('Using local categories fallback');
    }
  };

  const refreshSystemSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data) setSystemSettings(data);
    } catch (e) {
      console.log('Using local system settings fallback');
    }
  };

  const updateSystemSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      const updated = await api.updateSettings(newSettings);
      if (updated) setSystemSettings(updated);
    } catch (e) {
      console.error('Error updating system settings', e);
      setSystemSettings(prev => ({ ...prev, ...newSettings }));
    }
  };

  useEffect(() => {
    refreshProducts();
    refreshCategories();
    refreshSystemSettings();

    // 1. Live Server-Sent Events (SSE) stream for instant zero-latency multi-device broadcast
    let eventSource: EventSource | null = null;
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        eventSource = new EventSource('/api/events');
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'product_deleted' && data.id) {
              const localSet = getDeletedProductIds();
              localSet.add(data.id);
              safeStorage.setItem('amarbazar_deleted_product_ids', JSON.stringify(Array.from(localSet)));
              setProducts(prev => prev.filter(p => p.id !== data.id));
              try {
                const stored = safeStorage.getJSON<Product[]>('amarbazar_products_store', []);
                if (Array.isArray(stored)) {
                  safeStorage.setItem('amarbazar_products_store', JSON.stringify(stored.filter(p => p.id !== data.id)));
                }
              } catch (e) {}
            } else if (data.type === 'product_created' && data.product) {
              const localSet = getDeletedProductIds();
              if (!localSet.has(data.product.id)) {
                setProducts(prev => [data.product, ...prev.filter(p => p.id !== data.product.id)]);
              }
            } else if (data.type === 'product_updated' && data.product) {
              const localSet = getDeletedProductIds();
              if (!localSet.has(data.product.id)) {
                setProducts(prev => prev.map(p => p.id === data.product.id ? { ...p, ...data.product } : p));
              }
            }
          } catch (e) {
            // Ignore parse errors on ping
          }
        };
      }
    } catch (e) {
      console.warn('SSE connection notice:', e);
    }

    // 2. Real-time Firebase Firestore deleted products listener (Instant deletion across all devices)
    let unsubscribeDeletedProducts: (() => void) | null = null;
    try {
      unsubscribeDeletedProducts = firebaseDb.subscribeToDeletedProducts((cloudDeletedIds) => {
        if (cloudDeletedIds && Array.isArray(cloudDeletedIds) && cloudDeletedIds.length > 0) {
          const localSet = getDeletedProductIds();
          let hasNew = false;
          cloudDeletedIds.forEach(id => {
            if (!localSet.has(id)) {
              localSet.add(id);
              hasNew = true;
            }
          });
          if (hasNew) {
            safeStorage.setItem('amarbazar_deleted_product_ids', JSON.stringify(Array.from(localSet)));
            setProducts(prev => prev.filter(p => !localSet.has(p.id)));
          }
        }
      });
    } catch (e) {
      console.warn('Firebase deleted products listener notice:', e);
    }

    // 3. Real-time Firebase Firestore products listener
    let unsubscribeProducts: (() => void) | null = null;
    try {
      unsubscribeProducts = firebaseDb.subscribeToProducts((fbProds) => {
        if (fbProds && Array.isArray(fbProds) && fbProds.length > 0) {
          const deletedSet = getDeletedProductIds();
          const liveList = fbProds.filter(p => !deletedSet.has(p.id));
          setProducts(liveList);
          try {
            safeStorage.setItem('amarbazar_products_store', JSON.stringify(liveList));
          } catch (e) {}
        }
      });
    } catch (e) {
      console.warn('Firebase real-time subscription error:', e);
    }

    // 4. Real-time Firebase Firestore categories listener
    let unsubscribeCategories: (() => void) | null = null;
    try {
      unsubscribeCategories = firebaseDb.subscribeToCategories((fbCats) => {
        if (fbCats && Array.isArray(fbCats) && fbCats.length > 0) {
          setCategories(fbCats);
          try {
            safeStorage.setItem('amarbazar_categories_store', JSON.stringify(fbCats));
          } catch (e) {}
        }
      });
    } catch (e) {}

    // 5. Real-time Firebase Firestore settings listener
    let unsubscribeSettings: (() => void) | null = null;
    try {
      unsubscribeSettings = firebaseDb.subscribeToSettings((fbSettings) => {
        if (fbSettings) {
          setSystemSettings(fbSettings);
        }
      });
    } catch (e) {}

    // 6. Fast polling fallback (every 4 seconds) to guarantee instant multi-device reflection
    const interval = setInterval(() => {
      refreshProducts();
      refreshCategories();
    }, 4000);

    // 7. Sync on tab focus, visibility change, online status with safety debounce
    let lastSyncTime = 0;
    const handleSync = () => {
      const now = Date.now();
      if (now - lastSyncTime < 1500) return;
      lastSyncTime = now;
      refreshProducts();
      refreshCategories();
      refreshSystemSettings();
    };

    const handleProductsUpdated = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        const deletedSet = getDeletedProductIds();
        setProducts(e.detail.filter((p: Product) => !deletedSet.has(p.id)));
      }
    };

    const handleProductDeletedEvent = (e: any) => {
      if (e?.detail?.id) {
        const deletedId = e.detail.id;
        setProducts(prev => prev.filter(p => p.id !== deletedId));
      }
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('amarbazar_products_updated', handleProductsUpdated);
    window.addEventListener('amarbazar_product_deleted', handleProductDeletedEvent);
    window.addEventListener('pageshow', handleSync);
    window.addEventListener('online', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    return () => {
      if (eventSource) {
        try {
          eventSource.close();
        } catch (e) {}
      }
      if (unsubscribeDeletedProducts) {
        try {
          unsubscribeDeletedProducts();
        } catch (e) {}
      }
      if (unsubscribeProducts) {
        try {
          unsubscribeProducts();
        } catch (e) {}
      }
      if (unsubscribeCategories) {
        try {
          unsubscribeCategories();
        } catch (e) {}
      }
      if (unsubscribeSettings) {
        try {
          unsubscribeSettings();
        } catch (e) {}
      }
      clearInterval(interval);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('amarbazar_products_updated', handleProductsUpdated);
      window.removeEventListener('amarbazar_product_deleted', handleProductDeletedEvent);
      window.removeEventListener('pageshow', handleSync);
      window.removeEventListener('online', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
    };
  }, []);

  const prevUserRef = useRef<User | null>(currentUser);

  // Sync role & panel
  useEffect(() => {
    if (currentUser) {
      setActiveRole(currentUser.role);
      safeStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      safeStorage.removeItem('currentUser');
      setActiveRole('customer');
      setActivePanel('customer');
      setSelectedSellerId(null);
      if (prevUserRef.current !== null) {
        setIsAuthOpen(true);
      }
    }
    prevUserRef.current = currentUser;
  }, [currentUser]);

  // Handle Dark mode class on html and body elements
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Handle Color Palette dynamic variable binding
  useEffect(() => {
    safeStorage.setItem('colorPalette', colorPalette);
    safeStorage.setItem('customColorHex', customColorHex);
    let shades: Record<string, string>;
    if (colorPalette === 'custom') {
      shades = generateShadesFromHex(customColorHex);
    } else {
      shades = PALETTES[colorPalette] || PALETTES.amber;
    }
    Object.entries(shades).forEach(([shade, hexValue]) => {
      document.documentElement.style.setProperty(`--system-amber-${shade}`, hexValue as string);
    });
  }, [colorPalette, customColorHex]);

  // Cart operations
  const areVariantsEqual = (v1?: Record<string, string>, v2?: Record<string, string>) => {
    if (!v1 && !v2) return true;
    if (!v1 || !v2) return false;
    const k1 = Object.keys(v1);
    const k2 = Object.keys(v2);
    if (k1.length !== k2.length) return false;
    return k1.every(key => v1[key] === v2[key]);
  };

  const addToCart = (product: Product, quantity = 1, selectedVariants?: Record<string, string>) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => 
        item.product.id === product.id && areVariantsEqual(item.selectedVariants, selectedVariants)
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx].quantity = newQty;
        const basePrice = getProductUnitPrice(product, selectedVariants || {});
        updated[existingIdx].calculatedPrice = getBulkDiscountedPrice(product, basePrice, newQty);
        return updated;
      } else {
        const basePrice = getProductUnitPrice(product, selectedVariants || {});
        const finalPrice = getBulkDiscountedPrice(product, basePrice, quantity);
        return [...prev, { product, quantity, selectedVariants, calculatedPrice: finalPrice }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedVariants?: Record<string, string>) => {
    setCart(prev => prev.filter(item => 
      !(item.product.id === productId && areVariantsEqual(item.selectedVariants, selectedVariants))
    ));
  };

  const updateCartQuantity = (productId: string, quantity: number, selectedVariants?: Record<string, string>) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariants);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && areVariantsEqual(item.selectedVariants, selectedVariants)) {
        const basePrice = getProductUnitPrice(item.product, item.selectedVariants || {});
        const finalPrice = getBulkDiscountedPrice(item.product, basePrice, quantity);
        return { ...item, quantity, calculatedPrice: finalPrice };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      activeRole,
      setActiveRole,
      language,
      setLanguage,
      currency,
      setCurrency,
      formatPrice,
      theme,
      setTheme,
      colorPalette,
      setColorPalette,
      customColorHex,
      setCustomColorHex,
      products,
      categories,
      cart,
      wishlist,
      notifications,
      systemSettings,
      updateSystemSettings,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      activePanel,
      setActivePanel,
      sellerActiveTab,
      setSellerActiveTab,
      selectedProduct,
      setSelectedProduct,
      sharingProduct,
      setSharingProduct,
      shareProduct,
      isCartOpen,
      setIsCartOpen,
      isAuthOpen,
      setIsAuthOpen,
      isAiOpen,
      setIsAiOpen,
      trackingOrderId,
      setTrackingOrderId,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      selectedSellerId,
      setSelectedSellerId,
      activeCampaignTab,
      setActiveCampaignTab,
      refreshProducts,
      refreshCategories,
      deleteProduct,
      createProduct,
      updateProduct,
      isCustomerOnlyMode,
      setIsCustomerOnlyMode,
      isMobileChatActive,
      setIsMobileChatActive
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
