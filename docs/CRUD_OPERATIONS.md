# CRUD Operations Documentation

This document describes the backend CRUD operations for the BrandBlueprint application.

## Overview

The application follows a multi-tenant architecture:

- **Organizations** - Top-level tenant (agencies, in-house teams)
- **Clients** - Businesses served by organizations
- **Business Profiles** - Extended client information
- **Projects** - Work containers for brand strategy

## Server Actions

All CRUD operations are implemented as Next.js server actions in the `/app/actions/` directory:

- `organizations.ts` - Organization management
- `clients.ts` - Client management
- `business-profiles.ts` - Business profile management
- `projects.ts` - Project management

## API Reference

### Return Format

All server actions return a consistent `ActionResult` interface:

```typescript
interface ActionResult {
  error?: string; // Error message if operation failed
  success?: boolean; // True if operation succeeded
  data?: any; // Result data if successful
}
```

### Error Handling Pattern

```typescript
const result = await createOrganization(data);

if (result.error) {
  console.error('Operation failed:', result.error);
  // Handle error (show toast, redirect, etc.)
  return;
}

// Success - use result.data
console.log('Created organization:', result.data);
```

## Usage Examples

### Organization Management

```typescript
import {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  inviteUserToOrganization,
} from '@/app/actions/organizations';

// Create organization
const result = await createOrganization({
  name: 'Acme Design Agency',
  industry: 'Design',
  company_size: 'small',
  website: 'https://acmedesign.com',
});

// Get user's organizations
const orgs = await getOrganizations();

// Update organization
const updated = await updateOrganization(orgId, {
  name: 'Updated Name',
  industry: 'Technology',
});
```

### Client Management

```typescript
import {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} from '@/app/actions/clients';

// Create client
const result = await createClient({
  organization_id: 'org-uuid',
  name: "Joe's Pizza Shop",
  industry: 'Food Service',
  website: 'https://joespizza.com',
});

// Get clients for organization
const clients = await getClients(organizationId);

// Get client by slug (for URL routing)
const client = await getClientBySlug('acme-design', 'joes-pizza');
```

### Business Profile Management

```typescript
import {
  createBusinessProfile,
  getBusinessProfile,
  updateBusinessProfile,
  completeOnboarding,
} from '@/app/actions/business-profiles';

// Create/update business profile
const result = await updateBusinessProfile(clientId, {
  legal_name: "Joe's Pizza Shop LLC",
  founding_year: 2015,
  employee_count: 8,
  annual_revenue_min: 100000,
  annual_revenue_max: 500000,
  business_model_structured: 'b2c',
  target_market: ['Local families', 'College students'],
  budget_range_structured: '10k_25k',
  timeline_urgency_structured: '3_months',
});

// Profile completeness is auto-calculated
// Onboarding auto-completes at 80% completeness
```

### Project Management

```typescript
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  applyStrategyPathToProject,
} from '@/app/actions/projects';

// Create project with strategy path
const result = await createProject({
  client_id: 'client-uuid',
  name: 'Brand Refresh 2024',
  strategy_mode: 'predefined',
  strategy_path_id: 'startup-path-uuid',
});

// Get project by slug (for URL routing)
const project = await getProjectBySlug(
  'acme-design',
  'joes-pizza',
  'brand-refresh-2024'
);

// Apply strategy path to existing project
await applyStrategyPathToProject(projectId, strategyPathId);
```

## Complete API Reference

### Organizations API

```typescript
// Create organization
createOrganization(data: CreateOrganizationData): Promise<OrganizationActionResult>
- name: string (required)
- industry?: string
- company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
- website?: string
- description?: string

// Get user's organizations
getOrganizations(): Promise<OrganizationActionResult>

// Get single organization
getOrganization(id: string): Promise<OrganizationActionResult>

// Update organization
updateOrganization(id: string, updates: UpdateOrganizationData): Promise<OrganizationActionResult>

// Delete organization
deleteOrganization(id: string): Promise<OrganizationActionResult>

// Invite user to organization
inviteUserToOrganization(orgId: string, data: InviteUserData): Promise<OrganizationActionResult>
- email: string (required)
- role: 'owner' | 'admin' | 'strategist' | 'client_owner' | 'client_editor' | 'viewer'
- message?: string
```

### Clients API

```typescript
// Create client
createClient(data: CreateClientData): Promise<ClientActionResult>
- organization_id: string (required)
- name: string (required)
- industry?: string
- website?: string
- description?: string
- primary_contact_name?: string
- primary_contact_email?: string
- locale?: string (default: 'en')

// Get clients for organization
getClients(organizationId: string): Promise<ClientActionResult>

// Get client by ID
getClient(id: string): Promise<ClientActionResult>

// Get client by slug
getClientBySlug(organizationSlug: string, clientSlug: string): Promise<ClientActionResult>

// Update client
updateClient(id: string, updates: UpdateClientData): Promise<ClientActionResult>

// Delete client
deleteClient(id: string): Promise<ClientActionResult>

// Search clients
searchClients(organizationId: string, query: string): Promise<ClientActionResult>
```

