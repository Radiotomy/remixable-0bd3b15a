-- Grant admin role to bryan@radiotomy.com
-- User ID: 96c3937f-7f7c-4034-825c-a8ccd1782e5b

INSERT INTO public.user_roles (user_id, role)
VALUES ('96c3937f-7f7c-4034-825c-a8ccd1782e5b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create a function to easily add admin roles in the future
CREATE OR REPLACE FUNCTION public.grant_admin_role(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user ID from auth.users by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;