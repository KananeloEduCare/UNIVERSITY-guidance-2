import { database } from '../config/firebase';
import { ref, get, set } from 'firebase/database';

export interface PoolWeightings {
  essayWeight: number;
  currentAverageWeight: number;
  pastAverageWeight: number;
  excellentMin: number;
  excellentMax: number;
  strongMin: number;
  strongMax: number;
  competitiveMin: number;
  competitiveMax: number;
  developingMin: number;
  developingMax: number;
}

const DEFAULT_WEIGHTINGS: PoolWeightings = {
  essayWeight: 40,
  currentAverageWeight: 50,
  pastAverageWeight: 10,
  excellentMin: 90,
  excellentMax: 100,
  strongMin: 80,
  strongMax: 89,
  competitiveMin: 70,
  competitiveMax: 79,
  developingMin: 0,
  developingMax: 69
};

export const getPoolWeightings = async (counselorName: string): Promise<PoolWeightings> => {
  try {
    console.log('=== FETCHING POOL WEIGHTINGS (FIREBASE) ===');
    console.log('Counselor Name:', counselorName);

    const weightingsPath = `University Data/Pool Weightings/${counselorName}`;
    console.log('Firebase Path:', weightingsPath);

    const weightingsRef = ref(database, weightingsPath);
    const snapshot = await get(weightingsRef);

    console.log('Snapshot Exists:', snapshot.exists());
    console.log('Raw Data:', snapshot.val());

    if (!snapshot.exists()) {
      console.log('No weightings found, returning defaults');
      return DEFAULT_WEIGHTINGS;
    }

    const data = snapshot.val();

    const weightings: PoolWeightings = {
      essayWeight: data['Essays and Activities'] || DEFAULT_WEIGHTINGS.essayWeight,
      currentAverageWeight: data['Current Average'] || DEFAULT_WEIGHTINGS.currentAverageWeight,
      pastAverageWeight: data['Past Averages'] || DEFAULT_WEIGHTINGS.pastAverageWeight,
      excellentMin: parseInt(data['Competitiveness']?.['Excellent']?.split('-')[0]) || DEFAULT_WEIGHTINGS.excellentMin,
      excellentMax: parseInt(data['Competitiveness']?.['Excellent']?.split('-')[1]) || DEFAULT_WEIGHTINGS.excellentMax,
      strongMin: parseInt(data['Competitiveness']?.['Strong']?.split('-')[0]) || DEFAULT_WEIGHTINGS.strongMin,
      strongMax: parseInt(data['Competitiveness']?.['Strong']?.split('-')[1]) || DEFAULT_WEIGHTINGS.strongMax,
      competitiveMin: parseInt(data['Competitiveness']?.['Competitive']?.split('-')[0]) || DEFAULT_WEIGHTINGS.competitiveMin,
      competitiveMax: parseInt(data['Competitiveness']?.['Competitive']?.split('-')[1]) || DEFAULT_WEIGHTINGS.competitiveMax,
      developingMin: parseInt(data['Competitiveness']?.['Developing']?.split('-')[0]) || DEFAULT_WEIGHTINGS.developingMin,
      developingMax: parseInt(data['Competitiveness']?.['Developing']?.split('-')[1]) || DEFAULT_WEIGHTINGS.developingMax
    };

    console.log('Parsed Weightings:', weightings);
    console.log('=== END FETCH ===\n');

    return weightings;
  } catch (error) {
    console.error('❌ ERROR in getPoolWeightings:', error);
    return DEFAULT_WEIGHTINGS;
  }
};

export const savePoolWeightings = async (counselorName: string, weightings: PoolWeightings): Promise<void> => {
  try {
    console.log('=== SAVING POOL WEIGHTINGS (FIREBASE) ===');
    console.log('Counselor Name:', counselorName);
    console.log('Weightings:', weightings);

    const weightingsPath = `University Data/Pool Weightings/${counselorName}`;
    console.log('Firebase Path:', weightingsPath);

    const weightingsData = {
      'Essays and Activities': weightings.essayWeight,
      'Current Average': weightings.currentAverageWeight,
      'Past Averages': weightings.pastAverageWeight,
      'Competitiveness': {
        'Excellent': `${weightings.excellentMin}-${weightings.excellentMax}`,
        'Strong': `${weightings.strongMin}-${weightings.strongMax}`,
        'Competitive': `${weightings.competitiveMin}-${weightings.competitiveMax}`,
        'Developing': `${weightings.developingMin}-${weightings.developingMax}`
      }
    };

    console.log('Data to save:', weightingsData);

    const weightingsRef = ref(database, weightingsPath);
    await set(weightingsRef, weightingsData);

    console.log('✅ Weightings saved successfully');
    console.log('=== END SAVE ===\n');
  } catch (error) {
    console.error('❌ ERROR in savePoolWeightings:', error);
    throw error;
  }
};

export const calculateCompositeScore = (
  essayScore: number,
  currentAverage: number,
  pastAverage: number,
  weightings: PoolWeightings
): number => {
  const essayWeight = weightings.essayWeight / 100;
  const currentWeight = weightings.currentAverageWeight / 100;
  const pastWeight = weightings.pastAverageWeight / 100;

  return (essayScore * essayWeight) + (currentAverage * currentWeight) + (pastAverage * pastWeight);
};

export const getStrengthLabel = (
  compositeScore: number,
  weightings: PoolWeightings
): 'Strong' | 'Competitive' | 'Developing' => {
  if (compositeScore >= weightings.excellentMin && compositeScore <= weightings.excellentMax) {
    return 'Strong';
  }
  if (compositeScore >= weightings.strongMin && compositeScore <= weightings.strongMax) {
    return 'Strong';
  }
  if (compositeScore >= weightings.competitiveMin && compositeScore <= weightings.competitiveMax) {
    return 'Competitive';
  }
  return 'Developing';
};
