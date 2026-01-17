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
import Carousel from '@/components/Carousel';
import MediaViewerModal from '@/components/MediaViewerModal';
import { useBookingAvailability } from '@/hooks/useBookingAvailability';
import { Hall } from '@/types';
import FacilityIcon from '@/components/FacilityIcon';
import { CheckCircle, CircleDollarSign, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

const HallDetailPage = () => {
  const [hall, setHall] = useState<Hall | null>(null);
  const [recommendations, setRecommendations] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendationsUnavailable, setRecommendationsUnavailable] = useState(false);
  const { isBookingModalOpen, openBookingModal, closeBookingModal } = useUI();
  const [bookingMode, setBookingMode] = useState('book');
  const [initialSelectedDates, setInitialSelectedDates] = useState<Date[] | undefined>(undefined);
  const [initialStep, setInitialStep] = useState(1);
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());
  const [isDemoModalOpen, setDemoModalOpen] = useState(false);
  const [ownerContact, setOwnerContact] = useState({ phone: '', whatsappNumber: '' });
  const [isMediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const params = useParams();
  const { id } = params;

  const { getDateAvailability } = useBookingAvailability(hall, undefined, displayedMonth);

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
    const fetchHallAndRecommendations = async () => {
      if (!id) return;

      setLoading(true);
      setError('');
      setRecommendations([]);

      try {
        const hallResponse = await api.get<{ data: Hall }>(`/halls/${id}`);
        const currentHall = hallResponse.data.data;
        setHall(currentHall);

        // Fetch recommendations only if geoLocation data is available
        if (currentHall.geoLocation?.coordinates && currentHall.geoLocation.coordinates.length === 2) {
          const longitude = currentHall.geoLocation.coordinates[0];
          const latitude = currentHall.geoLocation.coordinates[1];
          api.get<{ data: Hall[] }>(
            `/halls/recommendations`,
            {
              params: { latitude, longitude },
            }
          ).then(recommendationsResponse => {
            setRecommendations(recommendationsResponse.data.data || []);
          }).catch(recErr => {
            if (recErr.response?.status === 500) {
              setRecommendationsUnavailable(true);
            }
            console.error('Failed to fetch recommendations:', recErr);
            setRecommendations([]);
          });
        }
      } catch (err) {
        console.error(`Failed to fetch hall with id ${id}:`, err);
        setError(`Failed to fetch hall with id ${id}. See console for details.`);
      } finally {
        setLoading(false);
      }
    };

    fetchHallAndRecommendations();
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
              <span className="mx-2">·</span>
              <span className="flex items-center inline-flex">
                <Eye className="h-4 w-4 mr-1" />
                {hall.views || 0} views
              </span>
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
              <div className="flex flex-col md:flex-row justify-center items-start gap-8">
                <Calendar
                  unavailableDates={[]}
                  selectedDates={undefined}
                  onChange={() => {}}
                  onMonthChange={setDisplayedMonth}
                  displayedMonth={displayedMonth}
                  getDateAvailability={getDateAvailability}
                  onDateClick={(date) => {
                    const availability = getDateAvailability(date);
                    if (availability === 'fully booked') {
                      Swal.fire({
                        icon: 'error',
                        title: 'Not Available',
                        text: 'This date is not available for booking.',
                      });
                      return;
                    }

                    Swal.fire({
                      title: 'Choose an option',
                      text: `What would you like to do for ${date.toLocaleDateString()}?`,
                      icon: 'question',
                      showCancelButton: true,
                      confirmButtonText: 'Book Now',
                      cancelButtonText: 'Reserve Hall',
                      confirmButtonColor: '#295FA7',
                      cancelButtonColor: '#B68945',
                    }).then((result) => {
                      if (result.isConfirmed) {
                        setBookingMode('book');
                        setInitialSelectedDates([date]);
                        setInitialStep(2);
                        openBookingModal();
                      } else if (result.dismiss === Swal.DismissReason.cancel) {
                        setBookingMode('reserve');
                        setInitialSelectedDates([date]);
                        setInitialStep(2);
                        openBookingModal();
                      }
                    });
                  }}
                />
                <div className="mt-4 p-4 border rounded-lg bg-gray-50 w-full md:w-64">
                  <h3 className="font-semibold text-lg mb-3">Legend</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="w-5 h-5 rounded-full bg-red-300 mr-2"></span>
                      <span className="text-sm">Completely Booked</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-5 h-5 rounded-full bg-orange-300 mr-2"></span>
                      <span className="text-sm">Partially Booked</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-5 h-5 rounded-full bg-green-300 mr-2"></span>
                      <span className="text-sm">Completely Available</span>
                    </li>
                  </ul>
                </div>
              </div>
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
             {/* Recommendation Section */}
            <div className="py-6">
              <h3 className="font-semibold text-xl text-gray-800 mb-4">You might also like</h3>
              {recommendationsUnavailable ? (
                <p className="text-gray-500">Recommendations are temporarily unavailable</p>
              ) : recommendations.length > 0 ? (
                <Carousel halls={recommendations} slidesToShow={3} />
              ) : (
                <p className="text-gray-500">No recommendation found</p>
              )}
            </div>
          </div>

          {/* Sticky booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 border rounded-xl shadow-lg p-6">
              <div className="mb-4">
                {hall.pricing?.dailyRate && hall.pricing?.hourlyRate ? (
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">
                        ₦{hall.pricing.dailyRate.toLocaleString()}
                      </p>
                      <span className="text-sm text-gray-600">/ day</span>
                    </div>
                    <div className="h-10 border-l border-gray-300"></div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">
                        ₦{hall.pricing.hourlyRate.toLocaleString()}
                      </p>
                      <span className="text-sm text-gray-600">/ hour</span>
                    </div>
                  </div>
                ) : hall.pricing?.dailyRate ? (
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{hall.pricing.dailyRate.toLocaleString()}
                    </p>
                    <span className="ml-1 text-gray-600">/ day</span>
                  </div>
                ) : hall.pricing?.hourlyRate ? (
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{hall.pricing.hourlyRate.toLocaleString()}
                    </p>
                    <span className="ml-1 text-gray-600">/ hour</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-500">Price not available</p>
                )}
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setBookingMode('reserve');
                    setInitialSelectedDates(undefined);
                    setInitialStep(1);
                    openBookingModal();
                  }}
                  className="w-full bg-transparent border border-[#B68945] text-[#B68945] cursor-pointer font-bold py-3 px-4 rounded-lg transition duration-300 hover:bg-[#B68945] hover:text-white"
                >
                  Reserve hall
                </button>
                <button
                  onClick={() => {
                    setBookingMode('book');
                    setInitialSelectedDates(undefined);
                    setInitialStep(1);
                    openBookingModal();
                  }}
                  className="w-full bg-[#295FA7] hover:bg-[#204a8a] cursor-pointer text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                >
                  Book Now
                </button>
              </div>
              <div className="mt-2">
                <button
                  onClick={handleBookDemo}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-[#B68945] hover:text-white cursor-pointer transition duration-300"
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
            bookingMode={bookingMode}
            initialSelectedDates={initialSelectedDates}
            initialStep={initialStep}
          />
          <DemoModal
            isOpen={isDemoModalOpen}
            onClose={() => setDemoModalOpen(false)}
            phone={ownerContact.phone}
            whatsappNumber={ownerContact.whatsappNumber}
            address={hall.geoLocation?.address}
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
