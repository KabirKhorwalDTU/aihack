/*
  # Update Priority and Sentiment Constraints (Part 2)

  ## Overview
  Update priority to text format and fix sentiment constraints.
  This is done separately to avoid timeout on large dataset.

  ## Changes
  - Convert priority from integer to text
  - Update sentiment constraint
  - Set reviews to pending for reprocessing
*/

-- Drop old priority column
ALTER TABLE "Reviews List" 
  DROP COLUMN IF EXISTS priority CASCADE;

-- Rename priority_new to priority
ALTER TABLE "Reviews List" 
  RENAME COLUMN priority_new TO priority;

-- Set default priority
ALTER TABLE "Reviews List"
  ALTER COLUMN priority SET DEFAULT 'medium';

-- Add constraint to priority
ALTER TABLE "Reviews List"
  ADD CONSTRAINT priority_check 
  CHECK (priority IN ('high', 'medium', 'low'));

-- Update sentiment constraint
ALTER TABLE "Reviews List" 
  DROP CONSTRAINT IF EXISTS "Reviews List_sentiment_check";

ALTER TABLE "Reviews List"
  ADD CONSTRAINT "Reviews List_sentiment_check" 
  CHECK (sentiment IN ('positive', 'negative'));

-- Drop old level columns
ALTER TABLE "Reviews List"
  DROP COLUMN IF EXISTS level1_topic_id,
  DROP COLUMN IF EXISTS level2_topic_id;

-- Update comments
COMMENT ON COLUMN "Reviews List".priority IS 'OpenAI-determined priority: high, medium, or low';
COMMENT ON COLUMN "Reviews List".sentiment IS 'OpenAI-analyzed sentiment: positive or negative';

-- Create index for priority
CREATE INDEX IF NOT EXISTS idx_reviews_list_priority_text ON "Reviews List"(priority);
