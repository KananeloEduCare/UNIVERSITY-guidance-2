import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Save, Send, Plus, FileText, CreditCard as Edit2, Trash2, ChevronDown, List, CheckCircle, MessageSquare, Star, ArrowLeft } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, set, onValue, remove } from 'firebase/database';
import { userStorage } from '../services/userStorage';

interface InlineComment {
  id: string;
  counselor_name: string;
  highlighted_text: string;
  start_position: number;
  end_position: number;
  comment_text: string;
  created_at?: string;
}

interface GeneralComment {
  id: string;
  counselor_name: string;
  comment_text: string;
  created_at: string;
}

interface ReviewData {
  reviewedBy: string;
  reviewedAt: string;
  totalPoints: number;
  score: number;
  inlineComments: InlineComment[];
  generalComments: GeneralComment[];
}

interface ActivityItem {
  id: string;
  name: string;
  description: string;
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
  submittedAt?: string;
  universityName?: string;
  fontFamily: string;
  fontSize: number;
  reviewData?: ReviewData;
  activities?: ActivityItem[];
}

const EssayEditor: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [showNewEssayForm, setShowNewEssayForm] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [newEssayTitle, setNewEssayTitle] = useState('');
  const [newEssayType, setNewEssayType] = useState<'personal_statement' | 'supplement' | 'activity_list'>('personal_statement');
  const [newEssayUniversity, setNewEssayUniversity] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showRubricFeedback, setShowRubricFeedback] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'draft' | 'submitted' | 'reviewed'>('draft');
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [wordCount, setWordCount] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);
  const essayContentRef = useRef<HTMLDivElement>(null);
  const reviewedEssayRef = useRef<HTMLDivElement>(null);

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

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor(day / 10) === 1) ? 0 : day % 10];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;

    return `${day}${suffix} ${month} ${year} at ${formattedHours}:${minutes} ${ampm}`;
  };

  const getEssayStats = () => {
    const total = essays.length;
    const reviewed = essays.filter(e => e.status === 'reviewed').length;
    const submitted = essays.filter(e => e.status === 'submitted').length;
    return { total, reviewed, submitted };
  };

  const getFilteredEssays = () => {
    return essays.filter(e => e.status === activeCategory);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleEssayClick = (essay: Essay) => {
    setSelectedEssay(essay);
    setViewMode('editor');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedEssay(null);
  };

  const cleanHtmlContent = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;

    const allElements = div.querySelectorAll('*');
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return div.innerHTML;
  };

  const applyHighlightsToReviewedEssay = (inlineComments: InlineComment[]) => {
    if (!reviewedEssayRef.current || !selectedEssay) return;

    const container = reviewedEssayRef.current;
    const cleanedHtml = cleanHtmlContent(selectedEssay.content);
    container.innerHTML = cleanedHtml;

    if (inlineComments.length === 0) return;

    const sortedComments = [...inlineComments].sort((a, b) => b.start_position - a.start_position);

    sortedComments.forEach(comment => {
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
      );

      let currentPos = 0;
      let startNode: Text | null = null;
      let startOffset = 0;
      let endNode: Text | null = null;
      let endOffset = 0;
      let foundStart = false;

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const nodeLength = node.length;

        if (!foundStart && currentPos + nodeLength > comment.start_position) {
          startNode = node;
          startOffset = comment.start_position - currentPos;
          foundStart = true;
        }

        if (foundStart && currentPos + nodeLength >= comment.end_position) {
          endNode = node;
          endOffset = comment.end_position - currentPos;
          break;
        }

        currentPos += nodeLength;
      }

      if (startNode && endNode) {
        const range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        const mark = document.createElement('mark');
        mark.className = 'bg-yellow-200 cursor-pointer hover:bg-yellow-300 transition-colors relative group';
        mark.setAttribute('data-comment-id', comment.id);
        mark.title = comment.comment_text;

        try {
          range.surroundContents(mark);

          const tooltip = document.createElement('span');
          tooltip.className = 'invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg z-10 pointer-events-none';
          tooltip.innerHTML = `<div class="font-semibold mb-1">${comment.counselor_name}</div><div>${comment.comment_text}</div>`;
          mark.appendChild(tooltip);
        } catch (e) {
          console.warn('Could not apply highlight', e);
        }
      }
    });
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
          submittedAt: essayData.submittedAt || undefined,
          universityName: essayData.universityName || undefined,
          fontFamily: essayData.fontFamily || 'Arial',
          fontSize: essayData.fontSize || 14,
          reviewData: essayData.reviewData || undefined,
          activities: essayData.activities || undefined
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
      submittedAt: essay.submittedAt || null,
      universityName: essay.universityName || null,
      fontFamily: essay.fontFamily,
      fontSize: essay.fontSize,
      reviewData: essay.reviewData || null,
      activities: essay.activities || null
    });
  };

  const handleCreateEssay = async () => {
    if (!newEssayTitle.trim()) return;
    if (newEssayType === 'supplement' && !newEssayUniversity.trim()) {
      alert('Please enter the university name for this supplementary essay');
      return;
    }

    const newEssay: Essay = {
      id: newEssayTitle,
      title: newEssayTitle,
      type: newEssayType,
      content: '',
      wordCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      universityName: newEssayType === 'supplement' ? newEssayUniversity : undefined,
      fontFamily: 'Arial',
      fontSize: 14,
      activities: newEssayType === 'activity_list' ? [] : undefined
    };

    await saveEssayToFirebase(newEssay);
    setSelectedEssay(newEssay);
    setViewMode('editor');
    setShowNewEssayForm(false);
    setNewEssayTitle('');
    setNewEssayType('personal_statement');
    setNewEssayUniversity('');
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

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
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

    showNotificationMessage('Essay saved as draft!');
  };

  const handleSubmit = async () => {
    if (!selectedEssay) return;

    const updatedEssay = {
      ...selectedEssay,
      status: 'submitted' as const,
      lastModified: new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString()
    };

    await saveEssayToFirebase(updatedEssay);
    setSelectedEssay(updatedEssay);

    showNotificationMessage('Essay submitted for review!');
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

  useEffect(() => {
    if (selectedEssay && selectedEssay.status === 'reviewed') {
      const essayRef = ref(database, `University Data/Essays/${studentName}/${selectedEssay.title}`);
      onValue(essayRef, (snapshot) => {
        if (snapshot.exists()) {
          const essayData = snapshot.val();
          setWordCount(essayData.wordCount || 0);
        }
      }, { onlyOnce: true });
    }
  }, [selectedEssay?.id, studentName]);

  useEffect(() => {
    if (selectedEssay && selectedEssay.status === 'reviewed' && reviewedEssayRef.current) {
      const cleanedHtml = cleanHtmlContent(selectedEssay.content);
      reviewedEssayRef.current.innerHTML = cleanedHtml;

      if (selectedEssay.reviewData?.inlineComments && selectedEssay.reviewData.inlineComments.length > 0) {
        setTimeout(() => {
          applyHighlightsToReviewedEssay(selectedEssay.reviewData!.inlineComments);
        }, 50);
      }
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
    <div className="p-4">
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{notificationMessage}</span>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {viewMode === 'list' && (
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Essay Editor</h1>
              <p className="text-sm text-gray-600 mt-0.5">Write and manage your college application essays</p>
            </div>
            <button
              onClick={() => setShowNewEssayForm(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Essay
            </button>
          </div>
        )}

        {showNewEssayForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3">Create New Essay</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Essay Title
                </label>
                <input
                  type="text"
                  value={newEssayTitle}
                  onChange={(e) => setNewEssayTitle(e.target.value)}
                  placeholder="e.g., Common App Personal Statement"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Essay Type
                </label>
                <select
                  value={newEssayType}
                  onChange={(e) => setNewEssayType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="personal_statement">Personal Statement</option>
                  <option value="supplement">Supplemental Essay</option>
                  <option value="activity_list">Activity List</option>
                </select>
              </div>
              {newEssayType === 'supplement' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    University Name
                  </label>
                  <input
                    type="text"
                    value={newEssayUniversity}
                    onChange={(e) => setNewEssayUniversity(e.target.value)}
                    placeholder="e.g., Harvard University"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleCreateEssay}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Essay
                </button>
                <button
                  onClick={() => {
                    setShowNewEssayForm(false);
                    setNewEssayTitle('');
                    setNewEssayType('personal_statement');
                    setNewEssayUniversity('');
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {essays.length > 0 && viewMode === 'list' && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 mb-1">Total Essays</p>
                    <p className="text-2xl font-bold text-blue-900">{getEssayStats().total}</p>
                  </div>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-1">Submitted</p>
                    <p className="text-2xl font-bold text-green-900">{getEssayStats().submitted}</p>
                  </div>
                  <div className="p-2 bg-green-200 rounded-lg">
                    <Send className="w-5 h-5 text-green-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-600 mb-1">Reviewed</p>
                    <p className="text-2xl font-bold text-purple-900">{getEssayStats().reviewed}</p>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-purple-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setActiveCategory('draft')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeCategory === 'draft'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Drafts
                </button>
                <button
                  onClick={() => setActiveCategory('submitted')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeCategory === 'submitted'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Submitted
                </button>
                <button
                  onClick={() => setActiveCategory('reviewed')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeCategory === 'reviewed'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Reviewed
                </button>
              </div>

              <div className="space-y-3">
                {getFilteredEssays().length > 0 ? (
                  getFilteredEssays().map(essay => (
                    <div
                      key={essay.id}
                      onClick={() => handleEssayClick(essay)}
                      className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer transition-all hover:border-blue-400 hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {essay.title}
                            </h3>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${getTypeColor(essay.type)}`}>
                              {getTypeLabel(essay.type)}
                            </span>
                            {essay.universityName && (
                              <span className="text-xs text-gray-600 italic">
                                for {essay.universityName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>{essay.wordCount} words</span>
                            </div>

                            {essay.status === 'reviewed' && essay.reviewData ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Reviewed by</span>
                                  <span className="font-medium text-gray-900">{essay.reviewData.reviewedBy}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">on</span>
                                  <span className="font-medium text-gray-900">{formatReviewDate(essay.reviewData.reviewedAt)}</span>
                                </div>
                              </>
                            ) : essay.status === 'submitted' && essay.submittedAt ? (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Submitted on</span>
                                <span className="font-medium text-gray-900">{formatReviewDate(essay.submittedAt)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Last modified</span>
                                <span className="font-medium text-gray-900">{formatDate(essay.lastModified)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {essay.status === 'draft' && (
                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Continue editing</span>
                            </div>
                          )}
                          {essay.status === 'submitted' && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Awaiting review</span>
                            </div>
                          )}
                          {essay.status === 'reviewed' && (
                            <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm font-medium">View feedback</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-base text-gray-500">No {activeCategory} essays yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'editor' && selectedEssay ? (
            selectedEssay.status === 'reviewed' ? (
              <div className="-mx-4">
                <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20 px-8 py-4">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-[#04ADEE] hover:text-[#0396d5] mb-3 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Essays
                  </button>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900 mb-1">{selectedEssay.title}</h2>
                      <p className="text-sm text-slate-600">
                        {getTypeLabel(selectedEssay.type)}
                        {selectedEssay.universityName && ` • ${selectedEssay.universityName}`}
                        {wordCount > 0 && ` • ${wordCount} words`}
                      </p>
                    </div>
                    {selectedEssay.reviewData?.rubricFeedback && (
                      <button
                        onClick={() => setShowRubricFeedback(!showRubricFeedback)}
                        className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm"
                      >
                        <Star className="w-4 h-4" />
                        {showRubricFeedback ? 'Hide' : 'View'} Feedback
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-8 py-6">
                  <div className={showRubricFeedback ? 'grid grid-cols-[60%_40%] gap-6 max-w-7xl mx-auto items-start' : 'max-w-5xl mx-auto'}>
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col max-h-[calc(100vh-12rem)] sticky top-6">
                      <div className="overflow-y-auto flex-1 p-8">
                        <div
                          ref={reviewedEssayRef}
                          contentEditable={false}
                          className="prose prose-lg max-w-none text-slate-700"
                          style={{
                            fontFamily: selectedEssay.fontFamily,
                            fontSize: `${selectedEssay.fontSize}pt`,
                            lineHeight: '1.6'
                          }}
                        />
                      </div>
                    </div>

                    {showRubricFeedback && selectedEssay.reviewData?.rubricFeedback && (
                      <div className="sticky top-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 shadow-sm flex flex-col max-h-[calc(100vh-12rem)] self-start">
                        <div className="p-5 border-b border-emerald-200 bg-gradient-to-br from-emerald-50 to-blue-50 flex-shrink-0">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Star className="w-5 h-5 text-emerald-600" />
                            Rubric Feedback
                          </h3>
                        </div>

                        <div className="overflow-y-auto flex-1 p-5 min-h-0">
                          <div className="space-y-3">
                            {selectedEssay.reviewData.rubricFeedback.map((feedback: any, index: number) => (
                              <div
                                key={index}
                                className="bg-white border border-emerald-200 rounded-lg p-4 shadow-sm"
                              >
                                <div className="flex items-start gap-2.5 mb-2.5">
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#04ADEE] text-white text-xs font-bold rounded-full flex-shrink-0">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900">{feedback.criterionName}</h4>
                                    <p className="text-xs text-slate-600 mt-0.5">{feedback.criterionDescription}</p>
                                  </div>
                                  <div className="flex items-center gap-1 bg-emerald-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                    <Star className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" />
                                    <span className="text-xs font-bold text-emerald-700">{feedback.rating}/5</span>
                                  </div>
                                </div>

                                {feedback.rating === 5 ? (
                                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                                    <p className="text-xs font-semibold text-emerald-800">Perfect Score!</p>
                                    <p className="text-xs text-emerald-700 leading-relaxed">This criterion has been excellently fulfilled.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                                      <p className="text-xs font-semibold text-red-800 mb-0.5">What's Missing:</p>
                                      <p className="text-xs text-red-700 leading-relaxed">{feedback.whatsMissing}</p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                                      <p className="text-xs font-semibold text-blue-800 mb-0.5">How to Improve:</p>
                                      <p className="text-xs text-blue-700 leading-relaxed">{feedback.howToImprove}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedEssay.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${getTypeColor(selectedEssay.type)}`}>
                      {getTypeLabel(selectedEssay.type)}
                    </span>
                    {selectedEssay.universityName && (
                      <span className="text-sm text-gray-600 italic">
                        for {selectedEssay.universityName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-b border-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    {selectedEssay.type !== 'activity_list' ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleFormat('bold')}
                            disabled={selectedEssay.status === 'submitted'}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Bold"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFormat('italic')}
                            disabled={selectedEssay.status === 'submitted'}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Italic"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFormat('underline')}
                            disabled={selectedEssay.status === 'submitted'}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Underline"
                          >
                            <Underline className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="border-l border-gray-300 h-5"></div>
                        <select
                          value={selectedEssay.fontFamily}
                          onChange={(e) => handleFontFamilyChange(e.target.value)}
                          disabled={selectedEssay.status === 'submitted'}
                          className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {fontSizes.map(size => (
                            <option key={size} value={size}>
                              {size}pt
                            </option>
                          ))}
                        </select>
                        <div className="border-l border-gray-300 h-5"></div>
                        <span className="text-xs font-medium text-gray-600">
                          {selectedEssay.wordCount} words
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <List className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Activity List</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={selectedEssay.status === 'submitted'}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Draft
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={selectedEssay.status === 'submitted' || selectedEssay.wordCount === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Submit for Review
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  {selectedEssay.type === 'activity_list' ? (
                    <div className="essay-container p-6 min-h-[500px]">
                      <div className="space-y-4">
                        {selectedEssay.activities && selectedEssay.activities.length > 0 ? (
                          selectedEssay.activities.map((activity, index) => (
                            <div key={activity.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-700">Activity {index + 1}</h4>
                                {selectedEssay.status !== 'submitted' && (
                                  <button
                                    onClick={() => {
                                      const updated = {
                                        ...selectedEssay,
                                        activities: selectedEssay.activities?.filter(a => a.id !== activity.id)
                                      };
                                      setSelectedEssay(updated);
                                      saveEssayToFirebase(updated);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Activity Name</label>
                                  <input
                                    type="text"
                                    value={activity.name}
                                    onChange={(e) => {
                                      const updated = {
                                        ...selectedEssay,
                                        activities: selectedEssay.activities?.map(a =>
                                          a.id === activity.id ? { ...a, name: e.target.value } : a
                                        )
                                      };
                                      setSelectedEssay(updated);
                                    }}
                                    onBlur={() => saveEssayToFirebase(selectedEssay)}
                                    disabled={selectedEssay.status === 'submitted'}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="e.g., Varsity Basketball Team"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                  <textarea
                                    value={activity.description}
                                    onChange={(e) => {
                                      const updated = {
                                        ...selectedEssay,
                                        activities: selectedEssay.activities?.map(a =>
                                          a.id === activity.id ? { ...a, description: e.target.value } : a
                                        )
                                      };
                                      setSelectedEssay(updated);
                                    }}
                                    onBlur={() => saveEssayToFirebase(selectedEssay)}
                                    disabled={selectedEssay.status === 'submitted'}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Describe your role, achievements, and what you learned..."
                                    rows={4}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No activities added yet. Click "Add Activity" to get started.</p>
                          </div>
                        )}
                        {selectedEssay.status !== 'submitted' && (
                          <button
                            onClick={() => {
                              const newActivity: ActivityItem = {
                                id: Date.now().toString(),
                                name: '',
                                description: ''
                              };
                              const updated = {
                                ...selectedEssay,
                                activities: [...(selectedEssay.activities || []), newActivity]
                              };
                              setSelectedEssay(updated);
                              saveEssayToFirebase(updated);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
                          >
                            <Plus className="w-4 h-4" />
                            Add Activity
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      ref={editorRef}
                      contentEditable={selectedEssay.status !== 'submitted'}
                      onInput={updateWordCount}
                      className={`essay-container p-6 min-h-[500px] focus:outline-none ${
                        selectedEssay.status === 'submitted' ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      style={{
                        fontSize: `${selectedEssay.fontSize}pt`,
                        lineHeight: '1.6',
                        fontFamily: selectedEssay.fontFamily
                      }}
                    />
                  )}

                  {selectedEssay.status === 'submitted' && (
                    <div className="border-t border-gray-200 p-3 bg-green-50">
                      <p className="text-xs text-green-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        This essay has been submitted for review and cannot be edited.
                      </p>
                    </div>
                  )}
                </div>

            </div>
            )
          ) : null}
        </div>
      </div>
  );
};

export default EssayEditor;
