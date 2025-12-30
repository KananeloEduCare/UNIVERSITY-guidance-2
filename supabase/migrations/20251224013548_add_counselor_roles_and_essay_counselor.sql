/*
  # Add Counselor Roles and New Essay Counselor

  ## Changes
  
  1. Schema Updates
    - Add `role` column to `counselors` table with two possible values:
      - 'pool_management': For counselors managing student pools, applications, and academic tracking
      - 'essay': For counselors focused on essay review and feedback
  
  2. Data Updates
    - Update Sarah Johnson (kananelobutielliot@gmail.com) to 'pool_management' role
    - Add new essay counselor Chinazom Onubogu (Chinazomonubogu@gmail.com)
  
  ## Security
    - Maintains existing RLS policies
*/

-- Add role column to counselors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'counselors' AND column_name = 'role'
  ) THEN
    ALTER TABLE counselors 
    ADD COLUMN role text NOT NULL DEFAULT 'pool_management'
    CHECK (role IN ('pool_management', 'essay'));
  END IF;
END $$;

-- Update Sarah Johnson to pool_management role
UPDATE counselors
SET role = 'pool_management'
WHERE email = 'kananelobutielliot@gmail.com';

-- Add new essay counselor (Chinazom Onubogu)
INSERT INTO counselors (email, password_hash, name, role)
VALUES (
  'Chinazomonubogu@gmail.com',
  '$2a$10$8EqYytjQZ7lKdFLx6N/sHOmXjzJnV0sH0YqN5X5z5N5z5N5z5N5z5',
  'Chinazom Onubogu',
  'essay'
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;