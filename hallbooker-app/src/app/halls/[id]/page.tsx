'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';

interface Hall {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  location: string;
  capacity: number;
  averageRating: number;
  numReviews: number;
}

const HallDetailPage = () => {
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const fetchHall = async () => {
        try {
          const response = await api.get(`/halls/${id}`);
          const hallData = response.data.data;
          const formattedHall = {
            id: hallData.id,
            name: hallData.name,
            description: hallData.description,
            images: hallData.images || [],
            price: hallData.pricing?.dailyRate || 0,
            location: hallData.location,
            capacity: hallData.capacity,
            averageRating: hallData.averageRating || 0,
            numReviews: hallData.numReviews || 0,
          };
          setHall(formattedHall);
        } catch (err)
        {
          console.error(`Failed to fetch hall with id ${id}:`, err);
          setError(`Failed to fetch hall with id ${id}. See console for details.`);
        } finally
        {
          setLoading(false);
        }
      };

      fetchHall();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!hall) {
    return <div>Hall not found</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{hall.name}</h1>
          <p className="text-sm text-gray-600">{hall.location}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-2 h-96">
          <div className="md:col-span-1 md:row-span-2">
            {hall.images.length > 0 ? (
              <img src={hall.images[0]} alt={hall.name} className="w-full h-full object-cover rounded-l-xl" />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-l-xl flex items-center justify-center">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
          </div>
          {hall.images.slice(1, 3).map((image, index) => (
            <div key={index} className="md:col-span-1">
              <img src={image} alt={`${hall.name} ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
          {hall.images.length > 3 && (
             <div className="md:col-span-1 relative">
             <img src={hall.images[3]} alt={`${hall.name} 4`} className="w-full h-full object-cover rounded-r-xl" />
             <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
               <button className="bg-white text-black px-4 py-2 rounded-lg">Show all photos</button>
             </div>
           </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold">About this hall</h2>
            <p className="mt-2 text-gray-700">{hall.description}</p>
            <p className="mt-4 text-gray-800">
              <strong>Capacity:</strong> {hall.capacity}
            </p>
          </div>
          <div className="md:col-span-1">
            <div className="border rounded-xl p-4 shadow-lg sticky top-24">
              <p className="text-xl font-semibold">
                ${hall.price} <span className="font-normal text-base">/ day</span>
              </p>
              <div className="mt-4">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                  Booking
                </button>
              </div>
              <div className="mt-2">
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
                  Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallDetailPage;
