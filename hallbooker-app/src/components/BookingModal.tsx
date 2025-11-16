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
  const [eventDetails, setEventDetails] = useState('');
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
      const { startDate, endDate } = dateRange;
      let finalEndDate = endDate;

      if (startDate && endDate && startDate.getTime() === endDate.getTime()) {
        finalEndDate = new Date(startDate);
        finalEndDate.setHours(23, 59, 59, 999);
      }

      const bookingResponse = await api.post('/bookings', {
        hallId: hallId,
        startTime: startDate?.toISOString(),
        endTime: finalEndDate?.toISOString(),
        numberOfPeople,
        eventDetails,
      });

      const bookingId = bookingResponse.data.data.bookingId;
      const paymentResponse = await api.post(`/payments/initialize/${bookingId}`);
      const { checkoutUrl } = paymentResponse.data.data;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center text-gray-800 transition-opacity duration-300">
      <div className={`bg-white rounded-xl shadow-2xl p-6 w-full ${step === 1 ? 'max-w-2xl' : 'max-w-md'} transform transition-all duration-300`}>
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Book Your Hall</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

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
                <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of People
                </label>
                <input
                  type="number"
                  id="numberOfPeople"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#295FA7] focus:border-transparent sm:text-sm"
                  required
                  min="1"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="eventDetails" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Details
                </label>
                <input
                  type="text"
                  id="eventDetails"
                  value={eventDetails}
                  onChange={(e) => setEventDetails(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#295FA7] focus:border-transparent sm:text-sm"
                  required
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dates:</span>
                  <span className="font-medium text-gray-900">{dateRange.startDate?.toLocaleDateString()} - {dateRange.endDate?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Guests:</span>
                  <span className="font-medium text-gray-900">{numberOfPeople}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Details:</span>
                  <span className="font-medium text-gray-900">{eventDetails}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="mr-3 px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 transition-colors duration-200"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#295FA7] border border-transparent rounded-lg shadow-sm hover:bg-[#204a8a] transition-colors duration-200 disabled:opacity-50"
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
