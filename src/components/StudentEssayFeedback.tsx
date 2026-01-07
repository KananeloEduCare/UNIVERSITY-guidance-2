import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, FileText, AlertCircle } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { rubricService, Rubric, RubricCriterion, EssayReview, CriterionFeedback } from '../services/rubricService';
import { userStorage } from '../services/userStorage';

interface Essay {
  id: string;
  essay_type: 'personal_statement' | 'supplement' | 'activity_list';
  essay_title: string;
  essay_content: string;
  university_name: string | null;
  submission_date: string;
  status: 'draft' | 'submitted' | 'reviewed';
  font_family: string;
  font_size: number;
}

const StudentEssayFeedback: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [review, setReview] = useState<EssayReview | null>(null);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);
  const [feedbackList, setFeedbackList] = useState<CriterionFeedback[]>([]);

  const currentUser = userStorage.getStoredUser();
  const studentName = currentUser?.name || 'Demo Student';

  useEffect(() => {
    const essaysRef = ref(database, `University Data/Essays/${studentName}`);

    const unsubscribe = onValue(essaysRef, (snapshot) => {
      if (!snapshot.exists()) {
        setEssays([]);
        setLoading(false);
        return;
      }

      const essaysData: Essay[] = [];
      const data = snapshot.val();

      Object.keys(data).forEach((essayTitle) => {
        const essayData = data[essayTitle];

        essaysData.push({
          id: essayTitle,
          essay_type: essayData.essayType || 'personal_statement',
          essay_title: essayTitle,
          essay_content: essayData.essayText || '',
          university_name: essayData.universityName || null,
          submission_date: essayData.submittedAt || essayData.lastModified || new Date().toISOString().split('T')[0],
          status: essayData.status || 'draft',
          font_family: essayData.fontFamily || 'Arial',
          font_size: essayData.fontSize || 14
        });
      });

      essaysData.sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime());
      setEssays(essaysData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [studentName]);

  useEffect(() => {
    if (selectedEssay) {
      loadReview();
    }
  }, [selectedEssay?.id]);

  const loadReview = async () => {
    if (!selectedEssay) return;

    try {
      const reviewData = await rubricService.getReview(studentName, selectedEssay.essay_title);

      if (reviewData && reviewData.status === 'completed') {
        setReview(reviewData);
        const rubricData = await rubricService.getRubricById(reviewData.rubric_id);
        if (rubricData) {
          setRubric(rubricData);
          const criteriaData = await rubricService.getCriteria(rubricData.id);
          setCriteria(criteriaData);
          const feedbackData = await rubricService.getCriterionFeedback(reviewData.id);
          setFeedbackList(feedbackData);
        }
      } else {
        setReview(null);
        setRubric(null);
        setCriteria([]);
        setFeedbackList([]);
      }
    } catch (error) {
      console.error('Error loading review:', error);
    }
  };

  const handleEssayClick = (essayId: string) => {
    const essay = essays.find(e => e.id === essayId);
    if (essay) {
      setSelectedEssay(essay);
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

  const getAverageScore = () => {
    if (feedbackList.length === 0) return 0;
    const total = feedbackList.reduce((sum, f) => sum + (f.score || 0), 0);
    return total / feedbackList.length;
  };

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
          <h1 className="text-3xl font-bold text-slate-900">Essay Feedback</h1>
          <p className="text-slate-600 mt-2">View counselor feedback on your essays</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {essays.map(essay => (
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
                      : essay.status === 'submitted'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {essay.status === 'reviewed' ? 'Reviewed' : essay.status === 'submitted' ? 'Submitted' : 'Draft'}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{essay.essay_title}</h3>
              {essay.university_name && (
                <p className="text-sm text-slate-500 mb-2">{essay.university_name}</p>
              )}
              <p className="text-xs text-slate-400">Last modified: {essay.submission_date}</p>
            </div>
          ))}
        </div>

        {essays.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No essays yet
          </div>
        )}
      </div>
    );
  }

  if (!review) {
    return (
      <div className="p-8">
        <button
          onClick={() => setSelectedEssay(null)}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Essays
        </button>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedEssay.essay_title}</h2>
          {selectedEssay.university_name && (
            <p className="text-slate-500 mb-6">{selectedEssay.university_name}</p>
          )}

          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">This essay has not been reviewed yet</p>
              <p className="text-sm text-slate-500 mt-2">Your counselor will provide feedback soon</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const averageScore = getAverageScore();

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
            <h2 className="text-2xl font-bold text-slate-900">{selectedEssay.essay_title}</h2>
            {selectedEssay.university_name && (
              <p className="text-slate-500 mt-1">{selectedEssay.university_name}</p>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-700 font-medium">Overall Score</div>
                  <div className="flex items-center mt-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i <= Math.round(averageScore) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="ml-3 text-2xl font-bold text-slate-900">
                      {averageScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {renderEssayContent()}
            </div>
          </div>
        </div>
      </div>

      <div className="w-[500px] bg-white border-l border-slate-200 overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Feedback</h3>
          {rubric && (
            <p className="text-sm text-slate-600 mt-1">{rubric.name}</p>
          )}
        </div>

        <div className="p-6 space-y-6">
          {criteria.map(criterion => {
            const feedback = feedbackList.find(f => f.criterion_id === criterion.id);
            if (!feedback || feedback.status !== 'completed') return null;

            return (
              <div key={criterion.id} className="border border-slate-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-lg">{criterion.name}</h4>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i <= (feedback.score || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-lg font-bold text-slate-900">{feedback.score}</span>
                    </div>
                  </div>
                </div>

                {feedback.reference_section && feedback.reference_section !== 'entire_essay' && (
                  <div className="mb-4 text-xs text-slate-500">
                    Reference: {feedback.reference_section.replace('_', ' ')}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Why This Score</div>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {feedback.score_explanation}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">How to Improve</div>
                    <div className="text-sm text-slate-600 bg-green-50 p-3 rounded-lg border border-green-200">
                      {feedback.improvement_guidance}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {review.overall_assessment && (
          <div className="p-6 border-t border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-3">Overall Assessment</h4>
            <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
              {review.overall_assessment}
            </div>
          </div>
        )}

        {review.revision_priorities && review.revision_priorities.length > 0 && (
          <div className="p-6 border-t border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-3">Top Revision Priorities</h4>
            <ol className="space-y-2">
              {review.revision_priorities.map((priority, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-700 pt-0.5">{priority}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEssayFeedback;
