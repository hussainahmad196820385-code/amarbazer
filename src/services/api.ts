import { Product, Category, Coupon, Order, SellerStore, User, WithdrawalRequest, SystemSettings, SellerStaffMember, AdminStaffMember, SellerPermissionConfig } from '../types';
import { nativeBridge } from './nativeBridge';
import { supabaseDb, isSupabaseConfigured } from '../lib/supabase';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const baseUrl = nativeBridge.getApiBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  try {
    const res = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP error ${res.status}` }));
      throw new Error(err.message || `HTTP error ${res.status}`);
    }
    return res.json();
  } catch (error: any) {
    // If backend 404 or connection error, propagate for fallback handlers
    throw error;
  }
}

export const api = {
  // Settings
  getSettings: () => fetchJson<SystemSettings>('/api/settings'),
  updateSettings: (settings: Partial<SystemSettings>) => 
    fetchJson<SystemSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Auth & OTP
  sendOtp: (phone: string) => fetchJson<{ success: boolean; message: string; otp?: string }>('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  login: (data: { email?: string; phone?: string; role?: string; username?: string; password?: string }) => fetchJson<{ success: boolean; user: User; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  register: async (data: Record<string, any>) => {
    try {
      const res = await fetchJson<{ success: boolean; user: User; token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
      if (isSupabaseConfigured() && res?.user) {
        supabaseDb.insertUser(res.user).catch(() => {});
      }
      return res;
    } catch (err) {
      if (isSupabaseConfigured()) {
        const dummyUser: User = {
          id: `usr-${Date.now()}`,
          name: data.name || 'User',
          email: data.email || `${Date.now()}@amarbazar.bd`,
          phone: data.phone || '01700000000',
          role: data.role || 'customer',
          isVerified: true,
          addresses: [],
          createdAt: new Date().toISOString()
        };
        const sbUser = await supabaseDb.insertUser(dummyUser);
        return { success: true, user: sbUser || dummyUser, token: `jwt-token-${dummyUser.id}` };
      }
      throw err;
    }
  },

  changePassword: (data: { userId: string; oldPassword?: string; newPassword: string }) => fetchJson<{ success: boolean; user: User; message: string }>('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Products
  getProducts: async (params?: Record<string, string>): Promise<Product[]> => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    try {
      return await fetchJson<Product[]>(`/api/products${q}`);
    } catch (err) {
      if (isSupabaseConfigured()) {
        const sbProducts = await supabaseDb.getProducts();
        if (sbProducts && sbProducts.length > 0) return sbProducts;
      }
      throw err;
    }
  },

  getProductById: async (id: string): Promise<Product> => {
    try {
      return await fetchJson<Product>(`/api/products/${id}`);
    } catch (err) {
      if (isSupabaseConfigured()) {
        const list = await supabaseDb.getProducts();
        const found = list?.find(p => p.id === id);
        if (found) return found;
      }
      throw err;
    }
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    try {
      const created = await fetchJson<Product>('/api/products', { method: 'POST', body: JSON.stringify(product) });
      if (isSupabaseConfigured()) {
        supabaseDb.insertProduct(created).catch(e => console.warn('Client Supabase product sync:', e));
      }
      return created;
    } catch (err) {
      // Direct Supabase fallback if backend /api/products returns 404
      if (isSupabaseConfigured()) {
        const fallbackProd = await supabaseDb.insertProduct(product);
        if (fallbackProd) return fallbackProd;
      }
      throw err;
    }
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    try {
      const updated = await fetchJson<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(product) });
      if (isSupabaseConfigured()) {
        supabaseDb.updateProduct(id, updated).catch(() => {});
      }
      return updated;
    } catch (err) {
      if (isSupabaseConfigured()) {
        const fallback = await supabaseDb.updateProduct(id, product);
        if (fallback) return fallback;
      }
      throw err;
    }
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await fetchJson<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' });
      if (isSupabaseConfigured()) {
        supabaseDb.deleteProduct(id).catch(() => {});
      }
      return res;
    } catch (err) {
      if (isSupabaseConfigured()) {
        const ok = await supabaseDb.deleteProduct(id);
        return { success: ok };
      }
      throw err;
    }
  },

  // Categories
  getCategories: () => fetchJson<Category[]>('/api/categories'),
  createCategory: (cat: Partial<Category>) => fetchJson<Category>('/api/categories', { method: 'POST', body: JSON.stringify(cat) }),
  deleteCategory: (id: string) => fetchJson<{ success: boolean }>(`/api/categories/${id}`, { method: 'DELETE' }),

  // Coupons
  getCoupons: () => fetchJson<Coupon[]>('/api/coupons'),
  validateCoupon: (code: string, cartAmount: number) => fetchJson<{ valid: boolean; coupon?: Coupon; discountAmount?: number; message?: string }>('/api/coupons/validate', { method: 'POST', body: JSON.stringify({ code, cartAmount }) }),
  createCoupon: (coupon: Partial<Coupon>) => fetchJson<Coupon>('/api/coupons', { method: 'POST', body: JSON.stringify(coupon) }),
  deleteCoupon: (id: string) => fetchJson<{ success: boolean }>(`/api/coupons/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: async (params?: { userId?: string; sellerId?: string }): Promise<Order[]> => {
    const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    try {
      return await fetchJson<Order[]>(`/api/orders${q}`);
    } catch (err) {
      if (isSupabaseConfigured()) {
        const list = await supabaseDb.getOrders();
        if (list) return list;
      }
      throw err;
    }
  },

  getOrderById: (id: string) => fetchJson<Order>(`/api/orders/${id}`),
  
  createOrder: async (order: Partial<Order>): Promise<Order> => {
    try {
      const created = await fetchJson<Order>('/api/orders', { method: 'POST', body: JSON.stringify(order) });
      if (isSupabaseConfigured()) {
        supabaseDb.insertOrder(created).catch(() => {});
      }
      return created;
    } catch (err) {
      if (isSupabaseConfigured()) {
        const sbOrder = await supabaseDb.insertOrder(order);
        if (sbOrder) return sbOrder;
      }
      throw err;
    }
  },

  updateOrderStatus: async (id: string, status: string, note?: string): Promise<Order> => {
    try {
      const res = await fetchJson<Order>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) });
      if (isSupabaseConfigured()) {
        supabaseDb.updateOrderStatus(id, status, note).catch(() => {});
      }
      return res;
    } catch (err) {
      if (isSupabaseConfigured()) {
        const updated = await supabaseDb.updateOrderStatus(id, status, note);
        if (updated) return updated;
      }
      throw err;
    }
  },

  // bKash / Payment Verification
  verifyBkashPayment: (data: { mobileNumber: string; pin: string; otp?: string }) => fetchJson<{ success: boolean; transactionId: string; message: string }>('/api/payments/bkash/verify', { method: 'POST', body: JSON.stringify(data) }),

  // Sellers
  getSellers: async (): Promise<SellerStore[]> => {
    try {
      return await fetchJson<SellerStore[]>('/api/sellers');
    } catch (err) {
      if (isSupabaseConfigured()) {
        const list = await supabaseDb.getSellers();
        if (list && list.length > 0) return list;
      }
      throw err;
    }
  },

  getSellerById: (id: string) => fetchJson<SellerStore>(`/api/sellers/${id}`),

  createSeller: async (data: Partial<SellerStore>): Promise<SellerStore> => {
    try {
      const created = await fetchJson<SellerStore>('/api/sellers', { method: 'POST', body: JSON.stringify(data) });
      if (isSupabaseConfigured()) {
        supabaseDb.insertSeller(created).catch(() => {});
      }
      return created;
    } catch (err) {
      if (isSupabaseConfigured()) {
        const fallback = await supabaseDb.insertSeller(data);
        if (fallback) return fallback;
      }
      throw err;
    }
  },

  updateSeller: async (id: string, data: Partial<SellerStore>): Promise<SellerStore> => {
    try {
      const updated = await fetchJson<SellerStore>(`/api/sellers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      if (isSupabaseConfigured()) {
        supabaseDb.updateSeller(id, updated).catch(() => {});
      }
      return updated;
    } catch (err) {
      if (isSupabaseConfigured()) {
        const fallback = await supabaseDb.updateSeller(id, data);
        if (fallback) return fallback;
      }
      throw err;
    }
  },

  approveSeller: (id: string) => fetchJson<SellerStore>(`/api/sellers/${id}/approve`, { method: 'PATCH' }),
  purchaseSubscription: (id: string, data: { plan: string; amountPaid: number; paymentMethod: string; txnId?: string }) => 
    fetchJson<SellerStore>(`/api/sellers/${id}/subscription`, { method: 'POST', body: JSON.stringify(data) }),
  updateSubscription: (id: string, data: { plan?: string; status?: string; expiryDate?: string; amountPaid?: number }) => 
    fetchJson<SellerStore>(`/api/sellers/${id}/subscription`, { method: 'PATCH', body: JSON.stringify(data) }),
  warnSeller: (id: string, message: string) => 
    fetchJson<SellerStore>(`/api/sellers/${id}/warn`, { method: 'POST', body: JSON.stringify({ message }) }),
  deleteSeller: (id: string) => 
    fetchJson<{ success: boolean }>(`/api/sellers/${id}`, { method: 'DELETE' }),

  // Seller Staff & Roles Permissions
  getStaffMembers: (sellerId: string) => fetchJson<SellerStaffMember[]>(`/api/sellers/${sellerId}/staff`),
  createStaffMember: (sellerId: string, data: Partial<SellerStaffMember>) => 
    fetchJson<SellerStaffMember>(`/api/sellers/${sellerId}/staff`, { method: 'POST', body: JSON.stringify(data) }),
  updateStaffMember: (sellerId: string, staffId: string, data: Partial<SellerStaffMember>) => 
    fetchJson<SellerStaffMember>(`/api/sellers/${sellerId}/staff/${staffId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStaffMember: (sellerId: string, staffId: string) => 
    fetchJson<{ success: boolean }>(`/api/sellers/${sellerId}/staff/${staffId}`, { method: 'DELETE' }),

  // Withdrawals
  getWithdrawals: (sellerId?: string) => {
    const q = sellerId ? `?sellerId=${sellerId}` : '';
    return fetchJson<WithdrawalRequest[]>(`/api/withdrawals${q}`);
  },
  createWithdrawal: (req: Partial<WithdrawalRequest>) => fetchJson<WithdrawalRequest>('/api/withdrawals', { method: 'POST', body: JSON.stringify(req) }),
  updateWithdrawalStatus: (id: string, status: string, note?: string) => fetchJson<WithdrawalRequest>(`/api/withdrawals/${id}`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),

  // Users
  getUsers: () => fetchJson<User[]>('/api/users'),
  updateUserRole: (id: string, role: string) => fetchJson<User>(`/api/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  updateUserPermissions: (id: string, customPermissions: string[]) => fetchJson<User>(`/api/users/${id}/permissions`, { method: 'PATCH', body: JSON.stringify({ customPermissions }) }),
  deleteUser: (id: string) => fetchJson<{ success: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),

  // Admin Staff Management
  getAdminStaff: () => fetchJson<AdminStaffMember[]>('/api/admin/staff'),
  createAdminStaff: (data: Partial<AdminStaffMember>) => 
    fetchJson<AdminStaffMember>('/api/admin/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminStaff: (staffId: string, data: Partial<AdminStaffMember>) => 
    fetchJson<AdminStaffMember>(`/api/admin/staff/${staffId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminStaff: (staffId: string) => 
    fetchJson<{ success: boolean }>(`/api/admin/staff/${staffId}`, { method: 'DELETE' }),

  // Seller Permission Configuration by Admin
  getSellerPermissions: (sellerId: string) => 
    fetchJson<SellerPermissionConfig>(`/api/admin/sellers/${sellerId}/permissions`),
  updateSellerPermissions: (sellerId: string, permissions: Partial<SellerPermissionConfig>) => 
    fetchJson<SellerPermissionConfig>(`/api/admin/sellers/${sellerId}/permissions`, { method: 'PUT', body: JSON.stringify(permissions) }),
  getAllStaffDirectory: () => 
    fetchJson<{ adminStaff: any[]; sellerStaff: any[]; totalCount: number }>('/api/admin/all-staff-directory'),

  // Supabase Status & Sync
  getSupabaseStatus: () => fetchJson<{ connected: boolean; configured: boolean; message: string; error?: string }>('/api/supabase/status'),
  syncToSupabase: () => fetchJson<{ success: boolean; message: string; synced?: any }>('/api/supabase/sync', { method: 'POST' }),

  // Gemini AI Assistant
  askAiAssistant: (prompt: string, language: string) => fetchJson<{ reply: string }>('/api/ai/assistant', { method: 'POST', body: JSON.stringify({ prompt, language }) }),
  resolveMapLink: (url: string) => fetchJson<{ success: boolean; address: string }>('/api/resolve-map-link', { method: 'POST', body: JSON.stringify({ url }) }),
  generateAiCopywriter: (data: { title: string; brand?: string; categoryName?: string; language?: string }) =>
    fetchJson<{ descEn: string; descBn: string }>('/api/ai/copywriter', { method: 'POST', body: JSON.stringify(data) }),
  generateAiReview: (data: { title: string; rating: number; language?: string }) =>
    fetchJson<{ reviewEn: string; reviewBn: string }>('/api/ai/review-writer', { method: 'POST', body: JSON.stringify(data) })
};
