# Integration Fields Implementation Specification
## BrandBlueprint Client Portal Integrations

**Version**: 1.0  
**Date**: September 11, 2025  
**Scope**: QuickBooks, Slack, Google Drive Integration Fields

---

## Overview

This document specifies the database fields and API integration points required to support QuickBooks accounting sync, Slack notifications, and Google Drive file sharing within the BrandBlueprint client portal.

### Integration Goals
1. **QuickBooks Integration**: Sync project costs, time tracking, and invoicing
2. **Slack Integration**: Automated project notifications and team communication
3. **Google Drive Integration**: Secure file sharing and deliverable distribution

---

## Database Schema Changes

### 1. Organization-Level Integration Settings

**Table**: `organizations`
```sql
-- Add to existing organizations table
ALTER TABLE organizations ADD COLUMN integrations JSONB DEFAULT '{}';

-- Example structure:
{
  "quickbooks": {
    "enabled": true,
    "default_customer_class": "Brand Projects",
    "auto_sync_time_entries": false,
    "invoice_templates": ["Standard", "Retainer"]
  },
  "slack": {
    "enabled": true,
    "default_notifications": ["project_start", "milestone_complete", "deliverable_ready"],
    "notification_channels": {
      "internal": "#brand-projects",
      "client": "#client-updates"
    }
  },
  "gdrive": {
    "enabled": true,
    "folder_structure": "client-name/project-name/deliverables",
    "auto_share_deliverables": true,
    "permission_level": "commenter"
  }
}
```

### 2. Business Profile Integration Fields

**Table**: `business_profiles`
```sql
-- QuickBooks specific fields
ALTER TABLE business_profiles ADD COLUMN quickbooks_company_id TEXT;
ALTER TABLE business_profiles ADD COLUMN quickbooks_sync_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE business_profiles ADD COLUMN quickbooks_last_sync TIMESTAMPTZ;

-- General integration settings
ALTER TABLE business_profiles ADD COLUMN integration_settings JSONB DEFAULT '{}';

-- Example integration_settings structure:
{
  "quickbooks": {
    "customer_id": "123",
    "billing_address": {
      "street": "123 Main St",
      "city": "Anytown", 
      "state": "CA",
      "zip": "12345"
    },
    "payment_terms": "NET_30",
    "preferred_payment_method": "ACH"
  },
  "communications": {
    "slack_user_id": "U1234567890",
    "preferred_notification_time": "09:00-17:00 PST",
    "notification_frequency": "daily"
  }
}
```

### 3. Project-Level Integration Fields

**Table**: `projects`
```sql
-- Slack integration
ALTER TABLE projects ADD COLUMN slack_channel_id TEXT;
ALTER TABLE projects ADD COLUMN slack_notifications_enabled BOOLEAN DEFAULT FALSE;

-- Google Drive integration  
ALTER TABLE projects ADD COLUMN gdrive_folder_id TEXT;
ALTER TABLE projects ADD COLUMN gdrive_permissions_granted BOOLEAN DEFAULT FALSE;

-- General project integration settings
ALTER TABLE projects ADD COLUMN integration_settings JSONB DEFAULT '{}';

-- Example integration_settings structure:
{
  "quickbooks": {
    "job_id": "456",
    "class_id": "Brand Strategy",
    "hourly_rates": {
      "strategy": 175,
      "design": 150,
      "development": 125
    },
    "budget_alerts": {
      "enabled": true,
      "threshold": 0.8
    }
  },
  "slack": {
    "team_members": ["U1234567890", "U0987654321"],
    "client_channel": "#client-acme-corp",
    "internal_channel": "#project-acme-brand"
  },
  "gdrive": {
    "shared_with": ["client@company.com", "pm@agency.com"],
    "folder_permissions": {
      "client@company.com": "commenter",
      "pm@agency.com": "editor"
    }
  }
}
```

### 4. Deliverable Integration Fields

