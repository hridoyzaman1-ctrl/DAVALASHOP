-- Add new site settings for currency, language, delivery, and contact info
INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('currency', 'taka', 'Currency display: taka, dollar, or both'),
  ('delivery_dhaka_price', '80', 'Delivery price inside Dhaka in Taka'),
  ('delivery_outside_dhaka_price', '150', 'Delivery price outside Dhaka in Taka'),
  ('address_line1', 'Gulshan-2, Dhaka', 'Address line 1'),
  ('address_line2', 'Dhaka, Bangladesh', 'Address line 2'),
  ('phone', '+880 1234-567890', 'Contact phone number'),
  ('email', 'hello@davala.beauty', 'Contact email address'),
  ('instagram_url', 'https://instagram.com/davala', 'Instagram profile URL'),
  ('tiktok_url', 'https://tiktok.com/@davala', 'TikTok profile URL'),
  ('facebook_url', 'https://facebook.com/davala', 'Facebook page URL')
ON CONFLICT (key) DO NOTHING;

-- Add unique constraint on key if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_key_unique'
  ) THEN
    ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_key_unique UNIQUE (key);
  END IF;
END $$;

-- Update RLS policy to include new readable keys
DROP POLICY IF EXISTS "Public settings are readable" ON public.site_settings;
CREATE POLICY "Public settings are readable" 
ON public.site_settings 
FOR SELECT 
USING (key = ANY (ARRAY[
  'whatsapp_number', 
  'site_name', 
  'site_description',
  'currency',
  'delivery_dhaka_price',
  'delivery_outside_dhaka_price',
  'address_line1',
  'address_line2',
  'phone',
  'email',
  'instagram_url',
  'tiktok_url',
  'facebook_url'
]));