import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Search, Filter, Video, FileText, Users, Star, Download } from 'lucide-react';
import { resourcesService, Resource } from '../services/resourcesService';

const Resources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const fetchedResources = await resourcesService.fetchResourcesFromFirebase();
      setResources(fetchedResources);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Essays', 'Applications', 'Financial Aid', 'University Selection', 'Test Prep', 'General'];
  const types = ['Article', 'Video', 'Guide', 'Template', 'Webinar'];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.keywords.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '' || resource.category === selectedCategory;
    const matchesType = selectedType === '' || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video': return Video;
      case 'Article': return FileText;
      case 'Guide': return BookOpen;
      case 'Template': return Download;
      case 'Webinar': return Users;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Article': 'bg-blue-100 text-blue-800',
      'Video': 'bg-red-100 text-red-800',
      'Guide': 'bg-green-100 text-green-800',
      'Template': 'bg-purple-100 text-purple-800',
      'Webinar': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#04adee] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources & Guides</h1>
        <p className="text-gray-600">Comprehensive resources to help you succeed in your university applications</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources, authors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-500 mr-2" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Resources Alert */}
      <div className="bg-[#04adee] bg-opacity-10 border border-[#04adee] border-opacity-20 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <Star className="w-6 h-6 text-[#04adee] mr-3" />
          <div>
            <h3 className="font-semibold text-[#04adee]">Curated Resources</h3>
            <p className="text-sm text-gray-700">Hand-picked resources from successful students and admissions experts.</p>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredResources.map(resource => {
          const TypeIcon = getTypeIcon(resource.type);
          
          return (
            <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#04adee] bg-opacity-10 rounded-lg flex items-center justify-center">
                    <TypeIcon className="w-5 h-5 text-[#04adee]" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full font-medium">
                  {resource.category}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {resource.author}</p>
              <p className="text-gray-700 mb-3">{resource.description}</p>

              {resource.keywords.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Key Topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.keywords.map(tag => (
                      <span key={tag} className="bg-[#04adee] bg-opacity-10 text-[#04adee] text-xs px-3 py-1 rounded-full font-medium border border-[#04adee] border-opacity-20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {resource.duration && (
                    <span>{resource.duration}</span>
                  )}
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-[#04adee] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Access Resource
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Resources;