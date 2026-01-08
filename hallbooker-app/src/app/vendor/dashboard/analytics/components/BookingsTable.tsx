"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Booking, Pagination } from '@/services/analytics';

interface BookingsTableProps {
  bookings: Booking[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, pagination, onPageChange }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
      const bookingTypeMatch = bookingTypeFilter === 'all' || booking.bookingType === bookingTypeFilter;
      const paymentStatusMatch = paymentStatusFilter === 'all' || booking.paymentStatus === paymentStatusFilter;
      return statusMatch && bookingTypeMatch && paymentStatusMatch;
    });
  }, [bookings, statusFilter, bookingTypeFilter, paymentStatusFilter]);

  return (
    <div className="bg-white p-4 shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-600">Recent Bookings</h2>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select onChange={e => setStatusFilter(e.target.value)} value={statusFilter} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Booking Type</label>
          <select onChange={e => setBookingTypeFilter(e.target.value)} value={bookingTypeFilter} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="walk-in">Walk-in</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Status</label>
          <select onChange={e => setPaymentStatusFilter(e.target.value)} value={paymentStatusFilter} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map(booking => (
              <tr key={booking._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.user?.fullName || booking.walkInUserDetails?.fullName || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.hall.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{booking.totalPrice}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.bookingType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/vendor/dashboard/bookings/${booking.bookingId}`} className="text-indigo-600 hover:text-indigo-900">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{pagination.currentPage}</span> of <span className="font-medium">{pagination.totalPages}</span>
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingsTable;
