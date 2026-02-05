-- Default Site Settings for DAVALA
-- Run in Supabase SQL Editor

INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', 'DAVALA'),
  ('site_description', 'Premium skincare and cosmetics for modern women'),
  ('whatsapp_number', '+8801759772325'),
  ('phone', '01759772325'),
  ('email', 'hello@davala.me'),
  ('address_line1', 'Gulshan-2, Dhaka'),
  ('address_line2', 'Dhaka, Bangladesh'),
  ('currency', 'taka'),
  ('delivery_dhaka_price', '80'),
  ('delivery_outside_dhaka_price', '150'),
  ('instagram_url', 'https://instagram.com/davala'),
  ('facebook_url', 'https://facebook.com/davala'),
  ('tiktok_url', '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Verify
SELECT key, value FROM public.site_settings ORDER BY key;
