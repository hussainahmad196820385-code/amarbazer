import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../translations';
import { Role } from '../../types';
import { 
  LayoutDashboard, ShoppingBag, ShoppingCart, Store, Menu, X, 
  ChevronRight, ClipboardList, Star, MessageSquare, Plus, Sliders,
  Sun, Moon, Globe, LogOut, ShieldCheck, User, Truck, CreditCard
} from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const {
    currentUser, setCurrentUser,
    activePanel, setActivePanel,
    language, setLanguage,
    theme, setTheme,
    cart, setIsCartOpen, setIsAiOpen,
    setActiveRole, setIsAuthOpen,
    sellerActiveTab, setSellerActiveTab,
    isMobileChatActive
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isMobileChatActive && activePanel === 'customer_messages') {
    return null;
  }

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleTabClick = (panelKey: string) => {
    setActivePanel(panelKey as any);
    setIsMenuOpen(false);
  };

  // Helper for active navigation link
  const isTabActive = (panelKey: string) => {
    return activePanel === panelKey && !isMenuOpen;
  };

  // Decide Tab 1 (Dynamic portal depending on logged-in role)
  const getTab1Panel = () => {
    if (currentUser?.role === 'admin') return 'dashboard_home';
    if (currentUser?.role === 'seller') return 'seller';
    return 'customer';
  };

  const tab1Panel = getTab1Panel();

  return (
    <>
      {/* Dynamic Bottom Tab Bar (Visible on Mobile only) */}
      <nav 
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 md:hidden flex justify-around items-center transition-all"
      >
        {/* Tab 1: Primary Portal (Dynamic) */}
        <button
          onClick={() => handleTabClick(tab1Panel)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
            isTabActive(tab1Panel) 
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950'
          }`}
          style={{ minWidth: '64px', minHeight: '44px' }}
        >
          {currentUser?.role === 'admin' ? (
            <LayoutDashboard className="w-5 h-5 mb-0.5 text-violet-500" />
          ) : currentUser?.role === 'seller' ? (
            <Store className="w-5 h-5 mb-0.5 text-amber-500" />
          ) : (
            <ShoppingBag className="w-5 h-5 mb-0.5 text-[#da1c24]" />
          )}
          <span className="text-[9px] tracking-tight">
            {currentUser?.role === 'admin' ? (language === 'bn' ? 'ইআরপি' : 'ERP') : currentUser?.role === 'seller' ? (language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard') : (language === 'bn' ? 'বাজার' : 'Market')}
          </span>
          {isTabActive(tab1Panel) && (
            <span className="absolute bottom-0 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          )}
        </button>

        {/* Tab 2: Store Directory (Seller/Admin) OR Track & Support (Customer/Guest) */}
        <button
          onClick={() => handleTabClick('store_directory')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
            isTabActive('store_directory') 
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950'
          }`}
          style={{ minWidth: '64px', minHeight: '44px' }}
        >
          {currentUser?.role === 'customer' || !currentUser ? (
            <>
              <Truck className="w-5 h-5 mb-0.5 text-emerald-500" />
              <span className="text-[9px] tracking-tight">
                {language === 'bn' ? 'ট্র্যাকিং' : 'Track'}
              </span>
            </>
          ) : (
            <>
              <Store className="w-5 h-5 mb-0.5 text-blue-500" />
              <span className="text-[9px] tracking-tight">
                {language === 'bn' ? 'দোকানসমূহ' : 'Stores'}
              </span>
            </>
          )}
          {isTabActive('store_directory') && (
            <span className="absolute bottom-0 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          )}
        </button>

        {/* Tab 3: Cart Drawer Trigger */}
        <button
          onClick={() => {
            setIsCartOpen(true);
            setIsMenuOpen(false);
          }}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all text-slate-500 dark:text-slate-400 hover:text-slate-950 relative"
          style={{ minWidth: '64px', minHeight: '44px' }}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5 text-emerald-600 dark:text-emerald-400" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-black text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[9px] tracking-tight">
            {language === 'bn' ? 'কার্ট' : 'Cart'}
          </span>
        </button>

        {/* Tab 4: Messages */}
        <button
          onClick={() => {
            if (currentUser) {
              handleTabClick('customer_messages');
            } else {
              setIsAuthOpen(true);
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
            isTabActive('customer_messages') 
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950'
          }`}
          style={{ minWidth: '64px', minHeight: '44px' }}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5 text-emerald-500" />
          </div>
          <span className="text-[9px] tracking-tight">
            {language === 'bn' ? 'মেসেজ' : 'Messages'}
          </span>
          {currentUser && isTabActive('customer_messages') && (
            <span className="absolute bottom-0 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          )}
        </button>

        {/* Tab 5: Menu Trigger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
            isMenuOpen 
              ? 'text-amber-500 font-bold scale-105' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950'
          }`}
          style={{ minWidth: '64px', minHeight: '44px' }}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] tracking-tight">
            {language === 'bn' ? 'মেনু' : 'Menu'}
          </span>
          {isMenuOpen && (
            <span className="absolute bottom-0 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
          )}
        </button>
      </nav>

      {/* Slide-Up Bottom Drawer Sheet using motion */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop filter overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            {/* Bottom sliding options card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 rounded-t-[32px] border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl max-h-[85vh] overflow-y-auto pb-24 md:hidden font-sans"
            >
              {/* Drag indicator bar */}
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-4" />

              {/* Title & Close button */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-extrabold text-sm text-[#da1c24] uppercase tracking-wider flex items-center">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2"></span>
                    {language === 'bn' ? 'আমার বাজার কন্ট্রোল' : 'AmarBazar Control Panel'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {language === 'bn' ? 'আপনার রোল অনুযায়ী সীমাবদ্ধ সেটিংস' : 'Segmented settings matching your profile'}
                  </p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SECTION: DIGITAL ERP BENTO GRID / MENU LINKS (Role-based filtering) */}
              <div className="space-y-4 mb-6">
                
                {/* 1. ACCOUNT & MARKETPLACE (Visible to everyone, My Account at the absolute top) */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    {language === 'bn' ? 'অ্যাকাউন্ট ও কেনাকাটা' : 'Account & Marketplace'}
                  </span>

                  {/* My Account / Login Link */}
                  <button
                    onClick={() => {
                      if (currentUser) {
                        handleTabClick('customer_profile');
                      } else {
                        setIsAuthOpen(true);
                        setIsMenuOpen(false);
                      }
                    }}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition text-left cursor-pointer ${
                      activePanel === 'customer_profile'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs">
                          {currentUser 
                            ? (language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account') 
                            : (language === 'bn' ? 'আমার অ্যাকাউন্ট (লগইন)' : 'My Account (Login)')}
                        </h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">Manage personal profile & wallet</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Browse Market */}
                    <button
                      onClick={() => handleTabClick('customer')}
                      className={`p-3 rounded-2xl border flex flex-col justify-between items-start transition text-left h-24 cursor-pointer ${
                        activePanel === 'customer'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5 text-[#da1c24] shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs">
                          {language === 'bn' ? 'বাজার অনুসন্ধান' : 'Browse Market'}
                        </h4>
                        <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Explore all items</p>
                      </div>
                    </button>

                    {/* Order Tracking & Support / Store Directory */}
                    <button
                      onClick={() => handleTabClick('store_directory')}
                      className={`p-3 rounded-2xl border flex flex-col justify-between items-start transition text-left h-24 cursor-pointer ${
                        activePanel === 'store_directory'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {currentUser?.role === 'customer' || !currentUser ? (
                        <>
                          <Truck className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                            <h4 className="font-bold text-xs">
                              {language === 'bn' ? 'ট্র্যাকিং ও সাপোর্ট' : 'Track & Support'}
                            </h4>
                            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Live parcel tracker</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Store className="w-5 h-5 text-blue-500 shrink-0" />
                          <div>
                            <h4 className="font-bold text-xs">
                              {language === 'bn' ? 'দোকান তালিকা' : 'Store Directory'}
                            </h4>
                            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Our official stores</p>
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. ADMIN PORTAL (Only visible if admin) */}
                {currentUser && currentUser.role === 'admin' && (
                  <div className="space-y-2.5 mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {language === 'bn' ? 'অপারেটর এবং সিস্টেম এডমিন' : 'Platform Operations (Admin)'}
                    </span>

                    <button
                      onClick={() => handleTabClick('dashboard_home')}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition text-left cursor-pointer ${
                        activePanel === 'dashboard_home'
                          ? 'bg-violet-500/10 border-violet-500 text-violet-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <LayoutDashboard className="w-5 h-5 text-violet-500 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs">{language === 'bn' ? 'ইআরপি ড্যাশবোর্ড' : 'ERP Central Overview'}</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5">Global metrics & financial logs</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleTabClick('admin')}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition text-left cursor-pointer ${
                        activePanel === 'admin'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs">{language === 'bn' ? 'এডমিন অপারেশন্স' : 'Admin Operations'}</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5">Control sellers, users and orders</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleTabClick('settings')}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition text-left cursor-pointer ${
                        activePanel === 'settings'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Sliders className="w-5 h-5 text-amber-500" />
                        <div>
                          <h4 className="font-bold text-xs">{language === 'bn' ? 'সিস্টেম কনফিগারেশন' : 'System Settings'}</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5">Payment gateways & shipping rates</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                )}

                {/* 3. SELLER CONTROLS (Only visible if seller or admin) */}
                {currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin') && (
                  <div className="space-y-2.5 mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {language === 'bn' ? 'স্টোর ম্যানেজমেন্ট (সেলার)' : 'Store Operations (Seller)'}
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Inventory Workspace */}
                      <button
                        onClick={() => handleTabClick('inventory_workspace')}
                        className={`p-3 rounded-2xl border flex flex-col justify-between items-start transition text-left h-24 cursor-pointer ${
                          activePanel === 'inventory_workspace'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs">
                            {language === 'bn' ? 'ইনভেন্টরি' : 'Inventory Workspace'}
                          </h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Manage stock listings</p>
                        </div>
                      </button>

                      {/* Customer Messages */}
                      <button
                        onClick={() => handleTabClick('customer_messages')}
                        className={`p-3 rounded-2xl border flex flex-col justify-between items-start transition text-left h-24 cursor-pointer relative ${
                          activePanel === 'customer_messages'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="relative">
                          <MessageSquare className="w-5 h-5 text-amber-500 shrink-0" />
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs">
                            {language === 'bn' ? 'মেসেজসমূহ' : 'Helpdesk Inbox'}
                          </h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Customer interactions</p>
                        </div>
                      </button>

                      {/* Product Reviews */}
                      <button
                        onClick={() => handleTabClick('product_reviews')}
                        className={`p-3 rounded-2xl border flex flex-col justify-between items-start transition text-left h-24 cursor-pointer ${
                          activePanel === 'product_reviews'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs">
                            {language === 'bn' ? 'কাস্টমার রিভিউ' : 'Product Reviews'}
                          </h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Product feedback logs</p>
                        </div>
                      </button>

                      {/* Seller Dashboard */}
                      <button
                        onClick={() => handleTabClick('seller')}
                        className={`p-3 rounded-2xl border flex flex-col justify-between items-start transition text-left h-24 cursor-pointer ${
                          activePanel === 'seller' && (sellerActiveTab === 'overview' || sellerActiveTab === 'products' || sellerActiveTab === 'orders' || sellerActiveTab === 'withdrawals')
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <Store className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs">
                            {language === 'bn' ? 'ড্যাশবোর্ড' : 'Seller Dashboard'}
                          </h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Manage orders & profit</p>
                        </div>
                      </button>

                      {/* Premium Subscription */}
                      <button
                        onClick={() => {
                          setSellerActiveTab('subscription');
                          handleTabClick('seller');
                        }}
                        className={`p-3 rounded-2xl border flex flex-col justify-between items-start transition text-left h-24 cursor-pointer ${
                          activePanel === 'seller' && sellerActiveTab === 'subscription'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs">
                            {language === 'bn' ? 'সাবস্ক্রিপশন প্ল্যান' : 'Subscription Plan'}
                          </h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">View & renew pricing tiers</p>
                        </div>
                      </button>

                      {/* Shop Settings */}
                      <button
                        onClick={() => {
                          setSellerActiveTab('settings');
                          handleTabClick('seller');
                        }}
                        className={`p-3 rounded-2xl border flex flex-col justify-between items-start transition text-left h-24 cursor-pointer ${
                          activePanel === 'seller' && sellerActiveTab === 'settings'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <Sliders className="w-5 h-5 text-indigo-500 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs">
                            {language === 'bn' ? 'দোকান সেটিংস' : 'Shop Settings'}
                          </h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Set logo, banner & details</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. CUSTOMER ONLY ACTIONS */}
                {(!currentUser || currentUser.role === 'customer') && (
                  <div className="space-y-2.5 mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {language === 'bn' ? 'শপ রেজিস্ট্রেশন' : 'SaaS Merchant Hub'}
                    </span>

                    {currentUser ? (
                      <button
                        onClick={() => handleTabClick('register_vendor')}
                        className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition text-left cursor-pointer ${
                          activePanel === 'register_vendor'
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Plus className="w-5 h-5 text-indigo-500" />
                          <div>
                            <h4 className="font-bold text-xs">{language === 'bn' ? 'মার্চেন্ট শপ খুলুন' : 'Open SaaS Store'}</h4>
                            <p className="text-[9px] text-slate-400 mt-0.5">Start selling as an official partner</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        {language === 'bn' ? 'শপ রেজিস্ট্রেশন করার জন্য আগে লগইন করুন' : 'Sign in to register your digital storefront'}
                      </p>
                    )}
                  </div>
                )}

              </div>

              {/* SECTION: LANGUAGE & THEME TOGGLERS */}
              <div className="space-y-3 mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'সিস্টেম ভাষা ও থিম সেটিংস' : 'Language & Theme Preferences'}
                </span>

                <div className="grid grid-cols-2 gap-3">
                  {/* Language switch */}
                  <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                    <span className="text-[8px] font-black text-slate-400 px-1.5 uppercase block mb-1">Language</span>
                    <div className="grid grid-cols-3 gap-0.5">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`py-1 text-[9px] font-bold rounded-lg ${language === 'en' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-500'}`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage('ar')}
                        className={`py-1 text-[9px] font-bold rounded-lg ${language === 'ar' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-500'}`}
                      >
                        AR
                      </button>
                      <button
                        onClick={() => setLanguage('bn')}
                        className={`py-1 text-[9px] font-bold rounded-lg ${language === 'bn' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-500'}`}
                      >
                        BN
                      </button>
                    </div>
                  </div>

                  {/* Theme switch */}
                  <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                    <span className="text-[8px] font-black text-slate-400 px-1.5 uppercase block mb-1">Theme Mode</span>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => setTheme('light')}
                        className={`py-1 text-[9px] font-bold rounded-lg flex items-center justify-center space-x-1 ${theme === 'light' ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-xs' : 'text-slate-400'}`}
                      >
                        <Sun className="w-3 h-3" />
                        <span>Light</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`py-1 text-[9px] font-bold rounded-lg flex items-center justify-center space-x-1 ${theme === 'dark' ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-xs' : 'text-slate-400'}`}
                      >
                        <Moon className="w-3 h-3" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: OPERATOR SESSION CARD / USER LOGIN TRIGGER */}
              {currentUser ? (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-400/20 uppercase">
                      {currentUser.name.slice(0, 2)}
                    </div>
                    <div className="ml-3 leading-tight min-w-0">
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                        {currentUser.name}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold block truncate uppercase">
                        {currentUser.role} • {currentUser.phone || currentUser.email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      setActivePanel('customer');
                      setIsMenuOpen(false);
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition cursor-pointer"
                    title="Logout Session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-tr from-[#da1c24] to-red-500 text-white font-black rounded-2xl text-xs shadow-lg"
                >
                  <User className="w-4.5 h-4.5" />
                  <span>{language === 'bn' ? 'সাইন ইন / রেজিস্ট্রেশন করুন' : 'Sign In / Register Account'}</span>
                </button>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

