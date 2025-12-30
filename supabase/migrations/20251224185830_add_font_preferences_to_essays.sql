/*
  # Add Font Preferences to Student Essays

  1. Changes
    - Add `font_family` column to `student_essays` table
      - Stores the selected font family (e.g., 'Arial', 'Times New Roman')
      - Default value: 'Arial'
    - Add `font_size` column to `student_essays` table
      - Stores the selected font size in points (e.g., 12, 14, 16)
      - Default value: 14
  
  2. Purpose
    - Allow students to customize their essay's font style and size
    - Persist font preferences per essay
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_essays' AND column_name = 'font_family'
  ) THEN
    ALTER TABLE student_essays ADD COLUMN font_family text DEFAULT 'Arial';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_essays' AND column_name = 'font_size'
  ) THEN
    ALTER TABLE student_essays ADD COLUMN font_size integer DEFAULT 14;
  END IF;
END $$;