# Supabase RLS Issue Context

## Database Information
- **Supabase Project URL**: https://xigzapsughpuqjxttsra.supabase.co
- **Affected Table**: memberships
- **Error**: "infinite recursion detected in policy for relation 'memberships'"

## Current Situation
1. The memberships table has Row Level Security (RLS) enabled
2. The RLS policy creates an infinite loop when checking permissions
3. This prevents:
   - Adding new team members to businesses
   - Querying existing memberships
   - Multi-user collaboration features

## Database Schema
The memberships table connects:
- `user_id` (UUID) -> References auth.users
- `business_id` (UUID) -> References businesses table
- `role` (text) -> Values: 'owner', 'admin', 'member'

## Diagnosis Results
```
✅ Table is accessible via service role
✅ Business creation works
❌ Cannot insert memberships due to RLS recursion
❌ Foreign key constraint requires valid user_id from auth.users
```

## Required Fix
The RLS policy needs to be rewritten to:
1. Avoid self-referencing the memberships table
2. Use `auth.uid()` directly for authorization
3. Allow users to:
   - View memberships for businesses they belong to
   - Create memberships if they're business owners/admins
   - Update/delete memberships based on their role

## Access Credentials
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZ3phcHN1Z2hwdXFqeHR0c3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU1MDAyMSwiZXhwIjoyMDcyMTI2MDIxfQ.wDagKCwaL77zS2e-OQ5q-UMvBC3gE2WRWn0iwAVyzhM
- **Database URL**: postgresql://postgres:baE53fb5GNkc*gM@db.xigzapsughpuqjxttsra.supabase.co:5432/postgres

## Suggested Solution Pattern
```sql
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view memberships" ON memberships;

-- Create new non-recursive policy
CREATE POLICY "Users can view own memberships" ON memberships
FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Business owners can manage memberships" ON memberships
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.business_id = memberships.business_id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'
    LIMIT 1
  )
);
```

## Test Requirements
After fixing, verify:
1. A user can create a business and become its owner
2. The owner can add other members
3. Members can view their own memberships
4. Non-members cannot access business memberships