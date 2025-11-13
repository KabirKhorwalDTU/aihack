/*
  # Merge Alerts and Notifications into Single Table

  ## Overview
  Consolidates alerts and notifications into one unified table since they
  serve the same purpose - notifying users about important events.

  ## Changes

  ### 1. Enhance notifications table
  Add columns from alerts:
  - `alert_type` (spike/anomaly/trend)
  - `metric_name` (what metric triggered it)
  - `threshold_value` (the threshold that was crossed)
  - `actual_value` (the actual value observed)
  
  ### 2. Unify structure
  - Keep flexible JSONB `metadata` for any additional context
  - `type` field covers all notification types (alert, review, system, etc.)
  - `severity` covers urgency (critical, high, medium, low)

  ### 3. Drop alerts table
  All functionality consolidated into notifications

  ## Notes
  - Single table for all user-facing notifications and system alerts
  - More maintainable and simpler to query
*/

-- Step 1: Add alert-specific columns to notifications
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS alert_type TEXT CHECK (alert_type IN ('spike', 'anomaly', 'trend')),
  ADD COLUMN IF NOT EXISTS metric_name TEXT,
  ADD COLUMN IF NOT EXISTS threshold_value NUMERIC,
  ADD COLUMN IF NOT EXISTS actual_value NUMERIC;

-- Update type constraint to include alert types
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('alert', 'review', 'system', 'mention', 'update'));

-- Add comment explaining the unified structure
COMMENT ON TABLE notifications IS 'Unified table for all notifications including system alerts, review mentions, and user updates. Alert-specific fields (alert_type, metric_name, threshold_value, actual_value) are populated when type = ''alert''.';

-- Step 2: Drop the alerts table
DROP TABLE IF EXISTS alerts CASCADE;
