# 🚀 AmarBazar BD: GitHub ➔ Vercel ➔ Supabase ডেপ্লয়মেন্ট গাইড

এই প্রজেক্টটি **GitHub ➔ Vercel ➔ Supabase** আর্কিটেকচারে সম্পূর্ণ অপ্টিমাইজ করা হয়েছে। এতে ওয়েবসাইট **কখনোই স্লিপ করবে না**, **আল্ট্রাফাস্ট স্পিডে (<0.1s)** লোড হবে এবং **Supabase PostgreSQL**-এ রিয়েলটাইমে সব ডাটা নিরাপদ থাকবে।

---

## 🏗️ আর্কিটেকচার ওভারভিউ:
1. **GitHub:** সোর্স কোড রিপোজিটরি ও ভার্সন কন্ট্রোল।
2. **Vercel:** হাই-পারফরম্যান্স গ্লোবাল এজ হোস্টিং ও অটোমেটিক সিআই/সিডি (Vite SPA + API Serverless)।
3. **Supabase:** পোস্টগ্রেসকিউএল (PostgreSQL) ডাটাবেজ, রিয়েলটাইম লিসেনার ও রো-লেভেল সিকিউরিটি।

---

## 📌 ধাপ ১: GitHub-এ কোড আপলোড করুন

১. আপনার প্রোজেক্ট ডিরেক্টরিতে গিট ইনিশিয়ালাইজ ও কমিট করুন:
```bash
git init
git add .
git commit -m "Configure GitHub, Vercel and Supabase full-stack architecture"
```

২. GitHub-এ একটি নতুন Repository তৈরি করে পুশ করুন:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/amarbazar-bd.git
git push -u origin main
```

---

## 📌 ধাপ ২: Supabase ডাটাবেজ তৈরি ও কনফিগারেশন

১. [Supabase](https://supabase.com/)-এ বিনামূল্যে একটি একাউন্ট তৈরি করে **New Project** খুলুন।
2. **SQL Editor** ট্যাবে যান এবং নিচের SQL স্ক্রিপ্টটি রান করে টেবিলগুলো তৈরি করুন:

```sql
-- 1. Products Table
create table if not exists products (
  id text primary key,
  title text not null,
  title_bn text,
  slug text,
  description text,
  description_bn text,
  price numeric default 0,
  discount_price numeric,
  category_id text,
  category_name text,
  sub_category text,
  brand text,
  seller_id text,
  seller_name text,
  stock integer default 0,
  sku text,
  images jsonb default '[]'::jsonb,
  rating numeric default 5.0,
  review_count integer default 0,
  tags jsonb default '[]'::jsonb,
  is_featured boolean default false,
  is_flash_deal boolean default false,
  is_combo boolean default false,
  combo_items jsonb default '[]'::jsonb,
  variants jsonb default '[]'::jsonb,
  variant_prices jsonb default '{}'::jsonb,
  bulk_offers jsonb default '[]'::jsonb,
  custom_specs jsonb default '[]'::jsonb,
  warranty text,
  warranty_policy text,
  return_policy text,
  delivery_time text,
  is_free_delivery boolean default false,
  delivery_charge_inside numeric default 60,
  delivery_charge_outside numeric default 120,
  is_cod_available boolean default true,
  is_express_delivery boolean default false,
  is_approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Categories Table
create table if not exists categories (
  id text primary key,
  name text not null,
  name_bn text,
  slug text,
  image text,
  icon text,
  subcategories jsonb default '[]'::jsonb,
  product_count integer default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Sellers Table
create table if not exists sellers (
  id text primary key,
  seller_id text,
  store_name text not null,
  store_name_bn text,
  owner_name text,
  email text,
  phone text,
  logo_url text,
  banner_url text,
  rating numeric default 5.0,
  total_sales numeric default 0,
  balance numeric default 0,
  is_approved boolean default true,
  join_date text,
  is_verified boolean default true,
  is_featured boolean default false,
  status text default 'approved',
  subscription_tier text default 'pro',
  subscription_status text default 'active',
  subscription_expiry_date text,
  cloud_subscription_plan text,
  storage_type text default 'supabase',
  storage_credentials text,
  trade_license_number text,
  bkash_number text,
  bank_account_details text,
  staff jsonb default '[]'::jsonb,
  staff_members jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Orders Table
create table if not exists orders (
  id text primary key,
  user_id text,
  customer_name text,
  customer_phone text,
  customer_email text,
  items jsonb default '[]'::jsonb,
  total_amount numeric default 0,
  discount_amount numeric default 0,
  delivery_charge numeric default 60,
  payment_method text default 'cod',
  payment_status text default 'pending',
  shipping_address jsonb default '{}'::jsonb,
  status text default 'pending',
  seller_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. System Settings Table
create table if not exists settings (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Users Table
create table if not exists users (
  id text primary key,
  name text not null,
  email text,
  phone text,
  role text default 'customer',
  password text,
  avatar text,
  is_verified boolean default true,
  addresses jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Realtime for live cross-device sync
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table settings;
```

৩. **Project Settings ➔ API** থেকে আপনার **Project URL** এবং **anon public key** কপি করুন।

---

## 📌 ধাপ ৩: Vercel-এ ১-ক্লিকে ডেপ্লয় করুন

১. [Vercel Dashboard](https://vercel.com/new)-এ যান।
২. আপনার **GitHub Repository** সিলেক্ট করে **Import** করুন।
৩. প্রজেক্ট সেটিংস:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
৪. **Environment Variables** সেকশনে এই ভেরিয়েবলগুলো যোগ করুন:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
   - `GEMINI_API_KEY` = `your-gemini-api-key` (Optional: AI Assistant/Copywriter-এর জন্য)
৫. **Deploy** বাটনে ক্লিক করুন। ২ মিনিটের মধ্যে আপনার সুপারফাস্ট ইকমার্স সাইট লাইভ হয়ে যাবে!

---

## 📱 বোনাস: Android Play Store রিলিজ
অ্যান্ড্রয়েড অ্যাপ বিল্ড করতে:
```bash
npm run build:android
npx cap open android
```
