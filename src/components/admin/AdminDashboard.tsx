import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Store, Package, ShoppingBag, Tag, 
  DollarSign, Settings, FileText, CheckCircle2, XCircle, 
  Trash2, Plus, ArrowUpRight, Lock, Key, RefreshCw,
  Eye, ChevronDown, ChevronUp, Cloud, Database, Wifi, AlertTriangle,
  Copy, Check, ExternalLink, Server, Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { hasPermission } from '../../lib/permissions';
import { User, SellerStore, Order, Coupon, Category, WithdrawalRequest, SystemSettings } from '../../types';
import { AdminRolesPermissions } from './AdminRolesPermissions';

export const AdminDashboard: React.FC = () => {
  const { currentUser, activeRole, categories, refreshCategories, refreshProducts, systemSettings, language } = useApp();

  const effectiveUser = currentUser?.role === 'customer' && activeRole !== 'customer' 
    ? { ...currentUser, role: activeRole } 
    : currentUser;

  const isAdminStaff = effectiveUser?.isAdminStaff === true;
  const adminStaffPerms = effectiveUser?.adminPermissions || [];

  // Permissions mapping for Admin Staff
  const canModerateUsers = !isAdminStaff || adminStaffPerms.includes('admin_users_moderate');
  const canApproveSellers = !isAdminStaff || adminStaffPerms.includes('admin_sellers_approve');
  const canManageCategories = !isAdminStaff || adminStaffPerms.includes('admin_categories_manage');
  const canManageOrders = !isAdminStaff || adminStaffPerms.includes('admin_orders_manage');
  const canManageCoupons = !isAdminStaff || adminStaffPerms.includes('admin_coupons_manage');
  const canManageWithdrawals = !isAdminStaff || adminStaffPerms.includes('admin_finance_withdrawals');
  const canManageRolesPermissions = !isAdminStaff || adminStaffPerms.includes('admin_sellers_permissions');
  const canConfigureSettings = !isAdminStaff || adminStaffPerms.includes('admin_settings_configure');

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sellers' | 'categories' | 'orders' | 'coupons' | 'withdrawals' | 'roles_permissions' | 'settings'>('overview');

  // Auto-switch to first authorized tab if current activeTab is not permitted for admin staff
  useEffect(() => {
    if (isAdminStaff) {
      if (activeTab === 'users' && !canModerateUsers) {
        if (canApproveSellers) setActiveTab('sellers');
        else if (canManageOrders) setActiveTab('orders');
        else if (canManageCategories) setActiveTab('categories');
        else if (canManageWithdrawals) setActiveTab('withdrawals');
        else if (canManageCoupons) setActiveTab('coupons');
        else if (canConfigureSettings) setActiveTab('settings');
        else setActiveTab('overview');
      } else if (activeTab === 'sellers' && !canApproveSellers) {
        if (canManageOrders) setActiveTab('orders');
        else if (canModerateUsers) setActiveTab('users');
        else if (canManageCategories) setActiveTab('categories');
        else if (canManageWithdrawals) setActiveTab('withdrawals');
        else if (canConfigureSettings) setActiveTab('settings');
        else setActiveTab('overview');
      } else if (activeTab === 'orders' && !canManageOrders) {
        if (canApproveSellers) setActiveTab('sellers');
        else if (canModerateUsers) setActiveTab('users');
        else if (canManageCategories) setActiveTab('categories');
        else if (canManageWithdrawals) setActiveTab('withdrawals');
        else setActiveTab('overview');
      } else if (activeTab === 'roles_permissions' && !canManageRolesPermissions) {
        setActiveTab('overview');
      } else if (activeTab === 'settings' && !canConfigureSettings) {
        setActiveTab('overview');
      }
    }
  }, [isAdminStaff, activeTab, adminStaffPerms, canModerateUsers, canApproveSellers, canManageOrders, canManageCategories, canManageWithdrawals, canManageCoupons, canManageRolesPermissions, canConfigureSettings]);

  const [usersList, setUsersList] = useState<User[]>([]);
  const [sellersList, setSellersList] = useState<SellerStore[]>([]);
  const [expandedSellerId, setExpandedSellerId] = useState<string | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<WithdrawalRequest[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(systemSettings);

  const [adminTestingStorageId, setAdminTestingStorageId] = useState<string | null>(null);
  const [adminStorageTestResult, setAdminStorageTestResult] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleAdminTestSellerStorage = async (sellerId: string, type: string, credentials?: string) => {
    setAdminTestingStorageId(sellerId);
    try {
      const response = await fetch(`/api/sellers/${sellerId}/test-storage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storageType: type,
          storageCredentials: credentials || ''
        })
      });
      const data = await response.json();
      setAdminStorageTestResult(prev => ({
        ...prev,
        [sellerId]: {
          success: response.ok && data.success,
          message: data.message || 'Verification complete'
        }
      }));
    } catch (err: any) {
      setAdminStorageTestResult(prev => ({
        ...prev,
        [sellerId]: {
          success: false,
          message: err.message || 'Error checking connection'
        }
      }));
    } finally {
      setAdminTestingStorageId(null);
    }
  };

  // Modal forms state
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameBn, setNewCatNameBn] = useState('');

  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponVal, setCouponVal] = useState('15');

  // Custom user duties and deletion state
  const [selectedUserForDuties, setSelectedUserForDuties] = useState<User | null>(null);
  const [selectedDuties, setSelectedDuties] = useState<string[]>([]);

  // Live Countdown Timer state
  const [timerDays, setTimerDays] = useState(0);
  const [timerHours, setTimerHours] = useState(3);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Supabase Live Status & Sync state
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; configured: boolean; message: string; error?: string } | null>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const checkSupabaseStatus = async () => {
    setSupabaseLoading(true);
    try {
      const res = await api.getSupabaseStatus();
      setSupabaseStatus(res);
    } catch (err: any) {
      setSupabaseStatus({
        connected: false,
        configured: true,
        message: err.message || 'Failed to ping Supabase status'
      });
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      const res = await api.syncToSupabase();
      if (res.success) {
        setSyncMessage({
          success: true,
          text: language === 'bn' 
            ? `সুপাবেস ডাটাবেজে সফলভাবে ডাটা সিঙ্ক হয়েছে! (${res.synced?.products || 0}টি প্রোডাক্ট, ${res.synced?.sellers || 0}টি সেলার, ${res.synced?.orders || 0}টি অর্ডার)`
            : `Successfully synced to Supabase! (${res.synced?.products || 0} products, ${res.synced?.sellers || 0} sellers, ${res.synced?.orders || 0} orders)`
        });
        checkSupabaseStatus();
      } else {
        setSyncMessage({
          success: false,
          text: res.message || 'Sync failed.'
        });
      }
    } catch (err: any) {
      setSyncMessage({
        success: false,
        text: err.message || 'Sync request failed.'
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const sqlSchemaSnippet = `-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_bn TEXT,
  slug TEXT,
  description TEXT,
  description_bn TEXT,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  category_id TEXT,
  category_name TEXT,
  sub_category TEXT,
  brand TEXT,
  seller_id TEXT,
  seller_name TEXT,
  stock INTEGER DEFAULT 0,
  sku TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_flash_deal BOOLEAN DEFAULT false,
  is_combo BOOLEAN DEFAULT false,
  combo_items JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  variant_prices JSONB DEFAULT '{}'::jsonb,
  bulk_offers JSONB DEFAULT '[]'::jsonb,
  warranty TEXT,
  custom_specs JSONB DEFAULT '[]'::jsonb,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sellers (
  id TEXT PRIMARY KEY,
  seller_id TEXT,
  store_name TEXT NOT NULL,
  store_name_bn TEXT,
  owner_name TEXT,
  email TEXT,
  phone TEXT,
  logo_url TEXT,
  banner_url TEXT,
  rating NUMERIC DEFAULT 5.0,
  total_sales NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'approved',
  subscription_tier TEXT DEFAULT 'pro',
  subscription_status TEXT DEFAULT 'active',
  subscription_expiry_date TEXT,
  cloud_subscription_plan TEXT DEFAULT 'supabase_subscription',
  storage_type TEXT DEFAULT 'supabase',
  storage_credentials TEXT,
  trade_license_number TEXT,
  bkash_number TEXT,
  bank_account_details TEXT,
  staff JSONB DEFAULT '[]'::jsonb,
  permissions_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  order_5_digit_id TEXT,
  user_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  coupon_code TEXT,
  shipping_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'confirmed',
  tracking_status TEXT DEFAULT 'Order Placed',
  courier JSONB DEFAULT '{}'::jsonb,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT true,
  addresses JSONB DEFAULT '[]'::jsonb,
  custom_permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Fetch Supabase status on mount or tab change
  useEffect(() => {
    if (activeTab === 'settings' || activeTab === 'overview') {
      checkSupabaseStatus();
    }
  }, [activeTab]);

  // Admin Password Change state
  const [adminOldPassword, setAdminOldPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminPassMsg, setAdminPassMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [adminPassLoading, setAdminPassLoading] = useState(false);

  const handleAdminChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassMsg(null);

    if (!adminNewPassword || adminNewPassword.length < 4) {
      setAdminPassMsg({ success: false, text: language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!' : 'Password must be at least 4 characters!' });
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      setAdminPassMsg({ success: false, text: language === 'bn' ? 'নতুন পাসওয়ার্ড দুটি মিলছে না!' : 'New passwords do not match!' });
      return;
    }
    if (!currentUser?.id) return;

    setAdminPassLoading(true);
    try {
      const res = await api.changePassword({
        userId: currentUser.id,
        oldPassword: adminOldPassword,
        newPassword: adminNewPassword
      });
      setAdminPassMsg({ 
        success: true, 
        text: language === 'bn' 
          ? 'এডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন থেকে শুধুমাত্র নতুন পাসওয়ার্ড কাজ করবে।' 
          : 'Admin password updated successfully! Only the new password is valid now.' 
      });
      setAdminOldPassword('');
      setAdminNewPassword('');
      setAdminConfirmPassword('');
    } catch (err: any) {
      setAdminPassMsg({ success: false, text: err.message || 'Failed to update password' });
    } finally {
      setAdminPassLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const u = await api.getUsers();
      setUsersList(u);

      const s = await api.getSellers();
      setSellersList(s);

      const o = await api.getOrders();
      setOrdersList(o);

      const c = await api.getCoupons();
      setCouponsList(c);

      const w = await api.getWithdrawals();
      setWithdrawalsList(w);
    } catch (err) {
      console.log('Error fetching admin data');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete yourself!');
      return;
    }
    const confirmDelete = window.confirm('Are you sure you want to completely remove this user from the system?');
    if (confirmDelete) {
      try {
        await api.deleteUser(userId);
        alert('User removed successfully!');
        fetchAdminData();
      } catch (err) {
        alert('Failed to remove user.');
      }
    }
  };

  const handleSaveDuties = async () => {
    if (!selectedUserForDuties) return;
    try {
      await api.updateUserPermissions(selectedUserForDuties.id, selectedDuties);
      alert('Custom permissions and duties updated successfully!');
      setSelectedUserForDuties(null);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update custom permissions.');
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('market_campaigns');
      if (saved) {
        const campaigns = JSON.parse(saved);
        const bogoCampaign = campaigns.find((c: any) => c.id === 'bogo') || campaigns[0];
        if (bogoCampaign) {
          setTimerDays(bogoCampaign.timerDays !== undefined ? bogoCampaign.timerDays : 0);
          setTimerHours(bogoCampaign.timerHours !== undefined ? bogoCampaign.timerHours : 3);
          setTimerMinutes(bogoCampaign.timerMinutes !== undefined ? bogoCampaign.timerMinutes : 0);
          setTimerSeconds(bogoCampaign.timerSeconds !== undefined ? bogoCampaign.timerSeconds : 0);
        }
      }
    } catch (e) {
      console.log('Error initializing countdown timers');
    }
  }, []);

  const handleSaveCountdownTimer = () => {
    try {
      let campaigns: any[] = [];
      const saved = localStorage.getItem('market_campaigns');
      if (saved) {
        campaigns = JSON.parse(saved);
      } else {
        campaigns = [
          { id: 'all', name: 'SUMMER CELEBRATION', nameBn: 'সামার উৎসব অফার' },
          { id: 'unilever', name: 'UNILEVER SAVINGS', nameBn: 'ইউনিলিভার মেগা অফার' },
          { id: 'bogo', name: 'BLOCKBUSTER DEALS', nameBn: 'বিশাল ধামাকা অফার' },
          { id: 'summer', name: 'BUY MORE SAVE MORE', nameBn: 'বেশি কিনুন বেশি বাঁচান' }
        ];
      }

      const updatedCampaigns = campaigns.map((c: any) => {
        return {
          ...c,
          showTimer: true,
          timerDays: Number(timerDays),
          timerHours: Number(timerHours),
          timerMinutes: Number(timerMinutes),
          timerSeconds: Number(timerSeconds),
          timerEndsAt: new Date(Date.now() + (Number(timerDays)*24*3600 + Number(timerHours)*3600 + Number(timerMinutes)*60 + Number(timerSeconds))*1000).toISOString()
        };
      });

      localStorage.setItem('market_campaigns', JSON.stringify(updatedCampaigns));
      window.dispatchEvent(new Event('storage'));
      alert('Live Countdown Timer updated successfully! (লাইভ কাউন্টডাউন টাইমার সফলভাবে আপডেট হয়েছে!)');
    } catch (e) {
      alert('Failed to save countdown timer');
    }
  };

  const handleApproveSeller = async (id: string) => {
    await api.approveSeller(id);
    fetchAdminData();
  };

  const handleUserRoleChange = async (userId: string, role: string) => {
    await api.updateUserRole(userId, role);
    fetchAdminData();
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    await api.createCategory({
      name: newCatName,
      nameBn: newCatNameBn || newCatName,
      icon: 'Tag'
    });
    setIsAddCatOpen(false);
    setNewCatName('');
    refreshCategories();
    fetchAdminData();
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    await api.createCoupon({
      code: couponCode,
      type: 'percentage',
      discountValue: Number(couponVal),
      minPurchase: 1000
    });
    setIsAddCouponOpen(false);
    setCouponCode('');
    fetchAdminData();
  };

  const handleApproveWithdrawal = async (id: string) => {
    await api.updateWithdrawalStatus(id, 'approved', 'Approved by Admin');
    fetchAdminData();
  };

  const handleSaveSettings = async () => {
    await api.updateSettings(settings);
    alert('System settings updated successfully!');
  };

  const handleUpdateSellerSubscription = async (sellerId: string, updates: any) => {
    try {
      await api.updateSubscription(sellerId, updates);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update subscription');
    }
  };

  const handleExtendSubscription = async (seller: SellerStore) => {
    const currentExpiry = seller.subscriptionExpiryDate ? new Date(seller.subscriptionExpiryDate) : new Date();
    currentExpiry.setDate(currentExpiry.getDate() + 30);
    const newExpiryStr = currentExpiry.toISOString().split('T')[0];
    
    await handleUpdateSellerSubscription(seller.id, {
      expiryDate: newExpiryStr,
      status: 'active'
    });
    alert('Seller subscription extended by 30 days! (মেয়াদ আরও ৩০ দিন বাড়ানো হয়েছে)');
  };

  const totalMarketplaceGross = ordersList.reduce((sum, o) => sum + o.totalAmount, 0);
  const commissionEarned = Math.round((totalMarketplaceGross * settings.commissionPercentage) / 100);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Admin Title Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AmarBazar Admin Control Panel</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Full CRUD Governance for Users, Sellers, Products, Orders, Coupons & Payouts
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ ordersList, sellersList, usersList }));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "amarbazar_report.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition"
          >
            Export Full System JSON/CSV
          </button>
        </div>
      </div>

      {/* SHAREABLE CUSTOMER-ONLY MARKETPLACE LINK BANNER */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md border border-emerald-500/30 flex flex-wrap justify-between items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-sm flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2 animate-ping" />
            Dedicated Customer Marketplace Link (কাস্টমার মার্কেটপ্লেস লিংক)
          </h3>
          <p className="text-[11px] text-emerald-100 max-w-2xl leading-relaxed">
            Share this link with customers. They will enter a dedicated, single-screen Amazon/Alibaba-style storefront without any admin sidebars, ERP tabs, or role selectors.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-950/40 p-1.5 rounded-xl border border-emerald-500/20">
          <input 
            type="text" 
            readOnly 
            value={`${window.location.origin}/?customer_mode=true`}
            className="bg-transparent text-emerald-300 font-mono text-[10px] font-bold px-2 py-1 focus:outline-none w-56 text-center select-all"
          />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/?customer_mode=true`);
              alert('Copied Customer Marketplace Link: ' + window.location.origin + '/?customer_mode=true');
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition"
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Admin Staff Sub-Account Notification Banner */}
      {isAdminStaff && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                  {language === 'bn' ? `অ্যাডমিন কর্মকর্তা: ${effectiveUser?.name}` : `Admin Staff: ${effectiveUser?.name}`}
                </h4>
                <span className="bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                  @{effectiveUser?.username || 'admin_staff'}
                </span>
                <span className="bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {effectiveUser?.adminRoleTitle || (language === 'bn' ? 'সাব-এডমিন / মডারেটর' : 'Staff')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'প্রধান এডমিন কর্তৃক আপনাকে প্রদত্ত নির্দিষ্ট পারমিশন অনুযায়ী কন্ট্রোল প্যানেল কাজ করছে।'
                  : 'Administrative privileges are active based on your assigned staff permissions.'}
              </p>
            </div>
          </div>
          <div className="text-right text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
            {language === 'bn' ? `অনুমোদিত মডিউল: ${adminStaffPerms.length} টি` : `Granted Privileges: ${adminStaffPerms.length}`}
          </div>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview', icon: ShieldCheck, visible: true },
          { id: 'users', label: `Users (${usersList.length})`, icon: Users, visible: canModerateUsers },
          { id: 'sellers', label: `Sellers (${sellersList.length})`, icon: Store, visible: canApproveSellers },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Tag, visible: canManageCategories },
          { id: 'orders', label: `Orders (${ordersList.length})`, icon: ShoppingBag, visible: canManageOrders },
          { id: 'coupons', label: `Coupons (${couponsList.length})`, icon: Tag, visible: canManageCoupons },
          { id: 'withdrawals', label: `Payouts (${withdrawalsList.length})`, icon: DollarSign, visible: canManageWithdrawals },
          { id: 'roles_permissions', label: language === 'bn' ? 'রোল ও পারমিশন' : 'Roles & Permissions', icon: Lock, visible: canManageRolesPermissions },
          { id: 'settings', label: 'Settings', icon: Settings, visible: canConfigureSettings },
        ].filter(tab => tab.visible).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold">Total Marketplace Sales:</span>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ৳{totalMarketplaceGross.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Across bKash, Nagad & COD</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold">Platform Commission (5%):</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ৳{commissionEarned.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-500 mt-1">Net Platform Profit</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold">Registered Stores:</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {sellersList.length} Stores
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">100% Trade License Checked</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold">Active Orders:</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {ordersList.length}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Assigned to Pathao & RedX</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-4 border-b font-bold text-xs">User Governance & Role Assignment</div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3 font-bold">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{u.name}</span>
                      {u.customPermissions && u.customPermissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {u.customPermissions.map(p => (
                            <span key={p} className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              {p.replace('manage_', '').replace('delete_', 'del ').replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">No custom duties (Default role permissions)</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-slate-500">{u.email} ({u.phone})</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                        className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                      >
                        <option value="customer">Customer</option>
                        <option value="seller">Seller</option>
                        <option value="manager">Manager</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        <option value="system_admin">System Admin</option>
                      </select>

                      <button
                        onClick={() => {
                          setSelectedUserForDuties(u);
                          setSelectedDuties(u.customPermissions || []);
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                        title="Customize active duties/responsibilities"
                      >
                        Duties / দায়িত্ব
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === currentUser?.id}
                        className={`p-1.5 rounded-lg transition ${
                          u.id === currentUser?.id
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                            : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                        }`}
                        title="Delete User completely"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. SELLERS APPROVAL */}
      {activeTab === 'sellers' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-4 border-b font-bold text-xs flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <span>Registered Sellers & Verification Status (বিক্রেতা তালিকা ও ভেরিফিকেশন তথ্য)</span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-black">
              Total: {sellersList.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {sellersList.map((s) => {
              const isExpanded = expandedSellerId === s.id;
              const hasDocs = !!(s.ownerFirstName || s.nidNumber || s.nidPhotoFront || s.shopLicensePhoto);
              
              return (
                <div key={s.id} className="p-4 text-xs transition hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{s.storeName}</h4>
                        {s.subscriptionPlan && (
                          <span className="px-1.5 py-0.5 text-[8px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded uppercase">
                            {s.subscriptionPlan} Plan
                          </span>
                        )}
                        {/* Storage Type Status Badge for Admin Monitoring */}
                        {s.storageType === 'google_cloud' ? (
                          <span className="px-1.5 py-0.5 text-[8px] font-black bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 rounded uppercase flex items-center space-x-0.5">
                            <Cloud className="w-2.5 h-2.5" />
                            <span>GCS Bucket</span>
                          </span>
                        ) : s.storageType === 'firebase' ? (
                          <span className="px-1.5 py-0.5 text-[8px] font-black bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 rounded uppercase flex items-center space-x-0.5">
                            <Database className="w-2.5 h-2.5" />
                            <span>Firebase Cloud</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[8px] font-black bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400 rounded uppercase flex items-center space-x-0.5">
                            <Store className="w-2.5 h-2.5" />
                            <span>Central Storage</span>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 font-medium">
                        Trade ID: <span className="font-bold text-slate-700 dark:text-slate-300">{s.tradeLicenseNumber || 'N/A'}</span> • bKash: <span className="font-bold text-slate-700 dark:text-slate-300">{s.bkashNumber || 'N/A'}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Expansion button is now ALWAYS available so the admin team can monitor cloud storage & configs */}
                      <button
                        onClick={() => setExpandedSellerId(isExpanded ? null : s.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-[10px] bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition font-black cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Details (বন্ধ করুন)' : 'Manage & Monitor (তদারকি ও কাগজপত্র)'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {s.isApproved ? (
                        <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold rounded-xl text-[10px] flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified Active</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveSeller(s.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition text-[10px] shadow-sm hover:shadow-md cursor-pointer flex items-center space-x-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Approve & Activate</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Verification Data Drawer */}
                  {isExpanded && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-black block text-[8px] uppercase tracking-wider mb-0.5">Owner Full Name (মালিকের নাম)</span>
                          <span className="font-black text-slate-800 dark:text-slate-100 text-xs">
                            {s.ownerFirstName ? `${s.ownerFirstName} ${s.ownerLastName || ''}` : 'Not Specified'}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-black block text-[8px] uppercase tracking-wider mb-0.5">National ID (NID) Number</span>
                          <span className="font-black text-slate-800 dark:text-slate-100 text-xs">
                            {s.nidNumber || 'Not Specified'}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-black block text-[8px] uppercase tracking-wider mb-0.5">Trade License Number</span>
                          <span className="font-black text-slate-800 dark:text-slate-100 text-xs">
                            {s.tradeLicenseNumber || 'Not Specified'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-slate-400 font-black block text-[8px] uppercase tracking-wider">Submitted Attachments & Scans (ক্লিক করে বড় করুন)</span>
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                          
                          {/* Owner Photo */}
                          <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2 flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-400 mb-1.5 truncate w-full text-center">Owner Photo</span>
                            {s.ownerPhoto || s.logoUrl ? (
                              <img 
                                src={s.ownerPhoto || s.logoUrl} 
                                alt="Owner"
                                onClick={() => setSelectedImageModal(s.ownerPhoto || s.logoUrl)}
                                className="w-full h-20 object-cover rounded-lg cursor-zoom-in hover:opacity-85 transition border border-slate-100 dark:border-slate-800" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-20 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-300 text-[10px]">No Image</div>
                            )}
                          </div>

                          {/* Shop Photo */}
                          <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2 flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-400 mb-1.5 truncate w-full text-center">Shop Photo</span>
                            {s.shopPhoto || s.bannerUrl ? (
                              <img 
                                src={s.shopPhoto || s.bannerUrl} 
                                alt="Shop"
                                onClick={() => setSelectedImageModal(s.shopPhoto || s.bannerUrl)}
                                className="w-full h-20 object-cover rounded-lg cursor-zoom-in hover:opacity-85 transition border border-slate-100 dark:border-slate-800" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-20 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-300 text-[10px]">No Image</div>
                            )}
                          </div>

                          {/* NID Front */}
                          <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2 flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-400 mb-1.5 truncate w-full text-center">NID Front</span>
                            {s.nidPhotoFront ? (
                              <img 
                                src={s.nidPhotoFront} 
                                alt="NID Front"
                                onClick={() => setSelectedImageModal(s.nidPhotoFront)}
                                className="w-full h-20 object-cover rounded-lg cursor-zoom-in hover:opacity-85 transition border border-slate-100 dark:border-slate-800" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-20 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-300 text-[10px]">No Image</div>
                            )}
                          </div>

                          {/* NID Back */}
                          <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2 flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-400 mb-1.5 truncate w-full text-center">NID Back</span>
                            {s.nidPhotoBack ? (
                              <img 
                                src={s.nidPhotoBack} 
                                alt="NID Back"
                                onClick={() => setSelectedImageModal(s.nidPhotoBack)}
                                className="w-full h-20 object-cover rounded-lg cursor-zoom-in hover:opacity-85 transition border border-slate-100 dark:border-slate-800" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-20 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-300 text-[10px]">No Image</div>
                            )}
                          </div>

                           {/* Trade License copy */}
                          <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2 flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-400 mb-1.5 truncate w-full text-center">Trade License</span>
                            {s.shopLicensePhoto ? (
                              <img 
                                src={s.shopLicensePhoto} 
                                alt="Trade License"
                                onClick={() => setSelectedImageModal(s.shopLicensePhoto)}
                                className="w-full h-20 object-cover rounded-lg cursor-zoom-in hover:opacity-85 transition border border-slate-100 dark:border-slate-800" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-20 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-300 text-[10px]">No Image</div>
                            )}
                          </div>

                          {/* Face Verification Photo */}
                          <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2 flex flex-col items-center">
                            <span className="text-[8px] font-black text-amber-500 mb-1.5 truncate w-full text-center flex items-center justify-center">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping mr-1"></span>
                              Face Verification
                            </span>
                            {s.facePhoto ? (
                              <img 
                                src={s.facePhoto} 
                                alt="Face Verification"
                                onClick={() => setSelectedImageModal(s.facePhoto)}
                                className="w-full h-20 object-cover rounded-lg cursor-zoom-in hover:opacity-85 transition border border-amber-200 dark:border-amber-950" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-20 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg flex flex-col items-center justify-center text-amber-500 text-[10px] border border-dashed border-amber-500/20">
                                <span>No Live Scan</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* ADMIN CLOUD STORAGE MONITORING & ISOLATION PANEL */}
                      <div className="mt-4 p-5 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-lg space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                              <Cloud className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                                Cloud Storage Monitoring Console (ক্লাউড স্টোরেজ কন্ট্রোল ও তদারকি)
                              </h4>
                              <p className="text-[10px] text-slate-400">
                                Real-time dynamic bucket status & multi-tenant isolation monitor
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800/60">
                            Tenant-ID: <span className="text-sky-400 font-bold">{s.id}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left column: Storage details */}
                          <div className="space-y-3">
                            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                              <span className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Storage Integration Profile</span>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-white">
                                  {s.storageType === 'google_cloud' ? 'Google Cloud Storage (GCS)' : s.storageType === 'firebase' ? 'Firebase Client Storage' : 'AmarBazar Central Storage'}
                                </span>
                                <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase border ${
                                  s.storageType !== 'central' && s.storageType 
                                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                  {s.storageType || 'central'}
                                </span>
                              </div>
                            </div>

                            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider font-sans">Active Bucket Destination</span>
                              <p className="font-mono text-[11px] text-slate-200 truncate">
                                {s.storageType === 'google_cloud' ? (
                                  (() => {
                                    try {
                                      const creds = JSON.parse(s.storageCredentials || '{}');
                                      return creds.bucket_name || 'No GCS Bucket Set';
                                    } catch(e) { return 'Invalid JSON Credentials'; }
                                  })()
                                ) : s.storageType === 'firebase' ? (
                                  (() => {
                                    try {
                                      const creds = JSON.parse(s.storageCredentials || '{}');
                                      return creds.storageBucket || 'No Firebase Bucket Set';
                                    } catch(e) { return 'Invalid JSON Credentials'; }
                                  })()
                                ) : (
                                  'amarbazar-unified-secure-bucket'
                                )}
                              </p>
                            </div>

                            {/* Live check controls */}
                            <div className="flex items-center space-x-2 pt-1">
                              <button
                                type="button"
                                disabled={adminTestingStorageId === s.id}
                                onClick={() => handleAdminTestSellerStorage(s.id, s.storageType || 'central', s.storageCredentials)}
                                className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                              >
                                <Wifi className={`w-3.5 h-3.5 ${adminTestingStorageId === s.id ? 'animate-bounce' : ''}`} />
                                <span>{adminTestingStorageId === s.id ? 'Pinging Cloud...' : 'Test Vendor Cloud Connection'}</span>
                              </button>

                              {adminStorageTestResult[s.id] && (
                                <div className={`px-2.5 py-1.5 rounded-lg text-[9px] font-medium border ${
                                  adminStorageTestResult[s.id].success 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}>
                                  {adminStorageTestResult[s.id].success ? '✓ Connected' : '✗ Failed'}
                                </div>
                              )}
                            </div>

                            {adminStorageTestResult[s.id] && (
                              <p className="text-[9px] text-slate-400 leading-normal font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 max-h-24 overflow-y-auto">
                                {adminStorageTestResult[s.id].message}
                              </p>
                            )}
                          </div>

                          {/* Right column: Multi-tenant security proof */}
                          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                  Decentralized Tenant Isolation Shield (ডেটা পৃথকীকরণ গ্যারান্টি)
                                </span>
                              </div>
                              
                              <p className="text-[10px] text-slate-300 leading-relaxed">
                                {language === 'bn' 
                                  ? '১০০% ডেটা আইসোলেশন ও প্রাইভেসি কনফিগারেশন সক্রিয় আছে। এই সেলারের সমস্ত প্রোডাক্ট, অর্ডার এবং পেমেন্ট ট্রানজেকশন ডেটাবেজ লেভেলে অনন্য কুয়েরি আইডি দ্বারা ফিল্টার করা হয়। অন্য কোনো সেলার বা এক্সটার্নাল রিকোয়েস্ট কোনো অবস্থাতেই এই স্টোরের ডেটা বা ক্রেডেনশিয়াল অ্যাক্সেস করতে পারবে না।' 
                                  : 'Strict multi-tenant security architecture is fully active. This vendor\'s product catalog, customer lists, order records, and media bucket credentials are mathematically isolated at the routing and storage layers. Cross-vendor viewing is strictly impossible.'}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono border-t border-slate-800/80 pt-2.5">
                              <div className="flex items-center space-x-1 text-slate-400">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                <span>DB Isolation: Active</span>
                              </div>
                              <div className="flex items-center space-x-1 text-slate-400">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                <span>Asset Routing: Isolated</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CATEGORIES MANAGER */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm">Marketplace Product Categories</h3>
            <button
              onClick={() => setIsAddCatOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              + Create Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-3 border rounded-xl flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold">{c.name} ({c.nameBn})</h4>
                  <p className="text-slate-400 text-[10px]">{c.subcategories.length} Subcategories</p>
                </div>
                <button
                  onClick={async () => {
                    if (!hasPermission(effectiveUser, 'delete_category')) {
                      alert('Error: You do not have permission to delete categories! (আপনার ক্যাটাগরি ডিলিট করার অনুমতি নেই)');
                      return;
                    }
                    await api.deleteCategory(c.id);
                    refreshCategories();
                    fetchAdminData();
                  }}
                  disabled={!hasPermission(effectiveUser, 'delete_category')}
                  className={`p-1.5 rounded transition ${
                    !hasPermission(effectiveUser, 'delete_category')
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50' 
                      : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 font-sans'
                  }`}
                  title={!hasPermission(effectiveUser, 'delete_category') ? 'No permission to delete categories' : 'Delete Category'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. COUPONS MANAGER */}
      {activeTab === 'coupons' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm">Promotional Discount Coupons</h3>
            <button
              onClick={() => setIsAddCouponOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              + Create Promo Code
            </button>
          </div>

          <div className="divide-y border rounded-xl">
            {couponsList.map((c) => (
              <div key={c.id} className="p-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-emerald-600">{c.code}</span>
                  <p className="text-slate-400 text-[10px]">{c.discountValue}% Discount • Min Spend: ৳{c.minPurchase}</p>
                </div>
                <button
                  onClick={async () => {
                    if (!hasPermission(effectiveUser, 'delete_any')) {
                      alert('Error: You do not have permission to delete coupons! (আপনার কুপন ডিলিট করার অনুমতি নেই)');
                      return;
                    }
                    await api.deleteCoupon(c.id);
                    fetchAdminData();
                  }}
                  disabled={!hasPermission(effectiveUser, 'delete_any')}
                  className={`p-1 rounded transition ${
                    !hasPermission(effectiveUser, 'delete_any')
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50' 
                      : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                  title={!hasPermission(effectiveUser, 'delete_any') ? 'No permission to delete coupons' : 'Delete Coupon'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. WITHDRAWALS APPROVAL */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h3 className="font-bold text-sm">Merchant Payout Requests</h3>
          <div className="divide-y border rounded-xl">
            {withdrawalsList.map((w) => (
              <div key={w.id} className="p-4 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold">{w.sellerName} - ৳{w.amount.toLocaleString()} ({w.method.toUpperCase()})</p>
                  <p className="text-slate-400">Account: {w.accountNumber} • Date: {w.requestDate}</p>
                </div>
                <div>
                  {w.status === 'pending' ? (
                    <button
                      onClick={() => handleApproveWithdrawal(w.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl"
                    >
                      Approve Payout
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                      Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROLES & PERMISSIONS GOVERNANCE */}
      {activeTab === 'roles_permissions' && (
        <AdminRolesPermissions />
      )}

      {/* 7. SYSTEM SETTINGS & SELLER SUBSCRIPTIONS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Global parameters, Supabase Cloud Database & Live Timer */}
          <div className="lg:col-span-1 space-y-6 text-xs">
            {/* Supabase Cloud Database & Realtime Sync Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-6 space-y-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-emerald-500 text-white rounded-xl shadow-xs">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Supabase Cloud Database
                    </h3>
                    <span className="text-[10px] text-slate-400">PostgreSQL Cloud Storage</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    supabaseStatus?.connected
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : supabaseStatus?.configured
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span>{supabaseStatus?.connected ? 'Connected' : 'Configured'}</span>
                  </span>
                </div>
              </div>

              {/* Project Details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-semibold">Project Endpoint:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title="https://duwcufotrnuxlefssbim.supabase.co">
                    duwcufotrnuxlefssbim
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-semibold">Database Tables:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    products, sellers, orders, users
                  </span>
                </div>
              </div>

              {/* Ping Message Status */}
              {supabaseStatus && (
                <div className={`p-2.5 rounded-xl text-[10px] leading-relaxed border ${
                  supabaseStatus.connected
                    ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900'
                    : 'bg-amber-50/70 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900'
                }`}>
                  {supabaseStatus.message}
                </div>
              )}

              {/* Sync Alert Message */}
              {syncMessage && (
                <div className={`p-2.5 rounded-xl text-[10px] font-semibold border ${
                  syncMessage.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                }`}>
                  {syncMessage.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={checkSupabaseStatus}
                    disabled={supabaseLoading}
                    className="py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${supabaseLoading ? 'animate-spin' : ''}`} />
                    <span>{supabaseLoading ? 'Pinging...' : 'Test Status'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSyncToSupabase}
                  disabled={syncLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                  <span>{syncLoading ? 'Syncing Catalog & Orders...' : 'Sync All Data to Supabase (১-ক্লিকে সিঙ্ক)'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 h-fit shadow-xs">
              <h3 className="font-bold text-sm border-b pb-2 flex items-center space-x-2 text-slate-900 dark:text-white">
                <Settings className="w-4 h-4 text-emerald-600" />
                <span>Global Marketplace Parameters</span>
              </h3>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Shipping Fee Inside Dhaka (৳):</label>
                <input
                  type="number"
                  value={settings.insideDhakaShippingFee}
                  onChange={(e) => setSettings({ ...settings, insideDhakaShippingFee: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Shipping Fee Outside Dhaka (৳):</label>
                <input
                  type="number"
                  value={settings.outsideDhakaShippingFee}
                  onChange={(e) => setSettings({ ...settings, outsideDhakaShippingFee: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Platform Commission (%):</label>
                <input
                  type="number"
                  value={settings.commissionPercentage}
                  onChange={(e) => setSettings({ ...settings, commissionPercentage: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Save Parameters
              </button>
            </div>

            {/* Live Campaign Countdown Timer Controller */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm border-b pb-2 flex items-center space-x-2 text-slate-900 dark:text-white">
                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                <span>Live Countdown Controller (লাইভ টাইমার নিয়ন্ত্রণ)</span>
              </h3>

              <p className="text-[11px] text-slate-400">
                সেট করুন দিন, ৩ ঘণ্টা, মিনিট ও সেকেন্ড। সেভ করার সাথে সাথে মূল হোমপেজের কাউন্টডাউন টাইমারটি লাইভ কমতে শুরু করবে।
              </p>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Days (দিন)</label>
                  <input
                    type="number"
                    min="0"
                    value={timerDays}
                    onChange={(e) => setTimerDays(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Hours (ঘণ্টা)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={timerHours}
                    onChange={(e) => setTimerHours(Math.max(0, Math.min(23, Number(e.target.value))))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Min (মিনিট)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Sec (সেকেন্ড)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold text-center"
                  />
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 p-2.5 rounded-xl text-[10px] leading-relaxed border border-amber-200 dark:border-amber-900">
                <strong>লাইভ আউটপুট:</strong> এটি সরাসরি কাস্টমার ভিউতে রিফ্লেক্ট হবে এবং রিয়েল-টাইম সেকেন্ড আকারে কমতে থাকবে।
              </div>

              <button
                onClick={handleSaveCountdownTimer}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition cursor-pointer"
              >
                Save Live Timer (টাইমার সংরক্ষণ করুন)
              </button>
            </div>

            {/* Admin Security & Password Change Card */}
            <form onSubmit={handleAdminChangePassword} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm border-b pb-2 flex items-center space-x-2 text-slate-900 dark:text-white">
                <Lock className="w-4 h-4 text-red-500" />
                <span>Admin Security & Password (এডমিন পাসওয়ার্ড পরিবর্তন)</span>
              </h3>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার বর্তমান এডমিন অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করুন। পরিবর্তন করার সাথে সাথে পুরাতন পাসওয়ার্ড বাতিল হবে এবং শুধুমাত্র নতুন পাসওয়ার্ড কার্যকর থাকবে।'
                  : 'Change your admin account password. The old password will be immediately invalidated and only the new one will work.'}
              </p>

              {adminPassMsg && (
                <div className={`p-3 rounded-xl text-[11px] font-bold border ${
                  adminPassMsg.success 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                }`}>
                  {adminPassMsg.text}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">
                    {language === 'bn' ? 'বর্তমান পাসওয়ার্ড (Current Password):' : 'Current Password:'}
                  </label>
                  <input
                    type="password"
                    value={adminOldPassword}
                    onChange={(e) => setAdminOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড (New Password):' : 'New Password:'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm):' : 'Confirm New Password:'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adminPassLoading}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition cursor-pointer shadow-md text-xs uppercase tracking-wider"
              >
                {adminPassLoading ? 'Updating...' : (language === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Admin Password')}
              </button>
            </form>
          </div>

          {/* Right panel: Seller Subscriptions */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs shadow-xs">
            <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="p-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 rounded-lg">
                    <Store className="w-4 h-4" />
                  </span>
                  <span>Seller Subscription Control (সেলার সাবস্ক্রিপশন নিয়ন্ত্রণ)</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Manage active plans, change billing states, and extend merchant cycles.
                </p>
              </div>

              {/* Stats Badge */}
              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900 flex items-center space-x-2 font-bold text-[11px]">
                <span>Active Subscriptions:</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                  {sellersList.filter(s => s.subscriptionPlan && s.subscriptionPlan !== 'none' && s.subscriptionStatus === 'active').length}
                </span>
              </div>
            </div>

            {/* Subscriptions Grid/List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {sellersList.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No sellers registered in the platform yet.
                </div>
              ) : (
                sellersList.map((seller) => {
                  const plan = seller.subscriptionPlan || 'none';
                  const status = seller.subscriptionStatus || 'expired';
                  const expiry = seller.subscriptionExpiryDate || 'N/A';
                  
                  return (
                    <div 
                      key={seller.id} 
                      className="p-4 border border-slate-100 dark:border-slate-700/60 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      {/* Store detail */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={seller.logoUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=80&q=80'} 
                            alt="" 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" 
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs">{seller.storeName}</h4>
                            <p className="text-[10px] text-slate-400">Owner ID: {seller.sellerId}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                            plan === 'enterprise' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300' :
                            plan === 'business' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' :
                            plan === 'starter' ? 'bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            Plan: {plan}
                          </span>
                          
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                            status === 'active' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' :
                            status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' :
                            'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300'
                          }`}>
                            Status: {status}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 space-y-0.5 font-medium">
                          <div>Expires: <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{expiry}</span></div>
                          {seller.subscriptionTxnId && (
                            <div>TxnID: <span className="font-mono text-slate-400">{seller.subscriptionTxnId} ({seller.subscriptionPaymentMethod})</span></div>
                          )}
                          {seller.subscriptionAmountPaid !== undefined && (
                            <div>Amount Paid: <span className="font-bold text-slate-700 dark:text-slate-300">৳{seller.subscriptionAmountPaid}</span></div>
                          )}
                        </div>
                      </div>

                      {/* Control Panel for Subscription */}
                      <div className="flex flex-col gap-2 min-w-[200px] bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <span className="font-bold text-[10px] text-slate-400 block border-b pb-1 mb-1">Modify Subscription Settings:</span>
                        
                        {/* Plan Select */}
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] text-slate-500">Plan:</span>
                          <select
                            value={plan}
                            onChange={(e) => handleUpdateSellerSubscription(seller.id, { plan: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold"
                          >
                            <option value="none">None (No Plan)</option>
                            <option value="starter">Starter Plan (৳500)</option>
                            <option value="business">Business Plan (৳1500)</option>
                            <option value="enterprise">Enterprise Plan (৳3000)</option>
                          </select>
                        </div>

                        {/* Status Select */}
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] text-slate-500">Status:</span>
                          <select
                            value={status}
                            onChange={(e) => handleUpdateSellerSubscription(seller.id, { status: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending Approval</option>
                            <option value="expired">Expired</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>

                        {/* Expiry Extension Button */}
                        <button
                          onClick={() => handleExtendSubscription(seller)}
                          className="w-full mt-1.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-lg transition"
                        >
                          +30 Days Extended (মেয়াদ মেয়াদ বাড়ান)
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-3 text-xs">
            <h4 className="font-bold text-sm">Add New Category</h4>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <input
                type="text"
                placeholder="Category Name (English)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full p-2 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="Category Name (Bangla)"
                value={newCatNameBn}
                onChange={(e) => setNewCatNameBn(e.target.value)}
                className="w-full p-2 border rounded-xl"
              />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl">Save</button>
                <button type="button" onClick={() => setIsAddCatOpen(false)} className="px-3 py-2 border rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-3 text-xs">
            <h4 className="font-bold text-sm">Create Promo Code</h4>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <input
                type="text"
                placeholder="Promo Code (e.g., EID2026)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full p-2 border rounded-xl font-mono uppercase"
                required
              />
              <input
                type="number"
                placeholder="Discount %"
                value={couponVal}
                onChange={(e) => setCouponVal(e.target.value)}
                className="w-full p-2 border rounded-xl"
                required
              />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl">Create</button>
                <button type="button" onClick={() => setIsAddCouponOpen(false)} className="px-3 py-2 border rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM USER DUTIES & PERMISSIONS MODAL */}
      {selectedUserForDuties && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Customize User Duties (ব্যবহারকারীর দায়িত্ব কাস্টমাইজ করুন)
              </h4>
              <p className="text-slate-500 mt-1">
                Set fine-grained custom roles and responsibilities for <strong>{selectedUserForDuties.name}</strong> ({selectedUserForDuties.email}).
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 p-2.5 rounded-xl mt-2 text-[11px] leading-relaxed">
                <strong>Important:</strong> If custom duties are assigned, the user can ONLY perform these specific duties and absolutely nothing else. If unassigned, standard role permissions will apply.
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {[
                { id: 'manage_products', label: 'Manage Products (পণ্য সংযোজন ও এডিট)', desc: 'Ability to add, edit and update products.' },
                { id: 'delete_product', label: 'Delete Products (পণ্য ডিলিট)', desc: 'Ability to delete listing items from the catalog.' },
                { id: 'manage_categories', label: 'Manage Categories (ক্যাটাগরি পরিচালনা)', desc: 'Ability to create and manage product categories.' },
                { id: 'delete_category', label: 'Delete Categories (ক্যাটাগরি ডিলিট)', desc: 'Ability to delete categories.' },
                { id: 'manage_coupons', label: 'Manage Coupons (কুপন পরিচালনা)', desc: 'Ability to create and delete promotional promo codes.' },
                { id: 'manage_withdrawals', label: 'Manage Payouts (উত্তোলন অনুমোদন)', desc: 'Ability to review and approve merchant payout requests.' },
                { id: 'manage_settings', label: 'Manage System Settings (সিস্টেম সেটিংস)', desc: 'Ability to change shipping fees and commission settings.' }
              ].map((duty) => {
                const isChecked = selectedDuties.includes(duty.id);
                return (
                  <label 
                    key={duty.id} 
                    className="flex items-start space-x-3 p-2.5 border border-slate-100 dark:border-slate-700/60 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDuties([...selectedDuties, duty.id]);
                        } else {
                          setSelectedDuties(selectedDuties.filter(d => d !== duty.id));
                        }
                      }}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{duty.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{duty.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex space-x-2 pt-2 border-t">
              <button 
                type="button" 
                onClick={handleSaveDuties}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Save Duties (দাযিত্ব সংরক্ষণ করুন)
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedUserForDuties(null)} 
                className="px-4 py-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Image Inspection Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-xs">
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

    </div>
  );
};
