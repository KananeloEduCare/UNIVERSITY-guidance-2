import { supabase } from '../config/supabase';
import { database } from '../config/firebase';
import { ref, get } from 'firebase/database';

export interface UniversityAssignment {
  id: string;
  university_name: string;
  university_tier: 'reach' | 'mid' | 'safety';
  assigned_at: string;
  progress?: ApplicationProgress;
}

export interface ApplicationProgress {
  id: string;
  assignment_id: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'accepted' | 'rejected' | 'deferred' | 'waitlisted';
  application_deadline: string | null;
  decision_date: string | null;
  notes: string;
  documents_needed: string[];
  documents_completed: string[];
  essay_status: 'not_started' | 'draft' | 'review' | 'final';
  recommendation_letters: number;
  recommendation_letters_needed: number;
  updated_at: string;
}

export interface AssignedStudent {
  id: string;
  name: string;
  email: string;
  essay_activities_rating: number;
  academic_performance: number;
  academic_trend: number;
  composite_score: number;
  universities: UniversityAssignment[];
}

export const getAssignedStudentDetails = async (
  studentId: string,
  counselorId: string
): Promise<AssignedStudent | null> => {
  const { data: student, error: studentError } = await supabase
    .from('pool_students')
    .select('*')
    .eq('id', studentId)
    .eq('counselor_id', counselorId)
    .maybeSingle();

  if (studentError || !student) {
    console.error('Error fetching student:', studentError);
    return null;
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from('university_assignments')
    .select('*')
    .eq('student_id', studentId)
    .eq('counselor_id', counselorId)
    .order('assigned_at', { ascending: false });

  if (assignmentsError) {
    console.error('Error fetching assignments:', assignmentsError);
    return null;
  }

  const universitiesWithProgress = await Promise.all(
    (assignments || []).map(async (assignment) => {
      const { data: progress } = await supabase
        .from('application_progress')
        .select('*')
        .eq('assignment_id', assignment.id)
        .maybeSingle();

      return {
        ...assignment,
        progress: progress || undefined,
      };
    })
  );

  return {
    ...student,
    universities: universitiesWithProgress,
  };
};

export const updateApplicationProgress = async (
  progressId: string,
  updates: Partial<ApplicationProgress>,
  counselorId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('application_progress')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', progressId)
    .eq('counselor_id', counselorId);

  if (error) {
    console.error('Error updating progress:', error);
    return false;
  }

  return true;
};

export const createApplicationProgress = async (
  assignmentId: string,
  studentId: string,
  counselorId: string,
  data: Partial<ApplicationProgress>
): Promise<ApplicationProgress | null> => {
  const { data: progress, error } = await supabase
    .from('application_progress')
    .insert({
      assignment_id: assignmentId,
      student_id: studentId,
      counselor_id: counselorId,
      ...data,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating progress:', error);
    return null;
  }

  return progress;
};

export const removeUniversityAssignment = async (
  assignmentId: string,
  counselorId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('university_assignments')
    .delete()
    .eq('id', assignmentId)
    .eq('counselor_id', counselorId);

  if (error) {
    console.error('Error removing assignment:', error);
    return false;
  }

  return true;
};

export interface FirebaseUniversityAssignment {
  name: string;
  tier: 'Reach' | 'Mid' | 'Safety';
}

export interface FirebaseAssignedStudent {
  id: string;
  name: string;
  email: string;
  universities: FirebaseUniversityAssignment[];
  assignedCount: number;
  compositeScore: number;
}

export const getAssignedStudentsFromFirebase = async (counselorName: string): Promise<FirebaseAssignedStudent[]> => {
  try {
    console.log('=== FETCHING ASSIGNED STUDENTS (FIREBASE) ===');
    console.log('Counselor Name:', counselorName);

    const caseloadPath = `University Data/Caseloads/${counselorName}`;
    console.log('Firebase Path for Caseload:', caseloadPath);

    const caseloadRef = ref(database, caseloadPath);
    const caseloadSnapshot = await get(caseloadRef);

    console.log('Caseload Exists:', caseloadSnapshot.exists());
    console.log('Raw Caseload Data:', caseloadSnapshot.val());

    if (!caseloadSnapshot.exists()) {
      console.log('❌ No caseload found for counselor:', counselorName);
      return [];
    }

    const caseloadData = caseloadSnapshot.val();
    const studentNames = Object.keys(caseloadData);
    console.log('Student Names in Caseload:', studentNames);
    console.log('Count:', studentNames.length);

    const assignedStudents: FirebaseAssignedStudent[] = [];

    for (const studentName of studentNames) {
      console.log(`\n--- Checking Student: ${studentName} ---`);

      const assignedStudentsPath = `University Data/Assigned Students/${studentName}/Universities`;
      console.log('   Assigned Students Path:', assignedStudentsPath);

      const assignedRef = ref(database, assignedStudentsPath);
      const assignedSnapshot = await get(assignedRef);

      console.log('   Assigned Snapshot Exists:', assignedSnapshot.exists());
      console.log('   Raw Universities Data:', assignedSnapshot.val());

      if (!assignedSnapshot.exists()) {
        console.log(`   ⏭️ No assigned universities for: ${studentName}`);
        continue;
      }

      const universitiesData = assignedSnapshot.val();
      const universities: FirebaseUniversityAssignment[] = [];

      for (const [universityName, tier] of Object.entries(universitiesData)) {
        universities.push({
          name: universityName,
          tier: tier as 'Reach' | 'Mid' | 'Safety'
        });
      }

      console.log('   Universities:', universities);

      const poolStrengthPath = `University Data/Pool Strength/${studentName}`;
      console.log('   Pool Strength Path:', poolStrengthPath);

      const poolStrengthRef = ref(database, poolStrengthPath);
      const poolStrengthSnapshot = await get(poolStrengthRef);

      const compositeScore = poolStrengthSnapshot.exists() ? poolStrengthSnapshot.val() : 0;
      console.log('   Composite Score:', compositeScore);

      const assignedStudent: FirebaseAssignedStudent = {
        id: studentName.replace(/\s+/g, '-').toLowerCase(),
        name: studentName,
        email: `${studentName.replace(/\s+/g, '.').toLowerCase()}@example.com`,
        universities,
        assignedCount: universities.length,
        compositeScore
      };

      console.log('   ✅ Added Assigned Student:', assignedStudent);
      assignedStudents.push(assignedStudent);
    }

    console.log('\n=== ASSIGNED STUDENTS SUMMARY ===');
    console.log('Total Assigned Students:', assignedStudents.length);
    console.log('Students:', assignedStudents);
    console.log('=== END FETCH ===\n');

    return assignedStudents;
  } catch (error) {
    console.error('❌ ERROR in getAssignedStudentsFromFirebase:', error);
    throw error;
  }
};
