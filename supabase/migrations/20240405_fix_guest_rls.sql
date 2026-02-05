-- FIX: Enable Guest Checkout (Fixes RLS Error)

-- 1. Ensure user_id is nullable (Required for Guest Checkout)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Enable insert for all" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON orders;

-- 3. Create PERMISSIVE policy for inserts (Allows Guests & Users)
CREATE POLICY "Enable insert for all" ON orders FOR INSERT WITH CHECK (true);

-- 4. Do the same for order_items
DROP POLICY IF EXISTS "Enable insert for all" ON order_items;
CREATE POLICY "Enable insert for all" ON order_items FOR INSERT WITH CHECK (true);

-- 5. Ensure RLS is active
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
