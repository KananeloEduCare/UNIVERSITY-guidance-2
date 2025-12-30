import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, Calendar, Target, X, Trash2, Edit3, ArrowLeft, FileText, TrendingUp, Activity, BarChart3, PieChart } from 'lucide-react';
import { database } from '../../config/firebase';
import { ref, set, get } from 'firebase/database';
import { userStorage } from '../../services/userStorage';
import { sanitizeFirebaseKey, isValidFirebaseKey, getFirebaseKeyError } from '../../utils/firebaseValidation';
import { applicationProgressService } from '../../services/applicationProgressService';

interface ApplicationRequirement {
  id: number;
  name: string;
  completed: boolean;
  dueDate?: string;
}

interface Application {
  id: number;
  universityName: string;
  program: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Submitted' | 'Under Review' | 'Decision Pending';
  completionPercentage: number;
  requirements: ApplicationRequirement[];
  notes: string;
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [requirementErrors, setRequirementErrors] = useState<{ [index: number]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newApplicationModal, setNewApplicationModal] = useState({
    universityName: '',
    program: '',
    requirements: ['Personal Statement', 'Letters of Recommendation', 'Official Transcripts', 'SAT/ACT Scores', 'Application Fee']
  });

  // Load applications from Firebase on component mount
  useEffect(() => {
    loadApplicationsFromFirebase();
  }, []);

