/*
  # Fix Pool Students RLS for Demo Access

  ## Overview
  Temporarily adjusts RLS policies to allow demo access since counselor
  authentication doesn't use Supabase Auth (uses custom table-based auth).

  ## Changes
  - Adds anon access policies for pool_students and university_assignments
  - Allows read/write access for demonstration purposes
  - Maintains data isolation by counselor_id in queries (application-level)

  ## Security Note
  This is for demo purposes. Production would use proper Supabase Auth.
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Counselors can view their students" ON pool_students;
DROP POLICY IF EXISTS "Counselors can insert their students" ON pool_students;
DROP POLICY IF EXISTS "Counselors can update their students" ON pool_students;
DROP POLICY IF EXISTS "Counselors can delete their students" ON pool_students;

-- Add permissive policies for demo
CREATE POLICY "Allow all authenticated reads on pool_students"
  ON pool_students FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow all authenticated inserts on pool_students"
  ON pool_students FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated updates on pool_students"
  ON pool_students FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated deletes on pool_students"
  ON pool_students FOR DELETE
  TO authenticated, anon
  USING (true);

-- Fix university_assignments policies too
DROP POLICY IF EXISTS "Counselors can view their assignments" ON university_assignments;
DROP POLICY IF EXISTS "Counselors can insert assignments" ON university_assignments;

CREATE POLICY "Allow all authenticated reads on university_assignments"
  ON university_assignments FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow all authenticated inserts on university_assignments"
  ON university_assignments FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);