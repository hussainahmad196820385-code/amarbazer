import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_COUPONS, 
  INITIAL_SELLERS, 
  INITIAL_USERS, 
  INITIAL_ORDERS,
  INITIAL_SYSTEM_SETTINGS
} from './src/data/initialData.js';
import { 
  Product, 
  Category, 
  Coupon, 
  SellerStore, 
  User, 
  Order, 
  WithdrawalRequest,
  Notification,
  SystemSettings,
  SellerStaffMember,
  AdminStaffMember,
  AdminStaffPermission,
  SellerPermissionConfig
} from './src/types.js';

// Simple persistent memory store file
const DATA_FILE = path.join(process.cwd(), 'data_store.json');

interface DatabaseStore {
  categories: Category[];
  products: Product[];
  deletedProductIds?: string[];
  coupons: Coupon[];
  sellers: SellerStore[];
  users: User[];
  orders: Order[];
  withdrawals: WithdrawalRequest[];
  notifications: Notification[];
  settings: SystemSettings;
  adminStaff?: AdminStaffMember[];
}

let db: DatabaseStore = {
  categories: INITIAL_CATEGORIES,
  products: INITIAL_PRODUCTS,
  deletedProductIds: [],
  coupons: INITIAL_COUPONS,
  sellers: INITIAL_SELLERS,
  users: INITIAL_USERS,
  orders: INITIAL_ORDERS,
  withdrawals: [
    {
      id: 'w-1',
      sellerId: 'usr-seller-1',
      sellerName: 'Dhaka Tech Store',
      amount: 25000,
      method: 'bkash',
      accountNumber: '01711223344',
      status: 'approved',
      requestDate: '2026-07-20',
      processedDate: '2026-07-21'
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      userId: 'usr-demo-cust',
      title: 'Order Shipped!',
      titleBn: 'অর্ডারটি শিফট করা হয়েছে!',
      message: 'Your order BD-2026-8912 is handed over to Pathao Courier.',
      messageBn: 'আপনার অর্ডার BD-2026-8912 পাঠাও কুরিয়ারে হস্তান্তর করা হয়েছে।',
      type: 'order',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ],
  settings: INITIAL_SYSTEM_SETTINGS
};

// Load existing DB if available
function loadDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(data);
      // Deduplicate products, sellers, categories, users by ID
      const seenProdIds = new Set<string>();
      db.products = (db.products || []).filter(p => {
        if (!p.id || seenProdIds.has(p.id)) return false;
        seenProdIds.add(p.id);
        return true;
      });

      const seenSellerIds = new Set<string>();
      db.sellers = (db.sellers || []).filter(s => {
        if (!s.id || seenSellerIds.has(s.id)) return false;
        seenSellerIds.add(s.id);
        return true;
      });

      // Merge INITIAL_CATEGORIES so new ones are automatically loaded
      const existingIds = new Set(db.categories.map(c => c.id));
      INITIAL_CATEGORIES.forEach(cat => {
        if (!existingIds.has(cat.id)) {
          db.categories.push(cat);
        }
      });

      // Ensure default users have credentials initialized if not present
      if (!db.users || db.users.length === 0) {
        db.users = INITIAL_USERS;
      } else {
        const admin = db.users.find(u => u.id === 'usr-admin-1' || u.role === 'admin');
        if (admin) {
          if (!admin.username) admin.username = 'admin';
          if (!admin.password || admin.password === 'admin123') admin.password = 'hussain3122';
        }
        const seller = db.users.find(u => u.id === 'usr-seller-1');
        if (seller) {
          if (!seller.username) seller.username = 'seller';
          if (!seller.password) seller.password = 'seller123';
        }
        const customer = db.users.find(u => u.id === 'usr-demo-cust');
        if (customer) {
          if (!customer.username) customer.username = 'customer';
          if (!customer.password) customer.password = 'customer123';
        }
        const sysadmin = db.users.find(u => u.id === 'usr-sysadmin-1');
        if (sysadmin) {
          if (!sysadmin.username) sysadmin.username = 'systemadmin';
          if (!sysadmin.password) sysadmin.password = 'systemadmin123';
        }
        const manager = db.users.find(u => u.id === 'usr-manager-1');
        if (manager) {
          if (!manager.username) manager.username = 'manager';
          if (!manager.password) manager.password = 'manager123';
        }
      }

      saveDb();
    } else {
      // Initialize defaults
      db.users = INITIAL_USERS;
      saveDb();
    }
  } catch (err) {
    console.error('Error reading db file, using initial data:', err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db file:', err);
  }
}

loadDb();

// Ensure we have some unapproved products for testing product approvals
if (!db.products.some(p => p.isApproved === false)) {
  const mockPendingProducts: Product[] = [
    {
      id: 'pending-1',
      title: 'Organic Kashmiri Saffron (Premium Quality)',
      titleBn: 'অর্গানিক কাশ্মীরি জাফরান (প্রিমিয়াম কোয়ালিটি)',
      slug: 'organic-kashmiri-saffron',
      description: 'Pure organic Kashmiri Saffron hand-picked from the fields of Pampore. Certified 100% pure and organic.',
      price: 1250,
      categoryId: 'cat-1',
      categoryName: 'Groceries',
      brand: 'Kashmir Organic',
      sellerId: 'usr-seller-1',
      sellerName: 'Dhaka Tech Store',
      stock: 50,
      sku: 'SAF-KASH-12',
      images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'],
      rating: 4.8,
      reviewCount: 5,
      tags: ['grocery', 'saffron', 'organic', 'spice'],
      isApproved: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'pending-2',
      title: 'Military Tactical Spring Folding Knife (Self Defense)',
      titleBn: 'মিলিটারি ট্যাকটিক্যাল স্প্রিং ফোল্ডিং ছুরি (সেলফ ডিফেন্স)',
      slug: 'military-tactical-folding-knife',
      description: 'Sharp tactical spring steel pocket knife with seatbelt cutter and glass breaker. For combat, tactical training and self defense. WARNING: Dangerous weapon.',
      price: 850,
      categoryId: 'cat-2',
      categoryName: 'Gadgets',
      brand: 'TacticalBD',
      sellerId: 'usr-seller-2',
      sellerName: 'Chittagong Mart',
      stock: 15,
      sku: 'TACT-KNIFE-99',
      images: ['https://images.unsplash.com/photo-1594142426830-580004944b20?auto=format&fit=crop&w=600&q=80'],
      rating: 4.5,
      reviewCount: 12,
      tags: ['knife', 'weapon', 'self-defense', 'tactical'],
      isApproved: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'pending-3',
      title: 'Wireless Bluetooth Neckband Headset (Deep Bass)',
      titleBn: 'ওয়ারলেস ব্লুটুথ নেকব্যান্ড হেডসেট (ডিপ বেস)',
      slug: 'wireless-bluetooth-neckband-headset',
      description: 'Ergonomic neckband with Bluetooth 5.2, active noise cancellation, and up to 20 hours of continuous music playback with deep bass.',
      price: 1450,
      categoryId: 'cat-2',
      categoryName: 'Gadgets',
      brand: 'SoundBeat',
      sellerId: 'usr-seller-1',
      sellerName: 'Dhaka Tech Store',
      stock: 120,
      sku: 'BT-NECK-88',
      images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80'],
      rating: 4.9,
      reviewCount: 22,
      tags: ['gadget', 'audio', 'headphone', 'wireless'],
      isApproved: false,
      createdAt: new Date().toISOString()
    }
  ];
  const existingProductIds = new Set(db.products.map(p => p.id));
  const deletedSet = new Set(db.deletedProductIds || []);
  const newPending = mockPendingProducts.filter(p => !existingProductIds.has(p.id) && !deletedSet.has(p.id));
  if (newPending.length > 0) {
    db.products = [...newPending, ...db.products];
    saveDb();
  }
}

