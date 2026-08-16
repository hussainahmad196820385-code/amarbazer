import React, { useState } from 'react';
import { 
  ShieldCheck, Store, Users, UserCheck, Lock, Sparkles, 
  ChevronRight, ArrowRight, Shield, Settings, Info, ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SellerRolesPermissions } from '../seller/SellerRolesPermissions';
import { AdminRolesPermissions } from '../admin/AdminRolesPermissions';

interface RolesPermissionsHubProps {
  defaultView?: 'seller' | 'admin';
}

export const RolesPermissionsHub: React.FC<RolesPermissionsHubProps> = ({ defaultView }) => {
  const { currentUser, activeRole, language, setActivePanel } = useApp();

  const isPlatformAdmin = currentUser?.role === 'admin' || currentUser?.role === 'system_admin' || activeRole === 'admin';
  const isStoreSeller = currentUser?.role === 'seller' || activeRole === 'seller';

  const [activeView, setActiveView] = useState<'admin' | 'seller'>(() => {
    if (defaultView) return defaultView;
    if (isPlatformAdmin) return 'admin';
    if (isStoreSeller) return 'seller';
    return 'seller';
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {language === 'bn' ? 'রোল ও পারমিশন কন্ট্রোল' : 'Roles & Permissions Management'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  {language === 'bn' ? 'সক্রিয়' : 'Active System'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? 'সেলার ও এডমিনের অধীনে কর্মীদের নির্দিষ্ট দায়িত্ব বণ্টন ও ক্ষমতা নিয়ন্ত্রণ করুন।'
                  : 'Role-based access control (RBAC) for store staff, employees, and platform moderators.'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveView('seller')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
                activeView === 'seller'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{language === 'bn' ? 'সেলার স্টাফ রোল' : 'Seller Staff Roles'}</span>
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{language === 'bn' ? 'এডমিন সুপার রোল' : 'Admin Super Roles'}</span>
            </button>
          </div>
        </div>

        {/* Informational Guidance Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3 text-xs">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {activeView === 'seller' ? (
              <span>
                <strong>{language === 'bn' ? 'সেলার টিম কন্ট্রোল:' : 'Seller Store Team:'}</strong> {language === 'bn' 
                  ? 'দোকানের বিক্রেতা তার শপের অধীনে কর্মচারীদের আলাদা আইডি/পাসওয়ার্ড বানিয়ে দিতে পারেন এবং কে অর্ডার দেখবে, কে চ্যাট করবে, কে ইনভেন্টরি ম্যানেজ করবে তা নির্দিষ্ট করে দিতে পারেন।'
                  : 'Store owners can create sub-accounts for customer support, order fulfillment, stock management, and cashier assistants with granular restrictions.'}
              </span>
            ) : (
              <span>
                <strong>{language === 'bn' ? 'এডমিন সেন্ট্রাল কন্ট্রোল:' : 'Admin Platform Control:'}</strong> {language === 'bn'
                  ? 'এডমিন প্রতিটি সেলারের সুযোগ-সুবিধা (পণ্য আপলোড, ফ্ল্যাশ সেল, উইথড্রয়াল, কমিশন ও ভেরিফাইড ব্লু ব্যাজ) নির্ধারণ করতে পারেন এবং এডমিন টিম মডারেটর নিয়োগ করতে পারেন।'
                  : 'Platform admins can regulate individual seller capabilities (products, withdrawal, commission, verified badge) and assign duties to platform officers.'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Render Selected View */}
      {activeView === 'seller' ? (
        <SellerRolesPermissions />
      ) : (
        <AdminRolesPermissions />
      )}
    </div>
  );
};
