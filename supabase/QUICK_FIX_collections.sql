-- QUICK FIX: Add Product Collections Fields
-- Run this in Supabase SQL Editor NOW!

-- Add collection flags to products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller) WHERE is_best_seller = true;

-- Success!
SELECT 'Product collections fields added successfully!' as message;
