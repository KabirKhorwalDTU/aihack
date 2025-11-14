/*
  # Create Rule-Based Review Analysis System
  
  This migration creates a complete rule-based system for analyzing customer reviews
  without requiring external API keys or services. All analysis is performed using
  PostgreSQL functions with keyword dictionaries stored in the database.

  1. New Tables
    - `sentiment_keywords` - Stores positive and negative sentiment keywords
    - `topic_keywords` - Maps topics to relevant keywords and phrases
    - `priority_keywords` - Defines urgency indicators for priority scoring
    - `stop_words` - Common words to ignore during analysis
  
  2. New Functions
    - `analyze_review_text` - Main function that analyzes review text and returns
      topic, sentiment, priority, and summary without external API calls
    - `extract_summary` - Helper function to generate summaries
    - `calculate_sentiment_score` - Calculates sentiment based on keyword matching
    - `identify_topic` - Identifies primary topic from review text
    - `calculate_priority` - Determines priority level based on keywords
  
  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to read data
    - Add policies for service role to manage data
  
  4. Features
    - Fast keyword-based analysis
    - No external API dependencies
    - Customizable keyword dictionaries
    - Scalable for batch processing
*/

-- Create sentiment keywords table
CREATE TABLE IF NOT EXISTS sentiment_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  sentiment text CHECK (sentiment IN ('positive', 'negative')) NOT NULL,
  weight numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sentiment_keywords_word ON sentiment_keywords(word);
CREATE INDEX IF NOT EXISTS idx_sentiment_keywords_sentiment ON sentiment_keywords(sentiment);

-- Create topic keywords table
CREATE TABLE IF NOT EXISTS topic_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_name text NOT NULL,
  keyword text NOT NULL,
  weight numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topic_keywords_topic ON topic_keywords(topic_name);
CREATE INDEX IF NOT EXISTS idx_topic_keywords_keyword ON topic_keywords(keyword);

-- Create priority keywords table
CREATE TABLE IF NOT EXISTS priority_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  priority_level text CHECK (priority_level IN ('high', 'medium', 'low')) NOT NULL,
  weight numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_priority_keywords_keyword ON priority_keywords(keyword);

-- Create stop words table
CREATE TABLE IF NOT EXISTS stop_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stop_words_word ON stop_words(word);

-- Enable RLS
ALTER TABLE sentiment_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE stop_words ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read sentiment keywords"
  ON sentiment_keywords FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage sentiment keywords"
  ON sentiment_keywords FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read topic keywords"
  ON topic_keywords FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage topic keywords"
  ON topic_keywords FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read priority keywords"
  ON priority_keywords FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage priority keywords"
  ON priority_keywords FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read stop words"
  ON stop_words FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage stop words"
  ON stop_words FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed sentiment keywords
