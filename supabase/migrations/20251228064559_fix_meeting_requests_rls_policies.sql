/*
  # Fix Meeting Requests and Counselor Availability RLS Policies

  ## Overview
  Updates RLS policies to use auth.uid() instead of current_user for proper authentication.
  This fixes the 400 Bad Request errors when counselors try to access meeting requests.

  ## Changes
  1. Drop existing policies that use current_user
  2. Create new policies using auth.uid()::text matching
  3. Applies to both counselor_availability and meeting_requests tables

  ## Security
  - Maintains data isolation between counselors
  - Ensures counselors can only access their own data
  - Uses authenticated role for all policies
*/

-- Drop existing counselor_availability policies
DROP POLICY IF EXISTS "Counselors can view their own availability" ON counselor_availability;
DROP POLICY IF EXISTS "Counselors can insert their own availability" ON counselor_availability;
DROP POLICY IF EXISTS "Counselors can update their own availability" ON counselor_availability;
DROP POLICY IF EXISTS "Counselors can delete their own availability" ON counselor_availability;
DROP POLICY IF EXISTS "Students can view their counselor availability" ON counselor_availability;

-- Drop existing meeting_requests policies
DROP POLICY IF EXISTS "Students can view their own meeting requests" ON meeting_requests;
DROP POLICY IF EXISTS "Students can create meeting requests" ON meeting_requests;
DROP POLICY IF EXISTS "Counselors can view requests from their students" ON meeting_requests;
DROP POLICY IF EXISTS "Counselors can update requests from their students" ON meeting_requests;

-- Create new counselor_availability policies using auth.uid()
CREATE POLICY "Counselors can view their own availability"
  ON counselor_availability FOR SELECT
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can insert their own availability"
  ON counselor_availability FOR INSERT
  TO authenticated
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can update their own availability"
  ON counselor_availability FOR UPDATE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text)
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can delete their own availability"
  ON counselor_availability FOR DELETE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

-- Create new meeting_requests policies using auth.uid()
CREATE POLICY "Counselors can view requests from their students"
  ON meeting_requests FOR SELECT
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can update requests from their students"
  ON meeting_requests FOR UPDATE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text)
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can insert meeting requests"
  ON meeting_requests FOR INSERT
  TO authenticated
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can delete meeting requests"
  ON meeting_requests FOR DELETE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);
