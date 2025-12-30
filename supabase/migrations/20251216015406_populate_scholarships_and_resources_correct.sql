/*
  # Populate Counselor Scholarships and Resources

  ## Overview
  Adds realistic dummy data for scholarships and resources to demonstrate
  the counselor portal's resource management capabilities.

  ## Data Added

  ### Scholarships (6 entries)
  - Global Merit Scholarship ($10,000)
  - Future Leaders Award ($15,000)
  - STEM Excellence Grant ($8,000)
  - International Student Success Fund ($12,000)
  - Essay Excellence Competition ($5,000)
  - Community Impact Scholarship ($7,500)

  ### Resources (8 entries)
  - Videos: Essay writing, supplemental essays
  - Guides: Application strategy, interview prep, international student guide
  - Articles: Test prep, activity lists
*/

-- Clear existing data
DELETE FROM counselor_scholarships WHERE counselor_id IN (
  SELECT id FROM counselors WHERE email = 'kananelobutielliot@gmail.com'
);

DELETE FROM counselor_resources WHERE counselor_id IN (
  SELECT id FROM counselors WHERE email = 'kananelobutielliot@gmail.com'
);

-- Insert Scholarships
INSERT INTO counselor_scholarships (
  counselor_id, 
  name, 
  description, 
  award_amount, 
  deadline, 
  eligibility_criteria, 
  requirements,
  application_link
)
SELECT 
  c.id,
  'Global Merit Scholarship',
  'Prestigious scholarship for outstanding academic achievement and leadership potential. Recipients demonstrate exceptional academic performance, community involvement, and leadership skills that set them apart.',
  '$10,000',
  '2026-03-15',
  'International students with GPA 3.8+, demonstrated leadership experience, and active community service participation',
  'Complete application form, 2 letters of recommendation, personal statement (500 words), transcript',
  'https://example.com/scholarships/global-merit'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_scholarships (
  counselor_id, 
  name, 
  description, 
  award_amount, 
  deadline, 
  eligibility_criteria, 
  requirements,
  application_link
)
SELECT 
  c.id,
  'Future Leaders Award',
  'Annual award recognizing students who have made significant impact in their communities through volunteer work, activism, or social entrepreneurship. Celebrates changemakers and visionaries.',
  '$15,000',
  '2026-04-30',
  'Students with 100+ volunteer hours and leadership roles in student organizations or community projects',
  'Online application, project documentation, 3 references, impact statement, video interview',
  'https://example.com/scholarships/future-leaders'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_scholarships (
  counselor_id, 
  name, 
  description, 
  award_amount, 
  deadline, 
  eligibility_criteria, 
  requirements,
  application_link
)
SELECT 
  c.id,
  'STEM Excellence Grant',
  'Supporting the next generation of scientists, engineers, and mathematicians. Priority given to underrepresented students in STEM fields who demonstrate innovation and research potential.',
  '$8,000',
  '2026-02-28',
  'Students pursuing STEM degrees with minimum GPA 3.5 and strong mathematics/science background',
  'Research proposal or project portfolio, academic transcript, STEM teacher recommendation',
  'https://example.com/scholarships/stem-excellence'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_scholarships (
  counselor_id, 
  name, 
  description, 
  award_amount, 
  deadline, 
  eligibility_criteria, 
  requirements,
  application_link
)
SELECT 
  c.id,
  'International Student Success Fund',
  'Need-based scholarship specifically for international students demonstrating financial need and academic promise. Renewable for up to 4 years with maintained academic standing.',
  '$12,000',
  '2026-05-15',
  'International students with demonstrated financial need and minimum GPA 3.0',
  'Financial aid application, family income documentation, personal essay, academic records',
  'https://example.com/scholarships/intl-success'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_scholarships (
  counselor_id, 
  name, 
  description, 
  award_amount, 
  deadline, 
  eligibility_criteria, 
  requirements,
  application_link
)
SELECT 
  c.id,
  'Essay Excellence Competition',
  'National essay competition on themes of social justice, innovation, or global citizenship. Winners selected based on writing quality, originality, critical thinking, and depth of analysis.',
  '$5,000',
  '2026-01-31',
  'All students enrolled in secondary or post-secondary education',
  'Original essay 1500-2000 words on provided theme, bibliography, student verification form',
  'https://example.com/scholarships/essay-competition'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_scholarships (
  counselor_id, 
  name, 
  description, 
  award_amount, 
  deadline, 
  eligibility_criteria, 
  requirements,
  application_link
)
SELECT 
  c.id,
  'Community Impact Scholarship',
  'Recognizes students who have created measurable positive change in their local communities through sustained projects or initiatives. Values both innovation and commitment to service.',
  '$7,500',
  '2026-03-30',
  'Documented community project with measurable impact over minimum 6 months',
  'Project summary, impact metrics, 2 community letters of recommendation, photo documentation',
  'https://example.com/scholarships/community-impact'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

