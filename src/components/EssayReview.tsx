import React, { useState, useRef } from 'react';
import { FileText, ArrowLeft, MessageSquare, Send, X, Check, Clock, AlertCircle, Star } from 'lucide-react';

interface Essay {
  id: string;
  student_name: string;
  essay_type: 'personal_statement' | 'supplementary';
  essay_title: string;
  essay_content: string;
  university_name: string | null;
  submission_date: string;
  status: 'pending' | 'in_review' | 'reviewed';
  total_points: number | null;
  score: number | null;
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

const DUMMY_ESSAYS: Essay[] = [
  {
    id: '1',
    student_name: 'Emma Thompson',
    essay_type: 'personal_statement',
    essay_title: 'Common App Personal Statement',
    essay_content: `Growing up in a small coastal town, I spent my childhood exploring tide pools and marveling at the intricate ecosystems hidden beneath the waves. My fascination with marine life began when I was eight years old, during a family vacation to the Florida Keys. I remember pressing my face against the glass of an aquarium, watching a sea turtle glide gracefully through the water, and feeling an overwhelming sense of connection to the ocean and its inhabitants.

This early wonder transformed into a serious academic pursuit during my sophomore year of high school. When our biology teacher announced a research project on local environmental issues, I immediately knew I wanted to study the impact of pollution on our town's marine ecosystem. What started as a simple class assignment evolved into a year-long investigation that would fundamentally change my understanding of environmental science and my role as a future researcher.

I began by collecting water samples from different points along our coastline, testing for pollutants and documenting changes in marine life populations. The data I gathered was alarming. Over the past decade, our local fish populations had declined by nearly 40%, and the coral reefs that once thrived just offshore were showing signs of severe bleaching. I knew I had to do more than just document these changes; I needed to take action.

With support from my biology teacher and the local marine biology lab, I organized a community beach cleanup initiative and launched an educational campaign in our town. I created informational brochures, gave presentations at town hall meetings, and even started a youth environmental club at my school. The response was overwhelming. Within six months, we had recruited over 200 volunteers and removed more than 3,000 pounds of trash from our beaches.

But the most rewarding moment came when I returned to collect follow-up water samples and discovered that the water quality had measurably improved. Small changes were occurring in the ecosystem. I had learned that scientific research isn't just about observation and data collection; it's about using that knowledge to create meaningful change in the world.

This experience has shaped my academic goals and career aspirations. I want to pursue a degree in marine biology and environmental science, focusing on conservation and sustainable practices. I envision a future where I can contribute to the restoration of damaged marine ecosystems and develop innovative solutions to combat climate change's effects on our oceans.

The ocean that captivated me as a child continues to inspire me today, but now my wonder is coupled with purpose. I understand that protecting our planet's marine environments requires dedication, scientific rigor, and community engagement. I am ready to dive deeper into this field, to learn from leading researchers, and to contribute my passion and skills to preserving the underwater worlds that sparked my curiosity so many years ago.`,
    university_name: null,
    submission_date: '2024-03-10',
    status: 'pending',
    total_points: null,
    score: null,
  },
  {
    id: '2',
    student_name: 'James Mitchell',
    essay_type: 'personal_statement',
    essay_title: 'Common App Personal Statement',
    essay_content: `The rhythmic clacking of my keyboard has become the soundtrack to my life. At 2 AM, when most of my peers are asleep, I'm wide awake, debugging code and building applications that I hope will make a difference. Some might call this obsession unhealthy, but I call it passion. Programming isn't just a hobby for me; it's a language through which I express creativity, solve problems, and connect with others.

My journey into computer science began unexpectedly. Three years ago, my grandmother was diagnosed with early-onset Alzheimer's disease. Watching her struggle to remember faces, names, and daily tasks was heartbreaking. I felt helpless, unable to do anything meaningful to support her or my family during this difficult time. That helplessness transformed into determination when I discovered that technology could potentially help individuals with cognitive impairments maintain their independence and quality of life.

I taught myself Python through online courses and spent months researching memory assistance technologies. My goal was ambitious: to create a mobile application that could help my grandmother navigate her daily routine, recognize family members, and maintain important memories. I called it "MemoryKeeper."

The development process was challenging. I had to learn not only programming but also user interface design, database management, and the psychological aspects of memory loss. I consulted with my grandmother's neurologist, interviewed other families affected by Alzheimer's, and conducted extensive user testing with elderly volunteers from a local community center.

The final application included features like facial recognition for family members, voice-activated reminders for medications and appointments, and a digital memory book where family members could share photos and stories. When I finally presented the completed app to my grandmother, her reaction was everything I had hoped for. The joy on her face when the app helped her remember my cousin's name brought tears to my eyes.

What started as a personal project has evolved into something much larger. I've since refined MemoryKeeper, incorporating feedback from healthcare professionals and families. The app is now being beta-tested at three assisted living facilities in our region, and I've received interest from healthcare organizations about potential partnerships.

This experience taught me that the most meaningful applications of technology are those that address real human needs. It's not about creating the flashiest or most complex software; it's about understanding people's struggles and using technical skills to improve their lives in tangible ways.

As I look toward college and beyond, I'm excited to deepen my understanding of computer science, particularly in areas like artificial intelligence, human-computer interaction, and healthcare technology. I want to work at the intersection of technology and healthcare, developing innovative solutions that can help vulnerable populations live fuller, more independent lives.

My grandmother once told me that memories are what make us who we are. Through programming, I've found a way to help people hold onto those precious memories just a little bit longer. That's a mission worth staying up until 2 AM for.`,
    university_name: null,
    submission_date: '2024-03-08',
    status: 'reviewed',
    total_points: 100,
    score: 92,
  },
  {
    id: '3',
    student_name: 'Sarah Chen',
    essay_type: 'supplementary',
    essay_title: 'Why Stanford Engineering?',
    essay_content: `Stanford's commitment to innovation and interdisciplinary collaboration aligns perfectly with my aspirations as an aspiring biomedical engineer. The opportunity to work in the Bio-X program, where I could collaborate with researchers from medicine, engineering, and biology, represents exactly the kind of integrated approach I believe is necessary for solving complex healthcare challenges.

During my high school years, I've been particularly interested in developing affordable medical devices for underserved communities. I founded a nonprofit organization that designs and distributes low-cost prosthetics to children in developing countries. This experience showed me that the best engineering solutions aren't always the most technologically advanced; they're the ones that are accessible, sustainable, and designed with the end user in mind.

At Stanford, I'm excited to take courses like "Design for Extreme Affordability" and participate in the Global Development and Poverty Initiative. I want to learn from professors like Dr. James Landay, whose work on mobile health applications fascinates me. The chance to contribute to Stanford's culture of innovation while staying grounded in social impact is incredibly inspiring.

Beyond academics, I'm drawn to Stanford's collaborative and entrepreneurial spirit. I hope to join organizations like Stanford IEEE and potentially start my own venture through StartX. The university's location in Silicon Valley would provide unparalleled opportunities for internships and mentorship from industry leaders.

Most importantly, I believe Stanford would challenge me to think bigger and reach further than I ever thought possible. I want to be surrounded by peers who are as passionate about using engineering to create positive change in the world.`,
    university_name: 'Stanford University',
    submission_date: '2024-03-12',
    status: 'pending',
    total_points: null,
    score: null,
  },
];

const EssayReview: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>(DUMMY_ESSAYS);
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

