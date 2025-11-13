/*
  # Clean Up Old Tables and Sample Data

  ## Overview
  This migration removes old sample/seed data and consolidates the database
  structure. The "Reviews List" table remains as the primary source of truth
  for all review data.

  ## Changes

  ### 1. Clear Sample Data
  - Remove all sample data from reviews, customers, review_topics
  - Remove sample alerts and notifications
  - Keep feedback_sources and topics as they are reference data

  ### 2. Keep Core Structure
  - reviews table (empty, ready for processed data from Reviews List)
  - Reviews List table (untouched - 1M+ rows of source data)
  - feedback_sources (reference data)
  - topics (reference data)
  - alerts (empty, ready for new alerts)
  - notifications (empty, ready for new notifications)
  - review_topics (junction table, empty)

  ### 3. Remove Unnecessary Tables
  - customers table (data exists in Reviews List)

  ## Notes
  - Reviews List table is NOT modified
  - All RLS policies remain in place
  - Structure is ready for data processing pipeline
*/

-- Clear sample data from reviews and related tables
TRUNCATE TABLE review_topics CASCADE;
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE alerts CASCADE;

-- Drop customers table as customer data is in Reviews List
DROP TABLE IF EXISTS customers CASCADE;

-- Verify feedback_sources has the basic sources
INSERT INTO feedback_sources (name, description) VALUES
  ('playstore', 'Google Play Store Reviews'),
  ('nps', 'Net Promoter Score Surveys'),
  ('freshdesk', 'Freshdesk Support Tickets'),
  ('whatsapp', 'WhatsApp Customer Messages'),
  ('social', 'Social Media Mentions')
ON CONFLICT (name) DO NOTHING;

-- Ensure topics table has comprehensive topic list
INSERT INTO topics (name, description) VALUES
  ('Delivery Issues', 'Complaints about late or delayed deliveries'),
  ('Product Quality', 'Issues with product defects or quality concerns'),
  ('Customer Support', 'Support quality and response time issues'),
  ('App Performance', 'Technical issues with the mobile app'),
  ('Payment Problems', 'Payment processing and refund issues'),
  ('Pricing', 'Concerns about pricing and discounts'),
  ('User Interface', 'App UI/UX improvements and navigation'),
  ('Product Availability', 'Out of stock and availability issues')
ON CONFLICT (name) DO NOTHING;

-- Add comment to Reviews List table
COMMENT ON TABLE "Reviews List" IS 'Primary source data table containing 1M+ imported reviews. All review processing should reference this table.';
