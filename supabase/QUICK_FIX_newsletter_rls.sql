-- FIX: Allow admins to view subscribers by checking user_roles table directly
-- Usage: Run this in Supabase SQL Editor

-- 1. Drop the old broken policy
DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON public.newsletter_subscribers;

-- 2. Create the new working policy
CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (
  exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
);
