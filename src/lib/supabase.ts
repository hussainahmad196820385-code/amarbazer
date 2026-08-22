import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, Order, SellerStore, User, SystemSettings } from '../types';

// Read configuration from environment variables or custom local storage override
const envMeta = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const envUrl: string = envMeta.VITE_SUPABASE_URL || '';
const envKey: string = envMeta.VITE_SUPABASE_ANON_KEY || '';

// Stored manual configuration if user sets it via UI
export function getStoredSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  try {
    const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('amarbazar_supabase_url') : null;
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem('amarbazar_supabase_key') : null;
    const url = (savedUrl || envUrl || '').trim();
    const anonKey = (savedKey || envKey || '').trim();
    const isConfigured = Boolean(url && anonKey && url.startsWith('http'));
    return { url, anonKey, isConfigured };
  } catch {
    const isConfigured = Boolean(envUrl && envKey && envUrl.startsWith('http'));
    return { url: envUrl, anonKey: envKey, isConfigured };
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  
  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
  if (isConfigured) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }
  return supabaseInstance;
}

export function configureSupabaseClient(url: string, anonKey: string): boolean {
  try {
    const cleanUrl = url ? url.trim() : '';
    const cleanKey = anonKey ? anonKey.trim() : '';
    if (cleanUrl && cleanKey && cleanUrl.startsWith('http')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('amarbazar_supabase_url', cleanUrl);
        localStorage.setItem('amarbazar_supabase_key', cleanKey);
      }
      supabaseInstance = createClient(cleanUrl, cleanKey, {
        auth: { persistSession: true, autoRefreshToken: true },
        realtime: { params: { eventsPerSecond: 10 } }
      });
      return true;
    }
  } catch (err) {
    console.error('Error saving Supabase config:', err);
  }
  return false;
}

export async function testSupabaseConnection(): Promise<{ connected: boolean; configured: boolean; message: string; details?: any }> {
  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured) {
    return { 
      connected: false,
      configured: false,
      message: 'Supabase URL ও Anon Key পাওয়া যায়নি। Admin Settings বা Environment Variables-এ সেট করুন।' 
    };
  }

  const sb = getSupabase();
  if (!sb) {
    return { 
      connected: false,
      configured: true,
      message: 'Supabase ক্লায়েন্ট ইনিশিয়ালাইজেশন ব্যর্থ হয়েছে।' 
    };
  }

  try {
    // 1. Try reading products
    const { data, error } = await sb.from('products').select('id').limit(1);
    if (error) {
      // Table doesn't exist or RLS policy blocked
      if (error.code === '42P01') {
        return {
          connected: false,
          configured: true,
          message: 'Supabase ডাটাবেজে products টেবিল পাওয়া যায়নি। SQL Editor-এ টেবিল তৈরি করুন।'
        };
      }
      return { 
        connected: false, 
        configured: true,
        message: `Supabase ত্রুটি: ${error.message} (Code: ${error.code})` 
      };
    }

    return { 
      connected: true, 
      configured: true,
      message: 'Supabase সেন্ট্রাল ডাটাবেজ সফলভাবে সংযুক্ত ও কার্যকর রয়েছে! (Connected & Live)' 
    };
  } catch (err: any) {
    return { 
      connected: false, 
      configured: true,
      message: err.message || 'Supabase Connection timeout/failed' 
    };
  }
}

// -------------------------------------------------------------
// BIDIRECTIONAL SCHEMA MAPPERS (Postgres snake_case <-> Frontend camelCase)
// -------------------------------------------------------------

