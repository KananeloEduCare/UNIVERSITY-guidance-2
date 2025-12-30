import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Save, Send, Plus, FileText, Edit2, Trash2, ChevronDown, List, CheckCircle, MessageSquare, Star } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, set, onValue, remove } from 'firebase/database';
import { userStorage } from '../services/userStorage';

interface InlineComment {
  id: string;
  counselorName: string;
  highlightedText: string;
  startPosition: number;
  endPosition: number;
  commentText: string;
}

interface GeneralComment {
  id: string;
  counselorName: string;
  commentText: string;
  createdAt: string;
}

interface ReviewData {
  reviewedBy: string;
  reviewedAt: string;
  totalPoints: number;
  score: number;
  inlineComments: InlineComment[];
  generalComments: GeneralComment[];
}

interface Essay {
  id: string;
  title: string;
  type: 'personal_statement' | 'supplement' | 'activity_list';
  content: string;
  wordCount: number;
  status: 'draft' | 'submitted' | 'reviewed';
  createdAt: string;
  lastModified: string;
  fontFamily: string;
  fontSize: number;
  reviewData?: ReviewData;
}

const EssayEditor: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [showNewEssayForm, setShowNewEssayForm] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [newEssayTitle, setNewEssayTitle] = useState('');
  const [newEssayType, setNewEssayType] = useState<'personal_statement' | 'supplement' | 'activity_list'>('personal_statement');
  const [showEssayList, setShowEssayList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const essayContentRef = useRef<HTMLDivElement>(null);

  const currentUser = userStorage.getStoredUser();
  const studentName = currentUser?.name || 'Unknown Student';

  const fontFamilies = [
    'Arial',
    'Times New Roman',
    'Georgia',
    'Calibri',
    'Verdana',
    'Helvetica',
    'Courier New',
    'Palatino'
  ];

  const fontSizes = [12, 14, 16, 18, 20, 22, 24];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'personal_statement':
        return 'Personal Statement';
      case 'supplement':
        return 'Supplemental Essay';
      case 'activity_list':
        return 'Activity List';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personal_statement':
        return 'bg-purple-100 text-purple-700';
      case 'supplement':
        return 'bg-blue-100 text-blue-700';
      case 'activity_list':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const countWords = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current && selectedEssay) {
      updateWordCount();
    }
  };

  const updateWordCount = () => {
    if (editorRef.current && selectedEssay) {
      const content = editorRef.current.innerHTML;
      const wordCount = countWords(content);
      setSelectedEssay({ ...selectedEssay, content, wordCount });
    }
  };

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
          title: essayTitle,
          type: essayData.essayType || 'personal_statement',
          content: essayData.essayText || '',
          wordCount: essayData.wordCount || 0,
          status: essayData.status || 'draft',
          createdAt: essayData.createdAt || new Date().toISOString().split('T')[0],
          lastModified: essayData.lastModified || new Date().toISOString().split('T')[0],
          fontFamily: essayData.fontFamily || 'Arial',
          fontSize: essayData.fontSize || 14,
          reviewData: essayData.reviewData || undefined
        });
      });

      essaysData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setEssays(essaysData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [studentName]);

  const saveEssayToFirebase = async (essay: Essay) => {
    const essayRef = ref(database, `University Data/Essays/${studentName}/${essay.title}`);

    await set(essayRef, {
      essayTitle: essay.title,
      essayText: essay.content,
      essayType: essay.type,
      status: essay.status,
      wordCount: essay.wordCount,
      createdAt: essay.createdAt,
      lastModified: essay.lastModified,
      fontFamily: essay.fontFamily,
      fontSize: essay.fontSize,
      reviewData: essay.reviewData || null
    });
  };

  const handleCreateEssay = async () => {
    if (!newEssayTitle.trim()) return;

    const newEssay: Essay = {
      id: newEssayTitle,
      title: newEssayTitle,
      type: newEssayType,
      content: '',
      wordCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      fontFamily: 'Arial',
      fontSize: 14
    };

    await saveEssayToFirebase(newEssay);
    setSelectedEssay(newEssay);
    setShowNewEssayForm(false);
    setNewEssayTitle('');
    setNewEssayType('personal_statement');
  };

  const handleFontFamilyChange = async (fontFamily: string) => {
    if (!selectedEssay) return;
    const updated = { ...selectedEssay, fontFamily };
    setSelectedEssay(updated);
    await saveEssayToFirebase(updated);
  };

  const handleFontSizeChange = async (fontSize: number) => {
    if (!selectedEssay) return;
    const updated = { ...selectedEssay, fontSize };
    setSelectedEssay(updated);
    await saveEssayToFirebase(updated);
  };

  const handleSave = async () => {
    if (!selectedEssay || !editorRef.current) return;

    const updatedEssay = {
      ...selectedEssay,
      lastModified: new Date().toISOString().split('T')[0],
      status: 'draft' as const
    };

    await saveEssayToFirebase(updatedEssay);
    setSelectedEssay(updatedEssay);

    alert('Essay saved as draft!');
  };

  const handleSubmit = async () => {
    if (!selectedEssay) return;

    const updatedEssay = {
      ...selectedEssay,
      status: 'submitted' as const,
      lastModified: new Date().toISOString().split('T')[0]
    };

    await saveEssayToFirebase(updatedEssay);
    setSelectedEssay(updatedEssay);

    alert('Essay submitted for review!');
  };

  const handleDeleteEssay = async (id: string) => {
    if (confirm('Are you sure you want to delete this essay?')) {
      const essayRef = ref(database, `University Data/Essays/${studentName}/${id}`);
      await remove(essayRef);

      if (selectedEssay?.id === id) {
        setSelectedEssay(null);
      }
    }
  };

  useEffect(() => {
    if (editorRef.current && selectedEssay) {
      editorRef.current.innerHTML = selectedEssay.content;
    }
  }, [selectedEssay?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04ADEE]"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Essay Editor</h1>
            <p className="text-gray-600 mt-1">Write and manage your college application essays</p>
          </div>
          <button
            onClick={() => setShowNewEssayForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Essay
          </button>
        </div>

        {showNewEssayForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Essay</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Essay Title
                </label>
                <input
                  type="text"
                  value={newEssayTitle}
                  onChange={(e) => setNewEssayTitle(e.target.value)}
                  placeholder="e.g., Common App Personal Statement"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Essay Type
                </label>
                <select
                  value={newEssayType}
                  onChange={(e) => setNewEssayType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="personal_statement">Personal Statement</option>
                  <option value="supplement">Supplemental Essay</option>
                  <option value="activity_list">Activity List</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateEssay}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Essay
                </button>
                <button
                  onClick={() => {
                    setShowNewEssayForm(false);
                    setNewEssayTitle('');
                    setNewEssayType('personal_statement');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {essays.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <button
                onClick={() => setShowEssayList(!showEssayList)}
                className="w-full bg-white rounded-lg border border-gray-300 px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <List className="w-5 h-5 text-gray-500" />
                  {selectedEssay ? (
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{selectedEssay.title}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getTypeColor(selectedEssay.type)}`}>
                        {getTypeLabel(selectedEssay.type)}
                      </span>
                      {selectedEssay.status === 'submitted' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Submitted
                        </span>
                      )}
                      {selectedEssay.status === 'reviewed' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Reviewed
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-600">Select an essay to edit</span>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showEssayList ? 'rotate-180' : ''}`} />
              </button>

              {showEssayList && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-10 max-h-96 overflow-y-auto">
                  {essays.map(essay => (
                    <div
                      key={essay.id}
                      onClick={() => {
                        setSelectedEssay(essay);
                        setShowEssayList(false);
                      }}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedEssay?.id === essay.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{essay.title}</h3>
                        <div className="flex items-center gap-2">
                          {essay.status === 'submitted' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Submitted
                            </span>
                          )}
                          {essay.status === 'reviewed' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Reviewed
                            </span>
                          )}
                          {selectedEssay?.id === essay.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEssay(essay.id);
                                setShowEssayList(false);
                              }}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`text-xs px-2 py-1 rounded ${getTypeColor(essay.type)}`}>
                          {getTypeLabel(essay.type)}
                        </span>
                        <span className="text-gray-500">{essay.wordCount} words</span>
                        <span className="text-gray-400">Modified: {new Date(essay.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          {selectedEssay ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFormat('bold')}
                        disabled={selectedEssay.status === 'submitted'}
                        className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFormat('italic')}
                        disabled={selectedEssay.status === 'submitted'}
                        className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFormat('underline')}
                        disabled={selectedEssay.status === 'submitted'}
                        className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Underline"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="border-l border-gray-300 h-6"></div>
                    <select
                      value={selectedEssay.fontFamily}
                      onChange={(e) => handleFontFamilyChange(e.target.value)}
                      disabled={selectedEssay.status === 'submitted'}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: selectedEssay.fontFamily }}
                    >
                      {fontFamilies.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedEssay.fontSize}
                      onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                      disabled={selectedEssay.status === 'submitted'}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {fontSizes.map(size => (
                        <option key={size} value={size}>
                          {size}pt
                        </option>
                      ))}
                    </select>
                    <div className="border-l border-gray-300 h-6"></div>
                    <span className="text-sm font-medium text-gray-600">
                      {selectedEssay.wordCount} words
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={selectedEssay.status === 'submitted'}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      Save Draft
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={selectedEssay.status === 'submitted' || selectedEssay.wordCount === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      Submit for Review
                    </button>
                  </div>
                </div>
              </div>

              <div
                ref={editorRef}
                contentEditable={selectedEssay.status !== 'submitted'}
                onInput={updateWordCount}
                className={`p-8 min-h-[600px] focus:outline-none ${
                  selectedEssay.status === 'submitted' ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                style={{
                  fontSize: `${selectedEssay.fontSize}pt`,
                  lineHeight: '1.75',
                  fontFamily: selectedEssay.fontFamily
                }}
              />

              {selectedEssay.status === 'submitted' && (
                <div className="border-t border-gray-200 p-4 bg-green-50">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    This essay has been submitted for review and cannot be edited.
                  </p>
                </div>
              )}

              {selectedEssay.status === 'reviewed' && selectedEssay.reviewData && (
                <div className="border-t border-gray-200 p-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          Essay Reviewed by {selectedEssay.reviewData.reviewedBy}
                        </p>
                        <p className="text-xs text-blue-700">
                          Grade: {selectedEssay.reviewData.score}/{selectedEssay.reviewData.totalPoints} ({((selectedEssay.reviewData.score / selectedEssay.reviewData.totalPoints) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowFeedback(!showFeedback)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {showFeedback ? 'Hide' : 'View'} Feedback
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="text-center text-gray-500">
                <Edit2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Essay Selected</h3>
                <p className="text-sm">
                  {essays.length === 0
                    ? 'Create your first essay to get started'
                    : 'Select an essay from the dropdown above to start writing'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {showFeedback && selectedEssay?.status === 'reviewed' && selectedEssay.reviewData && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Counselor Feedback
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Grade
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-3xl font-bold text-gray-900">
                    {selectedEssay.reviewData.score}/{selectedEssay.reviewData.totalPoints}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {((selectedEssay.reviewData.score / selectedEssay.reviewData.totalPoints) * 100).toFixed(1)}% • Reviewed on {new Date(selectedEssay.reviewData.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedEssay.reviewData.inlineComments && selectedEssay.reviewData.inlineComments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Inline Comments ({selectedEssay.reviewData.inlineComments.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedEssay.reviewData.inlineComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                      >
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          {comment.counselorName}
                        </p>
                        <p className="text-xs text-gray-600 italic mb-2">
                          "{comment.highlightedText}"
                        </p>
                        <p className="text-xs text-gray-700">{comment.commentText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedEssay.reviewData.generalComments && selectedEssay.reviewData.generalComments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  General Feedback
                </h3>
                <div className="space-y-3">
                  {selectedEssay.reviewData.generalComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-700">
                          {comment.counselorName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {comment.commentText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EssayEditor;
