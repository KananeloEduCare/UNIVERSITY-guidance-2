import { supabase } from '../config/supabase';

export interface Essay {
  id: string;
  student_id: string;
  student_name: string;
  essay_type: 'personal_statement' | 'supplementary';
  essay_title: string;
  essay_content: string;
  university_name: string | null;
  submission_date: string;
  status: 'pending' | 'in_review' | 'reviewed';
  total_points: number | null;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export interface InlineComment {
  id: string;
  essay_id: string;
  counselor_id: string;
  counselor_name: string;
  highlighted_text: string;
  start_position: number;
  end_position: number;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export interface GeneralComment {
  id: string;
  essay_id: string;
  counselor_id: string;
  counselor_name: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export const getAllEssays = async (): Promise<Essay[]> => {
  const { data, error } = await supabase
    .from('student_essays')
    .select('*')
    .order('submission_date', { ascending: false });

  if (error) {
    console.error('Error fetching essays:', error);
    return [];
  }

  return data || [];
};

export const getEssayById = async (essayId: string): Promise<Essay | null> => {
  const { data, error } = await supabase
    .from('student_essays')
    .select('*')
    .eq('id', essayId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching essay:', error);
    return null;
  }

  return data;
};

export const updateEssayStatus = async (
  essayId: string,
  status: 'pending' | 'in_review' | 'reviewed'
): Promise<boolean> => {
  const { error } = await supabase
    .from('student_essays')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', essayId);

  if (error) {
    console.error('Error updating essay status:', error);
    return false;
  }

  return true;
};

export const getInlineComments = async (essayId: string): Promise<InlineComment[]> => {
  const { data, error } = await supabase
    .from('essay_inline_comments')
    .select('*')
    .eq('essay_id', essayId)
    .order('start_position', { ascending: true });

  if (error) {
    console.error('Error fetching inline comments:', error);
    return [];
  }

  return data || [];
};

export const addInlineComment = async (
  essayId: string,
  counselorId: string,
  counselorName: string,
  highlightedText: string,
  startPosition: number,
  endPosition: number,
  commentText: string
): Promise<InlineComment | null> => {
  const { data, error } = await supabase
    .from('essay_inline_comments')
    .insert({
      essay_id: essayId,
      counselor_id: counselorId,
      counselor_name: counselorName,
      highlighted_text: highlightedText,
      start_position: startPosition,
      end_position: endPosition,
      comment_text: commentText,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding inline comment:', error);
    return null;
  }

  return data;
};

export const deleteInlineComment = async (commentId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('essay_inline_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting inline comment:', error);
    return false;
  }

  return true;
};

export const getGeneralComments = async (essayId: string): Promise<GeneralComment[]> => {
  const { data, error } = await supabase
    .from('essay_general_comments')
    .select('*')
    .eq('essay_id', essayId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching general comments:', error);
    return [];
  }

  return data || [];
};

export const addGeneralComment = async (
  essayId: string,
  counselorId: string,
  counselorName: string,
  commentText: string
): Promise<GeneralComment | null> => {
  const { data, error } = await supabase
    .from('essay_general_comments')
    .insert({
      essay_id: essayId,
      counselor_id: counselorId,
      counselor_name: counselorName,
      comment_text: commentText,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding general comment:', error);
    return null;
  }

  return data;
};

export const updateGeneralComment = async (
  commentId: string,
  commentText: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('essay_general_comments')
    .update({ comment_text: commentText, updated_at: new Date().toISOString() })
    .eq('id', commentId);

  if (error) {
    console.error('Error updating general comment:', error);
    return false;
  }

  return true;
};

export const deleteGeneralComment = async (commentId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('essay_general_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting general comment:', error);
    return false;
  }

  return true;
};

export const gradeEssay = async (
  essayId: string,
  totalPoints: number,
  score: number
): Promise<boolean> => {
  const { error } = await supabase
    .from('student_essays')
    .update({
      total_points: totalPoints,
      score,
      status: 'reviewed',
      updated_at: new Date().toISOString()
    })
    .eq('id', essayId);

  if (error) {
    console.error('Error grading essay:', error);
    return false;
  }

  return true;
};
