import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, GripVertical, Save, X } from 'lucide-react';
import { rubricService, Rubric, RubricCriterion } from '../services/rubricService';
import { userStorage } from '../services/userStorage';

interface RubricManagementProps {
  onClose: () => void;
  onSelectRubric?: (rubricId: string) => void;
}

const RubricManagement: React.FC<RubricManagementProps> = ({ onClose, onSelectRubric }) => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRubric, setEditingRubric] = useState(false);
  const [rubricName, setRubricName] = useState('');
  const [rubricDescription, setRubricDescription] = useState('');
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [criterionName, setCriterionName] = useState('');
  const [criterionDescription, setCriterionDescription] = useState('');
  const [showNewCriterionForm, setShowNewCriterionForm] = useState(false);

  const currentUser = userStorage.getStoredUser();
  const counselorId = currentUser?.id || 'demo-counselor-id';

  useEffect(() => {
    loadRubrics();
  }, []);

  const loadRubrics = async () => {
    try {
      const data = await rubricService.getRubrics();
      setRubrics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading rubrics:', error);
      setLoading(false);
    }
  };

  const loadCriteria = async (rubricId: string) => {
    try {
      const data = await rubricService.getCriteria(rubricId);
      setCriteria(data);
    } catch (error) {
      console.error('Error loading criteria:', error);
    }
  };

  const handleCreateRubric = async () => {
    if (!rubricName.trim()) return;

    try {
      const newRubric = await rubricService.createRubric(
        counselorId,
        rubricName.trim(),
        rubricDescription.trim() || null
      );
      setRubrics([newRubric, ...rubrics]);
      setRubricName('');
      setRubricDescription('');
      setEditingRubric(false);
      setSelectedRubric(newRubric);
      setCriteria([]);
    } catch (error) {
      console.error('Error creating rubric:', error);
    }
  };

  const handleUpdateRubric = async () => {
    if (!selectedRubric || !rubricName.trim()) return;

    try {
      const updated = await rubricService.updateRubric(selectedRubric.id, {
        name: rubricName.trim(),
        description: rubricDescription.trim() || null,
      });
      setRubrics(rubrics.map(r => r.id === updated.id ? updated : r));
      setSelectedRubric(updated);
      setEditingRubric(false);
    } catch (error) {
      console.error('Error updating rubric:', error);
    }
  };

  const handleDeleteRubric = async (rubricId: string) => {
    if (!confirm('Are you sure you want to delete this rubric? This cannot be undone.')) return;

    try {
      await rubricService.deleteRubric(rubricId);
      setRubrics(rubrics.filter(r => r.id !== rubricId));
      if (selectedRubric?.id === rubricId) {
        setSelectedRubric(null);
        setCriteria([]);
      }
    } catch (error) {
      console.error('Error deleting rubric:', error);
    }
  };

  const handleSelectRubric = async (rubric: Rubric) => {
    setSelectedRubric(rubric);
    await loadCriteria(rubric.id);
    setEditingRubric(false);
  };

  const handleEditRubric = () => {
    if (selectedRubric) {
      setRubricName(selectedRubric.name);
      setRubricDescription(selectedRubric.description || '');
      setEditingRubric(true);
    }
  };

  const handleCreateCriterion = async () => {
    if (!selectedRubric || !criterionName.trim()) return;

    try {
      const newCriterion = await rubricService.createCriterion(
        selectedRubric.id,
        criterionName.trim(),
        criterionDescription.trim() || null,
        criteria.length
      );
      setCriteria([...criteria, newCriterion]);
      setCriterionName('');
      setCriterionDescription('');
      setShowNewCriterionForm(false);
    } catch (error) {
      console.error('Error creating criterion:', error);
    }
  };

  const handleUpdateCriterion = async (criterionId: string) => {
    if (!criterionName.trim()) return;

    try {
      const updated = await rubricService.updateCriterion(criterionId, {
        name: criterionName.trim(),
        description: criterionDescription.trim() || null,
      });
      setCriteria(criteria.map(c => c.id === updated.id ? updated : c));
      setEditingCriterionId(null);
      setCriterionName('');
      setCriterionDescription('');
    } catch (error) {
      console.error('Error updating criterion:', error);
    }
  };

  const handleDeleteCriterion = async (criterionId: string) => {
    if (!confirm('Are you sure you want to delete this criterion?')) return;

    try {
      await rubricService.deleteCriterion(criterionId);
      setCriteria(criteria.filter(c => c.id !== criterionId));
    } catch (error) {
      console.error('Error deleting criterion:', error);
    }
  };

  const startEditingCriterion = (criterion: RubricCriterion) => {
    setEditingCriterionId(criterion.id);
    setCriterionName(criterion.name);
    setCriterionDescription(criterion.description || '');
  };

  const cancelEditingCriterion = () => {
    setEditingCriterionId(null);
    setCriterionName('');
    setCriterionDescription('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>
          <h2 className="text-xl font-bold text-slate-900">My Rubrics</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={() => {
              setSelectedRubric(null);
              setCriteria([]);
              setRubricName('');
              setRubricDescription('');
              setEditingRubric(true);
            }}
            className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Rubric
          </button>

          <div className="space-y-2">
            {rubrics.map(rubric => (
              <div
                key={rubric.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedRubric?.id === rubric.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => handleSelectRubric(rubric)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{rubric.name}</h3>
                    {rubric.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{rubric.description}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRubric(rubric.id);
                    }}
                    className="ml-2 p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {editingRubric ? (
          <div className="p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {selectedRubric ? 'Edit Rubric' : 'Create New Rubric'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rubric Name
                </label>
                <input
                  type="text"
                  value={rubricName}
                  onChange={(e) => setRubricName(e.target.value)}
                  placeholder="e.g., College Essay Rubric"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={rubricDescription}
                  onChange={(e) => setRubricDescription(e.target.value)}
                  placeholder="Describe when to use this rubric..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={selectedRubric ? handleUpdateRubric : handleCreateRubric}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {selectedRubric ? 'Save Changes' : 'Create Rubric'}
                </button>
                <button
                  onClick={() => setEditingRubric(false)}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : selectedRubric ? (
          <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">{selectedRubric.name}</h2>
                {selectedRubric.description && (
                  <p className="text-slate-600 mt-2">{selectedRubric.description}</p>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={handleEditRubric}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                {onSelectRubric && (
                  <button
                    onClick={() => onSelectRubric(selectedRubric.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Use This Rubric
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Criteria</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Define the criteria used to evaluate essays with this rubric
                </p>
              </div>

              <div className="divide-y divide-slate-200">
                {criteria.map((criterion, index) => (
                  <div key={criterion.id} className="p-6">
                    {editingCriterionId === criterion.id ? (
                      <div className="space-y-4">
                        <div>
                          <input
                            type="text"
                            value={criterionName}
                            onChange={(e) => setCriterionName(e.target.value)}
                            placeholder="Criterion name"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <textarea
                            value={criterionDescription}
                            onChange={(e) => setCriterionDescription(e.target.value)}
                            placeholder="What do you look for in this criterion? (Optional)"
                            rows={2}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateCriterion(criterion.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditingCriterion}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <div className="flex items-center mr-4">
                          <GripVertical className="w-5 h-5 text-slate-400" />
                          <span className="ml-2 text-sm font-medium text-slate-500">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{criterion.name}</h4>
                          {criterion.description && (
                            <p className="text-sm text-slate-600 mt-1">{criterion.description}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-2">Score: 1-5</p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => startEditingCriterion(criterion)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCriterion(criterion.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {showNewCriterionForm ? (
                  <div className="p-6 bg-slate-50">
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={criterionName}
                          onChange={(e) => setCriterionName(e.target.value)}
                          placeholder="Criterion name (e.g., Clarity)"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <textarea
                          value={criterionDescription}
                          onChange={(e) => setCriterionDescription(e.target.value)}
                          placeholder="What do you look for in this criterion? (Optional)"
                          rows={2}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCreateCriterion}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add Criterion
                        </button>
                        <button
                          onClick={() => {
                            setShowNewCriterionForm(false);
                            setCriterionName('');
                            setCriterionDescription('');
                          }}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <button
                      onClick={() => setShowNewCriterionForm(true)}
                      className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Criterion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Select a rubric or create a new one to get started
          </div>
        )}
      </div>
    </div>
  );
};

export default RubricManagement;
