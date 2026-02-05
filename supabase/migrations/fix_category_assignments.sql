-- Fix ALL Product Categories
-- Run this in Supabase SQL Editor to properly assign products to categories

-- Step 1: Ensure categories exist
INSERT INTO public.categories (name, slug, description, sort_order, is_active) VALUES
  ('Skincare', 'skincare', 'Nourishing skincare essentials - creams, serums, masks, cleansers', 1, true),
  ('Lips', 'lips', 'Lipsticks, lip balms, and lip care products', 2, true),
  ('Face', 'face', 'Foundation, concealer, face masks, and facial treatments', 3, true),
  ('Eyes', 'eyes', 'Eye makeup, mascara, and eye care', 4, true),
  ('Makeup', 'makeup', 'Premium makeup collection', 5, true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = true;

-- Step 2: Update ALL products with correct category_id based on product type

-- SKINCARE PRODUCTS (Creams, Serums, Toners, Cleansers)
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE slug = 'skincare')
WHERE slug IN (
  '4k-plus-night-cream',
  'nivea-soft-cream',
  'nara-night-repair',
  'nara-moisturizing-day',
  'garnier-vitamin-c-serum',
  'cerave-am-lotion',
  'ordinary-niacinamide',
  'garnier-micellar-water',
  'some-by-mi-toner',
  'precious-skin-gold-24k',
  'melasmo-x-cream',
  'lemonvate-gel',
  'kojie-san-soap',
  'white-aura-soap',
  'axis-y-glow-serum',
  'breylee-cleanser',
  'precious-skin-serum',
  'skin-tech-glutajen'
);

-- FACE PRODUCTS (Face Masks)
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE slug = 'face')
WHERE slug IN (
  'bioaqua-blueberry-mask',
  'bioaqua-honey-mask',
  'bioaqua-rice-mask',
  'bioaqua-rose-mask',
  'bioaqua-vitamin-c-mask',
  'bioaqua-sheet-masks-set',
  'aroma-magic-mask',
  'esfolio-aloe-mask',
  'mediheal-tea-tree-mask',
  'snp-gold-collagen-mask'
);

-- LIPS PRODUCTS (Lip balms, Lip serums, Lip masks)
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE slug = 'lips')
WHERE slug IN (
  'bioaqua-lip-balm',
  'dr-sugarm-lip-mask',
  'rohto-lip-serum',
  'rojukiss-lip-serum',
  'tocobo-lip-balm',
  'vitamin-c-lip-mask',
  'rorec-lip-balm'
);

-- EYES PRODUCTS (if any)
-- UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE slug = 'eyes')
-- WHERE slug IN (...);

-- Step 3: Also add missing products from images that might not exist yet
-- (These use ON CONFLICT to avoid duplicates)

-- Face Masks that might be missing
INSERT INTO public.products (name, slug, price, description, category_id, image_url, is_new, is_active, stock_quantity, name_bn) VALUES
('Aroma Magic Anti-Acne Mask', 'aroma-magic-mask', 950, 'Anti-acne treatment mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/aroma-magic-mask.jpeg', false, true, 80, 'অ্যারোমা ম্যাজিক অ্যান্টি-অ্যাকনে মাস্ক'),
('Esfolio Pure Aloe Vera Mask', 'esfolio-aloe-mask', 150, 'Soothing aloe vera mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/esfolio-aloe-mask.jpeg', false, true, 200, 'এসফোলিও পিউর অ্যালোভেরা মাস্ক'),
('Mediheal Tea Tree Care Solution Mask', 'mediheal-tea-tree-mask', 180, 'Tea tree sheet mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/mediheal-tea-tree-mask.jpeg', true, true, 150, 'মেডিহিল টি ট্রি কেয়ার সল্যুশন মাস্ক'),
('SNP Gold Collagen Ampoule Mask', 'snp-gold-collagen-mask', 220, 'Gold collagen mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/snp-gold-collagen-mask.jpeg', true, true, 100, 'এসএনপি গোল্ড কোলাজেন অ্যাম্পুল মাস্ক'),
('Bioaqua Sheet Masks Set (5 Pack)', 'bioaqua-sheet-masks-set', 350, 'Variety sheet mask set', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/bioaqua-sheet-masks-set.jpeg', false, true, 250, 'বায়োঅ্যাকোয়া শীট মাস্ক সেট')
ON CONFLICT (slug) DO UPDATE SET 
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url,
  is_active = true;

-- Skincare products that might be missing
INSERT INTO public.products (name, slug, price, description, category_id, image_url, is_new, is_active, stock_quantity, name_bn) VALUES
('Precious Skin Vitamin C Serum', 'precious-skin-serum', 1350, 'Vitamin C brightening serum', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/precious-skin-serum.jpeg', false, true, 60, 'প্রেসিয়াস স্কিন ভিটামিন সি সিরাম'),
('Skin Tech Glutathione Whitening Serum', 'skin-tech-glutajen', 1550, 'Glutathione whitening serum', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/skin-tech-glutajen.jpeg', true, true, 45, 'স্কিন টেক গ্লুটাথিওন হোয়াইটেনিং সিরাম'),
('LANBENA Teeth Whitening Essence', 'lanbena-teeth-whitening', 650, 'Teeth whitening gel', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/lanbena-teeth-whitening.jpeg', false, true, 100, 'ল্যানবেনা টিথ হোয়াইটেনিং এসেন্স')
ON CONFLICT (slug) DO UPDATE SET 
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url,
  is_active = true;

-- Verify: Show product counts per category
SELECT 
  c.name as category_name,
  c.slug as category_slug,
  COUNT(p.id) as product_count
FROM public.categories c
LEFT JOIN public.products p ON p.category_id = c.id AND p.is_active = true
GROUP BY c.id, c.name, c.slug
ORDER BY c.sort_order;
