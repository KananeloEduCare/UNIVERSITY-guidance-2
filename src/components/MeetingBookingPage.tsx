import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, get, set } from 'firebase/database';
import { userStorage } from '../services/userStorage';

interface TimeSlot {
  id: string;
  date: string;
  timeRange: string;
  isAvailable: boolean;
  rawKey: string;
}

interface MeetingBookingPageProps {
  counselorEmail: string;
  counselorName: string;
  counselorUniversity: string;
  counselorImage: string;
  onBack: () => void;
}

const MeetingBookingPage: React.FC<MeetingBookingPageProps> = ({
  counselorEmail,
  counselorName,
  counselorUniversity,
  counselorImage,
  onBack,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [agenda, setAgenda] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadTimeSlots();
  }, [counselorName]);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      const timeslotsPath = `University Data/Timeslots/${counselorName}`;
      const timeslotsRef = ref(database, timeslotsPath);
      const snapshot = await get(timeslotsRef);

      if (snapshot.exists()) {
        const timeslotsData = snapshot.val();
        const slots: TimeSlot[] = [];

        Object.entries(timeslotsData).forEach(([slotKey, isBooked]) => {
          const [datePart, timePart] = slotKey.split('_');

          slots.push({
            id: slotKey,
            date: datePart,
            timeRange: timePart,
            isAvailable: isBooked === false,
            rawKey: slotKey
          });
        });

        slots.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.timeRange.localeCompare(b.timeRange);
        });

        setTimeSlots(slots);
      } else {
        setTimeSlots([]);
        setError('No timeslots available for this counselor');
      }
    } catch (error) {
      console.error('Error loading timeslots:', error);
      setError(`Failed to load timeslots: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !agenda.trim()) {
      setError('Please select a time slot and provide an agenda');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const currentUser = userStorage.getStoredUser();
      if (!currentUser || !currentUser.name) {
        setError('Unable to identify logged-in student');
        setSubmitting(false);
        return;
      }

      const studentName = currentUser.name;
      const requestedAt = new Date().toISOString();

      const timeslotPath = `University Data/Timeslots/${counselorName}/${selectedSlot.rawKey}`;
      const timeslotRef = ref(database, timeslotPath);
      await set(timeslotRef, true);

      const upcomingMeetingPath = `Upcoming meetings/${counselorName}/${studentName}/${selectedSlot.rawKey}`;
      const upcomingMeetingRef = ref(database, upcomingMeetingPath);
      await set(upcomingMeetingRef, {
        agenda: agenda.trim(),
        requestedAt: requestedAt
      });

      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2500);
    } catch (err) {
      console.error('Error creating meeting request:', err);
      setError('Failed to submit meeting request');
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const groupSlotsByDate = () => {
    const grouped: { [date: string]: TimeSlot[] } = {};
    timeSlots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#04adee] to-blue-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center text-white hover:bg-white hover:bg-opacity-20 rounded-lg px-4 py-2 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Counselors
          </button>

          <div className="flex items-center">
            <img
              src={counselorImage}
              alt={counselorName}
              className="w-20 h-20 rounded-full object-cover mr-5 border-4 border-white shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150';
              }}
            />
            <div>
              <h1 className="text-3xl font-bold mb-1">Book a Meeting</h1>
              <p className="text-xl text-blue-100">{counselorName}</p>
              <p className="text-blue-100">{counselorUniversity}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {success ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Meeting Request Sent!</h2>
            <p className="text-gray-600 text-base mb-2">Your counselor will review your request and respond soon.</p>
            <div className="mt-6 bg-blue-50 rounded-lg p-4 inline-block">
              <p className="text-[#04adee] font-medium text-sm">Check your meetings page for updates</p>
            </div>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 animate-spin text-[#04adee] mb-3" />
              <span className="text-lg text-gray-600 font-medium">Loading available time slots...</span>
              <span className="text-sm text-gray-500 mt-1">Please wait a moment</span>
            </div>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Available Slots</h2>
            <p className="text-gray-600 mb-1 text-sm">This counselor has no available time slots at the moment.</p>
            <p className="text-gray-500 text-sm">Please check back later or contact them via email.</p>
            <button
              onClick={onBack}
              className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <div className="flex items-center mb-6">
                <div className="bg-[#04adee] bg-opacity-10 rounded-full p-2 mr-3">
                  <Calendar className="w-5 h-5 text-[#04adee]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Choose Your Time</h2>
              </div>
              <div className="space-y-6">
                {Object.entries(groupSlotsByDate()).map(([date, slots]) => (
                  <div key={date} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-1 h-6 bg-[#04adee] rounded mr-3"></div>
                      {formatDate(date)}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {slots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                          disabled={!slot.isAvailable}
                          className={`px-3 py-3 rounded-lg border-2 transition-all ${
                            !slot.isAvailable
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : selectedSlot?.id === slot.id
                                ? 'border-[#04adee] bg-[#04adee] text-white shadow-lg scale-105'
                                : 'border-gray-300 bg-white hover:border-[#04adee] hover:shadow-md transform hover:scale-105'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <Clock className={`w-4 h-4 mb-1.5 ${
                              !slot.isAvailable ? 'text-gray-400' : selectedSlot?.id === slot.id ? 'text-white' : 'text-[#04adee]'
                            }`} />
                            <span className="text-sm font-bold">
                              {slot.timeRange}
                            </span>
                            {!slot.isAvailable && (
                              <span className="text-xs mt-1 text-gray-500">Booked</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="bg-[#04adee] bg-opacity-10 rounded-full p-2 mr-3">
                  <AlertCircle className="w-5 h-5 text-[#04adee]" />
                </div>
                <label className="text-base font-bold text-gray-900">
                  Meeting Agenda
                </label>
              </div>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="What would you like to discuss? (e.g., college application strategy, essay review, major selection...)"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-[#04adee] resize-none bg-white transition-all text-sm"
              />
              <p className="text-xs text-gray-600 mt-3 flex items-start">
                <span className="text-[#04adee] mr-2">💡</span>
                A clear agenda helps your counselor prepare and makes the meeting more productive
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={!selectedSlot || !agenda.trim() || submitting}
                className="flex-1 bg-gradient-to-r from-[#04adee] to-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-base hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Request Meeting
                  </>
                )}
              </button>
              <button
                onClick={onBack}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-base hover:bg-gray-50 transition-all disabled:opacity-50 text-gray-700 hover:border-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingBookingPage;
