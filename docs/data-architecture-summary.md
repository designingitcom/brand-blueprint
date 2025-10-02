# Data Architecture Summary - Businesses & Strategic Responses

## 🎯 Core Principle: Separation of Concerns

We use a **two-table architecture** with clear responsibilities:

```
businesses          = WHO you are (identity, operational)
strategic_responses = WHAT you know (strategy, insights)
```

This avoids:
- ❌ Arbitrary decisions about which strategic fields are "important enough" for businesses table
- ❌ Schema bloat (30+ columns for every strategic question)
- ❌ Confusion about source of truth

---

## 📊 Table Structures

### 1. `businesses` Table - Identity & Operations

**Purpose**: Business identity and operational metadata ONLY

**Fields** (15 total):

#### Core Identity (Q1-Q7)
- `id` (UUID) - Primary key
- `name` (TEXT) - Business name (Q1)
- `slug` (TEXT) - URL-friendly identifier
- `website_url` (TEXT) - Website URL (Q2)
- `website_context` (TEXT) - Context like "accurate", "no-website"
- `industry` (TEXT) - Industry (Q3)
- `linkedin_url` (TEXT) - LinkedIn profile (Q4)
- `business_type` (TEXT) - Single type: B2B, SaaS, etc. (Q5)
- `files_uploaded` (JSONB) - Array of uploaded file URLs (Q6)
- `description` (TEXT) - Elevator pitch (Q7)
- `logo_url` (TEXT) - Business logo

#### Relationships
- `organization_id` (UUID) - FK to organizations
- `user_id` (UUID) - FK to users (owner)

#### Onboarding Metadata
- `onboarding_path` (TEXT) - progressive_enhancement | fast_track | strategic_foundation
- `onboarding_step` (INT) - Current step number
- `onboarding_completed` (BOOL) - Completion status
- `onboarding_path_selected_at` (TIMESTAMPTZ)
- `onboarding_path_history` (JSONB) - Path changes history
- `current_question_id` (TEXT) - Resume point (e.g., "Q8", "Q15")

#### Timestamps
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**NOT Stored Here:**
- ❌ Target audience (Q8)
- ❌ ICP / Personas (Q22-Q23)
- ❌ Competitive advantage (Q9-Q14)
- ❌ Brand values (Q24-Q30)
- ❌ Any other strategic insights

---

### 2. `strategic_responses` Table - Complete Strategic Profile

**Purpose**: Source of truth for ALL onboarding Q&A and strategic insights

**Fields**:
- `id` (UUID) - Primary key
- `business_id` (UUID) - FK to businesses
- `question_id` (TEXT) - e.g., "Q1", "Q2", "Q8", "Q22"
- `question_text` (TEXT) - Full question text
- `response` (TEXT) - User's answer
- `ai_suggestion` (TEXT/JSONB) - AI-generated suggestions
- `confidence_level` (TEXT) - low | medium | high
- `metadata` (JSONB) - Additional context
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Unique constraint**: `(business_id, question_id)` - One answer per question per business

**Stored Here:**
- ✅ ALL questions (Q1 through Q30+)
- ✅ User responses
- ✅ AI suggestions from Lindy
- ✅ Confidence scores
- ✅ Complete audit trail with timestamps

---

## 🔄 Data Flow During Onboarding

### Phase 1: Basic Onboarding (Q1-Q7)

```typescript
// Save to BOTH tables
await saveOnboardingProgress({
  businessId: 'abc-123',
  data: {
    businessName: 'Acme Corp',        // → businesses.name
    website: 'acme.com',              // → businesses.website_url
    industry: 'Technology',           // → businesses.industry
    businessType: ['B2B'],            // → businesses.business_type
    // ...
  },
  questionNumber: 5
});

// This saves:
// 1. Current state to businesses table (denormalized)
// 2. Full Q&A history to strategic_responses (source of truth)
```

### Phase 2: Extended Onboarding (Q8-Q30)

```typescript
// Save to strategic_responses ONLY
await upsertStrategicResponse({
  business_id: 'abc-123',
  question_id: 'Q8',
  question_text: 'Who is your target audience?',
  response: 'CTOs at B2B SaaS companies...'
});

// businesses table is NOT updated
// strategic_responses is the single source of truth
```

---

## 📋 Query Patterns

### Get Business Identity (Fast)
```typescript
// No joins needed - super fast
const { data } = await supabase
  .from('businesses')
  .select('*')
  .eq('id', businessId)
  .single();

// Returns: name, website, industry, business_type, etc.
```

