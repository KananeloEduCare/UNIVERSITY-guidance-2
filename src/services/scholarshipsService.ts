import { database } from '../config/firebase';
import { ref, get } from 'firebase/database';

export interface FirebaseScholarship {
  'Award amount': string;
  Deadline: string;
  Description: string;
  Link: string;
  'Icon link'?: string;
  'Eligibility Criteria'?: { [key: string]: string };
  Requirements?: { [key: string]: string };
}

export interface Scholarship {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  description: string;
  link: string;
  iconUrl?: string;
  eligibility: string[];
  requirements: string[];
}

class ScholarshipsService {
  private readonly SCHOOL_NAME = 'Soofia International School';

  async fetchScholarshipsFromFirebase(): Promise<Scholarship[]> {
    try {
      console.log('=== FETCHING SCHOLARSHIPS FROM FIREBASE ===');

      const scholarshipsRef = ref(database, `Schoolss/${this.SCHOOL_NAME}/Scholarships`);
      const snapshot = await get(scholarshipsRef);

      if (!snapshot.exists()) {
        console.log('No Scholarships node found for', this.SCHOOL_NAME);
        return [];
      }

      const scholarshipsData = snapshot.val();
      console.log('Found scholarships data:', scholarshipsData);

      const scholarships: Scholarship[] = [];

      Object.entries(scholarshipsData).forEach(([scholarshipName, scholarshipData]) => {
        if (scholarshipData && typeof scholarshipData === 'object') {
          const data = scholarshipData as FirebaseScholarship;

          const eligibility: string[] = [];
          if (data['Eligibility Criteria']) {
            Object.values(data['Eligibility Criteria']).forEach(criteria => {
              if (criteria) {
                eligibility.push(criteria);
              }
            });
          }

          const requirements: string[] = [];
          if (data.Requirements) {
            Object.values(data.Requirements).forEach(requirement => {
              if (requirement) {
                requirements.push(requirement);
              }
            });
          }

          scholarships.push({
            id: scholarshipName.replace(/\s+/g, '-').toLowerCase(),
            name: scholarshipName,
            amount: data['Award amount'] || '',
            deadline: data.Deadline || '',
            description: data.Description || '',
            link: data.Link || '',
            iconUrl: data['Icon link'],
            eligibility,
            requirements
          });

          console.log(`Extracted scholarship: ${scholarshipName}`, {
            amount: data['Award amount'],
            deadline: data.Deadline,
            iconUrl: data['Icon link'],
            eligibilityCriteria: eligibility.length,
            requirements: requirements.length
          });
        }
      });

      console.log(`✅ Successfully fetched ${scholarships.length} scholarships`);
      return scholarships;

    } catch (error) {
      console.error('❌ Error fetching scholarships from Firebase:', error);
      return [];
    }
  }
}

export const scholarshipsService = new ScholarshipsService();
