/*
  # Seed Initial Data for VoC Dashboard

  1. Feedback Sources
  2. Topics
  3. Sample Customers
  4. Sample Reviews
  5. Sample Alerts
  6. Sample Notifications
*/

INSERT INTO feedback_sources (name, description) VALUES
  ('playstore', 'Google Play Store Reviews'),
  ('nps', 'Net Promoter Score Surveys'),
  ('freshdesk', 'Freshdesk Support Tickets'),
  ('whatsapp', 'WhatsApp Customer Messages'),
  ('social', 'Social Media Mentions')
ON CONFLICT (name) DO NOTHING;

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

INSERT INTO customers (email, name, region, state) VALUES
  ('customer1@example.com', 'Amit Kumar', 'Mumbai', 'Maharashtra'),
  ('customer2@example.com', 'Priya Singh', 'Bangalore', 'Karnataka'),
  ('customer3@example.com', 'Rajesh Patel', 'Mumbai West', 'Maharashtra'),
  ('customer4@example.com', 'Neha Verma', 'Delhi', 'Delhi'),
  ('customer5@example.com', 'Deepak Sharma', 'Chennai', 'Tamil Nadu');

INSERT INTO reviews (customer_id, source_id, sentiment, summary, full_text, priority_score, resolution_status, state, region) VALUES
  (
    (SELECT id FROM customers WHERE email = 'customer1@example.com'),
    (SELECT id FROM feedback_sources WHERE name = 'whatsapp'),
    'negative',
    'Order delayed by 3 days without proper notification',
    'My order was supposed to arrive on Monday but it came on Thursday. When I contacted customer support, they were not helpful at all and kept giving me generic responses. Very disappointed with the service.',
    5,
    'unresolved',
    'Maharashtra',
    'Mumbai'
  ),
  (
    (SELECT id FROM customers WHERE email = 'customer2@example.com'),
    (SELECT id FROM feedback_sources WHERE name = 'playstore'),
    'positive',
    'Great app with good deals and easy navigation',
    'Love the app! Great deals and very easy to navigate. The prices are competitive and the checkout process is smooth.',
    1,
    'resolved',
    'Karnataka',
    'Bangalore'
  ),
  (
    (SELECT id FROM customers WHERE email = 'customer3@example.com'),
    (SELECT id FROM feedback_sources WHERE name = 'freshdesk'),
    'neutral',
    'Product received damaged but replacement process was smooth',
    'The product I received was damaged. The packaging was intact but the item inside was broken. I would like a refund or replacement.',
    3,
    'in_progress',
    'Maharashtra',
    'Mumbai West'
  ),
  (
    (SELECT id FROM customers WHERE email = 'customer4@example.com'),
    (SELECT id FROM feedback_sources WHERE name = 'nps'),
    'negative',
    'Payment was deducted but order was not placed',
    'My payment of Rs. 2,500 was deducted from my account but the order was not placed. It has been 3 days and I have not received my refund yet. This is unacceptable.',
    5,
    'unresolved',
    'Delhi',
    'Delhi'
  ),
  (
    (SELECT id FROM customers WHERE email = 'customer5@example.com'),
    (SELECT id FROM feedback_sources WHERE name = 'playstore'),
    'neutral',
    'App crashes frequently on Android 13',
    'The app keeps crashing on my Samsung phone running Android 13. It happens when I try to view product details. Good product selection though.',
    3,
    'in_progress',
    'Tamil Nadu',
    'Chennai'
  );

INSERT INTO review_topics (review_id, topic_id) VALUES
  ((SELECT id FROM reviews LIMIT 1 OFFSET 0), (SELECT id FROM topics WHERE name = 'Delivery Issues')),
  ((SELECT id FROM reviews LIMIT 1 OFFSET 0), (SELECT id FROM topics WHERE name = 'Customer Support')),
  ((SELECT id FROM reviews LIMIT 1 OFFSET 1), (SELECT id FROM topics WHERE name = 'User Interface')),
  ((SELECT id FROM reviews LIMIT 1 OFFSET 2), (SELECT id FROM topics WHERE name = 'Product Quality')),
  ((SELECT id FROM reviews LIMIT 1 OFFSET 3), (SELECT id FROM topics WHERE name = 'Payment Problems')),
  ((SELECT id FROM reviews LIMIT 1 OFFSET 4), (SELECT id FROM topics WHERE name = 'App Performance'));

INSERT INTO alerts (type, title, description, priority, source_id, topic_id, region) VALUES
  (
    'escalation',
    'Payment failure spike in Maharashtra',
    '47 users reported payment deduction without order confirmation in the last 3 hours',
    5,
    (SELECT id FROM feedback_sources WHERE name = 'whatsapp'),
    (SELECT id FROM topics WHERE name = 'Payment Problems'),
    'Mumbai'
  ),
  (
    'spike',
    'Delivery complaints increased by 67%',
    'Mumbai West region showing significant spike in delivery delay complaints',
    5,
    (SELECT id FROM feedback_sources WHERE name = 'playstore'),
    (SELECT id FROM topics WHERE name = 'Delivery Issues'),
    'Mumbai West'
  ),
  (
    'anomaly',
    'App rating dropped unexpectedly',
    'Play Store rating dropped from 4.2 to 2.8 stars in the last 24 hours',
    4,
    (SELECT id FROM feedback_sources WHERE name = 'playstore'),
    (SELECT id FROM topics WHERE name = 'App Performance'),
    'National'
  );

INSERT INTO notifications (type, title, description, priority, is_read) VALUES
  (
    'escalation',
    'Payment failure spike in Karnataka',
    '47 users reported payment deduction without order confirmation in the last 3 hours',
    5,
    false
  ),
  (
    'spike',
    'Delivery complaints increased by 67%',
    'Mumbai West region showing significant spike in delivery delay complaints',
    5,
    false
  ),
  (
    'anomaly',
    'Sudden drop in app ratings',
    'Play Store rating dropped from 4.2 to 2.8 stars in the last 24 hours',
    4,
    true
  ),
  (
    'escalation',
    'Product quality issues - Electronics',
    '23 complaints about defective electronics received in the last week',
    4,
    true
  ),
  (
    'spike',
    'Customer support wait time spike',
    'Average response time increased to 45 minutes, up from 12 minutes',
    3,
    true
  );
