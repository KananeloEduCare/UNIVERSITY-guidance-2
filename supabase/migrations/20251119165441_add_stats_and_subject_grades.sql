/*
  # Add Overall Stats and Subject Grades

  ## Overview
  This migration adds fields for overall academic statistics and detailed subject grades
  with curriculum information for each student's admission story.

  ## Changes to Existing Tables
  
  ### `admission_stories`
  Added columns:
  - `overall_gpa` (decimal) - Overall/cumulative GPA
  - `sat_score` (integer, nullable) - SAT score if applicable
  - `act_score` (integer, nullable) - ACT score if applicable
  
  ## New Tables
  
  ### `subject_grades`
  Stores individual subject grades with curriculum information
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `story_id` (uuid, foreign key) - References admission_stories(id)
  - `subject_name` (text) - Name of the subject (e.g., "Physics")
  - `curriculum` (text) - Curriculum type (e.g., "A Level", "IB", "AP")
  - `grade` (text) - Grade received (e.g., "A*", "A", "5", "7")
  - `created_at` (timestamptz) - When the record was created
  
  ## Security
  - Enable RLS on subject_grades table
  - Allow public read access to subject grades
  
  ## Notes
  - SAT and ACT scores are optional as not all international students take these
  - Subject grades are stored separately for better organization and display
  - Curriculum field allows for different grading systems (A Level, IB, AP, etc.)
*/

-- Add new columns to admission_stories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admission_stories' AND column_name = 'overall_gpa'
  ) THEN
    ALTER TABLE admission_stories ADD COLUMN overall_gpa decimal(3,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admission_stories' AND column_name = 'sat_score'
  ) THEN
    ALTER TABLE admission_stories ADD COLUMN sat_score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admission_stories' AND column_name = 'act_score'
  ) THEN
    ALTER TABLE admission_stories ADD COLUMN act_score integer;
  END IF;
END $$;

-- Create subject_grades table
CREATE TABLE IF NOT EXISTS subject_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES admission_stories(id) ON DELETE CASCADE,
  subject_name text NOT NULL,
  curriculum text NOT NULL,
  grade text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subject_grades ENABLE ROW LEVEL SECURITY;

-- Public can read subject grades
CREATE POLICY "Anyone can view subject grades"
  ON subject_grades
  FOR SELECT
  TO public
  USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_subject_grades_story_id ON subject_grades(story_id);

-- Update sample data for Kananelo
UPDATE admission_stories
SET 
  overall_gpa = 3.8,
  sat_score = 1450
WHERE name = 'Kananelo Buti';

-- Insert sample subject grades for Kananelo
INSERT INTO subject_grades (story_id, subject_name, curriculum, grade)
SELECT 
  id,
  unnest(ARRAY['Mathematics', 'Physics', 'Computer Science', 'English', 'Chemistry']) as subject_name,
  unnest(ARRAY['A Level', 'A Level', 'A Level', 'A Level', 'A Level']) as curriculum,
  unnest(ARRAY['A*', 'A*', 'A', 'A', 'B']) as grade
FROM admission_stories
WHERE name = 'Kananelo Buti'
ON CONFLICT DO NOTHING;