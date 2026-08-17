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
  // 0. Custom Package & Combo Deals (কম্বো ও স্পেশাল প্যাকেজ)
  { id: 'combo-deals', emoji: '🎁', name: 'Combo Offers & Packs', nameBn: 'কম্বো ও স্পেশাল প্যাকেজ' },
  { id: 'combo-package-builder', emoji: '📦', name: 'Custom Combo Builder', nameBn: 'প্যাকেজ ও কম্বো বানান' },

  // 1. Fast Food, Burgers, Pizza & Meals (ফাস্টফুড, পিজ্জা ও রেস্টুরেন্ট খাবার)
  { id: 'fast-food', emoji: '🍔', name: 'Fast Food & Burgers', nameBn: 'ফাস্টফুড ও বার্গার' },
  { id: 'pizza-pasta', emoji: '🍕', name: 'Pizza & Pasta', nameBn: 'পিজ্জা ও পাস্তা' },
  { id: 'cakes-pastry', emoji: '🎂', name: 'Cake & Pastry', nameBn: 'কেক ও পেস্ট্রি' },
  { id: 'sweets-desserts', emoji: '🧁', name: 'Sweets & Desserts', nameBn: 'মিষ্টি ও ডেজার্ট' },
  { id: 'restaurant-meals', emoji: '🍲', name: 'Biryani & Hot Meals', nameBn: 'বিরিয়ানি ও খাবার' },
  { id: 'ice-cream', emoji: '🍦', name: 'Ice Cream & Desserts', nameBn: 'আইসক্রিম ও ড্রিংকস' },
  { id: 'chocolates-candy', emoji: '🍫', name: 'Chocolates & Candies', nameBn: 'চকলেট ও ক্যান্ডি' },
  { id: 'bakery', emoji: '🍞', name: 'Bakery & Bread', nameBn: 'বেকারি ও ব্রেড' },
  { id: 'snacks-biscuits', emoji: '🍪', name: 'Snacks & Biscuits', nameBn: 'স্ন্যাক্স ও বিস্কুট' },
  { id: 'tea-coffee', emoji: '☕', name: 'Tea & Coffee', nameBn: 'চা ও কফি' },
  { id: 'beverages', emoji: '🥤', name: 'Juice & Beverages', nameBn: 'পানীয় সামগ্রী' },

  // 2. Daily Essentials & Groceries (নিত্যপ্রয়োজনীয় পণ্য ও বাজার)
  { id: 'groceries-spices', emoji: '🌶️', name: 'Spices & Groceries', nameBn: 'মুদি ও মসলা' },
  { id: 'grain-rice', emoji: '🌾', name: 'Rice & Grains', nameBn: 'চাল ও শস্যদানা' },
  { id: 'oil-ghee', emoji: '🧈', name: 'Mustard Oil & Ghee', nameBn: 'সরিষার তেল ও ঘি' },
  { id: 'meat-fish', emoji: '🥩', name: 'Meat & Fish', nameBn: 'মাছ ও মাংস' },
  { id: 'fresh-vegetables', emoji: '🥦', name: 'Fresh Vegetables', nameBn: 'তাজা শাকসবজি' },
  { id: 'fresh-fruits', emoji: '🍎', name: 'Fresh Fruits', nameBn: 'তাজা ফলমূল' },
  { id: 'eggs', emoji: '🥚', name: 'Farm Eggs', nameBn: 'ফার্মের ডিম' },
  { id: 'dairy-milk', emoji: '🥛', name: 'Dairy & Milk', nameBn: 'দুধ ও দুগ্ধজাত' },
  { id: 'organic-honey', emoji: '🍯', name: 'Pure Honey', nameBn: 'খাঁটি মধু' },
  { id: 'dry-fruits-dates', emoji: '🌴', name: 'Dates & Dry Fruits', nameBn: 'খেজুর ও ড্রাই ফ্রুটস' },
  { id: 'dry-fruits-nuts', emoji: '🥜', name: 'Nuts & Seeds', nameBn: 'বাদাম ও বীজ' },
  { id: 'frozen-food', emoji: '❄️', name: 'Frozen Food', nameBn: 'হিমায়িত খাবার' },
  { id: 'pickles-sauces', emoji: '🏺', name: 'Pickles & Sauces', nameBn: 'আচার ও সস' },
  { id: 'cat-7', emoji: '📦', name: 'Grocery Packs', nameBn: 'গ্রোসারি প্যাক' },

  // 3. Clothing & Fashion (জামাকাপড় ও ফ্যাশন)
  { id: 'cat-2', emoji: '👕', name: 'Fashion & Clothing', nameBn: 'ফ্যাশন ও পোশাক' },
  { id: 'sarees-ethnic', emoji: '👘', name: 'Saree & Ethnic Wear', nameBn: 'শাড়ি ও ঐতিহ্যবাহী' },
  { id: 'cat-8', emoji: '👟', name: 'Shoes & Sandals', nameBn: 'জুতা ও স্যান্ডেল' },
  { id: 'watch-accessories', emoji: '⌚', name: 'Watches & Accessories', nameBn: 'ঘড়ি ও এক্সেসরিজ' },

  // 4. Beauty, Personal & Baby Care
  { id: 'cat-9', emoji: '💄', name: 'Cosmetics & Jewellery', nameBn: 'কসমেটিক্স ও গহনা' },
  { id: 'cat-5', emoji: '✨', name: 'Beauty & Health', nameBn: 'সৌন্দর্য ও রূপচর্চা' },
  { id: 'baby-care', emoji: '🍼', name: 'Baby Food & Diapers', nameBn: 'শিশু খাদ্য ও ডায়াপার' },
  { id: 'cat-10', emoji: '🧸', name: 'Kids Toys & Baby Items', nameBn: 'খেলনা ও বাচ্চাদের সামগ্রী' },
  { id: 'cat-11', emoji: '💊', name: 'Medicine & Pharmacy', nameBn: 'ওষুধ ও ফার্মেসি' },
  { id: 'home-cleaning', emoji: '🧼', name: 'Home Cleaning', nameBn: 'ঘর পরিষ্কারক' },

  // 5. Electronics & Gadgets
  { id: 'cat-1', emoji: '📱', name: 'Electronics & Gadgets', nameBn: 'ইলেকট্রনিক্স ও গ্যাজেট' },
  { id: 'cat-6', emoji: '⚡', name: 'Electrical & Wiring', nameBn: 'ইলেকট্রিক্যাল ও অয়্যার' },

  // 6. Household, Books & Lifestyle
  { id: 'cat-4', emoji: '🏠', name: 'Home & Living', nameBn: 'গৃহস্থালি ও লিভিং' },
  { id: 'home-kitchen', emoji: '🍳', name: 'Kitchen & Cookware', nameBn: 'রান্নাঘর সামগ্রী' },
  { id: 'cat-12', emoji: '📚', name: 'Books & Stationery', nameBn: 'বই ও স্টেশনারি' },
  { id: 'sports-fitness', emoji: '⚽', name: 'Sports & Fitness', nameBn: 'খেলাধুলা সামগ্রী' },
  { id: 'gardening', emoji: '🌱', name: 'Plants & Gardening', nameBn: 'বাগান সামগ্রী' },
  { id: 'automotive', emoji: '🚗', name: 'Car & Bike Accessories', nameBn: 'গাড়ির এক্সেসরিজ' },
  { id: 'pet-care', emoji: '🐶', name: 'Pet Care & Food', nameBn: 'পোষা প্রাণীর যত্ন' }
];

