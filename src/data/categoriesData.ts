export interface SubSubCategory {
  id: string;
  name: string;
  nameBn: string;
}

export interface SubCategory {
  id: string;
  name: string;
  nameBn: string;
  subSubCategories?: SubSubCategory[];
}

export interface MainCategory {
  id: string;
  name: string;
  nameBn: string;
  emoji: string;
  subCategories?: SubCategory[];
}

export interface CategoryPreset {
  id: string;
  name: string;
  nameBn: string;
  emoji: string;
}

export const ALL_FRONTEND_CATEGORIES: CategoryPreset[] = [
  // 0. Custom Package & Combo Builder (প্যাকেজ ও কম্বো বিল্ডার)
  { id: 'combo-package-builder', emoji: '🎁', name: 'Create Combo Package', nameBn: 'প্যাকেজ ও কম্বো বানান' },

  // 1. Daily Essentials & Groceries (নিত্যপ্রয়োজনীয় পণ্য ও বাজার)
  { id: 'groceries-spices', emoji: '🌶️', name: 'Spices & Groceries', nameBn: 'মুদি ও মসলা' },
  { id: 'grain-rice', emoji: '🌾', name: 'Rice & Grains', nameBn: 'চাল ও শস্যদানা' },
  { id: 'oil-ghee', emoji: '🧈', name: 'Mustard Oil & Ghee', nameBn: 'সরিষার তেল ও ঘি' },
  { id: 'meat-fish', emoji: '🥩', name: 'Meat & Fish', nameBn: 'মাছ ও মাংস' },
  { id: 'fresh-vegetables', emoji: '🥦', name: 'Fresh Vegetables', nameBn: 'তাজা শাকসবজি' },
  { id: 'fresh-fruits', emoji: '🍎', name: 'Fresh Fruits', nameBn: 'তাজা ফলমূল' },
  { id: 'eggs', emoji: '🥚', name: 'Farm Eggs', nameBn: 'ফার্মের ডিম' },
  { id: 'dairy-milk', emoji: '🥛', name: 'Dairy & Milk', nameBn: 'দুধ ও দুগ্ধজাত' },
  
  // 2. Cakes, Fast Food, Sweets & Bakery (কেক, ফাস্টফুড, মিষ্টি ও বেকারি)
  { id: 'cakes-pastry', emoji: '🎂', name: 'Cake & Pastry', nameBn: 'কেক ও পেস্ট্রি' },
  { id: 'fast-food', emoji: '🍔', name: 'Fast Food & Burger', nameBn: 'ফাস্টফুড ও বার্গার' },
  { id: 'sweets-desserts', emoji: '🧁', name: 'Sweets & Desserts', nameBn: 'মিষ্টি ও ডেজার্ট' },
  { id: 'bakery', emoji: '🍞', name: 'Bakery & Bread', nameBn: 'বেকারি ও ব্রেড' },
  { id: 'restaurant-meals', emoji: '🍲', name: 'Restaurant & Hot Meals', nameBn: 'রেস্টুরেন্ট ও তৈরি খাবার' },
  { id: 'snacks-biscuits', emoji: '🍪', name: 'Snacks & Biscuits', nameBn: 'স্ন্যাক্স ও বিস্কুট' },
  { id: 'tea-coffee', emoji: '☕', name: 'Tea & Coffee', nameBn: 'চা ও কফি' },
  { id: 'beverages', emoji: '🥤', name: 'Juice & Beverages', nameBn: 'পানীয় সামগ্রী' },

  // 3. Clothing & Fashion (জামাকাপড় ও ফ্যাশন)
  { id: 'cat-2', emoji: '👕', name: 'Fashion & Clothing', nameBn: 'ফ্যাশন ও পোশাক' },
  { id: 'sarees-ethnic', emoji: '👘', name: 'Saree & Ethnic Wear', nameBn: 'শাড়ি ও ঐতিহ্যবাহী' },
  { id: 'cat-8', emoji: '👟', name: 'Shoes & Sandals', nameBn: 'জুতা ও স্যান্ডেল' },

  // 4. Food Specialties & Organic
  { id: 'cat-3', emoji: '🥦', name: 'BD Foods & Organic', nameBn: 'বাংলাদেশী খাবার ও অর্গানিক' },
  { id: 'organic-honey', emoji: '🍯', name: 'Pure Honey', nameBn: 'খাঁটি মধু' },
  { id: 'dry-fruits-dates', emoji: '🌴', name: 'Dates & Dry Fruits', nameBn: 'খেজুর ও ড্রাই ফ্রুটস' },
  { id: 'dry-fruits-nuts', emoji: '🥜', name: 'Nuts & Seeds', nameBn: 'বাদাম ও বীজ' },
  { id: 'frozen-food', emoji: '❄️', name: 'Frozen Food', nameBn: 'হিমায়িত খাবার' },
  { id: 'pickles-sauces', emoji: '🏺', name: 'Pickles & Sauces', nameBn: 'আচার ও সস' },

  // 5. Electronics & Gadgets
  { id: 'cat-1', emoji: '🔌', name: 'Electronics & Gadgets', nameBn: 'ইলেকট্রনিক্স ও গ্যাজেট' },
  { id: 'cat-[#da1c24]', emoji: '🛍️', name: 'Super Deals', nameBn: 'সুপার ডিলস' },
  { id: 'cat-7', emoji: '📦', name: 'Grocery Packs', nameBn: 'গ্রোসারি প্যাক' },

  // 6. Beauty, Personal & Baby Care
  { id: 'cat-9', emoji: '💄', name: 'Cosmetics & Jewellery', nameBn: 'কসমেটিক্স ও গহনা' },
  { id: 'cat-5', emoji: '✨', name: 'Beauty & Health', nameBn: 'সৌন্দর্য ও স্বাস্থ্য' },
  { id: 'baby-care', emoji: '🍼', name: 'Baby Food & Diapers', nameBn: 'শিশু খাদ্য ও ডায়াপার' },
  { id: 'cat-10', emoji: '🧸', name: 'Kids Toys & Baby Items', nameBn: 'খেলনা ও বাচ্চাদের সামগ্রী' },
  { id: 'cat-11', emoji: '💊', name: 'Medicine & Pharmacy', nameBn: 'ওষুধ ও ফার্মেসি' },
  { id: 'home-cleaning', emoji: '🧼', name: 'Home Cleaning', nameBn: 'ঘর পরিষ্কারক' },

  // 7. Household, Books & Lifestyle
  { id: 'cat-4', emoji: '🏠', name: 'Home & Living', nameBn: 'গৃহস্থালি ও লিভিং' },
  { id: 'home-kitchen', emoji: '🍳', name: 'Kitchen & Cookware', nameBn: 'রান্নাঘর সামগ্রী' },
  { id: 'cat-12', emoji: '📚', name: 'Books & Stationery', nameBn: 'বই ও স্টেশনারি' },
  { id: 'sports-fitness', emoji: '⚽', name: 'Sports & Fitness', nameBn: 'খেলাধুলা সামগ্রী' },
  { id: 'cat-6', emoji: '⚡', name: 'Electrical & Wiring', nameBn: 'ইলেকট্রিক্যাল ও অয়্যার' },
  { id: 'gardening', emoji: '🌱', name: 'Plants & Gardening', nameBn: 'বাগান সামগ্রী' },
  { id: 'automotive', emoji: '🚗', name: 'Car & Bike Accessories', nameBn: 'গাড়ির এক্সেসরিজ' },
  { id: 'pet-care', emoji: '🐶', name: 'Pet Care & Food', nameBn: 'পোষা প্রাণীর যত্ন' }
];

