import React from 'react';
import { ShieldCheck, Truck, Headphones, RefreshCw, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../translations';

export const Footer: React.FC = () => {
  const { language } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      {/* Value Proposition Badges */}
      <div className="border-b border-slate-800 py-8 px-4 bg-slate-950/60">
        <div className="max-w-[1800px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center px-1 sm:px-2 md:px-3">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-600/50 flex items-center justify-center text-emerald-400 mb-2">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Fast BD Delivery</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">24-48 Hours inside Dhaka, 3-5 days across all 64 districts</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-600/50 flex items-center justify-center text-emerald-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">100% Authentic Products</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">Verified Bangladesh & International brand sellers</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-600/50 flex items-center justify-center text-emerald-400 mb-2">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">7 Days Easy Return</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">Hassle-free money back guarantee via bKash</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-600/50 flex items-center justify-center text-emerald-400 mb-2">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">24/7 Hotline Support</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">Call +880 1700-000000 anytime for assistance</p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1800px] mx-auto px-1 sm:px-2 md:px-3 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand info */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              আ
            </div>
            <span className="text-lg font-bold text-white">AmarBazar BD</span>
          </div>
          <p className="text-slate-400 leading-relaxed mb-4 text-[11px]">
            {language === 'bn' 
              ? 'আমার বাজার হলো বাংলাদেশের শীর্ষস্থানীয় ই-কমার্স প্ল্যাটফর্ম। বিকাশ, নগদ, রকেট ও কার্ড পেমেন্ট সহ সারাদেশে নির্ভরযোগ্য ডেলিভারি সার্ভিস।'
              : 'AmarBazar is Bangladesh\'s premier digital marketplace connecting authentic local sellers with millions of customers.'
            }
          </p>
          <div className="text-slate-400 space-y-1">
            <p><span className="font-semibold text-slate-200">Head Office:</span> Level 12, Gulshan Avenue, Dhaka-1212</p>
            <p><span className="font-semibold text-slate-200">Email:</span> support@amarbazar.com.bd</p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3">Popular Categories</h4>
          <ul className="space-y-2 text-slate-400">
            <li className="hover:text-emerald-400 transition cursor-pointer">Electronics & Gadgets</li>
            <li className="hover:text-emerald-400 transition cursor-pointer">Traditional Dhakai Jamdani Sarees</li>
            <li className="hover:text-emerald-400 transition cursor-pointer">Men's Cotton Panjabi & Kurta</li>
            <li className="hover:text-emerald-400 transition cursor-pointer">Sundarbans Organic Foods & Mustard Oil</li>
            <li className="hover:text-emerald-400 transition cursor-pointer">Apex Shoes & Leather Goods</li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3">Accepted Payment Gateways</h4>
          <p className="text-slate-400 mb-3 text-[11px]">Instant mobile banking & debit/credit cards:</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-pink-900/40 border border-pink-700/50 text-pink-300 font-bold px-2 py-1.5 rounded text-center text-[10px]">
              bKash (বিকাশ)
            </div>
            <div className="bg-orange-900/40 border border-orange-700/50 text-orange-300 font-bold px-2 py-1.5 rounded text-center text-[10px]">
              Nagad (নগদ)
            </div>
            <div className="bg-purple-900/40 border border-purple-700/50 text-purple-300 font-bold px-2 py-1.5 rounded text-center text-[10px]">
              Rocket (রকেট)
            </div>
            <div className="bg-blue-900/40 border border-blue-700/50 text-blue-300 font-bold px-2 py-1.5 rounded text-center text-[10px]">
              Visa / MC
            </div>
            <div className="bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 font-bold px-2 py-1.5 rounded text-center text-[10px] col-span-2">
              Cash on Delivery (COD)
            </div>
          </div>
        </div>

        {/* Courier Partners */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3">Official Courier Partners</h4>
          <p className="text-slate-400 mb-3 text-[11px]">Real-time tracking available for every package:</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-slate-300 font-medium text-[10px]">Pathao Courier</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-slate-300 font-medium text-[10px]">RedX Express</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-slate-300 font-medium text-[10px]">Steadfast</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-slate-300 font-medium text-[10px]">Paperfly</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-slate-300 font-medium text-[10px]">eCourier</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-4 px-4 text-center text-slate-500">
        <p className="max-w-[1800px] mx-auto flex flex-wrap justify-between items-center gap-2 px-1 sm:px-2 md:px-3">
          <span>© 2026 AmarBazar BD. All rights reserved. Trade License: TRAD/DNCC/098124/2026.</span>
          <span className="flex items-center text-slate-400">
            Made with <Heart className="w-3.5 h-3.5 mx-1 text-red-500 fill-red-500" /> for Bangladesh
          </span>
        </p>
      </div>
    </footer>
  );
};
