'use client';

import { useEffect, useState } from 'react';
import HallCard from '@/components/HallCard';
import SkeletonCard from '@/components/SkeletonCard';
import SearchBar from '@/components/SearchBar';
import api from '@/services/api';

interface Hall {
  id: string;
  name: string;
  description: string;
  media: { url: string }[];
  price: number;
  location: string;
  capacity: number; // Added for filtering
}

const HomePage = () => {
  const [allHalls, setAllHalls] = useState<Hall[]>([]);
  const [filteredHalls, setFilteredHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        // Using a local halls.json for mock data as per memory
        const response = await fetch('/halls.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        let hallsData = await response.json();

        // Augment with mock capacity for filtering
        hallsData = hallsData.map((hall: Hall, index: number) => ({
          ...hall,
          capacity: 50 + (index * 50), // Mock capacity: 50, 100, 150, etc.
        }));

        if (Array.isArray(hallsData)) {
          setAllHalls(hallsData);
          setFilteredHalls(hallsData);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Failed to fetch halls:', err);
        setError('Failed to fetch halls. Using mock data failed.');
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const handleSearch = (filters: { location: string; dateRange: any; capacity: string }) => {
    const { location, capacity } = filters;
    setSearchPerformed(true);

    let filtered = allHalls;

    // Location filtering
    if (location) {
        filtered = filtered.filter((hall) =>
            hall.location.toLowerCase().includes(location.toLowerCase().split(',')[0])
        );
    }

    // Capacity filtering
    if (capacity && capacity !== 'Any') {
        const [min, max] = capacity.split('-').map(c => c.replace('+', ''));
        filtered = filtered.filter(hall => {
            if (max) {
                return hall.capacity >= parseInt(min) && hall.capacity <= parseInt(max);
            }
            return hall.capacity >= parseInt(min); // For '500+' case
        });
    }

    setFilteredHalls(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Find the perfect hall for your next event
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Browse through our curated list of halls and book with ease.
          </p>
          <div className="mt-8">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {loading && (
          <div>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Popular Halls
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </section>
          </div>
        )}

        {error && <p className="mt-8 text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <div>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {searchPerformed ? 'Search Results' : 'Popular Halls'}
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredHalls.length > 0 ? (
                    filteredHalls.map((hall) => (
                        <HallCard key={hall.id} hall={hall} />
                    ))
                ) : (
                    <p className="text-gray-600">No halls found matching your criteria.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
