'use client';

import { FC, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';
import { Hall, Facility } from '@/types';
import { DateRange } from 'react-day-picker';
import { CalendarMode } from './Calendar';

interface BookingModalProps {
  hallId: string;
  isOpen: boolean;
  onClose: () => void;
  selectionMode: CalendarMode;
  selectedRange?: DateRange;
  selectedMultiple?: Date[];
}

const BookingModal: FC<BookingModalProps> = ({ hallId, isOpen, onClose, selectionMode, selectedRange, selectedMultiple = [] }) => {
  const [hall, setHall] = useState<Hall | null>(null);
  const [singleSelectedDate, setSingleSelectedDate] = useState<Date | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [eventDetails, setEventDetails] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<(Facility & { quantity: number })[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationInHours, setDurationInHours] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isMultiDateSelection = selectionMode === 'multiple' && selectedMultiple.length > 1;
  const [step, setStep] = useState(isMultiDateSelection ? 1 : 2);

  useEffect(() => {
    // Reset step when the modal is opened or selection mode changes
    setStep(isMultiDateSelection ? 1 : 2);
  }, [isOpen, selectionMode, isMultiDateSelection]);

  useEffect(() => {
    if (selectionMode === 'multiple' && selectedMultiple.length === 1) {
      setSingleSelectedDate(selectedMultiple[0]);
    } else {
      setSingleSelectedDate(null);
    }
  }, [selectionMode, selectedMultiple]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const generateTimeOptions = (openingHour: number, closingHour: number) => {
    const options = [];
    for (let i = openingHour; i <= closingHour; i++) {
      options.push(<option key={i} value={`${i}:00`}>{`${i}:00`}</option>);
    }
    return options;
  };

  useEffect(() => {
    if (startTime && endTime) {
      const start = parseInt(startTime.split(':')[0]);
      const end = parseInt(endTime.split(':')[0]);
      setDurationInHours(end > start ? end - start : 0);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (!hall) return;

    const dailyRate = hall.pricing.dailyRate || 0;
    let numDays = 0;

    if (selectionMode === 'range' && selectedRange?.from && selectedRange?.to) {
      const diffTime = Math.abs(selectedRange.to.getTime() - selectedRange.from.getTime());
      numDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else if (selectionMode === 'multiple') {
      if (singleSelectedDate) {
        numDays = 1;
      } else {
        // If no single date is chosen yet from multiple, we can show a placeholder price or 0
        setTotalPrice(0);
        return;
      }
    }

    const hallCost = dailyRate * numDays;
    const facilitiesCost = selectedFacilities.reduce((total, facility) => {
      const quantity = facility.quantity || 1;
      let cost = 0;
      if (facility.chargeMethod === 'per_day') {
        cost = facility.cost * numDays;
      } else if (facility.chargeMethod === 'per_hour') {
        cost = facility.cost * durationInHours * numDays;
      } else {
        cost = facility.cost; // Flat
      }
      return total + (cost * quantity);
    }, 0);

    setTotalPrice(hallCost + facilitiesCost);

  }, [hall, selectionMode, selectedRange, singleSelectedDate, selectedFacilities, durationInHours]);


  useEffect(() => {
    if (isOpen) {
      const fetchHallDetails = async () => {
        try {
          const response = await api.get(`/halls/${hallId}`);
          setHall(response.data.data);
        } catch (error) {
          setError('Failed to load hall information.');
        }
      };
      fetchHallDetails();
    }
  }, [hallId, isOpen]);

  const handleFacilityChange = (facility: Facility) => {
    setSelectedFacilities(prev =>
      prev.some(f => f._id === facility._id)
        ? prev.filter(f => f._id !== facility._id)
        : [...prev, { ...facility, quantity: 1 }]
    );
  };

  const handleQuantityChange = (facilityId: string, quantity: number) => {
    setSelectedFacilities(prev =>
      prev.map(f => (f._id === facilityId ? { ...f, quantity: Math.max(1, quantity) } : f))
    );
  };

  const handleRangeSubmit = async () => {
    if (!selectedRange?.from || !selectedRange?.to) {
        setError('Please select a valid date range.');
        return;
    }
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const finalStartDate = new Date(selectedRange.from);
    finalStartDate.setHours(startHour, startMinute);

    const finalEndDate = new Date(selectedRange.to);
    finalEndDate.setHours(endHour, endMinute);

    return {
        startTime: finalStartDate.toISOString(),
        endTime: finalEndDate.toISOString(),
    };
  };

  const handleMultipleSubmit = async () => {
    if (!singleSelectedDate) {
        setError('Please select a date to book.');
        return null;
    }
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const finalStartDate = new Date(singleSelectedDate);
    finalStartDate.setHours(startHour, startMinute);

    const finalEndDate = new Date(singleSelectedDate);
    finalEndDate.setHours(endHour, endMinute);

    return {
        startTime: finalStartDate.toISOString(),
        endTime: finalEndDate.toISOString(),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectionMode === 'multiple' && step === 1 && selectedMultiple.length > 1 && !singleSelectedDate) {
        setError('Please select a date to book from the list.');
        return;
    }

    if (step < 3) {
      nextStep();
      return;
    }

    setLoading(true);

    try {
        let bookingTimes;
        if (selectionMode === 'range') {
            bookingTimes = await handleRangeSubmit();
        } else {
            bookingTimes = await handleMultipleSubmit();
        }

        if (!bookingTimes) {
            setLoading(false);
            return;
        }

        const facilitiesPayload = selectedFacilities.map(f => ({
            facilityId: f._id,
            quantity: f.quantity,
        }));

        const bookingResponse = await api.post('/bookings', {
            hallId,
            ...bookingTimes,
            numberOfPeople,
            eventDetails,
            selectedFacilities: facilitiesPayload,
        });

        const bookingId = bookingResponse.data.data.bookingId;
        const paymentResponse = await api.post(`/payments/initialize/${bookingId}`);
        const { checkoutUrl } = paymentResponse.data.data;

        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        } else {
            setError('Could not retrieve payment URL.');
        }
    } catch (err: any) {
        setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        if (!isMultiDateSelection) return null;
        return (
          <div>
            <h3 className="text-lg font-semibold mb-3">Select a Date to Book</h3>
            <p className="text-sm text-gray-600 mb-4">You can only book one date at a time. Please choose one to proceed.</p>
            <div className="space-y-2">
              {selectedMultiple.map(date => (
                <label key={date.toISOString()} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
                  <input type="radio" name="selectedDate" value={date.toISOString()} checked={singleSelectedDate?.toISOString() === date.toISOString()} onChange={() => setSingleSelectedDate(date)} className="h-4 w-4 text-[#295FA7] focus:ring-[#295FA7]"/>
                  <span className="ml-3">{date.toLocaleDateString()}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <>
            <div className="mb-4">
              <label htmlFor="numberOfPeople" className="block text-sm font-medium">Number of People</label>
              <input type="number" id="numberOfPeople" value={numberOfPeople} onChange={e => setNumberOfPeople(Number(e.target.value))} className="mt-1 w-full p-2 border rounded" required min="1"/>
            </div>
            <div className="mb-6">
              <label htmlFor="eventDetails" className="block text-sm font-medium">Event Details</label>
              <input type="text" id="eventDetails" value={eventDetails} onChange={e => setEventDetails(e.target.value)} className="mt-1 w-full p-2 border rounded" required/>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium">Start Time</label>
                <select id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 w-full p-2 border rounded" required>
                  <option value="">Select</option>
                  {hall && generateTimeOptions(hall.openingHour || 0, hall.closingHour || 23)}
                </select>
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium">End Time</label>
                <select id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 w-full p-2 border rounded" required>
                  <option value="">Select</option>
                  {hall && generateTimeOptions(hall.openingHour || 0, hall.closingHour || 23)}
                </select>
              </div>
            </div>
            {hall?.facilities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Add Facilities</h4>
                  <div className="max-h-48 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 gap-y-3">
                      {hall.facilities.map((facility) => {
                        const isSelected = selectedFacilities.some(f => f._id === facility._id);
                        return (
                          <div key={facility._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                            <label className="flex items-center space-x-3 text-sm cursor-pointer">
                              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#295FA7] focus:ring-[#295FA7]" checked={isSelected} onChange={() => handleFacilityChange(facility)} />
                              <span className="text-gray-700">{facility.facility?.name || facility.name}</span>
                              <span className="text-gray-500 font-medium">+ ₦{facility.cost.toLocaleString()}{facility.chargeMethod === 'per_day' ? '/day' : facility.chargeMethod === 'per_hour' ? '/hour' : ''}</span>
                            </label>
                            {isSelected && <input type="number" min="1" value={selectedFacilities.find(f => f._id === facility._id)?.quantity || 1} onChange={(e) => handleQuantityChange(facility._id, parseInt(e.target.value, 10))} className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
          </>
        );
      case 3:
        let datesDisplay = '';
        if (selectionMode === 'range' && selectedRange?.from) {
            datesDisplay = `${selectedRange.from.toLocaleDateString()} - ${selectedRange.to?.toLocaleDateString()}`;
        } else if (selectionMode === 'multiple' && singleSelectedDate) {
            datesDisplay = singleSelectedDate.toLocaleDateString();
        }
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
            <div className="space-y-3 text-sm">
                <p><strong>Dates:</strong> {datesDisplay}</p>
                <p><strong>Guests:</strong> {numberOfPeople}</p>
                <p><strong>Event:</strong> {eventDetails}</p>
                {selectedFacilities.length > 0 && (
                    <div>
                        <h4>Selected Facilities:</h4>
                        <ul>{selectedFacilities.map(f => <li key={f._id}>{f.facility?.name || f.name} (x{f.quantity})</li>)}</ul>
                    </div>
                )}
                <div className="font-bold text-lg">Total: ₦{totalPrice.toLocaleString()}</div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const getModalTitle = () => {
    if (step === 1 && isMultiDateSelection) return "Choose Date";
    if (step === 2) return "Booking Details";
    if (step === 3) return "Confirm Booking";
    return "Book Your Hall";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center pb-4 mb-4 border-b">
          <h2 className="text-2xl font-semibold">{getModalTitle()}</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="min-h-[250px]">{renderStepContent()}</div>
          <div className="flex justify-end mt-8">
            {step > 1 && <button type="button" onClick={prevStep} className="mr-3 p-2 bg-gray-200 rounded">Back</button>}
            <button type="submit" disabled={loading} className="p-2 bg-[#295FA7] text-white rounded disabled:opacity-50">
              {step === 3 ? (loading ? 'Processing...' : 'Proceed to Payment') : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
