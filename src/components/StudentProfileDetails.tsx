import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Globe,
  DollarSign,
  BookOpen,
  Calendar,
  Briefcase,
  FileText,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { StudentProfile } from '../services/studentProfilesService';
import EssayReview from './EssayReview';

interface SupplementaryEssay {
  id: string;
  essay_title: string;
  university_name: string;
  submission_date: string;
  status: 'pending' | 'in_review' | 'reviewed';
  score: number | null;
}

const DUMMY_SUPPLEMENTARY_ESSAYS: SupplementaryEssay[] = [
  {
    id: '1',
    essay_title: 'Why This Major?',
    university_name: 'Stanford University',
    submission_date: '2024-11-15',
    status: 'reviewed',
    score: 92
  },
  {
    id: '2',
    essay_title: 'Community Impact',
    university_name: 'MIT',
    submission_date: '2024-11-20',
    status: 'reviewed',
    score: 88
  },
  {
    id: '3',
    essay_title: 'Overcoming Challenges',
    university_name: 'UC Berkeley',
    submission_date: '2024-12-01',
    status: 'in_review',
    score: null
  },
  {
    id: '4',
    essay_title: 'Leadership Experience',
    university_name: 'Harvard University',
    submission_date: '2024-12-10',
    status: 'pending',
    score: null
  }
];

interface StudentProfileDetailsProps {
  studentId: string;
  onBack: () => void;
}

interface EssayToReview {
  id: string;
  student_name: string;
  essay_title: string;
  essay_type: 'personal_statement' | 'supplement' | 'activity_list';
}

