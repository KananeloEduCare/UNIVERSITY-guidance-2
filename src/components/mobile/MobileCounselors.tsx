import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Calendar, MessageCircle, Mail, GraduationCap, Award, Loader } from 'lucide-react';
import { database } from '../../config/firebase';
import { ref, get } from 'firebase/database';
import { userStorage } from '../../services/userStorage';
import MeetingBookingPage from '../MeetingBookingPage';

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
}

const MobileCounselors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingPage, setShowBookingPage] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);

  // Load counselors from Firebase on component mount
  useEffect(() => {
    loadCounselorsFromFirebase();
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
              // Extract languages
              const languages: string[] = [];
              if (data.Languages && typeof data.Languages === 'object') {
                Object.entries(data.Languages).forEach(([lang, enabled]) => {
                  if (enabled === true) {
                    languages.push(lang);
                  }
                });
              }

              // Extract specialties
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
                specialties
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
      console.error('Error loading counselors from Firebase:', error);
      setError(`Failed to load counselors: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCounselors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCounselors = counselors.filter(counselor => {
    return counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           counselor.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
           counselor.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
           counselor.location.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-[#04adee] mr-3" />
        <span className="text-lg text-gray-600">Loading counselors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCounselorsFromFirebase}
            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
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
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search counselors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
          />
        </div>
      </div>

      {/* Counselors */}
      <div className="space-y-4">
        {filteredCounselors.map(counselor => (
          <div key={counselor.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start mb-4">
              <img 
                src={counselor.profilePicture} 
                alt={counselor.name}
                className="w-16 h-16 rounded-2xl object-cover mr-4"
                onError={(e) => {
                  // Fallback to default image if profile picture fails to load
                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150';
                }}
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{counselor.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{counselor.year} Student</p>
                <p className="text-sm text-[#04adee] mb-2">{counselor.university}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {counselor.location}
                </div>
              </div>
            </div>

            {counselor.specialties.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Specialties:</div>
                <div className="flex flex-wrap gap-1">
                  {counselor.specialties.map(specialty => (
                    <span key={specialty} className="bg-[#04adee] bg-opacity-10 text-[#04adee] text-xs px-2 py-1 rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {counselor.languages.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Languages:</div>
                <div className="flex flex-wrap gap-1">
                  {counselor.languages.map(language => (
                    <span key={language} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button 
                onClick={() => handleBookMeeting(counselor)}
                className="flex-1 flex items-center justify-center bg-[#04adee] text-white px-4 py-2 rounded-xl font-medium"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Meeting
              </button>
              <button 
                onClick={() => handleSendEmail(counselor)}
                className="flex-1 flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded-xl font-medium"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCounselors.length === 0 && !loading && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No counselors found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      )}

      {counselors.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No counselors available</h3>
          <p className="text-gray-600">Counselors data is not available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default MobileCounselors;