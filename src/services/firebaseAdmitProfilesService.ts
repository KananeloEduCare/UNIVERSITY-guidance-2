import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';

export interface FirebaseAdmitProfile {
  id: string;
  name: string;
  country: string;
  profile_image_url: string;
  current_university: string;
  university_location: string;
  application_round: string;
  graduation_year?: string;
  extracurricular_activities: string[];
  personal_statement: string;
  university_experience?: string;
  financial_aid_received: string;
  first_generation: boolean;
  linkedin_handle?: string;
  instagram_handle?: string;
  current_major: string;
  overall_percentage?: number;
  sat_score?: number;
  act_score?: number;
  university_image_url?: string;
  high_school_gpa_history?: { [key: string]: string };
  subject_grades?: { [key: string]: string };
}

const SCHOOL_NAME = 'Soofia International School';
const ADMISSION_STORIES_NODE = 'Admission Stories';

export const getAllFirebaseAdmitProfiles = async (): Promise<FirebaseAdmitProfile[]> => {
  try {
    const admissionStoriesRef = ref(database, `Schoolss/${SCHOOL_NAME}/${ADMISSION_STORIES_NODE}`);
    const snapshot = await get(admissionStoriesRef);

    if (!snapshot.exists()) {
      console.log('No admission stories found');
      return [];
    }

    const data = snapshot.val();
    const profiles: FirebaseAdmitProfile[] = [];

    Object.keys(data).forEach((personName) => {
      const personData = data[personName];

      const extracurriculars: string[] = [];
      if (personData['Extra Curricular Activities']) {
        Object.keys(personData['Extra Curricular Activities']).forEach((activity) => {
          if (personData['Extra Curricular Activities'][activity]) {
            extracurriculars.push(activity);
          }
        });
      }

      const profile: FirebaseAdmitProfile = {
        id: personName.replace(/\s+/g, '-').toLowerCase(),
        name: personData['Name'] || personName,
        country: personData['Country'] || '',
        profile_image_url: personData['Profile Picture'] || '',
        current_university: personData['Accepted to'] || '',
        university_location: personData['Uni Location'] || '',
        application_round: personData['Application round'] || '',
        graduation_year: personData['Graduation Class'] || '',
        extracurricular_activities: extracurriculars,
        personal_statement: personData['Personal Statement'] || '',
        university_experience: personData['Uni Experience'] || '',
        financial_aid_received: personData['Financial Aid'] || 'N/A',
        first_generation: personData['First gen'] === 'Yes',
        linkedin_handle: personData['Linkedin'] !== 'N/A' ? personData['Linkedin'] : undefined,
        instagram_handle: personData['Instagram'] !== 'N/A' ? personData['Instagram'] : undefined,
        current_major: personData['Major'] || '',
        overall_percentage: personData['Overall Average']
          ? parseFloat(personData['Overall Average'].replace('%', ''))
          : undefined,
        sat_score: personData['SAT score'] || undefined,
        act_score: personData['ACT score'] || undefined,
        university_image_url: personData['background picture'] || undefined,
        high_school_gpa_history: personData['Highschool History'] || {},
        subject_grades: personData['Latest Transcripts Submitted'] || {}
      };

      profiles.push(profile);
    });

    return profiles;
  } catch (error) {
    console.error('Error fetching Firebase admission stories:', error);
    throw error;
  }
};

export const getFirebaseAdmitProfileById = async (id: string): Promise<FirebaseAdmitProfile | null> => {
  try {
    const profiles = await getAllFirebaseAdmitProfiles();
    return profiles.find(profile => profile.id === id) || null;
  } catch (error) {
    console.error('Error fetching Firebase admit profile by ID:', error);
    throw error;
  }
};
