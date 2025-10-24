'use client';

import React, { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns';

interface SearchComponentProps {
  onSearch: (location: string, date: string, capacity: string) => void;
}

const SearchComponent = ({ onSearch }: SearchComponentProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [capacity, setCapacity] = useState('');

  const handleSectionClick = (section: string) => {
    setActiveSection(section === activeSection ? null : section);
  };

  const handleDateSelect = (ranges: any) => {
    setDateRange(ranges.selection);
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div className="bg-white rounded-full shadow-md flex items-center transition-all duration-300 border border-gray-200">
        <div
          className={`flex-1 rounded-full p-3 cursor-pointer ${activeSection === 'location' ? 'bg-gray-100 shadow-inner' : 'hover:bg-gray-50'}`}
          onClick={() => handleSectionClick('location')}
        >
          <label htmlFor="location" className="block text-xs font-bold text-gray-600 px-4">Where</label>
          <input
            id="location"
            type="text"
            placeholder="Search destinations"
            className="w-full text-sm text-gray-900 bg-transparent focus:outline-none px-4"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="h-8 border-l border-gray-200"></div>
        <div
          className={`flex-1 rounded-full p-3 cursor-pointer ${activeSection === 'date' ? 'bg-gray-100 shadow-inner' : 'hover:bg-gray-50'}`}
          onClick={() => handleSectionClick('date')}
        >
          <label htmlFor="date" className="block text-xs font-bold text-gray-600 px-4">Date</label>
          <input
            id="date"
            type="text"
            placeholder="Add dates"
            className="w-full text-sm text-gray-900 bg-transparent focus:outline-none px-4"
            value={`${format(dateRange.startDate, 'MM/dd/yyyy')} - ${format(dateRange.endDate, 'MM/dd/yyyy')}`}
            readOnly
          />
        </div>
        <div className="h-8 border-l border-gray-200"></div>
        <div
          className={`flex-1 rounded-full p-3 cursor-pointer ${activeSection === 'capacity' ? 'bg-gray-100 shadow-inner' : 'hover:bg-gray-50'}`}
          onClick={() => handleSectionClick('capacity')}
        >
          <label htmlFor="capacity" className="block text-xs font-bold text-gray-600 px-4">Capacity</label>
          <input
            id="capacity"
            type="text"
            placeholder="Add capacity"
            className="w-full text-sm text-gray-900 bg-transparent focus:outline-none px-4"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>
        <div className="p-2">
          <button
            className="bg-primary text-white rounded-full p-3 hover:bg-primary-dark transition-colors"
            onClick={() => onSearch(location, `${format(dateRange.startDate, 'MM/dd/yyyy')} - ${format(dateRange.endDate, 'MM/dd/yyyy')}`, capacity)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {activeSection === 'location' && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg p-4">
          <ul>
            <li className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setLocation('Nearby'); setActiveSection(null); }}>Nearby</li>
            <li className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setLocation('New York'); setActiveSection(null); }}>New York</li>
            <li className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setLocation('London'); setActiveSection(null); }}>London</li>
          </ul>
        </div>
      )}

      {activeSection === 'date' && (
        <div className="absolute top-full mt-2 w-auto bg-white rounded-lg shadow-lg p-4 flex justify-center">
          <DateRangePicker
            onChange={handleDateSelect}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={[dateRange]}
            direction="horizontal"
          />
        </div>
      )}

      {activeSection === 'capacity' && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg p-4">
          <ul>
            <li className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setCapacity('100-400'); setActiveSection(null); }}>100-400</li>
            <li className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setCapacity('500-1000'); setActiveSection(null); }}>500-1000</li>
            <li className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setCapacity('1000+'); setActiveSection(null); }}>1000+</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
