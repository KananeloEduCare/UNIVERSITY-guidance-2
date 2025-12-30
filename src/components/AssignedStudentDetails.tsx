import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  FileText,
  Mail,
  Clock,
  Edit3,
  Trash2,
  Plus,
  Save,
  X,
  Award,
  BookOpen,
  Users,
} from 'lucide-react';
import {
  AssignedStudent,
  UniversityAssignment,
  ApplicationProgress,
  getAssignedStudentDetails,
  updateApplicationProgress,
  createApplicationProgress,
  removeUniversityAssignment,
} from '../services/assignedStudentsService';

interface AssignedStudentDetailsProps {
  studentId: string;
  counselorId: string;
  onBack: () => void;
}

export default function AssignedStudentDetails({
  studentId,
  counselorId,
  onBack,
}: AssignedStudentDetailsProps) {
  const [student, setStudent] = useState<AssignedStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedUniversity, setExpandedUniversity] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [progressForm, setProgressForm] = useState<Partial<ApplicationProgress>>({});

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    setLoading(true);
    const data = await getAssignedStudentDetails(studentId, counselorId);
    setStudent(data);
    setLoading(false);
  };

  const handleSaveProgress = async (assignmentId: string, progressId?: string) => {
    if (progressId) {
      await updateApplicationProgress(progressId, progressForm, counselorId);
    } else {
      await createApplicationProgress(assignmentId, studentId, counselorId, progressForm);
    }
    setEditingProgress(null);
    setProgressForm({});
    loadStudentData();
  };

  const handleRemoveUniversity = async (assignmentId: string) => {
    if (confirm('Are you sure you want to remove this university assignment?')) {
      await removeUniversityAssignment(assignmentId, counselorId);
      loadStudentData();
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      submitted: 'bg-purple-100 text-purple-700',
      accepted: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      deferred: 'bg-amber-100 text-amber-700',
      waitlisted: 'bg-orange-100 text-orange-700',
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  const getTierColor = (tier: string) => {
    const colors = {
      reach: 'bg-rose-100 text-rose-700 border-rose-300',
      mid: 'bg-amber-100 text-amber-700 border-amber-300',
      safety: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    };
    return colors[tier as keyof typeof colors];
  };

  const getEssayStatusColor = (status: string) => {
    const colors = {
      not_started: 'text-gray-400',
      draft: 'text-blue-500',
      review: 'text-amber-500',
      final: 'text-emerald-500',
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04ADEE]"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Student not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-[#04ADEE] hover:text-[#0390cc] font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const reachCount = student.universities.filter(u => u.university_tier === 'reach').length;
  const midCount = student.universities.filter(u => u.university_tier === 'mid').length;
  const safetyCount = student.universities.filter(u => u.university_tier === 'safety').length;

  const submittedCount = student.universities.filter(u => u.progress?.status === 'submitted').length;
  const acceptedCount = student.universities.filter(u => u.progress?.status === 'accepted').length;
  const inProgressCount = student.universities.filter(u => u.progress?.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#04ADEE]/5">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-[#04ADEE] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#04ADEE] to-emerald-400 flex items-center justify-center text-white text-2xl font-bold">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{student.name}</h1>
                <p className="text-slate-600 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {student.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Composite: {student.composite_score.toFixed(1)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">Essays & Activities</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{student.essay_activities_rating.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <GraduationCap className="w-5 h-5" />
                <span className="text-sm font-medium">Academic Performance</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{student.academic_performance.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                {student.academic_trend >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">Academic Trend</span>
              </div>
              <p className="text-2xl font-bold text-emerald-900">
                {student.academic_trend >= 0 ? '+' : ''}{student.academic_trend.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-[#04ADEE]" />
              <h3 className="text-lg font-semibold text-slate-900">Universities</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Assigned</span>
                <span className="text-2xl font-bold text-slate-900">{student.universities.length}</span>
              </div>
              <div className="h-px bg-slate-200"></div>
              <div className="flex items-center justify-between">
                <span className="text-rose-600 text-sm">Reach</span>
                <span className="font-semibold text-rose-600">{reachCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-600 text-sm">Mid</span>
                <span className="font-semibold text-amber-600">{midCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 text-sm">Safety</span>
                <span className="font-semibold text-emerald-600">{safetyCount}</span>
              </div>
            </div>
          </div>

          <div className="col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-900">Application Progress</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">In Progress</p>
                <p className="text-3xl font-bold text-blue-900">{inProgressCount}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-700 font-medium mb-1">Submitted</p>
                <p className="text-3xl font-bold text-purple-900">{submittedCount}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <p className="text-sm text-emerald-700 font-medium mb-1">Accepted</p>
                <p className="text-3xl font-bold text-emerald-900">{acceptedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Assigned Universities</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#04ADEE] text-white rounded-lg hover:bg-[#0390cc] transition-colors">
              <Plus className="w-4 h-4" />
              Add University
            </button>
          </div>

          <div className="space-y-4">
            {student.universities.map((university) => (
              <div
                key={university.id}
                className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="p-6 cursor-pointer bg-gradient-to-r from-slate-50 to-white"
                  onClick={() =>
                    setExpandedUniversity(
                      expandedUniversity === university.id ? null : university.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#04ADEE] to-emerald-400 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {university.university_name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getTierColor(university.university_tier)}`}>
                            {university.university_tier.charAt(0).toUpperCase() + university.university_tier.slice(1)}
                          </span>
                          {university.progress && (
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(university.progress.status)}`}>
                              {university.progress.status.replace('_', ' ').toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {university.progress && (
                        <div className="flex items-center gap-4 mr-4">
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Essay Status</p>
                            <p className={`text-sm font-semibold ${getEssayStatusColor(university.progress.essay_status)}`}>
                              {university.progress.essay_status.charAt(0).toUpperCase() + university.progress.essay_status.slice(1)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Recommendations</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {university.progress.recommendation_letters}/{university.progress.recommendation_letters_needed}
                            </p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveUniversity(university.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {expandedUniversity === university.id && (
                  <div className="border-t border-slate-200 p-6 bg-white">
                    {editingProgress === university.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Application Status
                            </label>
                            <select
                              value={progressForm.status || university.progress?.status || 'not_started'}
                              onChange={(e) =>
                                setProgressForm({ ...progressForm, status: e.target.value as any })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                            >
                              <option value="not_started">Not Started</option>
                              <option value="in_progress">In Progress</option>
                              <option value="submitted">Submitted</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                              <option value="deferred">Deferred</option>
                              <option value="waitlisted">Waitlisted</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Essay Status
                            </label>
                            <select
                              value={progressForm.essay_status || university.progress?.essay_status || 'not_started'}
                              onChange={(e) =>
                                setProgressForm({ ...progressForm, essay_status: e.target.value as any })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                            >
                              <option value="not_started">Not Started</option>
                              <option value="draft">Draft</option>
                              <option value="review">Under Review</option>
                              <option value="final">Final</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Application Deadline
                            </label>
                            <input
                              type="date"
                              value={progressForm.application_deadline || university.progress?.application_deadline || ''}
                              onChange={(e) =>
                                setProgressForm({ ...progressForm, application_deadline: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Decision Date
                            </label>
                            <input
                              type="date"
                              value={progressForm.decision_date || university.progress?.decision_date || ''}
                              onChange={(e) =>
                                setProgressForm({ ...progressForm, decision_date: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Recommendation Letters (Completed)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={progressForm.recommendation_letters ?? university.progress?.recommendation_letters ?? 0}
                              onChange={(e) =>
                                setProgressForm({ ...progressForm, recommendation_letters: parseInt(e.target.value) })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Recommendation Letters (Required)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={progressForm.recommendation_letters_needed ?? university.progress?.recommendation_letters_needed ?? 2}
                              onChange={(e) =>
                                setProgressForm({ ...progressForm, recommendation_letters_needed: parseInt(e.target.value) })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Notes
                          </label>
                          <textarea
                            value={progressForm.notes || university.progress?.notes || ''}
                            onChange={(e) =>
                              setProgressForm({ ...progressForm, notes: e.target.value })
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#04ADEE] focus:border-transparent"
                            placeholder="Add notes about this application..."
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => {
                              setEditingProgress(null);
                              setProgressForm({});
                            }}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveProgress(university.id, university.progress?.id)}
                            className="px-4 py-2 bg-[#04ADEE] text-white rounded-lg hover:bg-[#0390cc] transition-colors flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save Progress
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {university.progress ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div className="flex items-center gap-2 text-slate-500 mb-2">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-sm font-medium">Application Deadline</span>
                                </div>
                                <p className="text-slate-900 font-semibold">
                                  {university.progress.application_deadline
                                    ? new Date(university.progress.application_deadline).toLocaleDateString()
                                    : 'Not set'}
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 text-slate-500 mb-2">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm font-medium">Decision Date</span>
                                </div>
                                <p className="text-slate-900 font-semibold">
                                  {university.progress.decision_date
                                    ? new Date(university.progress.decision_date).toLocaleDateString()
                                    : 'Not set'}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div className="flex items-center gap-2 text-slate-500 mb-2">
                                  <Users className="w-4 h-4" />
                                  <span className="text-sm font-medium">Recommendation Letters</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                                    <div
                                      className="bg-[#04ADEE] h-2 rounded-full transition-all"
                                      style={{
                                        width: `${(university.progress.recommendation_letters / university.progress.recommendation_letters_needed) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-semibold text-slate-900">
                                    {university.progress.recommendation_letters}/{university.progress.recommendation_letters_needed}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 text-slate-500 mb-2">
                                  <FileText className="w-4 h-4" />
                                  <span className="text-sm font-medium">Essay Progress</span>
                                </div>
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(university.progress.essay_status)}`}>
                                  {university.progress.essay_status.charAt(0).toUpperCase() + university.progress.essay_status.slice(1)}
                                </span>
                              </div>
                            </div>

                            {university.progress.notes && (
                              <div>
                                <div className="flex items-center gap-2 text-slate-500 mb-2">
                                  <FileText className="w-4 h-4" />
                                  <span className="text-sm font-medium">Notes</span>
                                </div>
                                <p className="text-slate-700 bg-slate-50 rounded-lg p-4">
                                  {university.progress.notes}
                                </p>
                              </div>
                            )}

                            <div className="flex justify-end pt-4">
                              <button
                                onClick={() => {
                                  setEditingProgress(university.id);
                                  setProgressForm(university.progress || {});
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit Progress
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 mb-4">No progress tracking yet</p>
                            <button
                              onClick={() => {
                                setEditingProgress(university.id);
                                setProgressForm({});
                              }}
                              className="px-4 py-2 bg-[#04ADEE] text-white rounded-lg hover:bg-[#0390cc] transition-colors"
                            >
                              Start Tracking
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {student.universities.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg mb-2">No universities assigned yet</p>
                <p className="text-slate-400 text-sm">Start by adding universities to this student's list</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