INSERT INTO sentiment_keywords (word, sentiment, weight) VALUES
  -- Positive keywords
  ('excellent', 'positive', 2.0),
  ('great', 'positive', 1.5),
  ('good', 'positive', 1.3),
  ('amazing', 'positive', 2.0),
  ('awesome', 'positive', 2.0),
  ('perfect', 'positive', 2.0),
  ('love', 'positive', 1.8),
  ('best', 'positive', 2.0),
  ('fantastic', 'positive', 2.0),
  ('wonderful', 'positive', 2.0),
  ('happy', 'positive', 1.5),
  ('satisfied', 'positive', 1.5),
  ('pleased', 'positive', 1.5),
  ('thank', 'positive', 1.3),
  ('thanks', 'positive', 1.3),
  ('recommend', 'positive', 1.5),
  ('impressed', 'positive', 1.5),
  ('outstanding', 'positive', 2.0),
  ('superb', 'positive', 2.0),
  ('fast', 'positive', 1.3),
  ('quick', 'positive', 1.3),
  ('helpful', 'positive', 1.5),
  ('friendly', 'positive', 1.5),
  ('polite', 'positive', 1.5),
  ('professional', 'positive', 1.3),
  
  -- Negative keywords
  ('terrible', 'negative', 2.0),
  ('horrible', 'negative', 2.0),
  ('awful', 'negative', 2.0),
  ('bad', 'negative', 1.5),
  ('poor', 'negative', 1.5),
  ('worst', 'negative', 2.0),
  ('hate', 'negative', 2.0),
  ('disappointing', 'negative', 1.8),
  ('disappointed', 'negative', 1.8),
  ('unsatisfied', 'negative', 1.8),
  ('unhappy', 'negative', 1.8),
  ('angry', 'negative', 2.0),
  ('frustrated', 'negative', 1.8),
  ('useless', 'negative', 2.0),
  ('pathetic', 'negative', 2.0),
  ('disgusting', 'negative', 2.0),
  ('never', 'negative', 1.5),
  ('waste', 'negative', 1.8),
  ('scam', 'negative', 2.0),
  ('fraud', 'negative', 2.0),
  ('slow', 'negative', 1.3),
  ('late', 'negative', 1.3),
  ('delayed', 'negative', 1.5),
  ('wrong', 'negative', 1.5),
  ('broken', 'negative', 1.8),
  ('damaged', 'negative', 1.8),
  ('rude', 'negative', 2.0),
  ('unprofessional', 'negative', 1.8),
  ('unacceptable', 'negative', 2.0),
  ('failed', 'negative', 1.8),
  ('failure', 'negative', 1.8),
  ('issue', 'negative', 1.3),
  ('problem', 'negative', 1.5),
  ('complaint', 'negative', 1.5)
ON CONFLICT DO NOTHING;

