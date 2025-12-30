import React, { useState } from 'react';
import { User, Search, Globe } from 'lucide-react';
import { StudentProfile } from '../services/studentProfilesService';

interface StudentProfilesProps {
  onSelectStudent: (studentId: string) => void;
}

const DUMMY_STUDENTS: StudentProfile[] = [
  {
    id: '1',
    student_id: 's1',
    date_of_birth: '2006-03-15',
    nationality: 'United States',
    career_interests: 'Computer Science, Artificial Intelligence, Software Engineering',
    financial_budget: 75000,
    created_at: '2024-01-15',
    student: {
      id: 's1',
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com',
      composite_score: 88.5,
      academic_performance: 90,
      essay_activities_rating: 87,
      academic_trend: 5
    }
  },
  {
    id: '2',
    student_id: 's2',
    date_of_birth: '2006-07-22',
    nationality: 'India',
    career_interests: 'Biomedical Engineering, Healthcare Innovation, Medical Research',
    financial_budget: 45000,
    created_at: '2024-01-20',
    student: {
      id: 's2',
      name: 'Arjun Patel',
      email: 'arjun.patel@email.com',
      composite_score: 91.2,
      academic_performance: 93,
      essay_activities_rating: 89,
      academic_trend: 7
    }
  },
  {
    id: '3',
    student_id: 's3',
    date_of_birth: '2006-11-08',
    nationality: 'United Kingdom',
    career_interests: 'Environmental Science, Climate Policy, Sustainability',
    financial_budget: 60000,
    created_at: '2024-01-25',
    student: {
      id: 's3',
      name: 'Sophie Chen',
      email: 'sophie.chen@email.com',
      composite_score: 85.8,
      academic_performance: 84,
      essay_activities_rating: 88,
      academic_trend: 4
    }
  },
  {
    id: '4',
    student_id: 's4',
    date_of_birth: '2006-05-12',
    nationality: 'Canada',
    career_interests: 'Business Administration, Entrepreneurship, Finance',
    financial_budget: 55000,
    created_at: '2024-02-01',
    student: {
      id: 's4',
      name: 'Marcus Johnson',
      email: 'marcus.johnson@email.com',
      composite_score: 82.4,
      academic_performance: 81,
      essay_activities_rating: 84,
      academic_trend: 3
    }
  },
  {
    id: '5',
    student_id: 's5',
    date_of_birth: '2006-09-30',
    nationality: 'Brazil',
    career_interests: 'Architecture, Urban Planning, Sustainable Design',
    financial_budget: 38000,
    created_at: '2024-02-05',
    student: {
      id: 's5',
      name: 'Isabella Santos',
      email: 'isabella.santos@email.com',
      composite_score: 87.6,
      academic_performance: 86,
      essay_activities_rating: 90,
      academic_trend: 6
    }
  },
  {
    id: '6',
    student_id: 's6',
    date_of_birth: '2006-01-18',
    nationality: 'South Korea',
    career_interests: 'Mechanical Engineering, Robotics, Automation',
    financial_budget: 50000,
    created_at: '2024-02-10',
    student: {
      id: 's6',
      name: 'David Kim',
      email: 'david.kim@email.com',
      composite_score: 89.3,
      academic_performance: 91,
      essay_activities_rating: 87,
      academic_trend: 5
    }
  },
  {
    id: '7',
    student_id: 's7',
    date_of_birth: '2006-04-25',
    nationality: 'Nigeria',
    career_interests: 'International Relations, Political Science, Diplomacy',
    financial_budget: 42000,
    created_at: '2024-02-15',
    student: {
      id: 's7',
      name: 'Amara Okonkwo',
      email: 'amara.okonkwo@email.com',
      composite_score: 84.7,
      academic_performance: 83,
      essay_activities_rating: 86,
      academic_trend: 4
    }
  },
  {
    id: '8',
    student_id: 's8',
    date_of_birth: '2006-08-14',
    nationality: 'Australia',
    career_interests: 'Marine Biology, Environmental Conservation, Research',
    financial_budget: 58000,
    created_at: '2024-02-20',
    student: {
      id: 's8',
      name: 'Olivia Thompson',
      email: 'olivia.thompson@email.com',
      composite_score: 86.9,
      academic_performance: 85,
      essay_activities_rating: 89,
      academic_trend: 5
    }
  }
];

export default function StudentProfiles({ onSelectStudent }: StudentProfilesProps) {
  const [students] = useState<StudentProfile[]>(DUMMY_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(
    (student) =>
      student.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nationality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Profiles</h2>
          <p className="text-gray-600 mt-1">View and manage student information</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name or nationality..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No students found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => onSelectStudent(student.id)}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all text-left w-full"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {student.student?.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.student?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{student.student?.email}</p>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Age {calculateAge(student.date_of_birth)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{student.nationality}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
