import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, SellerStore, Order, User, Category, Coupon, WithdrawalRequest } from '../types';

// Default Supabase project credentials
const DEFAULT_SUPABASE_URL = 'https://duwcufotrnuxlefssbim.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1d2N1Zm90cm51eGxlZnNzYmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTQyNjYsImV4cCI6MjEwMjQ3MDI2Nn0.7RPLrSb52OuqhKM0UNRfR1Smu5_kX6X-o7Z3JdeCSco';

// Client-side environment variables
const VITE_SUPABASE_URL = (import.meta as any)?.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Server-side environment variables (guarded safely)
const SERVER_SUPABASE_URL = typeof process !== 'undefined' ? (process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL) : DEFAULT_SUPABASE_URL;
const SERVER_SUPABASE_KEY = typeof process !== 'undefined' ? (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY) : DEFAULT_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIG = {
  url: VITE_SUPABASE_URL || SERVER_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  key: VITE_SUPABASE_ANON_KEY || SERVER_SUPABASE_KEY || DEFAULT_SUPABASE_ANON_KEY,
};

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = SUPABASE_CONFIG.url || (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : '');
  const key = SUPABASE_CONFIG.key || (typeof process !== 'undefined' ? (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_ANON_KEY) : '');

  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(getSupabase());
};

/**
 * Helper to normalize and map product records to/from Supabase
 */
export const supabaseDb = {
  // PRODUCTS
  async getProducts(): Promise<Product[] | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
      if (error || !data) {
        console.warn('Supabase getProducts error:', error);
        return null;
      }
      return data.map(normalizeProductFromSupabase);
    } catch (err) {
      console.warn('Supabase fetch products error:', err);
      return null;
    }
  },

  async insertProduct(product: Partial<Product>): Promise<Product | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const payload = formatProductForSupabase(product);
      const { data, error } = await sb.from('products').upsert([payload]).select();
      if (error) {
        console.warn('Supabase insertProduct upsert warning:', error.message);
        const { data: insData, error: insErr } = await sb.from('products').insert([payload]).select();
        if (!insErr && insData && insData.length > 0) {
          return normalizeProductFromSupabase(insData[0]);
        }
        return normalizeProductFromSupabase(payload);
      }
      if (data && data.length > 0) {
        return normalizeProductFromSupabase(data[0]);
      }
      return normalizeProductFromSupabase(payload);
    } catch (err) {
      console.warn('Supabase save product error:', err);
      return null;
    }
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const payload = formatProductForSupabase(product);
      const { data, error } = await sb.from('products').update(payload).eq('id', id).select();
      if (error) {
        console.warn('Supabase updateProduct warning:', error.message);
        return normalizeProductFromSupabase(payload);
      }
      if (data && data.length > 0) {
        return normalizeProductFromSupabase(data[0]);
      }
      return normalizeProductFromSupabase(payload);
    } catch (err) {
      console.warn('Supabase update product error:', err);
      return null;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const { error } = await sb.from('products').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.error('Supabase delete product error:', err);
      return false;
    }
  },

  // SELLERS
  async getSellers(): Promise<SellerStore[] | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from('sellers').select('*');
      if (error || !data) {
        console.warn('Supabase getSellers error:', error);
        return null;
      }
      return data.map(normalizeSellerFromSupabase);
    } catch (err) {
      console.warn('Supabase fetch sellers error:', err);
      return null;
    }
  },

  async insertSeller(seller: Partial<SellerStore>): Promise<SellerStore | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const payload = formatSellerForSupabase(seller);
      const { data, error } = await sb.from('sellers').upsert([payload]).select().single();
      if (error) {
        console.error('Supabase insertSeller error:', error);
        return null;
      }
      return normalizeSellerFromSupabase(data);
    } catch (err) {
      console.error('Supabase save seller error:', err);
      return null;
    }
  },

  async updateSeller(id: string, seller: Partial<SellerStore>): Promise<SellerStore | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const payload = formatSellerForSupabase(seller);
      const { data, error } = await sb.from('sellers').update(payload).eq('id', id).select().single();
      if (error) {
        console.error('Supabase updateSeller error:', error);
        return null;
      }
      return normalizeSellerFromSupabase(data);
    } catch (err) {
      console.error('Supabase update seller error:', err);
      return null;
    }
  },

  // ORDERS
  async getOrders(): Promise<Order[] | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map(normalizeOrderFromSupabase);
    } catch (err) {
      return null;
    }
  },

  async insertOrder(order: Partial<Order>): Promise<Order | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const payload = formatOrderForSupabase(order);
      const { data, error } = await sb.from('orders').upsert([payload]).select().single();
      if (error) {
        console.error('Supabase insertOrder error:', error);
        return null;
      }
      return normalizeOrderFromSupabase(data);
    } catch (err) {
      console.error('Supabase save order error:', err);
      return null;
    }
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from('orders').update({
        order_status: status,
        orderStatus: status,
        updated_at: new Date().toISOString()
      }).or(`id.eq.${id},order_number.eq.${id},orderNumber.eq.${id}`).select().single();
      if (error) return null;
      return normalizeOrderFromSupabase(data);
    } catch (err) {
      return null;
    }
  },

  // USERS
  async insertUser(user: Partial<User>): Promise<User | null> {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const payload = {
        id: user.id || `usr-${Date.now()}`,
        name: user.name || 'Customer',
        username: user.username || user.email?.split('@')[0] || user.phone,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'customer',
        avatar: user.avatar,
        addresses: user.addresses || [],
        is_verified: user.isVerified !== false,
        created_at: user.createdAt || new Date().toISOString()
      };
      const { data, error } = await sb.from('users').upsert([payload]).select().single();
      if (error) return null;
      return data as User;
    } catch (err) {
      return null;
    }
  },

  // REALTIME SUBSCRIPTIONS
  subscribeToProducts(onChange: () => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('public:products:changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
          console.log('[Supabase Realtime] Product changed in public.products:', payload.eventType);
          onChange();
        })
        .subscribe((status) => {
          console.log('[Supabase Realtime] Product subscription status:', status);
        });

      return () => {
        sb.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime product subscription failed:', err);
      return () => {};
    }
  },

  subscribeToOrders(onChange: () => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('realtime-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          onChange();
        })
        .subscribe();

      return () => {
        sb.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime orders subscription failed:', err);
      return () => {};
    }
  },

  subscribeToSellers(onChange: () => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('realtime-sellers')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sellers' }, () => {
          onChange();
        })
        .subscribe();

      return () => {
        sb.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime sellers subscription failed:', err);
      return () => {};
    }
  }
};

