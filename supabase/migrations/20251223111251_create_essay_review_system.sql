/*
  # Create Essay Review System

  1. New Tables
    - `student_essays`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references pool_students)
      - `student_name` (text)
      - `essay_type` (text) - 'personal_statement' or 'supplementary'
      - `essay_title` (text)
      - `essay_content` (text)
      - `university_name` (text, nullable) - for supplementary essays
      - `submission_date` (timestamptz)
      - `status` (text) - 'pending', 'in_review', 'reviewed'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `essay_inline_comments`
      - `id` (uuid, primary key)
      - `essay_id` (uuid, references student_essays)
      - `counselor_id` (uuid, references counselors)
      - `counselor_name` (text)
      - `highlighted_text` (text)
      - `start_position` (integer)
      - `end_position` (integer)
      - `comment_text` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `essay_general_comments`
      - `id` (uuid, primary key)
      - `essay_id` (uuid, references student_essays)
      - `counselor_id` (uuid, references counselors)
      - `counselor_name` (text)
      - `comment_text` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated counselors to read and manage essays
*/

-- Create student_essays table
CREATE TABLE IF NOT EXISTS student_essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES pool_students(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  essay_type text NOT NULL CHECK (essay_type IN ('personal_statement', 'supplementary')),
  essay_title text NOT NULL,
  essay_content text NOT NULL,
  university_name text,
  submission_date timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'reviewed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create essay_inline_comments table
CREATE TABLE IF NOT EXISTS essay_inline_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id uuid REFERENCES student_essays(id) ON DELETE CASCADE,
  counselor_id uuid REFERENCES counselors(id) ON DELETE CASCADE,
  counselor_name text NOT NULL,
  highlighted_text text NOT NULL,
  start_position integer NOT NULL,
  end_position integer NOT NULL,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create essay_general_comments table
CREATE TABLE IF NOT EXISTS essay_general_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id uuid REFERENCES student_essays(id) ON DELETE CASCADE,
  counselor_id uuid REFERENCES counselors(id) ON DELETE CASCADE,
  counselor_name text NOT NULL,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE student_essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_inline_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_general_comments ENABLE ROW LEVEL SECURITY;

-- Policies for student_essays
CREATE POLICY "Counselors can view all essays"
  ON student_essays FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Counselors can update essays"
  ON student_essays FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for essay_inline_comments
CREATE POLICY "Counselors can view all inline comments"
  ON essay_inline_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Counselors can insert inline comments"
  ON essay_inline_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Counselors can update their own inline comments"
  ON essay_inline_comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Counselors can delete their own inline comments"
  ON essay_inline_comments FOR DELETE
  TO authenticated
  USING (true);

-- Policies for essay_general_comments
CREATE POLICY "Counselors can view all general comments"
  ON essay_general_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Counselors can insert general comments"
  ON essay_general_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Counselors can update their own general comments"
  ON essay_general_comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Counselors can delete their own general comments"
  ON essay_general_comments FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample essays
INSERT INTO student_essays (student_name, essay_type, essay_title, essay_content, university_name, submission_date, status, student_id) VALUES
(
  'Emma Thompson',
  'personal_statement',
  'Common App Personal Statement',
  'Growing up in a small coastal town, I spent my childhood exploring tide pools and marveling at the intricate ecosystems hidden beneath the waves. My fascination with marine life began when I was eight years old, during a family vacation to the Florida Keys. I remember pressing my face against the glass of an aquarium, watching a sea turtle glide gracefully through the water, and feeling an overwhelming sense of connection to the ocean and its inhabitants.

This early wonder transformed into a serious academic pursuit during my sophomore year of high school. When our biology teacher announced a research project on local environmental issues, I immediately knew I wanted to study the impact of pollution on our town''s marine ecosystem. What started as a simple class assignment evolved into a year-long investigation that would fundamentally change my understanding of environmental science and my role as a future researcher.

I began by collecting water samples from different points along our coastline, testing for pollutants and documenting changes in marine life populations. The data I gathered was alarming. Over the past decade, our local fish populations had declined by nearly 40%, and the coral reefs that once thrived just offshore were showing signs of severe bleaching. I knew I had to do more than just document these changes; I needed to take action.

With support from my biology teacher and the local marine biology lab, I organized a community beach cleanup initiative and launched an educational campaign in our town. I created informational brochures, gave presentations at town hall meetings, and even started a youth environmental club at my school. The response was overwhelming. Within six months, we had recruited over 200 volunteers and removed more than 3,000 pounds of trash from our beaches.

But the most rewarding moment came when I returned to collect follow-up water samples and discovered that the water quality had measurably improved. Small changes were occurring in the ecosystem. I had learned that scientific research isn''t just about observation and data collection; it''s about using that knowledge to create meaningful change in the world.

This experience has shaped my academic goals and career aspirations. I want to pursue a degree in marine biology and environmental science, focusing on conservation and sustainable practices. I envision a future where I can contribute to the restoration of damaged marine ecosystems and develop innovative solutions to combat climate change''s effects on our oceans.

The ocean that captivated me as a child continues to inspire me today, but now my wonder is coupled with purpose. I understand that protecting our planet''s marine environments requires dedication, scientific rigor, and community engagement. I am ready to dive deeper into this field, to learn from leading researchers, and to contribute my passion and skills to preserving the underwater worlds that sparked my curiosity so many years ago.',
  NULL,
  '2024-03-10',
  'pending',
  (SELECT id FROM pool_students WHERE name = 'Emma Thompson' LIMIT 1)
),
(
  'James Mitchell',
  'personal_statement',
  'Common App Personal Statement',
  'The rhythmic clacking of my keyboard has become the soundtrack to my life. At 2 AM, when most of my peers are asleep, I''m wide awake, debugging code and building applications that I hope will make a difference. Some might call this obsession unhealthy, but I call it passion. Programming isn''t just a hobby for me; it''s a language through which I express creativity, solve problems, and connect with others.

My journey into computer science began unexpectedly. Three years ago, my grandmother was diagnosed with early-onset Alzheimer''s disease. Watching her struggle to remember faces, names, and daily tasks was heartbreaking. I felt helpless, unable to do anything meaningful to support her or my family during this difficult time. That helplessness transformed into determination when I discovered that technology could potentially help individuals with cognitive impairments maintain their independence and quality of life.

I taught myself Python through online courses and spent months researching memory assistance technologies. My goal was ambitious: to create a mobile application that could help my grandmother navigate her daily routine, recognize family members, and maintain important memories. I called it "MemoryKeeper."

The development process was challenging. I had to learn not only programming but also user interface design, database management, and the psychological aspects of memory loss. I consulted with my grandmother''s neurologist, interviewed other families affected by Alzheimer''s, and conducted extensive user testing with elderly volunteers from a local community center.

The final application included features like facial recognition for family members, voice-activated reminders for medications and appointments, and a digital memory book where family members could share photos and stories. When I finally presented the completed app to my grandmother, her reaction was everything I had hoped for. The joy on her face when the app helped her remember my cousin''s name brought tears to my eyes.

What started as a personal project has evolved into something much larger. I''ve since refined MemoryKeeper, incorporating feedback from healthcare professionals and families. The app is now being beta-tested at three assisted living facilities in our region, and I''ve received interest from healthcare organizations about potential partnerships.

This experience taught me that the most meaningful applications of technology are those that address real human needs. It''s not about creating the flashiest or most complex software; it''s about understanding people''s struggles and using technical skills to improve their lives in tangible ways.

As I look toward college and beyond, I''m excited to deepen my understanding of computer science, particularly in areas like artificial intelligence, human-computer interaction, and healthcare technology. I want to work at the intersection of technology and healthcare, developing innovative solutions that can help vulnerable populations live fuller, more independent lives.

My grandmother once told me that memories are what make us who we are. Through programming, I''ve found a way to help people hold onto those precious memories just a little bit longer. That''s a mission worth staying up until 2 AM for.',
  NULL,
  '2024-03-08',
  'in_review',
  (SELECT id FROM pool_students WHERE name = 'James Mitchell' LIMIT 1)
),
(
  'Sarah Chen',
  'supplementary',
  'Why Stanford Engineering?',
  'Stanford''s commitment to innovation and interdisciplinary collaboration aligns perfectly with my aspirations as an aspiring biomedical engineer. The opportunity to work in the Bio-X program, where I could collaborate with researchers from medicine, engineering, and biology, represents exactly the kind of integrated approach I believe is necessary for solving complex healthcare challenges.

During my high school years, I''ve been particularly interested in developing affordable medical devices for underserved communities. I founded a nonprofit organization that designs and distributes low-cost prosthetics to children in developing countries. This experience showed me that the best engineering solutions aren''t always the most technologically advanced; they''re the ones that are accessible, sustainable, and designed with the end user in mind.

At Stanford, I''m excited to take courses like "Design for Extreme Affordability" and participate in the Global Development and Poverty Initiative. I want to learn from professors like Dr. James Landay, whose work on mobile health applications fascinates me. The chance to contribute to Stanford''s culture of innovation while staying grounded in social impact is incredibly inspiring.

Beyond academics, I''m drawn to Stanford''s collaborative and entrepreneurial spirit. I hope to join organizations like Stanford IEEE and potentially start my own venture through StartX. The university''s location in Silicon Valley would provide unparalleled opportunities for internships and mentorship from industry leaders.

Most importantly, I believe Stanford would challenge me to think bigger and reach further than I ever thought possible. I want to be surrounded by peers who are as passionate about using engineering to create positive change in the world.',
  'Stanford University',
  '2024-03-12',
  'pending',
  (SELECT id FROM pool_students WHERE name = 'Sarah Chen' LIMIT 1)
);
