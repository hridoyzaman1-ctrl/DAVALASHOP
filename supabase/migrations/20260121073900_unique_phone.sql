-- Add unique constraint on mobile field in profiles table
-- This ensures one phone number per account

-- First add unique constraint (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_mobile_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_mobile_unique UNIQUE (mobile);
  END IF;
END
$$;

-- Create index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile) WHERE mobile IS NOT NULL;
