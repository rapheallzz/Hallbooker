'use client';

import React, { useState, useEffect } from 'react';
import HallCard from '@/components/HallCard';
import api from '@/services/api';
import { Hall } from '@/types/hall';

const SearchPage = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [minCapacity, setMinCapacity] = useState('');

  const fetchHalls = async () => {
    setLoading(true);
    try {
      const response = await api.get('/halls', {
        params: {
          keyword: keyword || undefined,
          minCapacity: minCapacity || undefined,
        },
      });
      setHalls(response.data.data || []);
    } catch (error) {
      console.error('Error fetching halls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

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
                  Keyword
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="e.g., Grand Hall"
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
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Search
              </button>
            </form>
          </div>
        </div>
        <div className="col-span-3">
          {/* Search results */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {halls.map((hall) => (
                <HallCard key={hall._id} hall={hall} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;