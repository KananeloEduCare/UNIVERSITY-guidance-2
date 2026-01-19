import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Award, BookOpen, X, Users, UserCheck, LogOut, ChevronLeft, ChevronRight, GraduationCap, FileText, Calendar, MessageSquare, User, Settings } from 'lucide-react';
import CounselorScholarshipsPage from './CounselorScholarshipsPage';
import CounselorResourcesPage from './CounselorResourcesPage';
import AssignmentModal from './AssignmentModal';
import AnimatedCounter from './AnimatedCounter';
import AssignedStudentDetails from './AssignedStudentDetails';
import AcademicTracking from './AcademicTracking';
import EssayReview from './EssayReview';
import MeetingRequests from './MeetingRequests';
import Chat from './Chat';
import StudentProfiles from './StudentProfiles';
import StudentProfileDetails from './StudentProfileDetails';
import { Counselor } from '../services/counselorAuthService';
import { useNotificationCounts } from '../hooks/useNotificationCounts';
import { getCounselorPoolData, PoolStudent } from '../services/poolManagementService';
import WeightingModal from './WeightingModal';

type TabType = 'academic' | 'active' | 'assigned' | 'essays' | 'scholarships' | 'resources' | 'meetings' | 'inbox' | 'student_profiles';
type CompositeFilter = 'all' | '90-100' | '80-89' | '70-79' | 'below-70';

interface Student {
  id: string;
  name: string;
  email: string;
  description: string;
  careerInterests: string[];
  essayActivities: number;
  academicPerformance: number;
  academicTrend: number;
  compositeStrength: number;
  strengthLabel: 'Strong' | 'Competitive' | 'Developing';
  composite_score: number;
  academic_performance: number;
  essay_activities_rating: number;
  academic_trend: number;
}

interface AssignedStudent extends Student {
  universities: string[];
  assignedDate: string;
}

const DUMMY_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Maya Rodriguez',
    email: 'maya.rodriguez@example.com',
    description: 'Maya is a passionate advocate for environmental justice who combines her love for science with community organizing to create sustainable solutions.',
    careerInterests: ['Environmental Science', 'Public Policy', 'Urban Planning'],
    essayActivities: 92,
    academicPerformance: 84,
    academicTrend: 3,
    compositeStrength: 86.3,
    strengthLabel: 'Strong',
    composite_score: 86.3,
    academic_performance: 84,
    essay_activities_rating: 92,
    academic_trend: 3
  },
  {
    id: '2',
    name: 'Ayaan Patel',
    email: 'ayaan.patel@example.com',
    description: 'Ayaan is an innovative problem-solver with a keen interest in artificial intelligence and its applications in healthcare to improve patient outcomes.',
    careerInterests: ['Computer Science', 'Biomedical Engineering', 'Healthcare'],
    essayActivities: 88,
    academicPerformance: 91,
    academicTrend: 6,
    compositeStrength: 88.3,
    strengthLabel: 'Strong',
    composite_score: 88.3,
    academic_performance: 91,
    essay_activities_rating: 88,
    academic_trend: 6
  },
  {
    id: '3',
    name: 'Ethan Chen',
    email: 'ethan.chen@example.com',
    description: 'Ethan is a creative entrepreneur who founded a social enterprise connecting local artisans with global markets while preserving cultural heritage.',
    careerInterests: ['Business Administration', 'International Relations', 'Social Entrepreneurship'],
    essayActivities: 75,
    academicPerformance: 89,
    academicTrend: 8,
    compositeStrength: 84.0,
    strengthLabel: 'Competitive',
    composite_score: 84.0,
    academic_performance: 89,
    essay_activities_rating: 75,
    academic_trend: 8
  },
  {
    id: '4',
    name: 'Zara Khan',
    email: 'zara.khan@example.com',
    description: 'Zara is a talented writer and aspiring filmmaker who uses storytelling to amplify marginalized voices and spark conversations about social change.',
    careerInterests: ['Film & Media Studies', 'Creative Writing', 'Journalism'],
    essayActivities: 81,
    academicPerformance: 78,
    academicTrend: 2,
    compositeStrength: 80.3,
    strengthLabel: 'Competitive',
    composite_score: 80.3,
    academic_performance: 78,
    essay_activities_rating: 81,
    academic_trend: 2
  },
  {
    id: '5',
    name: 'Lucas Bennett',
    email: 'lucas.bennett@example.com',
    description: 'Lucas is a dedicated student athlete who balances competitive swimming with a passion for physical therapy to help others achieve their athletic goals.',
    careerInterests: ['Kinesiology', 'Physical Therapy', 'Sports Medicine'],
    essayActivities: 68,
    academicPerformance: 73,
    academicTrend: 1,
    compositeStrength: 70.3,
    strengthLabel: 'Developing',
    composite_score: 70.3,
    academic_performance: 73,
    essay_activities_rating: 68,
    academic_trend: 1
  }
];

