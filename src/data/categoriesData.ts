import { Category } from '../types';

export interface SubSubCategory {
  id: string;
  name: string;
  nameBn: string;
  nameAr?: string;
  count?: number;
}

export interface SubCategory {
  id: string;
  name: string;
  nameBn: string;
  nameAr?: string;
  emoji?: string;
  subcategories?: SubSubCategory[];
  subCategories?: SubSubCategory[];
  subSubCategories?: SubSubCategory[];
}

export interface MainCategory {
  id: string;
  name: string;
  nameBn: string;
  nameAr?: string;
  icon: string;
  emoji?: string;
  image: string;
  productCount?: number;
  subcategories: SubCategory[];
  subCategories: SubCategory[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'cat-1': '📱',
  'cat-2': '👗',
  'cat-3': '🍲',
  'cat-4': '🏠',
  'cat-5': '✨',
  'cat-6': '⚡',
  'cat-7': '🌾',
  'cat-8': '👞',
  'cat-9': '💄',
  'cat-10': '🧸',
  'cat-11': '💊',
  'cat-12': '📚'
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics & Gadgets',
    nameBn: 'ইলেকট্রনিক্স ও গ্যাজেট',
    nameAr: 'إلكترونيات وأجهزة ذكية',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-11', name: 'Smartphones & Mobile', nameBn: 'স্মার্টফোন ও মোবাইল', nameAr: 'هواتف ذكية وجوالات' },
      { id: 'sub-12', name: 'Laptops & Computers', nameBn: 'ল্যাপটপ ও কম্পিউটার', nameAr: 'حواسيب محمولة وأجهزة كمبيوتر' },
      { id: 'sub-13', name: 'Audio & Headphones', nameBn: 'হেডফোন ও অডিও', nameAr: 'سماعات وأجهزة صوت' },
      { id: 'sub-14', name: 'Smart Home & TV', nameBn: 'স্মার্ট টিভি ও হোম', nameAr: 'تلفزيونات وأجهزة منزلية ذكية' }
    ],
    productCount: 14
  },
  {
    id: 'cat-2',
    name: 'Fashion & Clothing',
    nameBn: 'ফ্যাশন ও পোশাক',
    nameAr: 'أزياء وملابس',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-21', name: 'Traditional Sarees & Salwar', nameBn: 'ঐতিহ্যবাহী শাড়ি ও সালওয়ার', nameAr: 'ساري تقليدي وسالوار' },
      { id: 'sub-22', name: 'Men\'s Panjabi & Kurta', nameBn: 'পুরুষের পাঞ্জাবি ও কুর্তা', nameAr: 'بنجابي وكورتا للرجال' },
      { id: 'sub-23', name: 'Casual Western Wear', nameBn: 'ওয়েস্টার্ন পোশাক', nameAr: 'ملابس غربية عصرية' },
      { id: 'sub-24', name: 'Footwear & Accessories', nameBn: 'জুতা ও অ্যাক্সেসোরিজ', nameAr: 'أحذية وإكسسوارات' }
    ],
    productCount: 16
  },
  {
    id: 'cat-3',
    name: 'BD Foods & Organic',
    nameBn: 'বাংলাদেশী খাবার ও অর্গানিক',
    nameAr: 'أغذية بنغالية وعضوية',
    icon: 'Apple',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-31', name: 'Mustard Oil & Organic Ghee', nameBn: 'খাটি সরিষার তেল ও ঘি', nameAr: 'زيت خردل وسمن عضوي' },
      { id: 'sub-32', name: 'Sylhet Special Tea & Spices', nameBn: 'সিলেটের চা ও মসলা', nameAr: 'شاي سيلهيت الخاص وتوابل' },
      { id: 'sub-33', name: 'Rice & Grocery Staples', nameBn: 'চাল ও নিত্যপণ্য', nameAr: 'أرز ومواد تموينية' },
      { id: 'sub-34', name: 'Dry Fruits & Honey', nameBn: 'ড্রাই ফ্রুটস ও মধু', nameAr: 'فواكه مجففة وعسل حر' }
    ],
    productCount: 18
  },
  {
    id: 'cat-4',
    name: 'Home & Living',
    nameBn: 'গৃহস্থালি ও লিভিং',
    nameAr: 'منزل ومعيشة',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-41', name: 'Bedding & Curtains', nameBn: 'বিছানার চাদর ও পর্দা', nameAr: 'أغطية أسرة وستائر' },
      { id: 'sub-42', name: 'Kitchen Appliances', nameBn: 'রান্নাঘরের জিনিসপত্র', nameAr: 'أদوات ومستلزمات المطبخ' },
      { id: 'sub-43', name: 'Handicrafts & Decor', nameBn: 'হস্তশিল্প ও সাজসজ্জা', nameAr: 'صناعات يدوية وديكور' }
    ],
    productCount: 12
  },
  {
    id: 'cat-5',
    name: 'Beauty & Health',
    nameBn: 'সৌন্দর্য ও স্বাস্থ্য',
    nameAr: 'جمাল وعناية صحية',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-51', name: 'Skincare & Organic Oils', nameBn: 'স্কিনকেয়ার ও অর্গানিক তেল', nameAr: 'عناية بالبشرة وزيوت عضوية' },
      { id: 'sub-52', name: 'Hair Care & Herbal', nameBn: 'চুলের যত্ন ও ভেষজ', nameAr: 'عناية بالشعر وأعشاب طبيعية' },
      { id: 'sub-53', name: 'Perfume & Attar', nameBn: 'পারফিউম ও আতর', nameAr: 'عطور وبخور وأطياب' }
    ],
    productCount: 14
  },
  {
    id: 'cat-6',
    name: 'Electrical & Wiring',
    nameBn: 'ইলেকট্রিক্যাল ও অয়্যার',
    nameAr: 'أدوات كهربائية',
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1558211583-d26f610c1eb1?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-61', name: 'LED Lights & Bulbs', nameBn: 'এলইডি লাইট ও বাল্ব' },
      { id: 'sub-62', name: 'Wires & Cables', nameBn: 'তার ও ক্যাবল' },
      { id: 'sub-63', name: 'Switches & Sockets', nameBn: 'সুইচ ও সকেট' }
    ],
    productCount: 8
  },
  {
    id: 'cat-7',
    name: 'Groceries & Spices',
    nameBn: 'মুদি ও মসলা',
    nameAr: 'بقالة وتوابل',
    icon: 'Package',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-71', name: 'Pure Spices & Powder', nameBn: 'খাঁটি গুঁড়া মসলা' },
      { id: 'sub-72', name: 'Pulses, Lentils & Dal', nameBn: 'ডাল ও শস্যদানা' },
      { id: 'sub-73', name: 'Cooking Oils & Mustard Oil', nameBn: 'ভোজ্যতেল ও সরিষার তেল' }
    ],
    productCount: 10
  },
  {
    id: 'cat-8',
    name: 'Shoes & Sandals',
    nameBn: 'জুতা ও স্যান্ডেল',
    nameAr: 'أحذية وصنادل',
    icon: 'Footprints',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-81', name: 'Men\'s Leather Shoes', nameBn: 'পুরুষের চামড়ার জুতা' },
      { id: 'sub-82', name: 'Ladies Sandals & Heels', nameBn: 'মহিলাদের স্যান্ডেল ও হিল' },
      { id: 'sub-83', name: 'Sports Shoes & Sneakers', nameBn: 'স্পোর্টস জুতা ও স্নিকার্স' }
    ],
    productCount: 8
  },
  {
    id: 'cat-9',
    name: 'Cosmetics & Jewelleries',
    nameBn: 'কসমেটিক্স ও গহনা',
    nameAr: 'مستحضرات التجميل والمجوهرات',
    icon: 'Heart',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-91', name: 'Lipsticks & Makeup', nameBn: 'লিপস্টিক ও মেকআপ' },
      { id: 'sub-92', name: 'Gold-Plated Jewelleries', nameBn: 'গোল্ড-প্লেটেড গহনা' },
      { id: 'sub-93', name: 'Sunscreens & Creams', nameBn: 'সানস্ক্রিন ও ক্রিম' }
    ],
    productCount: 8
  },
  {
    id: 'cat-10',
    name: 'Kids Toys & Baby Items',
    nameBn: 'খেলনা ও বাচ্চাদের সামগ্রী',
    nameAr: 'ألعاب وأشياء أطفال',
    icon: 'Gamepad2',
    image: 'https://images.unsplash.com/photo-1537655780520-1e392edd816a?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-101', name: 'Educational Toys', nameBn: 'শিক্ষণীয় খেলনা' },
      { id: 'sub-102', name: 'Baby Diapers & Wipes', nameBn: 'বাচ্চাদের ডায়াপার ও ওয়াইপ্স' },
      { id: 'sub-103', name: 'Baby Clothes & Outfits', nameBn: 'বাচ্চাদের পোশাক' }
    ],
    productCount: 8
  },
  {
    id: 'cat-11',
    name: 'Medicine & Pharmacy',
    nameBn: 'ওষুধ ও ফার্মেসি',
    nameAr: 'أدوية وصيدلية',
    icon: 'Activity',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-111', name: 'OTC Medicines', nameBn: 'নিত্যদিনের সাধারণ ওষুধ' },
      { id: 'sub-112', name: 'First Aid & Gauze', nameBn: 'প্রাথমিক চিকিৎসা ও গজ' },
      { id: 'sub-113', name: 'Supplements & Vitamins', nameBn: 'ভিটামিন ও সাপ্লিমেন্ট' }
    ],
    productCount: 8
  },
  {
    id: 'cat-12',
    name: 'Books & Stationery',
    nameBn: 'বই ও স্টেশনারি',
    nameAr: 'كتب وقرطاسية',
    icon: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-121', name: 'Story Books & Islamic', nameBn: 'গল্পের বই ও ইসলামিক বই' },
      { id: 'sub-122', name: 'Notebooks, Pens & Art', nameBn: 'খাতা, কলম ও আর্ট পেপার' },
      { id: 'sub-123', name: 'Office Supplies', nameBn: 'অফিস স্টেশনারি' }
    ],
    productCount: 8
  }
];

export const ALL_FRONTEND_CATEGORIES = INITIAL_CATEGORIES;

export const SHWAPNO_DETAILED_CATEGORIES: MainCategory[] = INITIAL_CATEGORIES.map(cat => {
  const subs: SubCategory[] = cat.subcategories.map(sub => ({
    id: sub.id,
    name: sub.name,
    nameBn: sub.nameBn,
    nameAr: sub.nameAr,
    emoji: CATEGORY_EMOJIS[cat.id] || '✨',
    subcategories: [],
    subCategories: [],
    subSubCategories: []
  }));

  return {
    id: cat.id,
    name: cat.name,
    nameBn: cat.nameBn,
    nameAr: cat.nameAr,
    icon: cat.icon,
    emoji: CATEGORY_EMOJIS[cat.id] || '✨',
    image: cat.image,
    productCount: cat.productCount,
    subcategories: subs,
    subCategories: subs
  };
});
