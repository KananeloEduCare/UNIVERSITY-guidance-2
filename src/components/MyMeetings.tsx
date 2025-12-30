import React, { useState } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, MessageSquare, Filter } from 'lucide-react';

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
}

const MyMeetings: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const mockMeetings: MeetingRequest[] = [
    {
      id: '1',
      counselorName: 'Sarah Anderson',
      counselorUniversity: 'Harvard University',
      counselorImage: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150',
      date: 'December 28, 2025',
      time: '2:00 PM - 3:00 PM',
      agenda: 'I would like to discuss my college application strategy for Ivy League schools. I need guidance on how to make my application stand out.',
      status: 'accepted',
      requestedDate: 'December 22, 2025'
    },
    {
      id: '2',
      counselorName: 'Michael Chen',
      counselorUniversity: 'Stanford University',
      counselorImage: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150',
      date: 'December 30, 2025',
      time: '11:00 AM - 12:00 PM',
      agenda: 'Looking for advice on writing compelling personal statements and how to showcase my STEM research experience effectively.',
      status: 'pending',
      requestedDate: 'December 23, 2025'
    },
    {
      id: '3',
      counselorName: 'Sarah Anderson',
      counselorUniversity: 'Harvard University',
      counselorImage: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150',
      date: 'January 5, 2026',
      time: '3:00 PM - 4:00 PM',
      agenda: 'Need help with scholarship applications and financial aid strategy for international students.',
      status: 'pending',
      requestedDate: 'December 24, 2025'
    },
    {
      id: '4',
      counselorName: 'Michael Chen',
      counselorUniversity: 'Stanford University',
      counselorImage: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150',
      date: 'December 26, 2025',
      time: '10:00 AM - 11:00 AM',
      agenda: 'Want to discuss SAT preparation strategies and whether I should retake the test.',
      status: 'rejected',
      rejectionReason: 'Unfortunately, I have a scheduling conflict at this time. However, I have multiple slots available next week. Please book another time slot that works better for both of us. I\'d be happy to discuss your SAT preparation strategy then!',
      requestedDate: 'December 20, 2025'
    },
    {
      id: '5',
      counselorName: 'Sarah Anderson',
      counselorUniversity: 'Harvard University',
      counselorImage: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150',
      date: 'January 8, 2026',
      time: '9:00 AM - 10:00 AM',
      agenda: 'Interested in learning about the application timeline and key deadlines for top universities.',
      status: 'accepted',
      requestedDate: 'December 21, 2025'
    }
  ];

  const filteredMeetings = mockMeetings.filter(meeting =>
    filterStatus === 'all' || meeting.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">Accepted</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full">
            <XCircle className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">Rejected</span>
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

  const getStatusCount = (status: 'pending' | 'accepted' | 'rejected') => {
    return mockMeetings.filter(m => m.status === status).length;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Meeting Requests</h1>
        <p className="text-gray-600">Track all your counselor meeting requests and their status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{mockMeetings.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-[#04adee] opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{getStatusCount('pending')}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Accepted</p>
              <p className="text-3xl font-bold text-green-600">{getStatusCount('accepted')}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{getStatusCount('rejected')}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-500 mr-3" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-[#04adee] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({mockMeetings.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({getStatusCount('pending')})
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'accepted'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Accepted ({getStatusCount('accepted')})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({getStatusCount('rejected')})
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-600">No meeting requests match the selected filter.</p>
          </div>
        ) : (
          filteredMeetings.map(meeting => (
            <div
              key={meeting.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                meeting.status === 'accepted'
                  ? 'border-green-200'
                  : meeting.status === 'rejected'
                  ? 'border-red-200'
                  : 'border-yellow-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={meeting.counselorImage}
                      alt={meeting.counselorName}
                      className="w-14 h-14 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{meeting.counselorName}</h3>
                      <p className="text-sm text-gray-600">{meeting.counselorUniversity}</p>
                    </div>
                  </div>
                  {getStatusBadge(meeting.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-[#04adee]" />
                    <div>
                      <span className="font-medium">Requested Date:</span>
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

                {meeting.status === 'rejected' && meeting.rejectionReason && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                    <div className="flex items-start">
                      <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-900 mb-1">Reason for Rejection</h4>
                        <p className="text-sm text-red-800 leading-relaxed">{meeting.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {meeting.status === 'accepted' && (
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-green-900 mb-1">Meeting Confirmed!</h4>
                        <p className="text-sm text-green-800">
                          Your meeting has been confirmed. A calendar invite will be sent to your email shortly.
                          Please join at the scheduled time.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {meeting.status === 'pending' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-900 mb-1">Awaiting Response</h4>
                        <p className="text-sm text-yellow-800">
                          Your meeting request is pending approval from the counselor.
                          You will be notified once they respond to your request.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {filteredMeetings.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Showing {filteredMeetings.length} of {mockMeetings.length} meeting requests
          </p>
        </div>
      )}
    </div>
  );
};

export default MyMeetings;
