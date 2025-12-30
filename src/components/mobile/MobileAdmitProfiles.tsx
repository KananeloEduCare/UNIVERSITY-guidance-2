import { useState, useEffect } from 'react';
import { Search, GraduationCap } from 'lucide-react';
import { getAllFirebaseAdmitProfiles, FirebaseAdmitProfile } from '../../services/firebaseAdmitProfilesService';
import { getCountryFlag } from '../../utils/countryFlags';

interface MobileAdmitProfilesProps {
  onViewProfile: (profileId: string) => void;
}

export default function MobileAdmitProfiles({ onViewProfile }: MobileAdmitProfilesProps) {
  const [profiles, setProfiles] = useState<FirebaseAdmitProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<FirebaseAdmitProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, countryFilter, majorFilter, profiles]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await getAllFirebaseAdmitProfiles();
      setProfiles(data);
      setFilteredProfiles(data);
    } catch (error) {
      console.error('Error loading admit profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.current_university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.current_major.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (countryFilter) {
      filtered = filtered.filter(profile => profile.country === countryFilter);
    }

    if (majorFilter) {
      filtered = filtered.filter(profile => profile.current_major === majorFilter);
    }

    setFilteredProfiles(filtered);
  };

  const uniqueCountries = Array.from(new Set(profiles.map(p => p.country))).sort();
  const uniqueMajors = Array.from(new Set(profiles.map(p => p.current_major))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="px-3 pt-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admit Profiles</h1>
          <p className="text-sm text-gray-600">Students admitted to top universities</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={majorFilter}
              onChange={(e) => setMajorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Majors</option>
              {uniqueMajors.map(major => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => onViewProfile(profile.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden active:scale-95 transition-transform"
            >
              <div className="relative">
                <img
                  src={profile.profile_image_url}
                  alt={profile.name}
                  className="w-full h-40 object-cover"
                />
              </div>

              <div className="p-3">
                <h3 className="font-bold text-gray-900 text-xs mb-1.5 line-clamp-1">{profile.name}</h3>

                <div className="flex items-center text-xs text-gray-600 mb-1.5">
                  <img
                    src={getCountryFlag(profile.country)}
                    alt={profile.country}
                    className="w-4 h-3 mr-1.5 flex-shrink-0 object-cover rounded-sm"
                  />
                  <span className="line-clamp-1">{profile.country}</span>
                </div>

                <div className="flex items-start text-xs text-gray-700 mb-1.5">
                  <GraduationCap className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2 font-medium">{profile.current_university}</span>
                </div>

                <div className="text-xs text-green-600 font-semibold">
                  Accepted {profile.application_round}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No profiles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
