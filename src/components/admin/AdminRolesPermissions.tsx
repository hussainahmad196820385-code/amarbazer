import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Store, Lock, Key, Plus, Trash2, Edit, Check, 
  X, CheckCircle, AlertCircle, Copy, Eye, EyeOff, Sparkles, 
  Settings, Sliders, RefreshCw, Shield, UserCheck, Search,
  DollarSign, Package, ShoppingBag, MessageSquare, Award, AlertTriangle,
  BadgeCheck, Zap, UserPlus, ChevronRight, User, Phone, Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SellerStore, AdminStaffMember, AdminStaffPermission, SellerPermissionConfig } from '../../types';
import { AVAILABLE_ADMIN_PERMISSIONS, ADMIN_ROLE_PRESETS } from '../../lib/permissions';

export const AdminRolesPermissions: React.FC = () => {
  const { language } = useApp();
  
  const [subTab, setSubTab] = useState<'sellers' | 'admin_staff' | 'all_directory'>('sellers');
  const [sellers, setSellers] = useState<SellerStore[]>([]);
  const [adminStaffList, setAdminStaffList] = useState<AdminStaffMember[]>([]);
  const [allDirectoryData, setAllDirectoryData] = useState<{ adminStaff: any[]; sellerStaff: any[]; totalCount: number }>({
    adminStaff: [],
    sellerStaff: [],
    totalCount: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAdminStaffDetail, setSelectedAdminStaffDetail] = useState<AdminStaffMember | null>(null);

  // Seller Permission Edit Modal
  const [selectedSeller, setSelectedSeller] = useState<SellerStore | null>(null);
  const [sellerPermConfig, setSellerPermConfig] = useState<SellerPermissionConfig>({
    canAddProducts: true,
    canProcessOrders: true,
    canRequestWithdrawal: true,
    canFlashSale: true,
    canLiveChat: true,
    autoApproveProducts: true,
    verifiedBadge: true,
    maxStaffAccounts: 10,
    commissionRate: 5,
    status: 'active'
  });
  const [isSavingSellerPerms, setIsSavingSellerPerms] = useState(false);

  // Admin Staff Modal States
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminStaffMember | null>(null);

  // Create Admin Staff Form
  const [staffName, setStaffName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staffRoleTitle, setStaffRoleTitle] = useState('ক্যাটালগ ও স্টোর মডারেটর');
  const [selectedAdminPerms, setSelectedAdminPerms] = useState<AdminStaffPermission[]>([
    'admin_sellers_approve',
    'admin_orders_manage',
    'admin_categories_manage'
  ]);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);
  const [staffError, setStaffError] = useState('');

  // Edit Admin Staff Form
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffPhone, setEditStaffPhone] = useState('');
  const [editStaffEmail, setEditStaffEmail] = useState('');
  const [editStaffRoleTitle, setEditStaffRoleTitle] = useState('');
  const [editStaffPassword, setEditStaffPassword] = useState('');
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [editAdminPerms, setEditAdminPerms] = useState<AdminStaffPermission[]>([]);
  const [editStaffIsActive, setEditStaffIsActive] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sellersRes, staffRes, dirRes] = await Promise.all([
        api.getSellers(),
        api.getAdminStaff(),
        api.getAllStaffDirectory()
      ]);
      setSellers(sellersRes);
      setAdminStaffList(staffRes);
      setAllDirectoryData(dirRes);
    } catch (err) {
      console.error('Failed to load admin roles data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenSellerPerms = (seller: SellerStore) => {
    setSelectedSeller(seller);
    setSellerPermConfig({
      canAddProducts: seller.permissions?.canAddProducts ?? true,
      canProcessOrders: seller.permissions?.canProcessOrders ?? true,
      canRequestWithdrawal: seller.permissions?.canRequestWithdrawal ?? true,
      canFlashSale: seller.permissions?.canFlashSale ?? true,
      canLiveChat: seller.permissions?.canLiveChat ?? true,
      autoApproveProducts: seller.permissions?.autoApproveProducts ?? true,
      verifiedBadge: seller.permissions?.verifiedBadge ?? seller.isApproved,
      maxStaffAccounts: seller.permissions?.maxStaffAccounts ?? 10,
      commissionRate: seller.permissions?.commissionRate ?? 5,
      status: seller.permissions?.status ?? (seller.isApproved ? 'active' : 'pending')
    });
  };

  const handleSaveSellerPerms = async () => {
    if (!selectedSeller) return;
    setIsSavingSellerPerms(true);
    try {
      const updated = await api.updateSellerPermissions(selectedSeller.id, sellerPermConfig);
      setSellers(prev => prev.map(s => s.id === selectedSeller.id ? { ...s, permissions: updated, isApproved: updated.verifiedBadge } : s));
      setSuccessNotice(language === 'bn' ? 'সেলার পারমিশন সফলভাবে আপডেট করা হয়েছে!' : 'Seller permissions updated successfully!');
      setSelectedSeller(null);
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update seller permissions');
    } finally {
      setIsSavingSellerPerms(false);
    }
  };

  const handleQuickToggleSellerFeature = async (seller: SellerStore, field: keyof SellerPermissionConfig) => {
    const currentVal = seller.permissions ? (seller.permissions as any)[field] ?? true : true;
    const newVal = !currentVal;
    
    try {
      const updated = await api.updateSellerPermissions(seller.id, { [field]: newVal });
      setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, permissions: updated, isApproved: updated.verifiedBadge } : s));
      setSuccessNotice(language === 'bn' ? `${seller.storeName} এর পারমিশন পরিবর্তন করা হয়েছে!` : `Updated permission for ${seller.storeName}!`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating feature');
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleApplyAdminPreset = (presetKey: string) => {
    const preset = ADMIN_ROLE_PRESETS[presetKey];
    if (preset) {
      setStaffRoleTitle(language === 'bn' ? preset.titleBn : preset.title);
      setSelectedAdminPerms([...preset.permissions]);
    }
  };

  const handleToggleAdminPerm = (perm: AdminStaffPermission) => {
    setSelectedAdminPerms(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleToggleEditAdminPerm = (perm: AdminStaffPermission) => {
    setEditAdminPerms(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleCreateAdminStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    if (!staffName.trim() || !staffUsername.trim() || !staffPassword.trim()) {
      setStaffError(language === 'bn' ? 'নাম, ইউজারনেম ও পাসওয়ার্ড পূরণ করা আবশ্যক।' : 'Name, username and password are required.');
      return;
    }

    setIsSubmittingStaff(true);
    try {
      const newStaff = await api.createAdminStaff({
        name: staffName.trim(),
        username: staffUsername.trim(),
        password: staffPassword.trim(),
        phone: staffPhone.trim(),
        email: staffEmail.trim(),
        roleTitle: staffRoleTitle.trim(),
        permissions: selectedAdminPerms
      });

      setAdminStaffList(prev => [...prev, newStaff]);
      setIsAddStaffOpen(false);
      setSuccessNotice(language === 'bn' ? `এডমিন কর্মী "${newStaff.name}" সফলভাবে যুক্ত হয়েছে!` : `Admin staff "${newStaff.name}" added successfully!`);
      
      // Reset form
      setStaffName('');
      setStaffUsername('');
      setStaffEmail('');
      setStaffPhone('');
      setStaffPassword('');
      setTimeout(() => setSuccessNotice(null), 5000);
      loadData();
    } catch (err: any) {
      setStaffError(err.message || 'Failed to create admin staff member');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleOpenEditStaff = (staff: AdminStaffMember) => {
    setEditingStaff(staff);
    setEditStaffName(staff.name);
    setEditStaffPhone(staff.phone || '');
    setEditStaffEmail(staff.email || '');
    setEditStaffRoleTitle(staff.roleTitle);
    setEditStaffPassword('');
    setEditAdminPerms([...staff.permissions]);
    setEditStaffIsActive(staff.isActive);
    setIsEditStaffOpen(true);
  };

  const handleSaveEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    try {
      const updated = await api.updateAdminStaff(editingStaff.id, {
        name: editStaffName.trim(),
        phone: editStaffPhone.trim(),
        email: editStaffEmail.trim(),
        roleTitle: editStaffRoleTitle.trim(),
        password: editStaffPassword.trim() || undefined,
        permissions: editAdminPerms,
        isActive: editStaffIsActive
      });

      setAdminStaffList(prev => prev.map(s => s.id === updated.id ? updated : s));
      setIsEditStaffOpen(false);
      setEditingStaff(null);
      setSuccessNotice(language === 'bn' ? 'এডমিন কর্মীর তথ্য সফলভাবে আপডেট হয়েছে!' : 'Admin staff details updated successfully!');
      setTimeout(() => setSuccessNotice(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update admin staff');
    }
  };

  const handleDeleteStaff = async (staffId: string, name: string) => {
    if (!window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত যে "${name}" কে এডমিন টিম থেকে মুছে ফেলতে চান?` : `Are you sure you want to remove "${name}" from admin staff?`)) {
      return;
    }

    try {
      await api.deleteAdminStaff(staffId);
      setAdminStaffList(prev => prev.filter(s => s.id !== staffId));
      setSuccessNotice(language === 'bn' ? 'কর্মী সফলভাবে মুছে ফেলা হয়েছে।' : 'Staff member removed successfully.');
      setTimeout(() => setSuccessNotice(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete staff member');
    }
  };

  const copyCredentials = (username: string, pass: string, id: string) => {
    const text = `AmarBazar BD Admin Login:\nUsername: ${username}\nPassword: ${pass || '******'}\nPortal: https://ais-dev-w5exry6756xf6gnv2kmkvi-723418126960.europe-west2.run.app`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const filteredSellers = sellers.filter(s => 
    s.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.ownerFirstName && s.ownerFirstName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {language === 'bn' ? 'এডমিন সুপার কন্ট্রোল' : 'ADMIN ROLES & PERMISSIONS'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {language === 'bn' ? 'রোল ও পারমিশন কন্ট্রোল সেন্টার' : 'Platform Roles & Permissions Hub'}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {language === 'bn' 
                ? 'প্ল্যাটফর্মের প্রতিটি সেলারের সুযোগ-সুবিধা ও ক্ষমতা নির্ধারণ করুন এবং এডমিন টিম ও সহযোগী কর্মীদের নির্দিষ্ট দায়িত্ব বণ্টন করুন।'
                : 'Configure granular permissions for every registered seller and manage authorized staff members under platform administration.'}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>
            {subTab === 'admin_staff' && (
              <button
                onClick={() => {
                  setStaffPassword(generateRandomPassword());
                  setIsAddStaffOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center space-x-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন এডমিন কর্মী যোগ করুন' : 'Add Admin Staff'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center space-x-2 pt-6 mt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setSubTab('sellers')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
              subTab === 'sellers'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{language === 'bn' ? '১. সেলারদের পারমিশন ও সীমা' : '1. Seller Permissions'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/40 text-amber-200 ml-1">
              {sellers.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('admin_staff')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
              subTab === 'admin_staff'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'bn' ? '২. এডমিন টিম ও কর্মী পারমিশন' : '2. Admin Staff & Team'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/40 text-amber-200 ml-1">
              {adminStaffList.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('all_directory')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
              subTab === 'all_directory'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'bn' ? '৩. সার্বিক কর্মী ডিরেক্টরি' : '3. All Staff Directory'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/40 text-amber-200 ml-1">
              {allDirectoryData.totalCount}
            </span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center space-x-3 text-xs font-bold animate-fadeIn">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* TAB 1: SELLER PERMISSIONS MANAGEMENT */}
      {subTab === 'sellers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'সেলার বা দোকানের নাম দিয়ে খুঁজুন...' : 'Search seller store by name...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-bold flex items-center space-x-2">
              <span>{language === 'bn' ? 'মোট নিবন্ধিত সেলার:' : 'Total Registered Sellers:'}</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold">
                {sellers.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSellers.map((seller) => {
              const perms = seller.permissions || {
                canAddProducts: true,
                canProcessOrders: true,
                canRequestWithdrawal: true,
                canFlashSale: true,
                canLiveChat: true,
                autoApproveProducts: true,
                verifiedBadge: seller.isApproved,
                maxStaffAccounts: 10,
                commissionRate: 5,
                status: seller.isApproved ? 'active' : 'pending'
              };

              const staffCount = seller.staffMembers?.length || 0;

              return (
                <div 
                  key={seller.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Store Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-black text-sm shrink-0 overflow-hidden">
                          {seller.logoUrl ? (
                            <img src={seller.logoUrl} alt={seller.storeName} className="w-full h-full object-cover" />
                          ) : (
                            seller.storeName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                              {seller.storeName}
                            </h3>
                            {perms.verifiedBadge && (
                              <BadgeCheck className="w-4 h-4 text-sky-500 shrink-0" title="Verified Store" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {seller.ownerFirstName || 'Seller Owner'} • {seller.storeCategory || 'General'}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        perms.status === 'active' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                          : perms.status === 'suspended'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      }`}>
                        {perms.status}
                      </span>
                    </div>

                    {/* Quick Permissions Toggle Grid */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        {language === 'bn' ? 'সেলার পারমিশন ও এক্সেস' : 'SELLER PERMISSIONS'}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleSellerFeature(seller, 'canAddProducts')}
                          className={`p-2 rounded-xl flex items-center justify-between border transition cursor-pointer ${
                            perms.canAddProducts 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold' 
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 line-through'
                          }`}
                        >
                          <span className="truncate">{language === 'bn' ? 'পণ্য আপলোড' : 'Add Products'}</span>
                          {perms.canAddProducts ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickToggleSellerFeature(seller, 'canProcessOrders')}
                          className={`p-2 rounded-xl flex items-center justify-between border transition cursor-pointer ${
                            perms.canProcessOrders 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold' 
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 line-through'
                          }`}
                        >
                          <span className="truncate">{language === 'bn' ? 'অর্ডার প্রসেস' : 'Process Orders'}</span>
                          {perms.canProcessOrders ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickToggleSellerFeature(seller, 'canRequestWithdrawal')}
                          className={`p-2 rounded-xl flex items-center justify-between border transition cursor-pointer ${
                            perms.canRequestWithdrawal 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold' 
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 line-through'
                          }`}
                        >
                          <span className="truncate">{language === 'bn' ? 'উইথড্রয়াল' : 'Withdrawals'}</span>
                          {perms.canRequestWithdrawal ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickToggleSellerFeature(seller, 'canFlashSale')}
                          className={`p-2 rounded-xl flex items-center justify-between border transition cursor-pointer ${
                            perms.canFlashSale 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold' 
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 line-through'
                          }`}
                        >
                          <span className="truncate">{language === 'bn' ? 'ফ্ল্যাশ সেল' : 'Flash Sales'}</span>
                          {perms.canFlashSale ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      </div>

                      {/* Meta limits info */}
                      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 font-bold border-t border-slate-200/50 dark:border-slate-700/50">
                        <span>{language === 'bn' ? 'কমিশন রেট:' : 'Commission:'} <strong className="text-slate-800 dark:text-slate-200">{perms.commissionRate}%</strong></span>
                        <span>{language === 'bn' ? 'স্টাফ লিমিট:' : 'Staff Limit:'} <strong className="text-slate-800 dark:text-slate-200">{staffCount} / {perms.maxStaffAccounts}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-bold flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                      <span>{staffCount} {language === 'bn' ? 'জন কর্মী' : 'staff'}</span>
                    </span>

                    <button
                      onClick={() => handleOpenSellerPerms(seller)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-black transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'পারমিশন কনফিগার' : 'Configure'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ADMIN STAFF & TEAM MANAGEMENT */}
      {subTab === 'admin_staff' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {language === 'bn' ? 'এডমিন সহযোগী ও মডারেটর তালিকা' : 'Platform Administration Officers'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'এডমিনের অধীনে নিযুক্ত কর্মীদের নির্ধারিত পারমিশন অনুযায়ী অ্যাক্সেস থাকবে।' : 'Authorized sub-admins with role-based platform privileges.'}
              </p>
            </div>
            <button
              onClick={() => {
                setStaffPassword(generateRandomPassword());
                setIsAddStaffOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center space-x-2 cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন কর্মী যুক্ত করুন' : 'Add New Admin Staff'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {adminStaffList.map((staff) => (
              <div 
                key={staff.id}
                onClick={() => setSelectedAdminStaffDetail(staff)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-base shrink-0 group-hover:scale-105 transition-transform">
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {staff.name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        staff.isActive 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}>
                        {staff.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5 truncate">
                      {staff.roleTitle}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      @{staff.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition shrink-0">
                  <span className="text-[11px] font-bold hidden sm:inline">{language === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN STAFF FULL DETAILS MODAL */}
      {selectedAdminStaffDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] text-xs overflow-hidden animate-scaleUp border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 font-bold shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-extrabold text-sm">
                    {language === 'bn' ? 'এডমিন কর্মকর্তার পূর্ণ বিবরণ' : 'Admin Officer Full Details'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'bn' ? 'অ্যাকাউন্ট ক্রেডেনশিয়াল ও প্রশাসনিক ক্ষমতা' : 'Account credentials & administrative permissions'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdminStaffDetail(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              {/* Profile Card Banner */}
              <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                    {selectedAdminStaffDetail.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {selectedAdminStaffDetail.name}
                      </h4>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        selectedAdminStaffDetail.isActive 
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}>
                        {selectedAdminStaffDetail.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                      {selectedAdminStaffDetail.roleTitle}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      @{selectedAdminStaffDetail.username}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyCredentials(selectedAdminStaffDetail.username, selectedAdminStaffDetail.password || '', selectedAdminStaffDetail.id)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  {copiedId === selectedAdminStaffDetail.id ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{language === 'bn' ? 'লগইন তথ্য কপি' : 'Copy Credentials'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Login & Contact Details Grid */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{language === 'bn' ? 'লগইন ও সিস্টেম বিবরণ' : 'Credentials & System Info'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                      {language === 'bn' ? 'লগইন ইউজারনেম' : 'Username'}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      @{selectedAdminStaffDetail.username}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                      {language === 'bn' ? 'ইমেইল' : 'Email'}
                    </span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {selectedAdminStaffDetail.email || 'N/A'}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                      {language === 'bn' ? 'ফোন নম্বর' : 'Phone'}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedAdminStaffDetail.phone || 'N/A'}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                      {language === 'bn' ? 'অ্যাকাউন্ট তৈরি' : 'Created Date'}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedAdminStaffDetail.createdAt ? new Date(selectedAdminStaffDetail.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Granted Permissions List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{language === 'bn' ? 'অনুমোদিত প্রশাসনিক পারমিশন' : 'Granted Admin Permissions'}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedAdminStaffDetail.permissions.length} {language === 'bn' ? 'টি ক্ষমতা সক্রিয়' : 'Privileges Active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedAdminStaffDetail.permissions.map((permKey) => {
                    const info = AVAILABLE_ADMIN_PERMISSIONS.find(p => p.id === permKey);
                    return (
                      <div
                        key={permKey}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 flex items-start space-x-2.5"
                      >
                        <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                            {language === 'bn' ? info?.labelBn || permKey : info?.label || permKey}
                          </span>
                          <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                            {language === 'bn' ? info?.descriptionBn : info?.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const toDelete = selectedAdminStaffDetail;
                  setSelectedAdminStaffDetail(null);
                  handleDeleteStaff(toDelete.id, toDelete.name);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কর্মী মুছে ফেলুন' : 'Delete Officer'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedAdminStaffDetail(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedAdminStaffDetail;
                    setSelectedAdminStaffDetail(null);
                    handleOpenEditStaff(toEdit);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'তথ্য ও পারমিশন এডিট' : 'Edit Permissions'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALL STAFF DIRECTORY */}
      {subTab === 'all_directory' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {language === 'bn' ? 'প্ল্যাটফর্মের সকল কর্মী ডিরেক্টরি' : 'Platform-Wide Staff Directory'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'এডমিন টিম এবং সমস্ত সেলার স্টোরের সহকারীদের তালিকা।' : 'Real-time aggregated view of all operational accounts.'}
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300">
              {allDirectoryData.totalCount} {language === 'bn' ? 'জন কর্মী' : 'Accounts'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-black text-[10px]">
                  <th className="pb-3 px-2">{language === 'bn' ? 'কর্মীর নাম ও ইউজারনেম' : 'Staff & Username'}</th>
                  <th className="pb-3 px-2">{language === 'bn' ? 'সংগঠন / স্টোর' : 'Store / Entity'}</th>
                  <th className="pb-3 px-2">{language === 'bn' ? 'নির্ধারিত ভূমিকা' : 'Role Title'}</th>
                  <th className="pb-3 px-2">{language === 'bn' ? 'অ্যাকাউন্ট টাইপ' : 'Account Type'}</th>
                  <th className="pb-3 px-2">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Admin Staff Rows */}
                {allDirectoryData.adminStaff.map((staff: any) => (
                  <tr key={`admin-${staff.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-2">
                      <div className="font-extrabold text-slate-900 dark:text-white">{staff.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@{staff.username}</div>
                    </td>
                    <td className="py-3 px-2 font-bold text-indigo-600 dark:text-indigo-400">
                      {staff.storeName}
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">
                      {staff.roleTitle}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase">
                        Admin Officer
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        staff.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {staff.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Seller Staff Rows */}
                {allDirectoryData.sellerStaff.map((staff: any) => (
                  <tr key={`seller-${staff.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-2">
                      <div className="font-extrabold text-slate-900 dark:text-white">{staff.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@{staff.username}</div>
                    </td>
                    <td className="py-3 px-2 font-bold text-amber-600 dark:text-amber-400">
                      {staff.storeName}
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">
                      {staff.roleTitle}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 uppercase">
                        Seller Staff
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        staff.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {staff.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURE SELLER PERMISSIONS */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-amber-500">
                  {language === 'bn' ? 'সেলার পারমিশন কনফিগারেশন' : 'SELLER PERMISSIONS CONFIG'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedSeller.storeName}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSeller(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status and Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                    {language === 'bn' ? 'স্টোর স্ট্যাটাস' : 'Store Status'}
                  </label>
                  <select
                    value={sellerPermConfig.status}
                    onChange={(e) => setSellerPermConfig(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="pending">Pending Review (পর্যালোচনাধীন)</option>
                    <option value="suspended">Suspended (স্থগিত)</option>
                    <option value="restricted">Restricted (সীমিত এক্সেস)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                    {language === 'bn' ? 'ভেরিফাইড ব্লু ব্যাজ' : 'Verified Blue Badge'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setSellerPermConfig(prev => ({ ...prev, verifiedBadge: !prev.verifiedBadge }))}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition cursor-pointer ${
                      sellerPermConfig.verifiedBadge 
                        ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <BadgeCheck className="w-4 h-4" />
                    <span>{sellerPermConfig.verifiedBadge ? (language === 'bn' ? 'ভেরিফাইড ব্যাজ সক্রিয়' : 'Verified') : (language === 'bn' ? 'ব্যাজ নিষ্ক্রিয়' : 'Unverified')}</span>
                  </button>
                </div>
              </div>

              {/* Commission Rate and Staff Accounts Limit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                    {language === 'bn' ? 'প্ল্যাটফর্ম কমিশন রেট (%)' : 'Commission Rate (%)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={sellerPermConfig.commissionRate}
                    onChange={(e) => setSellerPermConfig(prev => ({ ...prev, commissionRate: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                    {language === 'bn' ? 'সর্বোচ্চ স্টাফ অ্যাকাউন্ট' : 'Max Staff Accounts'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={sellerPermConfig.maxStaffAccounts}
                    onChange={(e) => setSellerPermConfig(prev => ({ ...prev, maxStaffAccounts: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              {/* Granular Feature Checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">
                  {language === 'bn' ? 'অনুমোদিত ফিচারসমূহ:' : 'ALLOWED SELLER CAPABILITIES:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'canAddProducts', label: 'নতুন পণ্য আপলোড ও এডিট', labelEn: 'Upload & Edit Products' },
                    { id: 'canProcessOrders', label: 'অর্ডার কনফার্ম ও ডেলিভারি আপডেট', labelEn: 'Process & Confirm Orders' },
                    { id: 'canRequestWithdrawal', label: 'বিকাশ/ব্যাংকে টাকা উত্তোলন', labelEn: 'Request Money Withdrawals' },
                    { id: 'canFlashSale', label: 'ফ্ল্যাশ সেল ও ডিসকাউন্ট ক্যাম্পেইন', labelEn: 'Join Flash Sales & Promos' },
                    { id: 'canLiveChat', label: 'গ্রাহকদের সাথে লাইভ চ্যাট', labelEn: 'Live Customer Helpdesk Chat' },
                    { id: 'autoApproveProducts', label: 'সরাসরি পণ্য লাইভ (অটো এপ্রুভ)', labelEn: 'Auto-Approve Products Live' }
                  ].map(feat => {
                    const checked = Boolean((sellerPermConfig as any)[feat.id]);
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => setSellerPermConfig(prev => ({ ...prev, [feat.id]: !checked }))}
                        className={`p-3 rounded-2xl border text-left flex items-start space-x-3 transition cursor-pointer ${
                          checked
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 font-extrabold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border ${
                          checked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-400'
                        }`}>
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="text-xs leading-tight">
                          {language === 'bn' ? feat.label : feat.labelEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSeller(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveSellerPerms}
                disabled={isSavingSellerPerms}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center space-x-2"
              >
                {isSavingSellerPerms ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'bn' ? 'পারমিশন সংরক্ষণ করুন' : 'Save Permissions'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD ADMIN STAFF MEMBER */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-indigo-500">
                  {language === 'bn' ? 'এডমিন টিম মেম্বার' : 'ADMIN TEAM ONBOARDING'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'নতুন এডমিন সহকারী বা মডারেটর নিয়োগ' : 'Add New Admin Officer / Moderator'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAddStaffOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {staffError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{staffError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdminStaff} className="space-y-4">
              {/* Role Presets */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  {language === 'bn' ? 'কুইক রোল প্রিসেট বাছাই করুন:' : 'QUICK ROLE PRESETS:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ADMIN_ROLE_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleApplyAdminPreset(key)}
                      className="p-2.5 rounded-xl border border-indigo-500/20 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-left transition cursor-pointer"
                    >
                      <div className="font-extrabold text-xs text-indigo-700 dark:text-indigo-300">
                        {language === 'bn' ? preset.titleBn : preset.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {preset.permissions.length} {language === 'bn' ? 'টি ক্ষমতা' : 'privileges'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Role Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'কর্মীর পূর্ণ নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariqul Islam"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'পদবী / রোল টাইটেল' : 'Designation / Title'}
                  </label>
                  <input
                    type="text"
                    value={staffRoleTitle}
                    onChange={(e) => setStaffRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'ইউজারনেম (লগইনের জন্য) *' : 'Username (for login) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. finance_tariq"
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setStaffPassword(generateRandomPassword())}
                      className="text-[10px] text-amber-500 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{language === 'bn' ? 'অটো জেনারেট' : 'Generate'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    placeholder="staff@amarbazar.bd"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    placeholder="017xxxxxxxx"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Granular Admin Permissions Checklist */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">
                  {language === 'bn' ? 'নির্দিষ্ট ক্ষমতার তালিকা (Permissions):' : 'ASSIGNED ADMIN PRIVILEGES:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_ADMIN_PERMISSIONS.map(perm => {
                    const isSelected = selectedAdminPerms.includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => handleToggleAdminPerm(perm.id)}
                        className={`p-2.5 rounded-2xl border text-left flex items-start space-x-2.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-900 dark:text-indigo-200 font-extrabold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs leading-tight">
                            {language === 'bn' ? perm.labelBn : perm.label}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {language === 'bn' ? perm.descriptionBn : perm.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStaff}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-600/20 transition cursor-pointer flex items-center space-x-2"
                >
                  {isSubmittingStaff ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'bn' ? 'যুক্ত হচ্ছে...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{language === 'bn' ? 'কর্মী নিশ্চিত করুন' : 'Confirm Staff'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ADMIN STAFF */}
      {isEditStaffOpen && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-indigo-500">
                  {language === 'bn' ? 'এডমিন কর্মী তথ্য এডিট' : 'EDIT ADMIN OFFICER'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingStaff.name} (@{editingStaff.username})
                </h3>
              </div>
              <button 
                onClick={() => setIsEditStaffOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'কর্মীর নাম' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffName}
                    onChange={(e) => setEditStaffName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'পদবী / রোল' : 'Designation'}
                  </label>
                  <input
                    type="text"
                    value={editStaffRoleTitle}
                    onChange={(e) => setEditStaffRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Password Reset Optional */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড (ঐচ্ছিক)' : 'New Password (optional)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditStaffPassword(generateRandomPassword())}
                    className="text-[10px] text-amber-500 font-bold hover:underline cursor-pointer"
                  >
                    {language === 'bn' ? 'অটো জেনারেট' : 'Generate'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={editShowPassword ? 'text' : 'password'}
                    placeholder={language === 'bn' ? 'পাসওয়ার্ড অপরিবর্তিত রাখতে ফাঁকা রাখুন' : 'Leave empty to keep unchanged'}
                    value={editStaffPassword}
                    onChange={(e) => setEditStaffPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setEditShowPassword(!editShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                  >
                    {editShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-slate-800 dark:text-white">
                    {language === 'bn' ? 'অ্যাকাউন্ট স্ট্যাটাস' : 'Account Status'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'নিষ্ক্রিয় থাকলে কর্মী লগইন করতে পারবে না' : 'Disabled staff cannot login'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditStaffIsActive(!editStaffIsActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    editStaffIsActive ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {editStaffIsActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Permissions */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">
                  {language === 'bn' ? 'অনুমোদিত পারমিশনসমূহ:' : 'PRIVILEGES:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_ADMIN_PERMISSIONS.map(perm => {
                    const isSelected = editAdminPerms.includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => handleToggleEditAdminPerm(perm.id)}
                        className={`p-2.5 rounded-2xl border text-left flex items-start space-x-2.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-900 dark:text-indigo-200 font-extrabold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="text-xs leading-tight">
                          {language === 'bn' ? perm.labelBn : perm.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditStaffOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-600/20 transition cursor-pointer flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
