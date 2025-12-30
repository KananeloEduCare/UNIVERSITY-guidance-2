import { database } from '../config/firebase';
import { ref, set, get } from 'firebase/database';
import { userStorage } from './userStorage';

export class ApplicationProgressService {
  /**
   * Calculate completion percentage for a student's applications
   */
  private async calculateStudentProgress(schoolName: string, studentName: string): Promise<number> {
    try {
      console.log(`=== CALCULATING PROGRESS FOR ${studentName} IN ${schoolName} ===`);
      
      const applicationsRef = ref(database, `Schoolss/${schoolName}/Applications/${studentName}`);
      const snapshot = await get(applicationsRef);
      
      if (!snapshot.exists()) {
        console.log('No applications found for student');
        return 0;
      }
      
      const applicationsData = snapshot.val();
      console.log('Applications data:', applicationsData);
      
      let totalRequirements = 0;
      let completedRequirements = 0;
      
      // Iterate through each university
      Object.entries(applicationsData).forEach(([universityName, requirementsData]) => {
        console.log(`Processing university: ${universityName}`);
        
        if (requirementsData && typeof requirementsData === 'object') {
          // Count requirements for this university
          Object.entries(requirementsData as { [key: string]: boolean }).forEach(([reqName, completed]) => {
            totalRequirements++;
            if (completed) {
              completedRequirements++;
            }
            console.log(`  Requirement: ${reqName} = ${completed}`);
          });
        }
      });
      
      const completionPercentage = totalRequirements > 0 ? 
        Math.round((completedRequirements / totalRequirements) * 100) : 0;
      
      console.log(`Total requirements: ${totalRequirements}, Completed: ${completedRequirements}`);
      console.log(`Calculated completion percentage: ${completionPercentage}%`);
      
      return completionPercentage;
    } catch (error) {
      console.error('Error calculating student progress:', error);
      return 0;
    }
  }

  /**
   * Update the Application Progress node for a student
   */
  async updateStudentProgress(schoolName: string, studentName: string): Promise<void> {
    try {
      console.log(`=== UPDATING APPLICATION PROGRESS FOR ${studentName} ===`);
      
      // Calculate the current completion percentage
      const completionPercentage = await this.calculateStudentProgress(schoolName, studentName);
      
      // Update the Application Progress node
      const progressRef = ref(database, `Schoolss/${schoolName}/Application Progress/${studentName}`);
      await set(progressRef, completionPercentage);
      
      console.log(`✅ Updated Application Progress for ${studentName}: ${completionPercentage}%`);
    } catch (error) {
      console.error('❌ Error updating student progress:', error);
      throw error;
    }
  }

  /**
   * Update progress for current logged-in user
   */
  async updateCurrentUserProgress(): Promise<void> {
    try {
      const storedUser = userStorage.getCurrentUser();
      if (!storedUser || !storedUser.name || !storedUser.school) {
        console.log('No user data found, cannot update progress');
        return;
      }

      await this.updateStudentProgress(storedUser.school, storedUser.name);
    } catch (error) {
      console.error('Error updating current user progress:', error);
      throw error;
    }
  }

  /**
   * Get progress for a specific student
   */
  async getStudentProgress(schoolName: string, studentName: string): Promise<number> {
    try {
      const progressRef = ref(database, `Schoolss/${schoolName}/Application Progress/${studentName}`);
      const snapshot = await get(progressRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      // If no progress exists, calculate and store it
      const calculatedProgress = await this.calculateStudentProgress(schoolName, studentName);
      await this.updateStudentProgress(schoolName, studentName);
      return calculatedProgress;
    } catch (error) {
      console.error('Error getting student progress:', error);
      return 0;
    }
  }

  /**
   * Get progress for current logged-in user
   */
  async getCurrentUserProgress(): Promise<number> {
    try {
      const storedUser = userStorage.getCurrentUser();
      if (!storedUser || !storedUser.name || !storedUser.school) {
        console.log('No user data found, cannot get progress');
        return 0;
      }

      return await this.getStudentProgress(storedUser.school, storedUser.name);
    } catch (error) {
      console.error('Error getting current user progress:', error);
      return 0;
    }
  }
}

export const applicationProgressService = new ApplicationProgressService();