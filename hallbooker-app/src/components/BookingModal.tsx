'use client';

import { FC, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';
import Calendar from './Calendar';
import { Range } from 'react-date-range';
import { Hall, Facility } from '@/types';

interface BookingModalProps {
  hallId: string;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: FC<BookingModalProps> = ({ hallId, isOpen, onClose }) => {
  const [hall, setHall] = useState<Hall | null>(null);
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [eventDetails, setEventDetails] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<(Facility & { quantity: number })[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationInHours, setDurationInHours] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const generateTimeOptions = (openingHour: number, closingHour: number) => {
    const options = [];
    for (let i = openingHour; i <= closingHour; i++) {
      const time = `${i.toString().padStart(2, '0')}:00`;
      options.push(<option key={time} value={time}>{time}</option>);
    }
    return options;
  };

  useEffect(() => {
    if (startTime && endTime) {
      const start = parseInt(startTime.split(':')[0]);
      const end = parseInt(endTime.split(':')[0]);
      if (end > start) {
        setDurationInHours(end - start);
      } else {
        setDurationInHours(0);
      }
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (hall && dateRange.startDate && dateRange.endDate) {
      const dailyRate = hall.pricing.dailyRate || 0;

      // Normalize dates to midnight to ensure accurate day difference calculation
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the start day

      const hallCost = dailyRate * diffDays;

      const facilitiesCost = selectedFacilities.reduce((total, facility) => {
        const quantity = facility.quantity || 1;
        if (facility.chargeMethod === 'per_day') {
          return total + (facility.cost * diffDays * quantity);
        }
        if (facility.chargeMethod === 'per_hour') {
          return total + (facility.cost * durationInHours * diffDays * quantity);
        }
        // Defaults to a flat charge
        return total + (facility.cost * quantity);
      }, 0);

      setTotalPrice(hallCost + facilitiesCost);
    }
  }, [hall, dateRange, selectedFacilities, durationInHours]);

  useEffect(() => {
    if (isOpen) {
      const fetchHallDetails = async () => {
        try {
          const response = await api.get(`/halls/${hallId}`);
          setHall(response.data.data);
        } catch (error) {
          console.error('Failed to fetch hall details:', error);
          setError('Failed to load hall information. Please try again.');
        }
      };
      fetchHallDetails();
    }
  }, [hallId, isOpen]);

  const handleFacilityChange = (facility: Facility) => {
    setSelectedFacilities((prevSelected) => {
      const isSelected = prevSelected.some((f) => f._id === facility._id);
      if (isSelected) {
        return prevSelected.filter((f) => f._id !== facility._id);
      } else {
        // Add the facility with a default quantity of 1
        return [...prevSelected, { ...facility, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (facilityId: string, quantity: number) => {
    // Ensure quantity is at least 1
    const newQuantity = Math.max(1, quantity);
    setSelectedFacilities((prevSelected) =>
      prevSelected.map((f) =>
        f._id === facilityId ? { ...f, quantity: newQuantity } : f
      )
    );
  };

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

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const finalStartDate = new Date(startDate!);
      finalStartDate.setHours(startHour, startMinute, 0, 0);

      const finalEndDate = new Date(endDate || startDate!);
      finalEndDate.setHours(endHour, endMinute, 0, 0);

      const facilitiesPayload = selectedFacilities.map(f => ({
        facilityId: f._id,
        quantity: f.quantity,
      }));

      const bookingResponse = await api.post('/bookings', {
        hallId: hallId,
        startTime: finalStartDate.toISOString(),
        endTime: finalEndDate.toISOString(),
        eventDetails,
        selectedFacilities: facilitiesPayload,
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <select
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#295FA7] sm:text-sm"
                    required
                  >
                    <option value="">Select a time</option>
                    {hall && generateTimeOptions(hall.openingHour || 0, hall.closingHour || 23)}
                  </select>
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <select
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#295FA7] sm:text-sm"
                    required
                  >
                    <option value="">Select a time</option>
                    {hall && generateTimeOptions(hall.openingHour || 0, hall.closingHour || 23)}
                  </select>
                </div>
              </div>

              {hall && hall.facilities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Add Facilities</h4>
                  <div className="max-h-48 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 gap-y-3">
                      {hall.facilities.map((facility) => {
                        const isSelected = selectedFacilities.some(f => f._id === facility._id);
                        const selectedFacility = selectedFacilities.find(f => f._id === facility._id);
                        return (
                          <div key={facility._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                            <label className="flex items-center space-x-3 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-[#295FA7] focus:ring-[#295FA7]"
                                checked={isSelected}
                                onChange={() => handleFacilityChange(facility)}
                              />
                              <span className="text-gray-700">{facility.facility?.name || facility.name}</span>
                              <span className="text-gray-500 font-medium">
                                + ₦{facility.cost.toLocaleString()}{facility.chargeMethod === 'per_day' ? '/day' : (facility.chargeMethod === 'per_hour' ? '/hour' : '')}
                              </span>
                            </label>
                            {isSelected && (
                              <div className="w-24">
                                <input
                                  type="number"
                                  min="1"
                                  value={selectedFacility?.quantity || 1}
                                  onChange={(e) => handleQuantityChange(facility._id, parseInt(e.target.value, 10))}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#295FA7]"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <p className="text-lg font-semibold text-gray-800">
                        Total: ₦{totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

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
                  <span className="text-gray-600">Event Details:</span>
                  <span className="font-medium text-gray-900">{eventDetails}</span>
                </div>
                {selectedFacilities.length > 0 && (
                  <div className="pt-2">
                    <h4 className="font-medium text-gray-800">Selected Facilities:</h4>
                    <ul className="list-disc list-inside pl-4 text-gray-600">
                      {selectedFacilities.map(f => <li key={f._id}>{f.facility?.name || f.name}</li>)}
                    </ul>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span className="text-gray-800">Total Price:</span>
                    <span className="text-gray-900">₦{totalPrice.toLocaleString()}</span>
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
