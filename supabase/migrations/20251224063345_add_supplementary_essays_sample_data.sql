/*
  # Add Sample Supplementary Essays

  1. Purpose
    - Add supplementary essay data for students in student profiles
    - Link essays to students by email/name matching
    - Provide examples of reviewed and unreviewed supplementary essays
    
  2. Data Added
    - Multiple supplementary essays for different universities
    - Mix of pending and reviewed statuses
    - Sample scores for reviewed essays
*/

-- Insert supplementary essays for students
INSERT INTO student_essays (student_name, essay_type, essay_title, essay_content, university_name, submission_date, status, score, student_id) VALUES
(
  'Emma Rodriguez',
  'supplementary',
  'Why Stanford Computer Science?',
  'Stanford''s commitment to interdisciplinary innovation and its position at the heart of Silicon Valley make it the ideal place for me to pursue my passion for computer science. The opportunity to work with leading researchers in artificial intelligence and machine learning, combined with the collaborative culture that encourages students to apply technology to real-world problems, aligns perfectly with my goals.

I am particularly excited about the Human-Computer Interaction Group and the AI Lab, where I could explore how to make AI systems more accessible and beneficial to underserved communities—a mission that has driven my work throughout high school.',
  'Stanford University',
  '2024-03-15',
  'reviewed',
  88,
  (SELECT id FROM pool_students WHERE name = 'Emma Thompson' LIMIT 1)
),
(
  'Emma Rodriguez',
  'supplementary',
  'MIT Community Essay',
  'MIT''s maker culture and emphasis on hands-on learning resonates deeply with me. Having founded my school''s Tech for Good Initiative, I understand the power of collaborative problem-solving and building solutions that matter. At MIT, I would continue this work through groups like Code4Good and the MIT Makerspace, contributing my experience in developing apps for non-profits while learning from peers who share my passion for using technology as a force for positive change.',
  'MIT',
  '2024-03-18',
  'pending',
  NULL,
  (SELECT id FROM pool_students WHERE name = 'Emma Thompson' LIMIT 1)
),
(
  'Arjun Patel',
  'supplementary',
  'Johns Hopkins Biomedical Engineering',
  'Johns Hopkins'' leadership in biomedical engineering and its direct connection to the renowned medical facilities presents an unparalleled opportunity for hands-on learning. Having volunteered in hospitals and worked in research labs, I understand that the best medical innovations come from understanding both the technical challenges and the human needs. The BME Design Team program would allow me to combine my engineering skills with my passion for healthcare accessibility.',
  'Johns Hopkins University',
  '2024-03-20',
  'reviewed',
  91,
  (SELECT id FROM pool_students WHERE name = 'James Mitchell' LIMIT 1)
),
(
  'Sophie Chen',
  'supplementary',
  'Berkeley Environmental Science',
  'UC Berkeley''s leadership in environmental research and its commitment to addressing climate change through science and policy makes it my top choice. The Environmental Science, Policy, and Management program offers exactly the interdisciplinary approach I seek—combining rigorous scientific training with policy education. I am eager to contribute to research on coastal resilience and work with the Berkeley Climate Action Lab.',
  'UC Berkeley',
  '2024-03-22',
  'pending',
  NULL,
  (SELECT id FROM pool_students WHERE name = 'Sarah Chen' LIMIT 1)
),
(
  'Marcus Johnson',
  'supplementary',
  'Wharton Social Impact',
  'Wharton''s emphasis on social impact and responsible leadership aligns perfectly with my vision of entrepreneurship. Having built a student-run business that prioritizes environmental sustainability and fair employment, I understand that profit and purpose are not mutually exclusive. The Social Impact Initiative and the Entrepreneurship Accelerator would provide the perfect environment to develop my skills in creating businesses that drive both financial and social returns.',
  'University of Pennsylvania (Wharton)',
  '2024-03-25',
  'reviewed',
  85,
  (SELECT id FROM pool_students WHERE name = 'Emma Thompson' LIMIT 1)
);