const DUMMY_ASSIGNED_STUDENTS: AssignedStudent[] = [
  {
    id: '6',
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    description: 'Emma is a dedicated computer science student with exceptional coding skills and a passion for developing AI solutions.',
    careerInterests: ['Computer Science', 'Artificial Intelligence', 'Software Engineering'],
    essayActivities: 95,
    academicPerformance: 92,
    academicTrend: 5,
    compositeStrength: 91.5,
    strengthLabel: 'Strong',
    composite_score: 91.5,
    academic_performance: 92,
    essay_activities_rating: 95,
    academic_trend: 5,
    universities: ['Stanford University', 'UC Berkeley', 'University of Washington'],
    assignedDate: '2024-12-10'
  },
  {
    id: '7',
    name: 'Sophie Chen',
    email: 'sophie.chen@example.com',
    description: 'Sophie is a robotics enthusiast who has won multiple national competitions and developed innovative solutions for accessibility.',
    careerInterests: ['Mechanical Engineering', 'Robotics', 'Product Design'],
    essayActivities: 89,
    academicPerformance: 88,
    academicTrend: 7,
    compositeStrength: 87.8,
    strengthLabel: 'Strong',
    composite_score: 87.8,
    academic_performance: 88,
    essay_activities_rating: 89,
    academic_trend: 7,
    universities: ['MIT', 'University of Michigan', 'Purdue University', 'Georgia Tech'],
    assignedDate: '2024-12-12'
  }
];

interface CounselorDashboardProps {
  counselor: Counselor;
  onLogout: () => void;
}

