import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { getPoolWeightings, savePoolWeightings, PoolWeightings } from '../services/poolWeightingsService';

interface WeightingModalProps {
  counselorName: string;
  onClose: () => void;
  onSave: () => void;
}

export default function WeightingModal({ counselorName, onClose, onSave }: WeightingModalProps) {
  const [essayWeight, setEssayWeight] = useState(40);
  const [currentAverageWeight, setCurrentAverageWeight] = useState(50);
  const [pastAverageWeight, setPastAverageWeight] = useState(10);

  const [excellentMin, setExcellentMin] = useState(90);
  const [excellentMax, setExcellentMax] = useState(100);

  const [strongMin, setStrongMin] = useState(80);
  const [strongMax, setStrongMax] = useState(89);

  const [competitiveMin, setCompetitiveMin] = useState(70);
  const [competitiveMax, setCompetitiveMax] = useState(79);

  const [developingMin, setDevelopingMin] = useState(0);
  const [developingMax, setDevelopingMax] = useState(69);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeightings = async () => {
      try {
        setIsLoading(true);
        const weightings = await getPoolWeightings(counselorName);

        if (weightings) {
          setEssayWeight(weightings.essayWeight);
          setCurrentAverageWeight(weightings.currentAverageWeight);
          setPastAverageWeight(weightings.pastAverageWeight);

          setExcellentMin(weightings.excellentMin);
          setExcellentMax(weightings.excellentMax);
          setStrongMin(weightings.strongMin);
          setStrongMax(weightings.strongMax);
          setCompetitiveMin(weightings.competitiveMin);
          setCompetitiveMax(weightings.competitiveMax);
          setDevelopingMin(weightings.developingMin);
          setDevelopingMax(weightings.developingMax);
        }
      } catch (err) {
        console.error('Error loading weightings:', err);
        setError('Failed to load weightings');
      } finally {
        setIsLoading(false);
      }
    };

    loadWeightings();
  }, [counselorName]);

  const totalWeight = essayWeight + currentAverageWeight + pastAverageWeight;
  const isWeightValid = totalWeight === 100;

  const handleSave = async () => {
    if (!isWeightValid) {
      setError('Weights must add up to 100%');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const weightings: PoolWeightings = {
        essayWeight,
        currentAverageWeight,
        pastAverageWeight,
        excellentMin,
        excellentMax,
        strongMin,
        strongMax,
        competitiveMin,
        competitiveMax,
        developingMin,
        developingMax
      };

      await savePoolWeightings(counselorName, weightings);
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving weightings:', err);
      setError('Failed to save weightings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#04ADEE] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading weightings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pool Weighting Settings</h2>
            <p className="text-sm text-slate-600 mt-1">Configure composite score calculation and ranges</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Composite Score Weights</h3>
            <p className="text-sm text-slate-600 mb-4">
              Set the weight for each component. Total must equal 100%.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-900">Essays and Activities</label>
                  <span className="text-lg font-bold text-[#04ADEE]">{essayWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={essayWeight}
                  onChange={(e) => setEssayWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#04ADEE]"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-900">Current Average</label>
                  <span className="text-lg font-bold text-[#04ADEE]">{currentAverageWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentAverageWeight}
                  onChange={(e) => setCurrentAverageWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#04ADEE]"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-900">Past Overall Average</label>
                  <span className="text-lg font-bold text-[#04ADEE]">{pastAverageWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pastAverageWeight}
                  onChange={(e) => setPastAverageWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#04ADEE]"
                />
              </div>

              <div className={`mt-4 p-4 rounded-lg border-2 ${
                isWeightValid
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-amber-50 border-amber-500'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Total Weight</span>
                  <span className={`text-2xl font-bold ${
                    isWeightValid ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {totalWeight}%
                  </span>
                </div>
                {!isWeightValid && (
                  <p className="text-xs text-amber-700 mt-1">
                    Weights must add up to exactly 100%
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Competitiveness Ranges</h3>
            <p className="text-sm text-slate-600 mb-4">
              Define the composite score ranges for each competitiveness level.
            </p>

            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <label className="text-sm font-semibold text-emerald-900 mb-3 block">Excellent</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-emerald-700 mb-1 block">Minimum</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={excellentMin}
                      onChange={(e) => setExcellentMin(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-emerald-700 mb-1 block">Maximum</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={excellentMax}
                      onChange={(e) => setExcellentMax(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="text-sm font-semibold text-blue-900 mb-3 block">Strong</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-blue-700 mb-1 block">Minimum</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={strongMin}
                      onChange={(e) => setStrongMin(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 mb-1 block">Maximum</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={strongMax}
                      onChange={(e) => setStrongMax(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <label className="text-sm font-semibold text-amber-900 mb-3 block">Competitive</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-amber-700 mb-1 block">Minimum</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={competitiveMin}
                      onChange={(e) => setCompetitiveMin(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-amber-700 mb-1 block">Maximum</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={competitiveMax}
                      onChange={(e) => setCompetitiveMax(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <label className="text-sm font-semibold text-slate-900 mb-3 block">Developing</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-700 mb-1 block">Minimum</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={developingMin}
                      onChange={(e) => setDevelopingMin(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 mb-1 block">Maximum</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={developingMax}
                      onChange={(e) => setDevelopingMax(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isWeightValid || isSaving}
              className="flex-1 px-4 py-3 bg-[#04ADEE] hover:bg-[#0396d5] text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
