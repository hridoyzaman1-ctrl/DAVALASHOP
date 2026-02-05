-- 1. Ensure Categories Exist
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Skincare', 'skincare', 'Nourishing skincare essentials', 1),
  ('Makeup', 'makeup', 'Premium makeup collection', 2),
  ('Lips', 'lips', 'Lipsticks and lip care', 3),
  ('Eyes', 'eyes', 'Eye makeup and care', 4),
  ('Face', 'face', 'Foundation, concealer, and more', 5)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Products (fetching category IDs dynamically)
WITH cats AS (
  SELECT id, slug FROM public.categories
)
INSERT INTO public.products (
  name, 
  slug, 
  price, 
  description, 
  category_id, 
  image_url, 
  is_new, 
  is_active, 
  stock_quantity
) VALUES
-- Skincare
(
  'Vitamin C Radiance Serum', 
  'vitamin-c-serum', 
  2500, 
  'Brightening serum for a natural glow.', 
  (SELECT id FROM cats WHERE slug = 'skincare'),
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80',
  true, true, 50
),
(
  'Hydrating Night Cream', 
  'hydrating-night-cream', 
  3200, 
  'Deep hydration for overnight repair.', 
  (SELECT id FROM cats WHERE slug = 'skincare'),
  'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80',
  false, true, 30
),
-- Makeup
(
  'Velvet Matte Lipstick - Red', 
  'velvet-matte-red', 
  1500, 
  'Long-lasting matte finish in classic red.', 
  (SELECT id FROM cats WHERE slug = 'lips'),
  'https://images.unsplash.com/photo-1586495777744-4413f2106206?auto=format&fit=crop&q=80',
  true, true, 100
),
(
  'Volumizing Mascara', 
  'volumizing-mascara', 
  1200, 
  'Dramatic lashes with a single coat.', 
  (SELECT id FROM cats WHERE slug = 'eyes'),
  'https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?auto=format&fit=crop&q=80',
  false, true, 75
),
-- Face
(
  'Luminous Foundation', 
  'luminous-foundation', 
  2800, 
  'Medium coverage with a dewy finish.', 
  (SELECT id FROM cats WHERE slug = 'face'),
  'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80',
  true, true, 40
),
(
  'Setting Powder', 
  'setting-powder', 
  1800, 
  'Translucent powder for a flawless look.', 
  (SELECT id FROM cats WHERE slug = 'face'),
  'https://images.unsplash.com/photo-1590156206657-b18a629b3524?auto=format&fit=crop&q=80',
  false, true, 60
)
ON CONFLICT (slug) DO NOTHING;
