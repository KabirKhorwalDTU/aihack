import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL') || 'https://rakeshgothwal.app.n8n.cloud/webhook/46cd68d6-ebd5-4915-b7cb-db38bdd55324';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const body = await req.json();
    console.log('[Chat Proxy] Received request:', body);

    if (!body.topic_id || !body.question) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: topic_id and question' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('[Chat Proxy] Forwarding to n8n:', N8N_WEBHOOK_URL);

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('[Chat Proxy] n8n response status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('[Chat Proxy] n8n error response:', errorText);

      return new Response(
        JSON.stringify({
          error: 'Failed to get response from AI agent',
          details: errorText,
          status: n8nResponse.status
        }),
        {
          status: n8nResponse.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const rawResponse = await n8nResponse.text();
    console.log('[Chat Proxy] n8n raw response:', rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('[Chat Proxy] Failed to parse n8n response:', parseError);
      return new Response(
        JSON.stringify({
          error: 'Invalid response from AI agent',
          raw: rawResponse.substring(0, 500)
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('[Chat Proxy] Parsed n8n response:', data);

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[Chat Proxy] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
