import { supabase } from '../config/supabase';

export interface Rubric {
  id: string;
  counselor_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RubricCriterion {
  id: string;
  rubric_id: string;
  name: string;
  description: string | null;
  position: number;
  created_at: string;
}

export interface EssayReview {
  id: string;
  student_name: string;
  essay_title: string;
  rubric_id: string;
  counselor_id: string;
  overall_assessment: string | null;
  revision_priorities: string[] | null;
  status: 'in_progress' | 'completed';
  created_at: string;
  completed_at: string | null;
}

export interface CriterionFeedback {
  id: string;
  review_id: string;
  criterion_id: string;
  score: number | null;
  score_explanation: string | null;
  improvement_guidance: string | null;
  reference_section: string | null;
  status: 'not_reviewed' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export const rubricService = {
  async getRubrics(): Promise<Rubric[]> {
    const { data, error } = await supabase
      .from('rubrics')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getRubricById(rubricId: string): Promise<Rubric | null> {
    const { data, error } = await supabase
      .from('rubrics')
      .select('*')
      .eq('id', rubricId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createRubric(counselorId: string, name: string, description: string | null = null): Promise<Rubric> {
    const { data, error } = await supabase
      .from('rubrics')
      .insert({
        counselor_id: counselorId,
        name,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRubric(rubricId: string, updates: Partial<Pick<Rubric, 'name' | 'description'>>): Promise<Rubric> {
    const { data, error } = await supabase
      .from('rubrics')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rubricId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRubric(rubricId: string): Promise<void> {
    const { error } = await supabase
      .from('rubrics')
      .delete()
      .eq('id', rubricId);

    if (error) throw error;
  },

  async getCriteria(rubricId: string): Promise<RubricCriterion[]> {
    const { data, error } = await supabase
      .from('rubric_criteria')
      .select('*')
      .eq('rubric_id', rubricId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createCriterion(
    rubricId: string,
    name: string,
    description: string | null = null,
    position: number = 0
  ): Promise<RubricCriterion> {
    const { data, error } = await supabase
      .from('rubric_criteria')
      .insert({
        rubric_id: rubricId,
        name,
        description,
        position,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCriterion(
    criterionId: string,
    updates: Partial<Pick<RubricCriterion, 'name' | 'description' | 'position'>>
  ): Promise<RubricCriterion> {
    const { data, error } = await supabase
      .from('rubric_criteria')
      .update(updates)
      .eq('id', criterionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCriterion(criterionId: string): Promise<void> {
    const { error } = await supabase
      .from('rubric_criteria')
      .delete()
      .eq('id', criterionId);

    if (error) throw error;
  },

  async reorderCriteria(criteriaUpdates: { id: string; position: number }[]): Promise<void> {
    const promises = criteriaUpdates.map(({ id, position }) =>
      supabase
        .from('rubric_criteria')
        .update({ position })
        .eq('id', id)
    );

    await Promise.all(promises);
  },

  async getReview(studentName: string, essayTitle: string): Promise<EssayReview | null> {
    const { data, error } = await supabase
      .from('essay_reviews')
      .select('*')
      .eq('student_name', studentName)
      .eq('essay_title', essayTitle)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createReview(
    studentName: string,
    essayTitle: string,
    rubricId: string,
    counselorId: string
  ): Promise<EssayReview> {
    const { data, error } = await supabase
      .from('essay_reviews')
      .insert({
        student_name: studentName,
        essay_title: essayTitle,
        rubric_id: rubricId,
        counselor_id: counselorId,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) throw error;

    const criteria = await this.getCriteria(rubricId);
    await Promise.all(
      criteria.map(criterion =>
        supabase.from('criterion_feedback').insert({
          review_id: data.id,
          criterion_id: criterion.id,
          status: 'not_reviewed',
        })
      )
    );

    return data;
  },

  async updateReview(
    reviewId: string,
    updates: Partial<Pick<EssayReview, 'overall_assessment' | 'revision_priorities' | 'status'>>
  ): Promise<EssayReview> {
    const updateData: any = { ...updates };

    if (updates.status === 'completed' && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('essay_reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCriterionFeedback(reviewId: string): Promise<CriterionFeedback[]> {
    const { data, error } = await supabase
      .from('criterion_feedback')
      .select('*')
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateCriterionFeedback(
    feedbackId: string,
    updates: Partial<Pick<CriterionFeedback, 'score' | 'score_explanation' | 'improvement_guidance' | 'reference_section' | 'status'>>
  ): Promise<CriterionFeedback> {
    const { data, error } = await supabase
      .from('criterion_feedback')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getReviewWithDetails(reviewId: string): Promise<{
    review: EssayReview;
    rubric: Rubric;
    criteria: RubricCriterion[];
    feedback: CriterionFeedback[];
  } | null> {
    const { data: review, error: reviewError } = await supabase
      .from('essay_reviews')
      .select('*')
      .eq('id', reviewId)
      .maybeSingle();

    if (reviewError || !review) return null;

    const [rubric, criteria, feedback] = await Promise.all([
      this.getRubricById(review.rubric_id),
      this.getCriteria(review.rubric_id),
      this.getCriterionFeedback(reviewId),
    ]);

    if (!rubric) return null;

    return { review, rubric, criteria, feedback };
  },
};
