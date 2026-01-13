"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
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
}

interface Reservation {
  _id: string;
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

const BookingsPage = () => {
  const searchParams = useSearchParams();
  const hallIdFromQuery = searchParams.get('hallId');
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

  const fetchBookings = async (hallId: string) => {
    if (!hallId) {
      setBookings([]);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/halls/${hallId}/bookings`);
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (hallId: string) => {
    if (!hallId) {
      setReservations([]);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/reservations/halls/${hallId}`);
      setReservations(response.data.data.reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setError('Failed to fetch reservations.');
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
        fetchBookings(selectedHall);
      } else {
        fetchReservations(selectedHall);
      }
    }
  }, [selectedHall, activeTab]);

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.put(`/bookings/${bookingId}`);
        if (selectedHall) {
          fetchBookings(selectedHall); // Refresh the list
        }
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        setError('Failed to cancel the booking.');
      }
    }
  };

  const handleCreateBooking = async (formData: any, type: string) => {
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

      if (formData.paymentMethod === 'online' && type === 'recurring') {
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
          fetchReservations(selectedHall);
        } else {
          fetchBookings(selectedHall);
        }
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error.response?.data?.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Bookings</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Create Booking
        </button>
      </div>
      <div className="mb-4">
        <label htmlFor="hall-select" className="block text-sm font-medium text-gray-700">Select a Hall</label>
        <select
          id="hall-select"
          value={selectedHall}
          onChange={(e) => setSelectedHall(e.target.value)}
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
      {error && <p className="text-red-600">{error}</p>}
      <div className="bg-white p-4 shadow-lg rounded-lg">
        {loading ? (
          <div>Loading...</div>
        ) : activeTab === 'bookings' ? (
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
              {bookings.length > 0 ? bookings.map((booking) => (
                <React.Fragment key={booking._id}>
                  <tr onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)} className="cursor-pointer">
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                      {booking.bookingId}
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
                        <div>Total Price: {booking.totalPrice}</div>
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
                    {selectedHall ? 'No bookings found for this hall.' : 'Please select a hall to view bookings.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
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
              {reservations.length > 0 ? reservations.map((reservation) => (
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
                          setSelectedReservationId(reservation._id);
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
                    {selectedHall ? 'No reservations found for this hall.' : 'Please select a hall to view reservations.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
          onSuccess={() => fetchReservations(selectedHall)}
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
