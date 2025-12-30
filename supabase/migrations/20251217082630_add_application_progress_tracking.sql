/*
  # Application Progress Tracking System

  ## Overview
  Adds comprehensive application tracking for students assigned to universities,
  enabling counselors to monitor progress, deadlines, and manage application workflows.

  ## New Tables

  ### 1. `application_progress`
  Tracks detailed progress for each university assignment
  - `id` (uuid, primary key)
  - `assignment_id` (uuid, foreign key) - Links to university_assignments
  - `student_id` (uuid, foreign key) - Links to pool_students
  - `counselor_id` (uuid, foreign key) - Links to counselors
  - `status` (text) - 'not_started', 'in_progress', 'submitted', 'accepted', 'rejected', 'deferred', 'waitlisted'
  - `application_deadline` (date) - When application is due
  - `decision_date` (date) - When decision is expected/received
  - `notes` (text) - Counselor notes and comments
  - `documents_needed` (text[]) - Array of required documents
  - `documents_completed` (text[]) - Array of completed documents
  - `essay_status` (text) - 'not_started', 'draft', 'review', 'final'
  - `recommendation_letters` (integer) - Number of letters submitted
  - `recommendation_letters_needed` (integer) - Number of letters required
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ## Security
  - Enable RLS on application_progress table
  - Counselors can only access progress for their assigned students
  - Policies for select, insert, update, delete operations

  ## Important Notes
  - One progress record per university assignment
  - Automatically create progress record when assignment is made
  - Track multiple status dimensions: overall status, essay status, documents, recommendations
*/

-- Create application_progress table
CREATE TABLE IF NOT EXISTS application_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES university_assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES pool_students(id) ON DELETE CASCADE,
  counselor_id uuid REFERENCES counselors(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'accepted', 'rejected', 'deferred', 'waitlisted')),
  application_deadline date,
  decision_date date,
  notes text DEFAULT '',
  documents_needed text[] DEFAULT '{}',
  documents_completed text[] DEFAULT '{}',
  essay_status text NOT NULL DEFAULT 'not_started' CHECK (essay_status IN ('not_started', 'draft', 'review', 'final')),
  recommendation_letters integer DEFAULT 0 CHECK (recommendation_letters >= 0),
  recommendation_letters_needed integer DEFAULT 2 CHECK (recommendation_letters_needed >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE application_progress ENABLE ROW LEVEL SECURITY;

-- Application progress policies
CREATE POLICY "Counselors can view their students' progress"
  ON application_progress FOR SELECT
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can create progress records"
  ON application_progress FOR INSERT
  TO authenticated
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can update their students' progress"
  ON application_progress FOR UPDATE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text)
  WITH CHECK (counselor_id::text = auth.uid()::text);

CREATE POLICY "Counselors can delete progress records"
  ON application_progress FOR DELETE
  TO authenticated
  USING (counselor_id::text = auth.uid()::text);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_application_progress_student_id ON application_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_application_progress_assignment_id ON application_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_application_progress_counselor_id ON application_progress(counselor_id);