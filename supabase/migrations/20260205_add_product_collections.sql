-- Add Product Collections Fields
-- This migration adds flags for "New In" and "Best Selling" collections
-- Products can be tagged with these flags to appear in special collection pages

-- Add collection flags to products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;

-- Add helpful comments
COMMENT ON COLUMN products.is_new_arrival IS 'Flag to mark product as New Arrival - appears in New In collection';
COMMENT ON COLUMN products.is_best_seller IS 'Flag to mark product as Best Seller - appears in Best Selling collection';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller) WHERE is_best_seller = true;

-- Grant necessary permissions
GRANT SELECT ON products TO anon;
GRANT SELECT ON products TO authenticated;
GRANT ALL ON products TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Product collections fields added successfully!';
  RAISE NOTICE 'Products can now be tagged as New Arrivals and/or Best Sellers';
END $$;
