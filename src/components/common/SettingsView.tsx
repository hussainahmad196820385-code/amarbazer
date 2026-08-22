import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../translations';
import { 
  Sliders, Save, RefreshCw, Check, ShieldAlert, 
  Globe, Sun, Moon, CreditCard, Lock, Smartphone, 
  Store, User, Bell, HelpCircle, Eye, ChevronRight, Volume2, Trash2, ShieldCheck,
  Palette, Sparkles, Download, Terminal, Layers, Radio, MessageCircle, ExternalLink
} from 'lucide-react';
import { AdminDashboard } from '../admin/AdminDashboard';
import { nativeBridge } from '../../services/nativeBridge';

export const SettingsView: React.FC = () => {
  const { 
    language, setLanguage, 
    theme, setTheme, 
    currentUser, setCurrentUser,
    activePanel, setActivePanel,
    systemSettings,
    colorPalette, setColorPalette,
    customColorHex, setCustomColorHex
  } = useApp();

  // Local state for system settings configuration
  const [siteName, setSiteName] = useState(systemSettings.siteName);
  const [siteNameBn, setSiteNameBn] = useState(systemSettings.siteNameBn);
  const [supportPhone, setSupportPhone] = useState(systemSettings.supportPhone);
  const [supportEmail, setSupportEmail] = useState(systemSettings.supportEmail);
  const [insideFee, setInsideFee] = useState(systemSettings.insideDhakaShippingFee);
  const [outsideFee, setOutsideFee] = useState(systemSettings.outsideDhakaShippingFee);
  const [commission, setCommission] = useState(systemSettings.commissionPercentage);
  const [maintenance, setMaintenance] = useState(systemSettings.isMaintenanceMode);

  // Simulation settings
  const [simulateOtp, setSimulateOtp] = useState(true);
  const [activePaymentGateways, setActivePaymentGateways] = useState({
    bkash: true,
    nagad: true,
    rocket: true,
    card: true,
    cod: true
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'system' | 'appearance' | 'account' | 'payment' | 'sounds' | 'translation_rules' | 'admin_panel' | 'color_palette' | 'android_app' | 'messenger_automation'>('system');

  // Facebook Messenger & WhatsApp Automation Settings State
  const [fbPageUsername, setFbPageUsername] = useState(() => {
    return localStorage.getItem('amarbazar_fb_page_username') || 'AmarBazarBD.Official';
  });
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    return localStorage.getItem('amarbazar_whatsapp_number') || '8801712345678';
  });
  const [fbAutoReplyGreeting, setFbAutoReplyGreeting] = useState(() => {
    return localStorage.getItem('amarbazar_fb_greeting') || 'আসসালামু আলাইকুম! আমারবাজার বিডি-তে আপনাকে স্বাগতম। আমরা সাধারণত সাথে সাথে উত্তর দিয়ে থাকি।';
  });
  const [fbTrackOrderEnabled, setFbTrackOrderEnabled] = useState(true);
  const [fbDailyDealsEnabled, setFbDailyDealsEnabled] = useState(true);
  const [fbDeliveryFaqEnabled, setFbDeliveryFaqEnabled] = useState(true);
  const [fbMessengerSaved, setFbMessengerSaved] = useState(false);

  const handleSaveMessengerSettings = () => {
    localStorage.setItem('amarbazar_fb_page_username', fbPageUsername.trim());
    localStorage.setItem('amarbazar_whatsapp_number', whatsappNumber.trim());
    localStorage.setItem('amarbazar_fb_greeting', fbAutoReplyGreeting.trim());
    setFbMessengerSaved(true);
    setTimeout(() => setFbMessengerSaved(false), 2500);
  };

  // Custom English to Bangla replacements
  const [replacements, setReplacements] = useState<Array<{ id: string; originalText: string; replacementText: string; userRole: string }>>(() => {
    const saved = localStorage.getItem('customReplacements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default interactive replacement rules for preview demonstration
    return [
      { id: '1', originalText: 'Cart', replacementText: 'ঝুড়ি (আমার ব্যাগ)', userRole: 'customer' },
      { id: '2', originalText: 'Buy Now', replacementText: 'সরাসরি কিনুন', userRole: 'customer' },
      { id: '3', originalText: 'myProducts', replacementText: 'আমার নিজস্ব পণ্য', userRole: 'seller' },
      { id: '4', originalText: 'myProducts', replacementText: 'ম্যানেজার প্রোডাক্টস', userRole: 'manager' }
    ];
  });

  const handleSaveReplacements = (updated: typeof replacements) => {
    setReplacements(updated);
    localStorage.setItem('customReplacements', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  // Sound Config States
  const [selectedSound, setSelectedSound] = useState('success_bell');
  const [soundVolume, setSoundVolume] = useState(70);
  const [newSoundLabel, setNewSoundLabel] = useState('');
  const [newSoundUrl, setNewSoundUrl] = useState('');
  const [customSounds, setCustomSounds] = useState<Array<{ label: string; url: string }>>([
    { label: 'Standard Beep SFX', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav' }
  ]);

  const handleAddCustomSound = () => {
    if (!newSoundLabel.trim() || !newSoundUrl.trim()) return;
    setCustomSounds(prev => [...prev, { label: newSoundLabel.trim(), url: newSoundUrl.trim() }]);
    setNewSoundLabel('');
    setNewSoundUrl('');
    alert('New Sound registered successfully!');
  };

  const playSynthesizedTone = (type: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      const volMultiplier = soundVolume / 100;

      if (type === 'success_bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.15 * volMultiplier, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'laser_blast') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1 * volMultiplier, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'soft_pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.2 * volMultiplier, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'double_alarm') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.15 * volMultiplier, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.0, ctx.currentTime + 0.12);
        gainNode.gain.setValueAtTime(0.15 * volMultiplier, ctx.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.log('Web Audio Context blocked/unsupported');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    // In-memory update
    systemSettings.siteName = siteName;
    systemSettings.siteNameBn = siteNameBn;
    systemSettings.supportPhone = supportPhone;
    systemSettings.supportEmail = supportEmail;
    systemSettings.insideDhakaShippingFee = Number(insideFee);
    systemSettings.outsideDhakaShippingFee = Number(outsideFee);
    systemSettings.commissionPercentage = Number(commission);
    systemSettings.isMaintenanceMode = maintenance;

    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  const toggleGateway = (gateway: keyof typeof activePaymentGateways) => {
    setActivePaymentGateways(prev => ({
      ...prev,
      [gateway]: !prev[gateway]
    }));
  };

  return (
    <div id="settings-view-container" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-6 text-white relative">
        <div className="absolute right-6 top-6 opacity-10">
          <Sliders className="w-24 h-24" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-sans flex items-center gap-2">
          <Sliders className="w-6 h-6 text-emerald-300" />
          {language === 'bn' ? 'সিস্টেম সেটিংস ও কনফিগারেশন' : 'System Settings & Config'}
        </h2>
        <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
          {language === 'bn' 
            ? 'আমার বাজার ডিজিটাল প্ল্যাটফর্মের ডেলিভারি ফি, পেমেন্ট গেটওয়ে, অ্যাকাউন্ট রোল ও থিম কনফিগার করুন।' 
            : 'Configure delivery fees, payment gateways, role simulations, and localized parameters of AmarBazar.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Settings Navigation */}
        <div className="p-4 lg:col-span-1 space-y-1 bg-slate-50/50 dark:bg-slate-950/20">
          <button 
            onClick={() => setActiveSubTab('system')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeSubTab === 'system' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              {language === 'bn' ? 'মার্কেটপ্লেস প্যারামিটার' : 'Market Parameters'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button 
            onClick={() => setActiveSubTab('appearance')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeSubTab === 'appearance' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              {language === 'bn' ? 'ডিজাইন ও ভাষা থিম' : 'Aesthetic & Language'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button 
            onClick={() => setActiveSubTab('payment')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeSubTab === 'payment' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {language === 'bn' ? 'পেমেন্ট গেটওয়ে সিমুলেশন' : 'Payment Gateways'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button 
            onClick={() => setActiveSubTab('sounds')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeSubTab === 'sounds' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-500" />
              {language === 'bn' ? 'সিস্টেম সাউন্ড সেটিংস' : 'System SFX & Sounds'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button 
            onClick={() => setActiveSubTab('account')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeSubTab === 'account' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {language === 'bn' ? 'অ্যাকাউন্ট ভিউ ও রোলস' : 'User Role Override'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button 
            onClick={() => setActiveSubTab('translation_rules')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeSubTab === 'translation_rules' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'ইংরেজি-বাংলা প্রতিস্থাপন' : 'English-Bangla Translation'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button 
            onClick={() => setActiveSubTab('admin_panel')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeSubTab === 'admin_panel' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'এডমিন কন্ট্রোল প্যানেল' : 'Admin Control Panel'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button 
            onClick={() => setActiveSubTab('color_palette')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeSubTab === 'color_palette' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'সিস্টেম কালার প্যালেট' : 'System Color Palette'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button 
            onClick={() => setActiveSubTab('android_app')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeSubTab === 'android_app' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'অ্যান্ড্রয়েড অ্যাপ ও প্লে স্টোর' : 'Android App & Play Store'}
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-md">
              AAB Ready
            </span>
          </button>

          <button 
            onClick={() => setActiveSubTab('messenger_automation')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeSubTab === 'messenger_automation' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="flex items-center -space-x-1">
                <span className="w-3.5 h-3.5 rounded-full bg-[#25D366] flex items-center justify-center text-white text-[8px] font-black">W</span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#0084FF] flex items-center justify-center text-white text-[8px] font-black">M</span>
              </span>
              {language === 'bn' ? 'হোয়াটসঅ্যাপ ও মেসেঞ্জার অটোমেশন' : 'WhatsApp & FB Automation'}
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-md">
              100% Free
            </span>
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="p-6 lg:col-span-3 min-h-[400px]">
          {activeSubTab === 'system' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  {language === 'bn' ? 'মার্কেটপ্লেস প্যারামিটার ও সেটিংস' : 'Marketplace Base Parameters'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {language === 'bn' ? 'সাইটের নাম (ইংরেজি)' : 'Platform Name (English)'}
                  </label>
                  <input 
                    type="text" 
                    value={siteName} 
                    onChange={e => setSiteName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {language === 'bn' ? 'সাইটের নাম (বাংলা)' : 'Platform Name (Bangla)'}
                  </label>
                  <input 
                    type="text" 
                    value={siteNameBn} 
                    onChange={e => setSiteNameBn(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {language === 'bn' ? 'সহায়তা ফোন নম্বর' : 'Customer Hotline (Support)'}
                  </label>
                  <input 
                    type="text" 
                    value={supportPhone} 
                    onChange={e => setSupportPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {language === 'bn' ? 'সহায়তা ইমেইল' : 'Hotline Support Email'}
                  </label>
                  <input 
                    type="email" 
                    value={supportEmail} 
                    onChange={e => setSupportEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {language === 'bn' ? 'ঢাকার মধ্যে ডেলিভারি ফি (৳)' : 'Inside Dhaka Delivery Fee (৳)'}
                  </label>
                  <input 
                    type="number" 
                    value={insideFee} 
                    onChange={e => setInsideFee(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {language === 'bn' ? 'ঢাকার বাইরে ডেলিভারি ফি (৳)' : 'Outside Dhaka Delivery Fee (৳)'}
                  </label>
                  <input 
                    type="number" 
                    value={outsideFee} 
                    onChange={e => setOutsideFee(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {language === 'bn' ? 'প্ল্যাটফর্ম কমিশন (%)' : 'Platform Commission Fee (%)'}
                  </label>
                  <input 
                    type="number" 
                    value={commission} 
                    onChange={e => setCommission(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200/50 dark:border-slate-800 mt-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'মেইনটেন্যান্স মোড' : 'Maintenance Mode'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {language === 'bn' ? 'চালু করলে প্ল্যাটফর্ম অফলাইন দেখাবে' : 'Will temporarily disable client checkout'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaintenance(!maintenance)}
                    className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                      maintenance ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                      maintenance ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>{language === 'bn' ? 'সেভ করা হয়েছে!' : 'Saved Successfully!'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{language === 'bn' ? 'পরিবর্তনগুলো সংরক্ষণ করুন' : 'Save Configurations'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-emerald-600" />
                  {language === 'bn' ? 'ডিজাইন, থিম এবং ভাষা নির্বাচন' : 'Aesthetic & Localization Preferences'}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {language === 'bn' ? 'সিস্টেম ভাষা (Localization Language)' : 'Active System Language'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLanguage('bn')}
                      className={`p-4 rounded-xl border text-center transition ${
                        language === 'bn' 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-bold' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Globe className="w-5 h-5 mx-auto mb-2 text-emerald-600" />
                      <div className="text-xs">বাংলা (Bangla)</div>
                      <div className="text-[10px] opacity-60 mt-0.5">সবচেয়ে জনপ্রিয় দেশীয় ভাষা</div>
                    </button>

                    <button
                      onClick={() => setLanguage('en')}
                      className={`p-4 rounded-xl border text-center transition ${
                        language === 'en' 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-bold' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Globe className="w-5 h-5 mx-auto mb-2 text-teal-600" />
                      <div className="text-xs">English (US)</div>
                      <div className="text-[10px] opacity-60 mt-0.5">Global business standard</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {language === 'bn' ? 'অ্যাক্টিভ থিম মোড' : 'Active Theme Mode'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-xl border text-center transition ${
                        theme === 'light' 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-bold' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Sun className="w-5 h-5 mx-auto mb-2 text-amber-500" />
                      <div className="text-xs">{language === 'bn' ? 'লাইট মোড' : 'Light Theme'}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{language === 'bn' ? 'দিনের আলোতে পরিষ্কার ভিউ' : 'Balanced light colors'}</div>
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-xl border text-center transition ${
                        theme === 'dark' 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-bold' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Moon className="w-5 h-5 mx-auto mb-2 text-teal-400" />
                      <div className="text-xs">{language === 'bn' ? 'নাইট / ডার্ক মোড' : 'Dark Luxury Theme'}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{language === 'bn' ? 'চোখের সুরক্ষা এবং কালো থিম' : 'Eye-protecting night canvas'}</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'sounds' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  {language === 'bn' ? 'সিস্টেম সাউন্ড ও সতর্কতা নোটিফিকেশন' : 'System Alert Sounds & SFX Node'}
                </h3>
              </div>

              <div className="space-y-6">
                <p className="text-xs text-slate-500">
                  {language === 'bn' 
                    ? 'প্ল্যাটফর্মের বিভিন্ন কাজের (পণ্য মুছে ফেলা, সংরক্ষণ, অর্ডার কনফার্মেশন) জন্য কাস্টম সাউন্ড এবং টোন কনফিগার করুন।' 
                    : 'Customize audio alerts, alert volumes, or register new custom external MP3 audio streams for specific ERP events.'}
                </p>

                {/* Predefined Synthesized Sounds */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'bn' ? 'সাউন্ড প্রিসেট সিলেকশন' : 'Synthesizer Preset Tones'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Active Event SFX</label>
                      <select
                        value={selectedSound}
                        onChange={(e) => {
                          setSelectedSound(e.target.value);
                          playSynthesizedTone(e.target.value);
                        }}
                        className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none"
                      >
                        <option value="success_bell">Retro Success Bell (অর্ডার কনফার্ম)</option>
                        <option value="laser_blast">8-Bit Laser Blast (পণ্য ডিলিট)</option>
                        <option value="soft_pop">Soft Pop Tap (অপশন চেঞ্জ)</option>
                        <option value="double_alarm">Double Chime Alert (ওয়ার্নিং অ্যালার্ট)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alert Volume</label>
                      <div className="flex items-center space-x-3 pt-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={soundVolume}
                          onChange={(e) => {
                            setSoundVolume(Number(e.target.value));
                            playSynthesizedTone(selectedSound);
                          }}
                          className="w-full accent-amber-500"
                        />
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 min-w-[32px]">{soundVolume}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => playSynthesizedTone(selectedSound)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition shadow-xs"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Test Active Sound Preset</span>
                    </button>
                  </div>
                </div>

                {/* Register New External Audio URLs */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'bn' ? 'নতুন কাস্টম সাউন্ড লিংক যোগ করুন' : 'Register Custom MP3 Sound Source'}
                  </h4>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sound Label / Action Name</label>
                        <input
                          type="text"
                          value={newSoundLabel}
                          onChange={(e) => setNewSoundLabel(e.target.value)}
                          placeholder="e.g., Cash Cash Ringtone"
                          className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Direct .mp3 URL</label>
                        <input
                          type="text"
                          value={newSoundUrl}
                          onChange={(e) => setNewSoundUrl(e.target.value)}
                          placeholder="https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav"
                          className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCustomSound}
                      className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <span>Add & Register Sound</span>
                    </button>
                  </div>

                  {customSounds.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 space-y-2">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Custom Sounds</h5>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {customSounds.map((snd, idx) => (
                          <div key={idx} className="py-2 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{snd.label}</span>
                              <span className="block text-[9px] text-slate-400 truncate max-w-xs">{snd.url}</span>
                            </div>
                            <button
                              onClick={() => {
                                const audio = new Audio(snd.url);
                                audio.volume = soundVolume / 100;
                                audio.play().catch(() => playSynthesizedTone('success_bell'));
                              }}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded font-bold text-[10px]"
                            >
                              Play Test
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {activeSubTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  {language === 'bn' ? 'পেমেন্ট গেটওয়ে এবং এপিআই কনফিগারেশন' : 'Payment Gateways & Api Simulations'}
                </h3>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  {language === 'bn' 
                    ? 'গ্রাহক চেকআউট করার সময় কোন কোন পেমেন্ট মেথড দেখতে পাবে তা নির্বাচন করুন। প্রতিটি সম্পূর্ণ ইন্টারেক্টিভ।' 
                    : 'Select which payment methods should be authorized during checkout. Each of these simulated pipelines works in real-time.'}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center font-bold text-pink-600 text-xs">bk</div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">bKash Mobile Money (বিকাশ)</span>
                        <span className="text-[10px] text-slate-400">Direct wallet payment with Sandbox PIN logic</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGateway('bkash')}
                      className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                        activePaymentGateways.bkash ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                        activePaymentGateways.bkash ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center font-bold text-orange-600 text-xs">ng</div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Nagad (নগদ পেমেন্ট)</span>
                        <span className="text-[10px] text-slate-400">Direct Nagad API integration simulation</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGateway('nagad')}
                      className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                        activePaymentGateways.nagad ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                        activePaymentGateways.nagad ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center font-bold text-purple-600 text-xs">rc</div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Rocket (রকেট)</span>
                        <span className="text-[10px] text-slate-400">Dutch-Bangla Bank mobile financial network</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGateway('rocket')}
                      className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                        activePaymentGateways.rocket ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                        activePaymentGateways.rocket ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center font-bold text-blue-600 text-xs">cc</div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Debit / Credit Card (Visa/Mastercard)</span>
                        <span className="text-[10px] text-slate-400">Secure checkout via SSLCommerz simulation gateway</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGateway('card')}
                      className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                        activePaymentGateways.card ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                        activePaymentGateways.card ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center font-bold text-emerald-600 text-xs">cod</div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-slate-400">Pay with real cash to Pathao/RedX delivery personnel</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGateway('cod')}
                      className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                        activePaymentGateways.cod ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                        activePaymentGateways.cod ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl mt-4">
                  <div className="flex space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      <p className="font-bold">Sandbox Warning</p>
                      <p className="mt-0.5 text-[11px] opacity-90 leading-relaxed">
                        Each gateway has been integrated in **Sandbox Mode**. All funds are virtual, and the delivery addresses are verified against BD Postcode records.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  {language === 'bn' ? 'ব্যবহারকারী এবং অ্যাক্সেস কন্ট্রোল রোলস' : 'User Role Simulation Controls'}
                </h3>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  {language === 'bn' 
                    ? 'খুব সহজে এক ক্লিকে গ্রাহক, বিক্রেতা অথবা সিস্টেম এডমিন রোল-এ সুইচ করে ভিন্ন ভিউ পরীক্ষা করতে পারেন।' 
                    : 'Switch your active user identity profile instantly to test other panels in real-time. No verification code required.'}
                </p>

                {currentUser ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                        alt={currentUser.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</h4>
                        <p className="text-[10px] text-slate-500">{currentUser.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold rounded text-[9px] uppercase tracking-wide">
                          {currentUser.role}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 justify-end max-w-lg">
                      <button
                        onClick={() => {
                          setCurrentUser({
                            ...currentUser,
                            role: 'customer'
                          });
                          setActivePanel('customer');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${
                          currentUser.role === 'customer' 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {language === 'bn' ? 'কাস্টমার' : 'Customer'}
                      </button>

                      <button
                        onClick={() => {
                          setCurrentUser({
                            ...currentUser,
                            role: 'seller'
                          });
                          setActivePanel('seller');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${
                          currentUser.role === 'seller' 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {language === 'bn' ? 'সেলার' : 'Seller'}
                      </button>

                      <button
                        onClick={() => {
                          setCurrentUser({
                            ...currentUser,
                            role: 'manager'
                          });
                          setActivePanel('seller');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${
                          currentUser.role === 'manager' 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {language === 'bn' ? 'ম্যানেজার' : 'Manager'}
                      </button>

                      <button
                        onClick={() => {
                          setCurrentUser({
                            ...currentUser,
                            role: 'admin'
                          });
                          setActivePanel('admin');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${
                          currentUser.role === 'admin' 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {language === 'bn' ? 'এডমিন' : 'Admin'}
                      </button>

                      <button
                        onClick={() => {
                          setCurrentUser({
                            ...currentUser,
                            role: 'system_admin'
                          });
                          setActivePanel('admin');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${
                          currentUser.role === 'system_admin' 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {language === 'bn' ? 'সিস্টেম এডমিন' : 'Sys Admin'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400">{language === 'bn' ? 'কোনো ইউজার লগইন করা নেই।' : 'No user currently logged in.'}</p>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                    <div>
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'ওটিপি (OTP) ও বাইপাস সুবিধা' : 'OTP & Mobile Autocomplete Bypass'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {language === 'bn' ? 'অটো-ওটিপি ফিল ইন সিমুলেট' : 'Skip physical SMS costs by auto-filling verified OTP blocks'}
                      </span>
                    </div>
                    <button
                      onClick={() => setSimulateOtp(!simulateOtp)}
                      className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                        simulateOtp ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                        simulateOtp ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'translation_rules' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  {language === 'bn' ? 'ইংরেজি থেকে বাংলা ইউজার-ওয়াইজ প্রতিস্থাপন সেটিংস' : 'User-Wise English-to-Bangla Custom Replacement'}
                </h3>
              </div>

              {currentUser?.role !== 'system_admin' ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-400">
                    <Lock className="w-8 h-8 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans">
                        {language === 'bn' ? 'অ্যাক্সেস সংরক্ষিত: শুধুমাত্র সিস্টেম এডমিন' : 'Access Restricted: System Admin Only'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {language === 'bn' 
                          ? 'দুঃখিত, এই প্রতিস্থাপন সেটিংস কনফিগার করার সর্বোচ্চ পাওয়ার শুধুমাত্র সিস্টেম এডমিন (System Admin) এর রয়েছে। কাস্টমার, সেলার বা ম্যানেজার এই সেটিংস পরিবর্তন করতে পারবেন না।'
                          : 'Only the System Administrator has the privilege to view and configure English-to-Bangla translation replacements.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        setCurrentUser({
                          id: 'usr-sysadmin-1',
                          name: 'System Admin (Ultimate)',
                          email: 'systemadmin@amarbazar.com.bd',
                          phone: '01900000000',
                          role: 'system_admin',
                          isVerified: true,
                          addresses: [],
                          createdAt: new Date().toISOString()
                        });
                        setActivePanel('settings');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>{language === 'bn' ? 'সিস্টেম এডমিন হিসেবে সুইচ করুন' : 'Simulate as System Admin'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-xs text-slate-500">
                    {language === 'bn'
                      ? 'এখানে আপনি নির্দিষ্ট ইউজারের রোল বা ক্যাটাগরি অনুযায়ী যেকোনো ইংরেজি শব্দের বাংলা অনুবাদ বা কাস্টম প্রতিস্থাপন সেট করতে পারেন।'
                      : 'Define custom Bangla translation overrides for specific user roles. English words or UI translation keys will be replaced on the fly.'}
                  </p>

                  {/* Add New Replacement Rule Form */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {language === 'bn' ? 'নতুন প্রতিস্থাপন রুল যোগ করুন' : 'Add New Replacement Override Rule'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          {language === 'bn' ? 'ইংরেজি শব্দ / কী (Original Key/Text)' : 'English Word or Translation Key'}
                        </label>
                        <input
                          id="new-rule-original"
                          type="text"
                          placeholder="e.g., Cart or Buy Now"
                          className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          {language === 'bn' ? 'বাংলা প্রতিস্থাপন শব্দ (Bangla Replacement)' : 'Bangla Override Text'}
                        </label>
                        <input
                          id="new-rule-replacement"
                          type="text"
                          placeholder="e.g., বাজারের ঝুড়ি"
                          className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          {language === 'bn' ? 'ব্যবহারকারী রোল (Applicable User Role)' : 'Target User Role'}
                        </label>
                        <select
                          id="new-rule-role"
                          className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        >
                          <option value="all">{language === 'bn' ? 'সকল ব্যবহারকারী (All Users)' : 'All Users'}</option>
                          <option value="customer">{language === 'bn' ? 'কাস্টমার (Customer)' : 'Customer'}</option>
                          <option value="seller">{language === 'bn' ? 'সেলার (Seller)' : 'Seller'}</option>
                          <option value="manager">{language === 'bn' ? 'ম্যানেজার (Manager)' : 'Manager'}</option>
                          <option value="admin">{language === 'bn' ? 'এডমিন (Admin)' : 'Admin'}</option>
                          <option value="system_admin">{language === 'bn' ? 'সিস্টেম এডমিন (System Admin)' : 'System Admin'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const origInput = document.getElementById('new-rule-original') as HTMLInputElement;
                          const replInput = document.getElementById('new-rule-replacement') as HTMLInputElement;
                          const roleSelect = document.getElementById('new-rule-role') as HTMLSelectElement;

                          if (!origInput?.value.trim() || !replInput?.value.trim()) {
                            alert(language === 'bn' ? 'সবগুলো ঘর সঠিকভাবে পূরণ করুন!' : 'Please fill all required fields!');
                            return;
                          }

                          const newRule = {
                            id: `rule-${Date.now()}`,
                            originalText: origInput.value.trim(),
                            replacementText: replInput.value.trim(),
                            userRole: roleSelect.value
                          };

                          const updated = [...replacements, newRule];
                          handleSaveReplacements(updated);
                          
                          origInput.value = '';
                          replInput.value = '';
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'রুল যুক্ত করুন' : 'Add Rule Override'}</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Custom Replacements */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'bn' ? 'সক্রিয় অনুবাদ প্রতিস্থাপন রুলসমূহ' : 'Active Custom Translation Rules'} ({replacements.length})
                      </span>
                    </div>

                    {replacements.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        {language === 'bn' ? 'কোনো কাস্টম প্রতিস্থাপন রুল সেট করা নেই।' : 'No custom replacement rules defined yet.'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase">
                            <tr>
                              <th className="p-3">{language === 'bn' ? 'মূল ইংরেজি শব্দ / কী' : 'Original Text / Key'}</th>
                              <th className="p-3">{language === 'bn' ? 'নতুন বাংলা প্রতিস্থাপন' : 'Bangla Replacement'}</th>
                              <th className="p-3">{language === 'bn' ? 'প্রযোজ্য ইউজার রোল' : 'Applicable Role'}</th>
                              <th className="p-3 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
                            {replacements.map((rule) => (
                              <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{rule.originalText}</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{rule.replacementText}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                    rule.userRole === 'all' 
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' 
                                      : rule.userRole === 'manager'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                      : 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300'
                                  }`}>
                                    {rule.userRole}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => {
                                      const updated = replacements.filter(r => r.id !== rule.id);
                                      handleSaveReplacements(updated);
                                    }}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded cursor-pointer"
                                    title="Delete rule"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl">
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {language === 'bn' 
                          ? 'প্রতিস্থাপনগুলো পরিবর্তনের পর সরাসরি কাজ করবে। আপনার ইউজার রোল কাস্টমাইজ করে এটি ইনস্ট্যান্ট টেস্ট করুন!' 
                          : 'Overriding translation values takes effect immediately. Try changing your simulated user role to observe dynamic translations!'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'admin_panel' && (
            <AdminDashboard />
          )}

          {activeSubTab === 'color_palette' && (
            <div id="settings-color-palette-container" className="space-y-6">
              <div id="settings-color-palette-header">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-emerald-600 animate-pulse" />
                  {language === 'bn' ? 'সিস্টেম কালার থিম কাস্টমাইজেশন' : 'System Theme Color Customizer'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'bn' 
                    ? 'আপনার পছন্দের কালার সিলেক্ট করুন, পুরো সিস্টেমের বাটন, নোটিফিকেশন, হাইলাইট এবং এআই অ্যাসিস্ট্যান্ট ইনস্ট্যান্ট সেই কালারে রুপান্তরিত হবে।' 
                    : 'Select your preferred theme color. Buttons, tags, progress states, alert overlays, and AI system features will update in real-time.'}
                </p>
              </div>

              {/* Custom Color Picker Card */}
              <div id="custom-color-picker-card" className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      🎨 {language === 'bn' ? 'কাস্টম ব্র্যান্ড কালার সিলেক্টর' : 'Custom Brand Color Picker'}
                    </span>
                  </div>
                  {colorPalette === 'custom' && (
                    <span className="px-2 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase rounded-md border border-emerald-500/20 animate-pulse">
                      {language === 'bn' ? 'কাস্টম অ্যাক্টিভ' : 'Custom Color Active'}
                    </span>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Color Preview Block */}
                  <div 
                    id="custom-color-preview-circle"
                    className="w-14 h-14 rounded-xl shadow-lg border border-white/20 relative flex items-center justify-center transition-all duration-300 hover:scale-105 shrink-0"
                    style={{ backgroundColor: customColorHex }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none"></div>
                    <Check className="w-6 h-6 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] opacity-80" />
                  </div>

                  {/* Picker Inputs */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <input 
                          id="manual-color-hex-input"
                          type="text" 
                          value={customColorHex} 
                          onChange={(e) => {
                            let val = e.target.value;
                            if (!val.startsWith('#') && val.length > 0) {
                              val = '#' + val;
                            }
                            setCustomColorHex(val);
                            setColorPalette('custom');
                          }}
                          className="w-full pl-3 pr-10 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                          placeholder="#E11D48"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold uppercase">Hex</span>
                      </div>

                      {/* Native Picker Wrapper */}
                      <div className="relative flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
                        <input 
                          id="native-color-palette-picker"
                          type="color" 
                          value={customColorHex.startsWith('#') && customColorHex.length === 7 ? customColorHex : '#ef4444'} 
                          onChange={(e) => {
                            setCustomColorHex(e.target.value);
                            setColorPalette('custom');
                          }}
                          className="w-6 h-6 rounded-md cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          {language === 'bn' ? 'প্যালেট ওপেন করুন' : 'Pick Color'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Demo Brands */}
                    <div className="space-y-1">
                      <div className="text-[9px] text-slate-400 uppercase font-black tracking-wider">
                        ⚡ {language === 'bn' ? 'জনপ্রিয় ব্র্যান্ড কালার টেমপ্লেট' : 'Popular Brand Inspirations'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Netflix Red', color: '#E50914' },
                          { name: 'Spotify Green', color: '#1DB954' },
                          { name: 'Messenger', color: '#00B2FF' },
                          { name: 'YouTube Red', color: '#FF0000' },
                          { name: 'WhatsApp', color: '#25D366' },
                          { name: 'Premium Gold', color: '#D4AF37' },
                          { name: 'Grape Purple', color: '#7A1FA2' }
                        ].map((brand) => (
                          <button
                            key={brand.name}
                            id={`brand-color-btn-${brand.name.toLowerCase().replace(' ', '-')}`}
                            onClick={() => {
                              setCustomColorHex(brand.color);
                              setColorPalette('custom');
                              playSynthesizedTone('success_bell');
                            }}
                            className="text-[10px] px-2 py-0.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all duration-200 hover:scale-102 cursor-pointer"
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.color }}></span>
                            {brand.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. COLOR PALETTE Dashboard Header */}
              <div id="presets-color-header" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black tracking-wide text-slate-800 dark:text-slate-100 uppercase">
                    ✨ {language === 'bn' ? 'সিস্টেম প্রিসেট কালার প্যালেটসমূহ' : 'System Preset Color Palettes'}
                  </span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {language === 'bn' ? '২৩ টি ইউনিক প্রিসেট' : '23 Presets'}
                </span>
              </div>

              {/* Compact Color Palette Grid */}
              <div id="preset-palettes-compact-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                {[
                  { key: 'mint', name: 'Mint', nameBn: 'মিন্ট গ্রিন', color: '#10b981' },
                  { key: 'amber', name: 'Amber', nameBn: 'অ্যাম্বার গোল্ড', color: '#f59e0b' },
                  { key: 'sky', name: 'Sky', nameBn: 'স্কাই ব্লু', color: '#0ea5e9' },
                  { key: 'blush', name: 'Blush', nameBn: 'ব্লুশ রোজ', color: '#f43f5e' },
                  { key: 'crimson', name: 'Crimson', nameBn: 'ক্রিমসন রেড', color: '#ef4444' },
                  { key: 'indigo', name: 'Indigo', nameBn: 'ইন্ডিগো ব্লু', color: '#6366f1' },
                  { key: 'lavender', name: 'Lavender', nameBn: 'ল্যাভেন্ডার পার্পল', color: '#8b5cf6' },
                  { key: 'orange', name: 'Orange', nameBn: 'অরেঞ্জ সানসেট', color: '#f97316' },
                  { key: 'gold', name: 'Gold', nameBn: 'সান গোল্ড', color: '#eab308' },
                  { key: 'magenta', name: 'Magenta', nameBn: 'ম্যাজেন্টা পিঙ্ক', color: '#d946ef' },
                  { key: 'turquoise', name: 'Turquoise', nameBn: 'টার্কিশ সায়ান', color: '#06b6d4' },
                  { key: 'lime', name: 'Lime', nameBn: 'লাইম গ্রিন', color: '#84cc16' },
                  { key: 'sapphire', name: 'Sapphire', nameBn: 'স্যাফায়ার রয়্যাল', color: '#3b82f6' },
                  { key: 'forest', name: 'Forest', nameBn: 'ফরেস্ট ডার্ক', color: '#22c55e' },
                  { key: 'teal', name: 'Teal', nameBn: 'তিল গ্রিন', color: '#14b8a6' },
                  { key: 'violet', name: 'Violet', nameBn: 'ভায়োলেট', color: '#a855f7' },
                  { key: 'emerald', name: 'Emerald', nameBn: 'এমেরাল্ড গ্রিন', color: '#059669' },
                  { key: 'rose', name: 'Rose', nameBn: 'রোজ পিঙ্ক', color: '#f43f5e' },
                  { key: 'coral', name: 'Coral', nameBn: 'কোরাল রেড', color: '#ff6b6b' },
                  { key: 'fuchsia', name: 'Fuchsia', nameBn: 'ফিউশিয়া পিঙ্ক', color: '#d946ef' },
                  { key: 'plum', name: 'Plum', nameBn: 'প্লাম বেগুনি', color: '#db2777' },
                  { key: 'slate', name: 'Slate', nameBn: 'স্লেট গ্রে', color: '#64748b' },
                  { key: 'bronze', name: 'Bronze', nameBn: 'ব্রোঞ্জ গোল্ড', color: '#8c7355' }
                ].map((palette) => {
                  const isSelected = colorPalette === palette.key;
                  return (
                    <button
                      key={palette.key}
                      id={`palette-preset-${palette.key}`}
                      onClick={() => {
                        setColorPalette(palette.key as any);
                        playSynthesizedTone('success_bell');
                      }}
                      className={`relative flex items-center gap-2 p-2 rounded-lg border text-left transition duration-200 cursor-pointer hover:scale-101 ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10 font-bold ring-2 ring-emerald-500/10' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Color Preview circle */}
                      <span 
                        className="w-3 h-3 rounded-full shrink-0 border border-black/10 dark:border-white/10" 
                        style={{ backgroundColor: palette.color }}
                      ></span>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                          {palette.name}
                        </div>
                        <div className="text-[8px] text-slate-400 dark:text-slate-500 truncate leading-none">
                          {language === 'bn' ? palette.nameBn : palette.name}
                        </div>
                      </div>

                      {/* Check icon */}
                      {isSelected && (
                        <Check className="w-3 h-3 text-emerald-500 shrink-0 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Helpful Alert */}
              <div id="palette-sync-alert" className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl mt-6 flex gap-3 items-start">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  <span className="font-bold block mb-0.5">
                    {language === 'bn' ? 'অ্যাক্টিভ থিম কালার সিনক্রোনাইজেশন' : 'Real-time Color Synchronization'}
                  </span>
                  {language === 'bn'
                    ? 'সিস্টেমের সমস্ত বাটন, লিঙ্ক, ব্যাজ, সিগন্যাল লাইট, চ্যাট ইন্টারফেস এবং এআই মডিউল এখন সরাসরি সিলেক্টেড কালারে রেন্ডার হচ্ছে। এটি আপনার সেশন জুড়ে সংরক্ষিত থাকবে।'
                    : 'The entire interface dynamically synchronizes with your choice. This changes the colors of primary CTA buttons, alerts, bottom tabs, vendor features, and AI widgets.'}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'android_app' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    {language === 'bn' ? 'অ্যান্ড্রয়েড অ্যাপ ও গুগল প্লে স্টোর পাবলিশিং' : 'Android App & Play Store Hub'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'bn'
                      ? 'একই কোডবেস এবং একই সেন্ট্রাল ডাটাবেস দিয়ে তৈরি ওয়েবসাইট ও অ্যান্ড্রয়েড অ্যাপ্লিকেশন।'
                      : 'Unified single codebase and shared live database powering both Web and Android Apps.'}
                  </p>
                </div>

                <span className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${
                  nativeBridge.isNative() 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                }`}>
                  <Radio className="w-3 h-3 animate-pulse" />
                  {nativeBridge.isNative() ? 'Native Android Runtime' : 'Web & PWA Runtime'}
                </span>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {language === 'bn' ? 'অ্যাপ্লিকেশন প্যাকেজ আইডি' : 'Package ID'}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 truncate">
                    com.amarbazar.app
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Play Store Compliant
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {language === 'bn' ? 'টার্গেট অ্যান্ড্রয়েড এসডিকে' : 'Target Android SDK'}
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Android 14 (SDK 34)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Min SDK: 22 (Android 5.1+)
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {language === 'bn' ? 'ডাটাবেস ও বিজনেস লজিক' : 'Architecture'}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    100% Shared & Unified
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Same users, cart, orders & db
                  </div>
                </div>
              </div>

              {/* Native Android Features Checklist */}
              <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  {language === 'bn' ? 'অ্যান্ড্রয়েড নেটিভ ফিচারের বর্তমান অবস্থা' : 'Android Native Capabilities Ready'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Hardware Back Button</div>
                      <div className="text-[10px] text-slate-500">মডাল/ড্রয়ার বন্ধ ও ডাবল-ট্যাপ এক্সিট সুবিধা</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Splash Screen & Status Bar</div>
                      <div className="text-[10px] text-slate-500">সলিড এমারাল্ড স্প্ল্যাশ ও ডার্ক স্ট্যাটাস বার</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Camera & Gallery Upload</div>
                      <div className="text-[10px] text-slate-500">প্রোডাক্ট ও শপ ইমেজ পিক করার নেটিভ সুবিধা</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Full Notched Screen (SafeArea)</div>
                      <div className="text-[10px] text-slate-500">পাঞ্চহোল এবং নচ ডিসপ্লেতে ফুল-ব্লিড ইউআই</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Build Commands */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  {language === 'bn' ? 'প্লে স্টোর AAB ও APK বিল্ড করার কমান্ডসমূহ' : 'Build Commands for AAB & APK'}
                </h4>

                <div className="space-y-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px] mb-0.5"># ১. ওয়েব বিল্ড ও অ্যান্ড্রয়েড সিঙ্ক:</div>
                    <div className="text-emerald-300 font-bold">npm run build:android</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px] mb-0.5"># ২. Android Studio ওপেন করা:</div>
                    <div className="text-emerald-300 font-bold">npm run cap:open</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px] mb-0.5"># ৩. Play Store-এর জন্য Signed AAB জেনারেট করা:</div>
                    <div className="text-amber-300 font-bold">cd android && ./gradlew bundleRelease</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px] mb-0.5"># ৪. টেস্টিংয়ের জন্য সরাসরি Debug APK জেনারেট করা:</div>
                    <div className="text-blue-300 font-bold">cd android && ./gradlew assembleDebug</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'messenger_automation' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="flex items-center -space-x-1">
                      <span className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-white text-[10px] font-black shadow-xs">W</span>
                      <span className="w-5 h-5 rounded-full bg-[#0084FF] flex items-center justify-center text-white text-[10px] font-black shadow-xs">M</span>
                    </span>
                    {language === 'bn' ? 'ফ্রি WhatsApp ও Facebook মেসেঞ্জার অটোমেশন কনফিগারেশন' : '100% Free WhatsApp & Messenger Automation'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'bn' 
                      ? 'কোনো পেইড API বা সাবস্ক্রিপশন ফি ছাড়াই সরাসরি WhatsApp (wa.me) এবং Facebook Messenger (m.me)-এর স্মার্ট অটো-রিপ্লাই ও কাস্টমার কেয়ার চালান।' 
                      : 'Run automated customer support with 0 fees using native WhatsApp (wa.me) & Messenger (m.me) protocols.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveMessengerSettings}
                    className="px-4 py-2 bg-gradient-to-r from-[#25D366] via-[#0084FF] to-[#A822D6] hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {fbMessengerSaved ? (language === 'bn' ? 'সংরক্ষিত হয়েছে!' : 'Saved!') : (language === 'bn' ? 'সেটিংস সেভ করুন' : 'Save Config')}
                  </button>
                </div>
              </div>

              {/* Dual Channel Quick Test Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* WhatsApp Direct Link Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0">
                      <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span>WhatsApp Business Link</span>
                        <span className="px-2 py-0.5 bg-[#25D366]/20 text-[#25D366] font-black text-[9px] rounded-full">
                          FREE wa.me
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        https://wa.me/{whatsappNumber.replace(/[^0-9]/g, '')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/10">
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#25D366] text-white hover:bg-emerald-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <span>Open wa.me</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`);
                        alert(language === 'bn' ? 'হোয়াটসঅ্যাপ লিংক কপি হয়েছে!' : 'WhatsApp link copied!');
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {language === 'bn' ? '📋 কপি লিংক' : '📋 Copy'}
                    </button>
                  </div>
                </div>

                {/* Messenger Direct Link Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0084FF] text-white flex items-center justify-center shadow-md shrink-0">
                      <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.14 2 11.25C2 14.16 3.44 16.74 5.69 18.38V22L9.18 20.08C10.08 20.33 11.02 20.47 12 20.47C17.52 20.47 22 16.33 22 11.22C22 6.14 17.52 2 12 2ZM13.06 14.47L10.77 12.03L6.3 14.47L11.22 9.24L13.56 11.68L17.98 9.24L13.06 14.47Z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span>Facebook Messenger Link</span>
                        <span className="px-2 py-0.5 bg-[#0084FF]/20 text-[#0084FF] font-black text-[9px] rounded-full">
                          FREE m.me
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-[#0084FF] mt-0.5">
                        https://m.me/{fbPageUsername}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-sky-500/10">
                    <a
                      href={`https://m.me/${encodeURIComponent(fbPageUsername)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#0084FF] text-white hover:bg-blue-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <span>Open m.me</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://m.me/${fbPageUsername}`);
                        alert(language === 'bn' ? 'মেসেঞ্জার লিংক কপি হয়েছে!' : 'Messenger link copied!');
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {language === 'bn' ? '📋 কপি লিংক' : '📋 Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {language === 'bn' ? 'হোয়াটসঅ্যাপ সাপোর্ট মোবাইল নম্বর' : 'WhatsApp Business Mobile Number'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">wa.me/+</span>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9+]/g, ''))}
                      placeholder="8801712345678"
                      className="w-full text-xs pl-20 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'কান্ট্রি কোডসহ নম্বর দিন (যেমন: 8801712345678)' : 'Enter phone with country code (e.g. 8801712345678)'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {language === 'bn' ? 'ফেসবুক পেজ ইউজারনেম / আইডি' : 'Facebook Page Username or ID'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">m.me/</span>
                    <input
                      type="text"
                      value={fbPageUsername}
                      onChange={(e) => setFbPageUsername(e.target.value.replace(/^https?:\/\/(www\.)?(m\.me|facebook\.com)\//, ''))}
                      placeholder="AmarBazarBD.Official"
                      className="w-full text-xs pl-16 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084FF] font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'আপনার ফেসবুক পেজের ইউজারনেম দিন (যেমন: AmarBazarBD)' : 'Enter your official Facebook page username (e.g. AmarBazarBD)'}
                  </p>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {language === 'bn' ? 'স্বয়ংক্রিয় শুভেচ্ছা বার্তা (Auto-Greeting)' : 'Automated Bot Welcome Greeting'}
                  </label>
                  <textarea
                    rows={2}
                    value={fbAutoReplyGreeting}
                    onChange={(e) => setFbAutoReplyGreeting(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
                  />
                </div>
              </div>

              {/* Built-in Automation Flow Checklist */}
              <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    {language === 'bn' ? 'হোয়াটসঅ্যাপ ও মেসেঞ্জার সক্রিয় বট অটোমেশনসমূহ' : 'Active WhatsApp & Messenger Automations (100% Free)'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Instant 0ms Response
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-[#25D366]/20 text-[#25D366] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'হোয়াটসঅ্যাপ ১-ক্লিক অর্ডার' : 'WhatsApp 1-Click Order'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {language === 'bn' ? 'পণ্য বা কার্ট সরাসরি কাস্টমার কেয়ারের হোয়াটসঅ্যাপে পাঠিয়ে দ্রুত অর্ডার সম্পন্ন।' : 'Instantly formats order details and sends pre-filled message to WhatsApp.'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'অর্ডার ট্র্যাকিং অটোমেশন' : 'Order Tracking Flow'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {language === 'bn' ? 'অর্ডার আইডি লিখলেই সরাসরি লাইভ স্ট্যাটাস ও ডেলিভারি তথ্য প্রদান করে।' : 'Automatically finds live orders and displays delivery progress.'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'হট ডিলস ও কম্বো প্যাকেজ' : 'Hot Deals & Combos Showcase'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {language === 'bn' ? 'সেরা ডিসকাউন্ট ও কম্বো অফারের তালিকা অটোমেটিকভাবে শেয়ার করে।' : 'Instantly pulls discount prices and active flash deals.'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'ডেলিভারি চার্জ ও কুরিয়ার FAQ' : 'Delivery & Courier Rules'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {language === 'bn' ? 'ঢাকা (৬০৳) ও ঢাকার বাইরে (১২০৳) ক্যাশ অন ডেলিভারির নিয়ম বলে দেয়।' : 'Explains Dhaka 60৳ & Outside 120৳ COD guidelines.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
