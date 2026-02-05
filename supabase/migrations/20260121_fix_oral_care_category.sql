-- Create Oral Care category
INSERT INTO public.categories (name, slug, description, sort_order, is_active)
VALUES ('Oral Care', 'oral-care', 'Premium dental and oral hygiene products', 6, true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = true;

-- Move KNOWN oral care products to this category
-- We know 'lanbena-teeth-whitening' mentioned in previous context
UPDATE public.products 
SET category_id = (SELECT id FROM public.categories WHERE slug = 'oral-care')
WHERE slug IN (
  'lanbena-teeth-whitening',
  'lanbena-teeth-whitening-essence',
  'teeth-whitening-essence',
  'bamboo-charcoal-toothpaste',
  'activated-charcoal-powder'
);

-- Also catch products with 'Teeth' or 'Oral' in name/description that might be miscategorized
UPDATE public.products
SET category_id = (SELECT id FROM public.categories WHERE slug = 'oral-care')
WHERE (
  (name ILIKE '%teeth%' OR name ILIKE '%tooth%' OR name ILIKE '%oral%')
  AND category_id != (SELECT id FROM public.categories WHERE slug = 'oral-care')
);