function cleanPayload(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

export function toDbProduct(p: Partial<Product>): Record<string, any> {
  return cleanPayload({
    id: p.id,
    title: p.title,
    title_bn: p.titleBn ?? p.title,
    slug: p.slug ?? ((p.title || 'prod').toLowerCase().replace(/\s+/g, '-')),
    description: p.description,
    description_bn: p.descriptionBn ?? p.description,
    price: p.price !== undefined ? Number(p.price) : 0,
    discount_price: p.discountPrice !== undefined ? Number(p.discountPrice) : null,
    cost_price: p.costPrice !== undefined ? Number(p.costPrice) : null,
    category_id: p.categoryId,
    category_name: p.categoryName,
    sub_category: p.subCategory,
    brand: p.brand,
    seller_id: p.sellerId,
    seller_name: p.sellerName,
    stock: p.stock !== undefined ? Number(p.stock) : 10,
    sku: p.sku,
    barcode: p.barcode,
    images: Array.isArray(p.images) ? p.images : [],
    rating: p.rating !== undefined ? Number(p.rating) : 5.0,
    review_count: p.reviewCount !== undefined ? Number(p.reviewCount) : 0,
    tags: Array.isArray(p.tags) ? p.tags : [],
    is_featured: Boolean(p.isFeatured),
    is_flash_deal: Boolean(p.isFlashDeal),
    is_combo: Boolean(p.isCombo),
    combo_items: Array.isArray(p.comboItems) ? p.comboItems : [],
    variants: Array.isArray(p.variants) ? p.variants : [],
    variant_prices: p.variantPrices || {},
    bulk_offers: Array.isArray(p.bulkOffers) ? p.bulkOffers : [],
    custom_specs: Array.isArray(p.customSpecs) ? p.customSpecs : [],
    warranty: p.warranty,
    warranty_policy: p.warrantyPolicy,
    return_policy: p.returnPolicy,
    delivery_time: p.deliveryTime,
    is_free_delivery: Boolean(p.isFreeDelivery),
    delivery_charge_inside: p.deliveryChargeInside !== undefined ? Number(p.deliveryChargeInside) : 60,
    delivery_charge_outside: p.deliveryChargeOutside !== undefined ? Number(p.deliveryChargeOutside) : 120,
    is_cod_available: p.isCodAvailable !== undefined ? Boolean(p.isCodAvailable) : true,
    is_express_delivery: Boolean(p.isExpressDelivery),
    is_approved: p.isApproved !== undefined ? Boolean(p.isApproved) : true,
    created_at: p.createdAt || new Date().toISOString()
  });
}

export function fromDbProduct(row: any): Product {
  if (!row) return {} as Product;
  return {
    id: String(row.id || ''),
    title: row.title || '',
    titleBn: row.title_bn ?? row.titleBn ?? row.title ?? '',
    slug: row.slug || '',
    description: row.description || '',
    descriptionBn: row.description_bn ?? row.descriptionBn ?? row.description ?? '',
    price: Number(row.price || 0),
    discountPrice: row.discount_price !== null && row.discount_price !== undefined 
      ? Number(row.discount_price) 
      : (row.discountPrice !== undefined ? Number(row.discountPrice) : undefined),
    costPrice: row.cost_price !== null && row.cost_price !== undefined 
      ? Number(row.cost_price) 
      : (row.costPrice !== undefined ? Number(row.costPrice) : undefined),
    categoryId: row.category_id ?? row.categoryId ?? 'cat-1',
    categoryName: row.category_name ?? row.categoryName ?? 'General',
    subCategory: row.sub_category ?? row.subCategory,
    brand: row.brand || 'AmarBazar',
    sellerId: row.seller_id ?? row.sellerId ?? 'sel-1',
    sellerName: row.seller_name ?? row.sellerName ?? 'Dhaka Tech Store',
    stock: Number(row.stock !== undefined ? row.stock : 20),
    sku: row.sku || '',
    barcode: row.barcode,
    images: Array.isArray(row.images) ? row.images : [],
    rating: Number(row.rating || 5.0),
    reviewCount: Number(row.review_count ?? row.reviewCount ?? 0),
    tags: Array.isArray(row.tags) ? row.tags : [],
    isFeatured: Boolean(row.is_featured ?? row.isFeatured),
    isFlashDeal: Boolean(row.is_flash_deal ?? row.isFlashDeal),
    isCombo: Boolean(row.is_combo ?? row.isCombo),
    comboItems: Array.isArray(row.combo_items ?? row.comboItems) ? (row.combo_items ?? row.comboItems) : [],
    variants: Array.isArray(row.variants) ? row.variants : [],
    variantPrices: row.variant_prices ?? row.variantPrices ?? {},
    bulkOffers: Array.isArray(row.bulk_offers ?? row.bulkOffers) ? (row.bulk_offers ?? row.bulkOffers) : [],
    customSpecs: Array.isArray(row.custom_specs ?? row.customSpecs) ? (row.custom_specs ?? row.customSpecs) : [],
    warranty: row.warranty,
    warrantyPolicy: row.warranty_policy ?? row.warrantyPolicy,
    returnPolicy: row.return_policy ?? row.returnPolicy,
    deliveryTime: row.delivery_time ?? row.deliveryTime ?? '2-3 Days',
    isFreeDelivery: Boolean(row.is_free_delivery ?? row.isFreeDelivery),
    deliveryChargeInside: Number(row.delivery_charge_inside ?? row.deliveryChargeInside ?? 60),
    deliveryChargeOutside: Number(row.delivery_charge_outside ?? row.deliveryChargeOutside ?? 120),
    isCodAvailable: row.is_cod_available !== undefined ? Boolean(row.is_cod_available) : (row.isCodAvailable !== undefined ? Boolean(row.isCodAvailable) : true),
    isExpressDelivery: Boolean(row.is_express_delivery ?? row.isExpressDelivery),
    isApproved: row.is_approved !== undefined ? Boolean(row.is_approved) : (row.isApproved !== undefined ? Boolean(row.isApproved) : true),
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

export function toDbSeller(s: Partial<SellerStore>): Record<string, any> {
  return cleanPayload({
    id: s.id,
    seller_id: s.sellerId || s.id,
    store_name: s.storeName || 'My Store',
    store_name_bn: s.storeNameBn,
    owner_name: s.ownerName,
    owner_first_name: s.ownerFirstName,
    owner_last_name: s.ownerLastName,
    nid_number: s.nidNumber,
    owner_photo: s.ownerPhoto,
    nid_photo_front: s.nidPhotoFront,
    nid_photo_back: s.nidPhotoBack,
    shop_license_photo: s.shopLicensePhoto,
    shop_photo: s.shopPhoto,
    face_photo: s.facePhoto,
    email: s.email,
    phone: s.phone,
    logo_url: s.logoUrl,
    banner_url: s.bannerUrl,
    description: s.description,
    address: s.address,
    store_address: s.storeAddress || s.address,
    store_category: s.storeCategory,
    division: s.division,
    district: s.district,
    rating: s.rating !== undefined ? Number(s.rating) : 5.0,
    total_sales: s.totalSales !== undefined ? Number(s.totalSales) : 0,
    balance: s.balance !== undefined ? Number(s.balance) : 0,
    is_approved: Boolean(s.isApproved),
    join_date: s.joinDate || new Date().toISOString().split('T')[0],
    is_verified: Boolean(s.isVerified),
    is_featured: Boolean(s.isFeatured),
    status: s.status || 'active',
    subscription_tier: s.subscriptionTier,
    subscription_plan: s.subscriptionPlan,
    subscription_status: s.subscriptionStatus,
    subscription_amount_paid: s.subscriptionAmountPaid !== undefined ? Number(s.subscriptionAmountPaid) : 0,
    subscription_start_date: s.subscriptionStartDate,
    subscription_expiry_date: s.subscriptionExpiryDate,
    subscription_payment_method: s.subscriptionPaymentMethod,
    subscription_txn_id: s.subscriptionTxnId,
    cloud_subscription_plan: s.cloudSubscriptionPlan,
    storage_type: s.storageType,
    storage_credentials: s.storageCredentials,
    trade_license_number: s.tradeLicenseNumber,
    bkash_number: s.bkashNumber,
    nagad_number: s.nagadNumber,
    rocket_number: s.rocketNumber,
    bank_account_details: s.bankAccountDetails || {},
    staff: Array.isArray(s.staff) ? s.staff : [],
    staff_members: Array.isArray(s.staffMembers) ? s.staffMembers : [],
    created_at: s.createdAt || new Date().toISOString()
  });
}

export function fromDbSeller(row: any): SellerStore {
  if (!row) return {} as SellerStore;
  return {
    id: String(row.id || ''),
    sellerId: row.seller_id ?? row.sellerId ?? row.id ?? '',
    storeName: row.store_name ?? row.storeName ?? 'Store',
    storeNameBn: row.store_name_bn ?? row.storeNameBn,
    ownerName: row.owner_name ?? row.ownerName,
    ownerFirstName: row.owner_first_name ?? row.ownerFirstName,
    ownerLastName: row.owner_last_name ?? row.ownerLastName,
    nidNumber: row.nid_number ?? row.nidNumber,
    ownerPhoto: row.owner_photo ?? row.ownerPhoto,
    nidPhotoFront: row.nid_photo_front ?? row.nidPhotoFront,
    nidPhotoBack: row.nid_photo_back ?? row.nidPhotoBack,
    shopLicensePhoto: row.shop_license_photo ?? row.shopLicensePhoto,
    shopPhoto: row.shop_photo ?? row.shopPhoto,
    facePhoto: row.face_photo ?? row.facePhoto,
    email: row.email,
    phone: row.phone,
    logoUrl: row.logo_url ?? row.logoUrl,
    bannerUrl: row.banner_url ?? row.bannerUrl,
    description: row.description,
    address: row.address,
    storeAddress: row.store_address ?? row.storeAddress ?? row.address,
    storeCategory: row.store_category ?? row.storeCategory,
    division: row.division,
    district: row.district,
    rating: Number(row.rating || 5.0),
    totalSales: Number(row.total_sales ?? row.totalSales ?? 0),
    balance: Number(row.balance || 0),
    isApproved: Boolean(row.is_approved ?? row.isApproved),
    joinDate: row.join_date ?? row.joinDate ?? new Date().toISOString().split('T')[0],
    isVerified: Boolean(row.is_verified ?? row.isVerified),
    isFeatured: Boolean(row.is_featured ?? row.isFeatured),
    status: row.status || 'active',
    subscriptionTier: row.subscription_tier ?? row.subscriptionTier,
    subscriptionPlan: row.subscription_plan ?? row.subscriptionPlan,
    subscriptionStatus: row.subscription_status ?? row.subscriptionStatus,
    subscriptionAmountPaid: Number(row.subscription_amount_paid ?? row.subscriptionAmountPaid ?? 0),
    subscriptionStartDate: row.subscription_start_date ?? row.subscriptionStartDate,
    subscriptionExpiryDate: row.subscription_expiry_date ?? row.subscriptionExpiryDate,
    subscriptionPaymentMethod: row.subscription_payment_method ?? row.subscriptionPaymentMethod,
    subscriptionTxnId: row.subscription_txn_id ?? row.subscriptionTxnId,
    cloudSubscriptionPlan: row.cloud_subscription_plan ?? row.cloudSubscriptionPlan,
    storageType: row.storage_type ?? row.storageType,
    storageCredentials: row.storage_credentials ?? row.storageCredentials,
    tradeLicenseNumber: row.trade_license_number ?? row.tradeLicenseNumber,
    bkashNumber: row.bkash_number ?? row.bkashNumber,
    nagadNumber: row.nagad_number ?? row.nagadNumber,
    rocketNumber: row.rocket_number ?? row.rocketNumber,
    bankAccountDetails: row.bank_account_details ?? row.bankAccountDetails,
    staff: Array.isArray(row.staff) ? row.staff : [],
    staffMembers: Array.isArray(row.staff_members ?? row.staffMembers) ? (row.staff_members ?? row.staffMembers) : [],
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString()
  };
}

export function toDbOrder(o: Partial<Order>): Record<string, any> {
  return cleanPayload({
    id: o.id,
    user_id: o.userId,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    customer_email: o.customerEmail,
    items: Array.isArray(o.items) ? o.items : [],
    subtotal: o.subtotal !== undefined ? Number(o.subtotal) : 0,
    discount_amount: o.discountAmount !== undefined ? Number(o.discountAmount) : 0,
    delivery_charge: o.deliveryCharge !== undefined ? Number(o.deliveryCharge) : 0,
    total_amount: o.totalAmount !== undefined ? Number(o.totalAmount) : 0,
    coupon_code: o.couponCode,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus || 'pending',
    transaction_id: o.transactionId,
    shipping_address: o.shippingAddress || {},
    status: o.status || 'pending',
    tracking_status: o.trackingStatus || 'Order Processing',
    courier_name: o.courierName,
    courier_tracking_id: o.courierTrackingId,
    seller_id: o.sellerId,
    admin_note: o.adminNote,
    created_at: o.createdAt || new Date().toISOString()
  });
}

export function fromDbOrder(row: any): Order {
  if (!row) return {} as Order;
  return {
    id: String(row.id || ''),
    userId: row.user_id ?? row.userId ?? '',
    customerName: row.customer_name ?? row.customerName ?? 'Customer',
    customerPhone: row.customer_phone ?? row.customerPhone ?? '',
    customerEmail: row.customer_email ?? row.customerEmail,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal || 0),
    discountAmount: Number(row.discount_amount ?? row.discountAmount ?? 0),
    deliveryCharge: Number(row.delivery_charge ?? row.deliveryCharge ?? 0),
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
    couponCode: row.coupon_code ?? row.couponCode,
    paymentMethod: row.payment_method ?? row.paymentMethod ?? 'cod',
    paymentStatus: row.payment_status ?? row.paymentStatus ?? 'pending',
    transactionId: row.transaction_id ?? row.transactionId,
    shippingAddress: row.shipping_address ?? row.shippingAddress ?? {},
    status: row.status || 'pending',
    trackingStatus: row.tracking_status ?? row.trackingStatus ?? 'Order Processing',
    courierName: row.courier_name ?? row.courierName,
    courierTrackingId: row.courier_tracking_id ?? row.courierTrackingId,
    sellerId: row.seller_id ?? row.sellerId,
    adminNote: row.admin_note ?? row.adminNote,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString()
  };
}

export function toDbCategory(c: Partial<Category>): Record<string, any> {
  return cleanPayload({
    id: c.id,
    name: c.name,
    name_bn: c.nameBn ?? c.name,
    slug: c.slug,
    image: c.image,
    icon: c.icon,
    subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
    product_count: c.productCount !== undefined ? Number(c.productCount) : 0,
    is_featured: Boolean(c.isFeatured),
    created_at: c.createdAt || new Date().toISOString()
  });
}

export function fromDbCategory(row: any): Category {
  if (!row) return {} as Category;
  return {
    id: String(row.id || ''),
    name: row.name || '',
    nameBn: row.name_bn ?? row.nameBn ?? row.name ?? '',
    slug: row.slug || '',
    image: row.image || '',
    icon: row.icon,
    subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
    productCount: Number(row.product_count ?? row.productCount ?? 0),
    isFeatured: Boolean(row.is_featured ?? row.isFeatured),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString()
  };
}

export function toDbUser(u: Partial<User>): Record<string, any> {
  return cleanPayload({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    phone: u.phone,
    role: u.role || 'customer',
    password: u.password,
    avatar: u.avatar,
    is_verified: u.isVerified !== undefined ? Boolean(u.isVerified) : true,
    addresses: Array.isArray(u.addresses) ? u.addresses : [],
    created_at: u.createdAt || new Date().toISOString()
  });
}

export function fromDbUser(row: any): User {
  if (!row) return {} as User;
  return {
    id: String(row.id || ''),
    name: row.name || 'User',
    username: row.username,
    email: row.email || '',
    phone: row.phone || '',
    role: row.role || 'customer',
    password: row.password,
    avatar: row.avatar,
    isVerified: Boolean(row.is_verified ?? row.isVerified ?? true),
    addresses: Array.isArray(row.addresses) ? row.addresses : [],
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString()
  };
}

// -------------------------------------------------------------
// CENTRAL DATABASE API WRAPPER
// -------------------------------------------------------------

export const supabaseDb = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const sb = getSupabase();
    if (!sb) return [];
    try {
      const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
      if (error || !data) {
        if (error) console.warn('Supabase getProducts error:', error.message);
        return [];
      }
      return data.map(fromDbProduct);
    } catch (err) {
      console.warn('Supabase getProducts notice:', err);
      return [];
    }
  },

  async insertProduct(product: Product): Promise<Product> {
    const sb = getSupabase();
    if (!sb) return product;
    try {
      const payload = toDbProduct(product);
      const { error } = await sb.from('products').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase insertProduct error:', error.message);
      }
      return product;
    } catch (err) {
      console.warn('Supabase insertProduct notice:', err);
      return product;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const sb = getSupabase();
    if (!sb) return { ...updates, id } as Product;
    try {
      const payload = toDbProduct({ ...updates, id });
      delete payload.id; // Don't update primary key
      const { data, error } = await sb.from('products').update(payload).eq('id', id).select().single();
      if (error || !data) {
        if (error) console.warn('Supabase updateProduct error:', error.message);
        return { ...updates, id } as Product;
      }
      return fromDbProduct(data);
    } catch (err) {
      console.warn('Supabase updateProduct notice:', err);
      return { ...updates, id } as Product;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;
    try {
      const { error } = await sb.from('products').delete().eq('id', id);
      if (error) console.warn('Supabase deleteProduct error:', error.message);
    } catch (err) {
      console.warn('Supabase deleteProduct notice:', err);
    }
  },

  subscribeToProducts(callback: (products: Product[], event?: any) => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('realtime:products_' + Date.now())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async (payload) => {
          try {
            const prods = await this.getProducts();
            callback(prods, payload);
          } catch (e) {
            console.warn('Realtime products fetch error:', e);
          }
        })
        .subscribe();

      return () => {
        try {
          sb.removeChannel(channel);
        } catch (e) {}
      };
    } catch {
      return () => {};
    }
  },

  // SELLERS
  async getSellers(): Promise<SellerStore[]> {
    const sb = getSupabase();
    if (!sb) return [];
    try {
      const { data, error } = await sb.from('sellers').select('*');
      if (error || !data) {
        if (error) console.warn('Supabase getSellers error:', error.message);
        return [];
      }
      return data.map(fromDbSeller);
    } catch (err) {
      console.warn('Supabase getSellers notice:', err);
      return [];
    }
  },

  async insertSeller(seller: SellerStore): Promise<SellerStore> {
    const sb = getSupabase();
    if (!sb) return seller;
    try {
      const payload = toDbSeller(seller);
      const { error } = await sb.from('sellers').upsert(payload, { onConflict: 'id' });
      if (error) console.warn('Supabase insertSeller error:', error.message);
      return seller;
    } catch (err) {
      console.warn('Supabase insertSeller notice:', err);
      return seller;
    }
  },

  async updateSeller(id: string, updates: Partial<SellerStore>): Promise<SellerStore> {
    const sb = getSupabase();
    if (!sb) return { ...updates, id } as SellerStore;
    try {
      const payload = toDbSeller({ ...updates, id });
      delete payload.id;
      const { data, error } = await sb.from('sellers').update(payload).eq('id', id).select().single();
      if (error || !data) {
        if (error) console.warn('Supabase updateSeller error:', error.message);
        return { ...updates, id } as SellerStore;
      }
      return fromDbSeller(data);
    } catch (err) {
      console.warn('Supabase updateSeller notice:', err);
      return { ...updates, id } as SellerStore;
    }
  },

  subscribeToSellers(callback: (sellers: SellerStore[]) => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('realtime:sellers_' + Date.now())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sellers' }, async () => {
          const list = await this.getSellers();
          if (list) callback(list);
        })
        .subscribe();

      return () => {
        try {
          sb.removeChannel(channel);
        } catch (e) {}
      };
    } catch {
      return () => {};
    }
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const sb = getSupabase();
    if (!sb) return [];
    try {
      const { data, error } = await sb.from('categories').select('*');
      if (error || !data) {
        if (error) console.warn('Supabase getCategories error:', error.message);
        return [];
      }
      return data.map(fromDbCategory);
    } catch (err) {
      console.warn('Supabase getCategories notice:', err);
      return [];
    }
  },

  async insertCategory(category: Category): Promise<Category> {
    const sb = getSupabase();
    if (!sb) return category;
    try {
      const payload = toDbCategory(category);
      const { error } = await sb.from('categories').upsert(payload, { onConflict: 'id' });
      if (error) console.warn('Supabase insertCategory error:', error.message);
      return category;
    } catch (err) {
      console.warn('Supabase insertCategory notice:', err);
      return category;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;
    try {
      const payload = toDbCategory({ ...updates, id });
      delete payload.id;
      const { error } = await sb.from('categories').update(payload).eq('id', id);
      if (error) console.warn('Supabase updateCategory error:', error.message);
    } catch (err) {
      console.warn('Supabase updateCategory notice:', err);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;
    try {
      const { error } = await sb.from('categories').delete().eq('id', id);
      if (error) console.warn('Supabase deleteCategory error:', error.message);
    } catch (err) {
      console.warn('Supabase deleteCategory notice:', err);
    }
  },

  subscribeToCategories(callback: (categories: Category[]) => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('realtime:categories_' + Date.now())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
          const cats = await this.getCategories();
          if (cats) callback(cats);
        })
        .subscribe();

      return () => {
        try {
          sb.removeChannel(channel);
        } catch (e) {}
      };
    } catch {
      return () => {};
    }
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    const sb = getSupabase();
    if (!sb) return [];
    try {
      const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
      if (error || !data) {
        if (error) console.warn('Supabase getOrders error:', error.message);
        return [];
      }
      return data.map(fromDbOrder);
    } catch (err) {
      console.warn('Supabase getOrders notice:', err);
      return [];
    }
  },

  async insertOrder(order: Partial<Order>): Promise<Order> {
    const id = order.id || `ord-${Date.now()}`;
    const fullOrder = { ...order, id } as Order;
    const sb = getSupabase();
    if (!sb) return fullOrder;
    try {
      const payload = toDbOrder(fullOrder);
      const { error } = await sb.from('orders').upsert(payload, { onConflict: 'id' });
      if (error) console.warn('Supabase insertOrder error:', error.message);
      return fullOrder;
    } catch (err) {
      console.warn('Supabase insertOrder notice:', err);
      return fullOrder;
    }
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const updates: any = {
        status,
        tracking_status: status === 'delivered' ? 'Delivered' : status === 'shipped' ? 'Handed to Courier' : 'Order Processing'
      };
      if (note) updates.admin_note = note;
      const { data, error } = await sb.from('orders').update(updates).eq('id', id).select().single();
      if (error || !data) {
        if (error) console.warn('Supabase updateOrderStatus error:', error.message);
        return null;
      }
      return fromDbOrder(data);
    } catch (err) {
      console.warn('Supabase updateOrderStatus notice:', err);
      return null;
    }
  },

  subscribeToOrders(callback: (orders: Order[]) => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('realtime:orders_' + Date.now())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
          const list = await this.getOrders();
          if (list) callback(list);
        })
        .subscribe();

      return () => {
        try {
          sb.removeChannel(channel);
        } catch (e) {}
      };
    } catch {
      return () => {};
    }
  },

  // USERS
  async insertUser(user: User): Promise<User> {
    const sb = getSupabase();
    if (!sb) return user;
    try {
      const payload = toDbUser(user);
      const { error } = await sb.from('users').upsert(payload, { onConflict: 'id' });
      if (error) console.warn('Supabase insertUser error:', error.message);
      return user;
    } catch (err) {
      console.warn('Supabase insertUser notice:', err);
      return user;
    }
  },

  // SETTINGS
  async getSettings(): Promise<SystemSettings | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from('settings').select('*').eq('id', 'general').single();
      if (error || !data) return null;
      if (data.data) {
        return data.data as SystemSettings;
      }
      return data as SystemSettings;
    } catch (err) {
      console.warn('Supabase getSettings notice:', err);
      return null;
    }
  },

  async saveSettings(settings: Partial<SystemSettings>): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;
    try {
      const { error } = await sb.from('settings').upsert({ id: 'general', data: settings, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) console.warn('Supabase saveSettings error:', error.message);
    } catch (err) {
      console.warn('Supabase saveSettings notice:', err);
    }
  },

  subscribeToSettings(callback: (settings: SystemSettings) => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('realtime:settings_' + Date.now())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async () => {
          const settings = await this.getSettings();
          if (settings) callback(settings);
        })
        .subscribe();

      return () => {
        try {
          sb.removeChannel(channel);
        } catch (e) {}
      };
    } catch {
      return () => {};
    }
  }
};

