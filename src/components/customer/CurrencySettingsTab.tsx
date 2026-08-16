import React, { useState, useMemo } from 'react';
import { 
  Coins, Check, Search, Sparkles, RefreshCw, Calculator, 
  ArrowRight, DollarSign, TrendingUp, Zap, HelpCircle, ArrowLeftRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  SUPPORTED_CURRENCIES, 
  CurrencyOption, 
  getCurrencyMeta, 
  formatCurrencyAmount,
  convertFromBDT
} from '../../services/currencyService';

export const CurrencySettingsTab: React.FC = () => {
  const { language, currency, setCurrency, formatPrice } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'popular' | 'mideast' | 'southasia' | 'europe' | 'asia' | 'americas'>('all');
  const [justChanged, setJustChanged] = useState<string | null>(null);
  
  // Interactive Live Converter State
  const [calcBDTAmount, setCalcBDTAmount] = useState<number>(1000);

  const currentMeta = useMemo(() => getCurrencyMeta(currency), [currency]);

  const filteredCurrencies = useMemo(() => {
    return SUPPORTED_CURRENCIES.filter(curr => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        curr.name.toLowerCase().includes(q) ||
        curr.nameBn.toLowerCase().includes(q) ||
        curr.code.toLowerCase().includes(q) ||
        curr.symbol.toLowerCase().includes(q) ||
        curr.country.toLowerCase().includes(q) ||
        curr.countryBn.toLowerCase().includes(q);
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        curr.category === selectedCategory ||
        (selectedCategory === 'popular' && (curr.code === 'BDT' || curr.code === 'AED' || curr.code === 'SAR' || curr.code === 'USD' || curr.code === 'INR'));

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectCurrency = (code: string) => {
    setCurrency(code as any);
    setJustChanged(code);
    setTimeout(() => {
      setJustChanged(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 pointer-events-none">
          <Coins className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-black tracking-wide uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Multi-Currency & Global Exchange Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'bn' ? 'কারেন্সি ও মুদ্রা নির্বাচন (Currency Switcher)' : 'Currency & Global Exchange'}
            </h2>
            <p className="text-xs sm:text-sm text-amber-50 mt-1 max-w-xl font-medium">
              {language === 'bn'
                ? 'আপনি দুবাই থাকলে দিরহাম (AED), বাংলাদেশে থাকলে টাকা (BDT), সৌদি আরবে রিয়াল (SAR) বা আন্তর্জাতিক যেকোনো কারেন্সি নির্বাচন করুন।'
                : 'Select your preferred country currency (e.g. Dubai AED Dirham, Bangladesh BDT Taka, Saudi SAR Riyal, US Dollar). Entire shop adapts instantly.'}
            </p>
          </div>

          {/* Current Active Currency Pill */}
          <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-4 py-3 rounded-xl shadow-md border border-white/20 shrink-0 flex items-center gap-3">
            <span className="text-3xl">{currentMeta.flag}</span>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {language === 'bn' ? 'বর্তমান সক্রিয় কারেন্সি' : 'Active Currency'}
              </div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span>{currentMeta.code} ({currentMeta.symbol})</span>
              </div>
              <div className="text-[11px] font-bold text-slate-500 truncate max-w-[130px]">
                {language === 'bn' ? currentMeta.nameBn : currentMeta.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {justChanged && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between animate-fade-in text-xs font-bold text-amber-800 dark:text-amber-300 shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {language === 'bn' 
                ? `কারেন্সি সফলভাবে পরিবর্তন হয়েছে: ${getCurrencyMeta(justChanged).nameBn} (${getCurrencyMeta(justChanged).code})!`
                : `Currency successfully switched to ${getCurrencyMeta(justChanged).name} (${getCurrencyMeta(justChanged).code})!`}
            </span>
          </div>
          <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800 rounded text-[10px] font-black uppercase">
            Active
          </span>
        </div>
      )}

      {/* Interactive Quick Currency Converter Calculator */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                {language === 'bn' ? 'লাইভ কারেন্সি কনভার্টার ও মূল্য তালিকা' : 'Live Currency Conversion Calculator'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'bn' ? 'টাকার পরিমাণ লিখে অন্যান্য দেশের মুদ্রার সমমূল্য দেখুন' : 'Enter amount in BDT to see equivalents in UAE Dirham, SAR, USD etc.'}
              </p>
            </div>
          </div>

          {/* Quick Input Box */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400">BDT ৳:</span>
            <input
              type="number"
              min="1"
              value={calcBDTAmount}
              onChange={(e) => setCalcBDTAmount(Math.max(1, Number(e.target.value) || 0))}
              className="w-28 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
            />
          </div>
        </div>

        {/* Highlighted Global Rates Grid for Entered Amount */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
          {[
            { code: 'BDT', flag: '🇧🇩', label: 'বাংলাদেশ' },
            { code: 'AED', flag: '🇦🇪', label: 'দুবাই / UAE' },
            { code: 'SAR', flag: '🇸🇦', label: 'সৌদি আরব' },
            { code: 'QAR', flag: '🇶🇦', label: 'কাতার' },
            { code: 'USD', flag: '🇺🇸', label: 'ডলার' },
            { code: 'INR', flag: '🇮🇳', label: 'ভারত' },
            { code: 'NPR', flag: '🇳🇵', label: 'নেপাল' },
            { code: 'BTN', flag: '🇧🇹', label: 'ভুটান' },
            { code: 'EUR', flag: '🇪🇺', label: 'ইউরো' },
            { code: 'GBP', flag: '🇬🇧', label: 'যুক্তরাজ্য' },
            { code: 'KWD', flag: '🇰🇼', label: 'কুয়েত' },
            { code: 'OMR', flag: '🇴🇲', label: 'ওমান' }
          ].map(item => {
            const meta = getCurrencyMeta(item.code);
            const isCurrent = currency === item.code;
            return (
              <div 
                key={item.code}
                onClick={() => handleSelectCurrency(item.code)}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  isCurrent 
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/20' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <span>{item.flag}</span>
                    <span className="truncate">{item.code}</span>
                  </span>
                  {isCurrent && <span className="text-amber-500 font-black">✓</span>}
                </div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                  {formatCurrencyAmount(calcBDTAmount, item.code)}
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">
                  1 {item.code} ≈ ৳{meta.rateAgainstBase.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'দেশ বা কারেন্সি খুঁজুন (যেমন: দুবাই, UAE, Dirham, টাকা, BDT, সৌদি, কাতার, ডলার, Rupee)...' : 'Search country or currency (e.g. Dubai, UAE, AED, BDT, Saudi, Dollar, Rupee)...'}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Count Badge */}
          <div className="text-[11px] font-bold text-slate-500 self-end sm:self-center">
            {language === 'bn' ? `মোট ${filteredCurrencies.length}টি মুদ্রা উপলব্ধ` : `${filteredCurrencies.length} currencies available`}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: language === 'bn' ? 'সকল মুদ্রা' : 'All Currencies' },
            { id: 'popular', label: language === 'bn' ? 'জনপ্রিয়' : 'Popular' },
            { id: 'mideast', label: language === 'bn' ? 'দুবাই ও মধ্যপ্রাচ্য' : 'Middle East & Dubai' },
            { id: 'southasia', label: language === 'bn' ? 'দক্ষিণ এশিয়া' : 'South Asia' },
            { id: 'europe', label: language === 'bn' ? 'ইউরোপ ও যুক্তরাজ্য' : 'Europe & UK' },
            { id: 'americas', label: language === 'bn' ? 'আমেরিকা ও কানাডা' : 'Americas' },
            { id: 'asia', label: language === 'bn' ? 'পূর্ব ও দক্ষিণ-পূর্ব এশিয়া' : 'Asia-Pacific' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                selectedCategory === tab.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Currencies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredCurrencies.map(curr => {
          const isSelected = currency === curr.code;

          return (
            <div
              key={curr.code}
              onClick={() => handleSelectCurrency(curr.code)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl shrink-0 select-none">{curr.flag}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                        {curr.code}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-amber-600 dark:text-amber-400">
                        {curr.symbol}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                      {language === 'bn' ? curr.nameBn : curr.name}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 text-transparent group-hover:border-amber-400 flex items-center justify-center shrink-0">
                    •
                  </span>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span className="truncate max-w-[140px]">
                  {language === 'bn' ? curr.countryBn : curr.country}
                </span>
                <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
                  1 {curr.code} ≈ ৳{curr.rateAgainstBase.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCurrencies.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <Coins className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-bold">কোনো কারেন্সি পাওয়া যায়নি। অন্য নাম দিয়ে অনুসন্ধান করুন।</p>
        </div>
      )}

      {/* Live Store Sample Pricing Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              {language === 'bn' ? 'স্টোর মূল্য প্রদর্শন প্রিভিউ (Store Price Preview)' : 'Store Price Preview in Active Currency'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' 
                ? `বর্তমান সক্রিয় কারেন্সি: ${currentMeta.nameBn} (${currentMeta.code} - ${currentMeta.symbol})`
                : `Currently active currency: ${currentMeta.name} (${currentMeta.code} - ${currentMeta.symbol})`}
            </p>
          </div>

          <button
            onClick={() => handleSelectCurrency('BDT')}
            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200"
          >
            Reset to BDT (৳)
          </button>
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Product Price (৳850)</div>
            <div className="text-base font-black text-slate-800 dark:text-slate-100">
              {formatPrice(850)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Original: ৳850 BDT</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cart Total (৳3,500)</div>
            <div className="text-base font-black text-amber-600 dark:text-amber-400">
              {formatPrice(3500)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Original: ৳3,500 BDT</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Delivery Fee (৳60)</div>
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {formatPrice(60)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Original: ৳60 BDT</div>
          </div>
        </div>
      </div>

    </div>
  );
};
