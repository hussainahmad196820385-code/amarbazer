import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Smartphone, 
  CreditCard, 
  Banknote,
  Download,
  Printer,
  FileText,
  Truck,
  Sparkles,
  ClipboardCheck,
  Check,
  Store,
  BadgeCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Address, Order } from '../../types';
import { api } from '../../services/api';
import { getTranslation } from '../../translations';
import { OrderReceiptSlip } from '../customer/OrderReceiptSlip';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  shippingAddress: Address | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode?: string;
  onSuccess: (orderId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen, onClose, cartItems, shippingAddress,
  subtotal, discountAmount, shippingFee, totalAmount, couponCode, onSuccess
}) => {
  const { language, currency, formatPrice, currentUser, clearCart, setTrackingOrderId, setActivePanel } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [mobileNumber, setMobileNumber] = useState<string>(currentUser?.phone || '01712345678');
  const [pin, setPin] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<'details' | 'otp' | 'pin' | 'processing' | 'success'>('details');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showFullSlipModal, setShowFullSlipModal] = useState<boolean>(false);
  const [autoDownloaded, setAutoDownloaded] = useState<boolean>(false);

  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [showQr, setShowQr] = useState<boolean>(false);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        if (cartItems && cartItems.length > 0) {
          const sellerId = cartItems[0]?.product?.sellerId;
          if (sellerId) {
            const sellers = await api.getSellers();
            const foundSeller = sellers.find(s => s.sellerId === sellerId || s.id === sellerId);
            if (foundSeller) {
              setSellerInfo(foundSeller);
              if (foundSeller.bkashNumber) {
                setMobileNumber(foundSeller.bkashNumber);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching seller info in PaymentModal:", err);
      }
    };
    if (isOpen) {
      fetchSeller();
    }
  }, [cartItems, isOpen]);

  if (!isOpen) return null;

  const handleInitiatePayment = async () => {
    setError('');
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
      if (!mobileNumber || mobileNumber.length < 11) {
        setError('Please enter a valid 11-digit Bangladeshi mobile number (e.g., 01712345678)');
        return;
      }
      setIsLoading(true);
      try {
        await api.sendOtp(mobileNumber);
        setStep('otp');
      } catch (err: any) {
        setError(err.message || 'Failed to send OTP');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Card or COD direct placement
      handleFinalizeOrder();
    }
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit OTP sent to your phone');
      return;
    }
    setError('');
    setStep('pin');
  };

  const triggerDirectPdfDownload = (orderObj: Order) => {
    try {
      const fiveDigitId = orderObj.order5DigitId || orderObj.orderNumber.replace(/[^0-9]/g, '').slice(-5) || '58392';
      
      const slipHtml = `
<!DOCTYPE html>
<html lang="${language === 'bn' ? 'bn' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>AmarStore_Official_Order_Slip_${fiveDigitId}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; line-height: 1.4; padding: 20px; max-width: 820px; margin: 0 auto; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .brand-logo { background: #da1c24; color: white; padding: 6px 14px; border-radius: 8px; font-size: 20px; font-weight: 900; display: inline-block; }
    .sub-brand { font-size: 11px; font-weight: 700; color: #64748b; margin-top: 4px; text-transform: uppercase; }
    .invoice-title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; text-align: right; }
    .order-badge { background: #fef2f2; border: 2px solid #da1c24; padding: 4px 12px; border-radius: 8px; font-family: monospace; font-size: 18px; font-weight: 900; color: #da1c24; display: inline-block; margin-top: 6px; }
    
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .info-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; font-size: 12px; }
    .info-box h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .items-table th { background: #0f172a; color: #ffffff; text-align: left; padding: 9px 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .items-table td { padding: 9px 10px; font-size: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .items-table tr:nth-child(even) { background: #f8fafc; }
    .text-right { text-align: right; }
    
    .quality-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; margin-top: 3px; }
    .warranty-badge { display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-top: 3px; }
    .sku-code { font-family: monospace; font-size: 10px; color: #64748b; font-weight: 700; }

    .checklist-container { background: #fdf2f2; border: 1.5px dashed #da1c24; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; }
    .checklist-title { font-size: 12px; font-weight: 900; color: #991b1b; text-transform: uppercase; margin: 0 0 6px 0; }
    .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; }
    .checklist-item { display: flex; align-items: center; color: #1e293b; font-weight: 600; }
    .checkbox-box { width: 14px; height: 14px; border: 2px solid #da1c24; border-radius: 3px; margin-right: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #da1c24; }

    .calculation-table { width: 340px; margin-left: auto; border-collapse: collapse; margin-bottom: 16px; }
    .calculation-table td { padding: 5px 8px; font-size: 12px; }
    .calculation-table .total-row td { font-size: 16px; font-weight: 900; color: #da1c24; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; padding-top: 8px; padding-bottom: 8px; }
    
    .status-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-cod { background: #fef3c7; color: #92400e; }
    
    .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center; margin-top: 16px; }
    .barcode-box { text-align: center; margin-top: 10px; font-family: monospace; font-size: 12px; letter-spacing: 5px; font-weight: 900; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-logo">AMAR BAZAR BD</div>
      <div class="sub-brand">Official Multi-Vendor Slip & Quality Assurance Memo</div>
      <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">Helpline: 09612-BAZAR (09612-22927) • support@amarbazar.bd</p>
    </div>
    <div style="text-align: right;">
      <h1 class="invoice-title">${language === 'bn' ? 'অফিশিয়াল অর্ডার ও ডেলিভারি স্লিপ' : 'OFFICIAL TAX INVOICE & DELIVERY SLIP'}</h1>
      <div><span class="order-badge">5-DIGIT ID: ${fiveDigitId}</span></div>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Date: ${new Date(orderObj.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
    </div>
  </div>

  <div class="grid">
    <div class="info-box">
      <h4>${language === 'bn' ? 'গ্রাহকের বিবরণ ও ডেলিভারি ঠিকানা (Ship To)' : 'CUSTOMER & DELIVERY DETAILS'}</h4>
      <strong style="font-size: 13px; color: #0f172a;">${orderObj.customerName}</strong><br/>
      <span>📞 ফোন: <strong>${orderObj.customerPhone}</strong></span><br/>
      <span>🏠 ঠিকানা: ${orderObj.shippingAddress?.fullAddress || 'Address on file'}</span><br/>
      <span>📍 থানা: <strong>${orderObj.shippingAddress?.thana || 'Dhanmondi'}</strong>, জেলা: <strong>${orderObj.shippingAddress?.district || 'Dhaka'}</strong> (${orderObj.shippingAddress?.division || 'Bangladesh'})</span>
    </div>
    <div class="info-box">
      <h4>${language === 'bn' ? 'পেমেন্ট ও ডেলিভারি ট্র্যাকিং (Logistics)' : 'PAYMENT & LOGISTICS INFO'}</h4>
      <div><strong>পেমেন্ট মাধ্যম:</strong> <span class="status-tag ${orderObj.paymentStatus === 'paid' ? 'status-paid' : 'status-cod'}">${orderObj.paymentMethod.toUpperCase()} (${orderObj.paymentStatus.toUpperCase()})</span></div>
      ${orderObj.transactionId ? `<div><strong>Txn ID:</strong> <span style="font-family: monospace; font-weight: bold;">${orderObj.transactionId}</span></div>` : ''}
      <div style="margin-top: 4px;"><strong>কুরিয়ার পার্টনার:</strong> ${orderObj.courier?.provider || 'Pathao Express'}</div>
      <div><strong>ট্র্যাকিং কোড:</strong> <span style="font-family: monospace; font-weight: 900; color: #0284c7;">${orderObj.courier?.trackingNumber || 'PTH-' + fiveDigitId}</span></div>
    </div>
  </div>

  <!-- Detailed Verification & Delivery Handover Checklist -->
  <div class="checklist-container">
    <div class="checklist-title">
      ✓ পণ্যের গুণমান ও ডেলিভারি হ্যান্ডওভার ভেরিফিকেশন চেকলিস্ট (Quality & Handover Audit)
    </div>
    <div class="checklist-grid">
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>১. পণ্যের নাম, মডেল ও স্পেসিফিকেশন মিলানো হয়েছে</span></div>
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>২. ১০০% অরিজিনাল ব্র্যান্ড কোয়ালিটি গ্রেড নিশ্চিত</span></div>
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>৩. প্যাকেজিং সিল ও নিরাপত্তা স্ট্যাম্প অক্ষত</span></div>
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>৪. গ্রাহকের কপি ও ইনভয়েস রসিদ স্লিপ ভেরিফাইড</span></div>
    </div>
  </div>

  <!-- Items Table with Full Quality and Product Specifications -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 45%;">${language === 'bn' ? 'পণ্য ও সম্পূর্ণ স্পেসিফিকেশন' : 'PRODUCT & SPECIFICATIONS'}</th>
        <th style="width: 20%;">${language === 'bn' ? 'কোয়ালিটি ও ওয়্যারেন্টি' : 'QUALITY & WARRANTY'}</th>
        <th style="width: 12%;" class="text-right">${language === 'bn' ? 'একক মূল্য' : 'PRICE'}</th>
        <th style="width: 6%; text-align: center;">${language === 'bn' ? 'পরিমাণ' : 'QTY'}</th>
        <th style="width: 12%;" class="text-right">${language === 'bn' ? 'মোট টাকা' : 'TOTAL'}</th>
      </tr>
    </thead>
    <tbody>
      ${orderObj.items.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${item.productTitle}</div>
            <div class="sku-code">SKU: ${item.sku || 'SKU-BD' + (item.productId?.slice(-5) || '102')} | বিক্রেতা: ${item.sellerName || 'Verified Merchant'}</div>
            ${item.selectedVariants ? `<div style="font-size: 10px; color: #3b82f6; font-weight: bold; margin-top: 2px;">${Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}</div>` : ''}
          </td>
          <td>
            <div><span class="quality-badge">⭐ ${item.qualityGrade || '১০০% অরিজিনাল এক্সপোর্ট কোয়ালিটি'}</span></div>
            <div><span class="warranty-badge">🛡️ ${item.warranty || '৭ দিনের রিপ্লেসমেন্ট ও জেনুইন ওয়্যারেন্টি'}</span></div>
          </td>
          <td class="text-right">৳${item.price.toLocaleString()}</td>
          <td style="text-align: center; font-weight: 900;">${item.quantity}</td>
          <td class="text-right" style="font-weight: 900;">৳${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Financial Calculation Breakdown -->
  <table class="calculation-table">
    <tr>
      <td>${language === 'bn' ? 'পণ্য উপ-মোট (Subtotal):' : 'Items Subtotal:'}</td>
      <td class="text-right">৳${orderObj.subtotal.toLocaleString()}</td>
    </tr>
    ${orderObj.discountAmount > 0 ? `
    <tr style="color: #16a34a; font-weight: bold;">
      <td>${language === 'bn' ? 'কুপন/ছাড় ডিসকাউন্ট:' : 'Discount Savings:'}</td>
      <td class="text-right">-৳${orderObj.discountAmount.toLocaleString()}</td>
    </tr>` : ''}
    <tr>
      <td>${language === 'bn' ? 'ডেলিভারি চার্জ (Shipping):' : 'Delivery Fee:'}</td>
      <td class="text-right">${orderObj.shippingFee === 0 ? 'ফ্রি' : `৳${orderObj.shippingFee.toLocaleString()}`}</td>
    </tr>
    <tr class="total-row">
      <td><strong>${language === 'bn' ? 'সর্বমোট প্রদেয় (Grand Total):' : 'Grand Total:'}</strong></td>
      <td class="text-right"><strong>৳${orderObj.totalAmount.toLocaleString()}</strong></td>
    </tr>
  </table>

  <div class="barcode-box">
    <div style="font-size: 22px; letter-spacing: 5px; font-weight: bold; font-family: monospace;">|||||| |||| |||||||| ||||| |||||||</div>
    <div>ORDER-SLIP-ID-${fiveDigitId}</div>
  </div>

  <div class="footer">
    <p>আমারবাজার বিডিতে কেনাকাটা করার জন্য ধন্যবাদ! যেকোনো প্রয়োজনে এই ৫-সংখ্যার অর্ডার আইডিটি সংরক্ষণ করুন: <strong>#${fiveDigitId}</strong>।</p>
  </div>
</body>
</html>
      `;

      const blob = new Blob([slipHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AmarBazar_Order_Slip_${fiveDigitId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setAutoDownloaded(true);
    } catch (e) {
      console.warn('Auto download slip error:', e);
    }
  };

  const handleFinalizeOrder = async () => {
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && step === 'pin') {
      if (!pin || pin.length < 4) {
        setError('Please enter your 4 or 5 digit PIN code');
        return;
      }
    }

    setError('');
    setIsLoading(true);
    setStep('processing');

    try {
      // 1. Verify Payment if bKash/Nagad
      if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
        await api.verifyBkashPayment({ mobileNumber, pin, otp });
      }

      // 2. Build Enriched Items Payload with Complete Product Quality and Attributes
      const itemsPayload = cartItems.map(item => {
        const p = item.product || {};
        const quality = p.tags?.find((t: string) => /premium|export|original|authentic|grade|100%/i.test(t)) || 
                       (p.brand ? `${p.brand} Official Grade` : '১০০% অরিজিনাল এক্সপোর্ট কোয়ালিটি');
        return {
          productId: p.id,
          productTitle: p.titleBn && language === 'bn' ? `${p.titleBn} (${p.title})` : p.title,
          productImage: p.images?.[0] || '',
          sellerId: p.sellerId || 'usr-seller-1',
          sellerName: p.sellerName || 'Verified Merchant Store',
          quantity: item.quantity,
          price: item.calculatedPrice,
          selectedVariants: item.selectedVariants,
          qualityGrade: quality,
          warranty: p.warranty || '৭ দিনের রিপ্লেসমেন্ট ও জেনুইন ওয়্যারেন্টি',
          sku: p.sku || `SKU-${p.id?.slice(-5)?.toUpperCase() || 'BD102'}`,
          category: p.categoryName || 'General',
          unit: 'Pcs'
        };
      });

      const newOrd = await api.createOrder({
        userId: currentUser?.id || 'usr-demo-cust',
        customerName: shippingAddress?.recipientName || currentUser?.name || 'Customer',
        customerPhone: shippingAddress?.phone || mobileNumber,
        customerEmail: currentUser?.email || 'customer@amarbazar.bd',
        shippingAddress: shippingAddress || {
          id: 'addr-default',
          title: 'Home',
          recipientName: currentUser?.name || 'Customer',
          phone: mobileNumber,
          division: 'Dhaka',
          district: 'Dhaka',
          thana: 'Dhanmondi',
          fullAddress: 'House 42, Road 10/A, Dhanmondi, Dhaka',
          isDefault: true
        },
        items: itemsPayload,
        subtotal,
        discountAmount,
        couponCode,
        shippingFee,
        totalAmount,
        paymentMethod
      });

      setCreatedOrder(newOrd);
      clearCart();
      setStep('success');
      onSuccess(newOrd.id);

      // Auto-trigger direct slip download immediately upon order confirmation
      setTimeout(() => {
        triggerDirectPdfDownload(newOrd);
      }, 300);

    } catch (err: any) {
      setError(err.message || 'Order placement failed. Please try again.');
      setStep('details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
          
          {/* Header theme based on payment method */}
          <div className={`p-4 flex items-center justify-between text-white ${
            step === 'success' ? 'bg-gradient-to-r from-emerald-600 to-teal-700' :
            paymentMethod === 'bkash' ? 'bg-pink-600' :
            paymentMethod === 'nagad' ? 'bg-orange-600' :
            paymentMethod === 'rocket' ? 'bg-purple-700' :
            'bg-slate-900'
          }`}>
            <div className="flex items-center space-x-2">
              {step === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              ) : (
                <Smartphone className="w-5 h-5" />
              )}
              <h3 className="font-black text-sm sm:text-base">
                {step === 'success' 
                  ? (language === 'bn' ? 'অর্ডার সফল ও স্লিপ প্রস্তুত!' : 'Order Placed & Slip Ready!') 
                  : (paymentMethod === 'bkash' ? 'bKash Payment Gateway' :
                     paymentMethod === 'nagad' ? 'Nagad Payment Gateway' :
                     paymentMethod === 'rocket' ? 'Rocket Payment' :
                     paymentMethod === 'card' ? 'Card Checkout' : 'Cash on Delivery')}
              </h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-black/20 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* STEP 1: Method & Phone input */}
            {step === 'details' && (
              <div className="space-y-4">
                {/* Total Banner */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">{language === 'bn' ? 'মোট প্রদেয় টাকা:' : 'Total Payable:'}</span>
                    <span className="text-[10px] text-slate-400">{cartItems.length} {language === 'bn' ? 'টি আইটেম' : 'Items'}</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatPrice(totalAmount)}</span>
                </div>

                {/* Payment Method Selector Tabs */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'bn' ? 'পেমেন্ট মেথড নির্বাচন করুন:' : 'Select Payment Method:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-2.5 border rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition cursor-pointer ${
                        paymentMethod === 'bkash'
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 ring-2 ring-pink-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-pink-600 font-black text-sm">bKash</span>
                      <span className="text-[10px] text-slate-400 font-medium">বিকাশ</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('nagad')}
                      className={`p-2.5 border rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition cursor-pointer ${
                        paymentMethod === 'nagad'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 ring-2 ring-orange-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-orange-600 font-black text-sm">Nagad</span>
                      <span className="text-[10px] text-slate-400 font-medium">নগদ</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 border rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600 mb-0.5" />
                      <span className="text-xs font-black">Cash On Delivery</span>
                    </button>
                  </div>
                </div>

                {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {paymentMethod.toUpperCase()} {language === 'bn' ? 'অ্যাকাউন্ট মোবাইল নম্বর:' : 'Account Mobile Number:'}
                      </label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{language === 'bn' ? 'আপনার পেমেন্ট ২৫৬-বিট এনক্রিপশনের মাধ্যমে সম্পূর্ণ সুরক্ষিত।' : 'Your transaction is 256-bit bank encrypted and secured.'}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleInitiatePayment}
                  disabled={isLoading}
                  className={`w-full py-3 text-white font-black rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md cursor-pointer ${
                    paymentMethod === 'bkash' ? 'bg-pink-600 hover:bg-pink-700' :
                    paymentMethod === 'nagad' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{paymentMethod === 'cod' ? (language === 'bn' ? 'অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)' : 'Confirm Order (COD)') : (language === 'bn' ? 'এগিয়ে যান ও ওটিপি পাঠান' : 'Proceed & Send OTP')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 'otp' && (
              <div className="space-y-4 text-center">
                <div>
                  <h4 className="font-black text-base">{language === 'bn' ? 'ওটিপি (OTP) ভেরিফিকেশন' : 'Enter OTP Verification Code'}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'bn' ? `${mobileNumber} নম্বরে একটি ওটিপি পাঠানো হয়েছে` : `A 6-digit code was sent to ${mobileNumber}`}
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full text-center text-2xl tracking-widest px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Demo code: 123456</p>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer"
                >
                  {language === 'bn' ? 'ওটিপি যাচাই করুন' : 'Verify OTP'}
                </button>
              </div>
            )}

            {/* STEP 3: Enter PIN */}
            {step === 'pin' && (
              <div className="space-y-4 text-center">
                <div>
                  <h4 className="font-black text-base">{paymentMethod.toUpperCase()} PIN {language === 'bn' ? 'দিন' : 'Entry'}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'bn' 
                      ? `${formatPrice(totalAmount)} পেমেন্ট অনুমোদন করতে আপনার একাউন্ট পিন দিন` 
                      : `Enter your account PIN to authorize payment of ${formatPrice(totalAmount)}`}
                  </p>
                </div>

                <div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    maxLength={5}
                    className="w-full text-center text-3xl tracking-widest px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={handleFinalizeOrder}
                  disabled={isLoading}
                  className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl text-xs transition shadow-md flex items-center justify-center cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{language === 'bn' ? 'পেমেন্ট কনফার্ম করুন' : 'Confirm & Pay Now'}</span>}
                </button>
              </div>
            )}

            {/* STEP 4: Processing spinner */}
            {step === 'processing' && (
              <div className="py-10 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
                <p className="font-black text-slate-800 dark:text-slate-100 text-sm">
                  {language === 'bn' ? 'অর্ডার প্রসেস হচ্ছে ও অফিশিয়াল স্লিপ জেনারেট হচ্ছে...' : 'Processing Order & Generating Official Slip...'}
                </p>
                <p className="text-xs text-slate-400">Please do not refresh or close this tab.</p>
              </div>
            )}

            {/* STEP 5: Rich Order Confirmation & Instant Slip Download Screen */}
            {step === 'success' && createdOrder && (
              <div className="space-y-4">
                {/* Success Banner */}
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-500/20 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                    {language === 'bn' ? 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!' : 'Order Placed Successfully!'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'bn' 
                      ? 'আপনার ক্যাশ মেমো ও ডেলিভারি স্লিপ স্বয়ংক্রিয়ভাবে ডাউনলোড হয়েছে।' 
                      : 'Your official slip and delivery receipt have been generated & downloaded.'}
                  </p>
                </div>

                {/* Auto Download Notification Badge */}
                {autoDownloaded && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">{language === 'bn' ? 'PDF/HTML স্লিপ ডাউনলোড সম্পন্ন' : 'PDF Slip Downloaded'}</span>
                    </div>
                    <span className="font-mono text-[10px] bg-emerald-200/60 dark:bg-emerald-900 px-2 py-0.5 rounded font-bold">
                      #{createdOrder.order5DigitId || createdOrder.orderNumber}
                    </span>
                  </div>
                )}

                {/* 5-Digit Order Summary Card */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl text-left text-xs space-y-2 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">{language === 'bn' ? '৫-সংখ্যার অর্ডার কোড:' : '5-Digit Order Code:'}</span>
                    <span className="font-mono font-black text-base text-[#da1c24] bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-800">
                      #{createdOrder.order5DigitId || createdOrder.orderNumber.replace(/[^0-9]/g, '').slice(-5) || '58392'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">{language === 'bn' ? 'পেমেন্ট স্ট্যাটাস:' : 'Payment Status:'}</span>
                    <span className="font-black text-emerald-600 uppercase">
                      {createdOrder.paymentMethod.toUpperCase()} ({createdOrder.paymentStatus.toUpperCase()})
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">{language === 'bn' ? 'কুরিয়ার ও ট্র্যাকিং:' : 'Courier & Tracking:'}</span>
                    <span className="font-bold text-sky-600">
                      {createdOrder.courier?.provider} ({createdOrder.courier?.trackingNumber})
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <span className="text-slate-600 dark:text-slate-300 font-bold">{language === 'bn' ? 'সর্বমোট পরিশোধিত:' : 'Total Amount:'}</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                      {formatPrice(createdOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Item & Quality Breakdown Checklist Preview */}
                <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-amber-900 dark:text-amber-300 font-black text-[11px] uppercase">
                    <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'bn' ? 'স্লিপ ভেরিফিকেশন ও ডেলিভারি চেকলিস্ট' : 'Delivery Slip Verification'}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {language === 'bn' 
                      ? 'ডেলিভারি রাইডার ও বিক্রেতা এই স্লিপের বিবরণ মিলিয়ে আপনাকে পণ্যটি হ্যান্ডওভার করবেন। আপনিও স্লিপের সাথে মিলিয়ে পণ্য বুঝে নিন।' 
                      : 'Delivery rider and seller will match all product items & quality grades against this official slip during handover.'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Instant Download Slip Button */}
                    <button
                      onClick={() => triggerDirectPdfDownload(createdOrder)}
                      className="py-2.5 px-3 bg-[#da1c24] hover:bg-red-700 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{language === 'bn' ? 'স্লিপ PDF ডাউনলোড' : 'Download PDF'}</span>
                    </button>

                    {/* View Full Official Slip Modal */}
                    <button
                      onClick={() => setShowFullSlipModal(true)}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>{language === 'bn' ? 'সম্পূর্ণ স্লিপ দেখুন' : 'View Full Slip'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Live Tracking */}
                    <button
                      onClick={() => {
                        setTrackingOrderId(createdOrder.order5DigitId || createdOrder.orderNumber);
                        onClose();
                      }}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{language === 'bn' ? 'লাইভ ট্র্যাক করুন' : 'Track Order'}</span>
                    </button>

                    {/* Go to Slips Vault */}
                    <button
                      onClick={() => {
                        setActivePanel('customer_profile');
                        onClose();
                      }}
                      className="py-2.5 px-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      {language === 'bn' ? 'স্লিপ ভল্ট দেখুন' : 'Slips Vault'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Modal Overlay */}
          {showQr && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xs p-6 text-center animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xs w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
                <button
                  type="button"
                  onClick={() => setShowQr(false)}
                  className="absolute top-3 right-3 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold text-white ${
                    paymentMethod === 'bkash' ? 'bg-pink-600' :
                    paymentMethod === 'nagad' ? 'bg-orange-600' :
                    'bg-purple-700'
                  }`}>
                    {paymentMethod.toUpperCase()} Merchant QR
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-4">
                  {language === 'bn' 
                    ? 'পেমেন্ট করতে নিচের কিউআর কোডটি স্ক্যান করুন' 
                    : 'Scan the QR code below to make payment'}
                </p>

                {/* QR Image Container */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs inline-block mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentMethod}:${mobileNumber}?amount=${totalAmount}`}
                    alt="Merchant QR Code"
                    className="w-44 h-44 mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Number details */}
                <div className="space-y-1 mb-5">
                  <p className="text-[10px] text-slate-400 font-medium">
                    {language === 'bn' ? 'মার্চেন্ট নম্বর:' : 'Merchant Number:'}
                  </p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 tracking-wider">
                    {mobileNumber}
                  </p>
                  <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatPrice(totalAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQr(false)}
                  className={`w-full py-2.5 text-xs font-bold text-white rounded-xl transition cursor-pointer ${
                    paymentMethod === 'bkash' ? 'bg-pink-600 hover:bg-pink-700' :
                    paymentMethod === 'nagad' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-purple-700 hover:bg-purple-800'
                  }`}
                >
                  {language === 'bn' ? 'ঠিক আছে' : 'Done'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Full-Screen High-Resolution Order Receipt Slip Modal */}
      {showFullSlipModal && createdOrder && (
        <OrderReceiptSlip
          order={createdOrder}
          onClose={() => setShowFullSlipModal(false)}
          onTrackOrder={(id) => {
            setShowFullSlipModal(false);
            setTrackingOrderId(id);
            onClose();
          }}
        />
      )}
    </>
  );
};