// Data Transformers
function formatProductForSupabase(p: Partial<Product>): Record<string, any> {
  return {
    id: p.id || `prod-${Date.now()}`,
    title: p.title || '',
    title_bn: p.titleBn || p.title || '',
    slug: p.slug || (p.title || 'prod').toLowerCase().replace(/\s+/g, '-'),
    description: p.description || '',
    description_bn: p.descriptionBn || '',
    price: Number(p.price) || 0,
    discount_price: p.discountPrice ? Number(p.discountPrice) : null,
    category_id: p.categoryId || 'cat-1',
    category_name: p.categoryName || 'General',
    sub_category: p.subCategory || null,
    brand: p.brand || 'Local BD',
    seller_id: p.sellerId || 'sel-1',
    seller_name: p.sellerName || 'Dhaka Tech Store',
    stock: Number(p.stock) || 0,
    sku: p.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
    images: Array.isArray(p.images) ? p.images : [],
    rating: p.rating || 5.0,
    review_count: p.reviewCount || 0,
    tags: Array.isArray(p.tags) ? p.tags : [],
    is_featured: Boolean(p.isFeatured),
    is_flash_deal: Boolean(p.isFlashDeal),
    is_combo: Boolean(p.isCombo),
    combo_items: p.comboItems || [],
    variants: p.variants || [],
    variant_prices: p.variantPrices || {},
    bulk_offers: p.bulkOffers || [],
    warranty: p.warranty || '',
    custom_specs: p.customSpecs || [],
    is_approved: p.isApproved !== undefined ? Boolean(p.isApproved) : true,
    created_at: p.createdAt || new Date().toISOString(),
  };
}

