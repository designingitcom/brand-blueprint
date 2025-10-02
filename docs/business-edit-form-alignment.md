# Business Edit Form - Onboarding Alignment

## Summary

Updated the business edit form to match exactly with the onboarding Q1-Q6 fields.

## Field Mapping

| Onboarding Question | Form Field | Database Column | Type |
|-------------------|-----------|----------------|------|
| Q1: Business Name | `name` | `businesses.name` | string (required) |
| Q2: Website URL | `website_url` | `businesses.website_url` | string (URL) |
| Q2: Website Context | `website_context` | `businesses.website_context` | string |
| Q3: Industry | `industry` | `businesses.industry` | string |
| Q4: LinkedIn | `linkedin_url` | `businesses.linkedin_url` | string (URL) |
| Q5: Business Type | `business_type` | `businesses.business_type` | string (B2B/B2C/etc) |
| Q6: Brand Assets | `files_uploaded` | `businesses.files_uploaded` | JSONB array |
| Q7: Description | `description` | `businesses.description` | text |

## Files Changed

### 1. `/app/actions/businesses.ts`
- Updated `CreateBusinessData` interface with correct field names
- Updated `UpdateBusinessData` interface with correct field names
- Added comments mapping to onboarding questions

**Changed fields:**
- `type` → `business_type`
- `website` → `website_url`
- Added: `website_context`, `industry`, `linkedin_url`, `files_uploaded`

### 2. `/components/forms/business-form.tsx`
- Updated schema to match database columns
- Updated form default values
- Updated submit handler to use correct field names
- Added new form fields for all Q1-Q6 data

**New form fields added:**
- LinkedIn URL (Q4)
- Industry (Q3)
- Business Type dropdown (Q5) - B2B, B2C, B2B2C, Marketplace

## Data Sources

The business edit form now pulls data from the **`businesses` table**, specifically these columns:

- `name` - Business name (Q1)
- `website_url` - Website URL (Q2)
- `website_context` - Website context (Q2)
- `industry` - Industry (Q3)
- `linkedin_url` - LinkedIn URL (Q4)
- `business_type` - Business type (Q5)
- `files_uploaded` - Brand assets (Q6)
- `description` - Company description (Q7)

These fields are populated during onboarding via `saveOnboardingProgress()` in `/app/actions/save-onboarding.ts`.

## Testing

To test the alignment:

1. **Complete onboarding** for a new business
2. **Go to businesses page** and click edit on that business
3. **Verify all fields are populated** with data from onboarding:
   - Business name
   - Website URL
   - Industry
   - LinkedIn URL
   - Business Type (should show B2B, B2C, etc.)
   - Description
4. **Edit and save** - changes should update the `businesses` table

## Notes

- The `website_context` field is saved but not currently displayed in the edit form (can be added if needed)
- The `files_uploaded` field (Q6 brand assets) is saved as JSONB array but not currently editable in the form
- All data is stored in the `businesses` table, NOT in `strategic_responses`
- The `strategic_responses` table is for audit trail only (Q&A history)

## Migration Required

None - all columns already exist in the `businesses` table from the cleanup migration.
