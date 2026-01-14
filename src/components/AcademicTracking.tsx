import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, ArrowLeft, GraduationCap, Users, Search, Trophy, Medal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AnimatedCounter from './AnimatedCounter';
import CircularProgress from './CircularProgress';
import { getCounselorAcademicData, StudentAcademicData } from '../services/firebaseAcademicService';



const AcademicTracking: React.FC = () => {
  const [students, setStudents] = useState<StudentAcademicData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentAcademicData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageGrade, setAverageGrade] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const counselorName = localStorage.getItem('counselor_name') || 'Mr Adoniyas Tesfaye';
        const data = await getCounselorAcademicData(counselorName);
        setStudents(data.students);
        setTotalStudents(data.totalStudents);
        setAverageGrade(data.averageGrade);
      } catch (error) {
        console.error('Error fetching academic data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStudentClick = (studentName: string) => {
    const student = students.find(s => s.studentName === studentName);
    if (student) {
      setSelectedStudent(student);
    }
  };

  const handleBack = () => {
    setSelectedStudent(null);
  };

  const filteredStudents = students
    .filter(student =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.overallAverage - a.overallAverage);

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


  if (selectedStudent) {
    const chartData = selectedStudent.subjectAverages.map(subject => ({
      name: subject.subject.length > 12 ? subject.subject.substring(0, 12) + '...' : subject.subject,
      grade: subject.grade,
      fullName: subject.subject,
    }));

    return (
      <div className="-mx-8 -my-6">
        <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20 px-8 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#04ADEE] hover:text-[#0396d5] mb-3 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </button>
          <h2 className="text-xl font-bold text-slate-900">{selectedStudent.studentName}</h2>
        </div>

        <div className="px-8 py-6">
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm mb-4">
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

          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Academic History</h3>
            {selectedStudent.previousAverages.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No previous academic records available</p>
              </div>
            ) : (
              <div className="space-y-4">
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
              <h1 className="text-2xl font-bold text-slate-900">Academic Tracking Dashboard</h1>
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
        <div className="mb-6">
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
