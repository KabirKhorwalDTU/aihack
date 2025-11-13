/*
  # Rearchitect Database Schema for Reviews System

  ## Overview
  This migration consolidates the database into a unified reviews-based architecture
  where the main "reviews" table stores all review data including OpenAI-generated
  tags, sentiment, and priority. It also adds a rating field and integrates with
  the existing "Reviews List" import table.

  ## Changes

  ### 1. Reviews Table Enhancements
  - Add `rating` column (1-5 scale) for star ratings
  - Add `tags` JSONB column to store OpenAI-generated tags
  - Add `source_reference_id` to link with external/imported data
  - Add `raw_review_data` JSONB for storing original review metadata
  - Add indexes for new columns

  ### 2. Alerts Table Updates
  - Add `review_id` foreign key to link alerts to specific reviews
  - Add `affected_review_count` to track scope of alerts
  - Add `metadata` JSONB for flexible alert data

  ### 3. Notifications Table Updates
  - Add `review_id` foreign key for review-specific notifications
  - Add `metadata` JSONB for flexible notification data
  - Add `action_url` for clickable notifications

  ## Data Model
  - Reviews table becomes the central source of truth for all review data
  - Tags are stored as JSONB array for flexible querying
  - Priority and sentiment are OpenAI-generated fields
  - Alerts and notifications can reference specific reviews

  ## Security
  - All existing RLS policies remain in place
  - No changes to authentication or authorization

  ## Notes
  - Migration is non-destructive - only adds columns
  - Existing data remains intact
  - New fields have sensible defaults
*/

-- Add new columns to reviews table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'rating'
  ) THEN
    ALTER TABLE reviews ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'tags'
  ) THEN
    ALTER TABLE reviews ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'source_reference_id'
  ) THEN
    ALTER TABLE reviews ADD COLUMN source_reference_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'raw_review_data'
  ) THEN
    ALTER TABLE reviews ADD COLUMN raw_review_data JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'phone'
  ) THEN
    ALTER TABLE reviews ADD COLUMN phone text;
  END IF;
END $$;

-- Add new columns to alerts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'review_id'
  ) THEN
    ALTER TABLE alerts ADD COLUMN review_id uuid REFERENCES reviews(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'affected_review_count'
  ) THEN
    ALTER TABLE alerts ADD COLUMN affected_review_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE alerts ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add new columns to notifications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'review_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN review_id uuid REFERENCES reviews(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'action_url'
  ) THEN
    ALTER TABLE notifications ADD COLUMN action_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_tags ON reviews USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_reviews_source_reference ON reviews(source_reference_id);
CREATE INDEX IF NOT EXISTS idx_alerts_review_id ON alerts(review_id);
CREATE INDEX IF NOT EXISTS idx_notifications_review_id ON notifications(review_id);

-- Update existing add_tagged_review function to support new fields
CREATE OR REPLACE FUNCTION add_tagged_review(
  p_customer_id uuid,
  p_source_id uuid,
  p_review_text text,
  p_sentiment text,
  p_summary text,
  p_priority_score integer,
  p_topics text[],
  p_tags jsonb DEFAULT '[]'::jsonb,
  p_rating integer DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_region text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_source_reference_id text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_review_id uuid;
  v_topic_id uuid;
  v_topic_name text;
BEGIN
  -- Insert the review with new fields
  INSERT INTO reviews (
    customer_id,
    source_id,
    sentiment,
    summary,
    full_text,
    priority_score,
    resolution_status,
    state,
    region,
    tags,
    rating,
    phone,
    source_reference_id
  ) VALUES (
    p_customer_id,
    p_source_id,
    p_sentiment,
    p_summary,
    p_review_text,
    p_priority_score,
    'unresolved',
    p_state,
    p_region,
    p_tags,
    p_rating,
    p_phone,
    p_source_reference_id
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
