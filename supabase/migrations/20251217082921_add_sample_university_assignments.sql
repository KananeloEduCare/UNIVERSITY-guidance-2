/*
  # Sample University Assignments and Progress

  ## Overview
  Populates demo data for university assignments and application progress tracking
  to demonstrate the assigned student details functionality.

  ## Changes
  - Add university assignments for sample students
  - Update student status to 'assigned' for students with assignments  
  - Create application progress records for assigned universities

  ## Demo Data
  Creates assignments for 2-3 students with:
  - Mix of reach, mid, and safety tier universities
  - Various application statuses
  - Progress tracking with different completion levels
*/

-- Assign universities to Emma Wilson (top student)
INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  ps.counselor_id,
  'Stanford University',
  'reach'
FROM pool_students ps
WHERE ps.email = 'emma.wilson@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  ps.counselor_id,
  'University of California, Berkeley',
  'mid'
FROM pool_students ps
WHERE ps.email = 'emma.wilson@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  ps.counselor_id,
  'University of Washington',
  'safety'
FROM pool_students ps
WHERE ps.email = 'emma.wilson@student.com'
ON CONFLICT DO NOTHING;

-- Assign universities to Sophie Chen
INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  ps.counselor_id,
  'MIT',
  'reach'
FROM pool_students ps
WHERE ps.email = 'sophie.chen@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  ps.counselor_id,
  'University of Michigan',
  'mid'
FROM pool_students ps
WHERE ps.email = 'sophie.chen@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  ps.counselor_id,
  'Purdue University',
  'safety'
FROM pool_students ps
WHERE ps.email = 'sophie.chen@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  ps.counselor_id,
  'Georgia Tech',
  'mid'
FROM pool_students ps
WHERE ps.email = 'sophie.chen@student.com'
ON CONFLICT DO NOTHING;

-- Update student status to assigned
UPDATE pool_students
SET status = 'assigned', updated_at = now()
WHERE email IN ('emma.wilson@student.com', 'sophie.chen@student.com');

-- Create application progress for Emma Wilson's universities
INSERT INTO application_progress (assignment_id, student_id, counselor_id, status, essay_status, application_deadline, recommendation_letters, recommendation_letters_needed, notes)
SELECT 
  ua.id,
  ua.student_id,
  ua.counselor_id,
  'in_progress',
  'draft',
  '2025-01-01',
  1,
  2,
  'Strong application. Essay needs minor revisions focusing on leadership examples.'
FROM university_assignments ua
JOIN pool_students ps ON ua.student_id = ps.id
WHERE ps.email = 'emma.wilson@student.com' AND ua.university_name = 'Stanford University'
ON CONFLICT DO NOTHING;

INSERT INTO application_progress (assignment_id, student_id, counselor_id, status, essay_status, application_deadline, decision_date, recommendation_letters, recommendation_letters_needed, notes)
SELECT 
  ua.id,
  ua.student_id,
  ua.counselor_id,
  'submitted',
  'final',
  '2024-11-30',
  '2025-03-31',
  2,
  2,
  'Application submitted early. Excellent essays showcasing research experience.'
FROM university_assignments ua
JOIN pool_students ps ON ua.student_id = ps.id
WHERE ps.email = 'emma.wilson@student.com' AND ua.university_name = 'University of California, Berkeley'
ON CONFLICT DO NOTHING;

INSERT INTO application_progress (assignment_id, student_id, counselor_id, status, essay_status, application_deadline, recommendation_letters, recommendation_letters_needed, notes)
SELECT 
  ua.id,
  ua.student_id,
  ua.counselor_id,
  'not_started',
  'not_started',
  '2025-01-15',
  0,
  2,
  'Safety school. Will complete after reach schools.'
FROM university_assignments ua
JOIN pool_students ps ON ua.student_id = ps.id
WHERE ps.email = 'emma.wilson@student.com' AND ua.university_name = 'University of Washington'
ON CONFLICT DO NOTHING;

-- Create application progress for Sophie Chen's universities
INSERT INTO application_progress (assignment_id, student_id, counselor_id, status, essay_status, application_deadline, recommendation_letters, recommendation_letters_needed, notes)
SELECT 
  ua.id,
  ua.student_id,
  ua.counselor_id,
  'in_progress',
  'review',
  '2025-01-05',
  2,
  3,
  'Essays under review. Strong technical background highlighted well.'
FROM university_assignments ua
JOIN pool_students ps ON ua.student_id = ps.id
WHERE ps.email = 'sophie.chen@student.com' AND ua.university_name = 'MIT'
ON CONFLICT DO NOTHING;

INSERT INTO application_progress (assignment_id, student_id, counselor_id, status, essay_status, application_deadline, recommendation_letters, recommendation_letters_needed, notes)
SELECT 
  ua.id,
  ua.student_id,
  ua.counselor_id,
  'in_progress',
  'draft',
  '2025-01-10',
  1,
  2,
  'Good progress. Need to emphasize extracurricular leadership more.'
FROM university_assignments ua
JOIN pool_students ps ON ua.student_id = ps.id
WHERE ps.email = 'sophie.chen@student.com' AND ua.university_name = 'University of Michigan'
ON CONFLICT DO NOTHING;

INSERT INTO application_progress (assignment_id, student_id, counselor_id, status, essay_status, application_deadline, recommendation_letters, recommendation_letters_needed)
SELECT 
  ua.id,
  ua.student_id,
  ua.counselor_id,
  'not_started',
  'not_started',
  '2025-02-01',
  0,
  2
FROM university_assignments ua
JOIN pool_students ps ON ua.student_id = ps.id
WHERE ps.email = 'sophie.chen@student.com' AND ua.university_name = 'Purdue University'
ON CONFLICT DO NOTHING;

INSERT INTO application_progress (assignment_id, student_id, counselor_id, status, essay_status, application_deadline, decision_date, recommendation_letters, recommendation_letters_needed, notes)
SELECT 
  ua.id,
  ua.student_id,
  ua.counselor_id,
  'accepted',
  'final',
  '2024-11-01',
  '2024-12-15',
  2,
  2,
  'Early Action acceptance! Great safety option with merit scholarship offer.'
FROM university_assignments ua
JOIN pool_students ps ON ua.student_id = ps.id
WHERE ps.email = 'sophie.chen@student.com' AND ua.university_name = 'Georgia Tech'
ON CONFLICT DO NOTHING;