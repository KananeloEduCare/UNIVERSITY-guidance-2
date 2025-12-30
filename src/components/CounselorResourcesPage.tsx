import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, BookOpen, Video, FileText, Search, X, Clock, ExternalLink, LogOut } from 'lucide-react';
import { counselorAuthService } from '../services/counselorAuthService';
import { counselorResourcesService, CounselorResource } from '../services/counselorResourcesService';

interface CounselorResourcesPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function CounselorResourcesPage({ onBack, onLogout }: CounselorResourcesPageProps) {
  const [resources, setResources] = useState<CounselorResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<CounselorResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    resource_type: 'article' as 'video' | 'article' | 'guide' | 'other',
    title: '',
    creator: '',
    description: '',
    key_topics: '',
    time_estimate: '',
    link: '',
    category: 'general' as 'essays' | 'financial_aid' | 'applications' | 'interviews' | 'general',
  });
  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [resources, searchTerm, filterCategory, filterType]);

  const loadResources = async () => {
    setIsLoading(true);
    console.log('Loading resources from Firebase...');
    try {
      const data = await counselorResourcesService.getAll('anonymous');
      console.log('Resources loaded:', data);
      setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...resources];

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.key_topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === filterCategory);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(resource => resource.resource_type === filterType);
    }

    setFilteredResources(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const topics = formData.key_topics.split(',').map(t => t.trim()).filter(t => t);

    if (!formData.title || !formData.creator || !formData.link) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Submitting resource:', { ...formData, key_topics: topics });

    try {
      if (editingId) {
        console.log('Updating resource with id:', editingId);
        await counselorResourcesService.update(editingId, {
          ...formData,
          key_topics: topics,
        });
        alert('Resource updated successfully!');
      } else {
        console.log('Creating new resource');
        const result = await counselorResourcesService.create({
          ...formData,
          key_topics: topics,
          counselor_id: 'anonymous',
        });
        console.log('Resource created:', result);
        alert('Resource created successfully!');
      }
      resetForm();
      await loadResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert(`Error saving resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (resource: CounselorResource) => {
    setFormData({
      resource_type: resource.resource_type,
      title: resource.title,
      creator: resource.creator,
      description: resource.description || '',
      key_topics: resource.key_topics.join(', '),
      time_estimate: resource.time_estimate,
      link: resource.link,
      category: resource.category,
    });
    setEditingId(resource.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await counselorResourcesService.delete(id);
      loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      resource_type: 'article',
      title: '',
      creator: '',
      description: '',
      key_topics: '',
      time_estimate: '',
      link: '',
      category: 'general',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'guide': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essays': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'financial_aid': return 'bg-green-100 text-green-700 border-green-200';
      case 'applications': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'interviews': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Resource Management</h2>
        <p className="text-sm text-slate-600">Add and manage educational resources</p>
      </div>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#04ADEE] hover:bg-[#0396d5] text-white font-medium rounded-lg transition-colors"
        >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Add Resource'}
          </button>

        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent bg-white"
        >
            <option value="all">All Categories</option>
            <option value="essays">Essays</option>
            <option value="financial_aid">Financial Aid</option>
            <option value="applications">Applications</option>
            <option value="interviews">Interviews</option>
            <option value="general">General</option>
          </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent bg-white"
        >
          <option value="all">All Types</option>
          <option value="video">Videos</option>
          <option value="article">Articles</option>
          <option value="guide">Guides</option>
          <option value="other">Other</option>
        </select>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Resource' : 'New Resource'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resource Type *
                </label>
                <select
                  value={formData.resource_type}
                  onChange={(e) => setFormData({ ...formData, resource_type: e.target.value as any })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent bg-white"
                >
                    <option value="video">Video</option>
                    <option value="article">Article</option>
                    <option value="guide">Guide</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category *
                  </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent bg-white"
                >
                    <option value="essays">Essays</option>
                    <option value="financial_aid">Financial Aid</option>
                    <option value="applications">Applications</option>
                    <option value="interviews">Interviews</option>
                    <option value="general">General Strategy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Creator / Author *
                  </label>
                <input
                  type="text"
                  value={formData.creator}
                  onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Time Estimate *
                </label>
                <input
                  type="text"
                  value={formData.time_estimate}
                  onChange={(e) => setFormData({ ...formData, time_estimate: e.target.value })}
                  required
                  placeholder="e.g., 10 minutes"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Key Topics * (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.key_topics}
                  onChange={(e) => setFormData({ ...formData, key_topics: e.target.value })}
                  required
                  placeholder="e.g., Common App, Personal Statement, Brainstorming"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resource Link *
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  required
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#04ADEE] hover:bg-[#0396d5] text-white font-medium rounded-lg transition-colors"
                >
                  {editingId ? 'Update' : 'Create'} Resource
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[#04ADEE] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading resources...</p>
        </div>
      ) : (
        filteredResources.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No resources found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || filterCategory !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Click "Add Resource" button above to create your first resource'}
            </p>
          </div>
        ) : (
        <div className="grid gap-4">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#04ADEE]/10 rounded-lg text-[#04ADEE]">
                      {getResourceIcon(resource.resource_type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{resource.title}</h3>
                      <p className="text-sm text-slate-600">by {resource.creator}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(resource.category)}`}>
                      {resource.category.replace('_', ' ')}
                    </span>
                  </div>

                  {resource.description && (
                    <p className="text-sm text-slate-700 mb-3">{resource.description}</p>
                  )}

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      {resource.time_estimate}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-medium capitalize">{resource.resource_type}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.key_topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#04ADEE] hover:text-[#0396d5] text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Resource
                  </a>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(resource)}
                    className="p-2 hover:bg-[#04ADEE]/10 text-[#04ADEE] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )
      )}
    </div>
  );
}
