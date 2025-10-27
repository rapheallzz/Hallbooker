'use client';

import { useState, useEffect } from 'react';

interface HallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  hall?: any;
}

const HallModal: React.FC<HallModalProps> = ({ isOpen, onClose, onSubmit, hall }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    capacity: '',
    description: '',
  });

  useEffect(() => {
    if (hall) {
      setFormData({
        name: hall.name || '',
        location: hall.location || '',
        price: hall.price || '',
        capacity: hall.capacity || '',
        description: hall.description || '',
      });
    } else {
      setFormData({
        name: '',
        location: '',
        price: '',
        capacity: '',
        description: '',
      });
    }
  }, [hall, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{hall ? 'Edit Hall' : 'Create a New Hall'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Hall Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price per hour"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
            <input
              type="number"
              name="capacity"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              rows={4}
            />
          </div>
          <div className="flex justify-end mt-8 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              {hall ? 'Save Changes' : 'Create Hall'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HallModal;
