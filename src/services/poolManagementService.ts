import { database } from '../config/firebase';
import { ref, get } from 'firebase/database';
import { getPoolWeightings, calculateCompositeScore, getStrengthLabel, PoolWeightings } from './poolWeightingsService';

export interface PoolStudent {
  id: string;
  name: string;
  email: string;
  description: string;
  careerInterests: string[];
  essayActivities: number;
  academicPerformance: number;
  academicTrend: number;
  compositeStrength: number;
  strengthLabel: 'Strong' | 'Competitive' | 'Developing';
  composite_score: number;
  academic_performance: number;
  essay_activities_rating: number;
  academic_trend: number;
}

export interface PoolManagementData {
  activeStudents: PoolStudent[];
  totalActivePool: number;
  totalAssigned: number;
  averageStrength: number;
  progress: number;
}

export const getCounselorPoolData = async (counselorName: string): Promise<PoolManagementData> => {
  try {
    console.log('=== FETCHING COUNSELOR POOL DATA (FIREBASE) ===');
    console.log('Counselor Name:', counselorName);

    const weightings = await getPoolWeightings(counselorName);
    console.log('Loaded weightings:', weightings);

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
        activeStudents: [],
        totalActivePool: 0,
        totalAssigned: 0,
        averageStrength: 0,
        progress: 0
      };
    }

    const caseloadData = caseloadSnapshot.val();
    const studentNames = Object.keys(caseloadData);
    console.log('2. Student Names in Caseload:', studentNames);
    console.log('   - Count:', studentNames.length);

    const activeStudents: PoolStudent[] = [];

    for (const studentName of studentNames) {
      console.log(`\n--- Processing Student: ${studentName} ---`);

      const poolManagementPath = `University Data/Pool management/${studentName}`;
      console.log('   Pool Management Path:', poolManagementPath);

      const poolRef = ref(database, poolManagementPath);
      const poolSnapshot = await get(poolRef);

      console.log('   Pool Snapshot Exists:', poolSnapshot.exists());
      console.log('   Pool Raw Data:', poolSnapshot.val());

      if (!poolSnapshot.exists()) {
        console.log(`   ⚠️ No pool management data for: ${studentName}`);
        continue;
      }

      const poolData = poolSnapshot.val();

      const description = poolData['Description'] || 'No description available';
      const essayAverage = poolData['Essays Average'] || 0;
      console.log('   Description:', description);
      console.log('   Essays Average:', essayAverage);

      const careerInterestsObj = poolData['Career Interests'] || {};
      const careerInterests: string[] = Object.keys(careerInterestsObj).filter(
        key => careerInterestsObj[key] === true
      );
      console.log('   Career Interests:', careerInterests);

      const academicPath = `University Data/Student Academics/${studentName}`;
      console.log('   Academic Path:', academicPath);

      const academicRef = ref(database, academicPath);
      const academicSnapshot = await get(academicRef);

      console.log('   Academic Snapshot Exists:', academicSnapshot.exists());
      console.log('   Academic Raw Data:', academicSnapshot.val());

      if (!academicSnapshot.exists()) {
        console.log(`   ⚠️ No academic data for: ${studentName}`);
        continue;
      }

      const academicData = academicSnapshot.val();
      const overallAverage = academicData['Overall Average'] || 0;
      const pastOverallAverage = academicData['Past Overall Average'] || 0;
      console.log('   Overall Average:', overallAverage);
      console.log('   Past Overall Average:', pastOverallAverage);

      const compositeStrength = calculateCompositeScore(essayAverage, overallAverage, pastOverallAverage, weightings);
      const strengthLabel = getStrengthLabel(compositeStrength, weightings);

      const student: PoolStudent = {
        id: studentName.replace(/\s+/g, '-').toLowerCase(),
        name: studentName,
        email: `${studentName.replace(/\s+/g, '.').toLowerCase()}@example.com`,
        description,
        careerInterests,
        essayActivities: essayAverage,
        academicPerformance: overallAverage,
        academicTrend: pastOverallAverage,
        compositeStrength: Math.round(compositeStrength * 10) / 10,
        strengthLabel,
        composite_score: Math.round(compositeStrength * 10) / 10,
        academic_performance: overallAverage,
        essay_activities_rating: essayAverage,
        academic_trend: pastOverallAverage
      };

      console.log('   ✅ Added Student:', student);
      activeStudents.push(student);
    }

    const totalActivePool = activeStudents.length;
    const averageStrength = totalActivePool > 0
      ? activeStudents.reduce((sum, student) => sum + student.compositeStrength, 0) / totalActivePool
      : 0;

    console.log('\n=== FINAL POOL SUMMARY ===');
    console.log('Total Active Pool:', totalActivePool);
    console.log('Average Strength:', Math.round(averageStrength * 10) / 10);
    console.log('Students:', activeStudents);
    console.log('=== END FETCH ===\n');

    return {
      activeStudents,
      totalActivePool,
      totalAssigned: 0,
      averageStrength: Math.round(averageStrength * 10) / 10,
      progress: 0
    };
  } catch (error) {
    console.error('❌ ERROR in getCounselorPoolData:', error);
    throw error;
  }
};
