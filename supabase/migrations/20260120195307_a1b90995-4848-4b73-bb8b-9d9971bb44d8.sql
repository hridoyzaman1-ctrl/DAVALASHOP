-- Create landing_page_sections table for dynamic homepage content
CREATE TABLE public.landing_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  cta_text TEXT,
  cta_link TEXT,
  image_url TEXT,
  secondary_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_page_sections ENABLE ROW LEVEL SECURITY;

-- Public read access for active sections
CREATE POLICY "Landing sections are publicly readable"
ON public.landing_page_sections
FOR SELECT
USING (is_active = true);

-- Admin management
CREATE POLICY "Admins can manage landing sections"
ON public.landing_page_sections
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger for timestamps
CREATE TRIGGER update_landing_page_sections_updated_at
BEFORE UPDATE ON public.landing_page_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for landing page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-images', 'landing-images', true);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Storage policies for landing images - public read
CREATE POLICY "Landing images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing-images');

-- Storage policies for landing images - admin upload
CREATE POLICY "Admins can upload landing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'landing-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for landing images - admin update
CREATE POLICY "Admins can update landing images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'landing-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for landing images - admin delete
CREATE POLICY "Admins can delete landing images"
ON storage.objects FOR DELETE
USING (bucket_id = 'landing-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for product images - public read
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Storage policies for product images - admin upload
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for product images - admin update
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for product images - admin delete
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Pre-populate landing page sections with default content
INSERT INTO public.landing_page_sections (section_key, title, subtitle, description, cta_text, cta_link, sort_order) VALUES
('hero', 'DAVALA', 'Elevate Your Everyday Radiance', 'Discover premium beauty essentials curated for the modern woman', 'Shop Now', '/category/skincare', 0),
('fifty_fifty_left', 'Skincare Collection', 'Discover', 'Luxurious formulas for radiant skin', 'Explore Skincare', '/category/skincare', 1),
('fifty_fifty_right', 'Makeup Essentials', 'Explore', 'Professional-grade beauty products', 'Shop Makeup', '/category/makeup', 2),
('large_hero', 'New Arrivals', 'Experience the latest in beauty innovation', 'Curated collections from around the world', 'View Collection', '/category/new-arrivals', 3),
('one_third', 'Radiance Serums', NULL, 'Potent formulas for visible, lasting results', 'Shop Serums', '/category/serums', 4),
('two_thirds', 'Luxe Moisturizers', NULL, 'Rich hydration meets elegant simplicity', 'Shop Moisturizers', '/category/moisturizers', 5),
('editorial', 'Our Story', 'The Davala Journey', 'Founded with a passion for bringing the finest beauty products to discerning customers worldwide', 'Learn More', '/about/our-story', 6);