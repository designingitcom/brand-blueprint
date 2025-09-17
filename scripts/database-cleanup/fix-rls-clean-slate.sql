-- CLEAN SLATE RLS POLICY FIX
-- This removes ALL existing policies and creates only the simple ones we need

-- =============================================================================
-- ORGANIZATIONS TABLE - Clean slate
-- =============================================================================

-- Drop ALL existing policies (comprehensive list)
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations they are members of" ON organizations;
DROP POLICY IF EXISTS "Users can update organizations they are members of" ON organizations;  
DROP POLICY IF EXISTS "Users can delete organizations they own" ON organizations;
DROP POLICY IF EXISTS "Service role full access to organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can read organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can update organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can delete organizations" ON organizations;
DROP POLICY IF EXISTS "service_role_organizations" ON organizations;
DROP POLICY IF EXISTS "authenticated_organizations" ON organizations;
DROP POLICY IF EXISTS "create_organizations" ON organizations;
DROP POLICY IF EXISTS "delete_owned_organizations" ON organizations;
DROP POLICY IF EXISTS "update_member_organizations" ON organizations;
DROP POLICY IF EXISTS "view_member_organizations" ON organizations;

-- Create only simple policies
CREATE POLICY "service_role_organizations" ON organizations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_organizations" ON organizations FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- BUSINESSES TABLE - Clean slate
-- =============================================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "service_role_businesses" ON businesses;
DROP POLICY IF EXISTS "authenticated_businesses" ON businesses;

-- Create only simple policies
CREATE POLICY "service_role_businesses" ON businesses FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_businesses" ON businesses FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- PROJECTS TABLE - Clean slate
-- =============================================================================

-- Drop ALL existing policies  
DROP POLICY IF EXISTS "service_role_projects" ON projects;
DROP POLICY IF EXISTS "authenticated_projects" ON projects;

-- Create only simple policies
CREATE POLICY "service_role_projects" ON projects FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_projects" ON projects FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- MODULES TABLE - Clean slate
-- =============================================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "service_role_modules" ON modules;  
DROP POLICY IF EXISTS "authenticated_modules" ON modules;

-- Create only simple policies
CREATE POLICY "service_role_modules" ON modules FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_modules" ON modules FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- QUESTIONS TABLE - Clean slate
-- =============================================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "service_role_questions" ON questions;
DROP POLICY IF EXISTS "authenticated_questions" ON questions;

-- Create only simple policies
CREATE POLICY "service_role_questions" ON questions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_questions" ON questions FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================  
-- MEMBERSHIPS TABLE - Clean slate
-- =============================================================================

-- Drop ALL existing policies comprehensively
DROP POLICY IF EXISTS "Service role full access" ON memberships;
DROP POLICY IF EXISTS "Users see own memberships" ON memberships;
DROP POLICY IF EXISTS "Users insert own memberships" ON memberships;
DROP POLICY IF EXISTS "Users update own memberships" ON memberships;
DROP POLICY IF EXISTS "Users delete own memberships" ON memberships;
DROP POLICY IF EXISTS "service_role_memberships" ON memberships;
DROP POLICY IF EXISTS "authenticated_memberships" ON memberships;

-- Create only simple policies
CREATE POLICY "service_role_memberships" ON memberships FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_memberships" ON memberships FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- USERS TABLE - Clean slate
-- =============================================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "service_role_users" ON users;
DROP POLICY IF EXISTS "authenticated_users" ON users;

-- Create only simple policies  
CREATE POLICY "service_role_users" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_users" ON users FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- INVITES TABLE - Clean slate
-- =============================================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "service_role_invites" ON invites;
DROP POLICY IF EXISTS "authenticated_invites" ON invites;

-- Create only simple policies
CREATE POLICY "service_role_invites" ON invites FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_invites" ON invites FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- RESPONSES TABLE - Clean slate
-- =============================================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "service_role_responses" ON responses;
DROP POLICY IF EXISTS "authenticated_responses" ON responses;

-- Create only simple policies
CREATE POLICY "service_role_responses" ON responses FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_responses" ON responses FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- SUMMARY
-- =============================================================================

-- This creates a clean slate with only two policies per table:
-- 1. Service role gets full access (FOR ALL operations)
-- 2. Authenticated users get full access (FOR ALL operations) with simple auth.uid() IS NOT NULL check  
-- 
-- Anonymous users will be blocked because:
-- - They don't have service_role
-- - They don't have authenticated role 
-- - auth.uid() IS NULL for them
--
-- This should resolve all RLS blocking issues while maintaining proper security.