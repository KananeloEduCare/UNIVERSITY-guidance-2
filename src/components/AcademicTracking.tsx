import React, { useState } from 'react';
import { BookOpen, TrendingUp, ArrowLeft, GraduationCap, Users, Target, Search, Trophy, Medal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AnimatedCounter from './AnimatedCounter';
import CircularProgress from './CircularProgress';

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  current_grade: number;
  syllabus_completion: number;
  total_assignments: number;
  completed_assignments: number;
  teacher_report: string;
  report_date: string;
}

interface StudentDetails {
  student_id: string;
  student_name: string;
  overall_average: number;
  overall_syllabus_completion: number;
  courses: Course[];
}

const DUMMY_STUDENTS = [
  {
    student_id: '1',
    student_name: 'Alexander Lee',
    overall_average: 91,
    num_courses: 6,
  },
  {
    student_id: '2',
    student_name: 'Sophia Martinez',
    overall_average: 87,
    num_courses: 6,
  },
  {
    student_id: '3',
    student_name: 'Ethan Johnson',
    overall_average: 73,
    num_courses: 6,
  },
  {
    student_id: '4',
    student_name: 'Olivia Chen',
    overall_average: 94,
    num_courses: 6,
  },
  {
    student_id: '5',
    student_name: 'Marcus Williams',
    overall_average: 82,
    num_courses: 6,
  },
];

