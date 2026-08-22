import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Share2, Copy, Check, QrCode, MessageSquare, 
  ExternalLink, Sparkles, Download, Smartphone, 
  Send, Globe, Mail, MessageCircle, Info, ShieldCheck, 
  Tag, Star, CheckCircle2, Sliders, RefreshCw, Instagram
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Product, getProductUnitPrice, getProductRegularPrice } from '../../types';

interface ProductShareModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const ProductShareModal: React.FC<ProductShareModalProps> = ({
  product,
  isOpen = true,
  onClose
}) => {
  const { language } = useApp();
  const [activeTab, setActiveTab] = useState<'channels' | 'preview' | 'qrcode' | 'customize'>('channels');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<'whatsapp' | 'facebook' | 'twitter'>('whatsapp');
  
  // Custom message options
  const [includePrice, setIncludePrice] = useState(true);
  const [includeDiscount, setIncludeDiscount] = useState(true);
  const [includeDescription, setIncludeDescription] = useState(true);
  const [includeDelivery, setIncludeDelivery] = useState(true);
  const [customNotes, setCustomNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Build the shareable URL safely
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amarbazar.bd';
  const shareUrl = product ? `${origin}/?product=${product.id}&ref=social_share` : origin;

  // Generate QR Code when component mounts or product changes
  useEffect(() => {
    if (product && isOpen) {
      QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
    }
  }, [product?.id, isOpen, shareUrl]);

  if (!product || !isOpen) return null;

  const currentPrice = getProductUnitPrice(product, {});
  const originalPrice = getProductRegularPrice(product, {});
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;
  const savingAmount = originalPrice - currentPrice;

  const productTitle = language === 'bn' ? (product.titleBn || product.title) : product.title;
  const shortDescription = (language === 'bn' ? (product.descriptionBn || product.description) : product.description) || '';
  const cleanDescription = shortDescription.split('\n')[0] || '';

  // Generate WhatsApp / Telegram / Message text
  const generateShareMessage = () => {
    const lines: string[] = [];
    lines.push(`🛍️ *${productTitle}*`);
    
    if (includePrice) {
      if (hasDiscount && includeDiscount) {
        lines.push(`💰 ${language === 'bn' ? 'বিশেষ অফার মূল্য:' : 'Special Deal Price:'} *৳${currentPrice.toLocaleString()}* (৳${originalPrice.toLocaleString()} - ${discountPercent}% ${language === 'bn' ? 'ছাড়!' : 'OFF!'})`);
      } else {
        lines.push(`💰 ${language === 'bn' ? 'মূল্য:' : 'Price:'} *৳${currentPrice.toLocaleString()}*`);
      }
    }

    if (includeDescription && cleanDescription) {
      lines.push(`✨ ${cleanDescription.substring(0, 100)}${cleanDescription.length > 100 ? '...' : ''}`);
    }

    if (includeDelivery) {
      lines.push(`🚚 ${language === 'bn' ? 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (২৪-৪৮ ঘণ্টায়)' : 'Cash on Delivery available all over BD (24-48 hrs)'}`);
    }

    if (product.brand) {
      lines.push(`🏷️ ${language === 'bn' ? 'ব্র্যান্ড:' : 'Brand:'} ${product.brand}`);
    }

    if (customNotes.trim()) {
      lines.push(`💬 "${customNotes.trim()}"`);
    }

    // Direct Image Photo Reference for WhatsApp/Social media unfurl and preview
    if (product.images && product.images[0]) {
      lines.push(`🖼️ ${language === 'bn' ? 'প্রোডাক্টের ছবি ও প্রিভিউ:' : 'Product Photo Preview:'}\n${product.images[0]}`);
    }

    lines.push(`\n🌐 ${language === 'bn' ? 'অর্ডার করতে ও ফুল ওয়েবসাইট দেখতে লিংকে যান:' : 'Order & Explore Full Website:'}`);
    lines.push(shareUrl);

    return lines.join('\n');
  };

  const shareText = generateShareMessage();

  // Copy Link Handler
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Copy Full Message Handler
  const handleCopyText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Helper to fetch image as File for Native Web Share
  const getProductImageFile = async (): Promise<File | null> => {
    try {
      const imgUrl = product.images[0];
      const res = await fetch(imgUrl, { mode: 'cors' });
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      return new File([blob], `amarbazar-${product.id}.${ext}`, { type: blob.type || 'image/jpeg' });
    } catch (e) {
      // Fallback: draw image on an offscreen canvas
      try {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = product.images[0];
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
          if (blob) {
            return new File([blob], `amarbazar-${product.id}.jpg`, { type: 'image/jpeg' });
          }
        }
      } catch (err2) {
        console.log('Canvas image fallback error:', err2);
      }
      return null;
    }
  };

  // Native Web Share API trigger with Real Product Picture
  const handleNativeShare = async () => {
    setIsSharingImage(true);
    try {
      const imageFile = await getProductImageFile();

      if (navigator.share) {
        if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
          await navigator.share({
            title: productTitle,
            text: shareText,
            url: shareUrl,
            files: [imageFile]
          });
        } else {
          await navigator.share({
            title: productTitle,
            text: shareText,
            url: shareUrl
          });
        }
      } else {
        handleCopyLink();
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.log('Share dismissed or cancelled', err);
      }
    } finally {
      setIsSharingImage(false);
    }
  };

  // Copy product photo to clipboard
  const handleCopyPhoto = async () => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = product.images[0];
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob && (navigator.clipboard as any)?.write) {
            await (navigator.clipboard as any).write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2500);
          } else {
            handleCopyLink();
          }
        }, 'image/png');
      }
    } catch (err) {
      console.log('Copy image failed, falling back to copy link:', err);
      handleCopyLink();
    }
  };

  // Direct Social Share Handlers
  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareMessenger = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        showToast(language === 'bn' ? 'মেসেজ ও পণ্যের লিংক কপি হয়েছে! মেসেঞ্জারে পেস্ট করুন।' : 'Product message & link copied! Paste into Messenger.');
      }
    } catch (e) {
      console.log('Clipboard copy err:', e);
    }
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(`fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`, '_blank');
    } else {
      window.open(`https://www.facebook.com/messages/t/`, '_blank', 'noopener,noreferrer,width=650,height=600');
    }
  };

  const handleShareInstagram = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        showToast(language === 'bn' ? 'পণ্যের আকর্ষণীয় বিবরণ ও লিংক কপি হয়েছে! ইনস্টাগ্রামে পোস্ট/ডিএম করুন।' : 'Product caption & link copied! Paste into Instagram.');
      }
    } catch (e) {
      console.log('Clipboard copy err:', e);
    }
    window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    // WhatsApp Universal web/app link that auto unfurls message with preview
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const tweetSummary = `🔥 ${productTitle} - ৳${currentPrice.toLocaleString()}${hasDiscount ? ` (${discountPercent}% OFF!)` : ''} on AmarBazar BD!`;
    const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(tweetSummary)}`;
    window.open(twUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  const handleShareLinkedIn = () => {
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(liUrl, '_blank', 'noopener,noreferrer,width=600,height=550');
  };

  const handleSharePinterest = () => {
    const pinUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(product.images[0])}&description=${encodeURIComponent(shareText)}`;
    window.open(pinUrl, '_blank', 'noopener,noreferrer,width=750,height=550');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`${language === 'bn' ? 'অমরবাজার থেকে আকর্ষণীয় পণ্য:' : 'Check out this product on AmarBazar BD:'} ${productTitle}`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareSMS = () => {
    const smsBody = encodeURIComponent(`${productTitle} - ৳${currentPrice} | ${shareUrl}`);
    window.open(`sms:?body=${smsBody}`, '_blank');
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `amarbazar-${product.id}-qrcode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isNativeShareSupported = typeof navigator !== 'undefined' && Boolean(navigator.share);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 bg-linear-to-r from-red-600 via-rose-600 to-amber-600 text-white flex justify-between items-center relative overflow-hidden shrink-0 shadow-sm">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none -mr-10 -mt-10" />
          
          <div className="flex items-center space-x-3 min-w-0 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight truncate">
                {language === 'bn' ? 'পণ্যটি সরাসরি শেয়ার করুন' : 'Share Product'}
              </h3>
              <p className="text-[11px] text-white/90 font-medium truncate flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{language === 'bn' ? 'সোশ্যাল মিডিয়া ও বন্ধুদের সাথে মুহূর্তেই শেয়ার' : 'Instant social media & direct link sharing'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition cursor-pointer shrink-0 z-10 focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Product Mini Card Showcase */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shrink-0">
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs">
            <img 
              src={product.images[0]} 
              alt={product.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {hasDiscount && (
              <span className="absolute top-0 left-0 bg-red-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded-br-md shadow-xs">
                -{discountPercent}%
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              {product.brand && (
                <span className="text-[9px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded-md">
                  {product.brand}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-medium">
                {product.categoryName}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate leading-tight">
              {productTitle}
            </h4>

            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-black text-red-600 dark:text-red-400">
                ৳{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-[11px] text-slate-400 line-through">
                  ৳{originalPrice.toLocaleString()}
                </span>
              )}
              {hasDiscount && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded-md">
                  {language === 'bn' ? `৳${savingAmount} সাশ্রয়` : `Save ৳${savingAmount}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 px-3 pt-2 gap-1 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'channels', labelBn: 'সোশ্যাল শেয়ার', labelEn: 'Social Share', icon: Share2 },
            { id: 'preview', labelBn: 'পোস্ট প্রিভিউ', labelEn: 'Post Preview', icon: Globe },
            { id: 'qrcode', labelBn: 'কিউআর কোড', labelEn: 'QR Code', icon: QrCode },
            { id: 'customize', labelBn: 'মেসেজ সাজান', labelEn: 'Custom Message', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-2.5 px-3 rounded-t-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-t-2 border-red-600 dark:border-red-500 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-red-600 dark:text-red-400' : ''}`} />
                <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Main Body Content Scrollable Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 font-sans scrollbar-thin">
          
          {/* TAB 1: SOCIAL SHARE BUTTONS & CHANNELS */}
          {activeTab === 'channels' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Native Mobile Share with Image Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleNativeShare}
                  disabled={isSharingImage}
                  className="w-full py-3 px-4 bg-linear-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 disabled:opacity-75 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {isSharingImage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'bn' ? 'ছবি প্রসেস হচ্ছে...' : 'Processing Photo...'}</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>{language === 'bn' ? '📸 ছবিসহ শেয়ার করুন (Device Share)' : '📸 Share with Photo Attachment'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyPhoto}
                  className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-black text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {copiedImage ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                      <span className="text-emerald-600 dark:text-emerald-400">{language === 'bn' ? 'ছবি কপি হয়েছে! চ্যাটে পেস্ট করুন' : 'Photo Copied! Paste in Chat'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-red-500" />
                      <span>{language === 'bn' ? '🖼️ প্রোডাক্টের ছবি কপি করুন' : '🖼️ Copy Product Photo'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Full Website Guarantee Banner */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold leading-snug">
                    {language === 'bn' ? '🌐 ফুল ওয়েবসাইট ও সম্পূর্ণ ক্যাটালগ অ্যাক্সেস:' : '🌐 Full Website & Complete Catalog Access:'}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                    {language === 'bn' 
                      ? 'শেয়ার করা লিংকে ক্লিক করলে ক্রেতা সরাসরি এই প্রোডাক্টটির সম্পূর্ণ বিবরণ দেখতে পাবেন এবং সেখান থেকে পুরো ওয়েবসাইটের সব ক্যাটাগরি, সার্চ ও অন্যান্য সমস্ত পণ্য ব্রাউজ করতে পারবেন।'
                      : 'Opening this link takes customers to this product with instant access to browse the entire website, search, categories, and full store catalog.'}
                  </p>
                </div>
              </div>

              {/* Social Media Channels Grid */}
              <div>
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2.5">
                  {language === 'bn' ? 'সরাসরি প্ল্যাটফর্মে শেয়ার করুন:' : 'Direct Platform Share:'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  {/* WhatsApp */}
                  <button
                    onClick={handleShareWhatsApp}
                    className="p-3 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group shadow-xs hover:scale-102 active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-4 h-4 fill-white" />
                    </div>
                    <span className="text-xs font-black">WhatsApp</span>
                    <span className="text-[9px] opacity-75 font-medium group-hover:text-white">
                      {language === 'bn' ? 'চ্যাট ও স্ট্যাটাস' : 'Chat & Status'}
                    </span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={handleShareFacebook}
                    className="p-3 bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group shadow-xs hover:scale-102 active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="font-black text-base font-serif">f</span>
                    </div>
                    <span className="text-xs font-black">Facebook</span>
                    <span className="text-[9px] opacity-75 font-medium group-hover:text-white">
                      {language === 'bn' ? 'ফিড ও স্টোরি' : 'Feed & Story'}
                    </span>
                  </button>

                  {/* Messenger */}
                  <button
                    onClick={handleShareMessenger}
                    className="p-3 bg-[#0084FF]/10 hover:bg-[#0084FF] text-[#0084FF] hover:text-white border border-[#0084FF]/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group shadow-xs hover:scale-102 active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#0084FF] to-[#A82BFF] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Send className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black">Messenger</span>
                    <span className="text-[9px] opacity-75 font-medium group-hover:text-white">
                      {language === 'bn' ? 'মেসেজ পাঠান' : 'Direct Message'}
                    </span>
                  </button>

                  {/* Instagram */}
                  <button
                    onClick={handleShareInstagram}
                    className="p-3 bg-[#E1306C]/10 hover:bg-linear-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] text-[#E1306C] hover:text-white border border-[#E1306C]/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group shadow-xs hover:scale-102 active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black">Instagram</span>
                    <span className="text-[9px] opacity-75 font-medium group-hover:text-white">
                      {language === 'bn' ? 'ডিএম ও স্টোরি' : 'DM & Stories'}
                    </span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={handleShareTelegram}
                    className="p-3 bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border border-[#229ED9]/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group shadow-xs hover:scale-102 active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Send className="w-4 h-4 rotate-45 -translate-y-0.5" />
                    </div>
                    <span className="text-xs font-black">Telegram</span>
                    <span className="text-[9px] opacity-75 font-medium group-hover:text-white">
                      {language === 'bn' ? 'গ্রুপ ও চ্যানেল' : 'Channel & DM'}
                    </span>
                  </button>

                  {/* X (Twitter) */}
                  <button
                    onClick={handleShareTwitter}
                    className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group shadow-xs hover:scale-102 active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="font-black text-sm font-sans">𝕏</span>
                    </div>
                    <span className="text-xs font-black">X (Twitter)</span>
                    <span className="text-[9px] opacity-75 font-medium group-hover:text-white">
                      {language === 'bn' ? 'পোস্ট টুইট' : 'Post Tweet'}
                    </span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={handleShareLinkedIn}
                    className="p-3 bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white border border-[#0A66C2]/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group shadow-xs hover:scale-102 active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="font-black text-xs font-sans">in</span>
                    </div>
                    <span className="text-xs font-black">LinkedIn</span>
                    <span className="text-[9px] opacity-75 font-medium group-hover:text-white">
                      {language === 'bn' ? 'প্রফেশনাল ফিড' : 'Feed Post'}
                    </span>
                  </button>

                  {/* Email & SMS */}
                  <button
                    onClick={handleShareEmail}
                    className="p-3 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group shadow-xs hover:scale-102 active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black">Email / SMS</span>
                    <span className="text-[9px] opacity-75 font-medium group-hover:text-white">
                      {language === 'bn' ? 'ইমেইল বা মেসেজ' : 'Direct Email'}
                    </span>
                  </button>

                </div>
              </div>

              {/* Direct Copy Link Box */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  {language === 'bn' ? 'সরাসরি প্রোডাক্ট লিংক কপি করুন:' : 'Copy Direct Product Link:'}
                </p>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div className="px-2 text-slate-400 shrink-0">
                    <Globe className="w-4 h-4 text-red-500" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-700 dark:text-slate-300 focus:outline-none select-all truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'লিংক কপি' : 'Copy Link'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Text Copy Bar */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {language === 'bn' ? 'সম্পূর্ণ বিবরণসহ শেয়ার মেসেজ' : 'Copy Formatted Share Summary'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {language === 'bn' ? 'দাম, ছাড় ও ডেলিভারি তথ্যসহ মেসেজ' : 'Includes price, discount, and direct link'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyText}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    copiedText 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{language === 'bn' ? 'মেসেজ কপি' : 'Copy Text'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE SOCIAL MEDIA POST PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Platform Selector */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  {language === 'bn' ? 'প্ল্যাটফর্ম প্রিভিউ নির্বাচন করুন:' : 'Select Mockup Platform:'}
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: 'facebook', label: 'Facebook' },
                    { id: 'twitter', label: '𝕏 Post' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPreviewPlatform(p.id as any)}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition cursor-pointer ${
                        previewPlatform === p.id 
                          ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mockup Card Display */}
              {previewPlatform === 'whatsapp' && (
                <div className="bg-[#EFEAE2] dark:bg-[#0b141a] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
                  {/* WhatsApp Chat Bubble */}
                  <div className="max-w-sm ml-auto bg-[#D9FDD3] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-2xl rounded-tr-xs p-3 shadow-md space-y-2 text-xs">
                    
                    {/* Rich Link Card inside WhatsApp */}
                    <div className="rounded-xl overflow-hidden bg-white/70 dark:bg-black/30 border border-black/5">
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                        <img 
                          src={product.images[0]} 
                          alt="" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {hasDiscount && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-xs">
                            🔥 {discountPercent}% OFF
                          </span>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                          amarbazar.bd
                        </div>
                      </div>
                      <div className="p-2.5 space-y-0.5">
                        <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                          {productTitle}
                        </p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-1">
                          {cleanDescription || 'AmarBazar BD Official Online Store'}
                        </p>
                        <p className="text-[9px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                          amarbazar.bd
                        </p>
                      </div>
                    </div>

                    {/* Chat Text Message */}
                    <p className="whitespace-pre-line text-[11px] leading-relaxed font-sans text-slate-800 dark:text-slate-100">
                      {shareText}
                    </p>

                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 dark:text-slate-300 font-sans">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />
                    </div>
                  </div>
                </div>
              )}

              {previewPlatform === 'facebook' && (
                <div className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
                  {/* Facebook User Mock Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-red-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      AB
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                        <span>AmarBazar Customer</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      </p>
                      <p className="text-[10px] text-slate-400">Just now • 🌍 Public</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200">
                    {language === 'bn' 
                      ? `অমরবাজার বিডি থেকে এই চমৎকার পণ্যটি দেখুন! ৳${currentPrice.toLocaleString()} মূল্যে সরাসরি অর্ডার করুন:` 
                      : `Found this amazing deal on AmarBazar BD! Check it out:`}
                  </p>

                  {/* Facebook OpenGraph Link Card */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt="" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                        ৳{currentPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 space-y-1 bg-slate-50 dark:bg-slate-900">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        AMARBAZAR.BD
                      </p>
                      <h5 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {productTitle}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {cleanDescription || 'Buy original authentic products with fast home delivery in Bangladesh.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {previewPlatform === 'twitter' && (
                <div className="bg-black text-white p-4 rounded-3xl border border-slate-800 shadow-md space-y-3 font-sans">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs">
                      AB
                    </div>
                    <div>
                      <p className="text-xs font-bold flex items-center gap-1">
                        <span>AmarBazar BD</span>
                        <span className="text-slate-500 font-normal">@amarbazar_bd</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-100 leading-snug">
                    🔥 {productTitle} — ৳{currentPrice.toLocaleString()}{hasDiscount ? ` (${discountPercent}% OFF!)` : ''} #AmarBazar #ShoppingBD
                  </p>

                  <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                    <img 
                      src={product.images[0]} 
                      alt="" 
                      className="w-full aspect-video object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-2.5">
                      <p className="text-[10px] text-slate-400">amarbazar.bd</p>
                      <p className="text-xs font-bold text-slate-100 truncate">{productTitle}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: QR CODE GENERATOR */}
          {activeTab === 'qrcode' && (
            <div className="space-y-4 text-center animate-in fade-in duration-150">
              <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 inline-block mx-auto shadow-inner">
                {qrDataUrl ? (
                  <div className="relative p-2 bg-white rounded-2xl shadow-md inline-block">
                    <img 
                      src={qrDataUrl} 
                      alt="Product QR Code" 
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-lg border-2 border-red-600 flex items-center justify-center">
                        <span className="font-black text-red-600 text-xs">AB</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                )}

                <div className="mt-3 space-y-1">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {language === 'bn' ? 'ফোনের ক্যামেরা দিয়ে সরাসরি স্ক্যান করুন' : 'Scan with your Phone Camera'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'স্ক্যান করলেই সরাসরি পণ্যটির পেজ খুলে যাবে।' : 'Instantly opens this product page on any mobile browser.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={downloadQrCode}
                  className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'QR কোড ডাউনলোড করুন' : 'Download QR Image'}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MESSAGE CUSTOMIZATION */}
          {activeTab === 'customize' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
                  {language === 'bn' ? 'শেয়ার মেসেজে কি কি অন্তর্ভুক্ত করবেন:' : 'Include in Share Message:'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    <input 
                      type="checkbox" 
                      checked={includePrice} 
                      onChange={(e) => setIncludePrice(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" 
                    />
                    <span>{language === 'bn' ? 'বর্তমান মূল্য' : 'Product Price'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    <input 
                      type="checkbox" 
                      checked={includeDiscount} 
                      onChange={(e) => setIncludeDiscount(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" 
                    />
                    <span>{language === 'bn' ? 'ছাড় ও ডিসকাউন্ট' : 'Discount Tag'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    <input 
                      type="checkbox" 
                      checked={includeDescription} 
                      onChange={(e) => setIncludeDescription(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" 
                    />
                    <span>{language === 'bn' ? 'সংক্ষিপ্ত বিবরণ' : 'Description'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    <input 
                      type="checkbox" 
                      checked={includeDelivery} 
                      onChange={(e) => setIncludeDelivery(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" 
                    />
                    <span>{language === 'bn' ? 'ডেলিভারি তথ্য' : 'Delivery Info'}</span>
                  </label>
                </div>
              </div>

              {/* Custom Note input */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  {language === 'bn' ? 'ব্যক্তিগত বার্তা যোগ করুন (ঐচ্ছিক):' : 'Add Personal Note (Optional):'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: "বন্ধু, এটা অনেক ভালো অফার!"' : 'e.g. "Check this out, awesome deal!"'}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Live Preview Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    {language === 'bn' ? 'কাস্টমাইজড শেয়ার মেসেজ প্রিভিউ:' : 'Customized Message Preview:'}
                  </label>
                  <button
                    onClick={handleCopyText}
                    className="text-[11px] font-black text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedText ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'মেসেজ কপি' : 'Copy Message')}</span>
                  </button>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                  {shareText}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>{language === 'bn' ? 'WhatsApp এ পাঠান' : 'Share on WhatsApp'}</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কাস্টম মেসেজ কপি' : 'Copy Message')}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/20 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Footer info banner */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{language === 'bn' ? '১০০% আসল পণ্যের নিরাপদ লিংক' : '100% Secure & Verified Link'}</span>
          </span>
          <span className="font-bold text-red-600 dark:text-red-400">
            AmarBazar BD
          </span>
        </div>

      </div>
    </div>
  );
};
