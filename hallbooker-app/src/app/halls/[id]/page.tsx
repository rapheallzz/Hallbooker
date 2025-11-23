'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import BookingModal from '@/components/BookingModal';
import DemoModal from '@/components/DemoModal';
import { useUI } from '@/context/UIContext';
import ReviewCard from '@/components/ReviewCard';
import Calendar from '@/components/Calendar';
import HallDetailSkeleton from '@/components/HallDetailSkeleton';
import { Range } from 'react-date-range';
import MediaViewerModal from '@/components/MediaViewerModal';
import { Hall } from '@/types';
import FacilityIcon from '@/components/FacilityIcon';
import { CheckCircle, CircleDollarSign } from 'lucide-react';

const HallDetailPage = () => {
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isBookingModalOpen, openBookingModal, closeBookingModal } = useUI();
  const [isDemoModalOpen, setDemoModalOpen] = useState(false);
  const [ownerContact, setOwnerContact] = useState({ phone: '', whatsappNumber: '' });
  const [isMediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const params = useParams();
  const { id } = params;

  const handleBookDemo = async () => {
    try {
      const response = await api.post(`/halls/${id}/book-demo`);
      setOwnerContact(response.data.data);
      setDemoModalOpen(true);
    } catch (err) {
      console.error(`Failed to book demo for hall with id ${id}:`, err);
      setError('Failed to book demo. See console for details.');
    }
  };

  useEffect(() => {
    if (id) {
      const fetchHall = async () => {
        try {
          const response = await api.get<{ data: Hall }>(`/halls/${id}`);
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
    return <HallDetailSkeleton />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!hall) {
    return <div>Hall not found</div>;
  }

  const openMediaViewer = (index: number) => {
    setSelectedMediaIndex(index);
    setMediaViewerOpen(true);
  };

  const media = [...(hall.images || []), ...(hall.videos || [])];

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
          <div className="md:col-span-1 md:row-span-2 h-full cursor-pointer" onClick={() => openMediaViewer(0)}>
            <img
              src={media[0] || '/hall_default.jpg'}
              alt={hall.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-1 gap-2 h-full">
            <img
              src={media[1] || '/hall_default.jpg'}
              alt=""
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openMediaViewer(1)}
            />
            <img
              src={media[2] || '/hall_default.jpg'}
              alt=""
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openMediaViewer(2)}
            />
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-1 gap-2 h-full">
            <img
              src={media[3] || '/hall_default.jpg'}
              alt=""
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openMediaViewer(3)}
            />
            <div className="relative w-full h-full cursor-pointer" onClick={() => openMediaViewer(4)}>
              <img
                src={media[4] || '/hall_default.jpg'}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <button
                  onClick={() => openMediaViewer(0)}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold"
                >
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {hall.facilities?.length > 0 ? (
                  hall.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <FacilityIcon name={facility.facility?.name || facility.name} />
                      <div className="flex-grow">
                        <p className="text-gray-800 font-medium">{facility.facility?.name || facility.name}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          {facility.chargeMethod === 'free' ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                              <span>Free</span>
                            </>
                          ) : (
                            <>
                              <CircleDollarSign className="h-4 w-4 text-yellow-600 mr-1.5" />
                              <span>Paid</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No facilities listed.</p>
                )}
              </div>
            </div>

            {/* Availability Section */}
            <div className="py-6 border-b">
              <h3 className="font-semibold text-xl text-gray-800 mb-4">Availability</h3>
              <Calendar
                unavailableDates={hall.blockedDates?.map(date => new Date(date)) || []}
                onChange={(range: Range) => {
                  console.log(range);
                }}
              />
            </div>

            {/* Reviews Section */}
            <div className="py-6 border-b">
              <h3 className="font-semibold text-xl text-gray-800 mb-4">Reviews</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReviewCard
                  name="John Doe"
                  date="October 2023"
                  rating={5}
                  comment="This hall was amazing! It was clean, spacious, and perfect for our event."
                />
                <ReviewCard
                  name="Jane Smith"
                  date="September 2023"
                  rating={4}
                  comment="Great location and amenities. The host was very responsive and helpful."
                />
              </div>
            </div>
          </div>

          {/* Sticky booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 border rounded-xl shadow-lg p-6">
              <div className="flex items-baseline mb-4">
                <p className="text-2xl font-bold text-gray-900">
                  ₦{hall.pricing?.dailyRate?.toLocaleString() || 'N/A'}
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
                <button
                  onClick={handleBookDemo}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition duration-300"
                >
                  Book a Demo
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">You won&apos;t be charged yet</p>
            </div>
          </div>
        </div>
      </div>
      {hall && (
        <>
          <BookingModal
            hallId={hall.id}
            isOpen={isBookingModalOpen}
            onClose={closeBookingModal}
          />
          <DemoModal
            isOpen={isDemoModalOpen}
            onClose={() => setDemoModalOpen(false)}
            phone={ownerContact.phone}
            whatsappNumber={ownerContact.whatsappNumber}
          />
        </>
      )}
      <MediaViewerModal
        isOpen={isMediaViewerOpen}
        onClose={() => setMediaViewerOpen(false)}
        media={media}
        startIndex={selectedMediaIndex}
      />
    </div>
  );
};

export default HallDetailPage;
