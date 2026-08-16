import React, { useState, useMemo } from 'react';
import { 
  Globe, Check, Search, Sparkles, RefreshCw, Layers, 
  ArrowRight, ShieldCheck, Zap, Radio, Volume2, Info 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  SUPPORTED_LANGUAGES, 
  LanguageOption, 
  getTranslation, 
  getLanguageMeta,
  DICTIONARY 
} from '../../services/languageService';

export const LanguageSettingsTab: React.FC = () => {
  const { language, setLanguage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'popular' | 'regional' | 'europe' | 'asia' | 'mideast'>('all');
  const [justChanged, setJustChanged] = useState<string | null>(null);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(() => {
    return localStorage.getItem('auto_translate_enabled') !== 'false';
  });

  const currentMeta = useMemo(() => getLanguageMeta(language), [language]);

  const filteredLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter(lang => {
      const matchesSearch = 
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.region.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        lang.category === selectedCategory ||
        (selectedCategory === 'popular' && (lang.code === 'bn' || lang.code === 'en' || lang.code === 'hi' || lang.code === 'ar'));

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectLanguage = (langCode: string) => {
    setLanguage(langCode as any);
    setJustChanged(langCode);
    setTimeout(() => {
      setJustChanged(null);
    }, 2500);
  };

  const handleToggleAutoTranslate = () => {
    const nextVal = !autoTranslateEnabled;
    setAutoTranslateEnabled(nextVal);
    localStorage.setItem('auto_translate_enabled', String(nextVal));
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 pointer-events-none">
          <Globe className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-black tracking-wide uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Multi-Language & Live Localization Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'bn' ? 'ভাষা ও স্বয়ংক্রিয় অনুবাদ নির্বাচন' : 'Language & Instant Auto-Translation'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-50 mt-1 max-w-xl font-medium">
              {language === 'bn'
                ? 'যেকোনো ভাষা নির্বাচন করুন। পুরো অ্যাপ্লিকেশনটি সাথে সাথে স্বয়ংক্রিয়ভাবে নির্বাচিত ভাষায় রূপান্তরিত হবে।'
                : 'Select any global or regional language. The entire website and application will instantly adapt.'}
            </p>
          </div>

          {/* Current Active Language Pill */}
          <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-4 py-3 rounded-xl shadow-md border border-white/20 shrink-0 flex items-center gap-3">
            <span className="text-3xl">{currentMeta.flag}</span>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {language === 'bn' ? 'বর্তমান সক্রিয় ভাষা' : 'Currently Active'}
              </div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span>{currentMeta.nativeName}</span>
                <span className="text-xs text-slate-400 font-bold">({currentMeta.name})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {justChanged && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between animate-fade-in text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'bn' 
                ? `ভাষা সফলভাবে পরিবর্তন হয়েছে: ${getLanguageMeta(justChanged).nativeName}! সম্পূর্ণ অ্যাপ এখন সক্রিয়।`
                : `Language switched to ${getLanguageMeta(justChanged).name} successfully! Entire app converted.`}
            </span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 rounded text-[10px] font-black uppercase">
            Active
          </span>
        </div>
      )}

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
              placeholder={language === 'bn' ? 'ভাষা বা দেশ খুঁজুন (যেমন: নেপাল, ভুটান, দুবাই/UAE, সৌদি, কাতার, Hindi, English)...' : 'Search country or language (e.g. Nepal, Bhutan, Dubai, Saudi, Qatar, Hindi)...'}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            {language === 'bn' ? `মোট ${filteredLanguages.length}টি ভাষা উপলব্ধ` : `${filteredLanguages.length} languages available`}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: language === 'bn' ? 'সকল ভাষা' : 'All Languages' },
            { id: 'popular', label: language === 'bn' ? 'জনপ্রিয়' : 'Popular' },
            { id: 'regional', label: language === 'bn' ? 'দক্ষিণ এশিয়া' : 'South Asia' },
            { id: 'europe', label: language === 'bn' ? 'ইউরোপ ও আমেরিকা' : 'Europe & Americas' },
            { id: 'asia', label: language === 'bn' ? 'পূর্ব এশিয়া' : 'East Asia' },
            { id: 'mideast', label: language === 'bn' ? 'মধ্যপ্রাচ্য' : 'Middle East' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                selectedCategory === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Languages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredLanguages.map(lang => {
          const isSelected = language === lang.code;

          return (
            <div
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl shrink-0 select-none">{lang.flag}</span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                      {lang.nativeName}
                    </h4>
                    <p className="text-[11px] font-bold text-slate-400 truncate">
                      {lang.name}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 text-transparent group-hover:border-emerald-400 flex items-center justify-center shrink-0">
                    •
                  </span>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span className="truncate max-w-[140px]">{lang.region}</span>
                <span className="uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
                  {lang.code} {lang.isRTL ? '• RTL' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLanguages.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <Globe className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-bold">কোনো ভাষা পাওয়া যায়নি। অন্য নাম দিয়ে অনুসন্ধান করুন।</p>
        </div>
      )}

      {/* Live Sample Translation Preview Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              {language === 'bn' ? 'লাইভ অনুবাদ প্রিভিউ (Live Preview)' : 'Live Translation Preview'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' 
                ? `বর্তমান সক্রিয় ভাষা: ${currentMeta.nativeName} (${currentMeta.name})`
                : `Currently active language: ${currentMeta.nativeName} (${currentMeta.name})`}
            </p>
          </div>

          <button
            onClick={() => handleSelectLanguage('bn')}
            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200"
          >
            Reset to বাংলা
          </button>
        </div>

        {/* Translation Samples in Selected Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Search Placeholder</div>
            <div className="font-bold text-slate-800 dark:text-slate-100">
              "{getTranslation('search_placeholder', language)}"
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Buy Now Button</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">
              "{getTranslation('buy_now', language)}"
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cart & Checkout</div>
            <div className="font-bold text-slate-800 dark:text-slate-100">
              "{getTranslation('cart', language)}" • "{getTranslation('checkout', language)}"
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
