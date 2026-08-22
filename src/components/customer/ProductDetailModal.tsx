import React, { useState, useMemo } from 'react';
import { 
  X, Star, Heart, ShoppingCart, Truck, ShieldCheck, MapPin, 
  Check, Share2, MessageSquare, ThumbsUp, Send, RotateCcw, 
  HelpCircle, BadgeCheck, AlertCircle, ShoppingBag, ArrowRight,
  ZoomIn, Sparkles, Store, Globe, PhoneCall
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../translations';
import { Product, Review, getProductUnitPrice, getProductRegularPrice, getProductVariantStock, getBulkDiscountedPrice } from '../../types';
import { api } from '../../services/api';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number, variants: Record<string, string>) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product, onClose, onBuyNow
}) => {
  const { 
    language, 
    currency,
    formatPrice,
    addToCart, 
    wishlist, 
    toggleWishlist, 
    systemSettings, 
    products, 
    setSelectedProduct,
    shareProduct 
  } = useApp();

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [district, setDistrict] = useState<string>('Dhaka');
  const [showAddedToast, setShowAddedToast] = useState(false);

  // Review state
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);

  const handleGenerateReview = async () => {
    if (!product) return;
    setIsGeneratingReview(true);
    try {
      const res = await api.generateAiReview({
        title: product.title,
        rating: newReviewRating
      });
      setNewReviewComment(language === 'bn' ? res.reviewBn : res.reviewEn);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReview(false);
    }
  };

  // Memoized product variants list
  const productVariants = useMemo(() => {
    if (!product) return [];
    if (product.variants && product.variants.length > 0) {
      return product.variants;
    }
    
    const defaults: { id: string; name: string; nameBn?: string; options: string[] }[] = [];
    
    if (product.categoryId === 'cat-2') {
      defaults.push({
        id: 'var-def-size',
        name: 'Size',
        nameBn: 'সাইজ',
        options: ['S', 'M', 'L', 'XL', 'XXL']
      });
      defaults.push({
        id: 'var-def-color',
        name: 'Color',
        nameBn: 'রং',
        options: ['Black', 'White', 'Blue', 'Red', 'Gray']
      });
    } else if (product.categoryId === 'cat-1') {
      defaults.push({
        id: 'var-def-color',
        name: 'Color',
        nameBn: 'রং',
        options: ['Black', 'Silver', 'Navy Blue', 'White']
      });
      defaults.push({
        id: 'var-def-storage',
        name: 'Capacity',
        nameBn: 'ধারণক্ষমতা',
        options: ['Standard', 'Pro / Plus']
      });
    } else if (product.categoryId === 'cat-3') {
      defaults.push({
        id: 'var-def-weight',
        name: 'Weight',
        nameBn: 'ওজন / সাইজ',
        options: ['250g', '500g', '1kg', '2kg']
      });
    } else {
      defaults.push({
        id: 'var-def-size',
        name: 'Size',
        nameBn: 'সাইজ',
        options: ['S', 'M', 'L', 'XL']
      });
      defaults.push({
        id: 'var-def-color',
        name: 'Color',
        nameBn: 'রং',
        options: ['Black', 'White', 'Blue']
      });
    }
    
    return defaults;
  }, [product]);

  // Memoized product images list
  const productImages = useMemo(() => {
    if (!product) return [];
    if (!product.images || product.images.length === 0) {
      return ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'];
    }
    return product.images;
  }, [product]);

  const translateOption = (opt: string) => {
    if (language !== 'bn') return opt;
    const translations: Record<string, string> = {
      'S': 'S', 'M': 'M', 'L': 'L', 'XL': 'XL', 'XXL': 'XXL',
      'Black': 'কালো', 'White': 'সাদা', 'Blue': 'নীল', 'Red': 'লাল',
      'Gray': 'ধূসর', 'Silver': 'রুপালি', 'Navy Blue': 'নেভি ব্লু',
      'Standard': 'সাধারণ', 'Pro / Plus': 'প্রো / প্লাস',
      '250g': '২৫০ গ্রাম', '500g': '৫০০ গ্রাম', '1kg': '১ কেজি', '2kg': '২ কেজি'
    };
    return translations[opt] || opt;
  };

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.id !== product.id && (p.categoryId === product.categoryId || p.sellerId === product.sellerId))
      .slice(0, 4);
  }, [product, products]);

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);
  const currentPrice = getProductUnitPrice(product, selectedVariants);
  const bulkUnitPrice = getBulkDiscountedPrice(product, currentPrice, quantity);
  const originalPrice = getProductRegularPrice(product, selectedVariants);
  const isInsideDhaka = district.toLowerCase() === 'dhaka';
  const calculatedShippingFee = isInsideDhaka 
    ? (systemSettings.insideDhakaShippingFee || 60) 
    : (systemSettings.outsideDhakaShippingFee || 120);

  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;
  const savingAmount = originalPrice - currentPrice;

  const productTitle = language === 'bn' ? (product.titleBn || product.title) : product.title;
  const productDescription = language === 'bn' ? (product.descriptionBn || product.description) : product.description;

  const handleVariantSelect = (groupName: string, option: string) => {
    setSelectedVariants(prev => ({ ...prev, [groupName]: option }));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2500);
  };

  const handleDirectBuy = () => {
    onBuyNow(product, quantity, selectedVariants);
  };

  const handleWhatsAppOrder = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amarbazar.bd';
    const link = `${origin}/?product=${product.id}`;
    const configuredPhone = (typeof window !== 'undefined' && localStorage.getItem('amarbazar_whatsapp_number')) 
      ? localStorage.getItem('amarbazar_whatsapp_number')!.replace(/[^0-9]/g, '')
      : '8801712345678';
    
    const formattedVariants = Object.entries(selectedVariants).length > 0 
      ? Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ') 
      : (language === 'bn' ? 'সাধারণ' : 'Standard');

    const text = language === 'bn'
      ? `🛍️ *আমারবাজার বিডি - নতুন অর্ডার অনুরোধ*\n\n📦 *পণ্য:* ${productTitle}\n💰 *একক মূল্য:* ৳${bulkUnitPrice}\n🔢 *পরিমাণ:* ${quantity} টি\n🎨 *ভেরিয়েন্ট:* ${formattedVariants}\n💵 *মোট মূল্য:* ৳${bulkUnitPrice * quantity}\n🔗 *লিংক:* ${link}\n\nআমি এই পণ্যটি অর্ডার করতে চাই। ডেলিভারির প্রক্রিয়া জানিয়ে দিন।`
      : `🛍️ *AmarBazar BD Order Request*\n\n📦 *Product:* ${productTitle}\n💰 *Unit Price:* ৳${bulkUnitPrice}\n🔢 *Quantity:* ${quantity}\n🎨 *Variants:* ${formattedVariants}\n💵 *Subtotal:* ৳${bulkUnitPrice * quantity}\n🔗 *Link:* ${link}\n\nI want to confirm this order. Please advise on delivery.`;

    const waUrl = `https://wa.me/${configuredPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleCloseAndExplore = () => {
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      url.searchParams.delete('ref');
      url.searchParams.delete('openShare');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-7xl h-full sm:h-[95vh] rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200 relative pb-16 lg:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Header Bar */}
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-sans font-medium truncate">
            <span className="hover:underline cursor-pointer" onClick={handleCloseAndExplore}>{product.categoryName}</span>
            <span>›</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{product.brand || 'AmarBazar'}</span>
            {product.subCategory && (
              <>
                <span>›</span>
                <span className="truncate">{product.subCategory}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Explore Full Website Button */}
            <button
              onClick={handleCloseAndExplore}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black text-xs transition shadow-xs cursor-pointer"
              title={language === 'bn' ? 'সম্পূর্ণ মার্কেটপ্লেস ও সমস্ত পণ্য দেখুন' : 'Explore Full Website'}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সব পণ্য ও শপ দেখুন' : 'Full Website'}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => shareProduct(product)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full font-bold text-xs transition border border-slate-200 dark:border-slate-600 shadow-xs cursor-pointer"
              title={language === 'bn' ? 'পণ্যটি বন্ধুদের সাথে শেয়ার করুন' : 'Share Product'}
            >
              <Share2 className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
            </button>

            {/* Close Button */}
            <button 
              onClick={handleCloseAndExplore} 
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>

        {/* Scrollable Amazon Product Details Page Body */}
        <div 
          id="amazon-product-detail-container"
          className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-10 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scroll-smooth pb-24 lg:pb-12"
        >
          
          {/* Main 3-Column Layout: Gallery, Details & Buy Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: Image Gallery */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {productImages.length > 1 && (
                  <div className="flex flex-row md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 shrink-0 md:w-16 scrollbar-none">
                    {productImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        onMouseEnter={() => setSelectedImage(idx)}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all duration-150 cursor-pointer bg-slate-50 dark:bg-slate-950 ${
                          selectedImage === idx 
                            ? 'border-red-600 shadow-md ring-2 ring-red-600/20 scale-105' 
                            : 'border-slate-100 dark:border-slate-800/80 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Large Main Image */}
                <div className="relative flex-1 aspect-square rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner group order-1 md:order-2">
                  <img 
                    src={productImages[selectedImage] || productImages[0]} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {hasDiscount && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider z-10">
                      -{discountPercent}% {language === 'bn' ? 'ছাড়' : 'OFF'}
                    </span>
                  )}
                  
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white text-slate-700 dark:text-slate-200 shadow-md transition cursor-pointer hover:scale-110 active:scale-95"
                    >
                      <Heart className={`w-4 h-4 transition ${isWishlisted ? 'text-red-500 fill-red-500 scale-110' : ''}`} />
                    </button>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg border border-white/15 text-white z-10">
                    <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span>
                      {product.stock > 0 
                        ? (language === 'bn' ? `স্টক: ${product.stock} পিস` : `Stock: ${product.stock} Pcs`)
                        : (language === 'bn' ? 'স্টক আউট' : 'Out of Stock')
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Variants Selector */}
              {productVariants && productVariants.length > 0 && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {productVariants.map((vGroup) => {
                    const currentVal = selectedVariants[vGroup.name] || vGroup.options[0];
                    return (
                      <div key={vGroup.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {language === 'bn' ? (vGroup.nameBn || vGroup.name) : vGroup.name}:
                          </span>
                          <span className="font-black text-red-600 dark:text-red-400">
                            {translateOption(currentVal)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {vGroup.options.map((opt) => {
                            const isSelected = (selectedVariants[vGroup.name] || vGroup.options[0]) === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleVariantSelect(vGroup.name, opt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                }`}
                              >
                                {translateOption(opt)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* COLUMN 2: Details & Highlights */}
            <div className="lg:col-span-4 space-y-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md">
                  {product.brand || 'AmarBazar Verified'}
                </span>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1.5 leading-snug">
                  {productTitle}
                </h1>
              </div>

              {/* Rating & reviews overview */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 4.8) ? 'fill-amber-400' : ''}`} />
                  ))}
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{product.rating || 4.8}</span>
                <span className="text-slate-400">({product.reviewsCount || 42} {language === 'bn' ? 'রিভিউ' : 'reviews'})</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'ভেরিফাইড প্রোডাক্ট' : 'Verified'}
                </span>
              </div>

              {/* Price Block */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-red-600 dark:text-red-400">
                    {formatPrice(currentPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      {language === 'bn' ? `${formatPrice(savingAmount)} সাশ্রয়` : `Save ${formatPrice(savingAmount)}`}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'মূল্য ভ্যাট সহ। ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।' : 'Price inclusive of all taxes. Cash on Delivery available.'}
                </p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  {language === 'bn' ? 'মূল বৈশিষ্ট্যসমূহ:' : 'Key Highlights:'}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {productDescription}
                </p>
              </div>

              {/* Delivery info box */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">
                    {language === 'bn' ? 'সারা বাংলাদেশে দ্রুত ডেলিভারি' : 'Fast Nationwide Delivery'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'ঢাকার ভেতরে ২৪ ঘণ্টা এবং বাইরে ৪৮ ঘণ্টার মধ্যে ক্যাশ অন ডেলিভারি।' : 'Inside Dhaka in 24 hrs, outside Dhaka within 48 hrs.'}
                  </p>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Buy Box */}
            <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {language === 'bn' ? 'মোট মূল্য:' : 'Subtotal:'}
                </span>
                <p className="text-2xl font-black text-red-600 dark:text-red-400">
                  {formatPrice(bulkUnitPrice * quantity)}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'পরিমাণ (Quantity):' : 'Quantity:'}
                </label>
                <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 overflow-hidden w-fit shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-black cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-black text-xs text-slate-800 dark:text-slate-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-black cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={handleDirectBuy}
                  className="w-full py-3 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{language === 'bn' ? 'এখনই কিনুন (Buy Now)' : 'Buy Now'}</span>
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-2.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে অর্ডার' : 'Order via WhatsApp'}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{language === 'bn' ? '১০০% অরিজিনাল পণ্য ও সিকিউর পেমেন্ট' : '100% Genuine & Secure Payment'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{language === 'bn' ? '৭ দিনের সহজ রিটার্ন গ্যারান্টি' : '7 Days Easy Return Guarantee'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Related Products Grid */}
          {relatedProducts.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'সম্পর্কিত অন্যান্য আকর্ষণীয় পণ্য' : 'Related Products you may like'}
                </h3>
                <button
                  onClick={handleCloseAndExplore}
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => setSelectedProduct(rel)}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-red-500 transition cursor-pointer group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-900 mb-2">
                      <img src={rel.images[0]} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition" referrerPolicy="no-referrer" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {language === 'bn' ? (rel.titleBn || rel.title) : rel.title}
                    </p>
                    <p className="text-xs font-black text-red-600 dark:text-red-400 mt-1">
                      {formatPrice(rel.discountPrice || rel.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Added to Cart Toast notification */}
        {showAddedToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-black animate-in slide-in-from-bottom-5">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{language === 'bn' ? 'কার্টে সফলভাবে যোগ করা হয়েছে!' : 'Added to cart successfully!'}</span>
          </div>
        )}

      </div>
    </div>
  );
};
