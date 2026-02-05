-- COMPLETE 40 PRODUCT SQL - Run in Supabase SQL Editor
-- This adds ALL 40 products to match all 40 images

-- Step 1: Ensure categories exist
INSERT INTO public.categories (name, slug, description, sort_order, is_active) VALUES
  ('Skincare', 'skincare', 'Creams, serums, toners, cleansers', 1, true),
  ('Lips', 'lips', 'Lip balms, lip serums, lip care', 2, true),
  ('Face', 'face', 'Face masks and treatments', 3, true),
  ('Eyes', 'eyes', 'Eye makeup and care', 4, true),
  ('Makeup', 'makeup', 'Premium makeup collection', 5, true)
ON CONFLICT (slug) DO UPDATE SET is_active = true;

-- Step 2: Insert ALL 40 products
INSERT INTO public.products (name, slug, price, description, category_id, image_url, is_new, is_active, stock_quantity, name_bn) VALUES

-- SKINCARE (18 products)
('4K Plus Whitening Night Cream 5X', '4k-plus-night-cream', 1650, 'Whitening night cream', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/4k-plus-night-cream.jpeg', false, true, 50, '৪কে প্লাস হোয়াইটেনিং নাইট ক্রিম'),
('4K Plus Stock Cream', '4k-plus-stock', 1700, '4K Plus cream stock pack', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/4k-plus-stock.jpeg', false, true, 30, '৪কে প্লাস স্টক ক্রিম'),
('4K Plus Whitening Cream', '4k-plus-whitening-cream', 1600, '4K Plus whitening cream', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/4k-plus-whitening-cream.jpeg', false, true, 40, '৪কে প্লাস হোয়াইটেনিং ক্রিম'),
('NIVEA Soft Moisturizing Cream', 'nivea-soft-cream', 850, 'Soft moisturizing cream', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/nivea-soft-cream.jpeg', false, true, 150, 'নিভিয়া সফট ময়েশ্চারাইজিং ক্রিম'),
('NARA Night Repair Cream', 'nara-night-repair', 1200, 'Night repair cream', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/nara-night-repair-cream.jpeg', true, true, 60, 'নারা নাইট রিপেয়ার ক্রিম'),
('NARA Moisturizing Day Cream', 'nara-moisturizing-day', 1100, 'Day cream for hydration', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/nara-moisturizing-cream.jpeg', false, true, 50, 'নারা ময়েশ্চারাইজিং ডে ক্রিম'),
('NARA Night Cream', 'nara-night-cream', 1150, 'Nara night cream formula', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/nara-night-cream.jpeg', false, true, 55, 'নারা নাইট ক্রিম'),
('NARA Stock Collection', 'nara-stock', 1250, 'Nara cream collection', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/nara-stock.jpeg', false, true, 35, 'নারা স্টক কালেকশন'),
('Garnier Vitamin C Serum', 'garnier-vitamin-c-serum', 1800, 'Brightening serum with Vitamin C', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/garnier-pure-serum.jpeg', false, true, 100, 'গার্নিয়ার ভিটামিন সি সিরাম'),
('CeraVe AM Facial Moisturizing Lotion SPF 30', 'cerave-am-lotion', 2200, 'Facial moisturizing lotion with SPF', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/cerave-am-cream.jpeg', true, true, 80, 'সেরাভে এএম ফেসিয়াল লোশন'),
('The Ordinary Niacinamide 10% + Zinc 1%', 'ordinary-niacinamide', 1450, 'Niacinamide serum for pores', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/ordinary-niacinamide.jpeg', false, true, 120, 'দ্য অর্ডিনারি নিয়াসিনামাইড'),
('Garnier Micellar Cleansing Water', 'garnier-micellar-water', 650, 'Gentle cleansing water', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/garnier-micellar-water.jpeg', false, true, 200, 'গার্নিয়ার মাইসেলার ওয়াটার'),
('SOME BY MI AHA BHA PHA 30 Days Miracle Toner', 'some-by-mi-toner', 1850, 'Miracle toner for acne', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/some-by-mi-toner.jpeg', true, true, 50, 'সাম বাই মি মিরাকল টোনার'),
('Precious Skin Gold 24K Whitening Cream', 'precious-skin-gold-24k', 1250, 'Gold whitening cream', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/precious-skin-gold-cream.jpeg', false, true, 40, 'প্রেসিয়াস স্কিন গোল্ড ক্রিম'),
('Precious Skin Vitamin C Serum', 'precious-skin-serum', 1350, 'Vitamin C brightening serum', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/precious-skin-serum.jpeg', false, true, 60, 'প্রেসিয়াস স্কিন সিরাম'),
('Melasmo-X Glutathione Brightening Cream', 'melasmo-x-cream', 1350, 'Brightening cream with glutathione', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/melasmo-x-cream.jpeg', false, true, 45, 'মেলাসমো-এক্স ব্রাইটেনিং ক্রিম'),
('LEMONVATE Brightening Gel', 'lemonvate-gel', 850, 'Brightening gel treatment', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/lemonvate-gel.jpeg', false, true, 60, 'লেমনভেট ব্রাইটেনিং জেল'),
('Kojie San Skin Lightening Soap', 'kojie-san-soap', 450, 'Kojic acid lightening soap', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/kojie-san-soap.jpeg', false, true, 300, 'কোজি সান লাইটেনিং সোপ'),
('White Aura Miracle Whitening Soap', 'white-aura-soap', 550, 'Whitening soap bar', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/white-aura-soap.jpeg', false, true, 200, 'হোয়াইট অরা হোয়াইটেনিং সোপ'),
('Axis-Y Dark Spot Correcting Glow Serum', 'axis-y-glow-serum', 1950, 'Dark spot correcting serum', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/axis-y-glow-serum.jpeg', true, true, 70, 'অ্যাক্সিস-ওয়াই গ্লো সিরাম'),
('Breylee Vitamin C Brightening Cleanser', 'breylee-cleanser', 750, 'Brightening face cleanser', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/breylee-cleanser.jpeg', false, true, 90, 'ব্রেইলি ব্রাইটেনিং ক্লিনজার'),
('Skin Tech Glutathione Whitening Serum', 'skin-tech-glutajen', 1550, 'Glutathione whitening serum', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/skin-tech-glutajen.jpeg', true, true, 45, 'স্কিন টেক গ্লুটাথিওন সিরাম'),
('LANBENA Teeth Whitening Essence', 'lanbena-teeth-whitening', 650, 'Teeth whitening gel', (SELECT id FROM public.categories WHERE slug = 'skincare'), '/products/lanbena-teeth-whitening.jpeg', false, true, 100, 'ল্যানবেনা টিথ হোয়াইটেনিং'),

-- FACE MASKS (10 products)
('Bioaqua Blueberry Mask', 'bioaqua-blueberry-mask', 80, 'Blueberry sheet mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/bioaqua-blueberry-mask.jpeg', false, true, 500, 'বায়োঅ্যাকোয়া ব্লুবেরি মাস্ক'),
('Bioaqua Honey Mask', 'bioaqua-honey-mask', 80, 'Honey nourishing mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/bioaqua-honey-mask.jpeg', false, true, 500, 'বায়োঅ্যাকোয়া হানি মাস্ক'),
('Bioaqua Rice Mask', 'bioaqua-rice-mask', 80, 'Rice brightening mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/bioaqua-rice-mask.jpeg', false, true, 500, 'বায়োঅ্যাকোয়া রাইস মাস্ক'),
('Bioaqua Rose Mask', 'bioaqua-rose-mask', 80, 'Rose hydrating mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/bioaqua-rose-mask.jpeg', false, true, 500, 'বায়োঅ্যাকোয়া রোজ মাস্ক'),
('Bioaqua Vitamin C Mask', 'bioaqua-vitamin-c-mask', 80, 'Vitamin C brightening mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/bioaqua-vitamin-c-mask.jpeg', false, true, 500, 'বায়োঅ্যাকোয়া ভিটামিন সি মাস্ক'),
('Bioaqua Sheet Masks Set (5 Pack)', 'bioaqua-sheet-masks-set', 350, 'Variety sheet mask set', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/bioaqua-sheet-masks-set.jpeg', false, true, 250, 'বায়োঅ্যাকোয়া শীট মাস্ক সেট'),
('Aroma Magic Anti-Acne Mask', 'aroma-magic-mask', 950, 'Anti-acne treatment mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/aroma-magic-mask.jpeg', false, true, 80, 'অ্যারোমা ম্যাজিক মাস্ক'),
('Esfolio Pure Aloe Vera Mask', 'esfolio-aloe-mask', 150, 'Soothing aloe vera mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/esfolio-aloe-mask.jpeg', false, true, 200, 'এসফোলিও অ্যালোভেরা মাস্ক'),
('Mediheal Tea Tree Care Solution Mask', 'mediheal-tea-tree-mask', 180, 'Tea tree calming mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/mediheal-tea-tree-mask.jpeg', true, true, 150, 'মেডিহিল টি ট্রি মাস্ক'),
('SNP Gold Collagen Ampoule Mask', 'snp-gold-collagen-mask', 220, 'Gold collagen anti-aging mask', (SELECT id FROM public.categories WHERE slug = 'face'), '/products/snp-gold-collagen-mask.jpeg', true, true, 100, 'এসএনপি গোল্ড কোলাজেন মাস্ক'),

-- LIPS (7 products)
('Bioaqua Lip Balm', 'bioaqua-lip-balm', 150, 'Moisturizing lip balm', (SELECT id FROM public.categories WHERE slug = 'lips'), '/products/bioaqua-lip-balm.jpeg', false, true, 200, 'বায়োঅ্যাকোয়া লিপ বাম'),
('Dr. Sugarm Lip Mask', 'dr-sugarm-lip-mask', 350, 'Overnight lip treatment mask', (SELECT id FROM public.categories WHERE slug = 'lips'), '/products/dr-sugarm-lip-mask.jpeg', false, true, 100, 'ডা. সুগার্ম লিপ মাস্ক'),
('Rohto Lip The Color Serum', 'rohto-lip-serum', 650, 'Tinted lip serum', (SELECT id FROM public.categories WHERE slug = 'lips'), '/products/rohto-lip-serum.jpeg', false, true, 80, 'রোহটো লিপ সিরাম'),
('Rojukiss Lip Serum', 'rojukiss-lip-serum', 550, 'Hydrating lip serum', (SELECT id FROM public.categories WHERE slug = 'lips'), '/products/rojukiss-lip-serum.jpeg', false, true, 80, 'রজুকিস লিপ সিরাম'),
('Tocobo Vitamin Lip Balm', 'tocobo-lip-balm', 950, 'Vitamin enriched lip balm', (SELECT id FROM public.categories WHERE slug = 'lips'), '/products/tocobo-lip-balm.jpeg', true, true, 60, 'টোকোবো ভিটামিন লিপ বাম'),
('Vitamin C Lip Mask', 'vitamin-c-lip-mask', 250, 'Vitamin C lip treatment', (SELECT id FROM public.categories WHERE slug = 'lips'), '/products/vitamin-c-lip-mask.jpeg', false, true, 150, 'ভিটামিন সি লিপ মাস্ক'),
('Rorec Honey Lip Balm', 'rorec-lip-balm', 120, 'Honey lip balm', (SELECT id FROM public.categories WHERE slug = 'lips'), '/products/rorec-lip-balm.jpeg', false, true, 200, 'রোরেক হানি লিপ বাম')

ON CONFLICT (slug) DO UPDATE SET 
  price = EXCLUDED.price,
  name_bn = EXCLUDED.name_bn,
  image_url = EXCLUDED.image_url,
  category_id = EXCLUDED.category_id,
  is_active = true,
  description = EXCLUDED.description;

-- Verify counts
SELECT 'Total Products' as metric, COUNT(*) as count FROM public.products WHERE is_active = true
UNION ALL
SELECT c.name, COUNT(p.id) FROM public.categories c 
LEFT JOIN public.products p ON p.category_id = c.id AND p.is_active = true
GROUP BY c.name ORDER BY metric;
