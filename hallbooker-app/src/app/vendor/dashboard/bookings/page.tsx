"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import BookingModal from "@/components/vendor/BookingModal";
import ConversionModal from "@/components/shared/ConversionModal";
import Swal from 'sweetalert2';
import { ChevronDown, XCircle } from "lucide-react";

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
  isRecurring?: boolean;
  recurringBookingId?: string;
}

interface Reservation {
  _id: string;
  reservationId: string;
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

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm disabled:opacity-50 disabled:bg-gray-100 transition-colors hover:bg-gray-50"
      >
        Previous
      </button>
      <span className="text-sm font-medium text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm disabled:opacity-50 disabled:bg-gray-100 transition-colors hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

const BookingsPage = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const hallIdFromQuery = searchParams.get('hallId');
  const searchTerm = searchParams.get('search') || '';
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
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [reservationsPage, setReservationsPage] = useState(1);
  const [reservationsTotalPages, setReservationsTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const LIMIT = 20;

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
    } catch (err) {
      console.error("Error fetching halls:", err);
      setError('Failed to fetch halls.');
    }
  };

  const fetchBookings = async (hallId: string, page: number = 1) => {
    if (!hallId) {
      setBookings([]);
      return;
    }
    try {
      setLoading(true);
      setError('');
      let url = `/halls/${hallId}/bookings?page=${page}&limit=${LIMIT}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      if (sortOrder) url += `&sortOrder=${sortOrder}`;

      const response = await api.get(url);
      const data = response.data.data;
      setBookings(data.bookings || []);
      setBookingsTotalPages(data.pagination?.totalPages || data.totalPages || 1);
    } catch (error: unknown) {
      console.error("Error fetching bookings:", error);
      const err = error as { response?: { status: number } };
      if (err.response?.status === 404) {
        setBookings([]);
        setBookingsTotalPages(1);
      } else {
        setError('Failed to fetch bookings.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (hallId: string, page: number = 1) => {
    if (!hallId) {
      setReservations([]);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/reservations/halls/${hallId}?page=${page}&limit=${LIMIT}`);
      const data = response.data.data;
      setReservations(data.reservations || []);
      setReservationsTotalPages(data.pagination?.totalPages || data.totalPages || 1);
    } catch (error: unknown) {
      console.error("Error fetching reservations:", error);
      const err = error as { response?: { status: number } };
      if (err.response?.status === 404) {
        setReservations([]);
        setReservationsTotalPages(1);
      } else {
        setError('Failed to fetch reservations.');
      }
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
        fetchBookings(selectedHall, bookingsPage);
      } else {
        fetchReservations(selectedHall, reservationsPage);
      }
    }
  }, [selectedHall, activeTab, bookingsPage, reservationsPage, status, startDate, endDate, sortBy, sortOrder]);

  const handleHallChange = (hallId: string) => {
    setSelectedHall(hallId);
    setBookingsPage(1);
    setReservationsPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setBookingsPage(1);
    setReservationsPage(1);
  };

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.put(`/bookings/${bookingId}`);
        if (selectedHall) {
          fetchBookings(selectedHall, bookingsPage); // Refresh the list
        }
      } catch (err) {
        console.error('Failed to cancel booking:', err);
        setError('Failed to cancel the booking.');
      }
    }
  };

  const filteredBookings = React.useMemo(() => {
    let result = bookings;
    if (searchTerm) {
      result = result.filter(
        (booking) =>
          booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.recurringBookingId && booking.recurringBookingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
          booking.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.walkInUserDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.eventDetails?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (bookingTypeFilter !== 'all') {
      result = result.filter(booking => {
        const isRecurring = !!booking.isRecurring;
        return bookingTypeFilter === 'recurring' ? isRecurring : !isRecurring;
      });
    }
    return result;
  }, [bookings, searchTerm, bookingTypeFilter]);

  const groupedBookings = React.useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    const result: (Booking & { isGroup?: boolean; groupBookings?: Booking[] })[] = [];

    filteredBookings.forEach(booking => {
      if (booking.isRecurring && booking.recurringBookingId) {
        if (!groups[booking.recurringBookingId]) {
          groups[booking.recurringBookingId] = [];
        }
        groups[booking.recurringBookingId].push(booking);
      } else {
        result.push({ ...booking, isGroup: false });
      }
    });

    Object.entries(groups).forEach(([recurringId, groupBookings]) => {
      groupBookings.sort((a, b) => new Date(a.bookingDates[0].startTime).getTime() - new Date(b.bookingDates[0].startTime).getTime());

      const first = groupBookings[0];
      const last = groupBookings[groupBookings.length - 1];
      const totalSum = groupBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      result.push({
        ...first,
        isGroup: true,
        bookingId: recurringId,
        totalPrice: totalSum,
        bookingDates: [
          {
            startTime: first.bookingDates[0].startTime,
            endTime: last.bookingDates[0].endTime // Use last one's end time
          }
        ],
        groupBookings: groupBookings
      });
    });

    result.sort((a, b) => {
      const dateA = new Date(a.bookingDates[0].startTime).getTime();
      const dateB = new Date(b.bookingDates[0].startTime).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [filteredBookings, sortOrder]);

  const filteredReservations = React.useMemo(() => {
    if (!searchTerm) return reservations;
    return reservations.filter(
      (reservation) =>
        reservation.reservationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.walkInUserDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reservations, searchTerm]);

  const handleCreateBooking = async (formData: unknown, type: string) => {
    const data = formData as { paymentMethod?: string };
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

      if (data.paymentMethod === 'online' && type === 'recurring') {
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
        } else {
          fetchBookings(selectedHall, 1);
          setBookingsPage(1);
        }
      }
      setIsModalOpen(false);
    } catch (error: unknown) {
      console.error('Failed to create booking:', error);
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: err.response?.data?.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">Bookings</h1>
        {user?.activeRole === "hall-owner" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:bg-primary-dark transition-colors"
          >
            Create Booking
          </button>
        )}
      </div>
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <label htmlFor="hall-select" className="block text-xs font-semibold text-gray-500 uppercase mb-2">Select a Hall</label>
        <select
          id="hall-select"
          value={selectedHall}
          onChange={(e) => handleHallChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg text-gray-900"
        >
          <option value="">--Please choose a hall--</option>
          {halls.map((hall) => (
            <option key={hall._id} value={hall._id}>
              {hall.name}
            </option>
          ))}
        </select>
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-gray-50 p-5 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 border border-gray-200">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary py-2 text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Type</label>
            <select
              value={bookingTypeFilter}
              onChange={(e) => setBookingTypeFilter(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary py-2 text-gray-700"
            >
              <option value="all">All Types</option>
              <option value="normal">Normal</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary py-2 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary py-2 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary py-2 text-gray-700"
            >
              <option value="createdAt">Date Created</option>
              <option value="totalPrice">Price</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary py-2 text-gray-700"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-3 text-sm font-semibold transition-all ${activeTab === 'bookings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('bookings')}
        >
          Bookings
        </button>
        <button
          className={`px-6 py-3 text-sm font-semibold transition-all ${activeTab === 'reservations' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('reservations')}
        >
          Reservations
        </button>
      </div>

      {error && <p className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 mb-6">{error}</p>}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading {activeTab}...</p>
          </div>
        ) : activeTab === 'bookings' ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date Range</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedBookings.length > 0 ? groupedBookings.map((booking) => (
                    <React.Fragment key={booking._id}>
                      <tr onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-gray-700">{booking.bookingId}</span>
                            <div className="flex flex-col gap-1">
                              {booking.isRecurring && (
                                <span className="px-2 py-0.5 inline-flex text-[9px] font-bold rounded-full bg-blue-100 text-blue-800 uppercase">Recurring</span>
                              )}
                              {booking.bookingType?.toLowerCase() === 'online' && (
                                <span className="px-2 py-0.5 inline-flex text-[9px] font-bold rounded-full bg-green-100 text-green-800 uppercase">Online</span>
                              )}
                              {booking.bookingType?.toLowerCase() === 'walk-in' && (
                                <span className="px-2 py-0.5 inline-flex text-[9px] font-bold rounded-full bg-purple-100 text-purple-800 uppercase">Walk-in</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {booking.user?.fullName || booking.walkInUserDetails?.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.isGroup ? (
                            <div>
                              <span>{new Date(booking.bookingDates[0].startTime).toLocaleDateString()}</span>
                              <span className="mx-1">-</span>
                              <span>{new Date(booking.bookingDates[0].endTime).toLocaleDateString()}</span>
                              <div className="text-[10px] text-blue-600 font-bold mt-0.5">({booking.groupBookings?.length} sessions)</div>
                            </div>
                          ) : (
                            <div>
                              <span className="block">{new Date(booking.bookingDates[0].startTime).toLocaleDateString()}</span>
                              <span className="text-xs text-gray-400">{new Date(booking.bookingDates[0].startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.bookingDates[0].endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                              booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {booking.status.toLowerCase() !== 'cancelled' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(booking._id);
                              }}
                              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <ChevronDown size={18} className={`text-gray-400 transform transition-transform ${expandedBookingId === booking._id ? 'rotate-180' : ''}`} />
                        </td>
                      </tr>
                      {expandedBookingId === booking._id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-5 bg-gray-50 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Booking Details</h4>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500">Event:</span> <span className="font-medium">{booking.eventDetails || 'N/A'}</span></div>
                                  <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500">Total Price:</span> <span className="font-bold text-gray-900">₦{booking.totalPrice?.toLocaleString()}</span></div>
                                  <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500">Payment:</span> <span>{booking.paymentMethod} ({booking.paymentStatus})</span></div>
                                  {booking.walkInUserDetails && (
                                    <>
                                      <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500">Email:</span> <span>{booking.walkInUserDetails.email}</span></div>
                                      <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500">Phone:</span> <span>{booking.walkInUserDetails.phone}</span></div>
                                    </>
                                  )}
                                </div>
                              </div>
                              {booking.isGroup && (
                                <div>
                                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Recurring Schedule</h4>
                                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white p-3 shadow-inner">
                                    <table className="min-w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-gray-100">
                                          <th className="text-left pb-2 text-gray-400">ID</th>
                                          <th className="text-left pb-2 text-gray-400">Date & Time</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-50">
                                        {booking.groupBookings?.map((gb) => (
                                          <tr key={gb._id}>
                                            <td className="py-2 font-mono text-gray-500">{gb.bookingId}</td>
                                            <td className="py-2 text-gray-700 font-medium">
                                              {new Date(gb.bookingDates[0].startTime).toLocaleDateString()} @ {new Date(gb.bookingDates[0].startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                        {selectedHall ? (searchTerm ? `No bookings found matching "${searchTerm}"` : 'No bookings found for this hall.') : 'Please select a hall.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Booking Cards */}
            <div className="lg:hidden space-y-4">
              {groupedBookings.length > 0 ? groupedBookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-tight">#{booking.bookingId}</span>
                          {booking.isRecurring && <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Rec</span>}
                        </div>
                        <h3 className="text-base font-bold text-gray-900">{booking.user?.fullName || booking.walkInUserDetails?.fullName}</h3>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                        booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Date</p>
                        <p className="text-xs font-semibold text-gray-800">
                          {new Date(booking.bookingDates[0].startTime).toLocaleDateString()}
                          {booking.isGroup && <span className="text-blue-600 block text-[9px]">Series End: {new Date(booking.bookingDates[0].endTime).toLocaleDateString()}</span>}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Price</p>
                        <p className="text-xs font-bold text-gray-900">₦{booking.totalPrice?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)}
                        className="flex-1 text-xs font-bold text-gray-600 bg-gray-100 py-2.5 rounded-lg"
                      >
                        {expandedBookingId === booking._id ? 'Hide Details' : 'View Details'}
                      </button>
                      {booking.status.toLowerCase() !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="flex-shrink-0 p-2.5 text-red-500 bg-red-50 rounded-lg border border-red-100"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedBookingId === booking._id && (
                    <div className="bg-gray-50 px-4 py-5 border-t border-gray-100 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Detailed Info</p>
                        <div className="space-y-1.5 text-xs text-gray-700">
                          <div className="flex justify-between"><span className="text-gray-400">Event:</span> <span className="font-medium text-right ml-4">{booking.eventDetails || 'N/A'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Payment:</span> <span className="text-right">{booking.paymentMethod}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Email:</span> <span className="text-right truncate ml-4">{booking.walkInUserDetails?.email || 'N/A'}</span></div>
                        </div>
                      </div>

                      {booking.isGroup && (
                        <div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Series Schedule ({booking.groupBookings?.length})</p>
                           <div className="bg-white rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                              {booking.groupBookings?.map((gb, i) => (
                                <div key={gb._id} className={`p-2 flex justify-between text-[10px] ${i !== 0 ? 'border-t border-gray-50' : ''}`}>
                                  <span className="font-mono text-gray-400">#{gb.bookingId}</span>
                                  <span className="font-semibold">{new Date(gb.bookingDates[0].startTime).toLocaleDateString()}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-medium">
                  {selectedHall ? "No bookings found." : "Select a hall above."}
                </div>
              )}
            </div>

            <Pagination
              currentPage={bookingsPage}
              totalPages={bookingsTotalPages}
              onPageChange={setBookingsPage}
            />
          </>
        ) : (
          <>
            {/* Desktop Reservations Table */}
            <div className="hidden lg:block bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.length > 0 ? filteredReservations.map((reservation) => (
                    <tr key={reservation._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {reservation.user?.fullName || reservation.walkInUserDetails?.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="block">{new Date(reservation.bookingDates[0].startTime).toLocaleDateString()}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{new Date(reservation.bookingDates[0].startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            reservation.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-600 uppercase tracking-tight">
                        {reservation.paymentStatus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {reservation.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              setSelectedReservationId(reservation.reservationId);
                              setIsConversionModalOpen(true);
                            }}
                            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary-dark shadow-sm transition-all"
                          >
                            Convert
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                         {selectedHall ? "No reservations found." : "Select a hall."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Reservation Cards */}
            <div className="lg:hidden space-y-4">
              {filteredReservations.length > 0 ? filteredReservations.map((res) => (
                <div key={res._id} className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">#{res.reservationId}</span>
                      <h3 className="text-base font-bold text-gray-900">{res.user?.fullName || res.walkInUserDetails?.fullName}</h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                      res.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {res.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-600">
                      <p className="font-semibold text-gray-800">{new Date(res.bookingDates[0].startTime).toLocaleDateString()}</p>
                      <p className="text-gray-400 font-medium">Payment: {res.paymentStatus}</p>
                    </div>
                    {res.status === 'ACTIVE' && (
                      <button
                         onClick={() => {
                           setSelectedReservationId(res.reservationId);
                           setIsConversionModalOpen(true);
                         }}
                         className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg"
                      >
                        Convert
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-medium">
                  No reservations found.
                </div>
              )}
            </div>

            <Pagination
              currentPage={reservationsPage}
              totalPages={reservationsTotalPages}
              onPageChange={setReservationsPage}
            />
          </>
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
          onSuccess={() => fetchReservations(selectedHall, reservationsPage)}
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
