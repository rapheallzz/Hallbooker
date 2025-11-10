'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import BookingModal from '@/components/BookingModal';
import { useUI } from '@/context/UIContext';

interface Hall {
  id: string;
  name: string;
  description: string;
  images: string[];
  videos: string[];
  pricing: {
    dailyRate?: number;
    hourlyRate?: number;
  };
  location: string;
  capacity: number;
  averageRating: number;
  numReviews: number;
  facilities: any[];
  owner: {
    _id: string;
    fullName: string;
  };
}

const HallDetailPage = () => {
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isBookingModalOpen, openBookingModal, closeBookingModal } = useUI();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const fetchHall = async () => {
        try {
          const response = await api.get(`/halls/${id}`);
          const hallData = response.data.data;
          setHall(response.data.data);
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{hall.name}</h1>
          <div className="flex items-center mt-2">
            <p className="text-sm text-gray-600">
              {hall.averageRating > 0 ? (
                <span className="font-semibold">{hall.averageRating.toFixed(1)} ★</span>
              ) : (
                <span className="font-semibold">New</span>
              )}
              {hall.numReviews > 0 && (
                <span className="ml-1">
                  ({hall.numReviews} review{hall.numReviews > 1 ? 's' : ''})
                </span>
              )}
              <span className="mx-2">·</span>
              <span>{hall.location}</span>
            </p>
          </div>
        </div>

        {/* Image gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-2 h-96 rounded-xl overflow-hidden">
          <div className="md:col-span-1 md:row-span-2 h-full">
            <img
              src={hall.images?.[0] || '/hall_default.jpg'}
              alt={hall.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-1 gap-2 h-full">
            <img
              src={hall.images?.[1] || '/hall_default.jpg'}
              alt=""
              className="w-full h-full object-cover"
            />
            <img
              src={hall.images?.[2] || '/hall_default.jpg'}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-1 gap-2 h-full">
            <img
              src={hall.images?.[3] || '/hall_default.jpg'}
              alt=""
              className="w-full h-full object-cover"
            />
             <div className="relative w-full h-full">
              <img
                src={hall.images?.[4] || '/hall_default.jpg'}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold">
                  Show all photos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 mt-8">
          <div className="lg:col-span-2">
            <div className="pb-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">
                Capacity
              </h2>
              <p className="text-gray-600 mt-1">
                {hall.capacity} guests
              </p>
            </div>

            <div className="py-6 border-b">
              <h3 className="font-semibold text-xl text-gray-800 mb-4">About this hall</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {hall.description}
              </p>
            </div>

            <div className="py-6">
              <h3 className="font-semibold text-xl text-gray-800 mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {hall.facilities?.length > 0 ? (
                  hall.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-gray-700">{facility.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No facilities listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sticky booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 border rounded-xl shadow-lg p-6">
              <div className="flex items-baseline mb-4">
                <p className="text-2xl font-bold text-gray-900">
                  ${hall.pricing?.dailyRate?.toLocaleString() || 'N/A'}
                </p>
                <span className="ml-1 text-gray-600">/ day</span>
              </div>
              <div className="mt-4">
                <button
                  onClick={openBookingModal}
                  className="w-full bg-[#295FA7] hover:bg-[#204a8a] text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                >
                  Booking
                </button>
              </div>
              <div className="mt-2">
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition duration-300">
                  Calendar
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
      {hall && (
        <BookingModal
          hallId={hall.id}
          isOpen={isBookingModalOpen}
          onClose={closeBookingModal}
        />
      )}
    </div>
  );
};

export default HallDetailPage;
