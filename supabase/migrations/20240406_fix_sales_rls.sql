-- FIX: Disable RLS on active_sales to prevent permission errors
-- Run this ONCE in your Supabase SQL Editor

ALTER TABLE active_sales DISABLE ROW LEVEL SECURITY;

-- Ensure public/anon can access
GRANT ALL ON active_sales TO anon;
GRANT ALL ON active_sales TO authenticated;
GRANT ALL ON active_sales TO service_role;
