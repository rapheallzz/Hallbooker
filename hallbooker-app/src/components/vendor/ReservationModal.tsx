'use client';

import { useState } from 'react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reservationData: any) => void;
  hallId: string;
}

const weekDays = [
  { name: 'Sunday', value: 0 },
  { name: 'Monday', value: 1 },
  { name: 'Tuesday', value: 2 },
  { name: 'Wednesday', value: 3 },
  { name: 'Thursday', value: 4 },
  { name: 'Friday', value: 5 },
  { name: 'Saturday', value: 6 },
];

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, onSubmit, hallId }) => {
  const [formData, setFormData] = useState({
    pattern: 'date-range',
    startDate: '',
    endDate: '',
    days: [] as number[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayChange = (dayValue: number) => {
    setFormData((prev) => {
      const newDays = prev.days.includes(dayValue)
        ? prev.days.filter((d) => d !== dayValue)
        : [...prev.days, dayValue];
      return { ...prev, days: newDays };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hallId) {
      alert('A hall must be selected to create a reservation.');
      return;
    }
    onSubmit({ ...formData, hallId });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Block Dates (Create Reservation)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Days of the Week</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {weekDays.map((day) => (
                <label key={day.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.days.includes(day.value)}
                    onChange={() => handleDayChange(day.value)}
                    className="rounded"
                  />
                  <span>{day.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-8 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">Create Reservation</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
