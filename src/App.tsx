import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CustomerView } from './components/customer/CustomerView';
import { CustomerProfilePanel } from './components/customer/CustomerProfilePanel';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SellerApplications } from './components/admin/SellerApplications';
import { ProductApprovals } from './components/admin/ProductApprovals';
import { SubscriptionSettings } from './components/admin/SubscriptionSettings';
import { SettingsView } from './components/common/SettingsView';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { StoreDirectory } from './components/dashboard/StoreDirectory';
import { InventoryWorkspace } from './components/dashboard/InventoryWorkspace';
import { ProductReviewsPanel } from './components/dashboard/ProductReviewsPanel';
import { CustomerMessagesPanel } from './components/dashboard/CustomerMessagesPanel';
import { RegisterVendorShop } from './components/dashboard/RegisterVendorShop';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { ProductShareModal } from './components/common/ProductShareModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { PaymentModal } from './components/common/PaymentModal';
import { AuthModal } from './components/auth/AuthModal';
import { AiAssistantModal } from './components/common/AiAssistantModal';
import { OrderTrackingModal } from './components/customer/OrderTrackingModal';
import { FacebookMessengerWidget } from './components/common/FacebookMessengerWidget';
import { CustomerTrackingSupport } from './components/customer/CustomerTrackingSupport';
import { BottomNavigation } from './components/common/BottomNavigation';
import { OutletsView } from './components/customer/OutletsView';
import { Product, Address, getProductUnitPrice } from './types';
import { ShieldAlert, KeyRound } from 'lucide-react';
import { nativeBridge } from './services/nativeBridge';

