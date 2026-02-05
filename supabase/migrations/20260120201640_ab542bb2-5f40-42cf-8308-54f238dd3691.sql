-- Add videos array column for slideshow support
ALTER TABLE public.landing_page_sections 
ADD COLUMN video_urls text[] DEFAULT '{}'::text[];