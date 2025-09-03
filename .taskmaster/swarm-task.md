# Hive Mind Task: Fix Supabase RLS Recursion

## Objective
Fix the infinite recursion error in the Supabase memberships table RLS policies.

## Connection Details
- Project URL: https://xigzapsughpuqjxttsra.supabase.co
- Database: postgresql://postgres:baE53fb5GNkc*gM@db.xigzapsughpuqjxttsra.supabase.co:5432/postgres
- Service Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZ3phcHN1Z2hwdXFqeHR0c3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU1MDAyMSwiZXhwIjoyMDcyMTI2MDIxfQ.wDagKCwaL77zS2e-OQ5q-UMvBC3gE2WRWn0iwAVyzhM

## Tasks for Swarm

### 1. Researcher Worker
- Analyze the current RLS policies causing recursion
- Document the circular reference pattern

### 2. Coder Worker  
- Execute the SQL script located at: `/Users/florian/Desktop/dev/brand-app/scripts/fix-rls-simple.sql`
- Use the Supabase SQL Editor or psql connection

### 3. Analyst Worker
- Verify the new policies avoid recursion
- Confirm auth.uid() is used directly

### 4. Tester Worker
- Test that memberships can be created without errors
- Verify users can be added to businesses
- Confirm no infinite recursion errors

## SQL Script to Execute
Located at: `/Users/florian/Desktop/dev/brand-app/scripts/fix-rls-simple.sql`

## Success Criteria
✅ No "infinite recursion" errors
✅ Can create businesses and memberships
✅ Team collaboration features work
✅ Proper role-based access control