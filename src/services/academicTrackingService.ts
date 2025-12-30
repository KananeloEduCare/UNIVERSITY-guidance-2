import { supabase } from '../config/supabase';

export interface StudentCourse {
  id: string;
  student_id: string;
  course_name: string;
  course_code: string;
  current_grade: number;
  syllabus_completion: number;
  total_assignments: number;
  completed_assignments: number;
  created_at: string;
  updated_at: string;
}

export interface StudentAcademicSummary {
  student_id: string;
  student_name: string;
  num_courses: number;
  overall_average: number;
}

export interface StudentAcademicDetails {
  student_id: string;
  student_name: string;
  overall_average: number;
  overall_syllabus_completion: number;
  courses: StudentCourse[];
}

export const getStudentsAcademicSummary = async (): Promise<StudentAcademicSummary[]> => {
  const { data: students, error: studentsError } = await supabase
    .from('pool_students')
    .select('id, name');

  if (studentsError) throw studentsError;

  const summaries: StudentAcademicSummary[] = [];

  for (const student of students || []) {
    const { data: courses, error: coursesError } = await supabase
      .from('student_courses')
      .select('current_grade')
      .eq('student_id', student.id);

    if (coursesError) throw coursesError;

    const numCourses = courses?.length || 0;
    const overallAverage = numCourses > 0
      ? courses.reduce((sum, course) => sum + Number(course.current_grade), 0) / numCourses
      : 0;

    summaries.push({
      student_id: student.id,
      student_name: student.name,
      num_courses: numCourses,
      overall_average: Math.round(overallAverage * 100) / 100,
    });
  }

  return summaries;
};

export const getStudentAcademicDetails = async (studentId: string): Promise<StudentAcademicDetails | null> => {
  const { data: student, error: studentError } = await supabase
    .from('pool_students')
    .select('id, name')
    .eq('id', studentId)
    .maybeSingle();

  if (studentError) throw studentError;
  if (!student) return null;

  const { data: courses, error: coursesError } = await supabase
    .from('student_courses')
    .select('*')
    .eq('student_id', studentId)
    .order('course_name');

  if (coursesError) throw coursesError;

  const numCourses = courses?.length || 0;
  const overallAverage = numCourses > 0
    ? courses.reduce((sum, course) => sum + Number(course.current_grade), 0) / numCourses
    : 0;

  const overallSyllabusCompletion = numCourses > 0
    ? courses.reduce((sum, course) => sum + Number(course.syllabus_completion), 0) / numCourses
    : 0;

  return {
    student_id: student.id,
    student_name: student.name,
    overall_average: Math.round(overallAverage * 100) / 100,
    overall_syllabus_completion: Math.round(overallSyllabusCompletion * 100) / 100,
    courses: courses || [],
  };
};
