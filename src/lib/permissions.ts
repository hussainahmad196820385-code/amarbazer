import { Role, User, SellerStaffPermission, AdminStaffPermission } from '../types';

export type PermissionAction = 
  | 'delete_product' 
  | 'delete_category' 
  | 'delete_any' 
  | 'edit_product' 
  | 'add_product' 
  | 'edit_feature'
  | 'add_feature'
  | 'manage_translation_rules'
  | 'bypass_otp'
  | 'manage_categories'
  | 'manage_coupons'
  | 'manage_withdrawals'
  | 'manage_settings';

export interface AdminPermissionMeta {
  id: AdminStaffPermission;
  category: 'management' | 'moderation' | 'finance' | 'system';
  label: string;
  labelBn: string;
  description: string;
  descriptionBn: string;
}

export const AVAILABLE_ADMIN_PERMISSIONS: AdminPermissionMeta[] = [
  {
    id: 'admin_sellers_approve',
    category: 'management',
    label: 'Seller Approvals & Verification',
    labelBn: 'সেলার অনুমোদন ও ভেরিফিকেশন',
    description: 'Can review trade licenses, verify stores, and activate new sellers',
    descriptionBn: 'নতুন সেলার আবেদন পর্যালোচনা, ভেরিফাই ও সক্রিয় করতে পারবে'
  },
  {
    id: 'admin_sellers_permissions',
    category: 'management',
    label: 'Seller Permissions & Limits',
    labelBn: 'সেলারদের পারমিশন ও সীমা নির্ধারণ',
    description: 'Can set custom limits, product permissions, and commission rates per seller',
    descriptionBn: 'সেলারদের পণ্য আপলোড, ফ্ল্যাশ সেল, ও কমিশন রেট নিয়ন্ত্রণ করতে পারবে'
  },
  {
    id: 'admin_users_manage',
    category: 'management',
    label: 'Customer & User Management',
    labelBn: 'ইউজার ও গ্রাহক ব্যবস্থাপনা',
    description: 'Can view customer records, ban spam accounts, or reset user credentials',
    descriptionBn: 'গ্রাহক তথ্য দেখা, স্প্যাম একাউন্ট ব্লক এবং পাসওয়ার্ড রিসেট করতে পারবে'
  },
  {
    id: 'admin_orders_manage',
    category: 'moderation',
    label: 'Platform Orders Oversight',
    labelBn: 'সার্বিক অর্ডার ও ডেলিভারি পর্যবেক্ষণ',
    description: 'Can monitor orders across all stores, dispute handling, and status overrides',
    descriptionBn: 'সকল স্টোরের অর্ডার ট্র্যাক, বিরোধ নিষ্পত্তি ও ক্যান্সেল করতে পারবে'
  },
  {
    id: 'admin_categories_manage',
    category: 'moderation',
    label: 'Categories & Catalogs Control',
    labelBn: 'ক্যাটেগরি ও ক্যাটালগ ম্যানেজমেন্ট',
    description: 'Can add, edit, or delete platform categories and sub-categories',
    descriptionBn: 'নতুন ক্যাটেগরি যোগ, আইকন পরিবর্তন ও সাজাতে পারবে'
  },
  {
    id: 'admin_coupons_manage',
    category: 'moderation',
    label: 'Coupons & Platform Promotions',
    labelBn: 'কুপন ও প্ল্যাটফর্ম ডিসকাউন্ট ক্যাম্পেইন',
    description: 'Can create sitewide discount vouchers and promo banners',
    descriptionBn: 'সাইটওয়াইড কুপন তৈরি ও প্রচার ব্যানার পরিচালনা করতে পারবে'
  },
  {
    id: 'admin_finance_withdrawals',
    category: 'finance',
    label: 'Finance & Seller Withdrawals',
    labelBn: 'ফাইন্যান্স ও সেলার উইথড্রয়াল অনুমোদন',
    description: 'Can approve bKash/Bank payout requests and view financial audits',
    descriptionBn: 'সেলারদের টাকা উত্তোলনের রিকোয়েস্ট অনুমোদন ও পেমেন্ট হিস্ট্রি দেখতে পারবে'
  },
  {
    id: 'admin_system_settings',
    category: 'system',
    label: 'System Settings & Config',
    labelBn: 'সিস্টেম সেটিংস ও নিরাপত্তা কনফিগ',
    description: 'Can edit site branding, maintenance mode, and gateway configurations',
    descriptionBn: 'সাইট ব্র্যান্ডিং, গেটওয়ে কনফিগারেশন ও সিস্টেম সেটিংস বদলাতে পারবে'
  }
];