-- Seed topic keywords
INSERT INTO topic_keywords (topic_name, keyword, weight) VALUES
  -- Pricing
  ('Pricing', 'price', 2.0),
  ('Pricing', 'expensive', 2.0),
  ('Pricing', 'cheap', 2.0),
  ('Pricing', 'cost', 2.0),
  ('Pricing', 'costly', 2.0),
  ('Pricing', 'overpriced', 2.0),
  ('Pricing', 'pricing', 2.0),
  ('Pricing', 'money', 1.5),
  ('Pricing', 'value', 1.3),
  ('Pricing', 'discount', 1.5),
  ('Pricing', 'offer', 1.3),
  
  -- Payments
  ('Payments', 'payment', 2.0),
  ('Payments', 'pay', 1.8),
  ('Payments', 'paid', 1.8),
  ('Payments', 'transaction', 2.0),
  ('Payments', 'refund', 2.0),
  ('Payments', 'card', 1.5),
  ('Payments', 'upi', 1.8),
  ('Payments', 'wallet', 1.8),
  ('Payments', 'cash', 1.5),
  ('Payments', 'cod', 1.8),
  ('Payments', 'billing', 1.8),
  ('Payments', 'charged', 1.8),
  
  -- Location
  ('Location', 'location', 2.0),
  ('Location', 'address', 2.0),
  ('Location', 'area', 1.5),
  ('Location', 'gps', 1.8),
  ('Location', 'pin', 1.5),
  ('Location', 'pincode', 1.8),
  ('Location', 'map', 1.5),
  ('Location', 'direction', 1.5),
  ('Location', 'directions', 1.5),
  ('Location', 'navigation', 1.5),
  ('Location', 'track', 1.3),
  
  -- Rider Behavior
  ('Rider Behavior', 'rider', 2.0),
  ('Rider Behavior', 'driver', 2.0),
  ('Rider Behavior', 'delivery boy', 2.0),
  ('Rider Behavior', 'delivery person', 2.0),
  ('Rider Behavior', 'behavior', 2.0),
  ('Rider Behavior', 'rude', 2.0),
  ('Rider Behavior', 'polite', 2.0),
  ('Rider Behavior', 'attitude', 1.8),
  ('Rider Behavior', 'manner', 1.5),
  ('Rider Behavior', 'professional', 1.5),
  
  -- Customer Support
  ('Customer Support', 'support', 2.0),
  ('Customer Support', 'customer care', 2.0),
  ('Customer Support', 'help', 1.8),
  ('Customer Support', 'helpline', 2.0),
  ('Customer Support', 'service', 1.5),
  ('Customer Support', 'agent', 1.8),
  ('Customer Support', 'representative', 1.5),
  ('Customer Support', 'response', 1.5),
  ('Customer Support', 'resolve', 1.5),
  ('Customer Support', 'complaint', 1.8),
  ('Customer Support', 'issue', 1.3),
  
  -- Delivery
  ('Delivery', 'delivery', 2.0),
  ('Delivery', 'delivered', 2.0),
  ('Delivery', 'deliver', 2.0),
  ('Delivery', 'time', 1.5),
  ('Delivery', 'late', 1.8),
  ('Delivery', 'delayed', 1.8),
  ('Delivery', 'fast', 1.5),
  ('Delivery', 'quick', 1.5),
  ('Delivery', 'speed', 1.5),
  ('Delivery', 'eta', 1.8),
  
  -- Product Quality
  ('Product Quality', 'product', 2.0),
  ('Product Quality', 'quality', 2.0),
  ('Product Quality', 'item', 1.8),
  ('Product Quality', 'food', 1.8),
  ('Product Quality', 'fresh', 1.8),
  ('Product Quality', 'stale', 2.0),
  ('Product Quality', 'cold', 1.5),
  ('Product Quality', 'hot', 1.5),
  ('Product Quality', 'taste', 1.8),
  ('Product Quality', 'quantity', 1.8),
  ('Product Quality', 'missing', 1.8),
  ('Product Quality', 'wrong', 1.8),
  
  -- Delivery Experience
  ('Delivery Experience', 'experience', 2.0),
  ('Delivery Experience', 'packaging', 2.0),
  ('Delivery Experience', 'packed', 1.8),
  ('Delivery Experience', 'package', 1.8),
  ('Delivery Experience', 'condition', 1.5),
  ('Delivery Experience', 'damaged', 2.0),
  ('Delivery Experience', 'spilled', 2.0),
  ('Delivery Experience', 'leaked', 2.0),
  ('Delivery Experience', 'broken', 2.0),
  
  -- Cancellation
  ('Cancellation', 'cancel', 2.0),
  ('Cancellation', 'cancelled', 2.0),
  ('Cancellation', 'cancellation', 2.0),
  ('Cancellation', 'canceled', 2.0),
  
  -- Extra Charges
  ('Extra Charges', 'extra charge', 2.0),
  ('Extra Charges', 'additional charge', 2.0),
  ('Extra Charges', 'hidden charge', 2.0),
  ('Extra Charges', 'surge', 1.8),
  ('Extra Charges', 'fee', 1.5),
  ('Extra Charges', 'tax', 1.5),
  ('Extra Charges', 'tip', 1.5),
  ('Extra Charges', 'overcharged', 2.0),
  
  -- Design
  ('Design', 'app', 2.0),
  ('Design', 'ui', 2.0),
  ('Design', 'ux', 2.0),
  ('Design', 'design', 2.0),
  ('Design', 'interface', 2.0),
  ('Design', 'layout', 1.8),
  ('Design', 'navigation', 1.5),
  ('Design', 'confusing', 1.8),
  ('Design', 'bug', 1.8),
  ('Design', 'crash', 2.0),
  ('Design', 'glitch', 1.8),
  ('Design', 'update', 1.5),
  
  -- Account Blocked
  ('Account Blocked', 'account', 2.0),
  ('Account Blocked', 'blocked', 2.0),
  ('Account Blocked', 'block', 2.0),
  ('Account Blocked', 'suspended', 2.0),
  ('Account Blocked', 'suspend', 2.0),
  ('Account Blocked', 'ban', 2.0),
  ('Account Blocked', 'banned', 2.0),
  ('Account Blocked', 'locked', 2.0),
  ('Account Blocked', 'deactivated', 2.0),
  ('Account Blocked', 'login', 1.5),
  ('Account Blocked', 'access', 1.5)
ON CONFLICT DO NOTHING;

