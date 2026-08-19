import React, { useState, useEffect } from 'react';
import { 
  Store, Package, ShoppingBag, DollarSign, Plus, Edit, Trash2, 
  CheckCircle, Clock, Truck, TrendingUp, AlertCircle, ArrowUpRight, 
  FileText, CreditCard, Building, Upload, X, Sliders, Settings,
  Lock, RefreshCw, ArrowLeft, ArrowRight, ClipboardList, Cloud, Database, Wifi,
  ExternalLink, ShieldCheck, Zap, Check, HardDrive, FolderOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { hasPermission } from '../../lib/permissions';
import { Product, Order, WithdrawalRequest, SellerStore } from '../../types';
import { getTranslation } from '../../translations';
import { StoreDirectory } from '../dashboard/StoreDirectory';
import { InventoryWorkspace } from '../dashboard/InventoryWorkspace';
import { SellerRolesPermissions } from './SellerRolesPermissions';
import { CloudFileManagerModal } from '../common/CloudFileManagerModal';
import { storageManager } from '../../lib/storageManager';

export const SellerDashboard: React.FC = () => {
  const { 
    currentUser, setCurrentUser, activeRole, language, products, categories, 
    refreshProducts, systemSettings, sellerActiveTab, setSellerActiveTab 
  } = useApp();

  const effectiveUser = currentUser?.role === 'customer' && activeRole !== 'customer' 
    ? { ...currentUser, role: activeRole } 
    : currentUser;

  const isStaff = currentUser?.isStaff === true;
  const staffPerms = currentUser?.staffPermissions || [];

  // Permissions for staff
  const canViewOverview = !isStaff || staffPerms.includes('finance_view') || staffPerms.includes('products_manage');
  const canViewProducts = !isStaff || staffPerms.includes('products_view') || staffPerms.includes('products_manage') || staffPerms.includes('products_add');
  const canManageProducts = !isStaff || staffPerms.includes('products_manage');
  const canAddProductsStaff = !isStaff || staffPerms.includes('products_add') || staffPerms.includes('products_manage');

  const canViewOrders = !isStaff || staffPerms.includes('orders_view') || staffPerms.includes('orders_process');
  const canProcessOrdersStaff = !isStaff || staffPerms.includes('orders_process');

  const canViewFinance = !isStaff || staffPerms.includes('finance_view') || staffPerms.includes('finance_withdraw');
  const canWithdrawFinance = !isStaff || staffPerms.includes('finance_withdraw');

  const canViewStoreDirectory = !isStaff || staffPerms.includes('store_view');
  const canManageInventoryWorkspace = !isStaff || staffPerms.includes('inventory_manage') || staffPerms.includes('products_manage');
  const canManageSettings = !isStaff || staffPerms.includes('settings_manage');

  const activeTab = sellerActiveTab;
  const setActiveTab = setSellerActiveTab;

  // Auto-switch to first authorized tab if current activeTab is not permitted for staff
  useEffect(() => {
    if (isStaff) {
      if (activeTab === 'roles_permissions' || activeTab === 'subscription') {
        if (canViewOrders) setActiveTab('orders');
        else if (canViewProducts) setActiveTab('products');
        else if (canViewStoreDirectory) setActiveTab('store_directory');
        else if (canManageInventoryWorkspace) setActiveTab('inventory_manager');
        else if (canManageSettings) setActiveTab('settings');
        else setActiveTab('orders');
      } else if (activeTab === 'overview' && !canViewOverview) {
        if (canViewOrders) setActiveTab('orders');
        else if (canViewProducts) setActiveTab('products');
        else if (canViewStoreDirectory) setActiveTab('store_directory');
        else if (canManageInventoryWorkspace) setActiveTab('inventory_manager');
        else if (canManageSettings) setActiveTab('settings');
      } else if (activeTab === 'products' && !canViewProducts) {
        if (canViewOrders) setActiveTab('orders');
        else if (canViewStoreDirectory) setActiveTab('store_directory');
        else if (canManageSettings) setActiveTab('settings');
      } else if (activeTab === 'orders' && !canViewOrders) {
        if (canViewProducts) setActiveTab('products');
        else if (canViewStoreDirectory) setActiveTab('store_directory');
        else if (canManageSettings) setActiveTab('settings');
      } else if (activeTab === 'settings' && !canManageSettings) {
        if (canViewOrders) setActiveTab('orders');
        else if (canViewProducts) setActiveTab('products');
      }
    }
  }, [isStaff, activeTab, staffPerms, canViewOverview, canViewProducts, canViewOrders, canViewStoreDirectory, canManageInventoryWorkspace, canManageSettings]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [storeInfo, setStoreInfo] = useState<SellerStore | null>(null);

  // New product form modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newStock, setNewStock] = useState('20');
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('Official BD');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');

  // Withdrawal modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState('01711223344');

  // Subscription simulated checkout state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<'starter' | 'business' | 'enterprise' | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [checkoutPhone, setCheckoutPhone] = useState('01700000000');
  const [checkoutOtp, setCheckoutOtp] = useState('123456');
  const [checkoutPin, setCheckoutPin] = useState('1234');
  const [checkoutStep, setCheckoutStep] = useState<'phone' | 'otp' | 'pin'>('phone');

  // Paywall simulated checkout state for expired subscriptions
  const [paywallPlan, setPaywallPlan] = useState<'starter' | 'business' | 'enterprise'>('starter');
  const [paywallMethod, setPaywallMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [paywallPhone, setPaywallPhone] = useState('');
  const [paywallOtp, setPaywallOtp] = useState('');
  const [paywallPin, setPaywallPin] = useState('');
  const [paywallStep, setPaywallStep] = useState<'plan' | 'gateway' | 'phone' | 'otp' | 'pin' | 'processing' | 'success'>('plan');
  const [paywallError, setPaywallError] = useState('');
  const [paywallTxnId, setPaywallTxnId] = useState('');

  // Edit product form modal state
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTitleBn, setEditTitleBn] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [editStock, setEditStock] = useState('20');
  const [editCategory, setEditCategory] = useState('');
  const [editBrand, setEditBrand] = useState('Official BD');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editQuality, setEditQuality] = useState('Premium'); // Premium, Standard, Normal, A-Grade, B-Grade
  const [editUnit, setEditUnit] = useState('Piece'); // Piece, Kg, Pack, Litre, Dozen
  const [editWarranty, setEditWarranty] = useState('No Warranty');

  // Additional fields for Add product
  const [newQuality, setNewQuality] = useState('Premium');
  const [newUnit, setNewUnit] = useState('Piece');
  const [newWarranty, setNewWarranty] = useState('No Warranty');

  // Variant Pricing & Bulk Offers (Add Product)
  const [newVariants, setNewVariants] = useState<{ name: string; options: string[] }[]>([]);
  const [newVariantPrices, setNewVariantPrices] = useState<Record<string, number>>({});
  const [newBulkOffers, setNewBulkOffers] = useState<{ minQuantity: number; discountPercent?: number; discountAmount?: number }[]>([]);
  const [newVarGroupName, setNewVarGroupName] = useState('');
  const [newVarOptionsInput, setNewVarOptionsInput] = useState('');

  // Variant Pricing & Bulk Offers (Edit Product)
  const [editVariants, setEditVariants] = useState<{ name: string; options: string[] }[]>([]);
  const [editVariantPrices, setEditVariantPrices] = useState<Record<string, number>>({});
  const [editBulkOffers, setEditBulkOffers] = useState<{ minQuantity: number; discountPercent?: number; discountAmount?: number }[]>([]);
  const [editVarGroupName, setEditVarGroupName] = useState('');
  const [editVarOptionsInput, setEditVarOptionsInput] = useState('');

  // Combo Pack feature states
  const [isNewCombo, setIsNewCombo] = useState(false);
  const [newComboItems, setNewComboItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [isEditCombo, setIsEditCombo] = useState(false);
  const [editComboItems, setEditComboItems] = useState<{ productId: string; quantity: number }[]>([]);

  // Store Settings states
  const [settingsStoreName, setSettingsStoreName] = useState('');
  const [settingsStoreNameBn, setSettingsStoreNameBn] = useState('');
  const [settingsBkashNumber, setSettingsBkashNumber] = useState('');
  const [settingsTradeLicense, setSettingsTradeLicense] = useState('');
  const [settingsLogoUrl, setSettingsLogoUrl] = useState('');
  const [settingsBannerUrl, setSettingsBannerUrl] = useState('');
  const [settingsDescription, setSettingsDescription] = useState('আমরা সেরা কোয়ালিটির পণ্য সবচেয়ে কম দামে সরবরাহ করি।');
  const [deliveryFeeInside, setDeliveryFeeInside] = useState('60');
  const [deliveryFeeOutside, setDeliveryFeeOutside] = useState('120');
  const [estimatedDelivery, setEstimatedDelivery] = useState('2-3 Days');
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Dynamic Cloud Storage states
  const [settingsStorageType, setSettingsStorageType] = useState<'central' | 'google_cloud' | 'firebase'>('central');
  const [settingsStorageCredentials, setSettingsStorageCredentials] = useState('');
  const [isTestingStorage, setIsTestingStorage] = useState(false);
  const [storageTestMessage, setStorageTestMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<'website' | 'cloud'>('website');

  const getSubscriptionDaysRemaining = (expiryDateStr?: string) => {
    if (!expiryDateStr || expiryDateStr === 'N/A') return 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(expiryDateStr);
      expiry.setHours(0, 0, 0, 0);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (e) {
      return 0;
    }
  };

  const getSubscriptionStartDate = (expiryDateStr?: string, startDateStr?: string) => {
    if (startDateStr && startDateStr !== 'N/A') return startDateStr;
    if (!expiryDateStr || expiryDateStr === 'N/A') return 'N/A';
    try {
      const expiry = new Date(expiryDateStr);
      expiry.setDate(expiry.getDate() - 30);
      return expiry.toISOString().split('T')[0];
    } catch (e) {
      return 'N/A';
    }
  };

  const getCloudStartDate = (expiryDateStr?: string) => {
    if (!expiryDateStr || expiryDateStr === 'N/A') return 'N/A';
    try {
      const expiry = new Date(expiryDateStr);
      expiry.setDate(expiry.getDate() - 30);
      return expiry.toISOString().split('T')[0];
    } catch (e) {
      return 'N/A';
    }
  };
  const [googleSetupModal, setGoogleSetupModal] = useState<{ isOpen: boolean; type: 'gcs' | 'firebase' | 'supabase' | 'mongodb' | 'postgres' | 'mysql' | 'dynamodb' | 'azuresql' | 'planetscale' | 'render' | 'railway' | 'cockroach' | 'aiven' }>({ isOpen: false, type: 'gcs' });

  // 🚀 New Smart Self-Service Database Connection states as requested by the user
  const [dbSetupStep, setDbSetupStep] = useState<'info' | 'configure' | 'connecting' | 'success'>('info');
  const [dbSetupGmail, setDbSetupGmail] = useState('');
  const [dbSetupPassword, setDbSetupPassword] = useState('');

  // Seller Password Change states
  const [sellerOldPassword, setSellerOldPassword] = useState('');
  const [sellerNewPassword, setSellerNewPassword] = useState('');
  const [sellerConfirmPassword, setSellerConfirmPassword] = useState('');
  const [sellerPassMsg, setSellerPassMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [sellerPassLoading, setSellerPassLoading] = useState(false);

  const handleSellerChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSellerPassMsg(null);

    if (!sellerNewPassword || sellerNewPassword.length < 4) {
      setSellerPassMsg({ success: false, text: language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!' : 'Password must be at least 4 characters!' });
      return;
    }
    if (sellerNewPassword !== sellerConfirmPassword) {
      setSellerPassMsg({ success: false, text: language === 'bn' ? 'নতুন পাসওয়ার্ড দুটি মিলছে না!' : 'New passwords do not match!' });
      return;
    }
    if (!currentUser?.id) return;

    setSellerPassLoading(true);
    try {
      const res = await api.changePassword({
        userId: currentUser.id,
        oldPassword: sellerOldPassword,
        newPassword: sellerNewPassword
      });
      if (res && res.user) {
        setCurrentUser({ ...currentUser, ...res.user, password: sellerNewPassword });
      }
      setSellerPassMsg({ 
        success: true, 
        text: language === 'bn' 
          ? 'সেলার পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন থেকে শুধুমাত্র নতুন পাসওয়ার্ড দিয়ে লগইন করা যাবে।' 
          : 'Seller password updated successfully! Only the new password will work for future logins.' 
      });
      setSellerOldPassword('');
      setSellerNewPassword('');
      setSellerConfirmPassword('');
    } catch (err: any) {
      setSellerPassMsg({ success: false, text: err.message || 'Failed to update password' });
    } finally {
      setSellerPassLoading(false);
    }
  };
  const [dbSetupDbName, setDbSetupDbName] = useState('');
  const [dbSetupMode, setDbSetupMode] = useState<'auto' | 'custom'>('auto');
  const [connectingProgress, setConnectingProgress] = useState(0);

  // 📦 Cloud Storage & Real File Manager States
  const [isStorageDetailOpen, setIsStorageDetailOpen] = useState(false);
  const [isStorageBillingOpen, setIsStorageBillingOpen] = useState(false);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [isCleaningStorage, setIsCleaningStorage] = useState(false);
  const [storageCleaned, setStorageCleaned] = useState(false);
  const [storageFiles, setStorageFiles] = useState(() => storageManager.getFiles(storeInfo?.id));

  // Refresh storage files when store changes or when modal updates
  const refreshStorageFiles = () => {
    const updated = storageManager.getFiles(storeInfo?.id);
    setStorageFiles(updated);
  };

  const isCloudActive = !!(storeInfo?.cloudSubscriptionPlan && storeInfo?.cloudSubscriptionPlan !== 'none' && storeInfo?.cloudSubscriptionStatus === 'active');
  const displayStorageTotal = isCloudActive ? 15 : 2;
  const storageStats = storageManager.calculateStats(storageFiles, displayStorageTotal);
  
  // Real percentage and readable format
  const displayPercentage = storageStats.percentage;
  const displayStorageUsed = storageStats.usedGb;

  const handleCleanUpStorageSpace = () => {
    setIsCleaningStorage(true);
    setTimeout(() => {
      setIsCleaningStorage(false);
      setStorageCleaned(true);
      refreshStorageFiles();
    }, 1500);
  };

  const getStorageLogo = (plan: string | undefined) => {
    const sizeClasses = "w-3.5 h-3.5 shrink-0";
    if (!plan || plan === 'none') {
      return <Database className={`${sizeClasses} text-slate-400 dark:text-slate-500`} />;
    }
    
    switch (plan) {
      case 'gcs_subscription':
        return (
          <svg className={sizeClasses} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#4285F4"/>
            <path d="M19.35 10.04c-.21 0-.41.03-.61.06C18.25 8.36 16.8 7 15 7c-1.38 0-2.57.78-3.16 1.93l-1.4-.7C11.19 6.85 13 5.5 15 5.5c2.31 0 4.26 1.55 4.85 3.7.17-.06.34-.11.5-.11 1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5H19v-1.5h.35c1.1 0 2-.9 2-2s-.9-2-2-2z" fill="#34A853"/>
          </svg>
        );
      case 'firebase_subscription':
        return (
          <svg className={sizeClasses} viewBox="0 0 116 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.6 130L51 51L18.4 17.5C17.2 16.3 15.1 16.8 14.6 18.5L0 118L11.6 130Z" fill="#FFC107"/>
            <path d="M51.3 51.4L11.6 130.3L64 159.2C65.5 160 67.3 160 68.8 159.2L116 130.3L101 22C100.5 20.3 98.4 19.8 97.2 21L51.3 51.4Z" fill="#F57C00"/>
            <path d="M51 51L11.6 130L11.7 130.2L51.3 51.4L51 51Z" fill="#FFA000"/>
            <path d="M58 0.4C56.6 -0.5 54.8 0.1 54.2 1.6L42 26.5L11.6 130L64 159.2C65.5 160 67.3 160 68.8 159.2L116 130L58 0.4Z" fill="#DD2C00"/>
          </svg>
        );
      case 'supabase_subscription':
        return (
          <svg className={sizeClasses} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.35 21l8.11-11.45a.75.75 0 00-.61-1.18H14.1l1.54-6.9a.75.75 0 00-1.29-.62L6.24 12.3a.75.75 0 00.61 1.18h6.75l-1.54 6.9a.75.75 0 001.29.62z" fill="#3ECF8E"/>
          </svg>
        );
      case 'mongodb_subscription':
        return (
          <svg className={sizeClasses} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.37 2C10.51 5.32 8.76 10.66 10.45 15.35c.78 2.16 2.38 4.29 2.38 4.29s1.6-2.13 2.38-4.29c1.69-4.69-.06-10.03-1.92-13.35-.11-.2-.31-.2-.42 0z" fill="#13AA52"/>
            <path d="M12.37 2c-.11-.2-.31-.2-.42 0-1.86 3.32-3.61 8.66-1.92 13.35.43 1.19 1.1 2.41 1.83 3.52V2z" fill="#118D4B"/>
            <path d="M12.37 19.64v3.36a.35.35 0 01-.69 0v-3.36c.21.14.47.14.69 0z" fill="#13AA52"/>
          </svg>
        );
      case 'postgres_subscription':
        return <Database className={`${sizeClasses} text-blue-500`} />;
      case 'mysql_subscription':
        return <Database className={`${sizeClasses} text-cyan-500`} />;
      case 'dynamodb_subscription':
        return <Database className={`${sizeClasses} text-orange-500`} />;
      case 'azuresql_subscription':
        return <Database className={`${sizeClasses} text-blue-400`} />;
      case 'planetscale_subscription':
        return <Database className={`${sizeClasses} text-slate-800 dark:text-white`} />;
      default:
        return <Cloud className={`${sizeClasses} text-indigo-500`} />;
    }
  };

  const handleActivateCloudDirectly = async (type: 'gcs_subscription' | 'firebase_subscription' | 'supabase_subscription' | 'mongodb_subscription' | 'postgres_subscription' | 'mysql_subscription' | 'dynamodb_subscription' | 'azuresql_subscription' | 'planetscale_subscription' | 'render_subscription' | 'railway_subscription' | 'cockroach_subscription' | 'aiven_subscription') => {
    // Transition directly to the smart configuration wizard
    setDbSetupGmail(currentUser?.email || '');
    setDbSetupDbName(`amarbazar_db_${currentUser?.id || 'shop'}`);
    setDbSetupPassword('');
    setDbSetupMode('auto');
    setDbSetupStep('configure');
  };

  const handleCompleteDatabaseConnection = async (type: string) => {
    if (!storeInfo) return;
    setDbSetupStep('connecting');
    setConnectingProgress(5);

    // Simulate real-time connection, migration, schema deployment and validation progress
    const interval = setInterval(() => {
      setConnectingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 450);

    // After animation, complete the backend registration
    setTimeout(async () => {
      try {
        const customCreds = JSON.stringify({
          configured_with: dbSetupGmail,
          database_name: dbSetupDbName,
          connection_mode: dbSetupMode,
          setup_date: new Date().toISOString(),
          status: 'verified_and_live'
        }, null, 2);

        const updatedStore = await api.purchaseSubscription(storeInfo.id, {
          plan: type as any,
          amountPaid: 0,
          paymentMethod: 'google_console',
          txnId: `GCP-${Date.now()}`
        });

        // Also update store settings storage to point to this new config
        const finalStore = await api.updateSeller(storeInfo.id, {
          ...updatedStore,
          storageType: type.includes('gcs') ? 'google_cloud' : (type.includes('firebase') ? 'firebase' : 'central'),
          storageCredentials: customCreds
        });

        setStoreInfo(finalStore);
        setDbSetupStep('success');
      } catch (e) {
        clearInterval(interval);
        setDbSetupStep('configure');
        alert(language === 'bn' ? 'ডাটাবেজ কানেক্ট করতে ব্যর্থ হয়েছে!' : 'Failed to establish database connection!');
      }
    }, 3200);
  };

  // Sync Store Settings State when storeInfo loads
  useEffect(() => {
    if (storeInfo) {
      setSettingsStoreName(storeInfo.storeName || '');
      setSettingsStoreNameBn(storeInfo.storeNameBn || storeInfo.storeName || '');
      setSettingsBkashNumber(storeInfo.bkashNumber || '');
      setSettingsTradeLicense(storeInfo.tradeLicenseNumber || '');
      setSettingsLogoUrl(storeInfo.logoUrl || '');
      setSettingsBannerUrl(storeInfo.bannerUrl || '');
      setSettingsStorageType(storeInfo.storageType || 'central');
      setSettingsStorageCredentials(storeInfo.storageCredentials || '');
    }
  }, [storeInfo]);

  const sellerId = currentUser?.id || 'usr-seller-1';

  const fetchData = async () => {
    try {
      const sellersList = await api.getSellers();
      // Find the store belonging to this logged-in user
      const currentS = sellersList.find(s => s.sellerId === sellerId) || sellersList[0];
      setStoreInfo(currentS);

      if (currentS) {
        const allProds = await api.getProducts({ sellerId: currentS.id });
        setSellerProducts(allProds);

        const allOrds = await api.getOrders({ sellerId: currentS.id });
        setSellerOrders(allOrds);

        const allWithdraw = await api.getWithdrawals(currentS.id);
        setWithdrawals(allWithdraw);
      }
    } catch (err) {
      console.log('Error loading seller data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [sellerId]);

  const isSubscriptionActive = !!(storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active');

  const checkSubscriptionAndAdd = () => {
    if (isStaff && !canAddProductsStaff) {
      alert(language === 'bn' 
        ? 'দুঃখিত, আপনার নতুন পণ্য যোগ করার পারমিশন নেই!' 
        : 'Access Denied: You do not have permission to add new products!');
      return;
    }
    if (storeInfo?.subscriptionStatus === 'suspended') {
      alert(language === 'bn'
        ? 'আপনার মার্চেন্ট অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে! নতুন পণ্য যোগ করা সম্ভব নয়।'
        : 'Your merchant account has been temporarily suspended! You cannot add new products.'
      );
      return;
    }
    if (!isSubscriptionActive) {
      alert(language === 'bn' 
        ? 'আপনার সাবস্ক্রিপশনটি নিষ্ক্রিয় বা মেয়াদ উত্তীর্ণ হয়ে গেছে! পণ্য যোগ করতে অনুগ্রহ করে সাবস্ক্রিপশন রিনিউ করুন।' 
        : 'Your subscription is inactive or has expired! Please renew or upgrade your subscription from the "My Subscription" tab to add products.'
      );
      setActiveTab('subscription');
      return;
    }
    setIsAddProductOpen(true);
  };

  const handleConfirmSubscriptionPayment = async () => {
    if (!selectedCheckoutPlan || !storeInfo) return;
    let price = systemSettings.starterPrice ?? 500;
    if (selectedCheckoutPlan === 'business') price = systemSettings.businessPrice ?? 1500;
    if (selectedCheckoutPlan === 'enterprise') price = systemSettings.enterprisePrice ?? 3000;
    if (selectedCheckoutPlan === 'gcs_subscription') price = 500;
    if (selectedCheckoutPlan === 'firebase_subscription') price = 300;

    try {
      const updatedStore = await api.purchaseSubscription(storeInfo.id, {
        plan: selectedCheckoutPlan,
        amountPaid: price,
        paymentMethod: checkoutMethod,
        txnId: `${checkoutMethod.toUpperCase()}${Math.floor(10000000 + Math.random() * 90000000)}`
      });
      setStoreInfo(updatedStore);
      setIsCheckoutModalOpen(false);
      alert(language === 'bn'
        ? 'আপনার সাবস্ক্রিপশন প্ল্যান সফলভাবে সক্রিয় করা হয়েছে!'
        : 'Your subscription plan has been activated successfully!'
      );
      fetchData();
    } catch (err) {
      alert('Subscription activation failed');
    }
  };

  const handlePaywallConfirmPayment = async () => {
    if (!storeInfo) return;
    setPaywallError('');
    setPaywallStep('processing');

    let price = systemSettings.starterPrice ?? 500;
    if (paywallPlan === 'business') price = systemSettings.businessPrice ?? 1500;
    if (paywallPlan === 'enterprise') price = systemSettings.enterprisePrice ?? 3000;

    const genTxnId = `${paywallMethod.toUpperCase()}${Math.floor(10000000 + Math.random() * 90000000)}`;
    setPaywallTxnId(genTxnId);

    setTimeout(async () => {
      try {
        const updatedStore = await api.purchaseSubscription(storeInfo.id, {
          plan: paywallPlan,
          amountPaid: price,
          paymentMethod: paywallMethod,
          txnId: genTxnId
        });
        setStoreInfo(updatedStore);
        setPaywallStep('success');
        fetchData();
      } catch (err) {
        setPaywallError(language === 'bn' ? 'পেমেন্ট রিনিউয়াল ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Payment renewal failed. Please try again.');
        setPaywallStep('pin');
      }
    }, 2500);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !storeInfo) return;

    try {
      await api.createProduct({
        title: newTitle,
        titleBn: newTitleBn || newTitle,
        price: Number(newPrice),
        discountPrice: newDiscount ? Number(newDiscount) : undefined,
        stock: Number(newStock),
        categoryId: newCategory || categories[0]?.id,
        categoryName: categories.find(c => c.id === newCategory)?.name || 'General',
        brand: newBrand,
        description: newDesc || 'High quality product from verified seller.',
        sellerId: storeInfo.id,
        sellerName: storeInfo.storeName || 'Dhaka Tech Store',
        images: [newImage],
        warranty: newWarranty,
        isCombo: isNewCombo,
        comboItems: isNewCombo ? newComboItems : [],
        variants: newVariants.map((v, idx) => ({ id: `v-${Date.now()}-${idx}`, name: v.name, options: v.options })),
        variantPrices: newVariantPrices,
        bulkOffers: newBulkOffers,
        isApproved: true,
        customSpecs: [
          { label: 'Quality', labelBn: 'কোয়ালিটি', value: newQuality, valueBn: newQuality === 'Premium' ? 'প্রিমিয়াম' : newQuality === 'Standard' ? 'স্ট্যান্ডার্ড' : 'বাজেট' },
          { label: 'Unit', labelBn: 'একক', value: newUnit, valueBn: newUnit === 'Piece' ? 'টি' : newUnit === 'Kg' ? 'কেজি' : 'বক্স' }
        ]
      });

      setIsAddProductOpen(false);
      setNewTitle('');
      setNewTitleBn('');
      setNewPrice('');
      setNewDiscount('');
      setNewStock('20');
      setNewBrand('Official BD');
      setNewDesc('');
      setNewQuality('Premium');
      setNewUnit('Piece');
      setNewWarranty('No Warranty');
      setNewVariants([]);
      setNewVariantPrices({});
      setNewBulkOffers([]);
      setIsNewCombo(false);
      setNewComboItems([]);
      fetchData();
      refreshProducts();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const handleOpenEditModal = (p: Product) => {
    if (isStaff && !canManageProducts) {
      alert(language === 'bn' 
        ? 'দুঃখিত, আপনার পণ্য এডিট বা পরিবর্তন করার পারমিশন নেই!' 
        : 'Access Denied: You do not have permission to edit products!');
      return;
    }
    setEditingProduct(p);
    setEditTitle(p.title);
    setEditTitleBn(p.titleBn || p.title);
    setEditPrice(String(p.price));
    setEditDiscount(p.discountPrice ? String(p.discountPrice) : '');
    setEditStock(String(p.stock));
    setEditCategory(p.categoryId);
    setEditBrand(p.brand || 'Official');
    setEditDesc(p.description || '');
    setEditImage(p.images[0] || '');
    setEditWarranty(p.warranty || 'No Warranty');
    setEditVariants(p.variants || []);
    setEditVariantPrices(p.variantPrices || {});
    setEditBulkOffers(p.bulkOffers || []);
    
    const qualSpec = p.customSpecs?.find(s => s.label === 'Quality' || s.label === 'কোয়ালিটি');
    setEditQuality(qualSpec?.value || 'Premium');
    
    const unitSpec = p.customSpecs?.find(s => s.label === 'Unit' || s.label === 'একক');
    setEditUnit(unitSpec?.value || 'Piece');
    
    setIsEditCombo(!!p.isCombo);
    setEditComboItems(p.comboItems || []);
    setIsEditProductOpen(true);
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStaff && !canManageProducts) {
      alert(language === 'bn' ? 'দুঃখিত, আপনার পণ্য আপডেট করার পারমিশন নেই!' : 'Access Denied: You do not have permission to update products!');
      return;
    }
    if (!editingProduct || !editTitle || !editPrice) return;

    try {
      await api.updateProduct(editingProduct.id, {
        title: editTitle,
        titleBn: editTitleBn || editTitle,
        price: Number(editPrice),
        discountPrice: editDiscount ? Number(editDiscount) : undefined,
        stock: Number(editStock),
        categoryId: editCategory || categories[0]?.id,
        categoryName: categories.find(c => c.id === editCategory)?.name || 'General',
        brand: editBrand,
        description: editDesc,
        images: [editImage],
        warranty: editWarranty,
        isCombo: isEditCombo,
        comboItems: isEditCombo ? editComboItems : [],
        variants: editVariants,
        variantPrices: editVariantPrices,
        bulkOffers: editBulkOffers,
        customSpecs: [
          { label: 'Quality', labelBn: 'কোয়ালিটি', value: editQuality, valueBn: editQuality === 'Premium' ? 'প্রিমিয়াম' : editQuality === 'Standard' ? 'স্ট্যান্ডার্ড' : 'বাজেট' },
          { label: 'Unit', labelBn: 'একক', value: editUnit, valueBn: editUnit === 'Piece' ? 'টি' : editUnit === 'Kg' ? 'কেজি' : 'বক্স' }
        ]
      });

      setIsEditProductOpen(false);
      setEditingProduct(null);
      setIsEditCombo(false);
      setEditComboItems([]);
      setEditVariants([]);
      setEditVariantPrices({});
      setEditBulkOffers([]);
      alert(language === 'bn' ? 'পণ্য সফলভাবে আপডেট করা হয়েছে!' : 'Product updated successfully!');
      fetchData();
      refreshProducts();
    } catch (err) {
      alert('Failed to update product');
    }
  };

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStaff && !canManageSettings) {
      alert(language === 'bn' ? 'দুঃখিত, আপনার স্টোর সেটিংস পরিবর্তনের পারমিশন নেই!' : 'Access Denied: You do not have permission to change store settings!');
      return;
    }
    if (!storeInfo) return;
    try {
      const updated = await api.updateSeller(storeInfo.id, {
        storeName: settingsStoreName,
        storeNameBn: settingsStoreNameBn,
        logoUrl: settingsLogoUrl,
        bannerUrl: settingsBannerUrl,
        tradeLicenseNumber: settingsTradeLicense,
        bkashNumber: settingsBkashNumber,
        storageType: settingsStorageType,
        storageCredentials: settingsStorageCredentials
      });
      setStoreInfo(updated);
      alert(language === 'bn' ? 'স্টোর সেটিংস সফলভাবে আপডেট করা হয়েছে!' : 'Store settings updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update store settings');
    }
  };

  const handleTestStorageConnection = async () => {
    if (!storeInfo) return;
    setIsTestingStorage(true);
    setStorageTestMessage(null);
    try {
      const response = await fetch(`/api/sellers/${storeInfo.id}/test-storage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storageType: settingsStorageType,
          storageCredentials: settingsStorageCredentials
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStorageTestMessage({ success: true, text: data.message });
      } else {
        setStorageTestMessage({ success: false, text: data.message || 'Connection failed' });
      }
    } catch (err: any) {
      setStorageTestMessage({ success: false, text: err.message || 'Error connecting to test API' });
    } finally {
      setIsTestingStorage(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (isStaff && !canManageProducts) {
      alert(language === 'bn' 
        ? 'দুঃখিত, আপনার পণ্য ডিলিট করার পারমিশন নেই!' 
        : 'Access Denied: You do not have permission to delete products!');
      return;
    }
    if (confirm('Are you sure you want to delete this product listing?')) {
      await api.deleteProduct(id);
      fetchData();
      refreshProducts();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (isStaff && !canProcessOrdersStaff) {
      alert(language === 'bn' 
        ? 'দুঃখিত, আপনার অর্ডার কনফার্ম বা স্ট্যাটাস পরিবর্তনের পারমিশন নেই (শুধু দেখার অনুমোদন রয়েছে)!' 
        : 'Access Denied: You only have view permission for orders, not processing!');
      return;
    }
    await api.updateOrderStatus(orderId, status);
    fetchData();
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStaff && !canWithdrawFinance) {
      alert(language === 'bn' 
        ? 'দুঃখিত, আপনার টাকা উত্তোলনের (Withdrawal) পারমিশন নেই!' 
        : 'Access Denied: You do not have permission to request withdrawals!');
      return;
    }
    if (!storeInfo) return;
    try {
      await api.createWithdrawal({
        sellerId: storeInfo.id,
        sellerName: storeInfo.storeName || 'Dhaka Tech Store',
        amount: Number(withdrawAmount),
        method: withdrawMethod,
        accountNumber: withdrawAccount
      });
      setIsWithdrawModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Withdrawal request failed');
    }
  };

  const totalSalesRevenue = sellerOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  if (storeInfo && storeInfo.isApproved === false) {
    const renderPricingAndOffersConfig = (
    variants: typeof newVariants,
    setVariants: React.Dispatch<React.SetStateAction<typeof newVariants>>,
    prices: typeof newVariantPrices,
    setPrices: React.Dispatch<React.SetStateAction<typeof newVariantPrices>>,
    offers: typeof newBulkOffers,
    setOffers: React.Dispatch<React.SetStateAction<typeof newBulkOffers>>,
    groupName: string,
    setGroupName: React.Dispatch<React.SetStateAction<string>>,
    optionsInput: string,
    setOptionsInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const handleAddGroup = (presetType?: 'weight' | 'size' | 'color') => {
      let name = groupName.trim();
      let options: string[] = [];
      
      if (presetType === 'weight') {
        name = language === 'bn' ? 'ওজন' : 'Weight';
        options = ['250g', '500g', '1kg', '2kg'];
      } else if (presetType === 'size') {
        name = language === 'bn' ? 'সাইজ' : 'Size';
        options = ['S', 'M', 'L', 'XL', 'XXL'];
      } else if (presetType === 'color') {
        name = language === 'bn' ? 'রঙ' : 'Color';
        options = ['Red', 'Green', 'Blue'];
      }

      if (!name) return;
      if (variants.some(v => v.name.toLowerCase() === name.toLowerCase())) {
        alert(language === 'bn' ? 'এই ভেরিয়েন্ট গ্রুপটি ইতিমধ্যে যোগ করা হয়েছে!' : 'This variant group already exists!');
        return;
      }

      setVariants([...variants, { name, options }]);
      setGroupName('');
    };

    const handleRemoveGroup = (idx: number) => {
      const targetGroup = variants[idx];
      setVariants(variants.filter((_, i) => i !== idx));
      setPrices(prev => {
        const next = { ...prev };
        targetGroup.options.forEach(opt => {
          delete next[`${targetGroup.name}:${opt}`];
          delete next[opt];
        });
        return next;
      });
    };

    const handleAddOption = (groupIdx: number, optionVal: string) => {
      if (!optionVal.trim()) return;
      const updated = [...variants];
      if (updated[groupIdx].options.includes(optionVal.trim())) {
        alert(language === 'bn' ? 'এই অপশনটি ইতিমধ্যে বিদ্যমান!' : 'This option already exists!');
        return;
      }
      updated[groupIdx].options.push(optionVal.trim());
      setVariants(updated);
    };

    const handleRemoveOption = (groupIdx: number, optIdx: number) => {
      const group = variants[groupIdx];
      const optVal = group.options[optIdx];
      const updated = [...variants];
      updated[groupIdx].options = updated[groupIdx].options.filter((_, i) => i !== optIdx);
      setVariants(updated);
      
      setPrices(prev => {
        const next = { ...prev };
        delete next[`${group.name}:${optVal}`];
        delete next[optVal];
        return next;
      });
    };

    const handlePriceChange = (groupName: string, optionVal: string, value: number) => {
      setPrices(prev => ({
        ...prev,
        [`${groupName}:${optionVal}`]: value
      }));
    };

    const handleAddBulkOffer = (minQty: number, value: number, type: 'percent' | 'flat') => {
      if (minQty < 2 || value <= 0) return;
      if (offers.some(o => o.minQuantity === minQty)) {
        alert(language === 'bn' ? 'এই পরিমাণের জন্য ইতিমধ্যে একটি অফার রয়েছে!' : 'An offer for this quantity already exists!');
        return;
      }
      const newOffer = {
        minQuantity: minQty,
        discountPercent: type === 'percent' ? value : undefined,
        discountAmount: type === 'flat' ? value : undefined,
      };
      setOffers([...offers, newOffer].sort((a, b) => a.minQuantity - b.minQuantity));
    };

    const handleRemoveBulkOffer = (idx: number) => {
      setOffers(offers.filter((_, i) => i !== idx));
    };

    return (
      <div className="space-y-4 border border-slate-200 dark:border-slate-700/60 p-4 rounded-2xl bg-slate-50/40 dark:bg-slate-900/10">
        <div>
          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 block mb-1">
            {language === 'bn' ? '১. পণ্যের ভেরিয়েন্ট ও কাস্টম দাম নির্ধারণ' : '1. Product Variants & Custom Pricing'}
          </span>
          <span className="text-[10px] text-slate-400 block mb-3">
            {language === 'bn' ? 'বিভিন্ন ওজন, সাইজ বা রঙের জন্য আলাদা আলাদা দাম সেট করুন। সরাসরি লাইভ ক্রেতার কাছে আপডেট হবে।' : 'Set specific prices for weight/size/color options. It updates live for customers.'}
          </span>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10px] font-bold text-slate-400 flex items-center shrink-0">
              {language === 'bn' ? 'প্রিসেট যোগ করুন:' : 'Add Preset:'}
            </span>
            <button
              type="button"
              onClick={() => handleAddGroup('weight')}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-lg text-[10px] transition"
            >
              Weight / ওজন (250g, 500g...)
            </button>
            <button
              type="button"
              onClick={() => handleAddGroup('size')}
              className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-[10px] transition"
            >
              Size / সাইজ (S, M, L...)
            </button>
            <button
              type="button"
              onClick={() => handleAddGroup('color')}
              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg text-[10px] transition"
            >
              Color / রঙ (Red, Blue...)
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: স্টোরেজ, ধারণক্ষমতা' : 'e.g. Storage, Capacity'}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 px-3 py-1.5 border rounded-xl bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddGroup()}
              className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
            >
              {language === 'bn' ? 'গ্রুপ তৈরি করুন' : 'Create Group'}
            </button>
          </div>

          {variants.length > 0 && (
            <div className="space-y-4">
              {variants.map((group, groupIdx) => (
                <div key={groupIdx} className="border border-slate-150 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      {group.name} {language === 'bn' ? 'গ্রুপ' : 'Group'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(groupIdx)}
                      className="text-red-500 hover:text-red-600 font-bold text-[10px]"
                    >
                      {language === 'bn' ? 'গ্রুপ মুছুন' : 'Delete Group'}
                    </button>
                  </div>

                  <div className="flex gap-2"
                    onClick={(e) => {
                      // Prevent form submission of outer main form if elements are clicked
                      e.stopPropagation();
                    }}
                  >
                    <input
                      type="text"
                      id={`opt-input-${groupIdx}`}
                      placeholder={language === 'bn' ? 'নতুন অপশন যোগ করুন (যেমন: 1kg বা XXL)' : 'Add option (e.g. 1kg or XXL)'}
                      className="flex-1 px-2.5 py-1 border rounded-lg bg-slate-50 dark:bg-slate-800 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value;
                          if (val) {
                            handleAddOption(groupIdx, val);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const input = document.getElementById(`opt-input-${groupIdx}`) as HTMLInputElement;
                        if (input && input.value) {
                          handleAddOption(groupIdx, input.value);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
                    >
                      + {language === 'bn' ? 'যুক্ত করুন' : 'Add'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {group.options.map((opt, optIdx) => {
                      const priceKey = `${group.name}:${opt}`;
                      const optPrice = prices[priceKey] || '';
                      
                      return (
                        <div key={optIdx} className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
                          <span className="font-bold text-xs text-slate-600 dark:text-slate-300 min-w-16 truncate">{opt}</span>
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-[10px] text-slate-400">৳</span>
                            <input
                              type="number"
                              placeholder={language === 'bn' ? 'দাম' : 'Price'}
                              value={optPrice}
                              onChange={(e) => handlePriceChange(group.name, opt, Number(e.target.value))}
                              className="w-full px-2 py-1 border rounded bg-white dark:bg-slate-900 text-xs font-mono font-bold text-emerald-600"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(groupIdx, optIdx)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700/60">
          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 block mb-1">
            {language === 'bn' ? '২. পাইকারি ও ডাবল দামের অফার নির্ধারণ (Bulk Offer)' : '2. Bulk Multi-Buy & Offer Pricing'}
          </span>
          <span className="text-[10px] text-slate-400 block mb-3">
            {language === 'bn' ? '২ বা তার বেশি পণ্য কিনলে কাস্টমারকে সরাসরি ছাড় বা অফার প্রাইজ দিন (রিয়েল মার্কেটের মত)।' : 'Offer custom incentives when customers purchase 2 or more of this item.'}
          </span>

          <div
            className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-xl shadow-xs"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">{language === 'bn' ? 'যদি' : 'Buy'}</span>
              <input
                type="number"
                id="bulk-min-qty"
                defaultValue="2"
                min="2"
                className="w-14 px-2 py-1 border rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold font-mono"
              />
              <span className="text-xs text-slate-500">{language === 'bn' ? 'টি নেয়' : 'or more'}</span>
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-32">
              <span className="text-xs text-slate-500">{language === 'bn' ? 'অফার' : 'Discount'}</span>
              <input
                type="number"
                id="bulk-disc-val"
                placeholder="10"
                className="w-16 px-2 py-1 border rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold font-mono text-amber-600"
              />
              <select
                id="bulk-disc-type"
                className="px-2 py-1 border rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                <option value="percent">% Off</option>
                <option value="flat">৳ Off</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                const minInput = document.getElementById('bulk-min-qty') as HTMLInputElement;
                const valInput = document.getElementById('bulk-disc-val') as HTMLInputElement;
                const typeSelect = document.getElementById('bulk-disc-type') as HTMLSelectElement;
                if (minInput && valInput && typeSelect) {
                  const minQty = Number(minInput.value);
                  const val = Number(valInput.value);
                  const type = typeSelect.value as 'percent' | 'flat';
                  if (minQty && val) {
                    handleAddBulkOffer(minQty, val, type);
                    valInput.value = '';
                  }
                }
              }}
              className="px-4 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs transition"
            >
              + {language === 'bn' ? 'অফার রুল যোগ করুন' : 'Add Rule'}
            </button>
          </div>

          {offers.length > 0 && (
            <div className="space-y-2 mt-3">
              {offers.map((offer, idx) => (
                <div key={idx} className="flex items-center justify-between bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>
                      {language === 'bn' 
                        ? `ন্যূনতম ২ বা তার বেশি অর্থাৎ ${offer.minQuantity} টি নিলে প্রতিটির উপর ${offer.discountPercent ? `${offer.discountPercent}%` : `${offer.discountAmount} ৳`} পাইকারি ছাড়!`
                        : `Buy ${offer.minQuantity} or more: Get ${offer.discountPercent ? `${offer.discountPercent}%` : `৳${offer.discountAmount}`} off per item!`
                      }
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBulkOffer(idx)}
                    className="text-red-500 hover:text-red-600 font-bold text-[10px]"
                  >
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-6 shadow-sm">
          <div className="relative inline-flex">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-20 animate-ping"></span>
            <div className="relative bg-amber-500 text-slate-950 p-4 rounded-full">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {language === 'bn' ? 'মার্চেন্ট আবেদনটি বর্তমানে যাচাইবাছাই করা হচ্ছে' : 'Merchant Application Under Review'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
              {language === 'bn' 
                ? 'আপনার দোকানের ভেরিফিকেশন তথ্য আমাদের অ্যাডমিন প্যানেলে সফলভাবে জমা হয়েছে। আমাদের টিম আপনার জাতীয় পরিচয়পত্র ও ট্রেড লাইসেন্স পর্যালোচনা করছে। সাধারণত ১২ থেকে ২৪ ঘণ্টার মধ্যে এটি সক্রিয় হয়ে যাবে।' 
                : 'Your merchant verification documents have been received successfully and are currently pending review by our administrator. This process typically takes 12-24 hours.'
              }
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-left border border-slate-100 dark:border-slate-800 space-y-3.5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'bn' ? 'জমা দেওয়া তথ্য' : 'Submitted Details'}</span>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold rounded text-[8px] uppercase tracking-wider">
                {language === 'bn' ? 'পর্যবেক্ষণাধীন' : 'Pending Verification'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">{language === 'bn' ? 'মালিকের প্রথম নাম' : 'Owner First Name'}</p>
                <p className="font-extrabold text-slate-700 dark:text-slate-300">{storeInfo.ownerFirstName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">{language === 'bn' ? 'মালিকের শেষ নাম' : 'Owner Last Name'}</p>
                <p className="font-extrabold text-slate-700 dark:text-slate-300">{storeInfo.ownerLastName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">{language === 'bn' ? 'দোকানের নাম' : 'Store Name'}</p>
                <p className="font-extrabold text-slate-700 dark:text-slate-300">{storeInfo.storeName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">{language === 'bn' ? 'জাতীয় পরিচয়পত্র নম্বর' : 'NID Number'}</p>
                <p className="font-extrabold text-slate-700 dark:text-slate-300">{storeInfo.nidNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">{language === 'bn' ? 'ট্রেড লাইসেন্স আইডি' : 'Trade License ID'}</p>
                <p className="font-extrabold text-slate-700 dark:text-slate-300">{storeInfo.tradeLicenseNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 text-[10px] uppercase font-bold mb-1.5">{language === 'bn' ? 'সংযুক্ত নথিপত্র ও ছবি' : 'Attached Scans & Documents'}</p>
              <div className="grid grid-cols-5 gap-2">
                {/* Owner Photo */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-1 text-center">
                  <p className="text-[7px] text-slate-400 truncate font-bold">Owner</p>
                  {storeInfo.ownerPhoto || storeInfo.logoUrl ? (
                    <img src={storeInfo.ownerPhoto || storeInfo.logoUrl} className="w-full h-8 object-cover rounded mt-1 border border-slate-100 dark:border-slate-850" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded mt-1"></div>
                  )}
                </div>
                {/* Shop Photo */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-1 text-center">
                  <p className="text-[7px] text-slate-400 truncate font-bold">Shop</p>
                  {storeInfo.shopPhoto || storeInfo.bannerUrl ? (
                    <img src={storeInfo.shopPhoto || storeInfo.bannerUrl} className="w-full h-8 object-cover rounded mt-1 border border-slate-100 dark:border-slate-850" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded mt-1"></div>
                  )}
                </div>
                {/* NID Front */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-1 text-center">
                  <p className="text-[7px] text-slate-400 truncate font-bold">NID Front</p>
                  {storeInfo.nidPhotoFront ? (
                    <img src={storeInfo.nidPhotoFront} className="w-full h-8 object-cover rounded mt-1 border border-slate-100 dark:border-slate-850" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded mt-1"></div>
                  )}
                </div>
                {/* NID Back */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-1 text-center">
                  <p className="text-[7px] text-slate-400 truncate font-bold">NID Back</p>
                  {storeInfo.nidPhotoBack ? (
                    <img src={storeInfo.nidPhotoBack} className="w-full h-8 object-cover rounded mt-1 border border-slate-100 dark:border-slate-850" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded mt-1"></div>
                  )}
                </div>
                {/* Trade License */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-1 text-center">
                  <p className="text-[7px] text-slate-400 truncate font-bold">License</p>
                  {storeInfo.shopLicensePhoto ? (
                    <img src={storeInfo.shopLicensePhoto} className="w-full h-8 object-cover rounded mt-1 border border-slate-100 dark:border-slate-850" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded mt-1"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-slate-400 text-[10px] leading-relaxed">
            {language === 'bn' 
              ? 'আমাদের সহায়তার জন্য যোগাযোগ করুন: support@amarbazar.com অথবা কল করুন +৮৮০ ৯৬১২-৩৪৫৬৭৮' 
              : 'Need assistance? Email us at support@amarbazar.com or call +880 9612-345678'
            }
          </div>
        </div>
      </div>
    );
  }

  if (storeInfo && storeInfo.subscriptionStatus === 'expired') {
    const plansDetails = {
      starter: { 
        name: 'Starter Plan (স্টার্টার)', 
        price: systemSettings.starterPrice ?? 500, 
        limit: `${systemSettings.starterProductLimit ?? 20} Products`, 
        commission: `${systemSettings.starterCommission ?? 5}%` 
      },
      business: { 
        name: 'Business Plan (বিজনেস)', 
        price: systemSettings.businessPrice ?? 1500, 
        limit: `${systemSettings.businessProductLimit ?? 100} Products`, 
        commission: `${systemSettings.businessCommission ?? 3}%` 
      },
      enterprise: { 
        name: 'Enterprise Plan (এন্টারপ্রাইজ)', 
        price: systemSettings.enterprisePrice ?? 3000, 
        limit: (systemSettings.enterpriseProductLimit ?? 999999) >= 999999 ? 'Unlimited Products' : `${systemSettings.enterpriseProductLimit} Products`, 
        commission: `${systemSettings.enterpriseCommission ?? 1}%` 
      }
    };
    const currentPrice = plansDetails[paywallPlan].price;

    return (
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 animate-fadeIn">
        {/* Banner Alert */}
        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex items-start space-x-4 shadow-sm">
          <div className="bg-rose-500 text-white p-3 rounded-xl shrink-0 flex items-center justify-center shadow-md shadow-rose-500/20">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide flex items-center">
              <span>{language === 'bn' ? 'মার্চেন্ট সাবস্ক্রিপশন মেয়াদোত্তীর্ণ!' : 'Merchant Subscription Expired!'}</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {language === 'bn'
                ? 'আপনার দোকানের সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে। আপনার পণ্যসমূহ ক্রেতাদের কাছে দৃশ্যমান রাখতে এবং ড্যাশবোর্ড সক্রিয় করতে অনুগ্রহ করে যেকোনো একটি প্ল্যান রিনিউ বা আপগ্রেড করুন।'
                : 'Your marketplace seller subscription has expired. Please choose a subscription tier below to renew or upgrade and instantly re-enable your seller dashboard.'}
            </p>
          </div>
        </div>

        {/* Payment Wizard */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Billing Summary Panel (Left Side on Desktop) */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-900/60 p-6 border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img
                  src={storeInfo.logoUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=200&q=80'}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-[150px]">{storeInfo.storeName}</h3>
                  <p className="text-[10px] text-slate-400 truncate">{storeInfo.tradeLicenseNumber}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {language === 'bn' ? 'অর্ডার সামারি' : 'Renewal Summary'}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">{language === 'bn' ? 'নির্বাচিত প্ল্যান:' : 'Selected Plan:'}</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize">{paywallPlan}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">{language === 'bn' ? 'পণ্য আপলোড সীমা:' : 'Product Limit:'}</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{plansDetails[paywallPlan].limit}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">{language === 'bn' ? 'মার্কেটপ্লেস কমিশন:' : 'Sales Commission:'}</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{plansDetails[paywallPlan].commission}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">{language === 'bn' ? 'মেয়াদ কাল:' : 'Validity:'}</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{language === 'bn' ? '৩০ দিন' : '30 Days'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'bn' ? 'সর্বমোট প্রদেয়' : 'Total Payable'}</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">৳{currentPrice.toLocaleString()}</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-normal">
                {language === 'bn' 
                  ? 'কোনো অতিরিক্ত চার্জ নেই। পেমেন্ট সম্পন্ন হওয়ার সাথে সাথে স্টোর ড্যাশবোর্ড চালু হবে।'
                  : 'Includes all taxes. No hidden charges. Auto-activates instantly upon verification.'}
              </p>
            </div>
          </div>

          {/* Payment Steps Gateway Interface (Right Side on Desktop) */}
          <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-center bg-white dark:bg-slate-800">
            {paywallError && (
              <div className="mb-4 p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-[11px] font-semibold">
                {paywallError}
              </div>
            )}

            {/* Step 1: PLAN SELECTOR */}
            {paywallStep === 'plan' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? '১. একটি সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন' : '1. Choose Your Subscription Tier'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'bn' ? 'আপনার প্রয়োজন অনুযায়ী প্ল্যানটি সিলেক্ট করুন:' : 'Select the best plan to restart your shop:'}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {Object.entries(plansDetails).map(([key, info]) => {
                    const isSelected = paywallPlan === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setPaywallPlan(key as any)}
                        className={`p-4 rounded-xl border-2 transition cursor-pointer relative flex justify-between items-center ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-emerald-500' : 'border-slate-300'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-xs capitalize">{info.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Limit: {info.limit} | {info.commission} Commission</p>
                          </div>
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">৳{info.price}</p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPaywallStep('gateway')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-md flex items-center justify-center space-x-1 text-xs cursor-pointer"
                >
                  <span>{language === 'bn' ? 'পেমেন্ট গেটওয়েতে যান' : 'Continue to Payment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: GATEWAY SELECTOR */}
            {paywallStep === 'gateway' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <button onClick={() => setPaywallStep('plan')} className="text-slate-400 hover:text-slate-600">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span>{language === 'bn' ? '২. পেমেন্ট পদ্ধতি সিলেক্ট করুন' : '2. Select Mobile Wallet (MFS)'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 pl-6">
                    {language === 'bn' ? 'নিরাপদ পেমেন্ট সম্পন্ন করতে মোবাইল ওয়ালেট নির্বাচন করুন:' : 'Choose a secure digital wallet for billing:'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => setPaywallMethod('bkash')}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer text-center space-y-2 ${
                      paywallMethod === 'bkash'
                        ? 'border-pink-500 bg-pink-500/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="mx-auto w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center font-mono font-black text-xs text-pink-600">
                      bK
                    </div>
                    <p className="font-extrabold text-[11px] text-slate-900 dark:text-white">bKash</p>
                  </div>

                  <div
                    onClick={() => setPaywallMethod('nagad')}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer text-center space-y-2 ${
                      paywallMethod === 'nagad'
                        ? 'border-orange-500 bg-orange-500/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="mx-auto w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-mono font-black text-xs text-orange-600">
                      NG
                    </div>
                    <p className="font-extrabold text-[11px] text-slate-900 dark:text-white">Nagad</p>
                  </div>

                  <div
                    onClick={() => setPaywallMethod('rocket')}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer text-center space-y-2 ${
                      paywallMethod === 'rocket'
                        ? 'border-indigo-500 bg-indigo-500/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="mx-auto w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-mono font-black text-xs text-indigo-600">
                      RK
                    </div>
                    <p className="font-extrabold text-[11px] text-slate-900 dark:text-white">Rocket</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPaywallPhone(storeInfo.bkashNumber || '');
                    setPaywallStep('phone');
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-md flex items-center justify-center space-x-1 text-xs cursor-pointer"
                >
                  <span>{language === 'bn' ? `৳${currentPrice} পরিশোধ করুন` : `Pay ৳${currentPrice}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 3: PHONE NUMBER INPUT */}
            {paywallStep === 'phone' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <button onClick={() => setPaywallStep('gateway')} className="text-slate-400 hover:text-slate-600">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="uppercase">{paywallMethod} Gateway Simulation</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 pl-6">
                    {language === 'bn' ? 'আপনার ১১ ডিজিটের ওয়ালেট নম্বরটি লিখুন:' : 'Enter your 11-digit wallet mobile number:'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center space-y-4">
                  <div className="inline-block bg-white text-emerald-600 font-mono font-black border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] uppercase">
                    Secure Sandbox Gateway
                  </div>
                  <div>
                    <input
                      type="text"
                      value={paywallPhone}
                      onChange={(e) => setPaywallPhone(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full text-center px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400">
                    {language === 'bn' ? 'অ্যাকাউন্টে কোনো রিয়েল চার্জ হবে না। এটি সম্পূর্ণ সুরক্ষিত এবং ডেমো।' : 'Your real account will not be billed. This is a testing sandbox.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (paywallPhone.trim().length < 11) {
                      setPaywallError(language === 'bn' ? 'অনুগ্রহ করে সঠিক ১১ ডিজিটের ওয়ালেট নম্বর লিখুন।' : 'Please enter a valid 11-digit mobile number.');
                      return;
                    }
                    setPaywallError('');
                    setPaywallStep('otp');
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-md flex items-center justify-center space-x-1 text-xs cursor-pointer"
                >
                  <span>{language === 'bn' ? 'ওটিপি পাঠান' : 'Send OTP Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 4: OTP INPUT */}
            {paywallStep === 'otp' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <button onClick={() => setPaywallStep('phone')} className="text-slate-400 hover:text-slate-600">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span>{language === 'bn' ? 'ওটিপি ভেরিফিকেশন' : 'Verify OTP Code'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 pl-6">
                    {language === 'bn' ? `আপনার নম্বর ${paywallPhone}-এ পাঠানো ওটিপি দিন:` : `Enter 6-digit OTP sent to ${paywallPhone}:`}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center space-y-4">
                  <div>
                    <input
                      type="text"
                      value={paywallOtp}
                      onChange={(e) => setPaywallOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full text-center px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-widest"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold">
                    {language === 'bn' ? 'পরীক্ষার জন্য যেকোনো ৬ সংখ্যা ব্যবহার করুন (যেমন ১২৩৪৫৬)' : 'Testing: You can enter any 6 digits (e.g. 123456)'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!paywallOtp.trim()) {
                      setPaywallError(language === 'bn' ? 'অনুগ্রহ করে ওটিপি কোডটি প্রবেশ করান।' : 'Please enter the OTP verification code.');
                      return;
                    }
                    setPaywallError('');
                    setPaywallStep('pin');
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-md flex items-center justify-center space-x-1 text-xs cursor-pointer"
                >
                  <span>{language === 'bn' ? 'ওটিপি যাচাই করুন' : 'Verify & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 5: PIN INPUT */}
            {paywallStep === 'pin' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <button onClick={() => setPaywallStep('otp')} className="text-slate-400 hover:text-slate-600">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span>{language === 'bn' ? 'পিন নম্বর প্রবেশ করুন' : 'Enter Security PIN'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 pl-6">
                    {language === 'bn' ? 'আপনার ৪ বা ৫ ডিজিটের ওয়ালেট সিকিউর পিন লিখুন:' : 'Enter your wallet mobile security PIN to authorize:'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center space-y-4">
                  <div>
                    <input
                      type="password"
                      value={paywallPin}
                      onChange={(e) => setPaywallPin(e.target.value)}
                      placeholder="••••"
                      maxLength={5}
                      className="w-full text-center px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-widest"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold">
                    {language === 'bn' ? 'পরীক্ষার জন্য যেকোনো পিন ব্যবহার করতে পারেন (যেমন ১২৩৪)' : 'Testing: Use any mock security PIN (e.g. 1234)'}
                  </p>
                </div>

                <button
                  onClick={handlePaywallConfirmPayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-md flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>{language === 'bn' ? `পেমেন্ট সম্পন্ন করুন (৳${currentPrice})` : `Confirm Payment (৳${currentPrice})`}</span>
                </button>
              </div>
            )}

            {/* Step 6: PROCESSING GATEWAY */}
            {paywallStep === 'processing' && (
              <div className="text-center py-10 space-y-6">
                <div className="relative inline-flex">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-20 animate-ping"></span>
                  <div className="relative bg-emerald-600 text-white p-4 rounded-full">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">
                    {language === 'bn' ? 'পেমেন্ট ভেরিফিকেশন চলছে...' : 'Processing Transaction...'}
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {language === 'bn' 
                      ? 'আমরা ব্যাংক সার্ভারের সাথে নিরাপদ সংযোগ স্থাপন করছি। অনুগ্রহ করে ব্রাউজার রিলোড বা বন্ধ করবেন না।' 
                      : 'Establishing secure 256-bit connection to wallet servers. Please do not refresh or close this tab.'}
                  </p>
                </div>

                {/* Simulated processing metrics */}
                <div className="max-w-xs mx-auto bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-[10px] text-slate-500 space-y-1.5 text-left font-semibold">
                  <div className="flex justify-between">
                    <span>MFS Network:</span>
                    <span className="text-slate-800 dark:text-slate-200 uppercase">{paywallMethod} Connect</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span className="text-slate-800 dark:text-slate-200">SSL/TLS 1.3 Encryption</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-500">Authenticating merchant...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: SUCCESS VIEW */}
            {paywallStep === 'success' && (
              <div className="text-center py-6 space-y-6">
                <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {language === 'bn' ? 'পেমেন্ট ও রিনিউয়াল সফল!' : 'Renewal Successful!'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {language === 'bn'
                      ? `অভিনন্দন! আপনার দোকানের ${paywallPlan.toUpperCase()} প্ল্যানটি সফলভাবে রিনিউ করা হয়েছে। আপনার ড্যাশবোর্ড এখনই সম্পূর্ণ আনলক করা হয়েছে।`
                      : `Congratulations! Your ${paywallPlan.toUpperCase()} merchant subscription has been successfully renewed. Your full dashboard features are now active.`}
                  </p>
                </div>

                {/* Receipt Details */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 text-left text-[11px] font-medium text-slate-500 space-y-2 max-w-sm mx-auto">
                  <div className="flex justify-between border-b pb-1.5 border-slate-200 dark:border-slate-800">
                    <span>Merchant:</span>
                    <strong className="text-slate-800 dark:text-white">AmarBazar Bangladesh</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <strong className="text-slate-800 dark:text-white font-mono uppercase">{paywallTxnId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Method (মাধ্যম):</span>
                    <strong className="text-slate-800 dark:text-white uppercase">{paywallMethod} wallet</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Charged:</span>
                    <strong className="text-slate-800 dark:text-white">৳{currentPrice}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiry Date (মেয়াদকাল):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPaywallStep('plan');
                    setPaywallError('');
                    setPaywallPhone('');
                    setPaywallOtp('');
                    setPaywallPin('');
                    fetchData();
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-md flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
                >
                  <span>{language === 'bn' ? 'মার্চেন্ট ড্যাশবোর্ডে প্রবেশ করুন' : 'Enter Seller Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  const renderPricingAndOffersConfig = (
    variants: typeof newVariants,
    setVariants: React.Dispatch<React.SetStateAction<typeof newVariants>>,
    prices: typeof newVariantPrices,
    setPrices: React.Dispatch<React.SetStateAction<typeof newVariantPrices>>,
    offers: typeof newBulkOffers,
    setOffers: React.Dispatch<React.SetStateAction<typeof newBulkOffers>>,
    groupName: string,
    setGroupName: React.Dispatch<React.SetStateAction<string>>,
    optionsInput: string,
    setOptionsInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const handleAddGroup = (presetType?: 'weight' | 'size' | 'color') => {
      let name = groupName.trim();
      let options: string[] = [];
      
      if (presetType === 'weight') {
        name = language === 'bn' ? 'ওজন' : 'Weight';
        options = ['250g', '500g', '1kg', '2kg'];
      } else if (presetType === 'size') {
        name = language === 'bn' ? 'সাইজ' : 'Size';
        options = ['S', 'M', 'L', 'XL', 'XXL'];
      } else if (presetType === 'color') {
        name = language === 'bn' ? 'রঙ' : 'Color';
        options = ['Red', 'Green', 'Blue'];
      }

      if (!name) return;
      if (variants.some(v => v.name.toLowerCase() === name.toLowerCase())) {
        alert(language === 'bn' ? 'এই ভেরিয়েন্ট গ্রুপটি ইতিমধ্যে যোগ করা হয়েছে!' : 'This variant group already exists!');
        return;
      }

      setVariants([...variants, { name, options }]);
      setGroupName('');
    };

    const handleRemoveGroup = (idx: number) => {
      const targetGroup = variants[idx];
      setVariants(variants.filter((_, i) => i !== idx));
      setPrices(prev => {
        const next = { ...prev };
        targetGroup.options.forEach(opt => {
          delete next[`${targetGroup.name}:${opt}`];
          delete next[opt];
        });
        return next;
      });
    };

    const handleAddOption = (groupIdx: number, optionVal: string) => {
      if (!optionVal.trim()) return;
      const updated = [...variants];
      if (updated[groupIdx].options.includes(optionVal.trim())) {
        alert(language === 'bn' ? 'এই অপশনটি ইতিমধ্যে বিদ্যমান!' : 'This option already exists!');
        return;
      }
      updated[groupIdx].options.push(optionVal.trim());
      setVariants(updated);
    };

    const handleRemoveOption = (groupIdx: number, optIdx: number) => {
      const group = variants[groupIdx];
      const optVal = group.options[optIdx];
      const updated = [...variants];
      updated[groupIdx].options = updated[groupIdx].options.filter((_, i) => i !== optIdx);
      setVariants(updated);
      
      setPrices(prev => {
        const next = { ...prev };
        delete next[`${group.name}:${optVal}`];
        delete next[optVal];
        return next;
      });
    };

    const handlePriceChange = (groupName: string, optionVal: string, value: number) => {
      setPrices(prev => ({
        ...prev,
        [`${groupName}:${optionVal}`]: value
      }));
    };

    const handleAddBulkOffer = (minQty: number, value: number, type: 'percent' | 'flat') => {
      if (minQty < 2 || value <= 0) return;
      if (offers.some(o => o.minQuantity === minQty)) {
        alert(language === 'bn' ? 'এই পরিমাণের জন্য ইতিমধ্যে একটি অফার রয়েছে!' : 'An offer for this quantity already exists!');
        return;
      }
      const newOffer = {
        minQuantity: minQty,
        discountPercent: type === 'percent' ? value : undefined,
        discountAmount: type === 'flat' ? value : undefined,
      };
      setOffers([...offers, newOffer].sort((a, b) => a.minQuantity - b.minQuantity));
    };

    const handleRemoveBulkOffer = (idx: number) => {
      setOffers(offers.filter((_, i) => i !== idx));
    };

    return (
      <div className="space-y-4 border border-slate-200 dark:border-slate-700/60 p-4 rounded-2xl bg-slate-50/40 dark:bg-slate-900/10">
        <div>
          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 block mb-1">
            {language === 'bn' ? '১. পণ্যের ভেরিয়েন্ট ও কাস্টম দাম নির্ধারণ' : '1. Product Variants & Custom Pricing'}
          </span>
          <span className="text-[10px] text-slate-400 block mb-3">
            {language === 'bn' ? 'বিভিন্ন ওজন, সাইজ বা রঙের জন্য আলাদা আলাদা দাম সেট করুন। সরাসরি লাইভ ক্রেতার কাছে আপডেট হবে।' : 'Set specific prices for weight/size/color options. It updates live for customers.'}
          </span>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10px] font-bold text-slate-400 flex items-center shrink-0">
              {language === 'bn' ? 'প্রিসেট যোগ করুন:' : 'Add Preset:'}
            </span>
            <button
              type="button"
              onClick={() => handleAddGroup('weight')}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-lg text-[10px] transition"
            >
              Weight / ওজন (250g, 500g...)
            </button>
            <button
              type="button"
              onClick={() => handleAddGroup('size')}
              className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-[10px] transition"
            >
              Size / সাইজ (S, M, L...)
            </button>
            <button
              type="button"
              onClick={() => handleAddGroup('color')}
              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg text-[10px] transition"
            >
              Color / রঙ (Red, Blue...)
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: স্টোরেজ, ধারণক্ষমতা' : 'e.g. Storage, Capacity'}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 px-3 py-1.5 border rounded-xl bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddGroup()}
              className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
            >
              {language === 'bn' ? 'গ্রুপ তৈরি করুন' : 'Create Group'}
            </button>
          </div>

          {variants.length > 0 && (
            <div className="space-y-4">
              {variants.map((group, groupIdx) => (
                <div key={groupIdx} className="border border-slate-150 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      {group.name} {language === 'bn' ? 'গ্রুপ' : 'Group'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(groupIdx)}
                      className="text-red-500 hover:text-red-600 font-bold text-[10px]"
                    >
                      {language === 'bn' ? 'গ্রুপ মুছুন' : 'Delete Group'}
                    </button>
                  </div>

                  <div className="flex gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <input
                      type="text"
                      id={`opt-input-${groupIdx}`}
                      placeholder={language === 'bn' ? 'নতুন অপশন যোগ করুন (যেমন: 1kg বা XXL)' : 'Add option (e.g. 1kg or XXL)'}
                      className="flex-1 px-2.5 py-1 border rounded-lg bg-slate-50 dark:bg-slate-800 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value;
                          if (val) {
                            handleAddOption(groupIdx, val);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const input = document.getElementById(`opt-input-${groupIdx}`) as HTMLInputElement;
                        if (input && input.value) {
                          handleAddOption(groupIdx, input.value);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
                    >
                      + {language === 'bn' ? 'যুক্ত করুন' : 'Add'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {group.options.map((opt, optIdx) => {
                      const priceKey = `${group.name}:${opt}`;
                      const optPrice = prices[priceKey] || '';
                      
                      return (
                        <div key={optIdx} className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
                          <span className="font-bold text-xs text-slate-600 dark:text-slate-300 min-w-16 truncate">{opt}</span>
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-[10px] text-slate-400">৳</span>
                            <input
                              type="number"
                              placeholder={language === 'bn' ? 'দাম' : 'Price'}
                              value={optPrice}
                              onChange={(e) => handlePriceChange(group.name, opt, Number(e.target.value))}
                              className="w-full px-2 py-1 border rounded bg-white dark:bg-slate-900 text-xs font-mono font-bold text-emerald-600"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(groupIdx, optIdx)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700/60">
          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 block mb-1">
            {language === 'bn' ? '২. পাইকারি ও ডাবল দামের অফার নির্ধারণ (Bulk Offer)' : '2. Bulk Multi-Buy & Offer Pricing'}
          </span>
          <span className="text-[10px] text-slate-400 block mb-3">
            {language === 'bn' ? '২ বা তার বেশি পণ্য কিনলে কাস্টমারকে সরাসরি ছাড় বা অফার প্রাইজ দিন (রিয়েল মার্কেটের মত)।' : 'Offer custom incentives when customers purchase 2 or more of this item.'}
          </span>

          <div
            className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-xl shadow-xs"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">{language === 'bn' ? 'যদি' : 'Buy'}</span>
              <input
                type="number"
                id="bulk-min-qty"
                defaultValue="2"
                min="2"
                className="w-14 px-2 py-1 border rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold font-mono"
              />
              <span className="text-xs text-slate-500">{language === 'bn' ? 'টি নেয়' : 'or more'}</span>
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-32">
              <span className="text-xs text-slate-500">{language === 'bn' ? 'অফার' : 'Discount'}</span>
              <input
                type="number"
                id="bulk-disc-val"
                placeholder="10"
                className="w-16 px-2 py-1 border rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold font-mono text-amber-600"
              />
              <select
                id="bulk-disc-type"
                className="px-2 py-1 border rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                <option value="percent">% Off</option>
                <option value="flat">৳ Off</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                const minInput = document.getElementById('bulk-min-qty') as HTMLInputElement;
                const valInput = document.getElementById('bulk-disc-val') as HTMLInputElement;
                const typeSelect = document.getElementById('bulk-disc-type') as HTMLSelectElement;
                if (minInput && valInput && typeSelect) {
                  const minQty = Number(minInput.value);
                  const val = Number(valInput.value);
                  const type = typeSelect.value as 'percent' | 'flat';
                  if (minQty && val) {
                    handleAddBulkOffer(minQty, val, type);
                    valInput.value = '';
                  }
                }
              }}
              className="px-4 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs transition"
            >
              + {language === 'bn' ? 'অফার রুল যোগ করুন' : 'Add Rule'}
            </button>
          </div>

          {offers.length > 0 && (
            <div className="space-y-2 mt-3">
              {offers.map((offer, idx) => (
                <div key={idx} className="flex items-center justify-between bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>
                      {language === 'bn' 
                        ? `ন্যূনতম ২ বা তার বেশি অর্থাৎ ${offer.minQuantity} টি নিলে প্রতিটির উপর ${offer.discountPercent ? `${offer.discountPercent}%` : `${offer.discountAmount} ৳`} পাইকারি ছাড়!`
                        : `Buy ${offer.minQuantity} or more: Get ${offer.discountPercent ? `${offer.discountPercent}%` : `৳${offer.discountAmount}`} off per item!`
                      }
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBulkOffer(idx)}
                    className="text-red-500 hover:text-red-600 font-bold text-[10px]"
                  >
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Account Suspended / Policy violation Banner */}
      {storeInfo?.subscriptionStatus === 'suspended' && (
        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-start space-x-4 shadow-sm animate-fadeIn">
          <div className="bg-red-500 text-white p-3 rounded-2xl shrink-0 flex items-center justify-center shadow-lg shadow-red-500/20">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-wide">
              {language === 'bn' ? 'মার্চেন্ট অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে' : 'Merchant Account Suspended'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
              {language === 'bn' 
                ? 'অনুমোদিত শর্তাবলী বা নীতি লঙ্ঘনের কারণে আপনার এই স্টোরটি সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে। স্টোর সম্পর্কিত কোনো পণ্য বা সাবস্ক্রিপশন পরিচালনা করা যাবে না।' 
                : 'Your merchant account has been temporarily suspended due to a terms or policy violation. All active products, sales, and listing tools are frozen.'
              }
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-red-500/20 text-red-600 uppercase tracking-wider">
                {language === 'bn' ? 'স্ট্যাটাস: অ্যাকাউন্ট ব্লকড' : 'Status: Frozen'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Admin Warnings list banner */}
      {storeInfo?.warnings && storeInfo.warnings.length > 0 && (
        <div className="space-y-3.5">
          {storeInfo.warnings.map((warn) => (
            <div key={warn.id} className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-start space-x-4 shadow-sm animate-fadeIn">
              <div className="bg-amber-500 text-slate-950 p-3 rounded-2xl shrink-0 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    {language === 'bn' ? 'অ্যাডমিন অফিসিয়াল নোটিশ / সতর্কতা' : 'Official Warning / Notice from Admin'}
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">{warn.date}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-black leading-relaxed">
                  {warn.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}



      {/* 3. Seller Staff Sub-Account Notification Banner */}
      {isStaff && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                  {language === 'bn' ? `স্টাফ সদস্য: ${currentUser?.name}` : `Staff Member: ${currentUser?.name}`}
                </h4>
                <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                  @{currentUser?.username || 'staff'}
                </span>
                <span className="bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {currentUser?.roleTitle || (language === 'bn' ? 'স্টাফ অ্যাসিস্ট্যান্ট' : 'Staff Assistant')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? `স্টোর মালিক (${storeInfo?.storeName || 'মার্চেন্ট'}) কর্তৃক আপনাকে নির্ধারিত অ্যাক্সেস পারমিশন প্রদান করা হয়েছে।`
                  : `You are logged in with role-based access granted by ${storeInfo?.storeName || 'Merchant'}.`}
              </p>
            </div>
          </div>
          <div className="text-right text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
            {language === 'bn' ? `অনুমোদিত পারমিশন: ${staffPerms.length} টি` : `Granted Permissions: ${staffPerms.length}`}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      {activeTab !== 'subscription' && (
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analytics Overview</span>
          </button>
          
          {canViewProducts && (
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'products' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Inventory ({sellerProducts.length})</span>
            </button>
          )}

          {canViewOrders && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {language === 'bn' 
                  ? `পেন্ডিং অর্ডার (${sellerOrders.filter(o => o.status === 'pending').length})` 
                  : `Pending Orders (${sellerOrders.filter(o => o.status === 'pending').length})`}
              </span>
            </button>
          )}

          {(canViewFinance || canViewOrders) && (
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'withdrawals' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {language === 'bn' 
                  ? `কনফার্মড অর্ডার (${sellerOrders.filter(o => o.status !== 'pending').length})` 
                  : `Confirmed Orders (${sellerOrders.filter(o => o.status !== 'pending').length})`}
              </span>
            </button>
          )}

          {canViewStoreDirectory && (
            <button
              onClick={() => setActiveTab('store_directory')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'store_directory' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>
                {language === 'bn' ? 'দোকান তালিকা' : 'Store Directory'}
              </span>
            </button>
          )}

          {canManageInventoryWorkspace && (
            <button
              onClick={() => setActiveTab('inventory_manager')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'inventory_manager' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>
                {language === 'bn' ? 'ইনভেন্টরি তালিকা' : 'Inventory Manager'}
              </span>
            </button>
          )}

          {!isStaff && (
            <>
              <button
                onClick={() => {
                  setActiveTab('subscription');
                  setSubscriptionType('website');
                }}
                className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'subscription' && subscriptionType === 'website' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {language === 'bn' ? '১. ওয়েবসাইট সাবস্ক্রিপশন' : '1. Website Subscription'}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('subscription');
                  setSubscriptionType('cloud');
                }}
                className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'subscription' && subscriptionType === 'cloud' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Cloud className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  {language === 'bn' ? '২. ক্লাউড স্টোরেজ' : '2. Cloud Storage'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('roles_permissions')}
                className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'roles_permissions' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {language === 'bn' ? 'রোল ও পারমিশন' : 'Role Permissions'}
                </span>
              </button>
            </>
          )}

          {canManageSettings && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'settings' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                {language === 'bn' ? 'দোকান সেটিংস' : 'Shop Settings'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'store_directory' && (
        <StoreDirectory />
      )}

      {activeTab === 'inventory_manager' && (
        <InventoryWorkspace />
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Revenue:</span>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ৳{(storeInfo?.totalSales || totalSalesRevenue).toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-500 font-medium mt-1 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.2% this month
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Available Balance:</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ৳{(storeInfo?.balance || 62400).toLocaleString()}
              </h3>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline mt-1 block"
              >
                Request bKash / Bank Payout →
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Orders:</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {sellerOrders.length}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Dispatched via Pathao / RedX</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Store Rating:</span>
              <h3 className="text-2xl font-black text-amber-500 mt-1">
                {storeInfo?.rating || 4.8} / 5.0
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Based on 98 customer reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS INVENTORY TAB */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold text-xs">
            <span>Product Listings ({sellerProducts.length})</span>
            {canAddProductsStaff ? (
              <button
                onClick={checkSubscriptionAndAdd}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                + Add Product
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                {language === 'bn' ? 'পণ্য যোগের পারমিশন নেই' : 'Add Product Restricted'}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {sellerProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-3 flex items-center space-x-3">
                      <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{p.title}</p>
                        <p className="text-[10px] text-slate-400">{p.categoryName}</p>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{p.sku}</td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{(p.discountPrice || p.price).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-500">{p.rating}★</td>
                    <td className="p-3 text-right space-x-2">
                      {canManageProducts ? (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition inline-flex cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition inline-flex cursor-pointer"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                          {language === 'bn' ? 'শুধু দেখার অনুমতি' : 'View-Only'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
              <span>{language === 'bn' ? 'আগত নতুন পেন্ডিং অর্ডারসমূহ' : 'New Incoming Pending Orders'}</span>
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-2.5 py-1 rounded-full font-bold">
                {language === 'bn' 
                  ? `${sellerOrders.filter(o => o.status === 'pending').length}টি পেন্ডিং` 
                  : `${sellerOrders.filter(o => o.status === 'pending').length} Pending`}
              </span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {sellerOrders.filter(o => o.status === 'pending').length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'কোন নতুন পেন্ডিং অর্ডার নেই!' : 'No new pending orders at the moment.'}
                  </p>
                </div>
              ) : (
                sellerOrders.filter(o => o.status === 'pending').map((ord) => (
                  <div key={ord.id} className="p-5 space-y-4 text-xs">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">{ord.orderNumber}</span>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            ord.paymentMethod === 'cod' ? 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                          }`}>
                            {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] mt-1 font-semibold">
                          Date: {new Date(ord.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block">Total Amount</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          ৳{ord.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <div>
                        <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Customer Info</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{ord.customerName}</p>
                        <p className="text-slate-500">{ord.customerPhone}</p>
                        <p className="text-slate-400">{ord.customerEmail}</p>
                      </div>
                      {ord.shippingAddress && (
                        <div>
                          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Shipping Address</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{ord.shippingAddress.recipientName}</p>
                          <p className="text-slate-500 font-mono">{ord.shippingAddress.phone}</p>
                          <p className="text-slate-500 line-clamp-2">
                            {ord.shippingAddress.fullAddress}, {ord.shippingAddress.thana}, {ord.shippingAddress.district}, {ord.shippingAddress.division}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Ordered Items</span>
                      {ord.items && ord.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                          <div className="flex items-center space-x-2.5">
                            {item.productImage && (
                              <img src={item.productImage} alt={item.productTitle} className="w-9 h-9 rounded-lg object-cover border" referrerPolicy="no-referrer" />
                            )}
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{item.productTitle}</p>
                              <p className="text-slate-400 text-[10px]">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">৳{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex justify-end items-center space-x-3">
                      {canProcessOrdersStaff ? (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'cancelled')}
                            className="px-3.5 py-2 font-bold text-slate-500 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          >
                            {language === 'bn' ? 'বাতিল করুন' : 'Cancel Order'}
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'confirmed')}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition shadow-xs hover:shadow-md flex items-center space-x-1.5 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>{language === 'bn' ? 'অর্ডার কনফার্ম করুন' : 'Confirm Order'}</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-[11px] text-slate-400 font-semibold italic bg-slate-100 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                          {language === 'bn' ? 'অর্ডার প্রসেসিং পারমিশন নেই (ভিউ-অনলি মোড)' : 'View-Only Mode (Processing Restricted)'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAWALS TAB (Confirmed Orders + Withdrawals) */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-8">
          
          {/* Dashboard Summary for payouts (Only if canViewFinance) */}
          {canViewFinance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Available Balance (বর্তমান ব্যালেন্স)</span>
                <div className="flex items-baseline space-x-1.5 mt-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">৳{(storeInfo?.balance || 0).toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Ready for withdrawal at any time.</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Sales (মোট বিক্রয়)</span>
                <div className="flex items-baseline space-x-1.5 mt-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">৳{(storeInfo?.totalSales || 0).toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Lifetime revenue earned from completed orders.</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-center">
                {canWithdrawFinance ? (
                  <button
                    onClick={() => {
                      setWithdrawAmount('');
                      setWithdrawAccount('');
                      setIsWithdrawModalOpen(true);
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{language === 'bn' ? 'টাকা উত্তোলন করুন (Payout Request)' : 'Request Payout'}</span>
                  </button>
                ) : (
                  <div className="p-3 text-center text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    {language === 'bn' ? 'উত্তোলনের অনুমতি নেই' : 'Payout Permission Restricted'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Confirmed / Completed Orders List Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
              <span>{language === 'bn' ? 'কনফার্মড ও ডেলিভারড অর্ডারসমূহ' : 'Confirmed & Delivered Orders'}</span>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-bold">
                {sellerOrders.filter(o => o.status !== 'pending').length} Orders
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {sellerOrders.filter(o => o.status !== 'pending').length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <p className="text-xs font-bold text-slate-500">No completed or processed orders yet.</p>
                </div>
              ) : (
                sellerOrders.filter(o => o.status !== 'pending').map((ord) => (
                  <div key={ord.id} className="p-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">{ord.orderNumber}</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">Customer: {ord.customerName} • {new Date(ord.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{ord.totalAmount.toLocaleString()}</span>
                      <span className="block text-[10px] uppercase font-bold text-slate-500 mt-0.5">{ord.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Withdrawals History List Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-800 dark:text-slate-200">
              <span>{language === 'bn' ? 'টাকা উত্তোলনের পূর্বের ইতিহাস (Payout History)' : 'Payout Requests History'}</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {withdrawals.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <p className="text-xs font-bold text-slate-500">No payout requests submitted yet.</p>
                </div>
              ) : (
                withdrawals.map((withdraw) => (
                  <div key={withdraw.id} className="p-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">৳{withdraw.amount.toLocaleString()}</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">Method: {withdraw.method.toUpperCase()} • Account: {withdraw.accountNumber} • {new Date(withdraw.requestDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        withdraw.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : withdraw.status === 'rejected' 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {withdraw.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUBSCRIPTION TAB */}
      {activeTab === 'subscription' && (
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Unified Subscription Status Panel */}
          <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-lg p-2.5 shadow-2xs space-y-2">
            {/* Row 1: Website Subscription */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10.5px] pb-2 border-b border-slate-200/50 dark:border-slate-800/60">
              {/* Active Plan Name with status indicator dot */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <div className={`w-2 h-2 rounded-full ${
                  storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-400'
                }`} />
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                    {language === 'bn' ? 'ওয়েবসাইট:' : 'Web Plan:'}
                  </span>
                  <span className={`font-extrabold px-1.5 py-0.5 rounded-xs text-[10px] uppercase tracking-wide inline-block ${
                    storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-150 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active'
                      ? (language === 'bn' ? `${storeInfo.subscriptionPlan} প্ল্যান` : `${storeInfo.subscriptionPlan} Plan`)
                      : (language === 'bn' ? 'ফ্রি প্ল্যান' : 'Free Plan')
                    }
                  </span>
                </div>
              </div>

              {/* Horizontal Details of parameters */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[9.5px]">{language === 'bn' ? 'শুরু:' : 'Start:'}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active'
                      ? getSubscriptionStartDate(storeInfo?.subscriptionExpiryDate, storeInfo?.subscriptionStartDate)
                      : '—'
                    }
                  </span>
                </div>

                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />

                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[9.5px]">{language === 'bn' ? 'শেষ:' : 'End:'}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active'
                      ? (storeInfo?.subscriptionExpiryDate || 'N/A')
                      : '—'
                    }
                  </span>
                </div>

                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />

                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[9.5px]">{language === 'bn' ? 'বাকি:' : 'Left:'}</span>
                  <span className={`font-bold px-1 py-0.2 rounded-xs text-[9.5px] ${
                    storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active' && getSubscriptionDaysRemaining(storeInfo?.subscriptionExpiryDate) > 5
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active'
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                  }`}>
                    {storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active'
                      ? (language === 'bn' 
                          ? `${getSubscriptionDaysRemaining(storeInfo?.subscriptionExpiryDate)} দিন` 
                          : `${getSubscriptionDaysRemaining(storeInfo?.subscriptionExpiryDate)} Days`)
                      : '—'
                    }
                  </span>
                </div>

                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />

                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[9.5px]">{language === 'bn' ? 'অবস্থা:' : 'Status:'}</span>
                  <span className={`font-extrabold uppercase text-[9.5px] ${
                    storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && storeInfo?.subscriptionStatus === 'active'
                      ? (storeInfo?.subscriptionStatus || 'INACTIVE')
                      : (language === 'bn' ? 'ফ্রি' : 'FREE')
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Unified Wide Cloud Storage Indicator (Moves progress bar to same line and stretches it fully) */}
            <div className="flex items-center justify-between gap-3.5 text-[10.5px] pt-1">
              {/* Left Side: Active Storage Name badge only (if active), removing dot and label */}
              {storeInfo?.cloudSubscriptionPlan && storeInfo?.cloudSubscriptionPlan !== 'none' && storeInfo?.cloudSubscriptionStatus === 'active' && (
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className={`font-extrabold px-1.5 py-0.5 rounded-xs text-[10px] uppercase tracking-wide inline-block bg-indigo-500/10 text-indigo-700 dark:text-indigo-400`}>
                    {storeInfo.cloudSubscriptionPlan === 'gcs_subscription' ? 'Google Cloud' : 'Firebase'}
                  </span>
                </div>
              )}

              {/* Middle: Dynamically stretching Progress Bar & brand logo */}
              <div 
                onClick={() => setIsFileManagerOpen(true)}
                title={language === 'bn' ? 'স্টোরেজ ও ফাইল ম্যানেজার খুলুন' : 'Open Storage & File Manager'}
                className="flex-1 flex items-center space-x-2.5 cursor-pointer bg-slate-100/60 dark:bg-slate-900/30 hover:bg-slate-200/60 dark:hover:bg-slate-850 px-2.5 py-1.5 rounded-xl transition duration-200 group"
              >
                {getStorageLogo(storeInfo?.cloudSubscriptionPlan)}
                
                <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200 shrink-0">
                  {displayPercentage}%
                </span>

                {/* Stretching Progress Bar Track */}
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/40">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      displayPercentage >= 85 
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(3, displayPercentage))}%` }}
                  />
                </div>

                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0 font-mono">
                  {storageStats.formattedUsed} / {storageStats.formattedTotal}
                </span>
              </div>

              {/* Right Side: See contents / File Manager action */}
              <button 
                type="button"
                onClick={() => setIsFileManagerOpen(true)}
                className="text-[10.5px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 rounded-xl font-black flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 shadow-xs hover:scale-102"
              >
                <FolderOpen className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'bn' ? 'ফাইল দেখুন' : 'View Files'}</span>
                <span className="bg-emerald-500 text-slate-950 font-mono text-[9px] px-1.5 py-0.2 rounded-full font-black">
                  {storageFiles.length}
                </span>
              </button>
            </div>

            {/* Storage Purchase Billing Information Card (Collapsible, triggered by clicking storage icon/bar) */}
            {isStorageBillingOpen && (
              <div className="mt-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 relative overflow-hidden">
                <div className="absolute top-2.5 right-2.5">
                  <button 
                    onClick={() => setIsStorageBillingOpen(false)}
                    className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {language === 'bn' ? 'স্টোরেজ সাবস্ক্রিপশন ও ক্রয়ের রশিদ' : 'Storage Subscription & Purchase Receipt'}
                  </h4>
                </div>

                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-2"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {/* Left Column */}
                  <div className="space-y-2 bg-white dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100/50 dark:border-slate-900/50">
                      <span>{language === 'bn' ? 'স্টোরেজ সার্ভিস:' : 'Storage Service:'}</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">
                        {isCloudActive 
                          ? (storeInfo?.cloudSubscriptionPlan === 'gcs_subscription' ? 'Google Cloud Storage' : 'Firebase Pro Storage')
                          : (language === 'bn' ? 'সেন্ট্রাল ফ্রি স্টোরেজ' : 'Central Free Storage')
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-100/50 dark:border-slate-900/50">
                      <span>{language === 'bn' ? 'পরিশোধিত অর্থ (টাকা):' : 'Amount Paid:'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {isCloudActive 
                          ? (language === 'bn' ? '৳ ১,২০০ টাকা / মাস' : '৳ 1,200 / Month')
                          : (language === 'bn' ? '৳ ০ (ফ্রি)' : '৳ 0 (Free)')
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span>{language === 'bn' ? 'পেমেন্ট মেথড:' : 'Payment Method:'}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350">
                        {isCloudActive ? 'bKash / SSLCommerz' : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-2 bg-white dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100/50 dark:border-slate-900/50">
                      <span>{language === 'bn' ? 'সক্রিয়করণের তারিখ:' : 'Activation Date:'}</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {isCloudActive 
                          ? getCloudStartDate(storeInfo?.cloudSubscriptionExpiryDate)
                          : '2026-08-01'
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-100/50 dark:border-slate-900/50">
                      <span>{language === 'bn' ? 'মেয়াদ শেষের তারিখ:' : 'Expiry/Renewal Date:'}</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {isCloudActive 
                          ? (storeInfo?.cloudSubscriptionExpiryDate || 'N/A')
                          : (language === 'bn' ? 'আজীবন' : 'Lifetime')
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span>{language === 'bn' ? 'ট্রানজেকশন আইডি:' : 'Transaction ID:'}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-500">
                        {isCloudActive ? 'TXN-AMR-GCS-8392104' : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {isCloudActive && (
                  <div className="flex items-center space-x-1.5 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-450 text-[10px] p-2.5 rounded-xl font-bold justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{language === 'bn' ? 'ক্লাউড স্টোরেজ সিকিউর ও লাইভ অবস্থায় রয়েছে' : 'Cloud storage is secure and actively synchronized'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Detailed Breakdown Section inside Storage (Collapsible) */}
            {isStorageDetailOpen && (
              <div className="mt-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 space-y-3.5">
                {/* Subscription Metadata details inside breakdown to save outer space */}
                {storeInfo?.cloudSubscriptionPlan && storeInfo?.cloudSubscriptionPlan !== 'none' && storeInfo?.cloudSubscriptionStatus === 'active' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 font-semibold text-slate-600 dark:text-slate-450">
                    <div>
                      <span className="text-slate-400">{language === 'bn' ? 'শুরু:' : 'Start:'}</span>
                      <p className="font-mono text-slate-700 dark:text-slate-300">{getCloudStartDate(storeInfo?.cloudSubscriptionExpiryDate)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">{language === 'bn' ? 'শেষ:' : 'End:'}</span>
                      <p className="font-mono text-slate-700 dark:text-slate-300">{storeInfo?.cloudSubscriptionExpiryDate || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">{language === 'bn' ? 'বাকি:' : 'Left:'}</span>
                      <p className="font-mono text-slate-700 dark:text-slate-300">{getSubscriptionDaysRemaining(storeInfo?.cloudSubscriptionExpiryDate)} Days</p>
                    </div>
                    <div>
                      <span className="text-slate-400">{language === 'bn' ? 'অবস্থা:' : 'Status:'}</span>
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">{storeInfo?.cloudSubscriptionStatus}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'bn' ? 'কি কি ফাইল ভিতরে আছে (Storage contents)' : 'Storage Contents Breakdown'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>{language === 'bn' ? 'লাইভ ডাটা' : 'LIVE DATA'}</span>
                  </span>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-semibold">
                    {/* Item 1: Product Images */}
                    <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded bg-blue-500" />
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">
                            {language === 'bn' ? 'পণ্যের হাই-রেজ ছবি' : 'Product Images & Thumbnails'}
                          </p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-normal">media/products/*</p>
                        </div>
                      </div>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {storageCleaned ? '3.82 GB' : '8.42 GB'}
                      </span>
                    </div>

                    {/* Item 2: Customer messages media */}
                    <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded bg-amber-500" />
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">
                            {language === 'bn' ? 'কাস্টমার চ্যাট ফাইল ও অডিও' : 'Customer Chat Media'}
                          </p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-normal font-normal">chats/uploads/*</p>
                        </div>
                      </div>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {storageCleaned ? '1.50 GB' : '2.91 GB'}
                      </span>
                    </div>

                    {/* Item 3: Invoices */}
                    <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded bg-purple-500" />
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">
                            {language === 'bn' ? 'মেমো ও ইনভয়েস PDF' : 'Invoices & Billing PDFs'}
                          </p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-normal">billing/receipts/*</p>
                        </div>
                      </div>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {storageCleaned ? '0.73 GB' : '1.53 GB'}
                      </span>
                    </div>

                    {/* Item 4: Database back ups */}
                    <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">
                            {language === 'bn' ? 'সিস্টেম ব্যাকআপ ও স্কিমা লগ' : 'System Logs & DB Backups'}
                          </p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-normal">system/backups/*</p>
                        </div>
                      </div>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {storageCleaned ? '0.40 GB' : '1.00 GB'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-300 flex items-start space-x-2 font-medium">
                    <span className="animate-pulse">💡</span>
                    <p>
                      {language === 'bn'
                        ? 'আপনার কাস্টমার যে সমস্ত ইমেজ বা ডকুমেন্ট চ্যাটে পাঠায় অথবা আপনি যে পণ্যের ছবি আপলোড করেন, তা সরাসরি এই ডেডিকেটেড ক্লাউড মেমোরিতে সম্পূর্ণ আইসোলেটেড অবস্থায় সিকিউরড থাকে।'
                        : 'All product media assets, client chat invoices, and store metadata files are isolated securely in your dedicated cloud container.'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

          {/* Unified Promo Banner & Selector Switcher Part */}
          <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 shadow-2xs space-y-1.5">
            {/* Part 1: Call to Action Banner / Promo Title to encourage buying/upgrading */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/5 to-emerald-500/10 dark:from-emerald-950/40 dark:via-indigo-950/20 dark:to-emerald-950/40 border border-emerald-500/15 dark:border-emerald-800/40 rounded-lg p-2.5 flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2 truncate">
                <span className="text-xs shrink-0 animate-pulse">⚡</span>
                <div className="truncate">
                  <p className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 leading-none truncate">
                    {language === 'bn' ? 'স্টোর ক্যাপাসিটি বাড়াতে এবং ডেটা সুরক্ষায় নতুন সার্ভিস চালু করুন!' : 'Get Premium Services & Secure Storage'}
                  </p>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-none truncate">
                    {language === 'bn' ? 'সেরা ডিল পেতে আপনার পছন্দের প্ল্যানটি এখনই সক্রিয় করুন।' : 'Choose your preferred active slots & keep your media files safe.'}
                  </p>
                </div>
              </div>
              <span className="text-[8.5px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/10 px-2 py-0.5 rounded-xs uppercase tracking-wider shrink-0">
                {language === 'bn' ? 'সেরা অফার' : 'Promo'}
              </span>
            </div>

            {/* Part 2: Selector Board Switcher */}
            <div className="bg-slate-50/50 dark:bg-slate-900/60 p-0.5 rounded-lg border border-slate-100 dark:border-slate-800/40">
              <div className="grid grid-cols-2 gap-1">
                {/* Setting 1: Website Subscription */}
                <button
                  type="button"
                  onClick={() => setSubscriptionType('website')}
                  className={`py-1.5 px-3 rounded-md text-center transition-all duration-150 cursor-pointer flex items-center justify-center space-x-1.5 text-[10.5px] ${
                    subscriptionType === 'website'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-3xs border border-slate-200/40 dark:border-slate-700/50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold border border-transparent'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${subscriptionType === 'website' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className="truncate">
                    {language === 'bn' ? '১. ওয়েবসাইট প্ল্যান' : '1. Web Plan'}
                  </span>
                  {storeInfo?.subscriptionPlan && storeInfo?.subscriptionPlan !== 'none' && (
                    <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 px-1 py-0.2 rounded-xs shrink-0 text-emerald-600 dark:text-emerald-400">
                      {storeInfo.subscriptionPlan}
                    </span>
                  )}
                </button>

                {/* Setting 2: Google Cloud / Firebase Subscription */}
                <button
                  type="button"
                  onClick={() => setSubscriptionType('cloud')}
                  className={`py-1.5 px-3 rounded-md text-center transition-all duration-150 cursor-pointer flex items-center justify-center space-x-1.5 text-[10.5px] ${
                    subscriptionType === 'cloud'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-3xs border border-slate-200/40 dark:border-slate-700/50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold border border-transparent'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${subscriptionType === 'cloud' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className="truncate">
                    {language === 'bn' ? '২. ক্লাউড স্টোরেজ' : '2. Cloud Storage'}
                  </span>
                  {storeInfo?.cloudSubscriptionPlan && storeInfo?.cloudSubscriptionPlan !== 'none' && (
                    <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-500/10 px-1 py-0.2 rounded-xs shrink-0 text-indigo-600 dark:text-indigo-400">
                      {storeInfo.cloudSubscriptionPlan === 'gcs_subscription' ? 'GCS' : 'Firebase'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Plan Cards Section */}
          <div className="space-y-6">
            {subscriptionType === 'website' ? (
                /* Website Plans */
                <div className="space-y-4">
                  <div className="text-left space-y-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      <span>
                        {language === 'bn' ? 'একটি মার্কেটপ্লেস সাবস্ক্রিপশন প্ল্যান বেছে নিন' : 'Choose a Marketplace Subscription Plan'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {language === 'bn'
                        ? 'বেশি প্রোডাক্ট আপলোড করুন, কম কমিশন দিন এবং প্রিমিয়াম সেলার ফিচারের সুবিধা নিন।'
                        : 'Unlock higher product capacities, lower sales commissions, and premium seller features.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Starter */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden">
                      {storeInfo?.subscriptionPlan === 'starter' && (
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          {language === 'bn' ? 'বর্তমান' : 'Current'}
                        </div>
                      )}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                            {language === 'bn' ? 'স্টার্টার প্ল্যান' : 'Starter Plan'}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {language === 'bn' ? 'নতুন মার্চেন্টদের শুরু করার জন্য পারফেক্ট।' : 'Perfect for new individual merchants starting out.'}
                          </p>
                        </div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">৳{systemSettings.starterPrice ?? 500}</span>
                          <span className="text-[10px] text-slate-400">/ {systemSettings.starterDurationDays ?? 30} {language === 'bn' ? 'দিন' : 'days'}</span>
                        </div>
                        <ul className="text-[11px] text-slate-500 space-y-2 pt-2 border-t">
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? `সর্বোচ্চ ${systemSettings.starterProductLimit ?? 20}টি প্রোডাক্ট লিস্টিং` : `Max ${systemSettings.starterProductLimit ?? 20} Product Listings`}
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? `বিক্রয়ের উপর ${systemSettings.starterCommission ?? 5}% কমিশন` : `${systemSettings.starterCommission ?? 5}% Commission on Sales`}
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? 'সাধারণ অ্যানালিটিক্স' : 'Standard Analytics'}
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? 'সিমুলেটেড বিকাশ সাপোর্ট' : 'Simulated bKash Support'}
                          </li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCheckoutPlan('starter');
                          setCheckoutStep('phone');
                          setIsCheckoutModalOpen(true);
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
                      >
                        {storeInfo?.subscriptionPlan === 'starter' 
                          ? (language === 'bn' ? 'স্টার্টার প্ল্যান রিনিউ করুন' : 'Renew / Extend Starter') 
                          : (language === 'bn' ? 'স্টার্টার প্ল্যান সাবস্ক্রাইব করুন' : 'Subscribe Starter')}
                      </button>
                    </div>

                    {/* Card 2: Business */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-emerald-500 dark:border-emerald-600 p-5 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[8px] px-2.5 py-1 rounded-bl-lg uppercase tracking-wider">
                        {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                      </div>
                      {storeInfo?.subscriptionPlan === 'business' && (
                        <div className="absolute top-8 right-3 bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          {language === 'bn' ? 'বর্তমান' : 'Current'}
                        </div>
                      )}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                            {language === 'bn' ? 'বিজনেস প্ল্যান' : 'Business Plan'}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {language === 'bn' ? 'মাঝারি ব্র্যান্ড ও রিটেইল স্টোরগুলোর জন্য উপযুক্ত।' : 'Perfect plan for growing retail brands and online stores.'}
                          </p>
                        </div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">৳{systemSettings.businessPrice ?? 1500}</span>
                          <span className="text-[10px] text-slate-400">/ {systemSettings.businessDurationDays ?? 30} {language === 'bn' ? 'দিন' : 'days'}</span>
                        </div>
                        <ul className="text-[11px] text-slate-500 space-y-2 pt-2 border-t">
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? `সর্বোচ্চ ${systemSettings.businessProductLimit ?? 100}টি প্রোডাক্ট লিস্টিং` : `Max ${systemSettings.businessProductLimit ?? 100} Product Listings`}
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? `বিক্রয়ের উপর ${systemSettings.businessCommission ?? 3}% কমিশন` : `${systemSettings.businessCommission ?? 3}% Commission on Sales`}
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? 'অ্যাডভান্সড অ্যানালিটিক্স ও রিপোর্টস' : 'Advanced Analytics & Reports'}
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? '১০টি ক্লাউড স্টোরেজ অপশন অ্যাক্সেস' : 'Access to 10 Cloud Storage Options'}
                          </li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCheckoutPlan('business');
                          setCheckoutStep('phone');
                          setIsCheckoutModalOpen(true);
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
                      >
                        {storeInfo?.subscriptionPlan === 'business' 
                          ? (language === 'bn' ? 'বিজনেস প্ল্যান রিনিউ করুন' : 'Renew / Extend Business') 
                          : (language === 'bn' ? 'বিজনেস প্ল্যান সাবস্ক্রাইব করুন' : 'Subscribe Business')}
                      </button>
                    </div>

                    {/* Card 3: Enterprise */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden">
                      {storeInfo?.subscriptionPlan === 'enterprise' && (
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          {language === 'bn' ? 'বর্তমান' : 'Current'}
                        </div>
                      )}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                            {language === 'bn' ? 'এন্টারপ্রাইজ প্ল্যান' : 'Enterprise Plan'}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {language === 'bn' ? 'বড় এন্টারপ্রাইজ ও ব্র্যান্ড সমূহের জন্য সম্পূর্ণ ক্ষমতা।' : 'Uncapped capacity built for large enterprises and established brands.'}
                          </p>
                        </div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">৳{systemSettings.enterprisePrice ?? 3000}</span>
                          <span className="text-[10px] text-slate-400">/ {systemSettings.enterpriseDurationDays ?? 30} {language === 'bn' ? 'দিন' : 'days'}</span>
                        </div>
                        <ul className="text-[11px] text-slate-500 space-y-2 pt-2 border-t">
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? 'আনলিমিটেড প্রোডাক্ট লিস্টিং' : 'Unlimited Product Listings'}
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? `বিক্রয়ের উপর মাত্র ${systemSettings.enterpriseCommission ?? 1}% কমিশন` : `Ultra-low ${systemSettings.enterpriseCommission ?? 1}% Commission on Sales`}
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? 'ভিআইপি ২৪/৭ ডেডিকেটেড ম্যানেজার সাপোর্ট' : '24/7 Priority Dedicated Manager Support'}
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                            {language === 'bn' ? 'কাস্টম এপিআই ও ক্লাউড সিঙ্ক ফিচার' : 'Enterprise API Integration & Premium Cloud Sync'}
                          </li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCheckoutPlan('enterprise');
                          setCheckoutStep('phone');
                          setIsCheckoutModalOpen(true);
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
                      >
                        {storeInfo?.subscriptionPlan === 'enterprise' 
                          ? (language === 'bn' ? 'এন্টারপ্রাইজ রিনিউ করুন' : 'Renew / Extend Enterprise') 
                          : (language === 'bn' ? 'এন্টারপ্রাইজ সাবস্ক্রাইব করুন' : 'Subscribe Enterprise')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Cloud Storage Plans */
                <div className="space-y-4">
                  <div className="text-left space-y-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Cloud className="w-4 h-4 text-indigo-500" />
                      <span>
                        {language === 'bn' ? 'ক্লাউড এবং ডেটাবেস স্টোরেজ ইন্টিগ্রেশন' : 'Connect Private Cloud & Database Storage'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {language === 'bn'
                        ? 'আপনার নিজস্ব গুগুল ক্লাউড, ফায়ারবেস, মঙ্গোডিবি, সুপাবেস বা এডাব্লিউএস অ্যাকাউন্ট কানেক্ট করুন ও সম্পূর্ণ অফলাইন-সেফ ব্যাকআপ ও মিডিয়া ফাইল বাকেট নিয়ন্ত্রণ করুন।'
                        : 'Connect and aggregate your custom Google GCS, Firebase, MongoDB, Supabase, Neon or AWS services with secure sandbox routing.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
                    {/* 1. Google Cloud Storage */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-sky-400">
                      {storeInfo?.cloudSubscriptionPlan === 'gcs_subscription' && (
                        <div className="absolute top-2 right-2 bg-sky-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Cloud className="w-4 h-4 text-sky-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'গুগল ক্লাউড স্টোরেজ (GCS)' : 'Google Cloud Storage (GCS)'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'সরাসরি এন্টারপ্রাইজ ক্লাউড বাকেট হোস্টিং ইন্টিগ্রেশন।' : 'Direct enterprise bucket asset hosting integration.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? '৩০০ ডলার ফ্রী ট্রায়াল!' : '$300 Free Trial!'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'gcs' })}
                        className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 2. Firebase Storage */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-amber-400">
                      {storeInfo?.cloudSubscriptionPlan === 'firebase_subscription' && (
                        <div className="absolute top-2 right-2 bg-amber-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-amber-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'ফায়ারবেস স্টোরেজ' : 'Firebase Storage'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'ইনস্ট্যান্ট এজ ক্যাশিং সহ গুগল ফায়ারবেস ইন্টিগ্রেশন।' : 'Instant web client asset routing and NoSQL features.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? '৫ জিবি লাইফটাইম ফ্রি!' : '5GB Lifetime Free Tier'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'firebase' })}
                        className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 3. Supabase Postgres */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-violet-400">
                      {storeInfo?.cloudSubscriptionPlan === 'supabase_subscription' && (
                        <div className="absolute top-2 right-2 bg-violet-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'সুপাবেস পোস্টগ্রেস' : 'Supabase Postgres'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'রিয়েলটাইম পোস্টগ্রেস রিলেショナル ডাটাবেস ও সিকিউরিটি।' : 'Real-time PostgreSQL with automated scalable APIs.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? '৫০০ এমবি ডাটাবেস ফ্রি!' : '500MB DB Free Tier'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'supabase' })}
                        className="w-full py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 4. MongoDB Atlas */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-green-400">
                      {storeInfo?.cloudSubscriptionPlan === 'mongodb_subscription' && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-green-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'মঙ্গোডিবি অ্যাটলাস' : 'MongoDB Atlas'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'ডকুমেন্ট-ভিত্তিক হাই-স্পিড নো-এসকিউএল ক্লাউড ক্লাস্টার।' : 'High speed NoSQL document database for dynamic schemas.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? '৫১২ এমবি ক্লাস্টার ফ্রি!' : '512MB Shared Free'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'mongodb' })}
                        className="w-full py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 5. Neon Postgres */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-teal-400">
                      {storeInfo?.cloudSubscriptionPlan === 'postgres_subscription' && (
                        <div className="absolute top-2 right-2 bg-teal-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-teal-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'নিয়ন সার্ভারলেস' : 'Neon Serverless'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? '০-সেকেন্ড কোল্ড স্টার্ট এবং ইনস্ট্যান্ট ব্রাঞ্চিং বিশিষ্ট পোস্টগ্রেস।' : 'Modern Postgres engine with automated sleep-to-zero.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? '০.৫ জিবি ডাটাবেস ফ্রি!' : '0.5GB SQL Free Tier'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'postgres' })}
                        className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 6. PlanetScale MySQL */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-rose-400">
                      {storeInfo?.cloudSubscriptionPlan === 'planetscale_subscription' && (
                        <div className="absolute top-2 right-2 bg-rose-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-rose-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'প্ল্যানেটস্কেল MySQL' : 'PlanetScale MySQL'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'ইনস্ট্যান্ট স্কিমা ব্রাঞ্চিং বিশিষ্ট আধুনিক নো-কোল্ড-স্টার্ট MySQL।' : 'High concurrency serverless MySQL with advanced scaling.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? 'ফ্রি ডেভেলপার ট্রায়াল!' : 'Free Developer Trial'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'planetscale' })}
                        className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 7. Render Database */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-fuchsia-400">
                      {storeInfo?.cloudSubscriptionPlan === 'render_subscription' && (
                        <div className="absolute top-2 right-2 bg-fuchsia-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-fuchsia-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'রেন্ডার ডাটাবেস' : 'Render PostgreSQL'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'সম্পূর্ণ ক্লাউড হোস্টেড রিলেশনাল পোস্টগ্রেস ম্যানেজড ডাটাবেজ।' : 'Fully managed PostgreSQL databases built for stable apps.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? 'পোস্টগ্রেস ৯০ দিন ফ্রী!' : 'PostgreSQL 90 Days Free'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'render' })}
                        className="w-full py-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 8. Railway Cloud */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-violet-400">
                      {storeInfo?.cloudSubscriptionPlan === 'railway_subscription' && (
                        <div className="absolute top-2 right-2 bg-violet-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-violet-600 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'রেলওয়ে ক্লাউড' : 'Railway Cloud'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'ইনস্ট্যান্ট এবং অটোমেটেড কন্টেইনারাইজড ডাটাবেজ প্রোভিশনিং।' : 'Deploy robust isolated SQL or key-value servers instantly.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? '৫ ডলার ফ্রী ক্রেডিট!' : '$5 Free Developer Credit'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'railway' })}
                        className="w-full py-1.5 bg-violet-700 hover:bg-violet-800 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 9. CockroachDB Serverless */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-emerald-400">
                      {storeInfo?.cloudSubscriptionPlan === 'cockroach_subscription' && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'ককরোচডিবি SQL' : 'CockroachDB SQL'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'অত্যন্ত নিরাপদ ডিস্ট্রিবিউটেড গ্লোবাল এসকিউএল ডাটাবেজ।' : 'Globally distributed PostgreSQL-compatible SQL database.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? '১০ জিবি ক্লাউড ফ্রী!' : '10GB Distributed Free'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'cockroach' })}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 10. Aiven */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-cyan-400">
                      {storeInfo?.cloudSubscriptionPlan === 'aiven_subscription' && (
                        <div className="absolute top-2 right-2 bg-cyan-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-cyan-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'আইভেন ডাটাবেস' : 'Aiven Managed DB'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'সম্পূর্ণ ম্যানেজড ওপেন-সোর্স পোস্টগ্রেস ও মাইএসকিউএল।' : 'Managed open-source SQL systems on AWS, GCP, and Azure.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? 'সম্পূর্ণ ফ্রী টিয়ার!' : 'Free Tier Database plans'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'aiven' })}
                        className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 11. Amazon DynamoDB */}
                    <div className="bg-orange-50/40 dark:bg-orange-950/10 rounded-xl border border-orange-200 dark:border-orange-900/40 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-orange-400">
                      {storeInfo?.cloudSubscriptionPlan === 'dynamodb_subscription' && (
                        <div className="absolute top-2 right-2 bg-orange-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-orange-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'অ্যামাজন ডায়নামোডিবি' : 'Amazon DynamoDB'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'হাই-স্পিড সার্ভারলেস কি-ভ্যালু নো-এসকিউএল ডাটাবেস।' : 'Ultra-low latency serverless NoSQL key-value store.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/50 px-2 py-0.5 rounded">
                            {language === 'bn' ? '৩৫ জিবি লাইফটাইম ফ্রী!' : 'FREE 35GB LIFETIME STORAGE'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'dynamodb' })}
                        className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 12. Azure SQL Database */}
                    <div className="bg-sky-50/40 dark:bg-sky-950/10 rounded-xl border border-sky-200 dark:border-sky-900/40 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-sky-400">
                      {storeInfo?.cloudSubscriptionPlan === 'azuresql_subscription' && (
                        <div className="absolute top-2 right-2 bg-sky-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-sky-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'অ্যাযুর এসকিউএল' : 'Azure SQL DB'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'সম্পূর্ণ ম্যানেজড রিলেশনাল এমএস-এসকিউএল ইন্টেলিজেন্ট ইঞ্জিন।' : 'Enterprise-grade fully managed relational database.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/50 px-2 py-0.5 rounded">
                            {language === 'bn' ? '৩৫ জিবি লাইফটাইম ফ্রী!' : 'FREE 35GB CLOUD DATABASE'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'azuresql' })}
                        className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সেট আপ করুন' : 'Set Up'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 13. MySQL Custom Database */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between space-y-3 shadow-xs relative overflow-hidden transition-all hover:border-blue-400">
                      {storeInfo?.cloudSubscriptionPlan === 'mysql_subscription' && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-4 h-4 text-blue-500 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
                            {language === 'bn' ? 'মাইএসকিউএল কাস্টম' : 'MySQL Custom DB'}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {language === 'bn' ? 'সিপ্যানেল ও প্রথাগত কাস্টম মাইএসকিউএল কানেক্ট করুন।' : 'Connect traditional self-hosted or cPanel MySQL instances.'}
                        </p>
                        <div className="inline-flex">
                          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                            {language === 'bn' ? 'পে-অ্যাস-ইউ-গো ফ্রী!' : 'Pay-As-You-Go Free'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoogleSetupModal({ isOpen: true, type: 'mysql' })}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>
                          {storeInfo?.cloudSubscriptionPlan === 'mysql_subscription'
                            ? (language === 'bn' ? 'কনফিগার করুন' : 'Configure')
                            : (language === 'bn' ? 'সেট আপ করুন' : 'Set Up')}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* MULTI-TENANT STORAGE ISOLATION & PRIVACY GUARANTEE BANNER */}
                  <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl space-y-3 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-emerald-500 text-white p-1 rounded-lg">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        {language === 'bn' ? 'সার্বভৌম সেলার ক্লাউড ডেটা সিকিউরিটি শিল্ড' : 'Sovereign Tenant Isolation Shield'}
                      </h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {language === 'bn' 
                        ? 'অমরবাজার প্ল্যাটফর্মটি সম্পূর্ণ বিকেন্দ্রেয়করণ মাল্টি-টেন্যান্ট সিকিউরিটি আর্কিটেকচার দ্বারা ডিজাইন করা হয়েছে। আপনার ক্রয়কৃত বা গুগল ক্লাউড/ফায়ারবেস স্টোরেজের সমস্ত ফাইল, ক্রেডেনশিয়াল এবং প্রোডাক্ট ডেটাবেজ সম্পূর্ণরূপে আলাদা (আইসোলেটেড) থাকে। এক বিক্রেতার আপলোড করা কোনো ফাইল বা ছবি অন্য কোনো বিক্রেতা বা বহিরাগত কাস্টমার কোনোভাবেই দেখতে বা অ্যাক্সেস করতে পারবে না। আপনার ক্রেডেনশিয়াল কি-সমূহ সম্পূর্ণ এন্ড-টু-এন্ড এনক্রিপ্টেড।' 
                        : 'The AmarBazar platform is engineered with a strict, decentralized multi-tenant isolation shield. All files, custom storage credentials, and product assets uploaded to your Google Cloud or Firebase account remain completely isolated at the container level. Another vendor can NEVER view or access your catalog media or data.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-emerald-500/10">
                      <span>✓ Private Keys Encrypted</span>
                      <span>✓ Database Isolation Segments Active</span>
                      <span>✓ Zero Cross-Tenant Leakage</span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* ROLES & PERMISSIONS TAB */}
      {activeTab === 'roles_permissions' && (
        <SellerRolesPermissions storeId={storeInfo?.id} storeName={storeInfo?.storeName} />
      )}

      {/* STORE SETTINGS TAB */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveStoreSettings} className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-6">
            
            {/* Tab Header */}
            <div className="border-b pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span className="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </span>
                <span>Store Profile & Customization (দোকানের প্রোফাইল ও সেটিংস)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                এখানে আপনার দোকানের নাম, যোগাযোগের নম্বর, লোগো এবং অন্যান্য প্রয়োজনীয় সেটিংস পরিবর্তন করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* General Store Info */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b pb-1">General Settings (সাধারণ সেটিংস)</h4>
                
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Name (English) - দোকানের নাম (ইংরেজি):</label>
                  <input
                    type="text"
                    value={settingsStoreName}
                    onChange={(e) => setSettingsStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Name (Bangla) - দোকানের নাম (বাংলা):</label>
                  <input
                    type="text"
                    value={settingsStoreNameBn}
                    onChange={(e) => setSettingsStoreNameBn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Tagline / Description - দোকানের বিবরণ বা স্লোগান:</label>
                  <textarea
                    value={settingsDescription}
                    onChange={(e) => setSettingsDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Trade License Number (ট্রেড লাইসেন্স নম্বর):</label>
                  <input
                    type="text"
                    value={settingsTradeLicense}
                    onChange={(e) => setSettingsTradeLicense(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Payment & Brand Images */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b pb-1">Branding & Payout Settings (ব্র্যান্ডিং ও পেমেন্ট নম্বর)</h4>
                
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">bKash Payout Number (বিকাশ নম্বর):</label>
                  <input
                    type="text"
                    value={settingsBkashNumber}
                    onChange={(e) => setSettingsBkashNumber(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">আপনার অর্জিত টাকা এই বিকাশ নম্বরে পাঠানো হবে।</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Logo URL (লোগো লিংক):</label>
                  <input
                    type="text"
                    value={settingsLogoUrl}
                    onChange={(e) => setSettingsLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Banner URL (ব্যানার লিংক):</label>
                  <input
                    type="text"
                    value={settingsBannerUrl}
                    onChange={(e) => setSettingsBannerUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                  <span className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Store Operation Mode (দোকান খোলা/বন্ধ রাখুন):</span>
                  <div className="flex items-center space-x-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsStoreOpen(!isStoreOpen)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                        isStoreOpen 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
                      }`}
                    >
                      {isStoreOpen ? 'Active (খোলা)' : 'Maintenance (বন্ধ)'}
                    </button>
                    <p className="text-[10px] text-slate-400">ছুটির দিনে বা স্টক না থাকলে দোকান সাময়িকভাবে বন্ধ করতে পারবেন।</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Delivery Charge Setup */}
            <div className="border-t pt-4 text-xs space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-pink-500" />
                <span>Delivery Charge Settings (ডেলিভারি চার্জ এবং সময় নির্ধারণ)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Inside Dhaka Fee (ঢাকার ভিতরে ডেলিভারি চার্জ):</label>
                  <input
                    type="number"
                    value={deliveryFeeInside}
                    onChange={(e) => setDeliveryFeeInside(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Outside Dhaka Fee (ঢাকার বাইরে ডেলিভারি চার্জ):</label>
                  <input
                    type="number"
                    value={deliveryFeeOutside}
                    onChange={(e) => setDeliveryFeeOutside(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Delivery Time (ডেলিভারি সময়):</label>
                  <select
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold"
                  >
                    <option value="24 Hours">24 Hours (১ দিন)</option>
                    <option value="2-3 Days">2-3 Days (২-৩ দিন)</option>
                    <option value="4-7 Days">4-7 Days (৪-৭ দিন)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vendor Cloud Storage Setup */}
            <div className="border-t pt-5 text-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Cloud className="w-4 h-4 text-sky-500 animate-pulse" />
                  <span>Vendor Cloud Storage Routing (ব্যক্তিগত ক্লাউড স্টোরেজ ও মিডিয়া রাউটিং)</span>
                </h4>
                <span className="bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase">
                  Data Sovereignty (ডেটা সিকিউরিটি)
                </span>
              </div>

              <p className="text-[11px] text-slate-500 max-w-2xl leading-relaxed">
                {language === 'bn' 
                  ? 'আপনার পণ্য সামগ্রীর ছবি ও ভিডিও সরাসরি আপনার ব্যক্তিগত ক্লাউড হোস্টিং বা ফায়ারবেস বাকেটে আপলোড করতে পারেন। এতে করে আপনার ডেটা আপনার মালিকানাধীন থাকবে এবং আমাদের ডাটাবেজে শুধুমাত্র মিডিয়া লিংকটি সংরক্ষিত হবে।'
                  : 'Maintain complete ownership of your product media by uploading assets directly to your personal Google Cloud or Firebase Storage bucket. Our central database will only store the resolved public URL.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsStorageType('central');
                    setSettingsStorageCredentials('');
                    setStorageTestMessage(null);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                    settingsStorageType === 'central'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs ring-1 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">Central Storage</span>
                    <Database className={`w-4 h-4 ${settingsStorageType === 'central' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {language === 'bn' ? 'অমরবাজারের সেন্ট্রাল হোস্টিং স্টোরেজ ব্যবহার করুন (ডিফল্ট)।' : 'Use default high-speed central AmarBazar cloud server storage.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsStorageType('google_cloud');
                    setStorageTestMessage(null);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                    settingsStorageType === 'google_cloud'
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 shadow-xs ring-1 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">Google Cloud (GCS)</span>
                    <Cloud className={`w-4 h-4 ${settingsStorageType === 'google_cloud' ? 'text-sky-500' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {language === 'bn' ? 'সরাসরি গুগল ক্লাউড স্টোরেজ (GCS) বাকেটে মিডিয়া পাঠান।' : 'Route media directly to your own Google Cloud Service Account bucket.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsStorageType('firebase');
                    setStorageTestMessage(null);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                    settingsStorageType === 'firebase'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs ring-1 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">Firebase Storage</span>
                    <Database className={`w-4 h-4 ${settingsStorageType === 'firebase' ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {language === 'bn' ? 'ফায়ারবেস স্টোরেজ রুলস ও বাকেট দিয়ে ডেটা হোস্ট করুন।' : 'Directly stream to Firebase Web App Client Storage bucket.'}
                  </p>
                </button>
              </div>

              {settingsStorageType !== 'central' && (
                <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                      <Lock className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        {settingsStorageType === 'google_cloud' 
                          ? 'Google Cloud (GCS) Credentials (JSON Format)' 
                          : 'Firebase Configuration JSON'}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {settingsStorageType === 'google_cloud' ? 'GCS Bucket Auth' : 'Firebase Client Config'}
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'bn' ? 'ক্লাউড ক্রেডেনশিয়াল (প্রমাণপত্র JSON):' : 'Credentials Config JSON:'}
                    </label>
                    <textarea
                      value={settingsStorageCredentials}
                      onChange={(e) => setSettingsStorageCredentials(e.target.value)}
                      placeholder={
                        settingsStorageType === 'google_cloud'
                          ? `{\n  "project_id": "your-gcp-project",\n  "client_email": "gcs-uploader@project.iam.gserviceaccount.com",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6...\\n-----END PRIVATE KEY-----\\n",\n  "bucket_name": "your-personal-bucket"\n}`
                          : `{\n  "apiKey": "AIzaSyAs7...",\n  "authDomain": "your-app.firebaseapp.com",\n  "projectId": "your-app",\n  "storageBucket": "your-app.appspot.com"\n}`
                      }
                      rows={6}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 font-mono text-[11px] leading-relaxed"
                    />
                    <div className="flex items-start space-x-1 mt-2 text-slate-400">
                      <span className="text-amber-500 font-extrabold">⚠️</span>
                      <p className="text-[10px] leading-normal">
                        {language === 'bn'
                          ? 'দয়া করে নিশ্চিত করুন এটি একটি বৈধ JSON ফর্ম্যাট। আপনার প্রাইভেট কি এবং ক্রেডেনশিয়াল আমাদের সিকিউর নোডে এনক্রিপ্ট করে সংরক্ষণ করা হবে।'
                          : 'Please ensure valid JSON syntax. Keys are strictly encrypted server-side and never shared in client responses.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isTestingStorage}
                      onClick={handleTestStorageConnection}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Wifi className={`w-3.5 h-3.5 ${isTestingStorage ? 'animate-bounce' : ''}`} />
                      <span>{isTestingStorage ? 'Testing Connection...' : 'Test Cloud Connection'}</span>
                    </button>

                    {storageTestMessage && (
                      <div className={`px-3 py-2 rounded-xl flex items-center space-x-2 text-[11px] border ${
                        storageTestMessage.success 
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                          : 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      }`}>
                        <span className="font-extrabold">{storageTestMessage.success ? '✓ SUCCESS:' : '✗ ERROR:'}</span>
                        <span>{storageTestMessage.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Save Settings (সেটিংস সংরক্ষণ করুন)
              </button>
            </div>

          </div>

          {/* Seller Password Change Security Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span className="p-1.5 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-xl">
                  <Lock className="w-5 h-5" />
                </span>
                <span>Security & Password (সেলার সিকিউরিটি ও পাসওয়ার্ড পরিবর্তন)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'bn' 
                  ? 'আপনার সেলার একাউন্টের পাসওয়ার্ড পরিবর্তন করুন। পরিবর্তন করলে পূর্ববর্তী পাসওয়ার্ড স্বয়ংক্রিয়ভাবে অকার্যকর হবে এবং শুধুমাত্র নতুন পাসওয়ার্ড দিয়ে লগইন করা যাবে।'
                  : 'Change your seller account password. Updating the password will immediately invalidate the previous password.'}
              </p>
            </div>

            {sellerPassMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold border ${
                sellerPassMsg.success 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
              }`}>
                {sellerPassMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'বর্তমান পাসওয়ার্ড:' : 'Current Password:'}
                </label>
                <input
                  type="password"
                  value={sellerOldPassword}
                  onChange={(e) => setSellerOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'নতুন পাসওয়ার্ড:' : 'New Password:'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={sellerNewPassword}
                  onChange={(e) => setSellerNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন:' : 'Confirm New Password:'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={sellerConfirmPassword}
                  onChange={(e) => setSellerConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSellerChangePassword}
                disabled={sellerPassLoading}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{sellerPassLoading ? 'Updating...' : (language === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password')}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] sm:max-h-[85vh] text-xs overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 p-4 sm:p-5 font-bold text-sm shrink-0">
              <span className="text-slate-900 dark:text-white font-extrabold text-base">Add New Marketplace Listing</span>
              <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Product Title (English):</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Walton Smart Watch W1"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Product Title (Bangla বাংলা):</label>
                <input
                  type="text"
                  value={newTitleBn}
                  onChange={(e) => setNewTitleBn(e.target.value)}
                  placeholder="e.g. ওয়ালটন স্মার্ট ওয়াচ ডব্লিউ ১"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Regular Price (৳):</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="2500"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Discount Price (৳):</label>
                  <input
                    type="number"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    placeholder="1990"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stock Quantity:</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Brand Name (ব্র্যান্ড):</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g. Walton, Samsung"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Warranty (ওয়ারেন্টি):</label>
                  <select
                    value={newWarranty}
                    onChange={(e) => setNewWarranty(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="No Warranty">No Warranty (ওয়ারেন্টি নেই)</option>
                    <option value="6 Months Warranty">6 Months (৬ মাস)</option>
                    <option value="1 Year Warranty">1 Year (১ বছর)</option>
                    <option value="2 Years Warranty">2 Years (২ বছর)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Product Quality (পণ্যের কোয়ালিটি):</label>
                  <select
                    value={newQuality}
                    onChange={(e) => setNewQuality(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Premium">Premium (সেরা কোয়ালিটি)</option>
                    <option value="Standard">Standard (স্ট্যান্ডার্ড)</option>
                    <option value="A-Grade">A-Grade (এ-গ্রেড)</option>
                    <option value="Economy">Economy / Budget (বাজেট ফ্রেন্ডলি)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Measurement Unit (পরিমাপের একক):</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Piece">Piece (টি/পিস)</option>
                    <option value="Kg">Kg (কেজি)</option>
                    <option value="Litre">Litre (লিটার)</option>
                    <option value="Box">Box (বক্স)</option>
                    <option value="Pack">Pack (প্যাকেট)</option>
                  </select>
                </div>
              </div>

              {/* Combo Pack Selector (Add Product) */}
              <div className="border border-slate-200 dark:border-slate-700/60 p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                      {language === 'bn' ? 'কম্বো প্যাকেজ হিসেবে বিক্রি করুন' : 'Sell as a Combo Package'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {language === 'bn' ? 'একাধিক পণ্য একসাথে একটি প্যাকেজে বিশেষ ছাড়ে বিক্রি করুন' : 'Bundle multiple products together for a promotional package.'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isNewCombo}
                    onChange={(e) => {
                      setIsNewCombo(e.target.checked);
                      if (e.target.checked && newComboItems.length === 0 && sellerProducts.length > 0) {
                        setNewComboItems([{ productId: sellerProducts[0].id, quantity: 1 }]);
                      }
                    }}
                    className="w-4.5 h-4.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {isNewCombo && (
                  <div className="space-y-3 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <label className="block font-semibold mb-1 text-slate-500">
                      {language === 'bn' ? 'কম্বো পণ্যসমূহ নির্বাচন করুন:' : 'Select products to bundle:'}
                    </label>

                    {sellerProducts.length === 0 ? (
                      <p className="text-[11px] text-amber-500 italic">
                        {language === 'bn' ? 'কোন পণ্য পাওয়া যায়নি। কম্বো তৈরি করতে প্রথমে সাধারণ পণ্য যোগ করুন।' : 'No other products found. Add standard products first to create a combo.'}
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                        {sellerProducts.map((p) => {
                          const existingItem = newComboItems.find(item => item.productId === p.id);
                          const isChecked = !!existingItem;

                          const handleCheckboxChange = (checked: boolean) => {
                            if (checked) {
                              setNewComboItems([...newComboItems, { productId: p.id, quantity: 1 }]);
                            } else {
                              setNewComboItems(newComboItems.filter(item => item.productId !== p.id));
                            }
                          };

                          const handleQtyChange = (val: number) => {
                            if (val < 1) return;
                            setNewComboItems(newComboItems.map(item => 
                              item.productId === p.id ? { ...item, quantity: val } : item
                            ));
                          };

                          return (
                            <div key={p.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-xs gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleCheckboxChange(e.target.checked)}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <img src={p.images[0]} className="w-8 h-8 rounded object-cover shrink-0 bg-slate-100" />
                                <div className="truncate">
                                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{language === 'bn' ? p.titleBn || p.title : p.title}</p>
                                  <p className="text-[10px] text-slate-400">৳{p.discountPrice || p.price}</p>
                                </div>
                              </div>

                              {isChecked && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange((existingItem?.quantity || 1) - 1)}
                                    className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono w-5 text-center font-bold">{existingItem?.quantity || 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange((existingItem?.quantity || 1) + 1)}
                                    className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Pricing Summary calculations */}
                    {newComboItems.length > 0 && (
                      <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 p-3 rounded-xl space-y-2 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{language === 'bn' ? 'সাধারণ মোট মূল্য:' : 'Regular Item Sum:'}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            ৳{newComboItems.reduce((acc, item) => {
                              const prod = sellerProducts.find(p => p.id === item.productId);
                              return acc + (prod ? (prod.discountPrice || prod.price) * item.quantity : 0);
                            }, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{language === 'bn' ? 'প্রস্তাবিত কম্বো অফার (১৫% ছাড়):' : 'Suggested Combo (15% Off):'}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{Math.round(newComboItems.reduce((acc, item) => {
                              const prod = sellerProducts.find(p => p.id === item.productId);
                              return acc + (prod ? (prod.discountPrice || prod.price) * item.quantity : 0);
                            }, 0) * 0.85)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const total = newComboItems.reduce((acc, item) => {
                              const prod = sellerProducts.find(p => p.id === item.productId);
                              return acc + (prod ? (prod.discountPrice || prod.price) * item.quantity : 0);
                            }, 0);
                            setNewPrice(String(total));
                            setNewDiscount(String(Math.round(total * 0.85)));
                          }}
                          className="w-full mt-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                        >
                          {language === 'bn' ? 'অফারের মূল্য সেট করুন' : 'Apply Offer Pricing'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {renderPricingAndOffersConfig(
                newVariants,
                setNewVariants,
                newVariantPrices,
                setNewVariantPrices,
                newBulkOffers,
                setNewBulkOffers,
                newVarGroupName,
                setNewVarGroupName,
                newVarOptionsInput,
                setNewVarOptionsInput
              )}

              <div>
                <label className="block font-semibold mb-1">Image URL (ছবির লিংক):</label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Product Description (পণ্যের বিবরণ):</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="এখানে আপনার পণ্যের বিস্তারিত বিবরণ লিখুন..."
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shrink-0"
              >
                Save & Publish Listing (পণ্য পাবলিশ করুন)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {isEditProductOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] sm:max-h-[85vh] text-xs overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 p-4 sm:p-5 font-bold text-sm shrink-0">
              <span className="text-slate-900 dark:text-white font-extrabold text-base">Edit Product Listing (পণ্য সম্পাদনা করুন)</span>
              <button onClick={() => { setIsEditProductOpen(false); setEditingProduct(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Product Title (English) - পণ্যের নাম (ইংরেজি):</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Product Title (Bangla) - পণ্যের নাম (বাংলা):</label>
                <input
                  type="text"
                  value={editTitleBn}
                  onChange={(e) => setEditTitleBn(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Regular Price (৳) - সাধারণ দাম (৳):</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 font-bold text-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Discount Price (৳) - অফার মূল্য (৳):</label>
                  <input
                    type="number"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category (ক্যাটাগরি):</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stock Quantity (স্টক সংখ্যা):</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Brand (ব্র্যান্ড):</label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Warranty (ওয়ারেন্টি):</label>
                  <select
                    value={editWarranty}
                    onChange={(e) => setEditWarranty(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="No Warranty">No Warranty (ওয়ারেন্টি নেই)</option>
                    <option value="6 Months Warranty">6 Months (৬ মাস)</option>
                    <option value="1 Year Warranty">1 Year (১ বছর)</option>
                    <option value="2 Years Warranty">2 Years (২ বছর)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Product Quality (পণ্যের কোয়ালিটি):</label>
                  <select
                    value={editQuality}
                    onChange={(e) => setEditQuality(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Premium">Premium (সেরা কোয়ালিটি)</option>
                    <option value="Standard">Standard (স্ট্যান্ডার্ড)</option>
                    <option value="A-Grade">A-Grade (এ-গ্রেড)</option>
                    <option value="Economy">Economy / Budget (বাজেট ফ্রেন্ডলি)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Measurement Unit (পরিমাপের একক):</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Piece">Piece (টি/পিস)</option>
                    <option value="Kg">Kg (কেজি)</option>
                    <option value="Litre">Litre (লিটার)</option>
                    <option value="Box">Box (বক্স)</option>
                    <option value="Pack">Pack (প্যাকেট)</option>
                  </select>
                </div>
              </div>

              {/* Combo Pack Selector (Edit Product) */}
              <div className="border border-slate-200 dark:border-slate-700/60 p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                      {language === 'bn' ? 'কম্বো প্যাকেজ হিসেবে বিক্রি করুন' : 'Sell as a Combo Package'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {language === 'bn' ? 'একাধিক পণ্য একসাথে একটি প্যাকেজে বিশেষ ছাড়ে বিক্রি করুন' : 'Bundle multiple products together for a promotional package.'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEditCombo}
                    onChange={(e) => {
                      setIsEditCombo(e.target.checked);
                      if (e.target.checked && editComboItems.length === 0) {
                        const selectable = sellerProducts.filter(p => p.id !== editingProduct?.id);
                        if (selectable.length > 0) {
                          setEditComboItems([{ productId: selectable[0].id, quantity: 1 }]);
                        }
                      }
                    }}
                    className="w-4.5 h-4.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {isEditCombo && (
                  <div className="space-y-3 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <label className="block font-semibold mb-1 text-slate-500">
                      {language === 'bn' ? 'কম্বো পণ্যসমূহ নির্বাচন করুন:' : 'Select products to bundle:'}
                    </label>

                    {sellerProducts.filter(p => p.id !== editingProduct?.id).length === 0 ? (
                      <p className="text-[11px] text-amber-500 italic">
                        {language === 'bn' ? 'অন্য কোন পণ্য পাওয়া যায়নি। কম্বো তৈরি করতে অন্য পণ্য থাকতে হবে।' : 'No other products found. Add more products first to build a combo.'}
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                        {sellerProducts.filter(p => p.id !== editingProduct?.id).map((p) => {
                          const existingItem = editComboItems.find(item => item.productId === p.id);
                          const isChecked = !!existingItem;

                          const handleCheckboxChange = (checked: boolean) => {
                            if (checked) {
                              setEditComboItems([...editComboItems, { productId: p.id, quantity: 1 }]);
                            } else {
                              setEditComboItems(editComboItems.filter(item => item.productId !== p.id));
                            }
                          };

                          const handleQtyChange = (val: number) => {
                            if (val < 1) return;
                            setEditComboItems(editComboItems.map(item => 
                              item.productId === p.id ? { ...item, quantity: val } : item
                            ));
                          };

                          return (
                            <div key={p.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-xs gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleCheckboxChange(e.target.checked)}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <img src={p.images[0]} className="w-8 h-8 rounded object-cover shrink-0 bg-slate-100" />
                                <div className="truncate">
                                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{language === 'bn' ? p.titleBn || p.title : p.title}</p>
                                  <p className="text-[10px] text-slate-400">৳{p.discountPrice || p.price}</p>
                                </div>
                              </div>

                              {isChecked && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange((existingItem?.quantity || 1) - 1)}
                                    className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono w-5 text-center font-bold">{existingItem?.quantity || 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange((existingItem?.quantity || 1) + 1)}
                                    className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Pricing Summary calculations */}
                    {editComboItems.length > 0 && (
                      <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 p-3 rounded-xl space-y-2 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{language === 'bn' ? 'সাধারণ মোট মূল্য:' : 'Regular Item Sum:'}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            ৳{editComboItems.reduce((acc, item) => {
                              const prod = sellerProducts.find(p => p.id === item.productId);
                              return acc + (prod ? (prod.discountPrice || prod.price) * item.quantity : 0);
                            }, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{language === 'bn' ? 'প্রস্তাবিত কম্বো অফার (১৫% ছাড়):' : 'Suggested Combo (15% Off):'}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{Math.round(editComboItems.reduce((acc, item) => {
                              const prod = sellerProducts.find(p => p.id === item.productId);
                              return acc + (prod ? (prod.discountPrice || prod.price) * item.quantity : 0);
                            }, 0) * 0.85)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const total = editComboItems.reduce((acc, item) => {
                              const prod = sellerProducts.find(p => p.id === item.productId);
                              return acc + (prod ? (prod.discountPrice || prod.price) * item.quantity : 0);
                            }, 0);
                            setEditPrice(String(total));
                            setEditDiscount(String(Math.round(total * 0.85)));
                          }}
                          className="w-full mt-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                        >
                          {language === 'bn' ? 'অফারের মূল্য সেট করুন' : 'Apply Offer Pricing'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {renderPricingAndOffersConfig(
                editVariants,
                setEditVariants,
                editVariantPrices,
                setEditVariantPrices,
                editBulkOffers,
                setEditBulkOffers,
                editVarGroupName,
                setEditVarGroupName,
                editVarOptionsInput,
                setEditVarOptionsInput
              )}

              <div>
                <label className="block font-semibold mb-1">Product Image URL (পণ্যের ছবি লিংক):</label>
                <input
                  type="text"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Product Description (পণ্যের বিবরণ):</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                  placeholder="পণ্যের বিস্তারিত বিবরণ এখানে লিখুন..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shrink-0"
              >
                Update Product Listing (পণ্য আপডেট করুন)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAWAL MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2 font-bold text-sm">
              <span>Request Payout</span>
              <button onClick={() => setIsWithdrawModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Withdrawal Amount (৳):</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Payout Method:</label>
                <select
                  value={withdrawMethod}
                  onChange={(e: any) => setWithdrawMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 font-bold"
                >
                  <option value="bkash">bKash Merchant / Personal</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank">Bank Wire Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Mobile / Account Number:</label>
                <input
                  type="text"
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION CHECKOUT MODAL (bKash / Nagad Gateway Simulation) */}
      {isCheckoutModalOpen && selectedCheckoutPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-pink-700 text-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col font-sans text-xs">
            {/* Header / Brand Selector */}
            <div className="p-4 bg-pink-800 flex justify-between items-center border-b border-pink-600">
              <div className="flex items-center space-x-2">
                <div className="bg-white text-pink-700 px-2 py-1 rounded font-black tracking-widest text-sm font-mono">
                  {checkoutMethod.toUpperCase()}
                </div>
                <span className="font-bold text-[11px]">Payment Gateway Simulation</span>
              </div>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-white hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gateway Logo banner */}
            <div className="p-4 bg-pink-600 text-center text-xs border-b border-pink-500">
              <p className="font-semibold text-pink-100">Merchant: AmarBazar Subscriptions</p>
              <h3 className="text-lg font-black mt-1">
                Amount: ৳{selectedCheckoutPlan === 'starter' 
                  ? (systemSettings.starterPrice ?? 500) 
                  : selectedCheckoutPlan === 'business' 
                  ? (systemSettings.businessPrice ?? 1500) 
                  : selectedCheckoutPlan === 'enterprise' 
                  ? (systemSettings.enterprisePrice ?? 3000) 
                  : selectedCheckoutPlan === 'gcs_subscription' 
                  ? 500 
                  : selectedCheckoutPlan === 'firebase_subscription' 
                  ? 300 
                  : 0}
              </h3>
            </div>

            {/* Steps panel */}
            <div className="p-6 space-y-4 bg-pink-700 min-h-[220px] flex flex-col justify-between">
              
              {checkoutStep === 'phone' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="font-bold text-xs text-pink-100">Enter Your bKash / Nagad / Rocket Wallet Number</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full text-center px-4 py-3 border-none rounded-xl text-black font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div className="flex gap-2 justify-center text-[10px] text-pink-200">
                    <button 
                      type="button" 
                      onClick={() => setCheckoutMethod('bkash')}
                      className={`px-3 py-1 rounded ${checkoutMethod === 'bkash' ? 'bg-white text-pink-700 font-bold' : 'bg-pink-800'}`}
                    >
                      bKash
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setCheckoutMethod('nagad')}
                      className={`px-3 py-1 rounded ${checkoutMethod === 'nagad' ? 'bg-white text-pink-700 font-bold' : 'bg-pink-800'}`}
                    >
                      Nagad
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setCheckoutMethod('rocket')}
                      className={`px-3 py-1 rounded ${checkoutMethod === 'rocket' ? 'bg-white text-pink-700 font-bold' : 'bg-pink-800'}`}
                    >
                      Rocket
                    </button>
                  </div>
                  <button
                    onClick={() => setCheckoutStep('otp')}
                    className="w-full py-3 bg-white hover:bg-slate-100 text-pink-700 font-black rounded-xl transition cursor-pointer text-center block text-xs"
                  >
                    Proceed (পরবর্তী ধাপ)
                  </button>
                </div>
              )}

              {checkoutStep === 'otp' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="font-bold text-xs text-pink-100">Enter 6-Digit OTP Sent to {checkoutPhone}</p>
                    <p className="text-[10px] text-pink-200 mt-1">(You can use any mock code, e.g., 123456)</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={checkoutOtp}
                      onChange={(e) => setCheckoutOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full text-center px-4 py-3 border-none rounded-xl text-black font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-pink-400 tracking-widest"
                    />
                  </div>
                  <button
                    onClick={() => setCheckoutStep('pin')}
                    className="w-full py-3 bg-white hover:bg-slate-100 text-pink-700 font-black rounded-xl transition cursor-pointer text-center block text-xs"
                  >
                    Verify OTP (ওটিপি যাচাই করুন)
                  </button>
                </div>
              )}

              {checkoutStep === 'pin' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="font-bold text-xs text-pink-100">Enter Your Wallet 4-Digit PIN Securely</p>
                    <p className="text-[10px] text-pink-200 mt-1">(Simulated secure sandbox PIN validation)</p>
                  </div>
                  <div>
                    <input
                      type="password"
                      value={checkoutPin}
                      onChange={(e) => setCheckoutPin(e.target.value)}
                      maxLength={4}
                      placeholder="••••"
                      className="w-full text-center px-4 py-3 border-none rounded-xl text-black font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-pink-400 tracking-widest"
                    />
                  </div>
                  <button
                    onClick={handleConfirmSubscriptionPayment}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition cursor-pointer text-center block text-xs shadow-md"
                  >
                    Confirm Payment (পেমেন্ট নিশ্চিত করুন)
                  </button>
                </div>
              )}

              {/* Warning/Terms footer */}
              <div className="text-[9px] text-center text-pink-200 border-t border-pink-600 pt-2.5 mt-2">
                This is a secure mock payment sandbox. No real money will be charged.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE CLOUD / FIREBASE / DATABASE DIRECT SETUP & ACTIVATION MODAL */}
      {googleSetupModal.isOpen && (() => {
        const getModalConfig = () => {
          switch(googleSetupModal.type) {
            case 'supabase':
              return {
                titleEn: 'Supabase Postgres Setup',
                titleBn: 'সুপাবেস ডাটাবেস সেটআপ',
                subtitleEn: 'Deploy & connect your real-time PostgreSQL database',
                subtitleBn: 'রিয়েলটাইম পোস্টগ্রেস রিলেশনাল ডাটাবেজ',
                buyTitleEn: 'Secure Supabase Connection!',
                buyTitleBn: 'নিরাপদ সুপাবেস কানেকশন!',
                buyDescEn: 'Integrate Supabase directly for decentralized, highly-secure relational catalog storage.',
                buyDescBn: 'অমরবাজার ড্যাশবোর্ডে সরাসরি সুপাবেস কানেক্ট করে স্বাধীন ও নিরাপদ রিলেশনাল ক্যাটালগ স্টোরেজ ব্যবহার করুন।',
                steps: [
                  { bn: 'supabase.com এ যান এবং একটি নতুন ফ্রী প্রজেক্ট তৈরি করুন।', en: 'Go to supabase.com and create a new free project.' },
                  { bn: 'Project Settings থেকে Connection String এবং API Keys কপি করুন।', en: 'Find Connection String and API Keys in Project Settings.' },
                  { bn: 'নিরাপত্তা নিশ্চিত করার জন্য Row Level Security (RLS) সক্রিয় করুন।', en: 'Enable Row Level Security (RLS) for data protection.' }
                ],
                portalLink: 'https://supabase.com/',
                portalTextEn: 'Go to Supabase Console',
                portalTextBn: 'সুপাবেস কনসোলে যান (Supabase Console)',
                colorClass: 'bg-violet-600 hover:bg-violet-700',
                planType: 'supabase_subscription' as const,
                iconColor: 'bg-violet-50 dark:bg-violet-950/40 text-violet-500'
              };
            case 'mongodb':
              return {
                titleEn: 'MongoDB Atlas Setup',
                titleBn: 'মঙ্গোডিবি নো-এসকিউএল সেটআপ',
                subtitleEn: 'Deploy & stream data into document-based NoSQL clusters',
                subtitleBn: 'ডকুমেন্ট-ভিত্তিক হাই-স্পিড নো-এসকিউএল ক্লাস্টার',
                buyTitleEn: 'Deploy MongoDB Atlas!',
                buyTitleBn: 'মঙ্গোডিবি অ্যাটলাস স্থাপন করুন!',
                buyDescEn: 'Run on high-speed NoSQL clusters to manage complex catalog schemas independently.',
                buyDescBn: 'ডকুমেন্ট ভিত্তিক মঙ্গোডিবি ক্লাস্টার ব্যবহার করে স্বাধীন ও ডাইনামিক স্কিমা পরিচালনা করুন।',
                steps: [
                  { bn: 'mongodb.com/cloud/atlas এ সাইনআপ করুন এবং ফ্রি ক্লাস্টার তৈরি করুন।', en: 'Sign up on mongodb.com/cloud/atlas and build a free cluster.' },
                  { bn: 'Database Access এ গিয়ে ডাটাবেজ ইউজারনেম এবং পাসওয়ার্ড নির্ধারণ করুন।', en: 'Go to Database Access and define database user & password.' },
                  { bn: 'Connect বাটনে ক্লিক করে Node.js Connection String কপি করুন।', en: 'Click Connect and copy the Node.js Connection String URI.' }
                ],
                portalLink: 'https://www.mongodb.com/cloud/atlas',
                portalTextEn: 'Go to MongoDB Atlas',
                portalTextBn: 'মঙ্গোডিবি কনসোলে যান (MongoDB Atlas)',
                colorClass: 'bg-green-600 hover:bg-green-700',
                planType: 'mongodb_subscription' as const,
                iconColor: 'bg-green-50 dark:bg-green-950/40 text-green-500'
              };
            case 'postgres':
              return {
                titleEn: 'Neon Serverless Postgres Setup',
                titleBn: 'নিয়ন পোস্টগ্রেস সেটআপ',
                subtitleEn: 'Connect serverless Postgres with instant branching',
                subtitleBn: 'সার্ভারলেস পোস্টগ্রেস ডাটাবেজ ইনস্ট্যান্ট ব্রাঞ্চিংসহ',
                buyTitleEn: 'Connect Neon Database!',
                buyTitleBn: 'নিয়ন ডাটাবেস সংযোগ করুন!',
                buyDescEn: 'Experience serverless Postgres with autoscaling and zero-cold starts on Neon.',
                buyDescBn: 'নিয়ন ডাটাবেজে অটোস্কেলিং ও ০-সেকেন্ড কোল্ড স্টার্ট পোস্টগ্রেস ইঞ্জিন ব্যবহার করুন।',
                steps: [
                  { bn: 'neon.tech এ যান এবং একটি ফ্রী সার্ভারলেস প্রজেক্ট তৈরি করুন।', en: 'Go to neon.tech and create a free serverless project.' },
                  { bn: 'ড্যাশবোর্ড থেকে সরাসরি Connection Details কপি করুন।', en: 'Copy the Connection Details connection string from Neon dashboard.' },
                  { bn: 'আপনার অমরবাজার ড্যাশবোর্ডে কানেকশন স্ট্রিংটি পেস্ট করে সেভ করুন।', en: 'Paste the connection string in your AmarBazar settings to sync.' }
                ],
                portalLink: 'https://neon.tech/',
                portalTextEn: 'Go to Neon Dashboard',
                portalTextBn: 'নিয়ন ড্যাশবোর্ডে যান (Neon Dashboard)',
                colorClass: 'bg-teal-600 hover:bg-teal-700',
                planType: 'postgres_subscription' as const,
                iconColor: 'bg-teal-50 dark:bg-teal-950/40 text-teal-500'
              };
            case 'mysql':
              return {
                titleEn: 'MySQL Custom Database Connection',
                titleBn: 'মাইএসকিউএল ডাটাবেস সেটআপ',
                subtitleEn: 'Link traditional Relational database connections',
                subtitleBn: 'ঐতিহ্যবাহী মাইএসকিউএল রিলেショナル ডাটাবেজ সংযোগ',
                buyTitleEn: 'Connect Custom MySQL!',
                buyTitleBn: 'কাস্টম মাইএসকিউএল যুক্ত করুন!',
                buyDescEn: 'Link your self-hosted or cPanel MySQL database smoothly.',
                buyDescBn: 'আপনার সেলফ-হোস্টেড বা সিপ্যানেল মাইএসকিউএল ডাটাবেজের সরাসরি সংযোগ দিন।',
                steps: [
                  { bn: 'আপনার হোস্টিং কন্ট্রোল প্যানেল (cPanel/VPS) থেকে একটি MySQL ডাটাবেজ বানান।', en: 'Create a MySQL database from your hosting panel (cPanel or VPS).' },
                  { bn: 'একটি ডাটাবেজ ইউজার তৈরি করে ফুল প্রিভিলেজ দিন।', en: 'Create a database user and grant all privileges.' },
                  { bn: 'হোস্টনেম, পোর্ট, ইউজারনেম, পাসওয়ার্ড এবং ডাটাবেজ নেম কপি করুন।', en: 'Note down hostname, port, database name, username and password.' }
                ],
                portalLink: 'https://www.mysql.com/',
                portalTextEn: 'Go to MySQL Portal',
                portalTextBn: 'মাইএসকিউএল পোর্টালে যান (MySQL Portal)',
                colorClass: 'bg-blue-600 hover:bg-blue-700',
                planType: 'mysql_subscription' as const,
                iconColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-500'
              };
            case 'dynamodb':
              return {
                titleEn: 'Amazon DynamoDB Setup',
                titleBn: 'অ্যামাজন ডায়নামোডিবি নো-এসকিউএল সেটআপ',
                subtitleEn: 'Connect high-speed serverless NoSQL with free tier',
                subtitleBn: 'হাই-স্পিড সার্ভারলেস নো-এসকিউএল ২৫ জিবি ফ্রী স্টোরেজসহ',
                buyTitleEn: 'Secure Amazon DynamoDB Connection!',
                buyTitleBn: 'নিরাপদ অ্যামাজন ডায়নামোডিবি কানেকশন!',
                buyDescEn: 'Connect Amazon DynamoDB directly to enjoy up to 35GB of free storage with ultra-low latency key-value data access.',
                buyDescBn: 'সরাসরি ডায়নামোডিবি যুক্ত করুন এবং ৩৫ জিবি পর্যন্ত সম্পূর্ণ ফ্রি লাইফটাইম স্টোরেজ উপভোগ করুন অতি দ্রুত নো-এসকিউএল স্পিডে।',
                steps: [
                  { bn: 'AWS Console-এ সাইনইন করুন এবং DynamoDB সার্ভিস সিলেক্ট করুন।', en: 'Log in to AWS Console and navigate to the DynamoDB service.' },
                  { bn: 'একটি নতুন টেবিল তৈরি করুন অথবা ২৫ জিবি ফ্রী টিয়ার সক্রিয় করুন।', en: 'Create a new DynamoDB Table or utilize the AWS Free Tier (up to 35GB aggregate storage capacity).' },
                  { bn: 'IAM Settings থেকে Access Key ID এবং Secret Access Key সংগ্রহ করে কানেক্ট করুন।', en: 'Retrieve your IAM Access Key ID and Secret Access Key to authenticate.' }
                ],
                portalLink: 'https://aws.amazon.com/dynamodb/',
                portalTextEn: 'Go to AWS Console',
                portalTextBn: 'এডাব্লিউএস কনসোলে যান (AWS Console)',
                colorClass: 'bg-orange-600 hover:bg-orange-700',
                planType: 'dynamodb_subscription' as const,
                iconColor: 'bg-orange-50 dark:bg-orange-950/40 text-orange-500'
              };
            case 'azuresql':
              return {
                titleEn: 'Azure SQL Database Setup',
                titleBn: 'অ্যাযুর এসকিউএল রিলেশনাল সেটআপ',
                subtitleEn: 'Deploy fully managed SQL database with free tier storage',
                subtitleBn: 'সম্পূর্ণ ম্যানেজড রিলেশনাল এমএস-এসকিউএল ফ্রী স্টোরেজসহ',
                buyTitleEn: 'Connect Azure SQL Database!',
                buyTitleBn: 'অ্যাযুর এসকিউএল ডাটাবেস সংযোগ দিন!',
                buyDescEn: 'Integrate Microsoft Azure SQL database directly with enterprise-grade protection and free 35GB benefits.',
                buyDescBn: 'মাইক্রোসফট অ্যাযুর এসকিউএল ডাটাবেজের সরাসরি সংযোগ দিন এবং এন্টারপ্রাইজ গ্রেড রিলেশনাল সিকিউরিটি ও ৩৫ জিবি ফ্রি বেনিফিট পান।',
                steps: [
                  { bn: 'Azure Portal-এ লগইন করুন এবং একটি Azure SQL Database প্রজেক্ট তৈরি করুন।', en: 'Sign in to Azure Portal and search for SQL Databases.' },
                  { bn: 'ফ্রি স্টোরেজ টিয়ার কনফিগার করে ৩৫ জিবি ডাটাবেজ ক্যাপাসিটি সেট করুন।', en: 'Select Serverless compute tier and configure up to 35GB of free database storage.' },
                  { bn: 'Connection Strings সেকশন থেকে ADO.NET / ODBC কানেকশন অবজেক্টটি কপি করুন।', en: 'Copy the database connection string from Connection Strings section.' }
                ],
                portalLink: 'https://portal.azure.com/',
                portalTextEn: 'Go to Azure Portal',
                portalTextBn: 'অ্যাযুর পোর্টালে যান (Azure Portal)',
                colorClass: 'bg-sky-600 hover:bg-sky-700',
                planType: 'azuresql_subscription' as const,
                iconColor: 'bg-sky-50 dark:bg-sky-950/40 text-sky-500'
              };
            case 'planetscale':
              return {
                titleEn: 'PlanetScale MySQL Setup',
                titleBn: 'প্ল্যানেটস্কেল মাইএসকিউএল সেটআপ',
                subtitleEn: 'Deploy highly scalable serverless MySQL',
                subtitleBn: 'সার্ভারলেস মাইএসকিউএল ডাটাবেজ স্কেলিং সাপোর্টসহ',
                buyTitleEn: 'Secure PlanetScale Connection!',
                buyTitleBn: 'নিরাপদ প্ল্যানেটস্কেল কানেকশন!',
                buyDescEn: 'Connect your serverless PlanetScale MySQL database with instant branching and unlimited connections.',
                buyDescBn: 'আপনার প্ল্যানেটস্কেল মাইএসকিউএল ডাটাবেজ ইন্টিগ্রেট করুন এবং ক্লাউড স্কেলিং ও ব্রাঞ্চিং সুবিধা পান।',
                steps: [
                  { bn: 'planetscale.com-এ সাইনইন করুন এবং একটি নতুন ডেটাবেস প্রজেক্ট তৈরি করুন।', en: 'Log in to planetscale.com and create a new database.' },
                  { bn: 'Connection Strings থেকে পাসওয়ার্ড ও হোস্টনেম ডিটেইলস জেনারেট করুন।', en: 'Create a new password and generate connection string details.' },
                  { bn: 'অমরবাজার সিকিউর কি সেটিংসে সংগৃহীত ক্রেডেনশিয়ালটি সেভ করুন।', en: 'Copy the details and save them securely in your database settings.' }
                ],
                portalLink: 'https://planetscale.com/',
                portalTextEn: 'Go to PlanetScale Console',
                portalTextBn: 'প্ল্যানেটস্কেল কনসোলে যান (PlanetScale)',
                colorClass: 'bg-rose-600 hover:bg-rose-700',
                planType: 'planetscale_subscription' as const,
                iconColor: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500'
              };
            case 'render':
              return {
                titleEn: 'Render Database Setup',
                titleBn: 'রেন্ডার ডাটাবেস ও সার্ভিস সেটআপ',
                subtitleEn: 'Deploy fully managed PostgreSQL with Render',
                subtitleBn: 'রেন্ডার ম্যানেজড পোস্টগ্রেস ডাটাবেজ ইন্টিগ্রেশন',
                buyTitleEn: 'Connect Render PostgreSQL!',
                buyTitleBn: 'রেন্ডার পোস্টগ্রেস কানেক্ট করুন!',
                buyDescEn: 'Link Render fully-managed PostgreSQL instance for stable storage with 90 days free tier benefits.',
                buyDescBn: 'রেন্ডার সম্পূর্ণ ম্যানেজড পোস্টগ্রেস কানেক্ট করুন এবং ৯০ দিনের ফ্রি ট্রায়াল সুবিধা উপভোগ করুন।',
                steps: [
                  { bn: 'dashboard.render.com-এ লগইন করুন এবং New > PostgreSQL সিলেক্ট করুন।', en: 'Log in to dashboard.render.com and select New > PostgreSQL.' },
                  { bn: 'ডাটাবেজ নেম ও পাসওয়ার্ড দিয়ে রিজিয়ন সিলেক্ট করে ফ্রি টিয়ারে ডিক্লেয়ার করুন।', en: 'Configure database fields, select region and start on the free tier.' },
                  { bn: 'External Connection String-টি ড্যাশবোর্ড থেকে কপি করে অমরবাজারে সেভ করুন।', en: 'Copy the External Connection String and paste it into AmarBazar.' }
                ],
                portalLink: 'https://render.com/',
                portalTextEn: 'Go to Render Dashboard',
                portalTextBn: 'রেন্ডার ড্যাশবোর্ডে যান (Render)',
                colorClass: 'bg-fuchsia-600 hover:bg-fuchsia-700',
                planType: 'render_subscription' as const,
                iconColor: 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-500'
              };
            case 'railway':
              return {
                titleEn: 'Railway Service Setup',
                titleBn: 'রেলওয়ে ক্লাউড ডাটাবেস সেটআপ',
                subtitleEn: 'Connect database services with $5 developer trial credits',
                subtitleBn: 'রেলওয়ে ডাটাবেস ৫ ডলার ফ্রী ডেভেলপার ক্রেডিটসহ',
                buyTitleEn: 'Connect Railway Instance!',
                buyTitleBn: 'রেলওয়ে ডাটাবেস সার্ভিস চালু করুন!',
                buyDescEn: 'Connect fully isolated databases with automatic deployments and free trial credits.',
                buyDescBn: 'রেলওয়ে ক্লাউড ডাটাবেজ ইন্টিগ্রেট করুন এবং সম্পূর্ণ ফ্রি ডেভেলপার ট্রায়াল ক্রেডিট ব্যবহার করুন।',
                steps: [
                  { bn: 'railway.app-এ সাইনআপ করুন এবং একটি নতুন প্রজেক্ট প্রভিশন করুন।', en: 'Sign up on railway.app and provision a new database service (Postgres/MySQL).' },
                  { bn: 'Variables ট্যাব অথবা Connection URL থেকে সিকিউর ইউআরআই সংগ্রহ করুন।', en: 'Retrieve your database Connection URL from the Variables or Connect tab.' },
                  { bn: 'কানেকশন স্ট্রিংটি অমরবাজার ডাটাবেজ ইনপুটে সেভ করে ইন্টিগ্রেট করুন।', en: 'Paste the connection string into the integration input here.' }
                ],
                portalLink: 'https://railway.app/',
                portalTextEn: 'Go to Railway Console',
                portalTextBn: 'রেলওয়ে কনসোলে যান (Railway)',
                colorClass: 'bg-violet-800 hover:bg-violet-900',
                planType: 'railway_subscription' as const,
                iconColor: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600'
              };
            case 'cockroach':
              return {
                titleEn: 'CockroachDB Serverless Setup',
                titleBn: 'ককরোচডিবি সার্ভারলেস সেটআপ',
                subtitleEn: 'Connect global distributed SQL database with 10GB free',
                subtitleBn: 'গ্লোবাল নো-কোল্ড-স্টার্ট ডিস্ট্রিবিউটেড এসকিউএল ১০ জিবি ফ্রী স্টোরেজসহ',
                buyTitleEn: 'Connect CockroachDB Serverless!',
                buyTitleBn: 'ককরোচডিবি ডাটাবেস কানেক্ট করুন!',
                buyDescEn: 'Enjoy distributed, elastic resilience with CockroachDB free tier supporting up to 10GB storage.',
                buyDescBn: 'ডিস্ট্রিবিউটেড ইলাস্টিক এসকিউএল কানেক্ট করুন এবং ১০ জিবি পর্যন্ত সম্পূর্ণ ফ্রি ডিস্ট্রিবিউটেড স্পেস উপভোগ করুন।',
                steps: [
                  { bn: 'cockroachlabs.com-এ সাইনইন করুন এবং একটি নতুন Serverless Cluster তৈরি করুন।', en: 'Sign in to cockroachlabs.com and create a free Serverless Cluster.' },
                  { bn: 'কানেক্ট করার জন্য SQL ইউজার তৈরি করুন এবং পাসওয়ার্ডটি সংরক্ষণ করুন।', en: 'Create a SQL user and securely copy the generated password.' },
                  { bn: 'কানেকশন উইজার্ড থেকে Connection String কপি করে ড্যাশবোর্ডে সেট করুন।', en: 'Copy the connection string from the connection wizard.' }
                ],
                portalLink: 'https://www.cockroachlabs.com/',
                portalTextEn: 'Go to Cockroach Console',
                portalTextBn: 'ককরোচডিবি কনসোলে যান (CockroachDB)',
                colorClass: 'bg-slate-900 hover:bg-slate-950',
                planType: 'cockroach_subscription' as const,
                iconColor: 'bg-slate-100 dark:bg-slate-900/60 text-slate-800'
              };
            case 'aiven':
              return {
                titleEn: 'Aiven Cloud Database Setup',
                titleBn: 'আইভেন ক্লাউড ডাটাবেস সেটআপ',
                subtitleEn: 'Connect fully-managed open-source SQL on major clouds',
                subtitleBn: 'সম্পূর্ণ ওপেন-সোর্স রিলেশনাল ও কি-ভ্যালু ডাটাবেজ ফ্রী টিয়ারসহ',
                buyTitleEn: 'Connect Aiven Database Service!',
                buyTitleBn: 'আইভেন ক্লাউড ডাটাবেস কানেক্ট করুন!',
                buyDescEn: 'Deploy PostgreSQL, MySQL, or Redis on AWS/GCP with Aiven\'s fully managed free tier.',
                buyDescBn: 'আইভেন ক্লাউড ডাটাবেজের সরাসরি সংযোগ দিন এবং ক্লাউড হোস্টেড সম্পূর্ণ ফ্রি সার্ভিস টিয়ার উপভোগ করুন।',
                steps: [
                  { bn: 'console.aiven.io-এ লগইন করুন এবং একটি নতুন প্রজেক্ট তৈরি করুন।', en: 'Log in to console.aiven.io and start a new project.' },
                  { bn: 'PostgreSQL বা MySQL ফ্রী সার্ভিস সিলেক্ট করে ডিপ্লয়মেন্ট সক্রিয় করুন।', en: 'Select PostgreSQL or MySQL free plans and start the server instances.' },
                  { bn: 'Service Overview থেকে Host, Port, User ও Connection URI সংগ্রহ করুন।', en: 'Retrieve the Service URI and save it securely in AmarBazar.' }
                ],
                portalLink: 'https://aiven.io/',
                portalTextEn: 'Go to Aiven Console',
                portalTextBn: 'আইভেন কনসোলে যান (Aiven Console)',
                colorClass: 'bg-cyan-600 hover:bg-cyan-700',
                planType: 'aiven_subscription' as const,
                iconColor: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500'
              };
            case 'gcs':
              return {
                titleEn: 'Google Cloud Storage Setup',
                titleBn: 'গুগল ক্লাউড স্টোরেজ সেটআপ',
                subtitleEn: 'Purchase & configure directly from Google',
                subtitleBn: 'গুগল থেকে সরাসরি কিনুন এবং ব্যবহার করুন',
                buyTitleEn: 'Buy Directly from Google!',
                buyTitleBn: 'সরাসরি গুগল থেকে ক্রয় করুন!',
                buyDescEn: 'This storage addon has no subscription fee on AmarBazar. You will create and pay Google directly.',
                buyDescBn: 'এই ক্লাউড স্টোরেজ সার্ভিসটি অমরবাজারের কোনো সাবস্ক্রিপশন ফি বা কমিশনের আওতাভুক্ত নয়। সরাসরি গুগল কনসোল থেকে ক্রিয়েট করে ফ্রীতে ইন্টিগ্রেট করুন।',
                steps: [
                  { bn: 'গুগল ক্লাউড কনসোলে লগইন করুন এবং একটি নতুন প্রজেক্ট তৈরি করুন।', en: 'Go to Google Cloud Console and create a new project.' },
                  { bn: 'Cloud Storage মেনু থেকে একটি Private Bucket তৈরি করুন।', en: 'Enable Cloud Storage API and create a private Storage Bucket.' },
                  { bn: 'Service Accounts থেকে JSON কি (Key) জেনারেট করে ডাউনলোড করুন।', en: 'Generate a Service Account Key in JSON format from IAM settings.' }
                ],
                portalLink: 'https://console.cloud.google.com/storage',
                portalTextEn: 'Go to Google Cloud Console',
                portalTextBn: 'গুগল ক্লাউড কনসোলে যান (Google Console)',
                colorClass: 'bg-sky-600 hover:bg-sky-700',
                planType: 'gcs_subscription' as const,
                iconColor: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600'
              };
            case 'firebase':
            default:
              return {
                titleEn: 'Firebase Storage Setup',
                titleBn: 'ফায়ারবেস স্টোরেজ সেটআপ',
                subtitleEn: 'Purchase & configure directly from Google',
                subtitleBn: 'গুগল থেকে সরাসরি কিনুন এবং ব্যবহার করুন',
                buyTitleEn: 'Buy Directly from Google!',
                buyTitleBn: 'সরাসরি গুগল থেকে ক্রয় করুন!',
                buyDescEn: 'This storage addon has no subscription fee on AmarBazar. You will create and pay Google directly.',
                buyDescBn: 'এই ক্লাউড স্টোরেজ সার্ভিসটি অমরবাজারের কোনো সাবস্ক্রিপশন ফি বা কমিশনের আওতাভুক্ত নয়। সরাসরি গুগল কনসোল থেকে ক্রিয়েট করে ফ্রীতে ইন্টিগ্রেট করুন।',
                steps: [
                  { bn: 'ফায়ারবেস কনসোলে গিয়ে আপনার প্রজেক্ট তৈরি করুন বা সিলেক্ট করুন।', en: 'Log in to Firebase Console and select/create your project.' },
                  { bn: 'Build ট্যাব থেকে Storage সেকশন সক্রিয় করুন (ফ্রি ৫জিবি লাইফটাইম)।', en: 'Go to Build > Storage and click Enable (Includes 5GB lifetime free tier).' },
                  { bn: 'Project Settings থেকে Web App কনফিগারেশন JSON অবজেক্টটি কপি করুন।', en: 'Copy the Web Config JSON object from Project Settings > General.' }
                ],
                portalLink: 'https://console.firebase.google.com/',
                portalTextEn: 'Go to Firebase Console',
                portalTextBn: 'ফায়ারবেস কনসোলে যান (Firebase Console)',
                colorClass: 'bg-amber-500 hover:bg-amber-600',
                planType: 'firebase_subscription' as const,
                iconColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500'
              };
          }
        };

        const config = getModalConfig();

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col font-sans border border-slate-200 dark:border-slate-800">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-xl ${config.iconColor}`}>
                    {googleSetupModal.type === 'gcs' ? <Cloud className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {language === 'bn' ? config.titleBn : config.titleEn}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {language === 'bn' ? config.subtitleBn : config.subtitleEn}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setGoogleSetupModal({ isOpen: false, type: 'gcs' })} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {dbSetupStep === 'info' && (
                  <>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300 animate-fadeIn">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black">
                          {language === 'bn' ? config.buyTitleBn : config.buyTitleEn}
                        </p>
                        <p className="mt-1 text-[11px] opacity-90">
                          {language === 'bn' ? config.buyDescBn : config.buyDescEn}
                        </p>
                      </div>
                    </div>

                    {/* Step By Step Instructions */}
                    <div className="space-y-3 animate-fadeIn">
                      <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {language === 'bn' ? 'কীভাবে সেটআপ করবেন:' : 'How to set up:'}
                      </h4>
                      
                      <div className="space-y-3.5 text-[11px]">
                        {config.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <span className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-bold w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-slate-600 dark:text-slate-400">
                              {language === 'bn' ? step.bn : step.en}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5 pt-2 animate-fadeIn">
                      {/* 1. Direct Portal Link */}
                      <a 
                        href={config.portalLink}
                        target="_blank" 
                        rel="noreferrer"
                        className={`w-full py-3 px-4 rounded-2xl font-bold text-white text-xs flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transition cursor-pointer ${config.colorClass}`}
                      >
                        <span>
                          {language === 'bn' ? config.portalTextBn : config.portalTextEn}
                        </span>
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* 2. Free activation inside our dashboard */}
                      <button
                        type="button"
                        onClick={() => handleActivateCloudDirectly(config.planType)}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md"
                      >
                        <span>
                          {language === 'bn' ? 'স্বয়ংক্রিয় ১-ক্লিকে ডাটাবেজ সেটআপ' : '1-Click Automated DB Setup'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}

                {dbSetupStep === 'configure' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                      {language === 'bn' 
                        ? 'আপনার জিমেইল ও বেসিক ডিটেইলস দিয়ে খুব সহজেই ডাটাবেজ তৈরি করে কানেক্ট করুন। কোনো প্রকার কোড বা জটিল ব্যাকএন্ড কনফিগারেশনের প্রয়োজন নেই।'
                        : 'Deploy and auto-link your isolated database segment using your Gmail. No code or manual tables creation required.'}
                    </div>

                    <div className="space-y-3.5">
                      {/* Gmail Address Input */}
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'bn' ? 'আপনার নিজস্ব জিমেইল (Gmail):' : 'Your Gmail Address:'}
                        </label>
                        <input 
                          type="email"
                          required
                          value={dbSetupGmail}
                          onChange={(e) => setDbSetupGmail(e.target.value)}
                          placeholder="example@gmail.com"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>

                      {/* Database Name Input */}
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'bn' ? 'ডাটাবেজ নাম / আইডি:' : 'Database Name / ID:'}
                        </label>
                        <input 
                          type="text"
                          required
                          value={dbSetupDbName}
                          onChange={(e) => setDbSetupDbName(e.target.value)}
                          placeholder="my_shop_database"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Connection Mode Choice */}
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">
                          {language === 'bn' ? 'সংযোগের ধরণ (Connection Mode):' : 'Connection Mode:'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDbSetupMode('auto')}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center space-y-1 ${dbSetupMode === 'auto' ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400 font-extrabold' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                          >
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px]">{language === 'bn' ? '১-ক্লিক অটো সংযোগ' : '1-Click Auto'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDbSetupMode('custom')}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center space-y-1 ${dbSetupMode === 'custom' ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400 font-extrabold' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                          >
                            <Settings className="w-4 h-4 text-slate-500" />
                            <span className="text-[10px]">{language === 'bn' ? 'ম্যানুয়াল কানেকশন' : 'Manual Config'}</span>
                          </button>
                        </div>
                      </div>

                      {/* If custom, show password / credentials token */}
                      {dbSetupMode === 'custom' && (
                        <div className="animate-fadeIn">
                          <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'bn' ? 'সিক্রেট এপিআই কি / অ্যাক্সেস টোকেন:' : 'Secret API Key / Token:'}
                          </label>
                          <input 
                            type="password"
                            value={dbSetupPassword}
                            onChange={(e) => setDbSetupPassword(e.target.value)}
                            placeholder="Enter custom cloud token/URI"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setDbSetupStep('info')}
                        className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs transition cursor-pointer text-center"
                      >
                        {language === 'bn' ? 'পিছনে যান' : 'Back'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCompleteDatabaseConnection(config.planType)}
                        disabled={!dbSetupGmail}
                        className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ডাটাবেজ কানেক্ট করুন' : 'Connect & Deploy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {dbSetupStep === 'connecting' && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fadeIn text-center">
                    <div className="relative flex items-center justify-center">
                      {/* Pulse rings */}
                      <div className="absolute inset-0 w-16 h-16 rounded-full bg-blue-500/20 animate-ping"></div>
                      <div className="w-14 h-14 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin flex items-center justify-center">
                        <Database className="w-5 h-5 text-blue-500 animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                        {connectingProgress < 30 ? (language === 'bn' ? 'জিমেইল ভেরিফাই করা হচ্ছে...' : 'Verifying Gmail...') : 
                         connectingProgress < 60 ? (language === 'bn' ? 'সুরক্ষিত ক্লাউড ডাটাবেজ তৈরি হচ্ছে...' : 'Creating Cloud Database...') : 
                         connectingProgress < 90 ? (language === 'bn' ? 'টেবিল ও প্রোডাক্ট ক্যাটালগ রেন্ডার হচ্ছে...' : 'Deploying DB Tables...') : 
                         (language === 'bn' ? 'অমরবাজার এপিআই কানেক্ট হচ্ছে...' : 'Finalizing API Gateway Sync...')}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                        {language === 'bn' ? `অগ্রগতি: ${connectingProgress}%` : `Progress: ${connectingProgress}%`}
                      </p>
                    </div>

                    <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${connectingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {dbSetupStep === 'success' && (
                  <div className="py-6 flex flex-col items-center justify-center space-y-4 animate-fadeIn text-center">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
                        {language === 'bn' ? 'ডাটাবেজ সফলভাবে কানেক্টেড!' : 'Database Live & Syncing!'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                        {language === 'bn' 
                          ? 'আপনার অমরবাজার শপের জন্য একটি সম্পূর্ণ স্বাধীন ও কন্টেইনারাইজড ক্লাউড ডাটাবেজ তৈরি করা হয়েছে।' 
                          : 'A fully isolated, secure tenant database segment has been successfully created and linked.'}
                      </p>
                    </div>

                    <div className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-2 text-left font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{language === 'bn' ? 'জিমেইল এড্রেস:' : 'Gmail Address:'}</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{dbSetupGmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{language === 'bn' ? 'ডাটাবেজ নাম:' : 'Database Name:'}</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{dbSetupDbName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{language === 'bn' ? 'স্ট্যাটাস:' : 'Connection Status:'}</span>
                        <span className="font-extrabold text-emerald-600 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>{language === 'bn' ? 'সরাসরি যুক্ত' : 'LIVE & SECURE'}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGoogleSetupModal({ isOpen: false, type: 'gcs' })}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      {language === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Go to Dashboard'}
                    </button>
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 text-[10px] text-center text-slate-400">
                {language === 'bn' 
                  ? 'সার্ভিস ক্রয়ের সম্পূর্ণ লাইসেন্স এবং দায়ভার স্ব-স্ব প্ল্যাটফর্মের নিজস্ব।' 
                  : 'All subscription agreements, billing, and server policies are managed solely by respective providers.'}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cloud File & Media Manager Modal */}
      <CloudFileManagerModal
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
        language={language}
        sellerId={storeInfo?.id}
        storeName={storeInfo?.name || 'আমার বাজার শপ'}
        planName={storeInfo?.cloudSubscriptionPlan === 'gcs_subscription' ? 'Google Cloud Storage Pro' : storeInfo?.cloudSubscriptionPlan === 'firebase_subscription' ? 'Firebase Enterprise' : 'Supabase Live Free Tier'}
        totalCapacityGb={displayStorageTotal}
        onStorageUpdated={refreshStorageFiles}
      />

    </div>
  );
};
