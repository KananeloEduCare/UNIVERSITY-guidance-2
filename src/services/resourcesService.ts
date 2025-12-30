import { database } from '../config/firebase';
import { ref, get } from 'firebase/database';

export interface FirebaseResource {
  name: string;
  Description: string;
  Duration?: string;
  'Helps with': string;
  Owner: string;
  'Resource Type': 'Video' | 'Article' | 'Guide' | 'Template' | 'Webinar';
  Link: string;
  'Key Words'?: { [keyword: string]: boolean };
}

export interface Resource {
  id: string;
  title: string;
  type: 'Article' | 'Video' | 'Guide' | 'Template' | 'Webinar';
  author: string;
  description: string;
  url: string;
  category: string;
  duration?: string;
  keywords: string[];
}

class ResourcesService {
  private readonly SCHOOL_NAME = 'Soofia International School';

  async fetchResourcesFromFirebase(): Promise<Resource[]> {
    try {
      console.log('=== FETCHING RESOURCES FROM FIREBASE ===');

      const resourcesRef = ref(database, `Schoolss/${this.SCHOOL_NAME}/Resources`);
      const snapshot = await get(resourcesRef);

      if (!snapshot.exists()) {
        console.log('No Resources node found for', this.SCHOOL_NAME);
        return [];
      }

      const resourcesData = snapshot.val();
      console.log('Found resources data:', resourcesData);

      const resources: Resource[] = [];

      Object.entries(resourcesData).forEach(([resourceName, resourceData]) => {
        if (resourceData && typeof resourceData === 'object') {
          const data = resourceData as FirebaseResource;

          const keywords: string[] = [];
          if (data['Key Words']) {
            Object.keys(data['Key Words']).forEach(keyword => {
              if (data['Key Words']![keyword]) {
                keywords.push(keyword);
              }
            });
          }

          resources.push({
            id: resourceName.replace(/\s+/g, '-').toLowerCase(),
            title: resourceName,
            type: data['Resource Type'] || 'Article',
            author: data.Owner || 'Unknown',
            description: data.Description || '',
            url: data.Link || '',
            category: data['Helps with'] || 'General',
            duration: data.Duration,
            keywords
          });

          console.log(`Extracted resource: ${resourceName}`, {
            type: data['Resource Type'],
            author: data.Owner,
            category: data['Helps with'],
            keywords
          });
        }
      });

      console.log(`✅ Successfully fetched ${resources.length} resources`);
      return resources;

    } catch (error) {
      console.error('❌ Error fetching resources from Firebase:', error);
      return [];
    }
  }
}

export const resourcesService = new ResourcesService();
