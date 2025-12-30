import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Loader, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { meetingRequestsService, AvailabilitySlot } from '../services/meetingRequestsService';
import { supabase } from '../config/supabase';

interface MeetingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  counselorEmail: string;
  counselorName: string;
}

const MeetingBookingModal: React.FC<MeetingBookingModalProps> = ({
  isOpen,
  onClose,
  counselorEmail,
  counselorName,
}) => {
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [agenda, setAgenda] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [counselorId, setCounselorId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCounselorAndSlots();
    }
  }, [isOpen, counselorEmail]);

  const loadCounselorAndSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      setCounselorId('mock-counselor-id');

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      const mockSlots: AvailabilitySlot[] = [
        { id: '1', counselor_id: 'mock-counselor-id', date: formatDate(tomorrow), start_time: '09:00:00', end_time: '09:30:00', is_booked: false, created_at: '' },
        { id: '2', counselor_id: 'mock-counselor-id', date: formatDate(tomorrow), start_time: '10:00:00', end_time: '10:30:00', is_booked: false, created_at: '' },
        { id: '3', counselor_id: 'mock-counselor-id', date: formatDate(tomorrow), start_time: '11:00:00', end_time: '11:30:00', is_booked: false, created_at: '' },
        { id: '4', counselor_id: 'mock-counselor-id', date: formatDate(tomorrow), start_time: '14:00:00', end_time: '14:30:00', is_booked: false, created_at: '' },
        { id: '5', counselor_id: 'mock-counselor-id', date: formatDate(tomorrow), start_time: '15:00:00', end_time: '15:30:00', is_booked: false, created_at: '' },
        { id: '6', counselor_id: 'mock-counselor-id', date: formatDate(tomorrow), start_time: '16:00:00', end_time: '16:30:00', is_booked: false, created_at: '' },
        { id: '7', counselor_id: 'mock-counselor-id', date: formatDate(dayAfterTomorrow), start_time: '09:00:00', end_time: '09:30:00', is_booked: false, created_at: '' },
        { id: '8', counselor_id: 'mock-counselor-id', date: formatDate(dayAfterTomorrow), start_time: '10:00:00', end_time: '10:30:00', is_booked: false, created_at: '' },
        { id: '9', counselor_id: 'mock-counselor-id', date: formatDate(dayAfterTomorrow), start_time: '13:00:00', end_time: '13:30:00', is_booked: false, created_at: '' },
        { id: '10', counselor_id: 'mock-counselor-id', date: formatDate(dayAfterTomorrow), start_time: '14:00:00', end_time: '14:30:00', is_booked: false, created_at: '' },
        { id: '11', counselor_id: 'mock-counselor-id', date: formatDate(dayAfterTomorrow), start_time: '15:00:00', end_time: '15:30:00', is_booked: false, created_at: '' },
      ];

      setTimeout(() => {
        setAvailableSlots(mockSlots);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error loading availability:', err);
      setError('Failed to load available time slots');
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

      setTimeout(() => {
        setSubmitting(false);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setSelectedSlot(null);
          setAgenda('');
        }, 2500);
      }, 1000);
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
    const grouped: { [date: string]: AvailabilitySlot[] } = {};
    availableSlots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#04adee] to-blue-600 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Book a Meeting</h2>
            <p className="text-sm text-blue-100 mt-1">Schedule time with {counselorName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-12">
              <div className="bg-green-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Meeting Request Sent!</h3>
              <p className="text-gray-600 text-lg">Your counselor will review your request and respond soon.</p>
              <div className="mt-6 bg-blue-50 rounded-xl p-4 inline-block">
                <p className="text-sm text-[#04adee] font-medium">Check your meetings page for updates</p>
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader className="w-12 h-12 animate-spin text-[#04adee] mb-4" />
                  <span className="text-lg text-gray-600 font-medium">Loading available time slots...</span>
                  <span className="text-sm text-gray-500 mt-2">Please wait a moment</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Available Slots</h3>
                  <p className="text-gray-600 mb-2">This counselor has no available time slots at the moment.</p>
                  <p className="text-gray-500 text-sm">Please check back later or contact them via email.</p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-[#04adee] bg-opacity-10 rounded-full p-2 mr-3">
                        <Calendar className="w-5 h-5 text-[#04adee]" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Choose Your Time</h3>
                    </div>
                    <div className="space-y-6">
                      {Object.entries(groupSlotsByDate()).map(([date, slots]) => (
                        <div key={date} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                          <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="w-1 h-6 bg-[#04adee] rounded mr-3"></div>
                            {formatDate(date)}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {slots.map(slot => (
                              <button
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot)}
                                className={`px-4 py-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                                  selectedSlot?.id === slot.id
                                    ? 'border-[#04adee] bg-[#04adee] text-white shadow-lg scale-105'
                                    : 'border-gray-300 bg-white hover:border-[#04adee] hover:shadow-md'
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  <Clock className={`w-5 h-5 mb-2 ${selectedSlot?.id === slot.id ? 'text-white' : 'text-[#04adee]'}`} />
                                  <span className="text-sm font-semibold">
                                    {formatTime(slot.start_time)}
                                  </span>
                                  <span className={`text-xs mt-1 ${selectedSlot?.id === slot.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {formatTime(slot.end_time)}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center mb-3">
                      <div className="bg-[#04adee] bg-opacity-10 rounded-full p-2 mr-3">
                        <AlertCircle className="w-5 h-5 text-[#04adee]" />
                      </div>
                      <label className="text-lg font-bold text-gray-900">
                        Meeting Agenda
                      </label>
                    </div>
                    <textarea
                      value={agenda}
                      onChange={(e) => setAgenda(e.target.value)}
                      placeholder="What would you like to discuss? (e.g., college application strategy, essay review, major selection...)"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#04adee] focus:border-[#04adee] resize-none bg-white transition-all"
                    />
                    <p className="text-sm text-gray-600 mt-3 flex items-start">
                      <span className="text-[#04adee] mr-2">💡</span>
                      A clear agenda helps your counselor prepare and makes the meeting more productive
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Error</p>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedSlot || !agenda.trim() || submitting}
                      className="flex-1 bg-gradient-to-r from-[#04adee] to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 disabled:hover:scale-100"
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
                      onClick={onClose}
                      disabled={submitting}
                      className="px-8 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 text-gray-700 hover:border-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingBookingModal;