### Business Profiles API

```typescript
// Create business profile
createBusinessProfile(data: CreateBusinessProfileData): Promise<BusinessProfileActionResult>
- client_id: string (required)
- legal_name?: string
- founding_year?: number
- employee_count?: number
- annual_revenue_min?: number
- annual_revenue_max?: number
- business_model_structured?: 'b2b' | 'b2c' | 'b2b2c' | 'marketplace' | 'saas' | 'd2c' | 'nonprofit' | 'government' | 'other'
- target_market?: string[]
- budget_range_structured?: 'under_10k' | '10k_25k' | '25k_50k' | '50k_100k' | '100k_250k' | '250k_500k' | '500k_plus'
- timeline_urgency_structured?: 'immediate' | '1_month' | '3_months' | '6_months' | '1_year' | 'no_rush'
- has_existing_brand?: boolean
- brand_satisfaction_score?: number (1-10)
- [50+ additional fields for comprehensive business profiling]

// Get business profile
getBusinessProfile(clientId: string): Promise<BusinessProfileActionResult>

// Update business profile (also creates if doesn't exist)
updateBusinessProfile(clientId: string, updates: UpdateBusinessProfileData): Promise<BusinessProfileActionResult>
- Auto-calculates profile_completeness percentage
- Auto-completes onboarding at 80% completeness

// Complete onboarding manually
completeOnboarding(clientId: string): Promise<BusinessProfileActionResult>

// Get business profile insights
getBusinessProfileInsights(clientId: string): Promise<BusinessProfileActionResult>

// Get incomplete profiles for organization
getIncompleteProfiles(organizationId: string): Promise<BusinessProfileActionResult>
```

### Projects API

```typescript
// Create project
createProject(data: CreateProjectData): Promise<ProjectActionResult>
- client_id: string (required)
- name: string (required)
- description?: string
- strategy_mode?: 'custom' | 'predefined' | 'hybrid'
- strategy_path_id?: string (for predefined mode)
- base_project_id?: string (to copy from existing project)
- status?: 'active' | 'archived'

// Get projects for client
getProjects(clientId: string): Promise<ProjectActionResult>

// Get project by ID
getProject(id: string): Promise<ProjectActionResult>

// Get project by slug
getProjectBySlug(orgSlug: string, clientSlug: string, projectSlug: string): Promise<ProjectActionResult>

// Update project
updateProject(id: string, updates: UpdateProjectData): Promise<ProjectActionResult>

// Delete project
deleteProject(id: string): Promise<ProjectActionResult>

// Apply strategy path to project
applyStrategyPathToProject(projectId: string, strategyPathId: string): Promise<ProjectActionResult>

// Copy project as base
copyProjectAsBase(sourceId: string, targetId: string): Promise<ProjectActionResult>
```

## Access Control

All operations include built-in access control:

### Roles

- `owner` - Full access to organization
- `admin` - Administrative access
- `strategist` - Can manage clients and projects
- `client_owner` - Can manage specific client data
- `client_editor` - Can edit client data
- `viewer` - Read-only access

### Security Features

- Row Level Security (RLS) enabled on all tables
- Multi-tenant data isolation
- Role-based permissions
- Automatic user authentication checks

## URL-Friendly Routing

The system supports clean URL routing with slugs:

```
/org-slug/client-slug/project-slug
/acme-design/joes-pizza/brand-refresh-2024
```

Slugs are auto-generated and guaranteed unique within their scope.

## Data Validation

### Automatic Features

- Unique slug generation
- Profile completeness calculation
- Input sanitization
- Required field validation
- Referential integrity checks

### Business Rules

- Organizations can have multiple clients
- Clients belong to one organization
- Projects belong to one client
- Business profiles are 1:1 with clients
- Strategy paths can be org-specific or global

## Testing

### Automated Test Suite

Run the test suite to verify CRUD operations:

```bash
# Run tests with environment variables loaded
node scripts/run-test.js
```

**Prerequisites:**

- Valid `.env` file with Supabase configuration
- Authenticated user in Supabase (sign in through the application first)
- Development server running (optional but recommended)

**Test Process:**

1. Checks user authentication
2. Creates test organization, client, business profile, and project
3. Tests all CRUD operations (create, read, update)
4. Verifies relationships and data integrity
5. Cleans up all test data
6. Reports detailed results

**Expected Output:**

