/*
  # Fix All RLS Policies for Frontend Access
  
  Ensure all tables have proper RLS policies to allow anon/authenticated
  users to read data through the frontend.
*/

-- Reviews List policies (main table)
DROP POLICY IF EXISTS "Allow anon users to read Reviews List" ON "Reviews List";
CREATE POLICY "Allow anon users to read Reviews List"
  ON "Reviews List"
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role can manage Reviews List" ON "Reviews List";
CREATE POLICY "Service role can manage Reviews List"
  ON "Reviews List"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update review status" ON "Reviews List";
CREATE POLICY "Allow users to update review status"
  ON "Reviews List"
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Topics policies
DROP POLICY IF EXISTS "Allow anon users to read topics" ON topics;
CREATE POLICY "Allow anon users to read topics"
  ON topics
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role can manage topics" ON topics;
CREATE POLICY "Service role can manage topics"
  ON topics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Notifications policies
DROP POLICY IF EXISTS "Allow anon users to read notifications" ON notifications;
CREATE POLICY "Allow anon users to read notifications"
  ON notifications
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow users to update notifications" ON notifications;
CREATE POLICY "Allow users to update notifications"
  ON notifications
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage notifications" ON notifications;
CREATE POLICY "Service role can manage notifications"
  ON notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
