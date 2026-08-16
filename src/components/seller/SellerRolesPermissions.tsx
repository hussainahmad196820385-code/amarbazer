import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, UserPlus, Key, User, Mail, Lock, Trash2, Edit, Check, 
  X, CheckCircle, AlertCircle, Copy, Eye, EyeOff, Sparkles, MessageSquare, 
  ShoppingBag, Package, DollarSign, Sliders, Star, ClipboardList, RefreshCw,
  Shield, UserCheck, HelpCircle, ChevronRight, Phone, Calendar, ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SellerStaffMember, SellerStaffPermission } from '../../types';
import { AVAILABLE_STAFF_PERMISSIONS, ROLE_PRESETS } from '../../lib/permissions';

interface SellerRolesPermissionsProps {
  storeId?: string;
  storeName?: string;
}

export const SellerRolesPermissions: React.FC<SellerRolesPermissionsProps> = ({ storeId, storeName }) => {
  const { currentUser, language } = useApp();
  const [staffMembers, setStaffMembers] = useState<SellerStaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<SellerStaffMember | null>(null);
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<SellerStaffMember | null>(null);

  // Form states for creating staff
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleTitle, setRoleTitle] = useState('কাস্টমার সাপোর্ট ও অর্ডার অ্যাসিস্ট্যান্ট');
  const [selectedPermissions, setSelectedPermissions] = useState<SellerStaffPermission[]>([
    'orders_view',
    'orders_process',
    'messages_chat'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null);

  // Form states for editing staff
  const [editName, setEditName] = useState('');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [editPermissions, setEditPermissions] = useState<SellerStaffPermission[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);

  const effectiveStoreId = storeId || currentUser?.sellerId || currentUser?.id || 'store-dhaka-tech';

  const loadStaff = async () => {
    if (!effectiveStoreId) return;
    setIsLoading(true);
    try {
      const list = await api.getStaffMembers(effectiveStoreId);
      setStaffMembers(list);
    } catch (err) {
      console.error('Failed to load staff members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [effectiveStoreId]);

  const handleTogglePermission = (permId: SellerStaffPermission, isEditMode = false) => {
    if (isEditMode) {
      setEditPermissions(prev => 
        prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
      );
    } else {
      setSelectedPermissions(prev => 
        prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
      );
    }
  };

  const applyPreset = (presetKey: keyof typeof ROLE_PRESETS, isEditMode = false) => {
    const preset = ROLE_PRESETS[presetKey];
    if (!preset) return;
    if (isEditMode) {
      setEditRoleTitle(language === 'bn' ? preset.titleBn : preset.title);
      setEditPermissions([...preset.permissions]);
    } else {
      setRoleTitle(language === 'bn' ? preset.titleBn : preset.title);
      setSelectedPermissions([...preset.permissions]);
    }
  };

  const handleGeneratePassword = (isEditMode = false) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let generated = '';
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (isEditMode) {
      setEditNewPassword(generated);
      setEditShowPassword(true);
    } else {
      setPassword(generated);
      setShowPassword(true);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে নাম, ইউজারনেম এবং পাসওয়ার্ড পূরণ করুন।' : 'Please fill full name, username and password.');
      return;
    }
    if (selectedPermissions.length === 0) {
      setErrorMsg(language === 'bn' ? 'কমপক্ষে একটি পারমিশন সিলেক্ট করুন।' : 'Please select at least one permission.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
      const created = await api.createStaffMember(effectiveStoreId, {
        name: name.trim(),
        username: cleanUsername,
        password: password.trim(),
        email: email.trim().toLowerCase() || `${cleanUsername}@staff.amarbazar.bd`,
        phone: phone.trim() || undefined,
        roleTitle: roleTitle.trim(),
        permissions: selectedPermissions
      });

      setStaffMembers(prev => [...prev, created]);
      setIsCreateModalOpen(false);
      setSuccessNotice(
        language === 'bn' 
          ? `স্টাফ সদস্য "${name}" সফলভাবে যুক্ত হয়েছে! লগইন ইউজারনেম: ${cleanUsername}, পাসওয়ার্ড: ${password}`
          : `Staff member "${name}" successfully created! Login Username: ${cleanUsername}`
      );
      // Reset
      setName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setPassword('');
      setRoleTitle('কাস্টমার সাপোর্ট ও অর্ডার অ্যাসিস্ট্যান্ট');
      setSelectedPermissions(['orders_view', 'orders_process', 'messages_chat']);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (staff: SellerStaffMember) => {
    setEditingStaff(staff);
    setEditName(staff.name);
    setEditRoleTitle(staff.roleTitle);
    setEditPhone(staff.phone || '');
    setEditEmail(staff.email || '');
    setEditPermissions([...staff.permissions]);
    setEditIsActive(staff.isActive);
    setEditNewPassword('');
    setEditShowPassword(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!editName.trim()) {
      alert(language === 'bn' ? 'নাম ফাঁকা রাখা যাবে না।' : 'Name cannot be empty.');
      return;
    }
    if (editPermissions.length === 0) {
      alert(language === 'bn' ? 'কমপক্ষে একটি পারমিশন সিলেক্ট করুন।' : 'Please select at least one permission.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await api.updateStaffMember(effectiveStoreId, editingStaff.id, {
        name: editName.trim(),
        roleTitle: editRoleTitle.trim(),
        phone: editPhone.trim() || undefined,
        email: editEmail.trim() || undefined,
        permissions: editPermissions,
        isActive: editIsActive,
        password: editNewPassword.trim() || undefined
      });

      setStaffMembers(prev => prev.map(s => s.id === updated.id ? updated : s));
      setIsEditModalOpen(false);
      setEditingStaff(null);
      setSuccessNotice(
        language === 'bn' 
          ? `স্টাফ "${editName}" এর তথ্য ও পারমিশন সফলভাবে আপডেট করা হয়েছে!`
          : `Staff member "${editName}" updated successfully!`
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (!confirm(language === 'bn' 
      ? `আপনি কি নিশ্চিতভাবে স্টাফ "${staffName}"-কে মুছে ফেলতে চান? সে আর লগইন করতে পারবে না।` 
      : `Are you sure you want to remove staff member "${staffName}"?`)) {
      return;
    }

    try {
      await api.deleteStaffMember(effectiveStoreId, staffId);
      setStaffMembers(prev => prev.filter(s => s.id !== staffId));
      setSuccessNotice(
        language === 'bn' 
          ? `স্টাফ "${staffName}" মুছে ফেলা হয়েছে।` 
          : `Staff "${staffName}" deleted.`
      );
    } catch (err: any) {
      alert(err.message || 'Failed to delete staff member.');
    }
  };

  const handleCopyCredentials = (staff: SellerStaffMember) => {
    const loginUser = staff.username || staff.email;
    const text = `🏪 Store: ${storeName || 'AmarBazar Store'}\n👤 Staff: ${staff.name} (${staff.roleTitle})\n🆔 Login Username: ${loginUser}\n📧 Email: ${staff.email}\n🔑 Password: (The password you set when creating this account)\n🌐 Login Portal: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedStaffId(staff.id);
    setTimeout(() => setCopiedStaffId(null), 3000);
  };

  // Group available permissions by category
  const categoriesList = [
    { key: 'orders', labelBn: 'অর্ডার ও ডেলিভারি', labelEn: 'Orders & Delivery', icon: ShoppingBag },
    { key: 'messages', labelBn: 'গ্রাহক বার্তা ও রিভিউ', labelEn: 'Messages & Reviews', icon: MessageSquare },
    { key: 'products', labelBn: 'পণ্য ও ইনভেন্টরি', labelEn: 'Products & Inventory', icon: Package },
    { key: 'store', labelBn: 'দোকান ও অর্থায়ন', labelEn: 'Store & Finances', icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-emerald-500/10 dark:from-emerald-950/40 dark:via-sky-950/20 dark:to-emerald-950/40 border border-emerald-500/20 dark:border-emerald-800/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {language === 'bn' ? 'রুলস ও পারমিশন কন্ট্রোল (Rules & Permissions)' : 'Store Rules & Staff Permissions'}
                </h3>
                <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {language === 'bn' ? 'স্টোর মাল্টি-ইউজার' : 'Multi-User'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {language === 'bn'
                  ? 'আপনার স্টোর একা পরিচালনা করতে সমস্যা হলে অন্য স্টাফ বা সহযোগীকে নির্দিষ্ট কাজের দায়িত্ব দিন। আপনি তাদের জন্য আলাদা পাসওয়ার্ড সেট করতে পারবেন এবং অর্ডার কনফার্ম, কাস্টমার চ্যাট বা প্রোডাক্ট ম্যানেজমেন্টের নির্দিষ্ট এক্সেস নির্ধারণ করতে পারবেন।'
                  : 'Delegate store responsibilities to your staff or assistants. Set custom passwords and restrict access to orders, messaging, inventory, or product catalogs with granular control.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 text-xs shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'bn' ? '+ নতুন স্টাফ অ্যাকাউন্ট যোগ করুন' : '+ Add New Staff Account'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessNotice(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* How it works info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-black text-xs">
            ১
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
              {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Staff Login'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {language === 'bn' ? 'স্টাফের ইমেইল/ইউজারনেম এবং আপনার ইচ্ছামতো পাসওয়ার্ড সেট করুন।' : 'Set email and custom login password for your employee.'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-black text-xs">
            ২
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
              {language === 'bn' ? 'কাজের দায়িত্ব সিলেক্ট করুন' : 'Assign Exact Roles'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {language === 'bn' ? 'শুধু অর্ডার ও চ্যাট রেসপন্সের পারমিশন দিলে সে অন্য কোনো তথ্যে ঢুকতে পারবে না।' : 'Strictly limit access to orders, chats, reviews or inventory.'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-black text-xs">
            ৩
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
              {language === 'bn' ? 'নিরাপদ স্টোর সুরক্ষা' : 'Complete Data Privacy'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {language === 'bn' ? 'আপনার ব্যক্তিগত ব্যাংক তথ্য এবং উইথড্রয়াল ফান্ড সম্পূর্ণ সুরক্ষিত থাকে।' : 'Withdrawals & store credentials remain locked from staff.'}
            </p>
          </div>
        </div>
      </div>

      {/* Staff Members List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              {language === 'bn' ? 'যুক্ত হওয়া স্টাফ সদস্যবৃন্দ' : 'Active Staff Members'} ({staffMembers.length})
            </h4>
          </div>
          <button 
            onClick={loadStaff} 
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            <span>{language === 'bn' ? 'স্টাফ তালিকা লোড হচ্ছে...' : 'Loading staff accounts...'}</span>
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'এখনো কোনো সহযোগী বা স্টাফ অ্যাকাউন্ট তৈরি করা হয়নি' : 'No staff accounts created yet'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনার দোকানের মেসেজ রিপ্লাই বা অর্ডার রিসিভ করার দায়িত্ব অন্য কাউকে দিতে ওপরের বাটনে ক্লিক করে অ্যাকাউন্ট বানিয়ে দিন।'
                  : 'Click "+ Add New Staff Account" above to create an account with customized permissions for your team.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রথম স্টাফ অ্যাকাউন্ট তৈরি করুন' : 'Create First Staff Account'}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {staffMembers.map((staff) => (
              <div 
                key={staff.id} 
                onClick={() => setSelectedStaffDetail(staff)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-750/50 active:bg-slate-100/80 dark:active:bg-slate-700 cursor-pointer transition group"
              >
                {/* Left Profile Info (As highlighted by user) */}
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-xs truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {staff.name}
                      </h5>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        staff.isActive 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {staff.isActive ? (language === 'bn' ? 'Active' : 'Active') : (language === 'bn' ? 'Disabled' : 'Disabled')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center flex-wrap gap-1.5 mt-0.5">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{staff.roleTitle}</span>
                      <span>•</span>
                      <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-slate-700 dark:text-slate-300">
                        @{staff.username || staff.email.split('@')[0]}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right Arrow / Details Button */}
                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition shrink-0">
                  <span className="text-[11px] font-bold hidden sm:inline">{language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STAFF FULL DETAILS MODAL */}
      {selectedStaffDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] text-xs overflow-hidden animate-scaleUp border border-slate-200/80 dark:border-slate-700">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 p-4 sm:p-5 font-bold shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-extrabold text-sm">
                    {language === 'bn' ? 'স্টাফ অ্যাকাউন্টের পূর্ণাঙ্গ বিবরণ' : 'Staff Account Full Details'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'bn' ? 'কর্মীর প্রোফাইল, লগইন ক্রেডেনশিয়াল ও সক্রিয় পারমিশন' : 'Profile, login credentials and granted permissions'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStaffDetail(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              {/* Profile Card Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                    {selectedStaffDetail.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {selectedStaffDetail.name}
                      </h4>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        selectedStaffDetail.isActive 
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}>
                        {selectedStaffDetail.isActive ? (language === 'bn' ? 'সক্রিয় (Active)' : 'Active') : (language === 'bn' ? 'নিষ্ক্রিয় (Disabled)' : 'Disabled')}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                      {selectedStaffDetail.roleTitle}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      @{selectedStaffDetail.username || selectedStaffDetail.email.split('@')[0]}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCredentials(selectedStaffDetail)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  {copiedStaffId === selectedStaffDetail.id ? (
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
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'bn' ? 'লগইন ও যোগাযোগ সংক্রান্ত তথ্য' : 'Login & Contact Info'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                      {language === 'bn' ? 'লগইন ইউজারনেম (Login Username)' : 'Login Username'}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      @{selectedStaffDetail.username || selectedStaffDetail.email.split('@')[0]}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                      {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                    </span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {selectedStaffDetail.email || 'N/A'}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                      {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedStaffDetail.phone || (language === 'bn' ? 'যুক্ত করা হয়নি' : 'Not provided')}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                      {language === 'bn' ? 'অ্যাকাউন্ট তৈরির তারিখ' : 'Created Date'}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedStaffDetail.createdAt ? new Date(selectedStaffDetail.createdAt).toLocaleDateString('bn-BD') : 'Recent'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/15 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold">🔑 {language === 'bn' ? 'পাসওয়ার্ড নির্দেশনা:' : 'Password Info:'} </span>
                  {language === 'bn' 
                    ? 'স্টাফ তৈরির সময় আপনি যে পাসওয়ার্ড দিয়েছিলেন, কর্মী সেই পাসওয়ার্ড দিয়ে লগইন পেজ থেকে প্রবেশ করতে পারবে।'
                    : 'The staff member logs in using the password set by the store owner.'}
                </div>
              </div>

              {/* Granted Permissions List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === 'bn' ? 'অনুমোদিত দায়িত্ব ও পারমিশন' : 'Assigned Permissions'}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedStaffDetail.permissions.length} {language === 'bn' ? 'টি পারমিশন কার্যকর' : 'Permissions Active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedStaffDetail.permissions.map((permKey) => {
                    const info = AVAILABLE_STAFF_PERMISSIONS.find(p => p.id === permKey);
                    return (
                      <div
                        key={permKey}
                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-850 flex items-start space-x-2.5"
                      >
                        <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
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
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const toDelete = selectedStaffDetail;
                  setSelectedStaffDetail(null);
                  handleDeleteStaff(toDelete.id, toDelete.name);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'স্টাফ মুছে ফেলুন' : 'Delete Staff'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedStaffDetail(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedStaffDetail;
                    setSelectedStaffDetail(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পারমিশন এডিট ও পাসওয়ার্ড পরিবর্তন' : 'Edit Permissions'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] text-xs overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 p-4 sm:p-5 font-bold text-sm shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-extrabold text-sm">
                    {language === 'bn' ? 'নতুন স্টাফ অ্যাকাউন্ট তৈরি ও পারমিশন নির্ধারণ' : 'Create Staff Member & Set Rules'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-normal">
                    {language === 'bn' ? 'স্টাফের জন্য পাসওয়ার্ড বানিয়ে দিন এবং সে কী কী কাজ করতে পারবে তা সিলেক্ট করুন।' : 'Assign custom credentials and select granted store privileges.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Basic Login Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'bn' ? '১. স্টাফের প্রোফাইল ও লগইন তথ্য' : '1. Staff Profile & Login Credentials'}</span>
                </h4>

                {/* Top credentials callout banner */}
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs">
                  <span className="font-bold">💡 {language === 'bn' ? 'লগইন নিয়মাবলী:' : 'Login Rule:'} </span>
                  {language === 'bn' 
                    ? 'আপনি এখানে যে ইউজারনেম এবং পাসওয়ার্ড নির্ধারণ করে দেবেন, আপনার কর্মী হুবহু সেই ইউজারনেম ও পাসওয়ার্ড দিয়ে ওয়েবসাইটে সরাসরি লগইন করতে পারবে।'
                    : 'The staff member will log in directly using the exact username and password you create below.'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'bn' ? 'লগইন ইউজারনেম (Username / ID):' : 'Login Username / User ID:'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        placeholder={language === 'bn' ? 'যেমন: rakib_staff' : 'e.g. rakib_staff'}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono font-bold"
                        required
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {language === 'bn' ? 'কর্মী এই ইউজারনেম দিয়ে লগইন করবে (ছোট হাতের অক্ষর)' : 'Staff will use this username to log in'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        {language === 'bn' ? 'লগইন পাসওয়ার্ড (Password):' : 'Login Password:'} <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleGeneratePassword(false)}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        {language === 'bn' ? 'স্বয়ংক্রিয় পাসওয়ার্ড' : 'Auto Generate'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono font-bold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {language === 'bn' ? 'যা দিবেন ওইটা দিয়েই লগইন করতে পারবে' : 'Staff will log in using this password'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'bn' ? 'কর্মীর পুরো নাম:' : 'Staff Full Name:'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ রাকিব' : 'e.g. Md Rakib'}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'bn' ? 'পদবী / দায়িত্বের শিরোনাম:' : 'Role Title / Designation:'}
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: কাস্টমার সাপোর্ট এক্সিকিউটিভ' : 'e.g. Support Executive'}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'bn' ? 'মোবাইল নম্বর (ঐচ্ছিক):' : 'Phone Number (Optional):'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'bn' ? 'ইমেইল ঠিকানা (ঐচ্ছিক):' : 'Email Address (Optional):'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rakib@example.com"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Quick Role Presets */}
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'bn' ? '২. দ্রুত ভূমিকা বাছাই (Quick Role Presets)' : '2. Quick Role Presets'}</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'যেকোনো একটিতে ক্লিক করলে অটোমেটিক পারমিশন সিলেক্ট হবে' : 'Click to auto-apply permissions'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('support', false)}
                    className="p-2.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 text-left hover:bg-sky-100 transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-sky-500 mb-1" />
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {language === 'bn' ? 'চ্যাট ও সাপোর্ট' : 'Support Chat'}
                    </p>
                    <p className="text-[9px] text-slate-400">চ্যাট + রিভিউ</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('orders', false)}
                    className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-left hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-500 mb-1" />
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {language === 'bn' ? 'অর্ডার ম্যানেজার' : 'Order Manager'}
                    </p>
                    <p className="text-[9px] text-slate-400">অর্ডার কনফার্ম</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('inventory', false)}
                    className="p-2.5 rounded-xl border border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/20 text-left hover:bg-pink-100 transition cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-pink-500 mb-1" />
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {language === 'bn' ? 'ক্যাটালগ ও স্টক' : 'Catalog Manager'}
                    </p>
                    <p className="text-[9px] text-slate-400">পণ্য যোগ ও স্টক</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('assistant_manager', false)}
                    className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 text-left hover:bg-purple-100 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-500 mb-1" />
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {language === 'bn' ? 'সহকারী ম্যানেজার' : 'Co-Manager'}
                    </p>
                    <p className="text-[9px] text-slate-400">ফুল স্টোর অপস</p>
                  </button>
                </div>
              </div>

              {/* Step 3: Granular Permissions Selection */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === 'bn' ? '৩. সুনির্দিষ্ট এক্সেস পারমিশন টিক দিন' : '3. Granular Access Privileges'}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedPermissions.length} {language === 'bn' ? 'টি নির্বাচিত' : 'Selected'}
                  </span>
                </div>

                <div className="space-y-3">
                  {categoriesList.map(cat => {
                    const catPerms = AVAILABLE_STAFF_PERMISSIONS.filter(p => p.category === cat.key);
                    const CatIcon = cat.icon;
                    return (
                      <div key={cat.key} className="border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 bg-slate-50/40 dark:bg-slate-900/20 space-y-2">
                        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-extrabold text-xs">
                          <CatIcon className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{language === 'bn' ? cat.labelBn : cat.labelEn}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {catPerms.map(perm => {
                            const isChecked = selectedPermissions.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                onClick={() => handleTogglePermission(perm.id, false)}
                                className={`flex items-start space-x-2.5 p-2 rounded-lg border transition cursor-pointer ${
                                  isChecked
                                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}} // handled by label onClick
                                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <div>
                                  <span className={`block font-bold text-xs ${isChecked ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {language === 'bn' ? perm.labelBn : perm.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block leading-tight">
                                    {language === 'bn' ? perm.descriptionBn : perm.description}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>{language === 'bn' ? 'স্টাফ অ্যাকাউন্ট তৈরি করুন' : 'Create Staff Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {isEditModalOpen && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] text-xs overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 p-4 sm:p-5 font-bold text-sm shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-extrabold text-sm">
                    {language === 'bn' ? `স্টাফ "${editingStaff.name}" এর পারমিশন ও তথ্য সংশোধন` : `Edit Staff Member: ${editingStaff.name}`}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-normal">
                    {language === 'bn' ? 'লগইন আইডি:' : 'Login ID:'} <span className="font-mono text-slate-500 font-bold">{editingStaff.email}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'স্টাফের নাম:' : 'Staff Name:'}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'পদবী / দায়িত্বের শিরোনাম:' : 'Role Title:'}
                  </label>
                  <input
                    type="text"
                    value={editRoleTitle}
                    onChange={(e) => setEditRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর (ঐচ্ছিক):' : 'Phone Number (Optional):'}
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'ইমেইল ঠিকানা (ঐচ্ছিক):' : 'Email (Optional):'}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="rakib@example.com"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Status and Password Reset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-150 dark:border-slate-800">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'অ্যাকাউন্ট স্ট্যাটাস:' : 'Account Status:'}
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setEditIsActive(!editIsActive)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                        editIsActive 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                      }`}
                    >
                      {editIsActive ? (language === 'bn' ? '✓ সক্রিয় (Active)' : '✓ Active') : (language === 'bn' ? '✗ নিষ্ক্রিয় (Disabled)' : '✗ Disabled')}
                    </button>
                    <span className="text-[10px] text-slate-400">
                      {editIsActive ? (language === 'bn' ? 'লগইন করতে পারবে' : 'Can log in') : (language === 'bn' ? 'লগইন বন্ধ' : 'Login blocked')}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'নতুন পাসওয়ার্ড (ঐচ্ছিক):' : 'New Password (Optional):'}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGeneratePassword(true)}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      {language === 'bn' ? 'স্বয়ংক্রিয়' : 'Generate'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={editShowPassword ? 'text' : 'password'}
                      value={editNewPassword}
                      onChange={(e) => setEditNewPassword(e.target.value)}
                      placeholder={language === 'bn' ? 'পরিবর্তন না করতে চাইলে ফাঁকা রাখুন' : 'Leave empty to keep unchanged'}
                      className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setEditShowPassword(!editShowPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {editShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Presets for editing */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'রোল প্রিসেট পরিবর্তন করুন:' : 'Change Role Preset:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('support', true)}
                    className="px-3 py-1 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-lg font-bold text-[10px] border border-sky-200 dark:border-sky-800"
                  >
                    💬 {language === 'bn' ? 'কাস্টমার সাপোর্ট' : 'Support'}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('orders', true)}
                    className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-[10px] border border-emerald-200 dark:border-emerald-800"
                  >
                    📦 {language === 'bn' ? 'অর্ডার ম্যানেজার' : 'Order Fulfillment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('inventory', true)}
                    className="px-3 py-1 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-lg font-bold text-[10px] border border-pink-200 dark:border-pink-800"
                  >
                    🏷️ {language === 'bn' ? 'ইনভেন্টরি ম্যানেজার' : 'Inventory'}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('assistant_manager', true)}
                    className="px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg font-bold text-[10px] border border-purple-200 dark:border-purple-800"
                  >
                    👑 {language === 'bn' ? 'সহকারী ম্যানেজার' : 'Co-Manager'}
                  </button>
                </div>
              </div>

              {/* Granular Permissions */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'পারমিশনসমূহ টিক দিন:' : 'Assigned Permissions:'}
                </span>

                <div className="space-y-3">
                  {categoriesList.map(cat => {
                    const catPerms = AVAILABLE_STAFF_PERMISSIONS.filter(p => p.category === cat.key);
                    const CatIcon = cat.icon;
                    return (
                      <div key={cat.key} className="border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 bg-slate-50/40 dark:bg-slate-900/20 space-y-2">
                        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-extrabold text-xs">
                          <CatIcon className="w-3.5 h-3.5 text-blue-500" />
                          <span>{language === 'bn' ? cat.labelBn : cat.labelEn}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {catPerms.map(perm => {
                            const isChecked = editPermissions.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                onClick={() => handleTogglePermission(perm.id, true)}
                                className={`flex items-start space-x-2.5 p-2 rounded-lg border transition cursor-pointer ${
                                  isChecked
                                    ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <div>
                                  <span className={`block font-bold text-xs ${isChecked ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {language === 'bn' ? perm.labelBn : perm.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block leading-tight">
                                    {language === 'bn' ? perm.descriptionBn : perm.description}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>{language === 'bn' ? 'আপডেট সংরক্ষণ করুন' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
