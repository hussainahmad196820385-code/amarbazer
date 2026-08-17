import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { hasPermission } from '../../lib/permissions';
import { Product, ProductVariant } from '../../types';
import { ALL_FRONTEND_CATEGORIES } from '../../data/categoriesData';
import { 
  Trash2, Edit, Save, Check, RefreshCw, AlertCircle, 
  Search, Play, DollarSign, Package, Star, Sparkles, Volume2,
  Shirt, Smartphone, Apple, Home, Plus, ChevronRight, Image as ImageIcon, Heart, Info, Tag, X,
  Zap, Footprints, Gamepad2, Activity, BookOpen, Truck, ShieldCheck, Clock, RotateCcw, CheckCircle2, BadgeCheck, CreditCard
} from 'lucide-react';

const PRESETS_BY_CAT: Record<string, { title: string; url: string }[]> = {
  'cakes-pastry': [
    { title: 'Chocolate Fudge Birthday Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80' },
    { title: 'Vanilla Cream Pastry Slice', url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80' },
    { title: 'Red Velvet Special Cake', url: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=600&q=80' }
  ],
  'fast-food': [
    { title: 'Double Cheese Crispy Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
    { title: 'Loaded Supreme Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80' },
    { title: 'Crispy Fried Chicken Combo', url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80' }
  ],
  'sweets-desserts': [
    { title: 'Traditional Roshogolla Box', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80' },
    { title: 'Special Gulab Jamun Dessert', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' }
  ],
  'cat-1': [ // Electronics & Gadgets
    { title: 'Smart Phone Prime X', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' },
    { title: 'Smart Watch Active', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
    { title: 'Wireless ANC Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
    { title: '4K Ultra HD TV', url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80' }
  ],
  'cat-2': [ // Fashion & Clothing
    { title: 'Classic Cotton Shirt', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80' },
    { title: 'Traditional Panjabi', url: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=600&q=80' },
    { title: 'Casual Hoodie Jacket', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
    { title: 'Tangail Handloom Saree', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' }
  ],
  'cat-3': [ // BD Foods & Organic
    { title: 'Pure Mustard Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80' },
    { title: 'Sundarbans Natural Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },
    { title: 'Organic Ghee Jar', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80' }
  ],
  'cat-4': [ // Home & Living
    { title: 'Satin Bedding Set', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80' },
    { title: 'Ceramic Flower Vase', url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80' },
    { title: 'Handmade Floor Rug', url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80' }
  ],
  'cat-5': [ // Beauty & Health
    { title: 'Herbal Skin Tonic', url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80' },
    { title: 'Natural Aloe Vera Gel', url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80' }
  ]
};

const DEFAULT_CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', 'Free Size'];
const DEFAULT_CLOTHING_COLORS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Orange', 'Grey',
  'Navy Blue', 'Maroon', 'Olive Green', 'Teal', 'Magenta', 'Beige', 'Sky Blue',
  'Purple', 'Brown', 'Lavender', 'Mustard', 'Cream', 'Coral', 'Gold', 'Silver',
  'Charcoal', 'Mint Green', 'Peach', 'Rose', 'Plum', 'Wine', 'Crimson'
];

const DEFAULT_ELECTRONIC_STORAGE = ['4GB/64GB', '6GB/128GB', '8GB/128GB', '8GB/256GB', '12GB/256GB', '12GB/512GB', '16GB/1TB'];
const DEFAULT_ELECTRONIC_COLORS = [
  'Midnight Blue', 'Space Grey', 'Rose Gold', 'Alpine Green', 'Titanium Silver',
  'Pearl White', 'Matte Black', 'Deep Purple', 'Sunset Gold', 'Emerald Green',
  'Charcoal', 'Titanium Blue', 'Titanium Gray', 'Prism Crush Blue'
];

const DEFAULT_BOOK_VARIANTS = ['1 Pcs', 'Paperback', 'Hardcover', 'Board Book', 'Full Set', 'E-Book / PDF', '1 Pack', 'Standard Edition'];
const DEFAULT_CAKE_BAKERY_VARIANTS = ['0.5 Pound', '1 Pound', '1.5 Pound', '2 Pound', '3 Pound', '1 Slice', '1 Box', 'Regular', 'Large', 'Combo Pack'];
const DEFAULT_LIQUID_VARIANTS = ['100ml', '250ml', '500ml', '1 Litre', '2 Litre', '5 Litre'];
const DEFAULT_FOOD_WEIGHTS = ['100g', '250g', '500g', '1kg', '2kg', '5kg', '10kg', '25kg'];
const DEFAULT_EGG_VARIANTS = ['1 Hali (4 Pcs)', '2 Hali (8 Pcs)', '1 Dozen (12 Pcs)', '1 Tray (30 Pcs)'];
const DEFAULT_SHOE_SIZES = ['38', '39', '40', '41', '42', '43', '44', 'UK 6', 'UK 7', 'UK 8'];
const DEFAULT_BABY_CARE_VARIANTS = ['NB (Newborn)', 'S (3-8kg)', 'M (6-11kg)', 'L (9-14kg)', 'XL (12-17kg)', '250g', '400g Tin', '900g Tin'];
const DEFAULT_MEDICINE_VARIANTS = ['1 Strip (10 Pcs)', '1 Box', '1 Bottle (100ml)', '1 Bottle (200ml)', '1 Tube (20g)', '1 Vial'];
const DEFAULT_ELECTRICAL_VARIANTS = ['3 Watt', '5 Watt', '9 Watt', '12 Watt', '18 Watt', '1 Metre', '1 Coil (90m)'];
const DEFAULT_CLEANING_VARIANTS = ['250ml', '500ml', '1 Litre', '2 Litre', '500g', '1kg', 'Refill Pack'];
const DEFAULT_GARDENING_VARIANTS = ['Small Pot (4")', 'Medium Pot (6")', 'Large Pot (8")', '1 Plant', '1 Pack Seeds', '1kg Bag'];
const DEFAULT_RICE_GRAIN_VARIANTS = ['1kg', '2kg', '5kg', '10kg', '25kg Sack', '50kg Sack'];
const DEFAULT_SAREE_ETHNIC_VARIANTS = ['Free Size', '12 Haat', '13 Haat', 'Unstitched', 'Semi-Stitched', 'M', 'L', 'XL'];
const DEFAULT_COMBO_PACK_VARIANTS = ['Mini Saver Combo', 'Family Pack', 'Jumbo Pack', '1 Set', 'Mega Box'];
const DEFAULT_COSMETICS_VARIANTS = ['1 Pcs', '50ml', '100ml', '200ml', 'Shade 01', 'Shade 02', 'Set'];
const DEFAULT_KITCHEN_HOME_VARIANTS = ['1 Pcs', '2 Liter', '3 Liter', '5 Liter', 'Single Bed', 'Double Bed', 'King Size', 'Set of 3'];
const DEFAULT_SPORTS_VARIANTS = ['Size 4', 'Size 5', 'Standard', '1 Pair', 'M', 'L', 'XL', '1 Set'];
const DEFAULT_AUTOMOTIVE_VARIANTS = ['1 Pcs', '1 Pair', '1 Set', '500ml', 'Universal Fit'];
const DEFAULT_GENERAL_VARIANTS = ['1 Pcs', '2 Pcs', '1 Pack', 'Box', 'Set', '1 Strip', '50ml', '100ml', '250ml', '500ml'];

export const InventoryWorkspace: React.FC = () => {
  const { currentUser, activeRole, language, categories, refreshProducts, setActivePanel, setSelectedProduct } = useApp();
  
  const effectiveUser = currentUser?.role === 'customer' && activeRole !== 'customer' 
    ? { ...currentUser, role: activeRole } 
    : currentUser;
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'catalog' | 'builder'>('catalog');

  // Products Catalog lists
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Detailed Product Editing Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTitleBn, setEditTitleBn] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editWarranty, setEditWarranty] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDescriptionBn, setEditDescriptionBn] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number | undefined>(undefined);
  const [editStock, setEditStock] = useState<number>(10);
  const [editImageUrls, setEditImageUrls] = useState<string[]>(['', '', '', '']);
  const [editCustomSpecs, setEditCustomSpecs] = useState<{ label: string; labelBn?: string; value: string; valueBn?: string }[]>([]);

  // PRODUCT BUILDER STATE
  const [selectedCatId, setSelectedCatId] = useState('cat-2'); // default to Clothing
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderTitleBn, setBuilderTitleBn] = useState('');
  const [builderPrice, setBuilderPrice] = useState('');
  const [builderDiscount, setBuilderDiscount] = useState('');
  const [builderStock, setBuilderStock] = useState('10');
  const [builderBrand, setBuilderBrand] = useState('');
  const [builderSku, setBuilderSku] = useState(`FS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [builderWarranty, setBuilderWarranty] = useState('');
  const [builderDesc, setBuilderDesc] = useState('');
  const [builderDescBn, setBuilderDescBn] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customImageUrls, setCustomImageUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const compressAndReadImage = (file: File): Promise<string> => {
    return new Promise<string>((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        resolve('');
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => resolve('');
      reader.onload = (e) => {
        const dataUrl = e.target?.result;
        if (typeof dataUrl !== 'string') {
          resolve('');
          return;
        }
        const img = new Image();
        img.onerror = () => resolve(dataUrl);
        img.onload = () => {
          try {
            const maxDim = 1200;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(dataUrl);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressed);
          } catch {
            resolve(dataUrl);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Clothing Variants Options
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [customSizeText, setCustomSizeText] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>(['Black', 'Blue', 'White']);
  const [customColorText, setCustomColorText] = useState('');

  // Electronics Variants Options
  const [selectedStorage, setSelectedStorage] = useState<string[]>(['8GB/128GB', '8GB/256GB']);
  const [customStorageText, setCustomStorageText] = useState('');
  const [selectedElecColors, setSelectedElecColors] = useState<string[]>(['Space Grey', 'Matte Black']);
  const [customElecColorText, setCustomElecColorText] = useState('');

  // Food Variants Options
  const [selectedWeights, setSelectedWeights] = useState<string[]>(['500g', '1kg']);
  const [customWeightText, setCustomWeightText] = useState('');

  // Package & Combo Items Builder State
  const [packageItems, setPackageItems] = useState<{ id: string; name: string; qty: string; price: number }[]>([
    { id: '1', name: 'মিনিকট প্রিমিয়াম চাল', qty: '5kg', price: 420 },
    { id: '2', name: 'খাঁটি সরিষার তেল', qty: '1 Liter', price: 290 },
    { id: '3', name: 'দেশি মসুর ডাল', qty: '1kg', price: 140 },
    { id: '4', name: 'ফার্মের লাল ডিম', qty: '1 Dozen', price: 155 }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // Delivery, Shipping & Guarantee Settings
  const [deliveryTime, setDeliveryTime] = useState<string>('২৪-৪৮ ঘণ্টার মধ্যে');
  const [isFreeDelivery, setIsFreeDelivery] = useState<boolean>(false);
  const [deliveryChargeInside, setDeliveryChargeInside] = useState<string>('60');
  const [deliveryChargeOutside, setDeliveryChargeOutside] = useState<string>('120');
  const [isCodAvailable, setIsCodAvailable] = useState<boolean>(true);
  const [returnPolicy, setReturnPolicy] = useState<string>('৭ দিনের ইজি রিটার্ন ও রিফান্ড সুবিধা');
  const [warrantyPolicy, setWarrantyPolicy] = useState<string>('১০০% অরিজিনাল ও মানসম্মত পণ্যের নিশ্চয়তা');
  const [isExpressDelivery, setIsExpressDelivery] = useState<boolean>(true);

  // Dynamic presets and custom input states
  const [deliveryTimePresets, setDeliveryTimePresets] = useState<string[]>([
    '২৪-৪৮ ঘণ্টার মধ্যে',
    '২৪ ঘণ্টার মধ্যে',
    '১ - ২ দিন (ঢাকা শহর)',
    '২ - ৪ দিন (সারা বাংলাদেশ)',
    '৩০ - ৬০ মিনিট (সুপার ফাস্ট)',
    '৭ - ১০ দিন (প্রি-অর্ডার)'
  ]);
  const [customDeliveryInput, setCustomDeliveryInput] = useState<string>('');

  const [returnPolicyPresets, setReturnPolicyPresets] = useState<string[]>([
    '৭ দিনের ইজি রিটার্ন ও রিফান্ড সুবিধা',
    '৭ দিনের ইজি রিটার্ন ও মানি-ব্যাক',
    '৩ দিনের ফ্রি রিপ্লেসমেন্ট',
    'ডেলিভারি ম্যানের সামনে দেখে নেওয়ার সুযোগ',
    'নন-রিটার্নেবল (Non-Returnable)'
  ]);
  const [customReturnInput, setCustomReturnInput] = useState<string>('');

  const [warrantyPolicyPresets, setWarrantyPolicyPresets] = useState<string[]>([
    '১০০% অরিজিনাল ও মানসম্মত পণ্যের নিশ্চয়তা',
    '১০০% অরিজিনাল ও মানসম্মত পণ্য',
    '১ বছরের ব্র্যান্ড অফিশিয়াল ওয়ারেন্টি',
    '৬ মাসের সেলার ওয়ারেন্টি',
    '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
    'কোনো ওয়ারেন্টি নেই (No Warranty)'
  ]);
  const [customWarrantyInput, setCustomWarrantyInput] = useState<string>('');

  const handleAddDeliveryPreset = () => {
    const val = customDeliveryInput.trim();
    if (!val) return;
    if (!deliveryTimePresets.includes(val)) {
      setDeliveryTimePresets(prev => [val, ...prev]);
    }
    setDeliveryTime(val);
    setCustomDeliveryInput('');
  };

  const handleAddReturnPreset = () => {
    const val = customReturnInput.trim();
    if (!val) return;
    if (!returnPolicyPresets.includes(val)) {
      setReturnPolicyPresets(prev => [val, ...prev]);
    }
    setReturnPolicy(val);
    setCustomReturnInput('');
  };

  const handleAddWarrantyPreset = () => {
    const val = customWarrantyInput.trim();
    if (!val) return;
    if (!warrantyPolicyPresets.includes(val)) {
      setWarrantyPolicyPresets(prev => [val, ...prev]);
    }
    setWarrantyPolicy(val);
    setCustomWarrantyInput('');
  };

  // Active variant being edited and saved variant prices
  const [activeEditingVariant, setActiveEditingVariant] = useState<string>('500g');
  const [builderVariantPrices, setBuilderVariantPrices] = useState<Record<string, { price: number; regularPrice?: number; discountPrice?: number; stock?: number }>>({});
  const [variantSaveToast, setVariantSaveToast] = useState<string | null>(null);

  // Previews / Simulated interactions inside live preview
  const [simulatedSize, setSimulatedSize] = useState('M');
  const [simulatedColor, setSimulatedColor] = useState('Black');
  const [simulatedStorage, setSimulatedStorage] = useState('8GB/128GB');
  const [simulatedElecColor, setSimulatedElecColor] = useState('Space Grey');
  const [simulatedWeight, setSimulatedWeight] = useState('1kg');
  const [previewNotify, setPreviewNotify] = useState<string | null>(null);

  // Load appropriate default Sku prefix when category changes
  useEffect(() => {
    const code = selectedCatId === 'cat-1' ? 'EL' : selectedCatId === 'cat-2' ? 'FS' : selectedCatId === 'cat-3' ? 'FD' : selectedCatId === 'cat-4' ? 'HM' : 'BY';
    setBuilderSku(`${code}-${Math.floor(1000 + Math.random() * 9000)}`);
    setSelectedPresetIdx(0);
    setCustomImageUrl('');
  }, [selectedCatId]);

  const activePresets = PRESETS_BY_CAT[selectedCatId] || [];
  const activeImageUrl = customImageUrl || customImageUrls[0] || (activePresets[0] ? activePresets[0].url : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');

  // Category classification helper
  const selectedCategoryName = customCategoryInput || (
    ALL_FRONTEND_CATEGORIES.find(c => c.id === selectedCatId)?.[language === 'bn' ? 'nameBn' : 'name'] || ''
  );

  const isClothingCategory = ['cat-2', 'cat-9'].includes(selectedCatId) || 
    /পোশাক|ফ্যাশন|কসমেটিক্স|গহনা|টি-শার্ট|শার্ট|প্যান্ট|পোলো|fashion|clothing|dress|shirt|tshirt|t-shirt|pant|polo/i.test(selectedCategoryName);

  const isElectronicsCategory = !isClothingCategory && (
    ['cat-1'].includes(selectedCatId) || 
    /ইলেকট্রনিক্স|গ্যাজেট|ফোন|মোবাইল|electronics|gadget|mobile|phone|laptop|headphone|device|tv|camera/i.test(selectedCategoryName)
  );

  const isEggCategory = !isClothingCategory && !isElectronicsCategory && (
    selectedCatId === 'eggs' || /ডিম|egg|farm egg/i.test(selectedCategoryName)
  );

  const isShoeCategory = !isClothingCategory && !isElectronicsCategory && (
    selectedCatId === 'cat-8' || /জুতা|স্যান্ডেল|shoe|sandal|footwear|sneaker|boot/i.test(selectedCategoryName)
  );

  const isSareeEthnicCategory = !isClothingCategory && !isElectronicsCategory && (
    selectedCatId === 'sarees-ethnic' || /শাড়ি|শাড়ী|থ্রি-পিস|saree|ethnic|salwar|three piece/i.test(selectedCategoryName)
  );

  const isBabyCareCategory = !isClothingCategory && !isElectronicsCategory && (
    selectedCatId === 'baby-care' || /ডায়াপার|ডায়পার|বাচ্চা|শিশু|baby|diaper|infant/i.test(selectedCategoryName)
  );

  const isMedicineCategory = !isClothingCategory && !isElectronicsCategory && (
    selectedCatId === 'cat-11' || /ওষুধ|ফার্মেসি|মেডিসিন|medicine|pharmacy|syrup|tablet/i.test(selectedCategoryName)
  );

  const isElectricalCategory = !isClothingCategory && !isElectronicsCategory && (
    selectedCatId === 'cat-6' || /ইলেকট্রিক্যাল|ওয়ারিং|লাইট|বাল্ব|electrical|wiring|light|bulb|wire/i.test(selectedCategoryName)
  );

  const isCleaningCategory = !isClothingCategory && !isElectronicsCategory && (
    selectedCatId === 'home-cleaning' || /পরিষ্কার|ক্লিনার|সাবান|ডিটারজেন্ট|clean|cleaner|detergent|wash|soap/i.test(selectedCategoryName)
  );

  const isGardeningCategory = !isClothingCategory && !isElectronicsCategory && (
    selectedCatId === 'gardening' || /বাগান|টব|গাছ|বীজ|garden|plant|pot|seed/i.test(selectedCategoryName)
  );

  const isRiceGrainCategory = !isClothingCategory && !isElectronicsCategory && (
    selectedCatId === 'grain-rice' || /চাল|ধান|শস্য|বস্তা|rice|grain|sack/i.test(selectedCategoryName)
  );

  const isComboPackCategory = !isClothingCategory && !isElectronicsCategory && (
    ['combo-package-builder', 'cat-[#da1c24]', 'cat-7'].includes(selectedCatId) || 
    /সুপার ডিল|কম্বো|প্যাক|প্যাকেজ|বান্ডিল|deal|combo|pack|package|bundle|saver/i.test(selectedCategoryName)
  );

  const isPackageCategory = selectedCatId === 'combo-package-builder' || isComboPackCategory;

  const totalItemsRegularPrice = packageItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const packageOfferPrice = Number(builderPrice) || 0;
  const savingsAmount = totalItemsRegularPrice > packageOfferPrice ? totalItemsRegularPrice - packageOfferPrice : 0;

  const isBookCategory = !isClothingCategory && !isElectronicsCategory && (
    ['cat-12'].includes(selectedCatId) || 
    /বই|স্টেশনারি|বুক|খাতা|কলম|কাগজ|book|stationery|paper|notebook|pen|pencil|publication|novel|academic|office/i.test(selectedCategoryName)
  );

  const isCakeBakeryCategory = !isClothingCategory && !isElectronicsCategory && !isBookCategory && (
    ['cakes-pastry', 'fast-food', 'sweets-desserts', 'bakery', 'restaurant-meals'].includes(selectedCatId) || 
    /কেক|পেস্ট্রি|মিষ্টি|ফাস্টফুড|বার্গার|পিজ্জা|বেকারি|রেস্টুরেন্ট|ডেজার্ট|cake|pastry|burger|pizza|sweet|dessert|bakery|fast food|restaurant/i.test(selectedCategoryName)
  );

  const isLiquidCategory = !isClothingCategory && !isElectronicsCategory && !isBookCategory && !isCakeBakeryCategory && (
    ['oil-ghee', 'dairy-milk', 'tea-coffee', 'beverages'].includes(selectedCatId) || 
    /তেল|ঘি|দুধ|পানীয়|জুস|কফি|চা|লিকার|সিরপ|oil|ghee|milk|beverage|juice|coffee|tea|water|drink|liquid/i.test(selectedCategoryName)
  );

  const isSolidFoodCategory = !isClothingCategory && !isElectronicsCategory && !isBookCategory && !isCakeBakeryCategory && !isLiquidCategory && (
    ['groceries-spices', 'meat-fish', 'fresh-vegetables', 'fresh-fruits', 'dry-fruits-nuts', 'dry-fruits-dates', 'cat-3', 'organic-honey', 'frozen-food', 'pickles-sauces'].includes(selectedCatId) || 
    /ডাল|মসলা|মাংস|মাছ|শাকসবজি|ফলমূল|বাদাম|খেজুর|মধু|আচার|ফুড|খাবার|খাদ্য|spice|meat|fish|vegetable|fruit|nut|dates|honey|food|organic|grocery/i.test(selectedCategoryName)
  );

  const getCategoryVariantConfig = () => {
    if (isClothingCategory) {
      return {
        type: 'clothing',
        titleBn: '৪. পোশাকের সাইজ ও রঙ ভেরিয়েন্ট',
        titleEn: '4. CLOTHING VARIATIONS & OPTIONAL SIZES',
        labelBn: 'পোশাকের সাইজ বা পরিমাপ নির্বাচন করুন (Sizes):',
        labelEn: 'Select Available Sizes:',
        previewLabelBn: 'সাইজ:',
        previewLabelEn: 'Select Size:',
        presets: DEFAULT_CLOTHING_SIZES,
        defaultSelected: ['M', 'L', 'XL'],
        defaultActive: 'M',
        placeholder: ''
      };
    }
    if (isElectronicsCategory) {
      return {
        type: 'electronics',
        titleBn: '৪. মেমোরি ও কালার ভেরিয়েন্ট',
        titleEn: '4. DEVICE STORAGE & COLOR VARIATIONS',
        labelBn: 'মেমরি ও র‍্যাম সাইজ নির্ধারণ করুন (RAM/Storage):',
        labelEn: 'Select Storage & RAM Configurations:',
        previewLabelBn: 'মেমোরি কনফিগারেশন:',
        previewLabelEn: 'Storage / RAM:',
        presets: DEFAULT_ELECTRONIC_STORAGE,
        defaultSelected: ['8GB/128GB', '8GB/256GB'],
        defaultActive: '8GB/128GB',
        placeholder: ''
      };
    }
    if (isEggCategory) {
      return {
        type: 'egg',
        titleBn: '৪. ডিমের হালি, ডজন বা ট্রেই পরিমাপ',
        titleEn: '4. EGG QUANTITY & PACK VARIATIONS',
        labelBn: 'ডিমের হালি, ডজন বা ট্রেই নির্বাচন করুন (Pack Size):',
        labelEn: 'Select Egg Quantity or Pack Sizes:',
        previewLabelBn: 'ডিমের পরিমাণ:',
        previewLabelEn: 'Pack / Quantity:',
        presets: DEFAULT_EGG_VARIANTS,
        defaultSelected: ['1 Hali (4 Pcs)', '1 Dozen (12 Pcs)'],
        defaultActive: '1 Hali (4 Pcs)',
        placeholder: language === 'bn' ? 'যেমনঃ 1 Hali, 1 Dozen, 1 Tray' : 'e.g. 1 Hali, 1 Dozen, 1 Tray'
      };
    }
    if (isShoeCategory) {
      return {
        type: 'shoe',
        titleBn: '৪. জুতার সাইজ ভেরিয়েন্ট (Shoe Sizes)',
        titleEn: '4. SHOE & FOOTWEAR SIZE VARIATIONS',
        labelBn: 'জুতার নম্বর / সাইজ সিলেক্ট করুন (Sizes):',
        labelEn: 'Select Shoe Sizes:',
        previewLabelBn: 'জুতার সাইজ:',
        previewLabelEn: 'Shoe Size:',
        presets: DEFAULT_SHOE_SIZES,
        defaultSelected: ['40', '41', '42'],
        defaultActive: '40',
        placeholder: language === 'bn' ? 'যেমনঃ 39, 40, UK 7, UK 8' : 'e.g. 39, 40, UK 7, UK 8'
      };
    }
    if (isSareeEthnicCategory) {
      return {
        type: 'saree',
        titleBn: '৪. শাড়ি, থ্রি-পিস বা পোশাকের পরিমাপ',
        titleEn: '4. SAREE, ETHNIC WEAR & SIZE VARIATIONS',
        labelBn: 'শাড়ির হাত / পোশাকের সাইজ সিলেক্ট করুন:',
        labelEn: 'Select Saree or Ethnic Wear Sizes:',
        previewLabelBn: 'পরিমাপ / সাইজ:',
        previewLabelEn: 'Size / Type:',
        presets: DEFAULT_SAREE_ETHNIC_VARIANTS,
        defaultSelected: ['Free Size', 'Unstitched'],
        defaultActive: 'Free Size',
        placeholder: language === 'bn' ? 'যেমনঃ 12 Haat, Unstitched, XL' : 'e.g. 12 Haat, Unstitched, XL'
      };
    }
    if (isBabyCareCategory) {
      return {
        type: 'baby',
        titleBn: '৪. ডায়াপার ও শিশু খাদ্যের সাইজ/ওজন',
        titleEn: '4. BABY DIAPER & FOOD SIZE VARIATIONS',
        labelBn: 'ডায়াপার বা বাচ্চার খাদ্যের পরিমাপ সিলেক্ট করুন:',
        labelEn: 'Select Diaper or Baby Food Sizes:',
        previewLabelBn: 'বেবি সাইজ / ওজন:',
        previewLabelEn: 'Size / Weight:',
        presets: DEFAULT_BABY_CARE_VARIANTS,
        defaultSelected: ['M (6-11kg)', 'L (9-14kg)'],
        defaultActive: 'M (6-11kg)',
        placeholder: language === 'bn' ? 'যেমনঃ M (6-11kg), 400g Tin' : 'e.g. M (6-11kg), 400g Tin'
      };
    }
    if (isMedicineCategory) {
      return {
        type: 'medicine',
        titleBn: '৪. ওষুধের স্ট্রিপ, বোতল বা প্যাক সাইজ',
        titleEn: '4. MEDICINE STRIP & PACK VARIATIONS',
        labelBn: 'ওষুধের পাতা, প্যাক বা বোতল সিলেক্ট করুন:',
        labelEn: 'Select Medicine Packaging / Units:',
        previewLabelBn: 'ওষুধের পরিমাপ:',
        previewLabelEn: 'Unit / Strip:',
        presets: DEFAULT_MEDICINE_VARIANTS,
        defaultSelected: ['1 Strip (10 Pcs)', '1 Box'],
        defaultActive: '1 Strip (10 Pcs)',
        placeholder: language === 'bn' ? 'যেমনঃ 1 Strip, 1 Box, 100ml' : 'e.g. 1 Strip, 1 Box, 100ml'
      };
    }
    if (isElectricalCategory) {
      return {
        type: 'electrical',
        titleBn: '৪. ওয়াট, ভোল্টেজ বা মিটার পরিমাপ',
        titleEn: '4. WATTAGE & WIRE LENGTH VARIATIONS',
        labelBn: 'ওয়াট বা তারের দৈর্ঘ্য সিলেক্ট করুন:',
        labelEn: 'Select Wattage or Length:',
        previewLabelBn: 'ওয়াট / দৈর্ঘ্য:',
        previewLabelEn: 'Wattage / Length:',
        presets: DEFAULT_ELECTRICAL_VARIANTS,
        defaultSelected: ['9 Watt', '12 Watt', '18 Watt'],
        defaultActive: '9 Watt',
        placeholder: language === 'bn' ? 'যেমনঃ 9 Watt, 1 Metre, 1 Coil' : 'e.g. 9 Watt, 1 Metre, 1 Coil'
      };
    }
    if (isCleaningCategory) {
      return {
        type: 'cleaning',
        titleBn: '৪. ক্লিনার বোতল বা প্যাক সাইজ',
        titleEn: '4. CLEANING PRODUCT VOLUME & PACK SIZES',
        labelBn: 'বোতল বা রিফিল প্যাক সিলেক্ট করুন:',
        labelEn: 'Select Bottle or Refill Pack Sizes:',
        previewLabelBn: 'পরিমাণ / সাইজ:',
        previewLabelEn: 'Volume / Pack:',
        presets: DEFAULT_CLEANING_VARIANTS,
        defaultSelected: ['500ml', '1 Litre'],
        defaultActive: '500ml',
        placeholder: language === 'bn' ? 'যেমনঃ 500ml, 1 Litre, Refill' : 'e.g. 500ml, 1 Litre, Refill'
      };
    }
    if (isGardeningCategory) {
      return {
        type: 'gardening',
        titleBn: '৪. টব, গাছ বা বীজের প্যাকেজিং',
        titleEn: '4. POT, PLANT & SEED PACK VARIATIONS',
        labelBn: 'টবের সাইজ, গাছ বা বীজের প্যাক সিলেক্ট করুন:',
        labelEn: 'Select Pot Size, Plant or Seed Pack:',
        previewLabelBn: 'টব / সাইজ:',
        previewLabelEn: 'Pot / Size:',
        presets: DEFAULT_GARDENING_VARIANTS,
        defaultSelected: ['Medium Pot (6")', 'Large Pot (8")'],
        defaultActive: 'Medium Pot (6")',
        placeholder: language === 'bn' ? 'যেমনঃ Medium Pot, 1 Plant' : 'e.g. Medium Pot, 1 Plant'
      };
    }
    if (isRiceGrainCategory) {
      return {
        type: 'rice',
        titleBn: '৪. চাল ও শস্যের বস্তা / কেজি ভেরিয়েন্ট',
        titleEn: '4. RICE & GRAINS SACK / KG VARIATIONS',
        labelBn: 'চাল ও শস্যের কেজি বা বস্তা পরিমাপ সিলেক্ট করুন:',
        labelEn: 'Select Rice & Grain Kg or Sack Sizes:',
        previewLabelBn: 'বস্তা / কেজি পরিমাপ:',
        previewLabelEn: 'Sack / Weight:',
        presets: DEFAULT_RICE_GRAIN_VARIANTS,
        defaultSelected: ['5kg', '10kg', '25kg Sack'],
        defaultActive: '5kg',
        placeholder: language === 'bn' ? 'যেমনঃ 5kg, 25kg Sack, 50kg' : 'e.g. 5kg, 25kg Sack, 50kg'
      };
    }
    if (isPackageCategory || selectedCatId === 'combo-package-builder') {
      return {
        type: 'combo',
        titleBn: '৪. কম্বো প্যাকেজ বা অফার ভেরিয়েন্ট',
        titleEn: '4. COMBO PACKAGE & SAVER OFFER VARIATIONS',
        labelBn: 'কম্বো প্যাকেজ বা অফারের সাইজ নির্ধারণ করুন (Package Tiers):',
        labelEn: 'Select Combo Package Tier or Offer Type:',
        previewLabelBn: 'প্যাকেজের ধরন:',
        previewLabelEn: 'Package Size / Tier:',
        presets: ['Family Saver Package', 'Mini Starter Bundle', 'Jumbo Mega Box', 'Month-End Grocery Pack', 'Custom Package'],
        defaultSelected: ['Family Saver Package', 'Mini Starter Bundle', 'Jumbo Mega Box'],
        defaultActive: 'Family Saver Package',
        placeholder: language === 'bn' ? 'যেমনঃ Family Saver, Mini Bundle' : 'e.g. Family Saver, Mini Bundle'
      };
    }
    if (isBookCategory) {
      return {
        type: 'book',
        titleBn: '৪. বইয়ের এডিশন, কভার বা পিস ভেরিয়েন্ট',
        titleEn: '4. BOOK EDITIONS, FORMATS & PCS VARIATIONS',
        labelBn: 'বইয়ের ধরণ, বাইন্ডিং বা পিস নির্বাচন করুন (Formats/Pcs):',
        labelEn: 'Select Book Format, Edition or Pcs:',
        previewLabelBn: 'বইয়ের ফর্ম্যাট / পিস:',
        previewLabelEn: 'Format / Edition / Pcs:',
        presets: DEFAULT_BOOK_VARIANTS,
        defaultSelected: ['1 Pcs', 'Paperback', 'Hardcover'],
        defaultActive: '1 Pcs',
        placeholder: language === 'bn' ? 'যেমনঃ Hardcover, 1 Pcs, E-Book' : 'e.g. Hardcover, 1 Pcs, E-Book'
      };
    }
    if (isCakeBakeryCategory) {
      return {
        type: 'cake',
        titleBn: '৪. কেক, পাউন্ড বা আইটেমের পরিবেশন সাইজ',
        titleEn: '4. CAKE POUND, PORTION & SERVING SIZES',
        labelBn: 'কেকের ওজন বা খাবারের সাইজ সিলেক্ট করুন (Pound/Slice):',
        labelEn: 'Select Cake Weight or Portion Sizes:',
        previewLabelBn: 'পাউন্ড বা সার্ভিস সাইজ:',
        previewLabelEn: 'Pound / Portion Size:',
        presets: DEFAULT_CAKE_BAKERY_VARIANTS,
        defaultSelected: ['1 Pound', '2 Pound', '1 Slice'],
        defaultActive: '1 Pound',
        placeholder: language === 'bn' ? 'যেমনঃ 1.5 Pound, Family Box, Combo' : 'e.g. 1.5 Pound, Family Box, Combo'
      };
    }
    if (isLiquidCategory) {
      return {
        type: 'liquid',
        titleBn: '৪. তরল ও পানীয় পরিমাপের ভেরিয়েন্ট',
        titleEn: '4. LIQUID & BEVERAGE VOLUME VARIATIONS',
        labelBn: 'বোতল বা তরল পরিমাপ সাইজ সিলেক্ট করুন (Volume/Litre):',
        labelEn: 'Select Bottle & Volume Sizes:',
        previewLabelBn: 'তরল পরিমাপ:',
        previewLabelEn: 'Volume / Pack Size:',
        presets: DEFAULT_LIQUID_VARIANTS,
        defaultSelected: ['500ml', '1 Litre', '2 Litre'],
        defaultActive: '1 Litre',
        placeholder: language === 'bn' ? 'যেমনঃ 750ml, 3 Litre, Jar' : 'e.g. 750ml, 3 Litre, Jar'
      };
    }
    if (isSolidFoodCategory) {
      return {
        type: 'food',
        titleBn: '৪. প্যাকেজিং বা ওজনের ভেরিয়েন্ট',
        titleEn: '4. PRODUCT WEIGHT & PACK VARIATIONS',
        labelBn: 'ওজন বা পরিমাপ সিলেক্ট করুন (Weight/Gram/Kg):',
        labelEn: 'Select Weight / Pack Sizes:',
        previewLabelBn: 'ওজন / প্যাকেজিং সাইজ:',
        previewLabelEn: 'Weight / Pack Size:',
        presets: DEFAULT_FOOD_WEIGHTS,
        defaultSelected: ['500g', '1kg'],
        defaultActive: '500g',
        placeholder: language === 'bn' ? 'যেমনঃ 100g, 10kg, 1 Sack' : 'e.g. 100g, 10kg, 1 Sack'
      };
    }
    return {
      type: 'general',
      titleBn: '৪. প্যাক, পিস বা পরিমাপের ভেরিয়েন্ট',
      titleEn: '4. PACK, PIECE & UNIT SIZE VARIATIONS',
      labelBn: 'পিস, প্যাক বা একক পরিমাপ সিলেক্ট করুন (Unit/Pcs):',
      labelEn: 'Select Unit, Pack Size or Pcs:',
      previewLabelBn: 'একক পরিমাপ / পিস:',
      previewLabelEn: 'Unit / Pack / Pcs:',
      presets: DEFAULT_GENERAL_VARIANTS,
      defaultSelected: ['1 Pcs', '1 Pack', 'Box'],
      defaultActive: '1 Pcs',
      placeholder: language === 'bn' ? 'যেমনঃ 1 Pcs, Box, 1 Strip' : 'e.g. 1 Pcs, Box, 1 Strip'
    };
  };

  const variantConfig = getCategoryVariantConfig();

  // Auto pick active variant when category changes
  useEffect(() => {
    if (isClothingCategory) {
      setActiveEditingVariant('M');
      setSimulatedSize('M');
    } else if (isElectronicsCategory) {
      setActiveEditingVariant('8GB/128GB');
      setSimulatedStorage('8GB/128GB');
    } else {
      const cfg = getCategoryVariantConfig();
      setSelectedWeights(cfg.defaultSelected);
      setActiveEditingVariant(cfg.defaultActive);
      setSimulatedWeight(cfg.defaultActive);
    }
  }, [selectedCatId, customCategoryInput]);

  // Auto pick first variant in preview when variant options list changes
  useEffect(() => {
    if (selectedSizes.length > 0) setSimulatedSize(selectedSizes[0]);
  }, [selectedSizes]);

  useEffect(() => {
    if (selectedColors.length > 0) setSimulatedColor(selectedColors[0]);
  }, [selectedColors]);

  useEffect(() => {
    if (selectedStorage.length > 0) setSimulatedStorage(selectedStorage[0]);
  }, [selectedStorage]);

  useEffect(() => {
    if (selectedElecColors.length > 0) setSimulatedElecColor(selectedElecColors[0]);
  }, [selectedElecColors]);

  useEffect(() => {
    if (selectedWeights.length > 0) setSimulatedWeight(selectedWeights[0]);
  }, [selectedWeights]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch current inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const playSystemSound = (type: 'success' | 'delete' | 'add') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'delete') {
        osc.frequency.setValueAtTime(392.00, ctx.currentTime); // G4
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(261.63, ctx.currentTime + 0.15); // C4
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'add') {
        // High ascending triad
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('Audio feedback context blocked or not supported:', e);
    }
  };

  const [isGeneratingAiDesc, setIsGeneratingAiDesc] = useState(false);
  const [isGeneratingEditAiDesc, setIsGeneratingEditAiDesc] = useState(false);

  const handleAiCopywrite = async (isEdit: boolean) => {
    const title = isEdit ? editTitle : builderTitle;
    const brand = isEdit ? editBrand : builderBrand;
    const catId = isEdit ? editCategoryId : selectedCatId;
    const catObj = categories.find(c => c.id === catId);
    const categoryName = catObj ? catObj.name : 'General';

    if (!title.trim()) {
      alert(language === 'bn' 
        ? 'অনুগ্রহ করে প্রথমে পণ্যের নাম (Title) লিখুন।' 
        : 'Please enter a product title first.');
      return;
    }

    if (isEdit) {
      setIsGeneratingEditAiDesc(true);
    } else {
      setIsGeneratingAiDesc(true);
    }

    try {
      const res = await api.generateAiCopywriter({ title, brand, categoryName });
      if (isEdit) {
        setEditDescription(res.descEn);
        setEditDescriptionBn(res.descBn);
      } else {
        setBuilderDesc(res.descEn);
        setBuilderDescBn(res.descBn);
      }
      playSystemSound('success');
    } catch (err) {
      console.error(err);
    } finally {
      if (isEdit) {
        setIsGeneratingEditAiDesc(false);
      } else {
        setIsGeneratingAiDesc(false);
      }
    }
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setEditTitle(p.title);
    setEditTitleBn(p.titleBn || p.title);
    setEditBrand(p.brand || '');
    setEditCategoryId(p.categoryId);
    setEditWarranty(p.warranty || 'Purity & Quality Guaranteed');
    setEditDescription(p.description || '');
    setEditDescriptionBn(p.descriptionBn || '');
    setEditPrice(p.price);
    setEditDiscount(p.discountPrice);
    setEditStock(p.stock);
    
    const imgs = [...(p.images || [])];
    while (imgs.length < 4) {
      imgs.push('');
    }
    setEditImageUrls(imgs.slice(0, 4));
    setEditCustomSpecs(p.customSpecs || []);
    setIsEditModalOpen(true);
  };

  const handleSaveFullEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editTitle.trim()) {
      alert(language === 'bn' ? 'দয়া করে প্রোডাক্টের নাম লিখুন!' : 'Please specify product name!');
      return;
    }
    if (!editPrice || editPrice <= 0) {
      alert(language === 'bn' ? 'দয়া করে সঠিক মূল্য নির্ধারণ করুন!' : 'Please specify a valid price!');
      return;
    }

    try {
      const categoryObj = categories.find(c => c.id === editCategoryId) || categories[0];
      const finalImages = editImageUrls.filter(url => url.trim() !== '');
      if (finalImages.length === 0) {
        finalImages.push('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
      }

      const updatedPayload = {
        title: editTitle,
        titleBn: editTitleBn || editTitle,
        price: Number(editPrice),
        discountPrice: editDiscount ? Number(editDiscount) : undefined,
        stock: Number(editStock) || 0,
        categoryId: editCategoryId,
        categoryName: categoryObj?.name || 'BD Foods & Organic',
        brand: editBrand || 'Local BD',
        description: editDescription,
        descriptionBn: editDescriptionBn || editDescription,
        images: finalImages,
        warranty: editWarranty || 'Purity & Quality Guaranteed',
        customSpecs: editCustomSpecs.filter(s => s.label.trim() !== '' && s.value.trim() !== '')
      };

      const updated = await api.updateProduct(editingProduct.id, updatedPayload);
      
      setProducts(prev => prev.map(item => item.id === editingProduct.id ? { ...item, ...updated } : item));
      setIsEditModalOpen(false);
      setEditingProduct(null);
      playSystemSound('success');
      refreshProducts();
      
      alert(language === 'bn' ? 'পণ্যটি সফলভাবে এডিট ও আপডেট করা হয়েছে!' : 'Product updated successfully!');
    } catch (err) {
      console.error('Failed to update product details:', err);
      alert(language === 'bn' ? 'দুঃখিত, পণ্যটি এডিট করতে সমস্যা হয়েছে।' : 'Error saving product edits.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!hasPermission(effectiveUser, 'delete_product')) {
      alert(language === 'bn' 
        ? 'দুঃখিত, আপনার পণ্য ডিলিট করার পারমিশন নেই!' 
        : 'Access Denied: You do not have permission to delete products!');
      return;
    }
    const confirmationMsg = language === 'bn' 
      ? 'আপনি কি নিশ্চিত যে আপনি আমারবাজার প্ল্যাটফর্ম থেকে এই পণ্যটি ডিলিট করতে চান?' 
      : 'Are you sure you want to delete this product listing from AmarBazar?';
    if (!window.confirm(confirmationMsg)) return;
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(item => item.id !== id));
      playSystemSound('delete');
      refreshProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Error deleting product listing.');
    }
  };

  // Add customized values to size/color variant arrays
  const addCustomSize = () => {
    if (!customSizeText.trim()) return;
    const trimmed = customSizeText.trim();
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes([...selectedSizes, trimmed]);
    }
    setCustomSizeText('');
  };

  const addCustomColor = () => {
    if (!customColorText.trim()) return;
    const trimmed = customColorText.trim();
    if (!selectedColors.includes(trimmed)) {
      setSelectedColors([...selectedColors, trimmed]);
    }
    setCustomColorText('');
  };

  const addCustomStorage = () => {
    if (!customStorageText.trim()) return;
    const trimmed = customStorageText.trim();
    if (!selectedStorage.includes(trimmed)) {
      setSelectedStorage([...selectedStorage, trimmed]);
    }
    setCustomStorageText('');
  };

  const addCustomElecColor = () => {
    if (!customElecColorText.trim()) return;
    const trimmed = customElecColorText.trim();
    if (!selectedElecColors.includes(trimmed)) {
      setSelectedElecColors([...selectedElecColors, trimmed]);
    }
    setCustomElecColorText('');
  };

  const addCustomWeight = () => {
    if (!customWeightText.trim()) return;
    const trimmed = customWeightText.trim();
    if (!selectedWeights.includes(trimmed)) {
      setSelectedWeights([...selectedWeights, trimmed]);
    }
    setActiveEditingVariant(trimmed);
    setSimulatedWeight(trimmed);
    setCustomWeightText('');
  };

  // Save custom price & stock for specific variant (e.g. 500g, 1kg, M, L, etc.)
  const handleSaveVariantPrice = () => {
    const variantKey = activeEditingVariant || (
      isClothingCategory ? (selectedSizes[0] || 'Standard') :
      isElectronicsCategory ? (selectedStorage[0] || 'Standard') :
      (selectedWeights[0] || '500g')
    );

    const priceVal = Number(builderPrice) || 0;
    const discountVal = builderDiscount ? Number(builderDiscount) : priceVal;
    const stockVal = Number(builderStock) || 0;

    if (priceVal <= 0) {
      alert(language === 'bn' ? 'অনুগ্রহ করে সঠিক স্থান অনুযায়ী মূল্য নির্ধারণ করুন।' : 'Please enter a valid price.');
      return;
    }

    setBuilderVariantPrices(prev => ({
      ...prev,
      [variantKey]: {
        price: discountVal || priceVal,
        regularPrice: priceVal,
        discountPrice: discountVal,
        stock: stockVal
      }
    }));

    playSystemSound('success');

    // Sync simulated active variant in Live Preview
    if (isElectronicsCategory) {
      setSimulatedStorage(variantKey);
    } else if (isClothingCategory) {
      setSimulatedSize(variantKey);
    } else {
      setSimulatedWeight(variantKey);
    }

    const msg = language === 'bn' 
      ? `✓ "${variantKey}" এর জন্য মূল্য ৳${discountVal} (নিয়মিত ৳${priceVal}, স্টক ${stockVal}) সেভ হয়েছে!`
      : `✓ Saved price for "${variantKey}": ৳${discountVal} (Regular ৳${priceVal}, Stock ${stockVal})`;
    
    setVariantSaveToast(msg);
    setTimeout(() => setVariantSaveToast(null), 4000);
  };

  const handleRemoveVariantPrice = (vKey: string) => {
    setBuilderVariantPrices(prev => {
      const copy = { ...prev };
      delete copy[vKey];
      return copy;
    });
    playSystemSound('delete');
  };

  // BUILD AND SAVE DYNAMICALLY CONFIGURED PRODUCT
  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderTitle.trim()) {
      alert('Please enter a product title.');
      return;
    }

    try {
      const selectedCategoryName = selectedCatId === 'custom'
        ? (customCategoryInput.trim() || 'Custom')
        : (categories.find(c => c.id === selectedCatId)?.name || 'General');
      
      // Build internal product variants array
      const variantsList: ProductVariant[] = [];
      if (isClothingCategory) { // Fashion/Clothing
        if (selectedSizes.length > 0) {
          variantsList.push({
            id: `v-size-${Date.now()}`,
            name: 'Size',
            options: selectedSizes
          });
        }
        if (selectedColors.length > 0) {
          variantsList.push({
            id: `v-color-${Date.now()}`,
            name: 'Color',
            options: selectedColors
          });
        }
      } else if (isElectronicsCategory) { // Electronics
        if (selectedStorage.length > 0) {
          variantsList.push({
            id: `v-storage-${Date.now()}`,
            name: 'Storage/RAM',
            options: selectedStorage
          });
        }
        if (selectedElecColors.length > 0) {
          variantsList.push({
            id: `v-color-${Date.now()}`,
            name: 'Color',
            options: selectedElecColors
          });
        }
      } else { // Category-specific dynamic variants
        if (selectedWeights.length > 0) {
          const variantName = isEggCategory ? 'Quantity / Pack'
            : isShoeCategory ? 'Shoe Size'
            : isSareeEthnicCategory ? 'Size / Type'
            : isBabyCareCategory ? 'Baby Size / Weight'
            : isMedicineCategory ? 'Dosage / Unit'
            : isElectricalCategory ? 'Wattage / Length'
            : isCleaningCategory ? 'Volume / Refill'
            : isGardeningCategory ? 'Pot Size / Plant'
            : isRiceGrainCategory ? 'Sack / Weight'
            : isComboPackCategory ? 'Combo / Saver Offer'
            : isBookCategory ? 'Edition / Format'
            : isCakeBakeryCategory ? 'Pound / Portion'
            : isLiquidCategory ? 'Volume'
            : isSolidFoodCategory ? 'Weight / Pack Size'
            : 'Unit / Pcs';

          variantsList.push({
            id: `v-pack-${Date.now()}`,
            name: variantName,
            options: selectedWeights
          });
        }
      }

      let finalDesc = builderDesc;
      let finalDescBn = builderDescBn || builderDesc;

      if ((isPackageCategory || selectedCatId === 'combo-package-builder') && packageItems.length > 0) {
        const packageItemsListBn = packageItems.map(i => `• ${i.name} (${i.qty}) - ৳${i.price}`).join('\n');
        finalDescBn = `${finalDescBn ? finalDescBn + '\n\n' : ''}🎁 প্যাকেজে অন্তর্ভুক্ত আইটেমসমূহ:\n${packageItemsListBn}${savingsAmount > 0 ? `\n\n💰 পৃথক মোট মূল্য: ৳${totalItemsRegularPrice} | প্যাকেজে মোট সাশ্রয়: ৳${savingsAmount}` : ''}`;
        finalDesc = `${finalDesc ? finalDesc + '\n\n' : ''}Package Items Included:\n${packageItems.map(i => `• ${i.name} (${i.qty}) - ৳${i.price}`).join('\n')}`;
      }

      const payload = {
        title: builderTitle.trim(),
        titleBn: (builderTitleBn || builderTitle).trim(),
        price: Number(builderPrice) || 100,
        discountPrice: builderDiscount ? Number(builderDiscount) : undefined,
        stock: Number(builderStock) || 0,
        categoryId: selectedCatId,
        categoryName: selectedCategoryName,
        brand: builderBrand || 'Local Store',
        description: finalDesc,
        descriptionBn: finalDescBn,
        sellerId: currentUser?.id || 'sel-1',
        sellerName: (currentUser as any)?.storeName || currentUser?.name || 'AmarBazar Official Mall',
        images: customImageUrls.length > 0 ? customImageUrls : [activeImageUrl],
        sku: builderSku,
        warranty: warrantyPolicy || builderWarranty,
        warrantyPolicy,
        returnPolicy,
        deliveryTime,
        isFreeDelivery,
        deliveryChargeInside: isFreeDelivery ? 0 : (Number(deliveryChargeInside) || 60),
        deliveryChargeOutside: isFreeDelivery ? 0 : (Number(deliveryChargeOutside) || 120),
        isCodAvailable,
        isExpressDelivery,
        variants: variantsList,
        variantPrices: builderVariantPrices,
        tags: [selectedCategoryName.toLowerCase(), 'new', 'published'],
        isFeatured: true,
        isApproved: true
      };

      const newProduct = await api.createProduct(payload);
      
      playSystemSound('add');
      
      // Refresh product list and go to catalog tab
      await fetchInventory();
      await refreshProducts();

      // Automatically go to public customer view and select the product
      setSelectedProduct(newProduct);
      setActivePanel('customer');
    } catch (err: any) {
      console.error('Error publishing product:', err);
      alert(language === 'bn' 
        ? 'পণ্য তালিকাভুক্ত করার সময় সমস্যা হয়েছে। অনুগ্রহ করে ইনপুট চেক করুন।' 
        : 'Error publishing product. Please check the inputs.');
    }
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || 
           (p.titleBn && p.titleBn.toLowerCase().includes(q)) ||
           p.brand.toLowerCase().includes(q) ||
           p.categoryName.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center">
            <Package className="w-6 h-6 mr-2 text-amber-500 animate-pulse" />
            {language === 'bn' ? 'সরাসরি পণ্য তালিকা ও মূল্য নির্ধারণ' : language === 'ar' ? 'إدارة كتالوج المنتجات' : 'Inventory Workspace'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            {language === 'bn' 
              ? 'এখানে আপনি নতুন পণ্য যুক্ত করতে পারবেন, পণ্যের দাম নির্ধারণ করতে পারবেন এবং সরাসরি পণ্য ডিলিট বা এডিট করতে পারবেন।' 
              : language === 'ar' 
              ? 'أضف منتجات جديدة، وحدد أسعارًا، وعدل مستويات المخزون، وقم ببناء تفاصيل للملابس والأجهزة بسهولة.' 
              : 'Add new products, configure regular & discount prices, define stock counts, and edit variants.'}
          </p>
        </div>

        {/* Dynamic Sounds Activator */}
        <div className="flex items-center space-x-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-600 dark:text-amber-400 rounded-xl">
          <Volume2 className="w-3.5 h-3.5 mr-1" />
          <span>Sound System: Active</span>
        </div>
      </div>

      {/* Tabs Row - Positioned directly above Section 1 / Catalog Content */}
      <div className="bg-slate-100/80 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 grid grid-cols-2 gap-2 text-xs font-bold shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`py-2.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'catalog' 
              ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-400' 
              : 'bg-white/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {language === 'bn' ? `বর্তমান স্টক তালিকা (${products.length})` : `Inventory Catalog (${products.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('builder')}
          className={`py-2.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 relative overflow-hidden cursor-pointer ${
            activeTab === 'builder' 
              ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-400' 
              : 'bg-white/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-300 shrink-0" />
          <span className="truncate">
            {language === 'bn' ? 'প্রফেশনাল প্রোডাক্ট বিল্ডার' : 'Product Details Builder'}
          </span>
          <span className="bg-emerald-500 text-slate-950 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full ml-1 tracking-wider uppercase animate-bounce shrink-0">
            Pro
          </span>
        </button>
      </div>

      {/* 1. CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'bn' ? "পণ্য খুঁজুন (নাম, ব্র্যান্ড বা ক্যাটাগরি)..." : "Filter products by title, category, or brand..."}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Catalog list table */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
              <span className="text-xs text-slate-400 font-semibold">Retrieving product catalogs...</span>
            </div>
          ) : error ? (
            <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-center text-xs text-red-600 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
              No matching products found in the catalog.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-150 dark:border-slate-750">
                      <th className="p-4 w-5/12">Product Information</th>
                      <th className="p-4 w-2/12">Stock Count</th>
                      <th className="p-4 w-3/12">Price & Discounts (৳)</th>
                      <th className="p-4 text-right w-2/12">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {filtered.map(p => {
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                          <td className="p-4">
                            <div className="flex items-center space-x-3 min-w-0">
                              <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-100 dark:bg-slate-900" />
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {language === 'bn' ? (p.titleBn || p.title) : language === 'ar' ? (p.titleAr || p.title) : p.title}
                                </h4>
                                <div className="flex flex-wrap gap-2 mt-1 items-center text-[10px] text-slate-400">
                                  <span className="font-semibold text-amber-500">{p.brand}</span>
                                  <span>•</span>
                                  <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-300 font-mono">
                                    {p.sku}
                                  </span>
                                  <span>•</span>
                                  <span className="text-slate-500 dark:text-slate-300 font-semibold">
                                    {p.categoryName}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`font-bold px-2.5 py-1 rounded text-[10px] ${
                              p.stock > 10 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : p.stock > 0 
                                ? 'bg-amber-500/10 text-amber-500' 
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                                ৳{(p.discountPrice || p.price).toLocaleString()}
                              </span>
                              {p.discountPrice && (
                                <p className="text-[10px] text-slate-400 line-through">
                                  ৳{p.price.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-1.5">
                              <button
                                onClick={() => handleStartEdit(p)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition cursor-pointer shadow-xs border border-slate-200 dark:border-slate-600"
                                title="Edit listing details"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                disabled={!hasPermission(effectiveUser, 'delete_product')}
                                className={`p-1.5 rounded-lg transition cursor-pointer shadow-xs ${
                                  !hasPermission(effectiveUser, 'delete_product')
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                                    : 'bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-200 dark:border-red-900/30'
                                }`}
                                title={!hasPermission(effectiveUser, 'delete_product') ? 'No permission to delete products' : 'Delete listing'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ADVANCED PRODUCT DETAILS BUILDER TAB */}
      {activeTab === 'builder' && (
        <form onSubmit={handlePublishProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Category selection */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
                  <span className="bg-amber-500 text-slate-950 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black mr-2">1</span>
                  {language === 'bn' ? '১. পণ্যের ক্যাটাগরি নির্বাচন করুন' : '1. SELECT PRODUCT CATEGORY'}
                </h3>
              </div>

              {/* Quick Category Bar (With Package Builder at Front) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCatId('combo-package-builder');
                    setCustomCategoryInput('প্যাকেজ ও কম্বো (Package Bundle)');
                    if (!builderTitle.trim()) {
                      setBuilderTitle('পারিবারিক গ্রোসারি ধামাকা কম্বো প্যাকেজ');
                      setBuilderTitleBn('পারিবারিক গ্রোসারি ধামাকা কম্বো প্যাকেজ');
                    }
                    if (!builderPrice) {
                      setBuilderPrice('890');
                    }
                    setActiveEditingVariant('Family Saver Package');
                    setSimulatedWeight('Family Saver Package');
                  }}
                  className={`px-3 py-1.5 text-xs font-black rounded-xl border flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
                    selectedCatId === 'combo-package-builder'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-500/50'
                      : 'bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 text-slate-900 dark:text-amber-300 border-amber-500/50 hover:border-amber-500 shadow-xs'
                  }`}
                >
                  <span className="text-sm">🎁</span>
                  <span>{language === 'bn' ? 'প্যাকেজ ও কম্বো বানান' : 'Create Package Bundle'}</span>
                  <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded uppercase">
                    HOT
                  </span>
                </button>

                {[
                  { id: 'groceries-spices', emoji: '🌶️', bn: 'মুদি ও মসলা', en: 'Groceries' },
                  { id: 'grain-rice', emoji: '🌾', bn: 'চাল ও শস্য', en: 'Rice & Grains' },
                  { id: 'cat-2', emoji: '👕', bn: 'পোশাক ও ফ্যাশন', en: 'Fashion' },
                  { id: 'cat-1', emoji: '📱', bn: 'গ্যাজেট ও ডিভাইসেস', en: 'Gadgets' },
                  { id: 'eggs', emoji: '🥚', bn: 'ফার্মের ডিম', en: 'Eggs' }
                ].map(qCat => {
                  const isQSel = selectedCatId === qCat.id;
                  return (
                    <button
                      key={qCat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCatId(qCat.id);
                        setCustomCategoryInput(language === 'bn' ? qCat.bn : qCat.en);
                      }}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border flex items-center space-x-1 shrink-0 transition cursor-pointer ${
                        isQSel
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500 font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <span>{qCat.emoji}</span>
                      <span>{language === 'bn' ? qCat.bn : qCat.en}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-amber-500 shrink-0 cursor-pointer flex items-center space-x-1"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '+ সব ক্যাটাগরি' : '+ All Categories'}</span>
                </button>
              </div>

              {/* Three inline options: 1. Custom Category Input, 2. Search Input, 3. Toggle Button Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* 1. Custom category box */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {language === 'bn' ? 'ক্যাটাগরি নিজে লিখুন' : 'Type Custom Category'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'যেমন: খেলনা, বই ইত্যাদি...' : 'e.g. Toys, Books etc...'}
                    value={customCategoryInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomCategoryInput(val);
                      if (val.trim()) {
                        setSelectedCatId('custom');
                      } else {
                        setSelectedCatId('cat-2');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition shadow-2xs"
                  />
                </div>

                {/* 2. Search category box */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {language === 'bn' ? 'ক্যাটাগরি খুঁজুন' : 'Search Categories'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={language === 'bn' ? 'ক্যাটাগরি সার্চ করুন...' : 'Search preset list...'}
                      value={categorySearchQuery}
                      onChange={(e) => {
                        setCategorySearchQuery(e.target.value);
                        if (e.target.value) {
                          setShowAllCategories(true);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition shadow-2xs"
                    />
                    {categorySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCategorySearchQuery('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Toggle button icon */}
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className={`w-full py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-2xs ${
                      showAllCategories 
                        ? 'bg-amber-500 border-amber-500 text-slate-950' 
                        : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-350 dark:hover:border-slate-600'
                    }`}
                    title={language === 'bn' ? 'ক্যাটাগরি তালিকা টগল করুন' : 'Toggle Preset List'}
                  >
                    <Tag className="w-4 h-4" />
                    <span className="sm:hidden text-[11px]">{language === 'bn' ? 'তালিকা' : 'Presets'}</span>
                    <span className="bg-slate-950/10 dark:bg-white/20 text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                      {categories.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Show custom category active message if active */}
              {selectedCatId === 'custom' && (
                <div className="flex items-center space-x-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-2 rounded-xl border border-amber-500/20 text-xs font-bold animate-in fade-in duration-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>
                    {language === 'bn' 
                      ? `সক্রিয় ক্যাটাগরি: "${customCategoryInput || 'কাস্টম'}" (আপনার কাস্টম লিখিত)`
                      : `Active Category: "${customCategoryInput || 'Custom'}" (Custom typed)`}
                  </span>
                </div>
              )}

              {/* Categories preset display toggled or searched */}
              {(showAllCategories || categorySearchQuery) && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-1 duration-150 space-y-2">
                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{language === 'bn' ? 'সকল ক্যাটাগরি তালিকা (ছবি সহ)' : 'All Preset Categories (With Badges)'}</span>
                    <button 
                      type="button" 
                      onClick={() => setShowAllCategories(false)}
                      className="text-[10px] text-amber-500 hover:underline uppercase font-bold cursor-pointer"
                    >
                      {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1 max-h-80 overflow-y-auto pr-1">
                    {ALL_FRONTEND_CATEGORIES
                      .filter(cat => {
                        const nameToSearch = (language === 'bn' ? cat.nameBn : cat.name).toLowerCase();
                        return nameToSearch.includes(categorySearchQuery.toLowerCase());
                      })
                      .map(cat => {
                        const isSelected = selectedCatId === cat.id || customCategoryInput.toLowerCase() === (language === 'bn' ? cat.nameBn : cat.name).toLowerCase();
                        const isComboBuilder = cat.id === 'combo-package-builder';

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCatId(cat.id);
                              // Automatically set the custom category text box with the selected preset name
                              const selectedName = language === 'bn' ? cat.nameBn : cat.name;
                              setCustomCategoryInput(selectedName);
                              // Close the dropdown list automatically
                              setShowAllCategories(false);
                              setCategorySearchQuery('');

                              if (cat.id === 'combo-package-builder') {
                                if (!builderTitle.trim()) {
                                  setBuilderTitle('পারিবারিক গ্রোসারি ধামাকা কম্বো প্যাকেজ');
                                  setBuilderTitleBn('পারিবারিক গ্রোসারি ধামাকা কম্বো প্যাকেজ');
                                }
                                if (!builderPrice) {
                                  setBuilderPrice('890');
                                }
                                setActiveEditingVariant('Family Saver Package');
                                setSimulatedWeight('Family Saver Package');
                                return;
                              }

                              const isCloth = ['cat-2', 'sarees-ethnic', 'cat-8', 'cat-9'].includes(cat.id) || 
                                /পোশাক|শাড়ি|জুতা|স্যান্ডেল|ফ্যাশন|কসমেটিক্স|গহনা|টি-শার্ট|শার্ট|প্যান্ট|পাঞ্জাবি|পোলো|fashion|clothing|saree|shoe|sandal|dress|shirt|tshirt|t-shirt|pant|panjabi|polo/i.test(selectedName);

                              const isElec = !isCloth && (
                                ['cat-1', 'cat-6'].includes(cat.id) || 
                                /ইলেকট্রনিক্স|গ্যাজেট|ফোন|মোবাইল|ইলেকট্রিক্যাল|electronics|gadget|mobile|phone|laptop|headphone|device|tv|camera/i.test(selectedName)
                              );

                              if (isCloth) {
                                setActiveEditingVariant('M');
                                setSimulatedSize('M');
                              } else if (isElec) {
                                setActiveEditingVariant('8GB/128GB');
                                setSimulatedStorage('8GB/128GB');
                              } else {
                                setActiveEditingVariant('500g');
                                setSimulatedWeight('500g');
                              }
                            }}
                            className={`p-2 rounded-xl border flex items-center space-x-2 text-left transition cursor-pointer group relative ${
                              isComboBuilder
                                ? isSelected
                                  ? 'bg-amber-500/20 border-amber-500 text-slate-900 dark:text-white shadow-md ring-2 ring-amber-500'
                                  : 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-500/20 dark:to-slate-800 border-amber-500/60 hover:border-amber-500 text-slate-900 dark:text-amber-300 font-extrabold shadow-sm'
                                : isSelected 
                                  ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-amber-500/50'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500/50 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {/* Round Circular Bubble Picture / Emoji */}
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110 shadow-2xs ${
                              isComboBuilder
                                ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400'
                                : isSelected 
                                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400' 
                                  : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700'
                            }`}>
                              <span>{cat.emoji || '🎁'}</span>
                            </div>
                            <div className="truncate min-w-0 flex-1">
                              <span className="block text-xs font-bold truncate leading-tight flex items-center justify-between">
                                <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                                {isComboBuilder && (
                                  <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1 py-0.2 rounded ml-1 uppercase">
                                    NEW
                                  </span>
                                )}
                              </span>
                              <span className="block text-[9px] text-slate-400 truncate mt-0.5">
                                {cat.id}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    {ALL_FRONTEND_CATEGORIES.filter(cat => {
                      const nameToSearch = (language === 'bn' ? cat.nameBn : cat.name).toLowerCase();
                      return nameToSearch.includes(categorySearchQuery.toLowerCase());
                    }).length === 0 && (
                      <div className="col-span-full py-4 text-center">
                        <p className="text-xs text-slate-400 italic">
                          {language === 'bn' ? 'কোনো ক্যাটাগরি খুঁজে পাওয়া যায়নি।' : 'No categories match your search.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Images Preset Picker */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-amber-500 text-slate-950 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black mr-2">2</span>
                  <span>{language === 'bn' ? '২. গ্যালারি থেকে এক বা একাধিক ছবি নির্বাচন করুন' : '2. UPLOAD ONE OR MULTIPLE PRODUCT IMAGES'}</span>
                </div>
                {customImageUrls.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomImageUrls([]);
                      setCustomImageUrl('');
                    }}
                    className="text-[10px] font-extrabold text-red-500 hover:text-red-600 uppercase flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'bn' ? 'সব মুছুন' : 'Clear All'}</span>
                  </button>
                )}
              </h3>
              
              <div className="space-y-4">
                {customImageUrls.length > 0 ? (
                  <div className="space-y-3.5">
                    {/* Grid of uploaded images */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {customImageUrls.map((url, idx) => {
                        const isMain = url === activeImageUrl;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setCustomImageUrl(url)}
                            className={`relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition group shadow-2xs ${
                              isMain 
                                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                            }`}
                          >
                            <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                            
                            {/* Star Badge for Main Image */}
                            <div className="absolute top-1 left-1">
                              <span className={`p-0.5 rounded-md text-[8px] font-black uppercase flex items-center justify-center shadow-xs ${
                                isMain 
                                  ? 'bg-amber-500 text-slate-950' 
                                  : 'bg-black/60 text-white opacity-0 group-hover:opacity-100'
                              }`} title={isMain ? "Main/Primary Image" : "Set as Main"}>
                                <Star className={`w-2.5 h-2.5 ${isMain ? 'fill-current' : ''}`} />
                              </span>
                            </div>
 
                            {/* Remove Specific Image */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = customImageUrls.filter((_, i) => i !== idx);
                                setCustomImageUrls(updated);
                                if (url === customImageUrl) {
                                  setCustomImageUrl(updated[0] || '');
                                }
                              }}
                              className="absolute top-1 right-1 p-0.5 bg-red-600/90 hover:bg-red-700 text-white rounded-md shadow-2xs transition opacity-0 group-hover:opacity-100 z-10"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
 
                      {/* "+" Add more images card slot inside the grid */}
                      <label className="aspect-square rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500/50 dark:hover:border-amber-500/50 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/40 transition group">
                        <div className="p-1.5 bg-amber-500/10 rounded-full text-amber-500 group-hover:scale-110 transition">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase text-center tracking-tighter">
                          {language === 'bn' ? 'যোগ করুন' : 'Add'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setIsUploadingImage(true);
                              const filesArray = Array.from(e.target.files) as File[];
                              const promises = filesArray.map((file) => compressAndReadImage(file));
                              const results = await Promise.all(promises);
                              const valid = results.filter(r => r !== '');
                              setCustomImageUrls(prev => [...prev, ...valid]);
                              if (valid.length > 0 && !customImageUrl) {
                                setCustomImageUrl(valid[0]);
                              }
                              setIsUploadingImage(false);
                            }
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {isUploadingImage && (
                      <p className="text-xs font-bold text-amber-500 animate-pulse text-center flex items-center justify-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'bn' ? 'ছবি প্রক্রিয়াকরণ করা হচ্ছে...' : 'Compressing and processing images...'}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-semibold italic text-center">
                      {language === 'bn' 
                        ? '💡 যেকোনো ছবির উপর ক্লিক করে সেটিকে প্রধান (Primary) ছবি হিসেবে সেট করুন।'
                        : '💡 Click any image thumbnail to set it as the Primary/Main product image.'
                      }
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-amber-500/50 dark:hover:border-amber-500/50 transition duration-200 bg-slate-50/50 dark:bg-slate-900/40 py-8 px-4 text-center group">
                    <div className="p-4 bg-amber-500/10 rounded-full text-amber-500 mb-3 group-hover:scale-110 transition duration-200">
                      {isUploadingImage ? (
                        <RefreshCw className="w-8 h-8 animate-spin" />
                      ) : (
                        <ImageIcon className="w-8 h-8" />
                      )}
                    </div>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 block">
                      {isUploadingImage 
                        ? (language === 'bn' ? 'ছবি প্রসেস হচ্ছে...' : 'Processing images...') 
                        : (language === 'bn' ? 'গ্যালারি থেকে এক বা একাধিক ছবি নির্বাচন করুন' : 'Select Product Images from Gallery')}
                    </span>
                    <span className="text-xs text-slate-400 mt-1.5 block max-w-xs">
                      {language === 'bn' ? 'ক্লিক করে আপনার গ্যালারি বা ফাইল থেকে এক বা একাধিক ছবি বেছে নিন' : 'Click here to pick one or more image files from your device gallery'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setIsUploadingImage(true);
                          const filesArray = Array.from(e.target.files) as File[];
                          const promises = filesArray.map((file) => compressAndReadImage(file));
                          const results = await Promise.all(promises);
                          const valid = results.filter(r => r !== '');
                          setCustomImageUrls(valid);
                          if (valid.length > 0) {
                            setCustomImageUrl(valid[0]);
                          }
                          setIsUploadingImage(false);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 mb-1.5">
                  {language === 'bn' ? 'অথবা কাস্টম ছবির লিংক দিন (Image URL):' : 'Or paste a Custom Image URL:'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <ImageIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => {
                        setCustomImageUrl(e.target.value);
                        setSelectedPresetIdx(-1);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customImageUrl.trim()) {
                          e.preventDefault();
                          const trimmed = customImageUrl.trim();
                          if (!customImageUrls.includes(trimmed)) {
                            setCustomImageUrls(prev => [...prev, trimmed]);
                          }
                        }
                      }}
                      placeholder="https://images.unsplash.com/your-custom-photo..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  {customImageUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = customImageUrl.trim();
                        if (trimmed && !customImageUrls.includes(trimmed)) {
                          setCustomImageUrls(prev => [...prev, trimmed]);
                        }
                      }}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shrink-0"
                    >
                      {language === 'bn' ? 'যোগ করুন' : 'Add URL'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Product description & specifications */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
                  <span className="bg-amber-500 text-slate-950 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black mr-2">3</span>
                  {language === 'bn' ? '৩. পণ্যের মৌলিক বিবরণ ও তথ্য' : '3. PRODUCT DESCRIPTION & SPECIFICATIONS'}
                </h3>
                <button
                  type="button"
                  disabled={isGeneratingAiDesc}
                  onClick={() => handleAiCopywrite(false)}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold text-[11px] rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isGeneratingAiDesc ? 'animate-spin' : ''}`} />
                  <span>
                    {isGeneratingAiDesc 
                      ? (language === 'bn' ? 'এআই লিখছে...' : 'AI Writing...') 
                      : (language === 'bn' ? 'এআই কপিরাইটার (Auto-Write)' : 'AI Copywriter')}
                  </span>
                </button>
              </div>

              {/* Grid block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    {language === 'bn' ? 'পণ্যের নাম (ইংরেজিতে)*:' : 'Product Title (English)*:'}
                  </label>
                  <input
                    type="text"
                    value={builderTitle}
                    onChange={(e) => setBuilderTitle(e.target.value)}
                    required
                    placeholder="e.g. Walton Primo G23 Premium"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    {language === 'bn' ? 'পণ্যের নাম (বাংলায়)*:' : 'Product Title (Bangla)*:'}
                  </label>
                  <input
                    type="text"
                    value={builderTitleBn}
                    onChange={(e) => setBuilderTitleBn(e.target.value)}
                    required
                    placeholder="যেমনঃ ওয়ালটন প্রিমো জি২৩ প্রিমিয়াম"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    {language === 'bn' ? 'ব্র্যান্ড / প্রস্তুতকারক:' : 'Product Brand:'}
                  </label>
                  <input
                    type="text"
                    value={builderBrand}
                    onChange={(e) => setBuilderBrand(e.target.value)}
                    placeholder="Walton / Xiaomi / Local Artisan"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    {language === 'bn' ? 'ওয়ারেন্টি স্ট্যাটাস:' : 'Warranty / Guarantee Info:'}
                  </label>
                  <input
                    type="text"
                    value={builderWarranty}
                    onChange={(e) => setBuilderWarranty(e.target.value)}
                    placeholder="e.g. 1 Year Service Warranty, None"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    {language === 'bn' ? 'পণ্যের মূল বিবরণ ও বৈশিষ্ট্য (ইংরেজিতে):' : 'Product Features / Descriptions (English):'}
                  </label>
                  <textarea
                    rows={2}
                    value={builderDesc}
                    onChange={(e) => setBuilderDesc(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    {language === 'bn' ? 'পণ্যের মূল বিবরণ ও বৈশিষ্ট্য (বাংলায়):' : 'Product Features / Descriptions (Bangla):'}
                  </label>
                  <textarea
                    rows={2}
                    value={builderDescBn}
                    onChange={(e) => setBuilderDescBn(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* PACKAGE ITEMS BUILDER CARD */}
            {(isPackageCategory || selectedCatId === 'combo-package-builder') && (
              <div className="bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-amber-500/10 dark:from-amber-500/10 dark:to-slate-800 rounded-2xl p-5 border-2 border-amber-500/40 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shadow-xs">
                      🎁
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{language === 'bn' ? 'প্যাকেজে অন্তর্ভুক্ত পণ্যসমূহ (Package Items Builder)' : 'Package Items Builder'}</span>
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-md uppercase tracking-wider">
                          {language === 'bn' ? 'প্যাকেজ বিল্ডার' : 'BUNDLE BUILDER'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'bn' 
                          ? 'এই প্যাকেজে কি কি পণ্য থাকছে তা নিচে যুক্ত করুন। আলাদা খুচরা দাম উল্লেখ করলে গ্রাহকের মোট সাশ্রয় নিজে থেকেই হিসাব হবে।' 
                          : 'List items included in this combo package to automatically show total customer savings.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Table / List of items */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                    <span className="col-span-5">{language === 'bn' ? 'পণ্যের নাম' : 'Item Name'}</span>
                    <span className="col-span-3">{language === 'bn' ? 'পরিমাণ/ওজন' : 'Qty / Weight'}</span>
                    <span className="col-span-3">{language === 'bn' ? 'খুচরা মূল্য (৳)' : 'Retail Price (৳)'}</span>
                    <span className="col-span-1 text-center">{language === 'bn' ? 'মুছুন' : 'Del'}</span>
                  </div>

                  {packageItems.map((item, idx) => (
                    <div key={item.id || idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...packageItems];
                          updated[idx].name = e.target.value;
                          setPackageItems(updated);
                        }}
                        placeholder={language === 'bn' ? 'পণ্যের নাম' : 'Item name'}
                        className="col-span-5 px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                      />
                      <input
                        type="text"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...packageItems];
                          updated[idx].qty = e.target.value;
                          setPackageItems(updated);
                        }}
                        placeholder={language === 'bn' ? 'পরিমাণ (যেমন: 5kg)' : 'Qty'}
                        className="col-span-3 px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                      />
                      <input
                        type="number"
                        value={item.price || ''}
                        onChange={(e) => {
                          const updated = [...packageItems];
                          updated[idx].price = Number(e.target.value);
                          setPackageItems(updated);
                        }}
                        placeholder="0"
                        className="col-span-3 px-2.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPackageItems(packageItems.filter((_, i) => i !== idx));
                        }}
                        className="col-span-1 flex justify-center text-red-500 hover:text-red-600 p-1 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add new item row */}
                  <div className="pt-2 flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={language === 'bn' ? 'নতুন পণ্য লিখুন (যেমন: মসুর ডাল)' : 'New item name...'}
                      className="flex-1 min-w-[140px] px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                    />
                    <input
                      type="text"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      placeholder={language === 'bn' ? 'পরিমাণ (যেমন: 1kg)' : 'Qty (e.g. 1kg)'}
                      className="w-24 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                    />
                    <input
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      placeholder={language === 'bn' ? 'দাম (৳)' : 'Price (৳)'}
                      className="w-24 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newItemName.trim()) {
                          setPackageItems([
                            ...packageItems,
                            {
                              id: Date.now().toString(),
                              name: newItemName.trim(),
                              qty: newItemQty.trim() || '1 Pcs',
                              price: Number(newItemPrice) || 0
                            }
                          ]);
                          setNewItemName('');
                          setNewItemQty('');
                          setNewItemPrice('');
                        }
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer shrink-0 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'bn' ? 'পণ্য যোগ করুন' : 'Add Item'}</span>
                    </button>
                  </div>
                </div>

                {/* Savings Summary Banner */}
                <div className="mt-3 p-3 bg-amber-500/10 dark:bg-amber-500/15 rounded-xl border border-amber-500/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {language === 'bn' ? 'বিচ্ছিন্ন পণ্যের মোট বাজারমূল্য:' : 'Individual Retail Price:'}
                    </span>
                    <span className="text-base font-extrabold text-slate-700 dark:text-slate-200 line-through">
                      ৳{totalItemsRegularPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      {language === 'bn' ? 'প্যাকেজে মোট সাশ্রয় (Savings):' : 'Package Savings:'}
                    </span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-end">
                      <Sparkles className="w-4 h-4 mr-1 text-amber-500" />
                      ৳{savingsAmount > 0 ? savingsAmount.toLocaleString() : 0} {savingsAmount > 0 ? `(${Math.round((savingsAmount/totalItemsRegularPrice)*100)}% Discount)` : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC VARIANTS GENERATION BLOCK BASED ON CATEGORY */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
                  <span className="bg-amber-500 text-slate-950 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black mr-2">4</span>
                  {language === 'bn' ? variantConfig.titleBn : variantConfig.titleEn}
                </h3>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-lg font-bold">
                  Bilingual Support
                </span>
              </div>

              {/* CASE A: Clothing & Fashion */}
              {isClothingCategory && (
                <div className="space-y-5">
                  {/* Sizes */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                      {language === 'bn' ? 'পোশাকের সাইজ বা পরিমাপ নির্বাচন করুন (Sizes):' : 'Select Available Sizes:'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_CLOTHING_SIZES.map(sz => {
                        const isIncluded = selectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              if (isIncluded) {
                                setSelectedSizes(selectedSizes.filter(s => s !== sz));
                              } else {
                                setSelectedSizes([...selectedSizes, sz]);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                              isIncluded
                                ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-350 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                    {/* Add Custom size */}
                    <div className="flex items-center space-x-2 pt-1 max-w-sm">
                      <input
                        type="text"
                        value={customSizeText}
                        onChange={(e) => setCustomSizeText(e.target.value)}
                        placeholder={language === 'bn' ? "যেমনঃ 42, XXL, কাস্টম সাইজ" : "Custom size (e.g. 42, XXXL)"}
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={addCustomSize}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 cursor-pointer"
                      >
                        {language === 'bn' ? 'যোগ করুন' : 'Add'}
                      </button>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {language === 'bn' ? 'পোশাকের উপলব্ধ কালার নির্বাচন করুন (Colors):' : 'Select Available Colors:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-150 dark:border-slate-800">
                      {DEFAULT_CLOTHING_COLORS.map(col => {
                        const isIncluded = selectedColors.includes(col);
                        const getColorCode = (c: string) => {
                          const lower = c.toLowerCase().trim();
                          const map: Record<string, string> = {
                            'white': '#ffffff',
                            'black': '#1a1a1a',
                            'red': '#ef4444',
                            'blue': '#3b82f6',
                            'green': '#22c55e',
                            'yellow': '#f59e0b',
                            'pink': '#ec4899',
                            'orange': '#f97316',
                            'grey': '#64748b',
                            'navy blue': '#1e3a8a',
                            'maroon': '#800000',
                            'olive green': '#556b2f',
                            'teal': '#0d9488',
                            'magenta': '#d946ef',
                            'beige': '#f5f5dc',
                            'sky blue': '#0ea5e9',
                            'purple': '#8b5cf6',
                            'brown': '#78350f',
                            'lavender': '#ddd6fe',
                            'mustard': '#ca8a04',
                            'cream': '#fffbeb',
                            'coral': '#f87171',
                            'gold': '#ca8a04',
                            'silver': '#cbd5e1',
                            'charcoal': '#374151',
                            'mint green': '#34d399',
                            'peach': '#ffedd5',
                            'rose': '#fb7185',
                            'plum': '#db2777',
                            'wine': '#881337',
                            'crimson': '#dc2626'
                          };
                          return map[lower] || lower;
                        };

                        const bgCol = getColorCode(col);

                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => {
                              if (isIncluded) {
                                setSelectedColors(selectedColors.filter(c => c !== col));
                              } else {
                                setSelectedColors([...selectedColors, col]);
                              }
                            }}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-md border flex items-center space-x-1 transition-all cursor-pointer ${
                              isIncluded
                                ? 'bg-amber-500 border-amber-500 text-slate-950 font-black shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950'
                            }`}
                          >
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10 shrink-0" 
                              style={{ backgroundColor: bgCol }} 
                            />
                            <span>{col}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Add Custom color */}
                    <div className="flex items-center space-x-2 pt-1 max-w-sm">
                      <div className="relative flex-1 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
                        <input
                          type="color"
                          onChange={(e) => setCustomColorText(e.target.value)}
                          className="w-5 h-5 rounded-md cursor-pointer border-0 p-0 shrink-0"
                          title="Choose Color Visually"
                        />
                        <input
                          type="text"
                          value={customColorText}
                          onChange={(e) => setCustomColorText(e.target.value)}
                          placeholder={language === 'bn' ? "যেমনঃ Off-White, #e0115f" : "Color (e.g. Olive, #e0115f)"}
                          className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addCustomColor}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 cursor-pointer shrink-0"
                      >
                        {language === 'bn' ? 'যোগ করুন' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE B: Electronics & Gadgets */}
              {isElectronicsCategory && (
                <div className="space-y-5">
                  {/* Storage */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                      {language === 'bn' ? 'মেমরি ও র‍্যাম সাইজ নির্ধারণ করুন (RAM/Storage):' : 'Select Storage & RAM Configurations:'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_ELECTRONIC_STORAGE.map(st => {
                        const isIncluded = selectedStorage.includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              if (isIncluded) {
                                setSelectedStorage(selectedStorage.filter(s => s !== st));
                              } else {
                                setSelectedStorage([...selectedStorage, st]);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                              isIncluded
                                ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-350 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center space-x-2 pt-1 max-w-sm">
                      <input
                        type="text"
                        value={customStorageText}
                        onChange={(e) => setCustomStorageText(e.target.value)}
                        placeholder="e.g. 16GB/512GB"
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={addCustomStorage}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 cursor-pointer"
                      >
                        {language === 'bn' ? 'যোগ করুন' : 'Add'}
                      </button>
                    </div>
                  </div>

                  {/* Device Colors */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {language === 'bn' ? 'ডিভাইসের উপলব্ধ কালার নির্ধারণ করুন:' : 'Select Devices Color Variants:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-150 dark:border-slate-800">
                      {DEFAULT_ELECTRONIC_COLORS.map(col => {
                        const isIncluded = selectedElecColors.includes(col);
                        const getColorCode = (c: string) => {
                          const lower = c.toLowerCase().trim();
                          const map: Record<string, string> = {
                            'midnight blue': '#1e3a8a',
                            'space grey': '#4b5563',
                            'rose gold': '#fda4af',
                            'alpine green': '#064e3b',
                            'titanium silver': '#cbd5e1',
                            'pearl white': '#f8fafc',
                            'matte black': '#0f172a',
                            'deep purple': '#4c1d95',
                            'sunset gold': '#d4af37',
                            'emerald green': '#10b981',
                            'charcoal': '#374151',
                            'titanium blue': '#2563eb',
                            'titanium gray': '#6b7280',
                            'prism crush blue': '#2563eb'
                          };
                          return map[lower] || '#64748b';
                        };

                        const bgCol = getColorCode(col);

                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => {
                              if (isIncluded) {
                                setSelectedElecColors(selectedElecColors.filter(c => c !== col));
                              } else {
                                setSelectedElecColors([...selectedElecColors, col]);
                              }
                            }}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-md border flex items-center space-x-1 transition-all cursor-pointer ${
                              isIncluded
                                ? 'bg-amber-500 border-amber-500 text-slate-950 font-black shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950'
                            }`}
                          >
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10 shrink-0" 
                              style={{ backgroundColor: bgCol }} 
                            />
                            <span>{col}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center space-x-2 pt-1 max-w-sm">
                      <div className="relative flex-1 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
                        <input
                          type="color"
                          onChange={(e) => setCustomElecColorText(e.target.value)}
                          className="w-5 h-5 rounded-md cursor-pointer border-0 p-0 shrink-0"
                          title="Choose Color Visually"
                        />
                        <input
                          type="text"
                          value={customElecColorText}
                          onChange={(e) => setCustomElecColorText(e.target.value)}
                          placeholder={language === 'bn' ? "যেমনঃ Silver, #7f7f7f" : "Color (e.g. Silver, #7f7f7f)"}
                          className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addCustomElecColor}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 cursor-pointer shrink-0"
                      >
                        {language === 'bn' ? 'যোগ করুন' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE C: Books / Cakes / Liquids / Foods / General (Dynamic Variants) */}
              {!isClothingCategory && !isElectronicsCategory && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    {language === 'bn' ? variantConfig.labelBn : variantConfig.labelEn}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set([...variantConfig.presets, ...selectedWeights])).map(wt => {
                      const isIncluded = selectedWeights.includes(wt);
                      const isEditing = activeEditingVariant === wt;
                      return (
                        <button
                          key={wt}
                          type="button"
                          onClick={() => {
                            if (isIncluded) {
                              const nextWeights = selectedWeights.filter(w => w !== wt);
                              setSelectedWeights(nextWeights);
                              if (isEditing) {
                                const fallback = nextWeights[0] || '';
                                setActiveEditingVariant(fallback);
                                setSimulatedWeight(fallback);
                              }
                            } else {
                              setSelectedWeights([...selectedWeights, wt]);
                              setActiveEditingVariant(wt);
                              setSimulatedWeight(wt);
                              if (builderVariantPrices[wt]) {
                                if (builderVariantPrices[wt].regularPrice) setBuilderPrice(builderVariantPrices[wt].regularPrice.toString());
                                if (builderVariantPrices[wt].discountPrice) setBuilderDiscount(builderVariantPrices[wt].discountPrice.toString());
                                if (builderVariantPrices[wt].stock !== undefined) setBuilderStock(builderVariantPrices[wt].stock.toString());
                              }
                            }
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center space-x-1 cursor-pointer ${
                            isEditing
                              ? 'bg-amber-500 border-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-500/50'
                              : isIncluded
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-700 dark:text-amber-300 font-bold'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-350 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{wt}</span>
                          {builderVariantPrices[wt] && (
                            <span className="ml-1 text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-md font-bold">
                              ৳{builderVariantPrices[wt].discountPrice || builderVariantPrices[wt].price}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center space-x-2 pt-1 max-w-sm">
                    <input
                      type="text"
                      value={customWeightText}
                      onChange={(e) => setCustomWeightText(e.target.value)}
                      placeholder={variantConfig.placeholder || "e.g. 1 Pcs, Box, 1kg"}
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomWeight}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 cursor-pointer"
                    >
                      {language === 'bn' ? 'যোগ করুন' : 'Add'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing, discounts & stocks */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
                  <span className="bg-amber-500 text-slate-950 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black mr-2">5</span>
                  {language === 'bn' ? '৫. মূল্য নির্ধারণ এবং মজুদ (Stock)' : '5. UNIT PRICE, DISCOUNTS & INVENTORY STOCK'}
                </h3>

                {/* SAVE BUTTON FOR ACTIVE VARIANT - MATCHING USER SPECIFIED LOCATION */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] bg-amber-500/15 text-amber-700 dark:text-amber-300 font-black px-2.5 py-1 rounded-xl border border-amber-500/30 flex items-center shadow-xs">
                    <Tag className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    {activeEditingVariant || '500g'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveVariantPrice}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-emerald-500/20 transition flex items-center space-x-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                    title={language === 'bn' ? 'সিলেক্টকৃত ভেরিয়েন্টের জন্য মূল্য সেভ করুন' : 'Save price for selected variant'}
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {language === 'bn' ? `${activeEditingVariant || 'ভেরিয়েন্ট'} এর মূল্য সেভ করুন` : `Save ${activeEditingVariant || 'Variant'} Price`}
                    </span>
                  </button>
                </div>
              </div>

              {variantSaveToast && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl font-bold flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>{variantSaveToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVariantSaveToast(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    {language === 'bn' ? 'নিয়মিত মূল্য (৳)*:' : 'Regular Price (৳)*:'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">
                      ৳
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={builderPrice}
                      onChange={(e) => setBuilderPrice(e.target.value)}
                      placeholder="1200"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    {language === 'bn' ? 'ছাড়ের অফার মূল্য (৳):' : 'Discount Offer Price (৳):'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">
                      ৳
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={builderDiscount}
                      onChange={(e) => setBuilderDiscount(e.target.value)}
                      placeholder="990"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    {language === 'bn' ? 'স্টক পরিমাণ (মজুদ)*:' : 'Stock Inventory Count*:'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Package className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={builderStock}
                      onChange={(e) => setBuilderStock(e.target.value)}
                      placeholder="50"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* SUMMARY OF SAVED VARIANT PRICES */}
              {Object.keys(builderVariantPrices).length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? 'সেভ করা আলাদা ভেরিয়েন্ট মূল্যসমূহ:' : 'Saved Variant Prices:'}
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {Object.keys(builderVariantPrices).length} {language === 'bn' ? 'টি সেভ করা রয়েছে' : 'saved'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(builderVariantPrices) as [string, { price: number; regularPrice?: number; discountPrice?: number; stock?: number }][]).map(([vKey, vDetails]) => {
                      const isEditingThis = activeEditingVariant === vKey;
                      return (
                        <div 
                          key={vKey} 
                          onClick={() => {
                            setActiveEditingVariant(vKey);
                            if (vDetails.regularPrice) setBuilderPrice(vDetails.regularPrice.toString());
                            if (vDetails.discountPrice) setBuilderDiscount(vDetails.discountPrice.toString());
                            if (vDetails.stock !== undefined) setBuilderStock(vDetails.stock.toString());
                          }}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            isEditingThis
                              ? 'bg-amber-500/20 border-amber-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-amber-500'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-400'
                          }`}
                        >
                          <span className="text-amber-600 dark:text-amber-400 font-black">{vKey}:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">৳{(vDetails.discountPrice || vDetails.price).toLocaleString()}</span>
                          {vDetails.regularPrice && vDetails.regularPrice > (vDetails.discountPrice || vDetails.price) && (
                            <span className="text-[10px] text-slate-400 line-through">৳{vDetails.regularPrice.toLocaleString()}</span>
                          )}
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            স্টক: {vDetails.stock}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveVariantPrice(vKey);
                            }}
                            className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5 ml-1"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 6. LOGISTICS, DELIVERY TIME, SHIPPING FEES & WARRANTY POLICY CARD */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                      <span>{language === 'bn' ? '৬. ডেলিভারি সময়, শিপিং চার্জ ও গ্যারান্টি পলিসি' : '6. DELIVERY TIME, SHIPPING FEES & WARRANTY POLICY'}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'bn'
                        ? 'গ্রাহকের আস্থার জন্য ডেলিভারি সময়সীমা, শিপিং চার্জ, ক্যাশ অন ডেলিভারি ও রিটার্ন/ওয়ারেন্টি বিবরণ সেটিং করুন।'
                        : 'Set delivery timeframe, shipping fee, Cash on Delivery, and warranty/return policies.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 6.1 ESTIMATED DELIVERY TIME */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{language === 'bn' ? 'প্রত্যাশিত ডেলিভারি সময় (Estimated Delivery Time):' : 'Estimated Delivery Time:'}</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExpressDelivery}
                      onChange={(e) => setIsExpressDelivery(e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer"
                    />
                    <span>⚡ {language === 'bn' ? 'এক্সপ্রেস ডেলিভারি ব্যাজ' : 'Express Delivery Badge'}</span>
                  </label>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {deliveryTimePresets.map((val) => {
                    const isSel = deliveryTime === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setDeliveryTime(val);
                          setCustomDeliveryInput('');
                        }}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition cursor-pointer flex items-center space-x-1 ${
                          isSel
                            ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        <span>{val}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Input with Add button */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customDeliveryInput || deliveryTime}
                    onChange={(e) => {
                      setCustomDeliveryInput(e.target.value);
                      setDeliveryTime(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeliveryPreset();
                      }
                    }}
                    placeholder={language === 'bn' ? 'কাস্টম ডেলিভারি সময় লিখুন (যেমন: ২৪-৪৮ ঘণ্টা)' : 'Custom delivery time (e.g. 24 to 48 hours)'}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliveryPreset}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition flex items-center space-x-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{language === 'bn' ? 'অ্যাড করুন' : 'Add'}</span>
                  </button>
                </div>
              </div>

              {/* 6.2 SHIPPING CHARGES & CASH ON DELIVERY */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'bn' ? 'শিপিং ফি ও পেমেন্ট সুবিধা (Shipping & Payment):' : 'Shipping Charges & Payment:'}</span>
                  </label>

                  {/* Free delivery toggle button */}
                  <button
                    type="button"
                    onClick={() => setIsFreeDelivery(!isFreeDelivery)}
                    className={`px-3 py-1.5 text-xs font-black rounded-xl border transition cursor-pointer flex items-center space-x-1.5 ${
                      isFreeDelivery
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md ring-2 ring-emerald-500/50'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                    }`}
                  >
                    <span>🎉</span>
                    <span>{language === 'bn' ? 'ফ্রি ডেলিভারি অফার করুন' : 'Free Shipping Offer'}</span>
                    {isFreeDelivery && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>

                {/* Charge input fields */}
                {!isFreeDelivery && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        {language === 'bn' ? 'ঢাকার ভেতরে শিপিং চার্জ (৳):' : 'Shipping Inside City (৳):'}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">৳</span>
                        <input
                          type="number"
                          value={deliveryChargeInside}
                          onChange={(e) => setDeliveryChargeInside(e.target.value)}
                          placeholder="60"
                          className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        {language === 'bn' ? 'ঢাকার বাইরে / সারা দেশ চার্জ (৳):' : 'Shipping Outside City (৳):'}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">৳</span>
                        <input
                          type="number"
                          value={deliveryChargeOutside}
                          onChange={(e) => setDeliveryChargeOutside(e.target.value)}
                          placeholder="120"
                          className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Cash on Delivery Checkbox */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCodAvailable}
                      onChange={(e) => setIsCodAvailable(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                    <span>💵 {language === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে' : 'Cash on Delivery (COD) Available'}</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {language === 'bn' ? 'পণ্য হাতে পেয়ে টাকা পরিশোধ' : 'Pay after receiving product'}
                  </span>
                </div>
              </div>

              {/* 6.3 RETURN POLICY & WARRANTY */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                {/* Return Policy */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-500" />
                    <span>{language === 'bn' ? 'রিটার্ন ও রিপ্লেসমেন্ট পলিসি (Return Policy):' : 'Return & Replacement Policy:'}</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {returnPolicyPresets.map((val) => {
                      const isSel = returnPolicy === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setReturnPolicy(val);
                            setCustomReturnInput('');
                          }}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition cursor-pointer ${
                            isSel
                              ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-400'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customReturnInput || returnPolicy}
                      onChange={(e) => {
                        setCustomReturnInput(e.target.value);
                        setReturnPolicy(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddReturnPreset();
                        }
                      }}
                      placeholder={language === 'bn' ? 'রিটার্ন পলিসি বিবরণ লিখুন' : 'Custom return policy'}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddReturnPreset}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition flex items-center space-x-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{language === 'bn' ? 'অ্যাড করুন' : 'Add'}</span>
                    </button>
                  </div>
                </div>

                {/* Warranty Policy */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === 'bn' ? 'ওয়ারেন্টি ও গুণগত মান (Warranty & Authenticity):' : 'Warranty & Authenticity Guarantee:'}</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {warrantyPolicyPresets.map((val) => {
                      const isSel = warrantyPolicy === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setWarrantyPolicy(val);
                            setCustomWarrantyInput('');
                          }}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition cursor-pointer ${
                            isSel
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customWarrantyInput || warrantyPolicy}
                      onChange={(e) => {
                        setCustomWarrantyInput(e.target.value);
                        setWarrantyPolicy(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddWarrantyPreset();
                        }
                      }}
                      placeholder={language === 'bn' ? 'ওয়ারেন্টি বা অরিজিনালিটি বিবরণ' : 'Custom warranty details'}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddWarrantyPreset}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition flex items-center space-x-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{language === 'bn' ? 'অ্যাড করুন' : 'Add'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit block */}
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 shrink-0 cursor-pointer hover:shadow-emerald-500/10 hover:scale-[1.01]"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>
                {language === 'bn' ? 'আমারবাজারে পণ্যটি আপলোড ও পাবলিশ করুন' : 'SAVE & PUBLISH PRODUCT LISTING'}
              </span>
            </button>
          </div>

          {/* Right panel: Live customer view simulator (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 flex flex-col space-y-3 pb-4">
            
            {/* Live Preview Label Header */}
            <div className="flex justify-between items-center bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white shrink-0">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  {language === 'bn' ? 'রিয়েল-টাইম প্রিভিউ' : 'Live Customer Preview'}
                </span>
              </div>
              <span className="text-[9px] font-semibold text-slate-400 italic">
                {language === 'bn' ? 'গ্রাহক যেমন দেখবে' : 'How customers will see it'}
              </span>
            </div>

            {/* High-fidelity Product Card Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg transition duration-200">
              
              {/* Product Image Stage */}
              <div className="relative h-44 sm:h-48 bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-b border-slate-100 dark:border-slate-700 overflow-hidden shrink-0">
                <img 
                  src={activeImageUrl} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
                
                {/* Dots pagination for multiple uploaded images */}
                {customImageUrls.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex items-center space-x-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full z-10 shadow-xs">
                    {customImageUrls.map((url, idx) => {
                      const isSelected = url === activeImageUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCustomImageUrl(url)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-400 scale-125 ring-2 ring-amber-400/30' 
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                          title={`View image ${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                )}
                
                {/* Sale / Promo labels */}
                {Number(builderDiscount) > 0 && Number(builderPrice) > Number(builderDiscount) && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {language === 'bn' ? 'বিশেষ অফার' : 'FLASH SALE'}
                  </span>
                )}

                {/* Seller Store Branding */}
                <span className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white font-bold text-[9px] px-2.5 py-1 rounded-lg flex items-center shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                  AmarBazar Mall
                </span>
              </div>

              {/* Details specifications */}
              <div className="p-5 space-y-4">
                
                {/* Brand & Category Badge */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                    {builderBrand || 'AmarBazar'}
                  </span>
                  <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-lg border border-amber-500/25 uppercase">
                    {selectedCatId === 'custom' 
                      ? (customCategoryInput || (language === 'bn' ? 'কাস্টম' : 'Custom')) 
                      : (categories.find(c => c.id === selectedCatId)?.name || 'General')}
                  </span>
                </div>

                {/* Product Titles */}
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                    {language === 'bn' ? (builderTitleBn || builderTitle || 'নতুন কাস্টম প্রোডাক্ট') : (builderTitle || 'New Custom Product')}
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-wide">
                    SKU: {builderSku} • {builderWarranty}
                  </p>
                </div>

                {/* Rating & Stock Status */}
                {(() => {
                  const activeSimKey = isElectronicsCategory ? simulatedStorage : isClothingCategory ? simulatedSize : simulatedWeight;
                  const vData = builderVariantPrices[activeSimKey];
                  const currentStock = vData?.stock !== undefined ? vData.stock : Number(builderStock);

                  return (
                    <div className="flex items-center space-x-3 text-xs border-y border-slate-100 dark:border-slate-700/60 py-2">
                      <div className="flex items-center text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500 mr-1" />
                        <span>5.0</span>
                        <span className="text-slate-400 font-normal ml-1">(0 {language === 'bn' ? 'রিভিউ' : 'reviews'})</span>
                      </div>
                      <span>•</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        currentStock > 0 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {currentStock > 0 
                          ? (language === 'bn' ? `স্টক আছে: ${currentStock} টি (${activeSimKey})` : `In Stock: ${currentStock} units (${activeSimKey})`)
                          : (language === 'bn' ? `স্টক আউট (${activeSimKey})` : `Out of Stock (${activeSimKey})`)
                        }
                      </span>
                    </div>
                  );
                })()}

                {/* Pricing Block */}
                {(() => {
                  const activeSimKey = isElectronicsCategory ? simulatedStorage : isClothingCategory ? simulatedSize : simulatedWeight;
                  const vData = builderVariantPrices[activeSimKey];

                  const curPrice = vData 
                    ? (vData.discountPrice || vData.price) 
                    : (Number(builderDiscount) || Number(builderPrice) || 0);

                  const curRegPrice = vData 
                    ? vData.regularPrice 
                    : Number(builderPrice);

                  return (
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ৳{curPrice.toLocaleString()}
                      </span>
                      {curRegPrice && curRegPrice > curPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ৳{curRegPrice.toLocaleString()}
                        </span>
                      )}
                      {vData && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {activeSimKey} {language === 'bn' ? 'এর মূল্য' : 'price'}
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* DYNAMIC VARIANTS SELECTOR PREVIEWS */}
                {/* 1. CLOTHING SIZES */}
                {isClothingCategory && selectedSizes.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? 'সাইজ নির্বাচন করুন:' : 'Select Size:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSizes.map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSimulatedSize(sz)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition ${
                            simulatedSize === sz
                              ? 'bg-slate-900 border-slate-900 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-slate-950 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. CLOTHING COLORS */}
                {isClothingCategory && selectedColors.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? 'রঙ নির্বাচন করুন:' : 'Select Color:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedColors.map(col => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSimulatedColor(col)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition ${
                            simulatedColor === col
                              ? 'bg-slate-900 border-slate-900 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-slate-950 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. ELECTRONICS STORAGE */}
                {isElectronicsCategory && selectedStorage.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? 'মেমরি কনফিগারেশন:' : 'Storage / RAM:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStorage.map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSimulatedStorage(st)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition ${
                            simulatedStorage === st
                              ? 'bg-slate-900 border-slate-900 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-slate-950 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. ELECTRONICS COLORS */}
                {isElectronicsCategory && selectedElecColors.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? 'ডিভাইস কালার:' : 'Device Color:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedElecColors.map(col => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSimulatedElecColor(col)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition ${
                            simulatedElecColor === col
                              ? 'bg-slate-900 border-slate-900 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-slate-950 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. DYNAMIC CATEGORY OPTIONS */}
                {!isClothingCategory && !isElectronicsCategory && selectedWeights.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? variantConfig.previewLabelBn : variantConfig.previewLabelEn}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedWeights.map(wt => (
                        <button
                          key={wt}
                          type="button"
                          onClick={() => setSimulatedWeight(wt)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition ${
                            simulatedWeight === wt
                              ? 'bg-slate-900 border-slate-900 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-slate-950 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {wt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PACKAGE INCLUDED ITEMS BOX IN LIVE PREVIEW */}
                {(isPackageCategory || selectedCatId === 'combo-package-builder') && packageItems.length > 0 && (
                  <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/15 rounded-xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                      <span className="text-xs font-black text-slate-900 dark:text-amber-300 flex items-center">
                        <span className="mr-1.5">🎁</span>
                        {language === 'bn' ? 'প্যাকেজে যা যা থাকছে:' : 'Items Included in Package:'}
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md">
                        {packageItems.length} {language === 'bn' ? 'টি আইটেম' : 'Items'}
                      </span>
                    </div>

                    <ul className="space-y-1.5 pt-1">
                      {packageItems.map((item, idx) => (
                        <li key={item.id || idx} className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                          <span className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shrink-0" />
                            {item.name}
                          </span>
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            {item.qty}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {savingsAmount > 0 && (
                      <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                        <span>{language === 'bn' ? 'প্যাকেজে মোট সাশ্রয়:' : 'Total Bundle Savings:'}</span>
                        <span>৳{savingsAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description texts */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                    {language === 'bn' ? 'বিবরণ:' : 'Description:'}
                  </label>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {language === 'bn' ? (builderDescBn || builderDesc) : builderDesc}
                  </p>
                </div>

                {/* LOGISTICS & DELIVERY PREVIEW BOX */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-500" />
                      <span>{language === 'bn' ? 'ডেলিভারি, ফি ও গ্যারান্টি তথ্য:' : 'Delivery, Fees & Guarantees:'}</span>
                    </span>
                    {isExpressDelivery && (
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-wider flex items-center space-x-1">
                        <Zap className="w-3 h-3 fill-slate-950" />
                        <span>EXPRESS</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Delivery Time */}
                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-150 dark:border-slate-700">
                      <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-400 font-bold">{language === 'bn' ? 'ডেলিভারি সময়:' : 'Delivery Time:'}</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block text-[11px]">{deliveryTime}</span>
                      </div>
                    </div>

                    {/* Shipping Charge */}
                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-150 dark:border-slate-700">
                      <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-400 font-bold">{language === 'bn' ? 'শিপিং ফি:' : 'Shipping Fee:'}</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 truncate block text-[11px]">
                          {isFreeDelivery ? (language === 'bn' ? '🎉 ফ্রি ডেলিভারি!' : '🎉 Free Shipping!') : `৳${deliveryChargeInside} (ঢাকা) / ৳${deliveryChargeOutside}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges: COD, Return, Warranty */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {isCodAvailable && (
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded-lg border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>💵 Cash on Delivery</span>
                      </span>
                    )}
                    {returnPolicy && (
                      <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] rounded-lg border border-purple-500/30 flex items-center space-x-1">
                        <RotateCcw className="w-3 h-3 text-purple-500 shrink-0" />
                        <span className="truncate max-w-[160px]">{returnPolicy}</span>
                      </span>
                    )}
                    {warrantyPolicy && (
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded-lg border border-blue-500/30 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[160px]">{warrantyPolicy}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulated action notifications */}
                {previewNotify && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] rounded-xl font-bold flex items-center justify-between">
                    <span>{previewNotify}</span>
                    <button 
                      type="button" 
                      onClick={() => setPreviewNotify(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Interaction Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      const sel = selectedCatId === 'cat-2' ? `(${simulatedSize}/${simulatedColor})` : selectedCatId === 'cat-1' ? `(${simulatedStorage}/${simulatedElecColor})` : `(${simulatedWeight})`;
                      setPreviewNotify(language === 'bn' ? `কার্টে যোগ করা হয়েছে ${sel}!` : `Added to cart ${sel}!`);
                      playSystemSound('success');
                    }}
                    className="py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl transition cursor-pointer"
                  >
                    {language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewNotify(language === 'bn' ? 'সরাসরি পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে...' : 'Directing to payment gateways...');
                      playSystemSound('success');
                    }}
                    className="py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md transition cursor-pointer"
                  >
                    {language === 'bn' ? 'সরাসরি কিনুন' : 'Buy Now'}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </form>
      )}

      {/* COMPREHENSIVE PRODUCT EDIT MODAL */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === 'bn' ? 'পণ্য এডিট করুন' : 'Edit Product Listing'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  SKU: <span className="font-mono font-bold text-amber-500">{editingProduct.sku}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content (Scrollable) */}
            <form onSubmit={handleSaveFullEdit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Row 1: Titles (EN & BN) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">
                    {language === 'bn' ? 'পণ্যের নাম (English) *' : 'Product Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">
                    {language === 'bn' ? 'পণ্যের নাম (বাংলা) *' : 'Product Title (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitleBn}
                    onChange={(e) => setEditTitleBn(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Row 2: Brand, Category, Warranty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">
                    {language === 'bn' ? 'ব্র্যান্ড' : 'Brand Name'}
                  </label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">
                    {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {language === 'bn' ? c.nameBn : c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">
                    {language === 'bn' ? 'ওয়ারেন্টি / গ্যারান্টি' : 'Warranty Details'}
                  </label>
                  <input
                    type="text"
                    value={editWarranty}
                    onChange={(e) => setEditWarranty(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Row 3: Regular Price, Discount Price, Stock Count */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-750">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500 mr-0.5" />
                    {language === 'bn' ? 'নিয়মিত মূল্য (৳) *' : 'Regular Price (৳) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center">
                    <Tag className="w-3.5 h-3.5 text-emerald-500 mr-0.5" />
                    {language === 'bn' ? 'অফার মূল্য (৳ - ঐচ্ছিক)' : 'Discount Price (৳ - Optional)'}
                  </label>
                  <input
                    type="number"
                    value={editDiscount || ''}
                    onChange={(e) => setEditDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="No discount"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center">
                    <Package className="w-3.5 h-3.5 text-blue-500 mr-0.5" />
                    {language === 'bn' ? 'স্টক পরিমাণ *' : 'Stock Quantity *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              {/* Row 4: Descriptions (EN & BN) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    {language === 'bn' ? 'পণ্যের বিবরণসমূহ' : 'Product Descriptions'}
                  </span>
                  <button
                    type="button"
                    disabled={isGeneratingEditAiDesc}
                    onClick={() => handleAiCopywrite(true)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-[10px] rounded-lg shadow-xs flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Sparkles className={`w-3 h-3 text-amber-300 ${isGeneratingEditAiDesc ? 'animate-spin' : ''}`} />
                    <span>
                      {isGeneratingEditAiDesc 
                        ? (language === 'bn' ? 'এআই জেনারেট হচ্ছে...' : 'AI Generating...') 
                        : (language === 'bn' ? 'এআই অটো-রাইট' : 'AI Auto-Write')}
                    </span>
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">
                    {language === 'bn' ? 'পণ্যের বিবরণ (English)' : 'Product Description (English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100 leading-relaxed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">
                    {language === 'bn' ? 'পণ্যের বিবরণ (বাংলা)' : 'Product Description (Bangla)'}
                  </label>
                  <textarea
                    rows={3}
                    value={editDescriptionBn}
                    onChange={(e) => setEditDescriptionBn(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100 leading-relaxed"
                  />
                </div>
              </div>

              {/* Row 5: Image URLs & Previews */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-500 mr-1" />
                  {language === 'bn' ? 'পণ্যের ছবিসমূহ (৪টি ইউআরএল পর্যন্ত)' : 'Product Image Gallery (Up to 4 URLs)'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {editImageUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                        {url.trim() ? (
                          <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={`Image URL #${index + 1}`}
                        value={url}
                        onChange={(e) => {
                          const updated = [...editImageUrls];
                          updated[index] = e.target.value;
                          setEditImageUrls(updated);
                        }}
                        className="w-full bg-transparent border-none text-[10px] focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 6: Custom Specifications Section */}
              <div className="space-y-2 border-t border-slate-150 dark:border-slate-750 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                    {language === 'bn' ? 'কাস্টম স্পেসিফিকেশন (বৈশিষ্ট্যসমূহ)' : 'Custom Specifications Matrix'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditCustomSpecs([...editCustomSpecs, { label: '', labelBn: '', value: '', valueBn: '' }])}
                    className="text-xs text-amber-500 hover:text-amber-600 font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'নতুন বৈশিষ্ট্য যোগ করুন' : 'Add Metric'}</span>
                  </button>
                </div>
                
                {editCustomSpecs.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">
                    {language === 'bn' ? 'কোন স্পেসিফিকেশন যোগ করা হয়নি।' : 'No custom specifications added yet.'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {editCustomSpecs.map((spec, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-150 dark:border-slate-750">
                        <div className="col-span-5 space-y-1">
                          <input
                            type="text"
                            placeholder={language === 'bn' ? 'বৈশিষ্ট্য (English)' : 'Metric (EN)'}
                            value={spec.label}
                            onChange={(e) => {
                              const updated = [...editCustomSpecs];
                              updated[sIdx].label = e.target.value;
                              setEditCustomSpecs(updated);
                            }}
                            className="w-full px-2 py-1 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <input
                            type="text"
                            placeholder={language === 'bn' ? 'বৈশিষ্ট্য (বাংলা)' : 'Metric (BN)'}
                            value={spec.labelBn || ''}
                            onChange={(e) => {
                              const updated = [...editCustomSpecs];
                              updated[sIdx].labelBn = e.target.value;
                              setEditCustomSpecs(updated);
                            }}
                            className="w-full px-2 py-1 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div className="col-span-5 space-y-1">
                          <input
                            type="text"
                            placeholder={language === 'bn' ? 'মান (English)' : 'Value (EN)'}
                            value={spec.value}
                            onChange={(e) => {
                              const updated = [...editCustomSpecs];
                              updated[sIdx].value = e.target.value;
                              setEditCustomSpecs(updated);
                            }}
                            className="w-full px-2 py-1 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <input
                            type="text"
                            placeholder={language === 'bn' ? 'মান (বাংলা)' : 'Value (BN)'}
                            value={spec.valueBn || ''}
                            onChange={(e) => {
                              const updated = [...editCustomSpecs];
                              updated[sIdx].valueBn = e.target.value;
                              setEditCustomSpecs(updated);
                            }}
                            className="w-full px-2 py-1 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div className="col-span-2 text-center">
                          <button
                            type="button"
                            onClick={() => setEditCustomSpecs(editCustomSpecs.filter((_, i) => i !== sIdx))}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition inline-block border border-transparent hover:border-red-200"
                            title="Remove specification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </form>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-750 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveFullEdit}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>
                  {language === 'bn' ? 'আপডেট সংরক্ষণ করুন' : 'Save Changes'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