-- Seed priority keywords
INSERT INTO priority_keywords (keyword, priority_level, weight) VALUES
  -- High priority
  ('urgent', 'high', 2.0),
  ('emergency', 'high', 2.0),
  ('critical', 'high', 2.0),
  ('blocked', 'high', 2.0),
  ('suspended', 'high', 2.0),
  ('fraud', 'high', 2.0),
  ('scam', 'high', 2.0),
  ('stolen', 'high', 2.0),
  ('hack', 'high', 2.0),
  ('hacked', 'high', 2.0),
  ('refund', 'high', 1.8),
  ('money', 'high', 1.5),
  ('payment', 'high', 1.5),
  ('charged', 'high', 1.5),
  ('overcharged', 'high', 1.8),
  ('wrong charge', 'high', 2.0),
  ('account', 'high', 1.5),
  ('banned', 'high', 2.0),
  ('deactivated', 'high', 2.0),
  
  -- Medium priority
  ('late', 'medium', 1.5),
  ('delayed', 'medium', 1.5),
  ('missing', 'medium', 1.5),
  ('wrong', 'medium', 1.5),
  ('issue', 'medium', 1.3),
  ('problem', 'medium', 1.5),
  ('complaint', 'medium', 1.5),
  ('disappointed', 'medium', 1.3),
  ('unhappy', 'medium', 1.3),
  ('cold', 'medium', 1.3),
  ('broken', 'medium', 1.5),
  ('damaged', 'medium', 1.5),
  ('support', 'medium', 1.3),
  
  -- Low priority
  ('suggest', 'low', 1.5),
  ('suggestion', 'low', 1.5),
  ('recommend', 'low', 1.3),
  ('improvement', 'low', 1.5),
  ('feature', 'low', 1.5),
  ('ui', 'low', 1.3),
  ('design', 'low', 1.3),
  ('update', 'low', 1.3)
ON CONFLICT DO NOTHING;

-- Seed common stop words
INSERT INTO stop_words (word) VALUES
  ('the'), ('a'), ('an'), ('and'), ('or'), ('but'), ('in'), ('on'), ('at'),
  ('to'), ('for'), ('of'), ('with'), ('by'), ('from'), ('up'), ('about'),
  ('into'), ('through'), ('during'), ('before'), ('after'), ('above'),
  ('below'), ('between'), ('under'), ('again'), ('further'), ('then'),
  ('once'), ('here'), ('there'), ('when'), ('where'), ('why'), ('how'),
  ('all'), ('both'), ('each'), ('few'), ('more'), ('most'), ('other'),
  ('some'), ('such'), ('only'), ('own'), ('same'), ('so'), ('than'),
  ('too'), ('very'), ('can'), ('will'), ('just'), ('should'), ('now'),
  ('i'), ('me'), ('my'), ('we'), ('our'), ('you'), ('your'), ('he'), ('him'), ('his'),
  ('she'), ('her'), ('it'), ('its'), ('they'), ('them'), ('their'), ('this'), ('that'),
  ('these'), ('those'), ('am'), ('is'), ('are'), ('was'), ('were'), ('be'), ('been'),
  ('being'), ('have'), ('has'), ('had'), ('do'), ('does'), ('did'), ('doing')
ON CONFLICT DO NOTHING;

