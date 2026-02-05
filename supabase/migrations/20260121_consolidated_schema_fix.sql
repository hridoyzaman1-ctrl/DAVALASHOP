-- ==========================================
-- CONSOLIDATED SCHEMA FIX FOR DAVALA E-COMMERCE
-- ==========================================
-- This migration is idempotent and safe to run multiple times
-- It consolidates all necessary schema fixes from previous migrations

BEGIN;

-- ==========================================
-- 1. CREATE ENUM TYPES
-- ==========================================

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. CREATE/UPDATE PROFILES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  address TEXT,
  mobile TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address') THEN
        ALTER TABLE public.profiles ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'mobile') THEN
        ALTER TABLE public.profiles ADD COLUMN mobile TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- ==========================================
-- 3. CREATE/UPDATE USER_ROLES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Ensure role column is type app_role (fix if it was created as text)
DO $$
BEGIN
    -- Check if role column is text type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'role' 
        AND data_type = 'text'
    ) THEN
        -- Cast it to app_role
        ALTER TABLE public.user_roles 
        ALTER COLUMN role TYPE app_role 
        USING role::app_role;
    END IF;
END $$;

-- ==========================================
-- 4. CREATE HAS_ROLE FUNCTION (FIXED VERSION)
-- ==========================================

-- Drop first to avoid signature conflicts. CASCADE needed because RLS policies depend on it.
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;

-- This version explicitly casts to text to avoid "operator does not exist: text = app_role" errors
-- regardless of whether the column is text or enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = _user_id
      AND user_roles.role::text = _role::text
  )
$$;

-- ==========================================
-- 5. CREATE CATEGORIES TABLE
-- ==========================================

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

-- ==========================================
-- 6. CREATE/UPDATE PRODUCTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  is_new BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT,
  -- Cosmetics-specific attributes
  name_bn TEXT,
  volume_size TEXT,
  ingredients TEXT,
  skin_type TEXT,
  shade_range TEXT[],
  finish_type TEXT,
  coverage TEXT,
  benefits TEXT[],
  how_to_use TEXT,
  editors_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to products if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name_bn') THEN
        ALTER TABLE public.products ADD COLUMN name_bn TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'volume_size') THEN
        ALTER TABLE public.products ADD COLUMN volume_size TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ingredients') THEN
        ALTER TABLE public.products ADD COLUMN ingredients TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'skin_type') THEN
        ALTER TABLE public.products ADD COLUMN skin_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'shade_range') THEN
        ALTER TABLE public.products ADD COLUMN shade_range TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'finish_type') THEN
        ALTER TABLE public.products ADD COLUMN finish_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'coverage') THEN
        ALTER TABLE public.products ADD COLUMN coverage TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'benefits') THEN
        ALTER TABLE public.products ADD COLUMN benefits TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'how_to_use') THEN
        ALTER TABLE public.products ADD COLUMN how_to_use TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'editors_note') THEN
        ALTER TABLE public.products ADD COLUMN editors_note TEXT;
    END IF;
END $$;

-- ==========================================
-- 7. CREATE ORDERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  delivery_area TEXT DEFAULT 'dhaka',
  delivery_price NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_details TEXT,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to orders if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
        ALTER TABLE public.orders ADD COLUMN customer_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
        ALTER TABLE public.orders ADD COLUMN customer_phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_address') THEN
        ALTER TABLE public.orders ADD COLUMN customer_address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_area') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_area TEXT DEFAULT 'dhaka';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_price') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_price NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal') THEN
        ALTER TABLE public.orders ADD COLUMN subtotal NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total') THEN
        ALTER TABLE public.orders ADD COLUMN total NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE public.orders ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'admin_notes') THEN
        ALTER TABLE public.orders ADD COLUMN admin_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_details') THEN
        ALTER TABLE public.orders ADD COLUMN payment_details TEXT;
    END IF;
END $$;

-- ==========================================
-- 8. CREATE ORDER_ITEMS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 9. CREATE CARTS & CART_ITEMS TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cart_id, product_id)
);

