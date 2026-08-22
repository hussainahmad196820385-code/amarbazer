import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Send, X, Minimize2, Maximize2, ExternalLink, 
  Sparkles, Bot, CheckCheck, Phone, ShoppingBag, 
  Truck, CreditCard, ArrowRight, Volume2, VolumeX, ShieldCheck,
  MessageSquare, Layers
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'agent';
  channel?: 'whatsapp' | 'messenger';
  text: string;
  textBn?: string;
  timestamp: string;
  quickReplies?: { label: string; labelBn: string; action: string; payload?: any }[];
  actionLink?: { url: string; label: string; labelBn: string };
  badge?: string;
}

export function FacebookMessengerWidget({ 
  embedded = false, 
  initialChannel = 'whatsapp',
  onClose,
  isFloating = false
}: { 
  embedded?: boolean; 
  initialChannel?: 'whatsapp' | 'messenger';
  onClose?: () => void;
  isFloating?: boolean;
} = {}) {
  const { language, products, setActivePanel, systemSettings } = useApp();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.getOrders().then(res => {
      if (Array.isArray(res)) setOrders(res);
    }).catch(() => {});
  }, []);
  
  // Selected Live Channel: 'whatsapp' or 'messenger'
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'messenger'>(initialChannel);

  // Widget Open/Close & Minimized states
  const [isOpen, setIsOpen] = useState(embedded ? true : false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  
  // Facebook Page & WhatsApp configurations
  const [fbPageUsername, setFbPageUsername] = useState(() => {
    return localStorage.getItem('amarbazar_fb_page_username') || 'AmarBazarBD.Official';
  });

  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    return localStorage.getItem('amarbazar_whatsapp_number') || systemSettings?.supportPhone?.replace(/[^0-9]/g, '') || '8801712345678';
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('amarbazar_omnichat_auto_chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'msg-welcome-wa',
        sender: 'bot',
        channel: 'whatsapp',
        text: 'Hello! 👋 Welcome to AmarBazar BD automated WhatsApp & Messenger Help Center. How may we assist you?',
        textBn: 'আসসালামু আলাইকুম! 👋 আমারবাজার বিডি হোয়াটসঅ্যাপ ও ফেসবুক মেসেঞ্জার অটোমেশন হেল্পডেস্কে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          { label: '📱 WhatsApp Direct Order', labelBn: '📱 হোয়াটসঅ্যাপে সরাসরি অর্ডার', action: 'wa_order' },
          { label: '📦 Track My Order', labelBn: '📦 আমার অর্ডার ট্র্যাক করুন', action: 'track_order' },
          { label: '🔥 Today\'s Hot Deals', labelBn: '🔥 আজকের সেরা অফার', action: 'hot_deals' },
          { label: '🚚 Delivery & COD Charges', labelBn: '🚚 ডেলিভারি চার্জ ও সময়', action: 'delivery_info' },
          { label: '💳 bKash / Nagad / Card', labelBn: '💳 বিকাশ / নগদ পেমেন্ট নিয়ম', action: 'payment_info' },
          { label: '💬 Chat on WhatsApp App', labelBn: '💬 সরাসরি হোয়াটসঅ্যাপে লিখুন', action: 'open_whatsapp_direct' }
        ]
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Save conversation history to local cache
  useEffect(() => {
    try {
      localStorage.setItem('amarbazar_omnichat_auto_chat', JSON.stringify(messages));
    } catch (e) {}
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Audio tone synthesizer for authentic message sound
  const playPopSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      if (activeChannel === 'whatsapp') {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      } else {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
      }
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.13);
    } catch (e) {}
  };

  const getCleanWhatsAppNumber = () => {
    const raw = whatsappNumber.replace(/[^0-9]/g, '');
    if (raw.startsWith('01')) return `88${raw}`;
    if (raw.startsWith('880')) return raw;
    return raw || '8801712345678';
  };

  // Automated Response NLP & Rules Engine
  const processUserQuery = (text: string, actionKey?: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      channel: activeChannel,
      text,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let botResponse: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        channel: activeChannel,
        text: '',
        textBn: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const lower = text.toLowerCase();
      const cleanPhone = getCleanWhatsAppNumber();

      // Action Handlers
      if (actionKey === 'wa_order' || lower.includes('হোয়াটসঅ্যাপে অর্ডার') || lower.includes('whatsapp order') || lower.includes('direct order')) {
        const waText = encodeURIComponent('আসসালামু আলাইকুম AmarBazar BD, আমি আপনাদের স্টোর থেকে পণ্য কিনতে চাই। অনুগ্রহ করে সহায়তা করুন।');
        botResponse = {
          ...botResponse,
          text: `📱 1-Click WhatsApp Direct Ordering:\nYou can send your product name, quantity, delivery address, and phone number directly to our official WhatsApp Business number:\n+${cleanPhone}\nOur sales team will confirm your order in under 2 minutes!`,
          textBn: `📱 হোয়াটসঅ্যাপে সরাসরি ১-ক্লিক অর্ডার পদ্ধতি:\nআপনার পছন্দের পণ্যের নাম, ঠিকানা ও মোবাইল নম্বর সরাসরি আমাদের অফিসিয়াল হোয়াটসঅ্যাপ নম্বরে (+${cleanPhone}) পাঠান। আমাদের সেলস টিম সাথে সাথে অর্ডার কনফার্ম করে দেবে!`,
          actionLink: {
            url: `https://wa.me/${cleanPhone}?text=${waText}`,
            label: 'Open WhatsApp Chat (wa.me)',
            labelBn: 'হোয়াটসঅ্যাপ চ্যাট ওপেন করুন (wa.me)'
          },
          quickReplies: [
            { label: '📦 Track Order', labelBn: '📦 অর্ডার ট্র্যাক', action: 'track_order' },
            { label: '🚚 Delivery Policy', labelBn: '🚚 ডেলিভারি নিয়ম', action: 'delivery_info' },
            { label: '🔥 Today\'s Deals', labelBn: '🔥 সেরা অফারসমূহ', action: 'hot_deals' }
          ]
        };
      } else if (actionKey === 'open_whatsapp_direct' || lower.includes('whatsapp') || lower.includes('হোয়াটসঅ্যাপ')) {
        const waText = encodeURIComponent('Hello AmarBazar BD, I would like to connect with your support agent.');
        botResponse = {
          ...botResponse,
          text: `🟢 Chat with our WhatsApp Business Agent:\nNumber: +${cleanPhone}\nInstant 24/7 Live Support via official WhatsApp Web / App.`,
          textBn: `🟢 আমাদের হোয়াটসঅ্যাপ বিজনেস সাপোর্ট এজেন্টের সাথে কথা বলতে নিচের লিংকে চাপ দিন:\nনম্বর: +${cleanPhone}\n২৪/৭ ইনস্ট্যান্ট লাইভ সাপোর্ট।`,
          actionLink: {
            url: `https://wa.me/${cleanPhone}?text=${waText}`,
            label: `Chat on WhatsApp (+${cleanPhone})`,
            labelBn: `হোয়াটসঅ্যাপে চ্যাট করুন (+${cleanPhone})`
          },
          quickReplies: [
            { label: '📦 Track My Order', labelBn: '📦 অর্ডার ট্র্যাক করুন', action: 'track_order' },
            { label: '🔥 Hot Deals', labelBn: '🔥 আজকের অফার', action: 'hot_deals' }
          ]
        };
      } else if (actionKey === 'track_order' || lower.includes('track') || lower.includes('অর্ডার') || lower.includes('order')) {
        const recentOrder = orders && orders.length > 0 ? orders[0] : null;
        if (recentOrder) {
          const statusBn = recentOrder.status === 'delivered' ? 'ডেলিভার্ড (সম্পন্ন)' :
                           recentOrder.status === 'processing' ? 'প্রসেসিং হচ্ছে' :
                           recentOrder.status === 'shipped' ? 'কুরিয়ারে পাঠানো হয়েছে' : 'অর্ডার গৃহীত হয়েছে';
          botResponse = {
            ...botResponse,
            text: `Your latest order #${recentOrder.id} is currently: ${recentOrder.status.toUpperCase()}. Estimated delivery: 2-3 Days. Total: ৳${recentOrder.totalAmount}.`,
            textBn: `আপনার সর্বশেষ অর্ডার #${recentOrder.id} বর্তমান স্ট্যাটাস: ${statusBn}। সম্ভাব্য ডেলিভারি সময়: ২-৩ দিন। সর্বমোট: ৳${recentOrder.totalAmount}।`,
            badge: recentOrder.status.toUpperCase(),
            quickReplies: [
              { label: '📱 WhatsApp Order Update', labelBn: '📱 হোয়াটসঅ্যাপে আপডেট পান', action: 'open_whatsapp_direct' },
              { label: '🔥 Hot Deals', labelBn: '🔥 অফার দেখুন', action: 'hot_deals' }
            ]
          };
        } else {
          botResponse = {
            ...botResponse,
            text: 'To track your order, type your 6-digit Order ID (e.g. ORD-948271) or tap the WhatsApp button to request live tracking from an agent.',
            textBn: 'আপনার অর্ডার ট্র্যাক করতে আপনার অর্ডারের আইডিটি (যেমন: ORD-948271) লিখুন অথবা হোয়াটসঅ্যাপে এজেন্টের কাছে ট্র্যাকিং রিকোয়েস্ট পাঠান।',
            quickReplies: [
              { label: '💬 WhatsApp Support', labelBn: '💬 হোয়াটসঅ্যাপ সাপোর্ট', action: 'open_whatsapp_direct' },
              { label: '🔥 Hot Deals', labelBn: '🔥 আজকের অফার', action: 'hot_deals' }
            ]
          };
        }
      } else if (actionKey === 'hot_deals' || lower.includes('offer') || lower.includes('deal') || lower.includes('অফার') || lower.includes('ডিসকাউন্ট')) {
        const topDeals = products.filter(p => p.discountPrice || p.isFlashDeal || p.isFeatured).slice(0, 3);
        const dealsSummary = topDeals.map(p => `• ${p.titleBn || p.title}: ৳${p.discountPrice || p.price}`).join('\n');
        
        botResponse = {
          ...botResponse,
          text: `🔥 Today's Top Hot Deals & Combos:\n${dealsSummary}\n\n100% Cash on Delivery available across Bangladesh!`,
          textBn: `🔥 আজকের সেরা অফার ও কম্বো প্যাকেজসমূহ:\n${dealsSummary}\n\nসারা দেশে ১০০% ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি পাওয়া যাচ্ছে!`,
          quickReplies: [
            { label: '📱 Order on WhatsApp', labelBn: '📱 হোয়াটসঅ্যাপে অর্ডার করুন', action: 'wa_order' },
            { label: '🚚 Delivery Policy', labelBn: '🚚 ডেলিভারি চার্জ জানুন', action: 'delivery_info' },
            { label: '💳 Payment Options', labelBn: '💳 পেমেন্ট নিয়ম', action: 'payment_info' }
          ]
        };
      } else if (actionKey === 'delivery_info' || lower.includes('delivery') || lower.includes('ডেলিভারি') || lower.includes('চার্জ') || lower.includes('কুরিয়ার')) {
        botResponse = {
          ...botResponse,
          text: '🚚 Delivery Time & Charges:\n• Inside Dhaka City: ৳60 (24-48 hours)\n• Outside Dhaka: ৳120 (48-72 hours via Steadfast/Pathao/RedX)\n• Doorstep checking with 100% Cash on Delivery (COD).',
          textBn: '🚚 ডেলিভারি চার্জ ও সময়সূচি:\n• ঢাকা সিটির ভেতরে: ৳৬০ (২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি)\n• সারা বাংলাদেশ: ৳১২০ (২-৩ কার্যদিবসের মধ্যে Steadfast/Pathao/RedX কুরিয়ারে)\n• পণ্য দেখে মূল্য পরিশোধের ১০০% ক্যাশ অন ডেলিভারি সুবিধা।',
          quickReplies: [
            { label: '📱 WhatsApp Support', labelBn: '📱 হোয়াটসঅ্যাপ সাপোর্ট', action: 'open_whatsapp_direct' },
            { label: '💳 Payment Options', labelBn: '💳 পেমেন্ট পদ্ধতি', action: 'payment_info' }
          ]
        };
      } else if (actionKey === 'payment_info' || lower.includes('payment') || lower.includes('bkash') || lower.includes('nagad') || lower.includes('পেমেন্ট') || lower.includes('টাকা') || lower.includes('ক্যাশ')) {
        botResponse = {
          ...botResponse,
          text: '💳 Payment Methods:\n1. 💵 Cash on Delivery (COD) - Pay upon delivery\n2. 📱 bKash / Nagad / Rocket (0% fee instant payment)\n3. 💳 Visa / MasterCard / Amex\n4. 🛡️ 7-Day Money Back & Replacement Guarantee.',
          textBn: '💳 পেমেন্ট করার মাধ্যমসমূহ:\n১. 💵 ক্যাশ অন ডেলিভারি (COD) - পণ্য হাতে পেয়ে মূল্য পরিশোধ\n২. 📱 বিকাশ, নগদ, রকেট (ইনস্ট্যান্ট পেমেন্ট, ০% ফি)\n৩. 💳 ভিসা ও মাস্টারকার্ড ডেবিট/ক্রেডিট কার্ড\n৪. 🛡️ ৭ দিনের ফ্রি রিপ্লেসমেন্ট ও মানিব্যাক গ্যারান্টি।',
          quickReplies: [
            { label: '📱 Order on WhatsApp', labelBn: '📱 হোয়াটসঅ্যাপে অর্ডার', action: 'wa_order' },
            { label: '🚚 Delivery Info', labelBn: '🚚 ডেলিভারি তথ্য', action: 'delivery_info' }
          ]
        };
      } else if (actionKey === 'open_fb_messenger' || lower.includes('facebook') || lower.includes('messenger') || lower.includes('ফেসবুক')) {
        botResponse = {
          ...botResponse,
          text: `💬 Official Meta Facebook Page Messenger:\n@${fbPageUsername}\nClick below to open chat directly in Facebook Messenger.`,
          textBn: `💬 আমাদের অফিসিয়াল ফেসবুক পেজে মেসেঞ্জারে কথা বলতে নিচের লিংকে ট্যাপ করুন:\nপেজ: @${fbPageUsername}`,
          actionLink: {
            url: `https://m.me/${encodeURIComponent(fbPageUsername)}`,
            label: 'Open Facebook Messenger (m.me)',
            labelBn: 'ফেসবুক মেসেঞ্জারে ওপেন করুন (m.me)'
          },
          quickReplies: [
            { label: '📱 WhatsApp Chat', labelBn: '📱 হোয়াটসঅ্যাপে কথা বলুন', action: 'open_whatsapp_direct' },
            { label: '📦 Track Order', labelBn: '📦 অর্ডার ট্র্যাক', action: 'track_order' }
          ]
        };
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('সালাম') || lower.includes('assalamu') || lower.includes('কেমন আছেন')) {
        botResponse = {
          ...botResponse,
          text: 'Hello! 👋 Thank you for messaging AmarBazar BD. How can our automated assistant or official support team help you right now?',
          textBn: 'আসসালামু আলাইকুম! 👋 আমারবাজার বিডি-তে মেসেজ করার জন্য ধন্যবাদ। আমাদের অটোমেটেড অ্যাসিস্ট্যান্ট বা সাপোর্ট টিম আপনাকে কীভাবে সাহায্য করতে পারে?',
          quickReplies: [
            { label: '📱 WhatsApp Direct Order', labelBn: '📱 হোয়াটসঅ্যাপে অর্ডার', action: 'wa_order' },
            { label: '📦 Track Order', labelBn: '📦 অর্ডার ট্র্যাক', action: 'track_order' },
            { label: '🔥 Today\'s Deals', labelBn: '🔥 আজকের অফার', action: 'hot_deals' },
            { label: '🚚 Delivery Charge', labelBn: '🚚 ডেলিভারি চার্জ', action: 'delivery_info' }
          ]
        };
      } else {
        botResponse = {
          ...botResponse,
          text: `Thanks for your inquiry regarding "${text.slice(0, 40)}". Our WhatsApp & Messenger automated assistant is ready to help!`,
          textBn: `"${text.slice(0, 40)}" সংক্রান্ত বার্তার জন্য ধন্যবাদ। আপনি নিচের কুইক অপশনগুলো সিলেক্ট করতে পারেন অথবা সরাসরি হোয়াটসঅ্যাপে কথা বলতে পারেন!`,
          quickReplies: [
            { label: '📱 WhatsApp Chat', labelBn: '📱 হোয়াটসঅ্যাপে সরাসরি লিখুন', action: 'open_whatsapp_direct' },
            { label: '📦 Track Order', labelBn: '📦 অর্ডার ট্র্যাক', action: 'track_order' },
            { label: '🚚 Delivery Info', labelBn: '🚚 ডেলিভারি চার্জ ও নিয়ম', action: 'delivery_info' }
          ]
        };
      }

      setIsTyping(false);
      setMessages(prev => [...prev, botResponse]);
      playPopSound();
      if (!isOpen) {
        setHasUnread(true);
      }
    }, 550);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    processUserQuery(text);
  };

  const handleQuickReply = (action: string, label: string) => {
    if (action === 'open_whatsapp_direct' || action === 'wa_order') {
      const cleanPhone = getCleanWhatsAppNumber();
      const waText = encodeURIComponent(label);
      window.open(`https://wa.me/${cleanPhone}?text=${waText}`, '_blank', 'noopener,noreferrer');
      processUserQuery(label, action);
    } else if (action === 'open_fb_messenger') {
      window.open(`https://m.me/${encodeURIComponent(fbPageUsername)}`, '_blank', 'noopener,noreferrer');
      processUserQuery(label, action);
    } else {
      processUserQuery(label, action);
    }
  };

  const handleActionLinkClick = (url: string) => {
    if (url.startsWith('#register_vendor')) {
      setActivePanel('register_vendor');
      setIsOpen(false);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const cleanPhone = getCleanWhatsAppNumber();

  if (embedded) {
    return (
      <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden font-sans border-0 sm:border border-slate-200/80 dark:border-slate-800 rounded-none sm:rounded-3xl shadow-none sm:shadow-md">
        {/* Multi-Channel Header */}
        <div 
          className={`p-3.5 text-white flex items-center justify-between select-none shrink-0 shadow-xs transition-colors duration-300 ${
            activeChannel === 'whatsapp'
              ? 'bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366]'
              : 'bg-gradient-to-r from-[#0084FF] via-[#00A3FF] to-[#A822D6]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md p-1 border border-white/40 flex items-center justify-center shadow-inner">
                {activeChannel === 'whatsapp' ? (
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.14 2 11.25C2 14.16 3.44 16.74 5.69 18.38V22L9.18 20.08C10.08 20.33 11.02 20.47 12 20.47C17.52 20.47 22 16.33 22 11.22C22 6.14 17.52 2 12 2ZM13.06 14.47L10.77 12.03L6.3 14.47L11.22 9.24L13.56 11.68L17.98 9.24L13.06 14.47Z" />
                  </svg>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white tracking-wide">
                  {activeChannel === 'whatsapp' 
                    ? (language === 'bn' ? 'আমারবাজার WhatsApp হেল্প ও অর্ডার' : 'AmarBazar WhatsApp Care & Order')
                    : (language === 'bn' ? 'আমারবাজার FB মেসেঞ্জার হেল্প' : 'AmarBazar Messenger Care')}
                </h3>
                <span className="p-0.5 bg-white/20 rounded-full text-[9px] text-white font-bold" title="Verified Bot">
                  ✓
                </span>
              </div>
              <p className="text-[11px] text-white/90 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                {activeChannel === 'whatsapp' 
                  ? `+${cleanPhone} • 24/7 লাইভ সাপোর্ট ও অটোমেশন` 
                  : (language === 'bn' ? 'অটোমেটেড বট ও ফেসবুক পেজ চ্যাট' : 'Automated Bot & FB Page Chat')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-white/20 rounded-xl text-white/90 hover:text-white transition cursor-pointer"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-60" />}
            </button>

            {activeChannel === 'whatsapp' ? (
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello AmarBazar BD Support')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-50 transition shadow-sm flex items-center gap-1.5"
              >
                <span>{language === 'bn' ? 'WhatsApp খুলুন' : 'Open WhatsApp'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <a
                href={`https://m.me/${encodeURIComponent(fbPageUsername)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-50 transition shadow-sm flex items-center gap-1.5"
              >
                <span>{language === 'bn' ? 'Messenger খুলুন' : 'Open Messenger'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl text-white/90 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Channel Selector Tab Bar */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveChannel('whatsapp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeChannel === 'whatsapp'
                  ? 'bg-[#25D366] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>WhatsApp Bot & Direct</span>
            </button>

            <button
              onClick={() => setActiveChannel('messenger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeChannel === 'messenger'
                  ? 'bg-[#0084FF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.14 2 11.25C2 14.16 3.44 16.74 5.69 18.38V22L9.18 20.08C10.08 20.33 11.02 20.47 12 20.47C17.52 20.47 22 16.33 22 11.22C22 6.14 17.52 2 12 2ZM13.06 14.47L10.77 12.03L6.3 14.47L11.22 9.24L13.56 11.68L17.98 9.24L13.06 14.47Z" />
              </svg>
              <span>Facebook Messenger</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {language === 'bn' ? 'লাইভ বট অ্যাক্টিভ' : 'Bot Engine Active'}
            </span>
          </div>
        </div>

        {/* Chat Message Scrollable Container */}
        <div 
          className={`flex-1 p-4 overflow-y-auto space-y-3.5 text-xs ${
            activeChannel === 'whatsapp'
              ? 'bg-[#efeae2]/60 dark:bg-slate-950/60'
              : 'bg-[#f0f4f9]/50 dark:bg-slate-950/40'
          }`}
          style={{
            backgroundImage: activeChannel === 'whatsapp' 
              ? 'radial-gradient(#128C7E 0.5px, transparent 0.5px)' 
              : undefined,
            backgroundSize: activeChannel === 'whatsapp' ? '12px 12px' : undefined
          }}
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                {msg.sender !== 'user' && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5 shadow-xs ${
                    activeChannel === 'whatsapp'
                      ? 'bg-gradient-to-tr from-[#128C7E] to-[#25D366]'
                      : 'bg-gradient-to-tr from-[#0084FF] to-[#A822D6]'
                  }`}>
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div 
                  className={`p-3.5 rounded-2xl font-medium leading-relaxed break-words shadow-xs ${
                    msg.sender === 'user'
                      ? activeChannel === 'whatsapp'
                        ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-800 dark:text-slate-100 rounded-br-xs border border-[#c4f8bb] dark:border-[#02735e]'
                        : 'bg-gradient-to-tr from-[#0084FF] to-[#00A3FF] text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  {msg.badge && (
                    <div className="inline-block mb-1.5 px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-md border border-emerald-500/30">
                      ● {msg.badge}
                    </div>
                  )}
                  <p className="whitespace-pre-line text-xs">
                    {language === 'bn' && msg.textBn ? msg.textBn : msg.text}
                  </p>

                  {/* Action Link Button if provided */}
                  {msg.actionLink && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => handleActionLinkClick(msg.actionLink!.url)}
                        className={`w-full py-2 px-3.5 hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                          activeChannel === 'whatsapp'
                            ? 'bg-[#25D366] hover:bg-emerald-600'
                            : 'bg-gradient-to-r from-[#0084FF] to-[#A822D6]'
                        }`}
                      >
                        <span>{language === 'bn' ? msg.actionLink.labelBn : msg.actionLink.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {msg.timestamp}
                </span>
                {msg.sender === 'user' && (
                  <CheckCheck className={`w-3.5 h-3.5 ${activeChannel === 'whatsapp' ? 'text-sky-500' : 'text-[#0084FF]'}`} />
                )}
              </div>

              {/* Interactive Quick Reply Pills */}
              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 max-w-[90%]">
                  {msg.quickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(qr.action, language === 'bn' ? qr.labelBn : qr.label)}
                      className={`text-xs font-semibold py-1.5 px-3 bg-white dark:bg-slate-800 rounded-full shadow-xs transition hover:scale-102 flex items-center gap-1.5 cursor-pointer border ${
                        activeChannel === 'whatsapp'
                          ? 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700/80'
                          : 'text-sky-600 dark:text-sky-400 border-sky-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700/80'
                      }`}
                    >
                      <span>{language === 'bn' ? qr.labelBn : qr.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 ${
                activeChannel === 'whatsapp' ? 'bg-[#25D366]' : 'bg-[#0084FF]'
              }`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-xs flex items-center gap-1.5 text-slate-400">
                <span className={`w-2 h-2 rounded-full animate-bounce ${activeChannel === 'whatsapp' ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s] ${activeChannel === 'whatsapp' ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s] ${activeChannel === 'whatsapp' ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Bottom Message Input Form */}
        <form 
          onSubmit={handleSendMessage}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === 'bn' ? 'মেসেজ লিখুন (যেমন: অর্ডার দিতে চাই, ডেলিভারি চার্জ কত?)...' : 'Type a message (e.g. order now, track delivery)...'}
            className={`flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm px-4 py-2.5 rounded-full focus:outline-hidden border border-transparent dark:border-slate-700 ${
              activeChannel === 'whatsapp'
                ? 'focus:ring-2 focus:ring-[#25D366]'
                : 'focus:ring-2 focus:ring-[#0084FF]'
            }`}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2.5 text-white rounded-full hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md cursor-pointer ${
              activeChannel === 'whatsapp'
                ? 'bg-[#25D366] hover:bg-emerald-600'
                : 'bg-gradient-to-tr from-[#0084FF] to-[#A822D6]'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // If not embedded and floating is disabled, do not render floating bubble overlay on main storefront
  if (!isFloating) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end pointer-events-none font-sans">
      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div 
          className={`pointer-events-auto w-[92vw] sm:w-[390px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right mb-3 ${
            isMinimized ? 'h-14' : 'h-[550px] max-h-[82vh]'
          }`}
          style={{
            boxShadow: activeChannel === 'whatsapp' 
              ? '0 20px 45px -10px rgba(37, 211, 102, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.1)'
              : '0 20px 45px -10px rgba(0, 132, 255, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Authentic Multi-Channel Header */}
          <div 
            className={`p-3 text-white flex items-center justify-between cursor-pointer select-none shrink-0 shadow-sm transition-colors duration-300 ${
              activeChannel === 'whatsapp'
                ? 'bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366]'
                : 'bg-gradient-to-r from-[#0084FF] via-[#00A3FF] to-[#A822D6]'
            }`}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md p-1 border border-white/40 flex items-center justify-center shadow-inner">
                  {activeChannel === 'whatsapp' ? (
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.14 2 11.25C2 14.16 3.44 16.74 5.69 18.38V22L9.18 20.08C10.08 20.33 11.02 20.47 12 20.47C17.52 20.47 22 16.33 22 11.22C22 6.14 17.52 2 12 2ZM13.06 14.47L10.77 12.03L6.3 14.47L11.22 9.24L13.56 11.68L17.98 9.24L13.06 14.47Z" />
                    </svg>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-white tracking-wide">
                    {activeChannel === 'whatsapp' 
                      ? (language === 'bn' ? 'আমারবাজার WhatsApp হেল্প' : 'AmarBazar WhatsApp Care')
                      : (language === 'bn' ? 'আমারবাজার FB মেসেঞ্জার' : 'AmarBazar Messenger')}
                  </h3>
                  <span className="p-0.5 bg-white/20 rounded-full text-[9px] text-white font-bold" title="Verified Bot">
                    ✓
                  </span>
                </div>
                <p className="text-[10px] text-white/90 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  {activeChannel === 'whatsapp' 
                    ? `+${cleanPhone} • 24/7 Active` 
                    : (language === 'bn' ? 'অটোমেটেড বট • ইনস্ট্যান্ট উত্তর' : 'Automated Bot • Instant Reply')}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSoundEnabled(!soundEnabled);
                }}
                className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition cursor-pointer"
                title={soundEnabled ? 'Mute' : 'Unmute'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-60" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeChannel === 'whatsapp') {
                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello AmarBazar BD Support')}`, '_blank', 'noopener,noreferrer');
                  } else {
                    window.open(`https://m.me/${encodeURIComponent(fbPageUsername)}`, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition cursor-pointer"
                title={activeChannel === 'whatsapp' ? 'Open in WhatsApp App' : 'Open in Facebook Messenger'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Channel Selector Tab Bar */}
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setActiveChannel('whatsapp')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition ${
                      activeChannel === 'whatsapp'
                        ? 'bg-[#25D366] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setActiveChannel('messenger')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition ${
                      activeChannel === 'messenger'
                        ? 'bg-[#0084FF] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.14 2 11.25C2 14.16 3.44 16.74 5.69 18.38V22L9.18 20.08C10.08 20.33 11.02 20.47 12 20.47C17.52 20.47 22 16.33 22 11.22C22 6.14 17.52 2 12 2ZM13.06 14.47L10.77 12.03L6.3 14.47L11.22 9.24L13.56 11.68L17.98 9.24L13.06 14.47Z" />
                    </svg>
                    <span>Messenger</span>
                  </button>
                </div>

                {activeChannel === 'whatsapp' ? (
                  <a 
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[10px] px-2 py-0.5 bg-[#25D366] text-white font-bold rounded-full hover:bg-emerald-600 transition flex items-center gap-1 shadow-xs"
                  >
                    <span>wa.me</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <a 
                    href={`https://m.me/${encodeURIComponent(fbPageUsername)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[10px] px-2 py-0.5 bg-[#0084FF] text-white font-bold rounded-full hover:bg-blue-600 transition flex items-center gap-1 shadow-xs"
                  >
                    <span>m.me</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              {/* Chat Message Scrollable Container */}
              <div 
                className={`flex-1 p-3 overflow-y-auto space-y-3 text-xs ${
                  activeChannel === 'whatsapp'
                    ? 'bg-[#efeae2]/60 dark:bg-slate-950/60'
                    : 'bg-[#f0f4f9]/50 dark:bg-slate-950/40'
                }`}
                style={{
                  backgroundImage: activeChannel === 'whatsapp' 
                    ? 'radial-gradient(#128C7E 0.5px, transparent 0.5px)' 
                    : undefined,
                  backgroundSize: activeChannel === 'whatsapp' ? '12px 12px' : undefined
                }}
              >
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-1.5 max-w-[88%]">
                      {msg.sender !== 'user' && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5 shadow-xs ${
                          activeChannel === 'whatsapp'
                            ? 'bg-gradient-to-tr from-[#128C7E] to-[#25D366]'
                            : 'bg-gradient-to-tr from-[#0084FF] to-[#A822D6]'
                        }`}>
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div 
                        className={`p-3 rounded-2xl font-medium leading-relaxed break-words shadow-xs ${
                          msg.sender === 'user'
                            ? activeChannel === 'whatsapp'
                              ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-800 dark:text-slate-100 rounded-br-xs border border-[#c4f8bb] dark:border-[#02735e]'
                              : 'bg-gradient-to-tr from-[#0084FF] to-[#00A3FF] text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-bl-xs'
                        }`}
                      >
                        {msg.badge && (
                          <div className="inline-block mb-1 px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-md border border-emerald-500/30">
                            ● {msg.badge}
                          </div>
                        )}
                        <p className="whitespace-pre-line text-[11.5px]">
                          {language === 'bn' && msg.textBn ? msg.textBn : msg.text}
                        </p>

                        {/* Action Link Button if provided */}
                        {msg.actionLink && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <button
                              onClick={() => handleActionLinkClick(msg.actionLink!.url)}
                              className={`w-full py-1.5 px-3 hover:opacity-95 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
                                activeChannel === 'whatsapp'
                                  ? 'bg-[#25D366] hover:bg-emerald-600'
                                  : 'bg-gradient-to-r from-[#0084FF] to-[#A822D6]'
                              }`}
                            >
                              <span>{language === 'bn' ? msg.actionLink.labelBn : msg.actionLink.label}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">
                        {msg.timestamp}
                      </span>
                      {msg.sender === 'user' && (
                        <CheckCheck className={`w-3 h-3 ${activeChannel === 'whatsapp' ? 'text-sky-500' : 'text-[#0084FF]'}`} />
                      )}
                    </div>

                    {/* Interactive Quick Reply Pills */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                        {msg.quickReplies.map((qr, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickReply(qr.action, language === 'bn' ? qr.labelBn : qr.label)}
                            className={`text-[10.5px] font-semibold py-1 px-2.5 bg-white dark:bg-slate-800 rounded-full shadow-xs transition hover:scale-102 flex items-center gap-1 cursor-pointer border ${
                              activeChannel === 'whatsapp'
                                ? 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700/80'
                                : 'text-sky-600 dark:text-sky-400 border-sky-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700/80'
                            }`}
                          >
                            <span>{language === 'bn' ? qr.labelBn : qr.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 ${
                      activeChannel === 'whatsapp' ? 'bg-[#25D366]' : 'bg-[#0084FF]'
                    }`}>
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-xs flex items-center gap-1 text-slate-400">
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${activeChannel === 'whatsapp' ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${activeChannel === 'whatsapp' ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${activeChannel === 'whatsapp' ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Bottom Message Input Form */}
              <form 
                onSubmit={handleSendMessage}
                className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shrink-0"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={language === 'bn' ? 'মেসেজ লিখুন (যেমন: অর্ডার দিতে চাই)...' : 'Type a message (e.g. order now)...'}
                  className={`flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs px-3.5 py-2 rounded-full focus:outline-hidden border border-transparent dark:border-slate-700 ${
                    activeChannel === 'whatsapp'
                      ? 'focus:ring-1 focus:ring-[#25D366]'
                      : 'focus:ring-1 focus:ring-[#0084FF]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2 text-white rounded-full hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer ${
                    activeChannel === 'whatsapp'
                      ? 'bg-[#25D366] hover:bg-emerald-600'
                      : 'bg-gradient-to-tr from-[#0084FF] to-[#A822D6]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Dual Floating Launcher (WhatsApp + Messenger) */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Unread / Attention Popover when closed */}
        {!isOpen && (
          <div 
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setHasUnread(false);
            }}
            className="hidden sm:flex items-center gap-2 bg-white dark:bg-slate-900 py-1.5 px-3 rounded-full shadow-lg border border-slate-200/80 dark:border-slate-800 cursor-pointer animate-fade-in hover:scale-102 transition"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              {language === 'bn' ? '💬 WhatsApp ও চ্যাট হেল্প' : '💬 WhatsApp & Chat Help'}
            </span>
          </div>
        )}

        {/* WhatsApp Fast Direct Launcher */}
        <button
          onClick={() => {
            setActiveChannel('whatsapp');
            setIsOpen(true);
            setIsMinimized(false);
            setHasUnread(false);
          }}
          aria-label="Open WhatsApp Automation"
          className="relative w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group"
          style={{
            boxShadow: '0 8px 25px -4px rgba(37, 211, 102, 0.5)'
          }}
          title="WhatsApp Automation & Chat"
        >
          <svg className="w-6 h-6 fill-white transition-transform group-hover:scale-105" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>

        {/* Facebook Messenger Launcher */}
        <button
          onClick={() => {
            setActiveChannel('messenger');
            setIsOpen(true);
            setIsMinimized(false);
            setHasUnread(false);
          }}
          aria-label="Open Facebook Messenger Automation"
          className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#0084FF] via-[#0099FF] to-[#A822D6] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group"
          style={{
            boxShadow: '0 8px 25px -4px rgba(0, 132, 255, 0.45)'
          }}
          title="Facebook Messenger Automation"
        >
          <svg className="w-6 h-6 fill-white transition-transform group-hover:scale-105" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.14 2 11.25C2 14.16 3.44 16.74 5.69 18.38V22L9.18 20.08C10.08 20.33 11.02 20.47 12 20.47C17.52 20.47 22 16.33 22 11.22C22 6.14 17.52 2 12 2ZM13.06 14.47L10.77 12.03L6.3 14.47L11.22 9.24L13.56 11.68L17.98 9.24L13.06 14.47Z" />
          </svg>

          {hasUnread && !isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-bounce"></span>
          )}

          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>
      </div>
    </div>
  );
}
