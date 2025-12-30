import React, { useState } from 'react';
import { Search, DollarSign, Calendar, Award, Filter, ExternalLink } from 'lucide-react';

interface Scholarship {
  id: number;
  name: string;
  provider: string;
  amount: number;
  deadline: string;
  matchScore: number;
  type: string;
}

const MobileScholarships: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const scholarships: Scholarship[] = [
    {
      id: 1,
      name: 'National Merit Scholarship',
      provider: 'National Merit Corp.',
      amount: 25000,
      deadline: '2025-03-15',
      matchScore: 95,
      type: 'Merit'
    },
    {
      id: 2,
      name: 'Gates Millennium Scholars',
      provider: 'Gates Foundation',
      amount: 50000,
      deadline: '2025-01-15',
      matchScore: 88,
      type: 'Need-Based'
    },
    {
      id: 3,
      name: 'Google CS Scholarship',
      provider: 'Google Inc.',
      amount: 10000,
      deadline: '2025-02-28',
      matchScore: 92,
      type: 'Field-Specific'
    }
  ];

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
          />
        </div>
      </div>

      {/* Matching Alert */}
      <div className="bg-[#04adee] bg-opacity-10 border border-[#04adee] border-opacity-20 rounded-2xl p-4">
        <div className="flex items-center">
          <Award className="w-5 h-5 text-[#04adee] mr-3" />
          <div>
            <h3 className="font-semibold text-[#04adee] text-sm">Personalized Matching</h3>
            <p className="text-xs text-gray-700">Scholarships ranked by your eligibility</p>
          </div>
        </div>
      </div>

      {/* Scholarships */}
      <div className="space-y-4">
        {scholarships.map(scholarship => (
          <div key={scholarship.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{scholarship.name}</h3>
                <p className="text-sm text-gray-600">{scholarship.provider}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getMatchColor(scholarship.matchScore)}`}>
                {scholarship.matchScore}% Match
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#04adee] bg-opacity-10 rounded-xl p-3 text-center">
                <DollarSign className="w-5 h-5 text-[#04adee] mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">${(scholarship.amount/1000).toFixed(0)}k</div>
                <div className="text-xs text-gray-600">Award</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Calendar className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                <div className="text-sm font-bold text-gray-900">{new Date(scholarship.deadline).toLocaleDateString()}</div>
                <div className="text-xs text-gray-600">Deadline</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {scholarship.type}
              </span>
              <button className="flex items-center bg-[#04adee] text-white px-3 py-2 rounded-lg text-sm font-medium">
                Apply
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileScholarships;