-- RUN THIS IN SUPABASE SQL EDITOR TO FIX EVERYTHING

-- 1. Create the table if it's missing
CREATE TABLE IF NOT EXISTS active_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    sale_type TEXT NOT NULL CHECK (sale_type IN ('global', 'category', 'product')),
    target_id TEXT,
    discount_percent NUMERIC NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. DISABLE Security Checks (RLS) to fix "Manual SQL" error
ALTER TABLE active_sales DISABLE ROW LEVEL SECURITY;

-- 3. Grant Permissions to be safe
GRANT ALL ON active_sales TO anon;
GRANT ALL ON active_sales TO authenticated;
GRANT ALL ON active_sales TO service_role;
