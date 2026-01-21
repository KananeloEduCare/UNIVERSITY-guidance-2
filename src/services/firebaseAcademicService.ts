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

export interface ActivityItem {
  id: string;
  name: string;
  description: string;
}

export interface Essay {
  title: string;
  text: string;
  createdAt: string;
  reviewed: boolean;
  universityName?: string;
  type: string;
}

export interface StudentProfileData {
  sat?: number;
  act?: number;
  dob?: string;
  nationality?: string;
  personalStatement?: Essay;
  activitiesList?: ActivityItem[];
  supplementaryEssays?: Essay[];
  careerInterests?: string[];
  specialCircumstances?: string;
}

export interface AcademicSummary {
  totalStudents: number;
  averageGrade: number;
  students: StudentAcademicData[];
}

export const getCounselorAcademicData = async (counselorName: string): Promise<AcademicSummary> => {
  try {
    console.log('=== FETCHING COUNSELOR ACADEMIC DATA (FIREBASE) ===');
    console.log('Counselor Name:', counselorName);

    const caseloadPath = `University Data/Caseloads/${counselorName}`;
    console.log('Firebase Path for Caseload:', caseloadPath);

    const caseloadRef = ref(database, caseloadPath);
    const caseloadSnapshot = await get(caseloadRef);

    console.log('1. Caseload Query Result:');
    console.log('   - Exists:', caseloadSnapshot.exists());
    console.log('   - Raw Data:', caseloadSnapshot.val());

    if (!caseloadSnapshot.exists()) {
      console.log('❌ No caseload found for counselor:', counselorName);
      return {
        totalStudents: 0,
        averageGrade: 0,
        students: []
      };
    }

    const caseloadData = caseloadSnapshot.val();
    const studentNames = Object.keys(caseloadData);
    console.log('2. Student Names in Caseload:', studentNames);
    console.log('   - Count:', studentNames.length);

    const students: StudentAcademicData[] = [];

    for (const studentName of studentNames) {
      console.log(`\n--- Processing Student: ${studentName} ---`);

      const academicPath = `University Data/Student Academics/${studentName}`;
      console.log('   Firebase Path:', academicPath);

      const studentAcademicRef = ref(database, academicPath);
      const studentSnapshot = await get(studentAcademicRef);

      console.log('   Snapshot Exists:', studentSnapshot.exists());
      console.log('   Raw Data:', studentSnapshot.val());

      if (studentSnapshot.exists()) {
        const studentData = studentSnapshot.val();

        const overallAverage = studentData['Overall Average'] || 0;
        console.log('   Overall Average:', overallAverage);

        const subjectAverages: SubjectAverage[] = [];
        if (studentData['Subject Averages']) {
          const subjects = studentData['Subject Averages'];
          console.log('   Subject Averages Data:', subjects);
          for (const subject in subjects) {
            subjectAverages.push({
              subject,
              grade: subjects[subject]
            });
          }
          console.log('   Parsed Subject Averages:', subjectAverages);
        } else {
          console.log('   ⚠️ No Subject Averages found for', studentName);
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

        const studentRecord = {
          studentName,
          overallAverage,
          numCourses: subjectAverages.length,
          subjectAverages,
          previousAverages
        };

        console.log('   ✅ Added Student Record:', studentRecord);
        students.push(studentRecord);
      } else {
        console.log(`   ❌ No academic data found for: ${studentName}`);
      }
    }

    const totalStudents = students.length;
    const averageGrade = totalStudents > 0
      ? students.reduce((sum, student) => sum + student.overallAverage, 0) / totalStudents
      : 0;

    console.log('\n=== FINAL SUMMARY ===');
    console.log('Total Students:', totalStudents);
    console.log('Average Grade:', Math.round(averageGrade * 10) / 10);
    console.log('Students Array:', students);
    console.log('=== END FETCH ===\n');

    return {
      totalStudents,
      averageGrade: Math.round(averageGrade * 10) / 10,
      students
    };
  } catch (error) {
    console.error('❌ ERROR in getCounselorAcademicData:', error);
    throw error;
  }
};

export const getStudentAcademicDetails = async (studentName: string): Promise<StudentAcademicData | null> => {
  try {
    const studentAcademicRef = ref(database, `University Data/Student Academics/${studentName}`);
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

export const getStudentProfileData = async (studentName: string): Promise<StudentProfileData> => {
  try {
    console.log(`🔍 Fetching profile data for: ${studentName}`);

    const academicsRef = ref(database, `University Data/Student Academics/${studentName}`);
    const profileRef = ref(database, `University Data/Student Profiles/${studentName}`);
    const essaysRef = ref(database, `University Data/Essays/${studentName}`);

    const [academicsSnap, profileSnap, essaysSnap] = await Promise.all([
      get(academicsRef),
      get(profileRef),
      get(essaysRef)
    ]);

    const profileData: StudentProfileData = {};

    if (academicsSnap.exists()) {
      const academicsData = academicsSnap.val();
      profileData.sat = academicsData.SAT;
      profileData.act = academicsData.ACT;
    }

    if (profileSnap.exists()) {
      const studentProfile = profileSnap.val();
      profileData.dob = studentProfile.DOB;
      profileData.nationality = studentProfile.Nationality;
      profileData.specialCircumstances = studentProfile['Special Circumstances'];

      if (studentProfile['Career interests']) {
        profileData.careerInterests = Object.keys(studentProfile['Career interests']);
      }
    }

    if (essaysSnap.exists()) {
      const essaysData = essaysSnap.val();
      const personalStatements: Essay[] = [];
      const supplementaryEssays: Essay[] = [];
      let activitiesEssay: { createdAt: string; activities: any } | null = null;

      for (const title in essaysData) {
        const essay = essaysData[title];
        const essayType = essay.essayType;

        if (essayType === 'personal_statement') {
          personalStatements.push({
            title,
            text: essay.essayText || '',
            createdAt: essay.createdAt || '',
            reviewed: !!essay.reviewData,
            type: 'personal_statement'
          });
        } else if (essayType === 'supplement') {
          supplementaryEssays.push({
            title,
            text: essay.essayText || '',
            createdAt: essay.createdAt || '',
            reviewed: !!essay.reviewData,
            universityName: essay.universityName,
            type: 'supplement'
          });
        } else if (essay.activities) {
          if (!activitiesEssay || essay.createdAt > activitiesEssay.createdAt) {
            activitiesEssay = {
              createdAt: essay.createdAt,
              activities: essay.activities
            };
          }
        }
      }

      if (personalStatements.length > 0) {
        personalStatements.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        profileData.personalStatement = personalStatements[0];
      }

      profileData.supplementaryEssays = supplementaryEssays;

      if (activitiesEssay) {
        const activities: ActivityItem[] = [];
        const activitiesData = activitiesEssay.activities;

        for (const key in activitiesData) {
          const activity = activitiesData[key];
          if (activity && activity.id) {
            activities.push({
              id: activity.id,
              name: activity.name || '',
              description: activity.description || ''
            });
          }
        }
        profileData.activitiesList = activities;
      }
    }

    return profileData;
  } catch (error) {
    console.error('Error fetching student profile data:', error);
    return {};
  }
};
