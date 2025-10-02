-- Check the lindy_responses table for webhook data
SELECT
  id,
  business_id,
  question_id,
  role,
  content->>'type' as type,
  jsonb_array_length(suggestions) as suggestion_count,
  created_at
FROM lindy_responses
ORDER BY created_at DESC
LIMIT 5;
