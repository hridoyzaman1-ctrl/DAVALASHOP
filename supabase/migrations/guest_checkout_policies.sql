-- Allow public access to create orders (for guest checkout)
-- Only allow INSERT if user_id is null (guest) or matches auth.uid() (authenticated)

-- ORDERS Policies

DROP POLICY IF EXISTS "Anyone can create guest orders" ON public.orders;
CREATE POLICY "Anyone can create guest orders" ON public.orders
FOR INSERT WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR
  (auth.uid() = user_id)
);

-- ORDER_ITEMS Policies

DROP POLICY IF EXISTS "Anyone can create guest order items" ON public.order_items;
CREATE POLICY "Anyone can create guest order items" ON public.order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE public.orders.id = public.order_items.order_id
    AND (
      (public.orders.user_id IS NULL AND auth.uid() IS NULL) OR
      (public.orders.user_id = auth.uid())
    )
  )
);