```
🚀 Starting CRUD Operations Test Suite
=====================================

✅ Authentication Check
✅ Create Organization
✅ Read Organization
✅ Update Organization
✅ Create Client
✅ Read Clients
✅ Update Client
✅ Create Business Profile
✅ Update Business Profile
✅ Create Project
✅ Read Project with Relations
✅ Update Project
✅ Delete Project
✅ Delete Business Profile
✅ Delete Client
✅ Delete Organization

📊 Test Results Summary
========================
Total Tests: 16
Passed: 16
Failed: 0

🎉 All tests passed!
```

### Service Role Testing (Automated)

For CI/CD and automated testing environments, use the service role test script:

```bash
# Run service role tests (bypasses authentication)
node scripts/run-service-test.js
```

**Prerequisites:**

- Valid `.env` file with `SUPABASE_SERVICE_ROLE_KEY`
- Service role key with full database access

**Features:**

- Bypasses Row Level Security for testing
- Creates temporary test user automatically
- Tests all CRUD operations without authentication requirements
- Perfect for continuous integration environments

### Manual Testing

You can also test individual operations through the Next.js application or by importing the server actions directly in your components.

## Utilities

Common utilities are available in `/lib/utils/database.ts`:

```typescript
import {
  checkOrganizationAccess,
  checkClientAccess,
  checkProjectAccess,
  generateUniqueSlug,
  hasAdminAccess,
  canEditClient,
} from '@/lib/utils/database';

// Check access before operations
const access = await checkProjectAccess(projectId);
if (!access.hasAccess) {
  return { error: access.error };
}
```

## Advanced Usage Patterns

### Form Integration

```typescript
// In a React component with form handling
import { createClient } from '@/app/actions/clients';

export default function CreateClientForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');

    const result = await createClient({
      organization_id: formData.get('organization_id') as string,
      name: formData.get('name') as string,
      industry: formData.get('industry') as string,
      website: formData.get('website') as string,
    });

    if (result.error) {
      setError(result.error);
    } else {
      // Success - redirect or update UI
      router.push(`/clients/${result.data.slug}`);
    }

    setLoading(false);
  }

  return (
    <form action={handleSubmit}>
      {/* form fields */}
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>Create Client</button>
    </form>
  );
}
```

### Multi-Step Workflows

```typescript
// Complete client onboarding workflow
async function completeClientOnboarding(clientData, profileData, projectData) {
  try {
    // Step 1: Create client
    const clientResult = await createClient(clientData);
    if (clientResult.error) throw new Error(clientResult.error);

    const clientId = clientResult.data.id;

    // Step 2: Create business profile
    const profileResult = await updateBusinessProfile(clientId, profileData);
    if (profileResult.error) throw new Error(profileResult.error);

    // Step 3: Create initial project
    const projectResult = await createProject({
      ...projectData,
      client_id: clientId,
    });
    if (projectResult.error) throw new Error(projectResult.error);

    return {
      success: true,
      data: {
        client: clientResult.data,
        profile: profileResult.data,
        project: projectResult.data,
      },
    };
  } catch (error) {
    return { error: error.message };
  }
}
```

### Data Aggregation

```typescript
// Get organization overview with all related data
async function getOrganizationOverview(organizationId: string) {
  const [orgResult, clientsResult] = await Promise.all([
    getOrganization(organizationId),
    getClients(organizationId),
  ]);

  if (orgResult.error) return { error: orgResult.error };
  if (clientsResult.error) return { error: clientsResult.error };

  // Get projects for each client
  const clientsWithProjects = await Promise.all(
    clientsResult.data.map(async client => {
      const projectsResult = await getProjects(client.id);
      return {
        ...client,
        projects: projectsResult.data || [],
      };
    })
  );

  return {
    success: true,
    data: {
      organization: orgResult.data,
      clients: clientsWithProjects,
      totalClients: clientsResult.data.length,
      totalProjects: clientsWithProjects.reduce(
        (sum, client) => sum + client.projects.length,
        0
      ),
    },
  };
}
```

## Error Handling

All functions return a consistent result format:

```typescript
interface ActionResult {
  error?: string; // Error message if operation failed
  success?: boolean; // True if operation succeeded
  data?: any; // Result data if successful
}
```

### Common Error Types

- **Authentication errors**: `"User not authenticated"`
- **Access control errors**: `"Access denied to this organization"`
- **Validation errors**: `"Name is required"`, `"Invalid email format"`
- **Not found errors**: `"Client not found"`, `"Project not found"`
- **Constraint errors**: `"Organization name already exists"`

## Performance Considerations

- Indexes on all foreign keys and commonly queried fields
- Materialized views for dashboard queries
- Efficient pagination and filtering
- Optimized relationship queries with proper `select` statements

## Next Steps

With the backend CRUD layer complete, you can now:

1. Build dashboard UI that calls these server actions
2. Create forms that submit to these actions
3. Add real-time features with Supabase subscriptions
4. Implement the full BrandBlueprint workflow UI

The data layer is solid and ready for any UI implementation!
