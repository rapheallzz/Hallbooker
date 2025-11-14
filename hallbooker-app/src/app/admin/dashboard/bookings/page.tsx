"use client";
import React, { useState, useEffect, useMemo } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Search, XCircle, PlusCircle } from "lucide-react";
import AdminBookingModal from "@/components/admin/AdminBookingModal";
import AdminBookingDetailsModal from "@/components/admin/AdminBookingDetailsModal";

// Updated Booking interface to match the API response
interface Booking {
  _id: string;
  bookingId: string;
  hall: string; // This is now an ID
  user: string; // This is now an ID
  startTime: string; // Changed from bookingDate
  status: "pending" | "confirmed" | "cancelled";
  totalPrice: number;
}

interface Hall {
  _id: string;
  name: string;
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedHall, setSelectedHall] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Booking; direction: "ascending" | "descending" } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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

  useEffect(() => {
    fetchBookings();
  }, [selectedHall]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = selectedHall ? `/admin/halls/${selectedHall}/bookings` : '/admin/bookings';
      const response = await api.get(url);
      if (response.data && response.data.data && Array.isArray(response.data.data.bookings)) {
        setBookings(response.data.data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Swal.fire("Error", "Could not fetch bookings. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const filteredAndSortedBookings = useMemo(() => {
    let sortableItems = [...bookings];
    if (searchTerm) {
      sortableItems = sortableItems.filter(booking => {
        const hallName = halls.find(h => h._id === booking.hall)?.name || '';
        return (
          (booking.bookingId && booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
          hallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.user && booking.user.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }
    if (statusFilter) {
        sortableItems = sortableItems.filter(booking => booking.status === statusFilter);
    }
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [bookings, searchTerm, statusFilter, sortConfig, halls]);

  const requestSort = (key: keyof Booking) => {
    let direction: "ascending" | "descending" = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

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
      Swal.fire("Success", "Booking created successfully.", "success");
    } catch (error) {
      console.error('Failed to create booking:', error);
      Swal.fire("Error", "Failed to create the booking.", "error");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Bookings</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90"
        >
          <PlusCircle size={20} />
          <span>Create Booking</span>
        </button>
      </div>
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-1/3">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by ID, Hall, or User..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
            </div>
            <div className="w-full md:w-1/4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div className="w-full md:w-1/4">
                <select
                    value={selectedHall}
                    onChange={(e) => setSelectedHall(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Halls</option>
                    {halls.map((hall) => (
                        <option key={hall._id} value={hall._id}>
                            {hall.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('bookingId')}>Booking ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('hall')}>Hall</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('user')}>User ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('startTime')}>Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('totalPrice')}>Total Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedBookings.map((booking) => {
                    const hallName = halls.find(h => h._id === booking.hall)?.name || 'N/A';
                    return (
                        <tr key={booking._id}>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{booking.bookingId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{hallName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{booking.user}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{new Date(booking.startTime).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">${booking.totalPrice.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {booking.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button data-testid={`view-booking-${booking._id}`} onClick={() => handleViewBooking(booking)} className="text-indigo-600 hover:text-indigo-900">View</button>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
        {filteredAndSortedBookings.length === 0 && !loading && (
            <div className="text-center py-8">
                <XCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                <p className="mt-1 text-sm text-gray-500">No bookings matched your search criteria.</p>
            </div>
        )}
      </div>
      <AdminBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBooking}
      />
      {isDetailsModalOpen && selectedBooking && (
        <AdminBookingDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            booking={selectedBooking}
            halls={halls}
        />
      )}
    </div>
  );
};

export default withAuth(BookingsPage, ["super-admin"]);
