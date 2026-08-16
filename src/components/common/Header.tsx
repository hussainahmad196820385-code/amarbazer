import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Heart, ShoppingCart, User as UserIcon, 
  Globe, Sun, Moon, Bell, Sparkles, Store, ShieldCheck, ChevronDown, 
  LogOut, PhoneCall, Truck, Tag, HelpCircle, Menu, X, MapPin, Smartphone, Map, CheckCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../translations';
import { Role } from '../../types';
import { SHWAPNO_DETAILED_CATEGORIES } from '../../data/categoriesData';

export const Header: React.FC = () => {
  const { 
    currentUser, setCurrentUser, activeRole, setActiveRole, 
    language, setLanguage, theme, setTheme, 
    cart, wishlist, notifications, activePanel, setActivePanel,
    setIsCartOpen, setIsAuthOpen, setIsAiOpen, setTrackingOrderId,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    categories, isCustomerOnlyMode, setIsCustomerOnlyMode,
    activeCampaignTab, setActiveCampaignTab
  } = useApp();

  const [campaignList, setCampaignList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('market_campaigns');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading campaigns in Header:', e);
    }
    return [
      { id: 'all', name: 'SUMMER FEST', nameBn: 'সামার ফেস্ট', isActive: true },
      { id: 'unilever', name: 'UNILEVER-STOCK & SAVE', nameBn: 'ইউনিলিভার স্টক সেভ', isActive: true },
      { id: 'bogo', name: 'GREAT DEALS', nameBn: 'বিশাল ডিলস', isActive: true },
      { id: 'summer', name: 'BUY & SAVE MORE', nameBn: 'বেশি কিনুন বেশি বাঁচান', isActive: true }
    ];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('market_campaigns');
        if (saved) {
          setCampaignList(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Initial fetch
    try {
      const saved = localStorage.getItem('market_campaigns');
      if (saved) {
        setCampaignList(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, [activePanel]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('Dhaka');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [hoveredMainId, setHoveredMainId] = useState<string | null>(null);
  const [hoveredSubId, setHoveredSubId] = useState<string | null>(null);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + ((item.product.discountPrice || item.product.price) * item.quantity), 0);
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const BANGLADESH_DISTRICTS = [
    'Dhaka', 'Gazipur', 'Narayanganj', 'Chittagong', 'Cox\'s Bazar', 'Sylhet', 'Moulvibazar', 
    'Rajshahi', 'Bogra', 'Khulna', 'Jessore', 'Barisal', 'Rangpur', 'Mymensingh'
  ];

  const handleRoleChange = (role: Role) => {
    setActiveRole(role);
    if (role === 'customer') setActivePanel('customer');
    else if (role === 'seller') setActivePanel('seller');
    else if (role === 'admin') setActivePanel('admin');
  };

  // 1. Shwapno Style Customer Header Render
  if (activePanel === 'customer' || activePanel === 'outlets') {
    return (
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 shadow-md">
        
        {/* Shwapno RED Main Brand Header */}
        <div className="bg-[#da1c24] text-white">
          <div className="max-w-[1800px] mx-auto px-1.5 sm:px-2 md:px-3 py-2 md:py-3 flex items-center justify-between gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4">
            
            {/* Logo Section */}
            <div 
              onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
              className="flex items-center space-x-1 sm:space-x-2 cursor-pointer shrink-0 select-none"
            >
              <div className="bg-white text-[#da1c24] px-2.5 sm:px-4 py-1.5 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs md:text-sm tracking-tight flex items-center space-x-1 sm:space-x-1.5 shadow-md border border-red-600/10 shrink-0">
                <span className="bg-[#da1c24] text-white px-1 sm:px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-black">BD</span>
                <span className="whitespace-nowrap">{language === 'bn' ? 'আমার স্টোর' : 'AMAR STORE'}</span>
              </div>
            </div>

            {/* Delivery Location Selector with Truck Icon */}
            <div className="relative hidden md:block select-none shrink-0">
              <button 
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-[11px] font-extrabold transition border border-white/10"
              >
                <Truck className="w-4 h-4 text-yellow-300" />
                <span className="max-w-[120px] truncate">
                  {language === 'bn' ? `ডেলিভারি এলাকা: ${deliveryLocation}` : `Select your delivery location`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/85" />
              </button>

              {showLocationDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLocationDropdown(false)} />
                  <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl p-2.5 z-50 max-h-64 overflow-y-auto">
                    <div className="text-[9px] uppercase font-black text-slate-400 px-2.5 py-1.5 tracking-wider">Select Area</div>
                    {BANGLADESH_DISTRICTS.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setDeliveryLocation(loc);
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-between ${
                          deliveryLocation === loc 
                            ? 'bg-red-50 dark:bg-red-950/40 text-[#da1c24] dark:text-red-400 font-black' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <span>{loc}</span>
                        {deliveryLocation === loc && <CheckCircle className="w-3.5 h-3.5 text-[#da1c24] fill-[#da1c24]/10" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Central Search Box - Guaranteed visible & perfectly fit on all screen sizes */}
            <div className="flex-1 min-w-0 max-w-md xl:max-w-lg relative flex shadow-xs rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'কাঁচাবাজার ও পণ্য খুঁজুন...' : 'Search products...'}
                className="w-full min-w-0 bg-transparent text-slate-900 dark:text-white pl-2.5 sm:pl-4 pr-7 sm:pr-10 py-1.5 sm:py-2.5 text-[11px] sm:text-xs font-bold sm:font-extrabold focus:outline-none border-0 shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-9 sm:right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
              <button 
                type="button"
                className="bg-[#f6a51d] hover:bg-amber-500 text-slate-950 px-2.5 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-center transition border-l border-amber-400/20 shadow-xs shrink-0 select-none cursor-pointer"
                title={language === 'bn' ? 'অনুসন্ধান করুন' : 'Search'}
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-black" />
              </button>
            </div>

            {/* Download App Yellow Pill Button */}
            <div className="hidden lg:block shrink-0">
              <a 
                href="#download-app" 
                className="flex items-center space-x-1.5 bg-[#f6a51d] hover:bg-amber-500 text-slate-950 text-[11px] font-black px-3.5 py-2.5 rounded-xl transition shadow-xs border border-amber-400/20 uppercase tracking-wide"
              >
                <Smartphone className="w-4 h-4 animate-bounce" />
                <span>{language === 'bn' ? 'অ্যাপ ডাউনলোড' : 'Download App Now'}</span>
              </a>
            </div>

            {/* Language Switcher - Compact on mobile */}
            <button 
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="px-2 sm:px-3.5 py-1.5 sm:py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black tracking-wider transition hover:border-white/40 shrink-0 select-none"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <span className="sm:hidden">{language === 'bn' ? 'EN' : 'বাং'}</span>
              <span className="hidden sm:inline">{language === 'bn' ? 'ENGLISH' : 'বাংলা'}</span>
            </button>

            {/* User Account Login/Signup or Avatar - Compact on mobile */}
            <div className="relative shrink-0">
              {currentUser ? (
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg sm:rounded-xl p-1 sm:p-1.5 transition"
                >
                  <img 
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                    alt={currentUser.name} 
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-[#f6a51d]"
                  />
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/80" />
                </button>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-transparent hover:bg-white/5 text-white hover:text-yellow-300 text-[10px] sm:text-[11px] font-black px-2 sm:px-3.5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition flex items-center space-x-1 sm:space-x-1.5 border border-white/10 hover:border-white/30 shadow-xs shrink-0"
                >
                  <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  <span className="hidden sm:inline">{language === 'bn' ? 'সাইন ইন / সাইন আপ' : 'Sign in / Sign up'}</span>
                </button>
              )}

              {isUserMenuOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-xs text-slate-800 dark:text-slate-100">
                  <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-black text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-slate-400 text-[10px] truncate font-bold">{currentUser.phone || currentUser.email}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-red-100 dark:bg-red-950/40 text-[#da1c24] dark:text-red-400 font-black rounded-lg text-[9px] uppercase">
                      {currentUser.role}
                    </span>
                  </div>

                  <button 
                    onClick={() => { setActivePanel('customer_profile'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 text-slate-700 dark:text-slate-200 font-extrabold"
                  >
                    <UserIcon className="w-4 h-4 text-[#da1c24]" />
                    <span>{language === 'bn' ? 'আমার প্রোফাইল' : 'My Profile'}</span>
                  </button>

                  {!isCustomerOnlyMode && (
                    <>
                      {currentUser.role === 'seller' && (
                        <button 
                          onClick={() => { setActivePanel('seller'); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 text-slate-700 dark:text-slate-200 font-extrabold"
                        >
                          <Store className="w-4 h-4 text-[#da1c24]" />
                          <span>{language === 'bn' ? 'বিক্রেতা প্যানেল' : 'Seller Panel'}</span>
                        </button>
                      )}
                      {currentUser.role === 'admin' && (
                        <button 
                          onClick={() => { setActivePanel('admin'); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 text-slate-700 dark:text-slate-200 font-extrabold"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#da1c24]" />
                          <span>{language === 'bn' ? 'এডমিন প্যানেল' : 'Admin Panel'}</span>
                        </button>
                      )}
                    </>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                    <button 
                      onClick={() => { setCurrentUser(null); setActivePanel('customer'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center space-x-2.5 font-black"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{language === 'bn' ? 'লগআউট করুন' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Shwapno Secondary Navigation Bar (White Background, slate text) */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 relative">
          <div className="max-w-[1800px] mx-auto px-1 sm:px-2 md:px-3 py-2 flex items-center justify-between gap-4 text-xs font-black uppercase tracking-wider">
            
            {/* Left SHOP BY CATEGORY Dropdown Toggle */}
            <div className="relative select-none">
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center space-x-2 text-slate-900 dark:text-white hover:text-[#da1c24] dark:hover:text-red-400 transition"
              >
                <Menu className="w-4 h-4 text-[#da1c24]" />
                <span>{language === 'bn' ? 'ক্যাটাগরি' : 'SHOP BY CATEGORY'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCategoryDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => { setShowCategoryDropdown(false); setHoveredMainId(null); setHoveredSubId(null); }} />
                  <div 
                    className="absolute left-0 mt-3 w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl p-2.5 z-50"
                    onMouseLeave={() => {
                      setHoveredMainId(null);
                      setHoveredSubId(null);
                    }}
                  >
                    <div className="text-[9px] uppercase font-black text-slate-400 px-3 py-2 tracking-widest border-b border-slate-100 dark:border-slate-900 mb-1">
                      {language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}
                    </div>
                    {SHWAPNO_DETAILED_CATEGORIES.map((cat) => {
                      const hasSubs = cat.subCategories && cat.subCategories.length > 0;
                      const isHovered = hoveredMainId === cat.id;
                      
                      return (
                        <div 
                          key={cat.id} 
                          className="relative"
                          onMouseEnter={() => {
                            setHoveredMainId(cat.id);
                            setHoveredSubId(null);
                          }}
                        >
                          <button
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              setSearchQuery('');
                              setShowCategoryDropdown(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-between ${
                              selectedCategory === cat.id || isHovered
                                ? 'bg-red-50 dark:bg-red-950/40 text-[#da1c24] dark:text-red-400 font-black' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <span>{cat.emoji}</span>
                              <span className="truncate">{language === 'bn' ? cat.nameBn : cat.name}</span>
                            </div>
                            {hasSubs && <span className="text-slate-400 dark:text-slate-600 text-[9px]">▶</span>}
                          </button>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchQuery('');
                        setShowCategoryDropdown(false);
                        setHoveredMainId(null);
                        setHoveredSubId(null);
                      }}
                      className="w-full text-center mt-1.5 py-2 text-[10px] font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition"
                    >
                      {language === 'bn' ? 'সব ক্যাটাগরি দেখুন' : 'View All Products'}
                    </button>

                    {/* SECOND TIER FLYOUT */}
                    {hoveredMainId && (
                      (() => {
                        const activeMain = SHWAPNO_DETAILED_CATEGORIES.find(m => m.id === hoveredMainId);
                        if (!activeMain || !activeMain.subCategories || activeMain.subCategories.length === 0) return null;
                        
                        return (
                          <div 
                            className="absolute left-[102%] top-0 w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl p-2.5 z-50 space-y-1"
                            onMouseEnter={() => setHoveredMainId(activeMain.id)}
                          >
                            <div className="text-[9px] uppercase font-black text-slate-400 px-3 py-1 tracking-widest border-b border-slate-100 dark:border-slate-900/40 mb-1">
                              {language === 'bn' ? activeMain.nameBn : activeMain.name}
                            </div>
                            <div className="max-h-[380px] overflow-y-auto space-y-0.5">
                              {activeMain.subCategories.map((sub) => {
                                const hasSubSubs = sub.subSubCategories && sub.subSubCategories.length > 0;
                                const isSubHovered = hoveredSubId === sub.id;
                                return (
                                  <div 
                                    key={sub.id}
                                    className="relative"
                                    onMouseEnter={() => setHoveredSubId(sub.id)}
                                  >
                                    <button
                                      onClick={() => {
                                        setSelectedCategory(sub.id);
                                        setSearchQuery('');
                                        setShowCategoryDropdown(false);
                                      }}
                                      className={`w-full flex items-center justify-between p-2 rounded-lg text-[11px] text-left transition-colors ${
                                        selectedCategory === sub.id || isSubHovered
                                          ? 'bg-red-50 dark:bg-red-950/40 text-[#da1c24] dark:text-red-400 font-black'
                                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                                      }`}
                                    >
                                      <span className="truncate">{language === 'bn' ? sub.nameBn : sub.name}</span>
                                      {hasSubSubs && <span className="text-slate-400 dark:text-slate-600 text-[9px]">▶</span>}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* THIRD TIER FLYOUT */}
                    {hoveredMainId && hoveredSubId && (
                      (() => {
                        const activeMain = SHWAPNO_DETAILED_CATEGORIES.find(m => m.id === hoveredMainId);
                        const activeSub = activeMain?.subCategories?.find(s => s.id === hoveredSubId);
                        if (!activeSub || !activeSub.subSubCategories || activeSub.subSubCategories.length === 0) return null;
                        
                        return (
                          <div 
                            className="absolute left-[204%] top-0 w-56 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                            onMouseEnter={() => {
                              setHoveredMainId(activeMain.id);
                              setHoveredSubId(activeSub.id);
                            }}
                          >
                            <div className="text-[9px] uppercase font-black text-[#da1c24] dark:text-red-400 px-3 py-1 tracking-widest border-b border-slate-100 dark:border-slate-900/40 mb-1">
                              {language === 'bn' ? activeSub.nameBn : activeSub.name}
                            </div>
                            <div className="max-h-[340px] overflow-y-auto space-y-0.5">
                              {activeSub.subSubCategories.map((subSub) => {
                                return (
                                  <button
                                    key={subSub.id}
                                    onClick={() => {
                                      setSelectedCategory(subSub.id);
                                      setSearchQuery('');
                                      setShowCategoryDropdown(false);
                                      setHoveredMainId(null);
                                      setHoveredSubId(null);
                                    }}
                                    className={`w-full block p-2 rounded-lg text-[11px] text-left transition-colors ${
                                      selectedCategory === subSub.id
                                        ? 'bg-[#da1c24]/10 text-[#da1c24] font-black'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                                    }`}
                                  >
                                    {language === 'bn' ? subSub.nameBn : subSub.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()
                    )}

                  </div>
                </>
              )}
            </div>

            {/* Middle Nav Links */}
            <div className="hidden md:flex items-center space-x-5 lg:space-x-7 text-[11px] font-black">
              {campaignList.filter(link => link.isActive !== false).map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveCampaignTab(link.id);
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className={`transition-all relative py-1 border-b-2 hover:text-[#da1c24] ${
                    activeCampaignTab === link.id
                      ? 'text-[#da1c24] border-[#da1c24] font-black'
                      : 'text-slate-600 dark:text-slate-400 border-transparent hover:border-[#da1c24]/30'
                  }`}
                >
                  {language === 'bn' ? link.nameBn : link.name}
                </button>
              ))}
            </div>

            {/* Right Info Links */}
            <div className="flex items-center space-x-4 shrink-0 text-[11px] font-black">
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                  setActivePanel('outlets');
                }}
                className="flex items-center space-x-1.5 hover:text-[#da1c24] text-slate-600 dark:text-slate-400 transition cursor-pointer"
              >
                <Store className="w-4 h-4 text-blue-500" />
                <span className="hidden sm:inline">{language === 'bn' ? 'আউটলেটসমূহ' : 'Our Outlets'}</span>
              </button>
            </div>

          </div>
        </div>



      </header>
    );
  }

  // 2. Default Emerald/Teal Management Dashboard Header Render (For Sellers & Admins)
  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-[1800px] mx-auto px-1 sm:px-2 md:px-3 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActivePanel('customer'); setSelectedCategory(null); }}>
          <div className="relative w-10 h-10 rounded-xl bg-[#da1c24] flex items-center justify-center text-white font-black text-xl shadow-md">
            <span>আ</span>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 border-2 border-white text-[8px] font-bold">
              BD
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                {language === 'bn' ? 'আমার বাজার' : 'AmarBazar'}
              </span>
              <span className="text-xs bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-300 dark:border-red-800">
                BD
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {getTranslation(language, 'tagline')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          <button 
            onClick={() => setActivePanel('customer')}
            className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <ShoppingBag className="w-4 h-4 text-red-500" />
            <span>{language === 'bn' ? 'কাস্টমার সাইট' : 'Customer View'}</span>
          </button>

          {/* User Account / Profile */}
          <div className="relative">
            {currentUser ? (
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                  alt={currentUser.name} 
                  className="w-7 h-7 rounded-full object-cover border border-red-500"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
              >
                {getTranslation(language, 'login')}
              </button>
            )}

            {isUserMenuOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold rounded text-[10px] uppercase">
                    {currentUser.role}
                  </span>
                </div>

                <button 
                  onClick={() => { setActivePanel('customer'); setIsUserMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-200"
                >
                  <UserIcon className="w-4 h-4 text-red-600" />
                  <span>{getTranslation(language, 'profile')}</span>
                </button>

                {!isCustomerOnlyMode && currentUser.role === 'seller' && (
                  <button 
                    onClick={() => { setActivePanel('seller'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <Store className="w-4 h-4 text-red-600" />
                    <span>{getTranslation(language, 'sellerPanel')}</span>
                  </button>
                )}

                {!isCustomerOnlyMode && currentUser.role === 'admin' && (
                  <button 
                    onClick={() => { setActivePanel('admin'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>{getTranslation(language, 'adminPanel')}</span>
                  </button>
                )}

                <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                  <button 
                    onClick={() => { setCurrentUser(null); setActivePanel('customer'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{getTranslation(language, 'logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
