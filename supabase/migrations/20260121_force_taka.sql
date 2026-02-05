-- Ensure currency is set to Taka and remove other options if they exist in site_settings
UPDATE public.site_settings 
SET value = 'taka' 
WHERE key = 'currency';

-- If the key doesn't exist, insert it
INSERT INTO public.site_settings (key, value, description)
SELECT 'currency', 'taka', 'Site display currency'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings WHERE key = 'currency');

-- Refresh schema cache just in case
NOTIFY pgrst, 'reload schema';
