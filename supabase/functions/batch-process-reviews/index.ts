import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Review {
  row_id: number;
  review_text: string;
}

interface TaggingResult {
  row_id: number;
  topic: string;
  sentiment: "positive" | "negative";
  summary: string;
  priority: "high" | "medium" | "low";
  topic_id?: number;
  success: boolean;
  error?: string;
}

const VALID_TOPICS = [
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

async function processReviewWithOpenAI(review: Review, openaiApiKey: string): Promise<TaggingResult> {
  try {
    const prompt = `You are an AI assistant specialized in analyzing customer feedback for a delivery/e-commerce platform.

Analyze the following customer review and provide structured output:

Review: "${review.review_text}"

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
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const tagging = JSON.parse(content);

    if (
      !tagging.topic ||
      !VALID_TOPICS.includes(tagging.topic) ||
      !["positive", "negative"].includes(tagging.sentiment) ||
      !tagging.summary ||
      !["high", "medium", "low"].includes(tagging.priority)
    ) {
      throw new Error("Invalid response structure from OpenAI");
    }

    return {
      row_id: review.row_id,
      topic: tagging.topic,
      sentiment: tagging.sentiment,
      summary: tagging.summary,
      priority: tagging.priority,
      success: true,
    };
  } catch (error) {
    return {
      row_id: review.row_id,
      topic: "",
      sentiment: "negative",
      summary: "",
      priority: "medium",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function processInChunks<T>(items: T[], chunkSize: number, processor: (item: T) => Promise<any>): Promise<any[]> {
  const results = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
  }
  return results;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { batchSize = 1000, offset = 0 } = await req.json();

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

    const { data: topics } = await supabaseClient
      .from("topics")
      .select("id, name");

    const topicsMap = new Map(topics?.map(t => [t.name, t.id]) || []);

    const { data: reviews, error: fetchError } = await supabaseClient
      .from("Reviews List")
      .select("row_id, review_text")
      .or("processing_status.eq.pending,processing_status.is.null")
      .not("review_text", "is", null)
      .range(offset, offset + batchSize - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch reviews: ${fetchError.message}`);
    }

    if (!reviews || reviews.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No pending reviews to process",
          processed: 0,
          total: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results = await processInChunks(
      reviews as Review[],
      50,
      (review) => processReviewWithOpenAI(review, openaiApiKey)
    );

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    if (successfulResults.length > 0) {
      const updates = successfulResults.map(result => ({
        row_id: result.row_id,
        topic_id: topicsMap.get(result.topic),
        sentiment: result.sentiment,
        priority: result.priority,
        tags: [result.topic],
        processing_status: "completed",
        processed_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        await supabaseClient
          .from("Reviews List")
          .update({
            topic_id: update.topic_id,
            sentiment: update.sentiment,
            priority: update.priority,
            tags: update.tags,
            processing_status: update.processing_status,
            processed_at: update.processed_at,
          })
          .eq("row_id", update.row_id);
      }
    }

    if (failedResults.length > 0) {
      for (const result of failedResults) {
        await supabaseClient
          .from("Reviews List")
          .update({ processing_status: "failed" })
          .eq("row_id", result.row_id);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Batch processing completed",
        processed: reviews.length,
        successful: successfulResults.length,
        failed: failedResults.length,
        offset: offset,
        nextOffset: offset + batchSize,
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
