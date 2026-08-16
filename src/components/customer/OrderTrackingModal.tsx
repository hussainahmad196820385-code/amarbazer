import React, { useState, useEffect } from 'react';
import { X, Truck, CheckCircle2, PackageCheck, MapPin, Clock, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { api } from '../../services/api';

export const OrderTrackingModal: React.FC = () => {
  const { trackingOrderId, setTrackingOrderId, language, currency, formatPrice } = useApp();

  const [order, setOrder] = useState<Order | null>(null);
  const [searchId, setSearchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchOrder = async (id: string) => {
    setIsLoading(true);
    setError('');
    try {
      const ord = await api.getOrderById(id);
      setOrder(ord);
    } catch (err) {
      setError('Order not found. Please check your Order ID or tracking code.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trackingOrderId) {
      setSearchId(trackingOrderId);
      fetchOrder(trackingOrderId);
    }
  }, [trackingOrderId]);

  if (!trackingOrderId) return null;

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchOrder(searchId.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-emerald-800 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Live Courier Order Tracking</h3>
          </div>
          <button onClick={() => setTrackingOrderId(null)} className="p-1 hover:bg-emerald-700 rounded-full transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Search Bar */}
          <form onSubmit={handleManualSearch} className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Order Number (e.g., BD-2026-8912)"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Track
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {order && (
            <div className="space-y-5">
              {/* Order Info Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Order Number:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Courier Partner:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{order.courier?.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Courier Tracking Code:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{order.courier?.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Address:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{order.shippingAddress?.fullAddress || 'Dhaka, BD'}</span>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-3">Courier Logistics Timeline:</h4>
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/30 pl-8">
                  {order.courier?.statusLogs.map((log, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{log.status}</p>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{log.time}</span>
                          <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{log.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2">Package Items:</h4>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <img src={item.productImage} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{item.productTitle}</p>
                          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {Object.entries(item.selectedVariants).map(([k, v]) => (
                                <span key={k} className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1 py-0.2 rounded border border-amber-200/50">
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="font-bold shrink-0">x{item.quantity} ({formatPrice(item.price * item.quantity)})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