-- ==========================================
-- 10. CREATE PRODUCT_REVIEWS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add is_visible if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_reviews' AND column_name = 'is_visible') THEN
        ALTER TABLE public.product_reviews ADD COLUMN is_visible BOOLEAN DEFAULT true;
    END IF;
END $$;

-- ==========================================
-- 11. CREATE LANDING_PAGE_SECTIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.landing_page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key TEXT DEFAULT 'home',
    section_key TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    cta_text TEXT,
    cta_link TEXT,
    image_url TEXT,
    secondary_image_url TEXT,
    video_url TEXT,
    video_urls TEXT[] DEFAULT '{}',
    content_json JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landing_page_sections' AND column_name = 'page_key') THEN
        ALTER TABLE public.landing_page_sections ADD COLUMN page_key TEXT DEFAULT 'home';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landing_page_sections' AND column_name = 'video_urls') THEN
        ALTER TABLE public.landing_page_sections ADD COLUMN video_urls TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landing_page_sections' AND column_name = 'secondary_image_url') THEN
        ALTER TABLE public.landing_page_sections ADD COLUMN secondary_image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landing_page_sections' AND column_name = 'content_json') THEN
        ALTER TABLE public.landing_page_sections ADD COLUMN content_json JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Update unique constraint
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'landing_page_sections_section_key_key') THEN
        ALTER TABLE public.landing_page_sections DROP CONSTRAINT landing_page_sections_section_key_key;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'landing_page_sections_page_key_section_key_key') THEN
        ALTER TABLE public.landing_page_sections ADD CONSTRAINT landing_page_sections_page_key_section_key_key UNIQUE (page_key, section_key);
    END IF;
END $$;

-- ==========================================
-- 12. CREATE/UPDATE SITE_SETTINGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID
);

-- Add updated_by if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'updated_by') THEN
        ALTER TABLE public.site_settings ADD COLUMN updated_by UUID;
    END IF;
END $$;

-- ==========================================
-- 13. ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 14. DROP EXISTING POLICIES (CLEAN SLATE)
-- ==========================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- User Roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;

-- Categories
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

-- Products
DROP POLICY IF EXISTS "Active products are publicly readable" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;

-- Order Items
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Carts
DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;

-- Cart Items
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;

-- Product Reviews
DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.product_reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.product_reviews;

-- Landing Page Sections
DROP POLICY IF EXISTS "Sections are publicly readable" ON public.landing_page_sections;
DROP POLICY IF EXISTS "Admins can manage sections" ON public.landing_page_sections;

-- Site Settings
DROP POLICY IF EXISTS "Public settings are readable" ON public.site_settings;
DROP POLICY IF EXISTS "All settings are publicly readable" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;

-- ==========================================
-- 15. CREATE RLS POLICIES
-- ==========================================

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- CATEGORIES
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PRODUCTS
CREATE POLICY "Active products are publicly readable" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ORDERS
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ORDER_ITEMS
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE public.orders.id = public.order_items.order_id
    AND public.orders.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE public.orders.id = public.order_items.order_id
    AND public.orders.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- CARTS
CREATE POLICY "Users can manage own cart" ON public.carts FOR ALL USING (auth.uid() = user_id);

-- CART_ITEMS
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE public.carts.id = public.cart_items.cart_id
    AND public.carts.user_id = auth.uid()
  )
);

-- PRODUCT_REVIEWS
CREATE POLICY "Reviews are publicly readable" ON public.product_reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage reviews" ON public.product_reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- LANDING_PAGE_SECTIONS
CREATE POLICY "Sections are publicly readable" ON public.landing_page_sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage sections" ON public.landing_page_sections FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- SITE_SETTINGS
CREATE POLICY "All settings are publicly readable" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- 16. CREATE TRIGGERS FOR UPDATED_AT
-- ==========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop existing triggers to avoid duplicates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON public.product_reviews;
DROP TRIGGER IF EXISTS update_landing_page_sections_updated_at ON public.landing_page_sections;
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_landing_page_sections_updated_at BEFORE UPDATE ON public.landing_page_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 17. SEED DEFAULT DATA
-- ==========================================

