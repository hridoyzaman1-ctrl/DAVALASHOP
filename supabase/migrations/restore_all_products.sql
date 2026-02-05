-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2),
  category_id UUID,
  image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  is_new BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT,
  volume_size TEXT, 
  ingredients TEXT,
  skin_type TEXT,
  shade_range TEXT[],
  finish_type TEXT, 
  coverage TEXT,
  benefits TEXT[],
  how_to_use TEXT,
  editors_note TEXT,
  name_bn TEXT, 
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Insert Categories
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Skincare', 'skincare', 'Nourishing skincare essentials', 1),
  ('Makeup', 'makeup', 'Premium makeup collection', 2),
  ('Lips', 'lips', 'Lipsticks and lip care', 3),
  ('Eyes', 'eyes', 'Eye makeup and care', 4),
  ('Face', 'face', 'Foundation, concealer, and more', 5)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Products with EXACT LOCAL IMAGE PATHS
WITH cats AS (SELECT id, slug FROM public.categories)
INSERT INTO public.products (name, slug, price, description, category_id, image_url, is_new, is_active, stock_quantity, name_bn) VALUES
-- Skincare
('4K Plus Whitening Night Cream 5X', '4k-plus-night-cream', 1650, 'Whitening night cream.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/4k-plus-night-cream.jpeg', false, true, 50, '৪কে প্লাস হোয়াইটেনিং নাইট ক্রিম ৫এক্স'),
('NIVEA Soft Moisturizing Cream', 'nivea-soft-cream', 850, 'Soft moisturizing cream.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/nivea-soft-cream.jpeg', false, true, 150, 'নিভিয়া সফট ময়েশ্চারাইজিং ক্রিম'),
('NARA Night Repair Cream', 'nara-night-repair', 1200, 'Night repair cream.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/nara-night-repair-cream.jpeg', true, true, 60, 'নারা নাইট রিপেয়ার ক্রিম'),
('NARA Moisturizing Day Cream', 'nara-moisturizing-day', 1100, 'Day cream for hydration.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/nara-moisturizing-cream.jpeg', false, true, 50, 'নারা ময়েশ্চারাইজিং ডে ক্রিম'),
('Garnier Vitamin C Serum', 'garnier-vitamin-c-serum', 1800, 'Brightening serum.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/garnier-pure-serum.jpeg', false, true, 100, 'গার্নিয়ার ভিটামিন সি সিরাম'),
('CeraVe AM Facial Moisturizing Lotion SPF 30', 'cerave-am-lotion', 2200, 'Facial moisturizing lotion.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/cerave-am-cream.jpeg', false, true, 80, 'সেরাভে এএম ফেসিয়াল ময়েশ্চারাইজিং লোশন এসপিএফ ৩০'),
('The Ordinary Niacinamide 10% + Zinc 1%', 'ordinary-niacinamide', 1450, 'Niacinamide serum.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/ordinary-niacinamide.jpeg', false, true, 120, 'দ্য অর্ডিনারি নিয়াসিনামাইড ১০% + জিংক ১%'),
('Garnier Micellar Cleansing Water', 'garnier-micellar-water', 650, 'Cleansing water.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/garnier-micellar-water.jpeg', false, true, 200, 'গার্নিয়ার মাইসেলার ক্লিনজিং ওয়াটার'),
('SOME BY MI AHA BHA PHA 30 Days Miracle Toner', 'some-by-mi-toner', 1850, 'Miracle toner.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/some-by-mi-toner.jpeg', true, true, 50, 'সাম বাই মি AHA BHA PHA ৩০ ডেজ মিরাকল টোনার'),
('Precious Skin Gold 24K Whitening Cream', 'precious-skin-gold-24k', 1250, 'Gold whitening cream.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/precious-skin-gold-cream.jpeg', false, true, 40, 'প্রেসিয়াস স্কিন গোল্ড ২৪কে হোয়াইটেনিং ক্রিম'),
('Melasmo-X Glutathione Brightening Cream', 'melasmo-x-cream', 1350, 'Brightening cream.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/melasmo-x-cream.jpeg', false, true, 45, 'মেলাসমো-এক্স গ্লুটাথিওন ব্রাইটেনিং ক্রিম'),
('LEMONVATE Brightening Gel', 'lemonvate-gel', 850, 'Brightening gel.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/lemonvate-gel.jpeg', false, true, 60, 'লেমনভেট ব্রাইটেনিং জেল'),
('Kojie San Skin Lightening Soap', 'kojie-san-soap', 450, 'Lightening soap.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/kojie-san-soap.jpeg', false, true, 300, 'কোজি সান স্কিন লাইটেনিং সোপ'),
('White Aura Miracle Whitening Soap', 'white-aura-soap', 550, 'Whitening soap.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/white-aura-soap.jpeg', false, true, 200, 'হোয়াইট অরা মিরাকল হোয়াইটেনিং সোপ'),
('Axis-Y Dark Spot Correcting Glow Serum', 'axis-y-glow-serum', 1950, 'Glow serum.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/axis-y-glow-serum.jpeg', true, true, 70, 'অ্যাক্সিস-ওয়াই ডার্ক স্পট করেক্টিং গ্লো সিরাম'),
('Breylee Vitamin C Brightening Cleanser', 'breylee-cleanser', 750, 'Brightening Cleanser.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/breylee-cleanser.jpeg', false, true, 90, 'ব্রেইলি ভিটামিন সি ব্রাইটেনিং ক্লিনজার'),
('Bioaqua Blueberry Mask', 'bioaqua-blueberry-mask', 80, 'Sheet mask.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/bioaqua-blueberry-mask.jpeg', false, true, 500, 'বায়োঅ্যাকোয়া ব্লুবেরি মাস্ক'),
('Bioaqua Honey Mask', 'bioaqua-honey-mask', 80, 'Honey mask.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/bioaqua-honey-mask.jpeg', false, true, 500, 'বায়োঅ্যাকোয়া হানি মাস্ক'),
('Bioaqua Rice Mask', 'bioaqua-rice-mask', 80, 'Rice mask.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/bioaqua-rice-mask.jpeg', false, true, 500, 'বায়োঅ্যাকোয়া রাইস মাস্ক'),
('Bioaqua Rose Mask', 'bioaqua-rose-mask', 80, 'Rose mask.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/bioaqua-rose-mask.jpeg', false, true, 500, 'বায়োঅ্যাকোয়া রোজ মাস্ক'),
('Bioaqua Vitamin C Mask', 'bioaqua-vitamin-c-mask', 80, 'Vitamin C mask.', (SELECT id FROM cats WHERE slug = 'skincare'), '/products/bioaqua-vitamin-c-mask.jpeg', false, true, 500, 'বায়োঅ্যাকোয়া ভিটামিন সি মাস্ক'),

