import { supabase } from '../config/supabase';
import { ref, set, remove } from 'firebase/database';
import { database } from '../config/firebase';

export interface CounselorScholarship {
  id: string;
  counselor_id: string;
  name: string;
  logo_url?: string;
  description: string;
  award_amount: string;
  deadline: string;
  eligibility_criteria: string | string[];
  requirements: string | string[];
  application_link: string;
  created_at: string;
}

export const counselorScholarshipsService = {
  getAll: async (counselorId: string): Promise<CounselorScholarship[]> => {
    const { data, error } = await supabase
      .from('counselor_scholarships')
      .select('*')
      .eq('counselor_id', counselorId)
      .order('deadline', { ascending: true });

    if (error) throw error;

    const scholarships = (data || []).map(scholarship => ({
      ...scholarship,
      eligibility_criteria: typeof scholarship.eligibility_criteria === 'string'
        ? JSON.parse(scholarship.eligibility_criteria)
        : scholarship.eligibility_criteria,
      requirements: typeof scholarship.requirements === 'string'
        ? JSON.parse(scholarship.requirements)
        : scholarship.requirements,
    }));

    return scholarships;
  },

  create: async (
    scholarship: Omit<CounselorScholarship, 'id' | 'created_at'>
  ): Promise<CounselorScholarship> => {
    const { data, error } = await supabase
      .from('counselor_scholarships')
      .insert(scholarship)
      .select()
      .single();

    if (error) throw error;

    try {
      const eligibilityCriteria = Array.isArray(scholarship.eligibility_criteria)
        ? scholarship.eligibility_criteria
        : [scholarship.eligibility_criteria];

      const requirements = Array.isArray(scholarship.requirements)
        ? scholarship.requirements
        : [scholarship.requirements];

      const eligibilityObj: Record<string, string> = {};
      eligibilityCriteria.forEach((criteria, idx) => {
        eligibilityObj[String(idx + 1)] = criteria;
      });

      const requirementsObj: Record<string, string> = {};
      requirements.forEach((requirement, idx) => {
        requirementsObj[String(idx + 1)] = requirement;
      });

      const scholarshipRef = ref(database, `University Data/Scholarships/${scholarship.name}`);
      await set(scholarshipRef, {
        'Award amount': scholarship.award_amount,
        'Deadline': scholarship.deadline,
        'Description': scholarship.description,
        'Icon link': scholarship.logo_url || '',
        'Link': scholarship.application_link,
        'Eligibility Criteria': eligibilityObj,
        'Requirements': requirementsObj,
      });
      console.log('Scholarship saved to Firebase successfully');
    } catch (firebaseError) {
      console.error('Error saving to Firebase:', firebaseError);
      console.log('Scholarship saved to Supabase, but Firebase sync failed');
    }

    return {
      ...data,
      eligibility_criteria: typeof data.eligibility_criteria === 'string'
        ? JSON.parse(data.eligibility_criteria)
        : data.eligibility_criteria,
      requirements: typeof data.requirements === 'string'
        ? JSON.parse(data.requirements)
        : data.requirements,
    };
  },

  update: async (
    id: string,
    updates: Partial<Omit<CounselorScholarship, 'id' | 'created_at' | 'counselor_id'>>
  ): Promise<CounselorScholarship> => {
    const { data: existingData, error: fetchError } = await supabase
      .from('counselor_scholarships')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('counselor_scholarships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    try {
      const oldName = existingData.name;
      const newName = updates.name || oldName;

      if (oldName !== newName) {
        const oldRef = ref(database, `University Data/Scholarships/${oldName}`);
        await remove(oldRef);
      }

      const eligibilityCriteria = Array.isArray(updates.eligibility_criteria)
        ? updates.eligibility_criteria
        : updates.eligibility_criteria
        ? [updates.eligibility_criteria]
        : Array.isArray(existingData.eligibility_criteria)
        ? existingData.eligibility_criteria
        : [existingData.eligibility_criteria];

      const requirements = Array.isArray(updates.requirements)
        ? updates.requirements
        : updates.requirements
        ? [updates.requirements]
        : Array.isArray(existingData.requirements)
        ? existingData.requirements
        : [existingData.requirements];

      const eligibilityObj: Record<string, string> = {};
      eligibilityCriteria.forEach((criteria, idx) => {
        eligibilityObj[String(idx + 1)] = criteria;
      });

      const requirementsObj: Record<string, string> = {};
      requirements.forEach((requirement, idx) => {
        requirementsObj[String(idx + 1)] = requirement;
      });

      const scholarshipRef = ref(database, `University Data/Scholarships/${newName}`);
      await set(scholarshipRef, {
        'Award amount': updates.award_amount || existingData.award_amount,
        'Deadline': updates.deadline || existingData.deadline,
        'Description': updates.description || existingData.description,
        'Icon link': updates.logo_url !== undefined ? updates.logo_url : (existingData.logo_url || ''),
        'Link': updates.application_link || existingData.application_link,
        'Eligibility Criteria': eligibilityObj,
        'Requirements': requirementsObj,
      });
      console.log('Scholarship updated in Firebase successfully');
    } catch (firebaseError) {
      console.error('Error updating Firebase:', firebaseError);
      console.log('Scholarship updated in Supabase, but Firebase sync failed');
    }

    return {
      ...data,
      eligibility_criteria: typeof data.eligibility_criteria === 'string'
        ? JSON.parse(data.eligibility_criteria)
        : data.eligibility_criteria,
      requirements: typeof data.requirements === 'string'
        ? JSON.parse(data.requirements)
        : data.requirements,
    };
  },

  delete: async (id: string): Promise<void> => {
    const { data: scholarship, error: fetchError } = await supabase
      .from('counselor_scholarships')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('counselor_scholarships')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (scholarship) {
      try {
        const scholarshipRef = ref(database, `University Data/Scholarships/${scholarship.name}`);
        await remove(scholarshipRef);
        console.log('Scholarship removed from Firebase successfully');
      } catch (firebaseError) {
        console.error('Error removing from Firebase:', firebaseError);
        console.log('Scholarship deleted from Supabase, but Firebase sync failed');
      }
    }
  },
};
