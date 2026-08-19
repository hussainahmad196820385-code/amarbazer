import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, User, MapPin, Heart, ShoppingBag, CreditCard, 
  Wallet, Tag, Ticket, MessageSquare, ShieldCheck, Key, LogOut, 
  Trash2, Edit, Save, Plus, X, Check, Eye, HelpCircle, Award, 
  Phone, Mail, FileText, Download, ShieldAlert, ArrowUpRight, 
  ArrowDownLeft, Bell, AlertTriangle, RefreshCw, Send, Loader2, Printer,
  Fingerprint, Sparkles, Smartphone, Globe, Coins
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Order, Address, Product, Coupon } from '../../types';
import { 
  isBiometricEnabled, 
  setBiometricEnabled, 
  registerDeviceBiometrics, 
  isBiometricSupported,
  getSavedBiometricUser
} from '../../services/biometricAuth';
import { BiometricAuthModal } from '../auth/BiometricAuthModal';
import { RolesPermissionsHub } from '../common/RolesPermissionsHub';
import { LanguageSettingsTab } from './LanguageSettingsTab';
import { CurrencySettingsTab } from './CurrencySettingsTab';
import { OrderSlipsHub } from './OrderSlipsHub';
import { getLanguageMeta, getTranslation } from '../../services/languageService';
import { getCurrencyMeta } from '../../services/currencyService';

// Mock list of Bangladesh divisions, districts and thanas for address form
const BD_DIVISIONS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'];
const BD_DISTRICTS: Record<string, string[]> = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Faridpur'],
  Chittagong: ['Chittagong', 'Cox\'s Bazar', 'Comilla', 'Feni', 'Noakhali'],
  Rajshahi: ['Rajshahi', 'Bogra', 'Pabna', 'Naogaon', 'Natore'],
  Khulna: ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Kushtia'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Barisal: ['Barisal', 'Bhola', 'Patuakhali', 'Pirojpur'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram'],
  Mymensingh: ['Mymensingh', 'Netrokona', 'Sherpur', 'Jamalpur']
};

