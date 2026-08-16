import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MessageSquare, User, Send, CheckCheck, RefreshCw, Phone, Mail, 
  MapPin, Shield, MessageCircle, AlertCircle, Video, PhoneCall,
  MoreVertical, Image, ThumbsUp, Search, Smile, Mic, Paperclip,
  Check, Trash2, UserPlus, PlusCircle, X, Info, Bell, Store, ChevronRight,
  Sparkles, CheckSquare, Heart, ArrowLeft, Plus, Camera, FileText, Download
} from 'lucide-react';
import { User as AppUser, Role } from '../../types';

// Helper to generate a 100% valid, playable synthesizer sound WAV Data URL
const generateMockAudioUrl = () => {
  const sampleRate = 8000;
  const duration = 1.5;
  const numSamples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  view.setUint32(0, 0x52494646, false); // "RIFF"
  /* file length */
  view.setUint32(4, 36 + numSamples * 2, true);
  /* RIFF type */
  view.setUint32(8, 0x57415645, false); // "WAVE"
  /* format chunk identifier */
  view.setUint32(12, 0x666d7420, false); // "fmt "
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (PCM = 1) */
  view.setUint16(20, 1, true);
  /* channel count (mono = 1) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate */
  view.setUint32(28, sampleRate * 2, true);
  /* block align */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  view.setUint32(36, 0x64617461, false); // "data"
  /* chunk length */
  view.setUint32(40, numSamples * 2, true);

  // Write a gentle melodic sweep
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // frequency sweeps from 400Hz to 600Hz
    const freq = 400 + 200 * t;
    const sample = Math.sin(2 * Math.PI * freq * t);
    const val = Math.floor(sample * 32767);
    view.setInt16(offset, val, true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

interface LocalMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  time: string;
  isLike?: boolean;
  isImage?: boolean;
  imageUrl?: string;
  status?: 'sent' | 'delivered' | 'read';
  isAudio?: boolean;
  audioDuration?: string;
  audioUrl?: string;
  replyToText?: string;
  replyToSenderName?: string;
  isFile?: boolean;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
}

interface Thread {
  threadId: string;
  participant1Id: string;
  participant2Id: string;
  subject: string;
  messages: LocalMessage[];
  status: 'active' | 'resolved';
}

const ALL_SYSTEM_USERS = [
  { id: 'usr-admin-1', name: 'Super Admin BD', email: 'admin@amarbazar.com.bd', phone: '01800000000', role: 'admin' as Role, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
  { id: 'usr-seller-1', name: 'Tanvir Hossain (Dhaka Tech)', email: 'tanvir@dhakatech.com.bd', phone: '01711223344', role: 'seller' as Role, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80' },
  { id: 'usr-demo-cust', name: 'Rahim Chowdhury', email: 'rahim@example.com', phone: '01712345678', role: 'customer' as Role, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' },
  { id: 'usr-demo-cust-2', name: 'Kamal Hossain', email: 'kamal.h@yahoo.com', phone: '01911998877', role: 'customer' as Role, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { id: 'usr-demo-cust-3', name: 'Jahanara Begum', email: 'jahanara@dhaka.net', phone: '01812334455', role: 'customer' as Role, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
  
  // New screenshot mock users
  { id: 'usr-ahnaf', name: 'Ahnaf Sheikh', email: 'ahnaf@amarbazar.com.bd', phone: '01711112222', role: 'seller' as Role, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', isFollowed: true },
  { id: 'usr-ismail', name: 'S M Ismail Hossin', email: 'ismail@amarbazar.com.bd', phone: '01722223333', role: 'seller' as Role, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', isFollowed: true },
  { id: 'usr-chayon', name: 'Chayon Chayon', email: 'chayon@amarbazar.com.bd', phone: '01733334444', role: 'seller' as Role, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', isFollowed: true },
  { id: 'usr-aziz', name: 'MD Habibullah Aziz', email: 'aziz@amarbazar.com.bd', phone: '01744445555', role: 'seller' as Role, avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80', isFollowed: true },
  { id: 'usr-habibur', name: 'Habibur Rahman', email: 'habibur@amarbazar.com.bd', phone: '01755556666', role: 'seller' as Role, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', isFollowed: true },
  { id: 'usr-friendzone', name: 'FRIEND 🪓 ZONE', email: 'friendzone@amarbazar.com.bd', phone: '01766667777', role: 'seller' as Role, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', isFollowed: true },
  { id: 'usr-arman', name: 'Mohammad Arman', email: 'arman@amarbazar.com.bd', phone: '01777778888', role: 'seller' as Role, avatar: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&w=200&q=80', isFollowed: true },
  { id: 'usr-hussain', name: 'Hussain Ahmed', email: 'hussain@amarbazar.com.bd', phone: '01788889999', role: 'seller' as Role, avatar: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=200&q=80', isFollowed: true },
  { id: 'usr-ayon', name: 'Ayon Ayon', email: 'ayon@amarbazar.com.bd', phone: '01799990000', role: 'seller' as Role, avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=200&q=80', isFollowed: true },

  { id: 'usr-sysadmin-1', name: 'System Admin (Ultimate)', email: 'systemadmin@amarbazar.com.bd', phone: '01900000000', role: 'system_admin' as Role, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80' },
  { id: 'usr-manager-1', name: 'Manager (Restricted)', email: 'manager@amarbazar.com.bd', phone: '01600000000', role: 'manager' as Role, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }
];

const DEFAULT_GLOBAL_MESSAGES: Thread[] = [
  {
    threadId: 'chat-rahim-admin',
    participant1Id: 'usr-demo-cust', // Rahim
    participant2Id: 'usr-admin-1',  // Admin
    subject: 'Report Seller & Security Inquiry',
    status: 'active',
    messages: [
      { id: 'm1', senderId: 'usr-demo-cust', senderName: 'Rahim Chowdhury', senderRole: 'customer', text: 'আসসালামু আলাইকুম এডমিন ভাইয়া, এখানে কোনো বিক্রেতা যদি প্রতারণা বা অনিয়ম করে, তবে সরাসরি রিপোর্ট করার কোনো সুযোগ আছে কি?', time: '11:30 AM', status: 'read' },
      { id: 'm2', senderId: 'usr-admin-1', senderName: 'Super Admin BD', senderRole: 'admin', text: 'ওয়ালাইকুম আসসালাম। অবশ্যই! ক্রেতা সুরক্ষায় আমারবাজার সবসময় পাশে আছে। যেকোনো বিক্রেতা প্রতারণা করলে সরাসরি এই চ্যাটে আমাদের মেসেজ দিয়ে অর্ডার নম্বরসহ রিপোর্ট করুন। আমরা দ্রুত ব্যবস্থা নেব।', time: '11:32 AM', status: 'read' },
      { id: 'm3', senderId: 'usr-demo-cust', senderName: 'Rahim Chowdhury', senderRole: 'customer', text: 'ধন্যবাদ। আর যদি ঢাকার বাইরে ডেলিভারি নেই, তাহলে প্যানেল ভেঙে যাওয়ার কোনো ঝুঁকি থাকবে কি?', time: '11:33 AM', status: 'read' }
    ]
  },
  {
    threadId: 'chat-rahim-ahnaf',
    participant1Id: 'usr-demo-cust',
    participant2Id: 'usr-ahnaf',
    subject: 'Order Follow-up',
    status: 'active',
    messages: [
      { id: 'mah1', senderId: 'usr-ahnaf', senderName: 'Ahnaf Sheikh', senderRole: 'seller', text: 'ভাইয়া, আপনার ওয়াচটি আমরা কুরিয়ারে বুক করে দিয়েছি। রিসিটটি এখানে পাঠিয়ে দিচ্ছি।', time: '11:10 AM', status: 'read' },
      { id: 'mah2', senderId: 'usr-demo-cust', senderName: 'Rahim Chowdhury', senderRole: 'customer', text: 'You sent an attachment.', time: '11:27 AM', isImage: true, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', status: 'read' }
    ]
  },
  {
    threadId: 'chat-rahim-ismail',
    participant1Id: 'usr-demo-cust',
    participant2Id: 'usr-ismail',
    subject: 'Sim & ID Update Inquiry',
    status: 'active',
    messages: [
      { id: 'mis_0', senderId: 'usr-ismail', senderName: 'S M Ismail Hossin', senderRole: 'seller', text: 'আপনার শরীর সুস্থ আছে', time: '5:10 PM', status: 'read' },
      { id: 'mis_1', senderId: 'usr-demo-cust', senderName: 'Rahim Chowdhury', senderRole: 'customer', text: 'আলহামদুলিল্লাহ খুব ভালো', time: '5:11 PM', replyToText: 'আপনার শরীর সুস্থ আছে', replyToSenderName: 'S M Ismail Hossin', status: 'read' },
      { id: 'mis_2', senderId: 'usr-ismail', senderName: 'S M Ismail Hossin', senderRole: 'seller', text: 'আমার আগের ফেসবুক আইডি সহ সিম সব নষ্ট হয়ে গেছে', time: '5:12 PM', status: 'read' },
      { id: 'mis_3', senderId: 'usr-ismail', senderName: 'S M Ismail Hossin', senderRole: 'seller', text: 'পরে এটা খুলেছি', time: '5:12 PM', status: 'read' },
      { id: 'mis_4', senderId: 'usr-ismail', senderName: 'S M Ismail Hossin', senderRole: 'seller', text: 'Voice note attachment', time: '5:13 PM', isAudio: true, audioDuration: '0:06', status: 'read' },
      { id: 'mis_5', senderId: 'usr-ismail', senderName: 'S M Ismail Hossin', senderRole: 'seller', text: '01988177989', time: '5:14 PM', status: 'read' },
      { id: 'mis_6', senderId: 'usr-ismail', senderName: 'S M Ismail Hossin', senderRole: 'seller', text: 'এই নম্বরে ইমু খোলা', time: '5:14 PM', status: 'read' },
      { id: 'mis_7', senderId: 'usr-demo-cust', senderName: 'Rahim Chowdhury', senderRole: 'customer', text: 'Ok', time: '5:15 PM', status: 'read' },
      { id: 'mis_8', senderId: 'usr-ismail', senderName: 'S M Ismail Hossin', senderRole: 'seller', text: 'আপনি একটু নক দিয়েন', time: '5:16 PM', status: 'read' },
      { id: 'mis_9', senderId: 'usr-ismail', senderName: 'S M Ismail Hossin', senderRole: 'seller', text: 'আগের সিম বাদ হয়ে গেছে তো এজন্য এটা নতুন কিনছি', time: '5:16 PM', status: 'read' }
    ]
  },
  {
    threadId: 'chat-rahim-chayon',
    participant1Id: 'usr-demo-cust',
    participant2Id: 'usr-chayon',
    subject: 'Follow-up discussion',
    status: 'active',
    messages: [
      { id: 'mch1', senderId: 'usr-chayon', senderName: 'Chayon Chayon', senderRole: 'seller', text: 'আছেন ভাই?', time: '5 Aug', status: 'read' },
      { id: 'mch2', senderId: 'usr-demo-cust', senderName: 'Rahim Chowdhury', senderRole: 'customer', text: 'Hi · Follow up?', time: '5 Aug', status: 'read' }
    ]
  },
  {
    threadId: 'chat-rahim-aziz',
    participant1Id: 'usr-demo-cust',
    participant2Id: 'usr-aziz',
    subject: 'Unread Notification',
    status: 'active',
    messages: [
      { id: 'maz1', senderId: 'usr-aziz', senderName: 'MD Habibullah Aziz', senderRole: 'seller', text: 'Standard listing update has been successfully pushed.', time: '3 Aug', status: 'delivered' },
      { id: 'maz2', senderId: 'usr-aziz', senderName: 'MD Habibullah Aziz', senderRole: 'seller', text: '2 new messages', time: '3 Aug', status: 'delivered' }
    ]
  },
  {
    threadId: 'chat-rahim-habibur',
    participant1Id: 'usr-demo-cust',
    participant2Id: 'usr-habibur',
    subject: 'Attachment delivery',
    status: 'active',
    messages: [
      { id: 'mhb1', senderId: 'usr-habibur', senderName: 'Habibur Rahman', senderRole: 'seller', text: 'আপনার ঠিকানার ম্যাপটি পাঠান ভাইয়া।', time: '1 Aug', status: 'read' },
      { id: 'mhb2', senderId: 'usr-demo-cust', senderName: 'Rahim Chowdhury', senderRole: 'customer', text: 'You sent an attachment.', time: '1 Aug', isImage: true, imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80', status: 'read' }
    ]
  },
  {
    threadId: 'chat-rahim-friendzone',
    participant1Id: 'usr-demo-cust',
    participant2Id: 'usr-friendzone',
    subject: 'Group Alerts',
    status: 'active',
    messages: [
      { id: 'mfz1', senderId: 'usr-friendzone', senderName: 'FRIEND 🪓 ZONE', senderRole: 'seller', text: '25 new messages', time: '1 Aug', status: 'delivered' }
    ]
  },
  {
    threadId: 'chat-rahim-arman',
    participant1Id: 'usr-demo-cust',
    participant2Id: 'usr-arman',
    subject: 'Voice memo feedback',
    status: 'active',
    messages: [
      { id: 'mar1', senderId: 'usr-arman', senderName: 'Mohammad Arman', senderRole: 'seller', text: 'ডিজাইন কেমন হয়েছে জানাবেন।', time: '23 Jul', status: 'read' },
      { id: 'mar2', senderId: 'usr-demo-cust', senderName: 'Rahim Chowdhury', senderRole: 'customer', text: 'You sent a voice message.', time: '23 Jul', status: 'read' }
    ]
  },
  {
    threadId: 'chat-rahim-hussain',
    participant1Id: 'usr-demo-cust',
    participant2Id: 'usr-hussain',
    subject: 'Delivery note',
    status: 'active',
    messages: [
      { id: 'mhs1', senderId: 'usr-hussain', senderName: 'Hussain Ahmed', senderRole: 'seller', text: 'Hussain sent an attachment.', time: '20 Jul', status: 'read' }
    ]
  },
  {
    threadId: 'chat-rahim-ayon',
    participant1Id: 'usr-demo-cust',
    participant2Id: 'usr-ayon',
    subject: 'Casual convo',
    status: 'active',
    messages: [
      { id: 'may1', senderId: 'usr-ayon', senderName: 'Ayon Ayon', senderRole: 'seller', text: 'Ki obosta valo acis ra', time: '20 Jul', status: 'read' }
    ]
  },
  {
    threadId: 'chat-kamal-admin',
    participant1Id: 'usr-demo-cust-2', // Kamal
    participant2Id: 'usr-admin-1',  // Admin
    subject: 'bKash Payment clarification',
    status: 'active',
    messages: [
      { id: 'm4', senderId: 'usr-demo-cust-2', senderName: 'Kamal Hossain', senderRole: 'customer', text: 'Hello, I made a payment of ৳6,990 via bKash but did not receive the OTP. Is my order BD-2026-8912 confirmed?', time: '10:15 AM', status: 'read' },
      { id: 'm5', senderId: 'usr-admin-1', senderName: 'Super Admin BD', senderRole: 'admin', text: 'Hi Kamal, yes! We verified your bKash Transaction ID. Your order has been marked as PAID and confirmed.', time: '10:20 AM', status: 'read' },
      { id: 'm6', senderId: 'usr-demo-cust-2', senderName: 'Kamal Hossain', senderRole: 'customer', text: 'Awesome, thank you for the speedy response!', time: '10:22 AM', status: 'read' }
    ]
  },
  {
    threadId: 'chat-jahanara-admin',
    participant1Id: 'usr-demo-cust-3', // Jahanara
    participant2Id: 'usr-admin-1',  // Admin
    subject: 'Jamdani Saree care instructions',
    status: 'resolved',
    messages: [
      { id: 'm7', senderId: 'usr-demo-cust-3', senderName: 'Jahanara Begum', senderRole: 'customer', text: 'জামদানি শাড়িটি কি ঘরে ধুয়ে ফেলা যাবে নাকি ড্রাই ওয়াশ করতে হবে?', time: 'Yesterday', status: 'read' },
      { id: 'm8', senderId: 'usr-admin-1', senderName: 'Super Admin BD', senderRole: 'admin', text: 'সম্মানিত গ্রাহক, জামদানি শাড়ির ঐতিহ্য এবং সূক্ষ্ম সুতার কাজ ধরে রাখার জন্য ড্রাই ওয়াশ (dry clean) করার জন্য বিশেষভাবে সাজেস্ট করা হলো।', time: 'Yesterday', status: 'read' },
      { id: 'm9', senderId: 'usr-demo-cust-3', senderName: 'Jahanara Begum', senderRole: 'customer', text: 'বুঝতে পেরেছি। ধন্যবাদ আপনাদের সুন্দর সার্ভিসের জন্য।', time: 'Yesterday', status: 'read' }
    ]
  },
  {
    threadId: 'chat-tanvir-admin',
    participant1Id: 'usr-seller-1', // Tanvir
    participant2Id: 'usr-admin-1',  // Admin
    subject: 'SaaS Store Domain Integration',
    status: 'active',
    messages: [
      { id: 'm10', senderId: 'usr-seller-1', senderName: 'Tanvir Hossain', senderRole: 'seller', text: 'Hello Admin, can we link our custom Domain (dhakatech.com.bd) to our store inventory workspace?', time: '09:00 AM', status: 'read' },
      { id: 'm11', senderId: 'usr-admin-1', senderName: 'Super Admin BD', senderRole: 'admin', text: 'Yes, Tanvir. Go to Store Settings -> Subscriptions, make sure you are on the Business or Enterprise tier, then you will see custom domain fields.', time: '09:15 AM', status: 'read' }
    ]
  },
  {
    threadId: 'chat-rahim-tanvir',
    participant1Id: 'usr-demo-cust', // Rahim
    participant2Id: 'usr-seller-1',  // Tanvir
    subject: 'Electronics Stock Details',
    status: 'active',
    messages: [
      { id: 'm12', senderId: 'usr-demo-cust', senderName: 'Rahim Chowdhury', senderRole: 'customer', text: 'Tanvir, do you have the 55-inch smart TV model in stock right now?', time: '08:00 AM', status: 'read' },
      { id: 'm13', senderId: 'usr-seller-1', senderName: 'Tanvir Hossain (Dhaka Tech)', senderRole: 'seller', text: 'Yes Rahim, we have 5 pieces left in our Dhanmondi outlet. You can order with cash-on-delivery!', time: '08:30 AM', status: 'read' }
    ]
  }
];

export const CustomerMessagesPanel: React.FC = () => {
  const { currentUser, setCurrentUser, language, setIsMobileChatActive } = useApp();

  // If no user logged in, default to Customer for quick testing
  const activeUser = currentUser || ALL_SYSTEM_USERS[2]; // Fallback to Rahim Chowdhury

  // Messages State
  const [globalMessages, setGlobalMessages] = useState<Thread[]>(() => {
    const saved = localStorage.getItem('amarbazar_messenger_threads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_GLOBAL_MESSAGES;
      }
    }
    return DEFAULT_GLOBAL_MESSAGES;
  });

  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [showExtraOptionsOnMobile, setShowExtraOptionsOnMobile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(true);
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'seller' | 'admin'>('all');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  useEffect(() => {
    setIsMobileChatActive(mobileView === 'chat');
    return () => {
      setIsMobileChatActive(false);
    };
  }, [mobileView, setIsMobileChatActive]);
  
  // Audio/Video Calling Mock State
  const [activeCall, setActiveCall] = useState<{
    isOpen: boolean;
    userName: string;
    avatar?: string;
    type: 'audio' | 'video';
    status: 'ringing' | 'connected' | 'ended';
  } | null>(null);

  // --- REAL-TIME INTERACTIVE CHAT UTILITIES & MEDIA STAGES ---
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<any>(null);

  // Hidden Inputs refs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const micFileInputRef = useRef<HTMLInputElement>(null);

  // Audio Playback states
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [playingAudioInstance, setPlayingAudioInstance] = useState<HTMLAudioElement | null>(null);

  // Plus menu popover
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState<boolean>(false);

  // Camera capture fallback states
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // default to 'environment' (back camera) as requested by user

  // Simulation states for sandbox environments (iframes/unsecure)
  const [isMicSimulationMode, setIsMicSimulationMode] = useState<boolean>(false);
  const [isCameraSimulationMode, setIsCameraSimulationMode] = useState<boolean>(false);
  const [cameraMockScene, setCameraMockScene] = useState<number>(0);

  const CAMERA_SCENES = [
    {
      name: 'Boutique Display',
      bnName: 'শপ ডিসপ্লে',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Smart Device Shelf',
      bnName: 'স্মার্ট প্রোডাক্ট',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Store Audio Unit',
      bnName: 'স্টোর অডিও ইউনিট',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
    }
  ];

  // Start Real-Time Voice Recording
  const startRecording = async () => {
    const hasMedia = typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
    
    if (!hasMedia) {
      console.log('Voice recording hardware unavailable. Engaging interactive voice simulation...');
      setIsRecording(true);
      setIsMicSimulationMode(true);
      setRecordingTime(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Auto-detect supported formats
      let options = {};
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          options = { mimeType: 'audio/ogg;codecs=opus' };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeToUse = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: mimeToUse });
        
        // Convert to Base64 to persist permanently in localStorage
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          sendAudioMessage(base64Audio, recordingTime || 6); // default to 6s if 0
        };

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      // Trigger recording with 250ms time-slice to ensure periodic data collection is active on mobile devices
      recorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);
      setIsMicSimulationMode(false);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.warn('Mic permission or access issue. Switching automatically to voice simulation.', err);
      // Fallback: active high-fidelity simulation so they can still test voice messages!
      setIsRecording(true);
      setIsMicSimulationMode(true);
      setRecordingTime(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  // Stop Recording and Send
  const stopRecordingAndSend = () => {
    if (isMicSimulationMode) {
      setIsRecording(false);
      setIsMicSimulationMode(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      // Generate dynamically a real, playable sound file using the browser Web Audio API synth wav generator!
      const simulatedAudioWavUrl = generateMockAudioUrl();
      sendAudioMessage(simulatedAudioWavUrl, recordingTime || 5);
      return;
    }

    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Cancel Voice Recording
  const cancelRecording = () => {
    if (isMicSimulationMode) {
      setIsRecording(false);
      setIsMicSimulationMode(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      return;
    }

    if (mediaRecorder && isRecording) {
      // Overwrite stop handler to prevent saving
      mediaRecorder.onstop = () => {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Format Recording Counter Time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Send voice note with URL
  const sendAudioMessage = (base64Audio: string, durationSecs: number) => {
    if (!activeThread) return;
    
    const formattedDuration = formatTime(durationSecs);
    const audioId = `aud-${Date.now()}`;
    const newAudioMsg: LocalMessage = {
      id: audioId,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      text: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAudio: true,
      audioDuration: formattedDuration,
      audioUrl: base64Audio,
      status: 'sent'
    };

    const updatedThreads = globalMessages.map(t => {
      if (t.threadId === activeThread.threadId) {
        return {
          ...t,
          messages: [...t.messages, newAudioMsg]
        };
      }
      return t;
    });

    setGlobalMessages(updatedThreads);
    localStorage.setItem('amarbazar_messenger_threads', JSON.stringify(updatedThreads));
    
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Audio Play/Pause control
  const handlePlayPauseAudio = (msgId: string, audioUrl?: string) => {
    if (!audioUrl) return;
    
    if (playingAudioId === msgId) {
      playingAudioInstance?.pause();
      setPlayingAudioId(null);
    } else {
      if (playingAudioInstance) {
        playingAudioInstance.pause();
      }
      const newAudio = new Audio(audioUrl);
      newAudio.play().catch(e => console.error('Audio play failed:', e));
      setPlayingAudioId(msgId);
      setPlayingAudioInstance(newAudio);
      
      newAudio.onended = () => {
        setPlayingAudioId(null);
      };
    }
  };

  // Gallery File upload click handler
  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result as string;
      handleSendMessage(base64Image, true);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset value
  };

  // Real-Time Camera captures
  const startCamera = async () => {
    setIsCameraModalOpen(true);
    const hasMedia = typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
    
    if (!hasMedia) {
      console.log('Webcam not supported in sandboxed environment. Activating camera simulation...');
      setIsCameraSimulationMode(true);
      return;
    }

    try {
      // By default facingMode is 'environment' (back camera), so it loads back camera first!
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
      setCameraStream(stream);
      setIsCameraSimulationMode(false);
      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      }, 150);
    } catch (err) {
      console.error('Camera access failed, falling back to simulated view:', err);
      setIsCameraSimulationMode(true);
    }
  };

  const toggleFacingMode = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }

    if (isCameraSimulationMode) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: nextMode } });
      setCameraStream(stream);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to toggle camera facing mode:', err);
    }
  };

  const capturePhoto = () => {
    if (isCameraSimulationMode) {
      const selectedSceneUrl = CAMERA_SCENES[cameraMockScene].url;
      handleSendMessage(selectedSceneUrl, true);
      stopCamera();
      return;
    }

    if (cameraVideoRef.current && cameraStream) {
      const video = cameraVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Translate context if we are in front camera mode to prevent mirror image text
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        handleSendMessage(dataUrl, true);
      }
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraModalOpen(false);
    setIsCameraSimulationMode(false);
  };

  // Document picker select
  const handleDocumentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const fileLabel = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      handleSendMessage(fileLabel);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Direct Audio File upload select (allowing actual user voice notes fallback)
  const handleMicFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const audioUrl = URL.createObjectURL(file);
    const audioTest = new Audio(audioUrl);
    
    audioTest.addEventListener('loadedmetadata', () => {
      const durationSeconds = Math.round(audioTest.duration) || 5;
      const reader = new FileReader();
      reader.onload = () => {
        const base64Audio = reader.result as string;
        sendAudioMessage(base64Audio, durationSeconds);
      };
      reader.readAsDataURL(file);
    });
    
    // Quick fallback if audio metadata reading takes more than 1 second
    setTimeout(() => {
      if (!audioTest.duration || isNaN(audioTest.duration)) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Audio = reader.result as string;
          sendAudioMessage(base64Audio, 5);
        };
        reader.readAsDataURL(file);
      }
    }, 1000);

    e.target.value = '';
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load appropriate active thread on user/thread changes
  useEffect(() => {
    // Find threads involving current user
    const userThreads = globalMessages.filter(t => t.participant1Id === activeUser.id || t.participant2Id === activeUser.id);
    if (userThreads.length > 0) {
      // If current activeThreadId is still valid, keep it, otherwise set to the first valid one
      const isValid = userThreads.some(t => t.threadId === activeThreadId);
      if (!isValid) {
        setActiveThreadId(userThreads[0].threadId);
      }
    } else {
      // Auto-create a support thread for a new user
      if (activeUser.id !== 'usr-admin-1') {
        const newId = `chat-welcome-${activeUser.id}`;
        const newTh: Thread = {
          threadId: newId,
          participant1Id: activeUser.id,
          participant2Id: 'usr-admin-1',
          subject: 'Support & Onboarding',
          status: 'active',
          messages: [
            {
              id: `msg-welcome-${Date.now()}`,
              senderId: 'usr-admin-1',
              senderName: 'Super Admin BD',
              senderRole: 'admin',
              text: `Welcome to AmarBazar, ${activeUser.name}! Tell us how we can help you today.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'read'
            }
          ]
        };
        const updated = [...globalMessages, newTh];
        setGlobalMessages(updated);
        localStorage.setItem('amarbazar_messenger_threads', JSON.stringify(updated));
        setActiveThreadId(newId);
      }
    }
  }, [activeUser.id, globalMessages.length]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(timer);
  }, [activeThreadId, isTyping, globalMessages, isInputFocused, mobileView]);

  // Helper to determine the other participant in the thread
  const getThreadContact = (thread: Thread) => {
    if (!thread) return ALL_SYSTEM_USERS[0];
    const contactId = thread.participant1Id === activeUser.id ? thread.participant2Id : thread.participant1Id;
    return ALL_SYSTEM_USERS.find(u => u.id === contactId) || {
      id: contactId,
      name: 'External User',
      email: 'user@external.com',
      phone: '01XXXXXXXXX',
      role: 'customer' as Role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    };
  };

  // Filter threads for active user
  const allMyThreads = globalMessages.filter(t => t.participant1Id === activeUser.id || t.participant2Id === activeUser.id);

  // Apply role filter
  const myThreads = allMyThreads.filter(t => {
    if (roleFilter === 'all') return true;
    const contact = getThreadContact(t);
    if (roleFilter === 'admin') {
      return contact.role === 'admin' || contact.role === 'system_admin';
    }
    return contact.role === roleFilter;
  });

  // Sort threads: Always place Admin at the absolute top of the list so they can easily report sellers
  const sortedMyThreads = [...myThreads].sort((a, b) => {
    const contactA = getThreadContact(a);
    const contactB = getThreadContact(b);
    const isAAdmin = contactA.id === 'usr-admin-1';
    const isBAdmin = contactB.id === 'usr-admin-1';
    if (isAAdmin && !isBAdmin) return -1;
    if (!isAAdmin && isBAdmin) return 1;
    return 0; // maintain original sorting or time-based
  });

  // Find active thread object
  const activeThread = sortedMyThreads.find(t => t.threadId === activeThreadId) || sortedMyThreads[0] || allMyThreads[0];

  const activeContact = activeThread ? getThreadContact(activeThread) : ALL_SYSTEM_USERS[0];

  // Handle Send Text Message
  const handleSendMessage = (textToSend?: string, isImg: boolean = false, isLike: boolean = false) => {
    const finalMsg = textToSend || inputText.trim();
    if (!finalMsg && !isImg && !isLike) return;

    if (!activeThread) return;

    const newMsg: LocalMessage = {
      id: `msg-${Date.now()}`,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      text: isLike ? '👍' : finalMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isImage: isImg,
      isLike: isLike,
      imageUrl: isImg ? (finalMsg || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80') : undefined,
      status: 'sent'
    };

    const updatedThreads = globalMessages.map(t => {
      if (t.threadId === activeThread.threadId) {
        return {
          ...t,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    setGlobalMessages(updatedThreads);
    localStorage.setItem('amarbazar_messenger_threads', JSON.stringify(updatedThreads));
    setInputText('');

    // Trigger double checkmark status transition
    setTimeout(() => {
      setGlobalMessages(prev => prev.map(t => {
        if (t.threadId === activeThread.threadId) {
          return {
            ...t,
            messages: t.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)
          };
        }
        return t;
      }));
    }, 600);

    // Auto-Replier Simulation with typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      let replyText = '';
      if (isLike) {
        replyText = language === 'bn' ? 'অনেক ধন্যবাদ! 😊' : 'Thanks a lot! 😊';
      } else if (isImg) {
        replyText = language === 'bn' ? 'ফাইলটি পেয়েছি, ধন্যবাদ!' : 'Received the attachment, thanks!';
      } else {
        // Contextual smart responses depending on who is replying
        const targetRole = activeContact.role;
        if (targetRole === 'admin' || targetRole === 'system_admin') {
          const replies = [
            language === 'bn' 
              ? 'ধন্যবাদ আপনার মেসেজের জন্য। আমি আপনার হেল্পডেস্ক টিকিটটি রিভিউ করছি।' 
              : 'Thank you for your message. I am currently reviewing your support ticket details.',
            language === 'bn'
              ? 'আমরা বিষয়টি ইআরপি প্যানেলে কনফার্ম করেছি। কোনো চিন্তা করবেন না।'
              : 'We have verified this transaction in the central ERP logs. Rest assured.',
            language === 'bn'
              ? 'অর্ডার ট্র্যাকিং সিস্টেম অনুযায়ী আপনার পার্সেল এখন শিপড অবস্থায় আছে।'
              : 'According to our real-time tracking integration, your package is currently dispatched.'
          ];
          replyText = replies[Math.floor(Math.random() * replies.length)];
        } else if (targetRole === 'seller') {
          const replies = [
            language === 'bn'
              ? 'প্রিয় গ্রাহক, পণ্যটি আমাদের স্টকে এভেইলেবল আছে। আপনি এখনই অর্ডার প্লেস করতে পারেন।'
              : 'Dear customer, the item is actively in stock. You can safely complete checkout.',
            language === 'bn'
              ? 'আমাদের শপটি ধানমন্ডিতে অবস্থিত। আপনি চাইলে সরাসরি আউটলেট থেকে নিতে পারেন।'
              : 'Our official outlet is situated in Dhanmondi. You can select hand pickup if you wish.',
            language === 'bn'
              ? 'আপনার বিকাশ পেমেন্ট কনফার্ম হয়েছে। আমরা আজকেই পার্সেল পাঠিয়ে দেব।'
              : 'We verified your payment. We will ship the parcel via Pathao/RedX today!'
          ];
          replyText = replies[Math.floor(Math.random() * replies.length)];
        } else {
          // Reply as Customer
          const replies = [
            language === 'bn'
              ? 'ধন্যবাদ ভাইয়া! রেসপন্স পেয়ে খুব ভালো লাগলো। আমি এখনই ট্র্যাকিং আইডিতে চেক করছি।'
              : 'Thanks! Loved the swift support. I am checking the parcel tracking ID now.',
            language === 'bn'
              ? 'জি, পণ্যটির কোয়ালিটি খুব ভালো লেগেছে। ফাইভ স্টার রিভিউ দিয়ে দিয়েছি।'
              : 'Yes, the product quality is excellent! I just left a premium five-star review.',
            language === 'bn'
              ? 'পেমেন্ট গেটওয়েতে প্রবলেম হচ্ছে, আমি কি ক্যাশ অন ডেলিভারিতে নিতে পারি?'
              : 'The bkash gateway was busy. Can I opt for Cash-On-Delivery instead?'
          ];
          replyText = replies[Math.floor(Math.random() * replies.length)];
        }
      }

      const replyMsg: LocalMessage = {
        id: `msg-rep-${Date.now()}`,
        senderId: activeContact.id,
        senderName: activeContact.name,
        senderRole: activeContact.role,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };

      setGlobalMessages(prev => {
        const updated = prev.map(t => {
          if (t.threadId === activeThread.threadId) {
            return {
              ...t,
              messages: [...t.messages, replyMsg]
            };
          }
          return t;
        });
        localStorage.setItem('amarbazar_messenger_threads', JSON.stringify(updated));
        return updated;
      });
    }, 2200);
  };

  // Switch Profiles for testing
  const handleQuickSwitch = (user: typeof ALL_SYSTEM_USERS[0]) => {
    setCurrentUser(user as any);
  };

  // Start new chat with searched user
  const handleStartNewChat = (recipient: typeof ALL_SYSTEM_USERS[0]) => {
    const existing = globalMessages.find(t => 
      (t.participant1Id === activeUser.id && t.participant2Id === recipient.id) ||
      (t.participant2Id === activeUser.id && t.participant1Id === recipient.id)
    );

    if (existing) {
      setActiveThreadId(existing.threadId);
      setSearchQuery('');
      setMobileView('chat');
      return;
    }

    const newThreadId = `chat-${Date.now()}`;
    const newThread: Thread = {
      threadId: newThreadId,
      participant1Id: activeUser.id,
      participant2Id: recipient.id,
      subject: recipient.role === 'admin' ? 'Customer Support Request' : 'Direct Messenger Chat',
      status: 'active',
      messages: [
        {
          id: `msg-init-${Date.now()}`,
          senderId: activeUser.id,
          senderName: activeUser.name,
          senderRole: activeUser.role,
          text: language === 'bn' ? `হ্যালো ${recipient.name}, আমি চ্যাট শুরু করতে চাই।` : `Hello ${recipient.name}, starting a direct conversation with you.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }
      ]
    };

    const updated = [...globalMessages, newThread];
    setGlobalMessages(updated);
    localStorage.setItem('amarbazar_messenger_threads', JSON.stringify(updated));
    setActiveThreadId(newThreadId);
    setSearchQuery('');
    setMobileView('chat');
  };

  // Mock call simulation handler
  const handleCall = (type: 'audio' | 'video') => {
    setActiveCall({
      isOpen: true,
      userName: activeContact.name,
      avatar: activeContact.avatar,
      type,
      status: 'ringing'
    });

    // ringing -> connected
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 2000);
  };

  const handleEndCall = () => {
    setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);
    setTimeout(() => {
      setActiveCall(null);
    }, 800);
  };

  // Render dynamic role indicator badges
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
      case 'system_admin':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/40 shrink-0">
            <Shield className="w-2.5 h-2.5 shrink-0" />
            <span>{language === 'bn' ? 'এডমিন' : 'Admin'}</span>
          </span>
        );
      case 'seller':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40 shrink-0">
            <Store className="w-2.5 h-2.5 shrink-0" />
            <span>{language === 'bn' ? 'বিক্রেতা' : 'Seller'}</span>
          </span>
        );
      case 'customer':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40 shrink-0">
            <User className="w-2.5 h-2.5 shrink-0" />
            <span>{language === 'bn' ? 'গ্রাহক' : 'Customer'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800/40 shrink-0">
            <span>{language === 'bn' ? 'স্টাফ' : 'Staff'}</span>
          </span>
        );
    }
  };

  // Filter contacts based on search query
  const filteredUsers = ALL_SYSTEM_USERS.filter(u => 
    u.id !== activeUser.id && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div id="messages-messenger-panel" className="max-w-7xl mx-auto h-full flex-1 min-h-0 relative flex flex-col w-full">
      
      {/* 2. CORE MESSENGER ENGINE CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border-0 lg:border border-slate-200 dark:border-slate-800 rounded-none lg:rounded-3xl shadow-none lg:shadow-md overflow-hidden bg-white dark:bg-slate-950 lg:h-[680px] h-full flex-1 min-h-0 relative">
        
        {/* SIDEBAR LIST (Takes 1 Column) */}
        <div className={`lg:col-span-1 lg:border-r border-slate-200/80 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/10 ${mobileView === 'list' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                </div>
                <h2 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                  {language === 'bn' ? 'মেসেজেস' : 'Chats'}
                </h2>
              </div>
              <div className="flex items-center space-x-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                  {activeUser.role.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Messenger Styled Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'চ্যাট অথবা ইউজার খুঁজুন...' : 'Search chats or users...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-2xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-white"
              />
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 text-[9px] font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {language === 'bn' ? 'সব' : 'All'}
              </button>
              <button
                onClick={() => setRoleFilter('customer')}
                className={`px-2.5 py-1 text-[9px] font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                  roleFilter === 'customer'
                    ? 'bg-blue-500 text-white font-black'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {language === 'bn' ? 'কাস্টমার' : 'Customers'}
              </button>
              <button
                onClick={() => setRoleFilter('seller')}
                className={`px-2.5 py-1 text-[9px] font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                  roleFilter === 'seller'
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {language === 'bn' ? 'সেলার' : 'Sellers'}
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-2.5 py-1 text-[9px] font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                  roleFilter === 'admin'
                    ? 'bg-violet-600 text-white font-black'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {language === 'bn' ? 'এডমিন' : 'Admins'}
              </button>
            </div>
          </div>

          {/* Threads / Users list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
            {searchQuery ? (
              // Search Mode: List Users
              <div className="p-2 space-y-1">
                <span className="text-[9px] font-black text-slate-400 px-2 uppercase block mb-1">
                  {language === 'bn' ? 'নতুন চ্যাট শুরু করুন' : 'Start a New Chat'}
                </span>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleStartNewChat(user)}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl cursor-pointer hover:bg-amber-500/5 dark:hover:bg-amber-500/5 transition flex items-center space-x-3"
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover referrer-policy"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{user.name}</h4>
                        </div>
                        <div className="mt-0.5">{renderRoleBadge(user.role)}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 italic text-center py-4">No matching users found</p>
                )}
              </div>
            ) : (
              // Standard Mode: List existing threads
              sortedMyThreads.map(t => {
                const contact = getThreadContact(t);
                const lastMsg = t.messages[t.messages.length - 1];
                const isSelected = t.threadId === activeThreadId;
                const lastMsgText = lastMsg ? (lastMsg.isLike ? '👍 Like' : lastMsg.isImage ? '📸 Image Attachment' : lastMsg.text) : '';
                
                return (
                  <div
                    key={t.threadId}
                    onClick={() => {
                      setActiveThreadId(t.threadId);
                      setMobileView('chat');
                    }}
                    className={`p-3.5 cursor-pointer transition flex items-start space-x-3 border-l-4 ${
                      isSelected 
                        ? 'bg-amber-500/10 dark:bg-amber-500/5 border-amber-500' 
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={contact.avatar} 
                        alt={contact.name} 
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-800 referrer-policy"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate leading-tight">
                          {contact.name}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-bold shrink-0">{lastMsg?.time || ''}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 min-w-0 flex-1 mr-1">
                          {lastMsg && (
                            <span className={`text-[8px] px-1 py-0.2 rounded-sm shrink-0 font-black uppercase tracking-wider ${
                              lastMsg.senderId === activeUser.id
                                ? 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                                : lastMsg.senderRole === 'admin' || lastMsg.senderRole === 'system_admin'
                                ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                                : lastMsg.senderRole === 'seller'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}>
                              {lastMsg.senderId === activeUser.id 
                                ? (language === 'bn' ? 'আপনি' : 'You')
                                : lastMsg.senderRole === 'admin' || lastMsg.senderRole === 'system_admin'
                                ? (language === 'bn' ? 'এডমিন' : 'Admin')
                                : lastMsg.senderRole === 'seller'
                                ? (language === 'bn' ? 'সেলার' : 'Seller')
                                : (language === 'bn' ? 'গ্রাহক' : 'Customer')}
                            </span>
                          )}
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-normal font-medium flex-1">
                            {lastMsgText}
                          </p>
                        </div>
                        {renderRoleBadge(contact.role)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT DISPLAY WINDOW & CONVERSATION FRAME (Spans 2 Columns) */}
        <div className={`flex flex-col h-full min-h-0 bg-white dark:bg-slate-950 ${isInfoOpen ? 'lg:col-span-2' : 'lg:col-span-3'} ${mobileView === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-white dark:bg-slate-950 shrink-0 z-10">
                <div className="flex items-center space-x-2.5">
                  {/* Mobile Back Button - Facebook Messenger Blue arrow style */}
                  <button 
                    onClick={() => setMobileView('list')}
                    className="lg:hidden p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition text-[#0084FF] cursor-pointer shrink-0"
                    title={language === 'bn' ? 'ফিরে যান' : 'Back'}
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <div className="relative">
                    <img 
                      src={activeContact.avatar} 
                      alt={activeContact.name} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 referrer-policy"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                        {activeContact.name}
                      </h3>
                      {renderRoleBadge(activeContact.role)}
                    </div>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                      {activeContact.id === 'usr-ismail' 
                        ? (language === 'bn' ? '৯ ঘণ্টা আগে সক্রিয়' : 'Active 9 hours ago') 
                        : (language === 'bn' ? 'এখন সক্রিয়' : 'Active now')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleCall('audio')}
                    className="p-2 text-[#0084FF] hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition cursor-pointer"
                    title={language === 'bn' ? 'অডিও কল' : 'Audio Call'}
                  >
                    <Phone className="w-5 h-5 fill-none stroke-[2]" />
                  </button>
                  <button 
                    onClick={() => handleCall('video')}
                    className="p-2 text-[#0084FF] hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition cursor-pointer"
                    title={language === 'bn' ? 'ভিডিও কল' : 'Video Call'}
                  >
                    <Video className="w-5 h-5 fill-none stroke-[2]" />
                  </button>
                  <button 
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className={`p-2 rounded-full transition cursor-pointer ${isInfoOpen ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0084FF]' : 'text-[#0084FF] hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                    title={language === 'bn' ? 'তথ্য প্যানেল' : 'Details Panel'}
                  >
                    <Info className="w-5 h-5 fill-none stroke-[2]" />
                  </button>
                </div>
              </div>

              {/* Message Streams / Bubbles area */}
              <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth p-4 space-y-4 bg-slate-50/25 dark:bg-slate-900/5" style={{ WebkitOverflowScrolling: 'touch' }}>
                
                {/* Topic Header card inside stream */}
                <div className="flex justify-center my-2">
                  <div className="bg-slate-100/70 dark:bg-slate-800/80 px-4 py-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-center max-w-sm">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                      {language === 'bn' ? 'বার্তালাপের বিষয়' : 'Conversation Subject'}
                    </span>
                    <p className="text-[10.5px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                      {activeThread.subject || 'Direct Messenger Inquiry'}
                    </p>
                  </div>
                </div>

                {activeThread.messages.map((msg, index) => {
                  const isMe = msg.senderId === activeUser.id;
                  const showAvatar = index === 0 || activeThread.messages[index - 1]?.senderId !== msg.senderId;

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      {/* Nested Reply context shown above message if applicable */}
                      {msg.replyToText && (
                        <div className="flex flex-col items-end w-full mb-1">
                          <div className="flex items-center space-x-1 text-[11px] text-slate-400 dark:text-slate-500 mr-2 mb-0.5">
                            <svg className="w-3.5 h-3.5 transform -scale-x-100 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <span className="font-semibold text-[10.5px]">
                              {language === 'bn' ? 'আপনি উত্তর দিয়েছেন' : 'You replied to'} {msg.replyToSenderName || 'S M Ismail'}
                            </span>
                          </div>
                          <div className="bg-[#E4E6EB]/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs px-3.5 py-2 rounded-[18px] opacity-90 max-w-[75%] mr-2">
                            {msg.replyToText}
                          </div>
                        </div>
                      )}

                      <div className={`flex items-end gap-2 w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {/* Avatar for received messages */}
                        {!isMe && (
                          <div className="w-8 h-8 shrink-0">
                            {showAvatar ? (
                              <img 
                                src={activeContact.avatar} 
                                alt={activeContact.name} 
                                className="w-8 h-8 rounded-full object-cover referrer-policy border border-slate-100 dark:border-slate-800"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-8" />
                            )}
                          </div>
                        )}

                        <div className="max-w-[75%] relative">
                          {/* Name/Role label under avatar for first message in group */}
                          {showAvatar && !isMe && (
                            <div className="flex items-center space-x-1.5 ml-1 mb-1">
                              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">
                                {msg.senderName}
                              </span>
                              {renderRoleBadge(msg.senderRole)}
                            </div>
                          )}

                          {/* Rendering Like (👍) */}
                          {msg.isLike ? (
                            <div className="text-4xl animate-bounce py-1">👍</div>
                          ) : msg.isImage ? (
                            // Rendering Image Message
                            <div className="rounded-[18px] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs bg-white dark:bg-slate-900">
                              <img 
                                src={msg.imageUrl} 
                                alt="Attachment" 
                                className="max-w-xs max-h-48 object-cover referrer-policy"
                                referrerPolicy="no-referrer"
                              />
                              <div className="p-2 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-400 font-bold flex justify-between">
                                <span>{language === 'bn' ? 'সংযুক্ত ছবি' : 'Image Attachment'}</span>
                                <span>{msg.time}</span>
                              </div>
                            </div>
                          ) : msg.isFile ? (
                            // 📄 Document / PDF Card attachment like Messenger
                            <div className="flex items-center gap-2">
                              <div className="bg-[#F0F2F5] dark:bg-slate-800/90 text-black dark:text-white rounded-[18px] p-3 flex items-center space-x-3 shadow-xs border border-slate-200/40 dark:border-slate-700/50 max-w-xs">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 animate-pulse">
                                  <FileText className="w-6 h-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-black truncate text-slate-800 dark:text-slate-100">{msg.fileName}</div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-450 font-bold">{msg.fileSize || 'Unknown Size'}</div>
                                </div>
                                <a 
                                  href={msg.fileUrl} 
                                  download={msg.fileName}
                                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition shrink-0 cursor-pointer"
                                  title="Download File"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          ) : msg.isAudio ? (
                            // 🎙️ Facebook Messenger Beautiful Voice Message Waveform Player!
                            <div className="flex items-center gap-2">
                              <div className="bg-[#F0F2F5] dark:bg-slate-800/90 text-black dark:text-white rounded-[20px] px-3.5 py-3 flex items-center space-x-2.5 shadow-xs border border-slate-200/20 dark:border-slate-700/30">
                                {/* Play/Pause button */}
                                <button 
                                  onClick={() => handlePlayPauseAudio(msg.id, msg.audioUrl)}
                                  className="w-8 h-8 rounded-full bg-[#0084FF] text-white flex items-center justify-center cursor-pointer hover:bg-blue-600 transition shadow-sm shrink-0"
                                >
                                  {playingAudioId === msg.id ? (
                                    <svg className="w-4 h-4 fill-white text-white" viewBox="0 0 24 24">
                                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 fill-white text-white pl-0.5" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  )}
                                </button>
                                {/* Waveform bars of varying heights exactly like the screenshot */}
                                <div className="flex items-end space-x-[2px] h-7 px-1 items-center">
                                  {[6, 12, 18, 24, 10, 26, 16, 22, 12, 18, 8, 14, 6, 12, 4].map((height, i) => (
                                    <span 
                                      key={i} 
                                      style={{ height: `${height}px` }} 
                                      className={`w-[2.5px] rounded-full transition-all ${
                                        playingAudioId === msg.id 
                                          ? 'bg-blue-500 scale-y-110 animate-pulse' 
                                          : 'bg-slate-800 dark:bg-slate-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {/* Duration */}
                                <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                                  {msg.audioDuration || '0:06'}
                                </span>
                              </div>
                              {/* Small mic button outside the bubble exactly like the screenshot */}
                              <button className="w-8 h-8 rounded-full bg-[#F0F2F5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">
                                <Mic className="w-4 h-4 text-blue-500" />
                              </button>
                            </div>
                          ) : msg.text === '01988177989' ? (
                            // 📞 Specific Link / Phone number bubble with Share arrow
                            <div className="flex items-center gap-2">
                              <div className="bg-[#F0F2F5] dark:bg-slate-800/90 text-[#0084FF] rounded-[18px] px-4 py-2.5 text-[13px] font-medium border-b border-blue-200/50 dark:border-blue-900/50 underline cursor-pointer">
                                {msg.text}
                              </div>
                              {/* Share curved arrow button */}
                              <button className="w-8 h-8 rounded-full bg-[#F0F2F5] dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">
                                <svg className="w-4 h-4 transform -scale-x-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            // Standard Text Message Bubble - Facebook Messenger Style
                            <div className={`rounded-[18px] px-4 py-2.5 text-[13px] leading-snug shadow-3xs ${
                              isMe
                                ? 'bg-[#0084FF] text-white font-normal'
                                : 'bg-[#F0F2F5] dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-0'
                            }`}>
                              <p>{msg.text}</p>
                              
                              {/* Hover timestamp or clean indicator (less intrusive than a massive box) */}
                              <div className="flex justify-between items-center mt-1 gap-1 text-[9px] opacity-60">
                                <span>{msg.time}</span>
                              </div>

                              {/* Floating Heart reaction ❤️ for matching message 'আলহামদুলিল্লাহ খুব ভালো' */}
                              {msg.id === 'mis_1' && (
                                <div className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-sm select-none">
                                  <span className="text-[10px]">❤️</span>
                                </div>
                              )}
                              
                              {/* Floating smile reaction for 'আগের সিম বাদ হয়ে গেছে...' */}
                              {msg.id === 'mis_9' && (
                                <div className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-sm select-none">
                                  <span className="text-[10px]">😆</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Small read receipt avatar icon at bottom-right corner of self message group */}
                      {isMe && msg.id === 'mis_1' && (
                        <div className="flex justify-end w-full mr-1 mt-0.5 select-none">
                          <img 
                            src={activeContact.avatar} 
                            alt="Read Receipt" 
                            className="w-3.5 h-3.5 rounded-full object-cover border border-white dark:border-slate-950 shadow-xs"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Or tiny read-receipt at the absolute last message if it's from me */}
                      {isMe && index === activeThread.messages.length - 1 && (
                        <div className="flex justify-end w-full mr-1 mt-0.5 select-none">
                          <img 
                            src={activeContact.avatar} 
                            alt="Read Receipt" 
                            className="w-3.5 h-3.5 rounded-full object-cover border border-white dark:border-slate-950 shadow-xs"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start items-center space-x-2">
                    <img 
                      src={activeContact.avatar} 
                      alt={activeContact.name} 
                      className="w-7 h-7 rounded-full object-cover referrer-policy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="bg-slate-100 dark:bg-slate-850 text-slate-400 text-[10px] rounded-2xl px-4 py-2.5 flex items-center space-x-1.5 border border-slate-200/50 dark:border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200"></span>
                      <span className="pl-1 font-bold text-slate-500">{activeContact.name} {language === 'bn' ? 'টাইপ করছেন...' : 'is typing...'}</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom message composition tool */}
              <div className="p-2.5 sm:p-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center space-x-1 sm:space-x-2 bg-white dark:bg-slate-950 shrink-0 w-full relative z-30">
                
                {/* 📍 Hidden File & Camera Input Handlers */}
                <input 
                  type="file" 
                  ref={galleryInputRef} 
                  accept="image/*" 
                  onChange={handleGalleryFileSelect} 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={cameraInputRef} 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleGalleryFileSelect} 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  id="document-file-picker" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
                  onChange={handleDocumentFileSelect} 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={micFileInputRef} 
                  accept="audio/*" 
                  onChange={handleMicFileSelect} 
                  className="hidden" 
                />

                {/* 📍 Real-Time Messenger Plus Action Menu overlay */}
                {isPlusMenuOpen && (
                  <div className="absolute bottom-16 left-4 z-40 bg-white dark:bg-slate-900 border border-slate-200/20 dark:border-slate-800 rounded-2xl shadow-xl p-3 w-64 animate-fade-in flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {language === 'bn' ? 'ইউটিলিটি ও অ্যাকশন' : 'Utilities & Actions'}
                      </span>
                      <button type="button" onClick={() => setIsPlusMenuOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    {/* Share Real Geolocation */}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            const lat = pos.coords.latitude;
                            const lon = pos.coords.longitude;
                            const mapUrl = `https://www.google.com/maps?q=${lat},${lon}`;
                            handleSendMessage(`${language === 'bn' ? '📍 আমার বর্তমান লাইভ লোকেশন:' : '📍 My Current Live Location:'} ${mapUrl}`);
                          }, (err) => {
                            handleSendMessage(language === 'bn' ? '📍 আমার লাইভ লোকেশন শেয়ার করতে চাচ্ছি কিন্তু ব্রাউজার পারমিশন প্রয়োজন।' : '📍 I want to share my live location but browser permission is required.');
                          });
                        } else {
                          alert('Geolocation not supported');
                        }
                      }}
                      className="flex items-center space-x-2 px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{language === 'bn' ? 'লোকেশন শেয়ার করুন' : 'Share Live Location'}</span>
                    </button>

                    {/* Upload Custom Voice File */}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        micFileInputRef.current?.click();
                      }}
                      className="flex items-center space-x-2 px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <Mic className="w-4 h-4 text-pink-500 shrink-0" />
                      <span>{language === 'bn' ? 'ভয়েস ফাইল আপলোড করুন' : 'Upload Voice/Audio File'}</span>
                    </button>

                    {/* Attach PDF/Document File */}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        document.getElementById('document-file-picker')?.click();
                      }}
                      className="flex items-center space-x-2 px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{language === 'bn' ? 'ডকুমেন্ট/পিডিএফ ফাইল পাঠান' : 'Share PDF/Document File'}</span>
                    </button>

                    {/* Quick Like */}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        handleSendMessage('', false, true);
                      }}
                      className="flex items-center space-x-2 px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <ThumbsUp className="w-4 h-4 text-[#0084FF] shrink-0" />
                      <span>{language === 'bn' ? 'লাইক বাটন পাঠান' : 'Send Quick Thumbs Up'}</span>
                    </button>

                    {/* Quick Store Promo */}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        const promoText = language === 'bn' 
                          ? '🛍️ আমাদের শপের নতুন পণ্য অফার: অমর বাজার থেকে যেকোনো পণ্যে ১০% ক্যাশব্যাক!' 
                          : '🛍️ Our Shop Promo: Enjoy 10% cashback on your next purchase!';
                        handleSendMessage(promoText);
                      }}
                      className="flex items-center space-x-2 px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <Store className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>{language === 'bn' ? 'শপ প্রোমো পাঠান' : 'Send Shop Promo'}</span>
                    </button>
                  </div>
                )}

                {/* 1. Expand Options Arrow / Plus Button (Responsive) */}
                {(isInputFocused || inputText.trim() !== '') && !showExtraOptionsOnMobile ? (
                  /* Chevron Right to expand utilities, visible on mobile when typing/focused */
                  <button
                    type="button"
                    onClick={() => setShowExtraOptionsOnMobile(true)}
                    className="p-1 text-[#0084FF] hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full shrink-0 cursor-pointer transition"
                    title={language === 'bn' ? 'অপশন দেখুন' : 'Show options'}
                  >
                    <ChevronRight className="w-6.5 h-6.5 stroke-[2.5]" />
                  </button>
                ) : (
                  /* Plus utilities button */
                  <button
                    type="button"
                    onClick={() => {
                      setShowExtraOptionsOnMobile(false);
                      setIsPlusMenuOpen(prev => !prev);
                    }}
                    className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full ${isPlusMenuOpen ? 'bg-red-500' : 'bg-[#0084FF]'} hover:opacity-90 text-white flex items-center justify-center shrink-0 cursor-pointer transition shadow-xs`}
                    title={language === 'bn' ? 'যোগ করুন' : 'Add Utilities'}
                  >
                    {isPlusMenuOpen ? (
                      <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3.5]" />
                    ) : (
                      <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3.5]" />
                    )}
                  </button>
                )}

                {/* 2. Camera, Gallery, and Mic buttons - hidden when typing on mobile unless showExtraOptionsOnMobile is set */}
                {(!isInputFocused && inputText.trim() === '' || showExtraOptionsOnMobile) && (
                  <>
                    {/* Camera Button */}
                    <button
                      type="button"
                      onClick={startCamera}
                      className="p-1 sm:p-1.5 text-[#0084FF] hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full shrink-0 cursor-pointer transition"
                      title={language === 'bn' ? 'ক্যামেরা' : 'Camera'}
                    >
                      <Camera className="w-5 sm:w-5.5 h-5 sm:h-5.5 stroke-[2.5]" />
                    </button>

                    {/* Gallery Button */}
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="p-1 sm:p-1.5 text-[#0084FF] hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full shrink-0 cursor-pointer transition"
                      title={language === 'bn' ? 'গ্যালারি' : 'Gallery'}
                    >
                      <Image className="w-5 sm:w-5.5 h-5 sm:h-5.5 stroke-[2.5]" />
                    </button>

                    {/* Mic Button */}
                    <button
                      type="button"
                      onClick={startRecording}
                      className={`p-1 sm:p-1.5 ${isRecording ? 'text-red-500 animate-ping' : 'text-[#0084FF]'} hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full shrink-0 cursor-pointer transition`}
                      title={language === 'bn' ? 'মাইক্রোফোন' : 'Voice Message'}
                    >
                      <Mic className="w-5 sm:w-5.5 h-5 sm:h-5.5 stroke-[2.5]" />
                    </button>
                  </>
                )}

                {/* 5. Rounded Text Input Pill with Emoji picker OR voice recorder active view */}
                {isRecording ? (
                  <div className="flex-1 flex items-center bg-[#F0F2F5] dark:bg-slate-800 rounded-full px-4 py-1.5 justify-between">
                    <div className="flex items-center space-x-2 text-red-500 font-bold text-xs">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                      <span>
                        {language === 'bn' 
                          ? `রেকর্ড হচ্ছে... ${formatTime(recordingTime)}` 
                          : `Recording... ${formatTime(recordingTime)}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={cancelRecording}
                        className="p-1 text-slate-500 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full cursor-pointer transition"
                        title={language === 'bn' ? 'বাতিল' : 'Cancel'}
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                      <button
                        type="button"
                        onClick={stopRecordingAndSend}
                        className="p-1.5 bg-[#0084FF] hover:bg-blue-600 text-white rounded-full cursor-pointer transition flex items-center justify-center"
                        title={language === 'bn' ? 'পাঠান' : 'Send'}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0 bg-[#F0F2F5] dark:bg-slate-800 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 flex items-center">
                    <input
                      type="text"
                      value={inputText}
                      onFocus={() => {
                        setIsInputFocused(true);
                        setShowExtraOptionsOnMobile(false);
                      }}
                      onBlur={() => {
                        // Small timeout to allow click handlers of other buttons to register first
                        setTimeout(() => {
                          setIsInputFocused(false);
                        }, 250);
                      }}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        if (e.target.value.trim() !== '') {
                          setShowExtraOptionsOnMobile(false);
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Message"
                      className="flex-1 min-w-0 bg-transparent border-0 text-[13px] leading-tight focus:outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-450 py-1"
                    />
                    <button 
                      onClick={() => {
                        setInputText(prev => prev + "😊");
                        setIsInputFocused(true);
                      }}
                      className="text-[#0084FF] hover:opacity-80 p-0.5 cursor-pointer transition shrink-0"
                      title="Emoji"
                    >
                      <Smile className="w-5 h-5 fill-none stroke-[2]" />
                    </button>
                  </div>
                )}

                {/* 6. Thumbs Up / Send Action */}
                {!isRecording && (
                  inputText.trim() ? (
                    <button
                      onClick={() => handleSendMessage()}
                      className="p-1 sm:p-1.5 text-[#0084FF] hover:opacity-80 rounded-full transition shrink-0 cursor-pointer"
                      title={language === 'bn' ? 'পাঠান' : 'Send'}
                    >
                      <Send className="w-5 sm:w-5.5 h-5 sm:h-5.5 stroke-[2.5]" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendMessage(undefined, false, true)}
                      className="p-1 sm:p-1.5 text-[#0084FF] hover:scale-110 active:scale-95 rounded-full transition shrink-0 cursor-pointer"
                      title="Like"
                    >
                      <ThumbsUp className="w-5 sm:w-5.5 h-5 sm:h-5.5 stroke-[2.5]" />
                    </button>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/10 dark:bg-slate-900/5">
              <button 
                onClick={() => setMobileView('list')}
                className="lg:hidden mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl transition text-slate-600 dark:text-slate-300 flex items-center space-x-1 cursor-pointer text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'bn' ? 'ফিরে যান' : 'Back'}</span>
              </button>
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
              <p className="text-xs text-slate-400 font-bold">Select a message conversation to start direct chat</p>
            </div>
          )}
        </div>

        {/* DETAILS INFO DRAWER (Takes 1 Column) - Collapsible */}
        {isInfoOpen && activeThread && (
          <div className="hidden lg:flex lg:col-span-1 border-l border-slate-200/80 dark:border-slate-800 flex-col h-full bg-slate-50/50 dark:bg-slate-900/10 p-5 overflow-y-auto space-y-6">
            
            {/* User Details display */}
            <div className="flex flex-col items-center text-center space-y-2">
              <img 
                src={activeContact.avatar} 
                alt={activeContact.name} 
                className="w-16 h-16 rounded-3xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 referrer-policy"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                  {activeContact.name}
                </h3>
                <div className="mt-1">{renderRoleBadge(activeContact.role)}</div>
              </div>
            </div>

            {/* Account Contact details */}
            <div className="space-y-3.5 bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-850">
              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">
                {language === 'bn' ? 'যোগাযোগের তথ্য' : 'Profile Credentials'}
              </span>
              
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 text-[10.5px]">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-bold truncate">{activeContact.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-[10.5px]">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-bold truncate">{activeContact.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-[10.5px]">
                  <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-bold truncate capitalize">{activeContact.role} node</span>
                </div>
              </div>
            </div>

            {/* Mock shared files list */}
            <div className="space-y-2.5">
              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">
                {language === 'bn' ? 'ফাইল ও মিডিয়া' : 'Shared Media'}
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                <img 
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80" 
                  alt="media" 
                  className="w-full h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-800 hover:scale-105 transition referrer-policy"
                  referrerPolicy="no-referrer"
                />
                <img 
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80" 
                  alt="media" 
                  className="w-full h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-800 hover:scale-105 transition referrer-policy"
                  referrerPolicy="no-referrer"
                />
                <img 
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80" 
                  alt="media" 
                  className="w-full h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-800 hover:scale-105 transition referrer-policy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-2 bg-white dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-850">
              <button className="w-full py-1.5 px-2 text-left text-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg flex items-center space-x-2 transition">
                <Bell className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'bn' ? 'মিউট চ্যাট' : 'Mute Notifications'}</span>
              </button>
              <button className="w-full py-1.5 px-2 text-left text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg flex items-center space-x-2 transition">
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'bn' ? 'চ্যাট মুছে ফেলুন' : 'Delete Chat History'}</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 3. AUDIO / VIDEO CALLING SCREEN SIMULATION OVERLAY */}
      {activeCall?.isOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-6 text-white font-sans animate-fade-in">
          <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
            
            {/* Pulsing avatar */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
              <img 
                src={activeCall.avatar} 
                alt={activeCall.userName} 
                className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500 relative z-10 referrer-policy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <h2 className="text-xl font-black">{activeCall.userName}</h2>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">
                {activeCall.status === 'ringing' 
                  ? (activeCall.type === 'video' ? 'Incoming Video Call...' : 'Ringing...')
                  : 'Call Connected • 0:02'}
              </p>
            </div>

            {/* Simulated Calling animation or video frame */}
            {activeCall.type === 'video' && activeCall.status === 'connected' && (
              <div className="w-64 h-40 bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center relative shadow-lg">
                <img 
                  src={activeCall.avatar} 
                  className="w-full h-full object-cover absolute opacity-40 referrer-policy" 
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-black uppercase text-slate-300 relative z-10 bg-black/60 px-2 py-0.5 rounded">
                  Live Feed Connected
                </span>
                {/* Selfie mock */}
                <div className="absolute bottom-2 right-2 w-16 h-20 bg-slate-800 rounded-lg border border-slate-600 overflow-hidden shadow-md">
                  <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-red-500"></div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center space-x-6 mt-8">
              {activeCall.status === 'ringing' && (
                <button 
                  onClick={() => setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null)}
                  className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition duration-150 cursor-pointer"
                  title="Answer Call"
                >
                  <Phone className="w-6 h-6 fill-white" />
                </button>
              )}
              <button 
                onClick={handleEndCall}
                className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition duration-150 cursor-pointer"
                title="End Call"
              >
                <X className="w-6 h-6 stroke-white" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📸 REAL-TIME CAMERA PREVIEW VIEWPORT OVERLAY */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-4 text-white font-sans animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl p-4 flex flex-col items-center space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center w-full px-2">
              <h3 className="text-sm font-black text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#0084FF]" />
                {isCameraSimulationMode 
                  ? (language === 'bn' ? 'ক্যামেরা লাইভ ভিউ (সিমুলেশন)' : 'Live Camera View (Simulation)')
                  : (language === 'bn' ? 'ক্যামেরা লাইভ ভিউ' : 'Live Camera View')}
              </h3>
              <button 
                onClick={stopCamera} 
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-850 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video preview or Simulated feed */}
            <div className="w-full aspect-square bg-black rounded-2xl overflow-hidden relative border border-slate-800 shadow-inner group">
              {isCameraSimulationMode ? (
                /* Beautiful Simulated Shop Viewfinder with custom controls */
                <div className="w-full h-full relative">
                  <img 
                    src={CAMERA_SCENES[cameraMockScene].url} 
                    alt="Camera Simulation Scene"
                    className="w-full h-full object-cover animate-fade-in"
                  />
                  
                  {/* Scene toggle options */}
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-xs p-2.5 rounded-xl flex flex-col gap-1.5 border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      {language === 'bn' ? 'একটি সিন ডিসপ্লে চুজ করুন' : 'Select Scene Display'}
                    </span>
                    <div className="flex gap-1 justify-center">
                      {CAMERA_SCENES.map((scene, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCameraMockScene(i)}
                          className={`px-2 py-1 rounded text-[9px] font-black tracking-wide transition cursor-pointer ${
                            cameraMockScene === i 
                              ? 'bg-[#0084FF] text-white' 
                              : 'bg-white/10 hover:bg-white/20 text-slate-300'
                          }`}
                        >
                          {language === 'bn' ? scene.bnName : scene.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Live hardware camera feed */
                <div className="w-full h-full relative">
                  <video 
                    ref={cameraVideoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                  
                  {/* Flip camera floating button inside the viewport */}
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900/90 border border-slate-700/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white transition cursor-pointer shadow-lg z-10 flex items-center space-x-1.5 active:scale-95 duration-100"
                    title={language === 'bn' ? 'ক্যামেরা ফ্লিপ করুন' : 'Flip Camera'}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                      {facingMode === 'environment' ? (language === 'bn' ? 'সামনের ক্যামেরা' : 'Front Cam') : (language === 'bn' ? 'পেছনের ক্যামেরা' : 'Rear Cam')}
                    </span>
                  </button>
                </div>
              )}

              {/* Grid overlay lines to look like a pro camera */}
              <div className="absolute inset-0 pointer-events-none border-t border-b border-white/5 flex flex-col justify-between p-1/3">
                <div className="w-full border-t border-white/5"></div>
                <div className="w-full border-b border-white/5"></div>
              </div>
              <div className="absolute inset-0 pointer-events-none border-l border-r border-white/5 flex justify-between p-1/3">
                <div className="h-full border-l border-white/5"></div>
                <div className="h-full border-r border-white/5"></div>
              </div>

              {/* REC / LIVE status bar */}
              <div className="absolute top-3 left-3 bg-red-500 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md animate-pulse flex items-center space-x-1 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                <span>{language === 'bn' ? 'লাইভ ফিড' : 'Live Feed'}</span>
              </div>
            </div>

            {/* Shutter controls */}
            <div className="flex items-center justify-between w-full px-6 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  cameraInputRef.current?.click();
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition cursor-pointer flex items-center justify-center"
                title={language === 'bn' ? 'গ্যালারি থেকে দিন' : 'Select device photo'}
              >
                <Image className="w-5 h-5 text-[#0084FF]" />
              </button>

              {/* Big capture button */}
              <button
                type="button"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 border-4 border-slate-700/60 flex items-center justify-center cursor-pointer transition transform active:scale-90 shadow-lg relative"
                title={language === 'bn' ? 'ছবি তুলুন' : 'Capture Snap'}
              >
                <div className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 transition" />
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 text-xs font-black bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 rounded-full transition cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
