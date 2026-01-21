'use client';

import { useState, useRef } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import useOnClickOutside from '@/hooks/useOnClickOutside';

interface SearchBarProps {
  onSearch: (filters: { location: string; dateRange: DateRange | undefined; capacity: string; priceRange: [number, number] }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [showLocations, setShowLocations] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCapacity, setShowCapacity] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [capacity, setCapacity] = useState('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);

  const locationRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const capacityRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(locationRef, () => setShowLocations(false));
  useOnClickOutside(calendarRef, () => setShowCalendar(false));
  useOnClickOutside(capacityRef, () => setShowCapacity(false));
  useOnClickOutside(priceRef, () => setShowPrice(false));

  const locations = [
    'Lagos',
    'Abuja',
    'Port Harcourt',
    'Kano',
    'Ibadan',
    'Enugu',
    'Benin City',
    'Kaduna',
  ];

  const capacities = [
    'Any',
    '1-50',
    '50-100',
    '100-200',
    '200-500',
    '500+',
  ];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      location,
      dateRange,
      capacity,
      priceRange: [minPrice, maxPrice],
    });
  };

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-3xl md:rounded-full shadow-lg p-2 flex flex-col md:flex-row items-stretch md:items-center w-full max-w-5xl mx-auto">
      <div className="flex-1 relative group" ref={locationRef}>
        <div
          className="p-3 md:p-4 rounded-2xl md:rounded-full hover:bg-gray-100 cursor-pointer"
          onClick={() => setShowLocations(true)}
        >
          <label
            htmlFor="location"
            className="block text-sm font-bold text-gray-800"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where is your event?"
            className="w-full bg-transparent border-none focus:ring-0 text-gray-600 placeholder-gray-400 text-sm"
          />
        </div>
        {showLocations && (
          <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <ul className="py-2">
              {locations.map((loc) => (
                <li
                  key={loc}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setLocation(loc);
                    setShowLocations(false);
                  }}
                >
                  {loc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex-1 relative group" ref={priceRef}>
        <div
          className="p-3 md:p-4 rounded-2xl md:rounded-full hover:bg-gray-100 cursor-pointer border-t md:border-t-0 md:border-l border-gray-100"
          onClick={() => setShowPrice(!showPrice)}
        >
          <label
            htmlFor="price"
            className="block text-sm font-bold text-gray-800"
          >
            Price Range
          </label>
          <div className="text-gray-600 truncate text-sm">
            ₦{minPrice.toLocaleString()} - ₦{maxPrice.toLocaleString()}
          </div>
        </div>
        {showPrice && (
          <div className="absolute z-20 w-full md:w-64 mt-1 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
             <div className="space-y-4">
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Min Price (₦)</label>
                 <input
                   type="number"
                   value={minPrice}
                   onChange={(e) => setMinPrice(Number(e.target.value))}
                   className="w-full border rounded-md p-2 text-sm"
                   placeholder="Min"
                 />
               </div>
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Max Price (₦)</label>
                 <input
                   type="number"
                   value={maxPrice}
                   onChange={(e) => setMaxPrice(Number(e.target.value))}
                   className="w-full border rounded-md p-2 text-sm"
                   placeholder="Max"
                 />
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="flex-1 relative group" ref={calendarRef}>
        <div
          className="p-3 md:p-4 rounded-2xl md:rounded-full hover:bg-gray-100 cursor-pointer border-t md:border-t-0 md:border-l border-gray-100"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <label
            htmlFor="date"
            className="block text-sm font-bold text-gray-800"
          >
            Date
          </label>
          <div className="w-full bg-transparent border-none focus:ring-0 text-gray-600 placeholder-gray-400 text-sm truncate">
            {dateRange?.from ? (
              dateRange.to ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}` : format(dateRange.from, 'MMM d')
            ) : 'Select dates'}
          </div>
        </div>
        {showCalendar && (
          <div className="absolute z-30 mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 overflow-auto max-w-[90vw]">
            <style>{`
              .rdp-day_selected, .rdp-day_selected:hover {
                background-color: #295FA7 !important;
                color: white !important;
              }
              .rdp-day_range_middle {
                background-color: #EBF2FF !important;
                color: #295FA7 !important;
              }
            `}</style>
            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              disabled={{ before: new Date() }}
              className="m-0"
            />
          </div>
        )}
      </div>

      <div className="flex-1 relative group" ref={capacityRef}>
        <div
          className="p-3 md:p-4 rounded-2xl md:rounded-full hover:bg-gray-100 cursor-pointer border-t md:border-t-0 md:border-l border-gray-100"
          onClick={() => setShowCapacity(!showCapacity)}
        >
          <label
            htmlFor="capacity"
            className="block text-sm font-bold text-gray-800"
          >
            Capacity
          </label>
          <input
            type="text"
            readOnly
            value={capacity || 'number of Guest'}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-600 text-sm"
          />
        </div>
        {showCapacity && (
          <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <ul className="py-2">
              {capacities.map((cap) => (
                <li
                  key={cap}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setCapacity(cap);
                    setShowCapacity(false);
                  }}
                >
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button type="submit" className="bg-[#295FA7] hover:bg-blue-700 text-white rounded-2xl md:rounded-full p-4 mt-2 md:mt-0 md:mr-2 flex items-center justify-center space-x-2 md:space-x-0">
        <span className="md:hidden font-bold">Search</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 md:h-6 md:w-6"
          fill="none"
          viewBox="0 0 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;
