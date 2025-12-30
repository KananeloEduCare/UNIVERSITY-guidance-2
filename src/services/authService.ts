import { database } from '../config/firebase';
import { ref, get, child } from 'firebase/database';
import { userStorage, StoredUser } from './userStorage';

export interface User {
  username: string;
  name: string;
  grade: string;
  role: string;
  school: string;
  averageGrade?: number;
  subjectGrades?: { [subject: string]: number };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: 'USER_NOT_FOUND' | 'WRONG_PASSWORD' | 'NETWORK_ERROR';
  message?: string;
}

export class AuthService {
  /**
   * Extract username from email (part before @)
   */
  private extractUsername(email: string): string {
    return email.split('@')[0].toLowerCase();
  }

  /**
   * Search for user across all schools in the database
   */
  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { email, password } = credentials;
      const username = this.extractUsername(email);
      
      console.log('Attempting to authenticate:', username);
      
      // Get reference to the Schoolss node
      const dbRef = ref(database);
      const schoolsSnapshot = await get(child(dbRef, 'Schoolss'));
      
      if (!schoolsSnapshot.exists()) {
        console.log('No schools found in database');
        return {
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Database connection error. Please try again.'
        };
      }
      
      const schools = schoolsSnapshot.val();
      console.log('Found schools:', Object.keys(schools));
      
      let foundInSchools = false;
      let foundInCounselors = false;
      let schoolSuccessData: AuthResult | null = null;
      let counselorSuccessData: AuthResult | null = null;

      // STEP 1: Search through all schools
      console.log('=== STEP 1: Checking all schools ===');
      for (const [schoolName, schoolData] of Object.entries(schools)) {
        console.log(`Searching in school: ${schoolName}`);

        // Check if school has users
        if (schoolData && typeof schoolData === 'object' && 'users' in schoolData) {
          const users = (schoolData as any).users;

          // Check if username exists in this school
          if (users && username in users) {
            foundInSchools = true;
            const userData = users[username];
            console.log(`Found user ${username} in ${schoolName}:`, userData);

            // Verify password
            if (userData.Password === password) {
              console.log('Password verified successfully for student');

              // Extract the name from Firebase data
              const extractedName = userData.Name || userData.name || 'Student';

              // Fetch the student's average grade
              let studentAverageGrade: number | undefined;
              try {
                const individualAverageSnapshot = await get(child(dbRef, `Schoolss/${schoolName}/Individual average/Students`));
                if (individualAverageSnapshot.exists()) {
                  const studentsAverages = individualAverageSnapshot.val();
                  if (studentsAverages && extractedName in studentsAverages) {
                    const averageValue = studentsAverages[extractedName];
                    studentAverageGrade = typeof averageValue === 'string' ? parseFloat(averageValue) : averageValue;
                    console.log(`Found average grade for ${extractedName}:`, studentAverageGrade);
                  }
                }
              } catch (averageError) {
                console.error('Error fetching student average:', averageError);
              }

              // Fetch the student's subject grades
              let subjectGrades: { [subject: string]: number } = {};
              try {
                const marksSnapshot = await get(child(dbRef, `Schoolss/${schoolName}/Marks`));
                if (marksSnapshot.exists()) {
                  const marksData = marksSnapshot.val();
                  for (const [className, classData] of Object.entries(marksData)) {
                    if (classData && typeof classData === 'object' && username in classData) {
                      const studentData = (classData as any)[username];
                      if (studentData && studentData.Rating && studentData.Rating['sub rating']) {
                        const subRating = studentData.Rating['sub rating'];
                        const gradeValue = typeof subRating === 'string' ? parseFloat(subRating) : subRating;
                        subjectGrades[className] = gradeValue;
                      }
                    }
                  }
                }
              } catch (marksError) {
                console.error('Error fetching subject grades:', marksError);
              }

              const userToStore: StoredUser = {
                username,
                name: extractedName,
                grade: userData.Grade || 'Unknown',
                role: userData.Role || 'Student',
                school: schoolName,
                averageGrade: studentAverageGrade,
                subjectGrades: subjectGrades
              };

              userStorage.storeUser(userToStore);

              schoolSuccessData = {
                success: true,
                user: {
                  username,
                  name: extractedName,
                  grade: userData.Grade || 'Unknown',
                  role: userData.Role || 'Student',
                  school: schoolName,
                  averageGrade: studentAverageGrade,
                  subjectGrades: subjectGrades
                }
              };

              break; // Found and authenticated, can stop checking schools
            } else {
              console.log('Password mismatch for student - will continue checking counselors');
              // DON'T return here - continue to check counselors
            }
          }
        }
      }

