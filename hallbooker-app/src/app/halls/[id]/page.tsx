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
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {hall.images.length > 0 ? (
            <img src={hall.images[0]} alt={hall.name} className="w-full h-auto rounded-lg shadow-lg" />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {hall.images.slice(1, 4).map((image, index) => (
              <img key={index} src={image} alt={`${hall.name} ${index + 1}`} className="w-full h-auto rounded-lg shadow-md" />
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{hall.name}</h1>
          <p className="mt-2 text-lg text-gray-600">{hall.location}</p>
          <div className="mt-4 flex items-center">
            <p className="text-lg text-gray-800">
              <span className="font-semibold">Capacity:</span> {hall.capacity}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-lg text-gray-800">
              <span className="font-semibold">Price:</span> ${hall.price} / day
            </p>
          </div>
          <p className="mt-6 text-gray-700">{hall.description}</p>
        </div>
      </div>
    </div>
  );
};

export default HallDetailPage;
