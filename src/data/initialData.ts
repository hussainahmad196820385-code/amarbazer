import { Category, Product, Coupon, SellerStore, Order, User, CourierInfo, SystemSettings } from '../types';
import { INITIAL_CATEGORIES } from './categoriesData';
import { INITIAL_PRODUCTS } from './productsData';

export { INITIAL_CATEGORIES, INITIAL_PRODUCTS };

export const BD_DIVISIONS_DISTRICTS: Record<string, string[]> = {
  'Dhaka': ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Narsingdi', 'Faridpur', 'Manikganj', 'Munshiganj'],
  'Chittagong': ['Chittagong', 'Cox\'s Bazar', 'Comilla', 'Feni', 'Noakhali', 'Brahmanbaria', 'Chandpur'],
  'Sylhet': ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  'Rajshahi': ['Rajshahi', 'Bogra', 'Pabna', 'Natore', 'Naogaon', 'Sirajganj', 'Chapainawabganj'],
  'Khulna': ['Khulna', 'Jessore', 'Kushtia', 'Satkhira', 'Bagerhat'],
  'Barisal': ['Barisal', 'Bhola', 'Patuakhali', 'Pirojpur'],
  'Rangpur': ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram'],
  'Mymensingh': ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur']
};

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  siteName: 'AmarBazar (আমার বাজার)',
  siteNameBn: 'আমার বাজার',
  supportPhone: '+880 1700-000000',
  supportEmail: 'support@amarbazar.com.bd',
  insideDhakaShippingFee: 60,
  outsideDhakaShippingFee: 120,
  currencySymbol: '৳',
  commissionPercentage: 5,
  isMaintenanceMode: false,
  
  // Default customizable subscription values
  starterPrice: 500,
  starterDurationDays: 30,
  starterProductLimit: 20,
  starterCommission: 5,

  businessPrice: 1500,
  businessDurationDays: 30,
  businessProductLimit: 100,
  businessCommission: 3,

  enterprisePrice: 3000,
  enterpriseDurationDays: 30,
  enterpriseProductLimit: 999999, // unlimited
  enterpriseCommission: 1
};

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'EID2026',
    type: 'percentage',
    discountValue: 15,
    minPurchase: 1000,
    expiryDate: '2026-12-31',
    isActive: true,
    usedCount: 142
  },
  {
    id: 'coup-2',
    code: 'BKASH50',
    type: 'fixed',
    discountValue: 50,
    minPurchase: 500,
    expiryDate: '2026-12-31',
    isActive: true,
    usedCount: 89
  },
  {
    id: 'coup-3',
    code: 'AMARBAZAR10',
    type: 'percentage',
    discountValue: 10,
    minPurchase: 2000,
    expiryDate: '2026-12-31',
    isActive: true,
    usedCount: 204
  }
];

