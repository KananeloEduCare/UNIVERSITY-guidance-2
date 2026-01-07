/*
  # Create Essay Rubric System

  1. New Tables
    - `essay_rubrics`
      - `id` (uuid, primary key)
      - `counselor_id` (uuid, references counselors)
      - `name` (text) - rubric criterion name (e.g., "Clarity", "Structure")
      - `description` (text) - detailed description of the criterion
      - `sort_order` (integer) - order in which rubric items appear
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `essay_rubrics` table
    - Add policies for counselors to manage their own rubrics
    - Add policies for counselors to view their rubric items
*/

-- Create essay rubrics table
CREATE TABLE IF NOT EXISTS essay_rubrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id uuid NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE essay_rubrics ENABLE ROW LEVEL SECURITY;

-- Policies for counselors to manage their own rubrics
CREATE POLICY "Counselors can view own rubrics"
  ON essay_rubrics
  FOR SELECT
  TO authenticated
  USING (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Counselors can insert own rubrics"
  ON essay_rubrics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Counselors can update own rubrics"
  ON essay_rubrics
  FOR UPDATE
  TO authenticated
  USING (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Counselors can delete own rubrics"
  ON essay_rubrics
  FOR DELETE
  TO authenticated
  USING (
    counselor_id IN (
      SELECT id FROM counselors WHERE email = auth.jwt()->>'email'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_essay_rubrics_counselor_id ON essay_rubrics(counselor_id);
CREATE INDEX IF NOT EXISTS idx_essay_rubrics_sort_order ON essay_rubrics(counselor_id, sort_order);
