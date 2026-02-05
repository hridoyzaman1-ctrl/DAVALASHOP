-- OPTIMIZATION: Improve Newsletter Page Load Speed

-- 1. Add Index for Sorting (Critical for speed)
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at 
ON public.newsletter_subscribers (subscribed_at DESC);

-- 2. Optimize RLS Policy to use the cached 'has_role' function
-- This is faster than checking the table manually for every row.

DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
