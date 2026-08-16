import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, MapPin, MessageSquare, Clock, ShieldCheck, 
  HelpCircle, Send, CheckCircle2, AlertTriangle, 
  ChevronRight, Sparkles, Package, RefreshCw, Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Order } from '../../types';

export const CustomerTrackingSupport: React.FC = () => {
  const { language, currency, formatPrice, currentUser, triggerBanner } = useApp() as any;
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchId, setSearchId] = useState<string>('BD-2026-8912');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Support & Refund states
  const [refundReason, setRefundReason] = useState<string>('Damaged Product');
  const [refundComments, setRefundComments] = useState<string>('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState<boolean>(false);
  const [refundSuccess, setRefundSuccess] = useState<boolean>(false);
  
  // Support Chat states
  const [messages, setMessages] = useState<Array<{sender: 'user' | 'agent', text: string, time: string}>>([
    {
      sender: 'agent',
      text: language === 'bn' 
        ? 'আসসালামু আলাইকুম! আমার বাজার সাপোর্ট সেন্টারে আপনাকে স্বাগতম। আপনার অর্ডার ডেলিভারি বা রিফান্ড সংক্রান্ত কোনো সমস্যা থাকলে আমাদের জানান।' 
        : 'Assalamu Alaikum! Welcome to AmarBazar Support. Please let us know if you have any delivery or refund queries. We are online to help you!',
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch customer orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const allOrders = await api.getOrders();
        // Filter orders for the logged-in user if available, otherwise show all
        if (currentUser) {
          const userOrders = allOrders.filter(o => o.userId === currentUser.id);
          setOrders(userOrders.length > 0 ? userOrders : allOrders);
          if (userOrders.length > 0) {
            setSelectedOrder(userOrders[0]);
            setSearchId(userOrders[0].orderNumber);
          } else if (allOrders.length > 0) {
            setSelectedOrder(allOrders[0]);
            setSearchId(allOrders[0].orderNumber);
          }
        } else {
          setOrders(allOrders);
          if (allOrders.length > 0) {
            setSelectedOrder(allOrders[0]);
            setSearchId(allOrders[0].orderNumber);
          }
        }
      } catch (err) {
        console.error('Failed to load orders for tracking:', err);
      }
    };
    fetchOrders();
  }, [currentUser]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const ord = await api.getOrderById(searchId.trim());
      if (ord) {
        setSelectedOrder(ord);
        if (triggerBanner) {
          triggerBanner(language === 'bn' ? 'অর্ডার ট্র্যাকিং তথ্য লোড হয়েছে!' : 'Order tracking data refreshed!');
        }
      } else {
        setError(language === 'bn' ? 'অর্ডার নম্বরটি পাওয়া যায়নি।' : 'Order number not found.');
      }
    } catch (err) {
      setError(language === 'bn' ? 'অর্ডার ট্র্যাক করতে ব্যর্থ হয়েছে।' : 'Failed to track order.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setSearchId(order.orderNumber);
    setError('');
  };

  // Submit Refund Claim Form
  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmittingRefund(true);
    
    setTimeout(() => {
      setIsSubmittingRefund(false);
      setRefundSuccess(true);
      if (triggerBanner) {
        triggerBanner(language === 'bn' ? 'রিফান্ড আবেদন সফলভাবে জমা হয়েছে!' : 'Refund request submitted successfully!');
      }
      
      // Auto-insert agent response in the support chat panel
      setMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: `[Refund Claim Filed] Order: ${selectedOrder.orderNumber}. Reason: ${refundReason}. Details: ${refundComments}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'agent',
          text: language === 'bn'
            ? `ধন্যবাদ! আমরা ${selectedOrder.orderNumber} অর্ডারের জন্য আপনার রিফান্ডের আবেদনটি পেয়েছি। রিফান্ড রিজন: ${refundReason}। আমাদের টিম এটি ২ ঘণ্টার মধ্যে যাচাই করে আপনার বিকাশ নম্বরে রিফান্ড প্রসেস করবে।`
            : `Thank you! We have received your refund request for order ${selectedOrder.orderNumber}. Reason: ${refundReason}. Our finance team will review the claim and dispatch the refund to your bKash wallet within 2 hours.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setRefundComments('');
    }, 1500);
  };

  // Send Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: userMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
    setIsTyping(true);

    // Simulate Agent reply
    setTimeout(() => {
      setIsTyping(false);
      let reply = '';
      const lowercaseMsg = userMsg.toLowerCase();
      
      if (lowercaseMsg.includes('refund') || lowercaseMsg.includes('রিফান্ড') || lowercaseMsg.includes('টাকা')) {
        reply = language === 'bn'
          ? 'আপনার রিফান্ডের আবেদনটি আমাদের সিনিয়র সাপোর্ট টিমের কাছে পাঠানো হয়েছে। অনুগ্রহ করে আপনার বিকাশ/নগদ নম্বর এবং সমস্যাটি আমাদের রিফান্ড বক্সে জমা দিন।'
          : 'I see you are asking about a refund. If you submit a claim in our refund request box on the left, our automated finance system will verify and dispatch BDT credit back to your account.';
      } else if (lowercaseMsg.includes('track') || lowercaseMsg.includes('কোথায়') || lowercaseMsg.includes('delivery')) {
        reply = language === 'bn'
          ? `আপনার অর্ডারটির বর্তমান লোকেশন ডানদিকের লাইভ ট্র্যাকিং ম্যাপে দেখা যাচ্ছে। এটি বর্তমানে কুরিয়ার রাইডারের সাথে আপনার ডেলিভারি ঠিকানার দিকে ট্রানজিটে আছে।`
          : `You can track the exact transit location of your parcel using our Interactive Map on the right. Your shipment is currently out for delivery with our delivery partner.`;
      } else {
        reply = language === 'bn'
          ? 'আপনার প্রশ্নটির জন্য ধন্যবাদ। আমাদের কাস্টমার কেয়ার টিম আপনার সমস্যাটি সমাধান করার জন্য প্রস্তুত। আমরা আপনার সাথে সরাসরি যোগাযোগ করছি।'
          : 'Thank you for your message. Our helpdesk agent is actively reviewing your order history to provide the best assistance regarding this.';
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6" id="customer-tracking-view">
      
      {/* Top Banner Accent */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <Truck className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/25 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{language === 'bn' ? 'সরাসরি পার্সেল লোকেশন ট্র্যাকিং' : 'Live Parcel Dispatch & Tracking Node'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif italic text-amber-500">
            {language === 'bn' ? 'স্মার্ট অর্ডার ট্র্যাকিং ও ইনস্ট্যান্ট রিফান্ড হাব' : 'Smart Tracking & Instant Refund Helpdesk'}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
            {language === 'bn' 
              ? 'আপনার পার্সেলটি কোথায় আছে লাইভ ম্যাপে দেখুন, সরাসরি ডেলিভারি রাইডারের বর্তমান লোকেশন ট্র্যাক করুন এবং কোনো সমস্যা হলে ১ ক্লিকে বিকাশ রিফান্ড আবেদন করুন।' 
              : 'Track where your item is in real-time, monitor active courier rider routes, and directly contact live customer agents for automated refund claims.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE ORDERS & REFUND BOX */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recent Orders List Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>{language === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Recent Orders'}</span>
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                {orders.length} {language === 'bn' ? 'টি' : 'Orders'}
              </span>
            </h4>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  {language === 'bn' ? 'আপনার কোনো অর্ডার নেই।' : 'No orders found.'}
                </div>
              ) : (
                orders.map(order => (
                  <div 
                    key={order.id}
                    onClick={() => handleOrderSelect(order)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition duration-150 flex items-center justify-between ${
                      selectedOrder?.id === order.id
                        ? 'bg-amber-500/5 border-amber-500' 
                        : 'bg-slate-50 dark:bg-slate-800/20 border-slate-150 dark:border-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                        {order.orderNumber}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatPrice(order.totalAmount)} • {order.items.length} {language === 'bn' ? 'টি পণ্য' : 'Items'}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${
                      order.status === 'delivered' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : order.status === 'shipped'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400 animate-pulse'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Refund & Return Claim Desk */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              <RefreshCw className="w-4 h-4 text-amber-500 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                {language === 'bn' ? 'দ্রুত রিফান্ড ও রিটার্ন সার্ভিস' : 'Instant Refund Claim'}
              </h4>
            </div>

            {selectedOrder ? (
              <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs font-bold">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl space-y-1 border border-slate-150 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                    {language === 'bn' ? 'নির্বাচিত অর্ডার' : 'Selected Order'}
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800 dark:text-white">{selectedOrder.orderNumber}</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">{language === 'bn' ? 'সমস্যার ধরন (রিটার্ন রিজন)' : 'Refund / Return Reason'}</label>
                  <select 
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Damaged Product">{language === 'bn' ? 'পণ্যটি ভাঙা / নষ্ট পেয়েছি' : 'Product is physically damaged / broken'}</option>
                    <option value="Wrong Item">{language === 'bn' ? 'ভুল সাইজ বা মডেল পেয়েছি' : 'Received wrong item / incorrect model'}</option>
                    <option value="Low Quality">{language === 'bn' ? 'মানের চরম অভাব (আলাদা পণ্য)' : 'Quality is far lower than described'}</option>
                    <option value="Missing Parts">{language === 'bn' ? 'প্যাকেজের সাথে প্রয়োজনীয় অংশ নেই' : 'Package is missing parts or accessories'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">{language === 'bn' ? 'বিস্তারিত এবং বিকাশ নম্বর' : 'Comment & bKash Wallet No.'}</label>
                  <textarea 
                    value={refundComments}
                    onChange={(e) => setRefundComments(e.target.value)}
                    rows={3}
                    placeholder={language === 'bn' ? 'আপনার বিকাশ নম্বর এবং সমস্যার বিস্তারিত এখানে লিখুন...' : 'Provide details and state your bKash wallet number for refund credit...'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none min-h-[70px] leading-relaxed font-semibold"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingRefund}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-750 text-white font-black rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className={`w-4 h-4 ${isSubmittingRefund ? 'animate-spin' : ''}`} />
                  <span>{language === 'bn' ? 'রিফান্ড ও রিটার্ন ক্লেইম করুন' : 'Submit Refund Claim'}</span>
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                {language === 'bn' ? 'রিফান্ড ক্লেইম করতে উপরে একটি অর্ডার নির্বাচন করুন।' : 'Select an order from the list to file a refund claim.'}
              </p>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE LOCATION TRACKER & SUPPORT CHAT */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Live Visual Courier Tracker Map & Timeline */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-xs space-y-5 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Search / Manual Order Tracking Input */}
                <form onSubmit={handleTrackSearch} className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input 
                      type="text"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder={language === 'bn' ? 'অর্ডার নম্বর লিখুন (যেমন: BD-2026-8912)' : 'Enter Order Number (e.g. BD-2026-8912)'}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition"
                  >
                    {language === 'bn' ? 'ট্র্যাক' : 'Track'}
                  </button>
                </form>

                {error && <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl">{error}</p>}

                {selectedOrder && (
                  <div className="space-y-4">
                    
                    {/* Visual Vector Route Tracker Map */}
                    <div className="relative bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 p-4 overflow-hidden h-[150px] flex flex-col justify-between">
                      {/* Grid overlay to look like a map */}
                      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900 opacity-30 pointer-events-none" />
                      
                      {/* Moving Rider animation along a vector route */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                        {/* Map road lines */}
                        <path d="M 30 75 Q 120 20, 200 75 T 350 75" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-slate-200 dark:text-slate-800" />
                        <path d="M 30 75 Q 120 20, 200 75 T 350 75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" className="text-emerald-500" />
                        
                        {/* Moving rider dot */}
                        <circle cx={selectedOrder.status === 'delivered' ? 350 : selectedOrder.status === 'shipped' ? 220 : 30} cy={selectedOrder.status === 'delivered' ? 75 : selectedOrder.status === 'shipped' ? 55 : 75} r="6" className="fill-emerald-500 stroke-white stroke-2 animate-bounce" />
                      </svg>

                      {/* Map Location nodes */}
                      <div className="relative z-10 flex justify-between items-center text-[10px] font-black text-slate-500">
                        
                        {/* Node 1: Warehouse */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs mb-1 bg-white dark:bg-slate-900">
                            <Package className="w-4 h-4" />
                          </div>
                          <span>Dhaka Hub</span>
                        </div>

                        {/* Node 2: Courier Rider */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs mb-1 bg-white dark:bg-slate-900 border ${
                            selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' 
                              ? 'bg-sky-500/10 border-sky-500/30 text-sky-500 animate-pulse' 
                              : 'border-slate-200 text-slate-300'
                          }`}>
                            <Truck className="w-4 h-4" />
                          </div>
                          <span className={selectedOrder.status === 'shipped' ? 'text-sky-500' : ''}>Pathao Logistics</span>
                        </div>

                        {/* Node 3: Customer Location */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs mb-1 bg-white dark:bg-slate-900 border ${
                            selectedOrder.status === 'delivered' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                              : 'border-slate-200 text-slate-300'
                          }`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className={selectedOrder.status === 'delivered' ? 'text-emerald-500' : ''}>Dhanmondi</span>
                        </div>

                      </div>

                      {/* Small Live Location Status message */}
                      <div className="relative z-10 text-[10px] font-extrabold text-slate-400 bg-white/85 dark:bg-slate-900/85 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800 self-start">
                        {selectedOrder.status === 'delivered' ? (
                          <span className="text-emerald-500">✓ Parcel successfully delivered to Customer.</span>
                        ) : selectedOrder.status === 'shipped' ? (
                          <span className="text-sky-500 animate-pulse">● Courier Rider is near Dhanmondi Lake Rd 4.</span>
                        ) : (
                          <span>● Shipment being packaged at Seller warehouse.</span>
                        )}
                      </div>

                    </div>

                    {/* Logistics Timeline Steps */}
                    <div className="space-y-3.5 pt-2">
                      <h5 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                        {language === 'bn' ? 'কুরিয়ার ডেলিভারি টাইমলাইন' : ' Logistics Milestones'}
                      </h5>
                      
                      <div className="relative pl-6 space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100 dark:before:bg-slate-800">
                        {selectedOrder.courier?.statusLogs.map((log, idx) => (
                          <div key={idx} className="relative text-xs font-semibold">
                            <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 ${
                              idx === 0 ? 'bg-emerald-500 scale-110 shadow-sm' : 'bg-slate-300'
                            }`} />
                            <div className="flex justify-between">
                              <span className="font-extrabold text-slate-800 dark:text-white">{log.status}</span>
                              <span className="text-[9px] text-slate-400">{log.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{log.location}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {selectedOrder && (
                <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-4 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Courier: <span className="text-slate-800 dark:text-white font-black">{selectedOrder.courier?.provider || 'Pathao'}</span></span>
                  <span>Tracking ID: <span className="text-slate-800 dark:text-white font-mono font-black">{selectedOrder.courier?.trackingNumber || 'N/A'}</span></span>
                </div>
              )}

            </div>

            {/* Support Message Live Chat */}
            <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between min-h-[400px]">
              
              {/* Chat Header */}
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                      AB
                    </div>
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-slate-800 dark:text-white leading-tight">AmarBazar Care</h5>
                    <span className="text-[9px] text-emerald-500 font-bold tracking-wider uppercase">Active Agent</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages Panel */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[280px]">
                {messages.map((m, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-amber-500 text-slate-950 rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}>
                      {m.text}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 px-1 font-semibold">{m.time}</span>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center space-x-1.5 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none max-w-[60px]">
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-850 flex gap-2">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Type support query...'}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none font-semibold"
                />
                <button 
                  type="submit"
                  className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition shadow-xs shrink-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
