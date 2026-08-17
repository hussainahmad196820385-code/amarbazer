import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, ShieldCheck, CheckCircle2, AlertCircle, 
  X, RefreshCw, Smartphone, Sparkles, User as UserIcon,
  Store, Check, Plus, Trash2, ShieldAlert, Cpu, Hand,
  Zap, ArrowRight, CheckCheck, Power, Key, ExternalLink,
  Lock, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  authenticateWithBiometrics, 
  registerDeviceBiometrics, 
  getSavedBiometricUser, 
  isBiometricAvailable,
  isFingerprintEnrolled,
  removeDeviceBiometrics,
  getDeviceBiometricSensorInfo,
  BiometricAccount,
  FingerprintFinger
} from '../../services/biometricAuth';
import { User } from '../../types';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  mode?: 'login' | 'register';
  userToRegister?: User;
  targetRole?: 'customer' | 'seller' | 'admin';
}

const FINGER_OPTIONS: { id: FingerprintFinger; labelBn: string; labelEn: string; iconDesc: string }[] = [
  { id: 'thumb_right', labelBn: 'ডান হাতের বৃদ্ধাঙ্গুলি (Right Thumb)', labelEn: 'Right Thumb', iconDesc: '👍' },
  { id: 'index_right', labelBn: 'ডান হাতের তর্জনী (Right Index)', labelEn: 'Right Index', iconDesc: '☝️' },
  { id: 'thumb_left', labelBn: 'বাম হাতের বৃদ্ধাঙ্গুলি (Left Thumb)', labelEn: 'Left Thumb', iconDesc: '👍' },
  { id: 'index_left', labelBn: 'বাম হাতের তর্জনী (Left Index)', labelEn: 'Left Index', iconDesc: '☝️' },
];

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode: initialMode = 'login',
  userToRegister,
  targetRole = 'customer'
}) => {
  const { language } = useApp();
  
  const [activeMode, setActiveMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'seller' | 'admin'>(targetRole);
  
  const [enrolledUser, setEnrolledUser] = useState<BiometricAccount | null>(null);
  const [isHardwareCalling, setIsHardwareCalling] = useState(false);
  const [selectedEnrollFinger, setSelectedEnrollFinger] = useState<FingerprintFinger>('thumb_right');
  const [presentedFinger, setPresentedFinger] = useState<FingerprintFinger>('thumb_right');

  const [sensorStatus, setSensorStatus] = useState<'idle' | 'scanning' | 'success' | 'failed' | 'mismatch'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [enrollName, setEnrollName] = useState('Rahim Chowdhury');
  const [enrollRole, setEnrollRole] = useState<'customer' | 'seller' | 'admin'>(targetRole);

  const sensorInfo = getDeviceBiometricSensorInfo();
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Sound generator
  const playBeep = (type: 'touch' | 'success' | 'error' | 'mismatch') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'touch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } else if (type === 'success') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(110, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Ignore audio failure
    }
  };

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedBiometricUser();
      setEnrolledUser(saved);
      setSelectedRole(targetRole);
      setEnrollRole(targetRole);
      setIsHardwareCalling(false);
      setSensorStatus('idle');

      if (userToRegister) {
        setEnrollName(userToRegister.name);
        setEnrollRole(userToRegister.role as any);
      }

      if (saved) {
        setSelectedEnrollFinger(saved.enrolledFinger || 'thumb_right');
        setPresentedFinger(saved.enrolledFinger || 'thumb_right');
      }

      if (initialMode === 'register' || !saved) {
        setActiveMode('register');
        setStatusMessage(
          language === 'bn' 
            ? 'আঙুল সিলেক্ট করে নিচের বাটনে চাপ দিন; ফোনের আসল সেন্সর ডায়ালগ চালু হবে।' 
            : 'Select finger and tap button to trigger native phone sensor prompt.'
        );
      } else {
        setActiveMode('login');
        setStatusMessage(
          language === 'bn' 
            ? 'নিচের বাটনে চাপ দিয়ে আপনার ফোনের নিচের ডিসপ্লে/সাইড সেন্সরে আঙুল রাখুন।' 
            : 'Tap button below and touch your phone physical biometric sensor.'
        );
      }
    }
  }, [isOpen, initialMode, targetRole]);

  // =========================================================================
  // REAL PHONE HARDWARE TRIGGER (UAE Pass / Android Google Passkey standard)
  // =========================================================================

  const handleTriggerPhoneHardwareUnlock = async () => {
    if (!enrolledUser) {
      setSensorStatus('failed');
      playBeep('error');
      setStatusMessage(
        language === 'bn'
          ? 'কোনো ফিঙ্গারপ্রিন্ট রেজিস্টার করা নেই! আগে "নতুন ফিঙ্গার এড" করুন।'
          : 'No fingerprint enrolled! Please register your finger first.'
      );
      return;
    }

    try {
      setIsHardwareCalling(true);
      setSensorStatus('scanning');
      playBeep('touch');
      if (navigator.vibrate) navigator.vibrate(50);

      setStatusMessage(
        language === 'bn'
          ? `ফোনের নিচের ডিসপ্লে / সাইড সেন্সরে আঙুল রাখুন (UAE Pass & Google Biometric Standard)...`
          : `Touch your phone's physical sensor now (UAE Pass Standard)...`
      );

      const authRes = await authenticateWithBiometrics(selectedRole, presentedFinger);
      
      if (authRes.success && authRes.user) {
        setSensorStatus('success');
        playBeep('success');
        if (navigator.vibrate) navigator.vibrate([70, 50, 90]);

        setStatusMessage(
          language === 'bn' 
            ? `ফোনের আসল বায়োমেট্রিক সফলভাবে মিলেছে! স্বাগতম ${authRes.user.name || ''}` 
            : `Phone biometric match verified! Welcome ${authRes.user.name || ''}`
        );

        setTimeout(() => {
          onSuccess(authRes.user as User);
          onClose();
        }, 1100);
      } else {
        setSensorStatus('mismatch');
        playBeep('mismatch');
        setStatusMessage(
          authRes.message || (language === 'bn' ? 'ফোনের সেন্সরে আঙুলের ছাপ মেলেনি। আবার চেষ্টা করুন।' : 'Biometric verification cancelled or rejected.')
        );
      }
    } catch (err: any) {
      setSensorStatus('failed');
      playBeep('error');
      setStatusMessage(language === 'bn' ? 'বায়োমেট্রিক সেন্সরে সমস্যা হয়েছে।' : 'Biometric sensor error');
    } finally {
      setIsHardwareCalling(false);
    }
  };

  const handleTriggerPhoneHardwareEnroll = async () => {
    try {
      setIsHardwareCalling(true);
      setSensorStatus('scanning');
      playBeep('touch');
      if (navigator.vibrate) navigator.vibrate(50);

      const selectedOpt = FINGER_OPTIONS.find(f => f.id === selectedEnrollFinger);
      const fingerName = selectedOpt ? (language === 'bn' ? selectedOpt.labelBn : selectedOpt.labelEn) : 'Right Thumb';

      setStatusMessage(
        language === 'bn'
          ? `ফোনের অফিসিয়াল প্রম্পটে [${fingerName.split('(')[0]}] সেন্সরে স্পর্শ করুন...`
          : `Touch your phone physical sensor to enroll [${fingerName}]...`
      );

      const newUserObj: User = userToRegister || {
        id: `usr-${Date.now()}`,
        name: enrollName,
        email: `${enrollRole}@amarbazar.bd`,
        phone: '01712345678',
        role: enrollRole,
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        addresses: [],
        createdAt: new Date().toISOString()
      };

      const regResult = await registerDeviceBiometrics(newUserObj, selectedEnrollFinger, fingerName);
      
      if (regResult.success && regResult.account) {
        setSensorStatus('success');
        playBeep('success');
        if (navigator.vibrate) navigator.vibrate([70, 50, 90]);

        setEnrolledUser(regResult.account);
        setPresentedFinger(selectedEnrollFinger);

        setStatusMessage(
          language === 'bn' 
            ? `অভিনন্দন! আপনার "${fingerName.split('(')[0]}" ফোনের সিস্টেম ফিঙ্গারপ্রিন্টের সাথে কানেক্ট হয়েছে।` 
            : `Success! Your "${fingerName}" is securely linked with your device biometric hardware.`
        );

        setTimeout(() => {
          onSuccess(newUserObj);
          onClose();
        }, 1500);
      } else {
        setSensorStatus('failed');
        playBeep('error');
        setStatusMessage(regResult.message || (language === 'bn' ? 'রেজিস্ট্রেশন বাতিল করা হয়েছে।' : 'Enrollment cancelled.'));
      }
    } catch (err: any) {
      setSensorStatus('failed');
      playBeep('error');
      setStatusMessage(language === 'bn' ? 'সেন্সর ত্রুটি ঘটেছে।' : 'Sensor error occurred');
    } finally {
      setIsHardwareCalling(false);
    }
  };

  const handleResetFingerprint = () => {
    removeDeviceBiometrics();
    setEnrolledUser(null);
    setActiveMode('register');
    setSensorStatus('idle');
    setStatusMessage(
      language === 'bn' 
        ? 'পূর্বের ফিঙ্গারপ্রিন্ট মুছে ফেলা হয়েছে। আপনার ফোনের আসল সেন্সরে নতুন আঙুল এড করুন।' 
        : 'Previous biometric removed. Please register your real finger.'
    );
  };

  const openStandaloneWindow = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0" 
        onClick={() => {
          if (!isHardwareCalling) onClose();
        }} 
      />

      {/* Android UAE Pass / System Bottom Sheet Card */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700/80 shadow-2xl w-full max-w-lg overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 p-5 sm:p-7 flex flex-col items-center text-center max-h-[92vh] overflow-y-auto">
        
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mb-3 sm:hidden" />

        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* UAE Pass & Android Biometrics Standard Tag */}
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-[11px] font-black tracking-wide uppercase mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>UAE Pass & Android Google Passkey Standard</span>
        </div>

        {/* Tab switcher: Login vs Register */}
        <div className="w-full bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              if (!enrolledUser) {
                setStatusMessage(language === 'bn' ? 'কোনো ফিঙ্গারপ্রিন্ট সেট করা নেই! আগে "ফিঙ্গার এড" করুন।' : 'No fingerprint enrolled! Please setup first.');
                return;
              }
              setActiveMode('login');
              setSensorStatus('idle');
              setStatusMessage(
                language === 'bn' 
                  ? 'নিচের বাটনে চাপ দিয়ে আপনার ফোনের আসল সেন্সরে আঙুল স্পর্শ করুন।' 
                  : 'Tap button and touch your phone physical sensor.'
              );
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-2 ${
              activeMode === 'login'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>{language === 'bn' ? 'ফোনের ফিঙ্গার দিয়ে লগইন' : 'Unlock via Biometrics'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('register');
              setSensorStatus('idle');
              setStatusMessage(language === 'bn' ? 'আঙুল নির্বাচন করে নিচের বাটনে চাপ দিন' : 'Select finger & connect with phone sensor');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-2 ${
              activeMode === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন ফিঙ্গার এড (Enroll)' : 'Add Finger'}</span>
          </button>
        </div>

        {/* Modal Title & Explanation */}
        <h3 className="text-lg font-black text-white tracking-tight">
          {activeMode === 'register'
            ? (language === 'bn' ? 'ফোনের সিস্টেম ফিঙ্গারপ্রিন্ট এড করুন' : 'Connect Phone Hardware Fingerprint')
            : (language === 'bn' ? 'ফোনের আসল ফিঙ্গারপ্রিন্ট দিয়ে আনলক' : 'Unlock via Phone Physical Sensor')
          }
        </h3>

        <p className="text-xs text-slate-300 font-medium mt-1 max-w-md">
          {language === 'bn' 
            ? 'ইউএই পাস (UAE Pass) ও গুগল পাসকির মতো সরাসরি আপনার ফোনের নিচের ইন-ডিসপ্লে বা সাইড পাওয়ার বাটন সেন্সরটি ব্যবহার করা হবে।' 
            : 'Uses your phone native bottom in-display or side-mounted hardware sensor directly like UAE Pass & Google Pay.'}
        </p>

        {/* ======================================================== */}
        {/* BIG NATIVE HARDWARE TRIGGER HERO BUTTON (Bottom Sheet Anchor) */}
        {/* ======================================================== */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border-2 border-cyan-500/50 shadow-xl flex flex-col items-center">
          
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{language === 'bn' ? 'ফোনের ফিজিক্যাল সেন্সর' : 'Hardware Sensor'}</span>
            </span>
            <span className="text-[10px] font-bold text-cyan-300 px-2.5 py-1 bg-cyan-950/90 border border-cyan-500/30 rounded-lg">
              {sensorInfo.sensorTypeBn}
            </span>
          </div>

          {/* Fingerprint Visual Icon & Pulse Ring */}
          <div className="relative my-2 flex items-center justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isHardwareCalling
                ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.6)] animate-pulse'
                : sensorStatus === 'success'
                ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.6)]'
                : sensorStatus === 'mismatch' || sensorStatus === 'failed'
                ? 'bg-red-500/20 border-2 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.6)]'
                : 'bg-slate-800/80 border-2 border-cyan-500/40'
            }`}>
              {sensorStatus === 'success' ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-in zoom-in duration-300" />
              ) : sensorStatus === 'mismatch' || sensorStatus === 'failed' ? (
                <ShieldAlert className="w-12 h-12 text-red-400 animate-in shake duration-300" />
              ) : (
                <Fingerprint className={`w-12 h-12 ${
                  isHardwareCalling ? 'text-cyan-300 animate-bounce' : 'text-cyan-400'
                }`} />
              )}
            </div>

            {/* Glowing Ring when scanning */}
            {isHardwareCalling && (
              <div className="absolute inset-0 rounded-full border-2 border-cyan-300 animate-ping pointer-events-none" />
            )}
          </div>

          {/* MAIN ACTION BUTTON: Directly opens Android OS Biometric Bottom Sheet */}
          {activeMode === 'login' ? (
            <button
              type="button"
              onClick={handleTriggerPhoneHardwareUnlock}
              disabled={isHardwareCalling}
              className="w-full mt-3 py-3.5 px-5 bg-gradient-to-r from-cyan-500 hover:from-cyan-400 to-blue-600 hover:to-blue-500 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center space-x-2 transition transform active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isHardwareCalling ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                  <span>{language === 'bn' ? 'ফোনের সেন্সরে আঙুল রাখুন...' : 'Touch phone sensor...'}</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 text-slate-950" />
                  <span>{language === 'bn' ? '👉 ফোনের আসল সেন্সরে আঙুল দিন (Unlock)' : '👉 Touch Phone Physical Sensor (Unlock)'}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTriggerPhoneHardwareEnroll}
              disabled={isHardwareCalling}
              className="w-full mt-3 py-3.5 px-5 bg-gradient-to-r from-emerald-500 hover:from-emerald-400 to-teal-600 hover:to-teal-500 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-2 transition transform active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isHardwareCalling ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                  <span>{language === 'bn' ? 'ফোনের ডায়ালগে আঙুল রাখুন...' : 'Touch phone sensor prompt...'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-slate-950" />
                  <span>{language === 'bn' ? '👉 ফোনের আসল সেন্সরে ফিঙ্গার এড করুন' : '👉 Enroll on Phone Biometric Sensor'}</span>
                </>
              )}
            </button>
          )}

          <p className="text-[11px] text-cyan-200 font-bold mt-2.5">
            {language === 'bn' 
              ? '💡 টিপস: বাটনে চাপ দিলে ফোনের অফিশিয়াল ফিঙ্গারপ্রিন্ট ডায়ালগ নিচে চলে আসবে।' 
              : '💡 Tip: Tapping opens the official Android biometric prompt at the bottom.'}
          </p>
        </div>

        {/* Finger selection in enroll mode */}
        {activeMode === 'register' && (
          <div className="w-full mt-3.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-left">
            <label className="text-[11px] font-black text-emerald-400 uppercase tracking-wider block mb-2 flex items-center space-x-1.5">
              <Hand className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'কোন আঙুল দিয়ে পাসওয়ার্ড সেট করতে চান:' : 'Select Finger to Enroll as Key:'}</span>
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              {FINGER_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedEnrollFinger(f.id)}
                  className={`p-2 rounded-xl text-left border transition flex items-center space-x-2 cursor-pointer ${
                    selectedEnrollFinger === f.id
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg">{f.iconDesc}</span>
                  <div className="overflow-hidden">
                    <span className="text-[11px] font-black block leading-tight truncate">
                      {language === 'bn' ? f.labelBn.split('(')[0] : f.labelEn}
                    </span>
                    <span className="text-[9px] text-slate-500 block truncate">
                      {f.id.includes('right') ? 'Right Hand' : 'Left Hand'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Presented Finger Selector in Login Mode */}
        {activeMode === 'login' && enrolledUser && (
          <div className="w-full mt-3.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-1">
                <Hand className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'যে আঙুল সেন্সরে দিচ্ছেন:' : 'Finger Placed on Sensor:'}</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {language === 'bn' ? 'পাসওয়ার্ড:' : 'Lock Key:'} <strong className="text-emerald-400">{(enrolledUser.fingerName || 'Right Thumb').split('(')[0]}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {FINGER_OPTIONS.map((f) => {
                const isMatchKey = f.id === enrolledUser.enrolledFinger;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setPresentedFinger(f.id);
                      setSensorStatus('idle');
                    }}
                    className={`p-2 rounded-xl text-left border transition flex items-center justify-between cursor-pointer ${
                      presentedFinger === f.id
                        ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <span className="text-base">{f.iconDesc}</span>
                      <span className="text-[10px] font-black truncate">
                        {language === 'bn' ? f.labelBn.split('(')[0] : f.labelEn}
                      </span>
                    </div>
                    {isMatchKey && (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded shrink-0">
                        {language === 'bn' ? 'আসল' : 'Key'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Enrolled account indicator in login mode */}
        {activeMode === 'login' && enrolledUser && (
          <div className="w-full mt-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-200">
                {enrolledUser.userRole === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : enrolledUser.userRole === 'seller' ? (
                  <Store className="w-4 h-4 text-amber-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {enrolledUser.userName || 'Enrolled User'}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <span className="capitalize">{enrolledUser.userRole || 'customer'}</span>
                  <span>•</span>
                  <span>{enrolledUser.enrolledFinger === 'thumb_right' ? 'Right Thumb' : enrolledUser.enrolledFinger}</span>
                </div>
              </div>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              enrolledUser.userRole === 'admin' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : enrolledUser.userRole === 'seller'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              {enrolledUser.userRole === 'admin' ? 'এডমিন' : enrolledUser.userRole === 'seller' ? 'সেলার' : 'কাস্টমার'}
            </div>
          </div>
        )}

        {/* Status Message Display */}
        <div className={`mt-3 p-3 rounded-2xl border text-xs font-bold w-full transition-all duration-300 ${
          sensorStatus === 'scanning' || isHardwareCalling
            ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
            : sensorStatus === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : sensorStatus === 'mismatch' || sensorStatus === 'failed'
            ? 'bg-red-950/60 border-red-500/60 text-red-300'
            : 'bg-slate-800/60 border-slate-700 text-slate-300'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            {isHardwareCalling && <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />}
            {sensorStatus === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            {(sensorStatus === 'mismatch' || sensorStatus === 'failed') && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            <span className="leading-snug">{statusMessage}</span>
          </div>
        </div>

        {/* If inside preview iframe, provide direct New Tab link for 100% OS permission */}
        {isIframe && (
          <button
            type="button"
            onClick={openStandaloneWindow}
            className="w-full mt-2.5 py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 text-[11px] font-bold rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ব্রাউজার ট্যাবে সরাসরি খুলুন (ফুলস্ক্রিন মোড)' : 'Open in Browser Tab (Fullscreen)'}</span>
          </button>
        )}

        {/* Enrolled Profile Info Footer */}
        {enrolledUser ? (
          <div className="w-full mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase font-black block">
                {language === 'bn' ? 'কানেক্টেড ফিঙ্গারপ্রিন্ট:' : 'Connected Biometric Finger:'}
              </span>
              <span className="font-extrabold text-white text-xs">
                {enrolledUser.userName} • <span className="text-emerald-400">{(enrolledUser.fingerName || 'Right Thumb').split('(')[0]}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetFingerprint}
              title="Reset/Delete Fingerprint"
              className="p-2 bg-red-950/50 hover:bg-red-900/60 text-red-400 rounded-xl border border-red-500/30 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-amber-400 font-bold flex items-center justify-center space-x-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>{language === 'bn' ? 'কোনো ফিঙ্গারপ্রিন্ট সেট করা নেই। "নতুন ফিঙ্গার এড" বাটনে চাপ দিয়ে ফোনে এড করুন।' : 'No finger enrolled. Click Add Finger to connect phone sensor.'}</span>
          </div>
        )}

      </div>
    </div>
  );
};
