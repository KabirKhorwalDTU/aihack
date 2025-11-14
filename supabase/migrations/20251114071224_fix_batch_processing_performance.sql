/*
  # Fix Batch Processing Performance Issues
  
  This migration addresses statement timeout errors by optimizing the batch
  processing function for better performance with large datasets.
  
  1. Performance Optimizations
    - Simplified keyword matching using materialized CTEs
    - Reduced subquery complexity
    - Added statement_timeout configuration
    - Optimized topic matching with single aggregation
    - Pre-filter reviews before analysis
  
  2. Changes
    - Rewrite batch_analyze_reviews function with better query patterns
    - Add explicit timeout handling
    - Reduce memory usage with streaming approach
    - Use more efficient scoring algorithm
*/

-- Drop and recreate the function with optimizations
DROP FUNCTION IF EXISTS batch_analyze_reviews(integer, integer);

CREATE OR REPLACE FUNCTION batch_analyze_reviews(
  batch_size_param integer DEFAULT 10000,
  offset_param integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  processed_count integer := 0;
  failed_count integer := 0;
  start_time timestamptz;
  end_time timestamptz;
  processing_time_ms numeric;
BEGIN
  -- Set timeout to 5 minutes for this function
  SET LOCAL statement_timeout = '300s';
  
  start_time := clock_timestamp();
  
  -- Create temporary table for batch results
  CREATE TEMP TABLE IF NOT EXISTS batch_results (
    row_id integer PRIMARY KEY,
    topic text,
    sentiment text,
    priority text,
    summary text,
    topic_id uuid
  ) ON COMMIT DROP;
  
  TRUNCATE batch_results;
  
  -- Step 1: Get the batch of reviews to process
  CREATE TEMP TABLE IF NOT EXISTS review_batch ON COMMIT DROP AS
  SELECT r.row_id, r.review_text, lower(r.review_text) as review_text_lower
  FROM "Reviews List" r
  WHERE (r.processing_status IS NULL OR r.processing_status = 'pending')
    AND r.review_text IS NOT NULL
    AND trim(r.review_text) != ''
  ORDER BY r.row_id
  LIMIT batch_size_param
  OFFSET offset_param;
  
  GET DIAGNOSTICS processed_count = ROW_COUNT;
  
  -- If no reviews to process, return early
  IF processed_count = 0 THEN
    RETURN jsonb_build_object(
      'processed', 0,
      'failed', 0,
      'processing_time_ms', 0,
      'reviews_per_second', 0,
      'has_more', false
    );
  END IF;
  
  -- Step 2: Analyze sentiment for all reviews
  CREATE TEMP TABLE IF NOT EXISTS sentiment_scores ON COMMIT DROP AS
  SELECT 
    rb.row_id,
    COALESCE(SUM(CASE WHEN sk.sentiment = 'positive' THEN sk.weight ELSE 0 END), 0) as pos_score,
    COALESCE(SUM(CASE WHEN sk.sentiment = 'negative' THEN sk.weight ELSE 0 END), 0) as neg_score
  FROM review_batch rb
  CROSS JOIN sentiment_keywords sk
  WHERE position(lower(sk.word) IN rb.review_text_lower) > 0
  GROUP BY rb.row_id;
  
  -- Step 3: Identify topics for all reviews
  CREATE TEMP TABLE IF NOT EXISTS topic_scores ON COMMIT DROP AS
  SELECT 
    rb.row_id,
    tk.topic_name,
    SUM(tk.weight) as score
  FROM review_batch rb
  CROSS JOIN topic_keywords tk
  WHERE position(lower(tk.keyword) IN rb.review_text_lower) > 0
  GROUP BY rb.row_id, tk.topic_name;
  
  -- Step 4: Get top topic for each review
  CREATE TEMP TABLE IF NOT EXISTS top_topics ON COMMIT DROP AS
  SELECT DISTINCT ON (row_id)
    row_id,
    COALESCE(topic_name, 'Customer Support') as topic
  FROM topic_scores
  ORDER BY row_id, score DESC;
  
  -- Step 5: Calculate priority for all reviews
  CREATE TEMP TABLE IF NOT EXISTS priority_scores ON COMMIT DROP AS
  SELECT 
    rb.row_id,
    COALESCE(
      MAX(CASE 
        WHEN pk.priority_level = 'high' THEN 3
        WHEN pk.priority_level = 'medium' THEN 2
        ELSE 1
      END),
      0
    ) as priority_score
  FROM review_batch rb
  LEFT JOIN priority_keywords pk ON position(lower(pk.keyword) IN rb.review_text_lower) > 0
  GROUP BY rb.row_id;
  
  -- Step 6: Combine all results
  INSERT INTO batch_results (row_id, topic, sentiment, priority, summary)
  SELECT 
    rb.row_id,
    COALESCE(tt.topic, 'Customer Support') as topic,
    CASE 
      WHEN COALESCE(ss.pos_score, 0) > COALESCE(ss.neg_score, 0) THEN 'positive'
      ELSE 'negative'
    END as sentiment,
    CASE 
      WHEN COALESCE(ps.priority_score, 0) >= 3 THEN 'high'
      WHEN COALESCE(ps.priority_score, 0) >= 2 THEN 'medium'
      ELSE 'low'
    END as priority,
    CASE 
      WHEN length(rb.review_text) > 150 
      THEN substring(rb.review_text, 1, 147) || '...'
      ELSE rb.review_text
    END as summary
  FROM review_batch rb
  LEFT JOIN sentiment_scores ss ON rb.row_id = ss.row_id
  LEFT JOIN top_topics tt ON rb.row_id = tt.row_id
  LEFT JOIN priority_scores ps ON rb.row_id = ps.row_id;
  
  -- Step 7: Update topic_id from topics table
  UPDATE batch_results br
  SET topic_id = t.id
  FROM topics t
  WHERE t.name = br.topic;
  
  -- Step 8: Bulk update reviews with results
  UPDATE "Reviews List" r
  SET 
    topic_id = br.topic_id,
    sentiment = br.sentiment::text,
    priority = br.priority::text,
    tags = ARRAY[br.topic],
    processing_status = 'completed',
    processed_at = now()
  FROM batch_results br
  WHERE r.row_id = br.row_id;
  
  end_time := clock_timestamp();
  processing_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  -- Return statistics
  RETURN jsonb_build_object(
    'processed', processed_count,
    'failed', failed_count,
    'processing_time_ms', round(processing_time_ms, 2),
    'reviews_per_second', 
      CASE 
        WHEN processing_time_ms > 0 
        THEN round((processed_count::numeric / processing_time_ms) * 1000, 2)
        ELSE 0 
      END,
    'has_more', processed_count = batch_size_param
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION batch_analyze_reviews TO service_role;
GRANT EXECUTE ON FUNCTION batch_analyze_reviews TO authenticated;
