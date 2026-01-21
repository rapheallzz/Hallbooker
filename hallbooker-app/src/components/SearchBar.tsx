'use client';

import { useState, useRef } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Banknote, Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSearch}
      className="bg-white rounded-[2rem] md:rounded-full shadow-2xl p-2 flex flex-col md:flex-row items-stretch md:items-center w-full max-w-5xl mx-auto border border-gray-100"
    >
      {/* Location Section */}
      <motion.div variants={itemVariants} className="flex-1 relative group" ref={locationRef}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="p-4 md:p-5 rounded-2xl md:rounded-full hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-3"
          onClick={() => setShowLocations(true)}
        >
          <div className="bg-blue-50 p-2.5 rounded-full text-blue-600 md:hidden">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center space-x-1">
              <MapPin className="hidden md:block w-4 h-4 text-gray-400" />
              <label htmlFor="location" className="block text-xs md:text-sm font-bold text-gray-800 uppercase tracking-tight">
                Location
              </label>
            </div>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where is your event?"
              className="w-full bg-transparent border-none focus:ring-0 text-gray-600 placeholder-gray-400 text-sm mt-0.5"
            />
          </div>
        </motion.div>
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
      </motion.div>

      {/* Price Section */}
      <motion.div variants={itemVariants} className="flex-1 relative group border-t md:border-t-0 md:border-l border-gray-100" ref={priceRef}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="p-4 md:p-5 rounded-2xl md:rounded-full hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-3"
          onClick={() => setShowPrice(!showPrice)}
        >
          <div className="bg-green-50 p-2.5 rounded-full text-green-600 md:hidden">
            <Banknote className="w-5 h-5" />
          </div>
          <div className="flex-grow overflow-hidden">
            <div className="flex items-center space-x-1">
              <Banknote className="hidden md:block w-4 h-4 text-gray-400" />
              <label className="block text-xs md:text-sm font-bold text-gray-800 uppercase tracking-tight">
                Price Range
              </label>
            </div>
            <div className="text-gray-600 truncate text-sm mt-0.5 flex items-center">
              <span>₦{minPrice.toLocaleString()} - ₦{maxPrice.toLocaleString()}</span>
              <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
            </div>
          </div>
        </motion.div>
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
      </motion.div>

      {/* Date Section */}
      <motion.div variants={itemVariants} className="flex-1 relative group border-t md:border-t-0 md:border-l border-gray-100" ref={calendarRef}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="p-4 md:p-5 rounded-2xl md:rounded-full hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-3"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <div className="bg-purple-50 p-2.5 rounded-full text-purple-600 md:hidden">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-grow overflow-hidden">
            <div className="flex items-center space-x-1">
              <Calendar className="hidden md:block w-4 h-4 text-gray-400" />
              <label className="block text-xs md:text-sm font-bold text-gray-800 uppercase tracking-tight">
                Date
              </label>
            </div>
            <div className="text-gray-600 text-sm mt-0.5 truncate flex items-center">
              <span>
                {dateRange?.from ? (
                  dateRange.to ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}` : format(dateRange.from, 'MMM d')
                ) : 'Select dates'}
              </span>
              <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
            </div>
          </div>
        </motion.div>
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
      </motion.div>

      {/* Capacity Section */}
      <motion.div variants={itemVariants} className="flex-1 relative group border-t md:border-t-0 md:border-l border-gray-100" ref={capacityRef}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="p-4 md:p-5 rounded-2xl md:rounded-full hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-3"
          onClick={() => setShowCapacity(!showCapacity)}
        >
          <div className="bg-orange-50 p-2.5 rounded-full text-orange-600 md:hidden">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-grow overflow-hidden">
            <div className="flex items-center space-x-1">
              <Users className="hidden md:block w-4 h-4 text-gray-400" />
              <label className="block text-xs md:text-sm font-bold text-gray-800 uppercase tracking-tight">
                Capacity
              </label>
            </div>
            <div className="text-gray-600 text-sm mt-0.5 truncate flex items-center">
              <span>{capacity || 'Number of Guests'}</span>
              <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
            </div>
          </div>
        </motion.div>
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
      </motion.div>

      {/* Search Button */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-primary hover:bg-blue-700 text-white rounded-2xl md:rounded-full p-4 md:p-6 mt-4 md:mt-0 md:ml-2 flex items-center justify-center space-x-3 md:space-x-0 shadow-lg shadow-primary/20 transition-all"
      >
        <span className="md:hidden font-bold text-lg">Search Halls</span>
        <Search className="w-6 h-6" />
      </motion.button>
    </motion.form>
  );
};

export default SearchBar;
