# Testing Lindy Integration - Quick Guide

## Fast Testing (No Full Onboarding Required)

### Option 1: Direct Callback Simulation

**Best for:** Testing the Q7 suggestions display and loading states

```bash
# 1. Get a business_id from any existing business in your database
# Check Supabase dashboard or use browser console in onboarding

# 2. Trigger the test callback
curl -X POST http://localhost:3000/api/test-lindy-callback \
  -H "Content-Type: application/json" \
  -d '{"business_id": "YOUR_BUSINESS_ID"}'

# 3. Navigate to Q7 in onboarding with that business_id
# Suggestions will appear immediately
```

### Option 2: Quick Trigger (Browser Console)

**Best for:** Testing during active onboarding session

```javascript
// 1. Complete Q1-Q6 in onboarding
// 2. Open browser console (F12)
// 3. Copy your business_id from the URL or console logs
// 4. Run this command:

await fetch('/api/test-lindy-trigger?business_id=YOUR_BUSINESS_ID')
  .then(r => r.json())
  .then(console.log);

// 5. Click Next to go to Q7
// Suggestions appear instantly!
```

## Test Endpoints

### 1. `/api/test-lindy-callback` (POST)

Simulates the webhook callback from Lindy with mock suggestions.

**Request:**
```json
{
  "business_id": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "suggestions": [...],
  "ai_message_id": "uuid"
}
```

### 2. `/api/test-lindy-trigger` (GET)

Convenience endpoint that triggers the callback simulation in one step.

**Request:**
```
GET /api/test-lindy-trigger?business_id=uuid-here
```

**Response:**
```json
{
  "success": true,
  "message": "Test suggestions generated and stored",
  "next_steps": [...]
}
```

## Testing Different Scenarios

### Test Loading State

1. Go to Q7 in onboarding
2. Do NOT call test endpoints
3. Loading skeleton should appear
4. After 30+ seconds, error state should show (if no real Lindy response)

### Test Success State

1. Complete Q1-Q6
2. Call `/api/test-lindy-trigger?business_id=YOUR_ID`
3. Navigate to Q7
4. Suggestions appear immediately with purple panel

### Test Error State

1. Go to Q7 in onboarding
2. Wait for loading to finish (or force error by modifying code)
3. Red error panel appears with retry button

### Test Retry Functionality

1. Trigger error state (wait for timeout or use modified code)
2. Click "Try Again" button
3. Loading skeleton should reappear
4. Call test endpoint while loading
5. Navigate back to Q7
6. Suggestions should now appear

## Full Integration Test (Real Lindy)

To test the actual Lindy integration end-to-end:

1. Ensure `LINDY_WEBHOOK_URL` is set in `.env`
2. Complete full onboarding Q1-Q6
3. Click Next on Q6
4. Watch browser console for:
   - `🚀 Triggering Lindy after Q6 completion...`
   - `✅ Lindy triggered successfully`
5. Navigate to Q7
6. Wait 10-30 seconds for Lindy's real response
7. Suggestions appear from actual AI analysis

## Monitoring

### Browser Console Logs

```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// Check for these logs:
'📥 Fetching Lindy Q7 suggestions for display...'
'✅ Lindy suggestions loaded for Q7'
'❌ Error fetching Lindy suggestions:'
```

### Server Logs

Watch terminal for:
- `💾 Saving onboarding data:`
- `🚀 Triggering Lindy after Q6 completion...`
- `✅ Lindy triggered successfully`
- `📥 Fetching Lindy Q7 suggestions for display...`

### Database Checks

```sql
-- Check if suggestions were stored
SELECT * FROM ai_messages
WHERE business_id = 'YOUR_BUSINESS_ID'
AND message_type = 'q7_suggestions'
ORDER BY created_at DESC;

-- Check business onboarding progress
SELECT id, name, onboarding_step, onboarding_completed
FROM businesses
WHERE id = 'YOUR_BUSINESS_ID';

-- Check strategic responses
SELECT * FROM strategic_responses
WHERE business_id = 'YOUR_BUSINESS_ID'
ORDER BY question_id;
```

## Troubleshooting

### "No suggestions appear at Q7"

1. Check if ai_messages record exists in database
2. Check browser console for errors
3. Verify business_id matches between onboarding and database
4. Try calling test endpoint manually

### "Loading state never ends"

1. Check if Lindy webhook was triggered (server logs)
2. Check if Lindy responded (ai_messages table)
3. Force reload page after calling test endpoint
4. Clear browser cache and retry

### "Error state appears immediately"

1. Check fetch-lindy-suggestions.ts for errors
2. Verify Supabase client is authenticated
3. Check database permissions (RLS policies)
4. Try test endpoint to bypass Lindy entirely

## Quick Reset

To reset and test again:

```sql
-- Clear AI messages for business
DELETE FROM ai_messages WHERE business_id = 'YOUR_BUSINESS_ID';

-- Reset onboarding step
UPDATE businesses
SET onboarding_step = 6
WHERE id = 'YOUR_BUSINESS_ID';
```

Then navigate back to onboarding and test again!