  // Function to load applications from Firebase
  const loadApplicationsFromFirebase = async () => {
    try {
      console.log('=== LOADING APPLICATIONS FROM FIREBASE ===');
      const storedUser = userStorage.getCurrentUser();
      if (!storedUser || !storedUser.name || !storedUser.school) {
        console.log('No user data found, cannot load applications:', storedUser);
        return;
      }

      console.log('Loading applications for user:', storedUser.name, 'in school:', storedUser.school);
      
      const applicationsRef = ref(database, `Schoolss/${storedUser.school}/Applications/${storedUser.name}`);
      console.log('Firebase path:', `Schoolss/${storedUser.school}/Applications/${storedUser.name}`);
      
      const snapshot = await get(applicationsRef);
      
      if (snapshot.exists()) {
        const applicationsData = snapshot.val();
        console.log('Found applications data:', applicationsData);
        
        const loadedApplications: Application[] = [];
        
        Object.entries(applicationsData).forEach(([universityName, requirementsData], index) => {
          console.log(`Processing university: ${universityName}`, requirementsData);
          
          if (requirementsData && typeof requirementsData === 'object') {
            const requirementsList: ApplicationRequirement[] = [];
            
            Object.entries(requirementsData as { [key: string]: boolean }).forEach(([reqName, completed], reqIndex) => {
              console.log(`  Requirement: ${reqName} = ${completed}`);
              requirementsList.push({
                id: Date.now() + index * 100 + reqIndex,
                name: reqName,
                completed: completed
              });
            });
            
            const completedCount = requirementsList.filter(req => req.completed).length;
            const completionPercentage = Math.round((completedCount / requirementsList.length) * 100);
            
            console.log(`  University: ${universityName}, Completion: ${completionPercentage}%`);
            
            loadedApplications.push({
              id: Date.now() + index,
              universityName: universityName,
              program: 'Program Name', // Default since we don't store program in Firebase
              deadline: '2025-05-01', // Default deadline
              priority: 'Medium',
              status: completionPercentage === 100 ? 'Submitted' : 'In Progress',
              completionPercentage,
              requirements: requirementsList,
              notes: ''
            });
          }
        });
        
        console.log('Loaded applications:', loadedApplications);
        setApplications(loadedApplications);
      } else {
        console.log('No applications found in Firebase');
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications from Firebase:', error);
      setApplications([]);
    }
  };

  // Function to find user's school by searching through all schools
  const findUserSchool = async (userEmail: string): Promise<string | null> => {
    try {
      const username = userEmail.split('@')[0].toLowerCase();
      console.log('Looking for username:', username);
      
      // Get all schools
      const schoolsRef = ref(database, 'Schoolss');
      const schoolsSnapshot = await get(schoolsRef);
      
      if (!schoolsSnapshot.exists()) {
        console.log('No Schoolss node found');
        return null;
      }
      
      const schools = schoolsSnapshot.val();
      console.log('Found schools:', Object.keys(schools));
      
      // Search through each school's users
      for (const [schoolName, schoolData] of Object.entries(schools)) {
        console.log(`Checking school: ${schoolName}`);
        
        if (schoolData && typeof schoolData === 'object' && 'users' in schoolData) {
          const users = (schoolData as any).users;
          
          if (users && username in users) {
            console.log(`Found user ${username} in school: ${schoolName}`);
            return schoolName;
          }
        }
      }
      
      console.log('User not found in any school');
      return null;
    } catch (error) {
      console.error('Error finding user school:', error);
      return null;
    }
  };

  // Function to update requirement in Firebase
  const updateRequirementInFirebase = async (universityName: string, requirementName: string, completed: boolean) => {
    try {
      const storedUser = userStorage.getCurrentUser();
      if (storedUser && storedUser.name && storedUser.school) {
        const requirementRef = ref(database, `Schoolss/${storedUser.school}/Applications/${storedUser.name}/${universityName}/${requirementName}`);
        await set(requirementRef, completed);
        console.log(`Updated requirement ${requirementName} to ${completed} for ${universityName}`);
        
        // Update Application Progress after requirement change
        await applicationProgressService.updateCurrentUserProgress();
        console.log('Application Progress updated after requirement change');
      }
    } catch (error) {
      console.error('Error updating requirement in Firebase:', error);
    }
  };

  const toggleRequirement = (appId: number, reqId: number) => {
    // Update local state
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        const updatedRequirements = app.requirements.map(req => 
          req.id === reqId ? { ...req, completed: !req.completed } : req
        );
        const completedCount = updatedRequirements.filter(req => req.completed).length;
        const completionPercentage = Math.round((completedCount / updatedRequirements.length) * 100);
        
        // Update Firebase when requirement is toggled
        const req = app.requirements.find(r => r.id === reqId);
        if (req) {
          updateRequirementInFirebase(app.universityName, req.name, !req.completed);
        }
        
        return { 
          ...app,
          requirements: updatedRequirements,
          completionPercentage
        };
      }
      return app;
    }));
  };

  // Add requirement to form
  const addRequirement = () => {
    setNewApplication(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  // Update requirement in form
  const updateRequirement = (index: number, value: string) => {
    setNewApplication(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  // Remove requirement from form
  const removeRequirement = (index: number) => {
    setNewApplication(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  // Function to save application to Firebase
  const saveApplicationToFirebase = async (applicationData: { universityName: string; program: string; requirements: string[] }): Promise<boolean> => {
    try {
      console.log('=== STARTING FIREBASE SAVE (MOBILE) ===');
      console.log('Application data:', applicationData);
      
      // Get stored user data
      const storedUser = userStorage.getCurrentUser();
      console.log('Current stored user:', storedUser);
      
      if (!storedUser) {
        throw new Error('No user data found in storage. Please log in again.');
      }

      // Extract email from stored user to find school
      const userEmail = `${storedUser.username}@gmail.com`; // Reconstruct email
      console.log('Reconstructed email:', userEmail);
      
      // Find which school this user belongs to
      const schoolName = await findUserSchool(userEmail);
      console.log('Found school:', schoolName);
      
      if (!schoolName) {
        throw new Error('Could not find your school in the database. Please contact support.');
      }
      
      // Get user's actual name from the database
      const userRef = ref(database, `Schoolss/${schoolName}/users/${storedUser.username}`);
      const userSnapshot = await get(userRef);
      
      if (!userSnapshot.exists()) {
        throw new Error('User data not found in school database.');
      }
      
      const userData = userSnapshot.val();
      const userName = userData.Name || userData.name || storedUser.name;
      console.log('Using user name for Applications:', userName);
      
      // Create the application path: Schoolss/[School]/Applications/[UserName]/[UniversityName]
      const applicationPath = `Schoolss/${schoolName}/Applications/${userName}/${applicationData.universityName}`;
      console.log('Firebase application path:', applicationPath);
      
      // Create requirements object with false values (not completed initially)
      const requirementsData: { [key: string]: boolean } = {};
      applicationData.requirements.forEach((req: string) => {
        if (req.trim()) {
          const sanitizedKey = sanitizeFirebaseKey(req.trim());
          if (sanitizedKey) {
            requirementsData[sanitizedKey] = false; // All start as incomplete
          }
        }
      });
      
      console.log('Requirements data to save:', requirementsData);
      
      // Validate requirements data
      if (Object.keys(requirementsData).length === 0) {
        throw new Error('No valid requirements to save');
      }
      
      // Save to Firebase - this will create all parent nodes automatically
      console.log('Attempting to save to Firebase...');
      const applicationRef = ref(database, applicationPath);
      await set(applicationRef, requirementsData);
      console.log('✅ Application saved successfully to Firebase!');
      
      return true;
    } catch (error) {
      console.error('❌ Error saving application to Firebase:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      throw new Error(`Failed to save application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Add application from modal
  const addApplicationFromModal = async () => {
    // Validate all requirements first
    const errors: { [index: number]: string } = {};
    let hasErrors = false;
    
    newApplicationModal.requirements.forEach((req, index) => {
      if (req.trim()) {
        const error = getFirebaseKeyError(req.trim());
        if (error) {
          errors[index] = error;
          hasErrors = true;
        }
      }
    });
    
    setRequirementErrors(errors);
    
    if (hasErrors) {
      alert('Please fix the requirement name errors before saving.');
      return;
    }
    
    if (newApplicationModal.universityName && newApplicationModal.program && newApplicationModal.requirements.length > 0) {
      setIsSaving(true);
      
      try {
        // Save to Firebase first
        await saveApplicationToFirebase(newApplicationModal);
        
        // Then update local state for immediate UI feedback
        const requirements: ApplicationRequirement[] = newApplicationModal.requirements.map((req, index) => ({
          id: Date.now() + index,
          name: req,
          completed: false
        }));

        const application: Application = {
          id: Date.now(),
          universityName: newApplicationModal.universityName,
          program: newApplicationModal.program,
          deadline: '2025-05-01', // Default deadline
          priority: 'Medium',
          status: 'In Progress',
          completionPercentage: 0,
          notes: '',
          requirements
        };

        setApplications(prev => [...prev, application]);
        setNewApplicationModal({
          universityName: '',
          program: '',
          requirements: ['Personal Statement', 'Letters of Recommendation', 'Official Transcripts', 'SAT/ACT Scores', 'Application Fee']
        });
        setShowAddModal(false);
        
        // Show success message
        setSuccessMessage('Application has been added to tracker successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Update Application Progress after adding new application
        await applicationProgressService.updateCurrentUserProgress();
        console.log('Application Progress updated after adding new application');
        
        // Reload applications from Firebase to get updated data
        await loadApplicationsFromFirebase();
      } catch (error) {
        console.error('Error adding application:', error);
        setErrorMessage(`Error adding application: ${error instanceof Error ? error.message : 'Please try again.'}`);
        setTimeout(() => setErrorMessage(''), 5000);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Modal requirement management
  const addModalRequirement = () => {
    if (newApplicationModal.requirements.length < 15) {
      setNewApplicationModal(prev => ({
        ...prev,
        requirements: [...prev.requirements, '']
      }));
    }
  };

  const removeModalRequirement = (index: number) => {
    setNewApplicationModal(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateModalRequirement = (index: number, value: string) => {
    // Real-time validation
    const error = getFirebaseKeyError(value);
    setRequirementErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[index] = error;
      } else {
        delete newErrors[index];
      }
      return newErrors;
    });
    
    setNewApplicationModal(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  // Helper functions for styling
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'text-green-600 bg-green-100';
      case 'Under Review': return 'text-blue-600 bg-blue-100';
      case 'Decision Pending': return 'text-purple-600 bg-purple-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  // Calculate statistics
  const overallStats = {
    avgCompletion: Math.round(applications.reduce((sum, app) => sum + app.completionPercentage, 0) / applications.length) || 0,
    total: applications.length,
    inProgress: applications.filter(app => app.status === 'In Progress').length,
    submitted: applications.filter(app => app.status === 'Submitted').length
  };

  // Application Detail View - shows individual requirements
  if (selectedApplication) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedApplication(null)}
              className="mr-4 p-2 hover:bg-gray-200 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">{selectedApplication.universityName}</h1>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Program</h3>
                <p className="text-gray-900">{selectedApplication.program}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Deadline</h3>
                <p className="text-gray-900">{new Date(selectedApplication.deadline).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Priority</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedApplication.priority)}`}>
                  {selectedApplication.priority}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                  {selectedApplication.status}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-4">Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-[#04adee] h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${selectedApplication.completionPercentage}%` }} 
                ></div>
              </div>
              <p className="text-sm text-gray-600">{selectedApplication.completionPercentage}% Complete</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Requirements</h3>
              <div className="space-y-3">
                {selectedApplication.requirements.map(requirement => (
                  <div key={requirement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => toggleRequirement(selectedApplication.id, requirement.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        requirement.completed
                          ? 'bg-[#04adee] border-[#04adee] text-white' 
                          : 'border-gray-300 hover:border-[#04adee]'
                      }`}
                    >
                      {requirement.completed && <CheckCircle className="w-3 h-3" />}
                    </button>
                    {requirement.dueDate && (
                      <span className="text-xs text-gray-500">
                        Due: {new Date(requirement.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add Application Form - allows custom requirements
  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Add New Application</h1>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-[#04adee] text-white p-3 rounded-xl"
            >
              <Plus className="w-5 h-5" />
            </button> 
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">University Name</label>
                <input
                  type="text"
                  value={newApplication.universityName}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, universityName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                  placeholder="e.g., Stanford University"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <input
                  type="text"
                  value={newApplication.program}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, program: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                  placeholder="e.g., Computer Science"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                <input
                  type="date"
                  value={newApplication.deadline}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newApplication.priority}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, priority: e.target.value as 'High' | 'Medium' | 'Low' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Requirements</label>
                  <button
                    onClick={addRequirement}
                    className="text-[#04adee] hover:text-blue-600 text-sm font-medium"
                  >
                    + Add Requirement
                  </button>
                </div>
                <div className="space-y-2">
                  {newApplication.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent text-sm"
                        placeholder="Enter requirement"
                      />
                      <button
                        onClick={() => removeRequirement(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      > 
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={addApplication}
                disabled={isSaving}
                className="flex-1 bg-[#04adee] text-white py-3 rounded-lg font-medium text-sm"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Create Application'
                )}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Applications List - overview of all applications
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-center">
            <X className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Tracker</h1>
            <p className="text-gray-600">Monitor your university application progress and deadlines</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center bg-[#04adee] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Application
          </button>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"> 
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{overallStats.avgCompletion}%</div>
                <div className="text-sm text-gray-600">Avg. Completion</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#04adee] bg-opacity-10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#04adee]" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{overallStats.total}</div>
                <div className="text-sm text-gray-600">Total Applications</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{overallStats.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{overallStats.submitted}</div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.map(application => {
            const completedRequirements = application.requirements.filter(req => req.completed).length; 
            const daysToDeadline = Math.ceil((new Date(application.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{application.universityName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(application.priority)}`}>
                        {application.priority} Priority
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{application.program}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Deadline: {new Date(application.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {daysToDeadline > 0 ? `${daysToDeadline} days left` : 'Overdue'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-2xl font-bold text-[#04adee]">{application.completionPercentage}%</div>
                      <Target className="w-5 h-5 text-[#04adee]" />
                    </div>
                    <div className="text-sm text-gray-600">
                      {completedRequirements} of {application.requirements.length} completed
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[#04adee] h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${application.completionPercentage}%` }} 
                    ></div>
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Requirements Checklist:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {application.requirements.map(requirement => (
                      <div key={requirement.id} className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleRequirement(application.id, requirement.id)}
                          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            requirement.completed
                              ? 'bg-[#04adee] border-[#04adee] text-white' 
                              : 'border-gray-300 hover:border-[#04adee]'
                          }`}
                        >
                          {requirement.completed && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <span className={`flex-1 ${requirement.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {requirement.name}
                        </span>
                        {requirement.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due: {new Date(requirement.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {application.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Notes:</h5>
                    <p className="text-gray-700 text-sm">{application.notes}</p>
                  </div>
                )}
              </div>
            );
          })} 
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your university applications to stay organized.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#04adee] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Add Your First Application
            </button>
          </div>
        )}

        {/* Add Application Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Application</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">University Name</label>
                  <input
                    type="text"
                    value={newApplicationModal.universityName}
                    onChange={(e) => setNewApplicationModal(prev => ({ ...prev, universityName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                    placeholder="e.g., University of Chicago"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Name</label>
                  <input
                    type="text"
                    value={newApplicationModal.program}
                    onChange={(e) => setNewApplicationModal(prev => ({ ...prev, program: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Requirements</label>
                    <button
                      onClick={addModalRequirement}
                      className="text-[#04adee] hover:text-blue-600 text-sm font-medium"
                    >
                      + Add Requirement
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {newApplicationModal.requirements.map((requirement, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={requirement}
                            onChange={(e) => updateModalRequirement(index, e.target.value)}
                            className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent ${
                              requirementErrors[index] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Write personal statement"
                          />
                          <button
                            onClick={() => removeModalRequirement(index)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {requirementErrors[index] && (
                          <p className="text-red-600 text-xs ml-3">{requirementErrors[index]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={addApplicationFromModal}
                  disabled={isSaving || !newApplicationModal.universityName.trim() || !newApplicationModal.program.trim() || Object.keys(requirementErrors).length > 0}
                  className="flex-1 bg-[#04adee] text-white py-3 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Add Application'
                  )}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

};

export default Applications;