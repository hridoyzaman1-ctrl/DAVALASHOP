-- Migration: 20260121_admin_role_and_about_fix.sql

-- 1. Add page_key and content_json to landing_page_sections
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='landing_page_sections' AND column_name='page_key') THEN
        ALTER TABLE public.landing_page_sections ADD COLUMN page_key TEXT DEFAULT 'home';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='landing_page_sections' AND column_name='content_json') THEN
        ALTER TABLE public.landing_page_sections ADD COLUMN content_json JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Update unique constraint
-- Remove existing unique constraint on section_key if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'landing_page_sections_section_key_key') THEN
        ALTER TABLE public.landing_page_sections DROP CONSTRAINT landing_page_sections_section_key_key;
    END IF;
END $$;

-- Add new unique constraint on (page_key, section_key)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'landing_page_sections_page_key_section_key_key') THEN
        ALTER TABLE public.landing_page_sections ADD CONSTRAINT landing_page_sections_page_key_section_key_key UNIQUE (page_key, section_key);
    END IF;
END $$;

-- 3. Pre-populate default content for about pages if not present
INSERT INTO public.landing_page_sections (page_key, section_key, title, subtitle, description, sort_order)
VALUES 
    ('our-story', 'header', 'Our Story', 'The Journey of DAVALA', 'Founded with a passion for bringing the finest beauty products to discerning customers worldwide.', 0),
    ('our-story', 'mission', 'Our Mission', 'Excellence in Every Detail', 'We are committed to providing the highest quality skincare and cosmetics, curated with care and expertise.', 1),
    ('sustainability', 'header', 'Sustainability', 'Beauty with a Conscience', 'Our commitment to the planet and your skin.', 0),
    ('customer-care', 'header', 'Customer Care', 'How can we help?', 'Your satisfaction is our priority. Get in touch with us for any inquiries.', 0),
    ('size-guide', 'header', 'Shade Guide', 'Find Your Perfect Match', 'Our comprehensive guide to finding the right shades and textures for your skin.', 0),
    ('store-locator', 'header', 'Store Locator', 'Find a DAVALA Near You', 'Experience our products in person at our physical locations.', 0)
ON CONFLICT (page_key, section_key) DO NOTHING;

-- 4. Reload schema
NOTIFY pgrst, 'reload schema';
