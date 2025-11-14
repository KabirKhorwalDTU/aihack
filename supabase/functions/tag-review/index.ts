import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
      "Account Blocked"
    ];

    const prompt = `You are an AI assistant specialized in analyzing customer feedback for a delivery/e-commerce platform.

Analyze the following customer review and provide structured output:

Review: "${reviewText}"

Provide your response in valid JSON format ONLY (no additional text before or after) with exactly these fields:
{
  "topic": "ONE primary topic from this EXACT list: Pricing, Payments, Location, Rider Behavior, Customer Support, Delivery, Product Quality, Delivery Experience, Cancellation, Extra Charges, Design, Account Blocked",
  "sentiment": "positive or negative ONLY (no neutral)",
  "summary": "a 1-2 sentence summary of the review",
  "priority": "high (urgent/critical issue), medium (standard concern), or low (minor feedback/suggestion)"
}

IMPORTANT:
- Topic MUST be one of the 12 options listed above (exact spelling)
- Sentiment MUST be either "positive" or "negative" only
- Priority MUST be "high", "medium", or "low"
- Choose the SINGLE most relevant topic
- Base priority on urgency and impact (payment issues, account blocks = high; delivery delays = medium/high; UI suggestions = low)`;

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
      !validTopics.includes(tagging.topic) ||
      !["positive", "negative"].includes(tagging.sentiment) ||
      !tagging.summary ||
      !["high", "medium", "low"].includes(tagging.priority)
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid response structure from OpenAI",
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
