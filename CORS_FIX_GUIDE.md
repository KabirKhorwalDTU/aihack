# CORS Fix Guide for n8n Chat Agent

This guide explains how the CORS issue with the n8n webhook has been fixed.

## Problem

The frontend was making direct requests to the n8n webhook from the browser, which caused CORS errors because n8n doesn't send the required CORS headers for cross-origin requests.

## Solution

We've implemented a two-part solution:

### 1. Development Mode: Vite Proxy

In development, we use Vite's built-in proxy to forward requests to n8n.

**File: `vite.config.ts`**
- Added proxy configuration under `server.proxy`
- Routes `/api/n8n` requests to the n8n webhook
- The proxy handles CORS automatically

**Usage:**
```bash
npm run dev
```

The app will automatically use `/api/n8n` endpoint, which is proxied to n8n.

### 2. Production Mode: Supabase Edge Function

In production, we use a Supabase Edge Function as a proxy.

**File: `supabase/functions/chat-proxy/index.ts`**
- Acts as a CORS-enabled proxy
- Forwards requests to n8n webhook
- Returns responses with proper CORS headers

## Deployment Steps

### Step 1: Deploy the Edge Function

```bash
# Make sure you have Supabase CLI installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref jjhlezskzqodegwykwsz

# Deploy the function
supabase functions deploy chat-proxy

# Set the n8n webhook URL as a secret
supabase secrets set N8N_WEBHOOK_URL=https://rakeshgothwal.app.n8n.cloud/webhook/46cd68d6-ebd5-4915-b7cb-db38bdd55324
```

### Step 2: Test the Setup

**Development:**
```bash
npm run dev
# Navigate to the Chat Agent tab and ask a question
```

**Production:**
```bash
npm run build
npm run preview
# Navigate to the Chat Agent tab and ask a question
```

## How It Works

### chatService.ts Logic

```typescript
const getN8nUrl = () => {
  if (import.meta.env.DEV) {
    // Development: Use Vite proxy
    return '/api/n8n';
  } else {
    // Production: Use Supabase Edge Function
    return `${supabaseUrl}/functions/v1/chat-proxy`;
  }
};
```

### Request Flow

**Development:**
```
Frontend → /api/n8n (Vite Proxy) → n8n Webhook → Response
```

**Production:**
```
Frontend → Supabase Edge Function → n8n Webhook → Response
```

## Troubleshooting

### Issue: Still getting CORS errors in development

**Solution:** Make sure you restart the dev server after updating `vite.config.ts`
```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

### Issue: Edge Function not working in production

**Solution:** Check if the function is deployed and the secret is set
```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs chat-proxy
```

### Issue: n8n webhook not responding

**Solution:** Test the n8n webhook directly
```bash
curl -X POST https://rakeshgothwal.app.n8n.cloud/webhook/46cd68d6-ebd5-4915-b7cb-db38bdd55324 \
  -H "Content-Type: application/json" \
  -d '{"topic_id":"test","question":"test question"}'
```

## Architecture Benefits

1. **No CORS Issues**: Both solutions handle CORS properly
2. **Environment Separation**: Different approaches for dev and prod
3. **Security**: n8n webhook URL is hidden from frontend in production
4. **Error Handling**: Better error messages for debugging
5. **Maintainability**: Easy to update webhook URL without frontend changes

## Files Modified

- `vite.config.ts` - Added proxy configuration
- `src/lib/chatService.ts` - Updated to use proxy/edge function
- `supabase/functions/chat-proxy/index.ts` - New Edge Function

## Testing Checklist

- [ ] Dev server starts without errors
- [ ] Can select a topic in Chat Agent tab
- [ ] Can ask a question and receive a response
- [ ] Build succeeds (`npm run build`)
- [ ] Edge Function deployed to Supabase
- [ ] N8N_WEBHOOK_URL secret is set
- [ ] Production build works correctly

## Important: n8n Workflow Must Be Active

⚠️ **The n8n workflow must be activated for the webhook to work!**

The error message indicates:
```
"The workflow must be active for a production URL to run successfully. 
You can activate the workflow using the toggle in the top-right of the editor."
```

### Steps to Activate n8n Workflow:

1. Log into your n8n account at https://rakeshgothwal.app.n8n.cloud
2. Open the workflow that has the webhook node
3. Click the toggle switch in the top-right corner to **Activate** the workflow
4. The workflow status should change from "Inactive" to "Active"

Once activated, the webhook will respond to requests.

## Quick Test

Run this command to test if the webhook is working:
```bash
curl -X POST https://rakeshgothwal.app.n8n.cloud/webhook/46cd68d6-ebd5-4915-b7cb-db38bdd55324 \
  -H "Content-Type: application/json" \
  -d '{"topic_id":"test","question":"Hello"}'
```

Expected response: A JSON object with an `answer` field.

If you get a 404 error, the workflow is not active yet.
