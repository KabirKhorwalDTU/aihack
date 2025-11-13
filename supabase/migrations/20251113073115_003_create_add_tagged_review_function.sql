/*
  # Create Function to Add Tagged Reviews

  This function takes review information including the auto-tagged data from OpenAI
  and inserts it into the database with all associated topics and data.
*/

CREATE OR REPLACE FUNCTION add_tagged_review(
  p_customer_id uuid,
  p_source_id uuid,
  p_review_text text,
  p_sentiment text,
  p_summary text,
  p_priority_score integer,
  p_topics text[],
  p_state text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_review_id uuid;
  v_topic_id uuid;
  v_topic_name text;
BEGIN
  -- Insert the review
  INSERT INTO reviews (
    customer_id,
    source_id,
    sentiment,
    summary,
    full_text,
    priority_score,
    resolution_status,
    state,
    region
  ) VALUES (
    p_customer_id,
    p_source_id,
    p_sentiment,
    p_summary,
    p_review_text,
    p_priority_score,
    'unresolved',
    p_state,
    p_region
  )
  RETURNING id INTO v_review_id;

  -- Link topics to the review
  FOREACH v_topic_name IN ARRAY p_topics
  LOOP
    SELECT id INTO v_topic_id FROM topics WHERE name = v_topic_name LIMIT 1;

    IF v_topic_id IS NOT NULL THEN
      INSERT INTO review_topics (review_id, topic_id)
      VALUES (v_review_id, v_topic_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN v_review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_tagged_review TO authenticated, service_role;
