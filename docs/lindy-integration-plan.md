# Lindy Integration Plan - Complete Architecture

## 🎯 Overview

This document outlines the complete data flow and architecture for integrating Lindy AI with the S1BMW onboarding wizard.

---

## 📊 Database Schema

### **1. Primary Tables**

#### `businesses` (Main Entity)
Stores core business identity and onboarding state:
- `id` (UUID) - Primary key
- `name` - Business name (from Q1)
- `website_url` - Website (from Q2)
- `industry` - Industry (from Q3)
- `business_type` - Business type (from Q4)
- `linkedin_url` - LinkedIn (from Q5)
- `files_uploaded` (JSONB) - Uploaded files (from Q6)
- `onboarding_phase` - Current phase
- `onboarding_step` - Current step number
- `current_question_id` - Resume point (Q1-Q22)
- `basics_completed_at` - When Q1-Q6 completed

#### `strategic_responses` (Q&A Storage)
Stores ALL question responses with AI suggestions:
- `business_id` (FK to businesses)
- `question_id` - 'Q1', 'Q2', ... 'Q22'
- `question_text` - Full question text
- `response` - User's answer
- `ai_suggestion` - AI-generated suggestions (JSON or text)
- `confidence_level` - 'low', 'medium', 'high'
- `metadata` (JSONB) - Additional context

#### `ai_messages` (Lindy Audit Trail)
Stores raw Lindy webhook responses:
- `project_id` (business_id)
- `question_id` - Which question this relates to
- `role` - 'lindy' or 'user'
- `content` (JSONB) - Full response from Lindy
- `variants` (JSONB) - Array of AI suggestions

---

## 🔄 Data Flow Architecture

### **Phase 1: User Fills Q1-Q6**

```
User answers Q1 → Save to strategic_responses
                → Update businesses.name
User answers Q2 → Save to strategic_responses
                → Update businesses.website_url
... (repeat for Q3-Q6)
```

**Implementation:**
```typescript
// On each question save
await upsertStrategicResponse({
  business_id: businessId,
  question_id: 'Q1',
  question_text: 'What is your business name?',
  response: userAnswer,
});

// Sync to businesses table
await syncBusinessBasicsFromResponses(businessId);
```

### **Phase 2: Trigger Lindy (After Q6)**

```
User completes Q6
     ↓
Fetch Q1-Q6 from strategic_responses
     ↓
Format payload for Lindy
     ↓
POST to Lindy webhook
     ↓
Show loading state on Q7
```

**Implementation:**
```typescript
const { data: basics } = await getBusinessBasicsForLindy(businessId);

await fetch('https://public.lindy.ai/api/v1/webhooks/lindy/cffa7dc6-0635-4e49-95a0-a25db2f95f54', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...basics,
    callback_url: 'https://a0f5bb074d3c.ngrok-free.app/api/lindy/webhooks'
  })
});
```

### **Phase 3: Lindy Processes & Responds**

```
Lindy receives request
     ↓
Conducts research
     ↓
Generates Q7 suggestions
     ↓
POST to your webhook
```

**Expected Payload FROM Lindy:**
```json
{
  "method": "POST",
  "body": {
    "type": "q7_suggestions_ready",
    "project_id": "business-uuid",
    "q7_suggestions": [
      "Suggestion 1: ...",
      "Suggestion 2: ...",
      "Suggestion 3: ..."
    ]
  }
}
```

### **Phase 4: Store & Display Results**

```
Webhook receives Lindy response
     ↓
Store in ai_messages (audit trail)
     ↓
Update strategic_responses (Q7, ai_suggestion)
     ↓
Real-time subscription updates UI
     ↓
Display suggestions to user
```

**Implementation:**
```typescript
// In webhook route
await supabase.from('ai_messages').insert({
  project_id: body.project_id,
  question_id: 'Q7',
  role: 'lindy',
  content: body,
  variants: body.q7_suggestions
});

await upsertStrategicResponse({
  business_id: body.project_id,
  question_id: 'Q7',
  question_text: 'Describe your business',
  response: '', // Will be filled when user selects
  ai_suggestion: JSON.stringify(body.q7_suggestions)
});
```

---

## 🛠️ Implementation Checklist

### **Step 1: Database Migration** ✅
- [x] Run `20250101_cleanup_businesses_schema.sql`
- [x] Verify `strategic_responses` table exists
- [x] Verify `ai_messages` table exists

### **Step 2: Server Actions** ✅
- [x] `upsertStrategicResponse()` - Save Q&A
- [x] `getStrategicResponses()` - Fetch all answers
- [x] `getQuestionResponse()` - Fetch single question
- [x] `getBusinessBasicsForLindy()` - Format Q1-Q6 for Lindy
- [x] `syncBusinessBasicsFromResponses()` - Update businesses table

