import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, ArrowLeft, GraduationCap, Users, Search, Trophy, Medal, ChevronDown, ChevronUp, FileText, Target, Award, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AnimatedCounter from './AnimatedCounter';
import CircularProgress from './CircularProgress';
import { getCounselorAcademicData, StudentAcademicData, getStudentProfileData, StudentProfileData, Essay } from '../services/firebaseAcademicService';
import { calculateAge } from '../utils/dateHelpers';



const AcademicTracking: React.FC = () => {
  const [students, setStudents] = useState<StudentAcademicData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentAcademicData | null>(null);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentProfileData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'desc' | 'asc' | 'alphabetical'>('desc');
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageGrade, setAverageGrade] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    academicHistory: false,
    personalStatement: false,
    activities: false,
    supplementaryEssays: false,
    careerInterests: false,
    specialCircumstances: false,
  });
  const [viewingEssayFromProfile, setViewingEssayFromProfile] = useState(false);
  const [viewingEssay, setViewingEssay] = useState<Essay | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 AcademicTracking: Starting data fetch from FIREBASE...');
        setLoading(true);

        const counselorName = localStorage.getItem('counselor_name') || 'Mr Adoniyas Tesfaye';
        console.log('👤 Counselor from localStorage:', counselorName);

        const data = await getCounselorAcademicData(counselorName);

        console.log('📊 Data received from Firebase service:');
        console.log('  - Total Students:', data.totalStudents);
        console.log('  - Average Grade:', data.averageGrade);
        console.log('  - Students Array:', data.students);
        console.log('  - Number of Students in Array:', data.students.length);

        setStudents(data.students);
        setTotalStudents(data.totalStudents);
        setAverageGrade(data.averageGrade);

        console.log('✅ State updated successfully');
        console.log('  - filteredStudents will have:', data.students.length, 'students');
      } catch (error) {
        console.error('❌ Error in AcademicTracking component:', error);
      } finally {
        setLoading(false);
        console.log('🏁 Loading complete');
      }
    };

    fetchData();
  }, []);

  const handleStudentClick = async (studentName: string) => {
    console.log('🔍 Clicking on student:', studentName);
    const student = students.find(s => s.studentName === studentName);
    if (student) {
      console.log('✅ Found student data:', student);
      setSelectedStudent(student);
      setProfileLoading(true);

      const profileData = await getStudentProfileData(studentName);
      setSelectedStudentProfile(profileData);
      setProfileLoading(false);

      setExpandedSections({
        academicHistory: false,
        personalStatement: false,
        activities: false,
        supplementaryEssays: false,
        careerInterests: false,
        specialCircumstances: false,
      });
    } else {
      console.log('❌ Student not found in array');
    }
  };

  const handleBack = () => {
    setSelectedStudent(null);
    setSelectedStudentProfile(null);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const openEssayFromProfile = (essay: Essay) => {
    setViewingEssay(essay);
    setViewingEssayFromProfile(true);
  };

  const handleBackFromEssay = () => {
    if (viewingEssayFromProfile && selectedStudent) {
      setViewingEssay(null);
      setViewingEssayFromProfile(false);
    }
  };

  console.log('📋 Current students array length:', students.length);
  console.log('🔍 Current search term:', searchTerm);

  const filteredStudents = students
    .filter(student => {
      const matches = student.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matches && searchTerm) {
        console.log(`Filtering OUT ${student.studentName} (doesn't match "${searchTerm}")`);
      }
      return matches;
    })
    .sort((a, b) => {
      if (sortOption === 'desc') {
        return b.overallAverage - a.overallAverage;
      } else if (sortOption === 'asc') {
        return a.overallAverage - b.overallAverage;
      } else {
        return a.studentName.localeCompare(b.studentName);
      }
    });

  console.log('📋 Filtered Students Count:', filteredStudents.length, 'out of', students.length);
  if (filteredStudents.length > 0) {
    console.log('📋 Filtered Students:', filteredStudents.map(s => s.studentName));
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1.5 rounded-full">
          <Trophy className="w-4 h-4 text-white" />
          <span className="text-sm font-bold text-white">1st</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-slate-300 to-slate-400 px-3 py-1.5 rounded-full">
          <Medal className="w-4 h-4 text-white" />
          <span className="text-sm font-bold text-white">2nd</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 px-3 py-1.5 rounded-full">
          <Medal className="w-4 h-4 text-white" />
          <span className="text-sm font-bold text-white">3rd</span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 border border-slate-300">
        <span className="text-base font-bold text-slate-600">#{rank}</span>
      </div>
    );
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return '#10b981';
    if (grade >= 80) return '#04ADEE';
    if (grade >= 70) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04ADEE]"></div>
      </div>
    );
  }

  if (viewingEssayFromProfile && viewingEssay) {
    return (
      <div className="-mx-8 -my-6">
        <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20 px-8 py-5">
          <button
            onClick={handleBackFromEssay}
            className="flex items-center gap-2 text-[#04ADEE] hover:text-[#0396d5] mb-3 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {selectedStudent?.studentName}
          </button>
          <h2 className="text-2xl font-bold text-slate-900">{viewingEssay.title}</h2>
          {viewingEssay.universityName && (
            <p className="text-sm text-slate-600 mt-1">{viewingEssay.universityName}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            {viewingEssay.reviewed ? (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                Reviewed
              </span>
            ) : (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-semibold">
                Unreviewed
              </span>
            )}
            <span className="text-xs text-slate-500">Created: {viewingEssay.createdAt}</span>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div
              className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: viewingEssay.text }}
            />
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-2">
              To add feedback or grade this essay, open it from the Essay Review tab in your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedStudent) {
    const chartData = selectedStudent.subjectAverages.map(subject => ({
      name: subject.subject.length > 12 ? subject.subject.substring(0, 12) + '...' : subject.subject,
      grade: subject.grade,
      fullName: subject.subject,
    }));

    return (
      <div className="-mx-8 -my-6">
        <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20 px-8 py-5">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#04ADEE] hover:text-[#0396d5] mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </button>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{selectedStudent.studentName}</h2>
          {profileLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-4 h-4 border-2 border-[#04ADEE] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading profile data...</span>
            </div>
          ) : selectedStudentProfile && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="text-xs text-slate-600 mb-0.5">Overall Average</div>
                <div className="text-lg font-bold text-[#04ADEE]">{selectedStudent.overallAverage}%</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="text-xs text-slate-600 mb-0.5">{selectedStudentProfile.sat ? 'SAT' : 'ACT'}</div>
                <div className="text-lg font-bold text-slate-900">
                  {selectedStudentProfile.sat || selectedStudentProfile.act || 'N/A'}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="text-xs text-slate-600 mb-0.5">Age</div>
                <div className="text-lg font-bold text-slate-900">{calculateAge(selectedStudentProfile.dob || '')}</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="text-xs text-slate-600 mb-0.5">Nationality</div>
                <div className="text-lg font-bold text-slate-900">{selectedStudentProfile.nationality || 'N/A'}</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="text-xs text-slate-600 mb-0.5">Budget</div>
                <div className="text-lg font-bold text-slate-900">{selectedStudentProfile.budget || 'N/A'}</div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 space-y-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Course Grades</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={35}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-slate-200 rounded-lg shadow-lg">
                          <p className="text-xs font-semibold text-slate-800">{payload[0].payload.fullName}</p>
                          <p className="text-base font-bold text-[#04ADEE]">
                            Grade: {payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="grade" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => {
                    const colors = ['#04ADEE', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('academicHistory')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#04ADEE]" />
                <h3 className="text-base font-semibold text-slate-800">Academic History</h3>
              </div>
              {expandedSections.academicHistory ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </button>
            {expandedSections.academicHistory && (
              <div className="px-4 pb-4 border-t border-slate-200">
                {selectedStudent.previousAverages.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No previous academic records available</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-3">
                    {selectedStudent.previousAverages.map((yearData, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-bold text-slate-800">{yearData.year}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Overall Average:</span>
                            <span className="text-base font-bold text-[#04ADEE]">{yearData.overallAverage}%</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-200 pt-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Subject Grades</p>
                          <div className="grid grid-cols-2 gap-2">
                            {yearData.subjects.map((subject, subIndex) => (
                              <div
                                key={subIndex}
                                className="bg-white rounded px-3 py-2 border border-slate-200"
                              >
                                <p className="text-xs text-slate-600 mb-0.5">{subject.subject}</p>
                                <p className="text-sm font-bold text-slate-800">{subject.grade}%</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedStudentProfile?.personalStatement && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('personalStatement')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#04ADEE]" />
                  <h3 className="text-base font-semibold text-slate-800">Personal Statement</h3>
                  {selectedStudentProfile.personalStatement.reviewed && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Reviewed</span>
                  )}
                  {!selectedStudentProfile.personalStatement.reviewed && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Unreviewed</span>
                  )}
                </div>
                {expandedSections.personalStatement ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>
              {expandedSections.personalStatement && (
                <div className="px-4 pb-4 border-t border-slate-200 mt-3">
                  <button
                    onClick={() => openEssayFromProfile(selectedStudentProfile.personalStatement!)}
                    className="text-sm font-semibold text-[#04ADEE] hover:text-[#0396d5] hover:underline mb-3 block"
                  >
                    {selectedStudentProfile.personalStatement.title}
                  </button>
                  <div
                    className="prose prose-sm max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: selectedStudentProfile.personalStatement.text }}
                  />
                </div>
              )}
            </div>
          )}

          {selectedStudentProfile?.activitiesList && selectedStudentProfile.activitiesList.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('activities')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#04ADEE]" />
                  <h3 className="text-base font-semibold text-slate-800">Extra Curricular Activities</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    {selectedStudentProfile.activitiesList.length}
                  </span>
                </div>
                {expandedSections.activities ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>
              {expandedSections.activities && (
                <div className="px-4 pb-4 border-t border-slate-200">
                  <div className="space-y-2 mt-3">
                    {selectedStudentProfile.activitiesList.map((activity, index) => (
                      <div key={activity.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#04ADEE] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-900 mb-1">{activity.name}</h4>
                            <p className="text-xs text-slate-600">{activity.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedStudentProfile?.supplementaryEssays && selectedStudentProfile.supplementaryEssays.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('supplementaryEssays')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#04ADEE]" />
                  <h3 className="text-base font-semibold text-slate-800">Supplementary Essays</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    {selectedStudentProfile.supplementaryEssays.length}
                  </span>
                </div>
                {expandedSections.supplementaryEssays ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>
              {expandedSections.supplementaryEssays && (
                <div className="px-4 pb-4 border-t border-slate-200">
                  <div className="space-y-3 mt-3">
                    {selectedStudentProfile.supplementaryEssays.map((essay, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <button
                              onClick={() => openEssayFromProfile(essay)}
                              className="text-sm font-bold text-[#04ADEE] hover:text-[#0396d5] hover:underline mb-1 text-left"
                            >
                              {essay.title}
                            </button>
                            <div className="flex items-center gap-2 flex-wrap">
                              {essay.universityName && (
                                <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {essay.universityName}
                                </span>
                              )}
                              <span className="text-xs text-slate-500">Created: {essay.createdAt}</span>
                            </div>
                          </div>
                          {essay.reviewed ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                              Reviewed
                            </span>
                          ) : (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                              Unreviewed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedStudentProfile?.careerInterests && selectedStudentProfile.careerInterests.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('careerInterests')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#04ADEE]" />
                  <h3 className="text-base font-semibold text-slate-800">Career Interests</h3>
                </div>
                {expandedSections.careerInterests ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>
              {expandedSections.careerInterests && (
                <div className="px-4 pb-4 border-t border-slate-200">
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedStudentProfile.careerInterests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#04ADEE]/10 to-emerald-50 border border-[#04ADEE]/20 rounded-full text-sm font-medium text-slate-800"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedStudentProfile?.specialCircumstances && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('specialCircumstances')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#04ADEE]" />
                  <h3 className="text-base font-semibold text-slate-800">Special Circumstances</h3>
                </div>
                {expandedSections.specialCircumstances ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>
              {expandedSections.specialCircumstances && (
                <div className="px-4 pb-4 border-t border-slate-200">
                  <p className="text-sm text-slate-700 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedStudentProfile.specialCircumstances}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-8 -my-6">
      <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-[#04ADEE]" />
              <h1 className="text-2xl font-bold text-slate-900">Student Profile Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-semibold text-white">Live Data</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Total Students</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  <AnimatedCounter end={totalStudents} duration={1500} />
                </span>
                <span className="text-sm text-slate-600">Students</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Average Grade</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#04ADEE]">
                  <AnimatedCounter end={averageGrade} duration={1500} decimals={1} />
                </span>
                <span className="text-sm text-slate-600">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search students by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-slate-900 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Sort by:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'desc' | 'asc' | 'alphabetical')}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-slate-900 bg-white cursor-pointer"
            >
              <option value="desc">Descending Average</option>
              <option value="asc">Ascending Average</option>
              <option value="alphabetical">Alphabetical Order</option>
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-lg">No students found</p>
            <p className="text-slate-400 text-sm">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredStudents.map((student, index) => {
              const rank = index + 1;
              return (
                <div
                  key={student.studentName}
                  onClick={() => handleStudentClick(student.studentName)}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all cursor-pointer border border-slate-200 hover:border-[#04ADEE]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getRankBadge(rank)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-slate-800 mb-2">{student.studentName}</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-sm text-slate-600">
                            {student.numCourses} {student.numCourses === 1 ? 'course' : 'courses'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <CircularProgress
                        percentage={student.overallAverage}
                        size={80}
                        strokeWidth={6}
                        color={getGradeColor(student.overallAverage)}
                      >
                        <div className="text-center">
                          <p className="text-xl font-bold" style={{ color: getGradeColor(student.overallAverage) }}>
                            {student.overallAverage}%
                          </p>
                          <p className="text-[10px] text-slate-500">Avg</p>
                        </div>
                      </CircularProgress>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicTracking;
