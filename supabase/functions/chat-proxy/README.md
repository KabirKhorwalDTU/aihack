# Chat Proxy Edge Function

This Supabase Edge Function acts as a CORS-enabled proxy for the n8n webhook, solving CORS issues when calling n8n from the frontend.

## Setup

1. Deploy this function to Supabase:
```bash
supabase functions deploy chat-proxy
```

2. Set the N8N_WEBHOOK_URL secret:
```bash
supabase secrets set N8N_WEBHOOK_URL=https://rakeshgothwal.app.n8n.cloud/webhook/46cd68d6-ebd5-4915-b7cb-db38bdd55324
```

## How it works

- Accepts POST requests with `topic_id` and `question` in the request body
- Forwards the request to the n8n webhook
- Returns the response with proper CORS headers
- Handles errors gracefully

## Usage

The frontend automatically uses this function in production mode:
```typescript
POST https://jjhlezskzqodegwykwsz.supabase.co/functions/v1/chat-proxy
Headers:
  Content-Type: application/json
  Authorization: Bearer <SUPABASE_ANON_KEY>
  
Body:
{
  "topic_id": "uuid-here",
  "question": "What are customers saying about delivery?"
}
```

## Development

In development mode, the app uses a Vite proxy instead (see vite.config.ts).
