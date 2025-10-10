'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';

interface Venue {
  id: string;
  name: string;
  location: string;
  isPublished: boolean;
  price: number;
}

const MyVenuesPage = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyVenues = async () => {
      try {
        const response = await api.get('/venues/by-owner');
        setVenues(response.data.data);
      } catch (err) {
        setError('Failed to fetch your venues.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyVenues();
  }, []);

  if (loading) {
    return <p>Loading your venues...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Venues</h1>
        <Link
          href="/vendor/venues/new"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
        >
          Add New Venue
        </Link>
      </div>

      {venues.length === 0 ? (
        <p>You have not created any venues yet.</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venues.map((venue) => (
                <tr key={venue.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{venue.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venue.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${venue.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        venue.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {venue.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/vendor/venues/edit/${venue.id}`} className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyVenuesPage;