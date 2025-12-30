/*
  # Rename Admission Stories to Admit Profiles

  ## Overview
  This migration renames the feature from "Admission Stories" to "Admit Profiles"
  to better reflect that these are historical application profiles from students
  who have already been admitted to universities.

  ## Changes
  
  ### Table Renames
  - `admission_stories` → `admit_profiles`
  - `gpa_history` → `high_school_gpa_history` (for clarity that this is pre-university data)
  
  ### New Fields
  - `age_at_application` (integer) - Clarifies this was their age when applying
  - `admitted_label` (text) - Label to show on cards (default: "Admitted Student")
  
  ## Important Notes
  - All existing data is preserved
  - Foreign key relationships are maintained
  - Indexes are recreated on new table names
  - RLS policies are recreated with same permissions
  
  ## Migration Strategy
  This is a non-destructive rename operation using ALTER TABLE to maintain data integrity
*/

-- Rename admission_stories to admit_profiles
ALTER TABLE IF EXISTS admission_stories RENAME TO admit_profiles;

-- Rename gpa_history to high_school_gpa_history for clarity
ALTER TABLE IF EXISTS gpa_history RENAME TO high_school_gpa_history;

-- Add new fields to admit_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admit_profiles' AND column_name = 'age_at_application'
  ) THEN
    ALTER TABLE admit_profiles ADD COLUMN age_at_application integer;
    -- Copy existing age values to age_at_application
    UPDATE admit_profiles SET age_at_application = age WHERE age_at_application IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admit_profiles' AND column_name = 'admitted_label'
  ) THEN
    ALTER TABLE admit_profiles ADD COLUMN admitted_label text DEFAULT 'Admitted Student';
  END IF;
END $$;

-- Update foreign key constraint in subject_grades to reference new table name
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'subject_grades_story_id_fkey'
  ) THEN
    ALTER TABLE subject_grades DROP CONSTRAINT subject_grades_story_id_fkey;
  END IF;
  
  -- Add new constraint with updated reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'subject_grades_profile_id_fkey'
  ) THEN
    ALTER TABLE subject_grades 
    ADD CONSTRAINT subject_grades_profile_id_fkey 
    FOREIGN KEY (story_id) 
    REFERENCES admit_profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Update foreign key constraint in high_school_gpa_history
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'gpa_history_story_id_fkey'
  ) THEN
    ALTER TABLE high_school_gpa_history DROP CONSTRAINT gpa_history_story_id_fkey;
  END IF;
  
  -- Add new constraint with updated reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'high_school_gpa_history_profile_id_fkey'
  ) THEN
    ALTER TABLE high_school_gpa_history 
    ADD CONSTRAINT high_school_gpa_history_profile_id_fkey 
    FOREIGN KEY (story_id) 
    REFERENCES admit_profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Recreate indexes with new names
DROP INDEX IF EXISTS idx_subject_grades_story_id;
CREATE INDEX IF NOT EXISTS idx_subject_grades_profile_id ON subject_grades(story_id);

DROP INDEX IF EXISTS idx_gpa_history_story_id;
CREATE INDEX IF NOT EXISTS idx_high_school_gpa_history_profile_id ON high_school_gpa_history(story_id);