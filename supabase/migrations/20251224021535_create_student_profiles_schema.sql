/*
  # Create Student Profiles Schema

  1. New Tables
    - `student_profiles`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references pool_students)
      - `date_of_birth` (date)
      - `nationality` (text)
      - `financial_budget` (numeric) - budget in USD for college
      - `career_interests` (text)
      - `personal_statement` (text)
      - `extracurricular_activities` (text)
      - `special_circumstances` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `student_profiles` table
    - Add policies for counselors to view and manage student profiles
*/

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES pool_students(id) ON DELETE CASCADE,
  date_of_birth date,
  nationality text NOT NULL DEFAULT '',
  financial_budget numeric(12, 2) DEFAULT 0,
  career_interests text NOT NULL DEFAULT '',
  personal_statement text NOT NULL DEFAULT '',
  extracurricular_activities text NOT NULL DEFAULT '',
  special_circumstances text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id)
);

-- Enable RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Counselors can view all student profiles
CREATE POLICY "Counselors can view all student profiles"
  ON student_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM counselors
      WHERE counselors.email = current_setting('request.jwt.claims')::json->>'email'
    )
  );

-- Counselors can insert student profiles
CREATE POLICY "Counselors can insert student profiles"
  ON student_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM counselors
      WHERE counselors.email = current_setting('request.jwt.claims')::json->>'email'
    )
  );

-- Counselors can update student profiles
CREATE POLICY "Counselors can update student profiles"
  ON student_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM counselors
      WHERE counselors.email = current_setting('request.jwt.claims')::json->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM counselors
      WHERE counselors.email = current_setting('request.jwt.claims')::json->>'email'
    )
  );

-- Add some sample student profiles
INSERT INTO student_profiles (student_id, date_of_birth, nationality, financial_budget, career_interests, personal_statement, extracurricular_activities, special_circumstances)
VALUES
  (
    (SELECT id FROM pool_students WHERE name = 'Amara Okafor' LIMIT 1),
    '2006-03-15',
    'Nigerian',
    50000,
    'Computer Science, Artificial Intelligence, Software Engineering',
    'Growing up in Lagos, Nigeria, I witnessed firsthand how technology could bridge gaps and create opportunities. My journey in computer science began when I taught myself Python at age 14, creating a mobile app to help local farmers track crop prices. This experience ignited my passion for leveraging technology to solve real-world problems. At my school, I founded the Coding Club, where we mentor younger students in programming. I dream of building AI solutions that address challenges in developing countries, particularly in healthcare and education. My goal is to return to Nigeria after my studies and establish a tech hub that empowers young Africans to become innovators.',
    '- Founded and lead the school Coding Club (50+ members)\n- Developed a mobile app for local farmers that reached 500+ users\n- Participated in Google Code-in and won regional hackathon\n- Volunteer coding instructor at community center (2 years)\n- Captain of school Math Olympiad team\n- Member of debate society',
    'As the eldest of four siblings, I help support my family financially by tutoring students after school. My father lost his job during the pandemic, which made me more determined to pursue higher education. Despite limited access to technology resources, I have maintained top grades while working part-time.'
  ),
  (
    (SELECT id FROM pool_students WHERE name = 'Chen Wei' LIMIT 1),
    '2006-07-22',
    'Chinese',
    40000,
    'Biomedical Engineering, Medical Research, Global Health',
    'My grandmother''s battle with Alzheimer''s disease profoundly shaped my life direction. Watching her gradual memory loss inspired me to explore the intersection of engineering and medicine. I spent two summers interning at a biomedical research lab, where I assisted in developing low-cost diagnostic devices for rural clinics. This experience opened my eyes to healthcare disparities in underserved communities. I am particularly interested in designing affordable medical technologies that can be deployed in resource-limited settings. My ultimate goal is to pursue a PhD in biomedical engineering and lead research initiatives that make advanced healthcare accessible to everyone, regardless of their economic background.',
    '- Research intern at Biomedical Engineering Lab (2 summers)\n- Co-authored paper on low-cost diagnostic devices (published in youth science journal)\n- President of Science Research Club\n- Volunteer at local elderly care center (3 years)\n- Member of Red Cross Youth chapter\n- Competitive swimmer (regional medals)',
    'My family immigrated from a rural province to Beijing when I was 10. The transition was challenging, and I struggled with feeling like an outsider. This experience gave me empathy for marginalized communities and drives my commitment to accessible healthcare.'
  ),
  (
    (SELECT id FROM pool_students WHERE name = 'Fatima Hassan' LIMIT 1),
    '2006-11-08',
    'Egyptian',
    35000,
    'Environmental Science, Sustainable Development, Climate Policy',
    'Living in Cairo, one of the world''s most polluted cities, made environmental issues deeply personal to me. At 15, I initiated a school-wide recycling program that reduced waste by 40% in our first year. This small victory showed me the power of grassroots environmental action. I have since expanded my focus to water conservation, conducting an independent research project on affordable water filtration systems for low-income neighborhoods. Climate change disproportionately affects developing nations, and I am committed to being part of the solution. I envision a career in environmental policy and sustainable development, where I can advocate for green initiatives that balance economic growth with ecological preservation in the Middle East and North Africa region.',
    '- Founded school recycling program (reduced waste by 40%)\n- Conducted research on water filtration systems\n- Member of Youth Climate Action Network\n- Organized community clean-up drives (monthly)\n- Editor of school environmental magazine\n- Participated in Model UN (represented Egypt in climate conferences)',
    'I come from a single-parent household, as my father passed away when I was 12. My mother works two jobs to support me and my younger brother. Financial constraints mean I cannot afford expensive SAT prep courses or college visits, but I have sought free resources online and maintained my academic performance.'
  ),
  (
    (SELECT id FROM pool_students WHERE name = 'Kofi Mensah' LIMIT 1),
    '2006-05-30',
    'Ghanaian',
    30000,
    'Economics, Development Studies, Social Entrepreneurship',
    'Growing up in Accra, Ghana, I observed the stark economic inequalities that limit opportunities for talented young people. My interest in economics began when I started a small business selling refurbished electronics to fund my education. This entrepreneurial experience taught me about market dynamics, financial planning, and the importance of access to capital. I have since conducted research on microfinance models and their impact on women entrepreneurs in my community. I believe that sustainable economic development is key to lifting communities out of poverty. My ambition is to work with international development organizations and eventually create social enterprises that generate employment opportunities for youth in West Africa while addressing critical social challenges.',
    '- Founded and run electronics refurbishing business\n- Conducted research on microfinance and women entrepreneurs\n- Vice President of Economics Club\n- Mentor in youth entrepreneurship program\n- Volunteer financial literacy instructor at community center\n- Member of student government (treasurer)',
    'I am a first-generation college student from a low-income family. My parents did not complete secondary school but have sacrificed greatly to ensure I receive quality education. I balance school with running my small business, which helps cover family expenses and saves for college.'
  );
