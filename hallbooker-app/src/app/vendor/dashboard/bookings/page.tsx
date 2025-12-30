"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import api from "@/services/api";
import BookingModal from "@/components/vendor/BookingModal";
import Swal from 'sweetalert2';

interface Booking {
  _id: string;
  bookingId: string;
  user: {
    fullName: string;
  };
  startTime: string;
  endTime: string;
  status: string;
}

interface Hall {
  _id: string;
  name: string;
}

const BookingsPage = () => {
  const searchParams = useSearchParams();
  const hallIdFromQuery = searchParams.get('hallId');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<string>(hallIdFromQuery || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    fetchHalls();
  }, []);

  useEffect(() => {
    if (selectedHall) {
      fetchBookings(selectedHall);
    }
  }, [selectedHall]);

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
      }
      const response = await api.post(endpoint, formData);

      if (formData.paymentMethod === 'online' && type === 'recurring') {
        const recurringBookingId = response.data.data.recurringBookingId;
        await api.post(`/payments/initialize/recurring/${recurringBookingId}`);
      }

      Swal.fire({
        icon: 'success',
        title: 'Booking Created!',
        text: 'The booking has been successfully created.',
      });
      if (selectedHall) {
        fetchBookings(selectedHall);
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
      {error && <p className="text-red-600">{error}</p>}
      <div className="bg-white p-4 shadow-lg rounded-lg">
        {loading ? (
          <div>Loading bookings...</div>
        ) : (
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
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                    {booking.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                    {booking.user.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">
                    {new Date(booking.startTime).toLocaleDateString()}
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
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {selectedHall ? 'No bookings found for this hall.' : 'Please select a hall to view bookings.'}
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
    </div>
  );
};

const BookingsPageWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <BookingsPage />
  </Suspense>
);

export default BookingsPageWithSuspense;
