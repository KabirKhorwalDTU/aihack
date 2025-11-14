/*
  # Add Teams Table and Comprehensive Sample Notification Data
  
  ## Overview
  Creates a teams table for agent-based routing and adds comprehensive sample
  notification data demonstrating intelligent agent routing, escalation chains,
  and uncertainty handling.
  
  ## Changes
  
  ### 1. Create Teams Table
  - `id` (uuid, primary key)
  - `name` (text, unique) - Team name
  - `description` (text) - Team purpose and responsibilities
  - `specialization` (text[]) - Areas of expertise
  - `priority_threshold` (integer) - Minimum priority this team handles
  - `is_active` (boolean) - Whether team is currently active
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. Enhance Notifications Table
  - `assigned_team_id` (uuid) - Primary team assigned by agent
  - `secondary_team_ids` (uuid[]) - Additional teams for escalation or uncertainty
  - `agent_confidence` (numeric) - Agent confidence score (0-1)
  - `agent_reasoning` (text) - Why agent chose this team routing
  - `escalation_level` (integer) - Current escalation stage (0 = initial, 1+ = escalated)
  - `escalated_from` (uuid) - Reference to previous notification in chain
  - `requires_human_review` (boolean) - Flag for uncertain cases
  
  ### 3. Create Topic-Team Mapping Table
  - Links topics to primary and secondary teams
  - Enables intelligent routing based on review topics
  
  ### 4. Insert Teams Data
  - Technical Engineering Team
  - Payment Operations Team
  - Logistics and Delivery Team
  - Customer Experience Team
  - Product Quality Assurance Team
  
  ### 5. Insert Comprehensive Sample Notifications
  - Standard alerts with confident single-team routing
  - Escalation chain examples showing multi-stage alerts
  - Agent uncertainty cases requiring human review
  - Various severity levels, time periods, and statuses
  - Realistic business scenarios across all domains
  
  ## Security
  - Enable RLS on teams table
  - Add policies for authenticated users to read teams
  - Maintain existing notification RLS policies
*/

-- Step 1: Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  specialization text[] DEFAULT '{}',
  priority_threshold integer DEFAULT 3,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: Enhance notifications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'assigned_team_id'
  ) THEN
    ALTER TABLE notifications 
      ADD COLUMN assigned_team_id uuid REFERENCES teams(id),
      ADD COLUMN secondary_team_ids uuid[] DEFAULT '{}',
      ADD COLUMN agent_confidence numeric(3,2) CHECK (agent_confidence >= 0 AND agent_confidence <= 1),
      ADD COLUMN agent_reasoning text,
      ADD COLUMN escalation_level integer DEFAULT 0,
      ADD COLUMN escalated_from uuid REFERENCES notifications(id),
      ADD COLUMN requires_human_review boolean DEFAULT false;
  END IF;
END $$;

-- Step 3: Create topic-team mapping table
CREATE TABLE IF NOT EXISTS topic_team_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(topic_id, team_id)
);

-- Step 4: Enable RLS on new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_team_mappings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for teams
CREATE POLICY "Anyone can read teams"
  ON teams FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read topic team mappings"
  ON topic_team_mappings FOR SELECT
  TO public
  USING (true);

-- Step 6: Insert teams data
INSERT INTO teams (name, description, specialization, priority_threshold) VALUES
  (
    'Technical Engineering Team',
    'Handles app crashes, performance issues, bugs, and technical infrastructure problems',
    ARRAY['app performance', 'crashes', 'bugs', 'technical issues', 'infrastructure'],
    3
  ),
  (
    'Payment Operations Team',
    'Manages payment failures, refunds, transaction issues, and payment gateway problems',
    ARRAY['payment failures', 'refunds', 'transactions', 'payment gateway', 'billing'],
    4
  ),
  (
    'Logistics and Delivery Team',
    'Oversees delivery delays, shipping issues, tracking problems, and logistics operations',
    ARRAY['delivery delays', 'shipping', 'tracking', 'logistics', 'warehousing'],
    3
  ),
  (
    'Customer Experience Team',
    'Addresses customer support issues, response times, service quality, and user satisfaction',
    ARRAY['customer support', 'response time', 'service quality', 'user experience', 'satisfaction'],
    2
  ),
  (
    'Product Quality Assurance Team',
    'Manages product defects, quality concerns, recalls, and product-related complaints',
    ARRAY['product defects', 'quality issues', 'recalls', 'manufacturing', 'product integrity'],
    3
  )
