export type Role = 'customer' | 'seller' | 'admin' | 'moderator' | 'system_admin' | 'manager';

export interface CustomReplacement {
  id: string;
  originalText: string;
  replacementText: string;
  userRole: 'all' | Role;
}

export type Language = 
  | 'en' | 'bn' | 'ar' | 'hi' | 'ur' | 'es' | 'fr' | 'de' | 'zh' | 'ja' 
  | 'ko' | 'pt' | 'ru' | 'tr' | 'id' | 'it' | 'ms' | 'th' | 'vi' | 'ta' 
  | 'te' | 'mr' | 'gu' | 'pa' | (string & {});

export type CurrencyCode = 'BDT' | 'AED' | 'SAR' | 'QAR' | 'KWD' | 'OMR' | 'BHD' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'NPR' | 'BTN' | 'PKR' | 'LKR' | 'MVR' | 'MYR' | 'SGD' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'TRY' | (string & {});

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'card' | 'cod';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type SellerStaffPermission = 
  | 'orders_view'
  | 'orders_process'
  | 'messages_chat'
  | 'products_view'
  | 'products_manage'
  | 'products_add'
  | 'inventory_manage'
  | 'reviews_manage'
  | 'withdrawals_view'
  | 'withdrawals_manage'
  | 'finance_view'
  | 'finance_withdraw'
  | 'store_view'
  | 'store_settings'
  | 'settings_manage'
  | (string & {});

