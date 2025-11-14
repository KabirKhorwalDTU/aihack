# URGENT FIX: Row Level Security (RLS) Issue

## Problem
Your database has **983,400 reviews** but the frontend shows **0** because Row Level Security (RLS) policies are blocking the `anon` role from reading data.

## Solution
Run this SQL in Supabase Dashboard > SQL Editor:

### Option 1: Quick Fix (Copy-Paste This)
```sql
-- Allow anon users to read Reviews List
CREATE POLICY IF NOT EXISTS "Allow anon users to read Reviews List"
  ON "Reviews List"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anon users to update review status
CREATE POLICY IF NOT EXISTS "Allow users to update review status"
  ON "Reviews List"
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon users to read topics
DROP POLICY IF EXISTS "Authenticated users can read topics" ON topics;
CREATE POLICY "Allow anon users to read topics"
  ON topics
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anon users to read notifications
CREATE POLICY IF NOT EXISTS "Allow anon users to read notifications"
  ON notifications
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anon users to update notifications
CREATE POLICY IF NOT EXISTS "Allow users to update notifications"
  ON notifications
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
```

### Option 2: Run Migration File
Go to Supabase Dashboard and run:
`supabase/migrations/20251114151100_fix_all_rls_policies.sql`

## Steps
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
5. Paste the SQL from Option 1 above
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. Refresh your frontend - should now show 983K pending reviews!

## Why This Happened
- The "Reviews List" table has RLS enabled
- But there were no policies allowing the `anon` role to SELECT data
- So your frontend (using anon key) couldn't read anything
- Even though the data exists in the database

## After Fix
Your dashboard will show:
- ✅ Pending Reviews: ~983,000
- ✅ States dropdown populated with actual states (UTTAR PRADESH, RAJASTHAN, WEST BENGAL, etc.)
- ✅ All charts and filters working
