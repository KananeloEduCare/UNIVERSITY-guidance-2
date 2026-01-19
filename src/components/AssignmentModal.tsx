import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Sparkles, Infinity } from 'lucide-react';
import { PoolStudent, poolStudentsService } from '../services/poolStudentsService';

interface AssignmentModalProps {
  student: PoolStudent;
  counselorId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface University {
  name: string;
  tier: 'reach' | 'mid' | 'safety';
}

const SUGGESTED_UNIVERSITIES = {
  reach: [
    'Harvard University', 'Stanford University', 'MIT', 'Yale University',
    'Princeton University', 'Columbia University', 'Duke University',
    'University of Pennsylvania', 'Cornell University', 'Brown University'
  ],
  mid: [
    'University of Michigan', 'Boston University', 'Northwestern University',
    'University of Virginia', 'University of North Carolina', 'NYU',
    'University of California Berkeley', 'UCLA', 'USC', 'Georgetown University'
  ],
  safety: [
    'Penn State University', 'Ohio State University', 'Michigan State University',
    'University of Maryland', 'Rutgers University', 'Purdue University',
    'University of Wisconsin Madison', 'University of Florida', 'Arizona State University'
  ]
};

export default function AssignmentModal({ student, counselorId, onClose, onComplete }: AssignmentModalProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [currentTier, setCurrentTier] = useState<'reach' | 'mid' | 'safety'>('mid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [universityLimit, setUniversityLimit] = useState<number>(5);
  const [isUnlimited, setIsUnlimited] = useState(false);

  const handleAdd = () => {
    if (!currentName.trim()) {
      setError('Please enter a university name');
      return;
    }

    if (!isUnlimited && universities.length >= universityLimit) {
      setError(`Maximum ${universityLimit} universities allowed`);
      return;
    }

    if (universities.some(u => u.name.toLowerCase() === currentName.toLowerCase())) {
      setError('This university is already in the list');
      return;
    }

    setUniversities([...universities, { name: currentName.trim(), tier: currentTier }]);
    setCurrentName('');
    setError('');
  };

  const handleRemove = (index: number) => {
    setUniversities(universities.filter((_, i) => i !== index));
    setError('');
  };

  const handleQuickAdd = (name: string, tier: 'reach' | 'mid' | 'safety') => {
    if (!isUnlimited && universities.length >= universityLimit) {
      setError(`Maximum ${universityLimit} universities allowed`);
      return;
    }

    if (universities.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      setError('This university is already in the list');
      return;
    }

    setUniversities([...universities, { name, tier }]);
    setError('');
  };

  const handleSubmit = async () => {
    if (universities.length === 0) {
      setError('Please add at least one university');
      return;
    }

    if (!isUnlimited && universities.length !== universityLimit) {
      setError(`Please assign exactly ${universityLimit} universities`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await poolStudentsService.assignUniversities(student.name, universities);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign universities');
      setIsSubmitting(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'reach': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'mid': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'safety': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Assign Universities</h2>
              <p className="text-sm text-slate-600 mt-1">{student.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Composite</p>
              <p className="text-lg font-bold text-slate-900">{student.composite_score.toFixed(1)}%</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">Current Average</p>
              <p className="text-lg font-bold text-blue-700">{student.academic_performance.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 mb-1">Essays & Activities</p>
              <p className="text-lg font-bold text-purple-700">{student.essay_activities_rating.toFixed(1)}%</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-600 mb-1">Previous Average</p>
              <p className="text-lg font-bold text-amber-700">
                {((student.academic_performance || 0) - (student.academic_trend || 0)).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 p-4 bg-[#04ADEE]/10 rounded-lg border border-[#04ADEE]/30">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#04ADEE] mb-2">
                University Limit
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={universityLimit}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setUniversityLimit(Math.max(1, Math.min(20, val)));
                  }}
                  disabled={isUnlimited}
                  className="w-24 px-3 py-2 border border-[#04ADEE]/30 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent disabled:opacity-50 disabled:bg-slate-100"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUnlimited}
                    onChange={(e) => setIsUnlimited(e.target.checked)}
                    className="w-4 h-4 text-[#04ADEE] border-[#04ADEE]/30 rounded focus:ring-[#04ADEE]"
                  />
                  <span className="text-sm text-[#04ADEE] font-medium flex items-center gap-1">
                    <Infinity className="w-4 h-4" />
                    Unlimited
                  </span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#04ADEE] font-medium">
                  {isUnlimited ? 'Add universities (no limit)' : `Assign exactly ${universityLimit} universities`}
                </p>
                <p className="text-xs text-[#04ADEE]/80 mt-1">
                  Progress: {universities.length}{isUnlimited ? '' : `/${universityLimit}`} universities added
                </p>
              </div>
              {!isUnlimited && (
                <div className="flex items-center gap-2 text-xs text-[#04ADEE]">
                  <div className="w-12 h-2 bg-[#04ADEE]/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#04ADEE] transition-all"
                      style={{ width: `${(universities.length / universityLimit) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Add University
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="University name"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                disabled={!isUnlimited && universities.length >= universityLimit}
              />
              <select
                value={currentTier}
                onChange={(e) => setCurrentTier(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent bg-white"
                disabled={!isUnlimited && universities.length >= universityLimit}
              >
                <option value="reach">Reach</option>
                <option value="mid">Mid</option>
                <option value="safety">Safety</option>
              </select>
              <button
                onClick={handleAdd}
                disabled={!isUnlimited && universities.length >= universityLimit}
                className="px-4 py-2 bg-[#04ADEE] hover:bg-[#0396d5] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Selected Universities ({universities.length}{isUnlimited ? '' : `/${universityLimit}`})
            </h3>
            {universities.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                <p className="text-slate-500">No universities added yet</p>
                <p className="text-sm text-slate-400 mt-1">Add universities above or choose from suggestions below</p>
              </div>
            ) : (
              universities.map((uni, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-slate-500 font-medium">{index + 1}.</span>
                    <span className="font-medium text-slate-900">{uni.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTierColor(uni.tier)}`}>
                      {uni.tier.charAt(0).toUpperCase() + uni.tier.slice(1)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(index)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {(isUnlimited || universities.length < universityLimit) && showSuggestions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#04ADEE]" />
                  <h3 className="text-sm font-semibold text-slate-700">Quick Add Suggestions</h3>
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Hide
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-purple-700 mb-2">Reach Schools</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_UNIVERSITIES.reach.slice(0, 5).map((uni) => (
                      <button
                        key={uni}
                        onClick={() => handleQuickAdd(uni, 'reach')}
                        disabled={universities.some(u => u.name === uni)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + {uni}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-blue-700 mb-2">Mid-Tier Schools</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_UNIVERSITIES.mid.slice(0, 5).map((uni) => (
                      <button
                        key={uni}
                        onClick={() => handleQuickAdd(uni, 'mid')}
                        disabled={universities.some(u => u.name === uni)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + {uni}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-green-700 mb-2">Safety Schools</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_UNIVERSITIES.safety.slice(0, 5).map((uni) => (
                      <button
                        key={uni}
                        onClick={() => handleQuickAdd(uni, 'safety')}
                        disabled={universities.some(u => u.name === uni)}
                        className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + {uni}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showSuggestions && (isUnlimited || universities.length < universityLimit) && (
            <button
              onClick={() => setShowSuggestions(true)}
              className="w-full py-2 text-sm text-[#04ADEE] hover:text-[#0396d5] font-medium"
            >
              Show Suggestions
            </button>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || universities.length === 0 || (!isUnlimited && universities.length !== universityLimit)}
            className="px-6 py-2 bg-[#04ADEE] hover:bg-[#0396d5] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Assigning...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Complete Assignment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