export const SHWAPNO_DETAILED_CATEGORIES: MainCategory[] = [
  {
    id: 'cat-3',
    name: 'Food',
    nameBn: 'খাদ্য ও নিত্যপণ্য',
    emoji: '🥦',
    subCategories: [
      {
        id: 'fruits-veg',
        name: 'Fruits & Vegetables',
        nameBn: 'ফল ও শাকসবজি',
        subSubCategories: [
          { id: 'fresh-fruits', name: 'Fresh Fruits', nameBn: 'তাজা ফল' },
          { id: 'fresh-vegetables', name: 'Fresh Vegetables', nameBn: 'তাজা শাকসবজি' },
          { id: 'dry-fruits', name: 'Dry Fruits', nameBn: 'শুকনো ফল' },
          { id: 'dry-vegetables', name: 'Dry Vegetables', nameBn: 'শুকনো সবজি' }
        ]
      },
      {
        id: 'meat-fish',
        name: 'Meat & Fish',
        nameBn: 'মাংস ও মাছ',
        subSubCategories: [
          { id: 'chicken', name: 'Chicken & Poultry', nameBn: 'মুরগি ও পোল্ট্রি' },
          { id: 'beef-mutton', name: 'Beef & Mutton', nameBn: 'গরু ও খাসির মাংস' },
          { id: 'fresh-fish', name: 'Fresh Fish', nameBn: 'তাজা মাছ' }
        ]
      },
      { id: 'eggs', name: 'Eggs', nameBn: 'ডিম' },
      { id: 'baking', name: 'Baking Needs', nameBn: 'বেকিং আইটেম' },
      { id: 'drinks', name: 'Drinks', nameBn: 'পানীয়' },
      { id: 'snacks', name: 'Snacks', nameBn: 'স্ন্যাক্স' },
      { id: 'frozen', name: 'Frozen', nameBn: 'হিমায়িত খাবার' },
      { id: 'canned', name: 'Canned Food', nameBn: 'টিনজাত খাবার' },
      { id: 'ice-cream', name: 'Ice Cream', nameBn: 'আইসক্রিম' },
      { id: 'candy-chocolate', name: 'Candy & Chocolate', nameBn: 'ক্যান্ডি ও চকলেট' },
      { id: 'dairy', name: 'Dairy', nameBn: 'দুগ্ধজাত পণ্য' }
    ]
  },
  {
    id: 'baby-food',
    name: 'Baby Food & Care',
    nameBn: 'শিশুর খাদ্য ও যত্ন',
    emoji: '🍼',
    subCategories: [
      { id: 'baby-milk', name: 'Baby Milk & Formula', nameBn: 'শিশুর দুধ ও ফর্মুলা' },
      { id: 'baby-cereal', name: 'Baby Cereal & Food', nameBn: 'শিশুর সুজি ও সিরিয়াল' },
      { id: 'baby-wipes', name: 'Baby Wipes & Toiletries', nameBn: 'শিশুর ওয়াইপস ও সামগ্রী' }
    ]
  },
  { id: 'diapers', name: 'Diapers', nameBn: 'ডায়াপার', emoji: '🧻' },
  {
    id: 'home-cleaning',
    name: 'Home Cleaning',
    nameBn: 'ঘর পরিষ্কারক',
    emoji: '🧹',
    subCategories: [
      { id: 'detergent', name: 'Detergents & Soaps', nameBn: 'ডিটারজেন্ট ও সাবান' },
      { id: 'dishwash', name: 'Dishwashing', nameBn: 'ডিশওয়াশিং সামগ্রী' },
      { id: 'floor-cleaner', name: 'Floor Cleaners', nameBn: 'মেঝে পরিষ্কারক' }
    ]
  },
  { id: 'pet-care', name: 'Pet Care', nameBn: 'পোষা প্রাণীর যত্ন', emoji: '🐈' },
  {
    id: 'cat-5',
    name: 'Beauty & Health',
    nameBn: 'রূপচর্চা ও স্বাস্থ্য',
    emoji: '💄',
    subCategories: [
      { id: 'sub-51', name: 'Skincare', nameBn: 'ত্বকের যত্ন' },
      { id: 'sub-52', name: 'Hair Care', nameBn: 'চুলের যত্ন' },
      { id: 'sub-53', name: 'Perfume & Attar', nameBn: 'পারফিউম ও আতর' }
    ]
  },
  {
    id: 'cat-2',
    name: 'Fashion & Lifestyle',
    nameBn: 'ফ্যাশন ও লাইফস্টাইল',
    emoji: '👕',
    subCategories: [
      { id: 'sub-21', name: 'Traditional Saree & Salwar', nameBn: 'শাড়ি ও সালওয়ার' },
      { id: 'sub-22', name: 'Men\'s Panjabi', nameBn: 'পাঞ্জাবি ও কুর্তা' },
      { id: 'sub-23', name: 'Western Wear', nameBn: 'ওয়েস্টার্ন পোশাক' }
    ]
  },
  {
    id: 'cat-4',
    name: 'Home & Kitchen',
    nameBn: 'গৃহস্থালি ও রান্নাঘর',
    emoji: '🛏️',
    subCategories: [
      { id: 'sub-41', name: 'Bedding & Curtains', nameBn: 'বিছানার চাদর ও পর্দা' },
      { id: 'sub-42', name: 'Kitchen Appliances', nameBn: 'রান্নাঘরের জিনিসপত্র' },
      { id: 'sub-43', name: 'Handicrafts & Decor', nameBn: 'হস্তশিল্প ও সাজসজ্জা' }
    ]
  },
  { id: 'stationeries', name: 'Stationeries', nameBn: 'স্টেশনারি', emoji: '✏️' },
  { id: 'toys-sports', name: 'Toys & Sports', nameBn: 'খেলনা ও খেলাধুলা', emoji: '⚽' },
  {
    id: 'cat-1',
    name: 'Gadget',
    nameBn: 'গ্যাজেট ও ডিভাইস',
    emoji: '📱',
    subCategories: [
      { id: 'sub-11', name: 'Smartphones', nameBn: 'স্মার্টফোন' },
      { id: 'sub-12', name: 'Laptops', nameBn: 'ল্যাপটপ' },
      { id: 'sub-13', name: 'Audio', nameBn: 'হেডফোন ও অডিও' }
    ]
  }
];
