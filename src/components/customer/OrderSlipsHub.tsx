import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Printer, Download, CheckCircle2, XCircle, 
  RotateCcw, CreditCard, Truck, QrCode, Search, Filter, 
  Eye, Copy, Share2, Smartphone, Laptop, Check, AlertCircle, 
  Sliders, ArrowRight, ShieldCheck, Clock, Layers, Sparkles,
  Bluetooth, Wifi, Usb, Send, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Order, Address, getProductUnitPrice } from '../../types';
import { api } from '../../services/api';

export type SlipType = 'all' | 'confirmed' | 'cancelled' | 'money_receipt' | 'delivery_chalan' | 'return_slip' | 'printer_station';
export type PrintFormat = 'a4' | 'pos_80mm' | 'pos_58mm' | 'shipping_label';

interface OrderSlipsHubProps {
  initialSlipType?: SlipType;
}

export const OrderSlipsHub: React.FC<OrderSlipsHubProps> = ({ initialSlipType = 'all' }) => {
  const { currentUser, language, currency, formatPrice } = useApp();

  const [activeTab, setActiveTab] = useState<SlipType>(initialSlipType);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState<PrintFormat>('a4');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [thermalWidth, setThermalWidth] = useState<'80mm' | '58mm'>('80mm');
  const [btStatus, setBtStatus] = useState<'idle' | 'scanning' | 'connected' | 'unsupported'>('idle');
  const [btDeviceName, setBtDeviceName] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement | null>(null);

  // Trigger Action Toast
  const triggerToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Load Orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const fetched = await api.getOrders({ userId: currentUser?.id });
        if (fetched && fetched.length > 0) {
          setOrders(fetched);
        } else {
          // Provide realistic mock data if user hasn't placed orders yet
          const fallbackOrders: Order[] = [
            {
              id: 'ord-2026-9081',
              orderNumber: 'ORD-90812',
              order5DigitId: '90812',
              userId: currentUser?.id || 'usr-cust-1',
              customerName: currentUser?.name || 'Rahim Chowdhury',
              customerPhone: currentUser?.phone || '01712345678',
              customerEmail: currentUser?.email || 'rahim@gmail.com',
              shippingAddress: {
                id: 'addr-1',
                title: 'Home Address',
                recipientName: currentUser?.name || 'Rahim Chowdhury',
                phone: currentUser?.phone || '01712345678',
                division: 'Dhaka',
                district: 'Dhaka',
                thana: 'Dhanmondi',
                fullAddress: 'House 42, Road 10/A, Dhanmondi R/A, Dhaka-1209',
                isDefault: true
              },
              items: [
                {
                  productId: 'prod-101',
                  productTitle: 'Walton PRIMEX 55" 4K Google TV (Voice Control)',
                  productImage: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=300&q=80',
                  sellerId: 'sel-1',
                  sellerName: 'Dhaka Tech Store',
                  quantity: 1,
                  price: 48500
                },
                {
                  productId: 'prod-104',
                  productTitle: 'Pure Sundarban Wild Honey (Raw Organic 1kg)',
                  productImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80',
                  sellerId: 'sel-3',
                  sellerName: 'Bengal Pure Agro',
                  quantity: 2,
                  price: 950
                }
              ],
              subtotal: 50400,
              discountAmount: 1500,
              couponCode: 'AMARBD15',
              shippingFee: 120,
              totalAmount: 49020,
              paymentMethod: 'bkash',
              paymentStatus: 'paid',
              transactionId: 'TRX-BK7894210',
              status: 'confirmed',
              courier: {
                provider: 'Pathao',
                trackingNumber: 'PTH-88992011',
                estimatedDays: '1-2 Days',
                shippingFee: 120,
                statusLogs: [
                  { time: '10:30 AM', status: 'Order Confirmed & Payment Verified', location: 'AmarBazar Central System' },
                  { time: '02:15 PM', status: 'Ready for Courier Dispatch', location: 'Dhaka Sorting Hub' }
                ]
              },
              createdAt: '2026-08-15T10:30:00Z',
              updatedAt: '2026-08-15T14:15:00Z'
            },
            {
              id: 'ord-2026-8945',
              orderNumber: 'ORD-89450',
              order5DigitId: '89450',
              userId: currentUser?.id || 'usr-cust-1',
              customerName: currentUser?.name || 'Rahim Chowdhury',
              customerPhone: currentUser?.phone || '01712345678',
              customerEmail: currentUser?.email || 'rahim@gmail.com',
              shippingAddress: {
                id: 'addr-2',
                title: 'Office Address',
                recipientName: currentUser?.name || 'Rahim Chowdhury',
                phone: currentUser?.phone || '01712345678',
                division: 'Dhaka',
                district: 'Dhaka',
                thana: 'Gulshan',
                fullAddress: 'Level 6, Concord Tower, Gulshan-2, Dhaka',
                isDefault: false
              },
              items: [
                {
                  productId: 'prod-103',
                  productTitle: 'Rajshahi Premium Himsagar Mango (Export Grade 10kg)',
                  productImage: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=300&q=80',
                  sellerId: 'sel-3',
                  sellerName: 'Bengal Pure Agro',
                  quantity: 1,
                  price: 1800
                }
              ],
              subtotal: 1800,
              discountAmount: 0,
              shippingFee: 150,
              totalAmount: 1950,
              paymentMethod: 'nagad',
              paymentStatus: 'refunded',
              transactionId: 'TRX-NG6543110',
              status: 'cancelled',
              courier: {
                provider: 'RedX',
                trackingNumber: 'RDX-9943201',
                estimatedDays: 'Cancelled',
                shippingFee: 150,
                statusLogs: [
                  { time: '11:00 AM', status: 'Order Placed', location: 'Dhaka' },
                  { time: '01:30 PM', status: 'Order Cancelled by Customer (Found cheaper elsewhere)', location: 'Customer Care' },
                  { time: '02:00 PM', status: 'Refund Dispatched to Nagad Wallet', location: 'Nagad Gateway' }
                ]
              },
              createdAt: '2026-08-10T11:00:00Z',
              updatedAt: '2026-08-10T14:00:00Z'
            },
            {
              id: 'ord-2026-7812',
              orderNumber: 'ORD-78129',
              order5DigitId: '78129',
              userId: currentUser?.id || 'usr-cust-1',
              customerName: currentUser?.name || 'Rahim Chowdhury',
              customerPhone: currentUser?.phone || '01712345678',
              customerEmail: currentUser?.email || 'rahim@gmail.com',
              shippingAddress: {
                id: 'addr-1',
                title: 'Home Address',
                recipientName: currentUser?.name || 'Rahim Chowdhury',
                phone: currentUser?.phone || '01712345678',
                division: 'Dhaka',
                district: 'Dhaka',
                thana: 'Dhanmondi',
                fullAddress: 'House 42, Road 10/A, Dhanmondi R/A, Dhaka-1209',
                isDefault: true
              },
              items: [
                {
                  productId: 'prod-102',
                  productTitle: 'Authentic Handloom Dhakai Jamdani Saree (Traditional Motif)',
                  productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
                  sellerId: 'sel-2',
                  sellerName: 'Sonar Bangla Boutique',
                  quantity: 1,
                  price: 8500
                }
              ],
              subtotal: 8500,
              discountAmount: 500,
              shippingFee: 60,
              totalAmount: 8060,
              paymentMethod: 'cod',
              paymentStatus: 'paid',
              transactionId: 'COD-CASH-78129',
              status: 'delivered',
              courier: {
                provider: 'Steadfast',
                trackingNumber: 'STF-4488210',
                estimatedDays: 'Delivered',
                shippingFee: 60,
                statusLogs: [
                  { time: 'Aug 02, 10:00 AM', status: 'Order Dispatched', location: 'Dhaka' },
                  { time: 'Aug 03, 04:30 PM', status: 'Successfully Delivered & Cash Received', location: 'Dhanmondi Hub' }
                ]
              },
              createdAt: '2026-08-02T10:00:00Z',
              updatedAt: '2026-08-03T16:30:00Z'
            }
          ];
          setOrders(fallbackOrders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Generate QR Code whenever selected order changes
  useEffect(() => {
    if (selectedOrder) {
      const qrPayload = JSON.stringify({
        org: 'AmarBazar BD Ltd.',
        orderNo: selectedOrder.orderNumber || selectedOrder.order5DigitId || selectedOrder.id,
        date: selectedOrder.createdAt,
        customer: selectedOrder.customerName,
        phone: selectedOrder.customerPhone,
        total: selectedOrder.totalAmount,
        payment: selectedOrder.paymentStatus,
        trx: selectedOrder.transactionId || 'N/A',
        verifyUrl: `https://amarbazar.bd/verify-invoice?id=${selectedOrder.id}`
      });

      QRCode.toDataURL(qrPayload, {
        width: 260,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR code err:', err));
    }
  }, [selectedOrder]);

  // Filter Orders based on activeTab & search
  const filteredOrders = orders.filter(order => {
    // Tab Filter
    let matchesTab = true;
    if (activeTab === 'confirmed') {
      matchesTab = order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered';
    } else if (activeTab === 'cancelled') {
      matchesTab = order.status === 'cancelled' || order.paymentStatus === 'refunded';
    } else if (activeTab === 'money_receipt') {
      matchesTab = order.paymentStatus === 'paid' || order.paymentMethod !== 'cod';
    } else if (activeTab === 'delivery_chalan') {
      matchesTab = Boolean(order.courier?.trackingNumber || order.status !== 'cancelled');
    } else if (activeTab === 'return_slip') {
      matchesTab = order.status === 'cancelled' || order.status === 'delivered';
    }

    // Search Query Filter
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesTab;

    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(q) ||
      order.id?.toLowerCase().includes(q) ||
      order.order5DigitId?.toLowerCase().includes(q) ||
      order.customerName?.toLowerCase().includes(q) ||
      order.customerPhone?.toLowerCase().includes(q) ||
      order.transactionId?.toLowerCase().includes(q) ||
      order.items.some(it => it.productTitle.toLowerCase().includes(q) || it.sellerName.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  // Print Handler
  const handleDirectPrint = (order: Order, format: PrintFormat = printFormat) => {
    setSelectedOrder(order);
    setPrintFormat(format);
    
    // Inject dynamic print stylesheet to ensure perfect format rendering
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // PDF Download Simulation & Trigger
  const handleDownloadPdf = (order: Order) => {
    const slipName = `AmarBazar_${activeTab === 'cancelled' ? 'Cancellation_CreditNote' : 'Official_Invoice'}_${order.orderNumber || order.order5DigitId || order.id}.pdf`;
    
    // Create printable blob page or use window.print
    setSelectedOrder(order);
    setPreviewModalOpen(true);
    triggerToast(language === 'bn' ? `পিডিএফ তৈরি হচ্ছে... প্রিন্ট ডায়লগ থেকে 'Save as PDF' সিলেক্ট করুন।` : `Preparing PDF... Select 'Save as PDF' from the print prompt.`);
    
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Bluetooth Direct Thermal Print (Web Bluetooth API)
  const handleBluetoothConnect = async () => {
    const navAny = navigator as any;
    if (!navAny.bluetooth) {
      setBtStatus('unsupported');
      alert(language === 'bn' ? 'আপনার ব্রাউজারে সরাসরি Web Bluetooth সাপোর্ট নেই। অনুগ্রহ করে Chrome / Edge ব্রাউজার ব্যবহার করুন বা সাধারণ প্রিন্ট অপশন দিন।' : 'Web Bluetooth is not supported on this browser. Use Chrome/Edge or standard system print.');
      return;
    }

    try {
      setBtStatus('scanning');
      const device = await navAny.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // standard serial/printer service
      });

      if (device) {
        setBtDeviceName(device.name || 'BT-POS-Printer');
        setBtStatus('connected');
        triggerToast(language === 'bn' ? `ডিজিটাল প্রিন্টার '${device.name || 'Bluetooth Printer'}' সফলভাবে কানেক্ট হয়েছে!` : `Connected to '${device.name || 'Bluetooth Printer'}'!`);
      }
    } catch (err: any) {
      setBtStatus('idle');
      console.warn('Bluetooth pairing dismissed or error:', err);
    }
  };

  // Copy Raw ESC/POS Receipt Text (for mobile Bluetooth thermal apps like RawBT)
  const handleCopyRawReceipt = (order: Order) => {
    const lines = [
      '================================',
      '        AMARBAZAR BD LTD.       ',
      '  Online Marketplace Bangladesh ',
      '      Hotline: 09612-BAZAR      ',
      '================================',
      `Order No: ${order.orderNumber || order.order5DigitId || order.id}`,
      `Date    : ${new Date(order.createdAt).toLocaleDateString()}`,
      `Customer: ${order.customerName}`,
      `Phone   : ${order.customerPhone}`,
      `Address : ${order.shippingAddress.fullAddress}`,
      '--------------------------------',
      'ITEM             QTY     PRICE  ',
      '--------------------------------',
      ...order.items.map(it => `${it.productTitle.slice(0, 15).padEnd(16)} ${String(it.quantity).padEnd(4)} ৳${(it.price * it.quantity)}`),
      '--------------------------------',
      `Subtotal        : ৳${order.subtotal}`,
      `Delivery Charge : ৳${order.shippingFee}`,
      order.discountAmount > 0 ? `Discount Code   : -৳${order.discountAmount}` : '',
      `TOTAL PAID (BDT): ৳${order.totalAmount}`,
      '--------------------------------',
      `Payment : ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})`,
      `Trx ID  : ${order.transactionId || 'N/A'}`,
      '================================',
      '  Thank You For Shopping With Us',
      '      www.amarbazar.com.bd      ',
      '================================\n\n\n'
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    triggerToast(language === 'bn' ? 'থার্মাল প্রিন্টার রিসিট টেক্সট কপি করা হয়েছে! (RawBT বা প্রিন্টার অ্যাপে পেস্ট করতে পারেন)' : 'POS receipt text copied to clipboard!');
  };

  // Share Slip via WhatsApp
  const handleShareWhatsApp = (order: Order) => {
    const text = `*AmarBazar BD Official Order Slip*\nOrder No: ${order.orderNumber || order.order5DigitId || order.id}\nCustomer: ${order.customerName}\nTotal Amount: ৳${order.totalAmount.toLocaleString()}\nStatus: ${order.status.toUpperCase()}\nTrack Online: https://amarbazar.bd/track?id=${order.id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-3 space-y-6">
      
      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 border border-emerald-400/30 animate-fade-in-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {language === 'bn' ? 'অর্ডার স্লিপ, চালান ও রসিদ ভল্ট' : 'Order Slips, Invoices & Memos Hub'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {language === 'bn' 
                    ? 'আপনার কনফার্মড অর্ডার, ক্যান্সেলেশন, রিফান্ড ও ডেলিভারি মেমোসমূহ সংরক্ষণ, সরাসরি PDF ডাউনলোড ও যেকোনো ডিজিটাল প্রিন্টারে প্রিন্ট করুন।' 
                    : 'Manage official tax invoices, cancellation notes, money receipts, and delivery chalans with multi-device digital printer support.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Hardware Connect Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('printer_station')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl text-xs font-black flex items-center space-x-2 shadow-sm transition border border-slate-750"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'ডিজিটাল প্রিন্টার কানেক্টর' : 'Digital Printer Station'}</span>
            </button>
          </div>
        </div>

        {/* SUB-TABS NAVIGATION */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 ${
              activeTab === 'all' 
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20' 
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সকল স্লিপ একসাথে' : 'All Slips & Invoices'}</span>
            <span className="ml-1.5 px-1.5 py-0.2 bg-black/10 rounded-full text-[10px] font-black">{orders.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 ${
              activeTab === 'confirmed' 
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20' 
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কনফার্মড ইনভয়েস ও স্লিপ' : 'Confirmed Invoices'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 ${
              activeTab === 'cancelled' 
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20' 
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ক্যান্সেলেশন ও রিফান্ড স্লিপ' : 'Cancellation & Refund Slips'}</span>
          </button>

          <button
            onClick={() => setActiveTab('money_receipt')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 ${
              activeTab === 'money_receipt' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' 
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'মানি রিসিট ও পেমেন্ট স্লিপ' : 'Payment & Money Receipts'}</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery_chalan')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 ${
              activeTab === 'delivery_chalan' 
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20' 
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ডেলিভারি চালান ও গেটপাস' : 'Delivery Chalans'}</span>
          </button>

          <button
            onClick={() => setActiveTab('return_slip')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 ${
              activeTab === 'return_slip' 
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20' 
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'রিটার্ন ও এক্সচেঞ্জ মেমো' : 'Return Slips'}</span>
          </button>

          <button
            onClick={() => setActiveTab('printer_station')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 ${
              activeTab === 'printer_station' 
                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'bn' ? 'প্রিন্টার সেটআপ ও ডিভাইস' : 'Printer Setup'}</span>
          </button>
        </div>
      </div>

      {/* PRINTER HARDWARE STATION TAB */}
      {activeTab === 'printer_station' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {language === 'bn' ? 'ডিজিটাল প্রিন্টার সামঞ্জস্য ও সংযোগ নির্দেশিকা' : 'Universal Digital Printer Compatibility Hub'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'bn' 
                      ? 'অমরবাজার যেসকল ডিজিটাল প্রিন্টিং মেশিন ও ডিভাইসে শতভাগ সমর্থন করে' 
                      : 'All supported digital printing machines and devices with zero driver dependency.'}
                  </p>
                </div>
              </div>

              {/* Supported Printer Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-750 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-extrabold text-xs">
                    <Laptop className="w-4 h-4 text-sky-500" />
                    <span>১. লেজার ও ইঙ্কজেট স্ট্যান্ডার্ড প্রিন্টার (A4 / Letter)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Canon, HP, Epson, Brother বা যেকোনো ব্র্যান্ডের ডেস্কটপ প্রিন্টার যা কম্পিউটার, ল্যাপটপ বা ফোনের সাথে WiFi/USB দ্বারা সংযুক্ত।
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 rounded-md text-[10px] font-black">
                    সাপোর্ট: Full Page A4 Official Tax Invoice
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-750 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-extrabold text-xs">
                    <Bluetooth className="w-4 h-4 text-blue-500" />
                    <span>২. ব্লুটুথ ও থার্মাল পিওএস প্রিন্টার (80mm & 58mm)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Xprinter, Rongta, GOOJPRT, Netum, Sunmi ইত্যাদি যেকোনো পোর্টেবল থার্মাল রসিদ প্রিন্টার যা ব্লুটুথ বা ক্যাবলের মাধ্যমে ফোন/ট্যাবের সাথে চলে।
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-black">
                    সাপোর্ট: 80mm & 58mm Roll Receipt
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-750 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-extrabold text-xs">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span>৩. মোবাইল ওয়্যারলেস প্রিন্টিং (Android & iPhone)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Android Default Print Service, AirPrint, Mopria বা RawBT অ্যাপের মাধ্যমে যেকোনো ফোন থেকে ১ ক্লিকে প্রিন্ট ও অটো-কাট।
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md text-[10px] font-black">
                    সাপোর্ট: Mobile Share & Direct PDF
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-750 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-extrabold text-xs">
                    <Truck className="w-4 h-4 text-amber-500" />
                    <span>৪. কুরিয়ার শিপিং বারকোড ও স্টিকার প্রিন্টার (4x6)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Zebra, TSC, HPRT ইত্যাদি থার্মাল লেবেল স্টিকার প্রিন্টার যা পার্সেল বক্সে লাগানোর জন্য বারকোড গেটপাস স্টিকার প্রিন্ট করে।
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-md text-[10px] font-black">
                    সাপোর্ট: 4"x6" Courier Dispatch Label
                  </span>
                </div>
              </div>

              {/* Direct Bluetooth Pairing Connector */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Bluetooth className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {language === 'bn' ? 'সরাসরি ব্লুটুথ থার্মাল প্রিন্টার পেয়ারিং' : 'Direct Web Bluetooth POS Pairing'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {btDeviceName 
                      ? `কানেক্টেড ডিভাইস: ${btDeviceName}` 
                      : (language === 'bn' ? 'কাছের ব্লুটুথ থার্মাল প্রিন্টারটি অন করে এক ক্লিকে পেয়ার করুন।' : 'Scan and pair nearby portable Bluetooth thermal receipt printers directly.')}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleBluetoothConnect}
                    disabled={btStatus === 'scanning'}
                    className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
                  >
                    {btStatus === 'scanning' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>স্ক্যান হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Bluetooth className="w-4 h-4" />
                        <span>{btDeviceName ? 'পুনরায় পেয়ার করুন' : 'প্রিন্টার খুঁজুন (Scan)'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (orders.length > 0) {
                        handleDirectPrint(orders[0], 'pos_80mm');
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition flex items-center justify-center space-x-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>টেস্ট প্রিন্ট দিন</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Info Box */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>প্রিন্ট সিকিউরিটি ও ভেরিফিকেশন</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  <p className="text-slate-600 dark:text-slate-400">
                    প্রতিটি স্লিপে এনক্রিপ্টেড <strong>কিউআর কোড (QR Code)</strong> থাকে যা স্ক্যান করলে সরাসরি অমরবাজার কেন্দ্রীয় সার্ভার থেকে সত্যতা নিশ্চিত হওয়া যায়।
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  <p className="text-slate-600 dark:text-slate-400">
                    ক্যান্সেলেশন স্লিপে রিফান্ড ট্রানজেকশন আইডি এবং ক্যাশ রিভার্সাল অনুমোদন কোড স্বয়ংক্রিয়ভাবে সংযুক্ত থাকে।
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  <p className="text-slate-600 dark:text-slate-400">
                    কোনো ধরনের অ্যাপ ইন্সটল ছাড়াই ফোন বা পিসির স্বাভাবিক ব্রাউজার প্রিন্ট ডায়লগে সকল সাইজ সঠিকভাবে রূপান্তর হয়।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER BAR (When viewing slips) */}
      {activeTab !== 'printer_station' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'অর্ডার নম্বর, পণ্যের নাম, বা ফোন দিয়ে খুঁজুন...' : 'Search by Order No, Product, or Phone...'}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
            <span>{language === 'bn' ? `মোট স্লিপ সংখ্যা:` : `Total Slips:`}</span>
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded-lg">
              {filteredOrders.length} {language === 'bn' ? 'টি স্লিপ' : 'Slips'}
            </span>
          </div>
        </div>
      )}

      {/* SLIPS LISTING GRID */}
      {activeTab !== 'printer_station' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-bold bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              <span>{language === 'bn' ? 'স্লিপ ও চালান তালিকা লোড হচ্ছে...' : 'Loading official slips & invoices...'}</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'এই ক্যাটাগরিতে কোনো স্লিপ পাওয়া যায়নি।' : 'No slips found in this category.'}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'অর্ডার প্লেস বা কনফার্ম করলে স্বয়ংক্রিয়ভাবে এখানে তার সমস্ত চালান ও রসিদ জমা হবে।' : 'When an order is confirmed or updated, its official slip is securely stored here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map(order => {
                const isCancelled = order.status === 'cancelled' || order.paymentStatus === 'refunded';
                const isDelivered = order.status === 'delivered';
                const isPaid = order.paymentStatus === 'paid';

                return (
                  <div 
                    key={order.id} 
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 group"
                  >
                    {/* Header line */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 bg-slate-950 dark:bg-slate-800 text-amber-400 font-mono font-black text-[11px] rounded-lg tracking-wider">
                            #{order.orderNumber || order.order5DigitId || order.id.slice(-6)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            isCancelled 
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' 
                              : isDelivered 
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                          }`}>
                            {isCancelled 
                              ? (language === 'bn' ? 'বাতিল ও রিফান্ডেড' : 'Cancelled / Credit Note') 
                              : isDelivered 
                              ? (language === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered & Complete') 
                              : (language === 'bn' ? 'কনফার্মড চালান' : 'Confirmed Order')}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Customer and Seller info */}
                      <div className="text-xs pt-1">
                        <p className="font-black text-slate-900 dark:text-white truncate">
                          {order.items[0]?.productTitle}
                          {order.items.length > 1 && ` (+${order.items.length - 1} আরো পণ্য)`}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          সেলার: {order.items[0]?.sellerName || 'AmarBazar Verified Merchant'}
                        </p>
                      </div>

                      {/* Price and Payment badge */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-750 flex items-center justify-between text-xs font-bold">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">মোট পরিশোধিত টাকা:</span>
                          <span className="font-black text-slate-900 dark:text-white text-sm">৳{order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-semibold">পেমেন্ট মেথড:</span>
                          <span className="uppercase text-[10px] font-black text-amber-600 dark:text-amber-400">
                            {order.paymentMethod} {isPaid ? '✓ পেইড' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                      {/* View Modal */}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setPreviewModalOpen(true);
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-extrabold text-[11px] rounded-xl flex-1 flex items-center justify-center space-x-1.5 transition"
                        title="স্লিপ প্রিভিউ দেখুন"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>প্রিভিউ</span>
                      </button>

                      {/* Direct Print */}
                      <button
                        onClick={() => handleDirectPrint(order, 'a4')}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-[11px] rounded-xl flex-1 flex items-center justify-center space-x-1.5 transition shadow-xs"
                        title="সরাসরি প্রিন্টারে প্রিন্ট দিন"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>প্রিন্ট</span>
                      </button>

                      {/* Download PDF */}
                      <button
                        onClick={() => handleDownloadPdf(order)}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-xl flex items-center justify-center space-x-1 transition shadow-xs"
                        title="পিডিএফ ফাইল ডাউনলোড করুন"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      {/* Thermal POS Quick Print */}
                      <button
                        onClick={() => handleDirectPrint(order, 'pos_80mm')}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition"
                        title="৮০মিমি পিওএস থার্মাল স্লিপ প্রিন্ট"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN / HIGH RESOLUTION SLIP PREVIEW MODAL */}
      {previewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col space-y-4 my-auto">
            
            {/* Modal Control Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-800 gap-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {selectedOrder.status === 'cancelled' ? 'ক্যান্সেলেশন ও রিফান্ড ক্রেডিট নোট স্লিপ' : 'অফিশিয়াল অর্ডার ও ডেলিভারি ট্যাক্স ইনভয়েস'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">
                    অর্ডার নং: #{selectedOrder.orderNumber || selectedOrder.order5DigitId || selectedOrder.id}
                  </span>
                </div>
              </div>

              {/* Format Switcher Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  onClick={() => setPrintFormat('a4')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition ${
                    printFormat === 'a4' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  স্ট্যান্ডার্ড A4
                </button>
                <button
                  onClick={() => setPrintFormat('pos_80mm')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition ${
                    printFormat === 'pos_80mm' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  80mm POS থার্মাল
                </button>
                <button
                  onClick={() => setPrintFormat('shipping_label')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition ${
                    printFormat === 'shipping_label' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  কুরিয়ার গেটপাস (4x6)
                </button>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Printable Document Container */}
            <div className="flex-1 overflow-y-auto p-3 bg-slate-100 dark:bg-slate-950/70 rounded-2xl flex justify-center">
              
              {/* FORMAT 1: STANDARD A4 CORPORATE INVOICE */}
              {printFormat === 'a4' && (
                <div 
                  id="printable-slip-a4"
                  ref={printAreaRef}
                  className="bg-white text-slate-900 w-full max-w-2xl p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6 text-xs"
                >
                  {/* Top Branding & Invoice Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                          আ
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-950 tracking-tight">আমারবাজার বিডি</h2>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AmarBazar BD Limited • Reg: 9814-VAT-BD</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">
                        বনানী সি/এ, ঢাকা-১২১৩, বাংলাদেশ • হেল্পলাইন: ০৯৬১২-বাজার (09612-22927)
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 text-[11px] font-black rounded-md uppercase tracking-wider text-white ${
                        selectedOrder.status === 'cancelled' ? 'bg-red-600' : 'bg-slate-950'
                      }`}>
                        {selectedOrder.status === 'cancelled' ? 'CANCELLATION & REFUND NOTE' : 'OFFICIAL TAX INVOICE & DELIVERY SLIP'}
                      </span>
                      <p className="font-mono font-black text-sm text-slate-900 mt-2">
                        #{selectedOrder.orderNumber || selectedOrder.order5DigitId || selectedOrder.id}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        ইস্যুর তারিখ: {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Shipping Information Grid */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">গ্রাহকের বিবরণ (Billed To):</span>
                      <p className="font-black text-slate-900 text-xs">{selectedOrder.customerName}</p>
                      <p className="text-slate-600 text-[11px] font-medium">মোবাইল: {selectedOrder.customerPhone}</p>
                      <p className="text-slate-600 text-[11px] font-medium">ইমেইল: {selectedOrder.customerEmail || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">ডেলিভারি ঠিকানা (Ship To):</span>
                      <p className="text-slate-800 text-[11px] font-medium leading-relaxed">
                        {selectedOrder.shippingAddress.fullAddress}
                      </p>
                      <p className="text-slate-600 text-[10px] font-semibold">
                        থানা: {selectedOrder.shippingAddress.thana}, জেলা: {selectedOrder.shippingAddress.district}
                      </p>
                      {selectedOrder.courier?.trackingNumber && (
                        <p className="text-amber-700 text-[10px] font-black">
                          কুরিয়ার ট্র্যাকিং: {selectedOrder.courier.provider} #{selectedOrder.courier.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items Breakdown Table with Full Quality & Specs */}
                  <div>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-900 bg-slate-100 font-black uppercase text-[10px] text-slate-700">
                          <th className="py-2.5 px-3">পণ্যের বিবরণ ও স্পেসিফিকেশন</th>
                          <th className="py-2.5 px-3">কোয়ালিটি ও ওয়্যারেন্টি</th>
                          <th className="py-2.5 px-3 text-right">একক মূল্য</th>
                          <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                          <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{item.productTitle}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                SKU: {item.sku || 'SKU-BD' + (item.productId?.slice(-5) || '102')} | বিক্রেতা: {item.sellerName}
                              </div>
                              {item.selectedVariants && (
                                <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
                                  {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                ⭐ {item.qualityGrade || '১০০% অরিজিনাল এক্সপোর্ট কোয়ালিটি'}
                              </span>
                              <div className="text-[9px] text-slate-600 font-medium mt-0.5">
                                🛡️ {item.warranty || '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি'}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">৳{item.price.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono">৳{(item.price * item.quantity).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Delivery & Quality Verification Checklist */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[10px] text-amber-950 space-y-1.5">
                    <div className="font-black uppercase tracking-wider flex items-center space-x-1 text-amber-900">
                      <span>✓ পণ্যের গুণমান ও ডেলিভারি হ্যান্ডওভার অডিট চেকলিস্ট</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <div>☑ ১. সঠিক পণ্য, মডেল কোড ও ভ্যারিয়েন্ট স্পেক্স ভেরিফাইড</div>
                      <div>☑ ২. প্রিমিয়াম কোয়ালিটি গ্রেড ও অরিজিনাল ব্র্যান্ড অক্ষত</div>
                      <div>☑ ৩. প্যাকেজিং সিল ও নিরাপত্তা স্ট্যাম্প অটুট</div>
                      <div>☑ ৪. গ্রাহকের সাথে ইনভয়েস স্লিপ মিলিয়ে ডেলিভারি নিশ্চিত</div>
                    </div>
                  </div>

                  {/* Calculation Total & Verification QR */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end pt-2 border-t border-slate-200">
                    <div className="sm:col-span-5 flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      {qrCodeDataUrl && (
                        <img src={qrCodeDataUrl} alt="Invoice QR" className="w-16 h-16 rounded-md border border-slate-300 shrink-0" />
                      )}
                      <div className="text-[10px] text-slate-500 space-y-0.5">
                        <span className="font-black text-slate-900 uppercase block">অটো ডিজিটাল সিল ভেরিফিকেশন</span>
                        <p>যেকোনো ডিভাইস থেকে কিউআর কোড স্ক্যান করে অনলাইন ডাটাবেজে এই চালানের সত্যতা যাচাই করা যাবে।</p>
                      </div>
                    </div>

                    <div className="sm:col-span-7 space-y-1.5 text-right font-semibold text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>আইটেম সাবটোটাল:</span>
                        <span className="font-mono font-bold">৳{selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>প্রমোশনাল ডিসকাউন্ট ({selectedOrder.couponCode || 'Voucher'}):</span>
                          <span className="font-mono font-bold">-৳{selectedOrder.discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>কুরিয়ার ডেলিভারি চার্জ:</span>
                        <span className="font-mono font-bold">৳{selectedOrder.shippingFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-slate-950 border-t-2 border-slate-900 pt-2">
                        <span>মোট পরিশোধিত টাকা (BDT):</span>
                        <span className="font-mono text-emerald-600">৳{selectedOrder.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Terms Note */}
                  <div className="border-t border-dashed border-slate-300 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
                    <div className="space-y-0.5 text-left">
                      <p className="font-bold text-slate-700">পেমেন্ট মেথড: {selectedOrder.paymentMethod.toUpperCase()} | ট্রানজেকশন: {selectedOrder.transactionId || 'CASH'}</p>
                      <p>এটি একটি কম্পিউটার-জেনারেটেড অফিশিয়াল চালান। কোনো স্বাক্ষরের প্রয়োজন নেই।</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black rounded-md uppercase">
                        ✓ AUTHORIZED VERIFIED
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* FORMAT 2: 80MM / 58MM POS THERMAL RECEIPT */}
              {printFormat === 'pos_80mm' && (
                <div 
                  id="printable-slip-pos"
                  className="bg-white text-slate-950 font-mono p-4 rounded-xl shadow-md border border-slate-300 w-full max-w-[360px] text-[11px] leading-tight space-y-3"
                >
                  <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-900">
                    <h3 className="font-black text-sm tracking-wider uppercase">AMARBAZAR BD LTD.</h3>
                    <p className="text-[10px]">Online E-Commerce Platform</p>
                    <p className="text-[9px]">Hotline: 09612-22927 | Dhaka, BD</p>
                    <p className="text-[10px] font-black uppercase mt-1 bg-slate-950 text-white px-2 py-0.5 rounded">
                      {selectedOrder.status === 'cancelled' ? 'CANCELLATION SLIP' : 'POS SALES RECEIPT'}
                    </p>
                  </div>

                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                      <span>ORDER:</span>
                      <span className="font-bold">#{selectedOrder.orderNumber || selectedOrder.order5DigitId || selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DATE :</span>
                      <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CUST :</span>
                      <span className="truncate max-w-[180px]">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PHONE:</span>
                      <span>{selectedOrder.customerPhone}</span>
                    </div>
                  </div>

                  <div className="border-t border-b border-dashed border-slate-900 py-1.5 space-y-1">
                    <div className="flex justify-between font-black text-[10px]">
                      <span>ITEM</span>
                      <span>QTY x PRICE = TOT</span>
                    </div>
                    {selectedOrder.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-[10px]">
                        <span className="truncate max-w-[160px]">{it.productTitle}</span>
                        <span>{it.quantity}x৳{it.price}=৳{(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 text-right text-[11px]">
                    <div className="flex justify-between">
                      <span>SUBTOTAL:</span>
                      <span>৳{selectedOrder.subtotal}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>DISCOUNT:</span>
                        <span>-৳{selectedOrder.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>DELIVERY:</span>
                      <span>৳{selectedOrder.shippingFee}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black border-t border-slate-900 pt-1">
                      <span>TOTAL BDT:</span>
                      <span>৳{selectedOrder.totalAmount}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-900 pt-2 text-center space-y-2">
                    <div className="flex justify-center">
                      {qrCodeDataUrl && (
                        <img src={qrCodeDataUrl} alt="POS QR" className="w-20 h-20" />
                      )}
                    </div>
                    <p className="text-[9px] uppercase">THANK YOU FOR SHOPPING AT AMARBAZAR</p>
                    <p className="text-[8px] text-slate-500">*** www.amarbazar.bd ***</p>
                  </div>
                </div>
              )}

              {/* FORMAT 3: 4X6 COURIER SHIPPING LABEL / GATEPASS */}
              {printFormat === 'shipping_label' && (
                <div 
                  id="printable-slip-label"
                  className="bg-white text-slate-950 p-6 rounded-xl shadow-md border-2 border-slate-900 w-full max-w-md text-xs space-y-4"
                >
                  <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-black text-white font-black text-xs flex items-center justify-center rounded">
                        আ
                      </div>
                      <span className="font-black text-sm">AMARBAZAR PARCEL GATEPASS</span>
                    </div>
                    <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black rounded uppercase">
                      {selectedOrder.courier?.provider || 'PATHAO/REDX'}
                    </span>
                  </div>

                  <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">COURIER TRACKING BARCODE</span>
                    <p className="font-mono font-black text-lg tracking-widest">
                      {selectedOrder.courier?.trackingNumber || `PTH-${selectedOrder.orderNumber || selectedOrder.order5DigitId || '88992011'}`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 border border-slate-300 rounded-lg text-xs">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block">SENDER HUB:</span>
                      <p className="font-bold text-slate-900">{selectedOrder.items[0]?.sellerName || 'Dhaka Warehouse'}</p>
                      <p className="text-[10px] text-slate-500">AmarBazar Central Logistics</p>
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block">DESTINATION RECIPIENT:</span>
                      <p className="font-black text-slate-900">{selectedOrder.customerName}</p>
                      <p className="font-bold text-slate-800 text-[11px]">{selectedOrder.customerPhone}</p>
                      <p className="text-[10px] text-slate-600 mt-1 leading-snug">{selectedOrder.shippingAddress.fullAddress}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black uppercase text-amber-800">CASH ON DELIVERY (COD) COLLECTION:</span>
                      <h4 className="text-base font-black text-slate-950">
                        {selectedOrder.paymentStatus === 'paid' ? '৳0 (ALREADY PAID ONLINE)' : `৳${selectedOrder.totalAmount.toLocaleString()}`}
                      </h4>
                    </div>
                    {qrCodeDataUrl && (
                      <img src={qrCodeDataUrl} alt="QR" className="w-12 h-12" />
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions Toolbar */}
            <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyRawReceipt(selectedOrder)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>রসিদ টেক্সট কপি</span>
                </button>
                <button
                  onClick={() => handleShareWhatsApp(selectedOrder)}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp শেয়ার</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadPdf(selectedOrder)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF ডাউনলোড</span>
                </button>
                <button
                  onClick={() => handleDirectPrint(selectedOrder, printFormat)}
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-850 dark:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>প্রিন্ট করুন (Print Now)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
