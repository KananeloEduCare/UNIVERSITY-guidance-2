import { ref, set, remove, get } from 'firebase/database';
import { database } from '../config/firebase';

export interface CounselorResource {
  id: string;
  counselor_id: string;
  resource_type: 'video' | 'article' | 'guide' | 'other';
  title: string;
  creator: string;
  description: string;
  key_topics: string[];
  time_estimate: string;
  link: string;
  category: 'essays' | 'financial_aid' | 'applications' | 'interviews' | 'general';
  created_at: string;
}

const capitalizeType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatCategory = (category: string) => {
  if (category === 'financial_aid') return 'Financial Aid';
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export const counselorResourcesService = {
  getAll: async (counselorId: string): Promise<CounselorResource[]> => {
    try {
      const resourcesRef = ref(database, 'University Data/Resources');
      const snapshot = await get(resourcesRef);

      if (!snapshot.exists()) {
        return [];
      }

      const resourcesData = snapshot.val();
      const resources: CounselorResource[] = [];

      Object.entries(resourcesData).forEach(([title, data]: [string, any]) => {
        const keyTopics: string[] = [];
        if (data['Key Words']) {
          Object.keys(data['Key Words']).forEach(topic => {
            keyTopics.push(topic);
          });
        }

        const categoryMap: Record<string, 'essays' | 'financial_aid' | 'applications' | 'interviews' | 'general'> = {
          'Essays': 'essays',
          'Financial Aid': 'financial_aid',
          'Applications': 'applications',
          'Interviews': 'interviews',
          'General': 'general'
        };

        resources.push({
          id: title,
          counselor_id: counselorId,
          resource_type: (data['Resource Type']?.toLowerCase() || 'other') as 'video' | 'article' | 'guide' | 'other',
          title: data['name'] || title,
          creator: data['Owner'] || '',
          description: data['Description'] || '',
          key_topics: keyTopics,
          time_estimate: data['Duration'] || '',
          link: data['Link'] || '',
          category: categoryMap[data['Helps with']] || 'general',
          created_at: new Date().toISOString(),
        });
      });

      return resources;
    } catch (error) {
      console.error('Error loading resources from Firebase:', error);
      throw error;
    }
  },

  getByCategory: async (counselorId: string, category: string): Promise<CounselorResource[]> => {
    const allResources = await counselorResourcesService.getAll(counselorId);
    return allResources.filter(r => r.category === category);
  },

  create: async (
    resource: Omit<CounselorResource, 'id' | 'created_at'>
  ): Promise<CounselorResource> => {
    console.log('counselorResourcesService.create called with:', resource);

    try {
      if (!database) {
        throw new Error('Firebase database is not initialized');
      }

      const keyWordsObj: Record<string, boolean> = {};
      resource.key_topics.forEach((topic) => {
        keyWordsObj[topic] = true;
      });

      console.log('Key words object:', keyWordsObj);

      const path = `University Data/Resources/${resource.title}`;
      console.log('Writing to Firebase path:', path);

      const resourceRef = ref(database, path);

      const dataToWrite = {
        'name': resource.title,
        'Resource Type': capitalizeType(resource.resource_type),
        'Owner': resource.creator,
        'Description': resource.description,
        'Key Words': keyWordsObj,
        'Duration': resource.time_estimate,
        'Link': resource.link,
        'Helps with': formatCategory(resource.category),
      };

      console.log('Data to write:', dataToWrite);

      await set(resourceRef, dataToWrite);

      console.log('Resource saved to Firebase successfully at path:', path);

      const result = {
        id: resource.title,
        ...resource,
        created_at: new Date().toISOString(),
      };

      console.log('Returning result:', result);
      return result;
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      throw error;
    }
  },

  update: async (
    id: string,
    updates: Partial<Omit<CounselorResource, 'id' | 'created_at' | 'counselor_id'>>
  ): Promise<CounselorResource> => {
    try {
      const oldTitle = id;
      const newTitle = updates.title || oldTitle;

      if (oldTitle !== newTitle) {
        const oldRef = ref(database, `University Data/Resources/${oldTitle}`);
        await remove(oldRef);
      }

      const existingRef = ref(database, `University Data/Resources/${oldTitle}`);
      const snapshot = await get(existingRef);
      const existingData = snapshot.exists() ? snapshot.val() : {};

      const keyTopics = updates.key_topics || [];
      const keyWordsObj: Record<string, boolean> = {};
      keyTopics.forEach((topic) => {
        keyWordsObj[topic] = true;
      });

      const resourceRef = ref(database, `University Data/Resources/${newTitle}`);
      await set(resourceRef, {
        'name': newTitle,
        'Resource Type': capitalizeType(updates.resource_type || existingData['Resource Type']?.toLowerCase() || 'other'),
        'Owner': updates.creator || existingData['Owner'] || '',
        'Description': updates.description || existingData['Description'] || '',
        'Key Words': Object.keys(keyWordsObj).length > 0 ? keyWordsObj : existingData['Key Words'] || {},
        'Duration': updates.time_estimate || existingData['Duration'] || '',
        'Link': updates.link || existingData['Link'] || '',
        'Helps with': formatCategory(updates.category || 'general'),
      });

      console.log('Resource updated in Firebase successfully');

      return {
        id: newTitle,
        counselor_id: '',
        resource_type: updates.resource_type || 'other',
        title: newTitle,
        creator: updates.creator || '',
        description: updates.description || '',
        key_topics: updates.key_topics || [],
        time_estimate: updates.time_estimate || '',
        link: updates.link || '',
        category: updates.category || 'general',
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating Firebase:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const resourceRef = ref(database, `University Data/Resources/${id}`);
      await remove(resourceRef);
      console.log('Resource removed from Firebase successfully');
    } catch (error) {
      console.error('Error removing from Firebase:', error);
      throw error;
    }
  },

  search: async (counselorId: string, searchTerm: string): Promise<CounselorResource[]> => {
    const allResources = await counselorResourcesService.getAll(counselorId);
    const lowerSearch = searchTerm.toLowerCase();
    return allResources.filter(r =>
      r.title.toLowerCase().includes(lowerSearch) ||
      r.creator.toLowerCase().includes(lowerSearch) ||
      r.key_topics.some(topic => topic.toLowerCase().includes(lowerSearch))
    );
  },
};
