/*
  # Fix RLS Policies for Reviews List Table
  
  The "Reviews List" table has RLS enabled but no policies allowing
  anon/authenticated users to read data. This migration adds the necessary
  policies to allow frontend access.
*/

-- Add policy to allow anon users to read all reviews
CREATE POLICY IF NOT EXISTS "Allow anon users to read Reviews List"
  ON "Reviews List"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add policy to allow service role full access
CREATE POLICY IF NOT EXISTS "Service role can manage Reviews List"
  ON "Reviews List"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add policy to allow anon/authenticated users to update resolution status
CREATE POLICY IF NOT EXISTS "Allow users to update review status"
  ON "Reviews List"
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE "Reviews List" IS 'Main reviews table with RLS policies allowing read access to all users';
