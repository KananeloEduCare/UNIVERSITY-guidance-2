import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, GraduationCap, TrendingUp, Award, Users, FileText, DollarSign, Star, Linkedin, Instagram, Target } from 'lucide-react';
import { getAdmissionStoryById, AdmissionStory } from '../../services/admissionStoriesService';
import AnimatedCounter from '../AnimatedCounter';

interface MobileAdmissionStoryDetailsPageProps {
  storyId: string;
  onBack: () => void;
}

export default function MobileAdmissionStoryDetailsPage({ storyId, onBack }: MobileAdmissionStoryDetailsPageProps) {
  const [story, setStory] = useState<AdmissionStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStory();
  }, [storyId]);

  const loadStory = async () => {
    try {
      setLoading(true);
      const data = await getAdmissionStoryById(storyId);
      setStory(data);
      setError(null);
    } catch (err) {
      setError('Failed to load admission story');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error || 'Story not found'}</p>
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 active:text-gray-900 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-active:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back</span>
        </button>
      </div>

      <div className="bg-white mx-3 mt-3 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="absolute -bottom-12 left-4">
            <img
              src={story.profile_image_url}
              alt={story.name}
              className="w-24 h-24 rounded-xl border-4 border-white object-cover shadow-xl"
            />
          </div>
        </div>

        <div className="pt-16 px-4 pb-5">
          <div className="mb-5">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{story.name}</h1>
            <p className="text-sm text-gray-600 mb-2">{story.current_major}</p>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{story.country}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                <span>{story.age} years old</span>
              </div>
            </div>
          </div>

          {(story.linkedin_handle || story.instagram_handle) && (
            <div className="flex gap-2 mb-5">
              {story.linkedin_handle && (
                <a
                  href={story.linkedin_handle}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm active:bg-blue-100"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {story.instagram_handle && (
                <a
                  href={`https://instagram.com/${story.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg text-sm active:bg-pink-100"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-3 space-y-3 mt-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 shadow-sm">
            <div className="flex items-center mb-1">
              <Target className="w-3 h-3 text-blue-600 mr-1" />
              <h3 className="font-semibold text-gray-900 text-xs">GPA</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {story.overall_gpa ? <AnimatedCounter end={story.overall_gpa} decimals={2} /> : 'N/A'}
            </p>
          </div>

          {story.sat_score && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 shadow-sm">
              <div className="flex items-center mb-1">
                <Award className="w-3 h-3 text-purple-600 mr-1" />
                <h3 className="font-semibold text-gray-900 text-xs">SAT</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                <AnimatedCounter end={story.sat_score} />
              </p>
            </div>
          )}

          {story.act_score && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200 shadow-sm">
              <div className="flex items-center mb-1">
                <Award className="w-3 h-3 text-orange-600 mr-1" />
                <h3 className="font-semibold text-gray-900 text-xs">ACT</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                <AnimatedCounter end={story.act_score} />
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center mb-1.5">
              <GraduationCap className="w-3 h-3 text-blue-600 mr-1.5" />
              <h3 className="font-semibold text-gray-900 text-xs">University</h3>
            </div>
            <p className="text-gray-700 font-medium text-xs leading-tight">{story.current_university}</p>
            <p className="text-xs text-gray-600 mt-1">{story.university_location}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <div className="flex items-center mb-1.5">
              <Award className="w-3 h-3 text-green-600 mr-1.5" />
              <h3 className="font-semibold text-gray-900 text-xs">Round</h3>
            </div>
            <p className="text-gray-700 font-medium text-xs">{story.application_round}</p>
            <p className="text-xs text-gray-600 mt-1">GPA: {story.grades_applied_with}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
            <div className="flex items-center mb-1.5">
              <Star className="w-3 h-3 text-yellow-600 mr-1.5" />
              <h3 className="font-semibold text-gray-900 text-xs">First Gen</h3>
            </div>
            <p className="text-gray-700 text-xs">
              {story.first_generation ? 'Yes' : 'No'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center mb-1.5">
              <DollarSign className="w-3 h-3 text-green-600 mr-1.5" />
              <h3 className="font-semibold text-gray-900 text-xs">Aid</h3>
            </div>
            <p className="text-gray-700 text-xs leading-tight">{story.financial_aid_received}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-2">
            <FileText className="w-4 h-4 text-blue-600 mr-2" />
            <h2 className="text-base font-bold text-gray-900">Personal Statement</h2>
          </div>
          <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-line">
            {story.personal_statement}
          </p>
        </div>

        {story.subject_grades && story.subject_grades.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-3">
              <GraduationCap className="w-4 h-4 text-purple-600 mr-2" />
              <h2 className="text-base font-bold text-gray-900">Subject Grades</h2>
            </div>
            <div className="space-y-2">
              {story.subject_grades.map((grade, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-xs">{grade.curriculum} {grade.subject_name}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">{grade.curriculum}</p>
                    </div>
                    <span className="text-xl font-bold text-purple-600 ml-2">{grade.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!story.subject_grades || story.subject_grades.length === 0) && story.subjects_taken && story.subjects_taken.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-2">
              <GraduationCap className="w-4 h-4 text-purple-600 mr-2" />
              <h2 className="text-base font-bold text-gray-900">Subjects</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {story.subjects_taken.map((subject, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}

        {story.gpa_history && story.gpa_history.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
              <h2 className="text-base font-bold text-gray-900">GPA History</h2>
            </div>
            <div className="space-y-2">
              {story.gpa_history.map((gpa, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-xs">{gpa.year}</h3>
                      {gpa.rank && (
                        <p className="text-xs text-gray-600 mt-0.5">{gpa.rank}</p>
                      )}
                      {gpa.transcript_notes && (
                        <p className="text-xs text-gray-600 mt-0.5">{gpa.transcript_notes}</p>
                      )}
                    </div>
                    <span className="text-lg font-bold text-blue-600 ml-2">{gpa.gpa}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-2">
            <Users className="w-4 h-4 text-orange-600 mr-2" />
            <h2 className="text-base font-bold text-gray-900">Extracurriculars</h2>
          </div>
          <ul className="space-y-1.5">
            {story.extracurricular_activities.map((activity, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1 h-1 bg-orange-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                <span className="text-gray-700 text-xs">{activity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-yellow-600 mr-2" />
            <h2 className="text-base font-bold text-gray-900">University Experience</h2>
          </div>
          <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-line">
            {story.university_experience}
          </p>
        </div>
      </div>
    </div>
  );
}
