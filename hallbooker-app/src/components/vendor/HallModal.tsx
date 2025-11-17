
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MediaUpload from './MediaUpload';
import api from '@/services/api';
import Swal from 'sweetalert2';

interface Facility {
  facility: string; // Changed from name to facility to store ID
  name: string; // To store the facility name for display
  available: boolean;
  chargeable: boolean;
  chargeMethod?: 'free' | 'flat' | 'per_hour';
  cost?: number;
}
interface APIFacility {
  _id: string;
  name: string;
}

interface HallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  hall?: any;
}

const HallModal: React.FC<HallModalProps> = ({ isOpen, onClose, onSubmit, hall }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [hallId, setHallId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableFacilities, setAvailableFacilities] = useState<APIFacility[]>([]);
  const [chargeMethods, setChargeMethods] = useState<string[]>([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    state: '',
    localGovernment: '',
    description: '',
    capacity: 0,
    openingHour: '09:00',
    closingHour: '23:00',
    location: '',
    hourlyRate: 0,
    dailyRate: 0,
    facilities: [] as Facility[],
    carParkCapacity: 0,
    hallSize: '',
    rules: '',
  });

  useEffect(() => {
    if (isOpen) {
      const fetchInitialData = async () => {
        try {
          // Fetch facilities and charge methods
          const facilitiesResponse = await api.get('/facilities');
          setAvailableFacilities(facilitiesResponse.data.data.facilities);
          setChargeMethods(facilitiesResponse.data.data.chargeMethods);

          // Fetch countries
          const countriesResponse = await api.get('/locations/countries');
          setCountries(countriesResponse.data.data);
        } catch (error) {
          console.error('Failed to fetch initial data:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to load necessary data. Please try again.',
          });
        }
      };
      fetchInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.country) {
      const fetchStates = async () => {
        try {
          const response = await api.get(`/locations/states/${formData.country}`);
          setStates(response.data.data);
        } catch (error) {
          console.error('Failed to fetch states:', error);
        }
      };
      fetchStates();
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      const fetchLgas = async () => {
        try {
          const response = await api.get(`/locations/lgas/${formData.state}`);
          setLgas(response.data.data);
        } catch (error) {
          console.error('Failed to fetch LGAs:', error);
        }
      };
      fetchLgas();
    }
  }, [formData.state]);

  useEffect(() => {
    // This effect handles the transition from step 2 to 3 after a hall is created.
    // It waits for hallId to be set before moving to the next step to avoid race conditions.
    if (hallId && !hall && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [hallId, hall, currentStep]);

  useEffect(() => {
    if (hall) {
      // Map incoming hall facilities to the new structure
      const mappedFacilities = hall.facilities ? hall.facilities.map((fac: any) => ({
        facility: fac.facility?._id || fac.facility, // Handle populated and non-populated facility
        name: fac.facility?.name || fac.name, // Display name
        available: fac.available,
        chargeable: fac.chargeable,
        chargeMethod: fac.chargeMethod,
        cost: fac.cost,
      })) : [];

      setFormData({
        name: hall.name || '',
        description: hall.description || '',
        capacity: hall.capacity || 0,
        openingHour: hall.openingHour || '09:00',
        closingHour: hall.closingHour || '23:00',
        location: hall.location || '',
        hourlyRate: hall.pricing?.hourlyRate || hall.pricing?.perHour || 0,
        dailyRate: hall.pricing?.dailyRate || hall.pricing?.perDay || 0,
        facilities: mappedFacilities,
        carParkCapacity: hall.carParkCapacity || 0,
        hallSize: hall.hallSize || '',
        rules: Array.isArray(hall.rules) ? hall.rules.join('\n') : '',
        country: hall.country || '',
        state: hall.state || '',
        localGovernment: hall.localGovernment || '',
      });
      setHallId(hall._id);
    } else {
      setFormData({
        name: '',
        description: '',
        capacity: 0,
        openingHour: '09:00',
        closingHour: '23:00',
        location: '',
        hourlyRate: 0,
        dailyRate: 0,
        facilities: [],
        carParkCapacity: 0,
        hallSize: '',
        rules: '',
        country: '',
        state: '',
        localGovernment: '',
      });
      setCurrentStep(1);
      setHallId(null);
    }
  }, [hall, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacilityChange = (index: number, field: keyof Facility, value: any) => {
    const newFacilities = [...formData.facilities];
    const facility = newFacilities[index];

    if (field === 'facility') {
      const selectedFacility = availableFacilities.find(f => f._id === value);
      facility.facility = selectedFacility?._id || '';
      facility.name = selectedFacility?.name || '';
    } else if (field === 'available' || field === 'chargeable') {
      facility[field] = value as boolean;
      if (field === 'chargeable' && !value) {
        // If chargeable is unchecked, reset charge method and cost
        delete facility.chargeMethod;
        delete facility.cost;
      }
    } else if (field === 'cost') {
      facility.cost = Number(value);
    } else {
      facility[field] = value;
    }

    setFormData((prev) => ({ ...prev, facilities: newFacilities }));
  };

  const addFacility = () => {
    setFormData((prev) => ({
      ...prev,
      facilities: [
        ...prev.facilities,
        // Initialize with empty values, user will select a facility
        { facility: '', name: '', available: true, chargeable: false },
      ],
    }));
  };

  const removeFacility = (index: number) => {
    const newFacilities = formData.facilities.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, facilities: newFacilities }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up facilities data before submission
    const facilitiesPayload = formData.facilities.map(({ name, ...rest }) => {
      const facilityData: any = { ...rest };
      if (!facilityData.chargeable) {
        delete facilityData.chargeMethod;
        delete facilityData.cost;
      }
      return facilityData;
    });

    if (hall) {
      // If we are editing, just submit the whole form at once
      const { hourlyRate, dailyRate, facilities, openingHour, closingHour, country, state, localGovernment, ...rest } = formData;
      const pricing = {
        hourlyRate: Number(hourlyRate),
        dailyRate: Number(dailyRate),
      };
      const rulesArray = formData.rules.split('\n').filter(rule => rule.trim() !== '');

      const payload: any = {
        ...rest,
        pricing,
        facilities: facilitiesPayload,
        rules: rulesArray,
        capacity: Number(formData.capacity),
        carParkCapacity: Number(formData.carParkCapacity),
      };

      // Convert time strings to numbers if they are strings
      if (typeof openingHour === 'string' && openingHour.includes(':')) {
        payload.openingHour = parseInt(openingHour.replace(':', ''), 10);
      } else {
        payload.openingHour = openingHour;
      }

      if (typeof closingHour === 'string' && closingHour.includes(':')) {
        payload.closingHour = parseInt(closingHour.replace(':', ''), 10);
      } else {
        payload.closingHour = closingHour;
      }

      // Only include location fields if they have a value
      if (country) payload.country = country;
      if (state) payload.state = state;
      if (localGovernment) payload.localGovernment = localGovernment;

      onSubmit(payload);
      return;
    }

    // Otherwise, handle the multi-step creation
    if (currentStep === 1) {
      handleNext();
    } else if (currentStep === 2) {
      const rulesArray = formData.rules.split('\n').filter(rule => rule.trim() !== '');
      const payload = {
        name: formData.name,
        country: formData.country,
        state: formData.state,
        localGovernment: formData.localGovernment,
        description: formData.description,
        capacity: Number(formData.capacity),
        openingHour: formData.openingHour,
        closingHour: formData.closingHour,
        location: formData.location,
        pricing: {
          hourlyRate: Number(formData.hourlyRate),
          dailyRate: Number(formData.dailyRate),
        },
        facilities: facilitiesPayload,
        carParkCapacity: Number(formData.carParkCapacity),
        hallSize: formData.hallSize,
        rules: rulesArray,
      };
      setIsSubmitting(true);
      Swal.fire({
        title: 'Creating Hall...',
        text: 'Please wait while we set things up.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const response = await api.post('/halls', payload);
        setHallId(response.data.data._id);
        Swal.close();
        // handleNext() is removed from here. The useEffect will handle the step change.
      } catch (error) {
        console.error('Failed to create hall:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to create hall. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onClose(); // Just close the modal on the final step
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{hall ? 'Edit Hall' : 'Create a New Hall'}</h2>
          {!hall && (
            <div className="flex items-center mt-2">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-700'}`}>
                <div className={`w-6 h-6 rounded-full border-2 ${currentStep >= 1 ? 'border-primary' : 'border-gray-400'} flex items-center justify-center`}>1</div>
                <span className="ml-2">Basic Info</span>
              </div>
              <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-700'}`}>
                <div className={`w-6 h-6 rounded-full border-2 ${currentStep >= 2 ? 'border-primary' : 'border-gray-400'} flex items-center justify-center`}>2</div>
                <span className="ml-2">Details & Pricing</span>
              </div>
              <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              <div className={`flex items-center ${currentStep === 3 ? 'text-primary' : 'text-gray-700'}`}>
                <div className={`w-6 h-6 rounded-full border-2 ${currentStep === 3 ? 'border-primary' : 'border-gray-400'} flex items-center justify-center`}>3</div>
                <span className="ml-2">Media</span>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {hall ? (
            <>
              {/* Render all fields for editing */}
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
                  <label className="block text-sm font-medium text-gray-800">Country</label>
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                    <option value="">Select Country</option>
                    {countries.map((country: any) => <option key={country._id} value={country._id}>{country.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">State</label>
                  <select name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                    <option value="">Select State</option>
                    {states.map((state: any) => <option key={state._id} value={state._id}>{state.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">LGA</label>
                  <select name="localGovernment" value={formData.localGovernment} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                    <option value="">Select LGA</option>
                    {lgas.map((lga: any) => <option key={lga._id} value={lga._id}>{lga.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Location</label>
                  <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Capacity</label>
                  <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Opening Hour</label>
                  <input type="time" name="openingHour" placeholder="Opening Hour" value={formData.openingHour} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Closing Hour</label>
                  <input type="time" name="closingHour" placeholder="Closing Hour" value={formData.closingHour} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800">Price Per Hour</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₦</span>
                    <input type="number" name="hourlyRate" placeholder="Price Per Hour" value={formData.hourlyRate} onChange={handleChange} className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Price Per Day</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₦</span>
                    <input type="number" name="dailyRate" placeholder="Price Per Day" value={formData.dailyRate} onChange={handleChange} className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
                  </div>
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
                    <div key={index} className="p-2 border rounded-md border-gray-300 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <select
                          value={facility.facility}
                          onChange={(e) => handleFacilityChange(index, 'facility', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-900"
                        >
                          <option value="">Select Facility</option>
                          {availableFacilities.map((f) => (
                            <option key={f._id} value={f._id}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3 flex items-center space-x-2">
                        <label className="flex items-center">
                          <input type="checkbox" checked={facility.available} onChange={(e) => handleFacilityChange(index, 'available', e.target.checked)} className="mr-1" />
                          <span className="text-sm">Available</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" checked={facility.chargeable} onChange={(e) => handleFacilityChange(index, 'chargeable', e.target.checked)} className="mr-1" />
                          <span className="text-sm">Chargeable</span>
                        </label>
                      </div>

                      {facility.chargeable && (
                        <>
                          <div className="col-span-2">
                            <select
                              value={facility.chargeMethod || ''}
                              onChange={(e) => handleFacilityChange(index, 'chargeMethod', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-900"
                            >
                              <option value="" disabled>Charge Method</option>
                              {chargeMethods.map((method) => (
                                <option key={method} value={method}>{method.replace('_', ' ')}</option>
                              ))}
                            </select>
                          </div>
                          {(facility.chargeMethod === 'flat' || facility.chargeMethod === 'per_hour') && (
                            <div className="col-span-2">
                              <input
                                type="number"
                                placeholder="Cost"
                                value={facility.cost || ''}
                                onChange={(e) => handleFacilityChange(index, 'cost', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500"
                              />
                            </div>
                          )}
                        </>
                      )}

                      <div className="col-span-1 flex justify-end">
                        <button type="button" onClick={() => removeFacility(index)} className="text-red-500 hover:text-red-700">X</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {hallId && (
                <MediaUpload
                  hallId={hallId}
                  onUploadSuccess={(urls) => {
                    console.log('Uploaded:', urls);
                  }}
                />
              )}
            </>
          ) : (
            <>
              {currentStep === 1 && (
                <>
                  {/* Step 1 fields */}
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
                      <label className="block text-sm font-medium text-gray-800">Country</label>
                      <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                        <option value="">Select Country</option>
                        {countries.map((country: any) => <option key={country._id} value={country._id}>{country.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800">State</label>
                      <select name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                        <option value="">Select State</option>
                        {states.map((state: any) => <option key={state._id} value={state._id}>{state.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800">LGA</label>
                      <select name="localGovernment" value={formData.localGovernment} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900">
                        <option value="">Select LGA</option>
                        {lgas.map((lga: any) => <option key={lga._id} value={lga._id}>{lga.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800">Location</label>
                      <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800">Capacity</label>
                      <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800">Opening Hour</label>
                      <input type="time" name="openingHour" placeholder="Opening Hour" value={formData.openingHour} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800">Closing Hour</label>
                      <input type="time" name="closingHour" placeholder="Closing Hour" value={formData.closingHour} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  {/* Step 2 fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800">Price Per Hour</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₦</span>
                        <input type="number" name="hourlyRate" placeholder="Price Per Hour" value={formData.hourlyRate} onChange={handleChange} className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800">Price Per Day</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₦</span>
                        <input type="number" name="dailyRate" placeholder="Price Per Day" value={formData.dailyRate} onChange={handleChange} className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
                      </div>
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
                        <div key={index} className="p-2 border rounded-md border-gray-300 grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4">
                            <select
                              value={facility.facility}
                              onChange={(e) => handleFacilityChange(index, 'facility', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-900"
                            >
                              <option value="">Select Facility</option>
                              {availableFacilities.map((f) => (
                                <option key={f._id} value={f._id}>{f.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-3 flex items-center space-x-2">
                            <label className="flex items-center">
                              <input type="checkbox" checked={facility.available} onChange={(e) => handleFacilityChange(index, 'available', e.target.checked)} className="mr-1" />
                              <span className="text-sm">Available</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" checked={facility.chargeable} onChange={(e) => handleFacilityChange(index, 'chargeable', e.target.checked)} className="mr-1" />
                              <span className="text-sm">Chargeable</span>
                            </label>
                          </div>

                          {facility.chargeable && (
                            <>
                              <div className="col-span-2">
                                <select
                                  value={facility.chargeMethod || ''}
                                  onChange={(e) => handleFacilityChange(index, 'chargeMethod', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-900"
                                >
                                  <option value="" disabled>Charge Method</option>
                                  {chargeMethods.map((method) => (
                                    <option key={method} value={method}>{method.replace('_', ' ')}</option>
                                  ))}
                                </select>
                              </div>
                              {(facility.chargeMethod === 'flat' || facility.chargeMethod === 'per_hour') && (
                                <div className="col-span-2">
                                  <input
                                    type="number"
                                    placeholder="Cost"
                                    value={facility.cost || ''}
                                    onChange={(e) => handleFacilityChange(index, 'cost', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500"
                                  />
                                </div>
                              )}
                            </>
                          )}

                          <div className="col-span-1 flex justify-end">
                            <button type="button" onClick={() => removeFacility(index)} className="text-red-500 hover:text-red-700">X</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {currentStep === 3 && hallId && (
                <MediaUpload
                  hallId={hallId}
                  onUploadSuccess={(urls) => {
                    console.log('Uploaded:', urls);
                  }}
                />
              )}
            </>
          )}

          <div className="flex justify-end mt-8 space-x-4">
            {!hall && currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : (hall ? 'Save Changes' : (currentStep === 1 || currentStep === 2 ? 'Continue' : 'Finish'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HallModal;
