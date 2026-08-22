import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, Order, SellerStore, User, SystemSettings } from '../types';

// Read configuration from environment variables or custom local storage override
const envMeta = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const envUrl: string = envMeta.VITE_SUPABASE_URL || '';
const envKey: string = envMeta.VITE_SUPABASE_ANON_KEY || '';

// Stored manual configuration if user sets it via UI
function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  try {
    const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('amarbazar_supabase_url') : null;
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem('amarbazar_supabase_key') : null;
    return {
      url: savedUrl || envUrl || '',
      anonKey: savedKey || envKey || ''
    };
  } catch {
    return { url: envUrl, anonKey: envKey };
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  
  const { url, anonKey } = getStoredSupabaseConfig();
  if (url && anonKey && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
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
    if (url && anonKey && url.startsWith('http')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('amarbazar_supabase_url', url.trim());
        localStorage.setItem('amarbazar_supabase_key', anonKey.trim());
      }
      supabaseInstance = createClient(url.trim(), anonKey.trim(), {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      return true;
    }
  } catch (err) {
    console.error('Error saving Supabase config:', err);
  }
  return false;
}

export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  const sb = getSupabase();
  if (!sb) {
    return { 
      connected: false, 
      message: 'Supabase URL ও Anon Key এখনও কনফিগার করা হয়নি। (Supabase credentials not configured yet)' 
    };
  }
  try {
    const { error } = await sb.from('products').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Supabase ডাটাবেজ সফলভাবে সংযুক্ত হয়েছে! (Connected)' };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Supabase Connection failed' };
  }
}

// Supabase Database Wrapper matching AmarBazar data schema
export const supabaseDb = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const sb = getSupabase();
    if (!sb) return [];
    try {
      const { data, error } = await sb.from('products').select('*');
      if (error || !data) return [];
      return data as Product[];
    } catch (err) {
      console.warn('Supabase getProducts notice:', err);
      return [];
    }
  },

  async insertProduct(product: Product): Promise<Product> {
    const sb = getSupabase();
    if (!sb) return product;
    try {
      await sb.from('products').upsert(product, { onConflict: 'id' });
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
      const { data, error } = await sb.from('products').update(updates).eq('id', id).select().single();
      if (error || !data) return { ...updates, id } as Product;
      return data as Product;
    } catch (err) {
      console.warn('Supabase updateProduct notice:', err);
      return { ...updates, id } as Product;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;
    try {
      await sb.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteProduct notice:', err);
    }
  },

  subscribeToProducts(callback: (products: Product[], event?: any) => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('realtime:products')
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
      if (error || !data) return [];
      return data as SellerStore[];
    } catch (err) {
      console.warn('Supabase getSellers notice:', err);
      return [];
    }
  },

  async insertSeller(seller: SellerStore): Promise<SellerStore> {
    const sb = getSupabase();
    if (!sb) return seller;
    try {
      await sb.from('sellers').upsert(seller, { onConflict: 'id' });
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
      const { data, error } = await sb.from('sellers').update(updates).eq('id', id).select().single();
      if (error || !data) return { ...updates, id } as SellerStore;
      return data as SellerStore;
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
        .channel('realtime:sellers')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sellers' }, async () => {
          const list = await this.getSellers();
          if (list && list.length > 0) callback(list);
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
      if (error || !data) return [];
      return data as Category[];
    } catch (err) {
      console.warn('Supabase getCategories notice:', err);
      return [];
    }
  },

  async insertCategory(category: Category): Promise<Category> {
    const sb = getSupabase();
    if (!sb) return category;
    try {
      await sb.from('categories').upsert(category, { onConflict: 'id' });
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
      await sb.from('categories').update(updates).eq('id', id);
    } catch (err) {
      console.warn('Supabase updateCategory notice:', err);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;
    try {
      await sb.from('categories').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteCategory notice:', err);
    }
  },

  subscribeToCategories(callback: (categories: Category[]) => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('realtime:categories')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
          const cats = await this.getCategories();
          if (cats && cats.length > 0) callback(cats);
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
      const { data, error } = await sb.from('orders').select('*');
      if (error || !data) return [];
      return data as Order[];
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
      await sb.from('orders').upsert(fullOrder, { onConflict: 'id' });
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
        trackingStatus: status === 'delivered' ? 'Delivered' : status === 'shipped' ? 'Handed to Courier' : 'Order Processing'
      };
      if (note) updates.adminNote = note;
      const { data, error } = await sb.from('orders').update(updates).eq('id', id).select().single();
      if (error || !data) return null;
      return data as Order;
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
        .channel('realtime:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
          const list = await this.getOrders();
          if (list && list.length > 0) callback(list);
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
      await sb.from('users').upsert(user, { onConflict: 'id' });
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
      await sb.from('settings').upsert({ id: 'general', ...settings }, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase saveSettings notice:', err);
    }
  },

  subscribeToSettings(callback: (settings: SystemSettings) => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    try {
      const channel = sb
        .channel('realtime:settings')
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
