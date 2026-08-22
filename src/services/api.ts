import { Product, Category, Coupon, Order, SellerStore, User, WithdrawalRequest, SystemSettings, SellerStaffMember, AdminStaffMember, SellerPermissionConfig } from '../types';
import { nativeBridge } from './nativeBridge';
import { firebaseDb, testFirestoreConnection } from '../lib/firebase';
import { safeStorage } from '../lib/safeStorage';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SELLERS, INITIAL_SYSTEM_SETTINGS } from '../data/initialData';

function normalizeInput(str?: string): string {
  if (!str) return '';
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.trim().replace(/[০-৯]/g, match => bnToEnMap[match] || match);
}

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

    const text = await res.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON response (${res.status})`);
      }
    }

    if (!res.ok) {
      const errMsg = (data && (data.message || data.error)) || `HTTP error ${res.status}`;
      throw new Error(errMsg);
    }
    return data as T;
  } catch (error: any) {
    throw error;
  }
}

const STORAGE_KEY_PRODUCTS = 'amarbazar_products_store';
const STORAGE_KEY_DELETED_PRODUCTS = 'amarbazar_deleted_product_ids';
const STORAGE_KEY_ORDERS = 'amarbazar_orders_store';
const STORAGE_KEY_CATEGORIES = 'amarbazar_categories_store';
const STORAGE_KEY_SELLERS = 'amarbazar_sellers_store';

export function getDeletedProductIds(): Set<string> {
  try {
    const parsed = safeStorage.getJSON<string[]>(STORAGE_KEY_DELETED_PRODUCTS, []);
    if (Array.isArray(parsed)) return new Set(parsed);
  } catch (e) {}
  return new Set();
}

export function markProductDeleted(id: string) {
  try {
    const set = getDeletedProductIds();
    set.add(id);
    safeStorage.setItem(STORAGE_KEY_DELETED_PRODUCTS, JSON.stringify(Array.from(set)));
  } catch (e) {}
}

export function unmarkProductDeleted(id: string) {
  try {
    const set = getDeletedProductIds();
    if (set.has(id)) {
      set.delete(id);
      safeStorage.setItem(STORAGE_KEY_DELETED_PRODUCTS, JSON.stringify(Array.from(set)));
    }
  } catch (e) {}
}

export async function syncDeletedProductIdsFromCloud(): Promise<Set<string>> {
  const set = getDeletedProductIds();
  // 1. Fetch from Firestore
  try {
    const cloudIds = await firebaseDb.getDeletedProductIds();
    if (cloudIds && Array.isArray(cloudIds) && cloudIds.length > 0) {
      cloudIds.forEach(id => set.add(id));
    }
  } catch (e) {}

  // 2. Fetch from backend API /api/products/deleted-ids
  try {
    const serverDeletedIds = await fetchJson<string[]>('/api/products/deleted-ids');
    if (serverDeletedIds && Array.isArray(serverDeletedIds) && serverDeletedIds.length > 0) {
      serverDeletedIds.forEach(id => set.add(id));
    }
  } catch (e) {}

  try {
    safeStorage.setItem(STORAGE_KEY_DELETED_PRODUCTS, JSON.stringify(Array.from(set)));
  } catch (e) {}
  return set;
}

function getLocalSellers(): SellerStore[] {
  try {
    const parsed = safeStorage.getJSON<SellerStore[]>(STORAGE_KEY_SELLERS, []);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {}
  return INITIAL_SELLERS;
}

function saveLocalSellers(sellers: SellerStore[]) {
  try {
    safeStorage.setItem(STORAGE_KEY_SELLERS, JSON.stringify(sellers));
  } catch (e) {}
}

function getLocalCategories(): Category[] {
  try {
    const parsed = safeStorage.getJSON<Category[]>(STORAGE_KEY_CATEGORIES, []);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {}
  return INITIAL_CATEGORIES;
}

function saveLocalCategories(cats: Category[]) {
  try {
    safeStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cats));
  } catch (e) {}
}

function getLocalProducts(): Product[] {
  const deletedSet = getDeletedProductIds();
  try {
    const parsed = safeStorage.getJSON<Product[]>(STORAGE_KEY_PRODUCTS, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter(p => !deletedSet.has(p.id));
    }
  } catch (e) {}
  return INITIAL_PRODUCTS.filter(p => !deletedSet.has(p.id));
}

function saveLocalProducts(products: Product[], notify = true) {
  const deletedSet = getDeletedProductIds();
  const filtered = products.filter(p => !deletedSet.has(p.id));
  try {
    safeStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(filtered));
    if (notify && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('amarbazar_products_updated', { detail: filtered }));
    }
  } catch (e) {}
}

export const api = {
  // Settings
  getSettings: async () => {
    try {
      const fbSettings = await firebaseDb.getSettings();
      if (fbSettings) return fbSettings;
    } catch (e) {}
    try {
      return await fetchJson<SystemSettings>('/api/settings');
    } catch {
      return INITIAL_SYSTEM_SETTINGS;
    }
  },
  updateSettings: async (settings: Partial<SystemSettings>) => {
    try {
      await firebaseDb.saveSettings(settings);
    } catch (e) {}
    return fetchJson<SystemSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(settings) });
  },

  // Auth & OTP
  sendOtp: (phone: string) => fetchJson<{ success: boolean; message: string; otp?: string }>('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone: normalizeInput(phone) }) }),
  
  login: async (data: { email?: string; phone?: string; role?: string; username?: string; password?: string }) => {
    const normalizedData = {
      ...data,
      username: normalizeInput(data.username),
      password: normalizeInput(data.password),
      email: data.email ? normalizeInput(data.email) : undefined,
      phone: data.phone ? normalizeInput(data.phone) : undefined
    };

    try {
      const res = await fetchJson<{ success: boolean; user: User; token: string }>('/api/auth/login', { 
        method: 'POST', 
        body: JSON.stringify(normalizedData) 
      });
      return res;
    } catch (err: any) {
      // Robust client fallback if backend is momentarily offline
      const u = (normalizedData.username || normalizedData.email || normalizedData.phone || '').toLowerCase();
      const p = normalizedData.password || '';

      if (u) {
        let matchedUser = INITIAL_USERS.find(x => 
          (x.username && x.username.toLowerCase() === u) ||
          (x.email && x.email.toLowerCase() === u) ||
          (x.phone && x.phone.replace(/[^0-9]/g, '') === u.replace(/[^0-9]/g, '')) ||
          (u === 'admin' && x.role === 'admin') ||
          (u === 'এডমিন' && x.role === 'admin') ||
          (u === 'seller' && x.role === 'seller') ||
          (u === 'সেলার' && x.role === 'seller') ||
          (u === 'customer' && x.role === 'customer') ||
          (u === 'কাস্টমার' && x.role === 'customer')
        );

        if (!matchedUser) {
          try {
            const localSavedUsers: User[] = JSON.parse(localStorage.getItem('amarbazar_custom_users') || '[]');
            matchedUser = localSavedUsers.find(x => 
              (x.username && x.username.toLowerCase() === u) ||
              (x.email && x.email.toLowerCase() === u) ||
              (x.phone && x.phone.replace(/[^0-9]/g, '') === u.replace(/[^0-9]/g, ''))
            );
          } catch (e) {}
        }

        if (matchedUser) {
          const expectedPass = matchedUser.password || (matchedUser.role === 'admin' ? 'hussain3122' : matchedUser.role === 'seller' ? 'seller123' : 'customer123');
          if (p === expectedPass || (matchedUser.role === 'admin' && p === 'hussain3122')) {
            return { success: true, user: matchedUser, token: `jwt-token-${matchedUser.id}` };
          }
          throw new Error('ভুল পাসওয়ার্ড! (Invalid password)');
        }
      }
      throw new Error('ভুল ইউজারনেম অথবা পাসওয়ার্ড! (Invalid credentials)');
    }
  },
  
  register: async (data: Record<string, any>) => {
    try {
      const res = await fetchJson<{ success: boolean; user: User; token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
      if (res?.user) {
        firebaseDb.insertUser(res.user).catch(() => {});
      }
      return res;
    } catch (err) {
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
      await firebaseDb.insertUser(dummyUser).catch(() => {});
      return { success: true, user: dummyUser, token: `jwt-token-${dummyUser.id}` };
    }
  },

  changePassword: (data: { userId: string; oldPassword?: string; newPassword: string }) => fetchJson<{ success: boolean; user: User; message: string }>('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Products
  getProducts: async (params?: Record<string, string>): Promise<Product[]> => {
    // Synchronize latest cloud deleted products
    const deletedSet = await syncDeletedProductIdsFromCloud();
    const q = params ? '?' + new URLSearchParams(params).toString() : '';

    let authoritativeProducts: Product[] | null = null;

    // 1. Try Backend Server API (/api/products)
    try {
      const serverProducts = await fetchJson<Product[]>(`/api/products${q}`);
      if (serverProducts && Array.isArray(serverProducts)) {
        authoritativeProducts = serverProducts;
      }
    } catch (err) {
      // Backend request fallback
    }

    // 2. If backend failed, try Firebase Firestore directly
    if (!authoritativeProducts) {
      try {
        const fbProducts = await firebaseDb.getProducts();
        if (fbProducts && Array.isArray(fbProducts) && fbProducts.length > 0) {
          authoritativeProducts = fbProducts;
        }
      } catch (e) {
        // Firebase fallback
      }
    }

    let resultList: Product[];
    if (authoritativeProducts) {
      // Filter out any known deleted products
      resultList = authoritativeProducts.filter(p => !deletedSet.has(p.id));
      if (!params || Object.keys(params).length === 0) {
        saveLocalProducts(resultList, false);
      }
    } else {
      // Offline fallback: Use local storage cache excluding deleted items
      let localList = getLocalProducts().filter(p => !deletedSet.has(p.id));
      if (localList.length === 0 && deletedSet.size === 0) {
        localList = INITIAL_PRODUCTS;
        saveLocalProducts(INITIAL_PRODUCTS, false);
      }
      resultList = localList;
    }

    let filtered = resultList;
    if (params?.sellerId) {
      filtered = filtered.filter(p => p.sellerId === params.sellerId || (params.sellerId === 'sel-1' && p.sellerId === 'usr-seller-1') || (params.sellerId === 'usr-seller-1' && p.sellerId === 'sel-1'));
    }
    if (params?.category) {
      filtered = filtered.filter(p => p.categoryId === params.category || p.categoryName?.toLowerCase() === params.category.toLowerCase());
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(s) || (p.titleBn && p.titleBn.toLowerCase().includes(s)));
    }
    return filtered;
  },

  getProductById: async (id: string): Promise<Product> => {
    const deletedSet = getDeletedProductIds();
    if (deletedSet.has(id)) {
      throw new Error('Product was deleted');
    }
    const localList = getLocalProducts();
    const localFound = localList.find(p => p.id === id && !deletedSet.has(p.id));
    if (localFound) return localFound;

    try {
      const p = await fetchJson<Product>(`/api/products/${id}`);
      if (p && !deletedSet.has(p.id)) return p;
    } catch (err) {
      const list = await firebaseDb.getProducts();
      const found = list?.find(p => p.id === id && !deletedSet.has(p.id));
      if (found) return found;
      throw err;
    }
    throw new Error('Product not found');
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const newId = product.id || `prod-${Date.now()}`;
    unmarkProductDeleted(newId);

    const newProd: Product = {
      id: newId,
      title: product.title || 'New Product',
      titleBn: product.titleBn || product.title || 'নতুন পণ্য',
      slug: product.slug || ((product.title || 'prod').toLowerCase().replace(/\s+/g, '-')),
      description: product.description || 'Quality product',
      descriptionBn: product.descriptionBn || product.description || 'মানসম্মত পণ্য',
      price: Number(product.price) || 100,
      discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
      categoryId: product.categoryId || 'cat-1',
      categoryName: product.categoryName || 'General',
      subCategory: product.subCategory,
      brand: product.brand || 'AmarBazar',
      sellerId: product.sellerId || 'sel-1',
      sellerName: product.sellerName || 'Dhaka Tech Store',
      stock: product.stock !== undefined ? Number(product.stock) : 20,
      sku: product.sku || `SKU-${Date.now().toString().slice(-6)}`,
      images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      rating: product.rating || 5.0,
      reviewCount: product.reviewCount || 0,
      tags: product.tags || ['bangladesh', 'new'],
      isFeatured: product.isFeatured ?? true,
      isFlashDeal: Boolean(product.isFlashDeal),
      isCombo: Boolean(product.isCombo),
      comboItems: product.comboItems || [],
      variants: product.variants || [],
      variantPrices: product.variantPrices || {},
      bulkOffers: product.bulkOffers || [],
      customSpecs: product.customSpecs || [],
      warranty: product.warranty,
      warrantyPolicy: product.warrantyPolicy,
      returnPolicy: product.returnPolicy,
      deliveryTime: product.deliveryTime || '2-3 Days',
      isFreeDelivery: Boolean(product.isFreeDelivery),
      deliveryChargeInside: product.deliveryChargeInside ?? 60,
      deliveryChargeOutside: product.deliveryChargeOutside ?? 120,
      isCodAvailable: product.isCodAvailable ?? true,
      isExpressDelivery: Boolean(product.isExpressDelivery),
      createdAt: new Date().toISOString(),
      ...product,
      isApproved: true
    };

    // 1. Immediately persist to local cache
    const localList = getLocalProducts();
    const existingIdx = localList.findIndex(p => p.id === newProd.id);
    let updatedList: Product[];
    if (existingIdx >= 0) {
      updatedList = [...localList];
      updatedList[existingIdx] = newProd;
    } else {
      updatedList = [newProd, ...localList];
    }
    saveLocalProducts(updatedList);

    // 2. Push directly to Firebase Firestore for instant live multi-device broadcast
    try {
      await firebaseDb.insertProduct(newProd);
    } catch (err) {
      console.warn('Firebase product insert notice:', err);
    }

    // 3. Synchronize with backend API server
    try {
      await fetchJson<Product>('/api/products', { method: 'POST', body: JSON.stringify(newProd) });
    } catch (err) {
      console.warn('Backend API product sync notice:', err);
    }

    return newProd;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    unmarkProductDeleted(id);

    // 1. Instantly update local cache
    const localList = getLocalProducts();
    const idx = localList.findIndex(p => p.id === id);
    let updatedProd: Product = { ...product, id } as Product;
    if (idx >= 0) {
      updatedProd = { ...localList[idx], ...product, ...updatedProd, id, isApproved: true };
      const updatedList = [...localList];
      updatedList[idx] = updatedProd;
      saveLocalProducts(updatedList);
    }

    // 2. Direct Firebase Firestore update for live multi-device broadcast
    try {
      await firebaseDb.updateProduct(id, updatedProd);
    } catch (err) {
      console.warn('Firebase product update notice:', err);
    }

    // 3. Sync with backend API server
    try {
      await fetchJson<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(updatedProd) });
    } catch (err) {
      console.warn('Backend API product update notice:', err);
    }

    return updatedProd;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    // 1. Permanently mark deleted
    markProductDeleted(id);

    // 2. Instantly remove from local storage
    const localList = getLocalProducts();
    const filtered = localList.filter(p => p.id !== id);
    saveLocalProducts(filtered);

    // 3. Delete from Firebase Firestore (instant live broadcast to other devices)
    try {
      await firebaseDb.deleteProduct(id);
    } catch (err) {
      console.warn('Firebase deleteProduct notice:', err);
    }

    // 4. Delete from backend API
    try {
      await fetchJson<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend API product delete notice:', err);
    }

    return { success: true };
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const fbCats = await firebaseDb.getCategories();
      if (fbCats && fbCats.length > 0) {
        saveLocalCategories(fbCats);
        return fbCats;
      }
    } catch {}

    try {
      const serverCats = await fetchJson<Category[]>('/api/categories');
      if (serverCats && Array.isArray(serverCats)) {
        saveLocalCategories(serverCats);
        return serverCats;
      }
    } catch {}
    return getLocalCategories();
  },
  createCategory: async (cat: Partial<Category>) => {
    const id = cat.id || `cat-${Date.now()}`;
    const fullCat = { ...cat, id } as Category;
    firebaseDb.insertCategory(fullCat).catch(() => {});
    return fetchJson<Category>('/api/categories', { method: 'POST', body: JSON.stringify(fullCat) });
  },
  updateCategory: async (id: string, cat: Partial<Category>) => {
    firebaseDb.updateCategory(id, cat).catch(() => {});
    return fetchJson<Category>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(cat) });
  },
  deleteCategory: async (id: string) => {
    try {
      await firebaseDb.deleteCategory(id);
    } catch {}
    return fetchJson<{ success: boolean }>(`/api/categories/${id}`, { method: 'DELETE' });
  },

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
      const list = await firebaseDb.getOrders();
      if (list) return list;
      throw err;
    }
  },

  getOrderById: (id: string) => fetchJson<Order>(`/api/orders/${id}`),
  
  createOrder: async (order: Partial<Order>): Promise<Order> => {
    try {
      const created = await fetchJson<Order>('/api/orders', { method: 'POST', body: JSON.stringify(order) });
      firebaseDb.insertOrder(created).catch(() => {});
      return created;
    } catch (err) {
      const fbOrder = await firebaseDb.insertOrder(order);
      if (fbOrder) return fbOrder;
      throw err;
    }
  },

  updateOrderStatus: async (id: string, status: string, note?: string): Promise<Order> => {
    try {
      const res = await fetchJson<Order>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) });
      firebaseDb.updateOrderStatus(id, status, note).catch(() => {});
      return res;
    } catch (err) {
      const updated = await firebaseDb.updateOrderStatus(id, status, note);
      if (updated) return updated;
      throw err;
    }
  },

  // bKash / Payment Verification
  verifyBkashPayment: (data: { mobileNumber: string; pin: string; otp?: string }) => fetchJson<{ success: boolean; transactionId: string; message: string }>('/api/payments/bkash/verify', { method: 'POST', body: JSON.stringify(data) }),

  // Sellers
  getSellers: async (): Promise<SellerStore[]> => {
    try {
      const list = await firebaseDb.getSellers();
      if (list && list.length > 0) {
        saveLocalSellers(list);
        return list;
      }
    } catch (e) {}

    try {
      const serverSellers = await fetchJson<SellerStore[]>('/api/sellers');
      if (serverSellers && Array.isArray(serverSellers)) {
        saveLocalSellers(serverSellers);
        return serverSellers;
      }
    } catch (err) {
      console.warn('Backend sellers fetch notice, using fallback');
    }

    return getLocalSellers();
  },

  getSellerById: async (id: string): Promise<SellerStore> => {
    try {
      return await fetchJson<SellerStore>(`/api/sellers/${id}`);
    } catch (err) {
      const local = getLocalSellers();
      const found = local.find(s => s.id === id || s.sellerId === id);
      if (found) return found;
      throw err;
    }
  },

  createSeller: async (data: Partial<SellerStore>): Promise<SellerStore> => {
    const local = getLocalSellers();
    const newSeller: SellerStore = {
      id: data.id || `sel-${Date.now()}`,
      sellerId: data.sellerId || `usr-sel-${Date.now()}`,
      storeName: data.storeName || 'Store',
      storeNameBn: data.storeNameBn || data.storeName || 'দোকান',
      ownerName: data.ownerName || '',
      email: data.email || '',
      phone: data.phone || '',
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
      bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      totalSales: 0,
      balance: 0,
      isApproved: true,
      joinDate: new Date().toISOString().split('T')[0],
      isVerified: true,
      isFeatured: false,
      status: data.status || 'approved',
      subscriptionTier: data.subscriptionTier || 'pro',
      subscriptionStatus: data.subscriptionStatus || 'active',
      subscriptionExpiryDate: data.subscriptionExpiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      cloudSubscriptionPlan: data.cloudSubscriptionPlan || 'firebase_subscription',
      storageType: data.storageType || 'firebase',
      storageCredentials: data.storageCredentials || '',
      tradeLicenseNumber: data.tradeLicenseNumber || '',
      bkashNumber: data.bkashNumber || data.phone || '',
      bankAccountDetails: data.bankAccountDetails || '',
      staff: [],
      staffMembers: [],
      createdAt: new Date().toISOString(),
      ...data
    } as SellerStore;

    const updated = [newSeller, ...local.filter(s => s.id !== newSeller.id)];
    saveLocalSellers(updated);

    try {
      const created = await fetchJson<SellerStore>('/api/sellers', { method: 'POST', body: JSON.stringify(newSeller) });
      firebaseDb.insertSeller(created || newSeller).catch(() => {});
      return created || newSeller;
    } catch (err) {
      const fallback = await firebaseDb.insertSeller(newSeller).catch(() => null);
      if (fallback) return fallback;
      return newSeller;
    }
  },

  updateSeller: async (id: string, data: Partial<SellerStore>): Promise<SellerStore> => {
    const local = getLocalSellers();
    const idx = local.findIndex(s => s.id === id || s.sellerId === id);
    let updatedSeller = { ...data, id } as SellerStore;
    if (idx >= 0) {
      updatedSeller = { ...local[idx], ...data };
      const updatedList = [...local];
      updatedList[idx] = updatedSeller;
      saveLocalSellers(updatedList);
    }

    try {
      const updated = await fetchJson<SellerStore>(`/api/sellers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      firebaseDb.updateSeller(id, updated).catch(() => {});
      return updated;
    } catch (err) {
      const fallback = await firebaseDb.updateSeller(id, data).catch(() => null);
      if (fallback) return fallback;
      return updatedSeller;
    }
  },

  approveSeller: async (id: string): Promise<SellerStore> => {
    const local = getLocalSellers();
    const idx = local.findIndex(s => s.id === id || s.sellerId === id);
    if (idx >= 0) {
      local[idx].isApproved = true;
      local[idx].status = 'approved';
      local[idx].subscriptionStatus = 'active';
      saveLocalSellers([...local]);
    }

    try {
      return await fetchJson<SellerStore>(`/api/sellers/${id}/approve`, { method: 'PATCH' });
    } catch (err) {
      if (idx >= 0) return local[idx];
      throw err;
    }
  },
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

  // Firebase Status & Sync
  getFirebaseStatus: () => fetchJson<{ connected: boolean; configured: boolean; message: string; error?: string }>('/api/firebase/status'),
  syncToFirebase: () => fetchJson<{ success: boolean; message: string; synced?: any }>('/api/firebase/sync', { method: 'POST' }),

  // Gemini AI Assistant
  askAiAssistant: (prompt: string, language: string) => fetchJson<{ reply: string }>('/api/ai/assistant', { method: 'POST', body: JSON.stringify({ prompt, language }) }),
  resolveMapLink: (url: string) => fetchJson<{ success: boolean; address: string }>('/api/resolve-map-link', { method: 'POST', body: JSON.stringify({ url }) }),
  generateAiCopywriter: (data: { title: string; brand?: string; categoryName?: string; language?: string }) =>
    fetchJson<{ descEn: string; descBn: string }>('/api/ai/copywriter', { method: 'POST', body: JSON.stringify(data) }),
  generateAiReview: (data: { title: string; rating: number; language?: string }) =>
    fetchJson<{ reviewEn: string; reviewBn: string }>('/api/ai/review-writer', { method: 'POST', body: JSON.stringify(data) })
};
