-- Disable RLS on strategy_paths table for simple access
-- This table should be globally accessible for admin features

ALTER TABLE strategy_paths DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view strategy paths for their organizations or global" ON strategy_paths;
DROP POLICY IF EXISTS "Organization admins can manage strategy paths" ON strategy_paths;