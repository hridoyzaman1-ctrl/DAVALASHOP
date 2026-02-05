-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_percent NUMERIC NOT NULL,
    coupon_type TEXT NOT NULL CHECK (coupon_type IN ('global', 'category', 'product')),
    target_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add columns to orders table for coupons
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- 3. GUEST CHECKOUT SUPPORT
-- Crucial: Make user_id nullable to allow guest orders (where user_id is undefined)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- 4. RLS POLICIES (Security & Access)
-- Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Coupon Policies
-- Allow anyone to read active coupons
DROP POLICY IF EXISTS "Public read active coupons" ON coupons;
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (is_active = true);
-- Allow authenticated users (Admins) full access (simplified)
DROP POLICY IF EXISTS "Admin full access coupons" ON coupons;
CREATE POLICY "Admin full access coupons" ON coupons USING (auth.role() = 'authenticated'); -- In production, check for specific admin role/claim

-- Order Policies for Guest Checkout
-- Allow anyone (including guests) to create an order
DROP POLICY IF EXISTS "Enable insert for all" ON orders;
CREATE POLICY "Enable insert for all" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for all" ON order_items;
CREATE POLICY "Enable insert for all" ON order_items FOR INSERT WITH CHECK (true);

-- Allow users to see their own orders (based on user_id if present)
DROP POLICY IF EXISTS "Users can see own orders" ON orders;
CREATE POLICY "Users can see own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

-- 5. COD SETTINGS
INSERT INTO site_settings (key, value, description)
VALUES ('show_cod', 'false', 'Enable or disable Cash on Delivery')
ON CONFLICT (key) DO NOTHING;
