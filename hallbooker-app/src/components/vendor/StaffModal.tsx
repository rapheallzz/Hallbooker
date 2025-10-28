'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api'; // Assuming you have an API service to fetch halls

interface Hall {
  _id: string;
  name: string;
}

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  staff?: any; // For editing existing staff
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSubmit, staff }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    hallIds: [] as string[],
  });
  const [allHalls, setAllHalls] = useState<Hall[]>([]);

  useEffect(() => {
    // Fetch all halls to populate the multi-select dropdown
    const fetchHalls = async () => {
      try {
        const response = await api.get('/halls/by-owner');
        setAllHalls(response.data.data);
      } catch (error) {
        console.error('Failed to fetch halls:', error);
      }
    };
    if (isOpen) {
      fetchHalls();
    }
  }, [isOpen]);

  useEffect(() => {
    if (staff) {
      setFormData({
        fullName: staff.fullName || '',
        email: staff.email || '',
        phone: staff.phone || '',
        password: '', // Password should not be pre-filled
        hallIds: staff.hallIds || [],
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        hallIds: [],
      });
    }
  }, [staff, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHallSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, hallIds: selectedIds }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Omit password if it's empty (for editing without changing password)
    const dataToSubmit: any = { ...formData };
    if (!dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800">Full Name</label>
            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Email Address</label>
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Phone Number</label>
            <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Password</label>
            <input type="password" name="password" placeholder={staff ? 'New Password (leave blank to keep current)' : 'Password'} value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
          </div>
          <div>
            <label htmlFor="hallIds" className="block text-sm font-medium text-gray-800">Assign Halls</label>
            <select
              id="hallIds"
              name="hallIds"
              multiple
              value={formData.hallIds}
              onChange={handleHallSelection}
              className="w-full h-32 px-4 py-2 border border-gray-300 rounded-md text-gray-900"
            >
              {allHalls.map((hall) => (
                <option key={hall._id} value={hall._id} className="text-gray-900">
                  {hall.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end mt-8 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">{staff ? 'Save Changes' : 'Add Staff'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
