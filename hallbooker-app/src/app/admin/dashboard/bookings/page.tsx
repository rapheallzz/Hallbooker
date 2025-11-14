
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import AdminBookingDetailsModal from '@/components/admin/AdminBookingDetailsModal';

// Define the Booking interface to match the API response
interface Booking {
  _id: string;
  hall: string;
  user: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  eventDetails?: string;
  createdAt: string;
}

interface Hall {
  _id: string;
  name: string;
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (selectedHall) {
        params.append('hall', selectedHall);
      }

      const response = await api.get(`/admin/bookings?${params.toString()}`);

      if (response.data && response.data.data) {
        setBookings(response.data.data.bookings || []);
        setTotalPages(response.data.data.totalPages || 1);
      } else {
        setBookings([]);
        setTotalPages(1);
      }

    } catch (error) {
      console.error("Failed to fetch bookings", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedHall]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await api.get('/halls');
        if (response.data && Array.isArray(response.data.data)) {
          setHalls(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch halls", error);
      }
    };
    fetchHalls();
  }, []);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Helper to find hall name from ID
  const getHallName = (hallId: string) => {
    const hall = halls.find(h => h._id === hallId);
    return hall ? hall.name : 'N/A';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>

      <div className="mb-4">
        <label htmlFor="hallFilter" className="mr-2">Filter by Hall:</label>
        <select
          id="hallFilter"
          value={selectedHall}
          onChange={(e) => {
            setSelectedHall(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border rounded"
        >
          <option value="">All Halls</option>
          {halls.map((hall) => (
            <option key={hall._id} value={hall._id}>
              {hall.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Hall</th>
                  <th className="py-2 px-4 border-b">Event Details</th>
                  <th className="py-2 px-4 border-b">Start Time</th>
                  <th className="py-2 px-4 border-b">End Time</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Total Price</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="py-2 px-4 border-b text-gray-900">{getHallName(booking.hall)}</td>
                      <td className="py-2 px-4 border-b text-gray-900">{booking.eventDetails || 'N/A'}</td>
                      <td className="py-2 px-4 border-b text-gray-900">{new Date(booking.startTime).toLocaleString()}</td>
                      <td className="py-2 px-4 border-b text-gray-900">{new Date(booking.endTime).toLocaleString()}</td>
                      <td className="py-2 px-4 border-b text-gray-900">{booking.status}</td>
                      <td className="py-2 px-4 border-b text-gray-900">${booking.totalPrice.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="text-blue-500 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {isModalOpen && selectedBooking && (
        <AdminBookingDetailsModal
          booking={selectedBooking}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BookingsPage;