const DUMMY_STUDENT_DETAILS: Record<string, StudentProfile> = {
  '1': {
    id: '1',
    student_id: 's1',
    date_of_birth: '2006-03-15',
    nationality: 'United States',
    career_interests: 'Computer Science, Artificial Intelligence, Software Engineering',
    financial_budget: 75000,
    personal_statement: "From a young age, I've been fascinated by the power of technology to solve real-world problems. Growing up in a small town with limited resources, I witnessed firsthand how digital innovation could bridge gaps in education and healthcare. This inspired me to pursue computer science, with a particular focus on artificial intelligence and machine learning.\n\nDuring my high school years, I've dedicated myself to learning programming languages and frameworks, participating in hackathons, and developing applications that serve my community. One of my proudest achievements was creating a mobile app that helps local farmers optimize their crop yields using predictive analytics.\n\nI believe that technology should be accessible and beneficial to all, and I'm committed to using my skills to create solutions that make a positive impact on society. I'm particularly interested in exploring how AI can be used ethically and responsibly to address challenges in healthcare, education, and environmental sustainability.",
    extracurricular_activities: "• President of Computer Science Club (3 years) - Led workshops on web development and organized coding competitions\n• Varsity Soccer Team Captain (2 years) - Balanced athletic commitment with academic excellence\n• Volunteer Coding Instructor - Taught programming basics to middle school students every Saturday\n• Winner of State Hackathon 2023 - Developed an AI-powered tutoring platform\n• National Honor Society Member - Maintained 4.0 GPA while contributing to community service projects\n• Founded Tech for Good Initiative - Created a team that develops free apps for local non-profits",
    special_circumstances: null,
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
  '2': {
    id: '2',
    student_id: 's2',
    date_of_birth: '2006-07-22',
    nationality: 'India',
    career_interests: 'Biomedical Engineering, Healthcare Innovation, Medical Research',
    financial_budget: 45000,
    personal_statement: "The intersection of engineering and medicine has always captivated me. When my grandmother suffered from a debilitating illness that required constant monitoring, I realized how technology could transform patient care and improve quality of life. This experience ignited my passion for biomedical engineering and healthcare innovation.\n\nI've spent countless hours researching medical devices, studying anatomy and physiology, and learning about the latest advances in biotechnology. My goal is to develop accessible, affordable medical solutions that can benefit patients in underserved communities around the world.\n\nThrough internships at local hospitals and research projects, I've gained hands-on experience in understanding the practical challenges healthcare professionals face. I'm particularly interested in developing low-cost diagnostic tools and remote monitoring systems that can bring quality healthcare to rural areas. I believe that innovation in healthcare should not be a luxury but a fundamental right for all.",
    extracurricular_activities: "• Founder of Biomedical Innovation Club - Organized workshops and guest lectures from medical professionals\n• Hospital Volunteer (300+ hours) - Assisted in patient care and observed medical procedures\n• Science Olympiad Team - Gold medalist in Anatomy and Physiology division\n• Research Assistant at University Lab - Studied tissue engineering and regenerative medicine\n• TEDx Speaker - Presented on 'The Future of Affordable Healthcare Technology'\n• Cricket Team Vice-Captain - Demonstrated leadership and teamwork skills",
    special_circumstances: "As an international student from India, I come from a middle-class family where education is highly valued. My parents have made significant sacrifices to support my educational aspirations. I am actively seeking scholarships and financial aid to pursue my dream of studying biomedical engineering in the United States.",
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
  '3': {
    id: '3',
    student_id: 's3',
    date_of_birth: '2006-11-08',
    nationality: 'United Kingdom',
    career_interests: 'Environmental Science, Climate Policy, Sustainability',
    financial_budget: 60000,
    personal_statement: "Climate change is the defining challenge of our generation, and I am committed to being part of the solution. Growing up in a coastal town in the UK, I've witnessed the tangible effects of rising sea levels and extreme weather events. These experiences have shaped my determination to pursue environmental science and contribute to creating a sustainable future.\n\nMy academic journey has been driven by a deep curiosity about ecological systems and a desire to understand the complex relationships between human activity and environmental health. I've conducted independent research on local biodiversity, participated in beach cleanups, and engaged with community leaders to promote sustainable practices.\n\nI believe that addressing climate change requires both scientific innovation and policy change. I'm eager to study environmental science at a university where I can develop the technical skills and interdisciplinary knowledge needed to tackle this global crisis. My ultimate goal is to work on developing and implementing evidence-based climate policies that can make a real difference.",
    extracurricular_activities: "• Environmental Club President - Led campus-wide sustainability initiatives and reduced school waste by 40%\n• Youth Climate Council Member - Advised local government on environmental policies\n• Marine Conservation Volunteer - Participated in coral reef restoration projects\n• Science Fair Winner - Research project on microplastics in local water systems\n• Debate Team Captain - Competed nationally, specializing in environmental policy topics\n• Outdoor Adventure Club - Organized eco-friendly hiking and camping trips",
    special_circumstances: null,
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
  '4': {
    id: '4',
    student_id: 's4',
    date_of_birth: '2006-05-12',
    nationality: 'Canada',
    career_interests: 'Business Administration, Entrepreneurship, Finance',
    financial_budget: 55000,
    personal_statement: "Entrepreneurship isn't just about building businesses; it's about solving problems and creating value for communities. My journey into business began when I started a small lawn care service at age 14, which taught me invaluable lessons about customer service, financial management, and perseverance.\n\nWhat started as a summer job evolved into a passion for understanding how businesses operate and grow. I became fascinated by the strategic decisions that successful entrepreneurs make and the economic principles that drive markets. Through various business competitions and internships, I've developed skills in financial analysis, marketing strategy, and leadership.\n\nI'm particularly interested in social entrepreneurship and how businesses can be forces for positive change while remaining profitable. I believe that the next generation of business leaders must balance profit with purpose, and I'm committed to developing the skills and knowledge necessary to build sustainable, ethical enterprises that benefit both shareholders and society.",
    extracurricular_activities: "• DECA International Finalist - Placed top 10 in Entrepreneurship category\n• Founded 'Green Clean' Business - Student-run eco-friendly cleaning service employing 12 peers\n• Junior Achievement Company Program - Served as CEO of award-winning student company\n• Business Club Treasurer - Managed $15,000 budget and organized networking events\n• Volunteer Financial Literacy Instructor - Taught personal finance basics to underserved youth\n• Varsity Basketball Team - Demonstrated teamwork and leadership as point guard",
    special_circumstances: null,
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
  '5': {
    id: '5',
    student_id: 's5',
    date_of_birth: '2006-09-30',
    nationality: 'Brazil',
    career_interests: 'Architecture, Urban Planning, Sustainable Design',
    financial_budget: 38000,
    personal_statement: "Architecture has the power to shape not just buildings, but communities and lives. Growing up in São Paulo, one of the world's largest cities, I've experienced both the beauty of thoughtful urban design and the challenges of rapid, unplanned development. This duality has inspired my passion for architecture and sustainable urban planning.\n\nI believe that great architecture goes beyond aesthetics—it must be functional, sustainable, and accessible to all members of society. Through my studies and volunteer work in underserved neighborhoods, I've learned that good design can improve quality of life, foster community connections, and address environmental challenges.\n\nMy goal is to become an architect who creates spaces that honor cultural heritage while embracing innovation and sustainability. I'm particularly interested in designing affordable housing solutions and public spaces that bring communities together. I want to use architecture as a tool for social change, creating built environments that are beautiful, sustainable, and equitable.",
    extracurricular_activities: "• Architecture Summer Program at Local University - Top student recognition\n• Volunteer with Habitat for Humanity - Helped build homes for low-income families\n• Art Club Vice President - Organized exhibitions showcasing student work\n• Model UN Delegate - Represented Brazil in sustainable development committees\n• Community Design Workshop Leader - Taught basic architectural principles to children\n• Photography Club Member - Documented urban landscapes and architectural heritage",
    special_circumstances: "I come from a working-class family in Brazil where my parents work multiple jobs to support my education. The economic challenges in my country have limited my access to advanced resources, but they have also taught me resilience and creativity. I am seeking financial aid to pursue my architectural education and bring valuable perspectives from my background to contribute to campus diversity.",
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
  '6': {
    id: '6',
    student_id: 's6',
    date_of_birth: '2006-01-18',
    nationality: 'South Korea',
    career_interests: 'Mechanical Engineering, Robotics, Automation',
    financial_budget: 50000,
    personal_statement: "Robotics represents the future of how humans interact with technology and solve complex problems. My fascination with mechanical systems began in elementary school when I dismantled my first toy robot to understand how it worked. That curiosity has evolved into a serious pursuit of mechanical engineering and robotics.\n\nThroughout high school, I've dedicated myself to learning the principles of mechanics, electronics, and programming. I've participated in numerous robotics competitions, where I've not only honed my technical skills but also learned the importance of teamwork, iterative design, and creative problem-solving.\n\nI'm particularly interested in how robotics and automation can be used to improve manufacturing efficiency, assist in healthcare, and explore environments that are dangerous or inaccessible to humans. My dream is to contribute to developing robotic systems that can make meaningful improvements in people's lives, whether through assistive technologies for individuals with disabilities or robots that can perform critical tasks in extreme environments.",
    extracurricular_activities: "• Robotics Team Captain - Led team to national championships, won Innovation Award\n• FIRST Robotics Competition Participant (4 years) - Served as lead mechanical designer\n• Founded Maker Space Club - Created hands-on learning environment for engineering projects\n• Volunteer Mentor for Junior Robotics Teams - Coached elementary and middle school teams\n• Math Olympiad Competitor - Regional gold medalist\n• Taekwondo Black Belt - Demonstrated discipline and perseverance",
    special_circumstances: null,
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
  '7': {
    id: '7',
    student_id: 's7',
    date_of_birth: '2006-04-25',
    nationality: 'Nigeria',
    career_interests: 'International Relations, Political Science, Diplomacy',
    financial_budget: 42000,
    personal_statement: "In an increasingly interconnected world, the ability to build bridges between cultures and nations is more important than ever. Coming from Nigeria, a country rich in diversity and complex in its challenges, I've developed a deep appreciation for the power of diplomacy and international cooperation.\n\nMy interest in international relations stems from witnessing how global events directly impact local communities. I've been fascinated by the intricate web of economic, political, and social factors that shape our world. Through Model UN conferences, research projects, and engagement with current affairs, I've developed a nuanced understanding of international dynamics.\n\nI aspire to work in diplomacy or international development, where I can contribute to building more equitable relationships between nations and addressing global challenges such as poverty, conflict, and climate change. I believe that with empathy, cultural intelligence, and strong negotiation skills, we can create a more peaceful and prosperous world for all.",
    extracurricular_activities: "• Model United Nations Team Leader - Won Best Delegate awards at multiple conferences\n• Student Government President - Represented 2,000+ students and implemented policy changes\n• Youth Ambassador for African Leadership Initiative - Represented Nigeria at international youth summit\n• Debate Team Member - National finalist in foreign policy debates\n• Volunteer with Refugee Support Organization - Tutored and mentored displaced youth\n• Editor of School Newspaper - Covered international affairs and social justice issues",
    special_circumstances: "As a student from Nigeria, I have faced challenges including inconsistent electricity, limited internet access, and economic instability. Despite these obstacles, I have maintained academic excellence and pursued my passions. I am seeking financial assistance to achieve my educational goals and eventually give back to my community in Nigeria.",
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
  '8': {
    id: '8',
    student_id: 's8',
    date_of_birth: '2006-08-14',
    nationality: 'Australia',
    career_interests: 'Marine Biology, Environmental Conservation, Research',
    financial_budget: 58000,
    personal_statement: "The ocean has always been my greatest teacher. Growing up along Australia's coast, I spent countless hours exploring tide pools, snorkeling in coral reefs, and marveling at the incredible diversity of marine life. These experiences sparked a lifelong passion for marine biology and ocean conservation.\n\nWhat began as childhood curiosity has evolved into a serious commitment to understanding and protecting our oceans. Through research projects, volunteer work, and field studies, I've learned about the critical threats facing marine ecosystems—from climate change and pollution to overfishing and habitat destruction.\n\nI'm particularly interested in coral reef ecology and the development of innovative conservation strategies. My goal is to pursue research that can inform policy decisions and contribute to the preservation of marine biodiversity. I believe that through rigorous scientific study and effective communication of research findings, we can inspire action to protect our oceans for future generations.",
    extracurricular_activities: "• Marine Conservation Volunteer - 400+ hours with Great Barrier Reef Foundation\n• Science Research Project - Published findings on coral bleaching in local scientific journal\n• Environmental Youth Council Member - Advocated for marine protection policies\n• Certified Scuba Diver - Advanced Open Water certification, underwater research training\n• Science Olympiad Marine Biology Team Captain - State champions 2023\n• Swimming Team Member - Competed at state level while maintaining academic excellence",
    special_circumstances: null,
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
};

export default function StudentProfileDetails({
  studentId,
  onBack,
}: StudentProfileDetailsProps) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [showFullStatement, setShowFullStatement] = useState(false);
  const [selectedEssayForReview, setSelectedEssayForReview] = useState<EssayToReview | null>(null);

  useEffect(() => {
    const studentData = DUMMY_STUDENT_DETAILS[studentId];
    setStudent(studentData || null);
    setShowFullStatement(false);
  }, [studentId]);

  const handleEssayClick = (essay: SupplementaryEssay) => {
    const essayToReview: EssayToReview = {
      id: `${student?.student?.name}___${essay.essay_title}`,
      student_name: student?.student?.name || '',
      essay_title: essay.essay_title,
      essay_type: 'supplement'
    };
    setSelectedEssayForReview(essayToReview);
  };

  if (selectedEssayForReview && student) {
    return (
      <EssayReview
        comeFromStudentProfile={true}
        studentName={student.student?.name || ''}
        onBackToStudentProfile={() => setSelectedEssayForReview(null)}
      />
    );
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPersonalStatementPreview = (text: string) => {
    const previewLength = 300;
    if (text.length <= previewLength) return text;
    return text.substring(0, previewLength) + '...';
  };

  const parseExtracurriculars = (text: string) => {
    return text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^•\s*/, '').trim());
  };

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student profile not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Student Profiles</span>
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-3xl">
            {student.student?.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{student.student?.name}</h1>
            <p className="text-gray-600 mt-1">{student.student?.email}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {calculateAge(student.date_of_birth)} years
                  </p>
                  <p className="text-xs text-gray-400">
                    DOB: {formatDate(student.date_of_birth)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Nationality</p>
                  <p className="text-sm font-semibold text-gray-900">{student.nationality}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-sm font-semibold text-gray-900">
                    ${student.financial_budget.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Essays Score</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {student.student?.essay_activities_rating?.toFixed(1) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Personal Statement</h2>
          </div>
          {student.student?.essay_activities_rating && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                Essay Score: {student.student.essay_activities_rating.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {showFullStatement
              ? student.personal_statement
              : getPersonalStatementPreview(student.personal_statement)}
          </p>
          {student.personal_statement.length > 300 && (
            <button
              onClick={() => setShowFullStatement(!showFullStatement)}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showFullStatement ? 'View less' : 'View more'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Extracurricular Activities</h2>
          </div>
          {student.student?.essay_activities_rating && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                Essay Score: {student.student.essay_activities_rating.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {parseExtracurriculars(student.extracurricular_activities).map((activity, index) => (
            <div key={index} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </span>
              <p className="text-gray-700 leading-relaxed flex-1">{activity}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Supplementary Essays</h2>
          <span className="ml-auto text-sm text-gray-500">
            {DUMMY_SUPPLEMENTARY_ESSAYS.length} {DUMMY_SUPPLEMENTARY_ESSAYS.length === 1 ? 'essay' : 'essays'}
          </span>
        </div>
        <div className="space-y-3">
          {DUMMY_SUPPLEMENTARY_ESSAYS.map((essay) => (
              <button
                key={essay.id}
                onClick={() => handleEssayClick(essay)}
                className="w-full text-left border border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{essay.essay_title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{essay.university_name}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(essay.submission_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      essay.status === 'reviewed'
                        ? 'bg-green-100 text-green-700'
                        : essay.status === 'in_review'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {essay.status === 'reviewed' ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {essay.status === 'reviewed' ? 'Reviewed' : essay.status === 'in_review' ? 'In Review' : 'Pending'}
                    </span>
                    {essay.score && (
                      <span className="text-sm font-bold text-blue-600">
                        {essay.score}%
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Briefcase className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Career Interests</h2>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{student.career_interests}</p>
      </div>

      {student.special_circumstances && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-900">Special Circumstances</h2>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {student.special_circumstances}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
