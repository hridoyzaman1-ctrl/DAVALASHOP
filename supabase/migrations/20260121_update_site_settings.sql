-- Comprehensive Site Settings and Contact Info Update
-- Run this in Supabase SQL Editor

-- 1. Ensure the site_settings table structure is robust
CREATE TABLE IF NOT EXISTS public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text,
    description text,
    updated_at timestamptz DEFAULT now()
);

-- 2. Insert/Update all requested settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('site_name', 'DAVALA', 'The name of the shop'),
  ('site_description', 'Premium cosmetics and skincare for everyone', 'Slogan or short description'),
  ('whatsapp_number', '+8801759772325', 'WhatsApp contact for orders'),
  ('phone', '01759772325', 'Primary contact phone number'),
  ('email', 'info@davala.beauty', 'Primary contact email'),
  ('address_line1', 'Merul Badda, Dhaka', 'Primary physical address'),
  ('address_line2', 'Dhaka, Bangladesh', 'Secondary address line'),
  ('instagram_url', 'https://instagram.com/davala', 'Instagram profile link'),
  ('tiktok_url', 'https://tiktok.com/@davala', 'TikTok profile link'),
  ('facebook_url', 'https://facebook.com/davala', 'Facebook page link'),
  ('currency', 'taka', 'Display currency (taka, dollar, or both)'),
  ('delivery_dhaka_price', '80', 'Standard delivery fee inside Dhaka'),
  ('delivery_outside_dhaka_price', '150', 'Standard delivery fee outside Dhaka'),
  ('show_store_map', 'true', 'Toggle visibility of map on Store Locator page'),
  ('store_map_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14605.908354747752!2d90.41961621738281!3d23.7660233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c786a9d9a049%3A0x6b772c72b2605f6e!2sMerul%20Badda%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1700000000000', 'Google Maps Embed URL for Merul Badda')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = now();

-- 3. Verify settings
SELECT key, value FROM public.site_settings ORDER BY key;