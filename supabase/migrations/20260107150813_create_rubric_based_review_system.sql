/*
  # Create Rubric-Based Essay Review System

  ## Overview
  Complete redesign of essay review system using structured rubrics instead of inline comments.
  Replaces text highlighting and inline comments with criterion-based feedback.

  ## New Tables

  ### 1. `rubrics`
  Stores counselor-created rubrics
  - `id` (uuid, primary key)
  - `counselor_id` (text) - references counselors.id
  - `name` (text) - rubric name
  - `description` (text, nullable) - optional rubric description
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `rubric_criteria`
  Stores individual criteria within each rubric
  - `id` (uuid, primary key)
  - `rubric_id` (uuid) - references rubrics.id
  - `name` (text) - criterion name (e.g., "Clarity")
  - `description` (text, nullable) - what counselor looks for
  - `position` (integer) - display order
  - `created_at` (timestamptz)

  ### 3. `essay_reviews`
  Links an essay to a rubric and stores overall feedback
  - `id` (uuid, primary key)
  - `student_name` (text) - student identifier
  - `essay_title` (text) - essay identifier
  - `rubric_id` (uuid) - references rubrics.id
  - `counselor_id` (text) - counselor who reviewed
  - `overall_assessment` (text, nullable) - overall feedback
  - `revision_priorities` (text[], nullable) - top 2-3 priorities
  - `status` (text) - 'in_progress' | 'completed'
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)

  ### 4. `criterion_feedback`
  Stores per-criterion scores and explanations
  - `id` (uuid, primary key)
  - `review_id` (uuid) - references essay_reviews.id
  - `criterion_id` (uuid) - references rubric_criteria.id
  - `score` (integer) - 1 to 5
  - `score_explanation` (text) - why this score
  - `improvement_guidance` (text) - how to improve
  - `reference_section` (text, nullable) - 'entire_essay' | 'introduction' | 'conclusion' | 'paragraph_X'
  - `status` (text) - 'not_reviewed' | 'in_progress' | 'completed'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Counselors can only manage their own rubrics
  - Counselors can only create reviews for their assigned students
  - Students can only view their own feedback (read-only)

  ## Important Notes
  - No text ranges, highlights, or inline comments
  - Feedback is stable regardless of essay text changes
  - Same data model powers both counselor and student views
*/

