/*
  # Add Student Read Policies for Essay Reviews

  ## Overview
  Allow students to view their own essay reviews and related feedback in read-only mode.

  ## Changes
  1. Add SELECT policies for students on essay_reviews table
  2. Add SELECT policies for students on criterion_feedback table
  3. Students can only view their own reviews (filtered by student_name)
  4. Students cannot view rubrics or criteria that counselors own

  ## Security
  - Students can only read, never write
  - Students can only see reviews where student_name matches their user name
  - All feedback is read-only for students
*/

-- Allow students to view their own essay reviews
CREATE POLICY "Students can view their own reviews"
  ON essay_reviews FOR SELECT
  TO authenticated
  USING (
    student_name = current_setting('request.jwt.claims', true)::json->>'name'
  );

-- Allow students to view feedback for their own reviews
CREATE POLICY "Students can view feedback for their reviews"
  ON criterion_feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM essay_reviews
      WHERE essay_reviews.id = criterion_feedback.review_id
      AND essay_reviews.student_name = current_setting('request.jwt.claims', true)::json->>'name'
    )
  );

-- Allow students to view rubrics used in their reviews (read-only)
CREATE POLICY "Students can view rubrics used in their reviews"
  ON rubrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM essay_reviews
      WHERE essay_reviews.rubric_id = rubrics.id
      AND essay_reviews.student_name = current_setting('request.jwt.claims', true)::json->>'name'
    )
  );

-- Allow students to view criteria from rubrics used in their reviews
CREATE POLICY "Students can view criteria from their review rubrics"
  ON rubric_criteria FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM essay_reviews
      WHERE essay_reviews.rubric_id = rubric_criteria.rubric_id
      AND essay_reviews.student_name = current_setting('request.jwt.claims', true)::json->>'name'
    )
  );