ON CONFLICT (name) DO NOTHING;

-- Step 7: Create topic-team mappings
INSERT INTO topic_team_mappings (topic_id, team_id, is_primary)
SELECT t.id, tm.id, true
FROM topics t, teams tm
WHERE (t.name = 'App Performance' AND tm.name = 'Technical Engineering Team')
   OR (t.name = 'Payment Problems' AND tm.name = 'Payment Operations Team')
   OR (t.name = 'Delivery Issues' AND tm.name = 'Logistics and Delivery Team')
   OR (t.name = 'Customer Support' AND tm.name = 'Customer Experience Team')
   OR (t.name = 'Product Quality' AND tm.name = 'Product Quality Assurance Team')
   OR (t.name = 'User Interface' AND tm.name = 'Technical Engineering Team')
   OR (t.name = 'Pricing' AND tm.name = 'Customer Experience Team')
   OR (t.name = 'Product Availability' AND tm.name = 'Logistics and Delivery Team')
ON CONFLICT (topic_id, team_id) DO NOTHING;

-- Step 8: Insert comprehensive sample notification data
INSERT INTO notifications (
  type, title, description, priority, is_read, is_snoozed,
  alert_type, metric_name, threshold_value, actual_value,
  assigned_team_id, agent_confidence, agent_reasoning,
  escalation_level, requires_human_review, created_at
) VALUES
  -- High confidence, single team assignments (Recent critical alerts)
  (
    'alert',
    'Critical Payment Gateway Failure',
    'Payment gateway experiencing 94% failure rate. 127 transactions failed in last 15 minutes. Agent has alerted Payment Operations Team due to severity 5 payment infrastructure issue requiring immediate intervention.',
    5,
    false,
    false,
    'spike',
    'payment_failure_rate',
    10.0,
    94.0,
    (SELECT id FROM teams WHERE name = 'Payment Operations Team'),
    0.98,
    'High severity payment issue affecting large user base. Clear payment infrastructure problem requiring Payment Operations Team immediate response.',
    0,
    false,
    now() - interval '25 minutes'
  ),
  (
    'alert',
    'App Crash Spike on Android 14',
    'App crash rate increased 340% on Android 14 devices. 89 crash reports received in last hour. Agent has alerted Technical Engineering Team due to critical technical stability issue.',
    5,
    false,
    false,
    'spike',
    'crash_rate_android14',
    5.0,
    22.0,
    (SELECT id FROM teams WHERE name = 'Technical Engineering Team'),
    0.95,
    'Clear technical infrastructure issue with specific Android version. Technical Engineering Team has expertise in app stability and crash resolution.',
    0,
    false,
    now() - interval '45 minutes'
  ),
  (
    'alert',
    'Delivery Delays Surge in Mumbai Metropolitan Region',
    'Delivery delays increased by 215% in Mumbai metro area. 156 complaints received about delayed orders in last 3 hours. Agent has alerted Logistics and Delivery Team.',
    4,
    false,
    false,
    'spike',
    'delivery_delay_rate',
    15.0,
    47.0,
    (SELECT id FROM teams WHERE name = 'Logistics and Delivery Team'),
    0.92,
    'High volume delivery issue concentrated in specific geographic region. Logistics and Delivery Team handles regional delivery operations.',
    0,
    false,
    now() - interval '2 hours'
  ),
  (
    'alert',
    'Customer Support Response Time Exceeded SLA',
    'Average support response time reached 67 minutes, significantly above 15-minute SLA. 234 customers waiting in queue. Agent has alerted Customer Experience Team.',
    4,
    false,
    false,
    'anomaly',
    'support_response_time_minutes',
    15.0,
    67.0,
    (SELECT id FROM teams WHERE name = 'Customer Experience Team'),
    0.96,
    'Customer service quality metric exceeded threshold. Customer Experience Team responsible for support operations and SLA compliance.',
    0,
    false,
    now() - interval '1 hour'
  ),
  (
    'alert',
    'Product Defect Reports Trending Up - Electronics Category',
    'Electronics category showing 45% increase in defect reports over last 7 days. 78 complaints about malfunctioning devices. Agent has alerted Product Quality Assurance Team.',
    3,
    true,
    false,
    'trend',
    'defect_report_rate',
    10.0,
    14.5,
    (SELECT id FROM teams WHERE name = 'Product Quality Assurance Team'),
    0.89,
    'Product quality issue trending upward in specific category. Quality Assurance Team handles defect analysis and supplier quality management.',
    0,
    false,
    now() - interval '4 hours'
  ),
  
  -- Escalation chain examples
  (
    'alert',
    'Payment Fraud Pattern Detected - ESCALATED',
    'Initial payment failure investigation revealed potential fraud pattern. 23 transactions from similar IPs with stolen cards. Originally assigned to Payment Ops, now escalated to Technical Engineering Team for security analysis.',
    5,
    false,
    false,
    'anomaly',
    'fraud_pattern_score',
    0.7,
    0.92,
    (SELECT id FROM teams WHERE name = 'Technical Engineering Team'),
    0.91,
    'Escalation from Payment Operations Team. Fraud pattern requires technical security analysis and potential system hardening.',
    1,
    false,
    now() - interval '3 hours'
  ),
  (
    'alert',
    'Statewide Delivery Crisis - Maharashtra',
    'Delivery delays now affecting entire Maharashtra state. 450+ complaints. Originally regional logistics issue, now escalated to Customer Experience Team for customer communication strategy.',
    5,
    false,
    false,
    'spike',
    'delivery_delay_statewide',
    50.0,
    450.0,
    (SELECT id FROM teams WHERE name = 'Customer Experience Team'),
    0.88,
    'Escalation from Logistics Team. Issue scale requires customer communication and retention strategy beyond logistics operations.',
    2,
    false,
    now() - interval '6 hours'
  ),
  (
    'alert',
    'App Performance Degradation Affecting Checkout',
    'Checkout flow showing 8-second load times causing 34% cart abandonment. Technical issue impacting payment conversion. Agent has alerted both Technical Engineering Team and Payment Operations Team.',
    5,
    false,
    false,
    'anomaly',
    'checkout_load_time_seconds',
    2.0,
    8.0,
    (SELECT id FROM teams WHERE name = 'Technical Engineering Team'),
    0.85,
    'Cross-functional issue: Technical performance problem impacting payment revenue. Technical Team primary, Payment Ops secondary for business impact.',
    0,
    false,
    now() - interval '90 minutes'
  ),
  
  -- Agent uncertainty cases requiring human review
  (
    'alert',
    'Unusual Pattern: Payment Success But Delivery Failure Loop',
    'Detected 67 cases where payment processed successfully but orders immediately marked as undeliverable. Issue spans payment AND logistics domains. Agent confidence low - requires human team assignment.',
    4,
    false,
    false,
    'anomaly',
    'payment_delivery_loop',
    5.0,
    67.0,
    NULL,
    0.62,
    'UNCERTAIN: Issue involves both payment processing and logistics systems. Could be payment gateway integration issue, inventory sync problem, or logistics system bug. Recommending both Payment Operations Team and Logistics and Delivery Team review.',
    0,
    true,
    now() - interval '5 hours'
  ),
  (
    'alert',
    'Multi-Domain Issue: UI Bug Causing Payment Failures',
    'Users reporting app UI freezes during payment flow, leading to transaction timeouts. Technical UI issue or payment gateway problem? Agent suggests Technical Engineering Team and Payment Operations Team joint review.',
    4,
    false,
    false,
    'spike',
    'ui_payment_failure_correlation',
    10.0,
    43.0,
    NULL,
    0.58,
    'UNCERTAIN: 43 incidents showing UI freezes correlated with payment failures. Root cause unclear - could be frontend rendering bug, payment API timeout, or network connectivity issue. Suggesting Technical Engineering Team (68% confidence) and Payment Operations Team (45% confidence) collaboration.',
    0,
    true,
    now() - interval '3 hours'
  ),
  (
    'alert',
    'Customer Complaints About Product Quality AND Delivery',
    'Receiving complaints that suggest both product damage during shipping and inherent quality issues. 34 reports mention "arrived damaged" but quality also questioned. Requires Product Quality Assurance Team and Logistics Team investigation.',
    3,
    true,
    false,
    'trend',
    'quality_logistics_overlap',
    8.0,
    34.0,
    NULL,
    0.55,
    'UNCERTAIN: Cannot definitively determine if products damaged during shipping or arrived with existing defects. Ambiguous customer descriptions. Recommend joint investigation by Product Quality Assurance Team and Logistics and Delivery Team.',
    0,
    true,
    now() - interval '8 hours'
  ),
  
  -- Additional realistic scenarios with varied timing
  (
    'alert',
    'Refund Processing Delays Spiking',
    'Refund processing time increased from 3 days to 12 days average. 156 customers complaining. Agent has alerted Payment Operations Team for refund workflow investigation.',
    4,
    true,
    false,
    'anomaly',
    'refund_processing_days',
    5.0,
    12.0,
    (SELECT id FROM teams WHERE name = 'Payment Operations Team'),
    0.93,
    'Payment operations issue related to refund processing workflows. Payment Operations Team manages refund systems and processing.',
    0,
    false,
    now() - interval '1 day'
  ),
  (
    'alert',
    'App Rating Drop in Play Store',
    'Play Store rating dropped from 4.3 to 3.1 stars over 48 hours. 234 new 1-star reviews mentioning app issues. Agent has alerted Technical Engineering Team and Customer Experience Team.',
    5,
    false,
    false,
    'anomaly',
    'playstore_rating',
    4.0,
    3.1,
    (SELECT id FROM teams WHERE name = 'Technical Engineering Team'),
    0.78,
    'Significant rating drop suggests technical issues but also requires customer sentiment analysis. Technical Team primary for app fixes, Customer Experience Team secondary for reputation management.',
    0,
    false,
    now() - interval '18 hours'
  ),
  (
    'alert',
    'Same-Day Delivery Promise Not Being Met',
    'Same-day delivery feature showing 67% on-time rate vs promised 95%. Customer complaints increasing. Agent has alerted Logistics and Delivery Team.',
    4,
    true,
    false,
    'trend',
    'same_day_delivery_success_rate',
    95.0,
    67.0,
    (SELECT id FROM teams WHERE name = 'Logistics and Delivery Team'),
    0.94,
    'Logistics operational issue with same-day delivery SLA. Logistics and Delivery Team responsible for delivery commitments and operations.',
    0,
    false,
    now() - interval '2 days'
  ),
  (
    'alert',
    'Product Availability Sync Issues',
    'Out-of-stock products showing as available, leading to order cancellations. 89 angry customers. Inventory system sync problem. Agent has alerted Technical Engineering Team.',
    4,
    true,
    false,
    'spike',
    'inventory_sync_failures',
    10.0,
    89.0,
    (SELECT id FROM teams WHERE name = 'Technical Engineering Team'),
    0.91,
    'Technical infrastructure issue with inventory synchronization system. Technical Engineering Team handles system integrations and data sync.',
    0,
    false,
    now() - interval '3 days'
  ),
  (
    'alert',
    'iOS App Memory Leak Detected',
    'iOS version showing progressive memory consumption leading to crashes after 15 minutes of use. 45 crash reports. Agent has alerted Technical Engineering Team.',
    3,
    true,
    false,
    'anomaly',
    'ios_memory_usage_mb',
    500.0,
    1850.0,
    (SELECT id FROM teams WHERE name = 'Technical Engineering Team'),
    0.97,
    'Clear technical issue: memory leak in iOS application causing stability problems. Technical Engineering Team has mobile development expertise.',
    0,
    false,
    now() - interval '5 days'
  ),
  (
    'alert',
    'Customer Support Satisfaction Score Declining',
    'CSAT score dropped from 87% to 64% over last 2 weeks. Exit survey comments mention unhelpful responses. Agent has alerted Customer Experience Team.',
    3,
    true,
    false,
    'trend',
    'customer_satisfaction_score',
    80.0,
    64.0,
    (SELECT id FROM teams WHERE name = 'Customer Experience Team'),
    0.95,
    'Customer service quality metric trending downward. Customer Experience Team responsible for support quality and agent training.',
    0,
    false,
    now() - interval '1 day'
  ),
  (
    'alert',
    'Bulk Order Processing Failures',
    'B2B bulk order system failing for orders over 100 items. 12 enterprise customers affected. Agent has alerted Technical Engineering Team.',
    5,
    false,
    true,
    'spike',
    'bulk_order_failure_rate',
    2.0,
    12.0,
    (SELECT id FROM teams WHERE name = 'Technical Engineering Team'),
    0.89,
    'Technical system limitation or bug affecting enterprise customers. High business impact. Technical Engineering Team handles system architecture and scaling.',
    0,
    false,
    now() - interval '6 hours'
  ),
  (
    'alert',
    'Packaging Quality Issues Leading to Damage',
    'Increased reports of products arriving damaged due to inadequate packaging. 56 complaints. Agent has alerted Product Quality Assurance Team and Logistics and Delivery Team.',
    3,
    true,
    false,
    'trend',
    'packaging_damage_rate',
    5.0,
    14.0,
    (SELECT id FROM teams WHERE name = 'Product Quality Assurance Team'),
    0.72,
    'Issue spans packaging standards (Quality) and shipping handling (Logistics). Primary assignment to Quality for packaging specs, secondary to Logistics for handling review.',
    0,
    false,
    now() - interval '4 days'
  ),
  (
    'alert',
    'Search Functionality Returning Incorrect Results',
    'Product search returning irrelevant results. 78 complaints. Search quality degraded. Agent has alerted Technical Engineering Team.',
    3,
    true,
    false,
    'anomaly',
    'search_relevance_score',
    85.0,
    62.0,
    (SELECT id FROM teams WHERE name = 'Technical Engineering Team'),
    0.93,
    'Technical issue with search algorithm or index. Technical Engineering Team maintains search infrastructure and algorithms.',
    0,
    false,
    now() - interval '2 days'
  ),
  (
    'system',
    'Weekly Review Analysis Complete',
    'Processed 12,450 reviews this week. Top issues: delivery delays (23%), payment problems (18%), app performance (15%). Comprehensive report available.',
    2,
    true,
    false,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'System-generated weekly summary notification.',
    0,
    false,
    now() - interval '6 days'
  );