  const handleEssayClick = (essayId: string) => {
    const essay = essays.find(e => e.id === essayId);
    if (essay) {
      setSelectedEssay(essay);
      setInlineComments([]);
      setGeneralComments([]);

      if (essay.status === 'pending') {
        const updatedEssays = essays.map(e =>
          e.id === essayId ? { ...e, status: 'in_review' as const } : e
        );
        setEssays(updatedEssays);
        setSelectedEssay({ ...essay, status: 'in_review' });
      }
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

  const handleAddInlineComment = () => {
    if (!selectedEssay || !selectedText || !commentInput.trim()) return;

    const newComment: InlineComment = {
      id: Date.now().toString(),
      counselor_name: 'Dr. Sarah Johnson',
      highlighted_text: selectedText.text,
      start_position: selectedText.start,
      end_position: selectedText.end,
      comment_text: commentInput,
    };

    setInlineComments([...inlineComments, newComment]);
    setCommentInput('');
    setSelectedText(null);
  };

  const handleDeleteInlineComment = (commentId: string) => {
    setInlineComments(inlineComments.filter(c => c.id !== commentId));
  };

  const handleAddGeneralComment = () => {
    if (!selectedEssay || !generalCommentInput.trim()) return;

    const newComment: GeneralComment = {
      id: Date.now().toString(),
      counselor_name: 'Dr. Sarah Johnson',
      comment_text: generalCommentInput,
      created_at: new Date().toISOString(),
    };

    setGeneralComments([newComment, ...generalComments]);
    setGeneralCommentInput('');
  };

  const handleMarkAsReviewed = () => {
    if (!selectedEssay) return;
    setShowGradeModal(true);
  };

  const handleSaveGrade = () => {
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
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Pending</span>
          </div>
        );
      case 'in_review':
        return (
          <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">In Review</span>
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
    : essays.filter(e => e.status === filter);

  const pendingCount = essays.filter(e => e.status === 'pending').length;
  const inReviewCount = essays.filter(e => e.status === 'in_review').length;
  const reviewedCount = essays.filter(e => e.status === 'reviewed').length;
  const reviewProgress = calculateReviewProgress();

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
                {selectedEssay.student_name} • {selectedEssay.essay_type === 'personal_statement' ? 'Personal Statement' : 'Supplementary Essay'}
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

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-600">Unreviewed</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-600">In Review</span>
              <AlertCircle className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{inReviewCount}</p>
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
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('in_review')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'in_review'
                ? 'bg-[#04ADEE] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            In Review ({inReviewCount})
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
                      {essay.student_name} • {essay.essay_type === 'personal_statement' ? 'Personal Statement' : 'Supplementary Essay'}
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
