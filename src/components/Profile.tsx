import React, { useState } from 'react';
import { useEffect } from 'react';
import { User, Edit3, Save, X, TrendingUp, Award, Target, Plus, Trash2 } from 'lucide-react';
import { User as UserType } from '../services/authService';
import { userStorage } from '../services/userStorage';
import { database } from '../config/firebase';
import { ref, set } from 'firebase/database';

interface ProfileProps {
  user?: UserType | null;
}

// Animation hook for counting numbers
const useCountAnimation = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

// Progress bar component with animation
const AnimatedProgressBar: React.FC<{ percentage: number; className?: string }> = ({ 
  percentage, 
  className = "bg-[#04adee]" 
}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2 mr-3">
      <div 
        className={`${className} h-2 rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      ></div>
    </div>
  );
};

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get user name from storage if not provided via props
  const getUserName = () => {
    if (user?.name) return user.name;
    
    const storedUser = userStorage.getStoredUser();
    if (storedUser?.name) {
      console.log('Using stored user name:', storedUser.name);
      return storedUser.name;
    }
    
    return 'Student'; // Default fallback if no name found
  };
  
  const getStudentAverageGrade = () => {
    // First try to get from user prop
    if (user?.averageGrade !== undefined) {
      console.log('Using average grade from user prop:', user.averageGrade);
      return user.averageGrade;
    }
    
    // Then try to get from stored user
    const storedUser = userStorage.getStoredUser();
    if (storedUser?.averageGrade !== undefined) {
      console.log('Using stored average grade:', storedUser.averageGrade);
      return storedUser.averageGrade;
    }
    
    console.log('No average grade found, using default');
    return 89; // Default fallback
  };
  
  const getSubjectGrades = () => {
    // First try to get from user prop
    if (user?.subjectGrades) {
      console.log('Using subject grades from user prop:', user.subjectGrades);
      return user.subjectGrades;
    }
    
    // Then try to get from stored user
    const storedUser = userStorage.getStoredUser();
    if (storedUser?.subjectGrades) {
      console.log('Using stored subject grades:', storedUser.subjectGrades);
      return storedUser.subjectGrades;
    }
    
    console.log('No subject grades found, using defaults');
    // Default fallback subjects
    return {
      'Mathematics': 88,
      'English': 92,
      'Science': 85,
      'History': 90,
      'Foreign Language': 87
    };
  };
  
  const [profileData, setProfileData] = useState({
    // Student basic information
    studentName: getUserName(),
    
    // Auto-populated grades (read-only)
    currentGPA: getStudentAverageGrade(), // Get from database or default
    subjects: getSubjectGrades(), // Get from database or default
    classRank: 15,
    totalStudents: 320,
    
    // Student-entered information
    satScore: 1450,
    careerInterests: ['Science', 'Technology', 'Engineering'],
    age: 17,
    nationality: 'United States',
    personalStatement: 'Passionate about technology and innovation, I aim to pursue computer science to create solutions that impact society positively. My journey began when I first encountered programming in high school, and since then, I have been fascinated by the endless possibilities that technology offers to solve real-world problems.',
    activities: ['Debate Club President', 'Varsity Soccer', 'Math Olympiad', 'Volunteer Tutor'],
    specialCircumstances: 'First-generation college student, overcame family financial hardship',
    financialBudget: 50000
  });

  const [editData, setEditData] = useState(profileData);

  // Animated values
  const animatedGPA = useCountAnimation(profileData.currentGPA);
  const animatedRank = useCountAnimation(profileData.classRank);
  const animatedTotal = useCountAnimation(profileData.totalStudents);
  const animatedSAT = useCountAnimation(profileData.satScore);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Get user's school from stored data
      const storedUser = userStorage.getStoredUser();
      const schoolName = storedUser?.school || user?.school;
      const username = storedUser?.username || user?.username;
      
      if (!schoolName || !username) {
        console.error('Missing school or username information');
        alert('Error: Missing user information. Please log in again.');
        setIsSaving(false);
        return;
      }

      console.log('Saving profile data for:', username, 'in school:', schoolName);

      // Prepare data structure for Firebase
      const profileDataForDB = {
        Activities: {},
        Age: editData.age.toString(),
        Nationality: editData.nationality,
        SAT: editData.satScore.toString(),
        'Career Interests': {},
        'Special Circumstances': editData.specialCircumstances,
        'Personal Statement': editData.personalStatement,
        Budget: editData.financialBudget.toString()
      };

      // Convert activities array to object format
      editData.activities.forEach((activity, index) => {
        if (activity.trim()) {
          profileDataForDB.Activities[activity.trim()] = "true";
        }
      });

      // Convert career interests array to object format
      editData.careerInterests.forEach((interest, index) => {
        if (interest.trim()) {
          profileDataForDB['Career Interests'][interest.trim()] = "true";
        }
      });

      // Write to Firebase under University Profiles
      const profileRef = ref(database, `Schoolss/${schoolName}/University Profiles/${username}`);
      await set(profileRef, profileDataForDB);

      console.log('Profile data saved successfully to Firebase!');
      
      // Update local state
      setProfileData(editData);
      setIsEditing(false);
      
      alert('Profile saved successfully!');
      
    } catch (error) {
      console.error('Error saving profile data:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addActivity = () => {
    if (editData.activities.length < 10) {
      setEditData(prev => ({
        ...prev,
        activities: [...prev.activities, '']
      }));
    }
  };

  const removeActivity = (index: number) => {
    setEditData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  const updateActivity = (index: number, value: string) => {
    setEditData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => i === index ? value : activity)
    }));
  };

  const addCareerInterest = () => {
    if (editData.careerInterests.length < 10) {
      setEditData(prev => ({
        ...prev,
        careerInterests: [...prev.careerInterests, '']
      }));
    }
  };

  const removeCareerInterest = (index: number) => {
    setEditData(prev => ({
      ...prev,
      careerInterests: prev.careerInterests.filter((_, i) => i !== index)
    }));
  };

  const updateCareerInterest = (index: number, value: string) => {
    setEditData(prev => ({
      ...prev,
      careerInterests: prev.careerInterests.map((interest, i) => i === index ? value : interest)
    }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Welcome, {getUserName()}</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your academic journey and university readiness</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center justify-center px-4 py-2 bg-[#04adee] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Academic Performance (Auto-populated) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#04adee] mr-2" />
              Academic Performance (Auto-Generated)
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-[#04adee] bg-opacity-10 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-[#04adee]">{animatedGPA}%</div>
                <div className="text-xs sm:text-sm text-gray-600">Average Grade</div>
              </div>
              <div className="bg-green-100 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">#{animatedRank}</div>
                <div className="text-xs sm:text-sm text-gray-600">Class Rank</div>
              </div>
              <div className="bg-purple-100 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{animatedTotal}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total Students</div>
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Subject Grades</h3>
            <div className="space-y-3">
              {Object.entries(profileData.subjects).map(([subject, grade]) => (
                <div key={subject} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-sm sm:text-base text-gray-700">{subject}</span>
                  <div className="flex items-center">
                    <AnimatedProgressBar percentage={grade} />
                    <span className="text-sm sm:text-lg font-semibold text-gray-900 w-8 sm:w-10">{grade}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#04adee] mr-2" />
              University Application Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">SAT Score</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.satScore}
                    onChange={(e) => handleInputChange('satScore', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg font-semibold text-sm sm:text-base text-[#04adee]">{animatedSAT}</div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm sm:text-base">{profileData.age} years old</div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Nationality</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm sm:text-base">{profileData.nationality}</div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Financial Budget</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.financialBudget}
                    onChange={(e) => handleInputChange('financialBudget', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm sm:text-base">${profileData.financialBudget.toLocaleString()}</div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Career Interests</label>
                {isEditing ? (
                  <div className="space-y-2">
                    {editData.careerInterests.map((interest, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={interest}
                          onChange={(e) => updateCareerInterest(index, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                          placeholder="Enter career interest"
                        />
                        <button
                          type="button"
                          onClick={() => removeCareerInterest(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {editData.careerInterests.length < 10 && (
                      <button
                        type="button"
                        onClick={addCareerInterest}
                        className="flex items-center text-[#04adee] hover:bg-blue-50 px-3 py-2 rounded-lg text-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Career Interest
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.careerInterests.map((interest, index) => (
                      <span key={index} className="bg-[#04adee] bg-opacity-10 text-[#04adee] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Personal Statement</label>
                {isEditing ? (
                  <div>
                    <textarea
                      value={editData.personalStatement}
                      onChange={(e) => handleInputChange('personalStatement', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent h-32 sm:h-40"
                      maxLength={650}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {editData.personalStatement.length}/650 words
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm sm:text-base">{profileData.personalStatement}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#04adee] mr-2" />
              Extracurricular Activities
            </h3>
            {isEditing ? (
              <div className="space-y-2">
                {editData.activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={activity}
                      onChange={(e) => updateActivity(index, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                      placeholder="Enter activity"
                    />
                    <button
                      type="button"
                      onClick={() => removeActivity(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {editData.activities.length < 10 && (
                  <button
                    type="button"
                    onClick={addActivity}
                    className="flex items-center text-[#04adee] hover:bg-blue-50 px-3 py-2 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Activity (Max 10)
                  </button>
                )}
              </div>
            ) : (
              <ul className="space-y-2">
                {profileData.activities.map((activity, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-[#04adee] rounded-full mr-3"></div>
                    <span className="text-sm sm:text-base text-gray-700">{activity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Special Circumstances</h3>
            {isEditing ? (
              <textarea
                value={editData.specialCircumstances}
                onChange={(e) => handleInputChange('specialCircumstances', e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent h-20 sm:h-24"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg text-xs sm:text-sm">{profileData.specialCircumstances}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;