export const SHWAPNO_DETAILED_CATEGORIES: MainCategory[] = [
  {
    id: 'combo-deals',
    name: 'Combo & Packages',
    nameBn: 'কম্বো ও স্পেশাল প্যাকেজ',
    emoji: '🎁',
    subCategories: [
      { id: 'fastfood-combos', name: 'Burger & Fast Food Combo', nameBn: 'বার্গার ও ফাস্টফুড কম্বো' },
      { id: 'grocery-combos', name: 'Monthly Grocery Combo', nameBn: 'মাসিক বাজার কম্বো প্যাক' },
      { id: 'biryani-combos', name: 'Biryani Feast Box', nameBn: 'কাচ্চি ও বিরিয়ানি কম্বো' },
      { id: 'sweet-combos', name: 'Sweets & Desserts Box', nameBn: 'মিষ্টি ও ডেজার্ট গিফট বক্স' }
    ]
  },
  {
    id: 'fast-food',
    name: 'Fast Food & Burgers',
    nameBn: 'ফাস্টফুড ও বার্গার',
    emoji: '🍔',
    subCategories: [
      { id: 'burgers', name: 'Crispy Burgers', nameBn: 'বার্গার ও স্যান্ডউইচ' },
      { id: 'fried-chicken', name: 'Fried Chicken & Wings', nameBn: 'ফ্রাইড চিকেন ও উইংস' },
      { id: 'pizza-pasta', name: 'Pizza & Pasta', nameBn: 'পিজ্জা ও পাস্তা' },
      { id: 'fries-sides', name: 'French Fries & Sides', nameBn: 'ফ্রেঞ্চ ফ্রাই ও অনিয়ন রিংস' }
    ]
  },
  {
    id: 'cakes-pastry',
    name: 'Cakes & Sweets',
    nameBn: 'কেক, পেস্ট্রি ও মিষ্টি',
    emoji: '🎂',
    subCategories: [
      { id: 'birthday-cakes', name: 'Celebration Cakes', nameBn: 'বার্থডে ও অ্যানিভার্সারি কেক' },
      { id: 'pastry-cupcakes', name: 'Pastries & Cupcakes', nameBn: 'পেস্ট্রি ও কাপকেক' },
      { id: 'sweets-desserts', name: 'Traditional Sweets', nameBn: 'ঐতিহ্যবাহী রসগোল্লা ও মিষ্টি' },
      { id: 'bakery-bread', name: 'Fresh Bakery & Bread', nameBn: 'তাজা বেকারি ও পাউরুটি' }
    ]
  },
  {
    id: 'restaurant-meals',
    name: 'Biryani & Hot Meals',
    nameBn: 'বিরিয়ানি ও গরম খাবার',
    emoji: '🍲',
    subCategories: [
      { id: 'kacchi-biryani', name: 'Mutton Kacchi & Biryani', nameBn: 'কাচ্চি ও চিকেন বিরিয়ানি' },
      { id: 'khichuri-curry', name: 'Bhuna Khichuri & Curry', nameBn: 'ভুনা খিচুড়ি ও মাংস কারি' },
      { id: 'kebab-grill', name: 'Kebabs, Grills & Naan', nameBn: 'কাবাব, গ্রিল ও নান' }
    ]
  },
  {
    id: 'cat-3',
    name: 'Food & Groceries',
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
          { id: 'dry-fruits-dates', name: 'Dates & Dry Fruits', nameBn: 'খেজুর ও শুকনো ফল' },
          { id: 'dry-fruits-nuts', name: 'Nuts & Seeds', nameBn: 'বাদাম ও বীজ' }
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
      { id: 'eggs', name: 'Farm Eggs', nameBn: 'ফার্মের ডিম' },
      { id: 'grain-rice', name: 'Rice & Grains', nameBn: 'চাল ও শস্যদানা' },
      { id: 'oil-ghee', name: 'Mustard Oil & Ghee', nameBn: 'সরিষার তেল ও ঘি' },
      { id: 'organic-honey', name: 'Pure Honey', nameBn: 'খাঁটি মধু' },
      { id: 'dairy-milk', name: 'Dairy & Milk', nameBn: 'দুধ ও দুগ্ধজাত' },
      { id: 'tea-coffee', name: 'Tea & Coffee', nameBn: 'চা ও কফি' },
      { id: 'drinks', name: 'Cold Drinks & Juice', nameBn: 'পানীয় ও জুস' },
      { id: 'snacks', name: 'Snacks & Biscuits', nameBn: 'স্ন্যাক্স ও বিস্কুট' },
      { id: 'frozen', name: 'Frozen Food', nameBn: 'হিমায়িত খাবার' },
      { id: 'ice-cream', name: 'Ice Cream', nameBn: 'আইসক্রিম' },
      { id: 'candy-chocolate', name: 'Candy & Chocolate', nameBn: 'ক্যান্ডি ও চকলেট' }
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
      { id: 'baby-wipes', name: 'Baby Wipes & Toiletries', nameBn: 'শিশুর ওয়াইপস ও সামগ্রী' },
      { id: 'diapers', name: 'Baby Diapers', nameBn: 'শিশুর ডায়াপার' }
    ]
  },
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
  { id: 'pet-care', name: 'Pet Care', nameBn: 'পোষা প্রাণীর যত্ন', emoji: '🐶' },
  {
    id: 'cat-5',
    name: 'Beauty & Skincare',
    nameBn: 'সৌন্দর্য ও রূপচর্চা',
    emoji: '💄',
    subCategories: [
      { id: 'sub-51', name: 'Skincare & Face Care', nameBn: 'ত্বকের যত্ন ও ফেসকেয়ার' },
      { id: 'sub-52', name: 'Hair Care & Shampoos', nameBn: 'চুলের যত্ন ও শ্যাম্পু' },
      { id: 'sub-53', name: 'Perfume & Attar', nameBn: 'পারফিউম ও আতর' },
      { id: 'sub-91', name: 'Makeup & Cosmetics', nameBn: 'মেকআপ ও কসমেটিক্স' }
    ]
  },
  {
    id: 'cat-2',
    name: 'Fashion & Lifestyle',
    nameBn: 'ফ্যাশন ও লাইফস্টাইল',
    emoji: '👕',
    subCategories: [
      { id: 'sub-21', name: 'Traditional Saree & Salwar', nameBn: 'শাড়ি ও সালওয়ার' },
      { id: 'sub-22', name: 'Men\'s Panjabi & Kurta', nameBn: 'পাঞ্জাবি ও কুর্তা' },
      { id: 'sub-23', name: 'Western Wear', nameBn: 'ওয়েস্টার্ন পোশাক' },
      { id: 'cat-8', name: 'Shoes & Footwear', nameBn: 'জুতা ও স্যান্ডেল' }
    ]
  },
  {
    id: 'cat-4',
    name: 'Home & Kitchen',
    nameBn: 'গৃহস্থালি ও রান্নাঘর',
    emoji: '🍳',
    subCategories: [
      { id: 'sub-41', name: 'Bedding & Curtains', nameBn: 'বিছানার চাদর ও পর্দা' },
      { id: 'sub-42', name: 'Kitchen Cookware & Appliances', nameBn: 'রান্নাঘরের জিনিসপত্র' },
      { id: 'sub-43', name: 'Handicrafts & Decor', nameBn: 'হস্তশিল্প ও সাজসজ্জা' }
    ]
  },
  { id: 'cat-12', name: 'Books & Stationery', nameBn: 'বই ও স্টেশনারি', emoji: '📚' },
  { id: 'sports-fitness', name: 'Toys & Sports', nameBn: 'খেলনা ও খেলাধুলা', emoji: '⚽' },
  {
    id: 'cat-1',
    name: 'Gadgets & Devices',
    nameBn: 'গ্যাজেট ও ডিভাইস',
    emoji: '📱',
    subCategories: [
      { id: 'sub-11', name: 'Smartphones & Mobile', nameBn: 'স্মার্টফোন ও মোবাইল' },
      { id: 'sub-12', name: 'Laptops & Computers', nameBn: 'ল্যাপটপ ও কম্পিউটার' },
      { id: 'sub-13', name: 'Audio & Wireless Earbuds', nameBn: 'হেডফোন ও অডিও' }
    ]
  }
];
