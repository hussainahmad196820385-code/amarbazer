import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../translations';
import { api } from '../../services/api';

interface CartDrawerProps {
  onProceedToCheckout: (subtotal: number, discount: number, shipping: number, total: number, coupon?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { 
    isCartOpen, setIsCartOpen, cart, updateCartQuantity, removeFromCart, 
    language, currency, formatPrice, systemSettings 
  } = useApp();

  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');
  const [isInsideDhaka, setIsInsideDhaka] = useState<boolean>(true);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.calculatedPrice * item.quantity, 0);
  const shippingFee = subtotal > 5000 
    ? 0 
    : (isInsideDhaka ? systemSettings.insideDhakaShippingFee : systemSettings.outsideDhakaShippingFee);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await api.validateCoupon(couponInput.trim(), subtotal);
      if (res.valid && res.discountAmount) {
        setAppliedCoupon(couponInput.trim().toUpperCase());
        setDiscountAmount(res.discountAmount);
        setCouponSuccess(language === 'bn' ? `কুপন সফল! ${formatPrice(res.discountAmount)} সাশ্রয় হয়েছে` : `Coupon applied! Saved ${formatPrice(res.discountAmount)}`);
      } else {
        setCouponError(res.message || 'Invalid coupon');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Coupon verification failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
          
          {/* Header */}
          <div className="p-4 bg-emerald-800 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
              <h3 className="font-bold text-base">{getTranslation(language, 'cart')} ({cart.length})</h3>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-emerald-700 rounded-full transition text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-4 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-medium text-xs">Your shopping cart is currently empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.product.id}-${idx}`} className="pt-3 flex space-x-3 items-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                      {language === 'bn' ? (item.product.titleBn || item.product.title) : language === 'ar' ? (item.product.titleAr || item.product.title) : item.product.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {formatPrice(item.calculatedPrice)}
                    </p>

                    {/* Render Selected Variants */}
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.selectedVariants).map(([key, val]) => {
                          const translateOption = (opt: string) => {
                            if (language !== 'bn') return opt;
                            const translations: Record<string, string> = {
                              'S': 'S',
                              'M': 'M',
                              'L': 'L',
                              'XL': 'XL',
                              'XXL': 'XXL',
                              'Black': 'কালো',
                              'White': 'সাদা',
                              'Blue': 'নীল',
                              'Red': 'লাল',
                              'Gray': 'ধূসর',
                              'Silver': 'রুপালি',
                              'Navy Blue': 'নেভি ব্লু',
                              'Standard': 'সাধারণ',
                              'Pro / Plus': 'প্রো / প্লাস',
                              '250g': '২৫০ গ্রাম',
                              '500g': '৫০০ গ্রাম',
                              '1kg': '১ কেজি',
                              '2kg': '২ কেজি',
                              'Large': 'বড়'
                            };
                            return translations[opt] || opt;
                          };

                          const label = language === 'bn'
                            ? (key === 'Size' ? 'সাইজ' : key === 'Color' ? 'রং' : key === 'Capacity' ? 'ধারণক্ষমতা' : key === 'Weight' ? 'ওজন' : key)
                            : key;

                          return (
                            <span 
                              key={key} 
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/15"
                            >
                              {label}: {translateOption(val as string)}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Quantity modifier */}
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedVariants)}
                          className="px-2 py-0.5 font-bold text-xs text-slate-600 dark:text-slate-300"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedVariants)}
                          className="px-2 py-0.5 font-bold text-xs text-slate-600 dark:text-slate-300"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedVariants)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {formatPrice(item.calculatedPrice * item.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-3">
              
              {/* Delivery Destination toggle */}
              <div className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  {language === 'bn' ? 'ডেলিভারি এলাকা:' : 'Delivery Location:'}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setIsInsideDhaka(true)}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${isInsideDhaka ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
                  >
                    {language === 'bn' ? `ঢাকার ভেতর (${formatPrice(systemSettings.insideDhakaShippingFee || 60)})` : `Inside Dhaka (${formatPrice(systemSettings.insideDhakaShippingFee || 60)})`}
                  </button>
                  <button
                    onClick={() => setIsInsideDhaka(false)}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${!isInsideDhaka ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
                  >
                    {language === 'bn' ? `ঢাকার বাইরে (${formatPrice(systemSettings.outsideDhakaShippingFee || 120)})` : `Outside (${formatPrice(systemSettings.outsideDhakaShippingFee || 120)})`}
                  </button>
                </div>
              </div>

              {/* Coupon Code input */}
              <div className="space-y-1">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={language === 'bn' ? 'কুপন কোড (যেমন: EID2026)' : 'Coupon (e.g. EID2026)'}
                      className="w-full pl-8 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs uppercase"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs rounded-lg hover:bg-slate-900 transition"
                  >
                    {language === 'bn' ? 'প্রয়োগ' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-medium">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-emerald-600 font-medium flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" />{couponSuccess}</p>}
              </div>

              {/* Summary Breakdown */}
              <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-slate-500">
                  <span>{language === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{language === 'bn' ? `ডিসকাউন্ট (${appliedCoupon}):` : `Discount (${appliedCoupon}):`}</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>{language === 'bn' ? 'ডেলিভারি ফি:' : 'Shipping Fee:'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {shippingFee === 0 ? (language === 'bn' ? 'ফ্রি' : 'FREE') : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1">
                  <span>{language === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Total Payable:'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={() => {
                  onProceedToCheckout(subtotal, discountAmount, shippingFee, totalAmount, appliedCoupon || undefined);
                  setIsCartOpen(false);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md"
              >
                <span>{language === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
