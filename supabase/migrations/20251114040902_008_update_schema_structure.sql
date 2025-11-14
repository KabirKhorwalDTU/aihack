/*
  # Update Schema Structure for OpenAI Processing (Part 1)

  ## Overview
  Update database structure for new OpenAI requirements.
  Part 1: Schema changes without data updates.

  ## Changes
  - Add new columns for updated requirements
  - Remove old foreign key constraints
  - Update topics table structure
*/

-- Drop foreign key constraints
ALTER TABLE "Reviews List" 
  DROP CONSTRAINT IF EXISTS "Reviews List_level1_topic_id_fkey",
  DROP CONSTRAINT IF EXISTS "Reviews List_level2_topic_id_fkey";

-- Add new columns
ALTER TABLE "Reviews List"
  ADD COLUMN IF NOT EXISTS topic_id UUID,
  ADD COLUMN IF NOT EXISTS resolution_status TEXT DEFAULT 'unresolved' 
    CHECK (resolution_status IN ('resolved', 'unresolved', 'in_progress')),
  ADD COLUMN IF NOT EXISTS priority_new TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_list_topic_id ON "Reviews List"(topic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_list_resolution_status ON "Reviews List"(resolution_status);

-- Update topics table structure
ALTER TABLE topics
  DROP CONSTRAINT IF EXISTS topics_parent_topic_id_fkey,
  DROP COLUMN IF EXISTS level CASCADE,
  DROP COLUMN IF EXISTS parent_topic_id CASCADE;

-- Clear and insert new topics
TRUNCATE TABLE topics CASCADE;

INSERT INTO topics (name, description, is_active) VALUES
  ('Pricing', 'Pricing, costs, and charges feedback', true),
  ('Payments', 'Payment processing, transactions, and billing issues', true),
  ('Location', 'Location-related concerns and geographical issues', true),
  ('Rider Behavior', 'Delivery personnel conduct and behavior', true),
  ('Customer Support', 'Customer service and support interactions', true),
  ('Delivery', 'General delivery and logistics issues', true),
  ('Product Quality', 'Product condition, quality, and defects', true),
  ('Delivery Experience', 'Overall delivery experience and satisfaction', true),
  ('Cancellation', 'Order cancellation issues and policies', true),
  ('Extra Charges', 'Unexpected or additional charges', true),
  ('Design', 'App design, UI/UX issues', true),
  ('Account Blocked', 'Account access and blocking issues', true);

-- Add foreign key to new topic_id
ALTER TABLE "Reviews List"
  ADD CONSTRAINT reviews_list_topic_id_fkey 
  FOREIGN KEY (topic_id) REFERENCES topics(id);

COMMENT ON TABLE topics IS 'Predefined list of 12 primary topics for review categorization';
COMMENT ON COLUMN "Reviews List".topic_id IS 'Single primary topic assigned by OpenAI from predefined list';
COMMENT ON COLUMN "Reviews List".resolution_status IS 'Status of review handling: resolved, unresolved, or in_progress';
