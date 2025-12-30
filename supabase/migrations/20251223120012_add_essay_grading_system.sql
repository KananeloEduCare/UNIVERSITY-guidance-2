/*
  # Add Essay Grading System

  1. Changes
    - Add `grade` column to `student_essays` table
      - Type: integer (1-100 scale)
      - Nullable: true (only set when essay is reviewed)
      - Default: null
    
  2. Purpose
    - Allow counselors to grade essays when marking them as reviewed
    - Track overall essay quality through numeric grades
    - Enable calculation of average essay grades for performance metrics
*/

-- Add grade column to student_essays table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_essays' AND column_name = 'grade'
  ) THEN
    ALTER TABLE student_essays ADD COLUMN grade integer CHECK (grade >= 0 AND grade <= 100);
  END IF;
END $$;

-- Update some existing essays with sample grades for demonstration
UPDATE student_essays 
SET grade = 92, status = 'reviewed'
WHERE student_name = 'James Mitchell';
