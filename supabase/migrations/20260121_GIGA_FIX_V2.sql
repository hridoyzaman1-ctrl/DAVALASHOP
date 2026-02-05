-- ==========================================
-- GIGA-FIX V2: DIRECT PERMISSIONS (FUNCTION-FREE)
-- Run this in Supabase SQL Editor to fix Order Visibility
-- ==========================================

-- 1. Ensure the user_roles table exists and has the correct schema
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role)
);

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Admins view order_items" ON public.order_items;

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. ULTRA-ROBUST ADMIN POLICIES (Using direct EXISTS check instead of has_role function)
-- This avoids any "function recursion" or "search path" issues.

-- PROFILES: Admin can see everything
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- ORDERS: Admin can see everything
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage orders" 
ON public.orders FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- ORDER ITEMS: Admin can see everything
CREATE POLICY "Admins view order_items" 
ON public.order_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- 5. Give YOUR email admin rights (Run this for your email)
-- Replace 'hridoyzaman.dev@gmail.com' with your actual admin email if different
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'hridoyzaman.dev@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Final verification - grant everything to authenticated users for these tables
-- (Policies still restrict the rows)
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.order_items TO authenticated;

-- Confirmation
SELECT 'GIGA-FIX V2 APPLIED' as status;
