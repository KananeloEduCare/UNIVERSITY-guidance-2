import React, { useState } from 'react';
import { Search, BookOpen, Video, FileText, Download, ExternalLink, Star } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  type: 'Article' | 'Video' | 'Guide' | 'Template';
  author: string;
  rating: number;
  readTime?: number;
  category: string;
}

const MobileResources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const resources: Resource[] = [
    {
      id: 1,
      title: 'How to Write a Compelling Personal Statement',
      type: 'Article',
      author: 'Dr. Sarah Johnson',
      rating: 4.8,
      readTime: 15,
      category: 'Essays'
    },
    {
      id: 2,
      title: 'College Essay Bootcamp',
      type: 'Video',
      author: 'College Prep Academy',
      rating: 4.9,
      category: 'Essays'
    },
    {
      id: 3,
      title: 'FAFSA Complete Guide',
      type: 'Guide',
      author: 'Financial Aid Team',
      rating: 4.7,
      readTime: 25,
      category: 'Financial Aid'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video': return Video;
      case 'Article': return FileText;
      case 'Guide': return BookOpen;
      case 'Template': return Download;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Article': 'bg-blue-100 text-blue-800',
      'Video': 'bg-red-100 text-red-800',
      'Guide': 'bg-green-100 text-green-800',
      'Template': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#04adee] focus:border-transparent"
          />
        </div>
      </div>

      {/* Featured Alert */}
      <div className="bg-[#04adee] bg-opacity-10 border border-[#04adee] border-opacity-20 rounded-2xl p-4">
        <div className="flex items-center">
          <Star className="w-5 h-5 text-[#04adee] mr-3" />
          <div>
            <h3 className="font-semibold text-[#04adee] text-sm">Curated Resources</h3>
            <p className="text-xs text-gray-700">Hand-picked by successful students</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['All', 'Essays', 'Applications', 'Financial Aid', 'Test Prep'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              (selectedCategory === category || (category === 'All' && selectedCategory === ''))
                ? 'bg-[#04adee] text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Resources */}
      <div className="space-y-4">
        {resources.map(resource => {
          const TypeIcon = getTypeIcon(resource.type);
          
          return (
            <div key={resource.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#04adee] bg-opacity-10 rounded-xl flex items-center justify-center mr-3">
                    <TypeIcon className="w-5 h-5 text-[#04adee]" />
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                      {resource.type}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{resource.category}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium text-gray-700">{resource.rating}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">{resource.title}</h3>
              <p className="text-sm text-gray-600 mb-3">by {resource.author}</p>

              <div className="flex items-center justify-between">
                {resource.readTime && (
                  <span className="text-xs text-gray-500">{resource.readTime} min read</span>
                )}
                <button className="flex items-center bg-[#04adee] text-white px-3 py-2 rounded-lg text-sm font-medium">
                  Access
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileResources;