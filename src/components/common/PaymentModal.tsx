import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Lock, ArrowRight, Loader2, Smartphone, CreditCard, Banknote } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Address } from '../../types';
import { api } from '../../services/api';
import { getTranslation } from '../../translations';

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
  const { language, currency, formatPrice, currentUser, clearCart, setTrackingOrderId } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [mobileNumber, setMobileNumber] = useState<string>(currentUser?.phone || '01712345678');
  const [pin, setPin] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<'details' | 'otp' | 'pin' | 'processing' | 'success'>('details');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [createdOrder, setCreatedOrder] = useState<any>(null);

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

      // 2. Create Order in Backend
      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id,
        productTitle: item.product.title,
        productImage: item.product.images[0],
        sellerId: item.product.sellerId,
        sellerName: item.product.sellerName,
        quantity: item.quantity,
        price: item.calculatedPrice,
        selectedVariants: item.selectedVariants
      }));

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
          thana: 'Gulshan',
          fullAddress: 'Dhaka, Bangladesh',
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
    } catch (err: any) {
      setError(err.message || 'Order placement failed. Please try again.');
      setStep('details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header theme based on payment method */}
        <div className={`p-4 flex items-center justify-between text-white ${
          paymentMethod === 'bkash' ? 'bg-pink-600' :
          paymentMethod === 'nagad' ? 'bg-orange-600' :
          paymentMethod === 'rocket' ? 'bg-purple-700' :
          'bg-emerald-700'
        }`}>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <h3 className="font-bold text-base">
              {paymentMethod === 'bkash' ? 'bKash Payment Gateway' :
               paymentMethod === 'nagad' ? 'Nagad Payment Gateway' :
               paymentMethod === 'rocket' ? 'Rocket Payment' :
               paymentMethod === 'card' ? 'Card Checkout' : 'Cash on Delivery'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/20 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {/* STEP 1: Method & Phone input */}
          {step === 'details' && (
            <div>
              {/* Total Banner */}
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center mb-5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{language === 'bn' ? 'মোট প্রদেয়:' : 'Total Payable:'}</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(totalAmount)}</span>
              </div>

              {/* Payment Method Selector Tabs */}
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Payment Method:
              </label>
              <div className="grid grid-cols-3 gap-2 mb-5">
                <button
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-2.5 border rounded-xl flex flex-col items-center justify-center font-bold text-xs transition ${
                    paymentMethod === 'bkash'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 ring-2 ring-pink-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-pink-600 font-extrabold text-sm">bKash</span>
                  <span className="text-[10px] text-slate-400 font-normal">বিকাশ</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-2.5 border rounded-xl flex flex-col items-center justify-center font-bold text-xs transition ${
                    paymentMethod === 'nagad'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 ring-2 ring-orange-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-orange-600 font-extrabold text-sm">Nagad</span>
                  <span className="text-[10px] text-slate-400 font-normal">নগদ</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2.5 border rounded-xl flex flex-col items-center justify-center font-bold text-xs transition ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600 mb-0.5" />
                  <span className="text-xs font-bold">COD</span>
                </button>
              </div>

              {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {paymentMethod.toUpperCase()} Account Number:
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="e.g. 01712345678"
                        className="w-full pl-4 pr-24 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowQr(true)}
                        className={`absolute right-2 px-3 py-1.5 font-extrabold text-xs rounded-lg transition shadow-xs ${
                          paymentMethod === 'bkash' ? 'bg-pink-100 hover:bg-pink-200 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400' :
                          paymentMethod === 'nagad' ? 'bg-orange-100 hover:bg-orange-200 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400' :
                          'bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                        }`}
                      >
                        {language === 'bn' ? 'QR / কিউআর' : 'QR Code'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center">
                      <Lock className="w-3 h-3 mr-1 text-emerald-500" />
                      An OTP code will be sent to confirm transaction ownership.
                    </p>
                  </div>

                  <button
                    onClick={handleInitiatePayment}
                    disabled={isLoading}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-md flex items-center justify-center space-x-2 transition ${
                      paymentMethod === 'bkash' ? 'bg-pink-600 hover:bg-pink-700' :
                      paymentMethod === 'nagad' ? 'bg-orange-600 hover:bg-orange-700' :
                      'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <span>{language === 'bn' ? `পেমেন্ট সম্পন্ন করুন (${formatPrice(totalAmount)})` : `Proceed to Pay ${formatPrice(totalAmount)}`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="text-center py-4 space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-left text-xs text-emerald-800 dark:text-emerald-300">
                    <p className="font-bold mb-1">{language === 'bn' ? 'ক্যাশ অন ডেলিভারি নির্দেশিকা:' : 'Cash on Delivery Notice:'}</p>
                    <p>{language === 'bn' ? `প্যাকেজ হাতে পেয়ে ডেলিভারি এজেন্টকে ${formatPrice(totalAmount)} পরিশোধ করুন।` : `Pay ${formatPrice(totalAmount)} directly to the Pathao/RedX delivery agent upon inspecting your package.`}</p>
                  </div>
                  <button
                    onClick={handleFinalizeOrder}
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{language === 'bn' ? 'সিওডি অর্ডার নিশ্চিত করুন' : 'Confirm COD Order'}</span>}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base">Verify OTP Code</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sent to <span className="font-bold text-slate-700 dark:text-slate-200">{mobileNumber}</span> (Simulated: 123456)
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full text-center text-2xl tracking-widest px-4 py-3 border border-pink-400 rounded-xl bg-pink-50/50 dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition shadow-md"
              >
                Verify OTP & Continue
              </button>
            </div>
          )}

          {/* STEP 3: Enter PIN */}
          {step === 'pin' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-bold text-base">Enter {paymentMethod.toUpperCase()} PIN</h4>
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
                  className="w-full text-center text-3xl tracking-widest px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <button
                onClick={handleFinalizeOrder}
                disabled={isLoading}
                className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Confirm & Pay Now</span>}
              </button>
            </div>
          )}

          {/* STEP 4: Processing spinner */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
              <p className="font-bold text-slate-800 dark:text-slate-100">Communicating with Bank & Dispatching Order...</p>
              <p className="text-xs text-slate-400">Please do not refresh or close this tab.</p>
            </div>
          )}

          {/* STEP 5: Success Modal */}
          {step === 'success' && createdOrder && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                  {getTranslation(language, 'orderSuccessTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {getTranslation(language, 'orderSuccessMsg')}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Number:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{createdOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-pink-600">{createdOrder.transactionId || 'COD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Courier Assigned:</span>
                  <span className="font-bold text-emerald-600">{createdOrder.courier?.provider} ({createdOrder.courier?.trackingNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'মোট পরিশোধিত:' : 'Total Paid:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPrice(createdOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    setTrackingOrderId(createdOrder.orderNumber);
                    onClose();
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                >
                  Track Order Live
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Close
                </button>
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
                className="absolute top-3 right-3 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition animate-bounce"
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
                className={`w-full py-2.5 text-xs font-bold text-white rounded-xl transition ${
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
  );
};