-- Step 9: Update secondary team assignments for cross-functional issues
UPDATE notifications 
SET secondary_team_ids = ARRAY[
  (SELECT id FROM teams WHERE name = 'Payment Operations Team')
]
WHERE title = 'App Performance Degradation Affecting Checkout';

UPDATE notifications 
SET secondary_team_ids = ARRAY[
  (SELECT id FROM teams WHERE name = 'Customer Experience Team')
]
WHERE title = 'App Rating Drop in Play Store';

UPDATE notifications 
SET secondary_team_ids = ARRAY[
  (SELECT id FROM teams WHERE name = 'Payment Operations Team'),
  (SELECT id FROM teams WHERE name = 'Logistics and Delivery Team')
]
WHERE title = 'Unusual Pattern: Payment Success But Delivery Failure Loop';

UPDATE notifications 
SET secondary_team_ids = ARRAY[
  (SELECT id FROM teams WHERE name = 'Technical Engineering Team'),
  (SELECT id FROM teams WHERE name = 'Payment Operations Team')
]
WHERE title = 'Multi-Domain Issue: UI Bug Causing Payment Failures';

UPDATE notifications 
SET secondary_team_ids = ARRAY[
  (SELECT id FROM teams WHERE name = 'Product Quality Assurance Team'),
  (SELECT id FROM teams WHERE name = 'Logistics and Delivery Team')
]
WHERE title = 'Customer Complaints About Product Quality AND Delivery';

