import React, { useState, useEffect } from 'react';
import { Search, DollarSign, Calendar, Award, ExternalLink, Loader2 } from 'lucide-react';
import { scholarshipsService, Scholarship } from '../services/scholarshipsService';

const Scholarships: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScholarships = async () => {
      setLoading(true);
      const data = await scholarshipsService.fetchScholarshipsFromFirebase();
      setScholarships(data);
      setLoading(false);
    };

    loadScholarships();
  }, []);

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#04adee] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading scholarships...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scholarship Opportunities</h1>
        <p className="text-gray-600">Discover scholarships that match your profile and financial needs</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
          />
        </div>
      </div>

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredScholarships.map(scholarship => (
          <div key={scholarship.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start gap-4 mb-4">
              {scholarship.iconUrl && (
                <img
                  src={scholarship.iconUrl}
                  alt={`${scholarship.name} logo`}
                  className="w-16 h-16 object-contain rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{scholarship.name}</h3>
                <p className="text-gray-700 text-sm">{scholarship.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-[#04adee] bg-opacity-10 rounded-lg">
                <DollarSign className="w-6 h-6 text-[#04adee] mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{scholarship.amount}</div>
                <div className="text-sm text-gray-600">Award Amount</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                <div className="text-sm font-bold text-gray-900">{scholarship.deadline}</div>
                <div className="text-sm text-gray-600">Deadline</div>
              </div>
            </div>

            {scholarship.eligibility.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Eligibility Criteria:</h4>
                <ul className="space-y-1">
                  {scholarship.eligibility.map((criteria, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-[#04adee] rounded-full mr-2"></div>
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scholarship.requirements.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                <div className="flex flex-wrap gap-2">
                  {scholarship.requirements.map((req, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <a
                href={scholarship.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-[#04adee] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium w-full"
              >
                Learn More & Apply
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Scholarships;