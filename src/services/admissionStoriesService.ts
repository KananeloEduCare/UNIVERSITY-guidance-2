import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface GPAHistory {
  id: string;
  story_id: string;
  year: string;
  gpa: number;
  rank?: string;
  transcript_notes?: string;
  created_at: string;
}

export interface SubjectGrade {
  id: string;
  story_id: string;
  subject_name: string;
  curriculum: string;
  grade: string;
  created_at: string;
}

export interface AdmissionStory {
  id: string;
  name: string;
  age: number;
  country: string;
  profile_image_url: string;
  current_university: string;
  university_location: string;
  application_round: string;
  grades_applied_with: string;
  subjects_taken: string[];
  extracurricular_activities: string[];
  personal_statement: string;
  financial_aid_received: string;
  university_experience: string;
  first_generation: boolean;
  linkedin_handle?: string;
  instagram_handle?: string;
  current_major: string;
  overall_gpa?: number;
  sat_score?: number;
  act_score?: number;
  created_at: string;
  updated_at: string;
  gpa_history?: GPAHistory[];
  subject_grades?: SubjectGrade[];
}

export const getAllAdmissionStories = async (): Promise<AdmissionStory[]> => {
  const { data, error } = await supabase
    .from('admission_stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admission stories:', error);
    throw error;
  }

  return data || [];
};

export const getAdmissionStoryById = async (id: string): Promise<AdmissionStory | null> => {
  const { data: story, error: storyError } = await supabase
    .from('admission_stories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (storyError) {
    console.error('Error fetching admission story:', storyError);
    throw storyError;
  }

  if (!story) return null;

  const { data: gpaHistory, error: gpaError } = await supabase
    .from('gpa_history')
    .select('*')
    .eq('story_id', id)
    .order('year', { ascending: true });

  if (gpaError) {
    console.error('Error fetching GPA history:', gpaError);
  }

  const { data: subjectGrades, error: gradesError } = await supabase
    .from('subject_grades')
    .select('*')
    .eq('story_id', id)
    .order('subject_name', { ascending: true });

  if (gradesError) {
    console.error('Error fetching subject grades:', gradesError);
  }

  return {
    ...story,
    gpa_history: gpaHistory || [],
    subject_grades: subjectGrades || []
  };
};
