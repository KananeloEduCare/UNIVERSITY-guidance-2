/*
  # Create Meeting Request System

  1. New Tables
    - `counselor_availability`
      - `id` (uuid, primary key)
      - `counselor_id` (uuid, references counselors)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `is_booked` (boolean, default false)
      - `created_at` (timestamp)
      
    - `meeting_requests`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references pool_students)
      - `counselor_id` (uuid, references counselors)
      - `availability_id` (uuid, references counselor_availability, nullable)
      - `agenda` (text)
      - `status` (text: pending, accepted, rejected)
      - `rejection_reason` (text, nullable)
      - `requested_date` (date)
      - `requested_time` (time)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Counselors can manage their own availability
    - Students can create meeting requests
    - Counselors can view and update requests from their assigned students
    - Students can view their own requests
*/

-- Create counselor_availability table
CREATE TABLE IF NOT EXISTS counselor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id uuid REFERENCES counselors(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_booked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create meeting_requests table
CREATE TABLE IF NOT EXISTS meeting_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES pool_students(id) ON DELETE CASCADE NOT NULL,
  counselor_id uuid REFERENCES counselors(id) ON DELETE CASCADE NOT NULL,
  availability_id uuid REFERENCES counselor_availability(id) ON DELETE SET NULL,
  agenda text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  rejection_reason text,
  requested_date date NOT NULL,
  requested_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE counselor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_requests ENABLE ROW LEVEL SECURITY;

-- Counselor availability policies
CREATE POLICY "Counselors can view their own availability"
  ON counselor_availability FOR SELECT
  TO authenticated
  USING (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = current_user
    )
  );

CREATE POLICY "Counselors can insert their own availability"
  ON counselor_availability FOR INSERT
  TO authenticated
  WITH CHECK (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = current_user
    )
  );

CREATE POLICY "Counselors can update their own availability"
  ON counselor_availability FOR UPDATE
  TO authenticated
  USING (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = current_user
    )
  )
  WITH CHECK (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = current_user
    )
  );

CREATE POLICY "Counselors can delete their own availability"
  ON counselor_availability FOR DELETE
  TO authenticated
  USING (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = current_user
    )
  );

CREATE POLICY "Students can view their counselor availability"
  ON counselor_availability FOR SELECT
  TO authenticated
  USING (
    counselor_id IN (
      SELECT counselor_id FROM pool_students 
      WHERE email = current_user AND counselor_id IS NOT NULL
    )
  );

-- Meeting requests policies
CREATE POLICY "Students can view their own meeting requests"
  ON meeting_requests FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM pool_students WHERE email = current_user
    )
  );

CREATE POLICY "Students can create meeting requests"
  ON meeting_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT id FROM pool_students WHERE email = current_user
    )
  );

CREATE POLICY "Counselors can view requests from their students"
  ON meeting_requests FOR SELECT
  TO authenticated
  USING (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = current_user
    )
  );

CREATE POLICY "Counselors can update requests from their students"
  ON meeting_requests FOR UPDATE
  TO authenticated
  USING (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = current_user
    )
  )
  WITH CHECK (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = current_user
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_counselor_availability_counselor_date 
  ON counselor_availability(counselor_id, date);

CREATE INDEX IF NOT EXISTS idx_meeting_requests_student 
  ON meeting_requests(student_id);

CREATE INDEX IF NOT EXISTS idx_meeting_requests_counselor 
  ON meeting_requests(counselor_id);

CREATE INDEX IF NOT EXISTS idx_meeting_requests_status 
  ON meeting_requests(status);

-- Insert sample availability for demo counselor
INSERT INTO counselor_availability (counselor_id, date, start_time, end_time, is_booked)
SELECT 
  id,
  CURRENT_DATE + interval '1 day',
  '09:00:00'::time,
  '10:00:00'::time,
  false
FROM counselors WHERE email = 'demo@counselor.com'
UNION ALL
SELECT 
  id,
  CURRENT_DATE + interval '1 day',
  '10:00:00'::time,
  '11:00:00'::time,
  false
FROM counselors WHERE email = 'demo@counselor.com'
UNION ALL
SELECT 
  id,
  CURRENT_DATE + interval '1 day',
  '14:00:00'::time,
  '15:00:00'::time,
  false
FROM counselors WHERE email = 'demo@counselor.com'
UNION ALL
SELECT 
  id,
  CURRENT_DATE + interval '2 days',
  '09:00:00'::time,
  '10:00:00'::time,
  false
FROM counselors WHERE email = 'demo@counselor.com'
UNION ALL
SELECT 
  id,
  CURRENT_DATE + interval '2 days',
  '11:00:00'::time,
  '12:00:00'::time,
  false
FROM counselors WHERE email = 'demo@counselor.com'
UNION ALL
SELECT 
  id,
  CURRENT_DATE + interval '3 days',
  '13:00:00'::time,
  '14:00:00'::time,
  false
FROM counselors WHERE email = 'demo@counselor.com'
UNION ALL
SELECT 
  id,
  CURRENT_DATE + interval '3 days',
  '15:00:00'::time,
  '16:00:00'::time,
  false
FROM counselors WHERE email = 'demo@counselor.com';

-- Insert sample meeting requests
INSERT INTO meeting_requests (student_id, counselor_id, agenda, status, requested_date, requested_time)
SELECT 
  ps.id,
  c.id,
  'I would like to discuss my college essay for Stanford. I have completed the first draft and need feedback on the narrative structure and overall impact.',
  'pending',
  CURRENT_DATE + interval '1 day',
  '09:00:00'::time
FROM pool_students ps, counselors c
WHERE c.email = 'demo@counselor.com' AND ps.counselor_id = c.id
LIMIT 1;

INSERT INTO meeting_requests (student_id, counselor_id, agenda, status, requested_date, requested_time)
SELECT 
  ps.id,
  c.id,
  'Need help with finalizing my university list. Want to review my reach, target, and safety schools based on my current profile.',
  'accepted',
  CURRENT_DATE + interval '2 days',
  '11:00:00'::time
FROM pool_students ps, counselors c
WHERE c.email = 'demo@counselor.com' AND ps.counselor_id = c.id
LIMIT 1 OFFSET 1;

INSERT INTO meeting_requests (student_id, counselor_id, agenda, status, requested_date, requested_time, rejection_reason)
SELECT 
  ps.id,
  c.id,
  'Questions about recommendation letters - who should I ask and when should I request them?',
  'rejected',
  CURRENT_DATE - interval '1 day',
  '14:00:00'::time,
  'The requested time slot was already booked. Please select an available time from my calendar.'
FROM pool_students ps, counselors c
WHERE c.email = 'demo@counselor.com' AND ps.counselor_id = c.id
LIMIT 1 OFFSET 2;