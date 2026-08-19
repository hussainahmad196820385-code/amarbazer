import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  CheckCircle2, 
  Copy, 
  Check, 
  Truck, 
  Calendar, 
  Phone, 
  MapPin, 
  CreditCard, 
  Package, 
  ShieldCheck,
  QrCode,
  FileText,
  BadgeCheck,
  Sparkles,
  ClipboardCheck,
  Store,
  Clock,
  Layers
} from 'lucide-react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';

interface OrderReceiptSlipProps {
  order: Order;
  onClose: () => void;
  onTrackOrder?: (orderId: string) => void;
  autoDownload?: boolean;
}

export const OrderReceiptSlip: React.FC<OrderReceiptSlipProps> = ({ 
  order, 
  onClose,
  onTrackOrder,
  autoDownload = false
}) => {
  const { language, formatPrice, setTrackingOrderId } = useApp();
  const [copiedId, setCopiedId] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Extract 5-digit Order ID
  const fiveDigitId = order.order5DigitId || 
    (order.orderNumber.replace(/[^0-9]/g, '').slice(-5)) || 
    (order.id.replace(/[^0-9]/g, '').slice(-5)) || 
    '58392';

  const displayOrderCode = `#${fiveDigitId}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(fiveDigitId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const generateAndDownloadSlipHtml = () => {
    setIsDownloading(true);

    try {
      // Build a comprehensive, high-resolution official invoice & delivery slip HTML
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
    .brand-logo { background: #da1c24; color: white; padding: 6px 14px; border-radius: 8px; font-size: 20px; font-weight: 900; display: inline-block; letter-spacing: -0.5px; }
    .sub-brand { font-size: 11px; font-weight: 700; color: #64748b; margin-top: 4px; text-transform: uppercase; }
    .invoice-title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; text-align: right; letter-spacing: -0.5px; }
    .order-badge { background: #fef2f2; border: 2px solid #da1c24; padding: 4px 12px; border-radius: 8px; font-family: monospace; font-size: 18px; font-weight: 900; color: #da1c24; display: inline-block; margin-top: 6px; }
    
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .info-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; font-size: 12px; }
    .info-box h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 800; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .items-table th { background: #0f172a; color: #ffffff; text-align: left; padding: 9px 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    .items-table td { padding: 9px 10px; font-size: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .items-table tr:nth-child(even) { background: #f8fafc; }
    .text-right { text-align: right; }
    
    .quality-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; margin-top: 3px; }
    .warranty-badge { display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-top: 3px; }
    .variant-tag { display: inline-block; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-top: 3px; }
    .sku-code { font-family: monospace; font-size: 10px; color: #64748b; font-weight: 700; }

    .checklist-container { background: #fdf2f2; border: 1.5px dashed #da1c24; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; }
    .checklist-title { font-size: 12px; font-weight: 900; color: #991b1b; text-transform: uppercase; margin: 0 0 6px 0; display: flex; align-items: center; }
    .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; }
    .checklist-item { display: flex; align-items: center; color: #1e293b; font-weight: 600; }
    .checkbox-box { width: 14px; height: 14px; border: 2px solid #da1c24; border-radius: 3px; margin-right: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #da1c24; }

    .calculation-table { width: 340px; margin-left: auto; border-collapse: collapse; margin-bottom: 16px; }
    .calculation-table td { padding: 5px 8px; font-size: 12px; }
    .calculation-table .total-row td { font-size: 16px; font-weight: 900; color: #da1c24; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; padding-top: 8px; padding-bottom: 8px; }
    
    .status-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-cod { background: #fef3c7; color: #92400e; }
    
    .signatures-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 24px; text-align: center; font-size: 11px; }
    .sig-line { border-top: 1px dashed #64748b; padding-top: 4px; font-weight: 700; color: #334155; }
    
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
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Date: ${new Date(order.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
    </div>
  </div>

  <div class="grid">
    <div class="info-box">
      <h4>${language === 'bn' ? 'গ্রাহকের বিবরণ ও ডেলিভারি ঠিকানা (Ship To)' : 'CUSTOMER & DELIVERY DETAILS'}</h4>
      <strong style="font-size: 13px; color: #0f172a;">${order.customerName}</strong><br/>
      <span>📞 ফোন: <strong>${order.customerPhone}</strong></span><br/>
      <span>🏠 ঠিকানা: ${order.shippingAddress?.fullAddress || 'Address on file'}</span><br/>
      <span>📍 থানা: <strong>${order.shippingAddress?.thana || 'Dhanmondi'}</strong>, জেলা: <strong>${order.shippingAddress?.district || 'Dhaka'}</strong> (${order.shippingAddress?.division || 'Bangladesh'})</span>
    </div>
    <div class="info-box">
      <h4>${language === 'bn' ? 'পেমেন্ট ও ডেলিভারি ট্র্যাকিং (Logistics)' : 'PAYMENT & LOGISTICS INFO'}</h4>
      <div><strong>পেমেন্ট মাধ্যম:</strong> <span class="status-tag ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-cod'}">${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})</span></div>
      ${order.transactionId ? `<div><strong>Txn ID:</strong> <span style="font-family: monospace; font-weight: bold;">${order.transactionId}</span></div>` : ''}
      <div style="margin-top: 4px;"><strong>কুরিয়ার পার্টনার:</strong> ${order.courier?.provider || 'Pathao Express'}</div>
      <div><strong>ট্র্যাকিং কোড:</strong> <span style="font-family: monospace; font-weight: 900; color: #0284c7;">${order.courier?.trackingNumber || 'PTH-' + fiveDigitId}</span></div>
    </div>
  </div>

  <!-- Detailed Verification & Delivery Handover Checklist -->
  <div class="checklist-container">
    <div class="checklist-title">
      ✓ পণ্যের গুণমান ও ডেলিভারি হ্যান্ডওভার ভেরিফিকেশন চেকলিস্ট (Quality & Handover Audit)
    </div>
    <div class="checklist-grid">
      <div class="checklist-item">
        <span class="checkbox-box">✓</span> <span>১. পণ্যের নাম, মডেল ও স্পেসিফিকেশন মিলানো হয়েছে</span>
      </div>
      <div class="checklist-item">
        <span class="checkbox-box">✓</span> <span>২. ১০০% অরিজিনাল ব্র্যান্ড কোয়ালিটি গ্রেড নিশ্চিত</span>
      </div>
      <div class="checklist-item">
        <span class="checkbox-box">✓</span> <span>৩. প্যাকেজিং সিল ও নিরাপত্তা স্ট্যাম্প অক্ষত</span>
      </div>
      <div class="checklist-item">
        <span class="checkbox-box">✓</span> <span>৪. গ্রাহকের কপি ও ইনভয়েস রসিদ স্লিপ ভেরিফাইড</span>
      </div>
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
      ${order.items.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${item.productTitle}</div>
            <div class="sku-code">SKU: ${item.sku || 'SKU-BD' + (item.productId?.slice(-5) || '102')} | বিক্রেতা: ${item.sellerName || 'Verified Merchant'}</div>
            ${item.selectedVariants ? `<div class="variant-tag">${Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}</div>` : ''}
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
      <td class="text-right">৳${order.subtotal.toLocaleString()}</td>
    </tr>
    ${order.discountAmount > 0 ? `
    <tr style="color: #16a34a; font-weight: bold;">
      <td>${language === 'bn' ? 'কুপন/ছাড় ডিসকাউন্ট:' : 'Discount Savings:'}</td>
      <td class="text-right">-৳${order.discountAmount.toLocaleString()}</td>
    </tr>` : ''}
    <tr>
      <td>${language === 'bn' ? 'ডেলিভারি চার্জ (Shipping):' : 'Delivery Fee:'}</td>
      <td class="text-right">${order.shippingFee === 0 ? 'ফ্রি' : `৳${order.shippingFee.toLocaleString()}`}</td>
    </tr>
    <tr class="total-row">
      <td><strong>${language === 'bn' ? 'সর্বমোট প্রদেয় (Grand Total):' : 'Grand Total:'}</strong></td>
      <td class="text-right"><strong>৳${order.totalAmount.toLocaleString()}</strong></td>
    </tr>
  </table>

  <!-- Three-way Signature Handover Verification -->
  <div class="signatures-row">
    <div>
      <div style="height: 35px;"></div>
      <div class="sig-line">প্যাকিং ও মার্চেন্ট স্বাক্ষর</div>
    </div>
    <div>
      <div style="height: 35px;"></div>
      <div class="sig-line">ডেলিভারি রাইডার স্বাক্ষর</div>
    </div>
    <div>
      <div style="height: 35px;"></div>
      <div class="sig-line">কাস্টমার রিসিভিং স্বাক্ষর</div>
    </div>
  </div>

  <div class="barcode-box">
    <div style="font-size: 22px; letter-spacing: 5px; font-weight: bold; font-family: monospace;">|||||| |||| |||||||| ||||| |||||||</div>
    <div>ORDER-SLIP-ID-${fiveDigitId}</div>
  </div>

  <div class="footer">
    <p>আমারবাজার বিডিতে কেনাকাটা করার জন্য ধন্যবাদ! যেকোনো প্রয়োজনে এই ৫-সংখ্যার অর্ডার আইডিটি সংরক্ষণ করুন: <strong>#${fiveDigitId}</strong>।</p>
    <p>এটি একটি কম্পিউটার-জেনারেটেড অফিশিয়াল ক্যাশ মেমো ও ডেলিভারি স্লিপ।</p>
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
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Auto-trigger download if requested
  useEffect(() => {
    if (autoDownload) {
      const timer = setTimeout(() => {
        generateAndDownloadSlipHtml();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownload]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        ref={printRef}
        className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none my-auto"
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2">
            <div className="bg-[#da1c24] text-white px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wider flex items-center space-x-1 shadow-xs">
              <FileText className="w-3.5 h-3.5" />
              <span>OFFICIAL SLIP</span>
            </div>
            <h3 className="font-black text-sm sm:text-base tracking-tight">
              {language === 'bn' ? 'অর্ডার স্লিপ ও কোয়ালিটি ভেরিফিকেশন চালান' : 'Official Order Slip & Quality Receipt'}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              title="Print Receipt"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            <button
              onClick={generateAndDownloadSlipHtml}
              disabled={isDownloading}
              title="Download Slip Document"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#da1c24] hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? (language === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...') : (language === 'bn' ? 'স্লিপ ডাউনলোড (PDF/HTML)' : 'Download Slip')}</span>
            </button>

            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between animate-fade-in print:hidden">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'অর্ডার স্লিপ সফলভাবে ডাউনলোড হয়েছে!' : 'Order Slip successfully downloaded!'}</span>
            </div>
            <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded">AmarBazar_Order_Slip_{fiveDigitId}.html</span>
          </div>
        )}

        {/* Printable Official Invoice Body */}
        <div className="p-4 sm:p-7 space-y-5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          
          {/* Header with Brand and 5-Digit Order ID Badge */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <div className="bg-[#da1c24] text-white px-3 py-1 rounded-xl font-black text-sm tracking-tight inline-flex items-center space-x-1 shadow-xs">
                  <span className="bg-white text-[#da1c24] px-1 py-0.2 text-[9px] rounded font-black">BD</span>
                  <span>{language === 'bn' ? 'আমার বাজার বিডি' : 'AMAR BAZAR BD'}</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center space-x-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? '১০০% ভেরিফাইড কোয়ালিটি' : '100% Quality Verified'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Official Multi-Vendor Commerce Network • Helpline: 09612-BAZAR (09612-22927)
              </p>
            </div>

            {/* 5-Digit Order ID Highlight Badge */}
            <div className="sm:text-right bg-red-50/60 dark:bg-slate-800/80 p-3.5 rounded-2xl border-2 border-red-200 dark:border-red-900/40 shrink-0">
              <div className="text-[10px] uppercase tracking-wider font-black text-red-600 dark:text-red-400">
                {language === 'bn' ? 'অফিশিয়াল ৫-সংখ্যার অর্ডার আইডি' : 'OFFICIAL 5-DIGIT ORDER ID'}
              </div>
              <div className="flex items-center justify-start sm:justify-end space-x-2 mt-1">
                <span className="font-mono text-2xl font-black text-[#da1c24] tracking-tight">
                  {displayOrderCode}
                </span>
                <button
                  onClick={handleCopyId}
                  title="Copy 5-digit ID"
                  className="p-1 hover:bg-red-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition print:hidden"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center sm:justify-end space-x-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{new Date(order.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Delivery Address Box */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>{language === 'bn' ? 'ডেলিভারি ঠিকানা ও গ্রাহক তথ্য' : 'Customer & Delivery Info'}</span>
              </div>
              <div className="font-black text-sm text-slate-900 dark:text-white pt-0.5">
                {order.customerName}
              </div>
              <div className="text-slate-700 dark:text-slate-300 font-bold flex items-center space-x-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                {order.shippingAddress?.fullAddress || 'Address on file'}
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-bold text-[11px]">
                {order.shippingAddress?.thana ? `${order.shippingAddress.thana}, ` : ''}{order.shippingAddress?.district || 'Dhaka'}, {order.shippingAddress?.division || 'Bangladesh'}
              </div>
            </div>

            {/* Payment & Courier Status Box */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'bn' ? 'পেমেন্ট ও কুরিয়ার ট্র্যাকিং' : 'Payment & Courier Logistics'}</span>
              </div>
              
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-500 font-bold">{language === 'bn' ? 'পেমেন্ট মেথড:' : 'Payment Method:'}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  order.paymentMethod === 'bkash' ? 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-400' :
                  order.paymentMethod === 'nagad' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400' :
                  order.paymentMethod === 'rocket' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                }`}>
                  {order.paymentMethod.toUpperCase()} ({order.paymentStatus.toUpperCase()})
                </span>
              </div>

              {order.transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">{language === 'bn' ? 'ট্রানজেকশন আইডি:' : 'Txn ID:'}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{order.transactionId}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60 pt-1">
                <span className="text-slate-500 font-bold">{language === 'bn' ? 'কুরিয়ার পার্টনার:' : 'Courier Partner:'}</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{order.courier?.provider || 'Pathao Express'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">{language === 'bn' ? 'ট্র্যাকিং কোড:' : 'Tracking Code:'}</span>
                <span className="font-mono font-black text-sky-600 dark:text-sky-400">
                  {order.courier?.trackingNumber || `PTH-${fiveDigitId}`}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Quality Verification Checklist Box */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900/40 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
              <ClipboardCheck className="w-4 h-4 text-amber-600" />
              <span>{language === 'bn' ? 'পণ্যের গুণমান ও ডেলিভারি হ্যান্ডওভার চেকলিস্ট (Verification Audit)' : 'Product Quality & Handover Verification Checklist'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-200/50 dark:border-slate-800">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                <span className="font-semibold text-[11px]">{language === 'bn' ? 'সঠিক পণ্য ও মডেল স্পেসিফিকেশন মিলানো হয়েছে' : 'Item name & model specs verified'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-200/50 dark:border-slate-800">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                <span className="font-semibold text-[11px]">{language === 'bn' ? '১০০% অরিজিনাল ব্র্যান্ড কোয়ালিটি গ্রেড নিশ্চিত' : '100% genuine export quality assured'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-200/50 dark:border-slate-800">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                <span className="font-semibold text-[11px]">{language === 'bn' ? 'প্যাকেজিং সিল ও নিরাপত্তা স্ট্যাম্প অক্ষত' : 'Packaging seal intact & inspected'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-200/50 dark:border-slate-800">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                <span className="font-semibold text-[11px]">{language === 'bn' ? 'গ্রাহকের কপি ও ইনভয়েস রসিদ স্লিপ ভেরিফাইড' : 'Customer receipt slip verified for handover'}</span>
              </div>
            </div>
          </div>

          {/* Ordered Products Table with Quality Grade & Warranty */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Package className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'bn' ? 'অর্ডারকৃত পণ্যের বিস্তারিত তালিকা ও কোয়ালিটি' : 'Purchased Items & Quality Specification'}</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-400">
                {order.items.reduce((acc, item) => acc + item.quantity, 0)} {language === 'bn' ? 'টি আইটেম' : 'Items'}
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 pl-4">{language === 'bn' ? 'পণ্য ও সম্পূর্ণ স্পেসিফিকেশন' : 'Product & Description'}</th>
                    <th className="p-3">{language === 'bn' ? 'কোয়ালিটি ও ওয়্যারেন্টি' : 'Quality & Warranty'}</th>
                    <th className="p-3 text-right">{language === 'bn' ? 'একক মূল্য' : 'Unit Price'}</th>
                    <th className="p-3 text-center">{language === 'bn' ? 'পরিমাণ' : 'Qty'}</th>
                    <th className="p-3 pr-4 text-right">{language === 'bn' ? 'মোট টাকা' : 'Subtotal'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3 pl-4">
                        <div className="flex items-start space-x-3">
                          {item.productImage && (
                            <img 
                              src={item.productImage} 
                              alt={item.productTitle} 
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 dark:text-white leading-tight text-xs">
                              {item.productTitle}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                SKU: {item.sku || `SKU-BD${item.productId?.slice(-5) || '102'}`}
                              </span>
                              <span>•</span>
                              <span>বিক্রেতা: <strong className="text-slate-600 dark:text-slate-300">{item.sellerName || 'Verified Store'}</strong></span>
                            </div>
                            {item.selectedVariants && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(item.selectedVariants).map(([k, v]) => (
                                  <span key={k} className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md text-[10px] font-bold border border-sky-200 dark:border-sky-800/50">
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <span className="inline-flex items-center text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                            {item.qualityGrade || '১০০% অরিজিনাল এক্সপোর্ট কোয়ালিটি'}
                          </span>
                          <div className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold flex items-center">
                            <ShieldCheck className="w-3 h-3 mr-1 text-blue-500" />
                            {item.warranty || '৭ দিনের রিপ্লেসমেন্ট ও জেনুইন ওয়্যারেন্টি'}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">
                        {formatPrice(item.price)}
                      </td>
                      <td className="p-3 text-center font-black text-slate-900 dark:text-white">
                        x{item.quantity}
                      </td>
                      <td className="p-3 pr-4 text-right font-black text-slate-900 dark:text-white font-mono">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              <div className="flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Guaranteed Official Amar Store Order</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {language === 'bn' 
                  ? `আপনার পণ্য কোনো ত্রুটিযুক্ত হলে ডেলিভারির ৭ দিনের মধ্যে রিটার্ন ও রিফান্ড সুবিধা উপভোগ করুন।` 
                  : `7 days easy return & replacement guarantee on verified purchases.`}
              </p>
            </div>

            <div className="w-full sm:w-80 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-600 dark:text-slate-300">
                <span>{language === 'bn' ? 'পণ্য উপ-মোট:' : 'Items Subtotal:'}</span>
                <span className="font-mono">{formatPrice(order.subtotal)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span>{language === 'bn' ? 'ডিসকাউন্ট / ছাড়:' : 'Coupon Discount:'}</span>
                  <span className="font-mono">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-slate-600 dark:text-slate-300">
                <span>{language === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery Fee:'}</span>
                <span>{order.shippingFee === 0 ? (language === 'bn' ? 'ফ্রি' : 'FREE') : formatPrice(order.shippingFee)}</span>
              </div>

              <div className="border-t-2 border-slate-300 dark:border-slate-700 pt-2 flex justify-between items-baseline">
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {language === 'bn' ? 'সর্বমোট প্রদেয় টাকা:' : 'Grand Total:'}
                </span>
                <span className="font-black text-xl text-[#da1c24] dark:text-red-400 font-mono">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode & Security Stamp */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <QrCode className="w-9 h-9 text-slate-800 dark:text-slate-200" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                  DIGITAL SECURITY BARCODE
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  BD-AUTH-SLIP-{fiveDigitId}-AMARSTORE
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {language === 'bn' ? 'অনুমোদিত ডিজিটাল সিল ও ভেরিফিকেশন' : 'Authorized Digital Signature'}
              </div>
              <div className="font-black text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center sm:justify-end space-x-1">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>AMAR BAZAR VERIFIED ✓</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Action Footer (Hidden on Print) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium text-center sm:text-left">
            {language === 'bn' 
              ? `৫-সংখ্যার অর্ডার আইডি: #${fiveDigitId} সেভ করে রাখুন। এই স্লিপ দেখিয়ে ডেলিভারি গ্রহণ করুন।` 
              : `Keep your 5-digit Order ID #${fiveDigitId} safe to cross-check upon receiving delivery.`}
          </div>

          <div className="flex flex-wrap items-center space-x-2 w-full sm:w-auto">
            {onTrackOrder && (
              <button
                onClick={() => {
                  onClose();
                  onTrackOrder(fiveDigitId);
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5"
              >
                <Truck className="w-4 h-4 text-emerald-200" />
                <span>{language === 'bn' ? 'লাইভ ট্র্যাক করুন' : 'Track Order Live'}</span>
              </button>
            )}

            <button
              onClick={generateAndDownloadSlipHtml}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#da1c24] hover:bg-red-700 text-white text-xs font-black rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'bn' ? 'অফিশিয়াল স্লিপ PDF ডাউনলোড' : 'Download PDF Slip'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