**Table**: `deliverables`
```sql
-- Google Drive file tracking
ALTER TABLE deliverables ADD COLUMN gdrive_file_id TEXT;
ALTER TABLE deliverables ADD COLUMN gdrive_share_url TEXT;
ALTER TABLE deliverables ADD COLUMN gdrive_permissions JSONB DEFAULT '{}';

-- Example gdrive_permissions structure:
{
  "viewers": ["client@company.com"],
  "commenters": ["stakeholder@company.com"], 
  "editors": ["pm@agency.com"],
  "public_link": false,
  "expiry_date": "2025-12-31"
}
```

---

## Integration Tracking Tables

### 1. QuickBooks Integration Tracking

```sql
CREATE TABLE quickbooks_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- QuickBooks App Connection
    company_id TEXT NOT NULL, -- QuickBooks Company ID
    access_token_encrypted TEXT, -- Encrypted OAuth2 access token
    refresh_token_encrypted TEXT, -- Encrypted OAuth2 refresh token
    realm_id TEXT, -- QuickBooks Realm ID
    app_token TEXT, -- App-specific token
    
    -- Sync Configuration
    sync_enabled BOOLEAN DEFAULT TRUE,
    auto_sync_time_entries BOOLEAN DEFAULT FALSE,
    auto_sync_expenses BOOLEAN DEFAULT FALSE,
    auto_create_invoices BOOLEAN DEFAULT FALSE,
    
    -- Sync Status
    last_sync_at TIMESTAMPTZ,
    last_sync_status TEXT, -- 'success', 'error', 'partial'
    last_sync_error TEXT,
    next_sync_at TIMESTAMPTZ,
    
    -- Settings
    default_customer_class TEXT,
    default_item_account TEXT,
    tax_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, company_id)
);
```

### 2. Slack Integration Tracking

```sql  
CREATE TABLE slack_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Slack Workspace Connection
    workspace_id TEXT NOT NULL,
    bot_token_encrypted TEXT, -- Encrypted bot token
    app_id TEXT,
    webhook_url TEXT, -- Incoming webhook URL
    
    -- Default Settings
    default_channel TEXT, -- Default notification channel
    notification_types TEXT[] DEFAULT ARRAY['project_complete', 'deliverable_ready', 'milestone_reached'],
    
    -- Bot Configuration
    bot_user_id TEXT,
    bot_scope TEXT[], -- Bot permission scopes
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    last_notification_at TIMESTAMPTZ,
    last_error TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, workspace_id)
);
```

### 3. Google Drive Integration Tracking

```sql
CREATE TABLE gdrive_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Google Drive Configuration
    folder_id TEXT NOT NULL, -- Main project folder ID
    folder_name TEXT,
    parent_folder_id TEXT, -- Organization's main folder
    
    -- Service Account Details
    service_account_email TEXT,
    service_account_key_encrypted TEXT, -- Encrypted service account key
    
    -- Permissions
    permissions_granted BOOLEAN DEFAULT FALSE,
    shared_with JSONB DEFAULT '[]', -- Array of email addresses
    permission_level TEXT DEFAULT 'commenter', -- 'viewer', 'commenter', 'editor'
    
    -- Sync Settings
    auto_sync_enabled BOOLEAN DEFAULT TRUE,
    sync_deliverables BOOLEAN DEFAULT TRUE,
    sync_assets BOOLEAN DEFAULT FALSE,
    
    -- Status
    last_sync_at TIMESTAMPTZ,
    last_sync_status TEXT,
    folder_url TEXT, -- Human-readable folder URL
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id)
);
```

---

## API Integration Endpoints

### 1. QuickBooks Integration APIs

#### Authentication Endpoints
```typescript
// Initialize QuickBooks OAuth2 flow
POST /api/integrations/quickbooks/auth/init
{
  organizationId: string,
  redirectUri: string
}

// Handle OAuth2 callback
POST /api/integrations/quickbooks/auth/callback
{
  code: string,
  realmId: string,
  state: string
}

// Revoke QuickBooks connection
DELETE /api/integrations/quickbooks/auth/{organizationId}
```