-- Create rubrics table
CREATE TABLE IF NOT EXISTS rubrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can view own rubrics"
  ON rubrics FOR SELECT
  TO authenticated
  USING (counselor_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Counselors can create own rubrics"
  ON rubrics FOR INSERT
  TO authenticated
  WITH CHECK (counselor_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Counselors can update own rubrics"
  ON rubrics FOR UPDATE
  TO authenticated
  USING (counselor_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (counselor_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Counselors can delete own rubrics"
  ON rubrics FOR DELETE
  TO authenticated
  USING (counselor_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create rubric_criteria table
CREATE TABLE IF NOT EXISTS rubric_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id uuid NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rubric_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can view criteria of own rubrics"
  ON rubric_criteria FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.counselor_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Counselors can create criteria in own rubrics"
  ON rubric_criteria FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.counselor_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Counselors can update criteria in own rubrics"
  ON rubric_criteria FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.counselor_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.counselor_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Counselors can delete criteria in own rubrics"
  ON rubric_criteria FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.counselor_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Create essay_reviews table
CREATE TABLE IF NOT EXISTS essay_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  essay_title text NOT NULL,
  rubric_id uuid NOT NULL REFERENCES rubrics(id) ON DELETE RESTRICT,
  counselor_id text NOT NULL,
  overall_assessment text,
  revision_priorities text[],
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(student_name, essay_title)
);

ALTER TABLE essay_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can view reviews they created"
  ON essay_reviews FOR SELECT
  TO authenticated
  USING (counselor_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Counselors can create reviews"
  ON essay_reviews FOR INSERT
  TO authenticated
  WITH CHECK (counselor_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Counselors can update their reviews"
  ON essay_reviews FOR UPDATE
  TO authenticated
  USING (counselor_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (counselor_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Counselors can delete their reviews"
  ON essay_reviews FOR DELETE
  TO authenticated
  USING (counselor_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create criterion_feedback table
CREATE TABLE IF NOT EXISTS criterion_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES essay_reviews(id) ON DELETE CASCADE,
  criterion_id uuid NOT NULL REFERENCES rubric_criteria(id) ON DELETE RESTRICT,
  score integer CHECK (score >= 1 AND score <= 5),
  score_explanation text,
  improvement_guidance text,
  reference_section text,
  status text NOT NULL DEFAULT 'not_reviewed' CHECK (status IN ('not_reviewed', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(review_id, criterion_id)
);

ALTER TABLE criterion_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can view feedback in their reviews"
  ON criterion_feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM essay_reviews
      WHERE essay_reviews.id = criterion_feedback.review_id
      AND essay_reviews.counselor_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Counselors can create feedback in their reviews"
  ON criterion_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM essay_reviews
      WHERE essay_reviews.id = criterion_feedback.review_id
      AND essay_reviews.counselor_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Counselors can update feedback in their reviews"
  ON criterion_feedback FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM essay_reviews
      WHERE essay_reviews.id = criterion_feedback.review_id
      AND essay_reviews.counselor_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM essay_reviews
      WHERE essay_reviews.id = criterion_feedback.review_id
      AND essay_reviews.counselor_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Counselors can delete feedback in their reviews"
  ON criterion_feedback FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM essay_reviews
      WHERE essay_reviews.id = criterion_feedback.review_id
      AND essay_reviews.counselor_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rubrics_counselor_id ON rubrics(counselor_id);
CREATE INDEX IF NOT EXISTS idx_rubric_criteria_rubric_id ON rubric_criteria(rubric_id);
CREATE INDEX IF NOT EXISTS idx_rubric_criteria_position ON rubric_criteria(rubric_id, position);
CREATE INDEX IF NOT EXISTS idx_essay_reviews_student ON essay_reviews(student_name, essay_title);
CREATE INDEX IF NOT EXISTS idx_essay_reviews_counselor ON essay_reviews(counselor_id);
CREATE INDEX IF NOT EXISTS idx_criterion_feedback_review ON criterion_feedback(review_id);

-- Insert sample rubrics for demo counselor
INSERT INTO rubrics (counselor_id, name, description) VALUES
  ('demo-counselor-id', 'College Essay Rubric', 'Comprehensive rubric for evaluating college application essays'),
  ('demo-counselor-id', 'Supplemental Essay Rubric', 'Focused rubric for university-specific supplemental essays')
ON CONFLICT DO NOTHING;

-- Get the rubric IDs for sample data
DO $$
DECLARE
  college_rubric_id uuid;
  supplemental_rubric_id uuid;
BEGIN
  -- Get the college essay rubric ID
  SELECT id INTO college_rubric_id FROM rubrics WHERE counselor_id = 'demo-counselor-id' AND name = 'College Essay Rubric' LIMIT 1;
  
  -- Get the supplemental essay rubric ID
  SELECT id INTO supplemental_rubric_id FROM rubrics WHERE counselor_id = 'demo-counselor-id' AND name = 'Supplemental Essay Rubric' LIMIT 1;

  -- Insert criteria for College Essay Rubric
  IF college_rubric_id IS NOT NULL THEN
    INSERT INTO rubric_criteria (rubric_id, name, description, position) VALUES
      (college_rubric_id, 'Clarity and Focus', 'Essay maintains clear focus on central theme without deviation', 1),
      (college_rubric_id, 'Authenticity and Voice', 'Writing reflects genuine student voice and personal perspective', 2),
      (college_rubric_id, 'Story and Structure', 'Narrative flows logically with engaging introduction and strong conclusion', 3),
      (college_rubric_id, 'Insight and Reflection', 'Demonstrates meaningful self-awareness and personal growth', 4),
      (college_rubric_id, 'Writing Mechanics', 'Grammar, syntax, and word choice are appropriate and effective', 5)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert criteria for Supplemental Essay Rubric
  IF supplemental_rubric_id IS NOT NULL THEN
    INSERT INTO rubric_criteria (rubric_id, name, description, position) VALUES
      (supplemental_rubric_id, 'Prompt Responsiveness', 'Directly addresses all aspects of the essay prompt', 1),
      (supplemental_rubric_id, 'University Fit', 'Demonstrates genuine understanding of and fit with the university', 2),
      (supplemental_rubric_id, 'Specificity', 'Uses concrete examples and specific details', 3),
      (supplemental_rubric_id, 'Clarity', 'Ideas are clearly communicated and well-organized', 4)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
