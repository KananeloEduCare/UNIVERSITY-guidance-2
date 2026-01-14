import { database } from '../config/firebase';
import { ref, get } from 'firebase/database';

export interface SubjectAverage {
  subject: string;
  grade: number;
}

export interface PreviousYearData {
  year: string;
  overallAverage: number;
  subjects: SubjectAverage[];
}

export interface StudentAcademicData {
  studentName: string;
  overallAverage: number;
  numCourses: number;
  subjectAverages: SubjectAverage[];
  previousAverages: PreviousYearData[];
}

export interface AcademicSummary {
  totalStudents: number;
  averageGrade: number;
  students: StudentAcademicData[];
}

export const getCounselorAcademicData = async (counselorName: string): Promise<AcademicSummary> => {
  try {
    const caseloadRef = ref(database, `Schoolss/University Data/Caseloads/${counselorName}`);
    const caseloadSnapshot = await get(caseloadRef);

    if (!caseloadSnapshot.exists()) {
      return {
        totalStudents: 0,
        averageGrade: 0,
        students: []
      };
    }

    const caseloadData = caseloadSnapshot.val();
    const studentNames = Object.keys(caseloadData);
    const students: StudentAcademicData[] = [];

    for (const studentName of studentNames) {
      const studentAcademicRef = ref(database, `Schoolss/University Data/Student Academics/${studentName}`);
      const studentSnapshot = await get(studentAcademicRef);

      if (studentSnapshot.exists()) {
        const studentData = studentSnapshot.val();

        const overallAverage = studentData['Overall Average'] || 0;

        const subjectAverages: SubjectAverage[] = [];
        if (studentData['Subject Averages']) {
          const subjects = studentData['Subject Averages'];
          for (const subject in subjects) {
            subjectAverages.push({
              subject,
              grade: subjects[subject]
            });
          }
        }

        const previousAverages: PreviousYearData[] = [];
        if (studentData['Previous averages']) {
          const previousData = studentData['Previous averages'];
          for (const yearKey in previousData) {
            const yearData = previousData[yearKey];
            const yearSubjects: SubjectAverage[] = [];
            let yearOverallAverage = 0;

            for (const key in yearData) {
              if (key === 'Overall Average') {
                yearOverallAverage = yearData[key];
              } else {
                yearSubjects.push({
                  subject: key,
                  grade: yearData[key]
                });
              }
            }

            previousAverages.push({
              year: yearKey,
              overallAverage: yearOverallAverage,
              subjects: yearSubjects
            });
          }
        }

        students.push({
          studentName,
          overallAverage,
          numCourses: subjectAverages.length,
          subjectAverages,
          previousAverages
        });
      }
    }

    const totalStudents = students.length;
    const averageGrade = totalStudents > 0
      ? students.reduce((sum, student) => sum + student.overallAverage, 0) / totalStudents
      : 0;

    return {
      totalStudents,
      averageGrade: Math.round(averageGrade * 10) / 10,
      students
    };
  } catch (error) {
    console.error('Error fetching counselor academic data:', error);
    throw error;
  }
};

export const getStudentAcademicDetails = async (studentName: string): Promise<StudentAcademicData | null> => {
  try {
    const studentAcademicRef = ref(database, `Schoolss/University Data/Student Academics/${studentName}`);
    const studentSnapshot = await get(studentAcademicRef);

    if (!studentSnapshot.exists()) {
      return null;
    }

    const studentData = studentSnapshot.val();

    const overallAverage = studentData['Overall Average'] || 0;

    const subjectAverages: SubjectAverage[] = [];
    if (studentData['Subject Averages']) {
      const subjects = studentData['Subject Averages'];
      for (const subject in subjects) {
        subjectAverages.push({
          subject,
          grade: subjects[subject]
        });
      }
    }

    const previousAverages: PreviousYearData[] = [];
    if (studentData['Previous averages']) {
      const previousData = studentData['Previous averages'];
      for (const yearKey in previousData) {
        const yearData = previousData[yearKey];
        const yearSubjects: SubjectAverage[] = [];
        let yearOverallAverage = 0;

        for (const key in yearData) {
          if (key === 'Overall Average') {
            yearOverallAverage = yearData[key];
          } else {
            yearSubjects.push({
              subject: key,
              grade: yearData[key]
            });
          }
        }

        previousAverages.push({
          year: yearKey,
          overallAverage: yearOverallAverage,
          subjects: yearSubjects
        });
      }
    }

    return {
      studentName,
      overallAverage,
      numCourses: subjectAverages.length,
      subjectAverages,
      previousAverages
    };
  } catch (error) {
    console.error('Error fetching student academic details:', error);
    throw error;
  }
};
