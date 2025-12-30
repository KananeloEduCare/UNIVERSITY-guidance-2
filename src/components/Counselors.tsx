import React, { useState, useEffect } from 'react';
import { MessageCircle, Calendar, Star, MapPin, GraduationCap, Award, Clock, Mail, Loader, CheckCircle, XCircle, AlertCircle, MessageSquare, User, Globe, Video } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, get } from 'firebase/database';
import { userStorage } from '../services/userStorage';
import MeetingBookingPage from './MeetingBookingPage';

interface Counselor {
  id: string;
  name: string;
  email: string;
  university: string;
  year: string;
  location: string;
  profilePicture: string;
  bookingLink: string;
  languages: string[];
  specialties: string[];
  bio?: string;
  experience?: string;
  availability?: string;
}

interface MeetingRequest {
  id: string;
  counselorName: string;
  counselorUniversity: string;
  counselorImage: string;
  date: string;
  time: string;
  agenda: string;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  requestedDate: string;
  meetingDateTime: Date;
  meetingLink?: string;
}

interface CounselorsProps {
  onBookMeeting?: (email: string, name: string) => void;
}

const Counselors: React.FC<CounselorsProps> = ({ onBookMeeting }) => {
  const [activeTab, setActiveTab] = useState<'counselors' | 'meetings'>('counselors');
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingPage, setShowBookingPage] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);

  useEffect(() => {
    loadCounselorsFromFirebase();
    loadUpcomingMeetings();
  }, []);

  const loadCounselorsFromFirebase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the logged-in student's name
      const currentUser = userStorage.getStoredUser();
      if (!currentUser || !currentUser.name) {
        setError('Unable to identify logged-in student');
        setCounselors([]);
        setLoading(false);
        return;
      }

      const studentName = currentUser.name;

      // Step 1: Get caseloads to find which counselors have this student
      const caseloadsPath = `University Data/Caseloads`;
      const caseloadsRef = ref(database, caseloadsPath);
      const caseloadsSnapshot = await get(caseloadsRef);

      const counselorsWithStudent = new Set<string>();

      if (caseloadsSnapshot.exists()) {
        const caseloadsData = caseloadsSnapshot.val();

        // Loop through each counselor in the caseloads
        Object.entries(caseloadsData).forEach(([counselorName, students]) => {
          if (students && typeof students === 'object') {
            // Check if this student exists under this counselor
            if (students[studentName] === true) {
              counselorsWithStudent.add(counselorName);
            }
          }
        });
      }

      // Step 2: Load all counselors from University Counsellors
      const counselorsPath = `University Data/University Counsellors /`;
      const counselorsRef = ref(database, counselorsPath);
      const snapshot = await get(counselorsRef);

      if (snapshot.exists()) {
        const counselorsData = snapshot.val();
        const loadedCounselors: Counselor[] = [];

        Object.entries(counselorsData).forEach(([counselorId, counselorData]) => {
          if (counselorData && typeof counselorData === 'object') {
            const data = counselorData as any;
            const counselorName = data.Name || counselorId;

            // Only include counselors who have this student in their caseload
            if (counselorsWithStudent.has(counselorName)) {
              const languages: string[] = [];
              if (data.Languages && typeof data.Languages === 'object') {
                Object.entries(data.Languages).forEach(([lang, enabled]) => {
                  if (enabled === true) {
                    languages.push(lang);
                  }
                });
              }

              const specialties: string[] = [];
              if (data.Specialties && typeof data.Specialties === 'object') {
                Object.entries(data.Specialties).forEach(([specialty, enabled]) => {
                  if (enabled === true) {
                    specialties.push(specialty);
                  }
                });
              }

              const counselorObject = {
                id: counselorId,
                name: counselorName,
                email: data.Email || data.email || '',
                university: data.University || '',
                year: data.Year || '',
                location: data.Location || '',
                profilePicture: data['Profile Picture'] || 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150',
                bookingLink: data['Booking Link'] || data['booking link'] || '',
                languages,
                specialties,
                bio: `Expert counselor specializing in ${specialties.join(', ')}. Passionate about helping students achieve their academic dreams and navigate the university application process.`,
                experience: '3+ years guiding students',
                availability: 'Mon-Fri: 9AM-5PM'
              };

              loadedCounselors.push(counselorObject);
            }
          }
        });

        setCounselors(loadedCounselors);
      } else {
        setCounselors([]);
      }
    } catch (error) {
      console.error('Error loading counselors:', error);
      setError(`Failed to load counselors: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCounselors([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingMeetings = async () => {
    try {
      const currentUser = userStorage.getStoredUser();
      if (!currentUser || !currentUser.name) {
        setUpcomingMeetings([]);
        return;
      }

      const studentName = currentUser.name;
      const upcomingMeetingsPath = `Upcoming meetings`;
      const upcomingMeetingsRef = ref(database, upcomingMeetingsPath);
      const snapshot = await get(upcomingMeetingsRef);

      if (!snapshot.exists()) {
        setUpcomingMeetings([]);
        return;
      }

      const meetingsData = snapshot.val();
      const meetings: MeetingRequest[] = [];

      Object.entries(meetingsData).forEach(([counselorName, students]: [string, any]) => {
        if (students && typeof students === 'object' && students[studentName]) {
          const studentMeetings = students[studentName];

          Object.entries(studentMeetings).forEach(([timestamp, meetingData]: [string, any]) => {
            const [datePart, timePart] = timestamp.split('_');
            const [startTime] = timePart.split('-');

            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute] = startTime.split(':').map(Number);
            const meetingDate = new Date(year, month - 1, day, hour, minute);

            const formattedDate = meetingDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });

            const requestedAtDate = new Date(meetingData.requestedAt);
            const formattedRequestedDate = requestedAtDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });

            const counselorsRef = ref(database, `University Data/University Counsellors /${counselorName}`);
            get(counselorsRef).then((counselorSnapshot) => {
              let counselorUniversity = '';

              if (counselorSnapshot.exists()) {
                const counselorData = counselorSnapshot.val();
                counselorUniversity = counselorData.university || '';
              }

              meetings.push({
                id: `${counselorName}-${timestamp}`,
                counselorName,
                counselorUniversity,
                counselorImage: '',
                date: formattedDate,
                time: timePart.replace('-', ' - '),
                agenda: meetingData.agenda || '',
                status: 'accepted',
                requestedDate: formattedRequestedDate,
                meetingDateTime: meetingDate,
                meetingLink: meetingData.meetingLink || undefined
              });

              meetings.sort((a, b) => a.meetingDateTime.getTime() - b.meetingDateTime.getTime());
              setUpcomingMeetings([...meetings]);
            });
          });
        }
      });

      if (meetings.length === 0) {
        setUpcomingMeetings([]);
      }
    } catch (error) {
      console.error('Error loading upcoming meetings:', error);
      setUpcomingMeetings([]);
    }
  };

  const handleBookMeeting = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setShowBookingPage(true);
  };

  const handleSendEmail = (counselor: Counselor) => {
    if (counselor.email) {
      const subject = encodeURIComponent('University Guidance Consultation Request');
      const body = encodeURIComponent(`Dear ${counselor.name},\n\nI would like to schedule a consultation regarding university guidance.\n\nBest regards`);
      window.open(`mailto:${counselor.email}?subject=${subject}&body=${body}`, '_self');
    } else {
      alert('Email address not available for this counselor.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">Confirmed</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">Pending</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-[#04adee] mr-3" />
          <span className="text-lg text-gray-600">Loading counselors...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCounselorsFromFirebase}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showBookingPage && selectedCounselor) {
    return (
      <MeetingBookingPage
        counselorName={selectedCounselor.name}
        counselorUniversity={selectedCounselor.university}
        counselorImage={selectedCounselor.profilePicture}
        counselorEmail={selectedCounselor.email}
        onBack={() => {
          setShowBookingPage(false);
          setSelectedCounselor(null);
          loadUpcomingMeetings();
        }}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">University Counselors</h1>
        <p className="text-gray-600">Connect with expert counselors and manage your meetings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('counselors')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'counselors'
                ? 'text-[#04adee] border-b-2 border-[#04adee]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center">
              <User className="w-5 h-5 mr-2" />
              Counselors
            </div>
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'meetings'
                ? 'text-[#04adee] border-b-2 border-[#04adee]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Meetings
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'counselors' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {counselors.map(counselor => (
              <div key={counselor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="px-6 pt-6 pb-6">
                  <div className="flex items-start mb-4">
                    <img
                      src={counselor.profilePicture}
                      alt={counselor.name}
                      className="w-20 h-20 rounded-full object-cover shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150';
                      }}
                    />
                    <div className="ml-4 mt-1">
                      <h3 className="text-xl font-bold text-gray-900">{counselor.name}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4 mr-2 text-[#04adee] flex-shrink-0" />
                      <span className="truncate">{counselor.university}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="w-4 h-4 mr-2 text-[#04adee] flex-shrink-0" />
                      <span>{counselor.year} Student</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-[#04adee] flex-shrink-0" />
                      <span className="truncate">{counselor.location}</span>
                    </div>
                  </div>

                  {counselor.specialties.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {counselor.specialties.map(specialty => (
                          <span key={specialty} className="bg-[#04adee] bg-opacity-10 text-[#04adee] text-xs px-3 py-1 rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {counselor.languages.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {counselor.languages.map(language => (
                          <span key={language} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleBookMeeting(counselor)}
                      className="flex-1 flex items-center justify-center bg-[#04adee] text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Meeting
                    </button>
                    <button
                      onClick={() => handleSendEmail(counselor)}
                      className="flex-1 flex items-center justify-center bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {counselors.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No counselors available</h3>
              <p className="text-gray-600">Counselors data is not available at the moment.</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-4">
            {upcomingMeetings.filter(meeting => meeting.meetingDateTime > new Date()).map(meeting => (
              <div
                key={meeting.id}
                className="bg-white rounded-xl shadow-sm border-2 border-green-200 transition-all hover:shadow-md"
              >
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{meeting.counselorName}</h3>
                    <p className="text-sm text-gray-600">{meeting.counselorUniversity}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="w-4 h-4 mr-2 text-[#04adee]" />
                      <div>
                        <span className="font-medium">Meeting Date:</span>
                        <p className="text-gray-600">{meeting.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock className="w-4 h-4 mr-2 text-[#04adee]" />
                      <div>
                        <span className="font-medium">Time Slot:</span>
                        <p className="text-gray-600">{meeting.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <User className="w-4 h-4 mr-2 text-[#04adee]" />
                      <div>
                        <span className="font-medium">Requested On:</span>
                        <p className="text-gray-600">{meeting.requestedDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Meeting Agenda</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{meeting.agenda}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-green-900 mb-1">Meeting Confirmed!</h4>
                          <p className="text-sm text-green-800">
                            Your meeting has been confirmed. Click the button below to join the video call at the scheduled time.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {meeting.meetingLink && (
                    <button
                      onClick={() => window.open(meeting.meetingLink, '_blank')}
                      className="w-full bg-gradient-to-r from-[#04adee] to-[#0396d5] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#0396d5] hover:to-[#027fb8] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4"
                    >
                      <Video className="w-5 h-5" />
                      Join Video Meeting
                    </button>
                  )}

                  {!meeting.meetingLink && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mt-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-900 mb-1">Meeting Link Not Available</h4>
                          <p className="text-sm text-yellow-800">
                            The video meeting link will be available shortly. Please check back closer to the meeting time.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {upcomingMeetings.filter(meeting => meeting.meetingDateTime > new Date()).length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
              <p className="text-gray-600">
                You have no confirmed meetings scheduled at this time.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Counselors;
