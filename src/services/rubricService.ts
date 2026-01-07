import { supabase } from '../config/supabase';

export interface RubricItem {
  id: string;
  counselor_id: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const rubricService = {
  async getRubricItems(counselorId: string): Promise<RubricItem[]> {
    const { data, error } = await supabase
      .from('essay_rubrics')
      .select('*')
      .eq('counselor_id', counselorId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching rubric items:', error);
      throw error;
    }

    return data || [];
  },

  async addRubricItem(
    counselorId: string,
    name: string,
    description: string,
    sortOrder: number
  ): Promise<RubricItem> {
    const { data, error } = await supabase
      .from('essay_rubrics')
      .insert({
        counselor_id: counselorId,
        name,
        description,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding rubric item:', error);
      throw error;
    }

    return data;
  },

  async updateRubricItem(
    itemId: string,
    name: string,
    description: string
  ): Promise<RubricItem> {
    const { data, error } = await supabase
      .from('essay_rubrics')
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating rubric item:', error);
      throw error;
    }

    return data;
  },

  async deleteRubricItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('essay_rubrics')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting rubric item:', error);
      throw error;
    }
  },

  async reorderRubricItems(items: { id: string; sort_order: number }[]): Promise<void> {
    const updates = items.map((item) =>
      supabase
        .from('essay_rubrics')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    );

    await Promise.all(updates);
  },
};
