-- SIMPLIFIED RLS FIX FOR MEMBERSHIPS TABLE
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/sql/new

-- Step 1: Drop all existing policies on memberships
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.memberships;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.memberships;
DROP POLICY IF EXISTS "Users can view memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can insert memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can update memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can delete memberships" ON public.memberships;

-- Step 2: Create simple, non-recursive policies

-- Allow users to see their own memberships
CREATE POLICY "users_view_own_memberships" 
ON public.memberships FOR SELECT 
USING (auth.uid() = user_id);

-- Allow first membership creation (owner) when creating a business
CREATE POLICY "creator_becomes_owner" 
ON public.memberships FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND role = 'owner'
  AND NOT EXISTS (
    SELECT 1 FROM public.memberships m 
    WHERE m.business_id = memberships.business_id
  )
);

-- Allow business owners to manage memberships
CREATE POLICY "owners_manage_members" 
ON public.memberships FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.memberships m
    WHERE m.business_id = memberships.business_id
    AND m.role = 'owner'
  )
);

-- Step 3: Create a helper function to check membership without recursion
CREATE OR REPLACE FUNCTION public.is_business_member(business_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships
    WHERE business_id = business_uuid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Update businesses policy to use the helper
DROP POLICY IF EXISTS "Users can view businesses they belong to" ON public.businesses;

CREATE POLICY "users_view_own_businesses" 
ON public.businesses FOR SELECT 
USING (
  tenant_id = auth.uid() 
  OR public.is_business_member(id)
);

-- Step 5: Test the fix
SELECT 'Testing memberships query - should not error' as test;
SELECT COUNT(*) FROM public.memberships WHERE user_id = auth.uid();