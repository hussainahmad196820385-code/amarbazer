import React, { useRef, useState } from 'react';
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
  ExternalLink,
  ShieldCheck,
  QrCode,
  FileText
} from 'lucide-react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';

interface OrderReceiptSlipProps {
  order: Order;
  onClose: () => void;
  onTrackOrder?: (orderId: string) => void;
}

export const OrderReceiptSlip: React.FC<OrderReceiptSlipProps> = ({ 
  order, 
  onClose,
  onTrackOrder 
}) => {
  const { language, formatPrice, setTrackingOrderId } = useApp();
  const [copiedId, setCopiedId] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const handleDownloadSlip = () => {
    setIsDownloading(true);

    try {
      // Build a comprehensive, printable HTML document for instant download / print-to-pdf
      const slipHtml = `
<!DOCTYPE html>
<html lang="${language === 'bn' ? 'bn' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>Invoice-Slip-${fiveDigitId}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.5; padding: 20px; max-width: 800px; margin: 0 auto; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
    .brand-logo { background: #da1c24; color: white; padding: 6px 14px; border-radius: 8px; font-size: 18px; font-weight: 900; display: inline-block; }
    .invoice-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; text-align: right; }
    .order-badge { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 16px; font-weight: bold; color: #da1c24; display: inline-block; margin-top: 5px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; font-size: 13px; }
    .info-box h4 { margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .items-table th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
    .items-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .items-table tr:nth-child(even) { background: #fafafa; }
    .text-right { text-align: right; }
    .calculation-table { width: 320px; margin-left: auto; border-collapse: collapse; margin-bottom: 20px; }
    .calculation-table td { padding: 6px 10px; font-size: 13px; }
    .calculation-table .total-row td { font-size: 16px; font-weight: 800; color: #da1c24; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; padding-top: 10px; padding-bottom: 10px; }
    .status-tag { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-cod { background: #fef3c7; color: #92400e; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center; margin-top: 30px; }
    .barcode-box { text-align: center; margin-top: 15px; font-family: monospace; font-size: 11px; letter-spacing: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-logo">BD AMAR STORE</div>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Official Multi-Vendor Customer Invoice & Cash Memo</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8;">Helpline: +880 9612-000000 | support@amarstore.bd</p>
    </div>
    <div style="text-align: right;">
      <h1 class="invoice-title">${language === 'bn' ? 'অর্ডার ক্যাশ মেমো' : 'CUSTOMER INVOICE'}</h1>
      <div><span class="order-badge">5-DIGIT ORDER ID: ${fiveDigitId}</span></div>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">${new Date(order.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
    </div>
  </div>

  <div class="grid">
    <div class="info-box">
      <h4>${language === 'bn' ? 'ডেলিভারি ঠিকানা ও গ্রাহক তথ্য' : 'BILL TO / DELIVERY ADDRESS'}</h4>
      <strong style="font-size: 14px; color: #0f172a;">${order.customerName}</strong><br/>
      <span>📞 ${order.customerPhone}</span><br/>
      <span>🏠 ${order.shippingAddress?.fullAddress || 'Address on file'}</span><br/>
      <span>📍 ${order.shippingAddress?.thana ? `${order.shippingAddress.thana}, ` : ''}${order.shippingAddress?.district || 'Dhaka'}, ${order.shippingAddress?.division || 'Bangladesh'}</span>
    </div>
    <div class="info-box">
      <h4>${language === 'bn' ? 'পেমেন্ট ও কুরিয়ার ট্র্যাকিং' : 'PAYMENT & LOGISTICS INFO'}</h4>
      <div><strong>Payment:</strong> <span class="status-tag ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-cod'}">${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})</span></div>
      ${order.transactionId ? `<div><strong>Txn ID:</strong> <span style="font-family: monospace;">${order.transactionId}</span></div>` : ''}
      <div style="margin-top: 5px;"><strong>Courier Partner:</strong> ${order.courier?.provider || 'Pathao Express'}</div>
      <div><strong>Tracking Code:</strong> <span style="font-family: monospace; font-weight: bold; color: #0284c7;">${order.courier?.trackingNumber || 'PTH-' + fiveDigitId}</span></div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 50%;">${language === 'bn' ? 'পণ্যের বিবরণ' : 'PRODUCT DESCRIPTION'}</th>
        <th style="width: 15%;" class="text-right">${language === 'bn' ? 'একক মূল্য' : 'UNIT PRICE'}</th>
        <th style="width: 10%; text-align: center;">${language === 'bn' ? 'পরিমাণ' : 'QTY'}</th>
        <th style="width: 20%;" class="text-right">${language === 'bn' ? 'মোট টাকা' : 'TOTAL'}</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: #0f172a;">${item.productTitle}</div>
            <div style="font-size: 11px; color: #64748b;">Store: ${item.sellerName || 'Verified Seller'}</div>
            ${item.selectedVariants ? `<div style="font-size: 11px; color: #0284c7;">${Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}</div>` : ''}
          </td>
          <td class="text-right">৳${item.price.toLocaleString()}</td>
          <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
          <td class="text-right" style="font-weight: 700;">৳${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <table class="calculation-table">
    <tr>
      <td>${language === 'bn' ? 'পণ্য উপ-মোট:' : 'Items Subtotal:'}</td>
      <td class="text-right">৳${order.subtotal.toLocaleString()}</td>
    </tr>
    ${order.discountAmount > 0 ? `
    <tr style="color: #16a34a;">
      <td>${language === 'bn' ? 'কুপন/ছাড় ডিসকাউন্ট:' : 'Discount Savings:'}</td>
      <td class="text-right">-৳${order.discountAmount.toLocaleString()}</td>
    </tr>` : ''}
    <tr>
      <td>${language === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery Fee:'}</td>
      <td class="text-right">৳${order.shippingFee.toLocaleString()}</td>
    </tr>
    <tr class="total-row">
      <td><strong>${language === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Grand Total:'}</strong></td>
      <td class="text-right"><strong>৳${order.totalAmount.toLocaleString()}</strong></td>
    </tr>
  </table>

  <div class="barcode-box">
    <div style="font-size: 24px; letter-spacing: 6px; font-weight: bold;">|||||| |||| |||||||| ||||| |||||||</div>
    <div>ORDER-SLIP-ID-${fiveDigitId}</div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with BD AMAR STORE! For any queries, preserve this 5-digit Order ID: <strong>#${fiveDigitId}</strong>.</p>
    <p>This is a computer-generated official cash receipt and requires no physical seal.</p>
  </div>
</body>
</html>
      `;

      // Create a Blob and trigger direct browser download
      const blob = new Blob([slipHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AmarStore_Order_Slip_${fiveDigitId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        ref={printRef}
        className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none"
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2">
            <div className="bg-red-600 text-white px-2 py-0.5 rounded-lg text-xs font-black">
              SLIP
            </div>
            <h3 className="font-black text-sm sm:text-base tracking-tight">
              {language === 'bn' ? 'অর্ডার স্লিপ ও অফিসিয়াল মেমো' : 'Customer Order Slip & Receipt'}
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
              onClick={handleDownloadSlip}
              disabled={isDownloading}
              title="Download Slip Document"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#da1c24] hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'স্লিপ ডাউনলোড' : 'Download Slip'}</span>
            </button>

            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div className="p-5 sm:p-8 space-y-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          
          {/* Header with Brand and 5-Digit Order ID Badge */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <div className="bg-[#da1c24] text-white px-3 py-1 rounded-xl font-black text-sm tracking-tight inline-flex items-center space-x-1 shadow-xs">
                  <span className="bg-white text-[#da1c24] px-1 py-0.2 text-[9px] rounded font-black">BD</span>
                  <span>{language === 'bn' ? 'আমার স্টোর' : 'AMAR STORE'}</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {language === 'bn' ? '✓ ভেরিফাইড ক্যাশ মেমো' : '✓ Verified Receipt'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Official Multi-Vendor Commerce Network • Helpline: +880 9612-000000
              </p>
            </div>

            {/* 5-Digit Order ID Highlight Badge */}
            <div className="sm:text-right bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                {language === 'bn' ? 'অটো ৫-সংখ্যার অর্ডার আইডি' : '5-DIGIT ORDER ID'}
              </div>
              <div className="flex items-center justify-start sm:justify-end space-x-2 mt-1">
                <span className="font-mono text-2xl font-black text-[#da1c24] tracking-tight">
                  {displayOrderCode}
                </span>
                <button
                  onClick={handleCopyId}
                  title="Copy 5-digit ID"
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition print:hidden"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center sm:justify-end space-x-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{new Date(order.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { dateStyle: 'medium' })}</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Delivery Address Box */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>{language === 'bn' ? 'ডেলিভারি ঠিকানা ও গ্রাহক' : 'Recipient Details'}</span>
              </div>
              <div className="font-black text-sm text-slate-900 dark:text-white pt-1">
                {order.customerName}
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-semibold flex items-center space-x-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                {order.shippingAddress?.fullAddress || 'Address on file'}
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-bold">
                {order.shippingAddress?.thana ? `${order.shippingAddress.thana}, ` : ''}{order.shippingAddress?.district || 'Dhaka'}, {order.shippingAddress?.division || 'Bangladesh'}
              </div>
            </div>

            {/* Payment & Courier Status Box */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'bn' ? 'পেমেন্ট ও কুরিয়ার ট্র্যাকিং' : 'Payment & Courier Partner'}</span>
              </div>
              
              <div className="flex items-center justify-between pt-1">
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

              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60 pt-1.5">
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

          {/* Ordered Products Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Package className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'bn' ? 'অর্ডারকৃত পণ্যের তালিকা' : 'Purchased Items Summary'}</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-400">
                {order.items.reduce((acc, item) => acc + item.quantity, 0)} {language === 'bn' ? 'টি আইটেম' : 'Items'}
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 pl-4">{language === 'bn' ? 'পণ্য ও বিবরণ' : 'Product & Description'}</th>
                    <th className="p-3 text-right">{language === 'bn' ? 'দর' : 'Unit Price'}</th>
                    <th className="p-3 text-center">{language === 'bn' ? 'পরিমাণ' : 'Qty'}</th>
                    <th className="p-3 pr-4 text-right">{language === 'bn' ? 'মোট মূল্য' : 'Subtotal'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3 pl-4">
                        <div className="flex items-center space-x-3">
                          {item.productImage && (
                            <img 
                              src={item.productImage} 
                              alt={item.productTitle} 
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 dark:text-white leading-tight">
                              {item.productTitle}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-2">
                              <span>Seller: <strong className="text-slate-600 dark:text-slate-300">{item.sellerName || 'Verified Store'}</strong></span>
                              {item.selectedVariants && (
                                <>
                                  <span>•</span>
                                  <span className="text-sky-600 dark:text-sky-400 font-bold">
                                    {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">
                        {formatPrice(item.price)}
                      </td>
                      <td className="p-3 text-center font-black text-slate-900 dark:text-white">
                        x{item.quantity}
                      </td>
                      <td className="p-3 pr-4 text-right font-black text-slate-900 dark:text-white">
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

            <div className="w-full sm:w-72 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-600 dark:text-slate-300">
                <span>{language === 'bn' ? 'পণ্য উপ-মোট:' : 'Items Subtotal:'}</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span>{language === 'bn' ? 'ডিসকাউন্ট / ছাড়:' : 'Coupon Discount:'}</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-slate-600 dark:text-slate-300">
                <span>{language === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery Fee:'}</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-baseline">
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {language === 'bn' ? 'সর্বমোট টাকা:' : 'Grand Total:'}
                </span>
                <span className="font-black text-lg text-[#da1c24] dark:text-red-400">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode & Security Stamp */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
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
                {language === 'bn' ? 'অনুমোদিত ডিজিটাল সিল' : 'Authorized Digital Signature'}
              </div>
              <div className="font-black text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                AMAR STORE VERIFIED ✓
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Action Footer (Hidden on Print) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
            {language === 'bn' 
              ? `৫-সংখ্যার অর্ডার আইডি: #${fiveDigitId} সেভ করে রাখুন।` 
              : `Keep your 5-digit Order ID #${fiveDigitId} handy for tracking.`}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
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
              onClick={handleDownloadSlip}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#da1c24] hover:bg-red-700 text-white text-xs font-black rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'bn' ? 'স্লিপ ডাউনলোড করুন' : 'Download Slip'}</span>
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
