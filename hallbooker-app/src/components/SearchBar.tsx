'use client';

import { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';

interface SearchBarProps {
  onSearch: (filters: { location: string; dateRange: any; capacity: string }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [showLocations, setShowLocations] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCapacity, setShowCapacity] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [capacity, setCapacity] = useState('');

  const locations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Miami, FL',
  ];

  const capacities = [
    'Any',
    '1-50',
    '50-100',
    '100-200',
    '200-500',
    '500+',
  ];

  const handleDateChange = (ranges: any) => {
    setDateRange([ranges.selection]);
  };

  const handleSearch = () => {
    onSearch({
      location,
      dateRange,
      capacity,
    });
  };

  return (
    <div className="bg-white rounded-full shadow-lg p-2 flex items-center w-full max-w-4xl mx-auto">
      <div className="flex-1 relative group">
        <div
          className="p-4 rounded-full hover:bg-gray-100 cursor-pointer"
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
            onBlur={() => setTimeout(() => setShowLocations(false), 100)}
            placeholder="Where are you going?"
            className="w-full bg-transparent border-none focus:ring-0 text-gray-600 placeholder-gray-400"
          />
        </div>
        {showLocations && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg">
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

      <div className="flex-1 relative group">
        <div
          className="p-4 rounded-full hover:bg-gray-100 cursor-pointer"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <label
            htmlFor="date"
            className="block text-sm font-bold text-gray-800"
          >
            Date
          </label>
          <input
            type="text"
            readOnly
            value={`${format(dateRange[0].startDate, 'MMM d')} - ${format(
              dateRange[0].endDate,
              'MMM d'
            )}`}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-600"
          />
        </div>
        {showCalendar && (
          <div className="absolute z-10 mt-2">
            <DateRangePicker
              onChange={handleDateChange}
              showSelectionPreview={true}
              moveRangeOnFirstSelection={false}
              months={2}
              ranges={dateRange}
              direction="horizontal"
              className="rounded-xl shadow-lg"
            />
          </div>
        )}
      </div>

      <div className="flex-1 relative group">
        <div
          className="p-4 rounded-full hover:bg-gray-100 cursor-pointer"
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
            value={capacity || 'Add guests'}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-600"
          />
        </div>
        {showCapacity && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg">
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

      <button onClick={handleSearch} className="bg-[#295FA7] hover:bg-blue-700 text-white rounded-full p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
    </div>
  );
};

export default SearchBar;
