-- Fix Organizations RLS Policy to Allow Creation
-- This addresses the issue where authenticated users cannot create organizations
-- due to overly restrictive RLS policies

-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Users can access organizations they are members of" ON organizations;

-- Create granular policies for each operation

-- Allow authenticated users to create organizations
CREATE POLICY "Users can create organizations" 
ON organizations FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to read organizations they are members of
CREATE POLICY "Users can read organizations they are members of" 
ON organizations FOR SELECT 
USING (
  id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid()
  )
);

-- Allow owners and admins to update organizations
CREATE POLICY "Users can update organizations they are members of" 
ON organizations FOR UPDATE 
USING (
  id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Allow only owners to delete organizations
CREATE POLICY "Users can delete organizations they own" 
ON organizations FOR DELETE 
USING (
  id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Ensure memberships table allows users to be added to organizations they help create
-- Drop and recreate membership policies if they're too restrictive

DROP POLICY IF EXISTS "Users can access their memberships" ON memberships;

-- Allow authenticated users to read their own memberships
CREATE POLICY "Users can read their memberships" 
ON memberships FOR SELECT 
USING (
  user_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Allow organization owners/admins to create memberships
CREATE POLICY "Owners and admins can create memberships" 
ON memberships FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- User can add themselves as owner of new organization
    user_id = auth.uid() OR
    -- Or organization owners/admins can add others
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
);

-- Allow users to update memberships in organizations they own/admin
CREATE POLICY "Owners and admins can update memberships" 
ON memberships FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Allow users to delete memberships (remove themselves or others if owner/admin)
CREATE POLICY "Users can manage memberships" 
ON memberships FOR DELETE 
USING (
  user_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);