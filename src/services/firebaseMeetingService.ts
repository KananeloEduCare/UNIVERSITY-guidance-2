import { database } from '../config/firebase';
import { ref, onValue, set, remove, push, get } from 'firebase/database';

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface MeetingRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  agenda: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedDate: string;
  requestedTime: string;
  rejectionReason?: string;
}

export const firebaseMeetingService = {
  async getCounselorAvailability(counselorName: string): Promise<AvailabilitySlot[]> {
    const timeslotsRef = ref(database, `University Data/Timeslots/${counselorName}`);

    try {
      const snapshot = await get(timeslotsRef);
      if (!snapshot.exists()) {
        return [];
      }

      const timeslots = snapshot.val();
      const slots: AvailabilitySlot[] = [];

      Object.keys(timeslots).forEach((slotKey) => {
        const isBooked = timeslots[slotKey];
        const [date, time] = slotKey.split('_');
        const [startTime, endTime] = time.split('-');

        slots.push({
          id: slotKey,
          date,
          startTime,
          endTime,
          isBooked
        });
      });

      return slots.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
    } catch (error) {
      console.error('Error fetching availability:', error);
      return [];
    }
  },

  async addAvailabilitySlot(
    counselorName: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<void> {
    const slotKey = `${date}_${startTime}-${endTime}`;
    const slotRef = ref(database, `University Data/Timeslots/${counselorName}/${slotKey}`);

    await set(slotRef, false);
  },

  async deleteAvailabilitySlot(counselorName: string, slotId: string): Promise<void> {
    const slotRef = ref(database, `University Data/Timeslots/${counselorName}/${slotId}`);
    await remove(slotRef);
  },

  async getMeetingRequests(counselorName: string): Promise<MeetingRequest[]> {
    const meetingsRef = ref(database, `University Data/MeetingRequests/${counselorName}`);

    try {
      const snapshot = await get(meetingsRef);
      if (!snapshot.exists()) {
        return [];
      }

      const meetings = snapshot.val();
      const requests: MeetingRequest[] = [];

      Object.keys(meetings).forEach((key) => {
        requests.push({
          id: key,
          ...meetings[key]
        });
      });

      return requests;
    } catch (error) {
      console.error('Error fetching meeting requests:', error);
      return [];
    }
  },

  listenToCounselorAvailability(
    counselorName: string,
    callback: (slots: AvailabilitySlot[]) => void
  ): () => void {
    const timeslotsRef = ref(database, `University Data/Timeslots/${counselorName}`);

    const unsubscribe = onValue(timeslotsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const timeslots = snapshot.val();
      const slots: AvailabilitySlot[] = [];

      Object.keys(timeslots).forEach((slotKey) => {
        const isBooked = timeslots[slotKey];
        const [date, time] = slotKey.split('_');
        const [startTime, endTime] = time.split('-');

        slots.push({
          id: slotKey,
          date,
          startTime,
          endTime,
          isBooked
        });
      });

      const sortedSlots = slots.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

      callback(sortedSlots);
    });

    return unsubscribe;
  },

  listenToMeetingRequests(
    counselorName: string,
    callback: (requests: MeetingRequest[]) => void
  ): () => void {
    const meetingsRef = ref(database, `University Data/MeetingRequests/${counselorName}`);

    const unsubscribe = onValue(meetingsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const meetings = snapshot.val();
      const requests: MeetingRequest[] = [];

      Object.keys(meetings).forEach((key) => {
        requests.push({
          id: key,
          ...meetings[key]
        });
      });

      callback(requests);
    });

    return unsubscribe;
  }
};
