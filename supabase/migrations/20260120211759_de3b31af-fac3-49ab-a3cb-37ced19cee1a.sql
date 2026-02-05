-- Create product_reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Reviews: Public can read visible reviews
CREATE POLICY "Visible reviews are publicly readable"
ON public.product_reviews
FOR SELECT
USING (is_visible = true);

-- Reviews: Anyone can create reviews
CREATE POLICY "Anyone can create reviews"
ON public.product_reviews
FOR INSERT
WITH CHECK (true);

-- Reviews: Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
ON public.product_reviews
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Newsletter: Anyone can subscribe
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Newsletter: Admins can manage subscribers
CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at on reviews
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert mock reviews for products
INSERT INTO public.product_reviews (product_id, customer_name, rating, title, comment, is_verified_purchase, is_visible)
SELECT 
  p.id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Fatima Rahman'
    WHEN 1 THEN 'Nusrat Jahan'
    WHEN 2 THEN 'Tasnim Ahmed'
    WHEN 3 THEN 'Sadia Islam'
    ELSE 'Ayesha Khan'
  END,
  4 + (random())::int,
  CASE (random() * 3)::int
    WHEN 0 THEN 'Excellent product!'
    WHEN 1 THEN 'Love it!'
    WHEN 2 THEN 'Great quality'
    ELSE 'Highly recommend'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'This product exceeded my expectations. My skin feels so much better after using it for just a week!'
    WHEN 1 THEN 'Amazing quality and the results are visible. Will definitely buy again.'
    WHEN 2 THEN 'Perfect for my skin type. The texture is smooth and absorbs quickly.'
    WHEN 3 THEN 'Best skincare purchase I have made. Highly recommended for everyone!'
    ELSE 'Very gentle on the skin and smells wonderful. Love the packaging too!'
  END,
  true,
  true
FROM public.products p
WHERE p.is_active = true
LIMIT 20;