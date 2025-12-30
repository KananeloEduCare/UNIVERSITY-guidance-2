import { supabase } from '../config/supabase';

export interface PoolStudent {
  id: string;
  counselor_id: string;
  name: string;
  email: string;
  essay_activities_rating: number;
  academic_performance: number;
  academic_trend: number;
  composite_score: number;
  status: 'active' | 'assigned';
  created_at: string;
  updated_at: string;
}

export interface UniversityAssignment {
  id: string;
  student_id: string;
  counselor_id: string;
  university_name: string;
  university_tier: 'reach' | 'mid' | 'safety';
  assigned_at: string;
}

export const poolStudentsService = {
  getActiveStudents: async (counselorId: string): Promise<PoolStudent[]> => {
    const { data, error } = await supabase
      .from('pool_students')
      .select('*')
      .eq('counselor_id', counselorId)
      .eq('status', 'active')
      .order('composite_score', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getAssignedStudents: async (counselorId: string): Promise<PoolStudent[]> => {
    const { data, error } = await supabase
      .from('pool_students')
      .select('*')
      .eq('counselor_id', counselorId)
      .eq('status', 'assigned')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getStudentById: async (studentId: string): Promise<PoolStudent | null> => {
    const { data, error } = await supabase
      .from('pool_students')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  assignUniversities: async (
    studentId: string,
    counselorId: string,
    universities: Array<{ name: string; tier: 'reach' | 'mid' | 'safety' }>
  ): Promise<void> => {
    const assignments = universities.map(uni => ({
      student_id: studentId,
      counselor_id: counselorId,
      university_name: uni.name,
      university_tier: uni.tier,
    }));

    const { error: assignError } = await supabase
      .from('university_assignments')
      .insert(assignments);

    if (assignError) throw assignError;

    const { error: updateError } = await supabase
      .from('pool_students')
      .update({ status: 'assigned', updated_at: new Date().toISOString() })
      .eq('id', studentId);

    if (updateError) throw updateError;
  },

  getStudentAssignments: async (studentId: string): Promise<UniversityAssignment[]> => {
    const { data, error } = await supabase
      .from('university_assignments')
      .select('*')
      .eq('student_id', studentId)
      .order('assigned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  addStudent: async (student: Omit<PoolStudent, 'id' | 'created_at' | 'updated_at'>): Promise<PoolStudent> => {
    const { data, error } = await supabase
      .from('pool_students')
      .insert(student)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
