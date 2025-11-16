
'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import AdminBookingDetailsModal from '@/components/admin/AdminBookingDetailsModal';
import { Search } from 'lucide-react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

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

const BOOKINGS_PER_PAGE = 10;

const BookingsPage = () => {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedHall, setSelectedHall] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, hallsRes] = await Promise.all([
          api.get('/admin/bookings?limit=10000'), // Fetch all bookings
          api.get('/halls')
        ]);

        if (bookingsRes.data && bookingsRes.data.data) {
          setAllBookings(bookingsRes.data.data.bookings || []);
        }
        if (hallsRes.data && Array.isArray(hallsRes.data.data)) {
          setHalls(hallsRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredBookings = useMemo(() => {
    return allBookings
      .filter(booking => selectedHall ? booking.hall === selectedHall : true)
      .filter(booking =>
        searchTerm ? (booking.eventDetails || '').toLowerCase().includes(searchTerm.toLowerCase()) : true
      );
  }, [allBookings, selectedHall, searchTerm]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKINGS_PER_PAGE;
    return filteredBookings.slice(startIndex, startIndex + BOOKINGS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const getHallName = (hallId: string) => {
    return halls.find(h => h._id === hallId)?.name || 'N/A';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Bookings</h1>

      <div className="bg-white p-6 shadow-lg rounded-lg">
        {loading ? (
          <LoadingSpinner />
        ) : (
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
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900 font-mono text-xs">{booking._id.slice(-8)}...</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{getHallName(booking.hall)}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{booking.eventDetails || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <div><span className="font-semibold">From:</span> {new Date(booking.startTime).toLocaleString()}</div>
                          <div><span className="font-semibold">To:</span> {new Date(booking.endTime).toLocaleString()}</div>
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
        )}
      </div>

      {isModalOpen && selectedBooking && (
        <AdminBookingDetailsModal booking={selectedBooking} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default BookingsPage;
