-- COD & Coupon System Migration

-- 1. Add COD setting to site_settings if not exists (handled via app logic usually, but good to prep)
-- Since site_settings is a key-value table, we just ensure the key is usable. 
-- No schema change needed for site_settings itself as it is EAV (Entity-Attribute-Value) likely, 
-- looking at the analyze step content: settings.find((s) => s.key === key).
-- So valid keys are just data. We will insert default if missing.

INSERT INTO public.site_settings (key, value)
VALUES ('show_cod', 'false')
ON CONFLICT (key) DO NOTHING;

-- 2. Create Coupons Table
CREATE TYPE coupon_type AS ENUM ('global', 'category', 'product');

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent numeric NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  coupon_type coupon_type NOT NULL DEFAULT 'global',
  target_id uuid, -- For product or category ID
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Coupons
-- Admins can do everything
CREATE POLICY "Admins can manage coupons" ON public.coupons
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Public/Anon can read ACTIVE coupons (needed for checking validity on checkout)
CREATE POLICY "Public can view active coupons" ON public.coupons
FOR SELECT USING (is_active = true);


-- 3. Update Orders Table to track coupon usage
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS discount_amount decimal(10,2) DEFAULT 0;

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS coupons_code_idx ON public.coupons (code);
CREATE INDEX IF NOT EXISTS coupons_active_idx ON public.coupons (is_active);