export const SUPABASE_SQL_SETUP_SCRIPT = `-- AmarBazar Complete Central Database Schema & Realtime Setup
-- Copy and run this in your Supabase SQL Editor:

-- 1. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  title text not null,
  title_bn text,
  slug text,
  description text,
  description_bn text,
  price numeric default 0,
  discount_price numeric,
  cost_price numeric,
  category_id text,
  category_name text,
  sub_category text,
  brand text,
  seller_id text,
  seller_name text,
  stock integer default 0,
  sku text,
  barcode text,
  images jsonb default '[]'::jsonb,
  rating numeric default 5.0,
  review_count integer default 0,
  tags jsonb default '[]'::jsonb,
  is_featured boolean default false,
  is_flash_deal boolean default false,
  is_combo boolean default false,
  combo_items jsonb default '[]'::jsonb,
  variants jsonb default '[]'::jsonb,
  variant_prices jsonb default '{}'::jsonb,
  bulk_offers jsonb default '[]'::jsonb,
  custom_specs jsonb default '[]'::jsonb,
  warranty text,
  warranty_policy text,
  return_policy text,
  delivery_time text,
  is_free_delivery boolean default false,
  delivery_charge_inside numeric default 60,
  delivery_charge_outside numeric default 120,
  is_cod_available boolean default true,
  is_express_delivery boolean default false,
  is_approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id text primary key,
  name text not null,
  name_bn text,
  slug text,
  image text,
  icon text,
  subcategories jsonb default '[]'::jsonb,
  product_count integer default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. SELLERS TABLE
create table if not exists public.sellers (
  id text primary key,
  seller_id text,
  store_name text not null,
  store_name_bn text,
  owner_name text,
  owner_first_name text,
  owner_last_name text,
  nid_number text,
  owner_photo text,
  nid_photo_front text,
  nid_photo_back text,
  shop_license_photo text,
  shop_photo text,
  face_photo text,
  email text,
  phone text,
  logo_url text,
  banner_url text,
  description text,
  address text,
  store_address text,
  store_category text,
  division text,
  district text,
  rating numeric default 5.0,
  total_sales numeric default 0,
  balance numeric default 0,
  is_approved boolean default false,
  join_date text,
  is_verified boolean default false,
  is_featured boolean default false,
  status text default 'active',
  subscription_tier text,
  subscription_plan text,
  subscription_status text,
  subscription_amount_paid numeric default 0,
  subscription_start_date text,
  subscription_expiry_date text,
  subscription_payment_method text,
  subscription_txn_id text,
  cloud_subscription_plan text,
  storage_type text,
  storage_credentials text,
  trade_license_number text,
  bkash_number text,
  nagad_number text,
  rocket_number text,
  bank_account_details jsonb default '{}'::jsonb,
  staff jsonb default '[]'::jsonb,
  staff_members jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  user_id text,
  customer_name text,
  customer_phone text,
  customer_email text,
  items jsonb default '[]'::jsonb,
  subtotal numeric default 0,
  discount_amount numeric default 0,
  delivery_charge numeric default 0,
  total_amount numeric default 0,
  coupon_code text,
  payment_method text,
  payment_status text default 'pending',
  transaction_id text,
  shipping_address jsonb default '{}'::jsonb,
  status text default 'pending',
  tracking_status text default 'Order Processing',
  courier_name text,
  courier_tracking_id text,
  seller_id text,
  admin_note text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. USERS TABLE
create table if not exists public.users (
  id text primary key,
  name text,
  username text,
  email text,
  phone text,
  role text default 'customer',
  password text,
  avatar text,
  is_verified boolean default true,
  addresses jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. SETTINGS TABLE
create table if not exists public.settings (
  id text primary key default 'general',
  data jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.sellers enable row level security;
alter table public.orders enable row level security;
alter table public.users enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Public Access Products" on public.products;
drop policy if exists "Public Access Categories" on public.categories;
drop policy if exists "Public Access Sellers" on public.sellers;
drop policy if exists "Public Access Orders" on public.orders;
drop policy if exists "Public Access Users" on public.users;
drop policy if exists "Public Access Settings" on public.settings;

create policy "Public Access Products" on public.products for all using (true) with check (true);
create policy "Public Access Categories" on public.categories for all using (true) with check (true);
create policy "Public Access Sellers" on public.sellers for all using (true) with check (true);
create policy "Public Access Orders" on public.orders for all using (true) with check (true);
create policy "Public Access Users" on public.users for all using (true) with check (true);
create policy "Public Access Settings" on public.settings for all using (true) with check (true);

-- 8. REALTIME REPLICATION (CRITICAL FOR LIVE CROSS-DEVICE SYNC)
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.sellers;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.settings;
`;