#### Data Sync Endpoints
```typescript
// Sync project data to QuickBooks
POST /api/integrations/quickbooks/sync/project/{projectId}
{
  syncTimeEntries: boolean,
  syncExpenses: boolean,
  createCustomer: boolean
}

// Get sync status
GET /api/integrations/quickbooks/sync/status/{organizationId}

// Manual invoice creation
POST /api/integrations/quickbooks/invoices
{
  projectId: string,
  lineItems: Array<{
    description: string,
    quantity: number,
    rate: number
  }>,
  dueDate: string
}
```

### 2. Slack Integration APIs

#### Connection Management
```typescript
// Initialize Slack App installation
POST /api/integrations/slack/install
{
  organizationId: string
}

// Handle Slack OAuth callback
POST /api/integrations/slack/oauth/callback
{
  code: string,
  state: string
}

// Test Slack connection
POST /api/integrations/slack/test/{organizationId}
```

#### Notification Management
```typescript
// Send project notification
POST /api/integrations/slack/notify
{
  organizationId: string,
  channel: string,
  message: string,
  notificationType: 'project_start' | 'milestone_complete' | 'deliverable_ready'
}

// Update notification preferences
PUT /api/integrations/slack/preferences/{organizationId}
{
  defaultChannel: string,
  notificationTypes: string[],
  enableClientNotifications: boolean
}
```

### 3. Google Drive Integration APIs

#### Folder Management
```typescript
// Create project folder
POST /api/integrations/gdrive/folders
{
  projectId: string,
  folderName: string,
  parentFolderId?: string
}

// Share folder with client
POST /api/integrations/gdrive/folders/{folderId}/share
{
  emails: string[],
  permissionLevel: 'viewer' | 'commenter' | 'editor'
}

// Upload deliverable to folder
POST /api/integrations/gdrive/folders/{folderId}/files
{
  fileName: string,
  fileContent: Buffer | string,
  deliverableId: string
}
```

#### File Management
```typescript
// Get shareable link for deliverable
GET /api/integrations/gdrive/files/{fileId}/share-link

// Update file permissions
PUT /api/integrations/gdrive/files/{fileId}/permissions
{
  emails: string[],
  permissionLevel: string,
  expiryDate?: string
}
```

---

## Security Implementation

### 1. Token Encryption
```typescript
// Utility functions for token security
import { encrypt, decrypt } from '@/lib/crypto';

export function encryptToken(token: string): string {
  return encrypt(token, process.env.ENCRYPTION_KEY);
}

export function decryptToken(encryptedToken: string): string {
  return decrypt(encryptedToken, process.env.ENCRYPTION_KEY);
}
```

### 2. API Key Management
```sql
-- Store integration API keys securely
CREATE TABLE integration_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL, -- 'quickbooks', 'slack', 'gdrive'
    credential_type TEXT NOT NULL, -- 'oauth_token', 'api_key', 'service_account'
    encrypted_credential TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, integration_type, credential_type)
);
```

### 3. Permission Validation
```typescript
// Middleware to validate integration permissions
export async function validateIntegrationAccess(
  organizationId: string, 
  integrationType: string,
  userId: string
): Promise<boolean> {
  const membership = await getMembership(organizationId, userId);
  return membership.role in ['owner', 'admin'];
}
```

---

## Configuration Management

