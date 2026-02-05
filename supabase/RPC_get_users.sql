-- FIX: Enable "Users" page in Admin Panel
-- Run this in Supabase SQL Editor

-- 1. Create the RPC function to securely list users
DROP FUNCTION IF EXISTS public.get_users_for_admin();

CREATE OR REPLACE FUNCTION public.get_users_for_admin()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  created_at TIMESTAMPTZ,
  role public.app_role,
  full_name TEXT,
  address TEXT,
  mobile TEXT,
  avatar_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    au.id,
    au.email::VARCHAR,
    au.created_at,
    ur.role,
    (au.raw_user_meta_data->>'full_name')::TEXT as full_name,
    NULL::TEXT as address,
    au.phone::TEXT as mobile,
    (au.raw_user_meta_data->>'avatar_url')::TEXT as avatar_url
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  ORDER BY au.created_at DESC;
$$;

-- 2. Grant permission to authenticated users (Actual security is handled by RLS if used, but for RPC we trust the function logic or add a check)
-- NOTE: We should restrict this to admins only inside the function for extra safety, but getting it working first is priority.
-- To make it secure, we can add: WHERE public.has_role(auth.uid(), 'admin')
-- Let's add that check to be safe.

CREATE OR REPLACE FUNCTION public.get_users_for_admin()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  created_at TIMESTAMPTZ,
  role public.app_role,
  full_name TEXT,
  address TEXT,
  mobile TEXT,
  avatar_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    au.id,
    au.email::VARCHAR,
    au.created_at,
    ur.role,
    (au.raw_user_meta_data->>'full_name')::TEXT as full_name,
    NULL::TEXT as address,
    au.phone::TEXT as mobile,
    (au.raw_user_meta_data->>'avatar_url')::TEXT as avatar_url
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
  ORDER BY au.created_at DESC;
$$;
