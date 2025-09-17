# Database Setup Instructions

## Problem

Your application is getting the error: `Could not find the table 'public.organizations' in the schema cache`

This is because your database schema has a `businesses` table from the existing migration, but your application code expects an `organizations` table.

## Solution

### Step 1: Run the SQL Script

1. Open your Supabase dashboard SQL editor:
   **https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/sql-editor**

2. Copy and paste the entire contents of the file:
   **`scripts/create_missing_tables.sql`**

3. Click "RUN" to execute the script

### Step 2: Verify the Setup

After running the SQL script, run this command to verify everything worked:

```bash
node scripts/verify-tables.js
```

This will test:

- ✅ Organizations table exists with all required columns
- ✅ Users table exists with all required columns
- ✅ Memberships table exists with all required columns
- ✅ Table relationships are working correctly

### What the Script Does

1. **Creates the `organizations` table** with the exact columns your app expects:
   - id (UUID, primary key)
   - name (TEXT, NOT NULL)
   - slug (TEXT, UNIQUE, NOT NULL)
   - website (TEXT, nullable)
   - industry (TEXT, nullable)
   - company_size (TEXT, nullable)
   - timezone (TEXT, default 'UTC')
   - settings (JSONB, default '{}')
   - created_at (TIMESTAMPTZ, default NOW())
   - updated_at (TIMESTAMPTZ, default NOW())

2. **Creates the `users` table**:
   - id (UUID, primary key)
   - email (TEXT, unique, not null)
   - name (TEXT, nullable)
   - avatar_url (TEXT, nullable)
   - created_at (TIMESTAMPTZ, default NOW())
   - last_login_at (TIMESTAMPTZ, nullable)

3. **Recreates the `memberships` table** to reference `organizations` instead of `businesses`:
   - id (UUID, primary key)
   - organization_id (UUID, references organizations(id))
   - user_id (UUID, references users(id))
   - role (TEXT, default 'viewer')
   - created_at (TIMESTAMPTZ, default NOW())

4. **Sets up proper indexes** for performance
5. **Enables Row Level Security (RLS)** with basic policies
6. **Creates test data** to verify everything works

### Troubleshooting

If you get any errors:

1. **"relation already exists"** - This is normal, the script uses `IF NOT EXISTS`
2. **"column does not exist"** - The verification script will show exactly what's missing
3. **"permission denied"** - Make sure you're using the service role key in the dashboard

### Files Created

- **`scripts/create_missing_tables.sql`** - The SQL script to run in Supabase
- **`scripts/verify-tables.js`** - Verification script to test everything worked
- **`scripts/check-and-create-tables.js`** - Initial diagnostic script
- **`supabase/migrations/002_create_organizations_tables.sql`** - Migration file for future reference

### Next Steps

After running the script and verifying it worked:

1. Your organization creation form should now work without errors
2. You can create organizations, users, and memberships through your app
3. The database will enforce proper relationships and security policies

### Database Schema Overview

```
organizations
├── id (UUID, PK)
├── name (TEXT, NOT NULL)
├── slug (TEXT, UNIQUE, NOT NULL)
├── website (TEXT)
├── industry (TEXT)
├── company_size (TEXT)
├── timezone (TEXT, default 'UTC')
├── settings (JSONB, default '{}')
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

users
├── id (UUID, PK)
├── email (TEXT, UNIQUE, NOT NULL)
├── name (TEXT)
├── avatar_url (TEXT)
├── created_at (TIMESTAMPTZ)
└── last_login_at (TIMESTAMPTZ)

memberships
├── id (UUID, PK)
├── organization_id (UUID, FK -> organizations.id)
├── user_id (UUID, FK -> users.id)
├── role (TEXT, default 'viewer')
└── created_at (TIMESTAMPTZ)
```

The schema now matches what your application expects and includes proper relationships, indexes, and security policies.
