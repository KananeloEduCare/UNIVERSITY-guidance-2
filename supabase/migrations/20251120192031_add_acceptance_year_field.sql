/*
  # Add Acceptance Year Field

  ## Overview
  Adds the acceptance year field to track when students were accepted to their universities.

  ## Changes to Existing Tables
  
  ### `admit_profiles`
  Added column:
  - `acceptance_year` (integer) - Year the student was accepted (e.g., 2023)
  
  ## Notes
  - This field will be displayed on cards as "Accepted [Round] [Year]"
  - Updates sample data with acceptance year
*/

-- Add acceptance_year column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admit_profiles' AND column_name = 'acceptance_year'
  ) THEN
    ALTER TABLE admit_profiles ADD COLUMN acceptance_year integer;
  END IF;
END $$;

-- Update sample data with acceptance year
UPDATE admit_profiles
SET acceptance_year = 2023
WHERE acceptance_year IS NULL;