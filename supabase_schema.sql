-- ==============================================================================
-- BD AMAR STORE - OFFICIAL SUPABASE DATABASE SCHEMA (FULL-STACK E-COMMERCE)
-- ==============================================================================
-- Run this in your Supabase SQL Editor to initialize all tables, indexes, and RLS.

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_bn TEXT,
  slug TEXT,
  description TEXT,
  description_bn TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC,
  category_id TEXT NOT NULL,
  category_name TEXT,
  sub_category TEXT,
  brand TEXT DEFAULT 'Local BD',
  seller_id TEXT NOT NULL,
  seller_name TEXT,
  stock INTEGER NOT NULL DEFAULT 10,
  sku TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_flash_deal BOOLEAN DEFAULT false,
  is_combo BOOLEAN DEFAULT false,
  combo_items JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  variant_prices JSONB DEFAULT '{}'::jsonb,
  bulk_offers JSONB DEFAULT '[]'::jsonb,
  warranty TEXT,
  custom_specs JSONB DEFAULT '[]'::jsonb,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SELLERS & STORES TABLE
CREATE TABLE IF NOT EXISTS public.sellers (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_name_bn TEXT,
  owner_name TEXT,
  email TEXT,
  phone TEXT,
  logo_url TEXT,
  banner_url TEXT,
  rating NUMERIC DEFAULT 5.0,
  total_sales NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'approved',
  subscription_tier TEXT DEFAULT 'pro',
  subscription_status TEXT DEFAULT 'active',
  subscription_expiry_date TEXT,
  cloud_subscription_plan TEXT DEFAULT 'supabase_subscription',
  storage_type TEXT DEFAULT 'supabase',
  storage_credentials TEXT,
  trade_license_number TEXT,
  bkash_number TEXT,
  bank_account_details TEXT,
  staff JSONB DEFAULT '[]'::jsonb,
  permissions_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  order_5_digit_id TEXT,
  user_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  coupon_code TEXT,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  tracking_status TEXT DEFAULT 'Order Placed',
  courier JSONB DEFAULT '{}'::jsonb,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  icon TEXT,
  image TEXT,
  sub_categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL DEFAULT 10,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  expiry_date TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  avatar TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  is_verified BOOLEAN DEFAULT true,
  is_admin_staff BOOLEAN DEFAULT false,
  admin_role_title TEXT,
  admin_permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  seller_name TEXT,
  amount NUMERIC NOT NULL,
  method TEXT DEFAULT 'bkash',
  account_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  request_date TEXT,
  processed_date TEXT
);

-- Enable Row Level Security (RLS) policies allowing full client read & write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access for rapid app prototyping & multi-vendor operations
DO $$
BEGIN
  -- Products policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public products access') THEN
    CREATE POLICY "Public products access" ON public.products FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Sellers policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sellers' AND policyname = 'Public sellers access') THEN
    CREATE POLICY "Public sellers access" ON public.sellers FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Orders policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Public orders access') THEN
    CREATE POLICY "Public orders access" ON public.orders FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Users policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Public users access') THEN
    CREATE POLICY "Public users access" ON public.users FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Categories policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Public categories access') THEN
    CREATE POLICY "Public categories access" ON public.categories FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Coupons policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Public coupons access') THEN
    CREATE POLICY "Public coupons access" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Withdrawals policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'withdrawals' AND policyname = 'Public withdrawals access') THEN
    CREATE POLICY "Public withdrawals access" ON public.withdrawals FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $;

-- 8. ENABLE REALTIME REPLICATION FOR LIVE MULTI-DEVICE SYNC
DO $
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products, public.sellers, public.orders, public.categories, public.users;
  EXCEPTION
    WHEN OTHERS THEN
      -- Publication might already contain some tables or require individual adds
      NULL;
  END;
END $;

