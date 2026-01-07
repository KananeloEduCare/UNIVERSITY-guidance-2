import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Save, CheckCircle } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, onValue, set } from 'firebase/database';

interface RubricItem {
  id: string;
  name: string;
  description: string;
}

interface RubricManagerProps {
  counselorName: string;
  onClose: () => void;
}

const RubricManager: React.FC<RubricManagerProps> = ({ counselorName, onClose }) => {
  const [rubricItems, setRubricItems] = useState<RubricItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    loadRubricItems();
  }, [counselorName]);

  const loadRubricItems = async () => {
    try {
      setLoading(true);
      const rubricRef = ref(database, `University Data/${counselorName}/grading_rubric`);

      onValue(rubricRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const items: RubricItem[] = Object.keys(data).map(key => ({
            id: key,
            name: data[key].name,
            description: data[key].description
          }));
          setRubricItems(items);
        } else {
          setRubricItems([]);
        }
        setLoading(false);
      }, { onlyOnce: true });
    } catch (error) {
      console.error('Error loading rubric items:', error);
      setLoading(false);
    }
  };

  const showSuccessNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemDescription.trim()) {
      setNotificationMessage('Please enter both a name and description');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    const newItem: RubricItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      description: newItemDescription.trim()
    };

    setRubricItems([...rubricItems, newItem]);
    setNewItemName('');
    setNewItemDescription('');
  };

  const handleEditItem = (item: RubricItem) => {
    setEditingItem(item.id);
    setEditName(item.name);
    setEditDescription(item.description);
  };

  const handleSaveEdit = (itemId: string) => {
    if (!editName.trim() || !editDescription.trim()) {
      setNotificationMessage('Please enter both a name and description');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    setRubricItems(rubricItems.map(item =>
      item.id === itemId
        ? { ...item, name: editName.trim(), description: editDescription.trim() }
        : item
    ));
    setEditingItem(null);
    setEditName('');
    setEditDescription('');
  };

  const handleDeleteItem = (itemId: string) => {
    setRubricItems(rubricItems.filter(item => item.id !== itemId));
  };

  const handleSaveToFirebase = async () => {
    try {
      setSaving(true);
      const rubricRef = ref(database, `University Data/${counselorName}/grading_rubric`);

      const rubricData: { [key: string]: { name: string; description: string } } = {};
      rubricItems.forEach(item => {
        rubricData[item.id] = {
          name: item.name,
          description: item.description
        };
      });

      await set(rubricRef, rubricData);
      showSuccessNotification('Rubric saved successfully!');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving rubric:', error);
      setNotificationMessage('Failed to save rubric. Please try again.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04ADEE] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {showNotification && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-4 flex items-center gap-3 min-w-[300px]">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-slate-900">{notificationMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Essay Grading Rubric</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <p className="text-sm text-slate-600 mb-4">
              Define the criteria you'll use to evaluate essays. Each criterion will be rated on a scale of 1-5 during the review process.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Add New Criterion</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Criterion Name (e.g., "Clarity", "Structure", "Grammar")
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter criterion name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Description (What you're looking for in this criterion)
                  </label>
                  <textarea
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    placeholder="Describe what this criterion evaluates..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-sm resize-none"
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleAddItem}
                  disabled={!newItemName.trim() || !newItemDescription.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#04ADEE] text-white px-4 py-2 rounded-lg hover:bg-[#0396d5] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Criterion
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Current Rubric ({rubricItems.length} {rubricItems.length === 1 ? 'criterion' : 'criteria'})
            </h3>

            {rubricItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-slate-500 text-sm">No rubric criteria yet. Add your first criterion above.</p>
              </div>
            ) : (
              rubricItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {editingItem === item.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Criterion Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-sm resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(null);
                            setEditName('');
                            setEditDescription('');
                          }}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <GripVertical className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-[#04ADEE] text-white text-xs font-bold rounded-full">
                              {index + 1}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-[#04ADEE] hover:bg-slate-50 rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                        <div className="mt-3 flex items-center gap-1">
                          <span className="text-xs font-medium text-slate-500">Rating Scale:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <span
                                key={num}
                                className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-600 text-xs font-semibold rounded border border-slate-200"
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <button
            onClick={handleSaveToFirebase}
            disabled={saving}
            className="w-full px-4 py-2 bg-[#04ADEE] text-white rounded-lg hover:bg-[#0396d5] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RubricManager;
