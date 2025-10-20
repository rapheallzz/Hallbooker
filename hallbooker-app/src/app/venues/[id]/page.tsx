'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';

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
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">{venue.name}</h1>
          <p className="mt-2 text-lg text-gray-500">{venue.location}</p>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venue.media.slice(0, 3).map((media, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow-lg">
              <img
                className="w-full h-full object-cover"
                src={media.url}
                alt={`${venue.name} image ${index + 1}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900">About this hall</h2>
            <p className="mt-4 text-gray-700">{venue.description}</p>
          </div>
          <div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-primary">
                ${venue.price} / day
              </h3>
              <div className="mt-4">
                <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700">
                  Select a date
                </label>
                <input
                  type="date"
                  id="booking-date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <button
                className="mt-6 w-full px-6 py-3 text-lg font-medium text-white rounded-md shadow-sm bg-secondary"
              >
                Book Now
              </button>
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
