'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const NewVenuePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    location: '',
    capacity: '',
    amenities: '',
    openingHour: '09:00',
    closingHour: '22:00',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const amenitiesArray = formData.amenities.split(',').map(item => item.trim());
      const payload = {
        ...formData,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        amenities: amenitiesArray,
      };

      await api.post('/venues', payload);
      router.push('/vendor/venues');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while creating the venue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Add a New Venue</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Venue Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price per Day ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amenities (comma-separated)</label>
          <input
            type="text"
            name="amenities"
            value={formData.amenities}
            onChange={handleChange}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Opening Hour</label>
            <input
              type="time"
              name="openingHour"
              value={formData.openingHour}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Closing Hour</label>
            <input
              type="time"
              name="closingHour"
              value={formData.closingHour}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {submitting ? 'Creating...' : 'Create Venue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewVenuePage;