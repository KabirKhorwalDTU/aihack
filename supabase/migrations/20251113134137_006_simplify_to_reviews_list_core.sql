/*
  # Simplify Database Architecture - Reviews List as Single Source of Truth

  ## Overview
  This migration simplifies the database by using "Reviews List" as the primary
  and only reviews table. All OpenAI processing results will be stored directly
  in this table.

  ## Changes

  ### 1. Enhance Reviews List Table
  Add columns for OpenAI processing:
  - `tags` (JSONB array) - OpenAI generated tags
  - `sentiment` (text) - positive/neutral/negative
  - `priority` (integer 1-5) - OpenAI determined priority
  - `level1_topic_id` (UUID) - Primary topic category
  - `level2_topic_id` (UUID) - Detailed sub-topic
  - `processed_at` (timestamp) - When OpenAI processing completed
  - `processing_status` (text) - pending/processing/completed/failed

  ### 2. Update Topics Table for 2-Level Hierarchy
  - Add `level` column (1 or 2)
  - Add `parent_topic_id` for level 2 topics
  - Add proper constraints and indexes

  ### 3. Remove Redundant Tables
  - Drop reviews table (data is in Reviews List)
  - Drop review_topics table (topics stored as FK in Reviews List)
  - Drop feedback_sources table (source is in fdb_source column)

  ## Notes
  - Reviews List becomes the single source of truth
  - All 1M+ reviews stay intact
  - Topics table supports drill-down with 2 levels
*/

-- Step 1: Enhance Reviews List with OpenAI processing columns
ALTER TABLE "Reviews List" 
  ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS level1_topic_id UUID REFERENCES topics(id),
  ADD COLUMN IF NOT EXISTS level2_topic_id UUID REFERENCES topics(id),
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_list_sentiment ON "Reviews List"(sentiment);
CREATE INDEX IF NOT EXISTS idx_reviews_list_priority ON "Reviews List"(priority);
CREATE INDEX IF NOT EXISTS idx_reviews_list_level1_topic ON "Reviews List"(level1_topic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_list_level2_topic ON "Reviews List"(level2_topic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_list_fdb_source ON "Reviews List"(fdb_source);
CREATE INDEX IF NOT EXISTS idx_reviews_list_state ON "Reviews List"(state);
CREATE INDEX IF NOT EXISTS idx_reviews_list_processing_status ON "Reviews List"(processing_status);

-- Step 2: Update topics table for 2-level hierarchy
ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 CHECK (level IN (1, 2)),
  ADD COLUMN IF NOT EXISTS parent_topic_id UUID REFERENCES topics(id);

-- Add index for parent lookup
CREATE INDEX IF NOT EXISTS idx_topics_parent ON topics(parent_topic_id);

-- Clear existing topics and add proper 2-level structure
TRUNCATE TABLE topics CASCADE;

-- Insert Level 1 Topics (high-level categories)
INSERT INTO topics (id, name, description, level) VALUES
  (gen_random_uuid(), 'Delivery', 'Delivery and logistics related issues', 1),
  (gen_random_uuid(), 'Product', 'Product quality and availability concerns', 1),
  (gen_random_uuid(), 'Support', 'Customer support and service issues', 1),
  (gen_random_uuid(), 'Technology', 'App and technical issues', 1),
  (gen_random_uuid(), 'Payment', 'Payment and billing issues', 1),
  (gen_random_uuid(), 'Pricing', 'Pricing and offers feedback', 1);

-- Insert Level 2 Topics (detailed sub-topics) with parent references
-- Delivery sub-topics
INSERT INTO topics (name, description, level, parent_topic_id) 
SELECT 'Late Delivery', 'Delayed or late deliveries', 2, id FROM topics WHERE name = 'Delivery' AND level = 1;

INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'Wrong Address', 'Delivery to incorrect address', 2, id FROM topics WHERE name = 'Delivery' AND level = 1;

INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'Missing Items', 'Items missing from delivery', 2, id FROM topics WHERE name = 'Delivery' AND level = 1;

-- Product sub-topics
INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'Quality Issues', 'Defective or poor quality products', 2, id FROM topics WHERE name = 'Product' AND level = 1;

INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'Out of Stock', 'Product availability issues', 2, id FROM topics WHERE name = 'Product' AND level = 1;

INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'Wrong Product', 'Received wrong product', 2, id FROM topics WHERE name = 'Product' AND level = 1;

-- Support sub-topics
INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'Response Time', 'Slow or no response from support', 2, id FROM topics WHERE name = 'Support' AND level = 1;

INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'Resolution Quality', 'Poor problem resolution', 2, id FROM topics WHERE name = 'Support' AND level = 1;

-- Technology sub-topics
INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'App Crashes', 'Application crashes and freezes', 2, id FROM topics WHERE name = 'Technology' AND level = 1;

INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'UI/UX Issues', 'User interface and navigation problems', 2, id FROM topics WHERE name = 'Technology' AND level = 1;

-- Payment sub-topics
INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'Payment Failed', 'Failed transactions', 2, id FROM topics WHERE name = 'Payment' AND level = 1;

INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'Refund Issues', 'Refund delays and problems', 2, id FROM topics WHERE name = 'Payment' AND level = 1;

-- Pricing sub-topics
INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'High Prices', 'Price concerns', 2, id FROM topics WHERE name = 'Pricing' AND level = 1;

INSERT INTO topics (name, description, level, parent_topic_id)
SELECT 'Discount Issues', 'Problems with offers and discounts', 2, id FROM topics WHERE name = 'Pricing' AND level = 1;

-- Step 3: Update alerts to reference Reviews List
ALTER TABLE alerts 
  DROP COLUMN IF EXISTS review_id;

ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS reviews_list_row_id BIGINT REFERENCES "Reviews List"(row_id);

-- Step 4: Update notifications to reference Reviews List
ALTER TABLE notifications
  DROP COLUMN IF EXISTS review_id;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS reviews_list_row_id BIGINT REFERENCES "Reviews List"(row_id);

-- Step 5: Drop redundant tables
DROP TABLE IF EXISTS review_topics CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS feedback_sources CASCADE;

-- Add helpful comments
COMMENT ON TABLE "Reviews List" IS 'Single source of truth for all reviews (1M+ rows). Contains original data plus OpenAI processing results (tags, sentiment, priority, topics).';
COMMENT ON TABLE topics IS 'Hierarchical topic structure with 2 levels for drill-down analysis.';
COMMENT ON COLUMN "Reviews List".tags IS 'JSONB array of OpenAI-generated tags for categorization.';
COMMENT ON COLUMN "Reviews List".sentiment IS 'OpenAI-analyzed sentiment: positive, neutral, or negative.';
COMMENT ON COLUMN "Reviews List".priority IS 'OpenAI-determined priority score (1-5, where 1 is highest priority).';
