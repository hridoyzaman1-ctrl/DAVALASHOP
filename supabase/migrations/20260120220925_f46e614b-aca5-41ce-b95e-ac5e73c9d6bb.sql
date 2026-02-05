-- Grant admin access to hridoyzaman1@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('b9909f21-2ec2-44f8-bcc7-d270eb8650c3', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Function to get users list for admin management
CREATE OR REPLACE FUNCTION public.get_users_for_admin()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  role app_role
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    u.email::text,
    u.created_at,
    ur.role
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY u.created_at DESC;
$$;