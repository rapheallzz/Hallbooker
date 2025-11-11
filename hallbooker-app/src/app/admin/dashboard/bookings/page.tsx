"use client";
import React, { useState, useEffect, useMemo } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Search, XCircle } from "lucide-react";

// Assuming a structure for the Booking object based on common patterns
interface Booking {
  _id: string;
  bookingId: string;
  hall: { name: string };
  user: { fullName: string };
  bookingDate: string;
  status: "pending" | "confirmed" | "cancelled";
  totalPrice: number;
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Booking; direction: "ascending" | "descending" } | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // NOTE: The provided API spec does not list an endpoint to get ALL bookings.
        // Proceeding with the assumption that GET /api/v1/bookings returns all bookings for a super-admin.
        const response = await api.get("/bookings");
        setBookings(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        Swal.fire("Error", "Could not fetch bookings. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredAndSortedBookings = useMemo(() => {
    let sortableItems = [...bookings];

    if (searchTerm) {
      sortableItems = sortableItems.filter(booking =>
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
  }, [bookings, searchTerm, statusFilter, sortConfig]);

  const requestSort = (key: keyof Booking) => {
    let direction: "ascending" | "descending" = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Manage Bookings</h1>
      <div className="bg-white p-6 shadow-lg rounded-lg">
        {/* Filtering and Search UI */}
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
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('bookingId')}>Booking ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('hall')}>Hall</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('user')}>User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('bookingDate')}>Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('totalPrice')}>Total Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedBookings.map((booking) => (
                    <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{booking.bookingId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.hall.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.user.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${booking.totalPrice.toLocaleString()}</td>
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
                            {/* Actions like view details or cancel could go here */}
                            <button className="text-indigo-600 hover:text-indigo-900">View</button>
                        </td>
                    </tr>
                ))}
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
    </div>
  );
};

export default withAuth(BookingsPage, ["super-admin"]);
