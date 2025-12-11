
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => void;
}

const AdminBookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('walk-in');
  const [halls, setHalls] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState({
    hall: '',
    startTime: '',
    endTime: '',
    numberOfPeople: 0,
    eventType: '',
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'cash',
    selectedFacilityNames: [],
  });

  // State for recurring booking
  const [recurrenceType, setRecurrenceType] = useState('pattern'); // 'pattern' or 'dates'
  const [recurringFormData, setRecurringFormData] = useState({
    hallId: '',
    recurrenceRule: {
      frequency: 'weekly',
      daysOfWeek: [0],
      dayOfMonth: 1,
      endDate: '',
    },
    dates: [] as string[],
    time: '',
    eventDetails: '',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    walkInUserDetails: {
      fullName: '',
      email: '',
      phone: '',
    },
  });
  const [specificDate, setSpecificDate] = useState('');

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
    const hallId = activeTab === 'recurring' ? recurringFormData.hallId : formData.hall;
    if (hallId) {
      const selectedHall = halls.find((h: any) => h._id === hallId);
      if (selectedHall) {
        setFacilities((selectedHall as any).facilities);
      }
    }
  }, [formData.hall, recurringFormData.hallId, halls, activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecurringChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    if (section === 'recurrenceRule') {
      setRecurringFormData(prev => ({ ...prev, recurrenceRule: { ...prev.recurrenceRule, [field]: value } }));
    } else if (section === 'walkInUserDetails') {
        setRecurringFormData(prev => ({ ...prev, walkInUserDetails: { ...prev.walkInUserDetails, [field]: value } }));
    } else {
      setRecurringFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDayOfWeekChange = (dayIndex: number) => {
    setRecurringFormData(prev => {
      const daysOfWeek = prev.recurrenceRule.daysOfWeek;
      const newDaysOfWeek = daysOfWeek.includes(dayIndex)
        ? daysOfWeek.filter(d => d !== dayIndex)
        : [...daysOfWeek, dayIndex];
      return { ...prev, recurrenceRule: { ...prev.recurrenceRule, daysOfWeek: newDaysOfWeek } };
    });
  };

  const addSpecificDate = () => {
    if (specificDate && !recurringFormData.dates.includes(specificDate)) {
      setRecurringFormData(prev => ({ ...prev, dates: [...prev.dates, specificDate] }));
      setSpecificDate('');
    }
  };

  const removeSpecificDate = (dateToRemove: string) => {
    setRecurringFormData(prev => ({ ...prev, dates: prev.dates.filter(date => date !== dateToRemove) }));
  };

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { dates, recurrenceRule, ...rest } = recurringFormData;

    let payload: any = { ...rest };

    if (recurrenceType === 'pattern') {
      payload.recurrenceRule = recurrenceRule;
    } else {
      payload.dates = dates;
    }

    onSubmit(payload, 'recurring');
  };

  const handleFacilityChange = (facilityName: string) => {
    setFormData((prev) => {
      const selectedFacilities = prev.selectedFacilityNames as string[];
      if (selectedFacilities.includes(facilityName)) {
        return {
          ...prev,
          selectedFacilityNames: selectedFacilities.filter((name) => name !== facilityName),
        };
      } else {
        return {
          ...prev,
          selectedFacilityNames: [...selectedFacilities, facilityName],
        };
      }
    });
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { hall, startTime, endTime, numberOfPeople, eventType, fullName, email, phone, paymentMethod, selectedFacilityNames } = formData;
    const walkInUserDetails = { fullName, email, phone };
    onSubmit({ hallId: hall, startTime, endTime, numberOfPeople, eventDetails: eventType, walkInUserDetails, paymentMethod, selectedFacilityNames }, 'walk-in');
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
          <button
            className={`px-4 py-2 ${activeTab === 'walk-in' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('walk-in')}
          >
            Walk-in
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'recurring' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('recurring')}
          >
            Recurring
          </button>
        </div>
        <div>
        {activeTab === 'recurring' && (
            <form onSubmit={handleRecurringSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800">Hall</label>
                <select name="hallId" value={recurringFormData.hallId} onChange={handleRecurringChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="">Select a hall</option>
                  {halls.map((hall: any) => (
                    <option key={hall._id} value={hall._id}>
                      {hall.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                      <input type="radio" name="recurrenceType" value="pattern" checked={recurrenceType === 'pattern'} onChange={(e) => setRecurrenceType(e.target.value)} className="mr-2"/>
                      Pattern-based
                  </label>
                  <label className="flex items-center">
                      <input type="radio" name="recurrenceType" value="dates" checked={recurrenceType === 'dates'} onChange={(e) => setRecurrenceType(e.target.value)} className="mr-2"/>
                      Specific Dates
                  </label>
              </div>

              {recurrenceType === 'pattern' ? (
                <div className="space-y-4 p-4 border rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-800">Frequency</label>
                            <select name="recurrenceRule.frequency" value={recurringFormData.recurrenceRule.frequency} onChange={handleRecurringChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-800">End Date</label>
                           <input type="date" name="recurrenceRule.endDate" value={recurringFormData.recurrenceRule.endDate} onChange={handleRecurringChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                        </div>
                    </div>

                  {recurringFormData.recurrenceRule.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-800">Days of the Week</label>
                      <div className="flex flex-wrap gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <label key={day} className="flex items-center space-x-1">
                            <input type="checkbox" checked={recurringFormData.recurrenceRule.daysOfWeek.includes(index)} onChange={() => handleDayOfWeekChange(index)} />
                            <span>{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {recurringFormData.recurrenceRule.frequency === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-800">Day of Month</label>
                      <input type="number" name="recurrenceRule.dayOfMonth" value={recurringFormData.recurrenceRule.dayOfMonth} onChange={handleRecurringChange} min="1" max="31" className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 p-4 border rounded-md">
                    <label className="block text-sm font-medium text-gray-800">Select Specific Dates</label>
                    <div className="flex items-center gap-2">
                        <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"/>
                        <button type="button" onClick={addSpecificDate} className="px-4 py-2 rounded-md text-white bg-secondary">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {recurringFormData.dates.map(date => (
                            <div key={date} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm">
                                {date}
                                <button type="button" onClick={() => removeSpecificDate(date)} className="ml-2 text-red-500">X</button>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-800">Time</label>
                <input type="time" name="time" value={recurringFormData.time} onChange={handleRecurringChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Event Details</label>
                <input type="text" name="eventDetails" value={recurringFormData.eventDetails} onChange={handleRecurringChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
               <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-medium text-gray-800">User Details</legend>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Full Name</label>
                  <input type="text" name="walkInUserDetails.fullName" value={recurringFormData.walkInUserDetails.fullName} onChange={handleRecurringChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Email</label>
                  <input type="email" name="walkInUserDetails.email" value={recurringFormData.walkInUserDetails.email} onChange={handleRecurringChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Phone</label>
                  <input type="tel" name="walkInUserDetails.phone" value={recurringFormData.walkInUserDetails.phone} onChange={handleRecurringChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
              </fieldset>
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
                <label className="block text-sm font-medium text-gray-800">Number of People</label>
                <input type="number" name="numberOfPeople" value={formData.numberOfPeople} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Event Type</label>
                <input type="text" name="eventType" value={formData.eventType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
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
                <div className="grid grid-cols-2 gap-2">
                  {facilities.map((facility: any) => (
                    <label key={facility.name} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(formData.selectedFacilityNames as string[]).includes(facility.name)}
                        onChange={() => handleFacilityChange(facility.name)}
                        className="mr-2"
                      />
                      {facility.name}
                    </label>
                  ))}
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-800">Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
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
