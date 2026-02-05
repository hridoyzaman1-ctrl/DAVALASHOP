-- Enable RLS on tables (if not already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 1. PRODUCTS: Allow everyone to view active products
DROP POLICY IF EXISTS "Public active products" ON public.products;
CREATE POLICY "Public active products"
ON public.products FOR SELECT
USING (is_active = true);

-- 2. CATEGORIES: Allow everyone to view categories
DROP POLICY IF EXISTS "Public categories" ON public.categories;
CREATE POLICY "Public categories"
ON public.categories FOR SELECT
USING (true);

-- 3. STORAGE: Allow public access to product-images bucket
-- Note: This requires the bucket 'product-images' to exist.
-- If you use a different bucket name, change it here.
BEGIN;
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
  
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'product-images' );
COMMIT;
