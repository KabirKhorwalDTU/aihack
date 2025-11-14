import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BatchResult {
  processed: number;
  failed: number;
  processing_time_ms: number;
  reviews_per_second: number;
  has_more: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { batchSize = 10000, offset = 0 } = await req.json();

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

    const startTime = Date.now();

    const { data, error } = await supabaseClient.rpc("batch_analyze_reviews", {
      batch_size_param: batchSize,
      offset_param: offset,
    });

    if (error) {
      throw new Error(`Batch processing error: ${error.message}`);
    }

    const result = data as BatchResult;
    const totalTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        message: result.processed > 0 ? "Batch processing completed" : "No pending reviews to process",
        processed: result.processed,
        successful: result.processed,
        failed: result.failed,
        offset: offset,
        nextOffset: offset + result.processed,
        hasMore: result.has_more,
        processingTimeMs: result.processing_time_ms,
        totalTimeMs: totalTime,
        reviewsPerSecond: result.reviews_per_second,
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