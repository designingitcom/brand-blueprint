-- COMPLETE RLS FIX - Remove ALL policies and start fresh
-- This ensures no recursive policies remain

BEGIN;

-- Step 1: Completely disable RLS on memberships temporarily
ALTER TABLE public.memberships DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (comprehensive list)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.memberships;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.memberships;
DROP POLICY IF EXISTS "Users can view memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can insert memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can update memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can delete memberships" ON public.memberships;
DROP POLICY IF EXISTS "users_view_own_memberships" ON public.memberships;
DROP POLICY IF EXISTS "creator_becomes_owner" ON public.memberships;
DROP POLICY IF EXISTS "owners_manage_members" ON public.memberships;

-- Drop any other policies that might exist
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT polname 
        FROM pg_policy 
        WHERE polrelid = 'public.memberships'::regclass
    LOOP
        EXECUTE format('DROP POLICY %I ON public.memberships', pol.polname);
        RAISE NOTICE 'Dropped policy: %', pol.polname;
    END LOOP;
END $$;

-- Step 3: Create ONLY simple, non-recursive policies

-- Policy 1: Users can see their own memberships (no recursion possible)
CREATE POLICY "view_own_membership" 
ON public.memberships 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy 2: Users can create their first membership as owner
CREATE POLICY "become_owner_on_business_create" 
ON public.memberships 
FOR INSERT 
WITH CHECK (
    user_id = auth.uid() 
    AND role = 'owner'
);

-- Policy 3: Temporary - allow all authenticated users to manage memberships
-- (This avoids any recursion for now - can be refined later)
CREATE POLICY "temp_auth_users_manage" 
ON public.memberships 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Step 4: Re-enable RLS
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Step 5: Fix businesses table policy as well
DROP POLICY IF EXISTS "Users can view businesses they belong to" ON public.businesses;
DROP POLICY IF EXISTS "users_view_own_businesses" ON public.businesses;

-- Simple policy for businesses - just check tenant_id for now
CREATE POLICY "view_own_businesses_simple" 
ON public.businesses 
FOR SELECT 
USING (
    tenant_id = auth.uid() 
    OR auth.uid() IS NOT NULL  -- Temporarily allow all authenticated users
);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memberships_user_business 
ON public.memberships(user_id, business_id);

-- Step 7: Test queries
SELECT 'Testing after fix - should NOT error' as test;
SELECT COUNT(*) as membership_count FROM public.memberships;
SELECT COUNT(*) as business_count FROM public.businesses;

COMMIT;

-- Summary of what this does:
-- 1. Removes ALL policies to ensure no recursion remains
-- 2. Creates only simple, non-recursive policies
-- 3. Temporarily allows authenticated users broader access
-- 4. Can be refined once recursion is confirmed fixed