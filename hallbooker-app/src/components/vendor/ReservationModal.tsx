
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Calendar from '../Calendar';
import { format } from 'date-fns';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reservationData: Record<string, unknown>) => void;
  hallId: string;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, onSubmit, hallId }) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [displayedMonth, setDisplayedMonth] = useState(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0) {
      alert('Please select at least one date.');
      return;
    }

    const bookingDates = selectedDates.map((date) => ({
      startTime: new Date(date.setHours(9, 0, 0, 0)).toISOString(),
      endTime: new Date(date.setHours(23, 0, 0, 0)).toISOString(),
    }));

    onSubmit({
      hallId,
      bookingDates,
      eventDetails: 'Owner Reservation (Blocked)',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Block Dates</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Select Dates to Block</label>
            <Calendar
              selectedDates={selectedDates}
              onChange={(dates) => setSelectedDates(dates || [])}
              displayedMonth={displayedMonth}
              onMonthChange={setDisplayedMonth}
              unavailableDates={[]}
            />
          </div>
          {selectedDates.length > 0 && (
            <div className="text-sm text-gray-600">
              Selected: {selectedDates.map(d => format(d, 'MMM d')).join(', ')}
            </div>
          )}
          <div className="flex justify-end mt-8">
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">
              Confirm Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