function normalizeProductFromSupabase(raw: any): Product {
  return {
    id: raw.id,
    title: raw.title || '',
    titleBn: raw.title_bn || raw.titleBn || raw.title,
    slug: raw.slug || '',
    description: raw.description || '',
    descriptionBn: raw.description_bn || raw.descriptionBn || '',
    price: Number(raw.price) || 0,
    discountPrice: raw.discount_price ? Number(raw.discount_price) : (raw.discountPrice ? Number(raw.discountPrice) : undefined),
    categoryId: raw.category_id || raw.categoryId || 'cat-1',
    categoryName: raw.category_name || raw.categoryName || 'General',
    subCategory: raw.sub_category || raw.subCategory,
    brand: raw.brand || 'Local BD',
    sellerId: raw.seller_id || raw.sellerId || 'sel-1',
    sellerName: raw.seller_name || raw.sellerName || 'Verified Store',
    stock: Number(raw.stock) || 0,
    sku: raw.sku || '',
    images: Array.isArray(raw.images) ? raw.images : [],
    rating: Number(raw.rating) || 5.0,
    reviewCount: Number(raw.review_count || raw.reviewCount) || 0,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    isFeatured: Boolean(raw.is_featured || raw.isFeatured),
    isFlashDeal: Boolean(raw.is_flash_deal || raw.isFlashDeal),
    isCombo: Boolean(raw.is_combo || raw.isCombo),
    comboItems: raw.combo_items || raw.comboItems || [],
    variants: raw.variants || [],
    variantPrices: raw.variant_prices || raw.variantPrices || {},
    bulkOffers: raw.bulk_offers || raw.bulkOffers || [],
    warranty: raw.warranty,
    customSpecs: raw.custom_specs || raw.customSpecs || [],
    isApproved: raw.is_approved !== undefined ? Boolean(raw.is_approved) : (raw.isApproved !== undefined ? Boolean(raw.isApproved) : true),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

function formatSellerForSupabase(s: Partial<SellerStore>): Record<string, any> {
  return {
    id: s.id || `sel-${Date.now()}`,
    seller_id: s.sellerId || s.id || `usr-${Date.now()}`,
    store_name: s.storeName || 'New Store',
    store_name_bn: s.storeNameBn || s.storeName,
    owner_name: s.ownerName || '',
    email: s.email || '',
    phone: s.phone || '',
    logo_url: s.logoUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
    banner_url: s.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    rating: s.rating || 5.0,
    total_sales: s.totalSales || 0,
    is_verified: s.isVerified !== undefined ? Boolean(s.isVerified) : true,
    is_featured: Boolean(s.isFeatured),
    status: s.status || 'approved',
    subscription_tier: s.subscriptionTier || 'pro',
    subscription_status: s.subscriptionStatus || 'active',
    subscription_expiry_date: s.subscriptionExpiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    cloud_subscription_plan: s.cloudSubscriptionPlan || 'supabase_subscription',
    storage_type: s.storageType || 'supabase',
    storage_credentials: s.storageCredentials || '',
    trade_license_number: s.tradeLicenseNumber || '',
    bkash_number: s.bkashNumber || s.phone || '',
    bank_account_details: s.bankAccountDetails || '',
    staff: s.staff || [],
    permissions_config: s.permissionsConfig || {},
    created_at: s.createdAt || new Date().toISOString()
  };
}

function normalizeSellerFromSupabase(raw: any): SellerStore {
  return {
    id: raw.id,
    sellerId: raw.seller_id || raw.sellerId || raw.id,
    storeName: raw.store_name || raw.storeName || 'Store',
    storeNameBn: raw.store_name_bn || raw.storeNameBn,
    ownerName: raw.owner_name || raw.ownerName || '',
    email: raw.email || '',
    phone: raw.phone || '',
    logoUrl: raw.logo_url || raw.logoUrl || '',
    bannerUrl: raw.banner_url || raw.bannerUrl || '',
    rating: Number(raw.rating) || 5.0,
    totalSales: Number(raw.total_sales || raw.totalSales) || 0,
    balance: Number(raw.balance) || 0,
    isApproved: raw.is_approved !== undefined ? Boolean(raw.is_approved) : (raw.status === 'approved' || true),
    joinDate: raw.created_at ? new Date(raw.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    isVerified: Boolean(raw.is_verified || raw.isVerified),
    isFeatured: Boolean(raw.is_featured || raw.isFeatured),
    status: raw.status || 'approved',
    subscriptionTier: raw.subscription_tier || raw.subscriptionTier || 'free',
    subscriptionStatus: raw.subscription_status || raw.subscriptionStatus || 'active',
    subscriptionExpiryDate: raw.subscription_expiry_date || raw.subscriptionExpiryDate,
    cloudSubscriptionPlan: raw.cloud_subscription_plan || raw.cloudSubscriptionPlan,
    storageType: raw.storage_type || raw.storageType || 'central',
    storageCredentials: raw.storage_credentials || raw.storageCredentials || '',
    tradeLicenseNumber: raw.trade_license_number || raw.tradeLicenseNumber || '',
    bkashNumber: raw.bkash_number || raw.bkashNumber || '',
    bankAccountDetails: raw.bank_account_details || raw.bankAccountDetails || '',
    staff: raw.staff || [],
    permissionsConfig: raw.permissions_config || raw.permissionsConfig,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString()
  };
}

function formatOrderForSupabase(o: Partial<Order>): Record<string, any> {
  return {
    id: o.id || `ord-${Date.now()}`,
    order_number: o.orderNumber || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    order_5_digit_id: o.order5DigitId || o.orderNumber?.replace(/[^0-9]/g, '').slice(-5) || '58392',
    user_id: o.userId || 'usr-demo-cust',
    customer_name: o.customerName || 'Valued Customer',
    customer_phone: o.customerPhone || '01700000000',
    customer_email: o.customerEmail || 'customer@amarbazar.bd',
    items: o.items || [],
    subtotal: Number(o.subtotal) || 0,
    discount_amount: Number(o.discountAmount) || 0,
    coupon_code: o.couponCode || null,
    shipping_fee: Number(o.shippingFee) || 0,
    total_amount: Number(o.totalAmount) || 0,
    payment_method: o.paymentMethod || 'cod',
    payment_status: o.paymentStatus || 'pending',
    order_status: o.status || o.orderStatus || 'confirmed',
    tracking_status: o.trackingStatus || 'Order Placed',
    courier: o.courier || {},
    shipping_address: o.shippingAddress || {},
    transaction_id: o.transactionId || null,
    created_at: o.createdAt || new Date().toISOString(),
    updated_at: o.updatedAt || new Date().toISOString()
  };
}

function normalizeOrderFromSupabase(raw: any): Order {
  return {
    id: raw.id,
    orderNumber: raw.order_number || raw.orderNumber || `ORD-${raw.id.slice(-5)}`,
    order5DigitId: raw.order_5_digit_id || raw.order5DigitId || raw.order_number?.replace(/[^0-9]/g, '').slice(-5),
    userId: raw.user_id || raw.userId || 'usr-demo-cust',
    customerName: raw.customer_name || raw.customerName || 'Valued Customer',
    customerPhone: raw.customer_phone || raw.customerPhone || '',
    customerEmail: raw.customer_email || raw.customerEmail || 'customer@amarbazar.bd',
    items: raw.items || [],
    subtotal: Number(raw.subtotal) || 0,
    discountAmount: Number(raw.discount_amount || raw.discountAmount) || 0,
    couponCode: raw.coupon_code || raw.couponCode,
    shippingFee: Number(raw.shipping_fee || raw.shippingFee) || 0,
    totalAmount: Number(raw.total_amount || raw.totalAmount) || 0,
    paymentMethod: raw.payment_method || raw.paymentMethod || 'cod',
    paymentStatus: raw.payment_status || raw.paymentStatus || 'pending',
    status: raw.order_status || raw.status || 'confirmed',
    orderStatus: raw.order_status || raw.orderStatus || 'confirmed',
    trackingStatus: raw.tracking_status || raw.trackingStatus || 'Order Placed',
    courier: raw.courier || {},
    shippingAddress: raw.shipping_address || raw.shippingAddress || {},
    transactionId: raw.transaction_id || raw.transactionId,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString()
  };
}
