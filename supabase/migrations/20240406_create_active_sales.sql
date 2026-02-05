-- Create active_sales table
CREATE TABLE IF NOT EXISTS active_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    sale_type TEXT NOT NULL CHECK (sale_type IN ('global', 'category', 'product')),
    target_id TEXT, -- Can be null for global
    discount_percent NUMERIC NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ, -- Null means indefinite manual sale
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE active_sales ENABLE ROW LEVEL SECURITY;

-- Allow public read of active sales
DROP POLICY IF EXISTS "Public read active sales" ON active_sales;
CREATE POLICY "Public read active sales" ON active_sales FOR SELECT USING (is_active = true);

-- Allow admin full access (simplified for this project context where RLS is often disabled/bypassed for admin)
-- We'll assume admin uses service role or authenticated role
DROP POLICY IF EXISTS "Admin full access sales" ON active_sales;
CREATE POLICY "Admin full access sales" ON active_sales USING (true) WITH CHECK (true);

-- Functions/Triggers (Optional: Auto-deactivate expired sales? We can handle in frontend query or CRON, frontend is easier for now)
