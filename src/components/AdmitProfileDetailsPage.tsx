import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, GraduationCap, TrendingUp, Award, Users, FileText, DollarSign, Star, Linkedin, Instagram, Target, Archive } from 'lucide-react';
import { getFirebaseAdmitProfileById, FirebaseAdmitProfile } from '../services/firebaseAdmitProfilesService';
import AnimatedCounter from './AnimatedCounter';
import { getCountryFlag } from '../utils/countryFlags';

interface AdmitProfileDetailsPageProps {
  profileId: string;
  onBack: () => void;
}

export default function AdmitProfileDetailsPage({ profileId, onBack }: AdmitProfileDetailsPageProps) {
  const [profile, setProfile] = useState<FirebaseAdmitProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullStatement, setShowFullStatement] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getFirebaseAdmitProfileById(profileId);
      setProfile(data);
      setError(null);
    } catch (err) {
      setError('Failed to load admit profile');
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

  if (error || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Profile not found'}</p>
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
          <span className="font-medium">Back to Admit Profiles</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-green-500 to-blue-600">
            {profile.university_image_url && (
              <img
                src={profile.university_image_url}
                alt={`${profile.current_university} campus`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
            <div className="absolute -bottom-16 left-8 z-10">
              <img
                src={profile.profile_image_url}
                alt={profile.name}
                className="w-32 h-32 rounded-2xl border-4 border-white object-cover shadow-xl"
              />
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              </div>
              <p className="text-lg text-gray-600 mb-3">{profile.current_major}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <img
                    src={getCountryFlag(profile.country)}
                    alt={`${profile.country} flag`}
                    className="w-5 h-4 object-cover rounded-sm"
                  />
                  <span>{profile.country}</span>
                </div>
              </div>
            </div>

            {(profile.linkedin_handle || profile.instagram_handle) && (
              <div className="flex gap-3 mb-8">
                {profile.linkedin_handle && (
                  <a
                    href={profile.linkedin_handle}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {profile.instagram_handle && (
                  <a
                    href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
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

            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-4 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Accepted To:</h2>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-1">{profile.current_university}</p>
              <p className="text-gray-600">{profile.university_location}</p>
              {profile.graduation_year && (
                <p className="text-sm text-gray-600 mt-2 font-medium">Class of {profile.graduation_year}</p>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Application submitted to {profile.current_university}</h3>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <Target className="w-4 h-4 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-900 text-xs">Overall Average</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {profile.overall_percentage ? (
                    <>
                      <AnimatedCounter end={profile.overall_percentage} decimals={1} />
                      <span>%</span>
                    </>
                  ) : 'N/A'}
                </p>
                <p className="text-xs text-gray-600 mt-1">Aggregate Percentage</p>
              </div>

              {profile.sat_score && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Award className="w-4 h-4 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-gray-900 text-xs">SAT Score</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    <AnimatedCounter end={profile.sat_score} />
                  </p>
                </div>
              )}

              {profile.act_score && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Award className="w-4 h-4 text-orange-600 mr-2" />
                    <h3 className="font-semibold text-gray-900 text-xs">ACT Score</h3>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">
                    <AnimatedCounter end={profile.act_score} />
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <GraduationCap className="w-4 h-4 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900 text-xs">Application Round</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">{profile.application_round}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-gray-900 text-sm">First Generation Student</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {profile.first_generation ? 'Yes' : 'No'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900 text-sm">Financial Aid Received</h3>
                </div>
                <p className="text-gray-700 text-sm">{profile.financial_aid_received}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-3">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Personal Statement</h2>
                </div>
                <div className="relative">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm line-clamp-4">
                    {profile.personal_statement}
                  </p>
                  <button
                    onClick={() => setShowFullStatement(true)}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                  >
                    Read Full Statement
                  </button>
                </div>
              </div>

              {showFullStatement && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowFullStatement(false)}>
                  <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Personal Statement</h2>
                      </div>
                      <button
                        onClick={() => setShowFullStatement(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                      >
                        ×
                      </button>
                    </div>
                    <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {profile.personal_statement}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {profile.subject_grades && Object.keys(profile.subject_grades).length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <GraduationCap className="w-5 h-5 text-purple-600 mr-2" />
                    <h2 className="text-xl font-bold text-gray-900">Latest Transcript Submitted</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries(profile.subject_grades).map(([subject, grade], index) => (
                      <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{subject}</h3>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">{grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.high_school_gpa_history && Object.keys(profile.high_school_gpa_history).length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                    <h2 className="text-xl font-bold text-gray-900">High School Performance History</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 italic">Overall grade percentages by year</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    {Object.entries(profile.high_school_gpa_history).map(([year, gpa], index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{year}</h3>
                          <span className="text-xl font-bold text-blue-600">{gpa}</span>
                        </div>
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
                  {profile.extracurricular_activities.map((activity, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 text-sm">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {profile.university_experience && (
                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                  <div className="flex items-center mb-3">
                    <Star className="w-5 h-5 text-blue-600 mr-2" />
                    <h2 className="text-xl font-bold text-gray-900">Their Journey: University Experience</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm italic">
                    {profile.university_experience}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
