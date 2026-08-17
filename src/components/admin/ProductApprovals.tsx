import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, CheckCircle, AlertTriangle, AlertCircle, Trash2, Eye, ShieldCheck, 
  Search, RefreshCw, X, ShieldAlert, Store, Package, ShoppingBag, Edit2, Check, Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Product } from '../../types';

export const ProductApprovals: React.FC = () => {
  const { language, products, refreshProducts } = useApp();
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab control: 'pending' | 'approved' | 'rejected'
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected product for full review modal / edit modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  
  // Edit form states
  const [editTitle, setEditTitle] = useState<string>('');
  const [editTitleBn, setEditTitleBn] = useState<string>('');
  const [editPrice, setEditPrice] = useState<number>(100);
  const [editStock, setEditStock] = useState<number>(10);
  const [editDesc, setEditDesc] = useState<string>('');
  const [editDescBn, setEditDescBn] = useState<string>('');

  // Rejection modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectingProduct, setRejectingProduct] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Wait, we need to refresh the products from backend or AppContext
      await refreshProducts();
    } catch (err) {
      console.error(err);
      setError(language === 'bn' ? 'পণ্য তালিকা লোড করতে ব্যর্থ হয়েছে' : 'Failed to fetch products list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update product list locally when the global products array changes
  useEffect(() => {
    if (products) {
      setProductList(products);
    }
  }, [products]);

  // Handle Approve Action
  const handleApproveProduct = async (product: Product) => {
    try {
      // update backend
      await api.updateProduct(product.id, { isApproved: true });
      showToast(
        language === 'bn' 
          ? `"${product.titleBn || product.title}" সফলভাবে অনুমোদিত হয়েছে এবং লাইভ স্টোরে পাঠানো হয়েছে!`
          : `"${product.title}" has been successfully approved & published to the live store!`, 
        'success'
      );
      // reload
      await fetchProducts();
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error(err);
      showToast(language === 'bn' ? 'অনুমোদন করা যায়নি।' : 'Failed to approve product.', 'error');
    }
  };

  // Trigger Reject Dialogue
  const triggerRejectProduct = (product: Product) => {
    setRejectingProduct(product);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  // Confirm Reject Action
  const handleConfirmReject = async () => {
    if (!rejectingProduct) return;
    try {
      // For rejection, we can set isApproved to false and set rejection flag, or delete.
      // Let's set isApproved: false and tags containing 'rejected' or customSpecs
      const updatedSpecs = [
        ...(rejectingProduct.customSpecs || []),
        { label: 'Status', value: 'Rejected' },
        { label: 'Rejection Reason', value: rejectReason }
      ];

      await api.updateProduct(rejectingProduct.id, { 
        isApproved: false,
        customSpecs: updatedSpecs,
        tags: [...(rejectingProduct.tags || []), 'rejected']
      });

      showToast(
        language === 'bn'
          ? `"${rejectingProduct.titleBn || rejectingProduct.title}" বাতিল করা হয়েছে!`
          : `"${rejectingProduct.title}" has been rejected!`,
        'success'
      );

      setIsRejectModalOpen(false);
      setRejectingProduct(null);
      await fetchProducts();
      if (selectedProduct?.id === rejectingProduct.id) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error(err);
      showToast(language === 'bn' ? 'বাতিল করতে সমস্যা হয়েছে।' : 'Failed to reject product.', 'error');
    }
  };

  // Permanently Delete Product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি এই পণ্যটি স্থায়ীভাবে মুছে ফেলতে চান?' : 'Are you sure you want to permanently delete this product?')) {
      return;
    }
    try {
      await api.deleteProduct(productId);
      showToast(
        language === 'bn'
          ? `"${productName}" স্থায়ীভাবে ডিলেট করা হয়েছে!`
          : `"${productName}" has been permanently deleted!`,
        'success'
      );
      await fetchProducts();
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error(err);
      showToast(language === 'bn' ? 'মুছে ফেলা ব্যর্থ হয়েছে।' : 'Failed to delete product.', 'error');
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (product: Product) => {
    setEditTitle(product.title);
    setEditTitleBn(product.titleBn || product.title);
    setEditPrice(product.price);
    setEditStock(product.stock);
    setEditDesc(product.description);
    setEditDescBn(product.descriptionBn || product.description);
    setIsEditModalOpen(true);
  };

  // Save Edits
  const handleSaveEdits = async () => {
    if (!selectedProduct) return;
    try {
      await api.updateProduct(selectedProduct.id, {
        title: editTitle,
        titleBn: editTitleBn,
        price: Number(editPrice),
        stock: Number(editStock),
        description: editDesc,
        descriptionBn: editDescBn
      });

      showToast(
        language === 'bn'
          ? 'পণ্যের তথ্য সফলভাবে আপডেট করা হয়েছে!'
          : 'Product details updated successfully!',
        'success'
      );
      setIsEditModalOpen(false);
      await fetchProducts();
      // update details modal
      setSelectedProduct(prev => prev ? { 
        ...prev, 
        title: editTitle, 
        titleBn: editTitleBn, 
        price: editPrice, 
        stock: editStock,
        description: editDesc,
        descriptionBn: editDescBn 
      } : null);
    } catch (err) {
      console.error(err);
      showToast(language === 'bn' ? 'আপডেট করা যায়নি।' : 'Failed to update product.', 'error');
    }
  };

  // Automatic Prohibited Item Vetting Engine (Checks for illegal / policy violating keywords)
  const runSafetyAudit = (product: Product) => {
    const textToScan = `${product.title} ${product.description} ${product.brand} ${product.tags.join(' ')}`.toLowerCase();
    
    const weapons = ['knife', 'weapons', 'spring steel', 'combat', 'folding knife', 'gun', 'explosive', 'ছুরি', 'অস্ত্র'];
    const regulated = ['vape', 'tobacco', 'nicotine', 'e-cigarette', 'drugs', 'chemical', 'ভ্যাপ', 'নেশাজাতীয়', 'মাদক'];
    const fakeBrands = ['replica', 'first copy', 'fake', 'clone', 'নকল'];

    for (const keyword of weapons) {
      if (textToScan.includes(keyword)) {
        return {
          status: 'danger' as const,
          reasonEn: 'Weapons Detected: Spring folding knives or tactical combat gear are illegal to sell on our platform.',
          reasonBn: 'অস্ত্র সনাক্তকরণ: ফোল্ডিং ছুরি, স্প্রিং নাইফ বা ক্ষতিকারক অস্ত্র এই প্ল্যাটফর্মে বিক্রি করা নিষিদ্ধ!'
        };
      }
    }

    for (const keyword of regulated) {
      if (textToScan.includes(keyword)) {
        return {
          status: 'warning' as const,
          reasonEn: 'Regulated Substance: Vape, tobacco, and nicotine products violate regional guidelines.',
          reasonBn: 'নিষিদ্ধ পণ্য: ই-সিগারেট, ভ্যাপ, তামাক বা মাদক জাতীয় পদার্থ আমাদের গাইডলাইন লঙ্ঘন করে।'
        };
      }
    }

    for (const keyword of fakeBrands) {
      if (textToScan.includes(keyword)) {
        return {
          status: 'warning' as const,
          reasonEn: 'Counterfeit Risk: Description mentions replica/copy. Fake brand items are strictly prohibited.',
          reasonBn: 'নকল পণ্যের ঝুঁকি: কপি বা রেপ্লিকা পণ্য বিক্রি করা সম্পূর্ণ নিষিদ্ধ।'
        };
      }
    }

    return {
      status: 'safe' as const,
      reasonEn: 'Verified Safe: Content analyzed. No illegal words, drugs, weapons or counterfeit references found.',
      reasonBn: 'নিরাপদ পণ্য: পণ্যটি ভেরিফাইড। কোনো অবৈধ শব্দ, অস্ত্র, তামাক বা নকল ব্র্যান্ডিং পাওয়া যায়নি।'
    };
  };

  // Filter products based on selected tab and search query
  const filteredProducts = productList.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.titleBn && p.titleBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const isRejected = p.tags?.includes('rejected') || p.customSpecs?.some(s => s.label === 'Status' && s.value === 'Rejected');

    if (activeTab === 'pending') {
      return p.isApproved === false && !isRejected && matchesSearch;
    } else if (activeTab === 'approved') {
      return p.isApproved !== false && matchesSearch;
    } else {
      return isRejected && matchesSearch;
    }
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-lg border text-white transition-all transform duration-300 ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-rose-600 border-rose-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3 shrink-0" /> : <AlertCircle className="w-5 h-5 mr-3 shrink-0" />}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header operations */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2 tracking-tight text-slate-900 dark:text-white">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            {language === 'bn' ? 'সেলার পণ্য অনুমোদন ড্যাশবোর্ড' : 'Seller Product Approvals Panel'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' 
              ? 'অবৈধ, ক্ষতিকারক বা কপিরাইট লঙ্ঘনকারী পণ্য ফিল্টার করুন এবং অনুমোদন দিন।' 
              : 'Review, edit, and approve seller products to ensure quality control & platform safety.'}
          </p>
        </div>
        <button 
          onClick={fetchProducts}
          className="flex items-center justify-center gap-1.5 self-start px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition duration-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {language === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh Listings'}
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
              {language === 'bn' ? 'অপেক্ষমাণ পণ্য' : 'Pending Approvals'}
            </p>
            <p className="text-xl font-black mt-0.5 text-rose-500">
              {productList.filter(p => p.isApproved === false && !p.tags?.includes('rejected')).length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
              {language === 'bn' ? 'অনুমোদিত পণ্য' : 'Live Active Products'}
            </p>
            <p className="text-xl font-black mt-0.5 text-emerald-600 dark:text-emerald-400">
              {productList.filter(p => p.isApproved !== false).length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
              {language === 'bn' ? 'বাতিলকৃত / স্থগিত' : 'Rejected Listings'}
            </p>
            <p className="text-xl font-black mt-0.5 text-amber-500">
              {productList.filter(p => p.tags?.includes('rejected')).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs and Search filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {language === 'bn' ? 'অনুমোদন অপেক্ষমাণ' : 'Pending Reviews'}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {language === 'bn' ? 'অনুমোদিত পণ্যসমূহ' : 'Approved Items'}
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
              activeTab === 'rejected'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {language === 'bn' ? 'বাতিলকৃত / স্থগিত' : 'Rejected / Flagged'}
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'পণ্যের নাম বা সেলার খুজুন...' : 'Search by title, seller...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main product showcase list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs text-slate-400">{language === 'bn' ? 'নতুন ডাটা লোড হচ্ছে...' : 'Loading updated listings...'}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold mt-4 text-slate-600 dark:text-slate-300">
            {language === 'bn' ? 'কোন পণ্য পাওয়া যায়নি' : 'No products found'}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-md mx-auto">
            {language === 'bn' 
              ? 'বর্তমানে এই ক্যাটাগরিতে পর্যালোচনার জন্য কোন পণ্য তালিকাভুক্ত নেই।' 
              : 'There are currently no products listed under this status or matching your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const audit = runSafetyAudit(product);
            
            return (
              <div 
                key={product.id} 
                className="bg-white dark:bg-slate-800 border border-slate-200/75 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Product Image Banner */}
                <div className="h-44 relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500" 
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="px-2 py-1 bg-slate-900/80 text-white font-bold text-[9px] uppercase rounded-md tracking-wider">
                      {product.categoryName}
                    </span>
                    <span className="px-2 py-1 bg-amber-500 text-slate-950 font-bold text-[9px] uppercase rounded-md tracking-wider">
                      {product.brand}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    {audit.status === 'safe' ? (
                      <span className="px-2 py-1 bg-emerald-600 text-white font-bold text-[9px] uppercase rounded-md flex items-center gap-1 shadow-md">
                        <ShieldCheck className="w-3 h-3" />
                        {language === 'bn' ? 'নিরাপদ' : 'SAFE'}
                      </span>
                    ) : audit.status === 'warning' ? (
                      <span className="px-2 py-1 bg-amber-500 text-slate-950 font-bold text-[9px] uppercase rounded-md flex items-center gap-1 shadow-md animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        {language === 'bn' ? 'সতর্কতা' : 'WARNING'}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-rose-600 text-white font-bold text-[9px] uppercase rounded-md flex items-center gap-1 shadow-md animate-bounce">
                        <ShieldAlert className="w-3 h-3" />
                        {language === 'bn' ? 'বিপজ্জনক' : 'RESTRICTED'}
                      </span>
                    )}
                  </div>

                  {/* Seller name footer block on image */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 text-white">
                    <p className="text-[10px] text-slate-300 flex items-center gap-1">
                      <Store className="w-3 h-3 text-amber-400" />
                      {language === 'bn' ? 'বিক্রেতা:' : 'Seller:'} <span className="font-bold text-white">{product.sellerName}</span>
                    </p>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-snug group-hover:text-amber-500 transition-colors">
                      {language === 'bn' ? product.titleBn || product.title : product.title}
                    </h3>

                    {/* Price and Stock Tags */}
                    <div className="flex gap-4 items-center mt-2 pb-2.5 border-b border-slate-100 dark:border-slate-700/50">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'মূল্য (টাকা)' : 'Price (BDT)'}</span>
                        <span className="font-black text-sm text-slate-950 dark:text-amber-400">৳{product.price}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'স্টক' : 'Stock'}</span>
                        <span className="font-black text-xs">{product.stock} {language === 'bn' ? 'পিস' : 'units'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">SKU</span>
                        <span className="font-mono text-[10px] text-slate-500">{product.sku}</span>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {language === 'bn' ? product.descriptionBn || product.description : product.description}
                    </p>

                    {/* Prohibited Alert Reason Box */}
                    {audit.status !== 'safe' && (
                      <div className={`mt-3 p-2.5 rounded-xl border flex gap-2 items-start text-[10px] leading-relaxed ${
                        audit.status === 'danger' 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black uppercase tracking-wider">
                            {language === 'bn' ? 'স্বয়ংক্রিয় এআই অডিট সতর্কতা:' : 'AUTO-AUDIT SAFETY FLAG:'}
                          </p>
                          <p className="mt-0.5">{language === 'bn' ? audit.reasonBn : audit.reasonEn}</p>
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason display if on rejected tab */}
                    {activeTab === 'rejected' && (
                      <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-950 text-[10px] rounded-xl">
                        <span className="font-black text-amber-700 dark:text-amber-400 block uppercase">
                          {language === 'bn' ? 'বাতিলের কারণ:' : 'REJECTION REASON:'}
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 mt-1 italic">
                          {product.customSpecs?.find(s => s.label === 'Rejection Reason')?.value || (language === 'bn' ? 'কোন নির্দিষ্ট কারণ নেই।' : 'No reason specified.')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Buttons controls */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold transition duration-200"
                      title={language === 'bn' ? 'পণ্য বিস্তারিত দেখুন' : 'View Product Details'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        handleOpenEdit(product);
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold transition duration-200"
                      title={language === 'bn' ? 'পণ্য এডিট করুন' : 'Edit Details'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {activeTab === 'pending' && (
                      <>
                        <button
                          onClick={() => triggerRejectProduct(product)}
                          className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold text-rose-500 transition duration-200 flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'বাতিল' : 'Reject'}
                        </button>

                        <button
                          onClick={() => handleApproveProduct(product)}
                          className="flex-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition duration-200 flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'অনুমোদন দিন' : 'Approve Live'}
                        </button>
                      </>
                    )}

                    {activeTab === 'approved' && (
                      <>
                        <button
                          onClick={() => triggerRejectProduct(product)}
                          className="flex-1 py-1.5 border border-rose-200 text-rose-600 dark:border-rose-950/30 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition duration-200 flex items-center justify-center gap-1"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'স্থগিত করুন' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.title)}
                          className="p-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition duration-200"
                          title={language === 'bn' ? 'স্থায়ীভাবে ডিলিট করুন' : 'Permanently Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {activeTab === 'pending' && (
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.title)}
                        className="p-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition duration-200"
                        title={language === 'bn' ? 'স্থায়ীভাবে ডিলিট করুন' : 'Permanently Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {activeTab === 'rejected' && (
                      <>
                        <button
                          onClick={() => handleApproveProduct(product)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition duration-200 flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'অনুমোদন দিন' : 'Restore'}
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product.id, product.title)}
                          className="p-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition duration-200"
                          title={language === 'bn' ? 'স্থায়ীভাবে ডিলিট করুন' : 'Permanently Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL REVIEW AND DETAILS MODAL */}
      {selectedProduct && !isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <div>
                <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold px-2.5 py-1 rounded-full uppercase">
                  {selectedProduct.categoryName}
                </span>
                <h3 className="font-black text-lg text-slate-900 dark:text-white mt-1.5">
                  {language === 'bn' ? selectedProduct.titleBn || selectedProduct.title : selectedProduct.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Image Grid */}
              <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
                <img 
                  src={selectedProduct.images[0]} 
                  alt={selectedProduct.title} 
                  className="w-full h-full object-contain" 
                />
              </div>

              {/* Security scan bar */}
              <div className={`p-4 rounded-2xl border flex gap-3 ${
                runSafetyAudit(selectedProduct).status === 'danger'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
                  : runSafetyAudit(selectedProduct).status === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              }`}>
                {runSafetyAudit(selectedProduct).status === 'safe' ? (
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                )}
                <div className="text-xs">
                  <p className="font-black uppercase tracking-wider">
                    {language === 'bn' ? 'অটোমেটিক প্ল্যাটফর্ম নিরাপত্তা নিরীক্ষা:' : 'AUTOMATIC CONTENT COMPLIANCE ANALYSIS:'}
                  </p>
                  <p className="mt-1 leading-relaxed">
                    {language === 'bn' ? runSafetyAudit(selectedProduct).reasonBn : runSafetyAudit(selectedProduct).reasonEn}
                  </p>
                </div>
              </div>

              {/* Data Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'অনুমোদিত মূল্য' : 'Price'}</span>
                  <span className="font-black text-slate-900 dark:text-white">৳{selectedProduct.price}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'বর্তমান স্টক' : 'Stock'}</span>
                  <span className="font-black text-slate-900 dark:text-white">{selectedProduct.stock} units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'ব্র্যান্ড' : 'Brand'}</span>
                  <span className="font-black text-slate-900 dark:text-white">{selectedProduct.brand}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SKU</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{selectedProduct.sku}</span>
                </div>
              </div>

              {/* Product description */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">
                  {language === 'bn' ? 'পণ্যের বিবরণ' : 'Product Description'}
                </h4>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">English:</p>
                  <p className="mb-4">{selectedProduct.description}</p>
                  {selectedProduct.descriptionBn && (
                    <>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Bengali (বাংলা):</p>
                      <p>{selectedProduct.descriptionBn}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Combo Items review for admin */}
              {selectedProduct.isCombo && selectedProduct.comboItems && selectedProduct.comboItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-amber-500">
                    {language === 'bn' ? 'কম্বো প্যাকেজে অন্তর্ভুক্ত পণ্যসমূহ' : 'Bundle Items Included'}
                  </h4>
                  <div className="border border-amber-100 dark:border-amber-950 p-3 rounded-2xl bg-amber-50/10 space-y-2">
                    {selectedProduct.comboItems.map((item, idx) => {
                      const prod = products.find(p => p.id === item.productId);
                      if (!prod) return null;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center space-x-2.5">
                            <img src={prod.images[0]} className="w-8 h-8 rounded object-cover" alt="" />
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100">
                                {language === 'bn' ? prod.titleBn || prod.title : prod.title}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                SKU: {prod.sku} • Price: ৳{prod.discountPrice || prod.price}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold rounded-lg shrink-0">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seller details */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">
                  {language === 'bn' ? 'সেলার ও আপলোড তথ্য' : 'Seller & Registration Info'}
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'দোকানের নাম:' : 'Store Name:'}</span>
                    <span className="font-bold">{selectedProduct.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'সেলার আইডি:' : 'Seller ID:'}</span>
                    <span className="font-mono text-[11px]">{selectedProduct.sellerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'আপলোডের তারিখ:' : 'Upload Date:'}</span>
                    <span>{new Date(selectedProduct.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-900 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/40">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
              
              <button
                onClick={() => handleDeleteProduct(selectedProduct.id, selectedProduct.title)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {language === 'bn' ? 'স্থায়ীভাবে ডিলিট করুন' : 'Delete Product'}
              </button>

              <button
                onClick={() => handleOpenEdit(selectedProduct)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-amber-500 font-bold hover:bg-amber-500/10 rounded-xl text-xs transition"
              >
                {language === 'bn' ? 'তথ্য পরিবর্তন' : 'Edit Details'}
              </button>

              {selectedProduct.isApproved === false ? (
                <>
                  <button
                    onClick={() => triggerRejectProduct(selectedProduct)}
                    className="px-4 py-2 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition"
                  >
                    {language === 'bn' ? 'অনুমোদন বাতিল করুন' : 'Reject Listing'}
                  </button>

                  <button
                    onClick={() => handleApproveProduct(selectedProduct)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    {language === 'bn' ? 'অনুমোদন দিন' : 'Approve & Publish'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => triggerRejectProduct(selectedProduct)}
                  className="px-4 py-2 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition"
                >
                  {language === 'bn' ? 'লাইভ স্থগিত করুন' : 'Suspend Listing'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUICK EDIT MODAL */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-500" />
                {language === 'bn' ? 'পণ্যের বিবরণ সংশোধন করুন' : 'Modify Product Listing'}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              
              {/* Title (EN) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider block">Product Title (English)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Title (BN) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider block">পণ্যের নাম (বাংলা)</label>
                <input
                  type="text"
                  value={editTitleBn}
                  onChange={(e) => setEditTitleBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-wider block">Price (BDT ৳)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-wider block">Stock Quantity</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Description EN */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider block">Description (English)</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Description BN */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider block">পণ্যের বিবরণ (বাংলা)</label>
                <textarea
                  value={editDescBn}
                  onChange={(e) => setEditDescBn(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveEdits}
                className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-600 transition shadow-xs"
              >
                {language === 'bn' ? 'সংশোধন সংরক্ষণ করুন' : 'Save Modifications'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MOTIVE REASON MODAL */}
      {isRejectModalOpen && rejectingProduct && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-[70]">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-rose-50 dark:bg-rose-950/10">
              <h3 className="font-black text-rose-600 dark:text-rose-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                {language === 'bn' ? 'অনুমোদন বাতিল ও স্থগতিকরণ' : 'Denial & Suspend Action'}
              </h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-500">
                {language === 'bn' 
                  ? `আপনি কি নিশ্চিত যে "${rejectingProduct.titleBn || rejectingProduct.title}" পণ্যটির অনুমোদন বাতিল বা স্থগিত করতে চান? অনুগ্রহ করে বিক্রেতার জন্য একটি সুনির্দিষ্ট নীতি লঙ্ঘনের কারণ উল্লেখ করুন:` 
                  : `Are you sure you want to refuse or suspend the product listing "${rejectingProduct.title}"? Please provide a clear guideline violation reason for the seller:`}
              </p>

              <div className="space-y-1">
                <label className="font-black text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'নীতি লঙ্ঘনের সুনির্দিষ্ট কারণ' : 'Specific Violation / Rejection Motive'}
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={language === 'bn' ? 'উদা: বিপজ্জনক বা ক্ষতিকারক অবৈধ অস্ত্র, কপিরাইট পণ্য...' : 'e.g., Sale of hazardous weaponry, tobacco/vape regulation violation, replica counterfeit item...'}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'bn' ? 'অনুমোদন বাতিল করুন' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
