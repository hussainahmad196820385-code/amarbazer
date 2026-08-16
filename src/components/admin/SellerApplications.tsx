import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, FileText, Camera, Store,
  ArrowRight, Landmark, CreditCard, ChevronDown, ChevronUp, RefreshCw, Eye, Search, AlertCircle,
  MessageSquare, Ban, Play, Trash2, X, AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SellerStore } from '../../types';

interface ConfirmDialogState {
  isOpen: boolean;
  type: 'approve' | 'reject' | 'suspend' | 'reactivate' | 'delete';
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  sellerId: string;
  onConfirm: () => Promise<void>;
}

export const SellerApplications: React.FC = () => {
  const { language } = useApp();
  const [sellersList, setSellersList] = useState<SellerStore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  // Warning and Actions State
  const [isWarnModalOpen, setIsWarnModalOpen] = useState<boolean>(false);
  const [selectedWarnSeller, setSelectedWarnSeller] = useState<SellerStore | null>(null);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [isSubmittingWarning, setIsSubmittingWarning] = useState<boolean>(false);
  const [updatingPhotoKey, setUpdatingPhotoKey] = useState<string | null>(null);

  // Custom Toast and Custom Confirmation states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [isActionExecuting, setIsActionExecuting] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleAdminPhotoUpload = async (sellerId: string, fieldKey: string, file: File) => {
    try {
      setUpdatingPhotoKey(`${sellerId}-${fieldKey}`);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        await api.updateSeller(sellerId, { [fieldKey]: base64Data });
        showToast(language === 'bn' ? 'ফাইলটি সফলভাবে আপলোড করা হয়েছে!' : 'File uploaded successfully!', 'success');
        fetchApplications();
        setUpdatingPhotoKey(null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      showToast(language === 'bn' ? 'আপলোড ব্যর্থ হয়েছে।' : 'Upload failed.', 'error');
      setUpdatingPhotoKey(null);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSellers();
      setSellersList(data);
    } catch (err) {
      console.error(err);
      setError(language === 'bn' ? 'তথ্য লোড করতে সমস্যা হয়েছে' : 'Failed to fetch seller applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'approve',
      titleEn: 'Approve & Activate Shop',
      titleBn: 'আবেদন অনুমোদন ও সক্রিয়করণ',
      messageEn: 'Are you sure you want to approve this merchant application? This will activate their store and allow them to log in.',
      messageBn: 'আপনি কি এই মার্চেন্ট আবেদনটি অনুমোদন ও সক্রিয় করতে চান? এটি দোকানটি সক্রিয় করবে এবং তাদের লগইন করার অনুমতি দেবে।',
      sellerId: id,
      onConfirm: async () => {
        try {
          setIsActionExecuting(true);
          await api.approveSeller(id);
          showToast(language === 'bn' ? 'আবেদন সফলভাবে অনুমোদিত হয়েছে!' : 'Application approved successfully!', 'success');
          fetchApplications();
          setActiveTab('approved');
        } catch (err) {
          console.error(err);
          showToast(language === 'bn' ? 'অনুমোদন ব্যর্থ হয়েছে' : 'Failed to approve application', 'error');
        } finally {
          setIsActionExecuting(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleReject = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'reject',
      titleEn: 'Decline & Delete Application',
      titleBn: 'আবেদন প্রত্যাখ্যান ও মুছে ফেলুন',
      messageEn: 'Are you sure you want to reject and permanently delete this pending application from the database?',
      messageBn: 'আপনি কি নিশ্চিত যে এই পেন্ডিং আবেদনটি প্রত্যাখ্যান এবং ডাটাবেজ থেকে চিরতরে মুছে ফেলতে চান?',
      sellerId: id,
      onConfirm: async () => {
        try {
          setIsActionExecuting(true);
          await api.deleteSeller(id);
          showToast(language === 'bn' ? 'আবেদন প্রত্যাখ্যান এবং মুছে ফেলা হয়েছে!' : 'Application rejected and permanently deleted successfully!', 'success');
          fetchApplications();
        } catch (err) {
          console.error(err);
          showToast(language === 'bn' ? 'আবেদন প্রত্যাখ্যান করতে সমস্যা হয়েছে' : 'Failed to reject application', 'error');
        } finally {
          setIsActionExecuting(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleToggleSuspension = (seller: SellerStore) => {
    const newStatus = seller.subscriptionStatus === 'suspended' ? 'active' : 'suspended';
    setConfirmDialog({
      isOpen: true,
      type: newStatus === 'suspended' ? 'suspend' : 'reactivate',
      titleEn: newStatus === 'suspended' ? 'Suspend Merchant Account' : 'Reactivate Merchant Account',
      titleBn: newStatus === 'suspended' ? 'মার্চেন্ট অ্যাকাউন্ট স্থগিত করুন' : 'মার্চেন্ট অ্যাকাউন্ট সক্রিয় করুন',
      messageEn: newStatus === 'suspended'
        ? `Are you sure you want to suspend "${seller.storeName}"? They will not be able to sell products.`
        : `Are you sure you want to reactivate "${seller.storeName}"? They will be restored to active status.`,
      messageBn: newStatus === 'suspended'
        ? `আপনি কি নিশ্চিতভাবে "${seller.storeNameBn || seller.storeName}" স্টোরটি স্থগিত করতে চান?`
        : `আপনি কি নিশ্চিতভাবে "${seller.storeNameBn || seller.storeName}" স্টোরটি সক্রিয় করতে চান?`,
      sellerId: seller.id,
      onConfirm: async () => {
        try {
          setIsActionExecuting(true);
          await api.updateSubscription(seller.id, { status: newStatus });
          showToast(language === 'bn' ? 'মার্চেন্ট স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে!' : 'Merchant status updated successfully!', 'success');
          fetchApplications();
        } catch (err) {
          console.error(err);
          showToast(language === 'bn' ? 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে' : 'Failed to update merchant status', 'error');
        } finally {
          setIsActionExecuting(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleDeleteSeller = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      titleEn: 'Permanently Delete Merchant',
      titleBn: 'মার্চেন্ট অ্যাকাউন্ট চিরতরে মুছে ফেলুন',
      messageEn: 'Warning: This action is irreversible. Are you sure you want to permanently delete this merchant and all their store data?',
      messageBn: 'সতর্কতা: এই কাজটি আর ফেরত নেওয়া যাবে না। আপনি কি নিশ্চিত যে এই মার্চেন্ট অ্যাকাউন্ট এবং তাদের সমস্ত স্টোর ডেটা স্থায়ীভাবে মুছে ফেলতে চান?',
      sellerId: id,
      onConfirm: async () => {
        try {
          setIsActionExecuting(true);
          await api.deleteSeller(id);
          showToast(language === 'bn' ? 'মার্চেন্ট সফলভাবে মুছে ফেলা হয়েছে!' : 'Merchant permanently deleted successfully!', 'success');
          fetchApplications();
        } catch (err) {
          console.error(err);
          showToast(language === 'bn' ? 'মার্চেন্ট মুছে ফেলতে সমস্যা হয়েছে' : 'Failed to delete merchant', 'error');
        } finally {
          setIsActionExecuting(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleSendWarning = async () => {
    if (!selectedWarnSeller || !warningMessage.trim()) return;
    try {
      setIsSubmittingWarning(true);
      await api.warnSeller(selectedWarnSeller.id, warningMessage.trim());
      setIsWarnModalOpen(false);
      setWarningMessage('');
      setSelectedWarnSeller(null);
      showToast(language === 'bn' ? 'সতর্কবার্তা সফলভাবে পাঠানো হয়েছে!' : 'Warning message sent successfully!', 'success');
      fetchApplications();
    } catch (err) {
      console.error(err);
      showToast(language === 'bn' ? 'বার্তা পাঠাতে সমস্যা হয়েছে' : 'Failed to send warning message', 'error');
    } finally {
      setIsSubmittingWarning(false);
    }
  };

  // Filter sellers based on tab and query
  const filteredSellers = sellersList.filter(s => {
    const matchesTab = activeTab === 'pending' ? !s.isApproved : s.isApproved;
    const matchesQuery = s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (s.tradeLicenseNumber && s.tradeLicenseNumber.includes(searchQuery)) ||
                         (s.bkashNumber && s.bkashNumber.includes(searchQuery)) ||
                         (s.ownerFirstName && s.ownerFirstName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Header section with high visual design */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-400 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Authority'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif italic text-amber-50 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-white">
              {language === 'bn' ? 'মার্চেন্ট আবেদনপত্র যাচাইকরণ' : 'Merchant Applications Verification'}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {language === 'bn' 
                ? 'এনআইডি জালিয়াতি রোধে ডিজিটাল কমার্স নীতিমালা অনুযায়ী নিবন্ধিত বিক্রেতাদের বায়োমেট্রিক ফেস স্ক্যান, আইডি কার্ড এবং ট্রেড লাইসেন্স কঠোরভাবে যাচাই করুন।' 
                : 'Thoroughly audit biometric face captures, national identity cards, trade licenses, and merchant registration entries to prevent business fraud.'
              }
            </p>
          </div>

          <button 
            onClick={fetchApplications}
            disabled={loading}
            className="self-start md:self-auto flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl border border-slate-700/60 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'bn' ? 'রিলোড করুন' : 'Reload List'}</span>
          </button>
        </div>
      </div>

      {/* Tabs and search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>{language === 'bn' ? 'অপেক্ষমান আবেদনসমূহ' : 'Pending Applications'}</span>
            <span className={`px-1.5 py-0.5 text-[9px] font-black rounded ${
              activeTab === 'pending' ? 'bg-slate-950 text-amber-500' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {sellersList.filter(s => !s.isApproved).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>{language === 'bn' ? 'অনুমোদিত মার্চেন্ট' : 'Approved Merchants'}</span>
            <span className={`px-1.5 py-0.5 text-[9px] font-black rounded ${
              activeTab === 'approved' ? 'bg-slate-950 text-amber-500' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {sellersList.filter(s => s.isApproved).length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder={language === 'bn' ? 'দোকানের নাম, আইডি বা ফোন...' : 'Search by store name, ID, phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-hidden focus:border-amber-500 dark:focus:border-amber-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{language === 'bn' ? 'মার্চেন্ট ডেটা লোড করা হচ্ছে...' : 'Loading Applications...'}</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-600 mx-auto border border-slate-200/40 dark:border-slate-700/40">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
              {language === 'bn' ? 'কোনো আবেদন পাওয়া যায়নি' : 'No Applications Found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'এই ক্যাটাগরিতে বর্তমানে কোনো মার্চেন্ট নিবন্ধন বা অ্যাকাউন্ট আবেদন জমা নেই।'
                : 'There are currently no active merchant registration applications inside this folder.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSellers.map((seller) => {
            const isExpanded = expandedId === seller.id;

            const checkFields = [
              { key: 'ownerFirstName', labelEn: 'Owner First Name', labelBn: 'মালিকের নাম' },
              { key: 'storeName', labelEn: 'Store Name (Brand)', labelBn: 'দোকানের নাম' },
              { key: 'storeAddress', labelEn: 'Store Location', labelBn: 'দোকানের লোকেশন' },
              { key: 'bkashNumber', labelEn: 'bKash/Nagad Phone', labelBn: 'বিকাশ/নগদ নম্বর' },
              { key: 'nidNumber', labelEn: 'National ID (NID) Number', labelBn: 'এনআইডি নম্বর' },
              { key: 'tradeLicenseNumber', labelEn: 'Trade License ID', labelBn: 'ট্রেড লাইসেন্স আইডি' },
              { key: 'storeCategory', labelEn: 'Store Category', labelBn: 'স্টোর ক্যাটাগরি' },
              { key: 'ownerPhoto', labelEn: 'Owner Photo', labelBn: 'মালিকের ছবি' },
              { key: 'shopPhoto', labelEn: 'Shop Photo', labelBn: 'দোকানের ছবি' },
              { key: 'nidPhotoFront', labelEn: 'NID Photo Front', labelBn: 'এনআইডি ফ্রন্ট ছবি' },
              { key: 'nidPhotoBack', labelEn: 'NID Photo Back', labelBn: 'এনআইডি ব্যাক ছবি' },
              { key: 'shopLicensePhoto', labelEn: 'Shop License Photo', labelBn: 'লাইসেন্স কপি ছবি' }
            ];

            const filledCount = checkFields.filter(f => seller[f.key as keyof typeof seller] && typeof seller[f.key as keyof typeof seller] === 'string' && (seller[f.key as keyof typeof seller] as string).trim() !== '').length;
            const completionPercent = Math.round((filledCount / checkFields.length) * 100);
            const missingFields = checkFields.filter(f => !seller[f.key as keyof typeof seller] || typeof seller[f.key as keyof typeof seller] !== 'string' || (seller[f.key as keyof typeof seller] as string).trim() === '');
            
            return (
              <div 
                key={seller.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
              >
                {/* Header Summary Row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : seller.id)}
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition select-none"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-none">
                          {seller.storeNameBn && language === 'bn' ? seller.storeNameBn : seller.storeName}
                        </h3>
                        {seller.subscriptionPlan && (
                          <span className="px-2 py-0.5 text-[8px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-sm uppercase tracking-wide">
                            {seller.subscriptionPlan} Plan
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {language === 'bn' ? 'ট্রেড লাইসেন্স নম্বর:' : 'Trade License:'} <span className="font-bold text-slate-700 dark:text-slate-300">{seller.tradeLicenseNumber || 'N/A'}</span> • 
                        {language === 'bn' ? ' বিকাশ নম্বর:' : ' bKash:'} <span className="font-bold text-slate-700 dark:text-slate-300">{seller.bkashNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    {/* Inline Quick Action Buttons for Approved Merchants */}
                    {seller.isApproved && (
                      <div className="flex items-center space-x-1.5 mr-2">
                        {/* 1. Warn button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWarnSeller(seller);
                            setWarningMessage('');
                            setIsWarnModalOpen(true);
                          }}
                          title={language === 'bn' ? 'সতর্কবার্তা পাঠান (মেসেজ)' : 'Send Warning Message'}
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 rounded-lg transition border border-amber-500/20"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. Suspend/Reactivate button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSuspension(seller);
                          }}
                          title={seller.subscriptionStatus === 'suspended' ? (language === 'bn' ? 'সক্রিয় করুন' : 'Activate') : (language === 'bn' ? 'স্থগিত করুন' : 'Suspend')}
                          className={`p-1.5 rounded-lg transition border ${
                            seller.subscriptionStatus === 'suspended'
                              ? 'bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {seller.subscriptionStatus === 'suspended' ? <Play className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>

                        {/* 3. Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSeller(seller.id);
                          }}
                          title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete Merchant'}
                          className="p-1.5 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 rounded-lg transition border border-red-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Status badge */}
                    {seller.isApproved ? (
                      seller.subscriptionStatus === 'suspended' ? (
                        <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 font-bold rounded-xl text-[10px] flex items-center space-x-1 border border-rose-200/30">
                          <Ban className="w-3.5 h-3.5" />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold rounded-xl text-[10px] flex items-center space-x-1 border border-emerald-200/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      )
                    ) : (
                      <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold rounded-xl text-[10px] flex items-center space-x-1 border border-amber-500/20">
                        <Camera className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                        <span>Pending Review</span>
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 p-5 bg-slate-50/50 dark:bg-slate-950/20 space-y-6 animate-fadeIn">
                    
                    {/* Completion Progress and Missing Fields Panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 p-5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            {language === 'bn' ? 'অ্যাকাউন্ট প্রোফাইল সম্পন্নকরণ অগ্রগতি' : 'Account Profile Completion Progress'}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'bn' 
                              ? 'মার্চেন্ট প্রোফাইলের সকল প্রয়োজনীয় ও ঐচ্ছিক তথ্যের বিবরণী।' 
                              : 'Status list of all required and optional profile details.'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-amber-500">
                            {completionPercent}%
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                            {language === 'bn' ? 'সম্পন্ন হয়েছে' : 'Completed'}
                          </span>
                        </div>
                      </div>

                      {/* Thin long progress bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-150 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-200/30">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-black tracking-widest uppercase text-slate-400">
                          <span>{completionPercent}% {language === 'bn' ? 'পূর্ণ হয়েছে' : 'Filled'}</span>
                          <span>{100 - completionPercent}% {language === 'bn' ? 'বাকি আছে' : 'Remaining'}</span>
                        </div>
                      </div>

                      {/* Missing fields list in RED */}
                      {missingFields.length > 0 ? (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-2">
                            {language === 'bn' 
                              ? `⚠️ অনুপস্থিত তথ্যসমূহ (${missingFields.length}টি বাদ আছে - চাইলে পরবর্তীতে আপলোড করা যাবে)` 
                              : `⚠️ Missing Details (${missingFields.length} remaining - can be uploaded optionally later)`}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {missingFields.map((f) => (
                              <span 
                                key={f.key} 
                                className="px-2.5 py-1 bg-rose-500/10 dark:bg-rose-950/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                              >
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0" />
                                {language === 'bn' ? f.labelBn : f.labelEn}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-emerald-500 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {language === 'bn' ? 'অভিনন্দন! সব তথ্য সম্পূর্ণ রয়েছে।' : 'Excellent! All information is fully completed.'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Bento section 1: Owner and ID verification details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* Owner info */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {language === 'bn' ? '১. মালিকের বিবরণ' : '1. Owner Information'}
                        </span>
                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{language === 'bn' ? 'মালিকের নাম:' : 'Full Name:'}</span>
                            <span className={`text-xs font-extrabold ${seller.ownerFirstName ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400 font-black'}`}>
                              {seller.ownerFirstName ? `${seller.ownerFirstName} ${seller.ownerLastName || ''}` : (language === 'bn' ? 'মালিকের নাম দেওয়া হয়নি' : 'Not provided')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{language === 'bn' ? 'এনআইডি নম্বর:' : 'NID Card Number:'}</span>
                            <span className={`text-xs font-extrabold ${seller.nidNumber ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400 font-black'}`}>
                              {seller.nidNumber || (language === 'bn' ? 'এনআইডি দেওয়া হয়নি' : 'Not specified')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{language === 'bn' ? 'যোগদানের তারিখ:' : 'Application Date:'}</span>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                              {seller.joinDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {language === 'bn' ? '২. সাবস্ক্রিপশন ও পেমেন্ট' : '2. Subscription & Payment'}
                        </span>
                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{language === 'bn' ? 'নির্বাচিত প্ল্যান:' : 'Selected Plan:'}</span>
                            <span className="text-xs font-extrabold text-amber-500 uppercase">
                              {seller.subscriptionPlan || 'starter'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{language === 'bn' ? 'পরিশোধিত ফি:' : 'Fee Paid:'}</span>
                            <span className="text-xs font-extrabold text-slate-850 dark:text-slate-150">
                              {seller.subscriptionAmountPaid || 0} ৳ (bKash Mobile)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{language === 'bn' ? 'ট্রানজেকশন আইডি (TxnID):' : 'Transaction ID:'}</span>
                            <span className="text-xs font-mono font-bold text-slate-900 dark:text-emerald-400 break-all">
                              {(seller as any).subscriptionTxnId || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Financial/Payout numbers */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {language === 'bn' ? '৩. পেমেন্ট গ্রহণকারী হিসাব' : '3. Payout Details'}
                        </span>
                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{language === 'bn' ? 'মার্চেন্ট বিকাশ নম্বর:' : 'Merchant bKash:'}</span>
                            <span className="text-xs font-extrabold text-slate-850 dark:text-slate-150">
                              {seller.bkashNumber || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">{language === 'bn' ? 'ব্যাংক হিসাব বিবরণী:' : 'Bank Account Details:'}</span>
                            <span className={`text-xs font-extrabold ${seller.bankAccountDetails ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400 font-black'} block truncate`} title={seller.bankAccountDetails}>
                              {seller.bankAccountDetails || (language === 'bn' ? 'ব্যাংক হিসাব দেওয়া হয়নি (বিকাশ দিয়ে হবে)' : 'Not Provided (bKash payout only)')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Biometric Identity Face Match Box */}
                    {seller.facePhoto && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center space-x-3">
                        <div className="bg-emerald-500 text-slate-950 p-2 rounded-lg">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            {language === 'bn' ? 'বায়োমেট্রিক ফেস স্ক্যান সফল হয়েছে' : 'Biometric Face Verification Match Certificate'}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'bn' 
                              ? 'নিবন্ধনকালে গ্রাহক লাইভ ক্যামেরা ভেরিফিকেশন সম্পন্ন করেছেন। ম্যাচিং স্কোর এবং লাইভনেস চেক সম্পন্ন করা হয়েছে।' 
                              : 'Live capture of the store owner was matched successfully during the dynamic camera registration scan step.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bento section 2: Uploaded Verification Photos */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                        {language === 'bn' ? '৪. আপলোডকৃত ডক্যুমেন্ট ও ছবিসমূহ (ক্লিক করে জুম করুন)' : '4. Uploaded Verification Images (Click to inspect)'}
                      </span>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                        {[
                          { key: 'facePhoto', labelEn: 'Face Verification', labelBn: 'লাইভ ফেস স্ক্যান', isDynamic: true },
                          { key: 'ownerPhoto', labelEn: 'Owner Photo', labelBn: 'মালিকের ছবি', isDynamic: false },
                          { key: 'nidPhotoFront', labelEn: 'NID Card Front', labelBn: 'এনআইডি ফ্রন্ট ছবি', isDynamic: false },
                          { key: 'nidPhotoBack', labelEn: 'NID Card Back', labelBn: 'এনআইডি ব্যাক ছবি', isDynamic: false },
                          { key: 'shopLicensePhoto', labelEn: 'Trade License Copy', labelBn: 'ট্রেড লাইসেন্স কপি ছবি', isDynamic: false },
                          { key: 'shopPhoto', labelEn: 'Shop Front Photo', labelBn: 'দোকানের ছবি', isDynamic: false }
                        ].map((doc) => {
                          const val = (seller as any)[doc.key];
                          const isUpdating = updatingPhotoKey === `${seller.id}-${doc.key}`;

                          return (
                            <div key={doc.key} className="space-y-1 relative">
                              <span className="text-[9px] text-slate-400 font-bold block truncate">
                                {language === 'bn' ? doc.labelBn : doc.labelEn}
                              </span>
                              
                              {val ? (
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 group shadow-xs hover:border-amber-500 transition-all">
                                  <img 
                                    src={val} 
                                    alt={doc.labelEn} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                    referrerPolicy="no-referrer" 
                                  />
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedImageModal(val)}
                                      title={language === 'bn' ? 'বড় করে দেখুন' : 'Zoom In'}
                                      className="p-1.5 bg-white/10 hover:bg-white/30 text-white rounded-lg transition"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <label
                                      title={language === 'bn' ? 'ফাইল পরিবর্তন করুন' : 'Replace File'}
                                      className="p-1.5 bg-white/10 hover:bg-white/30 text-white rounded-lg transition cursor-pointer"
                                    >
                                      <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleAdminPhotoUpload(seller.id, doc.key, file);
                                        }}
                                      />
                                    </label>
                                  </div>
                                  {doc.isDynamic && (
                                    <span className="absolute bottom-1 right-1 bg-emerald-500 text-slate-950 text-[7px] font-black px-1 py-0.5 rounded uppercase">
                                      Dynamic Live
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="relative aspect-square rounded-xl bg-rose-500/5 dark:bg-rose-950/10 border border-dashed border-rose-300/60 dark:border-rose-900/40 hover:border-rose-400 dark:hover:border-rose-800 flex flex-col items-center justify-center p-2 text-center transition-all">
                                  {isUpdating ? (
                                    <RefreshCw className="w-5 h-5 text-rose-500 animate-spin" />
                                  ) : (
                                    <XCircle className="w-6 h-6 text-rose-500/80 mb-1" />
                                  )}
                                  <span className="text-[8px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider block leading-tight">
                                    {language === 'bn' ? 'আপলোড করা হয়নি' : 'Not Uploaded'}
                                  </span>
                                  <span className="text-[7px] text-slate-400 mt-0.5 mb-1.5 block">
                                    {language === 'bn' ? 'ঐচ্ছিক / বাকি আছে' : 'Optional / Missing'}
                                  </span>
                                  <label className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 text-[8px] font-black rounded-md cursor-pointer transition uppercase tracking-widest border border-rose-500/25">
                                    {language === 'bn' ? 'আপলোড করুন' : 'Upload'}
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleAdminPhotoUpload(seller.id, doc.key, file);
                                      }}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions and decision control bar */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200/55 dark:border-slate-800/80">
                      {!seller.isApproved && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReject(seller.id)}
                            className="px-4 py-2.5 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                          >
                            {language === 'bn' ? 'আবেদন প্রত্যাখ্যান' : 'Decline Application'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApprove(seller.id)}
                            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                            <span>{language === 'bn' ? 'অনুমোদন ও সক্রিয় করুন' : 'Approve & Activate Shop'}</span>
                          </button>
                        </>
                      )}

                      {seller.isApproved && (
                        <div className="flex flex-wrap items-center gap-3.5">
                          {/* 1. Send warning message */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWarnSeller(seller);
                              setWarningMessage('');
                              setIsWarnModalOpen(true);
                            }}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{language === 'bn' ? 'সতর্কবার্তা পাঠান' : 'Send Warning'}</span>
                          </button>

                          {/* 2. Suspend/Reactivate shop */}
                          <button
                            type="button"
                            onClick={() => handleToggleSuspension(seller)}
                            className={`px-4 py-2.5 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
                              seller.subscriptionStatus === 'suspended'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                                : 'bg-rose-600 hover:bg-rose-700 text-white border-transparent'
                            }`}
                          >
                            {seller.subscriptionStatus === 'suspended' ? (
                              <>
                                <Play className="w-4 h-4" />
                                <span>{language === 'bn' ? 'স্থগিতাদেশ প্রত্যাহার' : 'Reactivate Shop'}</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4" />
                                <span>{language === 'bn' ? 'অ্যাকাউন্ট স্থগিত করুন' : 'Suspend Shop'}</span>
                              </>
                            )}
                          </button>

                          {/* 3. Delete shop */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSeller(seller.id)}
                            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete Shop'}</span>
                          </button>

                          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-emerald-500 flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            <span className="text-xs font-black uppercase tracking-wider">
                              {seller.subscriptionStatus === 'suspended' 
                                ? (language === 'bn' ? 'স্থগিত মার্চেন্ট' : 'Suspended Merchant')
                                : (language === 'bn' ? 'মার্চেন্ট সক্রিয় ও অনুমোদিত' : 'Active & Approved')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image Inspection Overlay Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-xs">
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute -top-12 right-0 bg-white/15 hover:bg-white/30 text-white p-2 rounded-full transition cursor-pointer"
            >
              <XCircle className="w-7 h-7" />
            </button>
            <img 
              src={selectedImageModal} 
              alt="Verification Doc" 
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-slate-800" 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Admin Warning Message Composition Modal */}
      {isWarnModalOpen && selectedWarnSeller && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl border border-amber-500/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    {language === 'bn' ? 'সতর্কবার্তা কম্পোজ করুন' : 'Compose Warning Message'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {selectedWarnSeller.storeName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsWarnModalOpen(false);
                  setSelectedWarnSeller(null);
                  setWarningMessage('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Message Inputs */}
            <div className="space-y-3">
              <label className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                {language === 'bn' ? 'সতর্কবার্তার বিবরণ' : 'Warning details / Message'}
              </label>
              <textarea
                rows={4}
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: সম্মানিত মার্চেন্ট, আপনার পণ্য "আইফোন ১৪ প্রো" এর বিবরণটি সঠিক নয়। অনুগ্রহ করে সংশোধন করুন...'
                    : 'e.g., Dear Merchant, please make sure the brand name on your products is authentic or your account will face suspension...'
                }
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors resize-none leading-relaxed font-medium"
              />
              <p className="text-[10px] text-slate-400 leading-normal font-medium">
                {language === 'bn'
                  ? 'এই বার্তাটি সরাসরি সেলারের অ্যাকাউন্টের ড্যাশবোর্ডে "অফিসিয়াল সতর্কতা" ব্যানার হিসেবে প্রদর্শিত হবে।'
                  : 'This official warning will appear instantly at the top of the seller\'s store dashboard.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsWarnModalOpen(false);
                  setSelectedWarnSeller(null);
                  setWarningMessage('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wide transition cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={isSubmittingWarning || !warningMessage.trim()}
                onClick={handleSendWarning}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-50 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                {isSubmittingWarning ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <MessageSquare className="w-3.5 h-3.5" />
                )}
                <span>{language === 'bn' ? 'বার্তা পাঠান' : 'Send Warning'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[150] flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-xl border animate-slideUp text-xs font-bold ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
          ) : (
            <XCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            
            {/* Modal Header Icon & Details */}
            <div className="flex items-start space-x-3.5">
              <div className={`p-3 rounded-2xl border shrink-0 ${
                confirmDialog.type === 'approve' || confirmDialog.type === 'reactivate'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : confirmDialog.type === 'reject' || confirmDialog.type === 'delete'
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {confirmDialog.type === 'approve' || confirmDialog.type === 'reactivate' ? (
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                ) : confirmDialog.type === 'reject' || confirmDialog.type === 'delete' ? (
                  <Trash2 className="w-6 h-6 text-rose-500" />
                ) : (
                  <Ban className="w-6 h-6 text-amber-500" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">
                  {language === 'bn' ? confirmDialog.titleBn : confirmDialog.titleEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {language === 'bn' ? confirmDialog.messageBn : confirmDialog.messageEn}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isActionExecuting}
                onClick={() => setConfirmDialog(null)}
                className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wide transition cursor-pointer disabled:opacity-50"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={isActionExecuting}
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className={`px-5 py-2.5 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md cursor-pointer ${
                  confirmDialog.type === 'approve' || confirmDialog.type === 'reactivate'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isActionExecuting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin">
                  </div>
                ) : confirmDialog.type === 'approve' || confirmDialog.type === 'reactivate' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {isActionExecuting 
                    ? (language === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...')
                    : (confirmDialog.type === 'approve' 
                        ? (language === 'bn' ? 'অনুমোদন করুন' : 'Approve') 
                        : (confirmDialog.type === 'reject' 
                            ? (language === 'bn' ? 'প্রত্যাখ্যান করুন' : 'Decline') 
                            : (confirmDialog.type === 'suspend' 
                                ? (language === 'bn' ? 'স্থগিত করুন' : 'Suspend') 
                                : (language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm')
                              )
                          )
                      )
                  }
                </span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
