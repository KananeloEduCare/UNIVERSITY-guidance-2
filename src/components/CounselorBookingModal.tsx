import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Loader, CheckCircle } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, get } from 'firebase/database';

interface TimeSlot {
  id: string;
  date: string;
  timeRange: string;
  isAvailable: boolean;
  rawKey: string;
}

interface CounselorBookingModalProps {
  counselorName: string;
  counselorUniversity: string;
  counselorImage: string;
  isOpen: boolean;
  onClose: () => void;
}

const CounselorBookingModal: React.FC<CounselorBookingModalProps> = ({
  counselorName,
  counselorUniversity,
  counselorImage,
  isOpen,
  onClose
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTimeSlots();
    }
  }, [isOpen, counselorName]);

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
          // Parse the slot key format: "2026-01-11_08:00-09:45"
          const [datePart, timePart] = slotKey.split('_');

          slots.push({
            id: slotKey,
            date: datePart,
            timeRange: timePart,
            isAvailable: isBooked === false,
            rawKey: slotKey
          });
        });

        // Sort by date and time
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
    }
  };

  const handleConfirmBooking = () => {
    if (selectedSlot) {
      // We'll handle the booking logic next
      console.log('Selected slot:', selectedSlot);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#04adee] to-blue-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center">
            <img
              src={counselorImage}
              alt={counselorName}
              className="w-16 h-16 rounded-full object-cover mr-4 border-4 border-white shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150';
              }}
            />
            <div>
              <h2 className="text-2xl font-bold">{counselorName}</h2>
              <p className="text-blue-100">{counselorUniversity}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Available Time Slots</h3>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-[#04adee] mr-3" />
              <span className="text-lg text-gray-600">Loading timeslots...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && timeSlots.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No timeslots available at the moment.</p>
            </div>
          )}

          {!loading && !error && timeSlots.length > 0 && (
            <div className="space-y-6">
              {/* Group slots by date */}
              {Object.entries(
                timeSlots.reduce((acc, slot) => {
                  if (!acc[slot.date]) acc[slot.date] = [];
                  acc[slot.date].push(slot);
                  return acc;
                }, {} as Record<string, TimeSlot[]>)
              ).map(([date, slots]) => (
                <div key={date} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center mb-4">
                    <Calendar className="w-5 h-5 text-[#04adee] mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      {formatDate(date)}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.isAvailable}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-200
                          ${slot.isAvailable
                            ? selectedSlot?.id === slot.id
                              ? 'border-[#04adee] bg-[#04adee] text-white shadow-md'
                              : 'border-gray-300 bg-white hover:border-[#04adee] hover:bg-blue-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        <div className="flex items-center justify-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="font-medium">{slot.timeRange}</span>
                        </div>
                        {!slot.isAvailable && (
                          <div className="text-xs mt-1">Booked</div>
                        )}
                        {selectedSlot?.id === slot.id && (
                          <CheckCircle className="w-4 h-4 mx-auto mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedSlot && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected Time Slot</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(selectedSlot.date)} at {selectedSlot.timeRange}
                </p>
              </div>
              <button
                onClick={handleConfirmBooking}
                className="bg-[#04adee] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselorBookingModal;
