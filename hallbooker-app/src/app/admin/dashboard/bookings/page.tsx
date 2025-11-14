
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import AdminBookingDetailsModal from '@/components/admin/AdminBookingDetailsModal';

// Define the Booking interface to match the API response
interface Booking {
  _id: string;
  hall: string; // Now just an ID
  user: string; // Now just an ID
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  eventDetails?: string; // Optional field for more descriptive event info
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
  const limit = 10; // Number of bookings per page

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      // Construct query parameters
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

      // Adjusted to handle the nested data structure
      if (response.data && response.data.data) {
        setBookings(response.data.data.bookings || []);
        setTotalPages(response.data.data.totalPages || 1);
      } else {
        setBookings([]);
        setTotalPages(1);
      }

    } catch (error) {
      console.error("Failed to fetch bookings", error);
      setBookings([]); // Reset on error
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Bookings</h1>

      {/* Hall Filter */}
      <div className="mb-4">
        <label htmlFor="hallFilter" className="mr-2 font-medium text-gray-700">Filter by Hall:</label>
        <select
          id="hallFilter"
          value={selectedHall}
          onChange={(e) => {
            setSelectedHall(e.target.value);
            setCurrentPage(1); // Reset to first page on filter change
          }}
          className="p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event Details</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b text-sm text-gray-900">{booking.eventDetails || 'N/A'}</td>
                      <td className="py-3 px-4 border-b text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b text-sm">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
