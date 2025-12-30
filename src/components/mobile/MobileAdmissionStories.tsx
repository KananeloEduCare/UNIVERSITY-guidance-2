import { useState, useEffect } from 'react';
import { BookOpen, MapPin, ArrowRight, Search, Filter, X } from 'lucide-react';
import { getAllAdmissionStories, AdmissionStory } from '../../services/admissionStoriesService';

interface MobileAdmissionStoriesProps {
  onViewStory: (storyId: string) => void;
}

export default function MobileAdmissionStories({ onViewStory }: MobileAdmissionStoriesProps) {
  const [stories, setStories] = useState<AdmissionStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<AdmissionStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMajor, setSelectedMajor] = useState<string>('');

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    filterStories();
  }, [searchQuery, selectedCountry, selectedMajor, stories]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const data = await getAllAdmissionStories();
      setStories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load admission stories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterStories = () => {
    let filtered = stories;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        story =>
          story.name.toLowerCase().includes(query) ||
          story.current_university.toLowerCase().includes(query) ||
          story.country.toLowerCase().includes(query) ||
          story.current_major.toLowerCase().includes(query)
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter(story => story.country === selectedCountry);
    }

    if (selectedMajor) {
      filtered = filtered.filter(story => story.current_major === selectedMajor);
    }

    setFilteredStories(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedMajor('');
  };

  const countries = Array.from(new Set(stories.map(s => s.country))).sort();
  const majors = Array.from(new Set(stories.map(s => s.current_major))).sort();
  const hasActiveFilters = selectedCountry || selectedMajor;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Admission Stories</h1>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, university, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
            </p>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                hasActiveFilters
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {hasActiveFilters && (
                <span className="bg-white text-blue-600 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
                  {(selectedCountry ? 1 : 0) + (selectedMajor ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Major
              </label>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Majors</option>
                {majors.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 grid grid-cols-2 gap-3">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            onClick={() => onViewStory(story.id)}
            className="bg-white rounded-xl shadow-sm active:shadow-md transition-all overflow-hidden border border-gray-100"
          >
            <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={story.profile_image_url}
                alt={story.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-2.5">
              <h3 className="font-semibold text-gray-900 text-xs mb-1 truncate">
                {story.name}
              </h3>

              <div className="space-y-0.5 mb-1.5">
                <div className="flex items-center text-gray-500 text-xs">
                  <MapPin className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                  <span className="truncate">{story.country}</span>
                </div>

                <div className="flex items-center text-gray-500 text-xs">
                  <BookOpen className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                  <span className="truncate">{story.current_university}</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-gray-100">
                <p className="text-xs font-medium text-blue-600 truncate">
                  {story.current_major}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStories.length === 0 && !loading && (
        <div className="text-center py-12 mx-4 bg-white rounded-xl border border-gray-200">
          <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No stories found</h3>
          <p className="text-xs text-gray-500 mb-3">
            {searchQuery || hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'Check back soon!'}
          </p>
          {(searchQuery || hasActiveFilters) && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
