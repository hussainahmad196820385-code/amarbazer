import { Product, Category, Coupon, Order, SellerStore, User, WithdrawalRequest, SystemSettings, SellerStaffMember, AdminStaffMember, SellerPermissionConfig } from '../types';
import { nativeBridge } from './nativeBridge';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const baseUrl = nativeBridge.getApiBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  const res = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Settings
  getSettings: () => fetchJson<SystemSettings>('/api/settings'),
  updateSettings: (settings: Partial<SystemSettings>) => 
    fetchJson<SystemSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Auth & OTP
  sendOtp: (phone: string) => fetchJson<{ success: boolean; message: string; otp?: string }>('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  login: (data: { email?: string; phone?: string; role?: string; username?: string; password?: string }) => fetchJson<{ success: boolean; user: User; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: Record<string, any>) => fetchJson<{ success: boolean; user: User; token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (data: { userId: string; oldPassword?: string; newPassword: string }) => fetchJson<{ success: boolean; user: User; message: string }>('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Products
  getProducts: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<Product[]>(`/api/products${q}`);
  },
  getProductById: (id: string) => fetchJson<Product>(`/api/products/${id}`),
  createProduct: (product: Partial<Product>) => fetchJson<Product>('/api/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id: string, product: Partial<Product>) => fetchJson<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id: string) => fetchJson<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),

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
  getOrders: (params?: { userId?: string; sellerId?: string }) => {
    const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return fetchJson<Order[]>(`/api/orders${q}`);
  },
  getOrderById: (id: string) => fetchJson<Order>(`/api/orders/${id}`),
  createOrder: (order: Partial<Order>) => fetchJson<Order>('/api/orders', { method: 'POST', body: JSON.stringify(order) }),
  updateOrderStatus: (id: string, status: string, note?: string) => fetchJson<Order>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),

  // bKash / Payment Verification
  verifyBkashPayment: (data: { mobileNumber: string; pin: string; otp?: string }) => fetchJson<{ success: boolean; transactionId: string; message: string }>('/api/payments/bkash/verify', { method: 'POST', body: JSON.stringify(data) }),

  // Sellers
  getSellers: () => fetchJson<SellerStore[]>('/api/sellers'),
  updateSeller: (id: string, data: Partial<SellerStore>) => fetchJson<SellerStore>(`/api/sellers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
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

  // Gemini AI Assistant
  askAiAssistant: (prompt: string, language: string) => fetchJson<{ reply: string }>('/api/ai/assistant', { method: 'POST', body: JSON.stringify({ prompt, language }) }),
  resolveMapLink: (url: string) => fetchJson<{ success: boolean; address: string }>('/api/resolve-map-link', { method: 'POST', body: JSON.stringify({ url }) }),
  generateAiCopywriter: (data: { title: string; brand?: string; categoryName?: string; language?: string }) =>
    fetchJson<{ descEn: string; descBn: string }>('/api/ai/copywriter', { method: 'POST', body: JSON.stringify(data) }),
  generateAiReview: (data: { title: string; rating: number; language?: string }) =>
    fetchJson<{ reviewEn: string; reviewBn: string }>('/api/ai/review-writer', { method: 'POST', body: JSON.stringify(data) })
};
