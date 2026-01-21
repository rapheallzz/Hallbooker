
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Trash2 } from 'lucide-react';
import api from '@/services/api';
import Swal from 'sweetalert2';
import Calendar from '../Calendar';
import {
  format,
  addDays,
  addMonths,
  eachDayOfInterval,
  getDay,
  getDate,
  startOfMonth,
  endOfMonth,
  parseISO
} from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Record<string, unknown>, type: string) => void;
  userRole: 'admin' | 'vendor';
}

interface FacilityItem {
  _id: string;
  facility?: {
    _id: string;
    name: string;
  };
  name: string;
  cost: number;
  chargeMethod: string;
  quantity: number;
  chargePerUnit: boolean;
}

interface HallItem {
  _id: string;
  name: string;
  facilities: FacilityItem[];
  pricing: {
    dailyRate?: number;
    hourlyRate?: number;
  };
  recurringBookingDiscount?: {
    percentage: number;
    minBookings: number;
  };
  reservationFeePercentage?: number;
}

interface UnavailableDate {
  bufferTime: {
    startTime: string;
    endTime: string;
  };
}

const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatLabel = (label: string) => {
  if (label === 'POS') return 'POS';
  return label
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const SharedBookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSubmit, userRole }) => {
  const [activeTab, setActiveTab] = useState('reservation');
  const [halls, setHalls] = useState<HallItem[]>([]);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [error, setError] = useState('');
  const [hallPrice, setHallPrice] = useState(0);
  const [facilitiesPrice, setFacilitiesPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [usePerDateTimes, setUsePerDateTimes] = useState(false);
  const [dateTimes, setDateTimes] = useState<Record<string, { startTime: string; endTime: string }>>({});
  const [paymentOptions, setPaymentOptions] = useState<{ paymentMethods: string[]; paymentStatuses: string[] }>({ paymentMethods: [], paymentStatuses: [] });
  const [displayedMonth, setDisplayedMonth] = useState(new Date());
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [recurrencePattern, setRecurrencePattern] = useState<'none' | 'weekly' | 'monthly-fixed' | 'monthly-relative'>('none');
  const [formData, setFormData] = useState({
    hall: '',
    startTime: '',
    endTime: '',
    eventDetails: '',
    startDate: '',
    recurrenceType: 'specific-dates',
    daysOfWeek: [] as number[],
    dayOfMonth: null as number | null,
    dates: [] as string[],
    recurringEndDate: '',
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'CASH',
    paymentStatus: 'pending',
    selectedFacilities: [] as { facilityId: string; quantity: number }[],
  });

  useEffect(() => {
    const fetchUnavailableDates = async () => {
      if (!formData.hall) {
        setUnavailableDates([]);
        return;
      }
      try {
        const startDate = format(startOfMonth(displayedMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(displayedMonth), 'yyyy-MM-dd');
        const response = await api.get(`/halls/${formData.hall}/unavailable-dates`, {
          params: { startDate, endDate },
        });
        const dates = (response.data.data || []).map((ud: UnavailableDate) => parseISO(ud.bufferTime.startTime));
        setUnavailableDates(dates);
      } catch (err) {
        console.error('Failed to fetch unavailable dates:', err);
        setUnavailableDates([]);
      }
    };
    fetchUnavailableDates();
  }, [formData.hall, displayedMonth]);

  useEffect(() => {
    if (isOpen) {
      const fetchHalls = async () => {
        try {
          const endpoint = userRole === 'admin' ? '/halls' : '/halls/by-owner';
          const response = await api.get(endpoint);
          setHalls(response.data.data || []);
        } catch (err) {
          console.error('Failed to fetch halls:', err);
        }
      };
      fetchHalls();

      const fetchPaymentOptions = async () => {
        try {
          const response = await api.get('/settings/payment-options');
          setPaymentOptions(response.data.data);
        } catch (err) {
          console.error('Failed to fetch payment options:', err);
          setPaymentOptions({
            paymentMethods: ['CASH', 'BANK_TRANSFER', 'POS', 'ONLINE', 'CHEQUE'],
            paymentStatuses: ['pending', 'paid', 'failed', 'refunded'],
          });
        }
      };
      fetchPaymentOptions();
    }
  }, [isOpen, userRole]);

  useEffect(() => {
    if (formData.hall) {
      const selectedHall = halls.find((h) => h._id === formData.hall);
      if (selectedHall) {
        setFacilities(selectedHall.facilities);
      }
    }
  }, [formData.hall, halls]);

  useEffect(() => {
    let type = 'specific-dates';
    if (recurrencePattern === 'weekly') type = 'weekly';
    else if (recurrencePattern === 'monthly-fixed' || recurrencePattern === 'monthly-relative') type = 'monthly';

    setFormData(prev => ({ ...prev, recurrenceType: type }));
  }, [recurrencePattern]);

  useEffect(() => {
    const calculateTotalPrice = () => {
      const selectedHall = halls.find((h) => h._id === formData.hall);
      if (!selectedHall) {
        setHallPrice(0);
        setFacilitiesPrice(0);
        setTotalPrice(0);
        return;
      }

      let durationInHours = 0;
      let durationInDays = 0;

      if ((activeTab === 'reservation' || activeTab === 'walk-in' || activeTab === 'recurring') && formData.dates.length > 0) {
        durationInDays = formData.dates.length;
        formData.dates.forEach(date => {
          const times = usePerDateTimes && dateTimes[date] ? dateTimes[date] : { startTime: formData.startTime, endTime: formData.endTime };
          if (times.startTime && times.endTime) {
            const [startH, startM] = times.startTime.split(':').map(Number);
            const [endH, endM] = times.endTime.split(':').map(Number);
            const diff = (endH + endM / 60) - (startH + startM / 60);
            if (diff > 0) durationInHours += diff;
          }
        });
      } else if (formData.startTime && formData.endTime) {
        const start = formData.startTime.includes('T') ? new Date(formData.startTime) : new Date(`1970-01-01T${formData.startTime}:00`);
        const end = formData.endTime.includes('T') ? new Date(formData.endTime) : new Date(`1970-01-01T${formData.endTime}:00`);
        durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        durationInDays = Math.ceil(durationInHours / 24) || 1;
      }

      if (durationInHours <= 0 && durationInDays <= 0) {
        setHallPrice(0);
        setFacilitiesPrice(0);
        setTotalPrice(0);
        return;
      }

      const dailyRate = selectedHall.pricing.dailyRate || 0;
      const hourlyRate = selectedHall.pricing.hourlyRate || 0;

      let calculatedHallPrice = 0;
      if (hourlyRate > 0) {
        calculatedHallPrice = hourlyRate * durationInHours;
      } else if (dailyRate > 0) {
        calculatedHallPrice = dailyRate * durationInDays;
      }
      setHallPrice(calculatedHallPrice);

      let currentFacilitiesPrice = 0;
      formData.selectedFacilities.forEach(sf => {
        const facility = (facilities as FacilityItem[]).find(f => (f.facility?._id || f._id) === sf.facilityId);
        if (facility) {
          const multiplier = facility.chargePerUnit ? sf.quantity : 1;
          switch (facility.chargeMethod) {
            case 'flat':
              currentFacilitiesPrice += facility.cost * multiplier;
              break;
            case 'per_hour':
              currentFacilitiesPrice += facility.cost * multiplier * durationInHours;
              break;
            case 'per_day':
              currentFacilitiesPrice += facility.cost * multiplier * durationInDays;
              break;
            default:
              break;
          }
        }
      });
      setFacilitiesPrice(currentFacilitiesPrice);

      const subTotal = calculatedHallPrice + currentFacilitiesPrice;
      let calculatedDiscount = 0;

      if (activeTab === 'recurring' && selectedHall.recurringBookingDiscount) {
        const { percentage, minBookings } = selectedHall.recurringBookingDiscount;
        if (formData.dates.length >= minBookings) {
          calculatedDiscount = subTotal * (percentage / 100);
        }
      }

      setDiscountAmount(calculatedDiscount);
      setTotalPrice(subTotal - calculatedDiscount);
    };

    calculateTotalPrice();
  }, [formData.hall, formData.startTime, formData.endTime, formData.dates, formData.selectedFacilities, halls, facilities, activeTab, usePerDateTimes, dateTimes]);

  const generateRecurringDates = useCallback((startDate: Date, endDate: Date, pattern: string) => {
    if (!startDate || !endDate || endDate < startDate || pattern === 'none') return [startDate];

    const dates: Date[] = [];
    let current = startDate;

    if (pattern === 'weekly') {
      const targetDay = getDay(startDate);
      const interval = eachDayOfInterval({ start: startDate, end: endDate });
      return interval.filter(d => getDay(d) === targetDay);
    } else if (pattern === 'monthly-fixed') {
      let n = 0;
      while (current <= endDate) {
        dates.push(current);
        n++;
        current = addMonths(startDate, n);
        if (current > endDate) break;
      }
    } else if (pattern === 'monthly-relative') {
      const targetDay = getDay(startDate);
      const targetNth = Math.floor((getDate(startDate) - 1) / 7) + 1;

      while (current <= endDate) {
        dates.push(current);
        const nextMonth = startOfMonth(addMonths(current, 1));
        let found = false;
        let count = 0;
        for (let i = 0; i < 31; i++) {
          const d = addDays(nextMonth, i);
          if (d.getMonth() !== nextMonth.getMonth()) break;
          if (getDay(d) === targetDay) {
            count++;
            if (count === targetNth) {
              current = d;
              found = true;
              break;
            }
          }
        }
        if (!found || current > endDate) break;
      }
    }
    return dates;
  }, []);

  const applyRecurrence = useCallback(() => {
    if (formData.dates.length === 0 || recurrencePattern === 'none' || !formData.recurringEndDate) return;

    const startDate = parseLocalDate(formData.dates[0]);
    const endDate = parseLocalDate(formData.recurringEndDate);

    const newDates = generateRecurringDates(startDate, endDate, recurrencePattern);

    let daysOfWeek = formData.daysOfWeek;
    let dayOfMonth = formData.dayOfMonth;

    if (recurrencePattern === 'weekly') {
      daysOfWeek = [getDay(startDate)];
    } else if (recurrencePattern === 'monthly-fixed') {
      dayOfMonth = getDate(startDate);
    }

    setFormData(prev => ({
      ...prev,
      dates: newDates.map(d => format(d, 'yyyy-MM-dd')),
      daysOfWeek,
      dayOfMonth
    }));

    Swal.fire({
      icon: 'success',
      title: 'Pattern Applied',
      text: `${newDates.length} dates have been generated.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  }, [formData.dates, formData.recurringEndDate, recurrencePattern, generateRecurringDates, formData.daysOfWeek, formData.dayOfMonth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const removeDate = (dateToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates.filter(d => d !== dateToRemove)
    }));
    const newDateTimes = { ...dateTimes };
    delete newDateTimes[dateToRemove];
    setDateTimes(newDateTimes);
  };

  const handleDateTimeChange = (dateStr: string, field: 'startTime' | 'endTime', value: string) => {
    setDateTimes(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || { startTime: formData.startTime, endTime: formData.endTime }),
        [field]: value
      }
    }));
  };

  const generateBookingDates = (dates: string[], usePerDateTimes: boolean, dateTimes: Record<string, { startTime: string; endTime: string }>, globalStartTime: string, globalEndTime: string) => {
    const bookingDates = [];
    for (const dateStr of dates) {
      const times = usePerDateTimes && dateTimes[dateStr] ? dateTimes[dateStr] : { startTime: globalStartTime, endTime: globalEndTime };
      const [startH, startM] = times.startTime.split(':').map(Number);
      const [endH, endM] = times.endTime.split(':').map(Number);
      const start = parseLocalDate(dateStr);
      start.setHours(startH, startM, 0, 0);
      const end = parseLocalDate(dateStr);
      end.setHours(endH, endM, 0, 0);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error(`Invalid date or time selection for ${dateStr}.`);
      }

      bookingDates.push({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
    }
    return bookingDates;
  };

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      hall,
      startTime,
      endTime,
      eventDetails,
      recurrenceType,
      daysOfWeek,
      dayOfMonth,
      dates,
      recurringEndDate,
      fullName,
      email,
      phone,
      paymentMethod,
      paymentStatus,
      selectedFacilities,
    } = formData;

    if (dates.length === 0) {
      setError('Please select at least one date for recurring booking.');
      return;
    }

    if (usePerDateTimes) {
      for (const dateStr of dates) {
        const times = dateTimes[dateStr];
        if (!times || !times.startTime || !times.endTime) {
          setError(`Please select start and end times for ${dateStr}.`);
          return;
        }
      }
    } else if (!startTime || !endTime) {
      setError('Please select start and end times.');
      return;
    }

    const walkInUserDetails = { fullName, email, phone };
    let bookingDates;
    try {
      bookingDates = generateBookingDates(dates, usePerDateTimes, dateTimes, startTime, endTime);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      return;
    }

    const bookingPayload: Record<string, unknown> = {
      hallId: hall,
      eventDetails,
      walkInUserDetails,
      paymentMethod,
      paymentStatus,
      selectedFacilities,
      bookingDates,
      recurrenceType: recurrenceType,
    };

    if (recurrenceType === 'weekly' || recurrenceType === 'monthly') {
      const recurrenceRule: Record<string, unknown> = {
        endDate: recurringEndDate ? parseLocalDate(recurringEndDate).toISOString() : bookingDates[bookingDates.length - 1].endTime,
      };
      if (recurrenceType === 'weekly') {
        recurrenceRule.frequency = 'weekly';
        recurrenceRule.daysOfWeek = daysOfWeek;
      } else { // monthly
        recurrenceRule.frequency = 'monthly';
        recurrenceRule.dayOfMonth = dayOfMonth;
      }
      bookingPayload.recurrenceRule = recurrenceRule;
    }

    setError('');
    onSubmit(bookingPayload, 'recurring');
  };

  const handleFacilityChange = (facility: FacilityItem) => {
    setFormData((prev) => {
      const selectedFacilities = prev.selectedFacilities;
      const facilityIdToUse = facility.facility?._id || facility._id;
      if (!facilityIdToUse) return prev;

      const isSelected = selectedFacilities.some((f) => f.facilityId === facilityIdToUse);
      if (isSelected) {
        return {
          ...prev,
          selectedFacilities: selectedFacilities.filter((f) => f.facilityId !== facilityIdToUse),
        };
      } else {
        return {
          ...prev,
          selectedFacilities: [...selectedFacilities, { facilityId: facilityIdToUse, quantity: 1 }],
        };
      }
    });
  };

  const handleQuantityChange = (facilityId: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity);
    setFormData((prev) => ({
      ...prev,
      selectedFacilities: prev.selectedFacilities.map((f) =>
        f.facilityId === facilityId ? { ...f, quantity: newQuantity } : f
      ),
    }));
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { hall, startTime, endTime, dates, eventDetails, fullName, email, phone, paymentMethod, paymentStatus, selectedFacilities } = formData;

    if (dates.length === 0) {
      setError('Please select at least one date.');
      return;
    }

    if (usePerDateTimes) {
      for (const dateStr of dates) {
        const times = dateTimes[dateStr];
        if (!times || !times.startTime || !times.endTime) {
          setError(`Please select start and end times for ${dateStr}.`);
          return;
        }
      }
    } else if (!startTime || !endTime) {
      setError('Please select start and end times.');
      return;
    }
    setError('');

    const walkInUserDetails = { fullName, email, phone };
    let bookingDates;
    try {
      bookingDates = generateBookingDates(dates, usePerDateTimes, dateTimes, startTime, endTime);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      return;
    }

    onSubmit({
      hallId: hall,
      bookingDates,
      eventDetails,
      walkInUserDetails,
      paymentMethod,
      paymentStatus,
      selectedFacilities
    }, 'walk-in');
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { hall, startTime, endTime, dates, eventDetails, fullName, email, phone, paymentMethod, selectedFacilities } = formData;

    if (dates.length === 0) {
      setError('Please select at least one date.');
      return;
    }

    if (usePerDateTimes) {
      for (const dateStr of dates) {
        const times = dateTimes[dateStr];
        if (!times || !times.startTime || !times.endTime) {
          setError(`Please select start and end times for ${dateStr}.`);
          return;
        }
      }
    } else if (!startTime || !endTime) {
      setError('Please select start and end times.');
      return;
    }
    setError('');

    const walkInUserDetails = { fullName, email, phone };
    let bookingDates;
    try {
      bookingDates = generateBookingDates(dates, usePerDateTimes, dateTimes, startTime, endTime);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      return;
    }

    onSubmit({
      hallId: hall,
      bookingDates,
      eventDetails,
      walkInUserDetails,
      paymentMethod,
      selectedFacilities
    }, 'reservation');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Booking</h2>
        <div className="flex border-b mb-4">
          {error && <p className="text-red-500 text-xs italic">{error}</p>}
          <button
            className={`px-4 py-2 ${activeTab === 'recurring' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('recurring')}
          >
            Recurring
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'walk-in' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('walk-in')}
          >
            Walk-in
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'reservation' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('reservation')}
          >
            Reservation
          </button>
        </div>
        <div>
          {activeTab === 'reservation' && (
            <form onSubmit={handleReservationSubmit} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-800">Hall</label>
                <select name="hall" value={formData.hall} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="">Select a hall</option>
                  {halls.map((hall: HallItem) => (
                    <option key={hall._id} value={hall._id}>
                      {hall.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Select Dates</label>
                <Calendar
                  unavailableDates={unavailableDates}
                  selectedDates={formData.dates.map(date => parseLocalDate(date))}
                  displayedMonth={displayedMonth}
                  onMonthChange={setDisplayedMonth}
                  onChange={(dates) => {
                    if (dates) {
                      setFormData(prev => ({
                        ...prev,
                        dates: dates.map(d => format(d, 'yyyy-MM-dd'))
                      }));
                    }
                  }}
                />
              </div>

              {!usePerDateTimes && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Start Time</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">End Time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                  </div>
                </div>
              )}

              {formData.dates.length > 1 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="usePerDateTimesRes"
                    checked={usePerDateTimes}
                    onChange={(e) => setUsePerDateTimes(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="usePerDateTimesRes" className="text-sm font-medium text-gray-800">
                    Set different times for each date
                  </label>
                </div>
              )}

              {usePerDateTimes && formData.dates.length > 0 && (
                <div className="space-y-4 p-4 border rounded-md bg-gray-50 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-gray-800">Date-specific Times</h4>
                  {formData.dates.map((dateStr) => {
                    const times = dateTimes[dateStr] || { startTime: formData.startTime, endTime: formData.endTime };
                    return (
                      <div key={dateStr} className="grid grid-cols-2 gap-4 border-b pb-2 last:border-b-0">
                        <div className="col-span-2 text-xs font-medium text-gray-600">{dateStr}</div>
                        <div>
                          <input
                            type="time"
                            value={times.startTime}
                            onChange={(e) => handleDateTimeChange(dateStr, 'startTime', e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900"
                          />
                        </div>
                        <div>
                          <input
                            type="time"
                            value={times.endTime}
                            onChange={(e) => handleDateTimeChange(dateStr, 'endTime', e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-800">Event Details</label>
                <input type="text" name="eventDetails" value={formData.eventDetails} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
              <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-medium text-gray-800">Walk-in User Details</legend>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
              </fieldset>
              <div>
                <label className="block text-sm font-medium text-gray-800">Facilities</label>
                <div className="max-h-48 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 gap-y-3">
                    {facilities.map((facility) => {
                      const facilityIdToUse = facility.facility?._id || facility._id;
                      if (!facilityIdToUse) return null;
                      const isSelected = formData.selectedFacilities.some(f => f.facilityId === facilityIdToUse);
                      const selectedFacility = formData.selectedFacilities.find(f => f.facilityId === facilityIdToUse);
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
                                onChange={(e) => handleQuantityChange(facilityIdToUse, parseInt(e.target.value, 10))}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#295FA7]"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-800">Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  {paymentOptions.paymentMethods.map((method: string) => (
                    <option key={method} value={method}>
                      {formatLabel(method)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center mt-8">
                <div>
                  <div className="text-sm">Hall Price: ₦{hallPrice.toLocaleString()}</div>
                  <div className="text-sm">Facilities Price: ₦{facilitiesPrice.toLocaleString()}</div>
                  <div className="text-sm font-semibold">Total Price: ₦{totalPrice.toLocaleString()}</div>
                  {(() => {
                    const selectedHall = halls.find(h => h._id === formData.hall);
                    const feePercentage = selectedHall?.reservationFeePercentage || 40;
                    return (
                      <div className="text-sm font-bold text-[#B68945]">
                        Reservation Fee ({feePercentage}%): ₦{(totalPrice * (feePercentage / 100)).toLocaleString()}
                      </div>
                    );
                  })()}
                </div>
                <button type="submit" className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">
                  Reserve with Part Payment
                </button>
              </div>
            </form>
          )}
          {activeTab === 'recurring' && (
            <form onSubmit={handleRecurringSubmit} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-800">Hall</label>
                <select name="hall" value={formData.hall} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="">Select a hall</option>
                  {halls.map((hall: HallItem) => (
                    <option key={hall._id} value={hall._id}>
                      {hall.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Event Details</label>
                <input type="text" name="eventDetails" value={formData.eventDetails} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Select Dates</label>
                <p className="text-xs text-gray-500 mb-2">Select the starting date first, then apply a repeat pattern if needed.</p>
                <Calendar
                  unavailableDates={unavailableDates}
                  selectedDates={formData.dates.map(date => parseLocalDate(date))}
                  displayedMonth={displayedMonth}
                  onMonthChange={setDisplayedMonth}
                  onChange={(dates) => {
                    if (dates) {
                      setFormData(prev => ({
                        ...prev,
                        dates: dates.map(d => format(d, 'yyyy-MM-dd'))
                      }));
                    }
                  }}
                />
              </div>

              {formData.dates.length > 0 && (
                <div className="p-4 border rounded-md bg-blue-50 space-y-3">
                   <label className="block text-sm font-bold text-gray-800">Repeat this booking?</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setRecurrencePattern('none')} className={`px-3 py-2 text-sm rounded transition-colors ${recurrencePattern === 'none' ? 'bg-primary text-white font-semibold' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>No Repeat</button>
                      <button type="button" onClick={() => setRecurrencePattern('weekly')} className={`px-3 py-2 text-sm rounded transition-colors ${recurrencePattern === 'weekly' ? 'bg-primary text-white font-semibold' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>Weekly</button>
                      <button type="button" onClick={() => setRecurrencePattern('monthly-fixed')} className={`px-3 py-2 text-sm rounded transition-colors ${recurrencePattern === 'monthly-fixed' ? 'bg-primary text-white font-semibold' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>Monthly (Fixed Date)</button>
                      <button type="button" onClick={() => setRecurrencePattern('monthly-relative')} className={`px-3 py-2 text-sm rounded transition-colors ${recurrencePattern === 'monthly-relative' ? 'bg-primary text-white font-semibold' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>Monthly (Relative Day)</button>
                   </div>

                   {recurrencePattern !== 'none' && (
                     <div className="mt-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-800">Repeat Until</label>
                        <input
                          type="date"
                          name="recurringEndDate"
                          value={formData.recurringEndDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={applyRecurrence}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-bold shadow-sm transition-colors"
                        >
                          Generate & Apply Pattern
                        </button>
                        <p className="text-[10px] text-gray-500 italic">This will populate the calendar based on the first selected date.</p>
                     </div>
                   )}
                </div>
              )}

              {!usePerDateTimes && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Start Time</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">End Time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                  </div>
                </div>
              )}

              {formData.dates.length > 1 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="usePerDateTimesRec"
                    checked={usePerDateTimes}
                    onChange={(e) => setUsePerDateTimes(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="usePerDateTimesRec" className="text-sm font-medium text-gray-800">
                    Set different times for each date
                  </label>
                </div>
              )}

              {formData.dates.length > 0 && (
                <div className="space-y-4 p-4 border rounded-md bg-gray-50 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-gray-800">Selected Dates & Times</h4>
                  {formData.dates.map((dateStr) => {
                    const times = dateTimes[dateStr] || { startTime: formData.startTime, endTime: formData.endTime };
                    return (
                      <div key={dateStr} className="flex flex-col space-y-2 border-b pb-2 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600">{dateStr}</span>
                          <button
                            type="button"
                            onClick={() => removeDate(dateStr)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove date"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {usePerDateTimes && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <input
                                type="time"
                                value={times.startTime}
                                onChange={(e) => handleDateTimeChange(dateStr, 'startTime', e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900"
                              />
                            </div>
                            <div>
                              <input
                                type="time"
                                value={times.endTime}
                                onChange={(e) => handleDateTimeChange(dateStr, 'endTime', e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-medium text-gray-800">User Details</legend>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
              </fieldset>

              <div>
                <label className="block text-sm font-medium text-gray-800">Facilities</label>
                <div className="max-h-48 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 gap-y-3">
                    {facilities.map((facility) => {
                      const facilityIdToUse = facility.facility?._id || facility._id;
                      if (!facilityIdToUse) return null;
                      const isSelected = formData.selectedFacilities.some(f => f.facilityId === facilityIdToUse);
                      const selectedFacility = formData.selectedFacilities.find(f => f.facilityId === facilityIdToUse);
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
                                onChange={(e) => handleQuantityChange(facilityIdToUse, parseInt(e.target.value, 10))}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#295FA7]"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  {paymentOptions.paymentMethods.map((method: string) => (
                    <option key={method} value={method}>
                      {formatLabel(method)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Payment Status</label>
                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  {paymentOptions.paymentStatuses.map((status: string) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center mt-8">
                <div>
                  <div className="text-sm">Hall Price: ₦{hallPrice.toLocaleString()}</div>
                  <div className="text-sm">Facilities Price: ₦{facilitiesPrice.toLocaleString()}</div>
                  {discountAmount > 0 && (
                    <div className="text-sm text-green-600 font-medium">Discount Applied: -₦{discountAmount.toLocaleString()}</div>
                  )}
                  <div className="text-sm font-bold">Total Price: ₦{totalPrice.toLocaleString()}</div>
                </div>
                <button type="submit" className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">
                  Create Recurring Booking
                </button>
              </div>
            </form>
          )}
          {activeTab === 'walk-in' && (
            <form onSubmit={handleWalkInSubmit} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-800">Hall</label>
                <select name="hall" value={formData.hall} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="">Select a hall</option>
                  {halls.map((hall: HallItem) => (
                    <option key={hall._id} value={hall._id}>
                      {hall.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Select Dates</label>
                <Calendar
                  unavailableDates={unavailableDates}
                  selectedDates={formData.dates.map(date => parseLocalDate(date))}
                  displayedMonth={displayedMonth}
                  onMonthChange={setDisplayedMonth}
                  onChange={(dates) => {
                    if (dates) {
                      setFormData(prev => ({
                        ...prev,
                        dates: dates.map(d => format(d, 'yyyy-MM-dd'))
                      }));
                    }
                  }}
                />
              </div>

              {!usePerDateTimes && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Start Time</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">End Time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                  </div>
                </div>
              )}

              {formData.dates.length > 1 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="usePerDateTimesWalk"
                    checked={usePerDateTimes}
                    onChange={(e) => setUsePerDateTimes(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="usePerDateTimesWalk" className="text-sm font-medium text-gray-800">
                    Set different times for each date
                  </label>
                </div>
              )}

              {usePerDateTimes && formData.dates.length > 0 && (
                <div className="space-y-4 p-4 border rounded-md bg-gray-50 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-gray-800">Date-specific Times</h4>
                  {formData.dates.map((dateStr) => {
                    const times = dateTimes[dateStr] || { startTime: formData.startTime, endTime: formData.endTime };
                    return (
                      <div key={dateStr} className="grid grid-cols-2 gap-4 border-b pb-2 last:border-b-0">
                        <div className="col-span-2 text-xs font-medium text-gray-600">{dateStr}</div>
                        <div>
                          <input
                            type="time"
                            value={times.startTime}
                            onChange={(e) => handleDateTimeChange(dateStr, 'startTime', e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900"
                          />
                        </div>
                        <div>
                          <input
                            type="time"
                            value={times.endTime}
                            onChange={(e) => handleDateTimeChange(dateStr, 'endTime', e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-800">Event Details</label>
                <input type="text" name="eventDetails" value={formData.eventDetails} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
              <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-medium text-gray-800">Walk-in User Details</legend>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
              </fieldset>
              <div>
                <label className="block text-sm font-medium text-gray-800">Facilities</label>
                <div className="max-h-48 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 gap-y-3">
                    {facilities.map((facility) => {
                      const facilityIdToUse = facility.facility?._id || facility._id;
                      if (!facilityIdToUse) return null;
                      const isSelected = formData.selectedFacilities.some(f => f.facilityId === facilityIdToUse);
                      const selectedFacility = formData.selectedFacilities.find(f => f.facilityId === facilityIdToUse);
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
                                onChange={(e) => handleQuantityChange(facilityIdToUse, parseInt(e.target.value, 10))}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#295FA7]"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-800">Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  {paymentOptions.paymentMethods.map((method: string) => (
                    <option key={method} value={method}>
                      {formatLabel(method)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Payment Status</label>
                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  {paymentOptions.paymentStatuses.map((status: string) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center mt-8">
                <div>
                  <div className="text-sm">Hall Price: ₦{hallPrice.toLocaleString()}</div>
                  <div className="text-sm">Facilities Price: ₦{facilitiesPrice.toLocaleString()}</div>
                  <div className="text-sm font-bold">Total Price: ₦{totalPrice.toLocaleString()}</div>
                </div>
                <button type="submit" className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">
                  Pay in Full
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedBookingModal;
