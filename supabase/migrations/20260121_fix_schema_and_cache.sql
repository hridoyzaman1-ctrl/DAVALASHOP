-- COMPREHENSIVE SCHEMA SYNC & CACHE REFRESH
-- Run this in the Supabase SQL Editor

-- 1. Fix Products Table
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS name_bn TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS volume_size TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS ingredients TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS skin_type TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS shade_range TEXT[];
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS finish_type TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS coverage TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS benefits TEXT[];
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS how_to_use TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS editors_note TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';

-- 2. Fix Site Settings Table
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 3. Fix Categories Table
ALTER TABLE IF EXISTS public.categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. Fix Orders Table (Addressing security_overhaul mismatch)
-- Add missing columns if they don't exist
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS delivery_area TEXT DEFAULT 'dhaka';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS delivery_price NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- Try to map existing columns if they were named differently by security_overhaul
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total_amount') THEN
        UPDATE public.orders SET total = total_amount WHERE total = 0;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shipping_address') THEN
        UPDATE public.orders SET customer_address = shipping_address WHERE customer_address IS NULL;
    END IF;
END $$;

-- 5. Fix Order Items Table
ALTER TABLE IF EXISTS public.order_items ADD COLUMN IF NOT EXISTS product_image TEXT;
ALTER TABLE IF EXISTS public.order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;

-- 6. Refresh Schema Cache (CRITICAL)
NOTIFY pgrst, 'reload schema';

-- 7. Verification
SELECT 'Database schema successfully synced and cache refresh triggered' as status;
