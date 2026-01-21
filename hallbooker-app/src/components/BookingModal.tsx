'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import api from '@/services/api';
import Calendar from './Calendar';
import { Hall, Facility } from '@/types';
import { useBookingAvailability } from '@/hooks/useBookingAvailability';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

interface BookingModalProps {
  hallId: string;
  isOpen: boolean;
  onClose: () => void;
  bookingMode?: 'book' | 'reserve';
  initialSelectedDates?: Date[];
  initialStep?: number;
}

interface FacilityWithQuantity extends Facility {
  quantity: number;
}

const BookingModal: FC<BookingModalProps> = ({
  hallId,
  isOpen,
  onClose,
  bookingMode = 'book',
  initialSelectedDates,
  initialStep
}) => {
  const [hall, setHall] = useState<Hall | null>(null);
  const [step, setStep] = useState(initialStep || 1);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>(initialSelectedDates);
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());
  const [eventDetails, setEventDetails] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<FacilityWithQuantity[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [hallCost, setHallCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [usePerDateTimes, setUsePerDateTimes] = useState(false);
  const [dateTimes, setDateTimes] = useState<Record<string, { startTime: string; endTime: string }>>({});
  const [durationInHours, setDurationInHours] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const { disabledHours, getDateAvailability, getDisabledHoursForDate } = useBookingAvailability(hall, selectedDates, displayedMonth);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const generateTimeOptions = (openingHour: number, closingHour: number, disabled: number[]) => {
    const options = [];
    for (let i = openingHour; i <= closingHour; i++) {
      const time = `${i.toString().padStart(2, '0')}:00`;
      const isDisabled = disabled.includes(i);
      options.push(
        <option
          key={time}
          value={time}
          disabled={isDisabled}
          className={isDisabled ? 'text-gray-400' : ''}
          title={isDisabled ? 'Not Available/Booked' : 'Available'}
        >
          {time}
        </option>
      );
    }
    return options;
  };

  useEffect(() => {
    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60);
      if (duration > 0) {
        setDurationInHours(duration);
      } else {
        setDurationInHours(0);
      }
    }
  }, [startTime, endTime]);

  const calculateFacilityCost = useCallback((facility: FacilityWithQuantity) => {
    const numberOfDays = selectedDates?.length || 1;
    const multiplier = facility.chargePerUnit ? (facility.quantity || 1) : 1;

    if (facility.chargeMethod === 'per_day') {
      return facility.cost * numberOfDays * multiplier;
    }
    if (facility.chargeMethod === 'per_hour') {
      let totalDuration = 0;
      if (usePerDateTimes && selectedDates) {
        selectedDates.forEach(date => {
          const times = dateTimes[date.toDateString()] || { startTime, endTime };
          if (times.startTime && times.endTime) {
            const [startH, startM] = times.startTime.split(':').map(Number);
            const [endH, endM] = times.endTime.split(':').map(Number);
            const diff = (endH + endM / 60) - (startH + startM / 60);
            if (diff > 0) totalDuration += diff;
          }
        });
      } else {
        totalDuration = durationInHours * numberOfDays;
      }
      return facility.cost * totalDuration * multiplier;
    }
    return facility.cost * multiplier;
  }, [selectedDates, usePerDateTimes, dateTimes, startTime, endTime, durationInHours]);

  useEffect(() => {
    if (hall && selectedDates && selectedDates.length > 0) {
      const dailyRate = hall.pricing.dailyRate || 0;
      const hourlyRate = hall.pricing.hourlyRate || 0;
      const numberOfDays = selectedDates.length;

      let calculatedHallCost = 0;
      if (hourlyRate > 0) {
        let totalDuration = 0;
        if (usePerDateTimes) {
          selectedDates.forEach(date => {
            const times = dateTimes[date.toDateString()] || { startTime, endTime };
            if (times.startTime && times.endTime) {
              const [startH, startM] = times.startTime.split(':').map(Number);
              const [endH, endM] = times.endTime.split(':').map(Number);
              const diff = (endH + endM / 60) - (startH + startM / 60);
              if (diff > 0) totalDuration += diff;
            }
          });
        } else {
          totalDuration = durationInHours * numberOfDays;
        }
        calculatedHallCost = hourlyRate * totalDuration;
      } else if (dailyRate > 0) {
        calculatedHallCost = dailyRate * numberOfDays;
      }
      setHallCost(calculatedHallCost);

      const facilitiesCost = selectedFacilities.reduce((total, facility) => {
        return total + calculateFacilityCost(facility);
      }, 0);

      const subTotal = calculatedHallCost + facilitiesCost;
      let calculatedDiscount = 0;

      if (hall.recurringBookingDiscount) {
        const { percentage, minBookings } = hall.recurringBookingDiscount;
        if (selectedDates.length >= minBookings) {
          calculatedDiscount = subTotal * (percentage / 100);
        }
      }

      setDiscountAmount(calculatedDiscount);
      setTotalPrice(subTotal - calculatedDiscount);
    } else {
      setHallCost(0);
      setTotalPrice(0);
      setDiscountAmount(0);
    }
  }, [hall, selectedDates, selectedFacilities, durationInHours, usePerDateTimes, dateTimes, startTime, endTime, calculateFacilityCost]);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep || 1);
      const dates = initialSelectedDates || undefined;
      setSelectedDates(dates);
      if (dates && dates.length > 0) {
        setDisplayedMonth(new Date(dates[0]));
      }
      setEventDetails('');
      setSelectedFacilities([]);
      setStartTime('');
      setEndTime('');
      setUsePerDateTimes(false);
      setDateTimes({});
      setError('');

      const fetchHallDetails = async () => {
        try {
          const response = await api.get(`/halls/${hallId}`);
          setHall(response.data.data);
        } catch (err) {
          console.error('Failed to fetch hall details:', err);
          setError('Failed to load hall information. Please try again.');
        }
      };
      fetchHallDetails();
    }
  }, [hallId, isOpen, initialStep, initialSelectedDates]);

  const handleFacilityChange = (facility: Facility) => {
    setSelectedFacilities((prevSelected) => {
      const isSelected = prevSelected.some((f) => f._id === facility._id);
      if (isSelected) {
        return prevSelected.filter((f) => f._id !== facility._id);
      } else {
        return [...prevSelected, { ...facility, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (facilityId: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity);
    setSelectedFacilities((prevSelected) =>
      prevSelected.map((f) =>
        f._id === facilityId ? { ...f, quantity: newQuantity } : f
      )
    );
  };

  const handleDateTimeChange = (dateStr: string, field: 'startTime' | 'endTime', value: string) => {
    setDateTimes(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || { startTime, endTime }),
        [field]: value
      }
    }));
  };

  const handlePayment = async (paymentType: 'book' | 'reserve') => {
    if (!user) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to continue.',
        icon: 'info',
        confirmButtonText: 'Log In',
      }).then(result => {
        if (result.isConfirmed) {
          router.push('/auth/login');
        }
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!selectedDates || selectedDates.length === 0) {
        setError('Please select at least one date.');
        setLoading(false);
        return;
      }

      const bookingDates = selectedDates.map(date => {
        const dateStr = date.toDateString();
        const times = usePerDateTimes && dateTimes[dateStr] ? dateTimes[dateStr] : { startTime, endTime };

        const [startHour, startMinute] = times.startTime.split(':').map(Number);
        const [endHour, endMinute] = times.endTime.split(':').map(Number);

        const startDate = new Date(date);
        startDate.setHours(startHour, startMinute, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(endHour, endMinute, 0, 0);
        return {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        };
      });

      const facilitiesPayload = selectedFacilities.map(f => ({
        facilityId: f.facility?._id || f._id,
        quantity: f.quantity,
      }));

      const payload = {
        hallId,
        bookingDates,
        startTime: bookingDates[0].startTime,
        endTime: bookingDates[0].endTime,
        eventDetails,
        selectedFacilities: facilitiesPayload,
      };

      let paymentUrl;

      if (paymentType === 'reserve') {
        const reservationResponse = await api.post('/reservations', payload);
        localStorage.setItem('bookingConfirmation', JSON.stringify(reservationResponse.data.data));
        const reservationId = reservationResponse.data.data.reservationId;
        const paymentResponse = await api.post(`/payments/reservations/${reservationId}/pay`);
        paymentUrl = `${paymentResponse.data.data.checkoutUrl}?type=reservation`;
      } else {
        const bookingResponse = await api.post('/bookings', payload);
        localStorage.setItem('bookingConfirmation', JSON.stringify(bookingResponse.data.data));
        const bookingId = bookingResponse.data.data.bookingId;
        const paymentResponse = await api.post(`/payments/initialize/${bookingId}`);
        paymentUrl = paymentResponse.data.data.checkoutUrl;
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setError('Could not retrieve payment URL. Please try again.');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const errorMessage = e.response?.data?.message || 'An unexpected error occurred.';
      setError(errorMessage);
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => handlePayment('book');
  const handleReserveNow = () => handlePayment('reserve');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2) {
      if (usePerDateTimes && selectedDates) {
        for (const date of selectedDates) {
          const times = dateTimes[date.toDateString()];
          if (!times || !times.startTime || !times.endTime) {
            setError(`Please select start and end times for ${date.toLocaleDateString()}.`);
            return;
          }
        }
      } else if (!startTime || !endTime) {
        setError('Please select start and end times.');
        return;
      }
    }
    setError('');
    if (step < 3) {
      nextStep();
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
            <div className="flex justify-center items-start gap-4">
              <Calendar
                unavailableDates={[]}
                selectedDates={selectedDates}
                onChange={(dates) => setSelectedDates(dates)}
                getDateAvailability={getDateAvailability}
                displayedMonth={displayedMonth}
                onMonthChange={setDisplayedMonth}
              />
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-3">Legend</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-red-300 mr-2"></span>
                    <span>Completely Booked</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-orange-300 mr-2"></span>
                    <span>Booked, but some time slot still available</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-green-300 mr-2"></span>
                    <span>Completely Available</span>
                  </li>
                </ul>
              </div>
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

              {!usePerDateTimes && (
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
                      {hall && generateTimeOptions(hall.openingHour || 0, hall.closingHour || 24, disabledHours)}
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
                      {hall && generateTimeOptions(hall.openingHour || 0, hall.closingHour || 24, disabledHours)}
                    </select>
                  </div>
                </div>
              )}

              {selectedDates && selectedDates.length > 1 && (
                <div className="mb-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 text-[#295FA7] rounded border-gray-300 focus:ring-[#295FA7]"
                      checked={usePerDateTimes}
                      onChange={(e) => setUsePerDateTimes(e.target.checked)}
                    />
                    Set different times for each date
                  </label>
                </div>
              )}

              {usePerDateTimes && selectedDates && (
                <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-gray-800">Date-specific Times</h4>
                  {selectedDates.map((date) => {
                    const dateStr = date.toDateString();
                    const times = dateTimes[dateStr] || { startTime, endTime };
                    const dateDisabledHours = getDisabledHoursForDate(date);

                    return (
                      <div key={dateStr} className="border-b pb-3 last:border-b-0">
                        <p className="text-xs font-medium text-gray-600 mb-2">{dateStr}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <select
                              value={times.startTime}
                              onChange={(e) => handleDateTimeChange(dateStr, 'startTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                            >
                              <option value="">Start Time</option>
                              {hall && generateTimeOptions(hall.openingHour || 0, hall.closingHour || 24, dateDisabledHours)}
                            </select>
                          </div>
                          <div>
                            <select
                              value={times.endTime}
                              onChange={(e) => handleDateTimeChange(dateStr, 'endTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                            >
                              <option value="">End Time</option>
                              {hall && generateTimeOptions(hall.openingHour || 0, hall.closingHour || 24, dateDisabledHours)}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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
                                <select
                                  value={selectedFacility?.quantity || 1}
                                  onChange={(e) => handleQuantityChange(facility._id, parseInt(e.target.value, 10))}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#295FA7]"
                                >
                                  {Array.from({ length: facility.quantity }, (_, i) => i + 1).map(n =>
                                    <option key={n} value={n}>{n}</option>
                                  )}
                                </select>
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
            <div className="bg-gray-50 p-6 rounded-lg max-h-[60vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col border-b pb-2">
                  <span className="text-gray-600 font-medium mb-1">Dates & Times:</span>
                  <div className="pl-2 space-y-1">
                    {selectedDates?.map(date => {
                      const dateStr = date.toDateString();
                      const times = usePerDateTimes && dateTimes[dateStr] ? dateTimes[dateStr] : { startTime, endTime };
                      return (
                        <div key={dateStr} className="flex justify-between text-xs">
                          <span>{date.toLocaleDateString()}:</span>
                          <span className="font-medium">{times.startTime} - {times.endTime}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Details:</span>
                  <span className="font-medium text-gray-900">{eventDetails}</span>
                </div>
                <div className="border-t my-2"></div>
                {hall && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hall Rental:</span>
                    <span className="font-medium text-gray-900">₦{hallCost.toLocaleString()}</span>
                  </div>
                )}
                {selectedFacilities.length > 0 && (
                  <div className="pt-2">
                    <h4 className="font-medium text-gray-800 mb-1">Selected Facilities:</h4>
                    {selectedFacilities.map(f => (
                      <div key={f._id} className="flex justify-between items-center text-gray-600">
                        <span>{f.facility?.name || f.name} (x{f.quantity})</span>
                        <span className="font-medium">₦{calculateFacilityCost(f).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium pt-2 border-t mt-2">
                    <span>Discount Applied:</span>
                    <span>-₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className={`flex justify-between font-bold text-lg ${discountAmount > 0 ? '' : 'border-t mt-2'} pt-2`}>
                    <span className="text-gray-800">Total Price:</span>
                    <span className="text-gray-900">₦{totalPrice.toLocaleString()}</span>
                </div>
                 {bookingMode === 'reserve' && (
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">
                      Reservation Fee ({hall?.reservationFeePercentage || 40}%):
                    </span>
                    <span className="font-medium text-gray-900">
                      ₦{(totalPrice * ((hall?.reservationFeePercentage || 40) / 100)).toLocaleString()}
                    </span>
                  </div>
                )}
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
            {step === 3 ? (
              <div className="flex gap-x-2">
                {bookingMode === 'reserve' ? (
                  <button
                    type="button"
                    onClick={handleReserveNow}
                    disabled={loading}
                    className="px-5 py-2 text-sm font-semibold border rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 bg-[#B68945] text-white border-[#B68945]"
                  >
                    {loading ? 'Processing...' : 'Reserve with Part Payment'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBookNow}
                    disabled={loading}
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#295FA7] border border-transparent rounded-lg shadow-sm hover:bg-[#204a8a] transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Pay in Full'}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#295FA7] border border-transparent rounded-lg shadow-sm hover:bg-[#204a8a] transition-colors duration-200 disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
