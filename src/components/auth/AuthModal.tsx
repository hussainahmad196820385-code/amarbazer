import React, { useState } from 'react';
import { 
  X, Lock, Phone, User as UserIcon, Check, HelpCircle, 
  Store, ShieldCheck, CreditCard, RefreshCw, Smartphone, 
  CheckCircle, Info, Award, ArrowRight, ArrowLeft,
  Upload, Camera, FileText, Image, Video,
  MapPin, ChevronDown, Carrot, Shirt, Flame, Cookie, Heart,
  ExternalLink, Fingerprint, Sparkles, Key, Eye, EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { BiometricAuthModal } from './BiometricAuthModal';
import { getSavedBiometricUser, isBiometricEnabled } from '../../services/biometricAuth';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, setCurrentUser, language, setActivePanel, setActiveRole, activePanel, activeRole, setIsCustomerOnlyMode } = useApp();

  const isSellerView = activePanel === 'seller' || activePanel === 'inventory_workspace' || activePanel === 'register_vendor' || activeRole === 'seller';

  // Primary mode: 'customer' (Free) vs 'seller' (Paid Subscription)
  const [authType, setAuthType] = useState<'customer' | 'seller'>(isSellerView ? 'seller' : 'customer');

  // Customer states (Free)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customerSubTab, setCustomerSubTab] = useState<'login' | 'signup'>('login');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupType, setSignupType] = useState<'customer' | 'seller'>('customer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'seller' | 'admin'>('customer');

  // Biometric / Fingerprint Modal state
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [biometricTargetRole, setBiometricTargetRole] = useState<'customer' | 'seller' | 'admin'>('customer');

  // Seller registration details (Paid Subscription)
  const [sellerStep, setSellerStep] = useState<'details' | 'face_verification' | 'credentials' | 'plans' | 'payment' | 'processing' | 'success'>('details');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Face Verification State
  const [facePhoto, setFacePhoto] = useState('');
  const [faceScanStatus, setFaceScanStatus] = useState<'idle' | 'streaming' | 'scanning' | 'success' | 'failed'>('idle');
  const [faceScanProgress, setFaceScanProgress] = useState(0);
  const [faceScanMessage, setFaceScanMessage] = useState('');
  
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
    // Stop any camera stream when modal is closed
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (isAuthOpen) {
      setSellerStep('details');
      setRegUsername('');
      setRegPassword('');
      setAuthType(isSellerView ? 'seller' : 'customer');
      setOtpMode(false);
      setOtpCode('');
      setPhoneNumber('');
      setError('');
      setCustomerSubTab('login');
      setSignupName('');
      setSignupEmail('');
      setSignupType('customer');
      setUsername('');
      setPassword('');
      setSelectedRole('customer');
      setStoreName('');
      setOwnerFirstName('');
      setOwnerLastName('');
      setBusinessPhone('');
      setBusinessEmail('');
      setNidNumber('');
      setTradeLicense('');
      setOwnerPhoto('');
      setNidPhotoFront('');
      setNidPhotoBack('');
      setShopLicensePhoto('');
      setShopPhoto('');
      setFacePhoto('');
      setFaceScanStatus('idle');
      setFaceScanProgress(0);
      setFaceScanMessage('');
      setShowForgotPassword(false);
      setForgotEmailOrPhone('');
      setForgotPasswordSuccess('');
    } else {
      // Stop stream if modal is closed
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isAuthOpen]);
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeCategory, setStoreCategory] = useState('grocery');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');

  const STORE_CATEGORIES = [
    { id: 'grocery', nameEn: 'Grocery Store', nameBn: 'মুদিখানা দোকান', icon: Carrot },
    { id: 'clothing', nameEn: 'Clothing Store', nameBn: 'জামা কাপড়ের দোকান', icon: Shirt },
    { id: 'spices', nameEn: 'Spice Shop', nameBn: 'মসলার দোকান', icon: Flame },
    { id: 'sweets', nameEn: 'Sweets & Bakery', nameBn: 'মিষ্টি ও বেকারির দোকান', icon: Cookie },
    { id: 'electronics', nameEn: 'Mobiles & Gadgets', nameBn: 'মোবাইল ও ইলেকট্রনিক্স', icon: Smartphone },
    { id: 'pharmacy', nameEn: 'Pharmacy Store', nameBn: 'ঔষধ ও ফার্মেসী', icon: Heart }
  ];

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'bn' ? 'আপনার ব্রাউজার এটি সমর্থন করে না।' : 'Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data && data.display_name) {
            // Shorten standard Nominatim output to first few parts for better UX
            const parts = data.display_name.split(',');
            const shortAddress = parts.slice(0, 3).join(',').trim();
            setStoreAddress(shortAddress);
          } else {
            setStoreAddress(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          setStoreAddress(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        setStoreAddress(language === 'bn' ? 'মিরপুর ১০, ঢাকা (কারেন্ট লোকেশন)' : 'Mirpur 10, Dhaka (Current Location)');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const [resolvingLink, setResolvingLink] = useState(false);

  const handleAddressChange = async (val: string) => {
    setStoreAddress(val);
    
    // Check if the pasted/typed value is a Google Maps URL
    const trimmed = val.trim();
    if (trimmed.startsWith('http') && (trimmed.includes('maps.google') || trimmed.includes('google.com/maps') || trimmed.includes('goo.gl/maps') || trimmed.includes('maps.app.goo.gl'))) {
      setResolvingLink(true);
      try {
        const res = await api.resolveMapLink(trimmed);
        if (res && res.success && res.address) {
          setStoreAddress(res.address);
        }
      } catch (err) {
        console.error("Failed to resolve link:", err);
      } finally {
        setResolvingLink(false);
      }
    }
  };

  // Base64 uploaded files
  const [ownerPhoto, setOwnerPhoto] = useState('');
  const [nidPhotoFront, setNidPhotoFront] = useState('');
  const [nidPhotoBack, setNidPhotoBack] = useState('');
  const [shopLicensePhoto, setShopLicensePhoto] = useState('');
  const [shopPhoto, setShopPhoto] = useState('');

  const checkFields = [
    ownerFirstName,
    ownerLastName,
    storeName,
    storeAddress,
    businessPhone,
    nidNumber,
    tradeLicense,
    storeCategory,
    ownerPhoto,
    shopPhoto,
    nidPhotoFront,
    nidPhotoBack,
    shopLicensePhoto
  ];
  const filledCount = checkFields.filter(f => f && typeof f === 'string' && f.trim() !== '').length;
  const completionPercent = Math.round((filledCount / checkFields.length) * 100);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDemoFillSeller = () => {
    setOwnerFirstName('আবির');
    setOwnerLastName('হাসান');
    setStoreName('আবির জেনারেল স্টোর');
    setStoreAddress('মিরপুর ১০, ঢাকা, বাংলাদেশ');
    setStoreCategory('grocery');
    setBusinessPhone('01712345678');
    setBusinessEmail('abir.store@amarbazar.bd');
    setNidNumber('199526172839401');
    setTradeLicense('TRAD/2026/9821-A');
    setOwnerPhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80');
    setNidPhotoFront('https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=400&q=80');
    setNidPhotoBack('https://images.unsplash.com/photo-1554774853-742f1a6fdfb5?auto=format&fit=crop&w=400&q=80');
    setShopLicensePhoto('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80');
    setShopPhoto('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80');
  };

  // Seller plan selection
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'starter' | 'business' | 'enterprise'>('trial');
  const PLANS_INFO = {
    trial: { name: 'Free Trial / ফ্রী ট্রায়াল', price: 0, limit: '5 Products', commission: '10%' },
    starter: { name: 'Starter / স্টার্টার', price: 500, limit: '20 Products', commission: '5%' },
    business: { name: 'Business / বিজনেস', price: 1500, limit: '100 Products', commission: '3%' },
    enterprise: { name: 'Enterprise / এন্টারপ্রাইজ', price: 3000, limit: 'Unlimited Products', commission: '1%' }
  };

  // Gateway Simulation state
  const [selectedGateway, setSelectedGateway] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [gatewayPhone, setGatewayPhone] = useState('');
  const [gatewayOtpMode, setGatewayOtpMode] = useState(false);
  const [gatewayOtp, setGatewayOtp] = useState('');
  const [gatewayPinMode, setGatewayPinMode] = useState(false);
  const [gatewayPin, setGatewayPin] = useState('');
  const [gatewayTxnId, setGatewayTxnId] = useState('');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  // --- FORGOT PASSWORD SUBMIT FLOW ---
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotPasswordSuccess('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setForgotPasswordSuccess(
        language === 'bn'
          ? 'পাসওয়ার্ড রিসেট করার নির্দেশনা আপনার ইউজারনেম/ইমেইল-এ পাঠানো হয়েছে!'
          : 'Password reset instructions have been sent to your username/email!'
      );
    }, 1200);
  };

  // --- USERNAME AND PASSWORD LOGIN FLOW ---
  const handleUsernamePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Normalize Bengali digits (০-৯) to English digits (0-9)
    const bnToEnMap: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    const cleanStr = (s?: string) => (s || '').trim().replace(/[০-৯]/g, m => bnToEnMap[m] || m);

    const u = cleanStr(username);
    const p = cleanStr(password);

    if (!u) {
      setError(language === 'bn' ? 'দয়া করে ইউজারনেম লিখুন (যেমন: admin)' : 'Please enter your username (e.g. admin)');
      return;
    }
    if (!p) {
      setError(language === 'bn' ? 'দয়া করে পাসওয়ার্ড লিখুন' : 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const loginRes = await api.login({ username: u, password: p, email: u, phone: u });
      if (loginRes && loginRes.success && loginRes.user) {
        const loggedUser = loginRes.user;
        setCurrentUser(loggedUser);
        setActiveRole(loggedUser.role);
        
        if (loggedUser.role === 'admin' || loggedUser.isAdminStaff || loggedUser.role === 'system_admin' || loggedUser.role === 'manager') {
          setIsCustomerOnlyMode(false);
          setActivePanel('admin');
        } else if (loggedUser.role === 'seller') {
          setIsCustomerOnlyMode(false);
          setActivePanel('seller');
        } else {
          setActivePanel('customer');
        }
        setIsAuthOpen(false);
      } else {
        setError(language === 'bn' 
          ? 'ভুল ইউজারনেম অথবা পাসওয়ার্ড!' 
          : 'Invalid username or password!');
      }
    } catch (apiErr: any) {
      setError(language === 'bn' 
        ? (apiErr.message || 'ভুল ইউজারনেম অথবা পাসওয়ার্ড!') 
        : (apiErr.message || 'Invalid username or password!'));
    } finally {
      setIsLoading(false);
    }
  };

  // --- CUSTOMER (FREE) FLOW ---
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerSubTab === 'signup' && !signupName.trim()) {
      setError(language === 'bn' ? 'দয়া করে আপনার নাম লিখুন' : 'Please enter your full name');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setError(language === 'bn' ? 'দয়া করে সঠিক মোবাইল নম্বর দিন' : 'Please enter a valid mobile number');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      // SMS OTP mode triggers instant test code
      setOtpMode(true);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setError(language === 'bn' ? 'ওটিপি কোডটি লিখুন' : 'Please enter the OTP code');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      let registeredUser: any = null;
      try {
        const loginRes = await api.login({ phone: `+880${phoneNumber}`, role: 'customer' });
        if (loginRes && loginRes.success && loginRes.user) {
          registeredUser = loginRes.user;
        }
      } catch (e) {
        console.log("Not registered on server yet, will register/fallback.");
      }

      const nameVal = customerSubTab === 'signup' && signupName.trim()
        ? signupName
        : (registeredUser?.name || `Customer ${phoneNumber.slice(-4)}`);

      const emailVal = customerSubTab === 'signup' && signupEmail.trim()
        ? signupEmail
        : (registeredUser?.email || `customer${phoneNumber.slice(-4)}@amarbazar.bd`);

      const mockUser = {
        id: registeredUser?.id || `usr-${Date.now()}`,
        name: nameVal,
        email: emailVal,
        phone: `+880${phoneNumber}`,
        role: 'customer' as const,
        isVerified: true,
        avatar: registeredUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        addresses: registeredUser?.addresses || [],
        createdAt: registeredUser?.createdAt || new Date().toISOString()
      };
      
      // Save user to server side
      await api.register({
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        role: 'customer'
      });

      setCurrentUser(mockUser);
      setActiveRole('customer');
      setActivePanel('customer');
      setIsAuthOpen(false);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    try {
      const mockUser = {
        id: `usr-${Date.now()}`,
        name: `Google User BD`,
        email: `google.user@amarbazar.bd`,
        phone: '01700000000',
        role: 'customer' as const,
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        addresses: [],
        createdAt: new Date().toISOString()
      };

      await api.register({
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        role: 'customer'
      });

      setCurrentUser(mockUser);
      setActiveRole('customer');
      setActivePanel('customer');
      setIsAuthOpen(false);
    } catch (err: any) {
      setError('Social login failed');
    }
  };

  // --- SELLER (SUBSCRIPTION PAID) FLOW ---
  const handleSellerDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeAddress || !ownerFirstName || !ownerLastName || !businessPhone || !nidNumber || !tradeLicense) {
      setError(language === 'bn' ? 'সবগুলো ঘর সঠিকভাবে পূরণ করুন' : 'Please fill all required fields');
      return;
    }
    setError('');
    setAuthType('seller');
    setSellerStep('face_verification');
  };

  // --- FACE BIOMETRIC VERIFICATION FUNCTIONS ---
  const startCamera = async () => {
    setError('');
    setFaceScanStatus('streaming');
    setFaceScanProgress(0);
    setFaceScanMessage(language === 'bn' ? 'ক্যামেরা চালু করা হচ্ছে...' : 'Initializing camera stream...');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setFaceScanMessage(language === 'bn' ? 'ওভালের ভেতরে আপনার ফেস রাখুন এবং স্থির থাকুন' : 'Position your face inside the oval and stay still');
    } catch (err: any) {
      console.error('Camera access error:', err);
      setFaceScanStatus('failed');
      setError(language === 'bn' ? 'ক্যামেরা অ্যাক্সেস করা যায়নি। অনুগ্রহ করে ডেমো ভেরিফিকেশন ব্যবহার করুন।' : 'Could not access camera. Please use the simulated demo scan.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureAndVerifyFace = () => {
    if (!videoRef.current || faceScanStatus !== 'streaming') return;
    
    try {
      // Capture frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 480;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setFacePhoto(dataUrl);
      }
      
      // Stop stream immediately
      stopCamera();
      
      // Run progress animation
      setFaceScanStatus('scanning');
      setFaceScanProgress(0);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        if (progress > 100) progress = 100;
        setFaceScanProgress(progress);
        
        // Progress stage message
        if (progress <= 25) {
          setFaceScanMessage(language === 'bn' ? 'মুখমন্ডল সনাক্ত করা হচ্ছে...' : 'Detecting facial structure...');
        } else if (progress <= 55) {
          setFaceScanMessage(language === 'bn' ? 'বায়োমেট্রিক তথ্য স্ক্যান করা হচ্ছে...' : 'Scanning biometric parameters...');
        } else if (progress <= 85) {
          setFaceScanMessage(language === 'bn' ? 'NID কার্ড ছবির সাথে মিল পরীক্ষা করা হচ্ছে...' : 'Matching with NID photo...');
        } else if (progress < 100) {
          setFaceScanMessage(language === 'bn' ? 'ভেরিফিকেশন সম্পন্ন হচ্ছে...' : 'Completing security audit...');
        } else {
          setFaceScanMessage(language === 'bn' ? 'ফেস ভেরিফিকেশন সফলভাবে সম্পন্ন হয়েছে!' : 'Biometric Face Verification Successful!');
          setFaceScanStatus('success');
          clearInterval(interval);
        }
      }, 100);
    } catch (err: any) {
      setFaceScanStatus('failed');
      setError(language === 'bn' ? 'ভেরিফিকেশন ব্যর্থ হয়েছে।' : 'Biometric capture failed.');
    }
  };

  const simulateFaceScan = () => {
    stopCamera();
    setFaceScanStatus('scanning');
    setFaceScanProgress(0);
    setError('');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 100) progress = 100;
      setFaceScanProgress(progress);
      
      if (progress <= 25) {
        setFaceScanMessage(language === 'bn' ? 'মুখমন্ডল সনাক্ত করা হচ্ছে...' : 'Detecting facial structure...');
      } else if (progress <= 55) {
        setFaceScanMessage(language === 'bn' ? 'বায়োমেট্রিক তথ্য স্ক্যান করা হচ্ছে...' : 'Scanning biometric parameters...');
      } else if (progress <= 85) {
        setFaceScanMessage(language === 'bn' ? 'NID কার্ড ছবির সাথে মিল পরীক্ষা করা হচ্ছে...' : 'Matching with NID photo...');
      } else if (progress < 100) {
        setFaceScanMessage(language === 'bn' ? 'ভেরিফিকেশন সম্পন্ন হচ্ছে...' : 'Completing security audit...');
      } else {
        setFaceScanMessage(language === 'bn' ? 'ফেস ভেরিফিকেশন সফলভাবে সম্পন্ন হয়েছে!' : 'Biometric Face Verification Successful!');
        setFaceScanStatus('success');
        // Preset lovely merchant photo
        setFacePhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80');
        clearInterval(interval);
      }
    }, 100);
  };

  React.useEffect(() => {
    if (sellerStep === 'face_verification') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [sellerStep]);

  if (!isAuthOpen) return null;

  const handleRegisterWithTrial = () => {
    setError('');
    setSellerStep('processing');
    
    setTimeout(async () => {
      try {
        const genTxnId = `TRIAL-${Math.random().toString(36).substring(3, 10).toUpperCase()}`;
        setGatewayTxnId(genTxnId);
        
        const emailVal = businessEmail || `merchant_${Date.now()}@amarbazar.bd`;
        
        const response = await api.register({
          name: `${ownerFirstName} ${ownerLastName}`,
          firstName: ownerFirstName,
          lastName: ownerLastName,
          email: emailVal,
          phone: businessPhone,
          role: 'seller',
          storeName: storeName,
          storeAddress: storeAddress,
          storeCategory: storeCategory,
          tradeLicenseNumber: tradeLicense,
          nidNumber: nidNumber,
          ownerPhoto: ownerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          nidPhotoFront: nidPhotoFront || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=400&q=80',
          nidPhotoBack: nidPhotoBack || 'https://images.unsplash.com/photo-1554774853-742f1a6fdfb5?auto=format&fit=crop&w=400&q=80',
          shopLicensePhoto: shopLicensePhoto || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
          shopPhoto: shopPhoto || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
          facePhoto: facePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          bkashNumber: businessPhone,
          subscriptionPlan: 'trial',
          subscriptionAmountPaid: 0,
          subscriptionPaymentMethod: 'free_trial',
          subscriptionTxnId: genTxnId,
          username: regUsername,
          password: regPassword
        });

        if (response.success) {
          setSellerStep('success');
        } else {
          setError('Failed to save seller registration details on server.');
          setSellerStep('plans');
        }
      } catch (err: any) {
        setError(err.message || 'Trial registration failed.');
        setSellerStep('plans');
      }
    }, 2000);
  };

  const handleProceedToPayment = () => {
    if (selectedPlan === 'trial') {
      handleRegisterWithTrial();
      return;
    }
    setGatewayPhone(businessPhone);
    setGatewayOtpMode(false);
    setGatewayPinMode(false);
    setGatewayOtp('');
    setGatewayPin('');
    setSellerStep('payment');
  };

  // Gateway Simulation triggers
  const handleGatewayPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gatewayPhone.length < 11) {
      setError(language === 'bn' ? 'সটীক ১১-ডিজিটের অ্যাকাউন্ট নম্বর দিন' : 'Enter a valid 11-digit wallet number');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
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
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
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
    setSellerStep('processing');
    
    // Simulate API calls to register user & save subscription
    setTimeout(async () => {
      try {
        const genTxnId = `TXN-${selectedGateway.toUpperCase()}-${Math.random().toString(36).substring(3, 10).toUpperCase()}`;
        setGatewayTxnId(genTxnId);

        const emailVal = businessEmail || `merchant_${Date.now()}@amarbazar.bd`;
        
        // Register seller user on server with paid subscription detail and complete verification details
        const response = await api.register({
          name: `${ownerFirstName} ${ownerLastName}`,
          firstName: ownerFirstName,
          lastName: ownerLastName,
          email: emailVal,
          phone: businessPhone,
          role: 'seller',
          storeName: storeName,
          storeAddress: storeAddress,
          storeCategory: storeCategory,
          tradeLicenseNumber: tradeLicense,
          nidNumber: nidNumber,
          ownerPhoto: ownerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          nidPhotoFront: nidPhotoFront || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=400&q=80',
          nidPhotoBack: nidPhotoBack || 'https://images.unsplash.com/photo-1554774853-742f1a6fdfb5?auto=format&fit=crop&w=400&q=80',
          shopLicensePhoto: shopLicensePhoto || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
          shopPhoto: shopPhoto || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
          facePhoto: facePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          bkashNumber: businessPhone,
          subscriptionPlan: selectedPlan,
          subscriptionAmountPaid: PLANS_INFO[selectedPlan].price,
          subscriptionPaymentMethod: selectedGateway,
          subscriptionTxnId: genTxnId,
          username: regUsername,
          password: regPassword
        });

        if (response.success) {
          setSellerStep('success');
        } else {
          setError('Failed to save seller registration details on server.');
          setSellerStep('payment');
        }
      } catch (err: any) {
        setError(err.message || 'Payment capture failed.');
        setSellerStep('payment');
      }
    }, 2500);
  };

  const handleEnterSellerPortal = () => {
    // Log the user into App Context as Seller
    const mockUser = {
      id: `usr-${Date.now()}`,
      name: `${ownerFirstName} ${ownerLastName}`,
      email: businessEmail || `merchant_${Date.now()}@amarbazar.bd`,
      phone: businessPhone,
      role: 'seller' as const,
      isVerified: true,
      avatar: ownerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      addresses: [],
      createdAt: new Date().toISOString(),
      username: regUsername || undefined,
      password: regPassword || undefined
    };
    
    setCurrentUser(mockUser);
    setActiveRole('seller');
    setActivePanel('seller');
    setIsAuthOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Click outside to close (only if not processing payment) */}
      <div className="absolute inset-0" onClick={() => { if (sellerStep !== 'processing') setIsAuthOpen(false); }} />

      {/* Main Container */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-[440px] max-h-[90vh] flex flex-col border border-slate-200/80 dark:border-slate-800/80 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Close Button */}
        {sellerStep !== 'processing' && (
          <button 
            onClick={() => setIsAuthOpen(false)}
            className="absolute right-4 top-4 p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition z-10 cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        )}

        <div className="p-6 sm:p-7 overflow-y-auto flex-1 scrollbar-none">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          {/* ==================== CUSTOMER VIEW (FREE ACCESS) ==================== */}
          {authType === 'customer' && (
            <div className="space-y-5">
              
              <div className="flex flex-col items-center justify-center space-y-2.5 mb-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-tr from-red-600/20 via-red-500/15 to-orange-500/20 dark:from-red-500/25 dark:via-red-500/15 dark:to-orange-400/20 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-500/10">
                  <Store className="w-7 h-7 text-[#da1c24] dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    {customerSubTab === 'login'
                      ? (language === 'bn' ? 'অমরবাজার সুরক্ষিত পোর্টাল' : 'AmarBazar Secure Portal')
                      : (language === 'bn' ? 'নতুন একাউন্ট তৈরি করুন' : 'Create New Account')
                    }
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {customerSubTab === 'login'
                      ? (language === 'bn' ? 'আপনার একাউন্টে সুরক্ষিতভাবে প্রবেশ করুন' : 'SECURELY SIGN IN TO YOUR DASHBOARD')
                      : (language === 'bn' ? 'সেরা অনলাইন শপিং ও সেলিংয়ের অভিজ্ঞতা নিন' : 'Sign up to get the best experience')
                    }
                  </p>
                </div>
              </div>

              {!otpMode ? (
                customerSubTab === 'login' ? (
                  showForgotPassword ? (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                      <div className="text-center pb-2">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                          {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {language === 'bn'
                            ? 'আপনার ইউজারনেম অথবা রেজিস্টার্ড ইমেইলটি নিচে লিখুন। আমরা আপনাকে পুনরায় পাসওয়ার্ড সেট করার একটি লিংক পাঠাব।'
                            : 'Enter your username or registered email address below, and we will send you a link to reset your password.'}
                        </p>
                      </div>

                      {forgotPasswordSuccess && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold text-center leading-relaxed">
                          {forgotPasswordSuccess}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          {language === 'bn' ? 'ইউজারনেম অথবা ইমেইল' : 'Username or Email'} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center border rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-red-500/10 focus-within:border-[#da1c24] transition-all duration-200">
                          <div className="px-3 text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 py-3">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={forgotEmailOrPhone}
                            onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                            placeholder={language === 'bn' ? 'যেমন: user@example.com' : 'e.g. user@example.com'}
                            className="flex-1 px-3 py-3 text-sm font-bold bg-transparent focus:outline-none text-slate-800 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 text-white font-black rounded-xl shadow-lg transition duration-200 text-xs uppercase tracking-widest flex items-center justify-center cursor-pointer bg-[#da1c24] hover:bg-red-700 shadow-red-500/10"
                      >
                        {isLoading ? '...' : (language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link')}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setError('');
                            setForgotPasswordSuccess('');
                          }}
                          className="text-xs font-black text-[#da1c24] hover:text-red-700 transition cursor-pointer uppercase tracking-wider"
                        >
                          {language === 'bn' ? 'লগইন-এ ফিরে যান' : 'Back to Log In'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <form onSubmit={handleUsernamePasswordSubmit} className="space-y-4">
                        {/* Username */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
                            {language === 'bn' ? 'ইউজারনেম / ইমেইল / ফোন নম্বর' : 'Username / Email / Phone'} <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center border rounded-xl overflow-hidden bg-slate-50/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-[#da1c24] transition-all duration-200">
                            <div className="px-3.5 text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 py-3">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder={language === 'bn' ? 'ইউজারনেম লিখুন (যেমন: admin বা seller)' : 'Enter username, email or phone'}
                              className="flex-1 px-3.5 py-3 text-sm font-bold bg-transparent focus:outline-none text-slate-800 dark:text-white placeholder-slate-400"
                              required
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
                            {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'} <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center border rounded-xl overflow-hidden bg-slate-50/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-[#da1c24] transition-all duration-200">
                            <div className="px-3.5 text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 py-3">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="flex-1 px-3.5 py-3 text-sm font-black tracking-widest bg-transparent focus:outline-none text-slate-800 dark:text-white placeholder-slate-400"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Log In Button */}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3.5 text-white font-black rounded-xl shadow-lg transition-all duration-200 text-xs uppercase tracking-widest flex items-center justify-center cursor-pointer bg-gradient-to-r from-[#da1c24] via-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 active:scale-[0.99] shadow-red-500/20"
                        >
                          {isLoading ? '...' : (language === 'bn' ? 'লগইন করুন' : 'Log In')}
                        </button>

                        {/* Quick Biometric Alternative Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setBiometricTargetRole('customer');
                            setIsBiometricModalOpen(true);
                          }}
                          className="w-full py-3 bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200/80 dark:border-slate-700/80 transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer shadow-xs active:scale-[0.99]"
                        >
                          <Fingerprint className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                          <span>{language === 'bn' ? 'ফিঙ্গারপ্রিন্ট দিয়ে তাৎক্ষণিক লগইন' : 'One-Touch Fingerprint Login'}</span>
                        </button>

                        {/* Forgot Password Link */}
                        <div className="text-center pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setShowForgotPassword(true);
                              setError('');
                              setForgotPasswordSuccess('');
                            }}
                            className="text-xs font-semibold text-slate-400 hover:text-[#da1c24] dark:text-slate-400 dark:hover:text-red-400 transition cursor-pointer"
                          >
                            {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                          </button>
                        </div>

                        {/* Create a New Account Prominent Highlight Box */}
                        <div className="pt-2">
                          <div className="p-3.5 sm:p-4 bg-slate-100/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 flex items-center justify-between gap-3 shadow-xs">
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {language === 'bn' ? 'কোন অ্যাকাউন্ট নেই?' : "Don't have an account?"}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                {language === 'bn' ? 'সহজেই নতুন অ্যাকাউন্ট তৈরি করুন' : 'Sign up for free in a minute'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomerSubTab('signup');
                                setSignupType('customer');
                                setError('');
                              }}
                              className="px-3.5 py-2.5 bg-[#da1c24] hover:bg-red-700 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer shrink-0"
                            >
                              <span>{language === 'bn' ? 'নতুন অ্যাকাউন্ট' : 'Create Account'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )
                ) : (
                  <form 
                    onSubmit={signupType === 'seller' ? handleSellerDetailsSubmit : handlePhoneSubmit} 
                    className="space-y-4"
                  >
                    {/* Signup Specific Fields */}
                    <div className="space-y-4">
                      {/* Toggle selection between Customer & Seller */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {language === 'bn' ? 'অ্যাকাউন্টের ধরন নির্বাচন করুন' : 'Select Account Type'} <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => {
                              setSignupType('customer');
                              setError('');
                            }}
                            className={`py-3 rounded-xl text-xs font-black transition duration-150 flex items-center justify-center space-x-1.5 cursor-pointer ${
                              signupType === 'customer'
                                ? 'bg-[#da1c24] text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                            }`}
                          >
                            <UserIcon className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'ক্রেতা (Customer)' : 'Customer'}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setSignupType('seller');
                              setError('');
                            }}
                            className={`py-3 rounded-xl text-xs font-black transition duration-150 flex items-center justify-center space-x-1.5 cursor-pointer ${
                              signupType === 'seller'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                            }`}
                          >
                            <Store className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'সেলার / বিক্রেতা' : 'Seller / Merchant'}</span>
                          </button>
                        </div>
                      </div>

                      {signupType === 'customer' ? (
                        <>
                          {/* Name field */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                              {language === 'bn' ? 'আপনার নাম' : 'Full Name'} <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-[#da1c24] bg-slate-50 dark:bg-slate-950/40">
                              <div className="px-3 text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 py-3">
                                <UserIcon className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                value={signupName}
                                onChange={(e) => setSignupName(e.target.value)}
                                placeholder={language === 'bn' ? 'যেমন: আবির হাসান' : 'e.g. Abir Hasan'}
                                className="flex-1 px-3 py-3 text-sm font-black bg-transparent focus:outline-none text-slate-800 dark:text-white"
                                required
                              />
                            </div>
                          </div>

                          {/* Email field */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                              {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                            </label>
                            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-[#da1c24] bg-slate-50 dark:bg-slate-950/40">
                              <div className="px-3 text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 py-3">
                                <HelpCircle className="w-4 h-4" />
                              </div>
                              <input
                                type="email"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                placeholder="example@amarbazar.com"
                                className="flex-1 px-3 py-3 text-sm font-black bg-transparent focus:outline-none text-slate-800 dark:text-white"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        /* SELLER REGISTRATION IN SIGNUP TAB */
                        <div className="space-y-3.5">
                          {/* Profile Completion Progress Bar */}
                          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 p-2.5 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between text-[9px] font-black tracking-widest uppercase">
                              <span className="text-slate-400 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                                {language === 'bn' ? 'অ্যাকাউন্ট প্রোফাইল সম্পন্ন' : 'Account Profile Completion'}
                              </span>
                              <span className="text-amber-500">
                                {completionPercent}% {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-1 overflow-hidden">
                              <div 
                                className="bg-amber-500 h-1 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${completionPercent}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[7px] font-black tracking-widest uppercase text-slate-400">
                              <span>{completionPercent}% {language === 'bn' ? 'পূর্ণ হয়েছে' : 'Completed'}</span>
                              <span>{100 - completionPercent}% {language === 'bn' ? 'বাকি আছে' : 'Remaining'}</span>
                            </div>
                          </div>

                          {/* First & Last Name side by side */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                                {language === 'bn' ? 'প্রথম নাম' : 'First Name'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={ownerFirstName}
                                onChange={(e) => setOwnerFirstName(e.target.value)}
                                placeholder="e.g. Abir"
                                className="w-full px-2.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                                {language === 'bn' ? 'শেষ নাম' : 'Last Name'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={ownerLastName}
                                onChange={(e) => setOwnerLastName(e.target.value)}
                                placeholder="e.g. Hasan"
                                className="w-full px-2.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                              />
                            </div>
                          </div>

                          {/* Store Name & Store Location (Split layout) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                                {language === 'bn' ? 'দোকানের নাম (ব্র্যান্ড)' : 'Store Name (Brand)'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                placeholder="e.g. Abir General Store"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  {language === 'bn' ? 'দোকানের লোকেশন' : 'Store Location'} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center space-x-1.5">
                                  {resolvingLink && (
                                    <span className="text-[8px] text-amber-500 font-black flex items-center gap-1 animate-pulse">
                                      <RefreshCw className="w-2 h-2 animate-spin text-amber-500" />
                                      {language === 'bn' ? 'লিংক লোড হচ্ছে...' : 'Resolving...'}
                                    </span>
                                  )}
                                  <a
                                    href="https://www.google.com/maps"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[8px] rounded transition cursor-pointer flex items-center gap-0.5 border border-slate-200 dark:border-slate-700"
                                  >
                                    <ExternalLink className="w-2 h-2 text-slate-400" />
                                    {language === 'bn' ? 'গুগল ম্যাপ' : 'Google Map'}
                                  </a>
                                </div>
                              </div>
                              <input
                                type="text"
                                required
                                value={storeAddress}
                                onChange={(e) => handleAddressChange(e.target.value)}
                                placeholder={language === 'bn' ? 'উদা: মিরপুর ১০, ঢাকা (বা গুগল ম্যাপ লিংক পেস্ট করুন)' : 'e.g. Mirpur 10, Dhaka (or paste map link)'}
                                className={`w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold transition-all duration-300 ${
                                  resolvingLink 
                                    ? 'border-amber-500 ring-1 ring-amber-500/20 animate-pulse' 
                                    : 'border-slate-200 dark:border-slate-800'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Business Phone & NID Number */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                                {language === 'bn' ? 'মোবাইল (বিকাশ/নগদ)' : 'bKash/Nagad Phone'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                value={businessPhone}
                                onChange={(e) => setBusinessPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                placeholder="e.g. 017XXXXXXXX"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                                {language === 'bn' ? 'ন্যাশনাল আইডি (NID)' : 'National ID (NID)'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={nidNumber}
                                onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                                placeholder="e.g. 199526XXXXXXXX"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                              />
                            </div>
                          </div>

                          {/* Store / Outlet Category Selection */}
                          <div className="relative">
                            <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                              {language === 'bn' ? 'দোকানের ক্যাটাগরি' : 'Store Category'} <span className="text-red-500">*</span>
                            </label>
                            
                            <button
                              type="button"
                              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex items-center justify-between font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                            >
                              <div className="flex items-center space-x-2">
                                {(() => {
                                  const currentCat = STORE_CATEGORIES.find(c => c.id === storeCategory) || STORE_CATEGORIES[0];
                                  const Icon = currentCat.icon;
                                  return (
                                    <>
                                      <Icon className="w-4 h-4 text-amber-500" />
                                      <span>{language === 'bn' ? currentCat.nameBn : currentCat.nameEn}</span>
                                    </>
                                  );
                                })()}
                              </div>
                              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCategoryDropdownOpen && (
                              <div className="absolute z-50 left-0 right-0 mt-1.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                  {STORE_CATEGORIES.map(cat => {
                                    const isSelected = storeCategory === cat.id;
                                    const CatIcon = cat.icon;
                                    return (
                                      <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                          setStoreCategory(cat.id);
                                          setIsCategoryDropdownOpen(false);
                                        }}
                                        className={`flex items-center space-x-2 px-2.5 py-2 rounded-xl border text-left transition cursor-pointer ${
                                          isSelected
                                            ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                                            : 'bg-transparent border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                      >
                                        <CatIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                                        <span className="text-[10px] font-bold">
                                          {language === 'bn' ? cat.nameBn : cat.nameEn}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Trade License ID & Business Email */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                                {language === 'bn' ? 'ট্রেড লাইসেন্স আইডি' : 'Trade License ID'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={tradeLicense}
                                onChange={(e) => setTradeLicense(e.target.value)}
                                placeholder="e.g. TRAD-2026-9821"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                                {language === 'bn' ? 'ব্যবসায়িক ইমেইল' : 'Business Email'}
                              </label>
                              <input
                                type="email"
                                value={businessEmail}
                                onChange={(e) => setBusinessEmail(e.target.value)}
                                placeholder="e.g. store@example.com"
                                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                              />
                            </div>
                          </div>

                          {/* Required Documents Upload inside signup tab */}
                          <div className="space-y-1.5 pt-1">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {language === 'bn' ? 'প্রয়োজনীয় ভেরিফিকেশন নথিপত্র ও ছবি আপলোড' : 'Required Verification Documents'}
                            </label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* Owner Photo */}
                              <div className="border border-dashed border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition relative overflow-hidden">
                                <input type="file" accept="image/*" onChange={handleFileChange(setOwnerPhoto)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {ownerPhoto ? (
                                  <img src={ownerPhoto} className="w-8 h-8 object-cover rounded border border-slate-200 dark:border-slate-700 flex-shrink-0" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded flex items-center justify-center text-slate-400 flex-shrink-0">
                                    <Camera className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-extrabold text-[9px] text-slate-700 dark:text-slate-300 truncate">
                                    {language === 'bn' ? 'মালিকের ছবি' : 'Owner Photo'} <span className="text-red-500">*</span>
                                  </p>
                                  <p className="text-[7px] text-slate-400 truncate">
                                    {ownerPhoto ? (language === 'bn' ? 'আপলোড সম্পন্ন' : 'Uploaded') : (language === 'bn' ? 'সিলেক্ট করুন' : 'Tap to upload')}
                                  </p>
                                </div>
                              </div>

                              {/* Shop Photo */}
                              <div className="border border-dashed border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition relative overflow-hidden">
                                <input type="file" accept="image/*" onChange={handleFileChange(setShopPhoto)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {shopPhoto ? (
                                  <img src={shopPhoto} className="w-8 h-8 object-cover rounded border border-slate-200 dark:border-slate-700 flex-shrink-0" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded flex items-center justify-center text-slate-400 flex-shrink-0">
                                    <Image className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-extrabold text-[9px] text-slate-700 dark:text-slate-300 truncate">
                                    {language === 'bn' ? 'দোকানের ছবি' : 'Shop Photo'} <span className="text-red-500">*</span>
                                  </p>
                                  <p className="text-[7px] text-slate-400 truncate">
                                    {shopPhoto ? (language === 'bn' ? 'আপলোড সম্পন্ন' : 'Uploaded') : (language === 'bn' ? 'সিলেক্ট করুন' : 'Tap to upload')}
                                  </p>
                                </div>
                              </div>

                              {/* NID Front */}
                              <div className="border border-dashed border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition relative overflow-hidden">
                                <input type="file" accept="image/*" onChange={handleFileChange(setNidPhotoFront)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {nidPhotoFront ? (
                                  <img src={nidPhotoFront} className="w-8 h-8 object-cover rounded border border-slate-200 dark:border-slate-700 flex-shrink-0" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded flex items-center justify-center text-slate-400 flex-shrink-0">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-extrabold text-[9px] text-slate-700 dark:text-slate-300 truncate">
                                    {language === 'bn' ? 'NID কার্ড (সামনে)' : 'NID Front'} <span className="text-red-500">*</span>
                                  </p>
                                  <p className="text-[7px] text-slate-400 truncate">
                                    {nidPhotoFront ? (language === 'bn' ? 'আপলোড সম্পন্ন' : 'Uploaded') : (language === 'bn' ? 'সিলেক্ট করুন' : 'Tap to upload')}
                                  </p>
                                </div>
                              </div>

                              {/* NID Back */}
                              <div className="border border-dashed border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition relative overflow-hidden">
                                <input type="file" accept="image/*" onChange={handleFileChange(setNidPhotoBack)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {nidPhotoBack ? (
                                  <img src={nidPhotoBack} className="w-8 h-8 object-cover rounded border border-slate-200 dark:border-slate-700 flex-shrink-0" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded flex items-center justify-center text-slate-400 flex-shrink-0">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-extrabold text-[9px] text-slate-700 dark:text-slate-300 truncate">
                                    {language === 'bn' ? 'NID কার্ড (পেছনে)' : 'NID Back'} <span className="text-red-500">*</span>
                                  </p>
                                  <p className="text-[7px] text-slate-400 truncate">
                                    {nidPhotoBack ? (language === 'bn' ? 'আপলোড সম্পন্ন' : 'Uploaded') : (language === 'bn' ? 'সিলেক্ট করুন' : 'Tap to upload')}
                                  </p>
                                </div>
                              </div>

                              {/* Trade License */}
                              <div className="border border-dashed border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition relative overflow-hidden sm:col-span-2">
                                <input type="file" accept="image/*" onChange={handleFileChange(setShopLicensePhoto)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {shopLicensePhoto ? (
                                  <img src={shopLicensePhoto} className="w-8 h-8 object-cover rounded border border-slate-200 dark:border-slate-700 flex-shrink-0" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded flex items-center justify-center text-slate-400 flex-shrink-0">
                                    <FileText className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-extrabold text-[9px] text-slate-700 dark:text-slate-300 truncate">
                                    {language === 'bn' ? 'ট্রেড লাইসেন্স কপি' : 'Trade License Copy'} <span className="text-red-500">*</span>
                                  </p>
                                  <p className="text-[7px] text-slate-400 truncate">
                                    {shopLicensePhoto ? (language === 'bn' ? 'আপলোড সম্পন্ন' : 'Uploaded') : (language === 'bn' ? 'সিলেক্ট করুন' : 'Tap to upload')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {signupType === 'customer' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                        {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-[#da1c24] bg-slate-50 dark:bg-slate-950/40">
                        <div className="flex items-center space-x-1.5 px-3 py-3 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 select-none">
                          <span className="text-sm">🇧🇩</span>
                          <span className="text-xs font-black text-slate-600 dark:text-slate-300">+880</span>
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setPhoneNumber(val.slice(0, 10));
                          }}
                          placeholder="1XXXXXXXXX"
                          className="flex-1 px-3 py-3 text-sm font-black tracking-wider bg-transparent focus:outline-none text-slate-800 dark:text-white"
                          required
                          autoFocus
                        />
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 block text-right">
                        {language === 'bn' ? 'উদাহরণ: ১৭১২৩৪৫৬৭৮' : 'e.g. 1712345678'}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3.5 font-black rounded-xl shadow-lg transition duration-150 text-xs uppercase tracking-widest flex items-center justify-center cursor-pointer ${
                      signupType === 'seller'
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/10'
                        : 'bg-[#da1c24] hover:bg-red-700 text-white shadow-red-500/10'
                    }`}
                  >
                    {isLoading ? '...' : (
                      signupType === 'seller'
                        ? (language === 'bn' ? 'সাবস্ক্রিপশন প্ল্যান ও পেমেন্টে যান' : 'Choose Subscription & Pay')
                        : (language === 'bn' ? 'ক্রেতা একাউন্ট তৈরি করুন' : 'Create Customer Account')
                    )}
                  </button>

                  {/* Secondary Toggle Text Link below the form */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setCustomerSubTab('login'); setError(''); }}
                      className="text-xs font-bold text-[#da1c24] hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'ইতিমধ্যেই অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Log In'}
                    </button>
                  </div>
                </form>
              )) : (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div className="space-y-2">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {language === 'bn' ? 'আপনার ফোনে পাঠানো ওটিপি দিন' : 'Enter OTP code sent to'}
                      </p>
                      <p className="text-xs font-black text-[#da1c24] mt-0.5">
                        +880 {phoneNumber}
                      </p>
                      <span className="inline-block mt-2 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold rounded-lg text-[10px]">
                        {language === 'bn' ? 'টেস্ট কোড: ১২৩৪৫৬' : 'DEMO OTP CODE: 123456'}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full text-center text-xl font-black tracking-[0.5em] px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#da1c24] focus:ring-1 focus:ring-red-500/20 rounded-xl focus:outline-none text-slate-800 dark:text-white"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#da1c24] hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {language === 'bn' ? 'ভেরিফাই ও প্রবেশ করুন' : 'Verify & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpMode(false)}
                    className="w-full text-center text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {language === 'bn' ? 'নম্বর পরিবর্তন করুন' : 'Change Phone Number'}
                  </button>
                </form>
              )}



              {/* Become a Merchant section removed */}
            </div>
          )}

          {/* ==================== SELLER VIEW (PAID SUBSCRIPTION) ==================== */}
          {authType === 'seller' && (
            <div>
              {/* Step Title Indicator */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center">
                  <Store className="w-4 h-4 mr-1" />
                  {language === 'bn' ? 'সেলার রেজিস্ট্রেশন ও পেমেন্ট' : 'Merchant Subscription Hub'}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {sellerStep === 'details' && (language === 'bn' ? 'ধাপ ১/৫: প্রোফাইল তথ্য' : 'Step 1/5: Merchant Info')}
                  {sellerStep === 'face_verification' && (language === 'bn' ? 'ধাপ ২/৫: ফেস ভেরিফিকেশন' : 'Step 2/5: Face Verification')}
                  {sellerStep === 'plans' && (language === 'bn' ? 'ধাপ ৩/৫: প্ল্যান নির্বাচন' : 'Step 3/5: Choose Plan')}
                  {sellerStep === 'payment' && (language === 'bn' ? 'ধাপ ৪/৫: গেটওয়ে পেমেন্ট' : 'Step 4/5: Secure Gateway')}
                  {sellerStep === 'processing' && 'Validating gateway transaction...'}
                  {sellerStep === 'success' && 'Subscription Complete!'}
                </span>
              </div>

              {/* STEP 1: MERCHANT REGISTRATION DETAILS */}
              {sellerStep === 'details' && (
                <form onSubmit={handleSellerDetailsSubmit} className="space-y-4">
                  {/* Profile Completion Progress Bar */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 p-2.5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        {language === 'bn' ? 'অ্যাকাউন্ট প্রোফাইল সম্পন্ন' : 'Account Profile Completion'}
                      </span>
                      <span className="text-amber-500">
                        {completionPercent}% {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-1 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-slate-400">
                      <span>{completionPercent}% {language === 'bn' ? 'পূর্ণ হয়েছে' : 'Completed'}</span>
                      <span>{100 - completionPercent}% {language === 'bn' ? 'বাকি আছে' : 'Remaining'}</span>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* First & Last Name side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                          {language === 'bn' ? 'মালিকের প্রথম নাম' : 'Owner First Name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={ownerFirstName}
                          onChange={(e) => setOwnerFirstName(e.target.value)}
                          placeholder="e.g. Abir"
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                          {language === 'bn' ? 'মালিকের শেষ নাম' : 'Owner Last Name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={ownerLastName}
                          onChange={(e) => setOwnerLastName(e.target.value)}
                          placeholder="e.g. Hasan"
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                        />
                      </div>
                    </div>

                    {/* Store Name & Store Location (Split layout) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                          {language === 'bn' ? 'দোকানের নাম (মার্কেটপ্লেস ব্র্যান্ড)' : 'Store Name (Marketplace Brand)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="e.g. Abir Tech BD"
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {language === 'bn' ? 'দোকানের লোকেশন' : 'Store Location'} <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center space-x-1.5">
                            {resolvingLink && (
                              <span className="text-[8px] text-amber-500 font-black flex items-center gap-1 animate-pulse">
                                <RefreshCw className="w-2 h-2 animate-spin text-amber-500" />
                                {language === 'bn' ? 'লিংক লোড হচ্ছে...' : 'Resolving...'}
                              </span>
                            )}
                            <a
                              href="https://www.google.com/maps"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[8px] rounded transition cursor-pointer flex items-center gap-0.5 border border-slate-200 dark:border-slate-700"
                            >
                              <ExternalLink className="w-2 h-2 text-slate-400" />
                              {language === 'bn' ? 'গুগল ম্যাপ' : 'Google Map'}
                            </a>
                          </div>
                        </div>
                        <input
                          type="text"
                          required
                          value={storeAddress}
                          onChange={(e) => handleAddressChange(e.target.value)}
                          placeholder={language === 'bn' ? 'উদা: মিরপুর ১০, ঢাকা (বা গুগল ম্যাপ লিংক পেস্ট করুন)' : 'e.g. Mirpur 10, Dhaka (or paste map link)'}
                          className={`w-full px-3 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold transition-all duration-300 ${
                            resolvingLink 
                              ? 'border-amber-500 ring-1 ring-amber-500/20 animate-pulse' 
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Business Phone & NID Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                          {language === 'bn' ? 'মোবাইল নম্বর (বিকাশ/নগদ নম্বর)' : 'Business Phone (bKash/Nagad)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          placeholder="e.g. 017XXXXXXXX"
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                          {language === 'bn' ? 'ন্যাশনাল আইডি (NID) নম্বর' : 'National ID (NID) Number'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={nidNumber}
                          onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                          placeholder="e.g. 1995261XXXXXXXX"
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                        />
                      </div>
                    </div>

                    {/* Store / Outlet Category Selection */}
                    <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                        {language === 'bn' ? 'দোকানের ক্যাটাগরি' : 'Store Category'} <span className="text-red-500">*</span>
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex items-center justify-between font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                      >
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const currentCat = STORE_CATEGORIES.find(c => c.id === storeCategory) || STORE_CATEGORIES[0];
                            const Icon = currentCat.icon;
                            return (
                              <>
                                <Icon className="w-4 h-4 text-amber-500" />
                                <span>{language === 'bn' ? currentCat.nameBn : currentCat.nameEn}</span>
                              </>
                            );
                          })()}
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isCategoryDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-2 gap-2">
                            {STORE_CATEGORIES.map(cat => {
                              const isSelected = storeCategory === cat.id;
                              const CatIcon = cat.icon;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    setStoreCategory(cat.id);
                                    setIsCategoryDropdownOpen(false);
                                  }}
                                  className={`flex items-center space-x-2 px-2.5 py-2 rounded-xl border text-left transition cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                                      : 'bg-transparent border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <CatIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                                  <span className="text-[10px] font-bold">
                                    {language === 'bn' ? cat.nameBn : cat.nameEn}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Trade License ID & Business Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                          {language === 'bn' ? 'ট্রেড লাইসেন্স আইডি নম্বর' : 'Trade License ID Number'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={tradeLicense}
                          onChange={(e) => setTradeLicense(e.target.value)}
                          placeholder="e.g. TRAD-2026-90A8"
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                          {language === 'bn' ? 'ব্যবসায়িক ইমেইল (ঐচ্ছিক)' : 'Business Email (Optional)'}
                        </label>
                        <input
                          type="email"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          placeholder="e.g. contact@karimtech.com"
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                        />
                      </div>
                    </div>

                    {/* --- PREMIUM FILE UPLOADS GRID --- */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {language === 'bn' ? 'প্রয়োজনীয় নথিপত্র ও ছবি আপলোড' : 'Verification Documents & Photos'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        
                        {/* Owner Photo */}
                        <div className="border border-dashed border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition relative overflow-hidden">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange(setOwnerPhoto)} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          />
                          {ownerPhoto ? (
                            <img src={ownerPhoto} className="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                              <Camera className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-[10px] text-slate-700 dark:text-slate-300">
                              {language === 'bn' ? 'মালিকের ছবি' : 'Owner Photo'} <span className="text-red-500">*</span>
                            </p>
                            <p className="text-[8px] text-slate-400 truncate">
                              {ownerPhoto ? (language === 'bn' ? 'আপলোড সফল' : 'Uploaded (Change)') : (language === 'bn' ? 'ফাইল সিলেক্ট করুন' : 'Tap to upload')}
                            </p>
                          </div>
                        </div>

                        {/* Shop Photo */}
                        <div className="border border-dashed border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition relative overflow-hidden">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange(setShopPhoto)} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          />
                          {shopPhoto ? (
                            <img src={shopPhoto} className="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                              <Image className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-[10px] text-slate-700 dark:text-slate-300">
                              {language === 'bn' ? 'দোকানের ছবি' : 'Shop Front Photo'} <span className="text-red-500">*</span>
                            </p>
                            <p className="text-[8px] text-slate-400 truncate">
                              {shopPhoto ? (language === 'bn' ? 'আপলোড সফল' : 'Uploaded (Change)') : (language === 'bn' ? 'ফাইল সিলেক্ট করুন' : 'Tap to upload')}
                            </p>
                          </div>
                        </div>

                        {/* NID Front */}
                        <div className="border border-dashed border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition relative overflow-hidden">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange(setNidPhotoFront)} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          />
                          {nidPhotoFront ? (
                            <img src={nidPhotoFront} className="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-[10px] text-slate-700 dark:text-slate-300">
                              {language === 'bn' ? 'NID কার্ড (সামনের অংশ)' : 'NID Card (Front Copy)'} <span className="text-red-500">*</span>
                            </p>
                            <p className="text-[8px] text-slate-400 truncate">
                              {nidPhotoFront ? (language === 'bn' ? 'আপলোড সফল' : 'Uploaded (Change)') : (language === 'bn' ? 'ফাইল সিলেক্ট করুন' : 'Tap to upload')}
                            </p>
                          </div>
                        </div>

                        {/* NID Back */}
                        <div className="border border-dashed border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition relative overflow-hidden">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange(setNidPhotoBack)} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          />
                          {nidPhotoBack ? (
                            <img src={nidPhotoBack} className="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-[10px] text-slate-700 dark:text-slate-300">
                              {language === 'bn' ? 'NID কার্ড (পেছনের অংশ)' : 'NID Card (Back Copy)'} <span className="text-red-500">*</span>
                            </p>
                            <p className="text-[8px] text-slate-400 truncate">
                              {nidPhotoBack ? (language === 'bn' ? 'আপলোড সফল' : 'Uploaded (Change)') : (language === 'bn' ? 'ফাইল সিলেক্ট করুন' : 'Tap to upload')}
                            </p>
                          </div>
                        </div>

                        {/* Trade License Scan Document */}
                        <div className="border border-dashed border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition relative overflow-hidden sm:col-span-2">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange(setShopLicensePhoto)} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          />
                          {shopLicensePhoto ? (
                            <img src={shopLicensePhoto} className="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-[10px] text-slate-700 dark:text-slate-300">
                              {language === 'bn' ? 'ট্রেড লাইসেন্স কপি আপলোড করুন' : 'Trade License Document Copy'} <span className="text-red-500">*</span>
                            </p>
                            <p className="text-[8px] text-slate-400 truncate">
                              {shopLicensePhoto ? (language === 'bn' ? 'আপলোড সফল' : 'Uploaded (Change)') : (language === 'bn' ? 'ট্রেড লাইসেন্স কপির ছবি বা ডকুমেন্ট সিলেক্ট করুন' : 'Tap to select document/photo')}
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন' : 'Choose Subscription Plan'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {sellerStep === 'details' && (
                <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800/50 mt-4">
                  <button
                    type="button"
                    onClick={() => { setAuthType('customer'); setError(''); }}
                    className="text-xs font-black text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    {language === 'bn' ? 'কাস্টমার হিসেবে সাইন-ইন বা লগইন করুন (ফ্রি)' : 'Go to Customer Login / Access (Free)'}
                  </button>
                </div>
              )}

              {/* STEP 2: FACE VERIFICATION */}
              {sellerStep === 'face_verification' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 mr-1 text-green-500 animate-pulse" />
                      {language === 'bn' ? 'বায়োমেট্রিক ফেস ভেরিফিকেশন' : 'Biometric Face Verification'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {language === 'bn' 
                        ? 'এনআইডি জালিয়াতি রোধে ডিজিটাল কমার্স নীতিমালা অনুযায়ী এটি বাধ্যতামূলক' 
                        : 'Required under digital commerce security guidelines to prevent identity fraud'}
                    </p>
                  </div>

                  {/* Camera / Scan view wrapper */}
                  <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-video max-w-sm mx-auto flex flex-col items-center justify-center min-h-[240px] shadow-inner">
                    
                    {/* Live Streaming View */}
                    {faceScanStatus === 'streaming' && (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        {/* High-tech biometric HUD overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {/* Face placement oval guidelines */}
                          <div className="w-[180px] h-[180px] rounded-full border-2 border-dashed border-amber-500/60 flex items-center justify-center relative animate-pulse">
                            <div className="absolute inset-[-4px] border-2 border-amber-500 rounded-full clip-path-hud"></div>
                            {/* Scanning horizontal line */}
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500 shadow-[0_0_8px_#22c55e] animate-scan-laser"></div>
                          </div>
                        </div>
                        {/* Status watermark */}
                        <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700 pointer-events-none">
                          <span className="text-[8px] font-black tracking-widest text-amber-500 flex items-center uppercase">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping mr-1"></span>
                            LIVE CAM
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Scanning animation view */}
                    {faceScanStatus === 'scanning' && (
                      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-amber-500 flex items-center justify-center mb-3">
                          {facePhoto ? (
                            <img src={facePhoto} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600">
                              <Camera className="w-10 h-10 animate-spin" />
                            </div>
                          )}
                          {/* Horizontal scan line inside capture view */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_12px_#22c55e] animate-scan-laser"></div>
                        </div>
                        <div className="w-full max-w-[240px] bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                          <div 
                            className="bg-amber-500 h-full transition-all duration-75 rounded-full"
                            style={{ width: `${faceScanProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black text-amber-500 tracking-wider">
                          {faceScanProgress}%
                        </span>
                      </div>
                    )}

                    {/* Verification success view */}
                    {faceScanStatus === 'success' && (
                      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-green-500 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                          {facePhoto ? (
                            <img src={facePhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600">
                              <UserIcon className="w-10 h-10" />
                            </div>
                          )}
                          <div className="absolute bottom-1 right-1 bg-green-500 p-1.5 rounded-full text-slate-950 border-2 border-slate-950">
                            <Check className="w-4 h-4 stroke-[4]" />
                          </div>
                        </div>
                        <p className="text-green-500 font-black text-xs uppercase tracking-wider flex items-center">
                          <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
                          {language === 'bn' ? 'ভেরিফিকেশন সফল!' : 'Face Verified Successfully!'}
                        </p>
                      </div>
                    )}

                    {/* Failed / Idle Fallback View */}
                    {(faceScanStatus === 'failed' || faceScanStatus === 'idle') && (
                      <div className="p-4 text-center space-y-3 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-300">
                            {language === 'bn' ? 'ক্যামেরা অনুমোদন প্রয়োজন' : 'Camera Permission Required'}
                          </p>
                          <p className="text-[10px] text-slate-500 max-w-[240px] leading-relaxed">
                            {language === 'bn' 
                              ? 'আপনার ব্রাউজার ক্যামেরা অনুমতির জন্য অনুরোধ করতে পারে। অথবা নিচের ডেমো ভেরিফিকেশন দিয়ে পরীক্ষা সম্পন্ন করতে পারেন।' 
                              : 'Grant camera access to complete, or use our simulator button below to quickly run the test scan.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Banner below stream */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 transition-colors">
                      {faceScanMessage || (language === 'bn' ? 'বায়োমেট্রিক স্ক্যান সম্পন্ন করতে নিচের বোতামগুলোতে চাপুন' : 'Use the controls below to complete biometric capture')}
                    </p>
                  </div>

                  {/* Actions Area */}
                  <div className="space-y-2">
                    {faceScanStatus === 'streaming' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={captureAndVerifyFace}
                          className="py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>{language === 'bn' ? 'ছবি তুলুন' : 'Capture Face'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={simulateFaceScan}
                          className="py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{language === 'bn' ? 'অটো-ভেরিফাই' : 'Demo Scan'}</span>
                        </button>
                      </div>
                    )}

                    {(faceScanStatus === 'failed' || faceScanStatus === 'idle') && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          <span>{language === 'bn' ? 'ক্যামেরা চালু করুন' : 'Start Camera'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={simulateFaceScan}
                          className="py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>{language === 'bn' ? 'অটো-ভেরিফাই' : 'Demo Scan'}</span>
                        </button>
                      </div>
                    )}

                    {faceScanStatus === 'scanning' && (
                      <div className="w-full py-3.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-center flex items-center justify-center space-x-2 text-slate-400">
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-black uppercase tracking-wider">{language === 'bn' ? 'বায়োমেট্রিক মিল পরীক্ষা করা হচ্ছে...' : 'Verifying Biometric Match...'}</span>
                      </div>
                    )}

                    {faceScanStatus === 'success' && (
                      <button
                        type="button"
                        onClick={() => setSellerStep('credentials')}
                        className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'ভেরিফিকেশন সম্পন্ন: পাসওয়ার্ড সেট করুন' : 'Verified: Set Password'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {faceScanStatus !== 'success' && faceScanStatus !== 'scanning' && (
                      <button
                        type="button"
                        onClick={() => {
                          stopCamera();
                          setFacePhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'); // Mock default photo for skipped flow
                          setSellerStep('credentials');
                        }}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold rounded-xl border border-slate-200 dark:border-slate-800 transition flex items-center justify-center space-x-1.5 cursor-pointer text-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === 'bn' ? 'ফেস ভেরিফিকেশন স্কিপ করুন' : 'Skip Face Verification'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setSellerStep('details');
                      }}
                      className="w-full py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'তথ্য সংশোধনে ফিরে যান' : 'Go back to edit info'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: CREDENTIALS CREATION */}
              {sellerStep === 'credentials' && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!regUsername || !regPassword) {
                      setError(language === 'bn' ? 'ইউজারনেম এবং পাসওয়ার্ড উভয়ই প্রদান করুন' : 'Please provide both username and password');
                      return;
                    }
                    if (regUsername.length < 3) {
                      setError(language === 'bn' ? 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে' : 'Username must be at least 3 characters');
                      return;
                    }
                    if (regPassword.length < 6) {
                      setError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
                      return;
                    }
                    setError('');
                    setSellerStep('plans');
                  }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-1 mb-2">
                    <p className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center justify-center">
                      <Lock className="w-4 h-4 mr-1 text-amber-500" />
                      {language === 'bn' ? 'লগইন ক্রেডেনশিয়াল সেট করুন' : 'Set Login Credentials'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {language === 'bn' 
                        ? 'ভবিষ্যতে আপনার বিক্রেতা পোর্টালে লগইন করতে এটি ব্যবহার করা হবে' 
                        : 'These credentials will be used to log in to your merchant portal'}
                    </p>
                  </div>

                  {/* Username Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {language === 'bn' ? 'ইউজারনেম (Username)' : 'Username'} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 bg-slate-50 dark:bg-slate-950/40">
                      <div className="px-3 text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 py-3">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder={language === 'bn' ? 'উদা: abirstore' : 'e.g. abirstore'}
                        className="flex-1 px-3 py-3 text-sm font-black bg-transparent focus:outline-none text-slate-800 dark:text-white"
                        required
                        autoFocus
                      />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 block">
                      {language === 'bn' ? 'শুধুমাত্র ছোট হাতের ইংরেজি অক্ষর ও সংখ্যা ব্যবহার করুন।' : 'Use only lowercase letters, numbers, and underscores.'}
                    </span>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {language === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Password'} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 bg-slate-50 dark:bg-slate-950/40">
                      <div className="px-3 text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 py-3">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="flex-1 px-3 py-3 text-sm font-black tracking-widest bg-transparent focus:outline-none text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন ও এগিয়ে যান' : 'Confirm & Proceed to Plans'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSellerStep('face_verification');
                    }}
                    className="w-full py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ফেস ভেরিফিকেশনে ফিরে যান' : 'Go back to Face Verification'}</span>
                  </button>
                </form>
              )}

              {/* STEP 3: PLAN SELECTION */}
              {sellerStep === 'plans' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1 mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Plan / প্ল্যান নির্বাচন করুন</p>
                    <p className="text-[10px] text-slate-400">প্রতিটি প্ল্যান ৩০ দিন মেয়াদী। কোনো গোপন ফি নেই।</p>
                  </div>

                  {/* Plans list */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Starter */}
                    <div 
                      onClick={() => setSelectedPlan('starter')}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                        selectedPlan === 'starter'
                          ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2.5">
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
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                      }`}
                    >
                      <span className="absolute -top-2.5 right-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Popular (সেরা পছন্দ)
                      </span>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'business' ? 'border-amber-500' : 'border-slate-300'}`}>
                            {selectedPlan === 'business' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                          </div>
                          <div>
                            <p className="font-extrabold text-xs">Business (বিজনেস প্ল্যান)</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Limit: 100 Products | 3% commission | Featured</p>
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
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'enterprise' ? 'border-amber-500' : 'border-slate-300'}`}>
                            {selectedPlan === 'enterprise' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                          </div>
                          <div>
                            <p className="font-extrabold text-xs">Enterprise (এন্টারপ্রাইজ)</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Limit: Unlimited | 1% commission | Account Manager</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-amber-500 dark:text-amber-400">৳৩,০০০ / মাস</p>
                          <p className="text-[8px] text-slate-400">30 Days Validity</p>
                        </div>
                      </div>
                    </div>

                    {/* Free Trial Option */}
                    <div 
                      onClick={() => setSelectedPlan('trial')}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                        selectedPlan === 'trial'
                          ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                      }`}
                    >
                      <span className="absolute -top-2.5 right-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        {language === 'bn' ? 'ফ্রি অফার' : 'Free Trial'}
                      </span>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2.5">
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

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setSellerStep('details')}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-extrabold rounded-xl transition text-xs flex items-center justify-center space-x-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{language === 'bn' ? 'পিছনে যান' : 'Back'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="flex-[2] py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition text-xs flex items-center justify-center space-x-1.5 uppercase shadow-md"
                    >
                      {selectedPlan === 'trial' ? (
                        <>
                          <span>{language === 'bn' ? 'ফ্রি ট্রায়াল শুরু করুন' : 'Start Free Trial'}</span>
                          <CheckCircle className="w-4 h-4 text-slate-950" />
                        </>
                      ) : (
                        <>
                          <span>{language === 'bn' ? 'পেমেন্ট করুন (৳' + PLANS_INFO[selectedPlan].price + ')' : 'Pay Now (৳' + PLANS_INFO[selectedPlan].price + ')'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENTS (BKASH, NAGAD, ROCKET SIMULATOR) */}
              {sellerStep === 'payment' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Gateway / গেটওয়ে নির্বাচন করুন</p>
                    <p className="text-[10px] text-slate-400">পেমেন্ট গেটওয়ে সিলেক্ট করে পিন ভেরিফাই করুন।</p>
                  </div>

                  {/* Gateway selector logos */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* bKash */}
                    <button
                      type="button"
                      onClick={() => { setSelectedGateway('bkash'); setError(''); }}
                      className={`py-3 px-2 rounded-xl border-2 transition font-black text-[10px] tracking-wide flex flex-col items-center justify-center space-y-1 ${
                        selectedGateway === 'bkash'
                          ? 'border-[#e2136e] bg-[#e2136e]/10 text-[#e2136e]'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-500 bg-white dark:bg-slate-900/60'
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
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-500 bg-white dark:bg-slate-900/60'
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
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-500 bg-white dark:bg-slate-900/60'
                      }`}
                    >
                      <span className="text-lg">🚀</span>
                      <span>Rocket (রকেট)</span>
                    </button>
                  </div>

                  {/* BRANDED INTERACTIVE GATEWAY POPUP CARD */}
                  <div className={`rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800 select-none ${
                    selectedGateway === 'bkash' ? 'bg-[#e2136e]' : selectedGateway === 'nagad' ? 'bg-[#f15a22]' : 'bg-[#8c3494]'
                  } text-white p-5 space-y-4`}>
                    
                    {/* Branded Header */}
                    <div className="flex justify-between items-center border-b border-white/20 pb-2.5">
                      <div className="font-serif italic font-black text-sm md:text-base tracking-widest flex items-center space-x-1">
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

                    {/* Gateway content based on sub-steps */}
                    {!gatewayOtpMode && !gatewayPinMode ? (
                      /* Phase 1: Enter wallet number */
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
                        <p className="text-[9px] text-white/70 leading-relaxed text-center">
                          By clicking Proceed, you agree to secure subscription payment authorization.
                        </p>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold rounded-xl transition text-xs uppercase"
                        >
                          {isLoading ? 'Sending Request...' : 'Proceed / ওটিপি পাঠান'}
                        </button>
                      </form>
                    ) : gatewayOtpMode && !gatewayPinMode ? (
                      /* Phase 2: OTP Entry */
                      <form onSubmit={handleGatewayOtpSubmit} className="space-y-3">
                        <div className="text-center space-y-1 bg-white/10 p-2.5 rounded-xl border border-white/10">
                          <p className="text-[10px] text-white/80">
                            {language === 'bn' ? 'অ্যাকাউন্টে পাঠানো ভেরিফিকেশন ওটিপি দিন' : 'Verification OTP sent to your wallet'}
                          </p>
                          <p className="text-xs font-black text-yellow-300">{gatewayPhone}</p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 bg-yellow-400 text-slate-950 font-black rounded-lg text-[9px]">
                            {language === 'bn' ? 'টেস্ট কোড: ১২৩৪৫৬' : 'DEMO OTP: 123456'}
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
                      /* Phase 3: PIN Entry */
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

                    {/* Logo/Bottom branding inside gateway mockup */}
                    <div className="flex items-center justify-center space-x-1.5 pt-1 text-[8px] text-white/60 font-bold uppercase tracking-widest border-t border-white/10">
                      <span>Secure Payment Gateway</span>
                      <span>•</span>
                      <span>Verified SSL Smart Node</span>
                    </div>
                  </div>

                  <div className="flex space-x-2.5 mt-4">
                    <button
                      type="button"
                      onClick={() => setSellerStep('plans')}
                      className="w-full py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-600 dark:text-slate-200 font-extrabold rounded-xl transition text-xs text-center"
                    >
                      {language === 'bn' ? 'প্ল্যান পরিবর্তন' : 'Change Plan'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PROCESSING TRANSACTION */}
              {sellerStep === 'processing' && (
                <div className="p-8 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/10 animate-pulse" />
                    <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Processing Gateway Payment</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto animate-pulse">
                      We are securely validating the payment transaction with {selectedGateway.toUpperCase()} e-merchant systems... Please do not close or reload.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 5: SUCCESS & LAUNCH */}
              {sellerStep === 'success' && (
                <div className="p-6 text-center space-y-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {selectedPlan === 'trial' 
                        ? (language === 'bn' ? 'ফ্রি ট্রায়াল শুরু হয়েছে!' : 'Free Trial Activated!')
                        : (language === 'bn' ? 'আবেদন জমা হয়েছে!' : 'Application Submitted!')}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      {language === 'bn' 
                        ? selectedPlan === 'trial'
                          ? 'অভিনন্দন! আপনার ১ সপ্তাহের ফ্রী ট্রায়াল সফলভাবে শুরু হয়েছে। আপনার অ্যাকাউন্টটি সক্রিয় হওয়ায় আপনি এখনই লগইন করে আপনার বিক্রেতা ড্যাশবোর্ড ব্যবহার করতে পারবেন।'
                          : 'অভিনন্দন! আপনার সাবস্ক্রিপশন পেমেন্টটি সফল হয়েছে। আপনার বিক্রেতা আবেদনটি এখন অ্যাডমিন মূল্যায়নের জন্য পেন্ডিং রয়েছে। অ্যাডমিন এটি রিভিউ করে এপ্রুভ করার সাথে সাথে আপনি লগইন করে আপনার বিক্রেতা ড্যাশবোর্ড ব্যবহার করতে পারবেন।'
                        : selectedPlan === 'trial'
                          ? 'Congratulations! Your 1-week free trial has successfully started. Your trial is fully active, so you can log in right away and start using the merchant portal.'
                          : 'Congratulations! Your subscription payment is successful. Your merchant profile is now pending administrator review and approval. Once approved, you can log in and manage your store.'}
                    </p>
                  </div>

                  {/* Transaction info block */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-800 text-left text-[11px] font-bold space-y-2 text-slate-600 dark:text-slate-350">
                    <div className="flex justify-between">
                      <span>Store (দোকান):</span>
                      <span className="text-slate-900 dark:text-white">{storeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan (প্যাকেজ):</span>
                      <span className="text-amber-500">{PLANS_INFO[selectedPlan].name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gateway Method (পেমেন্ট):</span>
                      <span className="uppercase text-slate-900 dark:text-white">
                        {selectedPlan === 'trial' ? 'Free Activation / ফ্রী ট্রায়াল' : `${selectedGateway} Wallet`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Paid (পরিশোধিত):</span>
                      <span className="text-slate-900 dark:text-white">৳{PLANS_INFO[selectedPlan].price}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-2 font-black text-slate-800 dark:text-slate-200">
                      <span>Transaction ID (আইডি):</span>
                      <span className="text-[#10b981] select-all">{gatewayTxnId}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsAuthOpen(false);
                      setAuthType('customer');
                      setCustomerSubTab('login');
                      setSellerStep('details');
                    }}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-1 transition cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'বন্ধ করুন এবং হোমে যান' : 'Close & Back Home'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Biometric / Fingerprint Scanner Modal */}
      <BiometricAuthModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        targetRole={biometricTargetRole}
        onSuccess={(user) => {
          setCurrentUser(user);
          setActiveRole(user.role);
          setActivePanel(user.role === 'admin' ? 'admin' : user.role === 'seller' ? 'seller' : 'customer');
          setIsBiometricModalOpen(false);
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
};