UPDATE notifications 
SET secondary_team_ids = ARRAY[
  (SELECT id FROM teams WHERE name = 'Logistics and Delivery Team')
]
WHERE title = 'Packaging Quality Issues Leading to Damage';

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_assigned_team ON notifications(assigned_team_id);
CREATE INDEX IF NOT EXISTS idx_notifications_requires_review ON notifications(requires_human_review) WHERE requires_human_review = true;
CREATE INDEX IF NOT EXISTS idx_notifications_escalation_level ON notifications(escalation_level);
CREATE INDEX IF NOT EXISTS idx_topic_team_mappings_topic ON topic_team_mappings(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_team_mappings_team ON topic_team_mappings(team_id);

COMMENT ON TABLE teams IS 'Teams that can be assigned to handle notifications and alerts. Used for intelligent agent-based routing.';
COMMENT ON TABLE topic_team_mappings IS 'Maps topics to teams for automatic routing of notifications based on review topics.';
COMMENT ON COLUMN notifications.assigned_team_id IS 'Primary team assigned by agent to handle this notification.';
COMMENT ON COLUMN notifications.agent_confidence IS 'Agent confidence score (0-1) in team assignment decision.';
COMMENT ON COLUMN notifications.agent_reasoning IS 'Explanation of why agent chose this team routing.';
COMMENT ON COLUMN notifications.requires_human_review IS 'Flag indicating agent uncertainty requiring human team assignment.';
COMMENT ON COLUMN notifications.escalation_level IS 'Number of times this notification has been escalated (0 = initial).';