-- Insert Resources
INSERT INTO counselor_resources (
  counselor_id, 
  resource_type,
  title, 
  creator,
  key_topics, 
  time_estimate,
  link,
  category
)
SELECT 
  c.id,
  'video',
  'Writing a Standout Common App Essay',
  'College Essay Academy',
  ARRAY['Brainstorming', 'Essay Structure', 'Revision Process', 'Authenticity'],
  '18 minutes',
  'https://example.com/resources/common-app-essay',
  'essays'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_resources (
  counselor_id, 
  resource_type,
  title, 
  creator,
  key_topics, 
  time_estimate,
  link,
  category
)
SELECT 
  c.id,
  'guide',
  'University Application Strategy Guide',
  'EduCare Admissions Team',
  ARRAY['College List Building', 'Reach-Match-Safety', 'Application Timeline', 'Requirements'],
  '45 pages',
  'https://example.com/resources/app-strategy-guide',
  'applications'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_resources (
  counselor_id, 
  resource_type,
  title, 
  creator,
  key_topics, 
  time_estimate,
  link,
  category
)
SELECT 
  c.id,
  'video',
  'Financial Aid Masterclass',
  'FinAid Experts Network',
  ARRAY['FAFSA', 'CSS Profile', 'International Aid', 'Scholarship Search'],
  '52 minutes',
  'https://example.com/resources/finaid-masterclass',
  'financial_aid'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_resources (
  counselor_id, 
  resource_type,
  title, 
  creator,
  key_topics, 
  time_estimate,
  link,
  category
)
SELECT 
  c.id,
  'article',
  'SAT/ACT Test Prep Essentials',
  'Test Prep Institute',
  ARRAY['Test Strategies', 'Time Management', 'Math Tips', 'Reading Comprehension'],
  '12-part series',
  'https://example.com/resources/test-prep-essentials',
  'general'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_resources (
  counselor_id, 
  resource_type,
  title, 
  creator,
  key_topics, 
  time_estimate,
  link,
  category
)
SELECT 
  c.id,
  'video',
  'Supplemental Essays That Work',
  'Admissions Insider',
  ARRAY['Why This College', 'School Research', 'Authenticity', 'Common Mistakes'],
  '32 minutes',
  'https://example.com/resources/supplemental-essays',
  'essays'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_resources (
  counselor_id, 
  resource_type,
  title, 
  creator,
  key_topics, 
  time_estimate,
  link,
  category
)
SELECT 
  c.id,
  'guide',
  'Interview Preparation Toolkit',
  'University Interview Coaches',
  ARRAY['Common Questions', 'Practice Exercises', 'Virtual Interviews', 'Body Language'],
  '28 pages',
  'https://example.com/resources/interview-toolkit',
  'interviews'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_resources (
  counselor_id, 
  resource_type,
  title, 
  creator,
  key_topics, 
  time_estimate,
  link,
  category
)
SELECT 
  c.id,
  'article',
  'Building Your Activity List',
  'CollegePrep Pro',
  ARRAY['Activity Descriptions', 'Impact Over Titles', 'Prioritization', 'Quantifying Success'],
  '8-minute read',
  'https://example.com/resources/activity-list-guide',
  'applications'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';

INSERT INTO counselor_resources (
  counselor_id, 
  resource_type,
  title, 
  creator,
  key_topics, 
  time_estimate,
  link,
  category
)
SELECT 
  c.id,
  'guide',
  'International Student Application Guide',
  'Global Education Advisors',
  ARRAY['Visa Process', 'Demonstrated Interest', 'Cultural Differences', 'English Proficiency'],
  '62 pages',
  'https://example.com/resources/international-guide',
  'applications'
FROM counselors c WHERE c.email = 'kananelobutielliot@gmail.com';