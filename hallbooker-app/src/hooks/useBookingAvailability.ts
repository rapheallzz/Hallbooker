
import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/services/api';
import { Hall, UnavailableDate } from '@/types';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export const useBookingAvailability = (hall: Hall | null, selectedDates: Date[] | undefined, displayedMonth: Date) => {
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnavailableDates = async () => {
      if (!hall) {
        setUnavailableDates([]);
        return;
      }
      setLoading(true);

      const startDate = format(startOfMonth(displayedMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(displayedMonth), 'yyyy-MM-dd');

      try {
        const response = await api.get(`/halls/${hall._id}/unavailable-dates`, {
          params: { startDate, endDate },
        });
        setUnavailableDates(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch unavailable dates:', error);
        setUnavailableDates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUnavailableDates();
  }, [hall, displayedMonth]);

  const disabledHours = useMemo(() => {
    if (!hall || !selectedDates || selectedDates.length === 0 || !Array.isArray(unavailableDates)) {
      return [];
    }
    const openingHour = hall.openingHour || 0;
    const closingHour = hall.closingHour || 24;
    const disabled: number[] = [];

    const selectedDays = selectedDates.map(d => new Date(d).setHours(0, 0, 0, 0));

    const isToday = selectedDays.some(day => {
        const today = new Date().setHours(0, 0, 0, 0);
        return day === today;
    });

    if (isToday) {
        const currentHour = new Date().getHours();
        for (let i = 0; i < currentHour; i++) {
            disabled.push(i);
        }
    }

    unavailableDates.forEach(unavailable => {
      const bufferStartTime = new Date(unavailable.bufferTime.startTime);
      const bufferDay = new Date(bufferStartTime).setHours(0, 0, 0, 0);

      if (selectedDays.includes(bufferDay)) {
        const bufferEndTime = new Date(unavailable.bufferTime.endTime);

        const startHour = bufferStartTime.getHours();
        const endHour = bufferEndTime.getMinutes() > 0 ? bufferEndTime.getHours() + 1 : bufferEndTime.getHours();

        const finalBlockStart = Math.max(openingHour, startHour);
        const finalBlockEnd = Math.min(closingHour, endHour);

        for (let i = finalBlockStart; i < finalBlockEnd; i++) {
          if (!disabled.includes(i)) {
            disabled.push(i);
          }
        }
      }
    });

    return disabled.sort((a, b) => a - b);
  }, [unavailableDates, hall, selectedDates]);

  const getDisabledHoursForDate = useCallback((date: Date) => {
    if (!hall || !Array.isArray(unavailableDates)) {
      return [];
    }
    const openingHour = hall.openingHour || 0;
    const closingHour = hall.closingHour || 24;
    const disabled: number[] = [];

    const targetDay = new Date(date).setHours(0, 0, 0, 0);

    const today = new Date().setHours(0, 0, 0, 0);
    if (targetDay === today) {
      const currentHour = new Date().getHours();
      for (let i = 0; i < currentHour; i++) {
        disabled.push(i);
      }
    }

    unavailableDates.forEach(unavailable => {
      const bufferStartTime = new Date(unavailable.bufferTime.startTime);
      const bufferDay = new Date(bufferStartTime).setHours(0, 0, 0, 0);

      if (targetDay === bufferDay) {
        const bufferEndTime = new Date(unavailable.bufferTime.endTime);

        const startHour = bufferStartTime.getHours();
        const endHour = bufferEndTime.getMinutes() > 0 ? bufferEndTime.getHours() + 1 : bufferEndTime.getHours();

        const finalBlockStart = Math.max(openingHour, startHour);
        const finalBlockEnd = Math.min(closingHour, endHour);

        for (let i = finalBlockStart; i < finalBlockEnd; i++) {
          if (!disabled.includes(i)) {
            disabled.push(i);
          }
        }
      }
    });

    return disabled.sort((a, b) => a - b);
  }, [unavailableDates, hall]);

  const getDateAvailability = useCallback((date: Date): 'fully booked' | 'partially booked' | 'fully available' => {
    if (!hall) return 'fully available';

    const openingHour = hall.openingHour || 0;
    const closingHour = hall.closingHour || 24;
    const totalHours = closingHour - openingHour;

    const dateToCheck = new Date(date).setHours(0, 0, 0, 0);

    const blockedIntervals: { start: number; end: number }[] = [];

    unavailableDates.forEach(unavailable => {
      const bufferStartTime = new Date(unavailable.bufferTime.startTime);
      const bufferDay = new Date(bufferStartTime).setHours(0, 0, 0, 0);

      if (dateToCheck === bufferDay) {
        const bufferEndTime = new Date(unavailable.bufferTime.endTime);
        const startHour = bufferStartTime.getHours();
        const endHour = bufferEndTime.getMinutes() > 0 ? bufferEndTime.getHours() + 1 : bufferEndTime.getHours();

        const finalBlockStart = Math.max(openingHour, startHour);
        const finalBlockEnd = Math.min(closingHour, endHour);

        if (finalBlockStart < finalBlockEnd) {
          blockedIntervals.push({ start: finalBlockStart, end: finalBlockEnd });
        }
      }
    });

    if (blockedIntervals.length === 0) {
      return 'fully available';
    }

    blockedIntervals.sort((a, b) => a.start - b.start);

    const mergedIntervals = [blockedIntervals[0]];

    for (let i = 1; i < blockedIntervals.length; i++) {
      const lastMerged = mergedIntervals[mergedIntervals.length - 1];
      const current = blockedIntervals[i];

      if (current.start < lastMerged.end) {
        lastMerged.end = Math.max(lastMerged.end, current.end);
      } else {
        mergedIntervals.push(current);
      }
    }

    const totalBlockedHours = mergedIntervals.reduce((total, interval) => {
      return total + (interval.end - interval.start);
    }, 0);

    const availableHours = totalHours - totalBlockedHours;

    if (availableHours <= 0) {
      return 'fully booked';
    } else if (availableHours < totalHours) {
      return 'partially booked';
    } else {
      return 'fully available';
    }
  }, [unavailableDates, hall]);

  return { disabledHours, loading, getDateAvailability, getDisabledHoursForDate };
};
