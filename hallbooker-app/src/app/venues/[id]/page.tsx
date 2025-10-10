'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

const VenueDetailPage = () => {
  const { id } = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        const [venueRes, reviewsRes] = await Promise.all([
          api.get(`/venues/${id}`),
          api.get(`/reviews/venue/${id}`),
        ]);
        setVenue(venueRes.data.data);
        setReviews(reviewsRes.data.data);
      } catch (err) {
        setError('Failed to fetch venue details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;
  }

  if (!venue) {
    return <div className="flex items-center justify-center min-h-screen">Venue not found.</div>;
  }

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
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6">
              <h1 className="text-4xl font-extrabold text-gray-900">{venue.name}</h1>
              <p className="mt-2 text-lg text-gray-500">{venue.location}</p>
              <p className="mt-4 text-gray-700">{venue.description}</p>
              <p className="mt-6 text-3xl font-bold text-indigo-600">${venue.price} / day</p>
              <button className="mt-8 w-full px-6 py-3 text-lg font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">
                Book Now
              </button>
            </div>
            <div className="p-4">
                {venue.media.length > 0 ? (
                    <img
                    className="w-full h-full object-cover rounded-md"
                    src={venue.media[0].url}
                    alt={venue.name}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                        <p className="text-gray-500">No Image Available</p>
                    </div>
                )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="mt-6 space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <p className="font-semibold">{review.user.firstName} {review.user.lastName}</p>
                    <div className="ml-4 flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.96c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.176 0l-3.368 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.96a1 1 0 00-.364-1.118L2.05 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-gray-500">No reviews yet.</p>
          )}
        </div>
      </main>

      <footer className="bg-white mt-16">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} HallBooker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default VenueDetailPage;