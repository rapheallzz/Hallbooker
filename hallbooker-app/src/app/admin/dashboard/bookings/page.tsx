
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import AdminBookingDetailsModal from '@/components/admin/AdminBookingDetailsModal';
import AdminBookingModal from '@/components/admin/AdminBookingModal';
import ConversionModal from '@/components/shared/ConversionModal';
import { Search } from 'lucide-react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import Swal from 'sweetalert2';

interface Booking {
  _id: string;
  hall: string | { _id: string; name: string };
  user: string | { fullName: string };
  bookingDates: {
    startTime: string;
    endTime: string;
  }[];
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  eventDetails?: string;
  createdAt: string;
  bookingId: string;
  paymentMethod?: string;
  paymentStatus?: string;
  bookingType?: string;
  isRecurring?: boolean;
  recurringBookingId?: string;
  walkInUserDetails?: {
    email: string;
    phone: string;
  };
}

interface Hall {
  _id: string;
  name: string;
}

const BOOKINGS_PER_PAGE = 10;

interface Reservation {
  _id: string;
  reservationId: string;
  user?: {
    fullName: string;
  };
  walkInUserDetails?: {
    fullName: string;
  };
  bookingDates: {
    startTime: string;
    endTime: string;
  }[];
  status: string;
  paymentStatus?: string;
}

