-- Add video_url column to landing_page_sections table for video background support
ALTER TABLE public.landing_page_sections 
ADD COLUMN video_url text;