### Get Strategic Insights (When Needed)
```typescript
// Join for strategic data
const { data } = await supabase
  .from('businesses')
  .select(`
    *,
    strategic_responses(question_id, response, ai_suggestion)
  `)
  .eq('id', businessId)
  .single();

// Or query strategic_responses directly
const { data: responses } = await supabase
  .from('strategic_responses')
  .select('*')
  .eq('business_id', businessId)
  .in('question_id', ['Q8', 'Q22', 'Q23']); // target_audience, ICP, persona
```

### Build Lindy Payload
```typescript
// Combine both sources
const business = await getBusiness(businessId);
const strategicData = await getStrategicResponses(businessId);

const lindyPayload = {
  // From businesses table
  project_id: business.id,
  business_name: business.name,
  website: business.website_url,
  industry: business.industry,

  // From strategic_responses
  target_audience: strategicData.find(r => r.question_id === 'Q8')?.response,
  icp: strategicData.find(r => r.question_id === 'Q22')?.response,
};
```

---

## ✅ Benefits of This Architecture

### 1. Clear Separation
- **Identity** (who you are) vs **Strategy** (what you know)
- No confusion about where data lives

### 2. Flexibility
- Add new strategic questions without schema changes
- No arbitrary decisions about field importance

### 3. Performance
- Most queries only need identity (fast, no joins)
- Strategic queries join when needed (acceptable for less frequent operations)

### 4. Audit Trail
- `strategic_responses` provides complete history
- Can track answer changes over time

### 5. Scalability
- `businesses` table stays small (~15 columns)
- `strategic_responses` scales with questions (not schema changes)

---

## 🛠️ Related Tables

### `lindy_responses` - AI Suggestions Storage
```sql
lindy_responses
├── business_id (FK)
├── question_id (e.g., 'Q7')
├── role ('lindy' | 'user')
├── content (JSONB) - Full Lindy response
├── suggestions (JSONB) - Array of AI suggestions
└── timestamps
```

### `lindy_request_logs` - API Monitoring
```sql
lindy_request_logs
├── business_id (FK)
├── direction ('outgoing' | 'incoming')
├── payload (JSONB)
├── response_body (JSONB)
├── success (BOOL)
├── processing_time_ms (INT)
└── timestamps
```

---

## 📝 Key Decisions Made

1. ✅ **Keep `businesses` minimal** - Only identity/operational fields
2. ✅ **`strategic_responses` is SOT** - All strategic Q&A lives here
3. ✅ **No strategic denormalization** - Avoid arbitrary "importance" decisions
4. ✅ **Join when needed** - Accept small performance cost for clarity
5. ✅ **Separate monitoring** - `lindy_request_logs` for API debugging

---

## 🚀 Migration Path

To apply this architecture:

```bash
# 1. Remove strategic fields from businesses
npx supabase db push

# 2. Verify cleanup
npx supabase db dump --table businesses

# 3. Update queries to join strategic_responses when needed
```

---

## 📖 Examples

### Example: Display Business Card
```typescript
// ✅ Fast - no joins needed
const business = await supabase
  .from('businesses')
  .select('name, industry, business_type, logo_url')
  .eq('id', id)
  .single();

return (
  <Card>
    <h2>{business.name}</h2>
    <Badge>{business.industry}</Badge>
    <Badge>{business.business_type}</Badge>
  </Card>
);
```

### Example: Generate Strategic Report
```typescript
// ✅ Join for strategic data
const { data } = await supabase
  .from('businesses')
  .select(`
    name,
    industry,
    strategic_responses!inner(question_id, response)
  `)
  .eq('id', businessId);

const report = {
  business: data.name,
  target_audience: data.strategic_responses.find(r => r.question_id === 'Q8')?.response,
  icp: data.strategic_responses.find(r => r.question_id === 'Q22')?.response,
  positioning: data.strategic_responses.find(r => r.question_id === 'Q16')?.response,
};
```

---

## 🎯 Summary

- **`businesses`** = 15 fields for identity/operations (Q1-Q7 basics + metadata)
- **`strategic_responses`** = Unlimited rows for ALL strategic Q&A (Q1-Q30+)
- **Clean separation** = No confusion, no arbitrary decisions
- **Join when needed** = Small performance cost, big clarity benefit

This architecture scales to hundreds of questions without schema bloat and provides clear separation between identity and strategy.
