/*
  # Rename GPA to Overall Percentage

  ## Overview
  Renames the overall_gpa field to overall_percentage to better represent aggregate grade percentages.

  ## Changes to Existing Tables
  
  ### `admit_profiles`
  Modified column:
  - Renamed `overall_gpa` to `overall_percentage` (numeric) - Overall grade percentage (e.g., 80 for 80%)
  
  ## Notes
  - This field now represents the percentage form of grades (e.g., 80% = A grade)
  - All existing data is preserved during the rename
*/

-- Rename overall_gpa column to overall_percentage
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admit_profiles' AND column_name = 'overall_gpa'
  ) THEN
    ALTER TABLE admit_profiles RENAME COLUMN overall_gpa TO overall_percentage;
  END IF;
END $$;