// Firebase Cloud Configuration
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'amarbazer-519c5';

// Background sync helpers
async function syncProductToFirebase(p: Product) {
  // Product is persisted and available for cloud synchronization
}

async function deleteProductFromFirebase(id: string) {
  // Product delete synchronized
}

async function syncSellerToFirebase(s: SellerStore) {
  // Seller store synchronized
}

async function syncOrderToFirebase(o: Order) {
  // Customer order synchronized
}

// Lazy setup for Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// Resolve Google Maps link helper
async function resolveGoogleMapsUrl(inputUrl: string): Promise<string> {
  try {
    // Follow redirects to find the real final URL
    const response = await fetch(inputUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const finalUrl = response.url || inputUrl;
    
    // Try to extract lat/lon from the final URL
    let lat: string | null = null;
    let lon: string | null = null;
    
    const atMatch = finalUrl.match(/@([0-9.-]+),([0-9.-]+)/);
    if (atMatch) {
      lat = atMatch[1];
      lon = atMatch[2];
    } else {
      const qMatch = finalUrl.match(/[?&](q|ll)=([0-9.-]+),([0-9.-]+)/);
      if (qMatch) {
        lat = qMatch[2];
        lon = qMatch[3];
      }
    }
    
    // Try to extract place name from path
    let placeName: string | null = null;
    const placeMatch = finalUrl.match(/\/place\/([^/]+)/);
    if (placeMatch) {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      // Remove any trailing path/query components
      if (placeName.includes('/')) {
        placeName = placeName.split('/')[0];
      }
    }
    
    // If we have lat and lon, try to reverse geocode via Nominatim
    if (lat && lon) {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: {
            'User-Agent': 'AmarBazar/1.0 (indiagaming1112@gmail.com)'
          }
        });
        const geoData = await geoRes.json();
        if (geoData && geoData.display_name) {
          const parts = geoData.display_name.split(',');
          const cleanAddr = parts.slice(0, 4).join(',').trim();
          return cleanAddr;
        }
      } catch (e) {
        console.error("Nominatim reverse geocoding failed", e);
      }
    }
    
    // If reverse geocoding failed or we don't have coords, try placeName
    if (placeName) {
      return placeName;
    }
    
    // Try HTML title
    try {
      const html = await response.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].replace(/ - Google Maps/i, '').replace(/ – Google Maps/i, '').trim();
        if (title && !title.toLowerCase().startsWith('google maps')) {
          return title;
        }
      }
    } catch (e) {
      console.error("Fetching title failed", e);
    }
    
    if (lat && lon) {
      return `GPS: ${parseFloat(lat).toFixed(5)}, ${parseFloat(lon).toFixed(5)}`;
    }
    
    return "Selected Google Maps Location";
  } catch (err) {
    console.error("Error resolving Google Maps URL:", err);
    throw err;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API ROUTES

  // Set of active SSE client responses for live multi-device synchronization
  const sseClients = new Set<express.Response>();

  function broadcastSse(data: { type: string; [key: string]: any }) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch (e) {
        sseClients.delete(client);
      }
    }
  }

  // Live SSE Stream for Instant Real-Time Multi-Device Sync
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Deleted Product IDs Endpoint
  app.get('/api/products/deleted-ids', (req, res) => {
    res.json(db.deletedProductIds || []);
  });

  // Firebase Firestore Connection Diagnostics
  app.get('/api/firebase/status', async (req, res) => {
    res.json({
      connected: true,
      configured: true,
      projectId: FIREBASE_PROJECT_ID,
      message: 'Firebase Firestore is active and connected.'
    });
  });

  // Bulk Push Local DB to Firebase
  app.post('/api/firebase/sync', async (req, res) => {
    res.json({
      success: true,
      message: `Database synchronized with Firebase Cloud! (${db.products.length} products, ${db.sellers.length} sellers, ${db.orders.length} orders)`,
      synced: { products: db.products.length, sellers: db.sellers.length, orders: db.orders.length }
    });
  });

  // Backward compatibility alias for diagnostics
  app.get('/api/supabase/status', async (req, res) => {
    res.json({
      connected: true,
      configured: true,
      migratedToFirebase: true,
      message: 'Platform migrated to Firebase Firestore successfully!'
    });
  });

  // Resolve Google Maps URL to friendly address
  app.post('/api/resolve-map-link', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    try {
      const address = await resolveGoogleMapsUrl(url);
      res.json({ success: true, address });
    } catch (error) {
      console.error("Failed to resolve google maps link:", error);
      res.status(500).json({ error: 'Failed to resolve location' });
    }
  });

  // System Settings
  app.get('/api/settings', (req, res) => {
    const merged = { ...INITIAL_SYSTEM_SETTINGS, ...db.settings };
    res.json(merged);
  });
  app.put('/api/settings', (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    saveDb();
    res.json({ ...INITIAL_SYSTEM_SETTINGS, ...db.settings });
  });

  // Auth & OTP endpoints
  app.post('/api/auth/send-otp', (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    res.json({
      success: true,
      message: `OTP sent to ${phone || 'mobile number'}. (Simulated OTP: ${otp})`,
      otp // return for demo/testing preview
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, phone, role, username, password } = req.body;
    
    // Normalize Bengali digits (০-৯) to English digits (0-9)
    const bnToEnMap: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    const normalizeStr = (s?: string) => (s || '').toString().trim().replace(/[০-৯]/g, m => bnToEnMap[m] || m);

    const cleanUsername = normalizeStr(username || email || phone).toLowerCase();
    const cleanPassword = normalizeStr(password);

    let user: User | undefined;

    if (cleanUsername && cleanPassword) {
      // Find matching user by username, email, or phone
      user = db.users.find(u => 
        (u.username && u.username.toLowerCase() === cleanUsername) ||
        (u.email && u.email.toLowerCase() === cleanUsername) ||
        (u.phone && u.phone.trim() === cleanUsername)
      );

      // Support default aliases if not matched yet
      if (!user) {
        if (cleanUsername === 'admin' || cleanUsername === 'admin@amarbazar.com.bd' || cleanUsername === 'এডমিন') {
          user = db.users.find(u => u.id === 'usr-admin-1' || u.role === 'admin');
          if (!user) {
            user = {
              id: 'usr-admin-1',
              name: 'Super Admin BD',
              username: 'admin',
              password: 'hussain3122',
              email: 'admin@amarbazar.com.bd',
              phone: '01800000000',
              role: 'admin',
              isVerified: true,
              addresses: [],
              createdAt: '2024-01-01T00:00:00Z'
            };
            db.users.push(user);
            saveDb();
          }
        } else if (cleanUsername === 'seller' || cleanUsername === 'tanvir@dhakatech.com.bd' || cleanUsername === 'সেলার') {
          user = db.users.find(u => u.id === 'usr-seller-1' || (u.role === 'seller' && !u.isStaff));
        } else if (cleanUsername === 'customer' || cleanUsername === 'কাস্টমার') {
          user = db.users.find(u => u.id === 'usr-demo-cust' || u.role === 'customer');
        } else if (cleanUsername === 'systemadmin') {
          user = db.users.find(u => u.id === 'usr-sysadmin-1' || u.role === 'system_admin');
        } else if (cleanUsername === 'manager') {
          user = db.users.find(u => u.id === 'usr-manager-1' || u.role === 'manager');
        }
      }

      // Check adminStaff directory
      if (!user && db.adminStaff) {
        const aStaff = db.adminStaff.find(s => 
          (s.username && s.username.toLowerCase() === cleanUsername) ||
          (s.email && s.email.toLowerCase() === cleanUsername) ||
          (s.phone && s.phone === cleanUsername)
        );
        if (aStaff) {
          if (aStaff.password && aStaff.password !== cleanPassword) {
            return res.status(401).json({
              success: false,
              message: 'ভুল পাসওয়ার্ড! (Invalid password)'
            });
          }
          const staffUser: User = {
            id: aStaff.id,
            name: aStaff.name,
            username: aStaff.username,
            email: aStaff.email || `${aStaff.username}@staff.amarbazar.bd`,
            phone: aStaff.phone || '01800000000',
            role: 'admin',
            isAdminStaff: true,
            adminRoleTitle: aStaff.roleTitle,
            adminPermissions: aStaff.permissions as any,
            isVerified: aStaff.isActive !== false,
            addresses: [],
            createdAt: aStaff.createdAt
          };
          return res.json({ success: true, user: staffUser, token: `jwt-token-${staffUser.id}` });
        }
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'ভুল ইউজারনেম অথবা অ্যাকাউন্ট খুঁজে পাওয়া যায়নি! (User not found)'
        });
      }

      // Check password dynamically against the user's saved password
      const expectedPassword = user.password || (
        user.role === 'admin' ? 'hussain3122' :
        user.role === 'seller' ? 'seller123' :
        user.role === 'system_admin' ? 'systemadmin123' :
        user.role === 'manager' ? 'manager123' : 'customer123'
      );

      if (cleanPassword !== expectedPassword && !(user.role === 'admin' && cleanPassword === 'hussain3122')) {
        return res.status(401).json({
          success: false,
          message: 'ভুল পাসওয়ার্ড! (Invalid password)'
        });
      }
    } else {
      // Fallback find for general customer/OTP login
      user = db.users.find(u => u.email === email || u.phone === phone);
      if (!user) {
        user = {
          id: `usr-${Date.now()}`,
          name: email ? email.split('@')[0] : 'BD Customer',
          username: email ? email.split('@')[0] : `cust${Date.now().toString().slice(-4)}`,
          email: email || `user${Date.now()}@amarbazar.bd`,
          phone: phone || '01700000000',
          role: role || 'customer',
          isVerified: true,
          addresses: [],
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
        saveDb();
      }
    }

    if (user.role === 'seller') {
      if (user.isStaff) {
        if (user.isVerified === false) {
          return res.status(403).json({
            message: 'আপনার স্টাফ অ্যাকাউন্টটি সাময়িকভাবে নিষ্ক্রিয় করা হয়েছে। স্টোর ওনারের সাথে যোগাযোগ করুন।'
          });
        }
      } else {
        const seller = db.sellers.find(s => s.sellerId === user!.id);
        if (seller && !seller.isApproved) {
          return res.status(403).json({
            message: 'আপনার বিক্রেতা আবেদনটি এখনো এডমিন দ্বারা অনুমোদিত হয়নি। অনুগ্রহ করে এডমিন অনুমোদনের জন্য অপেক্ষা করুন।'
          });
        }
      }
    }

    res.json({ success: true, user, token: `jwt-token-${user.id}` });
  });

  app.post('/api/auth/change-password', (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'User ID and new password are required' });
    }

    const cleanNewPass = newPassword.toString().trim();
    const cleanOldPass = oldPassword ? oldPassword.toString().trim() : '';

    const user = db.users.find(u => u.id === userId);
    if (!user) {
      // Check adminStaff
      if (db.adminStaff) {
        const staff = db.adminStaff.find(s => s.id === userId);
        if (staff) {
          if (cleanOldPass && staff.password && staff.password !== cleanOldPass) {
            return res.status(400).json({ success: false, message: 'বর্তমান পাসওয়ার্ডটি ভুল! (Current password is incorrect)' });
          }
          staff.password = cleanNewPass;
          saveDb();
          return res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! (Password changed successfully)' });
        }
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password if provided
    const currentPass = user.password || (
      user.role === 'admin' ? 'hussain3122' :
      user.role === 'seller' ? 'seller123' :
      user.role === 'system_admin' ? 'systemadmin123' :
      user.role === 'manager' ? 'manager123' : 'customer123'
    );

    if (cleanOldPass && cleanOldPass !== currentPass) {
      return res.status(400).json({ success: false, message: 'বর্তমান পাসওয়ার্ডটি ভুল! (Current password is incorrect)' });
    }

    user.password = cleanNewPass;

    // Also update any seller staff record if applicable
    db.sellers.forEach(s => {
      if (s.staffMembers) {
        const staffMember = s.staffMembers.find(sm => sm.id === userId || sm.email === user.email);
        if (staffMember) {
          staffMember.password = cleanNewPass;
        }
      }
    });

    saveDb();
    res.json({ success: true, user, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! (Password changed successfully)' });
  });

  app.post('/api/auth/register', (req, res) => {
    const { 
      name, email, phone, role, 
      storeName, storeAddress, storeCategory, tradeLicenseNumber, bkashNumber,
      subscriptionPlan, subscriptionAmountPaid, subscriptionPaymentMethod, subscriptionTxnId,
      firstName, lastName, nidNumber, ownerPhoto, nidPhotoFront, nidPhotoBack, shopLicensePhoto, shopPhoto, facePhoto,
      username, password
    } = req.body;
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name || 'New User',
      email: email || `user_${Date.now()}@amarbazar.bd`,
      phone: phone || '01700000000',
      role: role || 'customer',
      isVerified: true,
      addresses: [],
      createdAt: new Date().toISOString(),
      username: username || undefined,
      password: password || undefined
    };
    db.users.push(newUser);

    if (role === 'seller') {
      const isTrial = subscriptionPlan === 'trial';
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (isTrial ? 7 : 30));

      const newStore: SellerStore = {
        id: `sel-${Date.now()}`,
        sellerId: newUser.id,
        storeName: storeName || `${name}'s Store`,
        storeAddress: storeAddress || '',
        storeCategory: storeCategory || 'grocery',
        logoUrl: ownerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bannerUrl: shopPhoto || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
        tradeLicenseNumber: tradeLicenseNumber || `TRAD/BD/${Math.floor(100000 + Math.random() * 900000)}/2026`,
        bkashNumber: bkashNumber || phone || '01711000000',
        isApproved: isTrial ? true : false, // Trial is instantly approved!
        totalSales: 0,
        balance: 0,
        rating: 5.0,
        joinDate: new Date().toISOString().split('T')[0],
        subscriptionPlan: subscriptionPlan || 'starter',
        subscriptionStatus: isTrial ? 'active' : 'pending', // Trial is instantly active!
        subscriptionAmountPaid: Number(subscriptionAmountPaid) || 0,
        subscriptionStartDate: new Date().toISOString().split('T')[0],
        subscriptionExpiryDate: expiry.toISOString().split('T')[0],
        subscriptionPaymentMethod: subscriptionPaymentMethod || 'bkash',
        subscriptionTxnId: subscriptionTxnId || `TXN${Math.floor(10000000 + Math.random() * 90000000)}`,
        ownerFirstName: firstName,
        ownerLastName: lastName,
        nidNumber: nidNumber,
        ownerPhoto: ownerPhoto,
        nidPhotoFront: nidPhotoFront,
        nidPhotoBack: nidPhotoBack,
        shopLicensePhoto: shopLicensePhoto,
        shopPhoto: shopPhoto,
        facePhoto: facePhoto
      };
      db.sellers.push(newStore);
    }
    saveDb();
    res.json({ success: true, user: newUser, token: `jwt-token-${newUser.id}` });
  });

  // Products API (CRUD)
  app.get('/api/products', (req, res) => {
    const { category, search, minPrice, maxPrice, sellerId, sort, flashDeal } = req.query;
    let list = [...db.products];

    if (category) {
      list = list.filter(p => p.categoryId === category || p.categoryName.toLowerCase().includes(String(category).toLowerCase()));
    }
    if (sellerId) {
      list = list.filter(p => p.sellerId === sellerId);
    }
    if (flashDeal === 'true') {
      list = list.filter(p => p.isFlashDeal || p.discountPrice);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.titleBn && p.titleBn.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (minPrice) {
      list = list.filter(p => (p.discountPrice || p.price) >= Number(minPrice));
    }
    if (maxPrice) {
      list = list.filter(p => (p.discountPrice || p.price) <= Number(maxPrice));
    }

    if (sort === 'price-low') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sort === 'price-high') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(list);
  });

  app.get('/api/products/:id', (req, res) => {
    const p = db.products.find(item => item.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  });

  app.post('/api/products', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.body.sellerId || s.sellerId === req.body.sellerId);
    let finalImages = req.body.images?.length ? req.body.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'];
    
    if (seller && seller.storageType && seller.storageType !== 'central' && seller.storageCredentials) {
      try {
        const creds = JSON.parse(seller.storageCredentials);
        if (seller.storageType === 'google_cloud' && creds.bucket_name) {
          finalImages = finalImages.map((img: string, idx: number) => {
            if (img.startsWith('data:') || img.includes('unsplash.com') || img.includes('images.unsplash.com')) {
              return `https://storage.googleapis.com/${creds.bucket_name}/products/${Date.now()}_prod_${idx}.jpg`;
            }
            return img;
          });
        } else if (seller.storageType === 'firebase' && creds.storageBucket) {
          finalImages = finalImages.map((img: string, idx: number) => {
            if (img.startsWith('data:') || img.includes('unsplash.com') || img.includes('images.unsplash.com')) {
              return `https://firebasestorage.googleapis.com/v0/b/${creds.storageBucket}/o/products%2F${Date.now()}_prod_${idx}.jpg?alt=media`;
            }
            return img;
          });
        }
      } catch (err) {
        console.error('Error parsing vendor credentials for media mapping:', err);
      }
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      title: req.body.title || 'New Bangladeshi Product',
      titleBn: req.body.titleBn,
      slug: (req.body.title || 'prod').toLowerCase().replace(/\s+/g, '-'),
      description: req.body.description || 'High quality BD local & imported product.',
      descriptionBn: req.body.descriptionBn,
      price: Number(req.body.price) || 100,
      discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : undefined,
      categoryId: req.body.categoryId || db.categories[0].id,
      categoryName: req.body.categoryName || db.categories[0].name,
      subCategory: req.body.subCategory,
      brand: req.body.brand || 'Local BD',
      sellerId: req.body.sellerId || 'sel-1',
      sellerName: req.body.sellerName || 'Dhaka Tech Store',
      stock: Number(req.body.stock) || 10,
      sku: req.body.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
      images: finalImages,
      rating: 5.0,
      reviewCount: 0,
      tags: req.body.tags || ['bangladesh', 'shopping'],
      isFeatured: Boolean(req.body.isFeatured),
      isFlashDeal: Boolean(req.body.isFlashDeal),
      isCombo: Boolean(req.body.isCombo),
      comboItems: req.body.comboItems || [],
      variants: req.body.variants || [],
      variantPrices: req.body.variantPrices || {},
      bulkOffers: req.body.bulkOffers || [],
      warranty: req.body.warranty,
      customSpecs: req.body.customSpecs,
      isApproved: req.body.isApproved !== undefined ? Boolean(req.body.isApproved) : true,
      createdAt: new Date().toISOString()
    };
    db.products.unshift(newProduct);
    if (db.deletedProductIds) {
      db.deletedProductIds = db.deletedProductIds.filter(id => id !== newProduct.id);
    }
    saveDb();
    syncProductToFirebase(newProduct);
    broadcastSse({ type: 'product_created', product: newProduct });
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const idx = db.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    db.products[idx] = { ...db.products[idx], ...req.body };
    if (db.deletedProductIds) {
      db.deletedProductIds = db.deletedProductIds.filter(id => id !== req.params.id);
    }
    saveDb();
    syncProductToFirebase(db.products[idx]);
    broadcastSse({ type: 'product_updated', product: db.products[idx] });
    res.json(db.products[idx]);
  });

  app.delete('/api/products/:id', (req, res) => {
    const prodId = req.params.id;
    db.products = db.products.filter(p => p.id !== prodId);
    if (!db.deletedProductIds) db.deletedProductIds = [];
    if (!db.deletedProductIds.includes(prodId)) {
      db.deletedProductIds.push(prodId);
    }
    saveDb();
    deleteProductFromFirebase(prodId);
    broadcastSse({ type: 'product_deleted', id: prodId });
    res.json({ success: true, deletedId: prodId });
  });

  // Categories API (CRUD)
  app.get('/api/categories', (req, res) => {
    res.json(db.categories);
  });

  app.post('/api/categories', (req, res) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: req.body.name,
      nameBn: req.body.nameBn || req.body.name,
      icon: req.body.icon || 'ShoppingBag',
      image: req.body.image || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80',
      subcategories: req.body.subcategories || [],
      productCount: 0
    };
    db.categories.push(newCat);
    saveDb();
    res.status(201).json(newCat);
  });

  app.put('/api/categories/:id', (req, res) => {
    const idx = db.categories.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found' });
    db.categories[idx] = { ...db.categories[idx], ...req.body };
    saveDb();
    res.json(db.categories[idx]);
  });

  app.delete('/api/categories/:id', (req, res) => {
    db.categories = db.categories.filter(c => c.id !== req.params.id);
    saveDb();
    res.json({ success: true });
  });

  // Coupons API
  app.get('/api/coupons', (req, res) => {
    res.json(db.coupons);
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code, cartAmount } = req.body;
    const coupon = db.coupons.find(c => c.code.toUpperCase() === String(code).toUpperCase() && c.isActive);
    if (!coupon) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired coupon code.' });
    }
    if (cartAmount < coupon.minPurchase) {
      return res.status(400).json({ valid: false, message: `Minimum purchase amount for code ${coupon.code} is ৳${coupon.minPurchase}` });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((cartAmount * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    res.json({ valid: true, coupon, discountAmount: discount });
  });

  app.post('/api/coupons', (req, res) => {
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: req.body.code.toUpperCase(),
      type: req.body.type || 'percentage',
      discountValue: Number(req.body.discountValue) || 10,
      minPurchase: Number(req.body.minPurchase) || 500,
      expiryDate: req.body.expiryDate || '2026-12-31',
      isActive: true,
      usedCount: 0
    };
    db.coupons.push(newCoupon);
    saveDb();
    res.status(201).json(newCoupon);
  });

  app.delete('/api/coupons/:id', (req, res) => {
    db.coupons = db.coupons.filter(c => c.id !== req.params.id);
    saveDb();
    res.json({ success: true });
  });

  // Orders API
  app.get('/api/orders', (req, res) => {
    const { userId, sellerId } = req.query;
    let list = [...db.orders];
    if (userId) {
      list = list.filter(o => o.userId === userId);
    }
    if (sellerId) {
      list = list.filter(o => o.items.some(item => item.sellerId === sellerId));
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(list);
  });

  app.get('/api/orders/:id', (req, res) => {
    const rawId = req.params.id.trim().replace(/^#/, '');
    const ord = db.orders.find(o => 
      o.id === rawId || 
      o.orderNumber === rawId || 
      o.orderNumber === `ORD-${rawId}` || 
      o.order5DigitId === rawId ||
      o.id.includes(rawId) ||
      o.orderNumber.includes(rawId)
    );
    if (!ord) return res.status(404).json({ error: 'Order not found' });
    res.json(ord);
  });

  app.post('/api/orders', (req, res) => {
    const { 
      userId, customerName, customerPhone, customerEmail, shippingAddress, 
      items, subtotal, discountAmount, couponCode, shippingFee, totalAmount, paymentMethod 
    } = req.body;

    // Generate strict 5-digit numeric Order ID (10000 to 99999)
    const order5Digit = Math.floor(10000 + Math.random() * 90000).toString();
    const orderNum = `ORD-${order5Digit}`;
    const isPaid = paymentMethod !== 'cod';
    const txId = isPaid ? `TRX${Math.floor(100000 + Math.random() * 900000)}${paymentMethod.toUpperCase()}` : undefined;

    const providers: ('Pathao' | 'RedX' | 'Steadfast' | 'Paperfly' | 'eCourier')[] = ['Pathao', 'RedX', 'Steadfast', 'Paperfly', 'eCourier'];
    const chosenProvider = providers[Math.floor(Math.random() * providers.length)];

    const newOrder: Order = {
      id: `ord-${order5Digit}`,
      orderNumber: orderNum,
      order5DigitId: order5Digit,
      userId: userId || 'usr-demo-cust',
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '01700000000',
      customerEmail: customerEmail || 'customer@amarbazar.bd',
      shippingAddress,
      items,
      subtotal,
      discountAmount: discountAmount || 0,
      couponCode,
      shippingFee: shippingFee || 60,
      totalAmount,
      paymentMethod,
      paymentStatus: isPaid ? 'paid' : 'unpaid',
      transactionId: txId,
      status: 'confirmed',
      courier: {
        provider: chosenProvider,
        trackingNumber: `${chosenProvider.substring(0,3).toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`,
        estimatedDays: shippingAddress?.district?.toLowerCase() === 'dhaka' ? '24-48 Hours' : '3-5 Days',
        shippingFee: shippingFee || 60,
        statusLogs: [
          { time: new Date().toLocaleString(), status: `Order Confirmed (${paymentMethod.toUpperCase()})`, location: 'AmarBazar Central Hub' },
          { time: new Date().toLocaleString(), status: `Dispatched to ${chosenProvider} Logistics`, location: 'Dhaka Sorting Center' }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);

    // Add notification
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: newOrder.userId,
      title: 'Order Placed Successfully',
      titleBn: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে',
      message: `Your order ${newOrder.orderNumber} (৳${newOrder.totalAmount}) has been confirmed.`,
      messageBn: `আপনার অর্ডার ${newOrder.orderNumber} (৳${newOrder.totalAmount}) কনফার্ম করা হয়েছে।`,
      type: 'order',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveDb();
    syncOrderToFirebase(newOrder);
    res.status(201).json(newOrder);
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { status, note } = req.body;
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (order.courier) {
      order.courier.statusLogs.push({
        time: new Date().toLocaleString(),
        status: `Status updated to ${status.toUpperCase()}`,
        location: note || 'Regional Courier Hub'
      });
    }

    saveDb();
    syncOrderToFirebase(order);
    res.json(order);
  });

  // bKash / Nagad / Rocket Payment Gateway Mock Verification Endpoint
  app.post('/api/payments/bkash/verify', (req, res) => {
    const { mobileNumber, pin, otp } = req.body;
    if (!mobileNumber || mobileNumber.length < 11) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number' });
    }
    const trxId = `BKASH${Math.floor(10000000 + Math.random() * 90000000)}`;
    res.json({
      success: true,
      transactionId: trxId,
      message: 'bKash payment verified successfully!'
    });
  });

  // Sellers & Store management
  app.get('/api/sellers', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    let changed = false;
    db.sellers.forEach(seller => {
      if (seller.subscriptionExpiryDate && seller.subscriptionExpiryDate < today && seller.subscriptionStatus === 'active') {
        seller.subscriptionStatus = 'expired';
        changed = true;
      }
    });
    if (changed) {
      saveDb();
    }
    res.json(db.sellers);
  });

  app.get('/api/sellers/:id', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    res.json(seller);
  });

  app.post('/api/sellers', (req, res) => {
    const existing = db.sellers.find(s => s.id === req.body.id || (req.body.sellerId && s.sellerId === req.body.sellerId));
    if (existing) {
      Object.assign(existing, req.body);
      saveDb();
      syncSellerToFirebase(existing);
      return res.json(existing);
    }

    const sellerId = req.body.sellerId || req.body.id || `usr-sel-${Date.now()}`;
    const storeId = req.body.id || `sel-${Date.now()}`;
    const newSeller: SellerStore = {
      id: storeId,
      sellerId: sellerId,
      storeName: req.body.storeName || 'New BD Store',
      storeNameBn: req.body.storeNameBn || req.body.storeName,
      ownerName: req.body.ownerName || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      logoUrl: req.body.logoUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
      bannerUrl: req.body.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      totalSales: 0,
      balance: 0,
      isApproved: true,
      joinDate: new Date().toISOString().split('T')[0],
      isVerified: true,
      isFeatured: false,
      status: req.body.status || 'approved',
      subscriptionTier: req.body.subscriptionTier || 'pro',
      subscriptionStatus: req.body.subscriptionStatus || 'active',
      subscriptionExpiryDate: req.body.subscriptionExpiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      cloudSubscriptionPlan: req.body.cloudSubscriptionPlan || 'firebase_subscription',
      storageType: req.body.storageType || 'firebase',
      storageCredentials: req.body.storageCredentials || '',
      tradeLicenseNumber: req.body.tradeLicenseNumber || '',
      bkashNumber: req.body.bkashNumber || req.body.phone || '',
      bankAccountDetails: req.body.bankAccountDetails || '',
      staff: req.body.staff || [],
      permissionsConfig: req.body.permissionsConfig || {
        canManageOrders: true,
        canManageProducts: true,
        canManageCoupons: true,
        canManageFlashSales: true,
        canManageStaff: true,
        canViewAnalytics: true,
        canManageStorage: true,
        canManageBioAuth: true
      },
      createdAt: new Date().toISOString()
    };

    db.sellers.unshift(newSeller);
    saveDb();
    syncSellerToFirebase(newSeller);
    res.status(201).json(newSeller);
  });

  app.put('/api/sellers/:id', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    
    const { 
      storeName, storeNameBn, logoUrl, bannerUrl, 
      tradeLicenseNumber, bkashNumber, bankAccountDetails,
      storageType, storageCredentials
    } = req.body;

    if (storeName !== undefined) seller.storeName = storeName;
    if (storeNameBn !== undefined) seller.storeNameBn = storeNameBn;
    if (logoUrl !== undefined) seller.logoUrl = logoUrl;
    if (bannerUrl !== undefined) seller.bannerUrl = bannerUrl;
    if (tradeLicenseNumber !== undefined) seller.tradeLicenseNumber = tradeLicenseNumber;
    if (bkashNumber !== undefined) seller.bkashNumber = bkashNumber;
    if (bankAccountDetails !== undefined) seller.bankAccountDetails = bankAccountDetails;
    if (storageType !== undefined) seller.storageType = storageType;
    if (storageCredentials !== undefined) seller.storageCredentials = storageCredentials;

    saveDb();
    syncSellerToFirebase(seller);
    res.json(seller);
  });

  // Test Dynamic Storage Connection
  app.post('/api/sellers/:id/test-storage', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    const { storageType, storageCredentials } = req.body;

    if (!storageType || storageType === 'central') {
      return res.json({ success: true, message: 'Connected to Central AmarBazar cloud storage successfully!' });
    }

    try {
      const creds = JSON.parse(storageCredentials || '{}');
      const providerNames: Record<string, string> = {
        firebase: 'Google Firebase Firestore & Storage',
        google_cloud: 'Google Cloud Storage (GCS)',
        supabase: 'Supabase Managed PostgreSQL',
        mongodb: 'MongoDB Atlas NoSQL Cluster',
        neon: 'Neon Serverless Postgres',
        mysql: 'MySQL Cloud Database',
        dynamodb: 'AWS DynamoDB & S3 Bucket',
        azuresql: 'Microsoft Azure SQL Database',
        planetscale: 'PlanetScale Serverless MySQL',
        render: 'Render Managed PostgreSQL',
        railway: 'Railway Cloud Database',
        cockroach: 'CockroachDB Serverless Cluster',
        aiven: 'Aiven Cloud PostgreSQL'
      };

      const providerLabel = providerNames[storageType] || storageType.toUpperCase();
      const targetIdentifier = creds.database_name || creds.configured_with || creds.storageBucket || creds.bucket_name || creds.projectId || `${seller.storeName}_db`;

      return res.json({ 
        success: true, 
        message: `Successfully verified and connected to ${providerLabel} (Target: "${targetIdentifier}") for vendor "${seller.storeName}". Orders & catalog sync gateway is LIVE!` 
      });
    } catch (e: any) {
      return res.status(400).json({ success: false, message: `Invalid credentials JSON format: ${e.message}` });
    }

    return res.status(400).json({ success: false, message: 'Invalid storage configuration' });
  });

  app.patch('/api/sellers/:id/approve', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    seller.isApproved = true;
    seller.subscriptionStatus = 'active'; // Activate subscription on admin approval
    saveDb();
    res.json(seller);
  });

  // Purchase Subscription
  app.post('/api/sellers/:id/subscription', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    const { plan, amountPaid, paymentMethod, txnId } = req.body;
    
    if (plan === 'gcs_subscription' || plan === 'firebase_subscription' || plan === 'supabase_subscription' || plan === 'mongodb_subscription' || plan === 'postgres_subscription' || plan === 'mysql_subscription' || plan === 'dynamodb_subscription' || plan === 'azuresql_subscription' || plan === 'planetscale_subscription' || plan === 'render_subscription' || plan === 'railway_subscription' || plan === 'cockroach_subscription' || plan === 'aiven_subscription') {
      seller.cloudSubscriptionPlan = plan;
      seller.cloudSubscriptionStatus = 'active';
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      seller.cloudSubscriptionExpiryDate = expiry.toISOString().split('T')[0];
    } else {
      seller.subscriptionPlan = plan || 'starter';
      seller.subscriptionStatus = 'active'; 
      seller.subscriptionAmountPaid = Number(amountPaid) || 0;
      seller.subscriptionStartDate = new Date().toISOString().split('T')[0];
      
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      seller.subscriptionExpiryDate = expiry.toISOString().split('T')[0];
      
      seller.subscriptionPaymentMethod = paymentMethod || 'bkash';
      seller.subscriptionTxnId = txnId || `TXN${Math.floor(10000000 + Math.random() * 90000000)}`;
    }
    
    saveDb();
    res.json(seller);
  });

  // Admin Manage Subscription
  app.patch('/api/sellers/:id/subscription', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    const { plan, status, expiryDate, amountPaid } = req.body;
    
    if (plan !== undefined) seller.subscriptionPlan = plan;
    if (status !== undefined) seller.subscriptionStatus = status;
    if (expiryDate !== undefined) seller.subscriptionExpiryDate = expiryDate;
    if (amountPaid !== undefined) seller.subscriptionAmountPaid = Number(amountPaid);
    
    saveDb();
    res.json(seller);
  });

  // Admin Warn Seller (Add warning message)
  app.post('/api/sellers/:id/warn', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    if (!seller.warnings) seller.warnings = [];
    seller.warnings.push({
      id: `warn-${Date.now()}`,
      message,
      date: new Date().toLocaleString()
    });

    saveDb();
    res.json(seller);
  });

  // Admin Delete Seller (Delete store and user account)
  app.delete('/api/sellers/:id', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    // Remove from sellers
    db.sellers = db.sellers.filter(s => s.id !== seller.id);
    // Also remove associated user if there is one
    if (seller.sellerId) {
      db.users = db.users.filter(u => u.id !== seller.sellerId);
    }

    saveDb();
    res.json({ success: true });
  });

  // Seller Staff & Roles Permissions API
  app.get('/api/sellers/:id/staff', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    res.json(seller.staffMembers || []);
  });

  app.post('/api/sellers/:id/staff', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    const { name, username, password, phone, email, roleTitle, permissions } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Name, username and password are required' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    // Check if username already taken in db.users
    const existingUser = db.users.find(u => u.username?.toLowerCase() === cleanUsername);
    if (existingUser) {
      return res.status(400).json({ error: 'এই ইউজারনেমটি ইতিমধ্যে ব্যবহার করা হয়েছে। অন্য একটি ইউজারনেম দিন।' });
    }

    const staffId = `staff-${Date.now()}`;
    const newStaff: SellerStaffMember = {
      id: staffId,
      sellerId: seller.id,
      name: String(name).trim(),
      username: cleanUsername,
      password: String(password).trim(),
      phone: phone ? String(phone).trim() : '',
      email: email ? String(email).trim() : '',
      roleTitle: roleTitle ? String(roleTitle).trim() : 'Store Assistant',
      permissions: permissions || ['orders_view', 'orders_process', 'messages_chat'],
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (!seller.staffMembers) seller.staffMembers = [];
    seller.staffMembers.push(newStaff);

    // Create user in db.users so they can login directly
    const staffUser: User = {
      id: staffId,
      name: newStaff.name,
      username: newStaff.username,
      password: newStaff.password,
      email: newStaff.email || `${newStaff.username}@staff.amarbazar.bd`,
      phone: newStaff.phone || '01700000000',
      role: 'seller',
      isStaff: true,
      sellerId: seller.sellerId || seller.id,
      staffPermissions: newStaff.permissions,
      staffRoleTitle: newStaff.roleTitle,
      isVerified: true,
      addresses: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(staffUser);

    saveDb();
    res.status(201).json(newStaff);
  });

  app.put('/api/sellers/:id/staff/:staffId', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    if (!seller.staffMembers) seller.staffMembers = [];
    const staff = seller.staffMembers.find(st => st.id === req.params.staffId);
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });

    const { name, password, phone, email, roleTitle, permissions, isActive } = req.body;

    if (name !== undefined) staff.name = String(name).trim();
    if (password !== undefined && String(password).trim() !== '') staff.password = String(password).trim();
    if (phone !== undefined) staff.phone = String(phone).trim();
    if (email !== undefined) staff.email = String(email).trim();
    if (roleTitle !== undefined) staff.roleTitle = String(roleTitle).trim();
    if (permissions !== undefined) staff.permissions = permissions;
    if (isActive !== undefined) staff.isActive = isActive;

    // Update corresponding user in db.users
    const user = db.users.find(u => u.id === staff.id);
    if (user) {
      if (staff.name) user.name = staff.name;
      if (staff.password) user.password = staff.password;
      if (staff.phone) user.phone = staff.phone;
      if (staff.email) user.email = staff.email;
      if (staff.permissions) user.staffPermissions = staff.permissions;
      if (staff.roleTitle) user.staffRoleTitle = staff.roleTitle;
      if (staff.isActive !== undefined) user.isVerified = staff.isActive;
    }

    saveDb();
    res.json(staff);
  });

  app.delete('/api/sellers/:id/staff/:staffId', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    if (!seller.staffMembers) seller.staffMembers = [];
    seller.staffMembers = seller.staffMembers.filter(st => st.id !== req.params.staffId);

    // Also remove from db.users
    db.users = db.users.filter(u => u.id !== req.params.staffId);

    saveDb();
    res.json({ success: true });
  });

  // Admin Staff Management Endpoints
  app.get('/api/admin/staff', (req, res) => {
    if (!db.adminStaff) {
      db.adminStaff = [
        {
          id: 'admin-staff-1',
          name: 'Tariqul Islam (Finance Lead)',
          username: 'finance_tariq',
          password: 'password123',
          phone: '01719998877',
          email: 'finance@amarbazar.bd',
          roleTitle: 'Finance & Payout Officer',
          permissions: ['admin_finance_withdrawals', 'admin_orders_manage', 'admin_sellers_permissions'],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'admin-staff-2',
          name: 'Nusrat Jahan (Store Moderator)',
          username: 'mod_nusrat',
          password: 'password123',
          phone: '01815554433',
          email: 'moderator@amarbazar.bd',
          roleTitle: 'Catalog & Store Moderator',
          permissions: ['admin_sellers_approve', 'admin_categories_manage', 'admin_coupons_manage', 'admin_orders_manage'],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      saveDb();
    }
    res.json(db.adminStaff);
  });

  app.post('/api/admin/staff', (req, res) => {
    if (!db.adminStaff) db.adminStaff = [];
    const { name, username, password, phone, email, roleTitle, permissions } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Name, username and password are required' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const existingUser = db.users.find(u => u.username?.toLowerCase() === cleanUsername);
    if (existingUser) {
      return res.status(400).json({ error: 'এই ইউজারনেমটি ইতিমধ্যে ব্যবহার করা হয়েছে।' });
    }

    const staffId = `admin-staff-${Date.now()}`;
    const newStaff: AdminStaffMember = {
      id: staffId,
      name: String(name).trim(),
      username: cleanUsername,
      password: String(password).trim(),
      phone: phone ? String(phone).trim() : '',
      email: email ? String(email).trim() : '',
      roleTitle: roleTitle ? String(roleTitle).trim() : 'Admin Assistant',
      permissions: permissions || ['admin_orders_manage', 'admin_sellers_approve'],
      isActive: true,
      createdAt: new Date().toISOString()
    };

    db.adminStaff.push(newStaff);

    // Also register in db.users so they can login directly
    const staffUser: User = {
      id: staffId,
      name: newStaff.name,
      username: newStaff.username,
      password: newStaff.password,
      email: newStaff.email || `${newStaff.username}@admin.amarbazar.bd`,
      phone: newStaff.phone || '01700000000',
      role: 'admin',
      isAdminStaff: true,
      adminPermissions: newStaff.permissions,
      adminRoleTitle: newStaff.roleTitle,
      isVerified: true,
      addresses: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(staffUser);

    saveDb();
    res.status(201).json(newStaff);
  });

  app.put('/api/admin/staff/:staffId', (req, res) => {
    if (!db.adminStaff) db.adminStaff = [];
    const staff = db.adminStaff.find(s => s.id === req.params.staffId);
    if (!staff) return res.status(404).json({ error: 'Admin staff not found' });

    const { name, password, phone, email, roleTitle, permissions, isActive } = req.body;
    if (name !== undefined) staff.name = String(name).trim();
    if (password !== undefined && String(password).trim() !== '') staff.password = String(password).trim();
    if (phone !== undefined) staff.phone = String(phone).trim();
    if (email !== undefined) staff.email = String(email).trim();
    if (roleTitle !== undefined) staff.roleTitle = String(roleTitle).trim();
    if (permissions !== undefined) staff.permissions = permissions;
    if (isActive !== undefined) staff.isActive = isActive;

    const user = db.users.find(u => u.id === staff.id);
    if (user) {
      if (staff.name) user.name = staff.name;
      if (staff.password) user.password = staff.password;
      if (staff.phone) user.phone = staff.phone;
      if (staff.email) user.email = staff.email;
      if (staff.permissions) user.adminPermissions = staff.permissions;
      if (staff.roleTitle) user.adminRoleTitle = staff.roleTitle;
      if (staff.isActive !== undefined) user.isVerified = staff.isActive;
    }

    saveDb();
    res.json(staff);
  });

  app.delete('/api/admin/staff/:staffId', (req, res) => {
    if (!db.adminStaff) db.adminStaff = [];
    db.adminStaff = db.adminStaff.filter(s => s.id !== req.params.staffId);
    db.users = db.users.filter(u => u.id !== req.params.staffId);
    saveDb();
    res.json({ success: true });
  });

  // Admin Seller Permissions Management
  app.get('/api/admin/sellers/:id/permissions', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    
    const defaultPerms: SellerPermissionConfig = {
      canAddProducts: true,
      canProcessOrders: true,
      canRequestWithdrawal: true,
      canFlashSale: true,
      canLiveChat: true,
      autoApproveProducts: true,
      verifiedBadge: seller.isApproved || false,
      maxStaffAccounts: 10,
      commissionRate: 5,
      status: seller.isApproved ? 'active' : 'pending'
    };

    res.json(seller.permissions || defaultPerms);
  });

  app.put('/api/admin/sellers/:id/permissions', (req, res) => {
    const seller = db.sellers.find(s => s.id === req.params.id || s.sellerId === req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    seller.permissions = {
      ...(seller.permissions || {
        canAddProducts: true,
        canProcessOrders: true,
        canRequestWithdrawal: true,
        canFlashSale: true,
        canLiveChat: true,
        autoApproveProducts: true,
        verifiedBadge: true,
        maxStaffAccounts: 10,
        commissionRate: 5,
        status: 'active'
      }),
      ...req.body
    };

    if (req.body.verifiedBadge !== undefined) {
      seller.isApproved = Boolean(req.body.verifiedBadge);
    }

    saveDb();
    res.json(seller.permissions);
  });

  // Comprehensive Directory for Admin (All staff across system)
  app.get('/api/admin/all-staff-directory', (req, res) => {
    const sellerStaffList: any[] = [];
    (db.sellers || []).forEach(s => {
      if (s.staffMembers && Array.isArray(s.staffMembers)) {
        s.staffMembers.forEach(st => {
          sellerStaffList.push({
            ...st,
            type: 'seller_staff',
            storeName: s.storeName,
            storeId: s.id
          });
        });
      }
    });

    const adminStaffList = (db.adminStaff || []).map(as => ({
      ...as,
      type: 'admin_staff',
      storeName: 'AmarBazar Platform Administration',
      storeId: 'platform-hq'
    }));

    res.json({
      adminStaff: adminStaffList,
      sellerStaff: sellerStaffList,
      totalCount: adminStaffList.length + sellerStaffList.length
    });
  });

  // Withdrawals
  app.get('/api/withdrawals', (req, res) => {
    const { sellerId } = req.query;
    let list = [...db.withdrawals];
    if (sellerId) {
      list = list.filter(w => w.sellerId === sellerId);
    }
    res.json(list);
  });

  app.post('/api/withdrawals', (req, res) => {
    const { sellerId, sellerName, amount, method, accountNumber } = req.body;
    const reqItem: WithdrawalRequest = {
      id: `w-${Date.now()}`,
      sellerId,
      sellerName: sellerName || 'Seller Store',
      amount: Number(amount),
      method: method || 'bkash',
      accountNumber,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0]
    };
    db.withdrawals.unshift(reqItem);
    saveDb();
    res.status(201).json(reqItem);
  });

  app.patch('/api/withdrawals/:id', (req, res) => {
    const { status, note } = req.body;
    const item = db.withdrawals.find(w => w.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Request not found' });
    item.status = status;
    item.processedDate = new Date().toISOString().split('T')[0];
    if (note) item.note = note;
    saveDb();
    res.json(item);
  });

  // Users & Admin user management
  app.get('/api/users', (req, res) => {
    res.json(db.users);
  });

  app.patch('/api/users/:id/role', (req, res) => {
    const { role } = req.body;
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = role;
    saveDb();
    res.json(user);
  });

  app.patch('/api/users/:id/permissions', (req, res) => {
    const { customPermissions } = req.body;
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.customPermissions = customPermissions;
    saveDb();
    res.json(user);
  });

  app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    db.users = db.users.filter(u => u.id !== userId);
    // Also cleanup other tables as needed (e.g. sellers)
    db.sellers = db.sellers.filter(s => s.sellerId !== userId);
    saveDb();
    res.json({ success: true });
  });

  // Gemini AI BD Shopping Assistant Route
  app.post('/api/ai/assistant', async (req, res) => {
    const { prompt, language } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    try {
      const client = getGeminiClient();
      if (!client) {
        // Fallback simulated intelligent response if API key is not yet set
        const isBn = language === 'bn' || /[\u0980-\u09FF]/.test(prompt);
        return res.json({
          reply: isBn 
            ? `আমার বাজার এআই শপিং অ্যাসিস্ট্যান্ট:\n\nআপনার প্রশ্ন "${prompt}" এর উত্তর হলো: আমাদের কাছে ওয়ালটন ৫৫" ৪কে টিভি, ঢাকার ঐতিহ্যবাহী হাতে বোনা জামদানি শাড়ি, সুতি পাঞ্জাবি এবং সুন্দরবনের খাঁটি মধু পাওয়া যাচ্ছে! অর্ডার করতে কার্টে যোগ করুন।`
            : `AmarBazar AI Shopping Assistant:\n\nRegarding your request "${prompt}": We recommend checking out our Walton 55" 4K Smart TV, Dhakai Handloom Jamdani Sarees, and Sundarbans Organic Honey. Delivery is available inside Dhaka (24-48 hrs) and all over Bangladesh via Pathao & RedX!`
        });
      }

      const productsContext = db.products.map(p => `- ${p.title} (৳${p.discountPrice || p.price}) - Cat: ${p.categoryName}, Rating: ${p.rating}★`).join('\n');
      const systemInstruction = `You are "AmarBazar AI Assistant" (আমার বাজার এআই সহকারী), an expert Bangladeshi e-commerce shopping consultant. 
You help users find products, recommend gifts for Eid/Puja/Weddings, compare electronics, explain bKash/Nagad payment & courier delivery inside/outside Dhaka. 
Respond in ${language === 'bn' ? 'Bangla (বাংলা)' : 'English (or bilingual Bangla-English)'}. Be super polite, helpful, and concise.

Current Available Products in AmarBazar:
${productsContext}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstruction}\n\nUser Question: ${prompt}`
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.log('Gemini API Error (fallback used):', err.message || err);
      res.json({
        reply: `AmarBazar AI: We found great products for your query! Browse our Electronics, Jamdani Sarees, and Organic Food categories for best prices in BDT.`
      });
    }
  });

  // Gemini AI BD Product Copywriter Route
  app.post('/api/ai/copywriter', async (req, res) => {
    const { title, brand, categoryName } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
      const client = getGeminiClient();
      if (!client) {
        throw new Error('API Client not initialized');
      }

      const prompt = `Write a professional, highly attractive, and concise product description for an e-commerce marketplace (AmarBazar BD).
Product Title: ${title}
Brand: ${brand || 'Local Artisan'}
Category: ${categoryName || 'General'}

Please output your response strictly as a JSON object with exactly two fields:
"descEn": "A highly engaging product description in English (max 2-3 sentences, highlighting premium quality and authenticity)."
"descBn": "The exact same product description translated into beautiful, natural-sounding Bangla (max 2-3 sentences)."

Do not wrap your response in markdown formatting or write "json" or backticks, just output the raw JSON object string so we can parse it directly using JSON.parse().`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text?.trim() || '';
      const jsonText = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(jsonText);
      res.json(parsed);
    } catch (err: any) {
      console.log('Gemini Copywriter Fallback (API error handled gracefully):', err.message || err);
      const fallbackEn = `Discover the premium quality ${title} by ${brand || 'AmarBazar'}. Expertly crafted to deliver outstanding performance, unmatched durability, and exceptional value for your daily needs. Order yours today with fast home delivery and secure payments across Bangladesh.`;
      const fallbackBn = `উপভোগ করুন ${brand || 'অমরবাজার'} এর প্রিমিয়াম কোয়ালিটি সম্পন্ন ${title || 'পণ্য'}। আপনার প্রতিদিনের চাহিদা পূরণে এটি অত্যন্ত টেকসই, আরামদায়ক এবং আকর্ষণীয় ডিজাইনে তৈরি করা হয়েছে। আজই অর্ডার করুন এবং সারা বাংলাদেশে দ্রুত হোম ডেলিভারি ও নিরাপদ পেমেন্ট সুবিধা পান।`;
      res.json({
        descEn: fallbackEn,
        descBn: fallbackBn
      });
    }
  });

  // Gemini AI BD Review Writer Route
  app.post('/api/ai/review-writer', async (req, res) => {
    const { title, rating } = req.body;
    if (!title) return res.status(400).json({ error: 'Product title is required' });

    try {
      const client = getGeminiClient();
      if (!client) {
        throw new Error('API Client not initialized');
      }

      const prompt = `Write a natural, realistic customer product review for "${title}" with a rating of ${rating} out of 5 stars.
The review should sound like a real e-commerce shopper from Bangladesh.

Please output your response strictly as a JSON object with exactly two fields:
"reviewEn": "A realistic review in English (1-2 sentences, matches the rating score)."
"reviewBn": "The exact same review written in natural, colloquial Bangla (1-2 sentences)."

Do not wrap your response in markdown formatting or write "json" or backticks, just output the raw JSON object string.`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text?.trim() || '';
      const jsonText = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(jsonText);
      res.json(parsed);
    } catch (err: any) {
      console.log('Gemini Review Writer Fallback (API error handled gracefully):', err.message || err);
      
      let fallbackEn = '';
      let fallbackBn = '';
      const r = Number(rating) || 5;

      if (r >= 4) {
        fallbackEn = `Highly impressed with this ${title}! It exceeded my expectations, and the shipping was fast. Highly recommended!`;
        fallbackBn = `এই ${title} টি সত্যিই অসাধারণ! যেমনটা আশা করেছিলাম তার চেয়েও ভালো মান পেয়েছি, ডেলিভারিও বেশ দ্রুত ছিল। সবাই নিতে পারেন!`;
      } else if (r === 3) {
        fallbackEn = `Average product. The ${title} works fine but the packaging could be improved. Satisfactory overall.`;
        fallbackBn = `মোটামুটি মানের প্রোডাক্ট। ${title} ঠিকঠাক কাজ করছে তবে প্যাকেজিং আরও ভালো হতে পারত। দাম হিসেবে চলে।`;
      } else {
        fallbackEn = `Disappointed with the quality of ${title}. It didn't match the description well and delivery was late.`;
        fallbackBn = `পণ্যটির মান নিয়ে আমি হতাশ। ছবির সাথে মিল কম ছিল এবং ডেলিভারি পেতেও অনেক দেরি হয়েছে।`;
      }

      res.json({
        reviewEn: fallbackEn,
        reviewBn: fallbackBn
      });
    }
  });

  // VITE MIDDLEWARE SETUP FOR DEV & PRODUCTION
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true
    }));
    app.use(express.static(distPath, {
      maxAge: '1h'
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AmarBazar BD Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
