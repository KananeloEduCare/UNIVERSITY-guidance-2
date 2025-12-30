import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HighSchoolGPAHistory {
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

export interface AdmitProfile {
  id: string;
  name: string;
  age: number;
  age_at_application?: number;
  country: string;
  profile_image_url: string;
  current_university: string;
  university_location: string;
  application_round: string;
  acceptance_year?: number;
  graduation_year?: number;
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
  overall_percentage?: number;
  sat_score?: number;
  act_score?: number;
  admitted_label?: string;
  university_image_url?: string;
  created_at: string;
  updated_at: string;
  high_school_gpa_history?: HighSchoolGPAHistory[];
  subject_grades?: SubjectGrade[];
}

export const getAllAdmitProfiles = async (): Promise<AdmitProfile[]> => {
  const { data, error } = await supabase
    .from('admit_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admit profiles:', error);
    throw error;
  }

  return data || [];
};

export const getAdmitProfileById = async (id: string): Promise<AdmitProfile | null> => {
  const { data: profile, error: profileError } = await supabase
    .from('admit_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (profileError) {
    console.error('Error fetching admit profile:', profileError);
    throw profileError;
  }

  if (!profile) return null;

  const { data: gpaHistory, error: gpaError } = await supabase
    .from('high_school_gpa_history')
    .select('*')
    .eq('story_id', id)
    .order('year', { ascending: true });

  if (gpaError) {
    console.error('Error fetching high school GPA history:', gpaError);
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
    ...profile,
    high_school_gpa_history: gpaHistory || [],
    subject_grades: subjectGrades || []
  };
};
