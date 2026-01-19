"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import BookingModal from "@/components/vendor/BookingModal";
import ConversionModal from "@/components/shared/ConversionModal";
import Swal from 'sweetalert2';

interface Booking {
  _id: string;
  bookingId: string;
  user?: {
    fullName: string;
  };
  walkInUserDetails?: {
    fullName: string;
    email: string;
    phone: string;
  };
  bookingDates: {
    startTime: string;
    endTime: string;
  }[];
  status: string;
  eventDetails?: string;
  totalPrice?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  bookingType?: string;
  isRecurring?: boolean;
}

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

interface Hall {
  _id: string;
  name: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex justify-between items-center">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-gray-800">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

const BookingsPage = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const hallIdFromQuery = searchParams.get('hallId');
  const searchTerm = searchParams.get('search') || '';
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<string>(hallIdFromQuery || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [reservationsPage, setReservationsPage] = useState(1);
  const [reservationsTotalPages, setReservationsTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const LIMIT = 20;

  const fetchHalls = async () => {
    try {
      const response = await api.get("/halls/by-owner");
      if (response.data && Array.isArray(response.data.data)) {
        setHalls(response.data.data);
        // If hallId from query is present, ensure it's selected
        if (hallIdFromQuery && response.data.data.some((hall: Hall) => hall._id === hallIdFromQuery)) {
          setSelectedHall(hallIdFromQuery);
        }
      }
    } catch (error) {
      console.error("Error fetching halls:", error);
      setError('Failed to fetch halls.');
    }
  };

  const fetchBookings = async (hallId: string, page: number = 1) => {
    if (!hallId) {
      setBookings([]);
      return;
    }
    try {
      setLoading(true);
      setError('');
      let url = `/halls/${hallId}/bookings?page=${page}&limit=${LIMIT}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      if (sortOrder) url += `&sortOrder=${sortOrder}`;

      const response = await api.get(url);
      const data = response.data.data;
      setBookings(data.bookings || []);
      setBookingsTotalPages(data.pagination?.totalPages || data.totalPages || 1);
    } catch (error: unknown) {
      console.error("Error fetching bookings:", error);
      const err = error as { response?: { status: number } };
      if (err.response?.status === 404) {
        setBookings([]);
        setBookingsTotalPages(1);
      } else {
        setError('Failed to fetch bookings.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (hallId: string, page: number = 1) => {
    if (!hallId) {
      setReservations([]);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/reservations/halls/${hallId}?page=${page}&limit=${LIMIT}`);
      const data = response.data.data;
      setReservations(data.reservations || []);
      setReservationsTotalPages(data.pagination?.totalPages || data.totalPages || 1);
    } catch (error: unknown) {
      console.error("Error fetching reservations:", error);
      const err = error as { response?: { status: number } };
      if (err.response?.status === 404) {
        setReservations([]);
        setReservationsTotalPages(1);
      } else {
        setError('Failed to fetch reservations.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  useEffect(() => {
    if (selectedHall) {
      if (activeTab === 'bookings') {
        fetchBookings(selectedHall, bookingsPage);
      } else {
        fetchReservations(selectedHall, reservationsPage);
      }
    }
  }, [selectedHall, activeTab, bookingsPage, reservationsPage, status, startDate, endDate, sortBy, sortOrder]);

  const handleHallChange = (hallId: string) => {
    setSelectedHall(hallId);
    setBookingsPage(1);
    setReservationsPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setBookingsPage(1);
    setReservationsPage(1);
  };

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.put(`/bookings/${bookingId}`);
        if (selectedHall) {
          fetchBookings(selectedHall, bookingsPage); // Refresh the list
        }
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        setError('Failed to cancel the booking.');
      }
    }
  };