export const INITIAL_SELLERS: SellerStore[] = [
  {
    id: 'sel-1',
    sellerId: 'usr-seller-1',
    storeName: 'Dhaka Tech Store',
    storeNameBn: 'ঢাকা টেক স্টোর',
    logoUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
    tradeLicenseNumber: 'TRAD/DNCC/019283/2025',
    bkashNumber: '01711223344',
    bankAccountDetails: 'Dutch Bangla Bank Ltd, Gulshan Branch, A/C: 1101569800',
    isApproved: true,
    totalSales: 485000,
    balance: 62400,
    rating: 4.8,
    joinDate: '2025-01-15',
    subscriptionPlan: 'starter',
    subscriptionStatus: 'active',
    subscriptionAmountPaid: 500,
    subscriptionStartDate: '2026-08-01',
    subscriptionExpiryDate: '2026-08-31',
    subscriptionPaymentMethod: 'bkash',
    subscriptionTxnId: 'BKASH928374921'
  },
  {
    id: 'sel-2',
    sellerId: 'usr-seller-2',
    storeName: 'Silk & Handloom Heritage',
    storeNameBn: 'সিল্ক ও তাঁত হেরিটেজ',
    logoUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    tradeLicenseNumber: 'TRAD/DSCC/088321/2025',
    bkashNumber: '01899887766',
    isApproved: true,
    totalSales: 240000,
    balance: 38000,
    rating: 4.9,
    joinDate: '2025-03-20',
    subscriptionPlan: 'business',
    subscriptionStatus: 'active',
    subscriptionAmountPaid: 1500,
    subscriptionStartDate: '2026-07-28',
    subscriptionExpiryDate: '2026-08-28',
    subscriptionPaymentMethod: 'nagad',
    subscriptionTxnId: 'NAGAD882931201'
  },
  {
    id: 'sel-3',
    sellerId: 'usr-seller-3',
    storeName: 'Bengal Organic Foods',
    storeNameBn: 'বেঙ্গল অর্গানিক ফুডস',
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
    tradeLicenseNumber: 'TRAD/KCC/044112/2025',
    bkashNumber: '01911002233',
    isApproved: true,
    totalSales: 175000,
    balance: 19500,
    rating: 4.95,
    joinDate: '2025-04-10',
    subscriptionPlan: 'enterprise',
    subscriptionStatus: 'active',
    subscriptionAmountPaid: 3000,
    subscriptionStartDate: '2026-08-03',
    subscriptionExpiryDate: '2026-09-02',
    subscriptionPaymentMethod: 'bkash',
    subscriptionTxnId: 'BKASH771294029'
  },
  {
    id: 'sel-4',
    sellerId: 'usr-seller-4',
    storeName: 'Smart Gadget BD',
    storeNameBn: 'স্মার্ট গ্যাজেট বিডি',
    logoUrl: 'https://images.unsplash.com/photo-1609592424082-f3f208ff95e4?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
    tradeLicenseNumber: 'TRAD/CCC/099123/2025',
    bkashNumber: '01655443322',
    isApproved: true,
    totalSales: 132000,
    balance: 14200,
    rating: 4.6,
    joinDate: '2025-05-01',
    subscriptionPlan: 'none',
    subscriptionStatus: 'expired'
  },
  {
    id: 'sel-5',
    sellerId: 'usr-seller-5',
    storeName: 'Apex Official Store',
    storeNameBn: 'অ্যাপেক্স অফিসিয়াল স্টোর',
    logoUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80',
    tradeLicenseNumber: 'TRAD/DNCC/112233/2024',
    bkashNumber: '01700112233',
    isApproved: true,
    totalSales: 950000,
    balance: 120000,
    rating: 4.85,
    joinDate: '2024-11-12',
    subscriptionPlan: 'enterprise',
    subscriptionStatus: 'active',
    subscriptionAmountPaid: 3000,
    subscriptionStartDate: '2026-08-02',
    subscriptionExpiryDate: '2026-09-01',
    subscriptionPaymentMethod: 'bkash',
    subscriptionTxnId: 'BKASH110294821'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-demo-cust',
    name: 'Rahim Chowdhury',
    username: 'customer',
    password: 'customer123',
    email: 'rahim@example.com',
    phone: '01712345678',
    role: 'customer',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    addresses: [
      {
        id: 'addr-1',
        title: 'Home',
        recipientName: 'Rahim Chowdhury',
        phone: '01712345678',
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Dhanmondi',
        fullAddress: 'House 42, Road 10/A, Dhanmondi R/A, Dhaka-1209',
        isDefault: true
      }
    ],
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'usr-seller-1',
    name: 'Tanvir Hossain (Dhaka Tech)',
    username: 'seller',
    password: 'seller123',
    email: 'tanvir@dhakatech.com.bd',
    phone: '01711223344',
    role: 'seller',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    addresses: [],
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'usr-admin-1',
    name: 'Super Admin BD',
    username: 'admin',
    password: 'hussain3122',
    email: 'admin@amarbazar.com.bd',
    phone: '01800000000',
    role: 'admin',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    addresses: [],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'usr-sysadmin-1',
    name: 'System Admin (Ultimate)',
    username: 'systemadmin',
    password: 'systemadmin123',
    email: 'systemadmin@amarbazar.com.bd',
    phone: '01900000000',
    role: 'system_admin',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    addresses: [],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'usr-manager-1',
    name: 'Manager (Restricted)',
    username: 'manager',
    password: 'manager123',
    email: 'manager@amarbazar.com.bd',
    phone: '01600000000',
    role: 'manager',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    addresses: [],
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-58912',
    orderNumber: 'ORD-58912',
    order5DigitId: '58912',
    userId: 'usr-demo-cust',
    customerName: 'Rahim Chowdhury',
    customerPhone: '01712345678',
    customerEmail: 'rahim@example.com',
    shippingAddress: {
      id: 'addr-1',
      title: 'Home',
      recipientName: 'Rahim Chowdhury',
      phone: '01712345678',
      division: 'Dhaka',
      district: 'Dhaka',
      thana: 'Dhanmondi',
      fullAddress: 'House 42, Road 10/A, Dhanmondi R/A, Dhaka-1209',
      isDefault: true
    },
    items: [
      {
        productId: 'prod-102',
        productTitle: 'Authentic Handloom Dhakai Jamdani Saree',
        productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        sellerId: 'sel-2',
        sellerName: 'Silk & Handloom Heritage',
        quantity: 1,
        price: 6990,
        selectedVariants: { Color: 'Crimson Red' }
      },
      {
        productId: 'prod-104',
        productTitle: 'Sundarbans Natural Organic Honey 1kg',
        productImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        sellerId: 'sel-3',
        sellerName: 'Bengal Organic Foods',
        quantity: 2,
        price: 1150
      }
    ],
    subtotal: 9290,
    discountAmount: 50,
    couponCode: 'BKASH50',
    shippingFee: 60,
    totalAmount: 9300,
    paymentMethod: 'bkash',
    paymentStatus: 'paid',
    transactionId: 'TRX981247BK',
    status: 'shipped',
    courier: {
      provider: 'Pathao',
      trackingNumber: 'PTH-8912401',
      estimatedDays: '1-2 Days',
      shippingFee: 60,
      statusLogs: [
        { time: '2026-07-28 10:15 AM', status: 'Order Placed & Paid via bKash', location: 'Dhaka' },
        { time: '2026-07-28 02:30 PM', status: 'Package Packed by Seller', location: 'Dhanmondi Hub' },
        { time: '2026-07-29 09:00 AM', status: 'Handed over to Pathao Courier', location: 'Tejgaon Sorting Facility' },
        { time: '2026-07-29 04:20 PM', status: 'In Transit to Destination Hub', location: 'Dhanmondi Delivery Branch' }
      ]
    },
    createdAt: '2026-07-28T10:15:00Z',
    updatedAt: '2026-07-29T16:20:00Z'
  }
];
