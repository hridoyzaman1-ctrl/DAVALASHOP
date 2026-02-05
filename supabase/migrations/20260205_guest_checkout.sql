-- Enable Guest Checkout
-- Allow anonymous users to insert into orders and order_items

-- 1. Modify ORDERS policies
-- Allow anonymous users to INSERT orders
CREATE POLICY "Everyone can insert orders" ON public.orders
FOR INSERT
WITH CHECK (
  -- Allow authenticated users to insert their own orders
  (auth.role() = 'authenticated' AND auth.uid() = user_id)
  OR
  -- Allow anonymous users to insert orders (user_id must be null)
  (auth.role() = 'anon' AND user_id IS NULL)
);

-- We also need to allow them to SELECT their own order immediately after creation?
-- Usually `select()` returns the row. For anon, RLS might block reading the row they just inserted unless we allow it.
-- However, enabling SELECT for anon on all orders with user_id=NULL is dangerous (anyone can see all guest orders).
-- Strategy: We WON'T add a broader SELECT policy for guests.
-- The client code explicitly handles the case where `select()` might return null/empty for guests,
-- by relying on the client-generated ID and data.

-- 2. Modify ORDER_ITEMS policies
-- Allow anonymous users to INSERT order items
CREATE POLICY "Everyone can insert order items" ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE public.orders.id = public.order_items.order_id
    -- We can't easily check ownership here for anon without a complex token or just trusting the order_id existance.
    -- For now, allow insertion if the order exists.
    -- To be safer, we could check if the order was just created, but that's hard in RLS.
    -- Relaxed check: Just check if order exists.
  )
);
