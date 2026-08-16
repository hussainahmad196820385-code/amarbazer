import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Calendar, Package, Sliders, 
  Percent, Save, RefreshCw, Check, ArrowRight, ShieldCheck, 
  Users, TrendingUp, Sparkles, HelpCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SellerStore } from '../../types';

export const SubscriptionSettings: React.FC = () => {
  const { systemSettings, updateSystemSettings, language } = useApp();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeSellers, setActiveSellers] = useState<SellerStore[]>([]);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  // Form states for Starter Plan
  const [starterPrice, setStarterPrice] = useState(systemSettings.starterPrice ?? 500);
  const [starterDuration, setStarterDuration] = useState(systemSettings.starterDurationDays ?? 30);
  const [starterLimit, setStarterLimit] = useState(systemSettings.starterProductLimit ?? 20);
  const [starterCommission, setStarterCommission] = useState(systemSettings.starterCommission ?? 5);

  // Form states for Business Plan
  const [businessPrice, setBusinessPrice] = useState(systemSettings.businessPrice ?? 1500);
  const [businessDuration, setBusinessDuration] = useState(systemSettings.businessDurationDays ?? 30);
  const [businessLimit, setBusinessLimit] = useState(systemSettings.businessProductLimit ?? 100);
  const [businessCommission, setBusinessCommission] = useState(systemSettings.businessCommission ?? 3);

  // Form states for Enterprise Plan
  const [enterprisePrice, setEnterprisePrice] = useState(systemSettings.enterprisePrice ?? 3000);
  const [enterpriseDuration, setEnterpriseDuration] = useState(systemSettings.enterpriseDurationDays ?? 30);
  const [enterpriseLimit, setEnterpriseLimit] = useState(systemSettings.enterpriseProductLimit ?? 999999);
  const [enterpriseCommission, setEnterpriseCommission] = useState(systemSettings.enterpriseCommission ?? 1);

  // Sync state if systemSettings changes in background
  useEffect(() => {
    if (systemSettings) {
      if (systemSettings.starterPrice !== undefined) setStarterPrice(systemSettings.starterPrice);
      if (systemSettings.starterDurationDays !== undefined) setStarterDuration(systemSettings.starterDurationDays);
      if (systemSettings.starterProductLimit !== undefined) setStarterLimit(systemSettings.starterProductLimit);
      if (systemSettings.starterCommission !== undefined) setStarterCommission(systemSettings.starterCommission);

      if (systemSettings.businessPrice !== undefined) setBusinessPrice(systemSettings.businessPrice);
      if (systemSettings.businessDurationDays !== undefined) setBusinessDuration(systemSettings.businessDurationDays);
      if (systemSettings.businessProductLimit !== undefined) setBusinessLimit(systemSettings.businessProductLimit);
      if (systemSettings.businessCommission !== undefined) setBusinessCommission(systemSettings.businessCommission);

      if (systemSettings.enterprisePrice !== undefined) setEnterprisePrice(systemSettings.enterprisePrice);
      if (systemSettings.enterpriseDurationDays !== undefined) setEnterpriseDuration(systemSettings.enterpriseDurationDays);
      if (systemSettings.enterpriseProductLimit !== undefined) setEnterpriseLimit(systemSettings.enterpriseProductLimit);
      if (systemSettings.enterpriseCommission !== undefined) setEnterpriseCommission(systemSettings.enterpriseCommission);
    }
  }, [systemSettings]);

  const loadSellersData = async () => {
    setDiagnosticsLoading(true);
    try {
      const sellers = await api.getSellers();
      setActiveSellers(sellers || []);
    } catch (err) {
      console.error('Failed to load active sellers statistics', err);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  useEffect(() => {
    loadSellersData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await updateSystemSettings({
        starterPrice: Number(starterPrice),
        starterDurationDays: Number(starterDuration),
        starterProductLimit: Number(starterLimit),
        starterCommission: Number(starterCommission),

        businessPrice: Number(businessPrice),
        businessDurationDays: Number(businessDuration),
        businessProductLimit: Number(businessLimit),
        businessCommission: Number(businessCommission),

        enterprisePrice: Number(enterprisePrice),
        enterpriseDurationDays: Number(enterpriseDuration),
        enterpriseProductLimit: Number(enterpriseLimit),
        enterpriseCommission: Number(enterpriseCommission),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving subscription configurations', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const activeStarterCount = activeSellers.filter(s => s.subscriptionPlan === 'starter' && s.subscriptionStatus === 'active').length;
  const activeBusinessCount = activeSellers.filter(s => s.subscriptionPlan === 'business' && s.subscriptionStatus === 'active').length;
  const activeEnterpriseCount = activeSellers.filter(s => s.subscriptionPlan === 'enterprise' && s.subscriptionStatus === 'active').length;

  const currentMonthlyRevenue = (activeStarterCount * starterPrice) + 
                                (activeBusinessCount * businessPrice) + 
                                (activeEnterpriseCount * enterprisePrice);

  const t = {
    title: language === 'bn' ? 'প্রিমিয়াম সাবস্ক্রিপশন ও প্রাইসিং কন্ট্রোল' : 'Premium Subscription & Pricing Control',
    subtitle: language === 'bn' ? 'সেলারদের জন্য স্টার্টার, বিজনেস এবং এন্টারপ্রাইজ প্ল্যানের মূল্য, সময়কাল এবং সীমানাসমূহ নিয়ন্ত্রণ করুন' : 'Configure pricing, billing duration, product limits, and commission rates for vendor tiers',
    starterTitle: language === 'bn' ? '১. স্টার্টার প্ল্যান (Starter Plan)' : '1. Starter Plan',
    businessTitle: language === 'bn' ? '২. বিজনেস প্ল্যান (Business Plan)' : '2. Business Plan',
    enterpriseTitle: language === 'bn' ? '৩. এন্টারপ্রাইজ প্ল্যান (Enterprise Plan)' : '3. Enterprise Plan',
    priceLabel: language === 'bn' ? 'মূল্য (টাকা)' : 'Price (BDT)',
    durationLabel: language === 'bn' ? 'সময়কাল (দিন)' : 'Duration (Days)',
    limitLabel: language === 'bn' ? 'পণ্য আপলোড সীমা' : 'Max Product Uploads',
    commissionLabel: language === 'bn' ? 'স্টোর কমিশন শতকরা (%)' : 'Marketplace Commission (%)',
    saveBtn: language === 'bn' ? 'কনফিগারেশন সংরক্ষণ করুন' : 'Save Plan Configurations',
    saving: language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving plans...',
    saved: language === 'bn' ? 'প্ল্যান কনফিগারেশন সফলভাবে সেভ করা হয়েছে!' : 'Subscription plans updated successfully!',
    dashboardTitle: language === 'bn' ? 'লাইভ সাবস্ক্রিপশন ডায়াগনস্টিকস' : 'Live Subscriptions Dashboard',
    totalSellers: language === 'bn' ? 'মোট নিবন্ধিত সেলার' : 'Registered Sellers',
    activeSubs: language === 'bn' ? 'সক্রিয় সাবস্ক্রিপশনসমূহ' : 'Active Subscriptions',
    estRevenue: language === 'bn' ? 'অনুমানিক মাসিক আয়' : 'Est. Monthly Subscription Revenue',
    unlimited: language === 'bn' ? 'আনলিমিটেড' : 'Unlimited',
    sync: language === 'bn' ? 'রিফ্রেশ ডাটা' : 'Refresh Data',
    planDist: language === 'bn' ? 'প্ল্যান ডিস্ট্রিবিউশন' : 'Plan Distribution',
    starterDesc: language === 'bn' ? 'ছোট সেলারদের জন্য প্রাথমিক লেভেলের প্ল্যান।' : 'Entry level plan optimized for smaller cottage businesses.',
    businessDesc: language === 'bn' ? 'মাঝারি ব্র্যান্ড ও রিটেইল স্টোরগুলোর জন্য উপযুক্ত।' : 'Perfect plan for growing retail brands and online stores.',
    enterpriseDesc: language === 'bn' ? 'আনলিমিটেড পণ্য সহ বড় ডিস্ট্রিবিউটর বা কর্পোরেট স্টোর।' : 'Enterprise layout for top wholesalers and major retail brands.'
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 max-w-7xl mx-auto">
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.title}</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
            {t.subtitle}
          </p>
        </div>

        <button
          onClick={loadSellersData}
          disabled={diagnosticsLoading}
          className="flex items-center justify-center space-x-2 py-2 px-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer select-none transition active:scale-95 border border-slate-200 dark:border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsLoading ? 'animate-spin' : ''}`} />
          <span>{t.sync}</span>
        </button>
      </div>

      {/* Diagnostics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t.totalSellers}</span>
            <span className="text-xl font-extrabold">{activeSellers.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{language === 'bn' ? 'প্লাটফর্মে মোট মার্চেন্ট' : 'Total platform merchants'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t.activeSubs}</span>
            <span className="text-xl font-extrabold">
              {activeSellers.filter(s => s.subscriptionStatus === 'active' && s.subscriptionPlan !== 'none').length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              S: {activeStarterCount} | B: {activeBusinessCount} | E: {activeEnterpriseCount}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs flex items-center space-x-4 sm:col-span-2">
          <div className="p-3 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t.estRevenue}</span>
            <span className="text-xl font-extrabold text-orange-600 dark:text-orange-400">৳ {currentMonthlyRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {language === 'bn' ? 'সক্রিয় সেলারদের সাবস্ক্রিপশন ফি হিসাব' : 'Calculated from current live active subscriptions'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Admin Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Starter Tier */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-slate-950 dark:text-white flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2.5"></span>
                  {t.starterTitle}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full uppercase">
                  {starterPrice} ৳ / {starterDuration} {language === 'bn' ? 'দিন' : 'days'}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{t.starterDesc}</p>

              {/* Price Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {t.priceLabel}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={starterPrice}
                  onChange={(e) => setStarterPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>

              {/* Duration Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {t.durationLabel}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={starterDuration}
                  onChange={(e) => setStarterDuration(Math.max(1, parseInt(e.target.value) || 30))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>

              {/* Product Limit Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Package className="w-3 h-3 mr-1" />
                  {t.limitLabel}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={starterLimit}
                  onChange={(e) => setStarterLimit(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>

              {/* Commission Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Percent className="w-3 h-3 mr-1" />
                  {t.commissionLabel}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={starterCommission}
                  onChange={(e) => setStarterCommission(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 font-bold flex items-center justify-between">
              <span>{language === 'bn' ? 'সক্রিয় সেলার:' : 'Active Vendors:'}</span>
              <span className="font-mono text-xs text-slate-800 dark:text-slate-100">{activeStarterCount}</span>
            </div>
          </div>

          {/* Card 2: Business Tier */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-slate-950 dark:text-white flex items-center">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2.5"></span>
                  {t.businessTitle}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full uppercase">
                  {businessPrice} ৳ / {businessDuration} {language === 'bn' ? 'দিন' : 'days'}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{t.businessDesc}</p>

              {/* Price Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {t.priceLabel}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={businessPrice}
                  onChange={(e) => setBusinessPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>

              {/* Duration Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {t.durationLabel}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={businessDuration}
                  onChange={(e) => setBusinessDuration(Math.max(1, parseInt(e.target.value) || 30))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>

              {/* Product Limit Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Package className="w-3 h-3 mr-1" />
                  {t.limitLabel}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={businessLimit}
                  onChange={(e) => setBusinessLimit(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>

              {/* Commission Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Percent className="w-3 h-3 mr-1" />
                  {t.commissionLabel}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={businessCommission}
                  onChange={(e) => setBusinessCommission(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 font-bold flex items-center justify-between">
              <span>{language === 'bn' ? 'সক্রিয় সেলার:' : 'Active Vendors:'}</span>
              <span className="font-mono text-xs text-slate-800 dark:text-slate-100">{activeBusinessCount}</span>
            </div>
          </div>

          {/* Card 3: Enterprise Tier */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-slate-950 dark:text-white flex items-center">
                  <span className="w-3 h-3 rounded-full bg-orange-500 mr-2.5"></span>
                  {t.enterpriseTitle}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-full uppercase">
                  {enterprisePrice} ৳ / {enterpriseDuration} {language === 'bn' ? 'দিন' : 'days'}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{t.enterpriseDesc}</p>

              {/* Price Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {t.priceLabel}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={enterprisePrice}
                  onChange={(e) => setEnterprisePrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>

              {/* Duration Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {t.durationLabel}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={enterpriseDuration}
                  onChange={(e) => setEnterpriseDuration(Math.max(1, parseInt(e.target.value) || 30))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>

              {/* Product Limit Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Package className="w-3 h-3 mr-1" />
                  {t.limitLabel} ({language === 'bn' ? '৯৯৯৯৯৯ = আনলিমিটেড' : '999999 = Unlimited'})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={enterpriseLimit}
                  onChange={(e) => setEnterpriseLimit(Math.max(1, parseInt(e.target.value) || 999999))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>

              {/* Commission Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Percent className="w-3 h-3 mr-1" />
                  {t.commissionLabel}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={enterpriseCommission}
                  onChange={(e) => setEnterpriseCommission(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-mono font-bold"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 font-bold flex items-center justify-between">
              <span>{language === 'bn' ? 'সক্রিয় সেলার:' : 'Active Vendors:'}</span>
              <span className="font-mono text-xs text-slate-800 dark:text-slate-100">{activeEnterpriseCount}</span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col md:flex-row items-center justify-end gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs">
          {success && (
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 animate-fade-in">
              <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span>{t.saved}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center space-x-2.5 py-3 px-8 text-xs font-black bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 hover:text-black rounded-xl select-none active:scale-98 transition duration-200 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? t.saving : t.saveBtn}</span>
          </button>
        </div>
      </form>

      {/* Diagnostics details list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <h3 className="font-extrabold text-slate-950 dark:text-white flex items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-amber-500 mr-2.5" />
          {t.planDist} ({language === 'bn' ? 'সেলারদের লাইভ অবস্থা' : 'Merchants Live Coverage'})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4">{language === 'bn' ? 'মার্চেন্ট স্টোর' : 'Merchant Store'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'সক্রিয় প্ল্যান' : 'Active Plan'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'পেমেন্ট ও ট্রানজেকশন' : 'Payment Status'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'মেয়াদ শেষের তারিখ' : 'Expiration Date'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'পরিশোধিত ফি' : 'Amount Paid'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
              {activeSellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-bold">
                    {language === 'bn' ? 'কোন মার্চেন্ট ডাটা পাওয়া যায়নি।' : 'No merchants subscription data available.'}
                  </td>
                </tr>
              ) : (
                activeSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={seller.logoUrl} 
                          alt="" 
                          className="w-7 h-7 rounded-lg object-cover bg-slate-100 border border-slate-200 dark:border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white text-xs">{language === 'bn' && seller.storeNameBn ? seller.storeNameBn : seller.storeName}</p>
                          <span className="text-[9px] text-slate-400 font-mono tracking-tight">{seller.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                        seller.subscriptionPlan === 'enterprise' 
                          ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' 
                          : seller.subscriptionPlan === 'business'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : seller.subscriptionPlan === 'starter'
                          ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {seller.subscriptionPlan || 'none'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          seller.subscriptionStatus === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        <span className="text-[10px] font-bold uppercase">{seller.subscriptionStatus || 'Inactive'}</span>
                      </div>
                      {seller.subscriptionTxnId && (
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{seller.subscriptionPaymentMethod?.toUpperCase()}: {seller.subscriptionTxnId}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[11px]">
                      {seller.subscriptionExpiryDate || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                      ৳ {seller.subscriptionAmountPaid || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
