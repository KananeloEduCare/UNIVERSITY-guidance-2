import { supabase } from '../config/supabase';
import { database } from '../config/firebase';
import { ref, set, update } from 'firebase/database';

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
    studentName: string,
    universities: Array<{ name: string; tier: 'reach' | 'mid' | 'safety' }>
  ): Promise<void> => {
    try {
      console.log('=== ASSIGNING UNIVERSITIES (FIREBASE) ===');
      console.log('Student Name:', studentName);
      console.log('Universities:', universities);

      const universitiesData: { [key: string]: string } = {};
      universities.forEach(uni => {
        const tierLabel = uni.tier.charAt(0).toUpperCase() + uni.tier.slice(1);
        universitiesData[uni.name] = tierLabel;
      });

      const assignedStudentsPath = `University Data/Assigned Students/${studentName}/Universities`;
      console.log('Firebase Path for Assignments:', assignedStudentsPath);
      console.log('Data to save:', universitiesData);

      const assignedStudentsRef = ref(database, assignedStudentsPath);
      await set(assignedStudentsRef, universitiesData);

      const poolManagementPath = `University Data/Pool management/${studentName}`;
      console.log('Firebase Path for Pool Management:', poolManagementPath);

      const poolManagementRef = ref(database, poolManagementPath);
      await update(poolManagementRef, {
        Assigned: true
      });

      console.log('✅ Universities assigned successfully');
      console.log('=== END ASSIGNMENT ===\n');
    } catch (error) {
      console.error('❌ ERROR in assignUniversities:', error);
      throw error;
    }
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
