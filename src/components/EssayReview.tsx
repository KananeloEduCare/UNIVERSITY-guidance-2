import React, { useState, useRef, useEffect } from 'react';
import { FileText, ArrowLeft, MessageSquare, Send, X, Check, Clock, AlertCircle, Star, ClipboardList, Search } from 'lucide-react';
import { database } from '../config/firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { userStorage } from '../services/userStorage';
import RubricManager from './RubricManager';

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
  reviewData?: {
    reviewedBy?: string;
    reviewedAt?: string;
    rubricFeedback?: Array<{
      criterionName: string;
      criterionDescription: string;
      rating: number;
      whatsMissing: string;
      howToImprove: string;
    }>;
    inlineComments?: InlineComment[];
    generalComments?: GeneralComment[];
  };
}

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
}

interface CriterionGrade {
  rating: number;
  whatsMissing: string;
  howToImprove: string;
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

interface EssayReviewProps {
  comeFromStudentProfile?: boolean;
  studentName?: string;
  essayTitle?: string;
  onBackToStudentProfile?: () => void;
}

const EssayReview: React.FC<EssayReviewProps> = ({
  comeFromStudentProfile = false,
  studentName,
  essayTitle,
  onBackToStudentProfile
}) => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [essayTypeFilter, setEssayTypeFilter] = useState<'all' | 'personal_statement' | 'supplement' | 'activity_list'>('all');
  const [totalPointsInput, setTotalPointsInput] = useState<string>('');
  const [scoreInput, setScoreInput] = useState<string>('');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showCommentButton, setShowCommentButton] = useState(false);
  const [commentButtonPosition, setCommentButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const [showRubricManager, setShowRubricManager] = useState(false);
  const [hasRubric, setHasRubric] = useState(false);
  const [showNoRubricWarning, setShowNoRubricWarning] = useState(false);
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([]);
  const [criterionGrades, setCriterionGrades] = useState<{ [key: string]: CriterionGrade }>({});
  const [showGradingInterface, setShowGradingInterface] = useState(false);
  const [showRubricFeedback, setShowRubricFeedback] = useState(false);
  const essayContentRef = useRef<HTMLDivElement>(null);

  const currentUser = userStorage.getStoredUser();
  const counselorName = currentUser?.name || 'University Counselor';
  const counselorId = currentUser?.id || '';

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

  useEffect(() => {
    if (selectedEssay && essayContentRef.current && inlineComments.length > 0) {
      setTimeout(() => applyHighlightsToHtml(), 50);
    }
  }, [selectedEssay, inlineComments]);

  const applyHighlightsToHtml = () => {
    if (!essayContentRef.current || !selectedEssay) return;

    const container = essayContentRef.current;
    const cleanedHtml = cleanHtmlContent(selectedEssay.essay_content);
    container.innerHTML = cleanedHtml;

    const textContent = container.textContent || '';

    console.log('Applying highlights. Total text length:', textContent.length);
    console.log('Comments to apply:', inlineComments.length);

    const sortedComments = [...inlineComments].sort((a, b) => b.start_position - a.start_position);

    sortedComments.forEach(comment => {
      console.log('Applying comment:', {
        id: comment.id,
        start: comment.start_position,
        end: comment.end_position,
        text: comment.highlighted_text,
        actualText: textContent.substring(comment.start_position, comment.end_position)
      });

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
        console.log('Found nodes for highlight:', {
          startNode: startNode.textContent?.substring(0, 20),
          endNode: endNode.textContent?.substring(0, 20),
          startOffset,
          endOffset
        });

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

          console.log('Successfully applied highlight');
        } catch (e) {
          console.warn('Could not apply highlight', e);
        }
      } else {
        console.warn('Could not find start/end nodes for comment:', comment);
      }
    });
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

  useEffect(() => {
    const checkRubric = async () => {
      if (counselorName) {
        const counselorRef = ref(database, `University Data/${counselorName}`);
        const snapshot = await get(counselorRef);
        setHasRubric(snapshot.exists());
      }
    };

    checkRubric();
  }, [counselorName]);

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

      Object.keys(data).forEach((esName) => {
        const studentEssays = data[esName];

        Object.keys(studentEssays).forEach((essayTitle) => {
          const essayData = studentEssays[essayTitle];

          if (essayData.status === 'submitted' || essayData.status === 'reviewed') {
            essaysData.push({
              id: `${esName}___${essayTitle}`,
              student_name: esName,
              essay_type: essayData.essayType || 'personal_statement',
              essay_title: essayTitle,
              essay_content: essayData.essayText || '',
              university_name: essayData.universityName || null,
              submission_date: essayData.submittedAt || essayData.lastModified || new Date().toISOString().split('T')[0],
              status: essayData.status || 'submitted',
              total_points: essayData.reviewData?.totalPoints || null,
              score: essayData.reviewData?.score || null,
              font_family: essayData.fontFamily || 'Arial',
              font_size: essayData.fontSize || 14,
              reviewed_at: essayData.reviewData?.reviewedAt || undefined
            });
          }
        });
      });

      essaysData.sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime());

      if (comeFromStudentProfile && studentName) {
        const filteredEssays = essaysData.filter(essay => essay.student_name === studentName);
        setEssays(filteredEssays);
      } else {
        setEssays(essaysData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [comeFromStudentProfile, studentName, essayTitle]);

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
      const [studentName, essayTitle] = essayId.split('___');
      const essayRef = ref(database, `University Data/Essays/${studentName}/${essayTitle}`);

      onValue(essayRef, (snapshot) => {
        if (snapshot.exists()) {
          const essayData = snapshot.val();

          const updatedEssay = {
            ...essay,
            reviewData: essayData.reviewData || undefined
          };

          setSelectedEssay(updatedEssay);

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
    if (selection && selection.toString().trim() && essayContentRef.current && selectedEssay) {
      const selectedTextContent = selection.toString();
      const range = selection.getRangeAt(0);

      // Get the clean text for position calculation
      const cleanText = essayContentRef.current.textContent || '';

      // Walk through the DOM to find the actual character position
      const walker = document.createTreeWalker(
        essayContentRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      let currentPos = 0;
      let startPos = -1;

      // Find the start position by walking through text nodes
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;

        if (node === range.startContainer) {
          startPos = currentPos + range.startOffset;
          break;
        } else if (range.startContainer.contains(node)) {
          // Keep counting until we find the start container
          currentPos += node.length;
        } else {
          currentPos += node.length;
        }
      }

      // If we didn't find it by exact node match, try to find by content
      if (startPos < 0) {
        // Fallback: search for the selected text in clean text
        startPos = cleanText.indexOf(selectedTextContent);
        console.log('Using fallback position search');
      }

      if (startPos < 0) {
        startPos = 0;
      }

      const endPos = startPos + selectedTextContent.length;

      console.log('Text selection:', {
        text: selectedTextContent,
        start: startPos,
        end: endPos,
        actualText: cleanText.substring(startPos, endPos)
      });

      const rect = range.getBoundingClientRect();
      setCommentButtonPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX + (rect.width / 2)
      });
      setShowCommentButton(true);
      setSelectedText({
        text: selectedTextContent,
        start: startPos,
        end: endPos,
      });
    } else {
      setShowCommentButton(false);
      setCommentButtonPosition(null);
    }
  };

  const handleShowCommentBox = () => {
    setShowCommentButton(false);
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

  const loadRubricForGrading = async () => {
    if (!counselorName) return;

    const rubricRef = ref(database, `University Data/${counselorName}/grading_rubric`);
    onValue(rubricRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const criteria: RubricCriterion[] = Object.keys(data).map(key => ({
          id: key,
          name: data[key].name,
          description: data[key].description
        }));
        setRubricCriteria(criteria);

        const initialGrades: { [key: string]: CriterionGrade } = {};
        criteria.forEach(criterion => {
          initialGrades[criterion.id] = {
            rating: 0,
            whatsMissing: '',
            howToImprove: ''
          };
        });
        setCriterionGrades(initialGrades);
      }
    }, { onlyOnce: true });
  };

  const handleGradeEssay = async () => {
    if (!selectedEssay) return;

    if (!hasRubric) {
      setShowNoRubricWarning(true);
      return;
    }

    await loadRubricForGrading();
    setShowGradingInterface(true);
  };

  const handleMarkAsReviewed = () => {
    if (!selectedEssay) return;
    setShowGradeModal(true);
  };

  const updateCriterionGrade = (criterionId: string, field: keyof CriterionGrade, value: string | number) => {
    setCriterionGrades(prev => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        [field]: value
      }
    }));
  };

  const handleSubmitGrade = async () => {
    if (!selectedEssay) return;

    const totalPossibleScore = rubricCriteria.length * 5;
    const earnedScore = Object.values(criterionGrades).reduce((sum, grade) => sum + grade.rating, 0);
    const percentageGrade = (earnedScore / totalPossibleScore) * 100;

    const rubricFeedback = rubricCriteria.map(criterion => ({
      criterionName: criterion.name,
      criterionDescription: criterion.description,
      rating: criterionGrades[criterion.id].rating,
      whatsMissing: criterionGrades[criterion.id].rating === 5 ? '' : criterionGrades[criterion.id].whatsMissing,
      howToImprove: criterionGrades[criterion.id].rating === 5 ? '' : criterionGrades[criterion.id].howToImprove
    }));

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
          reviewedBy: counselorName,
          reviewedAt: new Date().toISOString(),
          percentageGrade: percentageGrade,
          rubricFeedback: rubricFeedback
        }
      });
    }

    const updatedEssays = essays.map(e =>
      e.id === selectedEssay.id ? { ...e, status: 'reviewed' as const, total_points: totalPossibleScore, score: earnedScore } : e
    );
    setEssays(updatedEssays);
    setSelectedEssay({ ...selectedEssay, status: 'reviewed', total_points: totalPossibleScore, score: earnedScore });
    setShowGradingInterface(false);
    setCriterionGrades({});
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

  useEffect(() => {
    if (comeFromStudentProfile && !selectedEssay && studentName && essayTitle) {
      const essayId = `${studentName}___${essayTitle}`;
      const essayRef = ref(database, `University Data/Essays/${studentName}/${essayTitle}`);

      onValue(essayRef, (snapshot) => {
        if (snapshot.exists()) {
          const essayData = snapshot.val();
          const essay: Essay = {
            id: essayId,
            student_name: studentName,
            essay_type: essayData.essayType || 'supplement',
            essay_title: essayTitle,
            essay_content: essayData.essayText || '',
            university_name: essayData.universityName || null,
            submission_date: essayData.submittedAt || essayData.lastModified || new Date().toISOString().split('T')[0],
            status: essayData.status || 'submitted',
            total_points: essayData.reviewData?.totalPoints || null,
            score: essayData.reviewData?.score || null,
            font_family: essayData.fontFamily || 'Arial',
            font_size: essayData.fontSize || 14,
            reviewed_at: essayData.reviewData?.reviewedAt || undefined,
            reviewData: essayData.reviewData || undefined
          };
          setSelectedEssay(essay);

          if (essayData.reviewData) {
            setInlineComments(essayData.reviewData.inlineComments || []);
            setGeneralComments(essayData.reviewData.generalComments || []);
          } else {
            setInlineComments([]);
            setGeneralComments([]);
          }
        }
      }, { onlyOnce: true });
    }
  }, [comeFromStudentProfile, studentName, essayTitle]);

  useEffect(() => {
    if (selectedEssay && essayContentRef.current) {
      const cleanedHtml = cleanHtmlContent(selectedEssay.essay_content);
      essayContentRef.current.innerHTML = cleanedHtml;

      if (inlineComments.length > 0) {
        setTimeout(() => applyHighlightsToHtml(), 50);
      }
    }
  }, [selectedEssay?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">To be Reviewed</span>
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

  const filteredEssays = essays.filter(essay => {
    const statusMatch = filter === 'all'
      ? true
      : filter === 'pending'
      ? essay.status === 'submitted'
      : essay.status === filter;

    const searchMatch = searchQuery.trim() === '' || essay.student_name.toLowerCase().includes(searchQuery.toLowerCase());

    const typeMatch = essayTypeFilter === 'all' || essay.essay_type === essayTypeFilter;

    return statusMatch && searchMatch && typeMatch;
  });

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
    const handleBackClick = () => {
      if (comeFromStudentProfile && onBackToStudentProfile) {
        onBackToStudentProfile();
      } else {
        setSelectedEssay(null);
      }
    };

    return (
      <div className="-mx-8 -my-6">
        <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20 px-8 py-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-[#04ADEE] hover:text-[#0396d5] mb-3 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {comeFromStudentProfile ? 'Back to Student Profile' : 'Back to Essays'}
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
              {selectedEssay.status === 'reviewed' && (
                <button
                  onClick={() => setShowRubricFeedback(!showRubricFeedback)}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm"
                >
                  <Star className="w-4 h-4" />
                  {showRubricFeedback ? 'Hide' : 'View'} Feedback
                </button>
              )}
              {selectedEssay.status !== 'reviewed' && (
                <button
                  onClick={handleGradeEssay}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm"
                >
                  <Star className="w-4 h-4" />
                  Give Feedback
                </button>
              )}
            </div>
          </div>
        </div>

        {showGradingInterface ? (
          <div className="px-8 py-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Essay Content</h3>
                  <button
                    onClick={() => setShowGradingInterface(false)}
                    className="text-sm text-[#04ADEE] hover:text-[#0396d5] font-medium"
                  >
                    View Full Essay
                  </button>
                </div>
                <div
                  className="prose prose-sm max-w-none text-slate-700 max-h-[70vh] overflow-y-auto"
                  style={{
                    fontFamily: selectedEssay.font_family,
                    fontSize: `${selectedEssay.font_size}pt`,
                    lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedEssay.essay_content }}
                />
              </div>

              <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 border border-emerald-200 sticky top-0 z-10">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Grade Essay with Rubric</h3>
                  <p className="text-sm text-slate-600">Rate each criterion and provide detailed feedback</p>
                </div>

                {rubricCriteria.map((criterion, index) => (
                  <div key={criterion.id} className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-[#04ADEE] text-white text-sm font-bold rounded-full flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-slate-900 mb-1">{criterion.name}</h4>
                        <p className="text-sm text-slate-600">{criterion.description}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Rating (1-5)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => updateCriterionGrade(criterion.id, 'rating', rating)}
                            className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                              criterionGrades[criterion.id]?.rating === rating
                                ? 'bg-[#04ADEE] text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>

                    {criterionGrades[criterion.id]?.rating === 5 ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-emerald-800">Perfect Score!</p>
                        <p className="text-sm text-emerald-700 leading-relaxed">This criterion has been excellently fulfilled.</p>
                      </div>
                    ) : criterionGrades[criterion.id]?.rating > 0 ? (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            What's missing? (Why didn't they get a 5?)
                          </label>
                          <textarea
                            value={criterionGrades[criterion.id]?.whatsMissing || ''}
                            onChange={(e) => updateCriterionGrade(criterion.id, 'whatsMissing', e.target.value)}
                            placeholder="Explain what elements are missing or could be improved..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-sm resize-none"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            How to improve to a 5?
                          </label>
                          <textarea
                            value={criterionGrades[criterion.id]?.howToImprove || ''}
                            onChange={(e) => updateCriterionGrade(criterion.id, 'howToImprove', e.target.value)}
                            placeholder="Provide specific suggestions on how to reach a perfect score..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-sm resize-none"
                            rows={3}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}

                <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowGradingInterface(false);
                        setCriterionGrades({});
                      }}
                      className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitGrade}
                      disabled={
                        !Object.values(criterionGrades).every(grade =>
                          grade.rating > 0 && (
                            grade.rating === 5 ||
                            (grade.whatsMissing.trim() && grade.howToImprove.trim())
                          )
                        )
                      }
                      className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 ${
                        Object.values(criterionGrades).every(grade =>
                          grade.rating > 0 && (
                            grade.rating === 5 ||
                            (grade.whatsMissing.trim() && grade.howToImprove.trim())
                          )
                        )
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      Submit Grade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-8 py-6">
            {rubricCriteria.length > 0 && selectedEssay.status !== 'reviewed' && (
              <div className="mb-4 flex justify-center">
                <button
                  onClick={() => setShowGradingInterface(true)}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm shadow-md"
                >
                  <Star className="w-4 h-4" />
                  Back to Grading
                </button>
              </div>
            )}

            <div className={showRubricFeedback ? 'grid grid-cols-[60%_40%] gap-6 max-w-7xl mx-auto items-start' : 'max-w-5xl mx-auto'}>
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col max-h-[calc(100vh-12rem)] sticky top-6">
                <div className="overflow-y-auto flex-1 p-8">
                  <div
                    ref={essayContentRef}
                    contentEditable={false}
                    className="prose prose-lg max-w-none text-slate-700"
                    style={{
                      fontFamily: selectedEssay.font_family,
                      fontSize: `${selectedEssay.font_size}pt`,
                      lineHeight: '1.6'
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedEssay.essay_content }}
                  />
                </div>
              </div>

              {selectedEssay.status === 'reviewed' && showRubricFeedback && selectedEssay.reviewData?.rubricFeedback && (
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
        )}

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

  const handleRubricManagerClose = async () => {
    setShowRubricManager(false);
    if (counselorName) {
      const counselorRef = ref(database, `University Data/${counselorName}`);
      const snapshot = await get(counselorRef);
      setHasRubric(snapshot.exists());
    }
  };

  return (
    <div className="-mx-8 -my-6">
      <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20 px-8 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#04ADEE]" />
            <h1 className="text-2xl font-bold text-slate-900">Essay Review</h1>
          </div>
          <button
            onClick={() => setShowRubricManager(true)}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            <ClipboardList className="w-4 h-4" />
            {hasRubric ? 'Edit Rubric' : 'Set Rubric'}
          </button>
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

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-sm"
              />
            </div>

            <select
              value={essayTypeFilter}
              onChange={(e) => setEssayTypeFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
            >
              <option value="all">All Types</option>
              <option value="personal_statement">Personal Statements</option>
              <option value="supplement">Supplementary Essays</option>
              <option value="activity_list">Activity Lists</option>
            </select>
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
                  {essay.status === 'reviewed' && essay.reviewed_at ? (
                    <span>
                      Reviewed on: {formatReviewDate(essay.reviewed_at)}
                    </span>
                  ) : (
                    <span>
                      Submitted on: {formatReviewDate(essay.submission_date)}
                    </span>
                  )}
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

      {showRubricManager && (
        <RubricManager
          counselorName={counselorName}
          onClose={handleRubricManagerClose}
        />
      )}

      {showNoRubricWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Set Up Rubric First</h3>
                <p className="text-sm text-slate-600">
                  You need to set up a grading rubric before you can give feedback on essays. This ensures consistent and fair evaluations.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNoRubricWarning(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowNoRubricWarning(false);
                  setShowRubricManager(true);
                }}
                className="flex-1 px-4 py-2 bg-[#04ADEE] text-white rounded-lg hover:bg-[#0396d5] transition-colors font-medium text-sm"
              >
                Set Up Rubric
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EssayReview;
