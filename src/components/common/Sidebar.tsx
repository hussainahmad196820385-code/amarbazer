import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../translations';
import { Role } from '../../types';
import { api } from '../../services/api';
import { hasStaffPermission } from '../../lib/permissions';
import { 
  Home, Sliders, Sun, Moon, Globe, 
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  User, ShieldCheck, Store, LogOut, Sparkles, ShoppingBag, Info,
  LayoutDashboard, Star, MessageSquare, ClipboardList, AppWindow, Play, Plus, BookOpen, Volume2,
  Truck, DollarSign, CheckSquare, Package, CreditCard, Users, KeyRound, UserCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentUser, setCurrentUser,
    activeRole, setActiveRole,
    activePanel, setActivePanel,
    language, setLanguage,
    theme, setTheme,
    setIsAiOpen, setIsAuthOpen,
    products,
    sellerActiveTab, setSellerActiveTab
  } = useApp();

  const [pendingSellersCount, setPendingSellersCount] = useState<number>(0);
  const pendingProductsCount = (products || []).filter(p => p.isApproved === false).length;

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      let isMounted = true;
      const fetchCount = async () => {
        try {
          const list = await api.getSellers();
          if (isMounted && Array.isArray(list)) {
            setPendingSellersCount(list.filter(s => !s.isApproved).length);
          }
        } catch {
          // Gracefully handled by local fallback in api.ts
        }
      };
      fetchCount();
      const interval = setInterval(fetchCount, 15000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [currentUser, activePanel]);

  const handleRoleChange = (role: Role) => {
    setActiveRole(role);
    if (role === 'customer') setActivePanel('customer');
    else if (role === 'seller') setActivePanel('seller');
    else if (role === 'admin') setActivePanel('admin');
  };

  // Load state from localStorage or defaults
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  const [isFullDisplay, setIsFullDisplay] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_fulldisplay');
    return saved === 'true';
  });

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('sidebar_fulldisplay', String(isFullDisplay));
    window.dispatchEvent(new Event('resize'));
  }, [isFullDisplay]);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or not supported:', err);
    }
  };

  // If Full Display mode is active, we render a small float button to restore the sidebar
  if (isFullDisplay) {
    return (
      <button
        id="sidebar-restore-btn"
        onClick={() => setIsFullDisplay(false)}
        className="fixed bottom-6 left-6 z-50 bg-amber-500 hover:bg-amber-600 text-slate-950 p-3 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group"
        title={language === 'bn' ? 'মেনু প্রদর্শন করুন' : 'Show Sidebar'}
      >
        <Maximize2 className="w-5 h-5 animate-pulse group-hover:animate-none" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-[10px] font-bold uppercase tracking-wider pl-0 group-hover:pl-2 whitespace-nowrap">
          {language === 'bn' ? 'মেনু দেখান' : 'Show Menu'}
        </span>
      </button>
    );
  }

  // Helper for active menu class matching
  const getMenuClass = (panelKey: string) => {
    const isActive = activePanel === panelKey;
    if (isActive) {
      return 'bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold';
    }
    return 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent';
  };

  const getSellerTabClass = (tabKey: 'overview' | 'products' | 'orders' | 'withdrawals' | 'settings' | 'subscription' | 'roles_permissions') => {
    const isActive = activePanel === 'seller' && sellerActiveTab === tabKey;
    if (isActive) {
      return 'bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold';
    }
    return 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent';
  };

  return (
    <>
      <aside
        id="main-sidebar"
        className={`hidden md:flex relative h-screen bg-[#fafbfc] dark:bg-slate-900 flex-col justify-between shrink-0 transition-all duration-300 z-30 font-sans shadow-xs overflow-hidden ${
          isCollapsed ? 'w-0 border-r-0' : 'w-64 border-r border-slate-200 dark:border-slate-800'
        }`}
      >

      {/* Top Brand Area */}
      <div>
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between overflow-hidden">
          <div 
            onClick={() => { setActivePanel('dashboard_home'); }}
            className="flex items-center space-x-2.5 cursor-pointer select-none shrink-0"
          >
            {/* Logo box */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md border border-amber-400/20">
              <span className="font-serif italic text-lg">আ</span>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-950 text-[6px] font-bold text-amber-500 border border-amber-500/30">
                ERP
              </span>
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white block font-serif italic">
                  AMARBAZAR V2.4
                </span>
                <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">
                  Digital ERP Node
                </span>
              </div>
            )}
          </div>

          {/* Minimize / Collapse quick icon next to logo */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 p-1.5 rounded-lg transition cursor-pointer"
              title={language === 'bn' ? 'মেনু সংকুচিত করুন' : 'Collapse Menu'}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* LANGUAGE SWITCHER BAR */}
        {!isCollapsed && (
          <div className="px-4 pt-3 pb-1 flex flex-col space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 flex items-center tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              ● LANGUAGE:
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100/60 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => setLanguage('en')}
                className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                  language === 'ar'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                AR
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                  language === 'bn'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                BN
              </button>
            </div>
          </div>
        )}

        {/* CONTROL ROW IN A PILL/CONTAINER */}
        {!isCollapsed && (
          <div className="px-4 py-2">
            <div className="flex items-center justify-around bg-slate-100/60 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              {/* Sun Toggler */}
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg transition ${
                  theme === 'light' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-900'
                }`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

              {/* Moon Toggler */}
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg transition ${
                  theme === 'dark' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-900'
                }`}
                title="Night Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>

              {/* Browser Fullscreen (Entire Screen) */}
              <button
                onClick={toggleBrowserFullscreen}
                className={`p-1.5 rounded-lg transition ${
                  isFullscreen ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-900'
                }`}
                title={language === 'bn' ? 'সম্পূর্ণ স্ক্রিন প্রদর্শন (ফুল ডিসপ্লে)' : 'Full Screen Display'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Sidebar Minimize (Full Canvas) */}
              <button
                onClick={() => setIsFullDisplay(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
                title={language === 'bn' ? 'সাইডবার মিনিমাইজ (ফুল ক্যানভাস)' : 'Minimize Sidebar'}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {/* Inbox shortcut */}
              <button
                onClick={() => setActivePanel('customer_messages')}
                className={`p-1.5 rounded-lg transition ${
                  activePanel === 'customer_messages' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-900'
                }`}
                title="Customer Helpdesk Inbox"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* COLLAPSED QUICK SWITCHERS */}
        {isCollapsed && (
          <div className="flex flex-col items-center py-3 space-y-3 border-b border-slate-150 dark:border-slate-800/80">
            {/* Language Toggle Icon */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : language === 'en' ? 'ar' : 'bn')}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={language === 'bn' ? 'English' : language === 'en' ? 'العربية' : 'বাংলা'}
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Theme Toggle Icon */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* NAVIGATION MENUS */}
      <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-none">
        
        {/* 1. ACCOUNT & MARKETPLACE SECTION (Always first, putting My Account at the absolute top) */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-[10px] font-black text-slate-400 tracking-wider block px-2.5 uppercase mb-1.5">
              {language === 'bn' ? 'অ্যাকাউন্ট ও কেনাকাটা' : 'Account & Marketplace'}
            </span>
          )}

          {/* MY ACCOUNT / LOGIN (Always at the absolute top of every profile menu) */}
          <button
            onClick={() => {
              if (currentUser) {
                setActivePanel('customer_profile');
              } else {
                setIsAuthOpen(true);
              }
            }}
            className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${
              activePanel === 'customer_profile'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
            }`}
            title={language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account'}
          >
            <User className="w-4 h-4 shrink-0 text-emerald-500" />
            {!isCollapsed && (
              <span className="ml-3 truncate">
                {currentUser 
                  ? (language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account') 
                  : (language === 'bn' ? 'আমার অ্যাকাউন্ট (লগইন)' : 'My Account (Login)')}
              </span>
            )}
          </button>

          {/* BROWSE MARKET */}
          <button
            onClick={() => setActivePanel('customer')}
            className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('customer')}`}
            title="Browse Marketplace"
          >
            <ShoppingBag className="w-4 h-4 shrink-0 text-[#da1c24]" />
            {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'বাজার অনুসন্ধান' : 'Browse Market'}</span>}
          </button>

          {/* ORDER TRACKING & SUPPORT / STORE DIRECTORY */}
          {currentUser?.role === 'customer' || !currentUser ? (
            <button
              onClick={() => setActivePanel('store_directory')}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('store_directory')}`}
              title={language === 'bn' ? 'অর্ডার ট্র্যাক ও সাপোর্ট' : 'Track & Support'}
            >
              <Truck className="w-4 h-4 shrink-0 text-emerald-500" />
              {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'অর্ডার ট্র্যাকিং ও সাপোর্ট' : 'Track & Support'}</span>}
            </button>
          ) : (
            <button
              onClick={() => setActivePanel('store_directory')}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('store_directory')}`}
              title={language === 'bn' ? 'দোকান তালিকা' : 'Store Directory'}
            >
              <Store className="w-4 h-4 shrink-0 text-blue-500" />
              {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'দোকান তালিকা' : 'Store Directory'}</span>}
            </button>
          )}

          {/* REGISTER VENDOR SHOP - ONLY shown to customer accounts */}
          {currentUser && currentUser.role === 'customer' && (
            <button
              onClick={() => setActivePanel('register_vendor')}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('register_vendor')}`}
              title="Register physical shop"
            >
              <Plus className="w-4 h-4 shrink-0 text-indigo-500" />
              {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'বিক্রেতা নিবন্ধন করুন' : 'Register Vendor Shop'}</span>}
            </button>
          )}
        </div>

        {/* 2. SUPER ADMIN CONTROL (Only visible to Admin) */}
        {currentUser && currentUser.role === 'admin' && (
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="text-[10px] font-black text-slate-400 tracking-wider block px-2.5 uppercase mb-1.5 mt-2">
                {language === 'bn' ? 'সুপার এডমিন কন্ট্রোল' : 'Platform Operations'}
              </span>
            )}

            {/* ERP Central Control */}
            <button
              onClick={() => setActivePanel('dashboard_home')}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('dashboard_home')}`}
              title="ERP Central Control"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-violet-500" />
              {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'ইআরপি ড্যাশবোর্ড' : 'ERP Central Control'}</span>}
            </button>

            {/* Admin Operations */}
            <button
              onClick={() => setActivePanel('admin')}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('admin')}`}
              title="Marketplace Core Admin"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'এডমিন ম্যানেজমেন্ট' : 'Admin Operations'}</span>}
            </button>

            {/* System Settings */}
            <button
              onClick={() => setActivePanel('settings')}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('settings')}`}
              title="System Config"
            >
              <Sliders className="w-4 h-4 shrink-0 text-amber-500" />
              {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'সিস্টেম কনফিগারেশন' : 'System Settings'}</span>}
            </button>

            {/* Subscription Pricing */}
            <button
              onClick={() => setActivePanel('subscription_pricing')}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('subscription_pricing')}`}
              title={language === 'bn' ? 'প্রিমিয়াম প্রাইসিং নিয়ন্ত্রণ' : 'Subscription Pricing'}
            >
              <DollarSign className="w-4 h-4 shrink-0 text-orange-500" />
              {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'সাবস্ক্রিপশন নিয়ন্ত্রণ' : 'Subscription Pricing'}</span>}
            </button>
          </div>
        )}

        {/* 3. SELLER HUB (Only visible to Sellers and Admins) */}
        {currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin') && (
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 mb-1.5 mt-2 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                  {currentUser.isStaff ? (language === 'bn' ? 'স্টাফ ড্যাশবোর্ড' : 'Staff Dashboard') : (language === 'bn' ? 'সেলার স্টোর হাব' : 'Seller Store Hub')}
                </span>
                {currentUser.isStaff && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-sm">
                    {currentUser.staffRoleTitle || 'Staff'}
                  </span>
                )}
              </div>
            )}

            {/* Store Dashboard - Overview */}
            <button
              onClick={() => { setActivePanel('seller'); setSellerActiveTab('overview'); }}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getSellerTabClass('overview')}`}
              title={language === 'bn' ? 'স্টোর ওভারভিউ' : 'Store Dashboard'}
            >
              <Store className="w-4 h-4 shrink-0 text-amber-500" />
              {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'স্টোর ওভারভিউ' : 'Store Dashboard'}</span>}
            </button>

            {/* Store Directory */}
            <button
              onClick={() => setActivePanel('store_directory')}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('store_directory')}`}
              title={language === 'bn' ? 'দোকান তালিকা' : 'Store Directory'}
            >
              <Store className="w-4 h-4 shrink-0 text-blue-500" />
              {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'দোকান তালিকা' : 'Store Directory'}</span>}
            </button>

            {/* Seller Applications (Only visible to Admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActivePanel('seller_applications')}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer relative ${getMenuClass('seller_applications')}`}
                title={language === 'bn' ? 'সেলার আবেদনপত্র' : 'Seller Applications'}
              >
                <ClipboardList className="w-4 h-4 shrink-0 text-amber-500" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 truncate">{language === 'bn' ? 'সেলার আবেদনসমূহ' : 'Seller Applications'}</span>
                    {pendingSellersCount > 0 && (
                      <span className="absolute right-3 top-2.5 bg-amber-500 text-slate-950 font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                        {pendingSellersCount}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && pendingSellersCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 animate-ping"></span>
                )}
              </button>
            )}

            {/* Product Approvals (Only visible to Admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActivePanel('product_approvals')}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer relative ${getMenuClass('product_approvals')}`}
                title={language === 'bn' ? 'পণ্য অনুমোদন' : 'Product Approvals'}
              >
                <CheckSquare className="w-4 h-4 shrink-0 text-amber-500" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 truncate">{language === 'bn' ? 'পণ্য অনুমোদন রিভিউ' : 'Product Approvals'}</span>
                    {pendingProductsCount > 0 && (
                      <span className="absolute right-3 top-2.5 bg-rose-500 text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                        {pendingProductsCount}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && pendingProductsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 animate-ping"></span>
                )}
              </button>
            )}

            {/* Manage Products */}
            {(hasStaffPermission(currentUser, 'products_view') || hasStaffPermission(currentUser, 'products_manage')) && (
              <button
                onClick={() => { setActivePanel('seller'); setSellerActiveTab('products'); }}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getSellerTabClass('products')}`}
                title={language === 'bn' ? 'পণ্য ও স্টক' : 'Product Catalog'}
              >
                <Package className="w-4 h-4 shrink-0 text-pink-500" />
                {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'পণ্য ও স্টক' : 'Product Catalog'}</span>}
              </button>
            )}

            {/* Fulfill Orders */}
            {(hasStaffPermission(currentUser, 'orders_view') || hasStaffPermission(currentUser, 'orders_process')) && (
              <button
                onClick={() => { setActivePanel('seller'); setSellerActiveTab('orders'); }}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getSellerTabClass('orders')}`}
                title={language === 'bn' ? 'অর্ডারসমূহ ও ডেলিভারি' : 'Fulfill Orders'}
              >
                <ShoppingBag className="w-4 h-4 shrink-0 text-rose-500" />
                {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'অর্ডার ও ডেলিভারি' : 'Fulfill Orders'}</span>}
              </button>
            )}

            {/* Withdraw & Earnings */}
            {(hasStaffPermission(currentUser, 'withdrawals_view') || hasStaffPermission(currentUser, 'withdrawals_manage')) && (
              <button
                onClick={() => { setActivePanel('seller'); setSellerActiveTab('withdrawals'); }}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getSellerTabClass('withdrawals')}`}
                title={language === 'bn' ? 'আয় ও উত্তোলন' : 'Withdraw & Earnings'}
              >
                <DollarSign className="w-4 h-4 shrink-0 text-emerald-500" />
                {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'আয় ও উত্তোলন' : 'Withdraw & Earnings'}</span>}
              </button>
            )}

            {/* Inventory Workspace */}
            {(hasStaffPermission(currentUser, 'inventory_manage') || hasStaffPermission(currentUser, 'products_manage')) && (
              <button
                onClick={() => setActivePanel('inventory_workspace')}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('inventory_workspace')}`}
                title="Inventory Workspace"
              >
                <ClipboardList className="w-4 h-4 shrink-0 text-teal-500" />
                {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'ইনভেন্টরি তালিকা' : 'Inventory Manager'}</span>}
              </button>
            )}

            {/* Product Reviews */}
            {hasStaffPermission(currentUser, 'reviews_manage') && (
              <button
                onClick={() => setActivePanel('product_reviews')}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getMenuClass('product_reviews')}`}
                title="Customer Feedback"
              >
                <Star className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'গ্রাহক রিভিউ' : 'Product Reviews'}</span>}
              </button>
            )}

            {/* Customer Messages */}
            {hasStaffPermission(currentUser, 'messages_chat') && (
              <button
                onClick={() => setActivePanel('customer_messages')}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer relative ${getMenuClass('customer_messages')}`}
                title="Customer messages"
              >
                <MessageSquare className="w-4 h-4 shrink-0 text-sky-500" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 truncate">{language === 'bn' ? 'গ্রাহক বার্তা' : 'Customer Helpdesk'}</span>
                    <span className="absolute right-3 top-2.5 bg-orange-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      1
                    </span>
                  </>
                )}
                {isCollapsed && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900"></span>
                )}
              </button>
            )}

            {/* Rules & Permissions / রুলস পারমিশন (Right above Shop Settings) */}
            {(!currentUser?.isStaff || currentUser?.role === 'admin') && (
              <button
                onClick={() => { setActivePanel('seller'); setSellerActiveTab('roles_permissions'); }}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getSellerTabClass('roles_permissions')}`}
                title={language === 'bn' ? 'রুলস পারমিশন' : 'Rules & Permissions'}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'রুলস পারমিশন' : 'Rules & Permissions'}</span>}
              </button>
            )}

            {/* Shop Settings */}
            {hasStaffPermission(currentUser, 'store_settings') && (
              <button
                onClick={() => { setActivePanel('seller'); setSellerActiveTab('settings'); }}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getSellerTabClass('settings')}`}
                title={language === 'bn' ? 'দোকান সেটিংস' : 'Shop Settings'}
              >
                <Sliders className="w-4 h-4 shrink-0 text-indigo-500" />
                {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'দোকান সেটিংস' : 'Shop Settings'}</span>}
              </button>
            )}

            {/* Premium Subscription */}
            {(!currentUser?.isStaff || currentUser?.role === 'admin') && (
              <button
                onClick={() => { setActivePanel('seller'); setSellerActiveTab('subscription'); }}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs transition duration-200 cursor-pointer ${getSellerTabClass('subscription')}`}
                title={language === 'bn' ? 'সাবস্ক্রিপশন প্ল্যান' : 'Premium Subscription'}
              >
                <CreditCard className="w-4 h-4 shrink-0 text-amber-500" />
                {!isCollapsed && <span className="ml-3 truncate">{language === 'bn' ? 'সাবস্ক্রিপশন প্ল্যান' : 'Subscription Plan'}</span>}
              </button>
            )}
          </div>
        )}

      </div>

      {/* Bottom Area: Dynamic Profile card */}
      <div className="bg-transparent">

        {currentUser ? (
          <div className="p-3">
            <div className="p-2.5 bg-slate-100/60 dark:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-amber-400/20 uppercase">
                    {currentUser.name.slice(0, 2)}
                  </div>
                  {!isCollapsed && (
                    <div className="ml-2.5 leading-tight min-w-0">
                      <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">
                        {currentUser.name}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold block truncate uppercase">
                        {currentUser.role === 'admin' ? (language === 'bn' ? 'সিস্টেম অপারেটর' : 'SYSTEM OPERATOR') : currentUser.role}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-tr from-[#da1c24] to-red-500 text-white font-black rounded-xl text-xs shadow-md"
            >
              <User className="w-4 h-4" />
              {!isCollapsed && <span>{language === 'bn' ? 'লগইন / সাইন আপ' : 'Login / Register'}</span>}
            </button>
          </div>
        )}

      </div>
    </aside>

    {/* Sleek Vertical Edge Tab Toggle Handle - Flush against the edge so it never overlaps content awkwardly */}
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={`hidden md:flex fixed top-1/2 -translate-y-1/2 z-50 bg-[#10b981] hover:bg-emerald-600 text-white w-3 h-10 rounded-r-md rounded-l-none items-center justify-center shadow-xs cursor-pointer transition-all duration-300 border-t border-b border-r border-emerald-400/20 ${
        isCollapsed ? 'left-0' : 'left-[256px]'
      }`}
      title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
    >
      {isCollapsed ? (
        <ChevronRight className="w-2.5 h-2.5 text-white animate-pulse" />
      ) : (
        <ChevronLeft className="w-2.5 h-2.5 text-white" />
      )}
    </button>
  </>
);
};
