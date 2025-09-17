
# Incremental Migration Summary

## What was attempted:
✅ Data backup completed (6 businesses saved)
✅ Integration fields planned for organizations
✅ Onboarding field planned for businesses  
✅ Business status ENUM structure prepared
✅ M0 module structure prepared

## Manual steps required in Supabase Dashboard → SQL Editor:

### 1. Create Organizations Table (if needed)
```sql
-- Check if organizations table exists first
SELECT * FROM organizations LIMIT 1;
-- If error, run the organizations table creation SQL shown above
```

### 2. Add Integration Fields
```sql
-- Add QuickBooks, Slack, Google Drive integration fields
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS quickbooks_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS slack_workspace_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS google_drive_folder_url TEXT;
```

### 3. Add Onboarding Field to Businesses
```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
UPDATE businesses SET onboarding_completed = 
    CASE WHEN (description IS NOT NULL AND length(description) > 10) 
         OR (website IS NOT NULL AND length(website) > 0) 
         THEN TRUE ELSE FALSE END;
```

### 4. Create Business Status ENUM
```sql
CREATE TYPE business_status AS ENUM ('active', 'pending', 'onboarding', 'inactive', 'suspended');
-- Note: Changing column type requires careful migration
```

### 5. Create Modules Table
```sql
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    sort_order INTEGER DEFAULT 0
);

INSERT INTO modules (code, name, category, sort_order) VALUES
('m0-onboarding', 'Business Onboarding', 'foundation', 0),
('m1-core', 'Brand Foundation', 'foundation', 1);
```

## After Manual Migration:
1. Run: node scripts/post-migration-setup.js
2. Update business status logic
3. Build M0 onboarding flow
4. Implement integration features

## Benefits of This Approach:
- ✅ Low risk (incremental changes)
- ✅ Preserves existing data
- ✅ Adds key missing features
- ✅ Enables proper status logic
- ✅ Sets up integration framework
