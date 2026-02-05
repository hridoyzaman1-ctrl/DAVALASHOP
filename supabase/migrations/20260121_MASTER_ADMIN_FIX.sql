-- ==========================================
-- MASTER ADMIN DASHBOARD RESTORATION SCRIPT
-- ==========================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

BEGIN;

-- 1. FIX PRODUCTS TABLE
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS name_bn TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS volume_size TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS ingredients TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS skin_type TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS shade_range TEXT[];
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS finish_type TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS coverage TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS benefits TEXT[];
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS how_to_use TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS editors_note TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';

-- 2. FIX LANDING PAGE SECTIONS (The Content Manager)
CREATE TABLE IF NOT EXISTS public.landing_page_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key text UNIQUE NOT NULL,
    title text,
    subtitle text,
    description text,
    cta_text text,
    cta_link text,
    image_url text,
    secondary_image_url text,
    video_url text,
    video_urls text[] DEFAULT '{}',
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ensure all columns exist (in case table existed but was old)
ALTER TABLE public.landing_page_sections ADD COLUMN IF NOT EXISTS video_urls text[] DEFAULT '{}';
ALTER TABLE public.landing_page_sections ADD COLUMN IF NOT EXISTS secondary_image_url text;

-- Insert default sections so they appear in Admin
INSERT INTO public.landing_page_sections (section_key, title, subtitle, sort_order)
VALUES 
  ('hero', 'Premium Cosmetics', 'Unlock Your Natural Glow', 1),
  ('fifty_fifty_left', 'Natural Skincare', 'Expert formulas', 2),
  ('fifty_fifty_right', 'Magic Makeup', 'Professional results', 3),
  ('large_hero', 'Season Special', 'Limited editions available', 4),
  ('editorial', 'Our Story', 'Crafted with care', 5)
ON CONFLICT (section_key) DO NOTHING;

-- 3. FIX SITE SETTINGS (The "About" and Contact info)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text,
    description text,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid
);

-- Ensure updated_by exists
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_by uuid;

-- Seed missing keys used by Admin interface
INSERT INTO public.site_settings (key, value, description)
VALUES 
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

-- 4. FIX REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name text NOT NULL,
    customer_email text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title text,
    comment text NOT NULL,
    is_verified_purchase boolean DEFAULT false,
    is_visible boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_reviews ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;

-- 5. FIX ORDERS TABLE (Unified Schema)
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS delivery_area TEXT DEFAULT 'dhaka';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS delivery_price NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 6. PERMISSIONS (THE CURTAIN OPENER)
-- We need to ensure Admin role can actually do things
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Creation for Admin
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admins can manage %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Admins can manage %I" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin''))', t, t);
    END LOOP;
END $$;

-- 7. REFRESH SCHEMA CACHE (EXTREMELY IMPORTANT)
NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT 'ADMIN RESTORATION COMPLETE - PLEASE REFRESH YOUR BROWSER' as status;