const BookingsPage = () => {
  const searchParams = useSearchParams();
  const hallIdFromQuery = searchParams.get('hallId');
  const initialSearch = searchParams.get('search') || '';
  const [activeTab, setActiveTab] = useState('bookings');
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedHall, setSelectedHall] = useState(hallIdFromQuery || '');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        let bookingsRes;
        if (selectedHall) {
          bookingsRes = await api.get(`/halls/${selectedHall}/bookings`);
          const normalizedBookings = bookingsRes.data.data.bookings.map((booking: Booking) => ({
            ...booking,
            hall: booking.hall,
          }));
          setAllBookings(normalizedBookings || []);
        } else {
          bookingsRes = await api.get('/admin/bookings?limit=10000');
          setAllBookings(bookingsRes.data.data.bookings || []);
        }
      } else {
        if (selectedHall) {
          const reservationsRes = await api.get(`/reservations/halls/${selectedHall}`);
          setReservations(reservationsRes.data.data.reservations || []);
        } else {
          // You might want a new endpoint for all reservations, for now, we clear it
          setReservations([]);
        }
      }

      if (!halls.length) {
        const hallsRes = await api.get('/halls');
        if (hallsRes.data && Array.isArray(hallsRes.data.data)) {
          setHalls(hallsRes.data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedHall, activeTab]);

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return allBookings;
    return allBookings.filter(
      (booking) =>
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.recurringBookingId && booking.recurringBookingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.eventDetails || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof booking.user === "object" && booking.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allBookings, searchTerm]);

  const groupedBookings = useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    const result: (Booking & { isGroup?: boolean; groupBookings?: Booking[] })[] = [];

    filteredBookings.forEach(booking => {
      if (booking.isRecurring && booking.recurringBookingId) {
        if (!groups[booking.recurringBookingId]) {
          groups[booking.recurringBookingId] = [];
        }
        groups[booking.recurringBookingId].push(booking);
      } else {
        result.push({ ...booking, isGroup: false });
      }
    });

    Object.entries(groups).forEach(([recurringId, groupBookings]) => {
      groupBookings.sort((a, b) => new Date(a.bookingDates[0].startTime).getTime() - new Date(b.bookingDates[0].startTime).getTime());

      const first = groupBookings[0];
      const last = groupBookings[groupBookings.length - 1];
      const totalSum = groupBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      result.push({
        ...first,
        isGroup: true,
        bookingId: recurringId,
        totalPrice: totalSum,
        bookingDates: [
          {
            startTime: first.bookingDates[0].startTime,
            endTime: last.bookingDates[0].endTime
          }
        ],
        groupBookings: groupBookings
      });
    });

    // Keep consistent sorting if any
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [filteredBookings]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKINGS_PER_PAGE;
    return groupedBookings.slice(startIndex, startIndex + BOOKINGS_PER_PAGE);
  }, [groupedBookings, currentPage]);

  const totalPages = Math.ceil(groupedBookings.length / BOOKINGS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = (refresh = false) => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    if (refresh) {
      fetchAllData();
    }
  };

  const getHallName = (hallId: string | { _id: string }) => {
    const id = typeof hallId === 'string' ? hallId : hallId._id;
    return halls.find(h => h._id === id)?.name || 'N/A';
  };

  const handleCreateBooking = async (formData: unknown, type: string) => {
    const data = formData as { paymentMethod?: string };
    Swal.fire({
      title: 'Creating Booking...',
      text: 'Please wait while we create the booking.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      let endpoint = '';
      if (type === 'recurring') {
        endpoint = '/bookings/recurring';
      } else if (type === 'walk-in') {
        endpoint = '/bookings/walk-in';
      } else if (type === 'reservation') {
        endpoint = '/reservations/walk-in';
      }
      const response = await api.post(endpoint, formData);

      if (data.paymentMethod === 'online' && type === 'recurring') {
        const recurringBookingId = response.data.data.recurringBookingId;
        await api.post(`/payments/initialize/recurring/${recurringBookingId}`);
      }

      Swal.fire({
        icon: 'success',
        title: type === 'reservation' ? 'Reservation Created!' : 'Booking Created!',
        text: `The ${type} has been successfully created.`,
      });
      if (type === 'reservation') {
        setActiveTab('reservations');
      }
      fetchAllData();
      setIsCreateModalOpen(false);
    } catch (error: unknown) {
      console.error('Failed to create booking:', error);
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: err.response?.data?.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Create Booking
        </button>
      </div>

      <div className="bg-white p-6 shadow-lg rounded-lg">
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'bookings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'reservations' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('reservations')}
          >
            Reservations
          </button>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : activeTab === 'bookings' ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full md:w-1/3">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by event details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full text-gray-900"
                />
              </div>
              <div className="w-full md:w-1/4">
                <select
                  value={selectedHall}
                  onChange={(e) => setSelectedHall(e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="">All Halls</option>
                  {halls.map((hall) => (
                    <option key={hall._id} value={hall._id}>{hall.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto shadow-sm border rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking ID</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hall</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event Details</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking Duration</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Price</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking) => (
                      <React.Fragment key={booking._id}>
                        <tr onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)} className="cursor-pointer hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900 font-mono text-xs">
                            <div className="flex flex-col gap-1">
                              <span>{booking.bookingId}</span>
                              {booking.isRecurring && (
                                <span className="px-2 w-fit inline-flex text-[10px] leading-4 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Recurring
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{getHallName(booking.hall)}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{booking.eventDetails || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {booking.isGroup ? (
                              <>
                                <div><span className="font-semibold text-xs text-gray-500 uppercase">Start:</span> {new Date(booking.bookingDates[0].startTime).toLocaleDateString()}</div>
                                <div><span className="font-semibold text-xs text-gray-500 uppercase">End:</span> {new Date(booking.bookingDates[0].endTime).toLocaleDateString()}</div>
                                <div className="text-[10px] text-blue-600 font-medium mt-1">({booking.groupBookings?.length} bookings)</div>
                              </>
                            ) : (
                              <>
                                <div><span className="font-semibold">From:</span> {new Date(booking.bookingDates[0].startTime).toLocaleString()}</div>
                                <div><span className="font-semibold">To:</span> {new Date(booking.bookingDates[0].endTime).toLocaleString()}</div>
                              </>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>{booking.status}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">₦{booking.totalPrice.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm">
                            <button onClick={() => handleViewDetails(booking)} className="text-indigo-600 hover:text-indigo-900 font-medium">View</button>
                          </td>
                        </tr>
                        {expandedBookingId === booking._id && (
                          <tr>
                            <td colSpan={7} className="p-4 bg-gray-100 shadow-inner">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-bold text-gray-700 mb-2">Detailed Info</h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div><span className="font-semibold">Payment Method:</span> {booking.paymentMethod}</div>
                                    <div><span className="font-semibold">Payment Status:</span> {booking.paymentStatus}</div>
                                    <div><span className="font-semibold">Booking Type:</span> {booking.bookingType}</div>
                                    {booking.walkInUserDetails && (
                                      <>
                                        <div><span className="font-semibold">Customer Email:</span> {booking.walkInUserDetails.email}</div>
                                        <div><span className="font-semibold">Customer Phone:</span> {booking.walkInUserDetails.phone}</div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {booking.isGroup && (
                                  <div>
                                    <h4 className="font-bold text-gray-700 mb-2">Recurring Schedule</h4>
                                    <div className="max-h-40 overflow-y-auto border rounded bg-white p-2">
                                      <table className="min-w-full text-xs">
                                        <thead>
                                          <tr className="border-b">
                                            <th className="text-left pb-1">Booking ID</th>
                                            <th className="text-left pb-1">Date & Time</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {booking.groupBookings?.map((gb) => (
                                            <tr key={gb._id} className="border-b last:border-0">
                                              <td className="py-1 font-mono">{gb.bookingId}</td>
                                              <td className="py-1">
                                                {new Date(gb.bookingDates[0].startTime).toLocaleString()}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-gray-800">No bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50">
                Previous
              </button>
              <span className="text-sm text-gray-800">Page {currentPage} of {totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50">
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto shadow-sm border rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Status</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td className="py-3 px-4 text-sm text-gray-900">{reservation.user?.fullName || reservation.walkInUserDetails?.fullName}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div><span className="font-semibold">From:</span> {new Date(reservation.bookingDates[0].startTime).toLocaleString()}</div>
                        <div><span className="font-semibold">To:</span> {new Date(reservation.bookingDates[0].endTime).toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{reservation.status}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{reservation.paymentStatus}</td>
                      <td className="py-3 px-4 text-sm">
                        {reservation.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              setSelectedReservationId(reservation.reservationId);
                              setIsConversionModalOpen(true);
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            Convert to Booking
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-800">No reservations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedBooking && (
        <AdminBookingDetailsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            booking={selectedBooking}
            halls={halls}
        />
      )}
      <AdminBookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBooking}
      />
      {selectedReservationId && (
        <ConversionModal
          isOpen={isConversionModalOpen}
          onClose={() => setIsConversionModalOpen(false)}
          reservationId={selectedReservationId}
          onSuccess={fetchAllData}
        />
      )}
    </div>
  );
};

const BookingsPageWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <BookingsPage />
  </Suspense>
);

export default BookingsPageWithSuspense;
