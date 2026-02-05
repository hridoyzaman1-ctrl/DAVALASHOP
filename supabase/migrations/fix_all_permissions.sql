-- DISABLE SECURITY ON COUPONS AND SALES TO ALLOW DELETE

-- 1. Sales
ALTER TABLE active_sales DISABLE ROW LEVEL SECURITY;
GRANT ALL ON active_sales TO anon;
GRANT ALL ON active_sales TO authenticated;
GRANT ALL ON active_sales TO service_role;

-- 2. Coupons 
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
GRANT ALL ON coupons TO anon;
GRANT ALL ON coupons TO authenticated;
GRANT ALL ON coupons TO service_role;
