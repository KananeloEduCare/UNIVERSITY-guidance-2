import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Video } from 'lucide-react';
import { firebaseMeetingService, AvailabilitySlot } from '../services/firebaseMeetingService';
import { database } from '../config/firebase';
import { ref, onValue } from 'firebase/database';

interface MeetingRequestsProps {
  counselorId: string;
  counselorName: string;
}

interface UpcomingMeeting {
  id: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  agenda: string;
  meetingLink: string;
  requestedAt: string;
}

export default function MeetingRequests({ counselorName }: MeetingRequestsProps) {
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'availability'>('upcoming');

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    const unsubscribeAvailability = firebaseMeetingService.listenToCounselorAvailability(
      counselorName,
      (slots) => {
        setAvailability(slots);
        setLoading(false);
      }
    );

    const upcomingMeetingsRef = ref(database, `Upcoming meetings/${counselorName}`);
    const unsubscribeMeetings = onValue(upcomingMeetingsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setUpcomingMeetings([]);
        return;
      }

      const meetings: UpcomingMeeting[] = [];
      const data = snapshot.val();

      Object.keys(data).forEach((studentName) => {
        const studentMeetings = data[studentName];

        Object.keys(studentMeetings).forEach((slotKey) => {
          const meeting = studentMeetings[slotKey];
          const [date, timeRange] = slotKey.split('_');

          meetings.push({
            id: slotKey,
            studentName,
            studentEmail: meeting.studentEmail || '',
            date,
            time: timeRange,
            agenda: meeting.agenda || 'No agenda provided',
            meetingLink: meeting.meetingLink || '',
            requestedAt: meeting.requestedAt || ''
          });
        });
      });

      meetings.sort((a, b) => a.date.localeCompare(b.date));
      setUpcomingMeetings(meetings);
    });

    return () => {
      unsubscribeAvailability();
      unsubscribeMeetings();
    };
  }, [counselorName]);

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await firebaseMeetingService.addAvailabilitySlot(
        counselorName,
        newSlot.date,
        newSlot.startTime,
        newSlot.endTime
      );
      setNewSlot({ date: '', startTime: '', endTime: '' });
      setShowAddSlot(false);
    } catch (error) {
      console.error('Error adding slot:', error);
      alert('Failed to add time slot. Please try again.');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    try {
      await firebaseMeetingService.deleteAvailabilitySlot(counselorName, slotId);
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Failed to delete time slot. Please try again.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04ADEE]"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Requests</h1>
        <p className="text-gray-600">Manage student meeting requests and your availability</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'text-[#04ADEE] border-b-2 border-[#04ADEE]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming Meetings
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'availability'
                  ? 'text-[#04ADEE] border-b-2 border-[#04ADEE]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Availability
            </button>
          </div>
        </div>

        {activeTab === 'upcoming' ? (
          <div className="p-6">
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No upcoming meetings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-green-50/50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {meeting.studentName || 'Unknown Student'}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Confirmed
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{meeting.studentEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(meeting.date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {meeting.time}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Meeting Agenda:</p>
                      <p className="text-gray-600">{meeting.agenda}</p>
                    </div>

                    {meeting.meetingLink && (
                      <button
                        onClick={() => window.open(meeting.meetingLink, '_blank')}
                        className="w-full bg-gradient-to-r from-[#04adee] to-[#0396d5] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#0396d5] hover:to-[#027fb8] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Video className="w-5 h-5" />
                        Join Video Meeting
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Available Time Slots</h2>
              <button
                onClick={() => setShowAddSlot(!showAddSlot)}
                className="px-4 py-2 bg-[#04ADEE] text-white rounded-lg hover:bg-[#0396d5] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Time Slot
              </button>
            </div>

            {showAddSlot && (
              <div className="bg-[#04ADEE]/10 border border-[#04ADEE]/30 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Time Slot</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-[#04ADEE]"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-[#04ADEE]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-[#04ADEE]"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSlot}
                    className="px-4 py-2 bg-[#04ADEE] text-white rounded-lg hover:bg-[#0396d5] transition-colors"
                  >
                    Add Slot
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSlot(false);
                      setNewSlot({ date: '', startTime: '', endTime: '' });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {availability.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No available time slots</p>
                <p className="text-gray-400 text-sm">Add time slots for students to book meetings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availability.map((slot) => (
                  <div
                    key={slot.id}
                    className={`border rounded-lg p-4 ${
                      slot.isBooked
                        ? 'bg-gray-50 border-gray-300'
                        : 'bg-white border-gray-200 hover:shadow-md transition-shadow'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#04ADEE]" />
                        <span className="font-medium text-gray-900">
                          {formatDate(slot.date)}
                        </span>
                      </div>
                      {!slot.isBooked && (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    {slot.isBooked && (
                      <div className="mt-3 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full inline-block">
                        Booked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}