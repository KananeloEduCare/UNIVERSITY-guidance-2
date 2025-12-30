/*
  # Add Graduation Year Field

  ## Overview
  Adds the graduation year field to show the graduating class (e.g., Class of 2028).

  ## Changes to Existing Tables
  
  ### `admit_profiles`
  Added column:
  - `graduation_year` (integer) - Expected graduation year (e.g., 2028 for "Class of 2028")
  
  ## Notes
  - This field will be displayed as "Class of [Year]" in the profile header
  - Updates sample data with graduation year (acceptance_year + 4 for undergraduate programs)
*/

-- Add graduation_year column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admit_profiles' AND column_name = 'graduation_year'
  ) THEN
    ALTER TABLE admit_profiles ADD COLUMN graduation_year integer;
  END IF;
END $$;

-- Update sample data with graduation year (acceptance year + 4 for most programs)
UPDATE admit_profiles
SET graduation_year = acceptance_year + 4
WHERE graduation_year IS NULL AND acceptance_year IS NOT NULL;