  const filteredBookings = React.useMemo(() => {
    let result = bookings;
    if (searchTerm) {
      result = result.filter(
        (booking) =>
          booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.walkInUserDetails?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.eventDetails?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (bookingTypeFilter !== 'all') {
      result = result.filter(booking => {
        const isRecurring = !!booking.isRecurring;
        return bookingTypeFilter === 'recurring' ? isRecurring : !isRecurring;
      });
    }
    return result;
  }, [bookings, searchTerm, bookingTypeFilter]);

  const filteredReservations = React.useMemo(() => {
    if (!searchTerm) return reservations;
    return reservations.filter(
      (reservation) =>
        reservation.reservationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.walkInUserDetails?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reservations, searchTerm]);

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
      if (selectedHall) {
        if (type === 'reservation') {
          setActiveTab('reservations');
          // fetchReservations will be triggered by effect when activeTab changes
        } else {
          fetchBookings(selectedHall, 1);
          setBookingsPage(1);
        }
      }
      setIsModalOpen(false);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Bookings</h1>
        {user?.activeRole === "hall-owner" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Create Booking
          </button>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="hall-select" className="block text-sm font-medium text-gray-700">Select a Hall</label>
        <select
          id="hall-select"
          value={selectedHall}
          onChange={(e) => handleHallChange(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">--Please choose a hall--</option>
          {halls.map((hall) => (
            <option key={hall._id} value={hall._id}>
              {hall.name}
            </option>
          ))}
        </select>
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
            <select
              value={bookingTypeFilter}
              onChange={(e) => setBookingTypeFilter(e.target.value)}
              className="w-full border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="normal">Normal</option>
              <option value="recurring">Recurring</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1">* Filters current page</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            >
              <option value="createdAt">Date Created</option>
              <option value="totalPrice">Price</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'bookings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => handleTabChange('bookings')}
        >
          Bookings
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'reservations' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => handleTabChange('reservations')}
        >
          Reservations
        </button>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="bg-white p-4 shadow-lg rounded-lg">
        {loading ? (
          <div>Loading...</div>
        ) : activeTab === 'bookings' ? (
          <>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                <React.Fragment key={booking._id}>
                  <tr onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)} className="cursor-pointer">
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{booking.bookingId}</span>
                        {booking.isRecurring && (
                          <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Recurring
                          </span>
                        )}
                        {booking.bookingType?.toLowerCase() === 'online' && (
                          <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                            Online
                          </span>
                        )}
                        {booking.bookingType?.toLowerCase() === 'walk-in' && (
                          <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Walk-in
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                      {booking.user?.fullName || booking.walkInUserDetails?.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                      <div><span className="font-semibold">From:</span> {new Date(booking.bookingDates[0].startTime).toLocaleString()}</div>
                      <div><span className="font-semibold">To:</span> {new Date(booking.bookingDates[0].endTime).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-500 text-gray-900">
                      {booking.status.toLowerCase() !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="px-5 py-2 border-red-500 border text-red-500 rounded transition duration-300 hover:bg-red-500 hover:text-white focus:outline-none"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedBookingId === booking._id && (
                    <tr>
                      <td colSpan={5} className="p-4 bg-gray-100">
                        <div>Event Details: {booking.eventDetails}</div>
                        <div>Total Price: ₦{booking.totalPrice?.toLocaleString()}</div>
                        <div>Payment Method: {booking.paymentMethod}</div>
                        <div>Payment Status: {booking.paymentStatus}</div>
                        <div>Booking Type: {booking.bookingType}</div>
                        {booking.walkInUserDetails && (
                          <div>
                            <div>Customer Email: {booking.walkInUserDetails.email}</div>
                            <div>Customer Phone: {booking.walkInUserDetails.phone}</div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {selectedHall
                      ? (searchTerm ? `No bookings found matching "${searchTerm}"` : 'No bookings found for this hall.')
                      : 'Please select a hall to view bookings.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={bookingsPage}
            totalPages={bookingsTotalPages}
            onPageChange={setBookingsPage}
          />
          </>
        ) : (
          <>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length > 0 ? filteredReservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                    {reservation.user?.fullName || reservation.walkInUserDetails?.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                    <div><span className="font-semibold">From:</span> {new Date(reservation.bookingDates[0].startTime).toLocaleString()}</div>
                    <div><span className="font-semibold">To:</span> {new Date(reservation.bookingDates[0].endTime).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reservation.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                    {reservation.paymentStatus}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-500 text-gray-900">
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
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {selectedHall
                      ? (searchTerm ? `No reservations found matching "${searchTerm}"` : 'No reservations found for this hall.')
                      : 'Please select a hall to view reservations.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={reservationsPage}
            totalPages={reservationsTotalPages}
            onPageChange={setReservationsPage}
          />
          </>
        )}
      </div>
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBooking}
      />
      {selectedReservationId && (
        <ConversionModal
          isOpen={isConversionModalOpen}
          onClose={() => setIsConversionModalOpen(false)}
          reservationId={selectedReservationId}
          onSuccess={() => fetchReservations(selectedHall, reservationsPage)}
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
