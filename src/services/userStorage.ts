// User storage service - similar to Android SharedPreferences
export interface StoredUser {
  username: string;
  name: string;
  grade: string;
  role: string;
  school: string;
  averageGrade?: number;
  subjectGrades?: { [subject: string]: number };
}

class UserStorageService {
  private readonly USER_KEY = 'educare_user';

  // Store user data (like SharedPreferences.edit().putString())
  storeUser(user: StoredUser): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      console.log('User stored successfully:', user);
    } catch (error) {
      console.error('Failed to store user:', error);
    }
  }

  // Retrieve user data (like SharedPreferences.getString())
  getStoredUser(): StoredUser | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Retrieved stored user:', user);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      return null;
    }
  }

  // Get current user (alias for getStoredUser for consistency)
  getCurrentUser(): StoredUser | null {
    return this.getStoredUser();
  }

  // Clear user data (like SharedPreferences.edit().clear())
  clearUser(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
      console.log('User data cleared');
    } catch (error) {
      console.error('Failed to clear user:', error);
    }
  }

  // Check if user is stored
  hasStoredUser(): boolean {
    return localStorage.getItem(this.USER_KEY) !== null;
  }
}

export const userStorage = new UserStorageService();