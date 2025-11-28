
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
  const [activeTab, setActiveTab] = useState('walk-in');
  const [halls, setHalls] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState({
    hall: '',
    startTime: '',
    endTime: '',
    eventDetails: '',
    startDate: '',
    endDate: '',
    dayOfWeek: 0,
    time: '',
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'cash',
    paymentStatus: 'Pending',
    selectedFacilities: [],
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

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { hall, startDate, endDate, dayOfWeek, time, eventDetails } = formData;
    onSubmit({ hall, startDate, endDate, dayOfWeek, time, eventDetails }, 'recurring');
  };

  const handleFacilityChange = (facility: any) => {
    setFormData((prev) => {
      const selectedFacilities = prev.selectedFacilities as { facilityId: string, quantity: number }[];
      const isSelected = selectedFacilities.some((f) => f.facilityId === facility._id);
      if (isSelected) {
        return {
          ...prev,
          selectedFacilities: selectedFacilities.filter((f) => f.facilityId !== facility._id),
        };
      } else {
        return {
          ...prev,
          selectedFacilities: [...selectedFacilities, { facilityId: facility._id, quantity: 1 }],
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
    onSubmit({ hall, startTime, endTime, eventDetails, walkInUserDetails, paymentMethod, paymentStatus, selectedFacilities }, 'walk-in');
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
                <label className="block text-sm font-medium text-gray-800">Event Details</label>
                <input type="text" name="eventDetails" value={formData.eventDetails} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900" />
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
                        const isSelected = (formData.selectedFacilities as { facilityId: string }[]).some(f => f.facilityId === facility._id);
                        const selectedFacility = (formData.selectedFacilities as { facilityId: string, quantity: number }[]).find(f => f.facilityId === facility._id);
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
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-800">Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Payment Status</label>
                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
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

export default BookingModal;