export const ADMIN_ROLE_PRESETS: Record<string, { title: string; titleBn: string; permissions: AdminStaffPermission[] }> = {
  super_admin: {
    title: 'Super Admin Associate',
    titleBn: 'সুপার এডমিন অ্যাসোসিয়েট',
    permissions: [
      'admin_sellers_approve',
      'admin_sellers_permissions',
      'admin_users_manage',
      'admin_orders_manage',
      'admin_categories_manage',
      'admin_coupons_manage',
      'admin_finance_withdrawals',
      'admin_system_settings'
    ]
  },
  supervisor: {
    title: 'Operations & Store Supervisor',
    titleBn: 'অপারেশনস ও স্টোর সুপারভাইজার',
    permissions: [
      'admin_sellers_approve',
      'admin_orders_manage',
      'admin_categories_manage',
      'admin_coupons_manage',
      'admin_users_manage',
      'admin_sellers_permissions'
    ]
  },
  finance_officer: {
    title: 'Finance & Payout Officer',
    titleBn: 'ফাইন্যান্স ও পে-আউট অফিসার',
    permissions: ['admin_finance_withdrawals', 'admin_orders_manage', 'admin_sellers_permissions']
  },
  moderator: {
    title: 'Catalog & Store Moderator',
    titleBn: 'ক্যাটালগ ও স্টোর মডারেটর',
    permissions: ['admin_sellers_approve', 'admin_categories_manage', 'admin_coupons_manage', 'admin_orders_manage']
  },
  support_lead: {
    title: 'Customer & Seller Support Lead',
    titleBn: 'গ্রাহক ও সেলার সাপোর্ট লিড',
    permissions: ['admin_users_manage', 'admin_orders_manage', 'admin_sellers_approve']
  }
};

/**
 * Checks if a seller or staff member has access to a specific store duty
 */
export interface StaffPermissionMeta {
  id: SellerStaffPermission;
  category: 'orders' | 'messages' | 'products' | 'store';
  label: string;
  labelBn: string;
  description: string;
  descriptionBn: string;
}

export const AVAILABLE_STAFF_PERMISSIONS: StaffPermissionMeta[] = [
  {
    id: 'orders_view',
    category: 'orders',
    label: 'View Orders',
    labelBn: 'অর্ডার দেখার অনুমতি',
    description: 'Can view customer orders and delivery addresses',
    descriptionBn: 'গ্রাহকের অর্ডার ও ডেলিভারি ঠিকানা দেখতে পারবে'
  },
  {
    id: 'orders_process',
    category: 'orders',
    label: 'Process & Confirm Orders',
    labelBn: 'অর্ডার প্রসেস ও কনফার্ম',
    description: 'Can confirm, process, ship or cancel customer orders',
    descriptionBn: 'অর্ডারের স্ট্যাটাস পরিবর্তন ও কুরিয়ার তথ্য আপডেট করতে পারবে'
  },
  {
    id: 'messages_chat',
    category: 'messages',
    label: 'Customer Helpdesk Chat',
    labelBn: 'গ্রাহক মেসেজের উত্তর',
    description: 'Can chat with customers and answer questions',
    descriptionBn: 'কাস্টমার মেসেজ ইনবক্সে চ্যাট ও সাপোর্ট দিতে পারবে'
  },
  {
    id: 'reviews_manage',
    category: 'messages',
    label: 'Manage Customer Reviews',
    labelBn: 'গ্রাহক রিভিউ ও ফিডব্যাক',
    description: 'Can read customer reviews and respond to feedback',
    descriptionBn: 'প্রোডাক্ট রিভিউ দেখতে ও উত্তর দিতে পারবে'
  },
  {
    id: 'products_view',
    category: 'products',
    label: 'View Products Catalog',
    labelBn: 'পণ্য তালিকা দেখার অনুমতি',
    description: 'Can view the store product list and details',
    descriptionBn: 'দোকানের প্রোডাক্ট তালিকা ও বিবরণ দেখতে পারবে'
  },
  {
    id: 'products_manage',
    category: 'products',
    label: 'Add & Edit Products',
    labelBn: 'পণ্য যোগ ও এডিট',
    description: 'Can create new products and modify existing listings',
    descriptionBn: 'নতুন পণ্য আপলোড এবং দাম/ছবি পরিবর্তন করতে পারবে'
  },
  {
    id: 'inventory_manage',
    category: 'products',
    label: 'Manage Stock & Inventory',
    labelBn: 'ইনভেন্টরি ও স্টক পরিচালনা',
    description: 'Can update stock counts and inventory levels',
    descriptionBn: 'স্টক সংখ্যা বাড়ানো বা কমানো এবং ইনভেন্টরি নিয়ন্ত্রণ'
  },
  {
    id: 'withdrawals_view',
    category: 'store',
    label: 'View Balance & Reports',
    labelBn: 'ব্যালেন্স ও হিসাব দেখা',
    description: 'Can view store revenue reports and balance statements',
    descriptionBn: 'স্টোরের আয় এবং সেলস রিপোর্ট দেখতে পারবে'
  },
  {
    id: 'withdrawals_manage',
    category: 'store',
    label: 'Request Money Withdrawals',
    labelBn: 'টাকা উত্তোলনের রিকোয়েস্ট',
    description: 'Can submit bKash/bank withdrawal requests',
    descriptionBn: 'বিকাশ বা ব্যাংকে টাকা উত্তোলনের আবেদন করতে পারবে'
  },
  {
    id: 'store_settings',
    category: 'store',
    label: 'Shop Settings & Profile',
    labelBn: 'দোকান সেটিংস ও প্রোফাইল',
    description: 'Can edit store banner, logo, and store information',
    descriptionBn: 'দোকানের লোগো, ব্যানার এবং পরিচিতি তথ্য পরিবর্তন করতে পারবে'
  }
];

