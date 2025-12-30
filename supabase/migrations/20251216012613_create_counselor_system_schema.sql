/*
  # Counselor Pool Management System

  ## Overview
  Creates comprehensive database schema for the Pool Management Counselor system,
  enabling data-driven student-to-university assignment workflows.

  ## New Tables

  ### 1. `counselors`
  Stores counselor account information
  - `id` (uuid, primary key)
  - `email` (text, unique) - Login email
  - `password_hash` (text) - Hashed password (demo: 'password123')
  - `name` (text) - Full name
  - `created_at` (timestamp)

  ### 2. `pool_students`
  Stores student data with academic metrics for pool management
  - `id` (uuid, primary key)
  - `counselor_id` (uuid, foreign key) - Assigned counselor
  - `name` (text) - Student name
  - `email` (text, unique) - Student email
  - `essay_activities_rating` (decimal 0-100) - Holistic profile strength
  - `academic_performance` (decimal 0-100) - Current overall average
  - `academic_trend` (decimal) - Net improvement percentage (can be negative)
  - `composite_score` (decimal) - Calculated ranking score
  - `status` (text) - 'active' or 'assigned'
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 3. `university_assignments`
  Tracks which universities students are assigned to
  - `id` (uuid, primary key)
  - `student_id` (uuid, foreign key)
  - `counselor_id` (uuid, foreign key)
  - `university_name` (text)
  - `university_tier` (text) - 'reach', 'mid', or 'safety'
  - `assigned_at` (timestamp)

  ### 4. `counselor_scholarships`
  Scholarship opportunities uploaded by counselors
  - `id` (uuid, primary key)
  - `counselor_id` (uuid, foreign key)
  - `name` (text) - Scholarship name
  - `logo_url` (text) - Image URL
  - `description` (text)
  - `award_amount` (text)
  - `deadline` (date)
  - `eligibility_criteria` (text)
  - `requirements` (text)
  - `application_link` (text)
  - `created_at` (timestamp)

  ### 5. `counselor_resources`
  Educational resources uploaded by counselors
  - `id` (uuid, primary key)
  - `counselor_id` (uuid, foreign key)
  - `resource_type` (text) - 'video', 'article', 'guide', 'other'
  - `title` (text)
  - `creator` (text) - Author/creator name
  - `key_topics` (text[]) - Array of tags
  - `time_estimate` (text) - Time to read/watch
  - `link` (text)
  - `category` (text) - 'essays', 'financial_aid', 'applications', 'interviews', 'general'
  - `created_at` (timestamp)

  ## Security
  - Enable RLS on all tables
  - Counselors can only access their own students and data
  - Separate policies for each operation type
*/

-- Create counselors table
CREATE TABLE IF NOT EXISTS counselors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create pool_students table
CREATE TABLE IF NOT EXISTS pool_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id uuid REFERENCES counselors(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  essay_activities_rating decimal(5,2) NOT NULL CHECK (essay_activities_rating >= 0 AND essay_activities_rating <= 100),
  academic_performance decimal(5,2) NOT NULL CHECK (academic_performance >= 0 AND academic_performance <= 100),
  academic_trend decimal(6,2) NOT NULL,
  composite_score decimal(6,2) NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'assigned')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create university_assignments table
CREATE TABLE IF NOT EXISTS university_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES pool_students(id) ON DELETE CASCADE,
  counselor_id uuid REFERENCES counselors(id) ON DELETE CASCADE,
  university_name text NOT NULL,
  university_tier text NOT NULL CHECK (university_tier IN ('reach', 'mid', 'safety')),
  assigned_at timestamptz DEFAULT now()
);

-- Create counselor_scholarships table
CREATE TABLE IF NOT EXISTS counselor_scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id uuid REFERENCES counselors(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  description text NOT NULL,
  award_amount text NOT NULL,
  deadline date NOT NULL,
  eligibility_criteria text NOT NULL,
  requirements text NOT NULL,
  application_link text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create counselor_resources table
CREATE TABLE IF NOT EXISTS counselor_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id uuid REFERENCES counselors(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('video', 'article', 'guide', 'other')),
  title text NOT NULL,
  creator text NOT NULL,
  key_topics text[] NOT NULL,
  time_estimate text NOT NULL,
  link text NOT NULL,
  category text NOT NULL CHECK (category IN ('essays', 'financial_aid', 'applications', 'interviews', 'general')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_resources ENABLE ROW LEVEL SECURITY;

-- Counselors policies: Public can read for login, counselors manage their own data
CREATE POLICY "Public can read counselors for login"
  ON counselors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can read own counselor data"
  ON counselors FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Pool students policies: Counselors can manage their assigned students
CREATE POLICY "Counselors can view their students"
  ON pool_students FOR SELECT
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can insert their students"
  ON pool_students FOR INSERT
  TO authenticated
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can update their students"
  ON pool_students FOR UPDATE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text)
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can delete their students"
  ON pool_students FOR DELETE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

-- University assignments policies
CREATE POLICY "Counselors can view their assignments"
  ON university_assignments FOR SELECT
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can create assignments"
  ON university_assignments FOR INSERT
  TO authenticated
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can update their assignments"
  ON university_assignments FOR UPDATE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text)
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can delete their assignments"
  ON university_assignments FOR DELETE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

-- Scholarships policies
CREATE POLICY "Counselors can view their scholarships"
  ON counselor_scholarships FOR SELECT
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can create scholarships"
  ON counselor_scholarships FOR INSERT
  TO authenticated
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can update their scholarships"
  ON counselor_scholarships FOR UPDATE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text)
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can delete their scholarships"
  ON counselor_scholarships FOR DELETE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

-- Resources policies
CREATE POLICY "Counselors can view their resources"
  ON counselor_resources FOR SELECT
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can create resources"
  ON counselor_resources FOR INSERT
  TO authenticated
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can update their resources"
  ON counselor_resources FOR UPDATE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text)
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can delete their resources"
  ON counselor_resources FOR DELETE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

-- Insert demo counselor (password: 'password123')
INSERT INTO counselors (email, password_hash, name)
VALUES ('counselor@educare.com', 'demo_hash_password123', 'Sarah Johnson')
ON CONFLICT (email) DO NOTHING;

-- Insert demo students for the counselor
INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Alex Thompson',
  'alex.thompson@student.com',
  85.00,
  92.00,
  6.00,
  91.00,
  'active'
FROM counselors c WHERE c.email = 'counselor@educare.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Maya Patel',
  'maya.patel@student.com',
  92.00,
  88.00,
  8.50,
  89.50,
  'active'
FROM counselors c WHERE c.email = 'counselor@educare.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Jordan Lee',
  'jordan.lee@student.com',
  78.00,
  85.00,
  3.00,
  82.00,
  'active'
FROM counselors c WHERE c.email = 'counselor@educare.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Emma Wilson',
  'emma.wilson@student.com',
  95.00,
  94.00,
  5.00,
  94.67,
  'active'
FROM counselors c WHERE c.email = 'counselor@educare.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Carlos Rodriguez',
  'carlos.rodriguez@student.com',
  70.00,
  75.00,
  -2.00,
  71.00,
  'active'
FROM counselors c WHERE c.email = 'counselor@educare.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Sophie Chen',
  'sophie.chen@student.com',
  88.00,
  90.00,
  7.00,
  88.33,
  'active'
FROM counselors c WHERE c.email = 'counselor@educare.com'
ON CONFLICT (email) DO NOTHING;