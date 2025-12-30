import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Award, Calendar, DollarSign, ExternalLink, LogOut, X } from 'lucide-react';
import { counselorAuthService } from '../services/counselorAuthService';
import { counselorScholarshipsService, CounselorScholarship } from '../services/counselorScholarshipsService';

interface CounselorScholarshipsPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function CounselorScholarshipsPage({ onBack, onLogout }: CounselorScholarshipsPageProps) {
  const [scholarships, setScholarships] = useState<CounselorScholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    description: '',
    award_amount: '',
    deadline: '',
    eligibility_criteria: [] as string[],
    requirements: [] as string[],
    application_link: '',
  });
  const [newEligibility, setNewEligibility] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

  useEffect(() => {
    loadScholarships();
  }, []);

  const loadScholarships = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await counselorScholarshipsService.getAll('203c556b-d13d-48f6-81dc-49a162b5527d');
      setScholarships(data);
      setError(null);
    } catch (error) {
      console.error('Error loading scholarships:', error);
      setError('Failed to load scholarships. Please try again.');
      setScholarships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.eligibility_criteria.length === 0) {
      setError('Please add at least one eligibility criteria');
      return;
    }

    if (formData.requirements.length === 0) {
      setError('Please add at least one requirement');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('Submitting scholarship data:', formData);

      if (editingId) {
        await counselorScholarshipsService.update(editingId, formData);
        setSuccessMessage('Scholarship updated successfully!');
        console.log('Scholarship updated successfully');
      } else {
        const result = await counselorScholarshipsService.create({
          ...formData,
          counselor_id: '203c556b-d13d-48f6-81dc-49a162b5527d',
        });
        setSuccessMessage('Scholarship created successfully!');
        console.log('Scholarship created successfully:', result);
      }

      resetForm();
      await loadScholarships();
    } catch (error) {
      console.error('Error saving scholarship:', error);
      setError(`Failed to save scholarship: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (scholarship: CounselorScholarship) => {
    setFormData({
      name: scholarship.name,
      logo_url: scholarship.logo_url || '',
      description: scholarship.description,
      award_amount: scholarship.award_amount,
      deadline: scholarship.deadline,
      eligibility_criteria: Array.isArray(scholarship.eligibility_criteria)
        ? scholarship.eligibility_criteria
        : scholarship.eligibility_criteria.split('\n').filter(item => item.trim()),
      requirements: Array.isArray(scholarship.requirements)
        ? scholarship.requirements
        : scholarship.requirements.split('\n').filter(item => item.trim()),
      application_link: scholarship.application_link,
    });
    setEditingId(scholarship.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      await counselorScholarshipsService.delete(id);
      alert('Scholarship deleted successfully!');
      loadScholarships();
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      alert('Failed to delete scholarship. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      description: '',
      award_amount: '',
      deadline: '',
      eligibility_criteria: [],
      requirements: [],
      application_link: '',
    });
    setNewEligibility('');
    setNewRequirement('');
    setEditingId(null);
    setShowForm(false);
    setError(null);
    setSuccessMessage(null);
  };

  const addEligibilityCriteria = () => {
    if (newEligibility.trim()) {
      setFormData({
        ...formData,
        eligibility_criteria: [...formData.eligibility_criteria, newEligibility.trim()],
      });
      setNewEligibility('');
    }
  };

  const removeEligibilityCriteria = (index: number) => {
    setFormData({
      ...formData,
      eligibility_criteria: formData.eligibility_criteria.filter((_, i) => i !== index),
    });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Scholarship Management</h2>
        <p className="text-sm text-slate-600">Add and manage scholarship opportunities</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#04ADEE] hover:bg-[#0396d5] text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Scholarship'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Success</p>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Scholarship' : 'New Scholarship'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Scholarship Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Logo URL
                  </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
              </div>
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
                  Award Amount *
                </label>
                <input
                  type="text"
                  value={formData.award_amount}
                  onChange={(e) => setFormData({ ...formData, award_amount: e.target.value })}
                  required
                  placeholder="e.g., $5,000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Eligibility Criteria *
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEligibility}
                    onChange={(e) => setNewEligibility(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addEligibilityCriteria();
                      }
                    }}
                    placeholder="Add eligibility criteria..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addEligibilityCriteria}
                    className="px-4 py-2 bg-[#04ADEE] hover:bg-[#0396d5] text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.eligibility_criteria.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {formData.eligibility_criteria.map((criteria, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-lg"
                      >
                        <span className="text-sm text-slate-700">{criteria}</span>
                        <button
                          type="button"
                          onClick={() => removeEligibilityCriteria(index)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {formData.eligibility_criteria.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No eligibility criteria added yet</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Requirements *
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRequirement();
                      }
                    }}
                    placeholder="Add requirement..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="px-4 py-2 bg-[#04ADEE] hover:bg-[#0396d5] text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.requirements.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {formData.requirements.map((requirement, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-lg"
                      >
                        <span className="text-sm text-slate-700">{requirement}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {formData.requirements.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No requirements added yet</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Application Link *
              </label>
              <input
                type="url"
                value={formData.application_link}
                onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                required
                placeholder="https://..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#04ADEE] hover:bg-[#0396d5] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editingId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{editingId ? 'Update' : 'Create'} Scholarship</>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-6 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="mt-4 text-slate-600">Loading scholarships...</p>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">No scholarships yet</p>
          <p className="text-slate-500 text-sm mt-2">Create your first scholarship to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scholarships.map((scholarship) => (
            <div
              key={scholarship.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-300 relative"
            >
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleEdit(scholarship)}
                  className="p-2 hover:bg-[#04ADEE]/10 text-[#04ADEE] rounded-lg transition-colors"
                  title="Edit scholarship"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(scholarship.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  title="Delete scholarship"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-4 pr-20">
                {scholarship.logo_url && (
                  <img
                    src={scholarship.logo_url}
                    alt={scholarship.name}
                    className="w-16 h-16 object-contain rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{scholarship.name}</h3>
                  <p className="text-slate-700 text-sm">{scholarship.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-[#04ADEE] bg-opacity-10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[#04ADEE] mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-900">{scholarship.award_amount}</div>
                  <div className="text-sm text-slate-600">Award Amount</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                  <div className="text-sm font-bold text-slate-900">
                    {new Date(scholarship.deadline).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-slate-600">Deadline</div>
                </div>
              </div>

              {(Array.isArray(scholarship.eligibility_criteria) && scholarship.eligibility_criteria.length > 0) && (
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Eligibility Criteria:</h4>
                  <ul className="space-y-1">
                    {scholarship.eligibility_criteria.map((criteria, idx) => (
                      <li key={idx} className="flex items-center text-sm text-slate-700">
                        <div className="w-2 h-2 bg-[#04ADEE] rounded-full mr-2 flex-shrink-0"></div>
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(Array.isArray(scholarship.requirements) && scholarship.requirements.length > 0) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.requirements.map((requirement, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full">
                        {requirement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <a
                  href={scholarship.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-[#04ADEE] text-white px-4 py-2 rounded-lg hover:bg-[#0396d5] transition-colors text-sm font-medium w-full"
                >
                  Learn More & Apply
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