-- Lips
('Bioaqua Lip Balm', 'bioaqua-lip-balm', 150, 'Lip balm.', (SELECT id FROM cats WHERE slug = 'lips'), '/products/bioaqua-lip-balm.jpeg', false, true, 200, 'বায়োঅ্যাকোয়া লিপ বাম'),
('Dr. Sugarm Lip Mask', 'dr-sugarm-lip-mask', 350, 'Lip mask.', (SELECT id FROM cats WHERE slug = 'lips'), '/products/dr-sugarm-lip-mask.jpeg', false, true, 100, 'ডা. সুগার্ম লিপ মাস্ক'),
('Rohto Lip The Color Serum', 'rohto-lip-serum', 650, 'Lip color serum.', (SELECT id FROM cats WHERE slug = 'lips'), '/products/rohto-lip-serum.jpeg', false, true, 80, 'রোহটো লিপ দ্য কালার সিরাম'),
('Rojukiss Lip Serum', 'rojukiss-lip-serum', 550, 'Lip serum.', (SELECT id FROM cats WHERE slug = 'lips'), '/products/rojukiss-lip-serum.jpeg', false, true, 80, 'রজুকিস লিপ সিরাম'),
('Tocobo Vitamin Lip Balm', 'tocobo-lip-balm', 950, 'Vitamin lip balm.', (SELECT id FROM cats WHERE slug = 'lips'), '/products/tocobo-lip-balm.jpeg', true, true, 60, 'টোকোবো ভিটামিন লিপ বাম'),
('Vitamin C Lip Mask', 'vitamin-c-lip-mask', 250, 'Lip mask.', (SELECT id FROM cats WHERE slug = 'lips'), '/products/vitamin-c-lip-mask.jpeg', false, true, 150, 'ভিটামিন সি লিপ মাস্ক'),
('Rorec Honey Lip Balm', 'rorec-lip-balm', 120, 'Honey lip balm.', (SELECT id FROM cats WHERE slug = 'lips'), '/products/rorec-lip-balm.jpeg', false, true, 200, 'রোরেক হানি লিপ বাম')

ON CONFLICT (slug) DO UPDATE SET 
  price = EXCLUDED.price,
  name_bn = EXCLUDED.name_bn,
  image_url = EXCLUDED.image_url,
  category_id = EXCLUDED.category_id,
  is_active = true;

-- 4. Create Reviews Table & Mock Data
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  delivery_area TEXT NOT NULL CHECK (delivery_area IN ('dhaka', 'outside_dhaka')),
  delivery_price NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Create Profiles Table & Wishlist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  address text,
  mobile text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 7. Admin Access Note
-- The previous INSERT failed because the User ID provided does not exist in this new database instance.
-- PLEASE SIGN UP on the website first.
-- Once signed up, you can run this simple query to make yourself admin (replace with your email):
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';

-- 8. Final RLS Fix (The "Curtain Opener")
DROP POLICY IF EXISTS "Public active products" ON public.products;
CREATE POLICY "Public active products" ON public.products FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public categories" ON public.categories;
CREATE POLICY "Public categories" ON public.categories FOR SELECT USING (true);
