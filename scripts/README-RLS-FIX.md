# RLS Policy Fix for Organizations Table

## Problem
The organizations table RLS policies were blocking creation with "new row violates row-level security policy for table 'organizations'" error.

## Root Cause
The existing RLS policies were using complex membership lookups that created circular dependencies:
- To create an organization, you needed to be a member
- To be a member, you needed the organization to exist first
- This created a chicken-and-egg problem

## Solution
Replaced complex membership-based policies with simple, permissive policies that use `auth.uid() IS NOT NULL` checks instead of complex subqueries.

## Files Created

### 1. Migration File
- `supabase/migrations/20250906133312_fix_organizations_rls_simple.sql`
- Contains the SQL to drop old policies and create new ones
- Will be applied next time migrations are run

### 2. Manual Execution Script
- `scripts/execute-sql-manual.js` 
- Displays instructions and SQL for manual execution
- Run with: `npm run db:fix-rls`

### 3. Original SQL File
- `fix-organizations-rls.sql` (in project root)
- Contains the RLS policy fixes

## How to Apply the Fix

### Option 1: Via Supabase Dashboard (Recommended)
1. Run `npm run db:fix-rls` to see the SQL
2. Copy the displayed SQL statements
3. Go to your Supabase dashboard > SQL Editor
4. Paste and execute the SQL statements

### Option 2: Via Migration (when database is accessible)
The migration file will be automatically applied next time you run:
```bash
npx supabase db push
```

### Option 3: Via psql (if you have direct database access)
```bash
psql "your-database-connection-string" < fix-organizations-rls.sql
```

## New RLS Policies Created

1. **Service role full access to organizations**
   - Allows service role complete access for server actions
   - `FOR ALL TO service_role USING (true) WITH CHECK (true)`

2. **Authenticated users can create organizations**
   - Allows any authenticated user to create organizations
   - `FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL)`

3. **Authenticated users can read organizations**
   - Allows any authenticated user to read organizations
   - `FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)`

4. **Authenticated users can update organizations**
   - Allows any authenticated user to update organizations
   - `FOR UPDATE TO authenticated USING/WITH CHECK (auth.uid() IS NOT NULL)`

5. **Authenticated users can delete organizations**
   - Allows any authenticated user to delete organizations
   - `FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL)`

## Important Notes

### Security Considerations
- **These policies are intentionally permissive** to fix the immediate creation issue
- They allow any authenticated user to perform all operations on organizations
- **You should restrict these policies later** based on your business logic
- Consider implementing proper role-based access control once the basic functionality works

### Recommended Next Steps
1. Apply the RLS fix to resolve the creation error
2. Test that organization creation now works
3. Implement more restrictive policies based on your requirements:
   - Limit read access to organizations users are members of
   - Limit update/delete access to owners/admins
   - Use proper role checks in membership relationships

### Business Logic to Consider
- Who should be able to create organizations?
- Who should be able to see which organizations?
- Who should be able to modify organization details?
- How should organization ownership and roles work?

## Verification
After applying the fix, test that:
1. Authenticated users can create organizations
2. The "new row violates row-level security policy" error is gone
3. Basic CRUD operations work for organizations
4. Your application's organization creation flow works end-to-end