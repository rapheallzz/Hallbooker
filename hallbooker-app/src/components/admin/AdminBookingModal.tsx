
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';
import Calendar from '../Calendar';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => void;
}

const AdminBookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('walk-in');
  const [halls, setHalls] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    hall: '',
    startTime: '',
    endTime: '',
    eventDetails: '',
    startDate: '',
    recurrenceType: 'weekly', // 'weekly', 'monthly', 'specific-dates'
    daysOfWeek: [] as number[],
    dayOfMonth: null as number | null,
    dates: [] as string[],
    recurringEndDate: '',
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    selectedFacilities: [],
  });

  useEffect(() => {
    if (isOpen) {
      const fetchHalls = async () => {
        try {
          const response = await api.get('/halls');
          setHalls(response.data.data);
        } catch (error) {
          console.error('Failed to fetch halls:', error);
        }
      };
      fetchHalls();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.hall) {
      const selectedHall = halls.find((h: any) => h._id === formData.hall);
      if (selectedHall) {
        setFacilities((selectedHall as any).facilities);
      }
    }
  }, [formData.hall, halls]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayOfWeekChange = (dayIndex: number) => {
    setFormData(prev => {
      const daysOfWeek = prev.daysOfWeek.includes(dayIndex)
        ? prev.daysOfWeek.filter(d => d !== dayIndex)
        : [...prev.daysOfWeek, dayIndex];
      return { ...prev, daysOfWeek };
    });
  };

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      hall,
      startDate,
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

    const walkInUserDetails = { fullName, email, phone };
    let bookingPayload: any = {
      hallId: hall,
      eventDetails,
      walkInUserDetails,
      paymentMethod,
      paymentStatus,
      selectedFacilities,
    };

    if (recurrenceType === 'weekly' || recurrenceType === 'monthly') {
      bookingPayload.startTime = `${startDate}T${startTime}:00.000Z`;
      bookingPayload.endTime = `${startDate}T${endTime}:00.000Z`;

      if (recurrenceType === 'weekly') {
        bookingPayload.recurrenceRule = {
          frequency: 'weekly',
          daysOfWeek,
          endDate: recurringEndDate,
        };
      } else { // monthly
        bookingPayload.recurrenceRule = {
          frequency: 'monthly',
          dayOfMonth,
          endDate: recurringEndDate,
        };
      }
    } else if (recurrenceType === 'specific-dates') {
      if (dates.length === 0) {
        setError('Please select at least one date for specific dates booking.');
        return;
      }
      const referenceDate = dates[0];
      bookingPayload.startTime = `${referenceDate}T${startTime}:00.000Z`;
      bookingPayload.endTime = `${referenceDate}T${endTime}:00.000Z`;
      bookingPayload.dates = dates;
    }

    setError('');
    onSubmit(bookingPayload, 'recurring');
  };

  const handleFacilityChange = (facility: any) => {
    setFormData((prev) => {
      const selectedFacilities = prev.selectedFacilities as { facilityId: string, quantity: number }[];
      const facilityIdToUse = facility.facility?._id;
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
      selectedFacilities: (prev.selectedFacilities as { facilityId: string, quantity: number }[]).map((f) =>
        f.facilityId === facilityId ? { ...f, quantity: newQuantity } : f
      ),
    }));
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { hall, startTime, endTime, eventDetails, fullName, email, phone, paymentMethod, paymentStatus, selectedFacilities } = formData;
    const walkInUserDetails = { fullName, email, phone };
    const bookingDates = [{ startTime, endTime }];
    onSubmit({ hallId: hall, bookingDates, eventDetails, walkInUserDetails, paymentMethod, paymentStatus, selectedFacilities }, 'walk-in');
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
        </div>
        <div>
          {activeTab === 'recurring' && (
            <form onSubmit={handleRecurringSubmit} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-800">Hall</label>
                <select name="hall" value={formData.hall} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="">Select a hall</option>
                  {halls.map((hall: any) => (
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
                <label className="block text-sm font-medium text-gray-800">Recurrence Type</label>
                <select
                  name="recurrenceType"
                  value={formData.recurrenceType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="specific-dates">Specific Dates</option>
                </select>
              </div>

              {formData.recurrenceType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-800">Days of the Week</label>
                  <div className="flex space-x-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <label key={day} className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={formData.daysOfWeek.includes(index)}
                          onChange={() => handleDayOfWeekChange(index)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.recurrenceType === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-800">Day of the Month</label>
                  <Calendar
                    selectedDates={formData.dayOfMonth ? [new Date(new Date().getFullYear(), new Date().getMonth(), formData.dayOfMonth)] : []}
                    onChange={(dates) => {
                      if (dates && dates.length > 0) {
                        setFormData(prev => ({ ...prev, dayOfMonth: dates[0].getDate() }));
                      }
                    }}
                  />
                </div>
              )}

              {formData.recurrenceType === 'specific-dates' && (
                <div>
                  <label className="block text-sm font-medium text-gray-800">Select Dates</label>
                  <Calendar
                    selectedDates={formData.dates.map(date => new Date(date))}
                    onChange={(dates) => {
                      if (dates) {
                        setFormData(prev => ({ ...prev, dates: dates.map(d => d.toISOString().split('T')[0]) }));
                      }
                    }}
                  />
                </div>
              )}

              {(formData.recurrenceType === 'weekly' || formData.recurrenceType === 'monthly') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-800">End Date</label>
                      <input type="date" name="recurringEndDate" value={formData.recurringEndDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                  </div>
                </div>
              )}

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
                    {(facilities as any[]).map((facility) => {
                      const facilityIdToUse = facility.facility?._id;
                      if (!facilityIdToUse) return null;
                      const isSelected = (formData.selectedFacilities as { facilityId: string }[]).some(f => f.facilityId === facilityIdToUse);
                      const selectedFacility = (formData.selectedFacilities as { facilityId: string, quantity: number }[]).find(f => f.facilityId === facilityIdToUse);
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
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="pos">POS</option>
                  <option value="online">Online</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">Payment Status</label>
                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex justify-end mt-8">
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
                  {halls.map((hall: any) => (
                    <option key={hall._id} value={hall._id}>
                      {hall.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800">Start Time</label>
                  <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">End Time</label>
                  <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
              </div>
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
                    {(facilities as any[]).map((facility) => {
                      const facilityIdToUse = facility.facility?._id;
                      if (!facilityIdToUse) return null;
                      const isSelected = (formData.selectedFacilities as { facilityId: string }[]).some(f => f.facilityId === facilityIdToUse);
                      const selectedFacility = (formData.selectedFacilities as { facilityId: string, quantity: number }[]).find(f => f.facilityId === facilityIdToUse);
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
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="pos">POS</option>
                  <option value="online">Online</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Payment Status</label>
                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="flex justify-end mt-8">
                <button type="submit" className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">
                  Create Walk-in Booking
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingModal;
