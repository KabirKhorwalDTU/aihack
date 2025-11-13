import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TaggingResponse {
  topic: string;
  sentiment: "positive" | "negative" | "neutral";
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

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `You are an AI assistant specialized in analyzing customer feedback for an e-commerce platform.

Analyze the following customer review and provide structured output:

Review: "${reviewText}"

Provide your response in valid JSON format ONLY (no additional text before or after) with exactly these fields:
{
  "topic": "main topic/category (e.g., Delivery, Product Quality, Customer Support, Payment, App Performance, Pricing, UI/UX, Availability)",
  "sentiment": "positive, negative, or neutral",
  "summary": "a 1-2 sentence summary of the review",
  "priority": "high (urgent issue), medium (standard concern), or low (minor feedback)"
}

Based on:
- Topic: Identify the primary subject of the feedback
- Sentiment: Analyze the emotional tone
- Summary: Create a concise summary
- Priority: Assess urgency (high for critical issues, medium for standard complaints, low for suggestions)`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({
          error: "Failed to process review with OpenAI",
          details: errorData,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from OpenAI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tagging: TaggingResponse = JSON.parse(content);

    // Validate response structure
    if (
      !tagging.topic ||
      !["positive", "negative", "neutral"].includes(tagging.sentiment) ||
      !tagging.summary ||
      !["high", "medium", "low"].includes(tagging.priority)
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid response structure from OpenAI",
          received: tagging,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Convert priority to score
    const priorityScore = { high: 5, medium: 3, low: 1 }[
      tagging.priority
    ] as number;

    return new Response(
      JSON.stringify({
        topic: tagging.topic,
        sentiment: tagging.sentiment,
        summary: tagging.summary,
        priority: tagging.priority,
        priorityScore,
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
