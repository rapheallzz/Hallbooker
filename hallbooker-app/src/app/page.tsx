'use client';

import { useEffect, useState } from 'react';
import HallCard from '@/components/HallCard';
import SkeletonCard from '@/components/SkeletonCard';
import SearchComponent from '@/components/SearchComponent';
import api from '@/services/api';

interface Hall {
  id: string;
  name: string;
  description: string;
  media: { url: string }[];
  price: number;
  location: string;
  capacity: number;
  date: string;
}

const HomePage = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [filteredHalls, setFilteredHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await api.get('/halls');
        const hallsData = response.data.data;

        if (Array.isArray(hallsData)) {
          setHalls(hallsData);
          setFilteredHalls(hallsData);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Failed to fetch halls:', err);
        setError('Failed to fetch halls. See console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const handleSearch = (location: string, date: string, capacity: string) => {
    let filtered = halls;

    if (location) {
      filtered = filtered.filter((hall) =>
        hall.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (date) {
      filtered = filtered.filter((hall) => hall.date === date);
    }

    if (capacity) {
      const [min, max] = capacity.split('-').map(Number);
      if (max) {
        filtered = filtered.filter(
          (hall) => hall.capacity >= min && hall.capacity <= max
        );
      } else {
        filtered = filtered.filter((hall) => hall.capacity >= min);
      }
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
          <div className="mt-8 max-w-4xl mx-auto">
            <SearchComponent onSearch={handleSearch} />
          </div>
        </div>

        {loading && (
          <div>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Popular Halls
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </section>
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recommended for You
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
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
                Popular Halls
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredHalls.slice(0, 3).map((hall) => (
                  <HallCard key={hall.id} hall={hall} />
                ))}
              </div>
            </section>
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recommended for You
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredHalls.slice(3, 6).map((hall) => (
                  <HallCard key={hall.id} hall={hall} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