export const ROLE_PRESETS: Record<string, { title: string; titleBn: string; permissions: SellerStaffPermission[] }> = {
  supervisor: {
    title: 'Store Operations Supervisor',
    titleBn: 'স্টোর অপারেশনস সুপারভাইজার',
    permissions: [
      'orders_view', 
      'orders_process', 
      'messages_chat', 
      'reviews_manage', 
      'products_view', 
      'products_manage', 
      'inventory_manage'
    ]
  },
  support: {
    title: 'Customer Support Assistant',
    titleBn: 'কাস্টমার সাপোর্ট ও হেল্পডেস্ক',
    permissions: ['messages_chat', 'reviews_manage', 'orders_view']
  },
  orders: {
    title: 'Order Fulfillment Manager',
    titleBn: 'অর্ডার ফুলফিলমেন্ট ও ডেলিভারি',
    permissions: ['orders_view', 'orders_process', 'messages_chat']
  },
  inventory: {
    title: 'Catalog & Stock Manager',
    titleBn: 'পণ্য ক্যাটালগ ও স্টক ম্যানেজার',
    permissions: ['products_view', 'products_manage', 'inventory_manage']
  },
  assistant_manager: {
    title: 'Store Assistant Manager',
    titleBn: 'সহকারী স্টোর ম্যানেজার',
    permissions: [
      'orders_view', 
      'orders_process', 
      'messages_chat', 
      'reviews_manage', 
      'products_view', 
      'products_manage', 
      'inventory_manage', 
      'store_settings'
    ]
  }
};

export function hasStaffPermission(user: User | undefined, permission: SellerStaffPermission): boolean {
  if (!user) return false;
  // If not a staff member, store owner or admin has all permissions
  if (!user.isStaff) return true;
  if (!user.staffPermissions || !Array.isArray(user.staffPermissions)) return false;
  return user.staffPermissions.includes(permission);
}

export function hasAdminStaffPermission(user: User | undefined, permission: AdminStaffPermission): boolean {
  if (!user) return false;
  if (user.role === 'system_admin' || (user.role === 'admin' && !user.isAdminStaff)) return true;
  if (!user.isAdminStaff || !user.adminPermissions || !Array.isArray(user.adminPermissions)) return false;
  return user.adminPermissions.includes(permission);
}

/**
 * Checks if a user or user role has permission to perform a specific action.
 * 
 * - system_admin: Ultimate privileges. Can perform all actions.
 * - customPermissions: If assigned, the user is strictly limited to ONLY these custom duties.
 * - admin: Second-tier privileges. Can edit, add, delete products & features, but cannot manage translation rules.
 * - manager: Third-tier privileges. Can add & edit products/features, but CANNOT perform any delete actions.
 */
export function hasPermission(user: User | Role | undefined, action: PermissionAction): boolean {
  if (!user) return false;

  // Backwards compatibility if only the role string is passed
  const role = typeof user === 'string' ? user : user.role;
  const customPermissions = typeof user === 'string' ? undefined : user.customPermissions;

  // System Admin can do literally everything
  if (role === 'system_admin') {
    return true;
  }

  // If custom permissions are set, the user is STRICTLY restricted to only these duties and NOTHING ELSE
  if (customPermissions && Array.isArray(customPermissions)) {
    // Special mapping logic for user-friendly duty groups
    if (action === 'add_product' || action === 'edit_product') {
      return customPermissions.includes('manage_products') || customPermissions.includes(action);
    }
    if (action === 'delete_product') {
      return customPermissions.includes('delete_product') || customPermissions.includes('manage_products');
    }
    if (action === 'delete_category') {
      return customPermissions.includes('delete_category') || customPermissions.includes('manage_categories');
    }

    // Direct mapping
    return customPermissions.includes(action);
  }

  // Fall back to default role-based permission rules
  if (role === 'admin') {
    if (action === 'manage_translation_rules') {
      return false;
    }
    return true;
  }

  // Manager can add & edit products/features, but is STRICTLY forbidden from deleting anything
  if (role === 'manager') {
    if (
      action === 'delete_product' || 
      action === 'delete_category' || 
      action === 'delete_any' ||
      action === 'manage_translation_rules'
    ) {
      return false;
    }
    // Manager can edit and add items
    return [
      'edit_product', 
      'add_product', 
      'edit_feature', 
      'add_feature',
      'manage_categories',
      'manage_coupons',
      'manage_settings'
    ].includes(action);
  }

  // Customers and standard sellers have standard actions (can't do admin operations)
  if (role === 'seller') {
    return [
      'add_product',
      'edit_product',
      'delete_product'
    ].includes(action);
  }

  return false;
}
