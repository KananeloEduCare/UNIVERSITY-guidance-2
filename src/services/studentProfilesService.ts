import { supabase } from '../config/supabase';

export interface StudentProfile {
  id: string;
  student_id: string;
  date_of_birth: string;
  nationality: string;
  financial_budget: number;
  career_interests: string;
  personal_statement: string;
  extracurricular_activities: string;
  special_circumstances: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    name: string;
    email: string;
    academic_performance: number;
    essay_activities_rating: number;
    composite_score: number;
  };
}

export const getStudentProfiles = async (): Promise<StudentProfile[]> => {
  const { data, error } = await supabase
    .from('student_profiles')
    .select(`
      *,
      student:pool_students (
        id,
        name,
        email,
        academic_performance,
        essay_activities_rating,
        composite_score
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching student profiles:', error);
    throw error;
  }

  return data || [];
};

export const getStudentProfileById = async (id: string): Promise<StudentProfile | null> => {
  const { data, error } = await supabase
    .from('student_profiles')
    .select(`
      *,
      student:pool_students (
        id,
        name,
        email,
        academic_performance,
        essay_activities_rating,
        composite_score
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching student profile:', error);
    throw error;
  }

  return data;
};

export const updateStudentProfile = async (
  id: string,
  updates: Partial<StudentProfile>
): Promise<StudentProfile> => {
  const { data, error } = await supabase
    .from('student_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating student profile:', error);
    throw error;
  }

  return data;
};
