import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Store, Clipboard, ShieldCheck, Check, Building, FileText, 
  MapPin, Phone, UploadCloud, HelpCircle, ArrowRight, ArrowLeft, RefreshCw
} from 'lucide-react';

export const RegisterVendorShop: React.FC = () => {
  const { language, currentUser, setCurrentUser, setActiveRole, setActivePanel } = useApp();
  
  // Step tracking: 'details' | 'plans' | 'payment' | 'processing' | 'success'
  const [step, setStep] = useState<'details' | 'plans' | 'payment' | 'processing' | 'success'>('details');

  // Step 1: Form details
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [district, setDistrict] = useState('Dhaka');
  const [tradeLicense, setTradeLicense] = useState('');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [error, setError] = useState('');

  // Step 2: Plan selection
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'starter' | 'business' | 'enterprise'>('trial');
  const PLANS_INFO = {
    trial: { name: 'Free Trial / ফ্রী ট্রায়াল', price: 0, limit: '5 Products', commission: '10%' },
    starter: { name: 'Starter / স্টার্টার', price: 500, limit: '20 Products', commission: '5%' },
    business: { name: 'Business / বিজনেস', price: 1500, limit: '100 Products', commission: '3%' },
    enterprise: { name: 'Enterprise / এন্টারপ্রাইজ', price: 3000, limit: 'Unlimited Products', commission: '1%' }
  };

  // Step 3: Payment gateway simulation
  const [selectedGateway, setSelectedGateway] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [gatewayPhone, setGatewayPhone] = useState('');
  const [gatewayOtpMode, setGatewayOtpMode] = useState(false);
  const [gatewayOtp, setGatewayOtp] = useState('');
  const [gatewayPinMode, setGatewayPinMode] = useState(false);
  const [gatewayPin, setGatewayPin] = useState('');
  const [txnId, setTxnId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form validation for Details
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !ownerName || !phone) {
      setError(language === 'bn' ? 'সবগুলো ঘর সঠিকভাবে পূরণ করুন' : 'Please fill all required fields');
      return;
    }
    setError('');
    setStep('plans');
  };

  const handleRegisterWithTrial = () => {
    setError('');
    setStep('processing');
    
    setTimeout(async () => {
      try {
        const genTxnId = `TRIAL-${Math.random().toString(36).substring(3, 10).toUpperCase()}`;
        setTxnId(genTxnId);
        
        const emailVal = email || `merchant_${Date.now()}@amarbazar.bd`;
        
        const response = await api.register({
          name: ownerName,
          email: emailVal,
          phone: phone,
          role: 'seller',
          storeName: storeName,
          tradeLicenseNumber: tradeLicense,
          bkashNumber: phone,
          subscriptionPlan: 'trial',
          subscriptionAmountPaid: 0,
          subscriptionPaymentMethod: 'free_trial',
          subscriptionTxnId: genTxnId
        });

        if (response.success) {
          setStep('success');
        } else {
          setError('Failed to save seller registration details on server.');
          setStep('plans');
        }
      } catch (err: any) {
        setError(err.message || 'Trial registration failed.');
        setStep('plans');
      }
    }, 2000);
  };

  const handleProceedToPayment = () => {
    if (selectedPlan === 'trial') {
      handleRegisterWithTrial();
      return;
    }
    setGatewayPhone(phone);
    setGatewayOtpMode(false);
    setGatewayPinMode(false);
    setGatewayOtp('');
    setGatewayPin('');
    setError('');
    setStep('payment');
  };

  // Gateway Simulation triggers
  const handleGatewayPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gatewayPhone.length < 11) {
      setError(language === 'bn' ? 'সঠিক ১১-ডিজিটের অ্যাকাউন্ট নম্বর দিন' : 'Enter a valid 11-digit wallet number');
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setGatewayOtpMode(true);
    }, 1000);
  };

  const handleGatewayOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gatewayOtp !== '123456') {
      setError(language === 'bn' ? 'ভুল ওটিপি! অনুগ্রহ করে ১২৩৪৫৬ দিন' : 'Incorrect OTP! Please use 123456');
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setGatewayPinMode(true);
    }, 1000);
  };

  const handleGatewayPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gatewayPin.length < 4) {
      setError(language === 'bn' ? 'সঠিক পিন দিন' : 'Please enter a valid PIN');
      return;
    }
    setError('');
    setStep('processing');
    
    // Simulate API calls to register user & save subscription
    setTimeout(async () => {
      try {
        const genTxnId = `TXN-${selectedGateway.toUpperCase()}-${Math.random().toString(36).substring(3, 10).toUpperCase()}`;
        setTxnId(genTxnId);

        const emailVal = email || `merchant_${Date.now()}@amarbazar.bd`;
        
        // If user is already logged in, we update their role on the server or register them.
        // Let's call the register API to properly configure the backend db store.
        const response = await api.register({
          name: ownerName,
          email: emailVal,
          phone: phone,
          role: 'seller',
          storeName: storeName,
          tradeLicenseNumber: tradeLicense,
          bkashNumber: phone,
          subscriptionPlan: selectedPlan,
          subscriptionAmountPaid: PLANS_INFO[selectedPlan].price,
          subscriptionPaymentMethod: selectedGateway,
          subscriptionTxnId: genTxnId
        });

        if (response.success) {
          setStep('success');
        } else {
          setError('Failed to save seller registration details on server.');
          setStep('payment');
        }
      } catch (err: any) {
        setError(err.message || 'Payment capture failed.');
        setStep('payment');
      }
    }, 2500);
  };

  const handleEnterSellerPortal = () => {
    // Log the user into App Context as Seller
    const updatedUser = {
      id: currentUser?.id || `usr-${Date.now()}`,
      name: ownerName,
      email: email || `merchant_${Date.now()}@amarbazar.bd`,
      phone: phone,
      role: 'seller' as const,
      isVerified: true,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      addresses: currentUser?.addresses || [],
      createdAt: currentUser?.createdAt || new Date().toISOString()
    };
    
    setCurrentUser(updatedUser);
    setActiveRole('seller');
    setActivePanel('seller');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {/* Title block */}
      <div className="border-b border-slate-150 dark:border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center">
          <Store className="w-6 h-6 mr-2 text-amber-500" />
          {language === 'bn' ? 'মার্চেন্ট শপ সাবস্ক্রিপশন ও রেজিস্ট্রেশন' : 'Merchant Store & Subscription Registration'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'bn' 
            ? 'আমার বাজার প্ল্যাটফর্মে বিক্রেতা হিসেবে যোগদান করতে সাবস্ক্রিপশন পেমেন্ট সম্পন্ন করুন।' 
            : 'Register your merchant store, choose a plan, and complete secure MFS subscription payment.'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      {/* STEP 1: MERCHANT REGISTRATION DETAILS */}
      {step === 'details' && (
        <form onSubmit={handleDetailsSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Store / Outlet Name (দোকানের নাম) *</label>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                <Store className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g., Sylhet Tea Estate Direct"
                  className="w-full bg-transparent focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Legal Owner Name (মালিকের নাম) *</label>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                <Building className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g., Karim Ahmed"
                  className="w-full bg-transparent focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Business Phone (মোবাইল নম্বর) *</label>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                  <Phone className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="e.g., 017XXXXXXXX"
                    className="w-full bg-transparent focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">District Hub (জেলা)</label>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                  <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-xs text-slate-800 dark:text-slate-100 cursor-pointer font-bold"
                  >
                    <option value="Dhaka">Dhaka (ঢাকা)</option>
                    <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                    <option value="Sylhet">Sylhet (সিলেট)</option>
                    <option value="Khulna">Khulna (খুলনা)</option>
                    <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Trade License ID (ট্রেড লাইসেন্স নম্বর)</label>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                  <FileText className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    value={tradeLicense}
                    onChange={(e) => setTradeLicense(e.target.value)}
                    placeholder="e.g., TRAD/BD/012984"
                    className="w-full bg-transparent focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Business Email (ব্যবসায়িক ইমেল)</label>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                  <FileText className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., owner@outlet.bd"
                    className="w-full bg-transparent focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              {language === 'bn' 
                ? 'আবেদন করার মাধ্যমে আপনি বাংলাদেশের ই-কমার্স নীতিমালায় সম্মতি প্রকাশ করছেন।' 
                : 'By applying, you agree to comply with Bangladesh digital e-commerce acts. Active subscriptions are valid for 30 days.'}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-2 uppercase tracking-wider"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{language === 'bn' ? 'সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন' : 'Proceed to Subscription Tiers'}</span>
          </button>
        </form>
      )}

      {/* STEP 2: SUBSCRIPTION PLANS SELECTION */}
      {step === 'plans' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-5">
          <div className="text-center space-y-1">
            <p className="text-xs font-black text-amber-500 uppercase tracking-widest">Select Plan / প্ল্যান নির্বাচন করুন</p>
            <p className="text-[11px] text-slate-400">প্রতিটি প্ল্যান ৩০ দিন মেয়াদী। কোনো গোপন চার্জ নেই।</p>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 gap-3 text-xs">
            {/* Starter */}
            <div 
              onClick={() => setSelectedPlan('starter')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                selectedPlan === 'starter'
                  ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'starter' ? 'border-amber-500' : 'border-slate-300'}`}>
                    {selectedPlan === 'starter' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">Starter (স্টার্টার প্ল্যান)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Limit: 20 Products | 5% commission</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-amber-500 dark:text-amber-400">৳৫০০ / মাস</p>
                  <p className="text-[8px] text-slate-400">30 Days Validity</p>
                </div>
              </div>
            </div>

            {/* Business */}
            <div 
              onClick={() => setSelectedPlan('business')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                selectedPlan === 'business'
                  ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              <span className="absolute -top-2.5 right-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Popular (সেরা পছন্দ)
              </span>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'business' ? 'border-amber-500' : 'border-slate-300'}`}>
                    {selectedPlan === 'business' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">Business (বিজনেস প্ল্যান)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Limit: 100 Products | 3% commission | Featured Badge</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-amber-500 dark:text-amber-400">৳১,৫০০ / মাস</p>
                  <p className="text-[8px] text-slate-400">30 Days Validity</p>
                </div>
              </div>
            </div>

            {/* Enterprise */}
            <div 
              onClick={() => setSelectedPlan('enterprise')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                selectedPlan === 'enterprise'
                  ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'enterprise' ? 'border-amber-500' : 'border-slate-300'}`}>
                    {selectedPlan === 'enterprise' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">Enterprise (এন্টারপ্রাইজ)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Limit: Unlimited | 1% commission | Dedicated Support</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-amber-500 dark:text-amber-400">৳৩,০০০ / মাস</p>
                  <p className="text-[8px] text-slate-400">30 Days Validity</p>
                </div>
              </div>
            </div>

            {/* Free Trial */}
            <div 
              onClick={() => setSelectedPlan('trial')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                selectedPlan === 'trial'
                  ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              <span className="absolute -top-2.5 right-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                {language === 'bn' ? 'ফ্রি অফার' : 'Free Trial'}
              </span>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'trial' ? 'border-emerald-500' : 'border-slate-300'}`}>
                    {selectedPlan === 'trial' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">১ সপ্তাহ ফ্রী ট্রায়াল (Free Trial Plan)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Limit: 5 Products | 10% commission | Try free for 7 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-500 dark:text-emerald-400">৳০ / ১ম সপ্তাহ</p>
                  <p className="text-[8px] text-slate-400">7 Days Validity</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 text-xs">
            <button
              type="button"
              onClick={() => setStep('details')}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'পিছনে যান' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={handleProceedToPayment}
              className="flex-[2] py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition flex items-center justify-center space-x-1.5 uppercase shadow-md"
            >
              {selectedPlan === 'trial' ? (
                <>
                  <span>{language === 'bn' ? 'ফ্রি ট্রায়াল শুরু করুন' : 'Start Free Trial'}</span>
                  <Check className="w-4 h-4 text-slate-950" />
                </>
              ) : (
                <>
                  <span>{language === 'bn' ? 'পেমেন্ট গেটওয়ে খুলুন' : 'Open Payment Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENTS CHANNELS (BKASH, NAGAD, ROCKET CHECKOUT) */}
      {step === 'payment' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs font-black text-amber-500 uppercase tracking-widest">Select Gateway / গেটওয়ে নির্বাচন করুন</p>
            <p className="text-[10px] text-slate-400">নিচের যেকোনো একটি গেটওয়ে নির্বাচন করে সাবস্ক্রাইব করুন।</p>
          </div>

          {/* Selector grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* bKash */}
            <button
              type="button"
              onClick={() => { setSelectedGateway('bkash'); setError(''); }}
              className={`py-3 px-2 rounded-xl border-2 transition font-black text-[10px] tracking-wide flex flex-col items-center justify-center space-y-1 ${
                selectedGateway === 'bkash'
                  ? 'border-[#e2136e] bg-[#e2136e]/10 text-[#e2136e]'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500 bg-white dark:bg-slate-900/60'
              }`}
            >
              <span className="text-lg">💰</span>
              <span>bKash (বিকাশ)</span>
            </button>

            {/* Nagad */}
            <button
              type="button"
              onClick={() => { setSelectedGateway('nagad'); setError(''); }}
              className={`py-3 px-2 rounded-xl border-2 transition font-black text-[10px] tracking-wide flex flex-col items-center justify-center space-y-1 ${
                selectedGateway === 'nagad'
                  ? 'border-[#f15a22] bg-[#f15a22]/10 text-[#f15a22]'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500 bg-white dark:bg-slate-900/60'
              }`}
            >
              <span className="text-lg">🔥</span>
              <span>Nagad (নগদ)</span>
            </button>

            {/* Rocket */}
            <button
              type="button"
              onClick={() => { setSelectedGateway('rocket'); setError(''); }}
              className={`py-3 px-2 rounded-xl border-2 transition font-black text-[10px] tracking-wide flex flex-col items-center justify-center space-y-1 ${
                selectedGateway === 'rocket'
                  ? 'border-[#8c3494] bg-[#8c3494]/10 text-[#8c3494]'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500 bg-white dark:bg-slate-900/60'
              }`}
            >
              <span className="text-lg">🚀</span>
              <span>Rocket (রকেট)</span>
            </button>
          </div>

          {/* ACTIVE GATEWAY INTERACTIVE MODAL */}
          <div className={`rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-700 select-none ${
            selectedGateway === 'bkash' ? 'bg-[#e2136e]' : selectedGateway === 'nagad' ? 'bg-[#f15a22]' : 'bg-[#8c3494]'
          } text-white p-5 space-y-4`}>
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/20 pb-2.5">
              <div className="font-serif italic font-black text-sm tracking-wider flex items-center space-x-1.5">
                <span className="text-lg">⚡</span>
                <span>
                  {selectedGateway === 'bkash' && 'bKash Merchant Pay'}
                  {selectedGateway === 'nagad' && 'Nagad Secure checkout'}
                  {selectedGateway === 'rocket' && 'Rocket DBBL checkout'}
                </span>
              </div>
              <div className="text-right text-[10px] font-black tracking-wider bg-white/10 px-2 py-0.5 rounded">
                ৳{PLANS_INFO[selectedPlan].price}
              </div>
            </div>

            {/* Content states */}
            {!gatewayOtpMode && !gatewayPinMode ? (
              /* Wallet number */
              <form onSubmit={handleGatewayPhoneSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-white/90">
                    {selectedGateway === 'bkash' && 'Enter bKash Account Number (১১-ডিজিট)'}
                    {selectedGateway === 'nagad' && 'Enter Nagad Account Number (১১-ডিজিট)'}
                    {selectedGateway === 'rocket' && 'Enter Rocket Account Number (১১-ডিজিট)'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={gatewayPhone}
                    onChange={(e) => setGatewayPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="01XXXXXXXXX"
                    className="w-full text-center tracking-widest font-black text-base px-3 py-2 bg-black/20 focus:bg-black/35 border border-white/20 focus:border-white rounded-xl focus:outline-none text-white placeholder-white/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold rounded-xl transition text-xs uppercase"
                >
                  {submitting ? 'Sending Request...' : 'Proceed / ওটিপি পাঠান'}
                </button>
              </form>
            ) : gatewayOtpMode && !gatewayPinMode ? (
              /* OTP entry */
              <form onSubmit={handleGatewayOtpSubmit} className="space-y-3">
                <div className="text-center space-y-1 bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <p className="text-[10px] text-white/80">
                    {language === 'bn' ? 'অ্যাকাউন্টে পাঠানো ভেরিফিকেশন ওটিপি দিন' : 'Verification OTP sent to'}
                  </p>
                  <p className="text-xs font-black text-yellow-300">{gatewayPhone}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-yellow-400 text-slate-950 font-black rounded-lg text-[9px]">
                    {language === 'bn' ? 'টেস্ট ওটিপি: ১২৩৪৫৬' : 'DEMO OTP: 123456'}
                  </span>
                </div>

                <div className="space-y-1 text-center">
                  <input
                    type="text"
                    required
                    value={gatewayOtp}
                    onChange={(e) => setGatewayOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full text-center font-black tracking-[0.4em] text-lg px-3 py-2 bg-black/20 focus:bg-black/35 border border-white/20 focus:border-white rounded-xl focus:outline-none text-white placeholder-white/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold rounded-xl transition text-xs uppercase"
                >
                  Verify OTP / ওটিপি ভেরিফাই
                </button>
              </form>
            ) : (
              /* PIN entry */
              <form onSubmit={handleGatewayPinSubmit} className="space-y-3">
                <div className="text-center space-y-1 bg-white/10 p-2 rounded-xl">
                  <p className="text-[10px] text-white/95">
                    {language === 'bn' ? 'নিরাপদ গেটওয়েতে আপনার ওয়ালেট পিন দিন' : 'Enter secret PIN to authorize subscription'}
                  </p>
                </div>

                <div className="space-y-1 text-center">
                  <input
                    type="password"
                    required
                    value={gatewayPin}
                    onChange={(e) => setGatewayPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="•••••"
                    className="w-full text-center font-serif font-black tracking-[0.5em] text-lg px-3 py-2 bg-black/20 focus:bg-black/35 border border-white/20 focus:border-white rounded-xl focus:outline-none text-white placeholder-white/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center space-x-1 shadow-md animate-pulse"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Payment / সাবস্ক্রাইব করুন</span>
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="flex items-center justify-center space-x-1.5 pt-1 text-[8px] text-white/50 font-bold uppercase tracking-widest border-t border-white/10">
              <span>Secure Gateway Protection</span>
              <span>•</span>
              <span>SSL SSL Smart Node</span>
            </div>
          </div>

          <div className="flex space-x-2.5 text-xs">
            <button
              type="button"
              onClick={() => setStep('plans')}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-extrabold rounded-xl transition text-center"
            >
              {language === 'bn' ? 'প্ল্যান পরিবর্তন করুন' : 'Change Plan'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PROCESSING TRANSACTION */}
      {step === 'processing' && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/80 text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/10 animate-pulse" />
            <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Processing Gateway Payment</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto animate-pulse">
              We are securely validating the subscription payment with {selectedGateway.toUpperCase()} secure checkout. Please do not close or refresh this page.
            </p>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS PORTAL */}
      {step === 'success' && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/80 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {selectedPlan === 'trial' ? 'Free Trial Activated / ফ্রী ট্রায়াল শুরু!' : 'Subscription Activated!'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {language === 'bn' 
                ? selectedPlan === 'trial'
                  ? `আপনার দোকান ${storeName} সফলভাবে নিবন্ধিত হয়েছে। আপনার ১ সপ্তাহের ফ্রী ট্রায়াল প্ল্যানটি সক্রিয়। আপনি এখনই বিক্রেতা ড্যাশবোর্ডটি ব্যবহার করতে পারবেন।`
                  : `আপনার দোকান ${storeName} সফলভাবে নিবন্ধিত হয়েছে এবং ${selectedPlan.toUpperCase()} সাবস্ক্রিপশনটি সক্রিয় করা হয়েছে।`
                : selectedPlan === 'trial'
                  ? `Your store ${storeName} has been successfully registered. Your 1-week free trial is fully active and you can start uploading products immediately.`
                  : `Your store ${storeName} has been successfully registered on the platform with the ${selectedPlan.toUpperCase()} subscription tier.`}
            </p>
          </div>

          {/* Transaction receipt */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-[11px] font-bold space-y-2 text-slate-600 dark:text-slate-350">
            <div className="flex justify-between">
              <span>Owner Name (মালিক):</span>
              <span className="text-slate-900 dark:text-white">{ownerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Selected Plan (প্যাকেজ):</span>
              <span className="text-amber-500">{PLANS_INFO[selectedPlan].name}</span>
            </div>
            <div className="flex justify-between">
              <span>MFS Gateway (মাধ্যম):</span>
              <span className="uppercase text-slate-900 dark:text-white">
                {selectedPlan === 'trial' ? 'Free Activation / ফ্রী ট্রায়াল' : `${selectedGateway} Wallet`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid (পরিশোধিত):</span>
              <span className="text-slate-900 dark:text-white">৳{PLANS_INFO[selectedPlan].price}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/50 dark:border-slate-700 pt-2 font-black text-slate-800 dark:text-slate-200">
              <span>Txn ID (লেনদেন আইডি):</span>
              <span className="text-emerald-500 font-mono select-all">{txnId}</span>
            </div>
          </div>

          <button
            onClick={handleEnterSellerPortal}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <span>{language === 'bn' ? 'বিক্রেতা ড্যাশবোর্ডে প্রবেশ করুন' : 'Launch Seller Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
