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
  reviewed_at?: string;
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
  const [totalPoints, setTotalPoints] = useState<string>('100');
  const [score, setScore] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_review' | 'reviewed'>('all');
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
              university_name: essayData.universityName || null,
              submission_date: essayData.submittedAt || essayData.lastModified || new Date().toISOString().split('T')[0],
              status: essayData.status || 'submitted',
              total_points: essayData.totalPoints || null,
              score: essayData.score || null,
              font_family: essayData.fontFamily || 'Arial',
              font_size: essayData.fontSize || 14,
              reviewed_at: essayData.reviewedAt
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
      loadComments();
      if (selectedEssay.total_points) setTotalPoints(selectedEssay.total_points.toString());
      if (selectedEssay.score) setScore(selectedEssay.score.toString());
    }
  }, [selectedEssay?.id]);

  const loadComments = () => {
    if (!selectedEssay) return;

    const commentsRef = ref(database, `University Data/Essays/${selectedEssay.student_name}/${selectedEssay.essay_title}/comments`);

    onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsData = snapshot.val();

        const inline: InlineComment[] = [];
        const general: GeneralComment[] = [];

        if (commentsData.inline) {
          Object.keys(commentsData.inline).forEach((key) => {
            inline.push({ id: key, ...commentsData.inline[key] });
          });
        }

        if (commentsData.general) {
          Object.keys(commentsData.general).forEach((key) => {
            general.push({ id: key, ...commentsData.general[key] });
          });
        }

        setInlineComments(inline.sort((a, b) => a.start_position - b.start_position));
        setGeneralComments(general.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      } else {
        setInlineComments([]);
        setGeneralComments([]);
      }
    });
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText(null);
      return;
    }

    const selectedString = selection.toString().trim();
    if (!selectedString) {
      setSelectedText(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const container = essayContentRef.current;
    if (!container) return;

    const textContent = container.innerText;
    const startOffset = textContent.indexOf(selectedString);

    if (startOffset !== -1) {
      setSelectedText({
        text: selectedString,
        start: startOffset,
        end: startOffset + selectedString.length
      });
    }
  };

  const addInlineComment = async () => {
    if (!selectedEssay || !selectedText || !commentInput.trim()) return;

    const newComment: InlineComment = {
      id: Date.now().toString(),
      counselor_name: counselorName,
      highlighted_text: selectedText.text,
      start_position: selectedText.start,
      end_position: selectedText.end,
      comment_text: commentInput.trim()
    };

    const commentPath = `University Data/Essays/${selectedEssay.student_name}/${selectedEssay.essay_title}/comments/inline/${newComment.id}`;
    await set(ref(database, commentPath), {
      counselor_name: newComment.counselor_name,
      highlighted_text: newComment.highlighted_text,
      start_position: newComment.start_position,
      end_position: newComment.end_position,
      comment_text: newComment.comment_text
    });

    setCommentInput('');
    setSelectedText(null);
    window.getSelection()?.removeAllRanges();
  };

  const addGeneralComment = async () => {
    if (!selectedEssay || !generalCommentInput.trim()) return;

    const newComment: GeneralComment = {
      id: Date.now().toString(),
      counselor_name: counselorName,
      comment_text: generalCommentInput.trim(),
      created_at: new Date().toISOString()
    };

    const commentPath = `University Data/Essays/${selectedEssay.student_name}/${selectedEssay.essay_title}/comments/general/${newComment.id}`;
    await set(ref(database, commentPath), {
      counselor_name: newComment.counselor_name,
      comment_text: newComment.comment_text,
      created_at: newComment.created_at
    });

    setGeneralCommentInput('');
  };

  const deleteInlineComment = async (commentId: string) => {
    if (!selectedEssay) return;
    const commentPath = `University Data/Essays/${selectedEssay.student_name}/${selectedEssay.essay_title}/comments/inline/${commentId}`;
    await set(ref(database, commentPath), null);
  };

  const deleteGeneralComment = async (commentId: string) => {
    if (!selectedEssay) return;
    const commentPath = `University Data/Essays/${selectedEssay.student_name}/${selectedEssay.essay_title}/comments/general/${commentId}`;
    await set(ref(database, commentPath), null);
  };

  const submitReview = async () => {
    if (!selectedEssay) return;

    const totalPointsNum = parseFloat(totalPoints);
    const scoreNum = parseFloat(score);

    if (isNaN(totalPointsNum) || isNaN(scoreNum)) {
      alert('Please enter valid numbers for total points and score');
      return;
    }

    if (scoreNum > totalPointsNum) {
      alert('Score cannot be greater than total points');
      return;
    }

    const essayPath = `University Data/Essays/${selectedEssay.student_name}/${selectedEssay.essay_title}`;
    await set(ref(database, essayPath), {
      ...selectedEssay,
      status: 'reviewed',
      totalPoints: totalPointsNum,
      score: scoreNum,
      reviewedAt: new Date().toISOString()
    });

    alert('Review submitted successfully!');
    setSelectedEssay(null);
  };

  const renderEssayWithHighlights = () => {
    if (!selectedEssay) return null;

    const content = selectedEssay.essay_content;
    const text = content.replace(/<[^>]*>/g, '');

    if (inlineComments.length === 0) {
      return (
        <div
          style={{
            fontFamily: selectedEssay.font_family,
            fontSize: `${selectedEssay.font_size}px`,
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}
        >
          {text}
        </div>
      );
    }

    const segments: { text: string; isHighlighted: boolean; commentId?: string }[] = [];
    let lastIndex = 0;

    inlineComments.forEach((comment) => {
      if (comment.start_position > lastIndex) {
        segments.push({
          text: text.substring(lastIndex, comment.start_position),
          isHighlighted: false
        });
      }

      segments.push({
        text: text.substring(comment.start_position, comment.end_position),
        isHighlighted: true,
        commentId: comment.id
      });

      lastIndex = comment.end_position;
    });

    if (lastIndex < text.length) {
      segments.push({
        text: text.substring(lastIndex),
        isHighlighted: false
      });
    }

    return (
      <div
        style={{
          fontFamily: selectedEssay.font_family,
          fontSize: `${selectedEssay.font_size}px`,
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap'
        }}
      >
        {segments.map((segment, index) => (
          segment.isHighlighted ? (
            <mark
              key={index}
              className="bg-yellow-200 cursor-pointer hover:bg-yellow-300 transition-colors"
              title="Click to view comment"
            >
              {segment.text}
            </mark>
          ) : (
            <span key={index}>{segment.text}</span>
          )
        ))}
      </div>
    );
  };

  const handleEssayClick = (essayId: string) => {
    const essay = essays.find(e => e.id === essayId);
    if (essay) {
      setSelectedEssay(essay);
      setSelectedText(null);
      setCommentInput('');
      setGeneralCommentInput('');
    }
  };

  const filteredEssays = essays.filter(essay => {
    if (filter === 'all') return true;
    if (filter === 'pending') return essay.status === 'submitted';
    if (filter === 'reviewed') return essay.status === 'reviewed';
    return true;
  });

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
          <p className="text-slate-600 mt-2">Review and provide feedback on student essays</p>
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
              {essay.status === 'reviewed' && essay.score && essay.total_points && (
                <div className="mt-3 flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-sm font-semibold text-slate-900">
                    {essay.score}/{essay.total_points}
                  </span>
                </div>
              )}
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
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedEssay.status === 'reviewed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {selectedEssay.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
              </span>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Select text in the essay to add inline comments. Highlighted text will show your feedback.
              </p>
            </div>

            <div
              ref={essayContentRef}
              onMouseUp={handleTextSelection}
              className="prose max-w-none select-text"
            >
              {renderEssayWithHighlights()}
            </div>

            {selectedText && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 mb-1">Selected text:</p>
                    <p className="text-sm text-slate-600 italic">"{selectedText.text}"</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedText(null);
                      setCommentInput('');
                      window.getSelection()?.removeAllRanges();
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add your comment about this selection..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                  rows={3}
                />
                <button
                  onClick={addInlineComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Add Comment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-96 bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Review Panel</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Inline Comments ({inlineComments.length})
            </h4>
            <div className="space-y-3">
              {inlineComments.map(comment => (
                <div key={comment.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-medium text-slate-600">{comment.counselor_name}</p>
                    <button
                      onClick={() => deleteInlineComment(comment.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 italic mb-2">"{comment.highlighted_text}"</p>
                  <p className="text-sm text-slate-900">{comment.comment_text}</p>
                </div>
              ))}
              {inlineComments.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No inline comments yet. Select text to add one.
                </p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-3">General Comments</h4>
            <textarea
              value={generalCommentInput}
              onChange={(e) => setGeneralCommentInput(e.target.value)}
              placeholder="Add a general comment about the essay..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              rows={3}
            />
            <button
              onClick={addGeneralComment}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Add General Comment
            </button>

            <div className="mt-4 space-y-3">
              {generalComments.map(comment => (
                <div key={comment.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-medium text-slate-600">{comment.counselor_name}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteGeneralComment(comment.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-900">{comment.comment_text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-3">Grade Essay</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total Points
                </label>
                <input
                  type="number"
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Score
                </label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={submitReview}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssayReview;
