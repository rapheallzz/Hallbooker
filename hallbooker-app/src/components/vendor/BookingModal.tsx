
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: string) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('standard');
  const [halls, setHalls] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState({
    hall: '',
    startTime: '',
    endTime: '',
    eventType: '',
    startDate: '',
    endDate: '',
    dayOfWeek: 0,
    time: '',
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'cash',
    selectedFacilityNames: [],
  });

  useEffect(() => {
    if (isOpen) {
      const fetchHalls = async () => {
        try {
          const response = await api.get('/halls/by-owner');
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

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { hall, startTime, endTime, eventType } = formData;
    onSubmit({ hall, startTime, endTime, eventType }, 'standard');
  };

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { hall, startDate, endDate, dayOfWeek, time, eventType } = formData;
    onSubmit({ hall, startDate, endDate, dayOfWeek, time, eventType }, 'recurring');
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
    const { hall, startTime, endTime, eventType, fullName, email, phone, paymentMethod, selectedFacilityNames } = formData;
    const walkInUserDetails = { fullName, email, phone };
    onSubmit({ hall, startTime, endTime, eventType, walkInUserDetails, paymentMethod, selectedFacilityNames }, 'walk-in');
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
            className={`px-4 py-2 ${activeTab === 'standard' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('standard')}
          >
            Standard
          </button>
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
          {activeTab === 'standard' && (
            <form onSubmit={handleStandardSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-800">Event Type</label>
                <input type="text" name="eventType" value={formData.eventType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
              <div className="flex justify-end mt-8">
                <button type="submit" className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">
                  Create Booking
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
                  {halls.map((hall: any) => (
                    <option key={hall._id} value={hall._id}>
                      {hall.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800">Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Day of the Week</label>
                <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Time</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Event Type</label>
                <input type="text" name="eventType" value={formData.eventType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
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

export default BookingModal;