export interface SellerStaffMember {
  id: string;
  sellerId: string;
  name: string;
  username: string;
  password?: string;
  phone?: string;
  email?: string;
  roleTitle: string;
  permissions: SellerStaffPermission[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type AdminStaffPermission = 
  | 'admin_users_manage' 
  | 'admin_users_moderate'
  | 'admin_sellers_approve' 
  | 'admin_sellers_permissions' 
  | 'admin_orders_manage' 
  | 'admin_finance_withdrawals' 
  | 'admin_categories_manage' 
  | 'admin_coupons_manage' 
  | 'admin_system_settings'
  | 'admin_settings_configure'
  | (string & {});

export interface AdminStaffMember {
  id: string;
  name: string;
  username: string;
  password?: string;
  phone?: string;
  email?: string;
  roleTitle: string;
  permissions: AdminStaffPermission[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface SellerPermissionConfig {
  canAddProducts: boolean;
  canProcessOrders: boolean;
  canRequestWithdrawal: boolean;
  canFlashSale: boolean;
  canLiveChat: boolean;
  autoApproveProducts: boolean;
  verifiedBadge: boolean;
  maxStaffAccounts: number;
  commissionRate: number; // percentage, e.g. 5
  status: 'active' | 'pending' | 'suspended' | 'restricted';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  roleTitle?: string;
  isVerified: boolean;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
  customPermissions?: string[];
  username?: string;
  password?: string;
  sellerId?: string;
  isStaff?: boolean;
  staffPermissions?: SellerStaffPermission[];
  staffRoleTitle?: string;
  isAdminStaff?: boolean;
  adminPermissions?: AdminStaffPermission[];
  adminRoleTitle?: string;
}

export interface Address {
  id: string;
  title: string; // Home, Office
  recipientName: string;
  phone: string;
  division: string; // Dhaka, Chittagong, etc.
  district: string;
  thana: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface ProductVariant {
  id?: string;
  name: string; // Color, Size, Storage
  options: string[]; // ['Red', 'Blue'] or ['M', 'L', 'XL'] or ['128GB', '256GB']
  priceOffset?: number; // extra cost
}

export interface VariantPriceDetails {
  price: number;
  regularPrice?: number;
  discountPrice?: number;
  stock?: number;
}

export interface Product {
  id: string;
  title: string;
  titleBn?: string;
  titleAr?: string;
  slug: string;
  description: string;
  descriptionBn?: string;
  descriptionAr?: string;
  price: number; // in BDT
  discountPrice?: number; // in BDT
  categoryId: string;
  categoryName: string;
  subCategory?: string;
  brand: string;
  sellerId: string;
  sellerName: string;
  stock: number;
  sku: string;
  images: string[];
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  reviewsCount?: number;
  tags: string[];
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isApproved?: boolean;
  isCombo?: boolean;
  comboItems?: { productId: string; quantity: number }[];
  variants?: ProductVariant[];
  variantPrices?: Record<string, number | VariantPriceDetails>;
  bulkOffers?: BulkOffer[];
  warranty?: string;
  warrantyPolicy?: string;
  returnPolicy?: string;
  deliveryTime?: string;
  isFreeDelivery?: boolean;
  deliveryChargeInside?: number;
  deliveryChargeOutside?: number;
  isCodAvailable?: boolean;
  isExpressDelivery?: boolean;
  customSpecs?: { label: string; labelBn?: string; value: string; valueBn?: string }[];
  createdAt: string;
}

export interface BulkOffer {
  minQuantity: number;
  discountPercent?: number;
  discountAmount?: number;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  nameAr?: string;
  icon: string;
  emoji?: string;
  image?: string;
  subcategories: { id: string; name: string; nameBn: string; nameAr?: string }[];
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>; // e.g. { Color: 'Red', Size: 'XL' }
  calculatedPrice: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discountValue: number; // 15% or 100 BDT
  minPurchase: number;
  expiryDate: string;
  isActive: boolean;
  usedCount: number;
}

export interface CourierInfo {
  provider: 'Pathao' | 'RedX' | 'Steadfast' | 'Paperfly' | 'eCourier';
  trackingNumber: string;
  estimatedDays: string;
  shippingFee: number;
  statusLogs: { time: string; status: string; location: string }[];
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ORD-58392 or 58392
  order5DigitId?: string; // 5-digit auto-generated order ID e.g. 58392
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: Address;
  items: {
    productId: string;
    productTitle: string;
    productImage: string;
    sellerId: string;
    sellerName: string;
    quantity: number;
    price: number;
    selectedVariants?: Record<string, string>;
    qualityGrade?: string;
    warranty?: string;
    sku?: string;
    category?: string;
    unit?: string;
  }[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  transactionId?: string;
  status: OrderStatus;
  orderStatus?: string;
  trackingStatus?: string;
  courier?: CourierInfo;
  createdAt: string;
  updatedAt: string;
}

export interface SellerStore {
  id: string;
  sellerId: string;
  storeName: string;
  name?: string;
  storeNameBn?: string;
  storeAddress?: string;
  storeCategory?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  logoUrl: string;
  bannerUrl: string;
  tradeLicenseNumber: string;
  bkashNumber: string;
  bankAccountDetails?: string;
  isApproved: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  status?: string;
  totalSales: number;
  balance: number;
  rating: number;
  joinDate: string;
  createdAt?: string;
  subscriptionPlan?: 'none' | 'starter' | 'business' | 'enterprise';
  subscriptionTier?: string;
  subscriptionStatus?: 'active' | 'expired' | 'suspended' | 'pending';
  subscriptionAmountPaid?: number;
  subscriptionStartDate?: string;
  subscriptionExpiryDate?: string;
  subscriptionPaymentMethod?: string;
  subscriptionTxnId?: string;
  cloudSubscriptionPlan?: 'none' | 'gcs_subscription' | 'firebase_subscription' | string;
  cloudSubscriptionStatus?: 'active' | 'expired' | 'none';
  cloudSubscriptionExpiryDate?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  nidNumber?: string;
  ownerPhoto?: string;
  nidPhotoFront?: string;
  nidPhotoBack?: string;
  shopLicensePhoto?: string;
  shopPhoto?: string;
  facePhoto?: string;
  warnings?: { id: string; message: string; date: string }[];
  storageType?: 'central' | 'google_cloud' | 'firebase' | 'supabase' | string;
  storageCredentials?: string; // stringified JSON
  staffMembers?: SellerStaffMember[];
  staff?: SellerStaffMember[];
  permissions?: SellerPermissionConfig;
  permissionsConfig?: Record<string, any>;
}

export interface WithdrawalRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  method: 'bkash' | 'nagad' | 'bank';
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string;
  note?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  type: 'order' | 'payment' | 'promo' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface SystemSettings {
  siteName: string;
  siteNameBn: string;
  supportPhone: string;
  supportEmail: string;
  insideDhakaShippingFee: number;
  outsideDhakaShippingFee: number;
  currencySymbol: string;
  commissionPercentage: number;
  isMaintenanceMode: boolean;
  activeSoundUrl?: string;
  customSounds?: { id: string; name: string; url: string }[];
  
  // Subscription Plan Configurations
  starterPrice?: number;
  starterDurationDays?: number;
  starterProductLimit?: number;
  starterCommission?: number;

  businessPrice?: number;
  businessDurationDays?: number;
  businessProductLimit?: number;
  businessCommission?: number;

  enterprisePrice?: number;
  enterpriseDurationDays?: number;
  enterpriseProductLimit?: number;
  enterpriseCommission?: number;
}

export type ColorPalette = 'mint' | 'amber' | 'sky' | 'blush' | 'crimson' | 'indigo' | 'lavender' | 'orange' | 'gold' | 'magenta' | 'turquoise' | 'lime' | 'sapphire' | 'forest' | 'teal' | 'violet' | 'emerald' | 'rose' | 'coral' | 'fuchsia' | 'plum' | 'slate' | 'bronze' | 'custom';

export function parseWeightInGrams(str: string): number | null {
  const lower = str.toLowerCase().replace(/\s+/g, '');
  const kgMatch = lower.match(/(\d+(?:\.\d+)?)\s*kg/);
  if (kgMatch) return parseFloat(kgMatch[1]) * 1000;
  const gMatch = lower.match(/(\d+(?:\.\d+)?)\s*g/);
  if (gMatch) return parseFloat(gMatch[1]);
  const gmMatch = lower.match(/(\d+(?:\.\d+)?)\s*gm/);
  if (gmMatch) return parseFloat(gmMatch[1]);
  return null;
}

export function getBulkDiscountedPrice(product: Product, unitPrice: number, quantity: number): number {
  if (!product.bulkOffers || product.bulkOffers.length === 0) return unitPrice;
  
  // Find the applicable offer with the highest minQuantity <= quantity
  let bestOffer = null;
  for (const offer of product.bulkOffers) {
    if (quantity >= offer.minQuantity) {
      if (!bestOffer || offer.minQuantity > bestOffer.minQuantity) {
        bestOffer = offer;
      }
    }
  }
  
  if (bestOffer) {
    if (bestOffer.discountPercent) {
      return Math.round(unitPrice * (1 - bestOffer.discountPercent / 100));
    }
    if (bestOffer.discountAmount) {
      return Math.max(0, unitPrice - bestOffer.discountAmount);
    }
  }
  
  return unitPrice;
}

export function getProductUnitPrice(product: Product, selectedVariants: Record<string, string>): number {
  let price = product.discountPrice || product.price;
  
  if (!selectedVariants) return price;

  // Check for custom configured variant prices first
  if (product.variantPrices) {
    let customPriceVal: number | null = null;
    
    // Check if any of the selected options has a custom price configured
    for (const [groupName, optionValue] of Object.entries(selectedVariants)) {
      const fullKey = `${groupName}:${optionValue}`;
      const entry = product.variantPrices[fullKey] ?? product.variantPrices[optionValue];
      if (entry !== undefined) {
        if (typeof entry === 'object' && entry !== null) {
          customPriceVal = entry.discountPrice ?? entry.price;
        } else if (typeof entry === 'number') {
          customPriceVal = entry;
        }
        break;
      }
    }
    
    if (customPriceVal !== null) {
      return customPriceVal;
    }
  }

  // 1. Check for weight/volume options first
  const weightKeys = ['weight', 'volume', 'weight / volume', 'weight / size', 'ওজন', 'ওজন / সাইজ', 'ধারণক্ষমতা', 'capacity'];
  let weightOptionValue: string | null = null;
  
  for (const key of Object.keys(selectedVariants)) {
    if (weightKeys.some(wk => key.toLowerCase().includes(wk) || wk === key)) {
      weightOptionValue = selectedVariants[key];
      break;
    }
  }

  if (weightOptionValue) {
    const selectedGrams = parseWeightInGrams(weightOptionValue);
    const titleGrams = parseWeightInGrams(product.title) || parseWeightInGrams(product.titleBn || '');
    
    if (selectedGrams && titleGrams) {
      const ratio = selectedGrams / titleGrams;
      // Apply a realistic bulk discount curve so larger is slightly discounted, smaller is slightly premium
      let discountFactor = 1.0;
      if (ratio > 1) {
        discountFactor = Math.max(0.8, 1 - (ratio - 1) * 0.03);
      } else if (ratio < 1) {
        discountFactor = Math.min(1.2, 1 + (1 - ratio) * 0.1);
      }
      
      const rawPrice = price * ratio * discountFactor;
      return Math.round(rawPrice / 10) * 10; // Round to nearest 10
    }
  }

  // 2. Add extra offset for size options
  const sizeKeys = ['size', 'সাইজ', 'সাইজ / সাইজ'];
  let sizeOptionValue: string | null = null;
  for (const key of Object.keys(selectedVariants)) {
    if (sizeKeys.some(sk => key.toLowerCase().includes(sk) || sk === key)) {
      sizeOptionValue = selectedVariants[key];
      break;
    }
  }

  if (sizeOptionValue) {
    const val = sizeOptionValue.toUpperCase().trim();
    if (val === 'M') price += 30;
    else if (val === 'L') price += 60;
    else if (val === 'XL') price += 100;
    else if (val === 'XXL') price += 150;
    else if (val === 'LARGE' || val === 'বড়') price += 100;
    else if (val === 'PRO / PLUS' || val === 'প্রো / প্লাস') price += 200;
  }

  // 3. Add extra offset for capacity/storage options if any
  const capKeys = ['capacity', 'storage', 'স্টোরেজ', 'ক্ষমতা'];
  let capOptionValue: string | null = null;
  for (const key of Object.keys(selectedVariants)) {
    if (capKeys.some(ck => key.toLowerCase().includes(ck) || ck === key)) {
      capOptionValue = selectedVariants[key];
      break;
    }
  }

  if (capOptionValue) {
    const val = capOptionValue.toLowerCase().trim();
    if (val.includes('pro') || val.includes('plus') || val.includes('প্লাস')) {
      price += 250;
    } else if (val.includes('256gb') || val.includes('256')) {
      price += 300;
    } else if (val.includes('512gb') || val.includes('512')) {
      price += 600;
    }
  }

  return price;
}

export function getProductRegularPrice(product: Product, selectedVariants: Record<string, string>): number {
  if (selectedVariants && product.variantPrices) {
    for (const [groupName, optionValue] of Object.entries(selectedVariants)) {
      const fullKey = `${groupName}:${optionValue}`;
      const entry = product.variantPrices[fullKey] ?? product.variantPrices[optionValue];
      if (entry !== undefined) {
        if (typeof entry === 'object' && entry !== null && entry.regularPrice !== undefined) {
          return entry.regularPrice;
        } else if (typeof entry === 'number') {
          return entry;
        }
      }
    }
  }
  return product.price;
}

export function getProductVariantStock(product: Product, selectedVariants: Record<string, string>): number {
  if (selectedVariants && product.variantPrices) {
    for (const [groupName, optionValue] of Object.entries(selectedVariants)) {
      const fullKey = `${groupName}:${optionValue}`;
      const entry = product.variantPrices[fullKey] ?? product.variantPrices[optionValue];
      if (entry !== undefined && typeof entry === 'object' && entry !== null && entry.stock !== undefined) {
        return entry.stock;
      }
    }
  }
  return product.stock;
}

export interface StorageFile {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  formattedSize: string;
  category: 'image' | 'pdf' | 'audio' | 'document' | 'data';
  mimeType: string;
  uploadedAt: string;
  associatedWith?: string; // e.g. "Product: Samsung TV", "Invoice #8392", "Chat with Karim"
  sellerId?: string;
}


