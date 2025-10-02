#!/bin/bash

# Test Lindy Webhook with Signature Verification

SECRET="db4b6003ac334126cfb514ddd1baffeedaa4977d92934885febdab3cf04edcbe"
WEBHOOK_URL="https://f70c702c2186.ngrok-free.app/api/lindy/webhooks"

# Test payload
PAYLOAD='{
  "method": "POST",
  "body": {
    "type": "q7_suggestions_ready",
    "project_id": "2b8f7bb2-17ea-4051-b605-8ce44451c1f1",
    "q7_suggestions": [
      {
        "id": 1,
        "text": "Unlike other marketing agencies who provide generic campaigns, we deliver data-driven, industry-specific strategies that generate measurable ROI for B2B companies.",
        "confidence": 0.87,
        "reasoning": "Based on competitive analysis and industry trends",
        "approach": "process_differentiation"
      },
      {
        "id": 2,
        "text": "We combine deep industry expertise with cutting-edge AI tools to create marketing campaigns that actually convert leads into customers.",
        "confidence": 0.82,
        "reasoning": "Emphasizes unique technical capabilities",
        "approach": "technology_differentiation"
      },
      {
        "id": 3,
        "text": "As B2B marketing specialists, we understand your unique challenges and deliver tailored strategies that speak directly to decision-makers in your industry.",
        "confidence": 0.79,
        "reasoning": "Focuses on B2B expertise and customization",
        "approach": "specialization"
      }
    ]
  }
}'

# Generate HMAC SHA-256 signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

echo "🔐 Testing Lindy Webhook with Signature Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Webhook URL: $WEBHOOK_URL"
echo "🔑 Secret: ${SECRET:0:20}..."
echo "✍️  Signature: $SIGNATURE"
echo ""
echo "📤 Sending request..."
echo ""

# Send request with signature
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-lindy-signature: $SIGNATURE" \
  -d "$PAYLOAD" \
  -w "\n\n📊 Response Status: %{http_code}\n" \
  -s

echo ""
echo "✅ Test complete!"
echo ""
echo "🔍 Check:"
echo "  1. ngrok dashboard: http://localhost:4040/inspect/http"
echo "  2. Server logs for '✅ Webhook signature verified'"
echo "  3. Supabase lindy_responses table for new row"
