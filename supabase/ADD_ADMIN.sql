-- HELPER SCRIPT: Make a User an Admin
-- Usage: Run this in Supabase SQL Editor

-- 1. Get the User ID
-- Go to Authentication > Users in Supabase Dashboard
-- Copy the "User UID" of the person you want to make admin.

-- 2. Replace 'PASTE_USER_ID_HERE' below with the actual ID.
-- Example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

INSERT INTO public.user_roles (user_id, role)
VALUES ('PASTE_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Verify
-- Run this to see all admins:
-- SELECT * FROM public.user_roles WHERE role = 'admin';
