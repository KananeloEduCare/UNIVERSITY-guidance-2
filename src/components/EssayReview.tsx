import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, BookOpen, ChevronDown, ChevronUp, Check, Save, Star } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { userStorage } from '../services/userStorage';
import { rubricService, Rubric, RubricCriterion, EssayReview as EssayReviewType, CriterionFeedback } from '../services/rubricService';
import RubricManagement from './RubricManagement';

interface Essay {
  id: string;
  student_name: string;
  essay_type: 'personal_statement' | 'supplement' | 'activity_list';
  essay_title: string;
  essay_content: string;
  university_name: string | null;
  submission_date: string;
  status: 'draft' | 'submitted' | 'reviewed';
  font_family: string;
  font_size: number;
}

const EssayReview: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_review' | 'reviewed'>('all');

  const [showRubricManagement, setShowRubricManagement] = useState(false);
  const [currentReview, setCurrentReview] = useState<EssayReviewType | null>(null);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);
  const [feedbackList, setFeedbackList] = useState<CriterionFeedback[]>([]);
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());

  const [overallAssessment, setOverallAssessment] = useState('');
  const [revisionPriorities, setRevisionPriorities] = useState<string[]>(['', '', '']);

  const [editingFeedback, setEditingFeedback] = useState<{
    [key: string]: {
      score: number | null;
      explanation: string;
      guidance: string;
      reference: string;
    };
  }>({});

  const currentUser = userStorage.getStoredUser();
  const counselorName = currentUser?.name || 'University Counselor';
  const counselorId = currentUser?.id || 'demo-counselor-id';

  useEffect(() => {
    const essaysRef = ref(database, 'University Data/Essays');

    const unsubscribe = onValue(essaysRef, (snapshot) => {
      if (!snapshot.exists()) {
        setEssays([]);
        setLoading(false);
        return;
      }

      const essaysData: Essay[] = [];
      const data = snapshot.val();

      Object.keys(data).forEach((studentName) => {
        const studentEssays = data[studentName];

        Object.keys(studentEssays).forEach((essayTitle) => {
          const essayData = studentEssays[essayTitle];

          if (essayData.status === 'submitted' || essayData.status === 'reviewed') {
            essaysData.push({
              id: `${studentName}___${essayTitle}`,
              student_name: studentName,
              essay_type: essayData.essayType || 'personal_statement',
              essay_title: essayTitle,
              essay_content: essayData.essayText || '',
              university_name: essayData.universityName || null,
              submission_date: essayData.submittedAt || essayData.lastModified || new Date().toISOString().split('T')[0],
              status: essayData.status || 'submitted',
              font_family: essayData.fontFamily || 'Arial',
              font_size: essayData.fontSize || 14
            });
          }
        });
      });

      essaysData.sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime());
      setEssays(essaysData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedEssay) {
      loadReview();
    }
  }, [selectedEssay?.id]);

  const loadReview = async () => {
    if (!selectedEssay) return;

    try {
      const review = await rubricService.getReview(selectedEssay.student_name, selectedEssay.essay_title);

      if (review) {
        setCurrentReview(review);
        const rubric = await rubricService.getRubricById(review.rubric_id);
        if (rubric) {
          setSelectedRubric(rubric);
          const criteriaData = await rubricService.getCriteria(rubric.id);
          setCriteria(criteriaData);
          const feedbackData = await rubricService.getCriterionFeedback(review.id);
          setFeedbackList(feedbackData);

          setOverallAssessment(review.overall_assessment || '');
          setRevisionPriorities(review.revision_priorities || ['', '', '']);

          const editData: typeof editingFeedback = {};
          feedbackData.forEach(feedback => {
            editData[feedback.criterion_id] = {
              score: feedback.score,
              explanation: feedback.score_explanation || '',
              guidance: feedback.improvement_guidance || '',
              reference: feedback.reference_section || 'entire_essay'
            };
          });
          setEditingFeedback(editData);
        }
      } else {
        setCurrentReview(null);
        setSelectedRubric(null);
        setCriteria([]);
        setFeedbackList([]);
      }
    } catch (error) {
      console.error('Error loading review:', error);
    }
  };

  const handleSelectRubricForReview = async (rubricId: string) => {
    if (!selectedEssay) return;

    try {
      const review = await rubricService.createReview(
        selectedEssay.student_name,
        selectedEssay.essay_title,
        rubricId,
        counselorId
      );

      setShowRubricManagement(false);
      await loadReview();
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const handleEssayClick = (essayId: string) => {
    const essay = essays.find(e => e.id === essayId);
    if (essay) {
      setSelectedEssay(essay);
      setExpandedCriteria(new Set());
    }
  };

  const toggleCriterion = (criterionId: string) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(criterionId)) {
      newExpanded.delete(criterionId);
    } else {
      newExpanded.add(criterionId);
    }
    setExpandedCriteria(newExpanded);
  };

  const updateFeedbackField = (criterionId: string, field: string, value: any) => {
    setEditingFeedback(prev => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        [field]: value
      }
    }));
  };

  const saveCriterionFeedback = async (criterionId: string) => {
    if (!currentReview) return;

    const feedback = feedbackList.find(f => f.criterion_id === criterionId);
    const editData = editingFeedback[criterionId];

    if (!feedback || !editData) return;

    try {
      const isComplete = editData.score !== null && editData.explanation && editData.guidance;

      await rubricService.updateCriterionFeedback(feedback.id, {
        score: editData.score,
        score_explanation: editData.explanation,
        improvement_guidance: editData.guidance,
        reference_section: editData.reference,
        status: isComplete ? 'completed' : 'in_progress'
      });

      await loadReview();
    } catch (error) {
      console.error('Error saving criterion feedback:', error);
    }
  };

  const saveOverallFeedback = async () => {
    if (!currentReview) return;

    try {
      const allComplete = feedbackList.every(f => {
        const editData = editingFeedback[f.criterion_id];
        return editData && editData.score !== null && editData.explanation && editData.guidance;
      });

      await rubricService.updateReview(currentReview.id, {
        overall_assessment: overallAssessment,
        revision_priorities: revisionPriorities.filter(p => p.trim()),
        status: allComplete && overallAssessment ? 'completed' : 'in_progress'
      });

      await loadReview();
    } catch (error) {
      console.error('Error saving overall feedback:', error);
    }
  };

  const completeReview = async () => {
    if (!currentReview) return;

    const allComplete = feedbackList.every(f => {
      const editData = editingFeedback[f.criterion_id];
      return editData && editData.score !== null && editData.explanation && editData.guidance;
    });

    if (!allComplete) {
      alert('Please complete all criterion feedback before finishing the review.');
      return;
    }

    if (!overallAssessment.trim()) {
      alert('Please provide an overall assessment before finishing the review.');
      return;
    }

    try {
      await rubricService.updateReview(currentReview.id, {
        status: 'completed'
      });

      await loadReview();
      alert('Review completed successfully!');
    } catch (error) {
      console.error('Error completing review:', error);
    }
  };

  const renderEssayContent = () => {
    if (!selectedEssay) return null;

    const content = selectedEssay.essay_content;
    const paragraphs = content.split(/<\/p>|<br\s*\/?>/i).filter(p => p.trim());

    return (
      <div
        className="prose max-w-none"
        style={{
          fontFamily: selectedEssay.font_family,
          fontSize: `${selectedEssay.font_size}px`
        }}
      >
        {paragraphs.map((paragraph, index) => {
          const cleanParagraph = paragraph.replace(/<[^>]*>/g, '').trim();
          if (!cleanParagraph) return null;

          return (
            <div key={index} className="mb-4 relative group">
              <span className="absolute -left-8 top-0 text-xs text-slate-400 opacity-0 group-hover:opacity-100">
                {index + 1}
              </span>
              <p>{cleanParagraph}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const filteredEssays = essays.filter(essay => {
    if (filter === 'all') return true;
    if (filter === 'pending') return essay.status === 'submitted';
    if (filter === 'reviewed') return essay.status === 'reviewed';
    return true;
  });

  if (showRubricManagement) {
    return (
      <RubricManagement
        onClose={() => setShowRubricManagement(false)}
        onSelectRubric={handleSelectRubricForReview}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedEssay) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Essay Review</h1>
          <p className="text-slate-600 mt-2">Review submitted essays using structured rubrics</p>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
            }`}
          >
            All Essays
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'reviewed' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
            }`}
          >
            Reviewed
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEssays.map(essay => (
            <div
              key={essay.id}
              onClick={() => handleEssayClick(essay.id)}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    essay.status === 'reviewed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {essay.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{essay.essay_title}</h3>
              <p className="text-sm text-slate-600 mb-1">{essay.student_name}</p>
              {essay.university_name && (
                <p className="text-sm text-slate-500 mb-2">{essay.university_name}</p>
              )}
              <p className="text-xs text-slate-400">Submitted: {essay.submission_date}</p>
            </div>
          ))}
        </div>

        {filteredEssays.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No essays found
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedEssay(null)}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Essays
          </button>

          <div className="bg-white rounded-lg border border-slate-200 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedEssay.essay_title}</h2>
                <p className="text-slate-600 mt-1">{selectedEssay.student_name}</p>
                {selectedEssay.university_name && (
                  <p className="text-slate-500 text-sm mt-1">{selectedEssay.university_name}</p>
                )}
              </div>
              {!currentReview && (
                <button
                  onClick={() => setShowRubricManagement(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Select Rubric
                </button>
              )}
            </div>

            {renderEssayContent()}
          </div>
        </div>
      </div>

      {currentReview && selectedRubric && (
        <div className="w-[500px] bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">{selectedRubric.name}</h3>
            {selectedRubric.description && (
              <p className="text-sm text-slate-600 mt-1">{selectedRubric.description}</p>
            )}
            <div className="mt-3 text-xs text-slate-500">
              Status: {currentReview.status === 'completed' ? 'Completed' : 'In Progress'}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {criteria.map(criterion => {
                const feedback = feedbackList.find(f => f.criterion_id === criterion.id);
                const editData = editingFeedback[criterion.id] || {
                  score: null,
                  explanation: '',
                  guidance: '',
                  reference: 'entire_essay'
                };
                const isExpanded = expandedCriteria.has(criterion.id);
                const isComplete = editData.score !== null && editData.explanation && editData.guidance;

                return (
                  <div key={criterion.id} className="border border-slate-200 rounded-lg">
                    <button
                      onClick={() => toggleCriterion(criterion.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {isComplete && <Check className="w-5 h-5 text-green-600" />}
                        <div className="text-left">
                          <div className="font-semibold text-slate-900">{criterion.name}</div>
                          {editData.score !== null && (
                            <div className="flex items-center mt-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i <= editData.score! ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-slate-200 space-y-4">
                        {criterion.description && (
                          <p className="text-sm text-slate-600 italic">{criterion.description}</p>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Score (1-5)
                          </label>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map(score => (
                              <button
                                key={score}
                                onClick={() => updateFeedbackField(criterion.id, 'score', score)}
                                className={`w-12 h-12 rounded-lg border-2 transition-all ${
                                  editData.score === score
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                    : 'border-slate-300 hover:border-blue-300'
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Why this score? (Required)
                          </label>
                          <textarea
                            value={editData.explanation}
                            onChange={(e) => updateFeedbackField(criterion.id, 'explanation', e.target.value)}
                            placeholder="Explain what the essay does well and what prevents a higher score..."
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            How to improve? (Required)
                          </label>
                          <textarea
                            value={editData.guidance}
                            onChange={(e) => updateFeedbackField(criterion.id, 'guidance', e.target.value)}
                            placeholder="Provide actionable steps to reach a higher score..."
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Reference (Optional)
                          </label>
                          <select
                            value={editData.reference}
                            onChange={(e) => updateFeedbackField(criterion.id, 'reference', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="entire_essay">Entire Essay</option>
                            <option value="introduction">Introduction</option>
                            <option value="conclusion">Conclusion</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                              <option key={i} value={`paragraph_${i}`}>Paragraph {i}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => saveCriterionFeedback(criterion.id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Feedback
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-slate-200 space-y-4">
              <h4 className="font-semibold text-slate-900">Overall Assessment</h4>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Overall Feedback
                </label>
                <textarea
                  value={overallAssessment}
                  onChange={(e) => setOverallAssessment(e.target.value)}
                  placeholder="Provide overall thoughts on the essay..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Top Revision Priorities (2-3)
                </label>
                {[0, 1, 2].map(index => (
                  <input
                    key={index}
                    type="text"
                    value={revisionPriorities[index]}
                    onChange={(e) => {
                      const newPriorities = [...revisionPriorities];
                      newPriorities[index] = e.target.value;
                      setRevisionPriorities(newPriorities);
                    }}
                    placeholder={`Priority ${index + 1}`}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-2"
                  />
                ))}
              </div>

              <button
                onClick={saveOverallFeedback}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Overall Feedback
              </button>

              <button
                onClick={completeReview}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EssayReview;
