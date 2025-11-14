import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TaggingResponse {
  topic: string;
  sentiment: "positive" | "negative";
  summary: string;
  priority: "high" | "medium" | "low";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { reviewText } = await req.json();

    if (!reviewText || typeof reviewText !== "string") {
      return new Response(
        JSON.stringify({
          error: "reviewText is required and must be a string",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabaseClient.rpc("analyze_review_text", {
      review_text: reviewText,
    });

    if (error) {
      console.error("Database analysis error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to analyze review",
          details: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tagging: TaggingResponse = {
      topic: data.topic,
      sentiment: data.sentiment,
      summary: data.summary,
      priority: data.priority,
    };

    const validTopics = [
      "Pricing",
      "Payments",
      "Location",
      "Rider Behavior",
      "Customer Support",
      "Delivery",
      "Product Quality",
      "Delivery Experience",
      "Cancellation",
      "Extra Charges",
      "Design",
      "Account Blocked",
    ];

    if (
      !tagging.topic ||
      !validTopics.includes(tagging.topic) ||
      !["positive", "negative"].includes(tagging.sentiment) ||
      !tagging.summary ||
      !["high", "medium", "low"].includes(tagging.priority)
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid response structure from analysis function",
          received: tagging,
          validTopics,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        topic: tagging.topic,
        sentiment: tagging.sentiment,
        summary: tagging.summary,
        priority: tagging.priority,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
