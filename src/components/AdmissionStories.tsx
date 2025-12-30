import { useState, useEffect } from 'react';
import { BookOpen, MapPin, Search, Filter, X } from 'lucide-react';
import { getAllAdmissionStories, AdmissionStory } from '../services/admissionStoriesService';

interface AdmissionStoriesProps {
  onViewStory: (storyId: string) => void;
}

export default function AdmissionStories({ onViewStory }: AdmissionStoriesProps) {
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admission Stories</h1>
          <p className="text-gray-600">
            Discover {stories.length}+ inspiring journeys from students worldwide
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, university, country, or major..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                hasActiveFilters
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filter
              {hasActiveFilters && (
                <span className="bg-white text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  {(selectedCountry ? 1 : 0) + (selectedMajor ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {filterOpen && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Major
                  </label>
                  <select
                    value={selectedMajor}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              onClick={() => onViewStory(story.id)}
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={story.profile_image_url}
                  alt={story.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                  {story.name}
                </h3>

                <div className="space-y-1 mb-2">
                  <div className="flex items-center text-gray-500 text-xs">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{story.country}</span>
                  </div>

                  <div className="flex items-center text-gray-500 text-xs">
                    <BookOpen className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{story.current_university}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-blue-600 truncate">
                    {story.current_major}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStories.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Check back soon for inspiring admission stories!'}
            </p>
            {(searchQuery || hasActiveFilters) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