-- Create function to calculate sentiment score
CREATE OR REPLACE FUNCTION calculate_sentiment_score(review_text text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  positive_score numeric := 0;
  negative_score numeric := 0;
  result_sentiment text;
  clean_text text;
BEGIN
  -- Convert to lowercase for matching
  clean_text := lower(review_text);
  
  -- Calculate positive score
  SELECT COALESCE(SUM(weight), 0) INTO positive_score
  FROM sentiment_keywords
  WHERE sentiment = 'positive'
    AND position(word IN clean_text) > 0;
  
  -- Calculate negative score
  SELECT COALESCE(SUM(weight), 0) INTO negative_score
  FROM sentiment_keywords
  WHERE sentiment = 'negative'
    AND position(word IN clean_text) > 0;
  
  -- Determine sentiment
  IF positive_score > negative_score THEN
    result_sentiment := 'positive';
  ELSE
    result_sentiment := 'negative';
  END IF;
  
  RETURN jsonb_build_object(
    'sentiment', result_sentiment,
    'positive_score', positive_score,
    'negative_score', negative_score
  );
END;
$$;

-- Create function to identify topic
CREATE OR REPLACE FUNCTION identify_topic(review_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  topic_scores jsonb := '{}';
  top_topic text;
  max_score numeric := 0;
  current_score numeric;
  clean_text text;
  topic_record record;
BEGIN
  -- Convert to lowercase for matching
  clean_text := lower(review_text);
  
  -- Calculate score for each topic
  FOR topic_record IN 
    SELECT DISTINCT topic_name FROM topic_keywords
  LOOP
    SELECT COALESCE(SUM(weight), 0) INTO current_score
    FROM topic_keywords
    WHERE topic_name = topic_record.topic_name
      AND position(keyword IN clean_text) > 0;
    
    IF current_score > max_score THEN
      max_score := current_score;
      top_topic := topic_record.topic_name;
    END IF;
  END LOOP;
  
  -- Default to "Customer Support" if no topic found
  IF top_topic IS NULL OR max_score = 0 THEN
    top_topic := 'Customer Support';
  END IF;
  
  RETURN top_topic;
END;
$$;

-- Create function to calculate priority
CREATE OR REPLACE FUNCTION calculate_priority(review_text text, sentiment text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  priority_score numeric := 0;
  result_priority text;
  clean_text text;
BEGIN
  -- Convert to lowercase for matching
  clean_text := lower(review_text);
  
  -- Calculate priority score based on keywords
  SELECT COALESCE(SUM(
    CASE 
      WHEN priority_level = 'high' THEN weight * 3
      WHEN priority_level = 'medium' THEN weight * 2
      ELSE weight
    END
  ), 0) INTO priority_score
  FROM priority_keywords
  WHERE position(keyword IN clean_text) > 0;
  
  -- Adjust priority based on sentiment
  IF sentiment = 'negative' THEN
    priority_score := priority_score * 1.5;
  END IF;
  
  -- Determine priority level
  IF priority_score >= 5 THEN
    result_priority := 'high';
  ELSIF priority_score >= 2 THEN
    result_priority := 'medium';
  ELSE
    result_priority := 'low';
  END IF;
  
  RETURN result_priority;
END;
$$;

-- Create function to extract key phrases for summary
CREATE OR REPLACE FUNCTION extract_summary(review_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  summary_text text;
  sentences text[];
  first_sentence text;
BEGIN
  -- Split into sentences (simple approach)
  sentences := string_to_array(review_text, '.');
  
  -- Get first sentence, limit to 150 characters
  IF array_length(sentences, 1) > 0 THEN
    first_sentence := trim(sentences[1]);
    IF length(first_sentence) > 150 THEN
      summary_text := substring(first_sentence, 1, 147) || '...';
    ELSE
      summary_text := first_sentence || '.';
    END IF;
  ELSE
    -- If no sentence break, just truncate
    IF length(review_text) > 150 THEN
      summary_text := substring(review_text, 1, 147) || '...';
    ELSE
      summary_text := review_text;
    END IF;
  END IF;
  
  RETURN summary_text;
END;
$$;

-- Create main analysis function
CREATE OR REPLACE FUNCTION analyze_review_text(review_text text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  sentiment_result jsonb;
  sentiment text;
  topic text;
  priority text;
  summary text;
BEGIN
  -- Validate input
  IF review_text IS NULL OR trim(review_text) = '' THEN
    RETURN jsonb_build_object(
      'error', 'Review text is required',
      'topic', 'Customer Support',
      'sentiment', 'negative',
      'priority', 'medium',
      'summary', 'No review text provided'
    );
  END IF;
  
  -- Calculate sentiment
  sentiment_result := calculate_sentiment_score(review_text);
  sentiment := sentiment_result->>'sentiment';
  
  -- Identify topic
  topic := identify_topic(review_text);
  
  -- Calculate priority
  priority := calculate_priority(review_text, sentiment);
  
  -- Extract summary
  summary := extract_summary(review_text);
  
  -- Return results
  RETURN jsonb_build_object(
    'topic', topic,
    'sentiment', sentiment,
    'priority', priority,
    'summary', summary
  );
END;
$$;
