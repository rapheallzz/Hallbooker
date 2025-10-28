'use client';

import { useState, useEffect } from 'react';
import MediaUpload from './MediaUpload';

interface Facility {
  name: string;
  available: boolean;
  chargeable: boolean;
  chargeMethod: 'per_hour' | 'per_booking' | 'per_person';
  cost: number;
}

interface HallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  hall?: any;
}

const HallModal: React.FC<HallModalProps> = ({ isOpen, onClose, onSubmit, hall }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 0,
    openingHour: '09:00',
    closingHour: '23:00',
    location: '',
    pricing: JSON.stringify({}, null, 2),
    facilities: [] as Facility[],
    carParkCapacity: 0,
    hallSize: '',
    rules: '',
  });

  useEffect(() => {
    if (hall) {
      setFormData({
        name: hall.name || '',
        description: hall.description || '',
        capacity: hall.capacity || 0,
        openingHour: hall.openingHour || '09:00',
        closingHour: hall.closingHour || '23:00',
        location: hall.location || '',
        pricing: hall.pricing ? JSON.stringify(hall.pricing, null, 2) : JSON.stringify({}, null, 2),
        facilities: hall.facilities || [],
        carParkCapacity: hall.carParkCapacity || 0,
        hallSize: hall.hallSize || '',
        rules: Array.isArray(hall.rules) ? hall.rules.join('\n') : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        capacity: 0,
        openingHour: '09:00',
        closingHour: '23:00',
        location: '',
        pricing: JSON.stringify({}, null, 2),
        facilities: [],
        carParkCapacity: 0,
        hallSize: '',
        rules: '',
      });
    }
  }, [hall, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacilityChange = (index: number, field: keyof Facility, value: any) => {
    const newFacilities = [...formData.facilities];
    if (field === 'available' || field === 'chargeable') {
      newFacilities[index][field] = value as boolean;
    } else if (field === 'cost') {
      newFacilities[index][field] = Number(value);
    } else {
      newFacilities[index][field] = value;
    }
    setFormData((prev) => ({ ...prev, facilities: newFacilities }));
  };

  const addFacility = () => {
    setFormData((prev) => ({
      ...prev,
      facilities: [
        ...prev.facilities,
        { name: '', available: true, chargeable: false, chargeMethod: 'per_booking', cost: 0 },
      ],
    }));
  };

  const removeFacility = (index: number) => {
    const newFacilities = formData.facilities.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, facilities: newFacilities }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedPricing = JSON.parse(formData.pricing);
      const rulesArray = formData.rules.split('\n').filter(rule => rule.trim() !== '');
      onSubmit({
        ...formData,
        pricing: parsedPricing,
        rules: rulesArray,
        capacity: Number(formData.capacity),
        carParkCapacity: Number(formData.carParkCapacity),
      });
    } catch (error) {
      alert('Pricing is not a valid JSON object.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{hall ? 'Edit Hall' : 'Create a New Hall'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800">Hall Name</label>
            <input type="text" name="name" placeholder="Hall Name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Description</label>
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800">Capacity</label>
              <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">Location</label>
              <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">Opening Hour</label>
              <input type="time" name="openingHour" placeholder="Opening Hour" value={formData.openingHour} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">Closing Hour</label>
              <input type="time" name="closingHour" placeholder="Closing Hour" value={formData.closingHour} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">Car Park Capacity</label>
              <input type="number" name="carParkCapacity" placeholder="Car Park Capacity" value={formData.carParkCapacity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">Hall Size</label>
              <input type="text" name="hallSize" placeholder="Hall Size (e.g., 100 sqm)" value={formData.hallSize} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Pricing (JSON)</label>
            <textarea name="pricing" placeholder="Enter pricing as JSON" value={formData.pricing} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md font-mono text-gray-900 placeholder-gray-500" rows={5} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Rules (one rule per line)</label>
            <textarea name="rules" placeholder="Enter hall rules" value={formData.rules} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" rows={3} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-800">Facilities</label>
              <button type="button" onClick={addFacility} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">Add Facility</button>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto border p-3 rounded-md border-gray-300">
              {formData.facilities.map((facility, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-2 border rounded-md border-gray-300">
                  <input type="text" placeholder="Name" value={facility.name} onChange={(e) => handleFacilityChange(index, 'name', e.target.value)} className="col-span-3 px-2 py-1 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
                  <select value={facility.chargeMethod} onChange={(e) => handleFacilityChange(index, 'chargeMethod', e.target.value)} className="col-span-3 px-2 py-1 border border-gray-300 rounded-md text-gray-900">
                    <option value="per_hour">Per Hour</option>
                    <option value="per_booking">Per Booking</option>
                    <option value="per_person">Per Person</option>
                  </select>
                  <input type="number" placeholder="Cost" value={facility.cost} onChange={(e) => handleFacilityChange(index, 'cost', e.target.value)} className="col-span-2 px-2 py-1 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
                  <div className="col-span-3 flex items-center space-x-2">
                    <label><input type="checkbox" checked={facility.available} onChange={(e) => handleFacilityChange(index, 'available', e.target.checked)} /> Available</label>
                    <label><input type="checkbox" checked={facility.chargeable} onChange={(e) => handleFacilityChange(index, 'chargeable', e.target.checked)} /> Chargeable</label>
                  </div>
                  <button type="button" onClick={() => removeFacility(index)} className="col-span-1 text-red-500 hover:text-red-700">X</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-8 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">{hall ? 'Save Changes' : 'Create Hall'}</button>
          </div>
        </form>

        {hall?._id && (
          <MediaUpload
            hallId={hall._id}
            onUploadSuccess={(urls) => {
              // Optionally refresh hall data or update UI
              console.log('Uploaded:', urls);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default HallModal;