function MainLayout() {
  const { 
    activePanel, setActivePanel, selectedProduct, setSelectedProduct, 
    sharingProduct, setSharingProduct,
    cart, addToCart, isCustomerOnlyMode, currentUser, isAuthOpen, setIsAuthOpen, 
    isAiOpen, setIsAiOpen, trackingOrderId, setTrackingOrderId,
    isCartOpen, setIsCartOpen, language,
    isMobileChatActive
  } = useApp();

  // Payment Modal Trigger State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<{
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    coupon?: string;
    items: any[];
    shippingAddress: Address | null;
  } | null>(null);

  // Keep references to state so Android Native Hardware Back Button handler always sees the latest values
  const stateRef = useRef({
    selectedProduct,
    sharingProduct,
    isPaymentModalOpen,
    isCartOpen,
    isAuthOpen,
    isAiOpen,
    trackingOrderId,
    activePanel
  });

  useEffect(() => {
    stateRef.current = {
      selectedProduct,
      sharingProduct,
      isPaymentModalOpen,
      isCartOpen,
      isAuthOpen,
      isAiOpen,
      trackingOrderId,
      activePanel
    };
  }, [selectedProduct, sharingProduct, isPaymentModalOpen, isCartOpen, isAuthOpen, isAiOpen, trackingOrderId, activePanel]);

  // Initialize Android Native Features (Back Button, Status Bar, Splash Screen)
  useEffect(() => {
    nativeBridge.initNativeFeatures({
      closeAnyOpenModal: () => {
        const s = stateRef.current;
        if (s.isPaymentModalOpen) {
          setIsPaymentModalOpen(false);
          return true;
        }
        if (s.selectedProduct) {
          setSelectedProduct(null);
          return true;
        }
        if (s.sharingProduct) {
          setSharingProduct(null);
          return true;
        }
        if (s.isCartOpen) {
          setIsCartOpen(false);
          return true;
        }
        if (s.isAuthOpen) {
          setIsAuthOpen(false);
          return true;
        }
        if (s.isAiOpen) {
          setIsAiOpen(false);
          return true;
        }
        if (s.trackingOrderId) {
          setTrackingOrderId(null);
          return true;
        }
        return false;
      },
      navigateToHome: () => {
        const s = stateRef.current;
        if (s.activePanel !== 'customer') {
          setActivePanel('customer');
          return true;
        }
        return false;
      },
      canGoBack: () => {
        const s = stateRef.current;
        return (
          !!s.selectedProduct ||
          !!s.sharingProduct ||
          s.isPaymentModalOpen ||
          s.isCartOpen ||
          s.isAuthOpen ||
          s.isAiOpen ||
          !!s.trackingOrderId ||
          s.activePanel !== 'customer'
        );
      }
    });
  }, []);

  const handleProceedToCheckout = (
    subtotal: number, discount: number, shipping: number, total: number, coupon?: string
  ) => {
    setCheckoutPayload({
      subtotal,
      discount,
      shipping,
      total,
      coupon,
      items: cart,
      shippingAddress: {
        id: 'addr-dhaka-1',
        title: 'Home Address',
        recipientName: 'Rahim Chowdhury',
        phone: '01712345678',
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Dhanmondi',
        fullAddress: 'House 42, Road 10/A, Dhanmondi R/A, Dhaka-1209',
        isDefault: true
      }
    });
    setIsPaymentModalOpen(true);
  };

  const handleBuyNowDirect = (product: Product, quantity: number, variants: Record<string, string>) => {
    addToCart(product, quantity, variants);
    const price = getProductUnitPrice(product, variants || {});
    const sub = price * quantity;
    const ship = 60;
    const tot = sub + ship;
    setCheckoutPayload({
      subtotal: sub,
      discount: 0,
      shipping: ship,
      total: tot,
      items: [{ product, quantity, calculatedPrice: price, selectedVariants: variants }],
      shippingAddress: {
        id: 'addr-dhaka-1',
        title: 'Home Address',
        recipientName: 'Rahim Chowdhury',
        phone: '01712345678',
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Dhanmondi',
        fullAddress: 'House 42, Road 10/A, Dhanmondi R/A, Dhaka-1209',
        isDefault: true
      }
    });
    setIsPaymentModalOpen(true);
  };

  // Permissions & Role Boundaries Checks
  const isAuthorized = () => {
    const role = currentUser?.role || 'customer';
    if (role === 'admin') return true;
    if (role === 'seller') {
      return ['customer', 'store_directory', 'customer_profile', 'seller', 'inventory_workspace', 'product_reviews', 'customer_messages', 'outlets'].includes(activePanel);
    }
    // Customer or Guest
    return ['customer', 'store_directory', 'customer_profile', 'register_vendor', 'outlets', 'customer_messages'].includes(activePanel);
  };

  const requiresLogin = ['customer_profile', 'register_vendor', 'seller', 'inventory_workspace', 'product_reviews', 'dashboard_home', 'admin', 'settings', 'seller_applications', 'subscription_pricing'].includes(activePanel);

  return (
    <div className="h-screen bg-[#f4f6fa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-row font-sans transition-colors duration-200 overflow-hidden">
      {/* Sidebar Navigation */}
      {!isCustomerOnlyMode && <Sidebar />}

      {/* Main View Side */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen ${activePanel === 'customer_messages' ? 'overflow-hidden' : 'overflow-y-auto'} overflow-x-hidden`}>
        {/* Navigation Header */}
        <Header />

        {/* Main View Area */}
        <main className={`flex-1 max-w-[1800px] w-full mx-auto ${activePanel === 'customer_messages' ? `px-0 pt-0 pb-0 flex flex-col min-h-0 overflow-hidden ${isMobileChatActive ? 'h-[calc(100vh-64px)]' : 'h-[calc(100vh-120px)] lg:h-[calc(100vh-64px)]'}` : 'px-1 sm:px-2 md:px-3 pt-2 sm:pt-4 pb-24 md:pb-6'}`}>
          {!currentUser && requiresLogin ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-xs max-w-md mx-auto my-12 animate-fade-in">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20">
                <KeyRound className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">
                {language === 'bn' ? 'সাইন ইন করা প্রয়োজন' : 'Authentication Required'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {language === 'bn' 
                  ? 'এই প্যানেলটি দেখতে ও ম্যানেজ করতে আপনার অ্যাকাউন্টে সাইন ইন করুন।' 
                  : 'Please sign in to your merchant, buyer or operator account to view this section.'}
              </p>
              <div className="flex flex-col space-y-2 w-full">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full py-3 bg-gradient-to-tr from-[#da1c24] to-red-500 text-white font-black rounded-xl text-xs shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  {language === 'bn' ? 'সাইন ইন / রেজিস্ট্রেশন' : 'Sign In / Register'}
                </button>
                <button
                  onClick={() => setActivePanel('customer')}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {language === 'bn' ? 'স্টোরফ্রন্ট এ ফিরে যান' : 'Go to Storefront'}
                </button>
              </div>
            </div>
          ) : !isAuthorized() ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-xs max-w-md mx-auto my-12 animate-fade-in">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-150 mb-2">
                {language === 'bn' ? 'অ্যাক্সেস সংরক্ষিত' : 'Access Restricted'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {language === 'bn' 
                  ? 'দুঃখিত, এই সেকশনটি দেখার জন্য আপনার অ্যাকাউন্টের পর্যাপ্ত পারমিশন নেই।' 
                  : 'Your current account level does not have permission to view this panel.'}
              </p>
              <div className="flex flex-col space-y-2 w-full">
                <button
                  onClick={() => setActivePanel(currentUser?.role === 'seller' ? 'seller' : 'customer')}
                  className="w-full py-3 bg-gradient-to-tr from-[#da1c24] to-red-500 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  {language === 'bn' ? 'আমার ড্যাশবোর্ড এ ফিরে যান' : 'Back to My Dashboard'}
                </button>
                <button
                  onClick={() => setActivePanel('customer')}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {language === 'bn' ? 'স্টোরফ্রন্ট এ ফিরে যান' : 'Go to Storefront'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {activePanel === 'dashboard_home' && (
                <DashboardHome />
              )}

              {activePanel === 'customer' && (
                <CustomerView 
                  onOpenProduct={(product) => setSelectedProduct(product)} 
                  onBuyNow={handleBuyNowDirect}
                />
              )}

              {activePanel === 'store_directory' && (
                currentUser?.role === 'customer' || !currentUser ? (
                  <CustomerTrackingSupport />
                ) : (
                  <StoreDirectory />
                )
              )}

              {activePanel === 'inventory_workspace' && (
                <InventoryWorkspace />
              )}

              {activePanel === 'product_reviews' && (
                <ProductReviewsPanel />
              )}

              {activePanel === 'customer_messages' && (
                <CustomerMessagesPanel />
              )}

              {activePanel === 'register_vendor' && (
                <RegisterVendorShop />
              )}

              {activePanel === 'seller' && (
                <SellerDashboard />
              )}

              {activePanel === 'seller_applications' && (
                <SellerApplications />
              )}

              {activePanel === 'product_approvals' && (
                <ProductApprovals />
              )}

              {activePanel === 'admin' && (
                <AdminDashboard />
              )}

              {activePanel === 'subscription_pricing' && (
                <SubscriptionSettings />
              )}

              {activePanel === 'settings' && (
                <SettingsView />
              )}

              {activePanel === 'customer_profile' && (
                <CustomerProfilePanel />
              )}

              {activePanel === 'outlets' && (
                <OutletsView />
              )}
            </>
          )}
        </main>

        {/* Shared Modals */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={handleBuyNowDirect}
        />

        <ProductShareModal
          product={sharingProduct}
          onClose={() => setSharingProduct(null)}
        />

        <CartDrawer
          onProceedToCheckout={handleProceedToCheckout}
        />

        {checkoutPayload && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            cartItems={checkoutPayload.items}
            shippingAddress={checkoutPayload.shippingAddress}
            subtotal={checkoutPayload.subtotal}
            discountAmount={checkoutPayload.discount}
            shippingFee={checkoutPayload.shipping}
            totalAmount={checkoutPayload.total}
            couponCode={checkoutPayload.coupon}
            onSuccess={(orderId) => {
              console.log('Order created successfully:', orderId);
            }}
          />
        )}

        <AuthModal />
        <AiAssistantModal />
        <OrderTrackingModal />

        {/* Footer */}
        {['customer', 'dashboard_home', 'store_directory', 'outlets'].includes(activePanel) && <Footer />}
        {!isCustomerOnlyMode && <BottomNavigation />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
