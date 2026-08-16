import React, { useState, useEffect } from 'react';
import { Store, Search, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SellerStore, Product } from '../../types';
import { api } from '../../services/api';

export const OutletsView: React.FC = () => {
  const { language, setActivePanel, setSelectedSellerId, products, refreshProducts } = useApp();
  const [outlets, setOutlets] = useState<SellerStore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        setLoading(true);
        const data = await api.getSellers();
        // Only show approved/verified stores
        const approvedOnly = (data || []).filter(store => store.isApproved);
        setOutlets(approvedOnly);
      } catch (err) {
        setError('Failed to load outlets');
      } finally {
        setLoading(false);
      }
    };
    fetchOutlets();
  }, []);

  // Calculate product count for each seller
  const getProductCount = (sellerId: string): number => {
    return products.filter((p: Product) => p.sellerId === sellerId).length;
  };

  const handleVisitStore = (storeId: string) => {
    setSelectedSellerId(storeId);
    setActivePanel('customer');
  };

  // Filtered outlets list
  const filteredOutlets = outlets.filter((store) => {
    const query = searchQuery.toLowerCase();
    const nameEn = (store.storeName || '').toLowerCase();
    const nameBn = (store.storeNameBn || '').toLowerCase();
    return nameEn.includes(query) || nameBn.includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 animate-fade-in">
      
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold select-none">
        <button 
          onClick={() => { setSelectedSellerId(null); setActivePanel('customer'); }}
          className="hover:text-[#da1c24] transition flex items-center gap-1 cursor-pointer"
        >
          {language === 'bn' ? 'হোম' : 'Home'}
        </button>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold">
          {language === 'bn' ? 'আমাদের আউটলেটসমূহ' : 'Our Outlets'}
        </span>
      </nav>

      {/* 2. Page Header & Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">
            {language === 'bn' ? 'আমাদের আউটলেটসমূহ' : 'Our Outlets'}
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
            {language === 'bn' 
              ? 'আমাদের বিশ্বস্ত ভেরিফাইড পার্টনার এবং আউটলেটসমূহ থেকে সরাসরি টাটকা পণ্য কেনাকাটা করুন।' 
              : 'Shop directly from our verified and trusted retail outlets and brand partners.'}
          </p>
        </div>

        {/* Search Bar inside Header */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'আউটলেট খুঁজুন...' : 'Search outlets...'}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:border-[#da1c24] focus:ring-1 focus:ring-[#da1c24]/20 transition shadow-xs text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* 3. Main Outlet Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-10 h-10 text-[#da1c24] animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-semibold">
            {language === 'bn' ? 'আউটলেটসমূহ লোড হচ্ছে...' : 'Loading outlets...'}
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 p-8 max-w-md mx-auto shadow-xs">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#da1c24] text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-700 transition"
          >
            {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Retry'}
          </button>
        </div>
      ) : filteredOutlets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 p-8 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">
            {language === 'bn' ? 'কোন আউটলেট পাওয়া যায়নি' : 'No outlets found'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-6">
            {language === 'bn' 
              ? 'আপনার অনুসন্ধানটির সাথে মেলে এমন কোন আউটলেট পাওয়া যায়নি।' 
              : 'Try searching for a different outlet name.'}
          </p>
          <button 
            onClick={() => setSearchQuery('')}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
          >
            {language === 'bn' ? 'সার্চ মুছুন' : 'Clear Search'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredOutlets.map((store) => {
            const productCount = getProductCount(store.sellerId);
            return (
              <div 
                key={store.id}
                onClick={() => handleVisitStore(store.sellerId)}
                className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 md:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer select-none"
              >
                {/* Visual Top Decorative Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1 bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-500/15">
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    <span className="hidden sm:inline">
                      {language === 'bn' ? 'ভেরিফাইড' : 'Verified'}
                    </span>
                  </span>
                </div>

                {/* Card Banner Background Accent */}
                <div className="h-16 -mx-4 -mt-4 md:-mx-5 md:-mt-5 bg-gradient-to-br from-slate-50 to-slate-100/70 dark:from-slate-800/40 dark:to-slate-800/20 rounded-t-2xl border-b border-slate-100/50 dark:border-slate-800/10" />

                {/* Centered Logo Container */}
                <div className="w-20 h-20 md:w-22 md:h-22 rounded-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-sm flex items-center justify-center relative -mt-10 mx-auto overflow-hidden">
                  {store.logoUrl ? (
                    <img 
                      src={store.logoUrl} 
                      alt={store.storeName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        // Fallback on broken image
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const iconDiv = document.createElement('div');
                          iconDiv.className = "w-full h-full flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-950/20 font-black text-xl rounded-full";
                          iconDiv.innerHTML = `<span>${(store.storeName || 'S').charAt(0).toUpperCase()}</span>`;
                          parent.appendChild(iconDiv);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#da1c24] bg-red-50 dark:bg-red-950/20 rounded-full">
                      <Store className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                  )}
                </div>

                {/* Store Name and Product Counts */}
                <div className="text-center mt-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-[#da1c24] transition duration-200">
                      {language === 'bn' ? (store.storeNameBn || store.storeName) : store.storeName}
                    </h3>
                    
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 select-none">
                      {language === 'bn' ? `যোগদান: ${store.joinDate || '২০২৫'}` : `Joined: ${store.joinDate || '2025'}`}
                    </p>
                  </div>

                  {/* Products count and action button */}
                  <div className="mt-4 pt-4 border-t border-slate-100/80 dark:border-slate-800/50">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#da1c24]" />
                        <span>
                          {language === 'bn' ? `${productCount} টি পণ্য` : `${productCount} Products`}
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-0.5 font-bold text-[#da1c24] group-hover:translate-x-0.5 transition duration-200">
                        <span>{language === 'bn' ? 'ভিজিট' : 'Visit'}</span>
                        {language === 'bn' ? <ArrowLeft className="w-3 h-3 rotate-180" /> : <ArrowRight className="w-3 h-3" />}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
