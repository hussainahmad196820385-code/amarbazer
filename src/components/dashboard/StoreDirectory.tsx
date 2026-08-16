import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Store, ShieldCheck, CheckCircle2, Phone, Mail, MapPin, Star,
  DollarSign, ShoppingBag, ArrowUpRight, Plus, X, Sparkles, 
  Info, Tag, AlertCircle, ImageIcon, Sliders, ChevronRight, Check,
  Search, ChevronDown, Palette, Settings, ArrowRight, Flame, Upload,
  Trash2
} from 'lucide-react';

const PRESETS_BY_CAT: Record<string, { title: string; titleBn: string; url: string }[]> = {
  'cat-1': [ // Electronics & Gadgets
    { title: 'Smart Phone Prime X', titleBn: 'স্মার্ট ফোন প্রাইম এক্স', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' }
  ],
  'cat-2': [ // Fashion & Clothing
    { title: 'Classic Cotton Shirt', titleBn: 'ক্লাসিক কটন ক্যাজুয়াল শার্ট', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80' }
  ],
  'cat-3': [ // BD Foods & Organic
    { title: 'Pure Sundarbans Honey', titleBn: 'সুন্দরবনের খাঁটি প্রাকৃতিক মধু', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' }
  ],
  'cat-4': [ // Home & Living
    { title: 'Luxury Bedding Set', titleBn: 'লাক্সারি কটন বেডশিট সেট', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80' }
  ],
  'cat-5': [ // Beauty & Health
    { title: 'Natural Aloe Vera Skin Gel', titleBn: 'অ্যালোভেরা স্কিন সুথিং জেল', url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80' }
  ]
};

const QUALITY_OPTIONS = [
  { value: 'Premium Export', label: 'Export Quality (রপ্তানিযোগ্য প্রিমিয়াম)', labelBn: 'রপ্তানিযোগ্য প্রিমিয়াম কোয়ালিটি' },
  { value: '100% Organic', label: '100% Natural Organic (শতভাগ অর্গানিক)', labelBn: '১০০% প্রাকৃতিক ও অর্গানিক সামগ্রী' },
  { value: 'Standard Grade A', label: 'Standard Grade A (উন্নত এ-গ্রেড)', labelBn: 'স্ট্যান্ডার্ড গ্রেড-এ মান' },
  { value: 'A-Grade Fresh', label: 'A-Grade Fresh (তাজা ও সতেজ)', labelBn: 'তাজা ও সতেজ গ্রেড-এ' }
];

const PRESETS_WEIGHTS = ['250g', '500g', '1kg', '2kg', '5kg', '1 Litre', '5 Litre', 'Custom'];
const PRESETS_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom'];

const toBengaliNumber = (num: number): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(digit => {
    const d = parseInt(digit);
    return isNaN(d) ? digit : bnDigits[d];
  }).join('');
};

export const StoreDirectory: React.FC = () => {
  const { language, categories, refreshProducts, setActivePanel, activePanel, setSelectedProduct, currentUser } = useApp();
  const [subModule, setSubModule] = useState<'panel' | 'sandbox' | 'customer-rules'>('panel');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(() => {
    return 'all';
  });

  const [campaigns, setCampaigns] = useState(() => {
    let items = [];
    try {
      const saved = localStorage.getItem('market_campaigns');
      if (saved) {
        items = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading market_campaigns:', e);
    }
    if (!items || items.length === 0) {
      items = [
        {
          id: 'all',
          name: 'SUMMER FEST',
          nameBn: 'সামার ফেস্ট',
          tagline: 'Summer Fest - Freshness Delivered!',
          taglineBn: 'সামার ফেস্ট - তরতাজা সতেজ অফার!',
          description: 'Beat the heat with premium Rajshahi Himsagar mangoes, sweet green coconuts, cold beverages, and 100% organic products direct to your doorstep!',
          descriptionBn: 'গ্রীষ্মের গরমে সতেজ থাকুন! রাজশাহীর মিষ্টি আম, ডাব এবং ঠান্ডা ড্রিংকস সহ ১০০% খাঁটি ও অর্গানিক পণ্য সরাসরি পৌঁছে যাবে আপনার ঘরে।',
          isActive: true,
          accentColor: '#fb923c',
          image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
          gradient: 'from-amber-500 via-orange-500 to-red-600',
        },
        {
          id: 'bogo',
          name: 'GREAT DEALS',
          nameBn: 'বিশাল ডিলস',
          tagline: 'Great Deals - Premium Brands Mega Discount!',
          taglineBn: 'বিশাল ডিলস - গ্যাজেট ও লাইফস্টাইলে মহা ছাড়!',
          description: 'Save up to ৳6,000+ on premium Walton 4K Smart TVs, Samsung official phones, Baseus chargers, and handcrafted traditional Dhaka Jamdani sarees!',
          descriptionBn: 'ওয়ালটন ৫টিভি, স্যামসাং স্মার্টফোন, বাসিউস পাওয়ার ব্যাংক এবং ঢাকার ঐতিহ্যবাহী জামদারি শাড়িতে পাচ্ছেন সর্বকালের সেরা আকর্ষণীয় ডিল!',
          isActive: true,
          accentColor: '#da1c24',
          image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
          gradient: 'from-[#bf1e2e] via-[#4c0519] to-indigo-950',
        },
        {
          id: 'unilever',
          name: 'UNILEVER-STOCK & SAVE',
          nameBn: 'ইউনিলিভার স্টক সেভ',
          tagline: 'Deals on Unilever - Stock & Save Fest!',
          taglineBn: 'ইউনিলিভার শপিং ফেস্ট - সুপার ছাড়!',
          description: 'Keep your home clean and your family protected! Save big with exciting discounts and cashbacks on Surf Excel, Lux, Vim, and Lifebuoy soaps.',
          descriptionBn: 'সার্ফ এক্সেল, লাক্স সাবান, ভিম লিকুইড এবং লাইফবয় জীবাণুনাশক পণ্যে পাচ্ছেন আকর্ষণীয় ডিসকাউন্ট এবং নিশ্চিত ক্যাশব্যাক অফার।',
          isActive: true,
          accentColor: '#10b981',
          image: 'https://images.unsplash.com/photo-1607006342411-92fc0a41d08c?auto=format&fit=crop&w=600&q=80',
          gradient: 'from-[#005a9c] via-[#059669] to-[#047857]',
        },
        {
          id: 'summer',
          name: 'BUY & SAVE MORE',
          nameBn: 'বেশি কিনুন বেশি বাঁচান',
          tagline: 'Grocery Essentials - Family Pack Mega Savings!',
          taglineBn: 'বেশি কিনুন বেশি বাঁচান - নিত্যপ্রয়োজনীয় ফ্যামিলি প্যাক!',
          description: 'Stock your kitchen with 5 Liters of wooden-milled Pure Mustard Oil and 1kg Sundarbans Natural Honey at unmatched prices for maximum household budget savings.',
          descriptionBn: 'কাঠের ঘানির খাঁটি সরিষার তেল ৫ লিটার এবং সুন্দরবনের মধু ১ কেজির ফ্যামিলি প্যাকে সাশ্রয় করুন আকর্ষণীয় ছাড়ের মাধ্যমে।',
          isActive: true,
          accentColor: '#f59e0b',
          image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
          gradient: 'from-amber-600 via-yellow-600 to-amber-900',
        },
        {
          id: 'brands',
          name: 'OUR BRANDS',
          nameBn: 'আমাদের ব্র্যান্ডস',
          tagline: 'Top Brands - Official Warranty & Authenticity!',
          taglineBn: 'শীর্ষ ব্র্যান্ড - অফিসিয়াল ওয়ারেন্টি ও সত্যতা!',
          description: 'Shop confidently with 100% authentic international brands and official local warranty guarantees on all home essentials.',
          descriptionBn: '১০০% আসল ব্র্যান্ড এবং অফিসিয়াল স্থানীয় ওয়ারেন্টির নির্ভরযোগ্যতার সাথে আপনার প্রয়োজনীয় সকল পণ্য ক্রয় করুন।',
          isActive: true,
          accentColor: '#4f46e5',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
          gradient: 'from-indigo-600 via-purple-600 to-indigo-900',
        }
      ];
    }
    return items.map((c: any) => ({
      ...c,
      showBanner: c.showBanner !== false,
      showBadge: c.showBadge !== false,
      showImage: c.showImage !== false,
      showTagline: c.showTagline !== false,
      showDescription: c.showDescription !== false,
      adImage: c.adImage || '',
      showTimer: c.showTimer !== false,
      timerEndsAt: c.timerEndsAt || '',
      timerDays: c.timerDays !== undefined ? c.timerDays : 1,
      timerHours: c.timerHours !== undefined ? c.timerHours : 15,
      timerMinutes: c.timerMinutes !== undefined ? c.timerMinutes : 28,
      timerSeconds: c.timerSeconds !== undefined ? c.timerSeconds : 47,
      filterKeyword: c.filterKeyword || '',
    }));
  });

  useEffect(() => {
    const saved = localStorage.getItem('market_campaigns');
    if (!saved && campaigns.length > 0) {
      localStorage.setItem('market_campaigns', JSON.stringify(campaigns));
      window.dispatchEvent(new Event('storage'));
    }
  }, [campaigns]);

  const handleAdImageUpload = (campId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCampaigns(prev => prev.map(c => c.id === campId ? { ...c, adImage: base64String } : c));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setSubModule('panel');
  }, [activePanel]);

  const mockStores = useMemo(() => {
    return [
      {
        id: 'sel-1',
        name: 'Dhaka Tech Store',
        logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=150&h=150&q=80',
        district: 'Dhaka',
        category: 'Electronics & Gadgets',
      },
      {
        id: 'sel-2',
        name: 'Heritage Dhaka weavers',
        logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=150&h=150&q=80',
        district: 'Narayanganj',
        category: 'Fashion & Clothing',
      },
      {
        id: 'sel-3',
        name: 'Sundarbans Pure Honey & Organic',
        logo: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=150&h=150&q=80',
        district: 'Khulna',
        category: 'BD Foods & Organic',
      },
      {
        id: 'sel-4',
        name: 'Sylhet Tea Estate Direct',
        logo: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=150&h=150&q=80',
        district: 'Sylhet',
        category: 'BD Foods & Organic',
      }
    ];
  }, []);

  // Form Fields State
  const [selectedStoreId, setSelectedStoreId] = useState('sel-3'); // default Sundarbans Honey & Organic
  const [selectedCatId, setSelectedCatId] = useState('cat-3'); // default BD Foods & Organic
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('100');
  const [qualityGrade, setQualityGrade] = useState('Premium Export');
  const [selectedAttr, setSelectedAttr] = useState<string>('1kg');
  const [customAttrText, setCustomAttrText] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [brand, setBrand] = useState('');
  const [warranty, setWarranty] = useState('Purity & Quality Guaranteed');
  const [customSpecs, setCustomSpecs] = useState<{ label: string; labelBn?: string; value: string; valueBn?: string }[]>([]);
  const [description, setDescription] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories;
    const query = categorySearchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(query) || 
      (cat.nameBn && cat.nameBn.toLowerCase().includes(query))
    );
  }, [categories, categorySearchQuery]);

  const [submitting, setSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successItemTitle, setSuccessItemTitle] = useState('');

  // Audio system chime
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.35); // C6
      osc.stop(ctx.currentTime + 0.55);
    } catch (e) {
      console.warn('Audio play blocked:', e);
    }
  };

  // Populate standard details when Category changes to make life super easy for user
  useEffect(() => {
    setSelectedPresetIdx(0);
    
    // Reset uploaded images on category switch, leaving it clean and empty
    setImageUrls([]);
    setCustomSpecs([]);
    setWarranty('Purity & Quality Guaranteed');
    
    if (selectedCatId === 'cat-1') {
      setTitle('Dual Speaker Sound System S1');
      setTitleBn('ডুয়াল স্পিকার হাই-ফিডেলিটি সাউন্ড সিস্টেম');
      setBrand('Dhaka Tech');
      setPrice('4500');
      setDiscountPrice('3800');
      setQualityGrade('Premium Export');
      setSelectedAttr('Standard Pack');
      setDescription('Dual acoustic drivers, powerful bass, high-fidelity sound output, long lasting rechargeable battery built-in.');
      setDescriptionBn('ডুয়াল অ্যাকোস্টিক ড্রাইভার, শক্তিশালী বেস, উচ্চ মানের সাউন্ড আউটপুট এবং দীর্ঘস্থায়ী রিচার্জেবল ব্যাটারি বিল্ট-ইন।');
    } else if (selectedCatId === 'cat-2') {
      setTitle('Handloom Cotton Jamdani Saree');
      setTitleBn('হস্তশিল্প সুতি জামদানি শাড়ি');
      setBrand('Heritage Dhaka');
      setPrice('3200');
      setDiscountPrice('2600');
      setQualityGrade('Premium Export');
      setSelectedAttr('Free Size');
      setDescription('Pure traditional cotton jamdani saree handwoven by artisan weavers of Narayanganj. Eye-catching design.');
      setDescriptionBn('নারায়ণগঞ্জের দক্ষ তাঁতিদের হাতে বোনা খাঁটি ঐতিহ্যবাহী সুতি জামদানি শাড়ি। আকর্ষণীয় ও নান্দনিক ডিজাইনের নিখুঁত কারুকাজ।');
    } else if (selectedCatId === 'cat-3') {
      setTitle('Pure Khalisha Honey Sundarbans');
      setTitleBn('সুন্দরবনের খাঁটি খলিশা ফুল মধু');
      setBrand('Sundarbans Organic');
      setPrice('950');
      setDiscountPrice('820');
      setQualityGrade('100% Organic');
      setSelectedAttr('1kg');
      setDescription('100% natural raw honey harvested directly from wild hives in deep Sundarbans forest. Unfiltered and chemical free.');
      setDescriptionBn('সুন্দরবনের গভীর ম্যানগ্রোভ বনাঞ্চল থেকে সরাসরি সংগ্রহ করা শতভাগ খাঁটি কাঁচা খলিশা মধু। কোনো কেমিক্যাল বা ভেজালহীন।');
    } else if (selectedCatId === 'cat-4') {
      setTitle('Satin Feel Premium Bedding Set');
      setTitleBn('সাটিন ফিল প্রিমিয়াম বেডশিট ও বালিশের কভার সেট');
      setBrand('Karuponn');
      setPrice('2800');
      setDiscountPrice('2400');
      setQualityGrade('Standard Grade A');
      setSelectedAttr('Free Size');
      setDescription('Soft premium satin cotton bedsheet set with matching pillowcases. Breathable fabric and non-fading colors.');
      setDescriptionBn('নরম প্রিমিয়াম সাটিন সুতি বেডশিট এবং ম্যাচিং বালিশের কভার সেট। চমৎকার আরামদায়ক কাপড় এবং শতভাগ কালার গ্যারান্টি।');
    } else {
      setTitle('Organic Aloe Vera Herbal Skin Care Gel');
      setTitleBn('অর্গানিক অ্যালোভেরা হারবাল স্কিন কেয়ার জেল');
      setBrand('Naturals BD');
      setPrice('450');
      setDiscountPrice('390');
      setQualityGrade('100% Organic');
      setSelectedAttr('250g');
      setDescription('Soothing skin care gel formulated with pure organic Aloe Vera. Refreshes face, heals sun-burns and hydrates.');
      setDescriptionBn('খাঁটি অর্গানিক অ্যালোভেরা সমৃদ্ধ স্কিন কেয়ার জেল। ত্বক সতেজ রাখে, রোদে পোড়া দাগ দূর করে এবং প্রাকৃতিকভাবে ময়েশ্চারাইজ করে।');
    }
  }, [selectedCatId]);

  const activePresets = PRESETS_BY_CAT[selectedCatId] || [];
  const selectedImageUrl = imageUrls[0] || activePresets[selectedPresetIdx]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert(language === 'bn' ? 'দয়া করে প্রোডাক্টের নাম লিখুন!' : 'Please specify product name!');
      return;
    }
    if (!price || Number(price) <= 0) {
      alert(language === 'bn' ? 'দয়া করে সঠিক মূল্য নির্ধারণ করুন!' : 'Please specify a valid price!');
      return;
    }

    try {
      setSubmitting(true);

      const storeObj = mockStores.find(st => st.id === selectedStoreId) || mockStores[0];
      const categoryObj = categories.find(c => c.id === selectedCatId) || categories[0] || { name: 'BD Foods & Organic', nameBn: 'খাদ্য ও অর্গানিক সামগ্রী' };

      const attributeLabel = selectedCatId === 'cat-1' ? 'Storage' : selectedCatId === 'cat-2' ? 'Size' : 'Weight';
      const finalAttrValue = customAttrText || selectedAttr;

      // Filter empty image URLs
      const finalImages = imageUrls.filter(url => url.trim() !== '');
      if (finalImages.length === 0) {
        finalImages.push(selectedImageUrl);
      }

      const payload = {
        title: title,
        titleBn: titleBn || title,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        stock: Number(stock) || 50,
        categoryId: selectedCatId,
        categoryName: categoryObj.name,
        brand: brand || storeObj.name,
        description: description,
        descriptionBn: descriptionBn || description,
        sellerId: storeObj.id,
        sellerName: storeObj.name,
        images: finalImages,
        sku: `${storeObj.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        warranty: warranty || 'Purity & Quality Guaranteed',
        variants: [
          {
            id: `v-${Date.now()}-attr`,
            name: attributeLabel,
            options: [finalAttrValue]
          },
          {
            id: `v-${Date.now()}-qual`,
            name: 'Quality',
            options: [qualityGrade]
          }
        ],
        customSpecs: customSpecs.filter(s => s.label.trim() !== '' && s.value.trim() !== ''),
        tags: [categoryObj.name.toLowerCase(), 'new', 'store-listing'],
        isFeatured: true,
        isApproved: true
      };

      const newProduct = await api.createProduct(payload);
      
      // Success triggers!
      playChime();
      setSuccessItemTitle(titleBn || title);
      setShowSuccessToast(true);

      // Reset form states
      setTitle('');
      setTitleBn('');
      setPrice('');
      setDiscountPrice('');
      setCustomAttrText('');
      setImageUrls(['', '', '', '']);
      setCustomSpecs([]);
      setWarranty('Purity & Quality Guaranteed');

      // Refresh catalog list
      await refreshProducts();

      // Automatically go to Browse Market (customer panel) and open the new product's public detail view
      setTimeout(() => {
        setShowSuccessToast(false);
        setSelectedProduct(newProduct);
        setActivePanel('customer');
      }, 1500);

    } catch (err) {
      console.error(err);
      alert(language === 'bn' ? 'দুঃখিত, প্রোডাক্ট তালিকাভুক্ত করতে সমস্যা হয়েছে।' : 'Error publishing product to catalog.');
    } finally {
      setSubmitting(false);
    }
  };

  if (subModule === 'customer-rules') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-wider text-teal-500 dark:text-teal-400">
          <span>MARKET ARCHITECTURE</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <button 
            type="button"
            onClick={() => setSubModule('panel')}
            className="hover:text-amber-500 transition cursor-pointer font-black"
          >
            VENDORS
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-400 dark:text-slate-500">CUSTOMER CAMPAIGN &amp; RULES CONTROL</span>
        </div>

        {/* Title Block */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-teal-500/10 rounded-xl text-teal-500 border border-teal-500/20">
              <Settings className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {language === 'bn' ? 'কাস্টমার ক্যাম্পেইন ও রুলস কন্ট্রোল' : 'CUSTOMER CAMPAIGN & RULES CONTROL'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                {language === 'bn' 
                  ? 'আপনার ব্রাউজার মার্কেটে লাল বর্ডার চিহ্নিত ক্যাম্পেইন অপশনগুলো নিচে রেন্ডার করা হয়েছে।' 
                  : 'The campaign navigation names highlighted in red on your Browse Market are listed below.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubModule('panel')}
            className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs px-4 py-2 rounded-xl transition uppercase tracking-wider"
          >
            {language === 'bn' ? 'কন্ট্রোল প্যানেল' : 'BACK TO PANEL'}
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: List of campaign markers */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                {language === 'bn' ? 'চিহ্নিত ক্যাম্পেইন তালিকা' : 'MARKED CAMPAIGNS'}
              </span>
              
              {/* Add New Campaign Button */}
              <button
                onClick={() => {
                  const newId = `campaign-${Date.now()}`;
                  const nextIndex = campaigns.length + 1;

                  const presetsList = [
                    {
                      keyword: 'gadget',
                      name: 'SMART GADGETS',
                      nameBn: 'স্মার্ট গ্যাজেটস',
                      tagline: 'Latest Tech - Experience Future Today!',
                      taglineBn: 'আধুনিক প্রযুক্তির স্মার্ট গ্যাজেট - সেরা ডিল!',
                      description: 'Upgrade your daily life with our collection of smart home accessories, fast charging power banks, and high-quality bluetooth audio devices.',
                      descriptionBn: 'আপনার দৈনন্দিন জীবনকে সহজ করুন উন্নত কোয়ালিটির পাওয়ার ব্যাংক, স্মার্ট হোমস এক্সেসরিজ এবং হেডফোনের সমাহারে।',
                      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
                      gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
                      accentColor: '#8b5cf6'
                    },
                    {
                      keyword: 'eid',
                      name: 'EID FASHION FESTIVAL',
                      nameBn: 'ঈদ ফ্যাশন উৎসব',
                      tagline: 'Eid Al-Adha Collection - Premium Threads!',
                      taglineBn: 'ঈদ ফ্যাশন কালেকশন - প্রিমিয়াম ট্র্যাডিশনাল পোশাক!',
                      description: 'Dress elegantly in handcrafted embroidery Panjabis and authentic Dhakai Jamdani sarees for your festive celebrations.',
                      descriptionBn: 'উৎসবের আমেজে নিজেকে সাজান আকর্ষণীয় ডিজাইনের এমব্রয়ডারি পাঞ্জাবি ও খাঁটি হাতে বোনা সুতি ঢাকাই জামদানি শাড়িতে।',
                      image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf03b0?auto=format&fit=crop&w=600&q=80',
                      gradient: 'from-rose-600 via-pink-600 to-red-700',
                      accentColor: '#e11d48'
                    },
                    {
                      keyword: 'beauty',
                      name: 'HEALTH & BEAUTY CARE',
                      nameBn: 'স্বাস্থ্য ও সৌন্দর্য্য যত্ন',
                      tagline: 'Organic Skincare - Glow Naturally!',
                      taglineBn: 'অর্গানিক স্কিনকেয়ার - প্রাকৃতিক উজ্জ্বলতা ও যত্ন!',
                      description: 'Revitalize your skin and hair with natural herbal oils, organic luxury soaps, and moisturizing shampoo with official brand authenticity.',
                      descriptionBn: 'প্রাকৃতিক ভেষজ উপাদান সমৃদ্ধ শ্যাম্পু, লাক্স সাবান এবং স্কিনকেয়ার সামগ্রীর ব্যবহারে বজায় রাখুন আপনার ত্বকের সতেজতা ও লাবণ্য।',
                      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
                      gradient: 'from-emerald-500 via-teal-500 to-green-600',
                      accentColor: '#0d9488'
                    },
                    {
                      keyword: 'drinks',
                      name: 'COFFEE & TEA BLENDS',
                      nameBn: 'সিলেটের স্পেশাল চা ও পানীয়',
                      tagline: 'Authentic Sylhet Special Tea - Rich Aroma!',
                      taglineBn: 'সিলেটের স্পেশাল চা ও পানীয় - রিফ্রেশিং স্বাদ ও সুবাস!',
                      description: 'Experience the fresh organic hand-picked tea leaves from Sylhet estates, natural coconut water, and premium cool lemon carbonated beverages.',
                      descriptionBn: 'চায়ের রাজধানী সিলেট থেকে সরাসরি আনা সতেজ সুগন্ধি চা পাতা এবং ডাবের মিষ্টি পানি ও কোমল পানীয়ের অফুরন্ত রিফ্রেশমেন্ট!',
                      image: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=600&q=80',
                      gradient: 'from-lime-600 via-green-600 to-emerald-700',
                      accentColor: '#65a30d'
                    },
                    {
                      keyword: 'shoes',
                      name: 'PREMIUM FOOTWEAR',
                      nameBn: 'প্রিমিয়াম জুতো কালেকশন',
                      tagline: 'Apex Footwear - Walks of Confidence!',
                      taglineBn: 'অ্যাপেক্স ফুটওয়্যার - প্রতিটি পদক্ষেপে আত্মবিশ্বাস!',
                      description: 'Step into comfort with Apex premium cowhide leather formal shoes and casual sandals designed for maximum durability.',
                      descriptionBn: 'হাঁটুন মনের আনন্দে! অ্যাপেক্স প্রিমিয়াম চামড়ার জুতো ও আরামদায়ক ক্যাজুয়াল স্যান্ডেল এখন আকর্ষণীয় অফারে।',
                      image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80',
                      gradient: 'from-sky-600 via-blue-600 to-indigo-700',
                      accentColor: '#0284c7'
                    }
                  ];

                  const preset = presetsList[nextIndex % presetsList.length];

                  const newCampaign = {
                    id: newId,
                    name: preset.name,
                    nameBn: preset.nameBn,
                    tagline: preset.tagline,
                    taglineBn: preset.taglineBn,
                    description: preset.description,
                    descriptionBn: preset.descriptionBn,
                    isActive: true,
                    accentColor: preset.accentColor,
                    image: preset.image,
                    gradient: preset.gradient,
                    filterKeyword: preset.keyword,
                    showBanner: true,
                    showBadge: true,
                    showImage: true,
                    showTagline: true,
                    showDescription: true,
                    adImage: '',
                    showTimer: true,
                    timerDays: 1,
                    timerHours: 15,
                    timerMinutes: 28,
                    timerSeconds: 47,
                  };
                  const updated = [...campaigns, newCampaign];
                  setCampaigns(updated);
                  localStorage.setItem('market_campaigns', JSON.stringify(updated));
                  window.dispatchEvent(new Event('storage'));
                  setSelectedCampaign(newId);
                }}
                className="inline-flex items-center space-x-1 bg-teal-500 hover:bg-teal-600 text-white font-black text-[9px] uppercase px-2.5 py-1.5 rounded-full shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{language === 'bn' ? 'যোগ করুন' : 'ADD NEW'}</span>
              </button>
            </div>
            
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {campaigns.map((camp, index) => {
                const isSelected = selectedCampaign === camp.id;
                const seqNum = index + 1;
                const seqNumStr = language === 'bn' ? toBengaliNumber(seqNum) : seqNum.toString();
                return (
                  <button
                    key={camp.id}
                    onClick={() => setSelectedCampaign(camp.id)}
                    className={`w-full text-left p-4 rounded-xl border transition duration-200 flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-teal-50/10 dark:bg-teal-950/10 border-teal-500/50 dark:border-teal-500/50 ring-1 ring-teal-500/35'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          camp.id === 'all' ? 'bg-amber-500/10 text-amber-500' :
                          camp.id === 'bogo' ? 'bg-rose-500/10 text-rose-500' :
                          camp.id === 'unilever' ? 'bg-emerald-500/10 text-emerald-500' :
                          camp.id === 'summer' ? 'bg-orange-500/10 text-orange-500' :
                          camp.id === 'brands' ? 'bg-indigo-500/10 text-indigo-500' :
                          'bg-teal-500/10 text-teal-500'
                        }`}>
                          {camp.id === 'all' ? <Flame className="w-5 h-5" /> :
                           camp.id === 'bogo' ? <Tag className="w-5 h-5" /> :
                           camp.id === 'unilever' ? <ShoppingBag className="w-5 h-5" /> :
                           camp.id === 'summer' ? <DollarSign className="w-5 h-5" /> :
                           camp.id === 'brands' ? <Store className="w-5 h-5" /> :
                           <Tag className="w-5 h-5" />}
                        </div>
                        {/* Sequential index badge */}
                        <div className="absolute -top-1.5 -left-1.5 bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white/20 dark:border-slate-250 shadow-xs">
                          {seqNumStr}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider truncate flex items-center gap-1.5">
                          <span className="text-teal-500 font-black">[{seqNumStr}]</span>
                          <span>{language === 'bn' ? camp.nameBn : camp.name}</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans truncate mt-0.5">
                          {language === 'bn' ? camp.taglineBn : camp.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {camp.isActive ? (
                        <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          {language === 'bn' ? 'সক্রিয়' : 'ACTIVE'}
                        </span>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          {language === 'bn' ? 'নিষ্ক্রিয়' : 'PAUSED'}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Rule Configurator Panel */}
          <div className="lg:col-span-7">
            {selectedCampaign ? (
              (() => {
                const camp = campaigns.find(c => c.id === selectedCampaign)!;
                return (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 animate-fade-in">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                          <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                            {(() => {
                              const campIdx = campaigns.findIndex(c => c.id === camp.id);
                              const orderNum = campIdx !== -1 ? campIdx + 1 : 1;
                              const orderStr = language === 'bn' ? toBengaliNumber(orderNum) : orderNum.toString();
                              return language === 'bn' 
                                ? `[${orderStr}] ${camp.nameBn} - রুলস কনফিগারেশন` 
                                : `[${orderStr}] ${camp.name} - RULES CONFIGURATION`;
                            })()}
                          </h3>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                            {language === 'bn' ? 'ক্যাম্পেইনের কার্যকারিতা ও দৃশ্যমানতা নিয়ন্ত্রণ করুন।' : 'Control campaign parameters & display conditions.'}
                          </p>
                        </div>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        onClick={() => {
                          setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, isActive: !c.isActive } : c));
                        }}
                        className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full transition duration-200 ${
                          camp.isActive
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'
                        }`}
                      >
                        {camp.isActive 
                          ? (language === 'bn' ? 'স্ট্যাটাস: সক্রিয়' : 'STATUS: ACTIVE')
                          : (language === 'bn' ? 'স্ট্যাটাস: নিষ্ক্রিয়' : 'STATUS: PAUSED')}
                      </button>
                    </div>

                    {/* Quick Preview Card */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          {language === 'bn' ? 'লাইভ প্রিভিউ ব্যানার' : 'LIVE BANNER PREVIEW'}
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 select-none">
                          <input
                            type="checkbox"
                            checked={camp.showBanner !== false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setCampaigns(prev => prev.map(c => c.id === camp.id ? { 
                                ...c, 
                                showBanner: checked,
                                showBadge: checked,
                                showImage: checked,
                                showTagline: checked,
                                showDescription: checked
                              } : c));
                            }}
                            className="w-3.5 h-3.5 text-teal-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded focus:ring-teal-500/50"
                          />
                          <span>{language === 'bn' ? 'গ্রাহক ভিউতে ব্যানার দেখান' : 'Show Banner on Customer View'}</span>
                        </label>
                      </div>

                      {camp.showBanner !== false ? (
                        <div className={`relative rounded-xl overflow-hidden bg-gradient-to-r ${camp.gradient} text-white p-4 border border-white/10 shadow-xs transition-all duration-300`}>
                          <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="space-y-1.5 min-w-0 flex-1">
                              {camp.showBadge !== false && (
                                <span className="inline-block bg-white/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                  {language === 'bn' ? camp.nameBn : camp.name}
                                </span>
                              )}
                              {camp.showTagline !== false && (
                                <h4 className="font-black text-xs sm:text-sm truncate">
                                  {language === 'bn' ? camp.taglineBn : camp.tagline}
                                </h4>
                              )}
                              {camp.showDescription !== false && (
                                <p className="text-[9px] text-white/90 line-clamp-2 font-sans font-medium">
                                  {language === 'bn' ? camp.descriptionBn : camp.description}
                                </p>
                              )}
                            </div>
                            {camp.showImage !== false && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/20 bg-white/10 hidden sm:block">
                                <img src={camp.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative rounded-xl border-2 border-dashed border-teal-500/30 dark:border-teal-500/20 bg-teal-50/5 dark:bg-teal-950/5 p-4 transition-all duration-300 hover:border-teal-500/50 flex flex-col items-center justify-center text-center">
                          {camp.adImage ? (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden group shadow-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                              <img src={camp.adImage} alt="Custom Banner Ad" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`ad-file-upload-${camp.id}`);
                                    if (input) input.click();
                                  }}
                                  className="bg-teal-500 hover:bg-teal-600 text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition"
                                >
                                  {language === 'bn' ? 'ছবি পরিবর্তন' : 'Change Image'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, adImage: '' } : c));
                                  }}
                                  className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition"
                                >
                                  {language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                                </button>
                              </div>
                              <div className="absolute top-2 right-2 bg-teal-500 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide">
                                {language === 'bn' ? 'কাস্টম এড লোড করা হয়েছে' : 'Custom Ad Loaded'}
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => {
                                const input = document.getElementById(`ad-file-upload-${camp.id}`);
                                if (input) input.click();
                              }}
                              className="cursor-pointer w-full py-4 flex flex-col items-center justify-center group"
                            >
                              <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-2 transition-transform duration-300 group-hover:scale-110">
                                <Upload className="w-5 h-5" />
                              </div>
                              <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                                {language === 'bn' ? 'কাস্টম ব্যানার এড বা থ্রিডি পিকচার আপলোড করুন' : 'Upload Custom Banner Ad or 3D Picture'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 font-sans">
                                {language === 'bn' ? 'ড্র্যাগ এবং ড্রপ করুন অথবা ফাইল সিলেক্ট করতে ক্লিক করুন' : 'Drag & drop or click to select image file'}
                              </p>
                            </div>
                          )}
                          
                          <input
                            id={`ad-file-upload-${camp.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files[0]) {
                                handleAdImageUpload(camp.id, files[0]);
                              }
                            }}
                          />
                          
                          {/* Paste URL block */}
                          <div className="w-full mt-3 pt-3 border-t border-slate-150 dark:border-slate-850 flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={language === 'bn' ? 'অথবা কাস্টম ব্যানার ইমেজের সরাসরি লিংক দিন...' : 'Or enter custom banner image URL directly...'}
                              value={camp.adImage || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, adImage: val } : c));
                              }}
                              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-sans font-medium text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500/50"
                            />
                            {camp.adImage && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, adImage: '' } : c));
                                }}
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition shrink-0"
                              >
                                {language === 'bn' ? 'মুছুন' : 'Clear'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Parameters Input Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Name English */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                            {language === 'bn' ? 'ক্যাম্পেইন নাম (English)' : 'Campaign Name (English)'}
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 select-none">
                            <input
                              type="checkbox"
                              checked={camp.showBadge !== false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, showBadge: checked } : c));
                              }}
                              className="w-3 h-3 text-teal-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded focus:ring-teal-500/50"
                            />
                            <span>{language === 'bn' ? 'নাম দেখান' : 'Show Name'}</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={camp.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, name: val } : c));
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500/50"
                        />
                      </div>

                      {/* Name Bangla */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                            {language === 'bn' ? 'ক্যাম্পেইন নাম (বাংলা)' : 'Campaign Name (Bangla)'}
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 select-none">
                            <input
                              type="checkbox"
                              checked={camp.showBadge !== false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, showBadge: checked } : c));
                              }}
                              className="w-3 h-3 text-teal-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded focus:ring-teal-500/50"
                            />
                            <span>{language === 'bn' ? 'নাম দেখান' : 'Show Name'}</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={camp.nameBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, nameBn: val } : c));
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500/50"
                        />
                      </div>

                      {/* Campaign Image URL */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                            {language === 'bn' ? 'ক্যাম্পেইন ব্যানার ইমেজ ইউআরএল' : 'Campaign Banner Image URL'}
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 select-none">
                            <input
                              type="checkbox"
                              checked={camp.showImage !== false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, showImage: checked } : c));
                              }}
                              className="w-3 h-3 text-teal-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded focus:ring-teal-500/50"
                            />
                            <span>{language === 'bn' ? 'ছবি দেখান' : 'Show Image'}</span>
                          </label>
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={camp.image || ''}
                            placeholder="https://images.unsplash.com/..."
                            onChange={(e) => {
                              const val = e.target.value;
                              setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, image: val } : c));
                            }}
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500/50 font-mono"
                          />
                          {camp.image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 flex items-center justify-center">
                              <img src={camp.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tagline English */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                            {language === 'bn' ? 'ক্যাম্পেইন ট্যাগলাইন (English)' : 'Campaign Tagline (English)'}
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 select-none">
                            <input
                              type="checkbox"
                              checked={camp.showTagline !== false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, showTagline: checked } : c));
                              }}
                              className="w-3 h-3 text-teal-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded focus:ring-teal-500/50"
                            />
                            <span>{language === 'bn' ? 'ট্যাগলাইন দেখান' : 'Show Tagline'}</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={camp.tagline}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, tagline: val } : c));
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500/50"
                        />
                      </div>

                      {/* Tagline Bangla */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                            {language === 'bn' ? 'ক্যাম্পেইন ট্যাগলাইন (বাংলা)' : 'Campaign Tagline (Bangla)'}
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 select-none">
                            <input
                              type="checkbox"
                              checked={camp.showTagline !== false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, showTagline: checked } : c));
                              }}
                              className="w-3 h-3 text-teal-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded focus:ring-teal-500/50"
                            />
                            <span>{language === 'bn' ? 'ট্যাগলাইন দেখান' : 'Show Tagline'}</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={camp.taglineBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, taglineBn: val } : c));
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500/50"
                        />
                      </div>

                      {/* Description English */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                            {language === 'bn' ? 'ক্যাম্পেইন বর্ণনা (English)' : 'Campaign Description (English)'}
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 select-none">
                            <input
                              type="checkbox"
                              checked={camp.showDescription !== false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, showDescription: checked } : c));
                              }}
                              className="w-3 h-3 text-teal-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded focus:ring-teal-500/50"
                            />
                            <span>{language === 'bn' ? 'বর্ণনা দেখান' : 'Show Description'}</span>
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          value={camp.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, description: val } : c));
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500/50 font-sans"
                        />
                      </div>

                      {/* Description Bangla */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                            {language === 'bn' ? 'ক্যাম্পেইন বর্ণনা (বাংলা)' : 'Campaign Description (Bangla)'}
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 select-none">
                            <input
                              type="checkbox"
                              checked={camp.showDescription !== false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, showDescription: checked } : c));
                              }}
                              className="w-3 h-3 text-teal-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded focus:ring-teal-500/50"
                            />
                            <span>{language === 'bn' ? 'বর্ণনা দেখান' : 'Show Description'}</span>
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          value={camp.descriptionBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, descriptionBn: val } : c));
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500/50 font-sans"
                        />
                      </div>

                      {/* Accent Color / Gradients info */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                          {language === 'bn' ? 'ব্যবহৃত থিম ও ব্যাকগ্রাউন্ড' : 'Theme & Background Gradient style'}
                        </label>
                        <input
                          type="text"
                          value={camp.gradient}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, gradient: val } : c));
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500/50"
                        />
                      </div>

                      {/* Product Tag/Keyword filter */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-teal-500" />
                          <span>{language === 'bn' ? 'পণ্য ফিল্টার কিওয়ার্ড (যেমন: summer, organic, unilever)' : 'Product Filter Keyword (e.g., summer, organic, unilever)'}</span>
                        </label>
                        <input
                          type="text"
                          value={camp.filterKeyword || ''}
                          placeholder={language === 'bn' ? 'ট্যাগ বা কিওয়ার্ড দিন' : 'Enter tag or keyword to filter products'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, filterKeyword: val } : c));
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500/50"
                        />
                      </div>

                    </div>

                    {/* Action buttons with customizable timer */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      {/* Left side: Checkbox and Custom Time inputs */}
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-black uppercase text-slate-700 dark:text-slate-300 select-none">
                          <input
                            type="checkbox"
                            checked={camp.showTimer !== false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, showTimer: checked } : c));
                            }}
                            className="w-4 h-4 text-teal-600 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 rounded-lg focus:ring-teal-500/50"
                          />
                          <span>{language === 'bn' ? 'টাইমার দেখান' : 'SHOW TIMER'}</span>
                        </label>
                        
                        <div className="flex flex-wrap items-center gap-2 bg-slate-100/50 dark:bg-slate-950/50 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                          {/* Days */}
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                              {language === 'bn' ? 'দিন' : 'Days'}
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={camp.timerDays !== undefined ? camp.timerDays : 1}
                              disabled={camp.showTimer === false}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(999, parseInt(e.target.value) || 0));
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, timerDays: val } : c));
                              }}
                              className={`w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black text-center text-slate-800 dark:text-slate-200 rounded-xl py-1.5 focus:outline-none focus:border-teal-500/50 transition ${
                                camp.showTimer === false ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-955' : ''
                              }`}
                            />
                          </div>

                          {/* Hours */}
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                              {language === 'bn' ? 'ঘণ্টা' : 'Hours'}
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={camp.timerHours !== undefined ? camp.timerHours : 15}
                              disabled={camp.showTimer === false}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(999, parseInt(e.target.value) || 0));
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, timerHours: val } : c));
                              }}
                              className={`w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black text-center text-slate-800 dark:text-slate-200 rounded-xl py-1.5 focus:outline-none focus:border-teal-500/50 transition ${
                                camp.showTimer === false ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-955' : ''
                              }`}
                            />
                          </div>

                          {/* Minutes */}
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                              {language === 'bn' ? 'মিনিট' : 'Min'}
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={camp.timerMinutes !== undefined ? camp.timerMinutes : 28}
                              disabled={camp.showTimer === false}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, timerMinutes: val } : c));
                              }}
                              className={`w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black text-center text-slate-800 dark:text-slate-200 rounded-xl py-1.5 focus:outline-none focus:border-teal-500/50 transition ${
                                camp.showTimer === false ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-955' : ''
                              }`}
                            />
                          </div>

                          {/* Seconds */}
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                              {language === 'bn' ? 'সেকেন্ড' : 'Sec'}
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={camp.timerSeconds !== undefined ? camp.timerSeconds : 47}
                              disabled={camp.showTimer === false}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                                setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, timerSeconds: val } : c));
                              }}
                              className={`w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black text-center text-slate-800 dark:text-slate-200 rounded-xl py-1.5 focus:outline-none focus:border-teal-500/50 transition ${
                                camp.showTimer === false ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-955' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right side: Save and Delete Buttons */}
                      <div className="flex items-center space-x-3 shrink-0">
                        {camp.id !== 'all' && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = campaigns.filter(c => c.id !== camp.id);
                              setCampaigns(updated);
                              localStorage.setItem('market_campaigns', JSON.stringify(updated));
                              window.dispatchEvent(new Event('storage'));
                              setSelectedCampaign('all');
                            }}
                            className="bg-red-50 hover:bg-red-105 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-black text-xs px-4 py-2.5 rounded-full transition duration-200 uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{language === 'bn' ? 'মুছে ফেলুন' : 'DELETE'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const updatedCampaigns = campaigns.map(c => {
                              const d = c.timerDays !== undefined ? c.timerDays : 1;
                              const h = c.timerHours !== undefined ? c.timerHours : 15;
                              const m = c.timerMinutes !== undefined ? c.timerMinutes : 28;
                              const s = c.timerSeconds !== undefined ? c.timerSeconds : 47;
                              const endsAt = String(Date.now() + (d * 24 * 3600 + h * 3600 + m * 60 + s) * 1000);
                              return {
                                ...c,
                                timerEndsAt: endsAt
                              };
                            });
                            localStorage.setItem('market_campaigns', JSON.stringify(updatedCampaigns));
                            window.dispatchEvent(new Event('storage'));
                            setActivePanel('customer');
                          }}
                          className="bg-teal-500 hover:bg-teal-600 text-white font-black text-xs px-5 py-2.5 rounded-full transition duration-200 uppercase tracking-wider shrink-0 cursor-pointer"
                        >
                          {language === 'bn' ? 'সংরক্ষণ করুন' : 'SAVE RULES'}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })()
            ) : (
              <div className="bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 h-full min-h-[350px]">
                <div className="p-4 bg-slate-100 dark:bg-slate-850 rounded-full text-slate-400">
                  <Sliders className="w-8 h-8 animate-pulse" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'কোন ক্যাম্পেইন সিলেক্ট করা হয়নি' : 'No Campaign Selected'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    {language === 'bn'
                      ? 'বাম পাশের তালিকা থেকে যেকোনো একটি চিহ্নিত ক্যাম্পেইন সিলেক্ট করে তার রুলস ও লেআউট কনফিগার করুন।'
                      : 'Select any marked campaign from the list on the left to configure its rules and live layout parameters.'}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  if (subModule === 'panel') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-wider text-teal-500 dark:text-teal-400">
          <span>MARKET ARCHITECTURE</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-400 dark:text-slate-500">VENDORS</span>
        </div>

        {/* Title Block */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-teal-500/10 rounded-xl text-teal-500 border border-teal-500/20">
            <Store className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {language === 'bn' ? 'স্টোর ডিরেক্টরি কন্ট্রোল প্যানেল' : 'STORE DIRECTORY CONTROL PANEL'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
              {language === 'bn' ? 'আপনি যে মডিউলটিতে কাজ করতে চান তা নির্বাচন করুন।' : 'Select the module you would like to work on.'}
            </p>
          </div>
        </div>

        {/* Card Options Container */}
        <div className="space-y-4">
          
          {/* Card 1: Product Preview & Design Sandbox */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition duration-200">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/20 rounded-full text-amber-500 shrink-0">
                <Palette className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? '১. প্রোডাক্ট প্রিভিউ ও ডিজাইন স্যান্ডবক্স' : '1. Product Preview & Design Sandbox'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl font-sans">
                  {language === 'bn' 
                    ? 'খুচরা পণ্যের লেআউট কনফিগার করুন, কাস্টম মেটাডেটা আপলোড করুন এবং রিয়েল-টাইম ক্লায়েন্ট রেন্ডার পর্যবেক্ষণ করুন।' 
                    : 'Configure retail stock layout, upload custom metadata, and observe realtime client render.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubModule('sandbox')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-5 py-2.5 rounded-full transition duration-200 flex items-center justify-center space-x-2 shrink-0 shadow-sm shadow-emerald-500/10 uppercase tracking-wider"
            >
              <span>{language === 'bn' ? 'শুরু করুন' : 'START'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Customer Rules & Campaigns */}
          {currentUser?.role === 'admin' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-teal-500/40 dark:hover:border-teal-500/40 transition duration-200">
              <div className="flex items-start sm:items-center space-x-4">
                <div className="p-3.5 bg-teal-500/10 dark:bg-teal-500/20 rounded-full text-teal-500 shrink-0">
                  <Settings className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {language === 'bn' ? '২. কাস্টমার ক্যাম্পেইন ও রুলস কন্ট্রোল' : '2. Customer Campaign & Rules Control'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl font-sans">
                    {language === 'bn'
                      ? 'কাস্টমার ব্রাউজার মার্কেটের ক্যাম্পেইনসমূহ (SUMMER FEST, GREAT DEALS, UNILEVER, ইত্যাদি) কনফিগার করুন।'
                      : 'Configure customer browser market campaigns (SUMMER FEST, GREAT DEALS, UNILEVER, etc.) and navigation.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubModule('customer-rules')}
                className="bg-teal-500 hover:bg-teal-600 text-white font-black text-xs px-5 py-2.5 rounded-full transition duration-200 flex items-center justify-center space-x-2 shrink-0 shadow-sm shadow-teal-500/10 uppercase tracking-wider"
              >
                <span>{language === 'bn' ? 'শুরু করুন' : 'START'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative max-w-6xl mx-auto">
      {/* Breadcrumbs for Sandbox */}
      <div className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-wider text-teal-500 dark:text-teal-400">
        <span>MARKET ARCHITECTURE</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <button 
          type="button"
          onClick={() => setSubModule('panel')}
          className="hover:text-amber-500 transition cursor-pointer font-black"
        >
          VENDORS
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-400 dark:text-slate-500">PRODUCT PREVIEW & DESIGN SANDBOX</span>
      </div>
      {/* SUCCESS TOAST WITH AUTOMATIC REDIRECT */}
      {showSuccessToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {language === 'bn' ? 'সফলভাবে আপলোড ও পাবলিশ হয়েছে!' : 'Published Successfully!'}
              </h3>
              <p className="text-sm font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl inline-block max-w-full truncate">
                {successItemTitle}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                {language === 'bn' 
                  ? 'আপনার নতুন কাস্টম পণ্যটি সরাসরি আপলোড করা হয়েছে এবং দাম ও কোয়ালিটি নির্ধারিত হয়েছে। আপনাকে এখন সরাসরি ব্রাউজার মার্কেটে রিডাইরেক্ট করা হচ্ছে...'
                  : 'Your custom product with tailored price and specifications is now live. Redirecting you to Browse Market to see it...'}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 font-bold animate-pulse pt-2">
              <ShoppingBag className="w-4 h-4 text-amber-500 animate-spin" />
              <span>{language === 'bn' ? 'ব্রাউজার মার্কেটপ্লেসে নিয়ে যাওয়া হচ্ছে...' : 'Redirecting to marketplace...'}</span>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION - EMBEDDED DIRECTLY */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {language === 'bn' ? 'নতুন পণ্য সংযোজন ও দাম নির্ধারণ কেন্দ্র' : 'Create Custom Product & List Live'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
              {language === 'bn' 
                ? 'ব্রাউজার মার্কেটে সরাসরি পণ্যটি প্রদর্শিত হবে। আপনি নিজের ইচ্ছেমতো দাম ও কোয়ালিটি নির্ধারণ করতে পারেন।' 
                : 'Configure and publish tailored custom products to the live buyers marketplace instantly.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePanel('customer')}
          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition duration-200 flex items-center space-x-1"
        >
          <span>{language === 'bn' ? 'মার্কেটপ্লেস দেখুন' : 'View Marketplace'}</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* DIRECT VISIBLE FORM - NO MODAL NEEDED! */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <form onSubmit={handlePublish} className="p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side inputs (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Select Category */}
              <div className="space-y-2 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                    {language === 'bn' ? '১. পণ্যের ক্যাটাগরি নির্ধারণ করুন *' : '1. Select Product Category *'}
                  </label>
                  
                  {/* Category Controls (Search & Popover Trigger) */}
                  <div className="flex items-center gap-2">
                    {/* Search Category */}
                    <div className="relative">
                      <input
                        type="text"
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        placeholder={language === 'bn' ? 'ক্যাটাগরি খুঁজুন...' : 'Search category...'}
                        className="pl-7 pr-6 py-1.5 w-32 sm:w-40 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 text-[10px] font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-hidden dark:text-white"
                      />
                      <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      {categorySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCategorySearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Popover Menu Trigger Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCategoryPopup(!showCategoryPopup)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1 transition duration-200 ${
                          showCategoryPopup 
                            ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span>{language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showCategoryPopup ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Floating Popup Dropdown/Message */}
                      {showCategoryPopup && (
                        <>
                          {/* Invisible backdrop to dismiss click outside */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowCategoryPopup(false)} 
                          />
                          <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2.5 z-50 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block px-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                              {language === 'bn' ? 'ক্যাটাগরি বেছে নিন' : 'Choose Category'}
                            </span>
                            <div className="space-y-0.5 max-h-48 overflow-y-auto">
                              {categories.map(cat => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCatId(cat.id);
                                    setShowCategoryPopup(false);
                                  }}
                                  className={`w-full text-left p-2 rounded-lg text-[11px] transition duration-150 flex items-center space-x-2 ${
                                    selectedCatId === cat.id
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  <span className="text-sm">
                                    {cat.id === 'cat-1' ? '📱' : cat.id === 'cat-2' ? '👕' : cat.id === 'cat-3' ? '🍯' : cat.id === 'cat-4' ? '🛏️' : '✨'}
                                  </span>
                                  <span className="truncate flex-1">
                                    {language === 'bn' ? cat.nameBn : cat.name}
                                  </span>
                                  {selectedCatId === cat.id && (
                                    <Check className="w-3 h-3 text-amber-500" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {filteredCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`p-3 rounded-xl text-center border text-[11px] transition duration-200 flex flex-col items-center justify-center space-y-1.5 ${
                        selectedCatId === cat.id
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold ring-2 ring-amber-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-sm shrink-0">
                        {cat.id === 'cat-1' ? '📱' : cat.id === 'cat-2' ? '👕' : cat.id === 'cat-3' ? '🍯' : cat.id === 'cat-4' ? '🛏️' : '✨'}
                      </span>
                      <span className="truncate w-full block font-bold leading-tight">
                        {language === 'bn' ? cat.nameBn : cat.name}
                      </span>
                    </button>
                  ))}
                  {filteredCategories.length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      {language === 'bn' ? 'কোন ক্যাটাগরি পাওয়া যায়নি' : 'No matching categories found'}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Title Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                    {language === 'bn' ? 'পণ্যের নাম (ইংরেজিতে) *' : 'Product Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Sundarbans Khalisha Honey"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-xs focus:border-amber-500 focus:outline-hidden dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                    {language === 'bn' ? 'পণ্যের নাম (বাংলায়)' : 'Product Name (Bangla)'}
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: সুন্দরবনের খাঁটি খলিশা মধু"
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-xs focus:border-amber-500 focus:outline-hidden dark:text-white"
                  />
                </div>
              </div>

              {/* Double-column Real Upload Center */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Half: Cover Image Upload */}
                <div className="space-y-2 p-3 bg-amber-500/5 dark:bg-amber-500/[0.02] rounded-2xl border border-amber-500/10">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    {language === 'bn' ? 'প্রধান কভার ছবি আপলোড করুন *' : 'Upload Cover Image *'}
                  </span>
                  
                  {imageUrls[0] ? (
                    <div className="relative h-24 rounded-xl overflow-hidden border border-amber-500/20 group">
                      <img src={imageUrls[0]} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrls(prev => {
                              const copy = [...prev];
                              copy[0] = '';
                              return copy.filter(Boolean); // Clear and clean up
                            });
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold text-[9px] px-2 py-1 rounded-md flex items-center space-x-1"
                        >
                          <X className="w-2.5 h-2.5" />
                          <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}</span>
                        </button>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded uppercase leading-none">
                        {language === 'bn' ? 'কভার ছবি' : 'Cover Photo'}
                      </span>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-colors bg-white/50 dark:bg-slate-900/50">
                      <div className="text-center p-2 space-y-1">
                        <Plus className="w-5 h-5 text-slate-400 mx-auto" />
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                          {language === 'bn' ? 'কভার ছবি নির্বাচন করুন' : 'Select Cover Image'}
                        </span>
                        <span className="text-[8px] text-slate-400 block">
                          {language === 'bn' ? '(সর্বোচ্চ ১ টি)' : '(Max 1 image)'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              const res = reader.result;
                              setImageUrls(prev => {
                                const copy = [...prev];
                                copy[0] = res;
                                return copy;
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Right Half: Gallery / Additional Images Multi-Upload */}
                <div className="space-y-2 p-3 bg-amber-500/5 dark:bg-amber-500/[0.02] rounded-2xl border border-amber-500/10">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    {language === 'bn' ? 'অন্যান্য অতিরিক্ত ছবি আপলোড করুন:' : 'Add Additional Images:'}
                  </span>

                  <div className="space-y-1.5">
                    {/* The file multi-upload target */}
                    <label className="flex flex-col items-center justify-center h-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-colors bg-white/50 dark:bg-slate-900/50">
                      <div className="text-center py-1 px-2 flex items-center justify-center space-x-1.5">
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {language === 'bn' ? 'একসাথে অনেকগুলো ফাইল সিলেক্ট করুন' : 'Select Multiple Images'}
                        </span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files) return;
                          const fileArray = Array.from(files) as File[];
                          
                          let loadedCount = 0;
                          const newUrls: string[] = [];
                          
                          fileArray.forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                newUrls.push(reader.result);
                              }
                              loadedCount++;
                              if (loadedCount === fileArray.length) {
                                setImageUrls(prev => {
                                  const cover = prev[0] || '';
                                  const existingGallery = prev.slice(1).filter(Boolean);
                                  return [cover, ...existingGallery, ...newUrls].filter(Boolean);
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Previews of uploaded gallery images */}
                    {imageUrls.slice(1).length > 0 && (
                      <div className="grid grid-cols-4 gap-1 max-h-16 overflow-y-auto p-1 bg-slate-100/50 dark:bg-slate-900/30 rounded-lg">
                        {imageUrls.slice(1).map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setImageUrls(prev => {
                                  const cover = prev[0] || '';
                                  const gallery = prev.slice(1);
                                  gallery.splice(index, 1);
                                  return [cover, ...gallery].filter(Boolean);
                                });
                              }}
                              className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Pricing Inputs */}
              <div className="grid grid-cols-3 gap-4 bg-amber-500/5 dark:bg-amber-500/[0.02] p-4 rounded-2xl border border-amber-500/10">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-wider block">
                    {language === 'bn' ? 'আসল মূল্য (৳) *' : 'Regular Price (৳) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-[11px] text-slate-400 font-black">৳</span>
                    <input
                      type="number"
                      required
                      placeholder="850"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-6.5 pr-2 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:border-amber-500 focus:outline-hidden font-black text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-wider block">
                    {language === 'bn' ? 'অফার মূল্য (৳)' : 'Discount Price (৳)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-[11px] text-slate-400 font-black">৳</span>
                    <input
                      type="number"
                      placeholder="720"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className="w-full pl-6.5 pr-2 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:border-amber-500 focus:outline-hidden font-black text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    {language === 'bn' ? 'স্টক পরিমাণ' : 'Stock Qty'}
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:border-amber-500 focus:outline-hidden text-slate-700 dark:text-slate-300 font-bold"
                  />
                </div>
              </div>

              {/* Quality Selector & Configuration */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                
                {/* Quality Grade Options */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block flex items-center">
                    <Sliders className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    {language === 'bn' ? '২. পণ্যের কোয়ালিটি বা মান গ্রেড *' : '2. Product Quality Standard *'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {QUALITY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setQualityGrade(opt.value)}
                        className={`p-2.5 rounded-xl text-left text-xs transition duration-200 border flex items-center space-x-2 ${
                          qualityGrade === opt.value
                            ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-amber-500 text-sm">🛡️</span>
                        <span className="truncate">{language === 'bn' ? opt.labelBn : opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weights or sizes option variants based on category selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    {selectedCatId === 'cat-1'
                      ? (language === 'bn' ? 'স্টোরেজ ও মেমোরি সংস্করণ' : 'Storage / Variant Memory')
                      : selectedCatId === 'cat-2'
                      ? (language === 'bn' ? 'সাইজ / আকার নির্বাচন' : 'Select Sizing Variant')
                      : (language === 'bn' ? 'প্যাকেজিং ওজন বা সাইজ' : 'Packaging Net Weight / Variant')}
                  </label>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedCatId === 'cat-2' ? (
                      PRESETS_SIZES.map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            setSelectedAttr(sz);
                            setCustomAttrText('');
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            selectedAttr === sz
                              ? 'bg-amber-500 text-slate-900 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {sz}
                        </button>
                      ))
                    ) : selectedCatId === 'cat-3' ? (
                      PRESETS_WEIGHTS.map(wt => (
                        <button
                          key={wt}
                          type="button"
                          onClick={() => {
                            setSelectedAttr(wt);
                            setCustomAttrText('');
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            selectedAttr === wt
                              ? 'bg-amber-500 text-slate-900 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {wt}
                        </button>
                      ))
                    ) : (
                      ['Standard Pack', 'A-Grade Fresh', 'Eco Pack', 'Super Premium', 'Custom'].map(pk => (
                        <button
                          key={pk}
                          type="button"
                          onClick={() => {
                            setSelectedAttr(pk);
                            setCustomAttrText('');
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            selectedAttr === pk
                              ? 'bg-amber-500 text-slate-900 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {pk}
                        </button>
                      ))
                    )}
                  </div>

                  {selectedAttr === 'Custom' && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <input
                        type="text"
                        placeholder={language === 'bn' ? 'এখানে কাস্টম সাইজ বা ওজন লিখুন (যেমন: ৫ কেজি)' : 'Type custom specification (e.g., 5kg, Special Bundle)'}
                        value={customAttrText}
                        onChange={(e) => setCustomAttrText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:border-amber-500 focus:outline-hidden dark:text-white font-semibold"
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Brand and Warranty details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                    {language === 'bn' ? 'ব্র্যান্ডের নাম' : 'Brand Name'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sundarbans Organic"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-xs focus:border-amber-500 focus:outline-hidden dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                    {language === 'bn' ? 'ওয়ারেন্টি / গ্যারান্টি' : 'Warranty Details'}
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ১ বছরের রিপ্লেসমেন্ট ওয়ারেন্টি"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-xs focus:border-amber-500 focus:outline-hidden dark:text-white"
                  />
                </div>
              </div>

              {/* Simple description fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                    {language === 'bn' ? 'পণ্যের বিবরণ (ইংরেজিতে)' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write product specifications and details in English..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-xs focus:border-amber-500 focus:outline-hidden dark:text-white resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                    {language === 'bn' ? 'পণ্যের বিবরণ (বাংলায়)' : 'Description (Bangla)'}
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionBn}
                    onChange={(e) => setDescriptionBn(e.target.value)}
                    placeholder="পণ্যের গুণাবলী এবং বিবরণ বাংলায় লিখুন..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-xs focus:border-amber-500 focus:outline-hidden dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Dynamic Custom Specs Builder */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block flex items-center">
                    <Sliders className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    {language === 'bn' ? 'অতিরিক্ত কাস্টম বিবরণী (ওজন, মডেল ইত্যাদি)' : 'Custom Product Specifications (Weight, Model, etc.)'}
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSpecs(prev => [...prev, { label: '', labelBn: '', value: '', valueBn: '' }]);
                    }}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[10px] transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{language === 'bn' ? 'নতুন রো যোগ করুন' : 'Add Row'}</span>
                  </button>
                </div>

                {customSpecs.length > 0 && (
                  <div className="space-y-3.5">
                    {customSpecs.map((spec, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 relative group">
                        <div className="sm:col-span-5 space-y-1">
                          <input
                            type="text"
                            placeholder={language === 'bn' ? 'লেবেল (যেমন: Weight)' : 'Label (e.g. Weight)'}
                            value={spec.label}
                            onChange={(e) => {
                              const updated = [...customSpecs];
                              updated[index].label = e.target.value;
                              setCustomSpecs(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-[11px] focus:border-amber-500 focus:outline-hidden dark:text-white font-semibold"
                          />
                          <input
                            type="text"
                            placeholder={language === 'bn' ? 'লেবেল বাংলায় (যেমন: ওজন)' : 'Label in Bangla (optional)'}
                            value={spec.labelBn || ''}
                            onChange={(e) => {
                              const updated = [...customSpecs];
                              updated[index].labelBn = e.target.value;
                              setCustomSpecs(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-[11px] focus:border-amber-500 focus:outline-hidden dark:text-white"
                          />
                        </div>

                        <div className="sm:col-span-6 space-y-1">
                          <input
                            type="text"
                            placeholder={language === 'bn' ? 'মান (যেমন: 500g)' : 'Value (e.g. 500g)'}
                            value={spec.value}
                            onChange={(e) => {
                              const updated = [...customSpecs];
                              updated[index].value = e.target.value;
                              setCustomSpecs(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-[11px] focus:border-amber-500 focus:outline-hidden dark:text-white font-semibold"
                          />
                          <input
                            type="text"
                            placeholder={language === 'bn' ? 'মান বাংলায় (যেমন: ৫০০ গ্রাম)' : 'Value in Bangla (optional)'}
                            value={spec.valueBn || ''}
                            onChange={(e) => {
                              const updated = [...customSpecs];
                              updated[index].valueBn = e.target.value;
                              setCustomSpecs(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-[11px] focus:border-amber-500 focus:outline-hidden dark:text-white font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomSpecs(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendation presets click keys */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mr-1">
                    {language === 'bn' ? 'দ্রুত যোগ করুন:' : 'Quick Add Spec:'}
                  </span>
                  {[
                    { label: 'Weight', labelBn: 'ওজন', value: '1kg', valueBn: '১ কেজি' },
                    { label: 'Model', labelBn: 'মডেল', value: 'Prime v2', valueBn: 'প্রাইম ২' },
                    { label: 'Material', labelBn: 'উপাদান', value: '100% Cotton', valueBn: '১০০% সুতি' },
                    { label: 'Warranty', labelBn: 'ওয়ারেন্টি', value: '1 Year Warranty', valueBn: '১ বছর ওয়ারেন্টি' }
                  ].map((presetSpec) => (
                    <button
                      key={presetSpec.label}
                      type="button"
                      onClick={() => {
                        // Avoid duplication
                        if (customSpecs.some(s => s.label.toLowerCase() === presetSpec.label.toLowerCase())) return;
                        setCustomSpecs(prev => [...prev, presetSpec]);
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      + {language === 'bn' ? presetSpec.labelBn : presetSpec.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right side Live Preview and Preset Images (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Live Preview Card */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-950/40 sticky top-4">
                <span className="text-[10px] bg-amber-500 text-slate-900 font-bold px-3 py-1.5 block text-center uppercase tracking-wider">
                  Live Product Preview (রিয়েলটাইম প্রিভিউ)
                </span>
                
                <div className="p-5 space-y-4">
                  {/* Visual Image with thumbnails */}
                  <div className="space-y-2">
                    <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
                      <img src={imageUrls.filter(u => u.trim() !== '')[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white font-black text-[10px] px-3 py-1 rounded-full border border-white/10 shadow-xs">
                        {qualityGrade}
                      </span>
                    </div>
                    
                    {/* Tiny Thumbnails in Live Preview */}
                    {imageUrls.filter(u => u.trim() !== '').length > 1 && (
                      <div className="flex gap-1.5 overflow-x-auto py-1">
                        {imageUrls.filter(u => u.trim() !== '').map((url, idx) => (
                          <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border border-amber-500/20 shrink-0">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details preview */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="text-base font-black text-slate-900 dark:text-white truncate">
                          {language === 'bn' ? titleBn || title || 'পণ্যের নাম' : title || 'Product Title'}
                        </h4>
                        <p className="text-xs text-slate-400 font-bold">
                          Brand: {brand || 'Local Merchant'} • {customAttrText || selectedAttr}
                        </p>
                      </div>
                      
                      {/* Price display */}
                      <div className="text-right shrink-0">
                        {discountPrice ? (
                          <>
                            <p className="text-sm text-emerald-500 font-black">৳{discountPrice}</p>
                            <p className="text-[11px] text-slate-400 line-through">৳{price || '0'}</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-900 dark:text-slate-100 font-black">৳{price || '0.00'}</p>
                        )}
                      </div>
                    </div>

                    {/* Store Name information */}
                    <div className="p-3 bg-slate-200/50 dark:bg-slate-800/40 rounded-xl flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <Store className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">
                        {language === 'bn' ? 'মার্কেট বিক্রেতা: ' : 'Listed by: '} 
                        <strong>
                          {mockStores.find(st => st.id === selectedStoreId)?.name || 'AmarBazar Seller'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Images Gallery Picker / Custom URLs */}
              <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block flex items-center">
                  <ImageIcon className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  {language === 'bn' ? 'আপলোডকৃত ছবির তালিকা' : 'Uploaded Images List'}
                </label>

                {/* Image URL Inputs / List of uploaded files */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                    {language === 'bn' ? 'সংযুক্ত ছবিসমূহ:' : 'Attached Images:'}
                  </span>
                  
                  {imageUrls.length === 0 ? (
                    <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-[11px] font-bold">
                      {language === 'bn' ? 'কোন ছবি আপলোড করা হয়নি' : 'No images uploaded yet'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="flex items-center space-x-2 bg-white dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-black text-slate-400 w-5 shrink-0 text-center">#{i + 1}</span>
                          <span className="flex-1 text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                            {url.startsWith('data:') ? (language === 'bn' ? 'লোকাল ডিভাইস থেকে আপলোডকৃত' : 'Uploaded local file') : url}
                          </span>
                          {url.trim() !== '' && (
                            <div className="w-8 h-8 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-xs">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Form action submission */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3 bg-white dark:bg-slate-900">
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs px-8 py-3.5 rounded-xl shadow-md transition duration-200 flex items-center space-x-2 disabled:opacity-50 cursor-pointer w-full sm:w-auto justify-center"
            >
              {submitting ? (
                <span>{language === 'bn' ? 'আপলোড হচ্ছে...' : 'Publishing...'}</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>{language === 'bn' ? 'প্রকাশ করুন ও মার্কেটে দেখুন' : 'Publish & View in Market'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