const STUDENT_DETAILS: Record<string, StudentDetails> = {
  '1': {
    student_id: '1',
    student_name: 'Alexander Lee',
    overall_average: 91,
    overall_syllabus_completion: 87,
    courses: [
      { id: '1', course_name: 'Mathematics HL', course_code: 'MATH-HL', current_grade: 94, syllabus_completion: 88, total_assignments: 12, completed_assignments: 11, teacher_report: 'Alexander demonstrates exceptional understanding of calculus concepts. His problem-solving approach is methodical and creative. Continue to challenge him with advanced problems.', report_date: '2024-03-15' },
      { id: '2', course_name: 'Physics HL', course_code: 'PHYS-HL', current_grade: 92, syllabus_completion: 85, total_assignments: 14, completed_assignments: 13, teacher_report: 'Strong grasp of theoretical concepts and experimental design. Lab reports are thorough and well-documented. Excellent collaboration during group projects.', report_date: '2024-03-12' },
      { id: '3', course_name: 'Chemistry HL', course_code: 'CHEM-HL', current_grade: 89, syllabus_completion: 82, total_assignments: 13, completed_assignments: 12, teacher_report: 'Good understanding of chemical reactions and bonding. Would benefit from more practice with complex stoichiometry problems. Lab technique is excellent.', report_date: '2024-03-10' },
      { id: '4', course_name: 'English A SL', course_code: 'ENG-SL', current_grade: 91, syllabus_completion: 90, total_assignments: 10, completed_assignments: 10, teacher_report: 'Insightful literary analysis with strong critical thinking. Essays are well-structured and demonstrate deep engagement with texts. Excellent participation in discussions.', report_date: '2024-03-14' },
      { id: '5', course_name: 'Spanish B SL', course_code: 'SPAN-SL', current_grade: 88, syllabus_completion: 86, total_assignments: 11, completed_assignments: 10, teacher_report: 'Strong oral proficiency and good grammatical accuracy. Written compositions show creativity. Continue practicing verb conjugations in subjunctive mood.', report_date: '2024-03-11' },
      { id: '6', course_name: 'Economics SL', course_code: 'ECON-SL', current_grade: 93, syllabus_completion: 89, total_assignments: 12, completed_assignments: 11, teacher_report: 'Excellent grasp of micro and macroeconomic principles. Case study analyses are particularly strong. Shows ability to apply theory to real-world scenarios effectively.', report_date: '2024-03-13' },
    ],
  },
  '2': {
    student_id: '2',
    student_name: 'Sophia Martinez',
    overall_average: 87,
    overall_syllabus_completion: 83,
    courses: [
      { id: '7', course_name: 'Mathematics HL', course_code: 'MATH-HL', current_grade: 88, syllabus_completion: 82, total_assignments: 12, completed_assignments: 10, teacher_report: 'Sophia shows consistent effort and steady improvement in mathematics. Her algebra skills are strong. Recommend additional practice with trigonometric identities.', report_date: '2024-03-14' },
      { id: '8', course_name: 'Biology HL', course_code: 'BIO-HL', current_grade: 90, syllabus_completion: 87, total_assignments: 14, completed_assignments: 13, teacher_report: 'Outstanding performance in cellular biology and genetics. Lab dissections demonstrate excellent attention to detail. A natural curiosity drives her learning.', report_date: '2024-03-13' },
      { id: '9', course_name: 'Chemistry HL', course_code: 'CHEM-HL', current_grade: 86, syllabus_completion: 80, total_assignments: 13, completed_assignments: 11, teacher_report: 'Solid understanding of fundamental concepts. Organic chemistry assignments show promise. Would benefit from attending extra help sessions for titration calculations.', report_date: '2024-03-11' },
      { id: '10', course_name: 'English A SL', course_code: 'ENG-SL', current_grade: 87, syllabus_completion: 85, total_assignments: 10, completed_assignments: 9, teacher_report: 'Good analytical skills in poetry analysis. Written expression is clear and organized. Encourage more participation during class discussions to build confidence.', report_date: '2024-03-15' },
      { id: '11', course_name: 'French B SL', course_code: 'FR-SL', current_grade: 84, syllabus_completion: 81, total_assignments: 11, completed_assignments: 9, teacher_report: 'Developing strong reading comprehension skills. Pronunciation has improved significantly this term. Continue working on expanding vocabulary for more complex topics.', report_date: '2024-03-12' },
      { id: '12', course_name: 'Psychology SL', course_code: 'PSY-SL', current_grade: 89, syllabus_completion: 84, total_assignments: 12, completed_assignments: 11, teacher_report: 'Excellent critical analysis of psychological theories. Research project on cognitive biases was particularly impressive. Active contributor to class discussions.', report_date: '2024-03-14' },
    ],
  },
  '3': {
    student_id: '3',
    student_name: 'Ethan Johnson',
    overall_average: 73,
    overall_syllabus_completion: 71,
    courses: [
      { id: '13', course_name: 'Mathematics SL', course_code: 'MATH-SL', current_grade: 75, syllabus_completion: 72, total_assignments: 12, completed_assignments: 9, teacher_report: 'Ethan is working hard to improve his mathematical skills. He benefits greatly from one-on-one tutoring sessions. Needs to stay consistent with homework completion.', report_date: '2024-03-13' },
      { id: '14', course_name: 'Physics SL', course_code: 'PHYS-SL', current_grade: 71, syllabus_completion: 68, total_assignments: 14, completed_assignments: 10, teacher_report: 'Struggles with abstract concepts but shows determination. Visual demonstrations help his understanding. Recommend using online simulation tools for extra practice.', report_date: '2024-03-11' },
      { id: '15', course_name: 'Geography HL', course_code: 'GEO-HL', current_grade: 76, syllabus_completion: 74, total_assignments: 13, completed_assignments: 10, teacher_report: 'Strong interest in environmental topics. Field trip notes were excellent. Map work needs improvement, particularly scale and projection concepts.', report_date: '2024-03-15' },
      { id: '16', course_name: 'English A SL', course_code: 'ENG-SL', current_grade: 72, syllabus_completion: 70, total_assignments: 10, completed_assignments: 7, teacher_report: 'Creative ideas in writing but needs to work on essay structure. Missing assignments have affected grade. One-on-one conferences have been helpful for organizing thoughts.', report_date: '2024-03-12' },
      { id: '17', course_name: 'Spanish B SL', course_code: 'SPAN-SL', current_grade: 70, syllabus_completion: 69, total_assignments: 11, completed_assignments: 8, teacher_report: 'Finding language acquisition challenging but maintains positive attitude. Oral presentations show improvement. Needs consistent practice with verb tenses and vocabulary.', report_date: '2024-03-10' },
      { id: '18', course_name: 'Business SL', course_code: 'BUS-SL', current_grade: 74, syllabus_completion: 73, total_assignments: 12, completed_assignments: 9, teacher_report: 'Good understanding of basic business concepts. Particularly engaged during case study discussions. Written assignments would benefit from more detailed analysis and examples.', report_date: '2024-03-14' },
    ],
  },
  '4': {
    student_id: '4',
    student_name: 'Olivia Chen',
    overall_average: 94,
    overall_syllabus_completion: 92,
    courses: [
      { id: '19', course_name: 'Mathematics HL', course_code: 'MATH-HL', current_grade: 96, syllabus_completion: 94, total_assignments: 12, completed_assignments: 12, teacher_report: 'Olivia is an exceptional mathematics student. Her proof writing is elegant and logical. She regularly helps peers during study sessions. Consider preparing for advanced mathematics competitions.', report_date: '2024-03-15' },
      { id: '20', course_name: 'Physics HL', course_code: 'PHYS-HL', current_grade: 95, syllabus_completion: 93, total_assignments: 14, completed_assignments: 14, teacher_report: 'Outstanding analytical and problem-solving abilities. Lab reports are comprehensive and show deep understanding. Quantum mechanics unit was handled with remarkable maturity.', report_date: '2024-03-14' },
      { id: '21', course_name: 'Chemistry HL', course_code: 'CHEM-HL', current_grade: 94, syllabus_completion: 92, total_assignments: 13, completed_assignments: 13, teacher_report: 'Exemplary work in all areas. Demonstrates mastery of both theoretical and practical chemistry. Independent research project on catalysis was publication-quality work.', report_date: '2024-03-13' },
      { id: '22', course_name: 'English A SL', course_code: 'ENG-SL', current_grade: 93, syllabus_completion: 91, total_assignments: 10, completed_assignments: 10, teacher_report: 'Sophisticated literary analysis with nuanced interpretations. Writing demonstrates exceptional clarity and depth. A consistent leader in seminar discussions.', report_date: '2024-03-15' },
      { id: '23', course_name: 'Mandarin B SL', course_code: 'MAND-SL', current_grade: 95, syllabus_completion: 93, total_assignments: 11, completed_assignments: 11, teacher_report: 'Near-native fluency with excellent character recognition. Cultural presentations show deep understanding and research. Peer tutoring has been invaluable to the class.', report_date: '2024-03-12' },
      { id: '24', course_name: 'Economics SL', course_code: 'ECON-SL', current_grade: 91, syllabus_completion: 89, total_assignments: 12, completed_assignments: 11, teacher_report: 'Strong analytical skills applied to economic models. Policy analysis essays demonstrate critical thinking. Particularly strong in understanding market dynamics and elasticity.', report_date: '2024-03-14' },
    ],
  },
  '5': {
    student_id: '5',
    student_name: 'Marcus Williams',
    overall_average: 82,
    overall_syllabus_completion: 79,
    courses: [
      { id: '25', course_name: 'Mathematics SL', course_code: 'MATH-SL', current_grade: 83, syllabus_completion: 80, total_assignments: 12, completed_assignments: 10, teacher_report: 'Marcus demonstrates solid grasp of core concepts. His problem-solving has improved steadily this term. Would benefit from completing all practice assignments for better retention.', report_date: '2024-03-14' },
      { id: '26', course_name: 'Biology HL', course_code: 'BIO-HL', current_grade: 85, syllabus_completion: 82, total_assignments: 14, completed_assignments: 12, teacher_report: 'Shows particular strength in ecology and environmental science. Lab notebook is well-organized. Genetics unit requires some additional review for full mastery.', report_date: '2024-03-13' },
      { id: '27', course_name: 'History HL', course_code: 'HIST-HL', current_grade: 81, syllabus_completion: 78, total_assignments: 13, completed_assignments: 11, teacher_report: 'Good analytical approach to historical events. Essays show understanding but could be more detailed with primary source analysis. Classroom discussions are insightful.', report_date: '2024-03-12' },
      { id: '28', course_name: 'English A SL', course_code: 'ENG-SL', current_grade: 80, syllabus_completion: 77, total_assignments: 10, completed_assignments: 8, teacher_report: 'Developing strong analytical reading skills. Writing shows promise but needs work on thesis development. Recent essay on symbolism showed marked improvement.', report_date: '2024-03-15' },
      { id: '29', course_name: 'Spanish B SL', course_code: 'SPAN-SL', current_grade: 82, syllabus_completion: 79, total_assignments: 11, completed_assignments: 9, teacher_report: 'Good conversational ability with growing confidence. Grammar exercises are generally accurate. Cultural project on Latin American literature was well-researched.', report_date: '2024-03-11' },
      { id: '30', course_name: 'Psychology SL', course_code: 'PSY-SL', current_grade: 81, syllabus_completion: 78, total_assignments: 12, completed_assignments: 10, teacher_report: 'Engaged learner with good understanding of psychological principles. Research methods section was challenging but he persevered. Contribute more during group activities.', report_date: '2024-03-14' },
    ],
  },
};

