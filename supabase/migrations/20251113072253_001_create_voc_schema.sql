/*
  # Create Voice of Customer (VoC) Insights Database Schema

  1. New Tables
    - `customers` - Store customer information
    - `feedback_sources` - Define feedback channels (Playstore, NPS, Freshdesk, WhatsApp, Social)
    - `reviews` - Store all customer feedback/reviews
    - `topics` - Store topic categories
    - `review_topics` - Junction table for many-to-many relationship between reviews and topics
    - `alerts` - Store system alerts and anomalies
    - `notifications` - Store user notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data
    - Add policies for service role to manage data

  3. Features
    - Automatic timestamps for audit trails
    - Soft deletes support via is_deleted column
    - Sentiment tracking (positive, neutral, negative)
    - Priority scoring (1-5)
    - Resolution status tracking
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  name text,
  region text,
  state text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS feedback_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  source_id uuid REFERENCES feedback_sources(id) NOT NULL,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')) NOT NULL,
  summary text NOT NULL,
  full_text text,
  priority_score integer CHECK (priority_score >= 1 AND priority_score <= 5) DEFAULT 3,
  resolution_status text CHECK (resolution_status IN ('resolved', 'unresolved', 'in_progress')) DEFAULT 'unresolved',
  state text,
  region text,
  assigned_to uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS review_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, topic_id)
);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('escalation', 'spike', 'anomaly')) NOT NULL,
  title text NOT NULL,
  description text,
  priority integer CHECK (priority >= 1 AND priority <= 5) DEFAULT 3,
  source_id uuid REFERENCES feedback_sources(id),
  topic_id uuid REFERENCES topics(id),
  region text,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES alerts(id) ON DELETE CASCADE,
  type text CHECK (type IN ('escalation', 'spike', 'anomaly')) NOT NULL,
  title text NOT NULL,
  description text,
  priority integer CHECK (priority >= 1 AND priority <= 5) DEFAULT 3,
  is_read boolean DEFAULT false,
  is_snoozed boolean DEFAULT false,
  snoozed_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage customers"
  ON customers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read feedback sources"
  ON feedback_sources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage feedback sources"
  ON feedback_sources FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read topics"
  ON topics FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Service role can manage topics"
  ON topics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Service role can manage reviews"
  ON reviews FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read review topics"
  ON review_topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage review topics"
  ON review_topics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage alerts"
  ON alerts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage notifications"
  ON notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX idx_reviews_priority ON reviews(priority_score);
CREATE INDEX idx_reviews_status ON reviews(resolution_status);
CREATE INDEX idx_reviews_region ON reviews(region);
CREATE INDEX idx_reviews_state ON reviews(state);
CREATE INDEX idx_reviews_created ON reviews(created_at);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_priority ON alerts(priority);
CREATE INDEX idx_alerts_region ON alerts(region);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_priority ON notifications(priority);