export default function CounselorDashboard({ counselor, onLogout }: CounselorDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('academic');
  const [activeStudents, setActiveStudents] = useState<Student[]>(DUMMY_STUDENTS);
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>(DUMMY_ASSIGNED_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [compositeFilter, setCompositeFilter] = useState<CompositeFilter>('all');
  const [detailsModalStudent, setDetailsModalStudent] = useState<Student | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState<string | null>(null);
  const [isLoadingPoolData, setIsLoadingPoolData] = useState(false);
  const [showWeightingModal, setShowWeightingModal] = useState(false);
  const { counts } = useNotificationCounts(counselor.id, counselor.name);

  const fetchPoolData = async () => {
    if (counselor.role === 'pool_management') {
      setIsLoadingPoolData(true);
      try {
        console.log('Fetching pool data for counselor:', counselor.name);
        const poolData = await getCounselorPoolData(counselor.name);
        console.log('Pool data received:', poolData);
        setActiveStudents(poolData.activeStudents as Student[]);
      } catch (error) {
        console.error('Error fetching pool data:', error);
      } finally {
        setIsLoadingPoolData(false);
      }
    }
  };

  useEffect(() => {
    fetchPoolData();
  }, [counselor.name, counselor.role]);

  const handleWeightingSave = () => {
    fetchPoolData();
  };

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...activeStudents];

    if (compositeFilter !== 'all') {
      filtered = filtered.filter(student => {
        const score = student.compositeStrength;
        switch (compositeFilter) {
          case '90-100':
            return score >= 90 && score <= 100;
          case '80-89':
            return score >= 80 && score < 90;
          case '70-79':
            return score >= 70 && score < 80;
          case 'below-70':
            return score < 70;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => b.compositeStrength - a.compositeStrength);
  }, [activeStudents, compositeFilter]);

  const avgStrength = filteredAndSortedStudents.reduce((acc, s) => acc + s.compositeStrength, 0) / (filteredAndSortedStudents.length || 1);
  const totalAssigned = assignedStudents.length;
  const totalOriginal = DUMMY_STUDENTS.length + DUMMY_ASSIGNED_STUDENTS.length;

  const handleAssignmentComplete = () => {
    if (selectedStudent) {
      setActiveStudents(activeStudents.filter(s => s.id !== selectedStudent.id));
    }
    setSelectedStudent(null);
  };

  if (viewingStudentId) {
    return (
      <AssignedStudentDetails
        studentId={viewingStudentId}
        counselorId={counselor.id}
        onBack={() => setViewingStudentId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`bg-white border-r border-slate-200 fixed left-0 top-0 bottom-0 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-24 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:bg-slate-50 transition-colors z-50"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          )}
        </button>

        <div className={`p-6 border-b border-slate-200 ${sidebarCollapsed ? 'p-4' : ''}`}>
          <div className={`flex items-center gap-3 mb-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <img src="/white_logo.png" alt="EduCare" className="w-10 h-10 object-contain" />
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <p className="text-xl font-bold text-[#04ADEE] leading-tight">EduCare</p>
                <p className="text-xs text-slate-500">Counselor Portal</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="mb-4">
            {!sidebarCollapsed && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Academic</p>
            )}
            <button
              onClick={() => setActiveTab('academic')}
              className={`w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              } ${
                activeTab === 'academic'
                  ? 'bg-[#04ADEE] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              title={sidebarCollapsed ? 'Academic Tracking' : undefined}
            >
              <GraduationCap className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Academic Tracking</span>}
            </button>
          </div>

          {counselor.role === 'pool_management' && (
            <div className="mb-4">
              {!sidebarCollapsed && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Pool Management</p>
              )}
              <button
                onClick={() => setActiveTab('active')}
                className={`w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                  sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                } ${
                  activeTab === 'active'
                    ? 'bg-[#04ADEE] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                title={sidebarCollapsed ? 'Active Pool' : undefined}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span>Active Pool</span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {filteredAndSortedStudents.length}
                    </span>
                  </>
                )}
              </button>
              <button
                onClick={() => setActiveTab('assigned')}
                className={`w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                  sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                } ${
                  activeTab === 'assigned'
                    ? 'bg-[#04ADEE] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                title={sidebarCollapsed ? 'Assigned Students' : undefined}
              >
                <UserCheck className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span>Assigned Students</span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === 'assigned' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {totalAssigned}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {counselor.role === 'essay' && (
            <div className="mb-4">
              {!sidebarCollapsed && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Essays and Profiles</p>
              )}
              <button
                onClick={() => setActiveTab('essays')}
                className={`w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                  sidebarCollapsed ? 'justify-center p-3 relative' : 'gap-3 px-3 py-2.5'
                } ${
                  activeTab === 'essays'
                    ? 'bg-[#04ADEE] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                title={sidebarCollapsed ? 'Essay Review' : undefined}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                {sidebarCollapsed && counts.unreviewedEssays > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                {!sidebarCollapsed && (
                  <>
                    <span>Essay Review</span>
                    {counts.unreviewedEssays > 0 && (
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                        activeTab === 'essays' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {counts.unreviewedEssays}
                      </span>
                    )}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('student_profiles');
                  setSelectedStudentProfileId(null);
                }}
                className={`w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                  sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                } ${
                  activeTab === 'student_profiles'
                    ? 'bg-[#04ADEE] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                title={sidebarCollapsed ? 'Student Profiles' : undefined}
              >
                <User className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>Student Profiles</span>}
              </button>
            </div>
          )}

          <div className="mb-4">
            {!sidebarCollapsed && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Communication</p>
            )}
            <button
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                sidebarCollapsed ? 'justify-center p-3 relative' : 'gap-3 px-3 py-2.5'
              } ${
                activeTab === 'inbox'
                  ? 'bg-[#04ADEE] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              title={sidebarCollapsed ? 'Inbox' : undefined}
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              {sidebarCollapsed && counts.unreadMessages > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
              {!sidebarCollapsed && (
                <>
                  <span>Inbox</span>
                  {counts.unreadMessages > 0 && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === 'inbox' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {counts.unreadMessages}
                    </span>
                  )}
                </>
              )}
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                sidebarCollapsed ? 'justify-center p-3 relative' : 'gap-3 px-3 py-2.5'
              } ${
                activeTab === 'meetings'
                  ? 'bg-[#04ADEE] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              title={sidebarCollapsed ? 'Meeting Requests' : undefined}
            >
              <Calendar className="w-5 h-5 flex-shrink-0" />
              {sidebarCollapsed && counts.pendingMeetings > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
              {!sidebarCollapsed && (
                <>
                  <span>Meeting Requests</span>
                  {counts.pendingMeetings > 0 && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === 'meetings' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {counts.pendingMeetings}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Resources</p>
            )}
            <button
              onClick={() => setActiveTab('scholarships')}
              className={`w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              } ${
                activeTab === 'scholarships'
                  ? 'bg-[#04ADEE] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              title={sidebarCollapsed ? 'Scholarships' : undefined}
            >
              <Award className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Scholarships</span>}
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              } ${
                activeTab === 'resources'
                  ? 'bg-[#04ADEE] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              title={sidebarCollapsed ? 'Resources' : undefined}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Resources</span>}
            </button>
          </div>
        </nav>

        <div className={`border-t border-slate-200 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="https://images.pexels.com/photos/3782235/pexels-photo-3782235.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt={counselor.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{counselor.name}</p>
                  <p className="text-xs text-slate-500">Counselor</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-72'
      }`}>
        {(activeTab === 'active' || activeTab === 'assigned') && (
          <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-[#04ADEE]" />
                  <h1 className="text-2xl font-bold text-slate-900">Pool Management Dashboard</h1>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowWeightingModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-[#04ADEE] text-slate-700 hover:text-[#04ADEE] rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow"
                  >
                    <Settings className="w-4 h-4" />
                    Set Weighting
                  </button>
                  <div className="flex items-center gap-2 bg-emerald-500 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-semibold text-white">Active</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-600">Active Pool</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">
                      <AnimatedCounter end={filteredAndSortedStudents.length} duration={1500} />
                    </span>
                    <span className="text-sm text-slate-600">Students</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-600">Assigned</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">
                      <AnimatedCounter end={totalAssigned} duration={1500} />
                    </span>
                    <span className="text-sm text-slate-600">Students</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-600">Avg Strength</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#04ADEE]">
                      <AnimatedCounter end={avgStrength} duration={1500} decimals={1} />
                    </span>
                    <span className="text-sm text-slate-600">%</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-600">Progress</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-lg font-bold text-slate-900">
                      <AnimatedCounter end={totalAssigned} duration={1500} /> / <AnimatedCounter end={totalOriginal} duration={1500} />
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(totalAssigned / totalOriginal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-8 py-6">

        {activeTab === 'academic' && (
          <AcademicTracking />
        )}

        {activeTab === 'inbox' && (
          <Chat userRole="counselor" />
        )}

        {activeTab === 'essays' && (
          <EssayReview />
        )}

        {activeTab === 'meetings' && (
          <MeetingRequests counselorId={counselor.id} counselorName={counselor.name} />
        )}

        {activeTab === 'student_profiles' && (
          selectedStudentProfileId ? (
            <StudentProfileDetails
              studentId={selectedStudentProfileId}
              onBack={() => setSelectedStudentProfileId(null)}
            />
          ) : (
            <StudentProfiles onSelectStudent={setSelectedStudentProfileId} />
          )
        )}

        {activeTab === 'scholarships' && (
          <CounselorScholarshipsPage onBack={() => setActiveTab('active')} onLogout={() => {}} />
        )}

        {activeTab === 'resources' && (
          <CounselorResourcesPage onBack={() => setActiveTab('active')} onLogout={() => {}} />
        )}

        {activeTab === 'active' && (
          <div>
            {isLoadingPoolData ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-12 h-12 border-4 border-[#04ADEE] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Loading Pool Data</h3>
                <p className="text-sm text-slate-600">Fetching students from Firebase...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Filter by Composite:</span>
                    <select
                      value={compositeFilter}
                      onChange={(e) => setCompositeFilter(e.target.value as CompositeFilter)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                    >
                      <option value="all">All Students</option>
                      <option value="90-100">90-100 (Excellent)</option>
                      <option value="80-89">80-89 (Strong)</option>
                      <option value="70-79">70-79 (Competitive)</option>
                      <option value="below-70">Below 70 (Developing)</option>
                    </select>
                  </div>
                  <span className="text-sm text-slate-500">
                    Showing {filteredAndSortedStudents.length} of {activeStudents.length} students
                  </span>
                </div>

                {filteredAndSortedStudents.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Students Found</h3>
                <p className="text-sm text-slate-600">Try adjusting your filter to see more students.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedStudents.map((student) => {
                  const maxDescriptionLength = 120;
                  const isLongDescription = student.description.length > maxDescriptionLength;
                  const truncatedDescription = isLongDescription
                    ? student.description.slice(0, maxDescriptionLength) + '...'
                    : student.description;

                  return (
                  <div
                    key={student.id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{student.name}</h3>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          student.strengthLabel === 'Strong'
                            ? 'bg-emerald-100 text-emerald-700'
                            : student.strengthLabel === 'Competitive'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {student.strengthLabel}
                        </span>
                      </div>
                      <div className="text-center bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                        <div className="text-xs text-slate-500 mb-0.5">Composite</div>
                        <div className="text-2xl font-bold text-slate-900">
                          <AnimatedCounter end={student.compositeStrength} duration={1500} decimals={1} />
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-slate-600 leading-relaxed mb-4 flex-grow">
                      <p className="inline">{truncatedDescription}</p>
                      {isLongDescription && (
                        <button
                          onClick={() => setDetailsModalStudent(student)}
                          className="ml-1 text-[#04ADEE] hover:text-[#0396d5] font-medium inline"
                        >
                          Read More
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Essay & Activities</span>
                        <span className="text-xs font-bold text-slate-900">
                          <AnimatedCounter end={student.essayActivities} duration={1500} />%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Current Average</span>
                        <span className="text-xs font-bold text-slate-900">
                          <AnimatedCounter end={student.academicPerformance} duration={1500} />%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Past Overall Average</span>
                        <span className="text-xs font-bold text-slate-900">
                          <AnimatedCounter end={student.academicTrend} duration={1500} />%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="w-full px-4 py-2.5 bg-[#04ADEE] hover:bg-[#0396d5] text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow"
                    >
                      Assign Universities
                    </button>
                  </div>
                  );
                })}
              </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'assigned' && (
          <div className="space-y-3">
            {assignedStudents.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Assigned Students Yet</h3>
                <p className="text-sm text-slate-600">Students will appear here once universities are assigned.</p>
              </div>
            ) : (
              assignedStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setViewingStudentId(student.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">{student.name}</h3>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        student.strengthLabel === 'Strong'
                          ? 'bg-emerald-100 text-emerald-700'
                          : student.strengthLabel === 'Competitive'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {student.strengthLabel}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Composite</div>
                      <div className="text-xl font-bold text-slate-900">
                        <AnimatedCounter end={student.compositeStrength} duration={1500} decimals={1} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Assigned Universities ({student.universities.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {student.universities.map((uni, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-slate-200"
                        >
                          {uni}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        </div>
      </main>

      {selectedStudent && (
        <AssignmentModal
          student={selectedStudent as any}
          counselorId="counselor-demo"
          onClose={() => setSelectedStudent(null)}
          onComplete={handleAssignmentComplete}
        />
      )}

      {detailsModalStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Student Details</h2>
              <button
                onClick={() => setDetailsModalStudent(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{detailsModalStudent.name}</h3>
                  <p className="text-sm text-slate-600">{detailsModalStudent.email}</p>
                  <span className={`inline-block mt-3 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    detailsModalStudent.strengthLabel === 'Strong'
                      ? 'bg-emerald-100 text-emerald-700'
                      : detailsModalStudent.strengthLabel === 'Competitive'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {detailsModalStudent.strengthLabel}
                  </span>
                </div>
                <div className="text-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Composite Score</div>
                  <div className="text-3xl font-bold text-slate-900">
                    <AnimatedCounter end={detailsModalStudent.compositeStrength} duration={1500} decimals={1} />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-900 mb-2">About</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{detailsModalStudent.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-xs font-medium text-slate-500 mb-1">Essay & Activities</div>
                  <div className="text-2xl font-bold text-slate-900">
                    <AnimatedCounter end={detailsModalStudent.essayActivities} duration={1500} />%
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-xs font-medium text-slate-500 mb-1">Current Average</div>
                  <div className="text-2xl font-bold text-slate-900">
                    <AnimatedCounter end={detailsModalStudent.academicPerformance} duration={1500} />%
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-xs font-medium text-slate-500 mb-1">Past Overall Average</div>
                  <div className="text-2xl font-bold text-slate-900">
                    <AnimatedCounter end={detailsModalStudent.academicTrend} duration={1500} />%
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Career Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {detailsModalStudent.careerInterests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setDetailsModalStudent(null);
                  setSelectedStudent(detailsModalStudent);
                }}
                className="w-full px-4 py-3 bg-[#04ADEE] hover:bg-[#0396d5] text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow"
              >
                Assign Universities to {detailsModalStudent.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWeightingModal && (
        <WeightingModal
          counselorName={counselor.name}
          onClose={() => setShowWeightingModal(false)}
          onSave={handleWeightingSave}
        />
      )}
    </div>
  );
}
