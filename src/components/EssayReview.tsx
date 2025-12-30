import React, { useState, useRef, useEffect } from 'react';
import { FileText, ArrowLeft, MessageSquare, Send, X, Check, Clock, AlertCircle, Star } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, onValue, set } from 'firebase/database';
import { userStorage } from '../services/userStorage';

interface Essay {
  id: string;
  student_name: string;
  essay_type: 'personal_statement' | 'supplement' | 'activity_list';
  essay_title: string;
  essay_content: string;
  university_name: string | null;
  submission_date: string;
  status: 'draft' | 'submitted' | 'reviewed';
  total_points: number | null;
  score: number | null;
  font_family: string;
  font_size: number;
}

interface InlineComment {
  id: string;
  counselor_name: string;
  highlighted_text: string;
  start_position: number;
  end_position: number;
  comment_text: string;
}

interface GeneralComment {
  id: string;
  counselor_name: string;
  comment_text: string;
  created_at: string;
}

const EssayReview: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [inlineComments, setInlineComments] = useState<InlineComment[]>([]);
  const [generalComments, setGeneralComments] = useState<GeneralComment[]>([]);
  const [selectedText, setSelectedText] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [generalCommentInput, setGeneralCommentInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_review' | 'reviewed'>('all');
  const [totalPointsInput, setTotalPointsInput] = useState<string>('');
  const [scoreInput, setScoreInput] = useState<string>('');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const essayContentRef = useRef<HTMLDivElement>(null);

  const currentUser = userStorage.getStoredUser();
  const counselorName = currentUser?.name || 'University Counselor';

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
              university_name: null,
              submission_date: essayData.lastModified || new Date().toISOString().split('T')[0],
              status: essayData.status || 'submitted',
              total_points: essayData.reviewData?.totalPoints || null,
              score: essayData.reviewData?.score || null,
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
    if (selectedEssay && selectedEssay.status === 'reviewed') {
      const [studentName, essayTitle] = selectedEssay.id.split('___');
      const essayRef = ref(database, `University Data/Essays/${studentName}/${essayTitle}`);

      onValue(essayRef, (snapshot) => {
        if (snapshot.exists()) {
          const essayData = snapshot.val();
          if (essayData.reviewData) {
            setInlineComments(essayData.reviewData.inlineComments || []);
            setGeneralComments(essayData.reviewData.generalComments || []);
          }
        }
      });
    }
  }, [selectedEssay?.id, selectedEssay?.status]);

  const handleEssayClick = async (essayId: string) => {
    const essay = essays.find(e => e.id === essayId);
    if (essay) {
      setSelectedEssay(essay);

      const [studentName, essayTitle] = essayId.split('___');
      const essayRef = ref(database, `University Data/Essays/${studentName}/${essayTitle}`);

      onValue(essayRef, (snapshot) => {
        if (snapshot.exists()) {
          const essayData = snapshot.val();
          if (essayData.reviewData) {
            setInlineComments(essayData.reviewData.inlineComments || []);
            setGeneralComments(essayData.reviewData.generalComments || []);
          } else {
            setInlineComments([]);
            setGeneralComments([]);
          }
        }
      });
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() && essayContentRef.current) {
      const selectedTextContent = selection.toString();
      const range = selection.getRangeAt(0);

      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(essayContentRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;
      const end = start + selectedTextContent.length;

      setSelectedText({
        text: selectedTextContent,
        start,
        end,
      });
    }
  };

  const handleAddInlineComment = async () => {
    if (!selectedEssay || !selectedText || !commentInput.trim()) return;

    const newComment: InlineComment = {
      id: Date.now().toString(),
      counselor_name: counselorName,
      highlighted_text: selectedText.text,
      start_position: selectedText.start,
      end_position: selectedText.end,
      comment_text: commentInput,
    };

    const updatedComments = [...inlineComments, newComment];
    setInlineComments(updatedComments);

    const [studentName, essayTitle] = selectedEssay.id.split('___');
    const essayRef = ref(database, `University Data/Essays/${studentName}/${essayTitle}`);

    const snapshot = await new Promise<any>((resolve) => {
      onValue(essayRef, (snap) => resolve(snap), { onlyOnce: true });
    });

    if (snapshot.exists()) {
      const essayData = snapshot.val();
      await set(essayRef, {
        ...essayData,
        reviewData: {
          ...essayData.reviewData,
          inlineComments: updatedComments
        }
      });
    }

    setCommentInput('');
    setSelectedText(null);
  };

  const handleDeleteInlineComment = async (commentId: string) => {
    if (!selectedEssay) return;

    const updatedComments = inlineComments.filter(c => c.id !== commentId);
    setInlineComments(updatedComments);

    const [studentName, essayTitle] = selectedEssay.id.split('___');
    const essayRef = ref(database, `University Data/Essays/${studentName}/${essayTitle}`);

    const snapshot = await new Promise<any>((resolve) => {
      onValue(essayRef, (snap) => resolve(snap), { onlyOnce: true });
    });

    if (snapshot.exists()) {
      const essayData = snapshot.val();
      await set(essayRef, {
        ...essayData,
        reviewData: {
          ...essayData.reviewData,
          inlineComments: updatedComments
        }
      });
    }
  };

  const handleAddGeneralComment = async () => {
    if (!selectedEssay || !generalCommentInput.trim()) return;

    const newComment: GeneralComment = {
      id: Date.now().toString(),
      counselor_name: counselorName,
      comment_text: generalCommentInput,
      created_at: new Date().toISOString(),
    };

    const updatedComments = [newComment, ...generalComments];
    setGeneralComments(updatedComments);

    const [studentName, essayTitle] = selectedEssay.id.split('___');
    const essayRef = ref(database, `University Data/Essays/${studentName}/${essayTitle}`);

    const snapshot = await new Promise<any>((resolve) => {
      onValue(essayRef, (snap) => resolve(snap), { onlyOnce: true });
    });

    if (snapshot.exists()) {
      const essayData = snapshot.val();
      await set(essayRef, {
        ...essayData,
        reviewData: {
          ...essayData.reviewData,
          generalComments: updatedComments
        }
      });
    }

    setGeneralCommentInput('');
  };

  const handleMarkAsReviewed = () => {
    if (!selectedEssay) return;
    setShowGradeModal(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedEssay) return;

    const totalPoints = parseInt(totalPointsInput);
    const score = parseFloat(scoreInput);

    if (isNaN(totalPoints) || totalPoints <= 0) {
      alert('Please enter a valid total points greater than 0');
      return;
    }

    if (isNaN(score) || score < 0) {
      alert('Please enter a valid score greater than or equal to 0');
      return;
    }

    if (score > totalPoints) {
      alert('Score cannot exceed total points');
      return;
    }

    const [studentName, essayTitle] = selectedEssay.id.split('___');
    const essayRef = ref(database, `University Data/Essays/${studentName}/${essayTitle}`);

    const snapshot = await new Promise<any>((resolve) => {
      onValue(essayRef, (snap) => resolve(snap), { onlyOnce: true });
    });

    if (snapshot.exists()) {
      const essayData = snapshot.val();
      await set(essayRef, {
        ...essayData,
        status: 'reviewed',
        reviewData: {
          ...essayData.reviewData,
          reviewedBy: counselorName,
          reviewedAt: new Date().toISOString(),
          totalPoints,
          score,
          inlineComments: inlineComments || [],
          generalComments: generalComments || []
        }
      });
    }

    const updatedEssays = essays.map(e =>
      e.id === selectedEssay.id ? { ...e, status: 'reviewed' as const, total_points: totalPoints, score } : e
    );
    setEssays(updatedEssays);
    setSelectedEssay({ ...selectedEssay, status: 'reviewed', total_points: totalPoints, score });
    setShowGradeModal(false);
    setTotalPointsInput('');
    setScoreInput('');
  };

  const calculateReviewProgress = () => {
    if (essays.length === 0) return 0;
    const reviewedEssays = essays.filter(e => e.status === 'reviewed');
    return Math.round((reviewedEssays.length / essays.length) * 100);
  };

  const renderEssayWithHighlights = () => {
    if (!selectedEssay) return null;

    const text = selectedEssay.essay_content;

    const highlights: Array<{
      start: number;
      end: number;
      type: 'comment' | 'selected';
      comment?: InlineComment;
    }> = [];

    inlineComments.forEach(comment => {
      highlights.push({
        start: comment.start_position,
        end: comment.end_position,
        type: 'comment',
        comment,
      });
    });

    if (selectedText) {
      highlights.push({
        start: selectedText.start,
        end: selectedText.end,
        type: 'selected',
      });
    }

    highlights.sort((a, b) => a.start - b.start);

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    highlights.forEach((highlight, idx) => {
      if (highlight.start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {text.substring(lastIndex, highlight.start)}
          </span>
        );
      }

      if (highlight.type === 'comment' && highlight.comment) {
        parts.push(
          <mark
            key={`highlight-${idx}`}
            className="bg-yellow-200 cursor-pointer hover:bg-yellow-300 transition-colors relative group"
            title={highlight.comment.comment_text}
          >
            {text.substring(highlight.start, highlight.end)}
            <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg z-10">
              <div className="font-semibold mb-1">{highlight.comment.counselor_name}</div>
              <div>{highlight.comment.comment_text}</div>
            </span>
          </mark>
        );
      } else if (highlight.type === 'selected') {
        parts.push(
          <mark
            key={`selected-${idx}`}
            className="bg-blue-200"
          >
            {text.substring(highlight.start, highlight.end)}
          </mark>
        );
      }

      lastIndex = highlight.end;
    });

    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">{text.substring(lastIndex)}</span>
      );
    }

    return parts;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Submitted</span>
          </div>
        );
      case 'reviewed':
        return (
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            <Check className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Reviewed</span>
          </div>
        );
      default:
        return null;
    }
  };

  const filteredEssays = filter === 'all'
    ? essays
    : filter === 'pending'
    ? essays.filter(e => e.status === 'submitted')
    : essays.filter(e => e.status === filter);

  const submittedCount = essays.filter(e => e.status === 'submitted').length;
  const reviewedCount = essays.filter(e => e.status === 'reviewed').length;
  const reviewProgress = calculateReviewProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04ADEE]"></div>
      </div>
    );
  }

  if (selectedEssay) {
    return (
      <div className="-mx-8 -my-6">
        <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20 px-8 py-4">
          <button
            onClick={() => setSelectedEssay(null)}
            className="flex items-center gap-2 text-[#04ADEE] hover:text-[#0396d5] mb-3 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Essays
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 mb-1">{selectedEssay.essay_title}</h2>
              <p className="text-sm text-slate-600">
                {selectedEssay.student_name} • {selectedEssay.essay_type === 'personal_statement' ? 'Personal Statement' : selectedEssay.essay_type === 'supplement' ? 'Supplemental Essay' : 'Activity List'}
                {selectedEssay.university_name && ` • ${selectedEssay.university_name}`}
              </p>
              {selectedEssay.status === 'reviewed' && selectedEssay.total_points && selectedEssay.score !== null && (
                <div className="mt-2 inline-flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <Star className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-900">
                    Grade: {selectedEssay.score}/{selectedEssay.total_points} ({((selectedEssay.score / selectedEssay.total_points) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(selectedEssay.status)}
              {selectedEssay.status !== 'reviewed' && (
                <button
                  onClick={handleMarkAsReviewed}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm"
                >
                  <Check className="w-4 h-4" />
                  Mark as Reviewed
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Essay Content</h3>
              <div
                ref={essayContentRef}
                className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap select-text"
                onMouseUp={handleTextSelection}
              >
                {renderEssayWithHighlights()}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedText && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Selected Text</p>
                    <p className="text-sm text-slate-600 italic">"{selectedText.text}"</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedText(null);
                      window.getSelection()?.removeAllRanges();
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add your comment..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-sm resize-none"
                  rows={3}
                />
                <button
                  onClick={handleAddInlineComment}
                  disabled={!commentInput.trim()}
                  className="mt-2 flex items-center gap-2 bg-[#04ADEE] text-white px-4 py-2 rounded-lg hover:bg-[#0396d5] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Add Comment
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Inline Comments ({inlineComments.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inlineComments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No inline comments yet. Select text to add one.
                  </p>
                ) : (
                  inlineComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-semibold text-slate-700">
                          {comment.counselor_name}
                        </p>
                        <button
                          onClick={() => handleDeleteInlineComment(comment.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 italic mb-2">
                        "{comment.highlighted_text}"
                      </p>
                      <p className="text-xs text-slate-700">{comment.comment_text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-3">General Feedback</h3>
              <textarea
                value={generalCommentInput}
                onChange={(e) => setGeneralCommentInput(e.target.value)}
                placeholder="Write your overall feedback for this essay..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-sm resize-none mb-3"
                rows={4}
              />
              <button
                onClick={handleAddGeneralComment}
                disabled={!generalCommentInput.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#04ADEE] text-white px-4 py-2 rounded-lg hover:bg-[#0396d5] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Add General Feedback
              </button>

              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                {generalComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-semibold text-slate-700">
                        {comment.counselor_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {comment.comment_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showGradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Grade Essay</h3>
              <p className="text-sm text-slate-600 mb-4">
                Enter the grading based on your rubric
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Points (Maximum possible)
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalPointsInput}
                  onChange={(e) => setTotalPointsInput(e.target.value)}
                  placeholder="e.g., 100, 50, 20"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Score (Points earned)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder="e.g., 85, 42.5, 18"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                />
              </div>

              {totalPointsInput && scoreInput && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    Final Grade: <span className="font-bold text-slate-900">
                      {scoreInput}/{totalPointsInput} ({((parseFloat(scoreInput) / parseFloat(totalPointsInput)) * 100).toFixed(1)}%)
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowGradeModal(false);
                    setTotalPointsInput('');
                    setScoreInput('');
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGrade}
                  className="flex-1 px-4 py-2 bg-[#04ADEE] text-white rounded-lg hover:bg-[#0396d5] transition-colors font-medium"
                >
                  Save Grade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="-mx-8 -my-6">
      <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20 px-8 py-5">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-[#04ADEE]" />
          <h1 className="text-2xl font-bold text-slate-900">Essay Review</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-600">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{submittedCount}</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-600">Reviewed</span>
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{reviewedCount}</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-600">Review Progress</span>
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{reviewProgress}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'all'
                ? 'bg-[#04ADEE] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            All ({essays.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'pending'
                ? 'bg-[#04ADEE] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Pending Review ({submittedCount})
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'reviewed'
                ? 'bg-[#04ADEE] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Reviewed ({reviewedCount})
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid gap-4">
          {filteredEssays.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-lg">No essays found</p>
              <p className="text-slate-400 text-sm">Try adjusting your filter</p>
            </div>
          ) : (
            filteredEssays.map((essay) => (
              <div
                key={essay.id}
                onClick={() => handleEssayClick(essay.id)}
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-all cursor-pointer border border-slate-200 hover:border-[#04ADEE]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-800 mb-1">
                      {essay.essay_title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {essay.student_name} • {essay.essay_type === 'personal_statement' ? 'Personal Statement' : essay.essay_type === 'supplement' ? 'Supplemental Essay' : 'Activity List'}
                      {essay.university_name && ` • ${essay.university_name}`}
                    </p>
                  </div>
                  {getStatusBadge(essay.status)}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    Submitted: {new Date(essay.submission_date).toLocaleDateString()}
                  </span>
                  {essay.status === 'reviewed' && essay.total_points && essay.score !== null ? (
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <Star className="w-3.5 h-3.5" />
                      {essay.score}/{essay.total_points} ({((essay.score / essay.total_points) * 100).toFixed(1)}%)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Click to review
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EssayReview;