### **Step 3: Webhook Infrastructure** ✅
- [x] `/api/lindy/webhooks/route.ts` - Receive Lindy responses
- [x] `lib/lindy-webhook.ts` - Send to Lindy
- [x] `hooks/use-q7-suggestions.ts` - Real-time updates
- [x] ngrok tunnel for local testing

### **Step 4: Onboarding Wizard Integration** ⏳ (Next)
- [ ] Update wizard to call `upsertStrategicResponse()` on each answer
- [ ] Add Lindy trigger after Q6 completion
- [ ] Display AI suggestions on Q7
- [ ] Handle user selection and save to DB

### **Step 5: Testing** ⏳
- [ ] Test save/load for Q1-Q6
- [ ] Test Lindy webhook trigger
- [ ] Test receiving suggestions
- [ ] Test user selection flow

---

## 📋 What to Give Lindy NOW

### **Your Webhook URL:**
```
https://a0f5bb074d3c.ngrok-free.app/api/lindy/webhooks
```

### **Expected Request FROM Your App:**
```json
{
  "project_id": "uuid",
  "business_name": "Company Name",
  "website": "https://example.com",
  "industry": "Technology",
  "business_type": "B2B SaaS",
  "linkedin": "https://linkedin.com/company/example",
  "files": [],
  "callback_url": "https://a0f5bb074d3c.ngrok-free.app/api/lindy/webhooks"
}
```

### **Expected Response TO Your Webhook:**
```json
{
  "method": "POST",
  "body": {
    "type": "q7_suggestions_ready",
    "project_id": "same-uuid-from-request",
    "q7_suggestions": [
      "First AI-generated business description",
      "Second AI-generated business description",
      "Third AI-generated business description"
    ]
  }
}
```

---

## 🔐 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xigzapsughpuqjxttsra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Lindy
NEXT_PUBLIC_LINDY_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/cffa7dc6-0635-4e49-95a0-a25db2f95f54
LINDY_WEBHOOK_SECRET=your_secret
LINDY_CALLBACK_URL=https://f70c702c2186.ngrok-free.app/api/lindy/webhooks

# Development Mode Settings
SKIP_LINDY_IN_DEV=false    # Set to 'true' to skip Lindy in development (saves API credits)
                           # When true: Shows test button to load mock suggestions
                           # When false: Calls real Lindy API automatically

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Development Mode Configuration**

The `SKIP_LINDY_IN_DEV` environment variable controls Lindy behavior in development:

**When `SKIP_LINDY_IN_DEV=false` (Production-like, Recommended):**
- ✅ Lindy API is called automatically on Q7
- ✅ Real webhook responses are received
- ❌ Test button is hidden
- 💰 Uses Lindy API credits

**When `SKIP_LINDY_IN_DEV=true` (Development Mode):**
- ❌ Lindy API calls are skipped
- ✅ Test button appears in AI loading skeleton
- ✅ Click test button to load mock suggestions
- 💰 No API credits used

**Configuration Files:**

1. **`.env`** - Set the value:
   ```bash
   SKIP_LINDY_IN_DEV=false
   ```

2. **`next.config.ts`** - Exposes to client components:
   ```typescript
   env: {
     SKIP_LINDY_IN_DEV: process.env.SKIP_LINDY_IN_DEV || 'true',
   }
   ```

3. **`app/actions/trigger-lindy.ts`** - Server-side check (line 27):
   ```typescript
   if (process.env.NODE_ENV === 'development' && process.env.SKIP_LINDY_IN_DEV !== 'false') {
     return { success: true, message: 'Development mode: Use test button', skipped: true };
   }
   ```

4. **`components/ui/ai-loading-skeleton.tsx`** - Client-side check (line 58):
   ```typescript
   {businessId &&
    process.env.NODE_ENV === 'development' &&
    process.env.SKIP_LINDY_IN_DEV !== 'false' && (
     <button>🧪 Test</button>
   )}
   ```

---

## 📊 Monitoring

- **ngrok Dashboard**: https://dashboard.ngrok.com/observability/requests
- **Local Inspector**: http://localhost:4040/inspect/http
- **Supabase Logs**: Check `ai_messages` and `strategic_responses` tables

---

## 🚀 Next Steps

1. **Run the database migration** to clean up businesses table
2. **Give Lindy the webhook URL** and payload format
3. **Integrate server actions into onboarding wizard**
4. **Test the full flow** with a real business

---

## 📞 Support

- Lindy Webhook URL: `https://public.lindy.ai/api/v1/webhooks/lindy/cffa7dc6-0635-4e49-95a0-a25db2f95f54`
- Your Webhook URL: `https://a0f5bb074d3c.ngrok-free.app/api/lindy/webhooks`
- ngrok Monitoring: http://localhost:4040
