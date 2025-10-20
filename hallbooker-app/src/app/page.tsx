'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface Venue {
  id: string;
  name: string;
  description: string;
  media: { url: string }[];
  price: number;
  location: string;
}

const HomePage = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await api.get('/api/venues');
        const venuesData = response.data.data || response.data;

        if (Array.isArray(venuesData)) {
          setVenues(venuesData);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Failed to fetch venues:', err);
        setError('Failed to fetch venues. See console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                HallBooker
              </Link>
            </div>
            <div className="flex items-center">
              {user ? (
                <>
                  <span className="mr-4 text-gray-700">Welcome, {user.firstName}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Find the perfect hall for your next event
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Browse through our curated list of venues and book with ease.
        </p>

        {loading && <p className="mt-8 text-center">Loading venues...</p>}
        {error && <p className="mt-8 text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <Link href={`/venues/${venue.id}`} key={venue.id}>
                <div className="block bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <img
                    className="h-56 w-full object-cover"
                    src={venue.media[0]?.url || 'https://via.placeholder.com/400x250'}
                    alt={venue.name}
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">{venue.name}</h3>
                    <p className="mt-2 text-gray-600 truncate">{venue.description}</p>
                    <p className="mt-4 text-lg font-bold text-indigo-600">
                      ${venue.price} / day
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{venue.location}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white mt-16">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} HallBooker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;