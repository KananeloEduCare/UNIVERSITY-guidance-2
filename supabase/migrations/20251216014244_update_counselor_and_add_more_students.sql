/*
  # Update Counselor Credentials and Add Comprehensive Student Data

  ## Overview
  Updates the counselor account with new credentials and populates the system with
  realistic student data including both active pool students and already-assigned students.

  ## Changes

  ### 1. Counselor Account Update
  - Update email to: kananelobutielliot@gmail.com
  - Update password to: Palesa1991 (hashed as demo_hash_Palesa1991)
  - Update name to: Kananelo Buti Elliot

  ### 2. Active Pool Students (10 students)
  Adds diverse student profiles with varying strengths across all metrics:
  - High performers (composite score 90+)
  - Mid-tier students (composite score 75-89)
  - Safety-tier students (composite score <75)
  - Mix of positive and negative academic trends

  ### 3. Assigned Students (5 students)
  Creates already-assigned students with complete university assignments:
  - Each assigned to exactly 5 universities
  - Universities categorized as Reach, Mid, or Safety
  - Includes assignment dates

  ## Data Model
  All students include:
  - Name, email
  - Essay & Activities Rating (0-100%)
  - Academic Performance (0-100%)
  - Academic Trend (-10% to +10%)
  - Composite Score (calculated)
  - Status (active or assigned)
*/

-- Update counselor credentials
UPDATE counselors
SET 
  email = 'kananelobutielliot@gmail.com',
  password_hash = 'demo_hash_Palesa1991',
  name = 'Kananelo Buti Elliot'
WHERE email = 'counselor@educare.com';

-- Delete existing demo students to avoid conflicts
DELETE FROM university_assignments;
DELETE FROM pool_students;

-- Insert Active Pool Students (10 students with diverse profiles)
INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Emma Johnson',
  'emma.johnson@student.com',
  96.00,
  95.00,
  8.00,
  96.33,
  'active'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Michael Chen',
  'michael.chen@student.com',
  92.00,
  94.00,
  6.50,
  93.83,
  'active'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Sophia Martinez',
  'sophia.martinez@student.com',
  88.00,
  91.00,
  7.00,
  88.67,
  'active'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'James Williams',
  'james.williams@student.com',
  85.00,
  88.00,
  5.00,
  86.00,
  'active'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Olivia Brown',
  'olivia.brown@student.com',
  90.00,
  86.00,
  4.00,
  86.67,
  'active'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Liam Anderson',
  'liam.anderson@student.com',
  78.00,
  82.00,
  3.00,
  79.67,
  'active'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Ava Davis',
  'ava.davis@student.com',
  82.00,
  79.00,
  2.00,
  79.33,
  'active'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Noah Taylor',
  'noah.taylor@student.com',
  75.00,
  77.00,
  1.00,
  75.67,
  'active'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Isabella Garcia',
  'isabella.garcia@student.com',
  72.00,
  74.00,
  -1.00,
  72.33,
  'active'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Ethan Rodriguez',
  'ethan.rodriguez@student.com',
  68.00,
  71.00,
  -2.50,
  68.83,
  'active'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- Insert Assigned Students (5 students who already have university assignments)
INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Daniel Thompson',
  'daniel.thompson@student.com',
  94.00,
  93.00,
  7.50,
  94.17,
  'assigned'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Mia Robinson',
  'mia.robinson@student.com',
  89.00,
  90.00,
  6.00,
  88.33,
  'assigned'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Alexander Lee',
  'alexander.lee@student.com',
  84.00,
  87.00,
  4.50,
  85.17,
  'assigned'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'Charlotte White',
  'charlotte.white@student.com',
  80.00,
  83.00,
  3.50,
  82.17,
  'assigned'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pool_students (counselor_id, name, email, essay_activities_rating, academic_performance, academic_trend, composite_score, status)
SELECT 
  c.id,
  'William Harris',
  'william.harris@student.com',
  76.00,
  78.00,
  2.50,
  77.50,
  'assigned'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- Add university assignments for Daniel Thompson
INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Harvard University',
  'reach'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'daniel.thompson@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Stanford University',
  'reach'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'daniel.thompson@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'University of Michigan',
  'mid'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'daniel.thompson@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Boston University',
  'mid'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'daniel.thompson@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Penn State University',
  'safety'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'daniel.thompson@student.com'
ON CONFLICT DO NOTHING;

-- Add university assignments for Mia Robinson
INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'MIT',
  'reach'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'mia.robinson@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Northwestern University',
  'mid'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'mia.robinson@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'University of California Berkeley',
  'mid'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'mia.robinson@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'University of Wisconsin Madison',
  'safety'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'mia.robinson@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Purdue University',
  'safety'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'mia.robinson@student.com'
ON CONFLICT DO NOTHING;

-- Add university assignments for Alexander Lee
INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Duke University',
  'reach'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'alexander.lee@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'University of Virginia',
  'mid'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'alexander.lee@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'University of North Carolina',
  'mid'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'alexander.lee@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Ohio State University',
  'safety'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'alexander.lee@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Michigan State University',
  'safety'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'alexander.lee@student.com'
ON CONFLICT DO NOTHING;

-- Add university assignments for Charlotte White
INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Vanderbilt University',
  'reach'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'charlotte.white@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'University of Southern California',
  'mid'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'charlotte.white@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'George Washington University',
  'mid'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'charlotte.white@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'University of Maryland',
  'safety'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'charlotte.white@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Rutgers University',
  'safety'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'charlotte.white@student.com'
ON CONFLICT DO NOTHING;

-- Add university assignments for William Harris
INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Cornell University',
  'reach'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'william.harris@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'University of Florida',
  'mid'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'william.harris@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'University of Texas Austin',
  'mid'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'william.harris@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'University of Arizona',
  'safety'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'william.harris@student.com'
ON CONFLICT DO NOTHING;

INSERT INTO university_assignments (student_id, counselor_id, university_name, university_tier)
SELECT 
  ps.id,
  c.id,
  'Arizona State University',
  'safety'
FROM pool_students ps
JOIN counselors c ON c.id = ps.counselor_id
WHERE ps.email = 'william.harris@student.com'
ON CONFLICT DO NOTHING;