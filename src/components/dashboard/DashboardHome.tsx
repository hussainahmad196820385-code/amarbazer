import React, { useMemo } from 'react';
import { 
  TrendingUp, ShoppingCart, Users, Activity, Package, Star, 
  MessageSquare, Bell, Volume2, Shield, Calendar, DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardHome: React.FC = () => {
  const { products, language, theme } = useApp();

  const salesData = [
    { name: 'Jan', Sales: 45000, Orders: 12 },
    { name: 'Feb', Sales: 52000, Orders: 15 },
    { name: 'Mar', Sales: 78000, Orders: 22 },
    { name: 'Apr', Sales: 61000, Orders: 18 },
    { name: 'May', Sales: 95000, Orders: 28 },
    { name: 'Jun', Sales: 125000, Orders: 35 },
    { name: 'Jul', Sales: 154900, Orders: 42 },
  ];

  const recentEvents = [
    { id: '1', time: '10 mins ago', event: 'New order placed BD-2026-9411', type: 'order', status: 'success' },
    { id: '2', time: '45 mins ago', event: 'Product price updated for Walton TV', type: 'price', status: 'info' },
    { id: '3', time: '2 hours ago', event: 'Customer support chat resolved (Kamal H.)', type: 'chat', status: 'success' },
    { id: '4', time: '5 hours ago', event: 'Review approved for Dhakai Jamdani Saree', type: 'review', status: 'warning' },
    { id: '5', time: '1 day ago', event: 'New Vendor registered: Sylhet Organics', type: 'vendor', status: 'info' },
  ];

  const topSelling = useMemo(() => {
    return products.slice(0, 3);
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {language === 'bn' ? 'অমরবাজার ইআরপি ড্যাশবোর্ড' : 'AmarBazar ERP Central Control'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === 'bn' 
                ? 'স্বাগতম অপারেটর! আজকের বাজার ওভারভিউ এবং লাইভ স্ট্যাটাস এখানে দেখুন।' 
                : 'Welcome, active operator! Monitor real-time marketplace sales, logs, and settings.'}
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{language === 'bn' ? 'সার্ভার সচল আছে' : 'Server Live & Connected'}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'মোট বিক্রি' : 'Total Revenue'}
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              ৳১,৫৪,৯০০
            </h3>
            <p className="text-[10px] text-emerald-500 font-bold flex items-center mt-0.5">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +14.2% {language === 'bn' ? 'এই সপ্তাহে' : 'this week'}
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'সক্রিয় অর্ডার' : 'Active Orders'}
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              ৪টি
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {language === 'bn' ? '২টি ডেলিভারি প্রক্রিয়াধীন' : '2 processing, 2 shipped'}
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'মোট বিক্রেতা' : 'Verified Vendors'}
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              ১২টি শপ
            </h3>
            <p className="text-[10px] text-emerald-500 font-bold mt-0.5">
              +৩টি {language === 'bn' ? 'নতুন আবেদন' : 'new approvals'}
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'অপারেটর স্ট্যাটাস' : 'Operator Status'}
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {language === 'bn' ? 'সক্রিয়' : 'Active'}
            </h3>
            <p className="text-[10px] text-purple-500 font-bold mt-0.5">
              ID: admin-rahim-01
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Event Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column (2 cols wide) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {language === 'bn' ? 'রাজস্ব প্রবৃদ্ধি চিত্র' : 'Revenue Growth Chart'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === 'bn' ? 'মাসিক বিক্রয় ও অর্ডারের তুলনামূলক বিবরণী' : 'Monthly sales volume comparison (BDT)'}
              </p>
            </div>
            <div className="inline-flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>YTD 2026</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    borderColor: theme === 'dark' ? '#475569' : '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                  }} 
                />
                <Area type="monotone" dataKey="Sales" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Mini Column (1 col wide): Recent Events */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1 flex items-center">
              <Shield className="w-4 h-4 mr-1.5 text-amber-500" />
              {language === 'bn' ? 'সিস্টেম লগ' : 'ERP System Logs'}
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">
              {language === 'bn' ? 'অপারেটর এবং স্টোরের শেষ কার্যক্রম' : 'Real-time trace of operator actions'}
            </p>

            <div className="space-y-3.5">
              {recentEvents.map(ev => (
                <div key={ev.id} className="flex items-start space-x-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1.5 ${
                    ev.status === 'success' ? 'bg-emerald-500' :
                    ev.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-tight">
                      {ev.event}
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                      {ev.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 italic">
              Logged in as Security level: <strong>Super Admin</strong>
            </span>
          </div>
        </div>

      </div>

      {/* Top Products Grid */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center">
          <Package className="w-4 h-4 mr-1.5 text-amber-500" />
          {language === 'bn' ? 'জনপ্রিয় পণ্য বিশ্লেষণ' : 'Top Performing Listings'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topSelling.map(p => (
            <div key={p.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-900/30">
              <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">
                  {language === 'bn' ? (p.titleBn || p.title) : language === 'ar' ? (p.titleAr || p.title) : p.title}
                </h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  ৳{(p.discountPrice || p.price).toLocaleString()}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 font-bold px-1.5 py-0.2 rounded flex items-center">
                    <Star className="w-2.5 h-2.5 fill-amber-500 mr-0.5" />
                    {p.rating}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    Stock: {p.stock} units
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
