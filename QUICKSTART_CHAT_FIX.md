# Quick Start: CORS Fix for n8n Chat

## The Fix is Ready! Here's What to Do:

### Step 1: Activate n8n Workflow (REQUIRED)
🔴 **This is the most important step!**

1. Go to: https://rakeshgothwal.app.n8n.cloud
2. Open your workflow
3. Click the **Activate** toggle in the top-right corner
4. Verify it says "Active"

### Step 2: Test in Development (Right Now!)
```bash
# Start the dev server (if not already running)
npm run dev

# In your browser:
# 1. Go to http://localhost:5173
# 2. Click on "Chat Agent" tab
# 3. Select a topic
# 4. Ask a question like "What are customers saying about delivery?"
```

The CORS issue should be fixed! ✅

### Step 3: Deploy to Production (When Ready)
```bash
# 1. Deploy the Edge Function
supabase functions deploy chat-proxy

# 2. Set the secret
supabase secrets set N8N_WEBHOOK_URL=https://rakeshgothwal.app.n8n.cloud/webhook/46cd68d6-ebd5-4915-b7cb-db38bdd55324

# 3. Build and deploy your frontend
npm run build
```

## What Was Changed?

### Development Mode (Immediate Fix)
- Added Vite proxy to handle CORS
- Your frontend now talks to `/api/n8n` which proxies to n8n
- No more CORS errors!

### Production Mode (For Deployment)
- Created Supabase Edge Function as a proxy
- Handles CORS properly in production
- More secure (hides webhook URL)

## Quick Test
```bash
# Run this to test everything
bash test-chat.sh
```

## Troubleshooting

### "404 webhook not registered"
→ Your n8n workflow is not active. Activate it in n8n dashboard.

### Still getting CORS errors in dev
→ Restart your dev server: `npm run dev`

### Edge Function not working
→ Make sure you deployed it: `supabase functions deploy chat-proxy`

## Need More Details?
- `CORS_FIX_SUMMARY.md` - Quick overview
- `CORS_FIX_GUIDE.md` - Detailed documentation
- `supabase/functions/chat-proxy/README.md` - Edge Function docs

---

**TL;DR: Activate your n8n workflow, restart dev server, test the chat!** 🚀
