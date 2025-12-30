/*
  # Update Academic Tracking Dummy Data

  1. Updates
    - Update existing student_courses records with more realistic data
    - Ensure no 0% values
    - Add varied but realistic grades and syllabus completion percentages

  2. Data Changes
    - Current grades range from 72% to 96%
    - Syllabus completion ranges from 65% to 95%
    - Assignment counts are realistic
*/

-- Clear existing data first
DELETE FROM student_courses;

-- Insert realistic academic data for pool students
DO $$
DECLARE
  student_record RECORD;
  student_counter INTEGER := 0;
BEGIN
  FOR student_record IN SELECT id, name FROM pool_students ORDER BY name LOOP
    student_counter := student_counter + 1;
    
    -- Each student gets 6 courses with varied realistic performance
    -- Student 1: High performer
    IF student_counter = 1 THEN
      INSERT INTO student_courses (student_id, course_name, course_code, current_grade, syllabus_completion, total_assignments, completed_assignments) VALUES
        (student_record.id, 'Mathematics HL', 'MATH-HL', 94.5, 88.0, 12, 11),
        (student_record.id, 'Physics HL', 'PHYS-HL', 92.0, 85.0, 14, 13),
        (student_record.id, 'Chemistry HL', 'CHEM-HL', 89.5, 82.0, 13, 12),
        (student_record.id, 'English A: Literature SL', 'ENG-SL', 91.0, 90.0, 10, 10),
        (student_record.id, 'Spanish B SL', 'SPAN-SL', 88.0, 86.0, 11, 10),
        (student_record.id, 'Economics SL', 'ECON-SL', 93.5, 89.0, 12, 11);
    
    -- Student 2: Strong performer
    ELSIF student_counter = 2 THEN
      INSERT INTO student_courses (student_id, course_name, course_code, current_grade, syllabus_completion, total_assignments, completed_assignments) VALUES
        (student_record.id, 'Mathematics HL', 'MATH-HL', 87.5, 82.0, 12, 10),
        (student_record.id, 'Physics HL', 'PHYS-HL', 85.0, 80.0, 14, 12),
        (student_record.id, 'Chemistry HL', 'CHEM-HL', 88.5, 84.0, 13, 11),
        (student_record.id, 'English A: Literature SL', 'ENG-SL', 90.0, 88.0, 10, 9),
        (student_record.id, 'Spanish B SL', 'SPAN-SL', 86.0, 83.0, 11, 10),
        (student_record.id, 'Economics SL', 'ECON-SL', 89.0, 86.0, 12, 11);
    
    -- Student 3: Good performer
    ELSIF student_counter = 3 THEN
      INSERT INTO student_courses (student_id, course_name, course_code, current_grade, syllabus_completion, total_assignments, completed_assignments) VALUES
        (student_record.id, 'Mathematics HL', 'MATH-HL', 82.0, 78.0, 12, 10),
        (student_record.id, 'Physics HL', 'PHYS-HL', 79.5, 75.0, 14, 11),
        (student_record.id, 'Chemistry HL', 'CHEM-HL', 84.0, 80.0, 13, 11),
        (student_record.id, 'English A: Literature SL', 'ENG-SL', 86.5, 82.0, 10, 9),
        (student_record.id, 'Spanish B SL', 'SPAN-SL', 81.0, 77.0, 11, 9),
        (student_record.id, 'Economics SL', 'ECON-SL', 83.5, 79.0, 12, 10);
    
    -- Student 4: Average performer
    ELSIF student_counter = 4 THEN
      INSERT INTO student_courses (student_id, course_name, course_code, current_grade, syllabus_completion, total_assignments, completed_assignments) VALUES
        (student_record.id, 'Mathematics HL', 'MATH-HL', 78.0, 72.0, 12, 9),
        (student_record.id, 'Physics HL', 'PHYS-HL', 76.5, 70.0, 14, 10),
        (student_record.id, 'Chemistry HL', 'CHEM-HL', 80.0, 75.0, 13, 10),
        (student_record.id, 'English A: Literature SL', 'ENG-SL', 82.0, 78.0, 10, 8),
        (student_record.id, 'Spanish B SL', 'SPAN-SL', 77.0, 73.0, 11, 8),
        (student_record.id, 'Economics SL', 'ECON-SL', 79.5, 76.0, 12, 9);
    
    -- Student 5: Developing performer
    ELSIF student_counter = 5 THEN
      INSERT INTO student_courses (student_id, course_name, course_code, current_grade, syllabus_completion, total_assignments, completed_assignments) VALUES
        (student_record.id, 'Mathematics HL', 'MATH-HL', 73.5, 68.0, 12, 8),
        (student_record.id, 'Physics HL', 'PHYS-HL', 72.0, 65.0, 14, 9),
        (student_record.id, 'Chemistry HL', 'CHEM-HL', 75.5, 70.0, 13, 9),
        (student_record.id, 'English A: Literature SL', 'ENG-SL', 78.0, 74.0, 10, 8),
        (student_record.id, 'Spanish B SL', 'SPAN-SL', 74.0, 69.0, 11, 7),
        (student_record.id, 'Economics SL', 'ECON-SL', 76.5, 72.0, 12, 8);
    
    -- Any additional students get randomized realistic data
    ELSE
      INSERT INTO student_courses (student_id, course_name, course_code, current_grade, syllabus_completion, total_assignments, completed_assignments) VALUES
        (student_record.id, 'Mathematics HL', 'MATH-HL', (75 + random() * 15)::numeric(5,2), (70 + random() * 20)::numeric(5,2), 12, 8 + floor(random() * 4)::integer),
        (student_record.id, 'Physics HL', 'PHYS-HL', (75 + random() * 15)::numeric(5,2), (70 + random() * 20)::numeric(5,2), 14, 9 + floor(random() * 5)::integer),
        (student_record.id, 'Chemistry HL', 'CHEM-HL', (75 + random() * 15)::numeric(5,2), (70 + random() * 20)::numeric(5,2), 13, 8 + floor(random() * 5)::integer),
        (student_record.id, 'English A: Literature SL', 'ENG-SL', (75 + random() * 15)::numeric(5,2), (70 + random() * 20)::numeric(5,2), 10, 7 + floor(random() * 3)::integer),
        (student_record.id, 'Spanish B SL', 'SPAN-SL', (75 + random() * 15)::numeric(5,2), (70 + random() * 20)::numeric(5,2), 11, 7 + floor(random() * 4)::integer),
        (student_record.id, 'Economics SL', 'ECON-SL', (75 + random() * 15)::numeric(5,2), (70 + random() * 20)::numeric(5,2), 12, 8 + floor(random() * 4)::integer);
    END IF;
  END LOOP;
END $$;