-- Seed default categories
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Skincare', 'skincare', 'Nourishing skincare essentials', 1),
  ('Makeup', 'makeup', 'Premium makeup collection', 2),
  ('Lips', 'lips', 'Lipsticks and lip care', 3),
  ('Eyes', 'eyes', 'Eye makeup and care', 4),
  ('Face', 'face', 'Foundation, concealer, and more', 5)
ON CONFLICT (slug) DO NOTHING;

-- Seed default landing page sections
INSERT INTO public.landing_page_sections (page_key, section_key, title, subtitle, description, sort_order) VALUES 
  ('home', 'hero', 'Premium Cosmetics', 'Unlock Your Natural Glow', 'Discover luxury beauty products', 1),
  ('home', 'fifty_fifty_left', 'Natural Skincare', 'Expert formulas', 'Science-backed skincare solutions', 2),
  ('home', 'fifty_fifty_right', 'Magic Makeup', 'Professional results', 'Makeup that transforms', 3),
  ('home', 'large_hero', 'Season Special', 'Limited editions available', 'Exclusive seasonal collections', 4),
  ('home', 'editorial', 'Our Story', 'Crafted with care', 'Beauty with purpose', 5),
  ('our-story', 'header', 'Our Story', 'The Journey of DAVALA', 'Founded with a passion for bringing the finest beauty products to discerning customers worldwide.', 0),
  ('our-story', 'mission', 'Our Mission', 'Excellence in Every Detail', 'We are committed to providing the highest quality skincare and cosmetics, curated with care and expertise.', 1),
  ('sustainability', 'header', 'Sustainability', 'Beauty with a Conscience', 'Our commitment to the planet and your skin.', 0),
  ('customer-care', 'header', 'Customer Care', 'How can we help?', 'Your satisfaction is our priority. Get in touch with us for any inquiries.', 0),
  ('size-guide', 'header', 'Shade Guide', 'Find Your Perfect Match', 'Our comprehensive guide to finding the right shades and textures for your skin.', 0),
  ('store-locator', 'header', 'Store Locator', 'Find a DAVALA Near You', 'Experience our products in person at our physical locations.', 0)
ON CONFLICT (page_key, section_key) DO NOTHING;

-- Seed site settings with TAKA currency
INSERT INTO public.site_settings (key, value, description) VALUES 
  ('site_name', 'DAVALA', 'Shop Title'),
  ('site_description', 'Premium Beauty', 'Hero tagline'),
  ('phone', '+8801759772325', 'Contact Phone'),
  ('email', 'info@davala.beauty', 'Contact Email'),
  ('address_line1', 'Merul Badda, Dhaka', 'Business Office'),
  ('address_line2', 'Bangladesh', 'City/Region'),
  ('whatsapp_number', '+8801759772325', 'WhatsApp Support'),
  ('instagram_url', 'https://instagram.com/davala', 'Social Link'),
  ('tiktok_url', 'https://tiktok.com/@davala', 'Social Link'),
  ('facebook_url', 'https://facebook.com/davala', 'Social Link'),
  ('currency', 'taka', 'Default Currency'),
  ('delivery_dhaka_price', '80', 'In Dhaka Fee'),
  ('delivery_outside_dhaka_price', '150', 'Outside Dhaka Fee'),
  ('show_store_map', 'true', 'Map Visibility'),
  ('store_map_url', '', 'Google Maps Embed')
ON CONFLICT (key) DO NOTHING;

-- Force currency to taka (update if exists)
UPDATE public.site_settings SET value = 'taka' WHERE key = 'currency';

-- ==========================================
-- 18. SEED ADMIN ROLE
-- ==========================================

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'hridoyzaman1@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- ==========================================
-- 19. RELOAD SCHEMA CACHE
-- ==========================================

NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT 'CONSOLIDATED SCHEMA FIX COMPLETE - PLEASE REFRESH YOUR BROWSER' as status;
