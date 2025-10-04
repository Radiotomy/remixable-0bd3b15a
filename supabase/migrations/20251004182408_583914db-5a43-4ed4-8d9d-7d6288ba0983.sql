-- Optimize RLS policies for better performance
-- Fix auth.uid() re-evaluation and consolidate multiple permissive policies

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Create optimized consolidated policies
CREATE POLICY "Users can view projects" ON public.projects
  FOR SELECT USING (
    is_published = true 
    OR (SELECT auth.uid()) = user_id
  );

CREATE POLICY "Users can create their own projects" ON public.projects
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles view accessible to all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create optimized consolidated policies
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- USER_SUBSCRIPTIONS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;

-- Create optimized policies
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- PAYMENT_TRANSACTIONS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.payment_transactions;

-- Create optimized policies
CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- USER_ROLES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Create optimized consolidated policies
CREATE POLICY "View roles policy" ON public.user_roles
  FOR SELECT USING (
    (SELECT auth.uid()) = user_id
    OR public.has_role((SELECT auth.uid()), 'admin'::app_role)
  );

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role((SELECT auth.uid()), 'admin'::app_role));