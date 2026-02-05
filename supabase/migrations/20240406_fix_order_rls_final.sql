-- COMPREHENSIVE FIX: Enable Guest & Authenticated Order Creation
-- Run this in Supabase SQL Editor

-- 1. Make user_id nullable for guest orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Grant permissions to anon and authenticated roles
GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE orders TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE order_items TO anon, authenticated, service_role;

-- 3. Drop all existing conflicting policies
DROP POLICY IF EXISTS "Enable insert for all" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Authenticated users create orders" ON orders;
DROP POLICY IF EXISTS "Enable select for own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- 4. Create permissive INSERT policy for orders (allows both guest and authenticated)
CREATE POLICY "Allow all inserts" ON orders 
FOR INSERT 
WITH CHECK (true);

-- 5. Create SELECT policy for orders (users can see their own, guests can see by ID)
CREATE POLICY "Allow select own or guest orders" ON orders 
FOR SELECT 
USING (
  auth.uid() = user_id OR  -- Authenticated users see their own
  user_id IS NULL          -- Anyone can see guest orders (needed for order confirmation)
);

-- 6. Create UPDATE policy for orders (only admins or service role)
CREATE POLICY "Allow admin updates" ON orders 
FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'service_role');

-- 7. Drop and recreate order_items policies
DROP POLICY IF EXISTS "Enable insert for all" ON order_items;
DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;

CREATE POLICY "Allow all inserts" ON order_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow select for order items" ON order_items 
FOR SELECT 
USING (true);

-- 8. Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 9. Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;
