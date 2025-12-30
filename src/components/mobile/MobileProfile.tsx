import React, { useState } from 'react';
import { useEffect } from 'react';
import { User, Edit3, Save, X, TrendingUp, Award, Target, Plus, Trash2, BarChart3, PieChart, Activity, Calendar } from 'lucide-react';
import { User as UserType } from '../../services/authService';
import { userStorage } from '../../services/userStorage';
import { database } from '../../config/firebase';
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
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`${className} h-2 rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      ></div>
    </div>
  );
};

// Circular progress component
const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number; color?: string }> = ({
  percentage,
  size = 80,
  strokeWidth = 6,
  color = "#04adee"
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-900">{Math.round(animatedPercentage)}%</span>
      </div>
    </div>
  );
};

const MobileProfile: React.FC<ProfileProps> = ({ user }) => {
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

  // Calculate analytics data
  const subjectEntries = Object.entries(profileData.subjects);
  const averageGrade = profileData.currentGPA;
  const topSubject = subjectEntries.reduce((prev, current) => (prev[1] > current[1]) ? prev : current);
  const lowestSubject = subjectEntries.reduce((prev, current) => (prev[1] < current[1]) ? prev : current);
  const improvementNeeded = subjectEntries.filter(([_, grade]) => grade < 85);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#04adee] to-blue-600 px-4 py-6">
        <div className="text-center text-white">
          <h1 className="text-xl font-bold mb-1">Academic Analytics</h1>
          <p className="text-blue-100 text-sm">Performance Overview</p>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-6">
        {/* Edit Button */}
        <div className="mb-4">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 inline" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
              >
                <X className="w-4 h-4 mr-2 inline" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="w-full bg-white text-[#04adee] py-3 rounded-xl font-semibold text-sm border border-[#04adee] active:scale-95 transition-transform"
            >
              <Edit3 className="w-4 h-4 mr-2 inline" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Key Metrics Dashboard */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-[#04adee] mr-2" />
            Performance Metrics
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <CircularProgress percentage={animatedGPA} color="#04adee" />
              <div className="text-xs text-gray-600 mt-1">Overall Average</div>
            </div>
            <div className="text-center">
              <CircularProgress percentage={Math.round((animatedRank / animatedTotal) * 100)} color="#10b981" />
              <div className="text-xs text-gray-600 mt-1">Class Percentile</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[#04adee]">{animatedGPA}%</div>
              <div className="text-xs text-gray-600">GPA</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">#{animatedRank}</div>
              <div className="text-xs text-gray-600">Rank</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-600">{animatedSAT}</div>
              <div className="text-xs text-gray-600">SAT</div>
            </div>
          </div>
        </div>

        {/* Subject Performance Analysis */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
            <PieChart className="w-5 h-5 text-[#04adee] mr-2" />
            Subject Analysis
          </h3>
          
          <div className="space-y-3 mb-4">
            {Object.entries(profileData.subjects).map(([subject, grade]) => (
              <div key={subject} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm text-gray-700">{subject}</span>
                  <span className="text-sm font-bold text-gray-900">{grade}%</span>
                </div>
                <AnimatedProgressBar percentage={grade} />
              </div>
            ))}
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-green-700 font-medium">Strongest Subject</div>
              <div className="text-sm font-bold text-green-800">{topSubject[0]}</div>
              <div className="text-xs text-green-600">{topSubject[1]}%</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-xs text-orange-700 font-medium">Focus Area</div>
              <div className="text-sm font-bold text-orange-800">{lowestSubject[0]}</div>
              <div className="text-xs text-orange-600">{lowestSubject[1]}%</div>
            </div>
          </div>
        </div>

        {/* Application Profile */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
            <Target className="w-5 h-5 text-[#04adee] mr-2" />
            Application Profile
          </h2>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">SAT Score</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.satScore}
                    onChange={(e) => handleInputChange('satScore', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#04adee] focus:outline-none bg-white"
                  />
                ) : (
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="text-sm font-bold text-[#04adee]">{animatedSAT}</div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#04adee] focus:outline-none bg-white"
                  />
                ) : (
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <div className="text-sm font-medium">{profileData.age}</div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nationality</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#04adee] focus:outline-none bg-white"
                />
              ) : (
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-sm font-medium">{profileData.nationality}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Financial Budget</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.financialBudget}
                  onChange={(e) => handleInputChange('financialBudget', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#04adee] focus:outline-none bg-white"
                />
              ) : (
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-sm font-medium">${profileData.financialBudget.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Career Interests */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Career Interests</h3>
          {isEditing ? (
            <div className="space-y-2">
              {editData.careerInterests.map((interest, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={interest}
                    onChange={(e) => updateCareerInterest(index, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#04adee] focus:outline-none bg-white"
                    placeholder="Enter career interest"
                  />
                  <button
                    type="button"
                    onClick={() => removeCareerInterest(index)}
                    className="p-2 text-red-600 bg-red-50 rounded-lg active:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {editData.careerInterests.length < 10 && (
                <button
                  type="button"
                  onClick={addCareerInterest}
                  className="w-full flex items-center justify-center text-[#04adee] bg-gray-50 py-2 rounded-lg text-sm font-medium active:bg-gray-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Career Interest
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileData.careerInterests.map((interest, index) => (
                <span key={index} className="bg-gray-50 text-[#04adee] px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Personal Statement */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Statement</h3>
          {isEditing ? (
            <div>
              <textarea
                value={editData.personalStatement}
                onChange={(e) => handleInputChange('personalStatement', e.target.value)}
                className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:border-[#04adee] focus:outline-none h-24 bg-white"
                maxLength={650}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {editData.personalStatement.length}/650 words
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">{profileData.personalStatement}</div>
          )}
        </div>

        {/* Activities */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Activity className="w-4 h-4 text-[#04adee] mr-2" />
            Activities
          </h3>
          {isEditing ? (
            <div className="space-y-2">
              {editData.activities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={activity}
                    onChange={(e) => updateActivity(index, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#04adee] focus:outline-none bg-white"
                    placeholder="Enter activity"
                  />
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="p-2 text-red-600 bg-red-50 rounded-lg active:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {editData.activities.length < 10 && (
                <button
                  type="button"
                  onClick={addActivity}
                  className="w-full flex items-center justify-center text-[#04adee] bg-gray-50 py-2 rounded-lg text-sm font-medium active:bg-gray-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity (Max 10)
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {profileData.activities.map((activity, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center">
                  <div className="w-2 h-2 bg-[#04adee] rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700 font-medium">{activity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Special Circumstances */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Special Circumstances</h3>
          {isEditing ? (
            <textarea
              value={editData.specialCircumstances}
              onChange={(e) => handleInputChange('specialCircumstances', e.target.value)}
              className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:border-[#04adee] focus:outline-none h-20 bg-white"
            />
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">{profileData.specialCircumstances}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileProfile;