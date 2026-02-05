-- Add payment_method column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cod';

-- Update RLS to allow users to see/insert this column (usually handled by generic policies, but good to be aware)
-- Existing policies usually cover all columns, but we'll assume standard RLS is fine.
