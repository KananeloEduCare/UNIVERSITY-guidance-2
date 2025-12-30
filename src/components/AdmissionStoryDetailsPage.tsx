import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, GraduationCap, TrendingUp, Award, Users, FileText, DollarSign, Star, Linkedin, Instagram, Target } from 'lucide-react';
import { getAdmissionStoryById, AdmissionStory } from '../services/admissionStoriesService';
import AnimatedCounter from './AnimatedCounter';

interface AdmissionStoryDetailsPageProps {
  storyId: string;
  onBack: () => void;
}

export default function AdmissionStoryDetailsPage({ storyId, onBack }: AdmissionStoryDetailsPageProps) {
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Story not found'}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Stories</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-16 left-8">
              <img
                src={story.profile_image_url}
                alt={story.name}
                className="w-32 h-32 rounded-2xl border-4 border-white object-cover shadow-xl"
              />
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{story.name}</h1>
            <p className="text-lg text-gray-600 mb-3">{story.current_major}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1.5" />
                <span>{story.country}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1.5" />
                <span>{story.age} years old</span>
              </div>
            </div>
          </div>

          {(story.linkedin_handle || story.instagram_handle) && (
            <div className="flex gap-3 mb-8">
              {story.linkedin_handle && (
                <a
                  href={story.linkedin_handle}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
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
                  className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-all text-sm font-medium"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm">
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900 text-xs">Overall GPA</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {story.overall_gpa ? <AnimatedCounter end={story.overall_gpa} decimals={2} /> : 'N/A'}
              </p>
            </div>

            {story.sat_score && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <Award className="w-4 h-4 text-purple-600 mr-2" />
                  <h3 className="font-semibold text-gray-900 text-xs">SAT Score</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  <AnimatedCounter end={story.sat_score} />
                </p>
              </div>
            )}

            {story.act_score && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <Award className="w-4 h-4 text-orange-600 mr-2" />
                  <h3 className="font-semibold text-gray-900 text-xs">ACT Score</h3>
                </div>
                <p className="text-3xl font-bold text-orange-600">
                  <AnimatedCounter end={story.act_score} />
                </p>
              </div>
            )}

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 shadow-sm">
              <div className="flex items-center mb-2">
                <GraduationCap className="w-4 h-4 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-900 text-xs">Round</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">{story.application_round}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center mb-2">
                <GraduationCap className="w-4 h-4 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900 text-sm">Current University</h3>
              </div>
              <p className="text-gray-700 font-medium">{story.current_university}</p>
              <p className="text-sm text-gray-600 mt-1">{story.university_location}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <div className="flex items-center mb-2">
                <Award className="w-4 h-4 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-900 text-sm">Applied With</h3>
              </div>
              <p className="text-gray-700 font-medium">{story.grades_applied_with}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-gray-900 text-sm">First Generation</h3>
              </div>
              <p className="text-gray-700 text-sm">
                {story.first_generation ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center mb-2">
                <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-900 text-sm">Financial Aid</h3>
              </div>
              <p className="text-gray-700 text-sm">{story.financial_aid_received}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Personal Statement</h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                {story.personal_statement}
              </p>
            </div>

            {story.subject_grades && story.subject_grades.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <GraduationCap className="w-5 h-5 text-purple-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Subject Grades</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {story.subject_grades.map((grade, index) => (
                    <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{grade.curriculum} {grade.subject_name}</h3>
                          <p className="text-xs text-gray-600 mt-1">{grade.curriculum}</p>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{grade.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!story.subject_grades || story.subject_grades.length === 0) && story.subjects_taken && story.subjects_taken.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-3">
                  <GraduationCap className="w-5 h-5 text-purple-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Subjects Taken</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {story.subjects_taken.map((subject, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {story.gpa_history && story.gpa_history.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">GPA History</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {story.gpa_history.map((gpa, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{gpa.year}</h3>
                        <span className="text-xl font-bold text-blue-600">{gpa.gpa}</span>
                      </div>
                      {gpa.rank && (
                        <p className="text-xs text-gray-600">{gpa.rank}</p>
                      )}
                      {gpa.transcript_notes && (
                        <p className="text-xs text-gray-600 mt-1">{gpa.transcript_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <Users className="w-5 h-5 text-orange-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Extracurricular Activities</h2>
              </div>
              <ul className="space-y-2">
                {story.extracurricular_activities.map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <Star className="w-5 h-5 text-yellow-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">University Experience</h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                {story.university_experience}
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
