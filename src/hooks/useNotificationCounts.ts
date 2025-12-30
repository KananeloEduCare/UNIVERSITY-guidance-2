import { useState, useEffect } from 'react';
import { database } from '../config/firebase';
import { ref, onValue } from 'firebase/database';

interface NotificationCounts {
  unreviewedEssays: number;
  pendingMeetings: number;
  unreadMessages: number;
}

export function useNotificationCounts(counselorId: string, counselorName: string) {
  const [counts, setCounts] = useState<NotificationCounts>({
    unreviewedEssays: 2,
    pendingMeetings: 0,
    unreadMessages: 3,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeslotsRef = ref(database, `University Data/Timeslots/${counselorName}`);

    const unsubscribe = onValue(timeslotsRef, (snapshot) => {
      let bookedCount = 0;

      if (snapshot.exists()) {
        const timeslots = snapshot.val();
        bookedCount = Object.values(timeslots).filter((isBooked) => isBooked === true).length;
      }

      setCounts({
        unreviewedEssays: 2,
        pendingMeetings: bookedCount,
        unreadMessages: 3,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [counselorName]);

  const refetch = () => {
    setLoading(true);
  };

  return { counts, loading, refetch };
}