      // If we found a valid match in schools, return it now
      if (schoolSuccessData) {
        console.log('=== Returning successful school login ===');
        return schoolSuccessData;
      }

      // STEP 2: Check University Counsellors
      console.log('=== STEP 2: Checking University Counsellors ===');
      console.log(`Comparing FULL email: "${email}" (NOT stripped username: "${username}")`);
      try {
        const counselorsSnapshot = await get(child(dbRef, 'University Data/University Counsellors '));

        if (counselorsSnapshot.exists()) {
          const counselors = counselorsSnapshot.val();
          console.log('Found counselors:', Object.keys(counselors));

          // Iterate through each counselor
          for (const [counselorName, counselorData] of Object.entries(counselors)) {
            console.log(`Checking counselor: ${counselorName}`);

            if (counselorData && typeof counselorData === 'object') {
              const data = counselorData as any;

              // Get email field
              const counselorEmail = data.email || data.Email;
              console.log(`Counselor email: "${counselorEmail}", User entered: "${email}"`);
              console.log('Counselor data structure:', JSON.stringify(data, null, 2));

              // Check if email matches
              const emailLowerInput = email.toLowerCase();
              const emailLowerCounselor = counselorEmail ? counselorEmail.toLowerCase() : '';
              console.log(`Email comparison: "${emailLowerCounselor}" === "${emailLowerInput}" ? ${emailLowerCounselor === emailLowerInput}`);

              if (counselorEmail && emailLowerCounselor === emailLowerInput) {
                console.log(`✓ Found matching email for counselor: ${counselorName}`);
                foundInCounselors = true;

                // Verify password
                console.log(`Password comparison: "${data.Password}" === "${password}" ? ${data.Password === password}`);
                if (data.Password === password) {
                  console.log('✓ Password verified for counselor');

                  // Convert role to lowercase format
                  let roleFormatted = 'counselor';
                  if (data.Role === 'Pool Management') {
                    roleFormatted = 'pool_management';
                  } else if (data.Role === 'Essay') {
                    roleFormatted = 'essay';
                  }

                  const counselorUser: StoredUser = {
                    username: email,
                    name: data.Name || counselorName,
                    grade: 'Counselor',
                    role: roleFormatted,
                    school: 'University Counsellor'
                  };

                  userStorage.storeUser(counselorUser);

                  counselorSuccessData = {
                    success: true,
                    user: {
                      username: email,
                      name: data.Name || counselorName,
                      grade: 'Counselor',
                      role: roleFormatted,
                      school: 'University Counsellor'
                    }
                  };

                  break; // Found and authenticated, can stop checking counselors
                } else {
                  console.log('Password mismatch for counselor');
                  // DON'T return here - we need to finish checking
                }
              }
            }
          }
        } else {
          console.log('University Counsellors node does not exist');
        }
      } catch (counselorError) {
        console.error('Error checking University Counsellors:', counselorError);
      }

      // If we found a valid match in counselors, return it now
      if (counselorSuccessData) {
        console.log('=== Returning successful counselor login ===');
        return counselorSuccessData;
      }

      // STEP 3: Determine error after checking BOTH databases
      console.log('=== STEP 3: Determining error ===');
      console.log(`Found in schools: ${foundInSchools}, Found in counselors: ${foundInCounselors}`);

      // If found in either location but no success data, password was wrong
      if (foundInSchools || foundInCounselors) {
        console.log('User found but password incorrect');
        return {
          success: false,
          error: 'WRONG_PASSWORD',
          message: 'The password you entered is incorrect. Please try again.'
        };
      }

      // Not found in either location
      console.log('Email not found in either Schoolss or University Counsellors');
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'This email address is not in our database. Please check your email or contact your administrator.'
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }
}

// Logout function to clear stored data
export const logout = () => {
  userStorage.clearUser();
};

// Create and export an instance of AuthService
export const authService = new AuthService();