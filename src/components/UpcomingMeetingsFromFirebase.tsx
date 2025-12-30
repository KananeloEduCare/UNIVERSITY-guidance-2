import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MessageSquare, Loader } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { userStorage } from '../services/userStorage';

interface Meeting {
  id: string;
  counselorName: string;
  date: string;
  time: string;
  agenda: string;
  meetingLink: string;
  requestedAt: string;
}

const UpcomingMeetingsFromFirebase: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = userStorage.getStoredUser();
    if (!currentUser || !currentUser.name) {
      setLoading(false);
      return;
    }

    const studentName = currentUser.name;
    const meetingsRef = ref(database, 'Upcoming meetings');

    const unsubscribe = onValue(meetingsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setMeetings([]);
        setLoading(false);
        return;
      }

      const allMeetings: Meeting[] = [];
      const data = snapshot.val();

      Object.keys(data).forEach((counselorName) => {
        const counselorMeetings = data[counselorName];

        if (counselorMeetings[studentName]) {
          Object.keys(counselorMeetings[studentName]).forEach((slotKey) => {
            const meeting = counselorMeetings[studentName][slotKey];
            const [date, timeRange] = slotKey.split('_');

            allMeetings.push({
              id: slotKey,
              counselorName,
              date,
              time: timeRange,
              agenda: meeting.agenda || 'No agenda provided',
              meetingLink: meeting.meetingLink || '',
              requestedAt: meeting.requestedAt || ''
            });
          });
        }
      });

      allMeetings.sort((a, b) => a.date.localeCompare(b.date));
      setMeetings(allMeetings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-[#04adee] mr-3" />
        <span className="text-lg text-gray-600">Loading your meetings...</span>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Meetings</h3>
        <p className="text-gray-600">You don't have any scheduled meetings yet. Book a meeting with a counselor to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map(meeting => (
        <div
          key={meeting.id}
          className="bg-white rounded-xl shadow-sm border-2 border-green-200 transition-all hover:shadow-md"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{meeting.counselorName}</h3>
                <p className="text-sm text-gray-600">University Counselor</p>
              </div>
              <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">Confirmed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-700">
                <Calendar className="w-4 h-4 mr-2 text-[#04adee]" />
                <div>
                  <span className="font-medium">Meeting Date:</span>
                  <p className="text-gray-600">{formatDate(meeting.date)}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-[#04adee]" />
                <div>
                  <span className="font-medium">Time:</span>
                  <p className="text-gray-600">{meeting.time}</p>
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
        </div>
      ))}
    </div>
  );
};

export default UpcomingMeetingsFromFirebase;
