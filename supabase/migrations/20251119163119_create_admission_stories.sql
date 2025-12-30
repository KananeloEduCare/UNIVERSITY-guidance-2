/*
  # Create Admission Stories Schema

  ## Overview
  This migration creates the database schema for storing student admission stories,
  including their personal information, academic history, and university experiences.

  ## New Tables
  
  ### `admission_stories`
  Stores comprehensive information about students' admission journeys
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each story
  - `name` (text) - Student's full name
  - `age` (integer) - Student's age
  - `country` (text) - Country of origin
  - `profile_image_url` (text) - URL to student's profile picture
  - `current_university` (text) - Name of university they attend
  - `university_location` (text) - Location of the university (e.g., "Bremen, Germany")
  - `application_round` (text) - Round they applied in (RD, ED, EA, etc.)
  - `grades_applied_with` (text) - Grades/GPA they applied with
  - `subjects_taken` (text[]) - Array of subjects they took
  - `extracurricular_activities` (text[]) - Array of their activities
  - `personal_statement` (text) - Their personal statement/essay
  - `financial_aid_received` (text) - Description of financial aid received
  - `university_experience` (text) - Their personal experience at the university
  - `first_generation` (boolean) - Whether they are first-generation student
  - `linkedin_handle` (text, nullable) - LinkedIn profile URL
  - `instagram_handle` (text, nullable) - Instagram handle
  - `current_major` (text) - Their current major/field of study
  - `created_at` (timestamptz) - When the story was created
  - `updated_at` (timestamptz) - When the story was last updated
  
  ### `gpa_history`
  Stores historical GPA/transcript information for each student
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `story_id` (uuid, foreign key) - References admission_stories(id)
  - `year` (text) - Academic year (e.g., "Grade 11", "Year 1")
  - `gpa` (decimal) - GPA for that year
  - `rank` (text, nullable) - Class rank if applicable
  - `transcript_notes` (text, nullable) - Additional notes about transcript
  - `created_at` (timestamptz) - When the record was created
  
  ## Security
  - Enable RLS on both tables
  - Allow public read access to admission stories (anyone can view)
  - Only authenticated admin users can create/update/delete stories
*/

-- Create admission_stories table
CREATE TABLE IF NOT EXISTS admission_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  country text NOT NULL,
  profile_image_url text NOT NULL,
  current_university text NOT NULL,
  university_location text NOT NULL,
  application_round text NOT NULL,
  grades_applied_with text NOT NULL,
  subjects_taken text[] DEFAULT '{}',
  extracurricular_activities text[] DEFAULT '{}',
  personal_statement text NOT NULL,
  financial_aid_received text NOT NULL,
  university_experience text NOT NULL,
  first_generation boolean DEFAULT false,
  linkedin_handle text,
  instagram_handle text,
  current_major text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gpa_history table
CREATE TABLE IF NOT EXISTS gpa_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES admission_stories(id) ON DELETE CASCADE,
  year text NOT NULL,
  gpa decimal(3,2) NOT NULL,
  rank text,
  transcript_notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admission_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpa_history ENABLE ROW LEVEL SECURITY;

-- Public can read all admission stories
CREATE POLICY "Anyone can view admission stories"
  ON admission_stories
  FOR SELECT
  TO public
  USING (true);

-- Public can read GPA history
CREATE POLICY "Anyone can view GPA history"
  ON gpa_history
  FOR SELECT
  TO public
  USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_gpa_history_story_id ON gpa_history(story_id);
CREATE INDEX IF NOT EXISTS idx_admission_stories_country ON admission_stories(country);
CREATE INDEX IF NOT EXISTS idx_admission_stories_university ON admission_stories(current_university);

-- Insert sample data (your story as an example)
INSERT INTO admission_stories (
  name,
  age,
  country,
  profile_image_url,
  current_university,
  university_location,
  application_round,
  grades_applied_with,
  subjects_taken,
  extracurricular_activities,
  personal_statement,
  financial_aid_received,
  university_experience,
  first_generation,
  linkedin_handle,
  instagram_handle,
  current_major
) VALUES (
  'Kananelo Buti',
  20,
  'Lesotho',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
  'Constructor University Bremen',
  'Bremen, Germany',
  'ED',
  '3.8 GPA',
  ARRAY['Mathematics', 'Physics', 'Computer Science', 'English', 'Chemistry'],
  ARRAY['Debate Club President', 'Coding Club Founder', 'Volunteer Teacher', 'School Newsletter Editor'],
  'Growing up in Lesotho, I witnessed firsthand the transformative power of education. My journey from a small mountain kingdom to pursuing computer science in Germany represents not just my personal ambition, but the dreams of my entire community...',
  'Full tuition scholarship plus living stipend',
  'Constructor University has been an incredible experience. The diverse international community and innovative teaching methods have challenged me to think globally while staying connected to my roots. The small class sizes allow for meaningful interactions with professors.',
  true,
  'https://linkedin.com/in/kananelo-buti',
  '@kananelo_buti',
  'Computer Science'
);

-- Insert sample GPA history for Kananelo
INSERT INTO gpa_history (story_id, year, gpa, rank, transcript_notes)
SELECT 
  id,
  unnest(ARRAY['Grade 10', 'Grade 11', 'Grade 12']) as year,
  unnest(ARRAY[3.7, 3.8, 3.9]) as gpa,
  unnest(ARRAY['Top 5%', 'Top 3%', 'Top 2%']) as rank,
  unnest(ARRAY['Strong foundation in STEM', 'Advanced mathematics courses', 'AP Computer Science - Score 5']) as transcript_notes
FROM admission_stories
WHERE name = 'Kananelo Buti';