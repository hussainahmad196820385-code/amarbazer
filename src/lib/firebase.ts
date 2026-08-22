import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Category, Order, SellerStore, User, SystemSettings } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/* Connect to default or specified Firestore database */
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Test server connection as specified in the skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is currently offline or connecting...');
    }
    return false;
  }
}

// Immediately test connection in background
testFirestoreConnection().catch(() => {});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// Clean helper database interface for AmarBazar components
export const firebaseDb = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const path = 'products';
    try {
      const snap = await getDocs(collection(db, path));
      const list: Product[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        list.push({ ...d, id: docSnap.id } as Product);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async insertProduct(product: Product): Promise<Product> {
    const path = `products/${product.id}`;
    try {
      await setDoc(doc(db, 'products', product.id), product);
      // If it was in deleted_products, clean it up
      try {
        await deleteDoc(doc(db, 'deleted_products', product.id));
      } catch {}
      return product;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return product;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      await setDoc(docRef, updates, { merge: true });
      // If it was in deleted_products, clean it up
      try {
        await deleteDoc(doc(db, 'deleted_products', id));
      } catch {}
      const snap = await getDoc(docRef);
      return { ...snap.data(), id } as Product;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return { ...updates, id } as Product;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const path = `products/${id}`;
    try {
      // 1. Delete actual product document
      await deleteDoc(doc(db, 'products', id));
      // 2. Mark in deleted_products collection so ALL connected devices instantly sync this deletion
      await setDoc(doc(db, 'deleted_products', id), {
        id,
        deletedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  async getDeletedProductIds(): Promise<string[]> {
    const path = 'deleted_products';
    try {
      const snap = await getDocs(collection(db, path));
      const ids: string[] = [];
      snap.forEach(docSnap => {
        ids.push(docSnap.id);
      });
      return ids;
    } catch (err) {
      return [];
    }
  },

  subscribeToDeletedProducts(callback: (deletedIds: string[]) => void): Unsubscribe {
    const path = 'deleted_products';
    try {
      return onSnapshot(
        collection(db, path),
        (snap) => {
          const ids: string[] = [];
          snap.forEach(docSnap => {
            ids.push(docSnap.id);
          });
          callback(ids);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  },

  subscribeToProducts(callback: (products: Product[]) => void): Unsubscribe {
    const path = 'products';
    try {
      return onSnapshot(
        collection(db, path),
        (snap) => {
          const prods: Product[] = [];
          snap.forEach(docSnap => {
            prods.push({ ...docSnap.data(), id: docSnap.id } as Product);
          });
          callback(prods);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  },

  // SELLERS
  async getSellers(): Promise<SellerStore[]> {
    const path = 'sellers';
    try {
      const snap = await getDocs(collection(db, path));
      const list: SellerStore[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as SellerStore);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async insertSeller(seller: SellerStore): Promise<SellerStore> {
    const path = `sellers/${seller.id}`;
    try {
      await setDoc(doc(db, 'sellers', seller.id), seller);
      return seller;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return seller;
    }
  },

  async updateSeller(id: string, updates: Partial<SellerStore>): Promise<SellerStore> {
    const path = `sellers/${id}`;
    try {
      const docRef = doc(db, 'sellers', id);
      await setDoc(docRef, updates, { merge: true });
      const snap = await getDoc(docRef);
      return { ...snap.data(), id } as SellerStore;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return { ...updates, id } as SellerStore;
    }
  },

  subscribeToSellers(callback: (sellers: SellerStore[]) => void): Unsubscribe {
    const path = 'sellers';
    try {
      return onSnapshot(
        collection(db, path),
        (snap) => {
          const sellers: SellerStore[] = [];
          snap.forEach(docSnap => {
            sellers.push({ ...docSnap.data(), id: docSnap.id } as SellerStore);
          });
          callback(sellers);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const path = 'categories';
    try {
      const snap = await getDocs(collection(db, path));
      const list: Category[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Category);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async insertCategory(category: Category): Promise<Category> {
    const path = `categories/${category.id}`;
    try {
      await setDoc(doc(db, 'categories', category.id), category);
      try {
        await deleteDoc(doc(db, 'deleted_categories', category.id));
      } catch {}
      return category;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return category;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const path = `categories/${id}`;
    try {
      await updateDoc(doc(db, 'categories', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
      await setDoc(doc(db, 'deleted_categories', id), {
        id,
        deletedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  subscribeToCategories(callback: (categories: Category[]) => void): Unsubscribe {
    const path = 'categories';
    try {
      return onSnapshot(
        collection(db, path),
        (snap) => {
          const list: Category[] = [];
          snap.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Category);
          });
          callback(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    const path = 'orders';
    try {
      const snap = await getDocs(collection(db, path));
      const list: Order[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Order);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async insertOrder(order: Partial<Order>): Promise<Order> {
    const id = order.id || `ord-${Date.now()}`;
    const fullOrder = { ...order, id } as Order;
    const path = `orders/${id}`;
    try {
      await setDoc(doc(db, 'orders', id), fullOrder);
      return fullOrder;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return fullOrder;
    }
  },

  async deleteOrder(id: string): Promise<void> {
    const path = `orders/${id}`;
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  subscribeToOrders(callback: (orders: Order[]) => void): Unsubscribe {
    const path = 'orders';
    try {
      return onSnapshot(
        collection(db, path),
        (snap) => {
          const list: Order[] = [];
          snap.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Order);
          });
          callback(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order | null> {
    const path = `orders/${id}`;
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { 
        status, 
        trackingStatus: status === 'delivered' ? 'Delivered' : status === 'shipped' ? 'Handed to Courier' : 'Order Processing',
        ...(note ? { adminNote: note } : {}) 
      });
      const snap = await getDoc(docRef);
      return { ...snap.data(), id } as Order;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return null;
    }
  },

  // USERS
  async insertUser(user: User): Promise<User> {
    const path = `users/${user.id}`;
    try {
      await setDoc(doc(db, 'users', user.id), user);
      return user;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return user;
    }
  },

  // SETTINGS
  async getSettings(): Promise<SystemSettings | null> {
    const path = 'settings/general';
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        return snap.data() as SystemSettings;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  },

  async saveSettings(settings: Partial<SystemSettings>): Promise<void> {
    const path = 'settings/general';
    try {
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  subscribeToSettings(callback: (settings: SystemSettings) => void): Unsubscribe {
    const path = 'settings/general';
    try {
      return onSnapshot(
        doc(db, 'settings', 'general'),
        (snap) => {
          if (snap.exists()) {
            callback(snap.data() as SystemSettings);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  }
};
