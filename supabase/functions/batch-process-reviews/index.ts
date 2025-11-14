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

async function processReviewWithDatabase(
  review: Review,
  supabaseClient: any
): Promise<TaggingResult> {
  try {
    const { data, error } = await supabaseClient.rpc("analyze_review_text", {
      review_text: review.review_text,
    });

    if (error) {
      throw new Error(`Database analysis error: ${error.message}`);
    }

    if (
      !data.topic ||
      !VALID_TOPICS.includes(data.topic) ||
      !["positive", "negative"].includes(data.sentiment) ||
      !data.summary ||
      !["high", "medium", "low"].includes(data.priority)
    ) {
      throw new Error("Invalid response structure from analysis function");
    }

    return {
      row_id: review.row_id,
      topic: data.topic,
      sentiment: data.sentiment,
      summary: data.summary,
      priority: data.priority,
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

async function processInChunks<T>(
  items: T[],
  chunkSize: number,
  processor: (item: T) => Promise<any>
): Promise<any[]> {
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
      (review) => processReviewWithDatabase(review, supabaseClient)
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
