'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HallCard from '@/components/HallCard';
import api from '@/services/api';
import { Hall } from '@/types/hall';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

const AnimatedHallCard = ({ hall, index }: { hall: Hall; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref);
  const isInitiallyVisible = index < 6;

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible || isInitiallyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <HallCard hall={hall} />
    </div>
  );
};

const SearchContent = () => {
  const searchParams = useSearchParams();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [minCapacity, setMinCapacity] = useState(searchParams.get('minCapacity') || '');
  const [minPrice, setMinPrice] = useState<number>(Number(searchParams.get('minPrice')) || 0);
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get('maxPrice')) || 1000000);
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const fetchHalls = async () => {
    setLoading(true);

    try {
      const response = await api.get('/halls', {
        params: {
          keyword: keyword || undefined,
          minCapacity: minCapacity || undefined,
          minPrice,
          maxPrice,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      if (Array.isArray(response.data.data)) {
        setHalls(response.data.data);
      } else {
        setHalls([]);
      }
    } catch (error) {
      console.error('Error fetching halls:', error);
      setHalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHalls();
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <h1 className="text-3xl font-bold mb-8">Search for Halls</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          {/* Filter section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <form onSubmit={handleSearch}>
              <div className="mb-4">
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
                  Keyword / Location
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="e.g., Lagos"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="minCapacity" className="block text-sm font-medium text-gray-700">
                  Minimum Capacity
                </label>
                <input
                  type="number"
                  id="minCapacity"
                  value={minCapacity}
                  onChange={(e) => setMinCapacity(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="e.g., 100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (₦)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Min Price"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Max Price"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#295FA7] text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Search
              </button>
            </form>
          </div>
        </div>
        <div className="col-span-3">
          {/* Search results */}
          {loading ? (
            <p className="text-center py-10">Loading halls...</p>
          ) : (
            <>
              {halls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {halls.map((hall, index) => (
                    <AnimatedHallCard key={hall._id} hall={hall} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-xl text-gray-500">No halls found matching your criteria.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={<div className="pt-24 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