### 1. Environment Variables
```bash
# QuickBooks
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
QUICKBOOKS_REDIRECT_URI=https://app.brandblueprint.com/integrations/quickbooks/callback
QUICKBOOKS_SCOPE=com.intuit.quickbooks.accounting
QUICKBOOKS_BASE_URL=https://developer-uat.quickbooks.com/v3/company # or sandbox URL

# Slack
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret  
SLACK_REDIRECT_URI=https://app.brandblueprint.com/integrations/slack/callback
SLACK_SIGNING_SECRET=your_signing_secret

# Google Drive
GOOGLE_DRIVE_CLIENT_ID=your_google_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_client_secret
GOOGLE_SERVICE_ACCOUNT_EMAIL=service@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 2. Feature Flags
```typescript
// Feature flag configuration
export const INTEGRATION_FEATURES = {
  quickbooks: {
    enabled: process.env.ENABLE_QUICKBOOKS_INTEGRATION === 'true',
    sandbox: process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox',
    autoSync: process.env.QUICKBOOKS_AUTO_SYNC === 'true'
  },
  slack: {
    enabled: process.env.ENABLE_SLACK_INTEGRATION === 'true',
    botNotifications: process.env.SLACK_BOT_NOTIFICATIONS === 'true',
    clientChannels: process.env.SLACK_CLIENT_CHANNELS === 'true'
  },
  gdrive: {
    enabled: process.env.ENABLE_GDRIVE_INTEGRATION === 'true',
    autoShare: process.env.GDRIVE_AUTO_SHARE === 'true',
    publicLinks: process.env.GDRIVE_PUBLIC_LINKS === 'true'
  }
};
```

---

## Migration and Rollout Strategy

### Phase 1: Database Schema (Week 1)
- [ ] Add integration fields to existing tables
- [ ] Create integration tracking tables
- [ ] Add proper indexes and constraints
- [ ] Update RLS policies for new tables

### Phase 2: Core Integration APIs (Week 2-3)
- [ ] Implement QuickBooks OAuth2 flow
- [ ] Implement Slack app installation
- [ ] Implement Google Drive service account setup
- [ ] Create basic sync functionality

### Phase 3: UI Integration (Week 4)
- [ ] Add integration setup pages to admin panel
- [ ] Create integration status dashboards
- [ ] Build project-level integration controls
- [ ] Add client-facing integration features

### Phase 4: Advanced Features (Week 5-6)
- [ ] Implement automated notifications
- [ ] Add bulk sync operations
- [ ] Create integration health monitoring
- [ ] Build integration usage analytics

---

## Testing Strategy

### 1. Unit Tests
- Token encryption/decryption
- API endpoint validation
- Database constraint testing
- Permission checking logic

### 2. Integration Tests
- QuickBooks sandbox API calls
- Slack webhook deliverability
- Google Drive file operations
- End-to-end workflow testing

### 3. Security Tests
- Token storage encryption
- API key rotation
- Permission boundary testing
- Data access validation

---

## Monitoring and Observability

### 1. Key Metrics
- Integration connection success rate
- API call success/failure rates
- Sync operation duration
- User adoption per integration
- Error frequency by integration type

### 2. Alerting
- Failed OAuth refreshes
- Sync operation failures
- API rate limit warnings
- Permission errors
- Token expiration alerts

### 3. Logging
```typescript
// Integration event logging
export interface IntegrationLog {
  organizationId: string;
  projectId?: string;
  integrationType: 'quickbooks' | 'slack' | 'gdrive';
  operation: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}
```

---

## Rollback Procedures

### Emergency Rollback
1. **Disable Integration Features**: Set feature flags to false
2. **Preserve Integration Data**: Export all integration settings to backup
3. **Remove API Endpoints**: Comment out integration routes
4. **Database Rollback**: Use rollback script to remove integration fields

### Gradual Rollback
1. **Stop New Integrations**: Disable setup for new organizations
2. **Maintain Existing**: Keep working integrations functional
3. **Data Migration**: Move integration data to backup tables
4. **Feature Sunset**: Provide 30-day notice before full removal

---

This specification provides the complete foundation for implementing QuickBooks, Slack, and Google Drive integrations within the BrandBlueprint application while maintaining data security and operational reliability.