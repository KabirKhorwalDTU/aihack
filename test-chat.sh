#!/bin/bash

echo "Testing Chat Agent Integration"
echo "=============================="
echo ""

# Test 1: Check if n8n webhook is reachable
echo "Test 1: Testing n8n webhook directly..."
response=$(curl -s -w "\n%{http_code}" -X POST \
  https://rakeshgothwal.app.n8n.cloud/webhook/46cd68d6-ebd5-4915-b7cb-db38bdd55324 \
  -H "Content-Type: application/json" \
  -d '{"topic_id":"test","question":"Hello"}')

status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" = "200" ]; then
  echo "✓ n8n webhook is reachable"
  echo "Response: $body"
else
  echo "✗ n8n webhook returned status code: $status_code"
  echo "Response: $body"
fi

echo ""

# Test 2: Check Vite config
echo "Test 2: Checking Vite proxy configuration..."
if grep -q "proxy" vite.config.ts; then
  echo "✓ Vite proxy is configured"
else
  echo "✗ Vite proxy is not configured"
fi

echo ""

# Test 3: Check Edge Function
echo "Test 3: Checking Edge Function exists..."
if [ -f "supabase/functions/chat-proxy/index.ts" ]; then
  echo "✓ Edge Function file exists"
else
  echo "✗ Edge Function file is missing"
fi

echo ""

# Test 4: Check chatService
echo "Test 4: Checking chatService configuration..."
if grep -q "getN8nUrl" src/lib/chatService.ts; then
  echo "✓ chatService is updated with proxy logic"
else
  echo "✗ chatService needs to be updated"
fi

echo ""
echo "=============================="
echo "Next Steps:"
echo "1. Start dev server: npm run dev"
echo "2. Navigate to Chat Agent tab"
echo "3. Select a topic and ask a question"
echo ""
echo "For production deployment:"
echo "1. Deploy Edge Function: supabase functions deploy chat-proxy"
echo "2. Set secret: supabase secrets set N8N_WEBHOOK_URL=<your-webhook-url>"