export const CustomerProfilePanel: React.FC = () => {
  const { 
    currentUser, setCurrentUser, language, currency, formatPrice, setActivePanel, 
    products, wishlist, toggleWishlist, addToCart
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'addresses' | 'orders' | 'wishlist' | 'wallet' | 'coupons' | 'slips' | 'tickets' | 'language_settings' | 'currency_settings' | 'roles_permissions' | 'security'>('dashboard');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Profile fields state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileDob, setProfileDob] = useState('1992-05-15');
  const [kycStatus, setKycStatus] = useState<'not_submitted' | 'pending' | 'approved'>('not_submitted');
  const [kycDocumentType, setKycDocumentType] = useState('NID');
  const [kycFileSelected, setKycFileSelected] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Biometric / Fingerprint States
  const [biometricActive, setBiometricActive] = useState(() => isBiometricEnabled());
  const [biometricModalMode, setBiometricModalMode] = useState<'login' | 'register'>('login');
  const [biometricFeedback, setBiometricFeedback] = useState<string | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const handleOpenBiometricEnrollment = () => {
    setBiometricModalMode('register');
    setShowBiometricModal(true);
  };

  const handleOpenBiometricTest = () => {
    setBiometricModalMode('login');
    setShowBiometricModal(true);
  };

  // Address fields state
  const [addresses, setAddresses] = useState<Address[]>(currentUser?.addresses || [
    {
      id: 'addr-dhaka-1',
      title: 'Home Address',
      recipientName: currentUser?.name || 'Rahim Chowdhury',
      phone: currentUser?.phone || '01712345678',
      division: 'Dhaka',
      district: 'Dhaka',
      thana: 'Dhanmondi',
      fullAddress: 'House 42, Road 10/A, Dhanmondi R/A, Dhaka-1209',
      isDefault: true
    },
    {
      id: 'addr-ctg-2',
      title: 'Office Address',
      recipientName: currentUser?.name || 'Rahim Chowdhury',
      phone: '01811223344',
      division: 'Chittagong',
      district: 'Chittagong',
      thana: 'Halishahar',
      fullAddress: 'Apt 4B, Concord Tower, Agrabad C/A, Chittagong',
      isDefault: false
    }
  ]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDivision, setAddrDivision] = useState('Dhaka');
  const [addrDistrict, setAddrDistrict] = useState('Dhaka');
  const [addrThana, setAddrThana] = useState('');
  const [addrFull, setAddrFull] = useState('');

  // Wallet and Points state
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem(`wallet_${currentUser?.id}`);
    return saved ? Number(saved) : 5400; // Simulated BDT Balance
  });
  const [rewardPoints, setRewardPoints] = useState(() => {
    const saved = localStorage.getItem(`points_${currentUser?.id}`);
    return saved ? Number(saved) : 1250; // Points
  });
  const [walletTopUpOpen, setWalletTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('1000');
  const [topUpPhone, setTopUpPhone] = useState(currentUser?.phone || '');
  const [topUpProvider, setTopUpProvider] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [walletHistory, setWalletHistory] = useState<Array<{id: string, type: 'credit' | 'debit', amount: number, desc: string, date: string}>>([
    { id: 'tx-1', type: 'credit', amount: 2000, desc: 'Simulated bKash Wallet Cash-In', date: '2026-08-01 14:30' },
    { id: 'tx-2', type: 'debit', amount: 1250, desc: 'Payment for Order #BD-2026-9021', date: '2026-07-28 11:15' },
    { id: 'tx-3', type: 'credit', amount: 150, desc: 'Reward Points Conversion (1,500 pts)', date: '2026-07-20 18:40' }
  ]);

  // Coupons / Vouchers state
  const [vouchers, setVouchers] = useState<Coupon[]>([
    { id: 'v-1', code: 'AMARBD15', type: 'percentage', discountValue: 15, minPurchase: 1000, expiryDate: '2026-09-30', isActive: true, usedCount: 0 },
    { id: 'v-2', code: 'FREESHIP', type: 'fixed', discountValue: 60, minPurchase: 500, expiryDate: '2026-08-31', isActive: true, usedCount: 1 },
    { id: 'v-3', code: 'EIDDHAMAKA', type: 'percentage', discountValue: 20, minPurchase: 2000, expiryDate: '2026-09-15', isActive: true, usedCount: 0 }
  ]);
  const [couponInput, setCouponInput] = useState('');

  // Support Tickets & Live Chat state
  const [tickets, setTickets] = useState<Array<{id: string, subject: string, category: string, priority: string, status: 'open' | 'closed', date: string, messages: Array<{sender: 'user' | 'agent', text: string, time: string}>}>>([
    {
      id: 't-101',
      subject: 'Delay in Himsagar Mango Delivery',
      category: 'Delivery',
      priority: 'high',
      status: 'open',
      date: '2026-08-02',
      messages: [
        { sender: 'user', text: 'My mango order has been pending for 3 days. When will it ship?', time: '2026-08-02 10:00' },
        { sender: 'agent', text: 'Hello Rahim, due to heavy rains in Rajshahi highway, some courier trucks are delayed. Your mangoes will reach Dhaka warehouse tonight. It will deliver tomorrow morning!', time: '2026-08-02 12:45' }
      ]
    },
    {
      id: 't-102',
      subject: 'Damaged Walton TV Box Received',
      category: 'Refund',
      priority: 'high',
      status: 'closed',
      date: '2026-07-25',
      messages: [
        { sender: 'user', text: 'The external cartoon of the TV package is torn. Is the internal panel safe?', time: '2026-07-25 14:00' },
        { sender: 'agent', text: 'Sir, our Walton TVs have solid internal thermocol casing. Please unpack it and check if screen is fine. If there is damage, we will replace immediately.', time: '2026-07-25 15:10' },
        { sender: 'user', text: 'Verified, TV screen is pristine. Thank you for prompt response!', time: '2026-07-25 16:30' }
      ]
    }
  ]);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Delivery');
  const [newTicketPriority, setNewTicketPriority] = useState('medium');
  const [newTicketMsg, setNewTicketMsg] = useState('');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('t-101');
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Order Details Modal or Panel state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed mind');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('Damaged Product');
  const [refundProofUrl, setRefundProofUrl] = useState('');

  // Password fields state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Saved Wishlist items
  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Load orders belonging to Rahim/CurrentUser
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const list = await api.getOrders({ userId: currentUser?.id || 'usr-demo-cust' });
        setOrders(list);
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  // Sync wallet balance to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`wallet_${currentUser.id}`, String(walletBalance));
    }
  }, [walletBalance, currentUser]);

  // Sync points to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`points_${currentUser.id}`, String(rewardPoints));
    }
  }, [rewardPoints, currentUser]);

  // Trigger Action feedback banners
  const triggerBanner = (message: string) => {
    setActionSuccess(message);
    setTimeout(() => {
      setActionSuccess(null);
    }, 4000);
  };

  // Profile Save handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name: profileName,
        email: profileEmail,
        phone: profilePhone
      });
      triggerBanner(language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!');
    }
  };

  // KYC Submit handler
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKycStatus('pending');
    triggerBanner(language === 'bn' ? 'আপনার কেওয়াইসি (KYC) যাচাইকরণ জমা দেওয়া হয়েছে।' : 'Your KYC application has been submitted successfully for verification.');
  };

  // Address Handlers
  const handleAddOrEditAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrRecipient || !addrPhone || !addrFull || !addrThana) {
      alert('Please fill out all address fields.');
      return;
    }

    if (editingAddressId) {
      // Edit Address
      const updated = addresses.map(addr => {
        if (addr.id === editingAddressId) {
          return {
            ...addr,
            title: addrTitle,
            recipientName: addrRecipient,
            phone: addrPhone,
            division: addrDivision,
            district: addrDistrict,
            thana: addrThana,
            fullAddress: addrFull
          };
        }
        return addr;
      });
      setAddresses(updated);
      if (currentUser) setCurrentUser({ ...currentUser, addresses: updated });
      triggerBanner(language === 'bn' ? 'ঠিকানা আপডেট করা হয়েছে!' : 'Address updated successfully!');
    } else {
      // Add Address
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        title: addrTitle,
        recipientName: addrRecipient,
        phone: addrPhone,
        division: addrDivision,
        district: addrDistrict,
        thana: addrThana,
        fullAddress: addrFull,
        isDefault: addresses.length === 0
      };
      const updated = [...addresses, newAddr];
      setAddresses(updated);
      if (currentUser) setCurrentUser({ ...currentUser, addresses: updated });
      triggerBanner(language === 'bn' ? 'নতুন ঠিকানা যুক্ত করা হয়েছে!' : 'New delivery address added!');
    }

    // Reset Address fields
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddrRecipient('');
    setAddrPhone('');
    setAddrThana('');
    setAddrFull('');
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    setAddresses(updated);
    if (currentUser) setCurrentUser({ ...currentUser, addresses: updated });
    triggerBanner(language === 'bn' ? 'ডিফল্ট শিপিং ঠিকানা সেট করা হয়েছে।' : 'Primary shipping address updated!');
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter(addr => addr.id !== id);
    setAddresses(updated);
    if (currentUser) setCurrentUser({ ...currentUser, addresses: updated });
    triggerBanner(language === 'bn' ? 'ঠিকানা মুছে ফেলা হয়েছে।' : 'Delivery address deleted.');
  };

  // Wallet Top-up Handler
  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(topUpAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    setWalletBalance(prev => prev + amt);
    setWalletHistory(prev => [
      {
        id: `tx-${Date.now()}`,
        type: 'credit',
        amount: amt,
        desc: `${topUpProvider.toUpperCase()} Cash-In via Mobile OTP`,
        date: new Date().toLocaleString()
      },
      ...prev
    ]);
    setWalletTopUpOpen(false);
    triggerBanner(language === 'bn' ? `৳${amt} ওয়ালেটে যোগ করা হয়েছে!` : `৳${amt} successfully added to your Digital Wallet!`);
  };

  // Reward Points Conversion Handler
  const handleConvertPoints = () => {
    if (rewardPoints < 100) {
      alert('Minimum 100 points required to convert.');
      return;
    }
    const convertableUnits = Math.floor(rewardPoints / 100);
    const convertedCash = convertableUnits * 10; // 100 points = ৳10
    const pointsDeducted = convertableUnits * 100;

    setRewardPoints(prev => prev - pointsDeducted);
    setWalletBalance(prev => prev + convertedCash);
    setWalletHistory(prev => [
      {
        id: `tx-${Date.now()}`,
        type: 'credit',
        amount: convertedCash,
        desc: `Converted ${pointsDeducted.toLocaleString()} Reward Points to Cash`,
        date: new Date().toLocaleString()
      },
      ...prev
    ]);
    triggerBanner(language === 'bn' ? `${pointsDeducted} পয়েন্ট কনভার্ট করে ৳${convertedCash} ওয়ালেট ব্যালেন্স যোগ করা হয়েছে!` : `Successfully converted ${pointsDeducted} points to ৳${convertedCash} wallet credit!`);
  };

  // Cancel order execution
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      const updated = await api.updateOrderStatus(selectedOrder.id, 'cancelled', `Cancelled by User: ${cancelReason}`);
      setOrders(orders.map(o => o.id === selectedOrder.id ? updated : o));
      setSelectedOrder(updated);
      setShowCancelReasonModal(false);
      triggerBanner(language === 'bn' ? 'আপনার অর্ডারটি বাতিল করা হয়েছে।' : 'Your order has been cancelled successfully.');
    } catch (err) {
      console.error(err);
      alert('Could not cancel order at this stage.');
    }
  };

  // Return refund order execution
  const handleRefundRequest = async () => {
    if (!selectedOrder) return;
    try {
      const updated = await api.updateOrderStatus(selectedOrder.id, 'cancelled', `Refund/Return Requested: ${refundReason}. Detail: ${refundProofUrl}`);
      setOrders(orders.map(o => o.id === selectedOrder.id ? updated : o));
      setSelectedOrder(updated);
      setShowRefundModal(false);
      triggerBanner(language === 'bn' ? 'রিটার্ন এবং রিফান্ড আবেদন জমা দেওয়া হয়েছে।' : 'Return & Refund request submitted. Support team will inspect within 24 hours.');
    } catch (err) {
      console.error(err);
    }
  };

  // Claim Coupon
  const handleClaimCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const found = vouchers.find(v => v.code.toUpperCase() === couponInput.toUpperCase());
    if (found) {
      triggerBanner(language === 'bn' ? 'কুপনটি ইতিমধ্যে দাবি করা হয়েছে!' : 'Coupon has already been added to your vault!');
    } else {
      const mockNewVoucher: Coupon = {
        id: `coup-${Date.now()}`,
        code: couponInput.toUpperCase(),
        type: 'percentage',
        discountValue: 10,
        minPurchase: 800,
        expiryDate: '2026-12-31',
        isActive: true,
        usedCount: 0
      };
      setVouchers([...vouchers, mockNewVoucher]);
      setCouponInput('');
      triggerBanner(language === 'bn' ? `কুপন '${mockNewVoucher.code}' ভল্টে যোগ করা হয়েছে!` : `Voucher Code '${mockNewVoucher.code}' saved successfully!`);
    }
  };

  // Support Ticket Handlers
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMsg) return;

    const newTicket = {
      id: `t-${100 + tickets.length + 1}`,
      subject: newTicketSubject,
      category: newTicketCategory,
      priority: newTicketPriority,
      status: 'open' as const,
      date: new Date().toISOString().split('T')[0],
      messages: [
        { sender: 'user' as const, text: newTicketMsg, time: new Date().toLocaleTimeString() }
      ]
    };

    setTickets([newTicket, ...tickets]);
    setSelectedTicketId(newTicket.id);
    setNewTicketSubject('');
    setNewTicketMsg('');
    setShowTicketForm(false);
    triggerBanner(language === 'bn' ? 'নতুন হেল্প টিকেট খোলা হয়েছে!' : 'New support help ticket raised successfully!');
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText || !selectedTicketId) return;

    const updated = tickets.map(ticket => {
      if (ticket.id === selectedTicketId) {
        const updatedMsgs = [...ticket.messages, { sender: 'user' as const, text: ticketReplyText, time: new Date().toLocaleString() }];
        
        // Setup simple auto-agent reply simulation
        setTimeout(() => {
          setTickets(prevTickets => prevTickets.map(t => {
            if (t.id === ticket.id) {
              return {
                ...t,
                messages: [
                  ...t.messages,
                  { sender: 'agent' as const, text: `Hello Rahim, thanks for updating. Our support agent has marked this feedback. We are processing your request. Ref Ticket ID: ${ticket.id}`, time: new Date().toLocaleString() }
                ]
              };
            }
            return t;
          }));
        }, 1500);

        return {
          ...ticket,
          messages: updatedMsgs
        };
      }
      return ticket;
    });

    setTickets(updated);
    setTicketReplyText('');
  };

  // Change Password Handler
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      alert(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' : 'Password must be at least 4 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert(language === 'bn' ? 'নতুন পাসওয়ার্ড দুটি মিলছে না!' : 'Passwords do not match!');
      return;
    }
    if (!currentUser?.id) return;

    try {
      const res = await api.changePassword({
        userId: currentUser.id,
        oldPassword,
        newPassword
      });
      if (res && res.user) {
        setCurrentUser({ ...currentUser, ...res.user, password: newPassword });
      }
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      triggerBanner(language === 'bn' ? 'অ্যাকাউন্ট পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন থেকে শুধুমাত্র নতুন পাসওয়ার্ড দিয়ে লগইন করা যাবে।' : 'Account password changed successfully! Only the new password will work for login.');
    } catch (err: any) {
      alert(err.message || 'Password update failed');
    }
  };

  // Handle invoice printable view
  const handlePrintInvoice = () => {
    window.print();
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-4 px-2 sm:px-4">
      
      {/* Toast Alert Banner */}
      {actionSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-emerald-400/20 animate-fade-in-down">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT NAV PANEL - Styled like Amazon / Shopify Sidebar */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs p-4 flex flex-col space-y-2">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-2">
            <img 
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
              alt={currentUser?.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30"
            />
            <div className="min-w-0">
              <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 truncate">{currentUser?.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold block truncate">{currentUser?.phone || currentUser?.email}</p>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black rounded-md text-[8px] uppercase tracking-wider">
                  Verified Member
                </span>
                {kycStatus === 'approved' && (
                  <span className="inline-block px-2 py-0.5 bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-black rounded-md text-[8px] uppercase">
                    KYC Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'dashboard' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>{language === 'bn' ? 'অ্যাকাউন্ট ড্যাশবোর্ড' : 'Account Dashboard'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('profile'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'profile' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>{language === 'bn' ? 'আমার প্রোফাইল ও কেওয়াইসি' : 'My Profile & KYC'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('addresses'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'addresses' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{language === 'bn' ? 'সংরক্ষিত ঠিকানা সমূহ' : 'Saved Addresses'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'orders' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>{language === 'bn' ? 'আমার অর্ডার ও ট্র্যাকিং' : 'My Orders & Tracking'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('wishlist'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'wishlist' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span>{language === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('wallet'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'wallet' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span>{language === 'bn' ? 'ওয়ালেট ও রিওয়ার্ড পয়েন্টস' : 'My Wallet & Points'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('coupons'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'coupons' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0" />
            <span>{language === 'bn' ? 'কুপন ও ভাউচার' : 'Coupons & Vouchers'}</span>
          </button>

          {/* DEDICATED SLIPS, INVOICES & DIGITAL PRINTER VAULT */}
          <button
            onClick={() => { setActiveTab('slips'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 relative ${
              activeTab === 'slips' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black' : 'text-slate-700 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-amber-500" />
            <div className="flex items-center justify-between w-full">
              <span>{language === 'bn' ? 'অর্ডার স্লিপ ও চালান ভল্ট' : 'Order Slips & Invoices Hub'}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                activeTab === 'slips' ? 'bg-black text-amber-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {language === 'bn' ? 'প্রিন্ট ও PDF' : 'Print/PDF'}
              </span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('tickets'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'tickets' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Ticket className="w-4 h-4 shrink-0" />
            <span>{getTranslation('support_tickets', language, language === 'bn' ? 'সাপোর্ট টিকেট ও চ্যাট' : 'Support Tickets & Chat')}</span>
          </button>

          <button
            onClick={() => { setActiveTab('language_settings'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'language_settings' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0 text-emerald-500" />
            <div className="flex items-center justify-between w-full">
              <span>{getTranslation('language_settings', language, language === 'bn' ? 'ভাষা ও লোকালাইজেশন' : 'Language & Localization')}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <span>{getLanguageMeta(language).flag}</span>
                <span className="truncate max-w-[55px]">{getLanguageMeta(language).nativeName}</span>
              </span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('currency_settings'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'currency_settings' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Coins className="w-4 h-4 shrink-0 text-amber-500" />
            <div className="flex items-center justify-between w-full">
              <span>{language === 'bn' ? 'কারেন্সি ও মুদ্রা (Currency)' : 'Currency & Exchange'}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                <span>{getCurrencyMeta(currency).flag}</span>
                <span className="truncate max-w-[45px]">{getCurrencyMeta(currency).code}</span>
              </span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('roles_permissions'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'roles_permissions' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
            <div className="flex items-center justify-between w-full">
              <span>{language === 'bn' ? 'রোল ও পারমিশন' : 'Roles & Permissions'}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-slate-950 uppercase">New</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('security'); setSelectedOrder(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              activeTab === 'security' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{language === 'bn' ? 'নিরাপত্তা ও পাসওয়ার্ড' : 'Account Security'}</span>
          </button>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
            <button
              onClick={() => setActivePanel('customer')}
              className="w-full flex items-center space-x-3 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'bn' ? 'শপিং এ ফিরে যান' : 'Back to Shopping'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* 1. ACCOUNT OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && !selectedOrder && (
            <div className="space-y-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-extrabold block uppercase">{language === 'bn' ? 'মোট খরচ' : 'TOTAL SPENT'}</span>
                  <h3 className="text-xl font-black mt-1 text-slate-800 dark:text-white">{formatPrice(orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.totalAmount : sum, 0))}</h3>
                  <p className="text-[9px] text-emerald-500 font-bold mt-1">{formatPrice(orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0))} {language === 'bn' ? 'সম্পন্ন' : 'completed'}</p>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-extrabold block uppercase">{language === 'bn' ? 'ওয়ালেট ব্যালেন্স' : 'WALLET BALANCE'}</span>
                  <h3 className="text-xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{formatPrice(walletBalance)}</h3>
                  <button onClick={() => setActiveTab('wallet')} className="text-[9px] text-amber-500 font-bold mt-1 hover:underline block text-left">Top-Up Wallet →</button>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-extrabold block uppercase">{language === 'bn' ? 'সক্রিয় অর্ডার' : 'ACTIVE ORDERS'}</span>
                  <h3 className="text-xl font-black mt-1 text-amber-500">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-[9px] text-slate-400 font-bold mt-1 hover:underline block text-left">Track Status →</button>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-extrabold block uppercase">{language === 'bn' ? 'রিওয়ার্ড পয়েন্ট' : 'REWARD POINTS'}</span>
                  <h3 className="text-xl font-black mt-1 text-sky-500">{rewardPoints.toLocaleString()} pts</h3>
                  <button onClick={() => setActiveTab('wallet')} className="text-[9px] text-sky-500 font-bold mt-1 hover:underline block text-left">Convert to cash →</button>
                </div>
              </div>

              {/* Quick Actions and Spending Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Simulated Spending Progress & Active Coupons */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-4">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'মাসিক শপিং অগ্রগতি' : 'Monthly Shopping Progress'}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-extrabold">
                      <span className="text-slate-500">Savings Challenge (Bronze tier)</span>
                      <span className="text-slate-800 dark:text-white">65% Achieved</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 w-[65%] rounded-full" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Spend ৳3,500 more this month to unlock Gold Coupon and free delivery forever!</p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'সুপার কুপন সমূহ' : 'Active Savings Vouchers'}</h5>
                    <div className="flex items-center justify-between p-2.5 bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/10 rounded-xl">
                      <div>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">AMARBD15</span>
                        <span className="block text-[9px] text-slate-400 font-semibold">15% off on Groceries & Fruits</span>
                      </div>
                      <button onClick={() => setActiveTab('coupons')} className="text-[10px] font-bold text-amber-600 hover:underline">Copy Code</button>
                    </div>
                  </div>
                </div>

                {/* Support and Ticket Center Snapshot */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-4">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'সহায়তা ও পরামর্শ' : 'Support Ticket Center'}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Need help with an order, item delivery, or refund payout? Our 24/7 client happiness team is always active.</p>
                  
                  <div className="space-y-2">
                    {tickets.slice(0, 1).map(t => (
                      <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{t.category} Ticket</span>
                          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate mt-0.5">{t.subject}</p>
                          <span className="text-[10px] text-slate-400 font-semibold block">{t.messages.length} messages • Last updated: {t.date}</span>
                        </div>
                        <button onClick={() => { setActiveTab('tickets'); setSelectedTicketId(t.id); }} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] rounded-lg shadow-sm transition">View Replies</button>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => { setActiveTab('tickets'); setShowTicketForm(true); }} className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold transition text-center flex items-center justify-center space-x-1.5">
                    <Ticket className="w-3.5 h-3.5 text-amber-500" />
                    <span>Open New Support Ticket</span>
                  </button>
                </div>

              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'সাম্প্রতিক অর্ডারসমূহ' : 'Recent Shopping Orders'}</h4>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline">{language === 'bn' ? 'সব দেখুন →' : 'See all orders →'}</button>
                </div>
                
                {loadingOrders ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-bold">No orders placed yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.slice(0, 3).map(o => (
                      <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-800 dark:text-white">{o.orderNumber}</span>
                            <span className="text-slate-400 font-bold">• {new Date(o.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-400 text-[10px] mt-0.5 font-bold truncate max-w-sm">
                            {o.items.map(item => `${item.productTitle} (x${item.quantity})`).join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <div className="text-right">
                            <span className="font-black text-slate-900 dark:text-white block">{formatPrice(o.totalAmount)}</span>
                            <span className="text-[10px] text-slate-400 block font-bold">{o.items.length} items • {o.paymentMethod.toUpperCase()}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                            o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            o.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}>
                            {o.status}
                          </span>
                          <button onClick={() => { setSelectedOrder(o); setActiveTab('orders'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 2. MY PROFILE & KYC EDIT PANEL */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Profile Details Form */}
              <div className="md:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-6">
                <div>
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'ব্যক্তিগত তথ্য হালনাগাদ' : 'Personal Profile Information'}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Edit your customer account contact and personal details easily.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 block">{language === 'bn' ? 'সম্পূর্ণ নাম' : 'Full Name'}</label>
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500" 
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 block">{language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}</label>
                      <input 
                        type="date" 
                        value={profileDob} 
                        onChange={(e) => setProfileDob(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block">{language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                    <input 
                      type="email" 
                      value={profileEmail} 
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500" 
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 block">{language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}</label>
                    <input 
                      type="tel" 
                      value={profilePhone} 
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500" 
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="two-factor" 
                      checked={twoFactorEnabled} 
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 dark:border-slate-700" 
                    />
                    <label htmlFor="two-factor" className="text-xs text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                      Enable Two-Factor Authentication (2FA) via OTP
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition flex items-center space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{language === 'bn' ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save Profile Changes'}</span>
                  </button>
                </form>
              </div>

              {/* Optional KYC Upload Verification Panel */}
              <div className="md:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-5">
                <div>
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'কেওয়াইসি যাচাইকরণ' : 'KYC Document Verification'}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Upload official NID, Passport, or Smart Card photo to unlock high limit wallet and buy expensive electronics via bKash installment schemes.</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-750 flex flex-col space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-extrabold">VERIFICATION STATUS:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      kycStatus === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                      kycStatus === 'pending' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400' :
                      'bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-400'
                    }`}>
                      {kycStatus === 'approved' ? 'Verified' : kycStatus === 'pending' ? 'Pending Approval' : 'Not Submitted'}
                    </span>
                  </div>

                  {kycStatus === 'not_submitted' && (
                    <form onSubmit={handleKycSubmit} className="space-y-4 text-xs font-bold">
                      <div className="space-y-1">
                        <label className="text-slate-500 block">Select Document Type</label>
                        <select 
                          value={kycDocumentType} 
                          onChange={(e) => setKycDocumentType(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="NID">Bangladeshi National ID (NID)</option>
                          <option value="Passport">Passport</option>
                          <option value="Driving_License">Driving License</option>
                        </select>
                      </div>

                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-xl p-4 text-center cursor-pointer hover:border-amber-500/50 transition bg-white dark:bg-slate-950">
                        <input 
                          type="file" 
                          id="kyc-file" 
                          className="hidden" 
                          onChange={() => setKycFileSelected(true)} 
                        />
                        <label htmlFor="kyc-file" className="cursor-pointer space-y-1 block">
                          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                          <span className="block font-black text-slate-800 dark:text-slate-200 text-xs">
                            {kycFileSelected ? 'File Selected (Click to change)' : 'Select front side photo'}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-semibold">JPG, PNG, PDF up to 5MB</span>
                        </label>
                      </div>

                      <button 
                        type="submit" 
                        disabled={!kycFileSelected}
                        className={`w-full py-2 bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-black transition ${
                          !kycFileSelected ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Submit KYC Documents
                      </button>
                    </form>
                  )}

                  {kycStatus === 'pending' && (
                    <div className="p-1 space-y-2 text-center">
                      <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
                      <p className="font-extrabold text-slate-800 dark:text-white text-xs">Documents are in verification</p>
                      <p className="text-[10px] text-slate-400 font-medium">AmarBazar compliance office is verifying your details. This usually takes 2-4 hours. You will receive an SMS alert upon activation.</p>
                      <button onClick={() => setKycStatus('approved')} className="text-[10px] font-bold text-amber-600 hover:underline">Force Auto-Approve (Demo Mode)</button>
                    </div>
                  )}

                  {kycStatus === 'approved' && (
                    <div className="p-1 space-y-2 text-center">
                      <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">KYC Verified Successfully!</p>
                      <p className="text-[10px] text-slate-400 font-medium">Your identity was officially verified via Dhaka Election Commission Database. You now have unlimited digital wallet transactions.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 3. SAVED ADDRESSES WITH ADD NEW ADDRESS FORM */}
          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'সংরক্ষিত ডেলিভারি ঠিকানা সমূহ' : 'My Shipping & Delivery Addresses'}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Manage multiple physical addresses for home, office, and relatives delivery.</p>
                </div>
                {!showAddressForm && (
                  <button 
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddrTitle('Home');
                      setAddrRecipient(currentUser?.name || '');
                      setAddrPhone(currentUser?.phone || '');
                      setAddrDivision('Dhaka');
                      setAddrDistrict('Dhaka');
                      setAddrThana('');
                      setAddrFull('');
                      setShowAddressForm(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Address Edit/Add Form */}
              {showAddressForm && (
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-750 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-700">
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase">
                      {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                    </span>
                    <button onClick={() => setShowAddressForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  </div>

                  <form onSubmit={handleAddOrEditAddress} className="space-y-4 text-xs font-bold">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-500">Address Tag (Label)</label>
                        <select 
                          value={addrTitle} 
                          onChange={(e) => setAddrTitle(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs"
                        >
                          <option value="Home">Home Address (বাসা)</option>
                          <option value="Office">Office Address (অফিস)</option>
                          <option value="Relatives">Relatives (আত্মীয়)</option>
                          <option value="Other">Other Address</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">Recipient Name</label>
                        <input 
                          type="text" 
                          value={addrRecipient}
                          onChange={(e) => setAddrRecipient(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs"
                          placeholder="Full Name"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">Contact Number</label>
                        <input 
                          type="tel" 
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs"
                          placeholder="017xxxxxxxx"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-500">Division (বিভাগ)</label>
                        <select 
                          value={addrDivision} 
                          onChange={(e) => {
                            setAddrDivision(e.target.value);
                            setAddrDistrict(BD_DISTRICTS[e.target.value][0]);
                          }}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs"
                        >
                          {BD_DIVISIONS.map(div => <option key={div} value={div}>{div}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">District (জেলা)</label>
                        <select 
                          value={addrDistrict} 
                          onChange={(e) => setAddrDistrict(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs"
                        >
                          {BD_DISTRICTS[addrDivision]?.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">Thana / Upazila (থানা)</label>
                        <input 
                          type="text" 
                          value={addrThana}
                          onChange={(e) => setAddrThana(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs"
                          placeholder="e.g. Dhanmondi, Agrabad"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500">Full Delivery Street Address</label>
                      <textarea 
                        value={addrFull}
                        onChange={(e) => setAddrFull(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs min-h-[60px]"
                        placeholder="House No, Road No, Sector, Block, Area details"
                        required
                      />
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg shadow-sm"
                      >
                        {editingAddressId ? 'Save Address' : 'Add Address'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowAddressForm(false)} 
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-black"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id} 
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      addr.isDefault 
                        ? 'bg-amber-500/5 border-amber-500 dark:border-amber-500/50 dark:bg-amber-950/5' 
                        : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-slate-800 dark:text-white flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-amber-500" />
                          {addr.title}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded text-[8px] uppercase">
                            Primary Address
                          </span>
                        )}
                      </div>

                      <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                        <p className="font-extrabold text-slate-800 dark:text-white">{addr.recipientName}</p>
                        <p className="text-slate-400 font-bold">{addr.phone}</p>
                        <p className="text-[11px] leading-relaxed mt-1 font-medium">{addr.fullAddress}, {addr.thana}, {addr.district}, {addr.division}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-black">
                      {!addr.isDefault && (
                        <button 
                          onClick={() => handleSetDefaultAddress(addr.id)} 
                          className="text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          Set Primary
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setEditingAddressId(addr.id);
                          setAddrTitle(addr.title);
                          setAddrRecipient(addr.recipientName);
                          setAddrPhone(addr.phone);
                          setAddrDivision(addr.division);
                          setAddrDistrict(addr.district);
                          setAddrThana(addr.thana);
                          setAddrFull(addr.fullAddress);
                          setShowAddressForm(true);
                        }} 
                        className="text-slate-600 dark:text-slate-400 hover:underline flex items-center"
                      >
                        <Edit className="w-3 h-3 mr-0.5" /> Edit
                      </button>
                      {!addr.isDefault && (
                        <button 
                          onClick={() => handleDeleteAddress(addr.id)} 
                          className="text-red-500 hover:underline flex items-center ml-auto"
                        >
                          <Trash2 className="w-3 h-3 mr-0.5" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 4. MY ORDERS, INVOICES & LIVE TRACKER */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Order List view or detailed tracker */}
              {!selectedOrder ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'আমার শপিং অর্ডারসমূহ' : 'My Purchase Orders & Tracking'}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Track your order dispatch, download receipt invoices, cancel or request refunds.</p>
                  </div>

                  {loadingOrders ? (
                    <div className="py-16 flex justify-center"><Loader2 className="w-10 h-8 text-amber-500 animate-spin" /></div>
                  ) : orders.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs font-bold">No orders placed yet. Select items from storefront to buy!</div>
                  ) : (
                    <div className="divide-y divide-slate-150 dark:divide-slate-800 text-xs font-semibold">
                      {orders.map(o => (
                        <div key={o.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition duration-150">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-slate-900 dark:text-white text-sm">{o.orderNumber}</span>
                              <span className="text-slate-400 text-[11px] font-bold">Placed on {new Date(o.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold truncate max-w-lg">
                              {o.items.map(item => `${item.productTitle} (x${item.quantity})`).join(', ')}
                            </p>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold">
                              <span>Courier: <span className="text-slate-700 dark:text-slate-200 font-extrabold">{o.courier?.provider || 'Pathao'}</span></span>
                              <span>•</span>
                              <span>Tracking Code: <span className="text-slate-700 dark:text-slate-200 font-extrabold">{o.courier?.trackingNumber || 'PENDING'}</span></span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                            <div className="text-left md:text-right">
                              <span className="font-black text-slate-900 dark:text-white text-sm block">{formatPrice(o.totalAmount)}</span>
                              <span className="text-[10px] text-slate-400 block font-bold">{o.items.length} items • {o.paymentMethod.toUpperCase()} ({o.paymentStatus})</span>
                            </div>
                            
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              o.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              {o.status}
                            </span>

                            <button 
                              onClick={() => setSelectedOrder(o)}
                              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs rounded-xl transition"
                            >
                              Manage Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* ORDER DETAIL & LIVE TRACKER - Amazon Central Style */
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs p-5 sm:p-6 space-y-6">
                  
                  {/* Back button and status banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center"
                    >
                      ← Back to order list
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handlePrintInvoice}
                        className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition flex items-center space-x-1.5"
                      >
                        <Printer className="w-4 h-4 text-amber-500" />
                        <span>Print Invoice Receipt</span>
                      </button>

                      {/* Cancel Button available if status is confirmed or pending */}
                      {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') && (
                        <button 
                          onClick={() => setShowCancelReasonModal(true)}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 text-xs font-black rounded-xl transition flex items-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      {/* Refund Button available if status is delivered */}
                      {selectedOrder.status === 'delivered' && (
                        <button 
                          onClick={() => setShowRefundModal(true)}
                          className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 text-xs font-black rounded-xl transition flex items-center space-x-1"
                        >
                          <RefreshCw className="w-4 h-4 text-sky-500" />
                          <span>Return & Refund</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Top order metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-xs font-bold">
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] block">ORDER NUMBER:</span>
                      <span className="text-slate-800 dark:text-white font-black text-sm">{selectedOrder.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] block">PAYMENT & METHOD:</span>
                      <span className="text-slate-800 dark:text-white font-black text-sm uppercase">{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] block">ESTIMATED DELIVERY:</span>
                      <span className="text-slate-800 dark:text-white font-black text-sm">{selectedOrder.courier?.estimatedDays || '3-5 Days'}</span>
                    </div>
                  </div>

                  {/* Real-time Courier Status log steps */}
                  <div className="space-y-4">
                    <h5 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wider">Live Parcel Courier Tracker ({selectedOrder.courier?.provider})</h5>
                    
                    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                      
                      {/* Delivery Status step logs */}
                      {selectedOrder.courier?.statusLogs.map((log, i) => (
                        <div key={i} className="relative text-xs font-semibold">
                          <span className={`absolute -left-[20px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                            i === selectedOrder.courier!.statusLogs.length - 1 ? 'bg-emerald-500 scale-125 animate-pulse' : 'bg-slate-300'
                          }`} />
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="font-extrabold text-slate-800 dark:text-white">{log.status}</span>
                            <span className="text-[10px] text-slate-400">{log.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{log.location}</p>
                        </div>
                      ))}

                    </div>
                  </div>

                  {/* Order Products & Summary */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
                    <h5 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wider">Ordered Items ({selectedOrder.items.length})</h5>
                    
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold">
                          <div className="flex items-center space-x-3 min-w-0">
                            <img src={item.productImage} alt={item.productTitle} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-800 dark:text-white truncate">{item.productTitle}</p>
                              <span className="text-[10px] text-slate-400 block font-bold">Seller: {item.sellerName}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-black text-slate-800 dark:text-white">{formatPrice(item.price)}</span>
                            <span className="block text-[10px] text-slate-400">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total billing breakdown */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end">
                      <div className="w-72 space-y-2 text-xs font-bold text-slate-500">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="text-slate-800 dark:text-white">{formatPrice(selectedOrder.subtotal)}</span>
                        </div>
                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-red-500">
                            <span>Discount ({selectedOrder.couponCode || 'Voucher'}):</span>
                            <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Shipping Courier Fee:</span>
                          <span className="text-slate-800 dark:text-white">{formatPrice(selectedOrder.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-sm font-black text-slate-900 dark:text-white">
                          <span>Total Amount Paid:</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(selectedOrder.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PRINTABLE INVOICE SHEET (HIDDEN FROM SCREEN, TARGETED BY @media print) */}
                  <div className="hidden print:block absolute inset-0 bg-white text-slate-950 p-12 text-sm font-sans z-50">
                    <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                      <div>
                        <h1 className="text-3xl font-serif italic font-black text-slate-900">আমার বাজার (AmarBazar)</h1>
                        <p className="text-xs text-slate-500 mt-1">SaaS Multi-Vendor Marketplace Ecosystem • Dhaka, Bangladesh</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-xl font-bold">OFFICIAL TAX INVOICE</h2>
                        <p className="text-xs text-slate-500 mt-1">Invoice No: INV-{selectedOrder.orderNumber}</p>
                        <p className="text-xs text-slate-500">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 text-xs">
                      <div>
                        <h4 className="font-bold uppercase text-slate-500 mb-1">BILL TO (CUSTOMER):</h4>
                        <p className="font-bold text-sm">{selectedOrder.customerName}</p>
                        <p>Phone: {selectedOrder.customerPhone}</p>
                        <p>Email: {selectedOrder.customerEmail}</p>
                        <p className="mt-1">Shipping: {selectedOrder.shippingAddress.fullAddress}, {selectedOrder.shippingAddress.thana}, {selectedOrder.shippingAddress.district}</p>
                      </div>
                      <div>
                        <h4 className="font-bold uppercase text-slate-500 mb-1">DISPATCH COURIER:</h4>
                        <p className="font-bold">{selectedOrder.courier?.provider || 'Pathao Courier'}</p>
                        <p>Tracking Ref: {selectedOrder.courier?.trackingNumber}</p>
                        <p>Status: {selectedOrder.status.toUpperCase()}</p>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs mb-8">
                      <thead>
                        <tr className="border-b-2 border-slate-900 font-bold uppercase">
                          <th className="py-2">Item Product Description</th>
                          <th className="py-2">Seller Store</th>
                          <th className="py-2 text-right">Unit Price</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, i) => (
                          <tr key={i} className="border-b border-slate-200">
                            <td className="py-2.5 font-bold">{item.productTitle}</td>
                            <td className="py-2.5">{item.sellerName}</td>
                            <td className="py-2.5 text-right">৳{item.price.toLocaleString()}</td>
                            <td className="py-2.5 text-center">{item.quantity}</td>
                            <td className="py-2.5 text-right">৳{(item.price * item.quantity).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end text-xs font-bold">
                      <div className="w-72 space-y-1.5 text-right">
                        <p>Subtotal: ৳{selectedOrder.subtotal.toLocaleString()}</p>
                        {selectedOrder.discountAmount > 0 && <p>Discount Applied: -৳{selectedOrder.discountAmount.toLocaleString()}</p>}
                        <p>Courier Delivery Fee: ৳{selectedOrder.shippingFee.toLocaleString()}</p>
                        <p className="text-sm font-black border-t border-slate-900 pt-1.5 text-slate-900">Total BDT Paid: ৳{selectedOrder.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-300 mt-20 pt-6 text-center text-[10px] text-slate-400">
                      <p>This is a computer-generated tax invoice verified via bKash/Nagad Merchant integration. No signature required.</p>
                      <p className="mt-1">Thank you for shopping at AmarBazar! Support: support@amarbazar.bd • Phone: 09612-BAZAR</p>
                    </div>
                  </div>

                </div>
              )}

              {/* Order Cancellation Modal */}
              {showCancelReasonModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-white">
                      <span>Reason for Cancellation</span>
                      <button onClick={() => setShowCancelReasonModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    <div className="space-y-3 text-xs font-semibold">
                      <p className="text-slate-400 leading-normal">Cancellations are only available before the packaging is dispatched to RedX/Pathao hub. Please specify reason:</p>
                      <select 
                        value={cancelReason} 
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="Changed mind">Changed my mind</option>
                        <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                        <option value="Incorrect shipping address">Incorrect shipping address</option>
                        <option value="Delivery delayed">Delivery is delayed</option>
                      </select>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button onClick={handleCancelOrder} className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white font-black text-xs rounded-xl flex-1 transition">Confirm Cancel</button>
                      <button onClick={() => setShowCancelReasonModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:text-slate-300 font-black text-xs rounded-xl flex-1 transition">Go Back</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Return & Refund Modal */}
              {showRefundModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-white">
                      <span>Apply for Return & Refund</span>
                      <button onClick={() => setShowRefundModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    <div className="space-y-3 text-xs font-semibold">
                      <p className="text-slate-400">Items can be returned within 7 days of delivery under AmarBazar Customer Guarantee Policy. Refund will be dispatched to original bKash/Nagad wallet within 2 working days.</p>
                      
                      <div className="space-y-1">
                        <label className="text-slate-500">Return Reason</label>
                        <select 
                          value={refundReason} 
                          onChange={(e) => setRefundReason(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="Damaged Product">Product is physically damaged / broken</option>
                          <option value="Wrong Item">Received wrong item / incorrect model</option>
                          <option value="Low Quality">Quality is far lower than described</option>
                          <option value="Missing Parts">Package is missing parts or accessories</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Comment Details</label>
                        <textarea 
                          value={refundProofUrl} 
                          onChange={(e) => setRefundProofUrl(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs min-h-[60px]"
                          placeholder="Provide details about the issue and state your bKash number..."
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button onClick={handleRefundRequest} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl flex-1 transition">Submit Claim</button>
                      <button onClick={() => setShowRefundModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:text-slate-300 font-black text-xs rounded-xl flex-1 transition">Go Back</button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 5. CUSTOMER FAVORITE WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-5">
              <div>
                <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'আমার পছন্দের পণ্যসমূহ' : 'My Favorite Wishlist Items'}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Quickly view or buy items you have bookmarked, or remove them from wishlist.</p>
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-bold">Your wishlist is currently empty.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistProducts.map(p => (
                    <div key={p.id} className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-750 flex flex-col justify-between">
                      <div className="space-y-2">
                        <img src={p.images[0]} alt={p.title} className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-slate-800 dark:text-white text-xs truncate">{p.title}</h5>
                          <span className="text-[10px] text-slate-400 block font-bold">Brand: {p.brand}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                        <div>
                          <span className="font-black text-slate-900 dark:text-white text-xs">{formatPrice(p.discountPrice || p.price)}</span>
                          {p.discountPrice && <span className="block text-[9px] text-slate-400 line-through">{formatPrice(p.price)}</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => { addToCart(p, 1); triggerBanner(language === 'bn' ? 'পণ্যটি কার্টে যোগ করা হয়েছে!' : 'Added to shopping cart!'); }}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] rounded-lg shadow-xs transition"
                          >
                            Add to Cart
                          </button>
                          <button 
                            onClick={() => toggleWishlist(p.id)} 
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. WALLET, POINTS & top ups */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Balance & Points Card */}
                <div className="md:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-4">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'আমার ডিজিটাল ওয়ালেট' : 'Digital Wallet & Rewards'}</h4>
                  
                  <div className="p-4 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 rounded-xl text-slate-950 space-y-4 shadow-md border border-amber-400/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-900/80">AmarBazar Pay Card</span>
                        <h3 className="text-2xl font-black mt-1">{formatPrice(walletBalance)}</h3>
                      </div>
                      <Award className="w-8 h-8 text-slate-950/80" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-bold">Rahim Chowdhury • Premium Account</span>
                      <button 
                        onClick={() => setWalletTopUpOpen(true)}
                        className="px-3 py-1.5 bg-slate-950 text-white hover:bg-slate-900 font-black text-[10px] rounded-lg shadow-sm transition"
                      >
                        Top-Up Cash
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-750 flex items-center justify-between text-xs font-bold">
                    <div>
                      <span className="text-slate-400 block text-[10px]">REWARD POINTS VAULT:</span>
                      <span className="text-slate-800 dark:text-white text-sm font-black">{rewardPoints.toLocaleString()} Points</span>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">100 points = ৳10 shopping credit cash</p>
                    </div>
                    <button 
                      onClick={handleConvertPoints} 
                      disabled={rewardPoints < 100}
                      className={`px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-xs transition ${
                        rewardPoints < 100 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Convert Points
                    </button>
                  </div>
                </div>

                {/* Top Up Input Form */}
                {walletTopUpOpen && (
                  <div className="md:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase">Mobile Top-Up Wallet</span>
                      <button onClick={() => setWalletTopUpOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>

                    <form onSubmit={handleTopUpSubmit} className="space-y-3 text-xs font-bold">
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          type="button" 
                          onClick={() => setTopUpProvider('bkash')}
                          className={`p-2 border rounded-xl text-center transition font-black ${
                            topUpProvider === 'bkash' ? 'bg-pink-600 text-white border-pink-500' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          bKash
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setTopUpProvider('nagad')}
                          className={`p-2 border rounded-xl text-center transition font-black ${
                            topUpProvider === 'nagad' ? 'bg-orange-500 text-white border-orange-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          Nagad
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setTopUpProvider('rocket')}
                          className={`p-2 border rounded-xl text-center transition font-black ${
                            topUpProvider === 'rocket' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          Rocket
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Sender Mobile Number</label>
                        <input 
                          type="tel" 
                          value={topUpPhone}
                          onChange={(e) => setTopUpPhone(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500">Amount (৳)</label>
                        <input 
                          type="number" 
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 focus:outline-none"
                          min="100"
                          required
                        />
                      </div>

                      <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition">
                        Verify OTP & Load Money
                      </button>
                    </form>
                  </div>
                )}

              </div>

              {/* Transaction history logs */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'লেনদেন ইতিহাস' : 'Wallet Transaction History'}</h4>
                </div>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                  {walletHistory.map(h => (
                    <div key={h.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          h.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {h.type === 'credit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-white">{h.desc}</p>
                          <span className="text-[10px] text-slate-400 block font-bold">{h.date}</span>
                        </div>
                      </div>
                      <span className={`font-black text-sm ${h.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {h.type === 'credit' ? '+' : '-'}৳{h.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 7. COUPONS & VOUCHERS CLAIM BOX */}
          {activeTab === 'coupons' && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'আমার ভাউচার ভল্ট' : 'Voucher Vault & Promo Coupons'}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Collect exciting discounts and enter coupon codes to save big during checkout.</p>
                </div>

                <div className="md:col-span-5">
                  <form onSubmit={handleClaimCoupon} className="flex gap-2 text-xs font-bold">
                    <input 
                      type="text" 
                      placeholder="ENTER PROMO CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-center text-xs focus:outline-none uppercase"
                    />
                    <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-sm transition shrink-0">Claim</button>
                  </form>
                </div>
              </div>

              {/* Coupons List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold">
                {vouchers.map(v => (
                  <div key={v.id} className="p-4 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/10 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg uppercase tracking-wide">{v.code}</span>
                        <span className="text-[10px] text-slate-400 font-bold">Expires: {v.expiryDate}</span>
                      </div>
                      <p className="font-black text-slate-800 dark:text-white text-sm mt-2">
                        {v.type === 'percentage' ? `${v.discountValue}% Off Purchases` : `৳${v.discountValue} Flat Discount`}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">Valid on minimum orders above ৳{v.minPurchase}.</p>
                    </div>

                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(v.code);
                        triggerBanner(language === 'bn' ? `কুপন কোড '${v.code}' কপি করা হয়েছে!` : `Promo code '${v.code}' copied to clipboard!`);
                      }}
                      className="w-full py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 text-amber-600 border border-amber-500/20 rounded-lg text-center transition"
                    >
                      Copy Code
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* DEDICATED SLIPS, INVOICES & DIGITAL PRINTER VAULT */}
          {activeTab === 'slips' && (
            <OrderSlipsHub />
          )}

          {/* 8. SUPPORT HELPDESK TICKETS & LIVE CHAT */}
          {activeTab === 'tickets' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
              
              {/* Left sidebar: list of tickets */}
              <div className="md:col-span-5 border-r border-slate-100 dark:border-slate-800 p-4 flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'আমার সাপোর্ট টিকিট' : 'My Support Tickets'}</span>
                    {!showTicketForm && (
                      <button onClick={() => setShowTicketForm(true)} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-amber-500 transition"><Plus className="w-5 h-5" /></button>
                    )}
                  </div>

                  <div className="space-y-2 overflow-y-auto max-h-[400px]">
                    {tickets.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => { setSelectedTicketId(t.id); setShowTicketForm(false); }}
                        className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition duration-150 ${
                          selectedTicketId === t.id 
                            ? 'bg-amber-500/5 border-amber-500' 
                            : 'bg-slate-50 dark:bg-slate-800/20 border-slate-150 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-400">#{t.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            t.status === 'open' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-150 text-slate-500'
                          }`}>{t.status}</span>
                        </div>
                        <h5 className="font-extrabold text-slate-800 dark:text-white truncate mt-1.5">{t.subject}</h5>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 block">{t.category} • Priority: <span className="text-slate-600 dark:text-slate-300 font-black">{t.priority}</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] text-slate-400 font-semibold flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p>Our call center standard response time is 15 minutes. For immediate bKash cash payment queries, call 09612-BAZAR.</p>
                </div>
              </div>

              {/* Right panel: Ticket messages or Create Form */}
              <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/30">
                
                {showTicketForm ? (
                  /* Create Ticket Form */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-850 pb-2">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase">Open New Support Ticket</span>
                      <button onClick={() => setShowTicketForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </div>

                    <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-bold">
                      <div className="space-y-1">
                        <label className="text-slate-500 block">Ticket Subject</label>
                        <input 
                          type="text" 
                          value={newTicketSubject} 
                          onChange={(e) => setNewTicketSubject(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none" 
                          placeholder="e.g. My Himsagar mango pack smells bad"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-500 block">Category</label>
                          <select 
                            value={newTicketCategory} 
                            onChange={(e) => setNewTicketCategory(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          >
                            <option value="Delivery">Delivery / Courier Delay</option>
                            <option value="Payment">Payment Gateway Failures</option>
                            <option value="Refund">Refunds & Returns Claim</option>
                            <option value="Product">Quality Complaints</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 block">Priority</label>
                          <select 
                            value={newTicketPriority} 
                            onChange={(e) => setNewTicketPriority(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          >
                            <option value="high">High (Urgent)</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 block">Message Details</label>
                        <textarea 
                          value={newTicketMsg} 
                          onChange={(e) => setNewTicketMsg(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs min-h-[100px] focus:outline-none" 
                          placeholder="Provide details about the issue, order number, or transaction details..."
                          required
                        />
                      </div>

                      <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition">
                        Open Support Ticket
                      </button>
                    </form>
                  </div>
                ) : selectedTicket ? (
                  /* Chat Thread View */
                  <div className="flex flex-col justify-between h-full space-y-4">
                    <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-bold text-slate-400">TICKET DETAILS #{selectedTicket.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          selectedTicket.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>{selectedTicket.status}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-sm mt-1">{selectedTicket.subject}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">Category: {selectedTicket.category} • Priority: {selectedTicket.priority}</p>
                    </div>

                    {/* Scrollable messages container */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[300px] scrollbar-none">
                      {selectedTicket.messages.map((m, idx) => (
                        <div key={idx} className={`max-w-[85%] p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                          m.sender === 'user' 
                            ? 'bg-amber-500 text-slate-950 ml-auto rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-150 dark:border-slate-700 mr-auto rounded-tl-none shadow-xs'
                        }`}>
                          <p>{m.text}</p>
                          <span className={`block text-[8px] mt-1.5 text-right ${m.sender === 'user' ? 'text-slate-950/60' : 'text-slate-400'}`}>{m.time}</span>
                        </div>
                      ))}
                    </div>

                    {/* Message typing reply form */}
                    {selectedTicket.status === 'open' ? (
                      <form onSubmit={handleSendTicketReply} className="flex gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                        <input 
                          type="text" 
                          value={ticketReplyText}
                          onChange={(e) => setTicketReplyText(e.target.value)}
                          placeholder="Type reply to client agent..."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500"
                        />
                        <button type="submit" className="p-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md transition shrink-0">
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <div className="p-3 text-center text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-850 rounded-xl">
                        This support ticket is closed. Open a new ticket if issue persists.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-24 text-center text-slate-400 text-xs font-bold">Select a support ticket from left side panel, or open a new help request ticket.</div>
                )}

              </div>

            </div>
          )}

          {/* MULTI-LANGUAGE & LOCALIZATION HUB */}
          {activeTab === 'language_settings' && (
            <LanguageSettingsTab />
          )}

          {/* MULTI-CURRENCY & GLOBAL EXCHANGE HUB */}
          {activeTab === 'currency_settings' && (
            <CurrencySettingsTab />
          )}

          {/* ROLES & PERMISSIONS HUB */}
          {activeTab === 'roles_permissions' && (
            <RolesPermissionsHub />
          )}

          {/* 9. ACCOUNT SECURITY CENTER & LOGS */}
          {activeTab === 'security' && (
            <div className="space-y-6">

              {/* BIOMETRIC & FINGERPRINT SECURITY CARD */}
              <div className="bg-gradient-to-r from-cyan-950/20 via-slate-900 to-slate-950 p-5 rounded-2xl border border-cyan-500/30 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                      <Fingerprint className="w-7 h-7 animate-pulse text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-sm text-white uppercase tracking-wider">
                          {language === 'bn' ? 'বায়োমেট্রিক ফিঙ্গারপ্রিন্ট নিরাপত্তা' : 'Biometric Fingerprint Authentication'}
                        </h4>
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[9px] font-black rounded-md uppercase border border-cyan-500/30">
                          {isBiometricSupported() ? 'Hardware Supported' : 'Simulated Ready'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed max-w-2xl">
                        {language === 'bn' 
                          ? 'আপনার ডিভাইসের বিল্ট-ইন ফিঙ্গারপ্রিন্ট সেন্সর (TouchID, Windows Hello, Android Biometric) দিয়ে সরাসরি তাৎক্ষণিক লগইন করুন। পাসওয়ার্ড মনে রাখার ঝামেলা নেই।'
                          : 'Use your device built-in hardware biometric sensor (TouchID, Windows Hello, Android Fingerprint) for 1-touch instant authentication without typing passwords.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        const newState = !biometricActive;
                        setBiometricActive(newState);
                        setBiometricEnabled(newState);
                        if (newState && currentUser) {
                          registerDeviceBiometrics(currentUser);
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        biometricActive ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          biometricActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-black text-slate-300">
                      {biometricActive ? (language === 'bn' ? 'সক্রিয়' : 'Enabled') : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled')}
                    </span>
                  </div>
                </div>

                {biometricFeedback && (
                  <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-xs font-bold text-cyan-300 flex items-center space-x-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{biometricFeedback}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-slate-400 font-bold">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>
                      {language === 'bn' ? 'ডিভাইস সেন্সর স্ট্যাটাস:' : 'Sensor Status:'} <strong className="text-white">Active & Calibrated</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={handleOpenBiometricEnrollment}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Fingerprint className="w-4 h-4 text-cyan-400" />
                      <span>{language === 'bn' ? 'নতুন ফিঙ্গারপ্রিন্ট সেটআপ করুন' : 'Setup/Enroll Fingerprint'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenBiometricTest}
                      className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-lg shadow-cyan-600/20 transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'লাইভ স্ক্যান টেস্ট করুন' : 'Test Live Scan'}</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Change Password Form */}
                <div className="md:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-4">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Security Password'}</h4>
                  
                  <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs font-bold">
                    <div className="space-y-1">
                      <label className="text-slate-500 block">Current Password</label>
                      <input 
                        type="password" 
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 block">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 block">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 focus:outline-none"
                        required
                      />
                    </div>

                    <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-black rounded-xl transition">
                      Update Security Password
                    </button>
                  </form>
                </div>

                {/* Account details & Danger Zone */}
                <div className="md:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-4">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'বিপদ অঞ্চল (Danger Zone)' : 'Danger Zone'}</h4>
                  <p className="text-xs text-slate-400">Deleting your customer account will wipe out your wallet balance, reward points, vouchers, and active orders history. This action is completely irreversible.</p>

                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-3">
                    <span className="text-[10px] text-red-500 font-black block uppercase tracking-wider">CRITICAL ACTIONS</span>
                    
                    <button 
                      onClick={() => {
                        const confirmed = window.confirm('Are you absolutely sure you want to permanently delete your customer account? All your wallet balance will be lost.');
                        if (confirmed) {
                          setCurrentUser(null);
                          setActivePanel('customer');
                        }
                      }}
                      className="w-full py-2 bg-red-600 hover:bg-red-750 text-white font-black text-xs rounded-xl transition shadow-xs"
                    >
                      Permanently Delete Account
                    </button>
                  </div>
                </div>

              </div>

              {/* Login history logs */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">{language === 'bn' ? 'লগইন ইতিহাস' : 'Account Security Login Logs'}</h4>
                </div>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-white">IP: 103.88.134.12 • Dhaka, Bangladesh (Current Session)</p>
                      <span className="text-[10px] text-slate-400 block font-bold">Chrome Browser v127 • MacOS Sequoia</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 rounded text-[8px] uppercase">Active</span>
                  </div>
                  <div className="p-4 flex items-center justify-between text-slate-400">
                    <div>
                      <p className="font-bold">IP: 103.22.44.15 • Chittagong, Bangladesh</p>
                      <span className="text-[10px] block font-bold">Safari Browser v18 • iPhone 15 Pro Max • 2026-08-01 10:25</span>
                    </div>
                    <span className="text-[10px]">Logged out</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Biometric Enrollment & Test Modal */}
      <BiometricAuthModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        mode={biometricModalMode}
        targetRole="customer"
        userToRegister={currentUser || undefined}
        onSuccess={(user) => {
          setBiometricActive(true);
          setBiometricFeedback(language === 'bn' ? `ফিঙ্গারপ্রিন্ট ভেরিফিকেশন সফল! স্বাগতম ${user.name}` : `Biometric verified successfully! Welcome ${user.name}`);
          setShowBiometricModal(false);
        }}
      />
    </div>
  );
};
