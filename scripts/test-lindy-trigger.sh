#!/bin/bash

# Test triggering Lindy with real business data

LINDY_URL="https://public.lindy.ai/api/v1/webhooks/lindy/cffa7dc6-0635-4e49-95a0-a25db2f95f54"
CALLBACK_URL="https://f70c702c2186.ngrok-free.app/api/lindy/webhooks"

# Use real business ID from your database
BUSINESS_ID="2b8f7bb2-17ea-4051-b605-8ce44451c1f1"

PAYLOAD=$(cat <<EOF
{
  "project_id": "$BUSINESS_ID",
  "business_name": "JPM",
  "website": "",
  "industry": "",
  "business_type": "",
  "linkedin": "",
  "files": [],
  "callback_url": "$CALLBACK_URL"
}
EOF
)

echo "🚀 Triggering Lindy AI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Lindy Webhook: $LINDY_URL"
echo "📞 Callback URL: $CALLBACK_URL"
echo "🆔 Business ID: $BUSINESS_ID"
echo ""
echo "📤 Sending request to Lindy..."
echo ""

# Send request to Lindy
RESPONSE=$(curl -X POST "$LINDY_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -w "\n%{http_code}" \
  -s)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "$BODY"
echo ""
echo "📊 Response Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Lindy triggered successfully!"
  echo ""
  echo "⏳ Now wait for Lindy to process and send webhook back..."
  echo "🔍 Monitor:"
  echo "  1. ngrok: https://dashboard.ngrok.com/traffic-inspector"
  echo "  2. Server logs for incoming webhook"
  echo "  3. Supabase lindy_responses table"
else
  echo "❌ Failed to trigger Lindy (status: $HTTP_CODE)"
fi
echo ""
