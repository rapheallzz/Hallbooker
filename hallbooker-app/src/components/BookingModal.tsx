'use client';

import { FC, useState } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';
import Calendar from './Calendar';
import { Range } from 'react-date-range';

interface BookingModalProps {
  hallId: string;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: FC<BookingModalProps> = ({ hallId, isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [eventType, setEventType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }
    setLoading(true);
    setError('');

    try {
      const bookingResponse = await api.post('/bookings', {
        hall: hallId,
        startTime: dateRange.startDate?.toISOString(),
        endTime: dateRange.endDate?.toISOString(),
        numberOfPeople,
        eventType,
      });

      const bookingId = bookingResponse.data.data._id;
      const paymentResponse = await api.post(`/payments/initialize/${bookingId}`);
      const { authorization_url } = paymentResponse.data.data;

      if (authorization_url) {
        window.location.href = authorization_url;
      } else {
        setError('Could not retrieve payment URL. Please try again.');
      }
    } catch (err: any) {
      console.error('Booking failed:', err);
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-gray-800">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Book Hall</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {step === 1 && (
            <div className="flex justify-center">
              <Calendar
                unavailableDates={[]}
                onChange={(range) => setDateRange(range)}
              />
            </div>
          )}

          {step === 2 && (
            <>
              <div className="mb-4">
                <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700">
                  Number of People
                </label>
                <input
                  type="number"
                  id="numberOfPeople"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
                  Event Type
                </label>
                <input
                  type="text"
                  id="eventType"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
              <p><strong>Dates:</strong> {dateRange.startDate?.toLocaleDateString()} - {dateRange.endDate?.toLocaleDateString()}</p>
              <p><strong>Number of People:</strong> {numberOfPeople}</p>
              <p><strong>Event Type:</strong> {eventType}</p>
            </div>
          )}

          <div className="flex justify-end mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#295FA7] border border-transparent rounded-md shadow-sm hover:bg-[#204a8a]"
            >
              {step === 3 ? (loading ? 'Processing...' : 'Proceed to Payment') : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
