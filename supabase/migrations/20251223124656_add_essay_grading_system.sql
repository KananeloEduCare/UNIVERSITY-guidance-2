/*
  # Add Essay Grading System

  1. Changes
    - Add `total_points` column to `student_essays` table (maximum points possible for the rubric)
    - Add `score` column to `student_essays` table (actual score achieved)
    - Remove the existing `grade` column as we're replacing it with a more flexible system
    - These fields allow counselors to grade essays based on custom rubrics (e.g., 85/100, 42/50, etc.)
  
  2. Security
    - No RLS changes needed (uses existing policies)
*/

-- Add grading columns to student_essays table
DO $$
BEGIN
  -- Drop the old grade column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_essays' AND column_name = 'grade'
  ) THEN
    ALTER TABLE student_essays DROP COLUMN grade;
  END IF;

  -- Add total_points column (maximum points possible)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_essays' AND column_name = 'total_points'
  ) THEN
    ALTER TABLE student_essays ADD COLUMN total_points integer DEFAULT NULL;
  END IF;

  -- Add score column (actual score achieved)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_essays' AND column_name = 'score'
  ) THEN
    ALTER TABLE student_essays ADD COLUMN score numeric(5, 2) DEFAULT NULL;
  END IF;
END $$;

-- Add check constraint to ensure score doesn't exceed total_points
ALTER TABLE student_essays
DROP CONSTRAINT IF EXISTS check_score_valid;

ALTER TABLE student_essays
ADD CONSTRAINT check_score_valid
CHECK (score IS NULL OR total_points IS NULL OR score <= total_points);