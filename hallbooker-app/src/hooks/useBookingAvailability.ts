
import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/services/api';
import { Booking, Hall } from '@/types';

export const useBookingAvailability = (hall: Hall | null, selectedDates: Date[] | undefined) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!hall) {
        setBookings([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/halls/${hall._id}/bookings`);
        setBookings(response.data.data.bookings || []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [hall]);

  const disabledHours = useMemo(() => {
    if (!hall || !selectedDates || selectedDates.length === 0 || !Array.isArray(bookings)) {
      return [];
    }

    const buffer = hall.bookingBufferInHours || 0;
    const openingHour = hall.openingHour || 0;
    const closingHour = hall.closingHour || 24;
    const disabled: number[] = [];

    const selectedDays = selectedDates.map(d => new Date(d).setHours(0, 0, 0, 0));

    bookings.forEach(booking => {
      booking.bookingDates.forEach(dateRange => {
        const bookingStartTime = new Date(dateRange.startTime);
        const bookingDay = new Date(bookingStartTime).setHours(0, 0, 0, 0);

        if (selectedDays.includes(bookingDay)) {
          const bookingEndTime = new Date(dateRange.endTime);

          const startHour = bookingStartTime.getHours();
          const endHour = bookingEndTime.getMinutes() > 0 ? bookingEndTime.getHours() + 1 : bookingEndTime.getHours();

          const blockStart = Math.floor(startHour - buffer);
          const blockEnd = Math.ceil(endHour + buffer);

          const finalBlockStart = Math.max(openingHour, blockStart);
          const finalBlockEnd = Math.min(closingHour, blockEnd);

          for (let i = finalBlockStart; i < finalBlockEnd; i++) {
            if (!disabled.includes(i)) {
              disabled.push(i);
            }
          }
        }
      });
    });

    return disabled.sort((a, b) => a - b);
  }, [bookings, hall, selectedDates]);

  const getDateAvailability = useCallback((date: Date): 'fully booked' | 'partially booked' | 'fully available' => {
    if (!hall) return 'fully available';

    const buffer = hall.bookingBufferInHours || 0;
    const openingHour = hall.openingHour || 0;
    const closingHour = hall.closingHour || 24;
    const totalHours = closingHour - openingHour;

    const dateToCheck = new Date(date).setHours(0, 0, 0, 0);

    const blockedIntervals: { start: number; end: number }[] = [];

    bookings.forEach(booking => {
      booking.bookingDates.forEach(dateRange => {
        const bookingStartTime = new Date(dateRange.startTime);
        const bookingDay = new Date(bookingStartTime).setHours(0, 0, 0, 0);

        if (dateToCheck === bookingDay) {
          const bookingEndTime = new Date(dateRange.endTime);
          const startHour = bookingStartTime.getHours();
          const endHour = bookingEndTime.getMinutes() > 0 ? bookingEndTime.getHours() + 1 : bookingEndTime.getHours();

          const blockStart = Math.floor(startHour - buffer);
          const blockEnd = Math.ceil(endHour + buffer);

          const finalBlockStart = Math.max(openingHour, blockStart);
          const finalBlockEnd = Math.min(closingHour, blockEnd);

          if (finalBlockStart < finalBlockEnd) {
            blockedIntervals.push({ start: finalBlockStart, end: finalBlockEnd });
          }
        }
      });
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
  }, [bookings, hall]);

  return { bookings, disabledHours, loading, getDateAvailability };
};
