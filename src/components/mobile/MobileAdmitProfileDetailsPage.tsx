import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, GraduationCap, TrendingUp, Award, Users, FileText, DollarSign, Star, Linkedin, Instagram, Target, Archive } from 'lucide-react';
import { getFirebaseAdmitProfileById, FirebaseAdmitProfile } from '../../services/firebaseAdmitProfilesService';
import AnimatedCounter from '../AnimatedCounter';
import { getCountryFlag } from '../../utils/countryFlags';

interface MobileAdmitProfileDetailsPageProps {
  profileId: string;
  onBack: () => void;
}

export default function MobileAdmitProfileDetailsPage({ profileId, onBack }: MobileAdmitProfileDetailsPageProps) {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error || 'Profile not found'}</p>
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
          <span className="font-medium text-sm">Back to Profiles</span>
        </button>
      </div>

      <div className="bg-white mx-3 mt-3 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-green-500 to-blue-600">
          {profile.university_image_url && (
            <img
              src={profile.university_image_url}
              alt={`${profile.current_university} campus`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
          <div className="absolute -bottom-12 left-4 z-10">
            <img
              src={profile.profile_image_url}
              alt={profile.name}
              className="w-24 h-24 rounded-xl border-4 border-white object-cover shadow-xl"
            />
          </div>
        </div>

        <div className="pt-16 px-4 pb-5">
          <div className="mb-5">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h1>
            <p className="text-sm text-gray-600 mb-2">{profile.current_major}</p>
            <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
              <div className="flex items-center gap-1.5">
                <img
                  src={getCountryFlag(profile.country)}
                  alt={`${profile.country} flag`}
                  className="w-4 h-3 object-cover rounded-sm"
                />
                <span>{profile.country}</span>
              </div>
            </div>
          </div>

          {(profile.linkedin_handle || profile.instagram_handle) && (
            <div className="flex gap-2 mb-5">
              {profile.linkedin_handle && (
                <a
                  href={profile.linkedin_handle}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm active:bg-blue-100"
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
                  className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg text-sm active:bg-pink-100"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-3 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">Accepted To:</h2>
            </div>
            <p className="text-lg font-bold text-blue-600 mb-0.5">{profile.current_university}</p>
            <p className="text-xs text-gray-600">{profile.university_location}</p>
            {profile.graduation_year && (
              <p className="text-xs text-gray-600 mt-1.5 font-medium">Class of {profile.graduation_year}</p>
            )}
          </div>

          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900">Application submitted to {profile.current_university}</h3>
          </div>
        </div>
      </div>

      <div className="px-3 space-y-3 mt-3">

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 shadow-sm">
            <div className="flex items-center mb-1">
              <Target className="w-3 h-3 text-blue-600 mr-1" />
              <h3 className="font-semibold text-gray-900 text-xs">Overall Avg</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {profile.overall_percentage ? (
                <>
                  <AnimatedCounter end={profile.overall_percentage} decimals={1} />
                  <span>%</span>
                </>
              ) : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Aggregate %</p>
          </div>

          {profile.sat_score && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 shadow-sm">
              <div className="flex items-center mb-1">
                <Award className="w-3 h-3 text-purple-600 mr-1" />
                <h3 className="font-semibold text-gray-900 text-xs">SAT</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                <AnimatedCounter end={profile.sat_score} />
              </p>
            </div>
          )}

          {profile.act_score && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200 shadow-sm">
              <div className="flex items-center mb-1">
                <Award className="w-3 h-3 text-orange-600 mr-1" />
                <h3 className="font-semibold text-gray-900 text-xs">ACT</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                <AnimatedCounter end={profile.act_score} />
              </p>
            </div>
          )}

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200 shadow-sm">
            <div className="flex items-center mb-1">
              <GraduationCap className="w-3 h-3 text-green-600 mr-1" />
              <h3 className="font-semibold text-gray-900 text-xs">Round</h3>
            </div>
            <p className="text-lg font-bold text-green-600">{profile.application_round}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
            <div className="flex items-center mb-1.5">
              <Star className="w-3 h-3 text-yellow-600 mr-1.5" />
              <h3 className="font-semibold text-gray-900 text-xs">First Gen</h3>
            </div>
            <p className="text-gray-700 text-xs">
              {profile.first_generation ? 'Yes' : 'No'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center mb-1.5">
              <DollarSign className="w-3 h-3 text-green-600 mr-1.5" />
              <h3 className="font-semibold text-gray-900 text-xs">Aid</h3>
            </div>
            <p className="text-gray-700 text-xs leading-tight">{profile.financial_aid_received}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-2">
            <FileText className="w-4 h-4 text-blue-600 mr-2" />
            <h2 className="text-base font-bold text-gray-900">Personal Statement</h2>
          </div>
          <div className="relative">
            <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-line line-clamp-4">
              {profile.personal_statement}
            </p>
            <button
              onClick={() => setShowFullStatement(true)}
              className="mt-2 text-blue-600 active:text-blue-700 font-medium text-xs underline"
            >
              Read Full Statement
            </button>
          </div>
        </div>

        {showFullStatement && (
          <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={() => setShowFullStatement(false)}>
            <div className="bg-white rounded-t-3xl shadow-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Personal Statement</h2>
                </div>
                <button
                  onClick={() => setShowFullStatement(false)}
                  className="text-gray-500 active:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg active:bg-gray-100"
                >
                  ×
                </button>
              </div>
              <div className="px-4 py-4 overflow-y-auto max-h-[calc(90vh-60px)]">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {profile.personal_statement}
                </p>
              </div>
            </div>
          </div>
        )}

        {profile.subject_grades && Object.keys(profile.subject_grades).length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-3">
              <GraduationCap className="w-4 h-4 text-purple-600 mr-2" />
              <h2 className="text-base font-bold text-gray-900">Latest Transcript Submitted</h2>
            </div>
            <div className="space-y-2">
              {Object.entries(profile.subject_grades).map(([subject, grade], index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-xs">{subject}</h3>
                    </div>
                    <span className="text-xl font-bold text-purple-600 ml-2">{grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.high_school_gpa_history && Object.keys(profile.high_school_gpa_history).length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
              <h2 className="text-base font-bold text-gray-900">High School Performance History</h2>
            </div>
            <p className="text-xs text-gray-600 mb-3 italic">Overall grade percentages by year</p>
            <div className="space-y-2">
              {Object.entries(profile.high_school_gpa_history).map(([year, gpa], index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 text-xs">{year}</h3>
                    <span className="text-lg font-bold text-blue-600">{gpa}</span>
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
            {profile.extracurricular_activities.map((activity, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                <span className="text-gray-700 text-xs">{activity}</span>
              </li>
            ))}
          </ul>
        </div>

        {profile.university_experience && (
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center mb-2">
              <Star className="w-4 h-4 text-blue-600 mr-2" />
              <h2 className="text-base font-bold text-gray-900">Their Journey</h2>
            </div>
            <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-line italic">
              {profile.university_experience}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
