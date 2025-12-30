/*
  # Add Description Field to Counselor Resources

  ## Changes
  - Adds `description` column to `counselor_resources` table
    - Type: text
    - Not null (required field)
    - Default empty string for existing records
  
  ## Purpose
  Enables counselors to provide detailed descriptions for educational resources,
  matching the Firebase structure for resource data.
*/

-- Add description column to counselor_resources
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'counselor_resources' AND column_name = 'description'
  ) THEN
    ALTER TABLE counselor_resources ADD COLUMN description text NOT NULL DEFAULT '';
  END IF;
END $$;
