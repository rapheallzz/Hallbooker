"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import BookingModal from "@/components/vendor/BookingModal";

interface Booking {
  id: string;
  bookingId: string;
  hallName: string;
  customerName: string;
  bookingDate: string;
  status: string;
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings/my-bookings");
      setBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.put(`/bookings/${bookingId}`);
        fetchBookings(); // Refresh the list
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        setError('Failed to cancel the booking.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) return <p className="text-red-600">{error}</p>;

  const handleCreateBooking = async (formData: any, type: string) => {
    try {
      let endpoint = '';
      if (type === 'standard') {
        endpoint = '/bookings';
      } else if (type === 'recurring') {
        endpoint = '/bookings/recurring';
      } else if (type === 'walk-in') {
        endpoint = '/bookings/walk-in';
      }
      await api.post(endpoint, formData);
      fetchBookings();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create booking:', error);
      setError('Failed to create the booking.');
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
      <div className="bg-white p-4 shadow-lg rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                Hall
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
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {booking.bookingId}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {booking.hallName}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {booking.customerName}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {booking.bookingDate}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
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
                <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-500">
                   {booking.status.toLowerCase() !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-5 py-2 border-red-500 border text-red-500 rounded transition duration-300 hover:bg-red-500 hover:text-white focus:outline-none"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBooking}
      />
    </div>
  );
};

export default BookingsPage;
