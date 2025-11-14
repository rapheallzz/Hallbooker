"use client";
import React, { useState, useEffect, useMemo } from 'react';
import withAuth from '@/components/auth/withAuth';
import api from '@/services/api';
import Swal from 'sweetalert2';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { Search, Calendar, Users, DollarSign, XCircle, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

// Interfaces
interface Booking {
    _id: string;
    hallName: string;
    customerName: string;
    bookingDate: string;
    totalPrice: number;
    status: string;
}

interface Hall {
    _id: string;
    name: string;
}

interface User {
    _id: string;
    fullName: string;
}

const BOOKINGS_PER_PAGE = 10;

const BookingsPage = () => {
    // State
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [halls, setHalls] = useState<Hall[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtering & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Using hardcoded data since API is not available
                const bookingsData = [
                    { _id: '1', hallName: 'Grand Hall', customerName: 'John Doe', bookingDate: '2024-08-15', totalPrice: 1200, status: 'Confirmed' },
                    { _id: '2', hallName: 'Sunset Ballroom', customerName: 'Jane Smith', bookingDate: '2024-09-02', totalPrice: 850, status: 'Pending' },
                    { _id: '3', hallName: 'Oak Room', customerName: 'Peter Jones', bookingDate: '2024-09-20', totalPrice: 500, status: 'Cancelled' },
                ];
                setBookings(bookingsData);
            } catch (err) {
                setError('Failed to fetch bookings. Displaying static data.');
                console.error("API fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Memoized Filtering and Pagination
    const filteredBookings = useMemo(() => {
        return bookings
            .filter(booking => statusFilter ? booking.status === statusFilter : true)
            .filter(booking =>
                booking.hallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.customerName.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [bookings, searchTerm, statusFilter]);

    const paginatedBookings = useMemo(() => {
        const startIndex = (currentPage - 1) * BOOKINGS_PER_PAGE;
        return filteredBookings.slice(startIndex, startIndex + BOOKINGS_PER_PAGE);
    }, [filteredBookings, currentPage]);

    const totalPages = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE);

    // Handlers
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This action will cancel the booking.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // API call would go here
                Swal.fire('Cancelled!', 'The booking has been cancelled.', 'success');
            }
        });
    };


    // Render Logic
    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-primary">Platform Bookings</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-1/3">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                        type="text"
                        placeholder="Search by hall or customer..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                    />
                </div>
                <div className="w-full md:w-1/4">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="block w-full p-2 border border-gray-400 rounded-md"
                    >
                        <option value="">All Statuses</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white p-6 shadow-lg rounded-lg overflow-x-auto">
                {paginatedBookings.length > 0 ? (
                    <>
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Hall</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-300">
                                {paginatedBookings.map(booking => (
                                    <tr key={booking._id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{booking.hallName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.customerName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${booking.totalPrice.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Actions Dropdown could be implemented here */}
                                            <button className="text-gray-600 hover:text-gray-800">
                                                <MoreVertical size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center"
                            >
                                <ChevronLeft size={18} className="mr-1" /> Previous
                            </button>
                            <span className="text-sm text-gray-800">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center"
                            >
                                Next <ChevronRight size={18} className="ml-1" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <XCircle className="mx-auto h-12 w-12 text-gray-600" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No Bookings Found</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            No bookings matched your search criteria. Try adjusting your filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default withAuth(BookingsPage, ["super-admin"]);
