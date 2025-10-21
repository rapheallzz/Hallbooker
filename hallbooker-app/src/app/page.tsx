'use client';

import { useEffect, useState } from 'react';
import HallCard from '@/components/HallCard';
import SkeletonCard from '@/components/SkeletonCard';
import api from '@/services/api';

interface Hall {
  id: string;
  name: string;
  description: string;
  media: { url: string }[];
  price: number;
  location: string;
}

const HomePage = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await api.get('/halls');
        const hallsData = response.data.data;

        if (Array.isArray(hallsData)) {
          setHalls(hallsData);
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
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a hall..."
                className="w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              />
              <button
                className="absolute right-0 top-0 mt-3 mr-4"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
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
                {halls.slice(0, 3).map((hall) => (
                  <HallCard key={hall.id} hall={hall} />
                ))}
              </div>
            </section>
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recommended for You
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {halls.slice(3, 6).map((hall) => (
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
