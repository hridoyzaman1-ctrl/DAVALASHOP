-- FORCE FIX DELETE PERMISSIONS
-- Run this in SQL Editor

-- 1. Reset permissions for Sales
ALTER TABLE active_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON active_sales;
CREATE POLICY "Allow All" ON active_sales FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE active_sales DISABLE ROW LEVEL SECURITY;

-- 2. Reset permissions for Coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON coupons;
CREATE POLICY "Allow All" ON coupons FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
