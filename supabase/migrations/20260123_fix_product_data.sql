-- Check if sales_count column exists and has values
SELECT count(*) as total_products, 
       count(sales_count) as products_with_sales_count,
       count(*) filter (where is_new = true) as new_products
FROM public.products;

-- Fix Plan:
-- 1. Ensure sales_count exists (idempotent)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- 2. Populate sales_count with realistic numbers (ensure Descending order works)
UPDATE public.products 
SET sales_count = floor(random() * 500) + 50
WHERE sales_count IS NULL OR sales_count = 0;

-- 3. Ensure we have "New" products (Set latest 8 created products to is_new = true)
UPDATE public.products SET is_new = false; -- Reset
UPDATE public.products 
SET is_new = true 
WHERE id IN (
    SELECT id FROM public.products 
    ORDER BY created_at DESC 
    LIMIT 8
);

-- 4. Reload schema cache just in case
NOTIFY pgrst, 'reload schema';
