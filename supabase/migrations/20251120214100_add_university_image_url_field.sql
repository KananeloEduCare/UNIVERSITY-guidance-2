/*
  # Add University Image URL Field

  ## Overview
  Adds a field to store university-specific background images for admit profiles.

  ## Changes to Existing Tables
  
  ### `admit_profiles`
  New column:
  - `university_image_url` (text) - URL to university campus/building image for profile background
  
  ## Notes
  - This field will be used to display university-specific images instead of generic gradients
  - Images should showcase the university campus or iconic buildings
  - Optional field - will fall back to gradient if not provided
*/

-- Add university_image_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admit_profiles' AND column_name = 'university_image_url'
  ) THEN
    ALTER TABLE admit_profiles ADD COLUMN university_image_url text;
  END IF;
END $$;