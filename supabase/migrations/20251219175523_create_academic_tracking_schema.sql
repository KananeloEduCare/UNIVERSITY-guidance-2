/*
  # Create Academic Tracking Schema

  1. New Tables
    - `student_courses`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references pool_students)
      - `course_name` (text)
      - `course_code` (text)
      - `current_grade` (numeric) - current average in the course
      - `syllabus_completion` (numeric) - percentage of syllabus completed
      - `total_assignments` (integer)
      - `completed_assignments` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `student_courses` table
    - Add policies for counselors to view courses of their assigned students and pool students

  3. Sample Data
    - Add sample academic data for existing pool students
*/

-- Create student_courses table
CREATE TABLE IF NOT EXISTS student_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES pool_students(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  course_code text NOT NULL,
  current_grade numeric(5,2) NOT NULL DEFAULT 0,
  syllabus_completion numeric(5,2) NOT NULL DEFAULT 0,
  total_assignments integer NOT NULL DEFAULT 0,
  completed_assignments integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;

-- Policies for counselors to view courses
CREATE POLICY "Counselors can view courses of pool students"
  ON student_courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM counselors
      WHERE counselors.id = auth.uid()
    )
  );

CREATE POLICY "Counselors can insert courses for pool students"
  ON student_courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM counselors
      WHERE counselors.id = auth.uid()
    )
  );

CREATE POLICY "Counselors can update courses"
  ON student_courses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM counselors
      WHERE counselors.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM counselors
      WHERE counselors.id = auth.uid()
    )
  );

-- Insert sample academic data for pool students
DO $$
DECLARE
  student_record RECORD;
  courses TEXT[] := ARRAY['Mathematics HL', 'Physics HL', 'Chemistry HL', 'English A: Literature SL', 'Spanish B SL', 'Economics SL'];
  course_codes TEXT[] := ARRAY['MATH-HL', 'PHYS-HL', 'CHEM-HL', 'ENG-SL', 'SPAN-SL', 'ECON-SL'];
  i INTEGER;
BEGIN
  FOR student_record IN SELECT id FROM pool_students LOOP
    FOR i IN 1..6 LOOP
      INSERT INTO student_courses (
        student_id,
        course_name,
        course_code,
        current_grade,
        syllabus_completion,
        total_assignments,
        completed_assignments
      ) VALUES (
        student_record.id,
        courses[i],
        course_codes[i],
        (85 + (random() * 10))::numeric(5,2),
        (60 + (random() * 35))::numeric(5,2),
        (10 + floor(random() * 10))::integer,
        (5 + floor(random() * 10))::integer
      );
    END LOOP;
  END LOOP;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);