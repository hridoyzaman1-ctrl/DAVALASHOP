-- Add sales_count to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- Mock data: Update all products with random sales count between 0 and 1000
UPDATE public.products SET sales_count = floor(random() * 1000);

-- Enable RLS for sales_count (implicitly handled by existing policy but good to check)
