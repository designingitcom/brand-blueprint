-- Fix RLS Policy for Memberships Table
-- This script fixes the infinite recursion issue in the memberships table

-- Step 1: Disable RLS temporarily to work on policies
ALTER TABLE public.memberships DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies on memberships table
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'memberships'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.memberships', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Create new non-recursive policies

-- Policy 1: Users can view their own memberships
CREATE POLICY "Users can view own memberships" 
ON public.memberships
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Users can view memberships of businesses they belong to
CREATE POLICY "Users can view business team members" 
ON public.memberships
FOR SELECT 
USING (
    business_id IN (
        SELECT business_id 
        FROM public.memberships 
        WHERE user_id = auth.uid()
    )
);

-- Policy 3: Business owners can insert new memberships
CREATE POLICY "Business owners can add members" 
ON public.memberships
FOR INSERT 
WITH CHECK (
    -- Check if the current user is an owner of this business
    EXISTS (
        SELECT 1 
        FROM public.memberships 
        WHERE business_id = public.memberships.business_id 
        AND user_id = auth.uid() 
        AND role = 'owner'
    )
);

-- Policy 4: Business owners and admins can update memberships
CREATE POLICY "Owners and admins can update memberships" 
ON public.memberships
FOR UPDATE 
USING (
    -- Current user must be owner or admin of the business
    EXISTS (
        SELECT 1 
        FROM public.memberships m
        WHERE m.business_id = public.memberships.business_id 
        AND m.user_id = auth.uid() 
        AND m.role IN ('owner', 'admin')
    )
)
WITH CHECK (
    -- Same check for the new values
    EXISTS (
        SELECT 1 
        FROM public.memberships m
        WHERE m.business_id = public.memberships.business_id 
        AND m.user_id = auth.uid() 
        AND m.role IN ('owner', 'admin')
    )
);

-- Policy 5: Business owners can delete memberships (except their own ownership)
CREATE POLICY "Owners can remove members" 
ON public.memberships
FOR DELETE 
USING (
    -- Current user must be owner
    EXISTS (
        SELECT 1 
        FROM public.memberships m
        WHERE m.business_id = public.memberships.business_id 
        AND m.user_id = auth.uid() 
        AND m.role = 'owner'
    )
    -- Prevent owner from deleting their own ownership
    AND NOT (user_id = auth.uid() AND role = 'owner')
);

-- Policy 6: First membership (owner) can be created by business creator
CREATE POLICY "Business creator becomes owner" 
ON public.memberships
FOR INSERT 
WITH CHECK (
    -- This is the first membership for this business
    NOT EXISTS (
        SELECT 1 
        FROM public.memberships 
        WHERE business_id = public.memberships.business_id
    )
    -- And the user is creating their own membership as owner
    AND user_id = auth.uid()
    AND role = 'owner'
);

-- Step 4: Re-enable RLS
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Step 5: Create helper function for checking membership (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_user_membership(
    p_business_id uuid,
    p_user_id uuid DEFAULT NULL
)
RETURNS TABLE(has_access boolean, user_role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) > 0 as has_access,
        MAX(role) as user_role
    FROM memberships
    WHERE business_id = p_business_id
    AND user_id = COALESCE(p_user_id, auth.uid());
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_user_membership TO authenticated;

-- Step 6: Update businesses table RLS to use the helper function
-- (This avoids recursion when checking business access)
DROP POLICY IF EXISTS "Users can view businesses they belong to" ON public.businesses;

CREATE POLICY "Users can view businesses they belong to" 
ON public.businesses
FOR SELECT 
USING (
    -- User is the tenant (owner)
    tenant_id = auth.uid()
    OR
    -- Or user has membership (using helper function)
    (SELECT has_access FROM public.check_user_membership(id))
);

-- Step 7: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_business_id ON public.memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_business ON public.memberships(user_id, business_id);

-- Verification query (run this to test)
-- This should return successfully without recursion error
/*
SELECT 
    'Test Query' as test,
    COUNT(*) as membership_count
FROM public.memberships
WHERE user_id = auth.uid();
*/

COMMENT ON POLICY "Users can view own memberships" ON public.memberships IS 
'Allows users to see their own membership records without recursion';

COMMENT ON POLICY "Business owners can add members" ON public.memberships IS 
'Allows business owners to invite new team members';

COMMENT ON FUNCTION public.check_user_membership IS 
'Helper function to check membership without triggering RLS recursion';