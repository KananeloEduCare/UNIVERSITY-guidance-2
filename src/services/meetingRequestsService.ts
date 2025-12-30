import { supabase } from '../config/supabase';

export interface AvailabilitySlot {
  id: string;
  counselor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

export interface MeetingRequest {
  id: string;
  student_id: string;
  counselor_id: string;
  availability_id?: string;
  agenda: string;
  status: 'pending' | 'accepted' | 'rejected';
  rejection_reason?: string;
  requested_date: string;
  requested_time: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
}

export const meetingRequestsService = {
  async getCounselorAvailability(counselorId: string): Promise<AvailabilitySlot[]> {
    const { data, error } = await supabase
      .from('counselor_availability')
      .select('*')
      .eq('counselor_id', counselorId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addAvailabilitySlot(
    counselorId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<AvailabilitySlot> {
    const { data, error } = await supabase
      .from('counselor_availability')
      .insert({
        counselor_id: counselorId,
        date,
        start_time: startTime,
        end_time: endTime,
        is_booked: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAvailabilitySlot(slotId: string): Promise<void> {
    const { error } = await supabase
      .from('counselor_availability')
      .delete()
      .eq('id', slotId);

    if (error) throw error;
  },

  async getMeetingRequests(counselorId: string): Promise<MeetingRequest[]> {
    const { data, error } = await supabase
      .from('meeting_requests')
      .select(`
        *,
        student:pool_students!meeting_requests_student_id_fkey(
          id,
          name,
          email
        )
      `)
      .eq('counselor_id', counselorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(item => ({
      ...item,
      student: Array.isArray(item.student) ? item.student[0] : item.student
    })) || [];
  },

  async acceptMeetingRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('meeting_requests')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
  },

  async rejectMeetingRequest(requestId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('meeting_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
  },

  async getMeetingRequestStats(counselorId: string) {
    const { data, error } = await supabase
      .from('meeting_requests')
      .select('status')
      .eq('counselor_id', counselorId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(r => r.status === 'pending').length || 0,
      accepted: data?.filter(r => r.status === 'accepted').length || 0,
      rejected: data?.filter(r => r.status === 'rejected').length || 0,
    };

    return stats;
  },

  async createMeetingRequest(
    studentId: string,
    counselorId: string,
    availabilityId: string,
    date: string,
    time: string,
    agenda: string
  ): Promise<MeetingRequest> {
    const { data, error } = await supabase
      .from('meeting_requests')
      .insert({
        student_id: studentId,
        counselor_id: counselorId,
        availability_id: availabilityId,
        requested_date: date,
        requested_time: time,
        agenda,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStudentMeetingRequests(studentId: string): Promise<MeetingRequest[]> {
    const { data, error } = await supabase
      .from('meeting_requests')
      .select(`
        *,
        counselor:counselors!meeting_requests_counselor_id_fkey(
          id,
          name,
          email
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};