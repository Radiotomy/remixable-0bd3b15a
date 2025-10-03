-- Remove the security definer view and use proper RLS policies instead
DROP VIEW IF EXISTS public.public_profiles;

-- The RLS policies we created are sufficient for security
-- Users can only see their own full profiles
-- No public view is needed since we control access via RLS