const AcademicTracking: React.FC = () => {
  const [students] = useState(DUMMY_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleStudentClick = (studentId: string) => {
    setSelectedStudent(STUDENT_DETAILS[studentId]);
  };

  const handleBack = () => {
    setSelectedStudent(null);
  };

  const filteredStudents = students
    .filter(student =>
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.overall_average - a.overall_average);

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

  const avgGrade = filteredStudents.length > 0
    ? filteredStudents.reduce((acc, s) => acc + s.overall_average, 0) / filteredStudents.length
    : 0;

  const totalCourses = filteredStudents.reduce((acc, s) => acc + s.num_courses, 0);

  if (selectedStudent) {
    const chartData = selectedStudent.courses.map(course => ({
      name: course.course_code,
      grade: course.current_grade,
      fullName: course.course_name,
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
          <h2 className="text-xl font-bold text-slate-900">{selectedStudent.student_name}</h2>
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
            <h3 className="text-base font-semibold text-slate-800 mb-3">Course Details</h3>
            <div className="space-y-2">
              {selectedStudent.courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-[#04ADEE] transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-800">{course.course_name}</h4>
                      <p className="text-xs text-slate-500">{course.course_code}</p>
                    </div>
                    <div className="ml-3 flex flex-col items-end">
                      <span className="text-xs text-slate-500 mb-0.5">Syllabus Progress</span>
                      <span className="text-sm font-bold text-[#04ADEE]">
                        {course.syllabus_completion}%
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-xs font-semibold text-slate-700">Teacher Report</p>
                      <p className="text-xs text-slate-500">{new Date(course.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {course.teacher_report}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Total Students</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  <AnimatedCounter end={filteredStudents.length} duration={1500} />
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
                  <AnimatedCounter end={avgGrade} duration={1500} decimals={1} />
                </span>
                <span className="text-sm text-slate-600">%</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Total Courses</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  <AnimatedCounter end={totalCourses} duration={1500} />
                </span>
                <span className="text-sm text-slate-600">Courses</span>
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
                  key={student.student_id}
                  onClick={() => handleStudentClick(student.student_id)}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all cursor-pointer border border-slate-200 hover:border-[#04ADEE]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getRankBadge(rank)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-slate-800 mb-2">{student.student_name}</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-sm text-slate-600">
                            {student.num_courses} {student.num_courses === 1 ? 'course' : 'courses'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <CircularProgress
                        percentage={student.overall_average}
                        size={80}
                        strokeWidth={6}
                        color={getGradeColor(student.overall_average)}
                      >
                        <div className="text-center">
                          <p className="text-xl font-bold" style={{ color: getGradeColor(student.overall_average) }}>
                            {student.overall_average}%
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
