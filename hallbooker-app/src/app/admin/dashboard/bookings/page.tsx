
'use client';

import React, { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import AdminBookingDetailsModal from '@/components/admin/AdminBookingDetailsModal';
import AdminBookingModal from '@/components/admin/AdminBookingModal';
import ConversionModal from '@/components/shared/ConversionModal';
import { Search, ChevronDown, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import { Booking, Hall } from '@/types';

const BOOKINGS_PER_PAGE = 10;

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

const BookingsPage = () => {
  const searchParams = useSearchParams();
  const hallIdFromQuery = searchParams.get('hallId');
  const initialSearch = searchParams.get('search') || '';
  const [activeTab, setActiveTab] = useState('bookings');
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedHall, setSelectedHall] = useState(hallIdFromQuery || '');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        let bookingsRes;
        if (selectedHall) {
          bookingsRes = await api.get(`/halls/${selectedHall}/bookings`);
          const normalizedBookings = bookingsRes.data.data.bookings.map((booking: Booking) => ({
            ...booking,
            hall: booking.hall,
          }));
          setAllBookings(normalizedBookings || []);
        } else {
          bookingsRes = await api.get('/admin/bookings?limit=10000');
          setAllBookings(bookingsRes.data.data.bookings || []);
        }
      } else {
        if (selectedHall) {
          const reservationsRes = await api.get(`/reservations/halls/${selectedHall}`);
          setReservations(reservationsRes.data.data.reservations || []);
        } else {
          setReservations([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }, [selectedHall, activeTab]);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const hallsRes = await api.get('/halls');
        if (hallsRes.data && Array.isArray(hallsRes.data.data)) {
          setHalls(hallsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch halls", err);
      }
    };
    fetchHalls();
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return allBookings;
    return allBookings.filter(
      (booking) =>
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.recurringBookingId && booking.recurringBookingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.eventDetails || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof booking.user === "object" && (booking.user as { fullName?: string })?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allBookings, searchTerm]);

  const groupedBookings = useMemo(() => {
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
            endTime: last.bookingDates[0].endTime
          }
        ],
        groupBookings: groupBookings
      });
    });

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [filteredBookings]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKINGS_PER_PAGE;
    return groupedBookings.slice(startIndex, startIndex + BOOKINGS_PER_PAGE);
  }, [groupedBookings, currentPage]);

  const totalPages = Math.ceil(groupedBookings.length / BOOKINGS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = (refresh = false) => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    if (refresh) {
      fetchAllData();
    }
  };

  const getHallName = (hall: string | Hall) => {
    const id = typeof hall === 'string' ? hall : hall._id || hall.id;
    return halls.find(h => h._id === id || h.id === id)?.name || 'N/A';
  };

  const handleCreateBooking = async (formData: Record<string, unknown>, type: string) => {
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
      if (type === 'reservation') {
        setActiveTab('reservations');
      }
      fetchAllData();
      setIsCreateModalOpen(false);
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Booking Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all transform active:scale-95"
        >
          Create Booking
        </button>
      </div>

      <div className="bg-white p-6 shadow-xl rounded-2xl border border-gray-100">
        <div className="flex space-x-2 border-b border-gray-100 mb-6 overflow-x-auto pb-px">
          <button
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 rounded-t-lg ${activeTab === 'bookings' ? 'border-primary text-primary bg-blue-50/50' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
          <button
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 rounded-t-lg ${activeTab === 'reservations' ? 'border-primary text-primary bg-blue-50/50' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('reservations')}
          >
            Reservations
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
             <p className="text-gray-500 font-medium">Fetching platform data...</p>
          </div>
        ) : activeTab === 'bookings' ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-gray-50 p-4 rounded-xl">
              <div className="relative w-full md:w-1/2">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, customer or event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary w-full text-gray-900 bg-white"
                />
              </div>
              <div className="w-full md:w-1/3">
                <select
                  value={selectedHall}
                  onChange={(e) => setSelectedHall(e.target.value)}
                  className="block w-full p-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">All Venues</option>
                  {halls.map((hall) => (
                    <option key={hall._id} value={hall._id}>{hall.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden xl:block overflow-hidden shadow-sm border border-gray-100 rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking</th>
                    <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Venue</th>
                    <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer / Event</th>
                    <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timeline</th>
                    <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Financials</th>
                    <th className="py-4 px-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking) => (
                      <React.Fragment key={booking._id}>
                        <tr onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)} className="cursor-pointer hover:bg-blue-50/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-mono text-xs font-black text-gray-900 uppercase">#{booking.bookingId}</span>
                              {booking.isRecurring && (
                                <span className="px-2 py-0.5 w-fit text-[9px] font-black uppercase rounded-full bg-indigo-100 text-indigo-700">Recurring</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700 font-medium">{getHallName(booking.hall)}</td>
                          <td className="py-4 px-6">
                            <div className="text-sm font-bold text-gray-900">{(booking.user as {fullName: string})?.fullName || booking.walkInUserDetails?.fullName}</div>
                            <div className="text-xs text-gray-400 line-clamp-1 italic">{booking.eventDetails || 'Private Event'}</div>
                          </td>
                          <td className="py-4 px-6">
                            {booking.isGroup ? (
                              <div className="text-xs font-medium text-gray-600">
                                <div>{new Date(booking.bookingDates[0].startTime).toLocaleDateString()}</div>
                                <div className="text-blue-600 font-bold">Series: {booking.groupBookings?.length} days</div>
                              </div>
                            ) : (
                              <div className="text-xs font-medium text-gray-600">
                                <div className="font-bold text-gray-900">{new Date(booking.bookingDates[0].startTime).toLocaleDateString()}</div>
                                <div>{new Date(booking.bookingDates[0].startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${
                              (booking.status || booking.bookingStatus) === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                              (booking.status || booking.bookingStatus) === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>{booking.status || booking.bookingStatus}</span>
                          </td>
                          <td className="py-4 px-6 text-sm font-black text-gray-900">₦{booking.totalPrice?.toLocaleString()}</td>
                          <td className="py-4 px-6 text-right">
                            <button onClick={(e) => { e.stopPropagation(); handleViewDetails(booking); }} className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center space-x-1">
                               <Eye size={16} />
                               <span className="text-xs font-bold uppercase">View</span>
                            </button>
                          </td>
                        </tr>
                        {expandedBookingId === booking._id && (
                          <tr>
                            <td colSpan={7} className="p-6 bg-gray-50 border-y border-gray-100">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Payment Information</h4>
                                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                                    <div className="text-gray-500">Gateway Method</div>
                                    <div className="font-bold text-gray-800">{booking.paymentMethod || 'Manual'}</div>
                                    <div className="text-gray-500">Transaction Status</div>
                                    <div className="font-bold text-gray-800 uppercase">{booking.paymentStatus}</div>
                                    <div className="text-gray-500">Origin</div>
                                    <div className="font-bold text-gray-800">{booking.bookingType || 'Standard'}</div>
                                  </div>
                                </div>
                                {booking.isGroup && (
                                  <div>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recurring Timeline</h4>
                                    <div className="max-h-40 overflow-y-auto border rounded-xl bg-white p-3 shadow-inner">
                                      <table className="min-w-full text-xs">
                                        <tbody className="divide-y divide-gray-50">
                                          {booking.groupBookings?.map((gb) => (
                                            <tr key={gb._id}>
                                              <td className="py-2 font-mono text-gray-400">#{gb.bookingId}</td>
                                              <td className="py-2 text-right font-bold text-gray-700">
                                                {new Date(gb.bookingDates[0].startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-gray-400 font-medium italic">No matches found in platform archives.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="xl:hidden space-y-4">
               {paginatedBookings.length > 0 ? (
                 paginatedBookings.map((booking) => (
                   <div key={booking._id} className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                      <div className="p-5" onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)}>
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-[10px] font-black text-gray-400 uppercase">#{booking.bookingId}</span>
                                  {booking.isRecurring && <span className="bg-indigo-50 text-indigo-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Recurring</span>}
                               </div>
                               <h3 className="text-lg font-black text-gray-900 leading-tight">{(booking.user as {fullName: string})?.fullName || booking.walkInUserDetails?.fullName}</h3>
                               <p className="text-xs text-gray-400 font-medium line-clamp-1">{getHallName(booking.hall)}</p>
                            </div>
                            <span className={`px-2 py-1 text-[9px] font-black rounded-full uppercase tracking-tighter ${
                              (booking.status || booking.bookingStatus) === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                              (booking.status || booking.bookingStatus) === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>{booking.status || booking.bookingStatus}</span>
                         </div>

                         <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Timing</p>
                               <p className="text-xs font-bold text-gray-800">{new Date(booking.bookingDates[0].startTime).toLocaleDateString()}</p>
                               {booking.isGroup ? <p className="text-[10px] text-blue-600 font-bold">Series: {booking.groupBookings?.length} events</p> : <p className="text-[10px] text-gray-500">{new Date(booking.bookingDates[0].startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Financials</p>
                               <p className="text-sm font-black text-gray-900">₦{booking.totalPrice?.toLocaleString()}</p>
                               <p className="text-[10px] text-gray-500 uppercase font-bold">{booking.paymentStatus}</p>
                            </div>
                         </div>

                         <div className="flex items-center justify-between mt-4">
                            <button onClick={(e) => { e.stopPropagation(); handleViewDetails(booking); }} className="text-xs font-bold uppercase text-primary tracking-widest hover:underline flex items-center">
                               <Eye size={14} className="mr-1.5" /> Platform Details
                            </button>
                            <ChevronDown size={16} className={`text-gray-300 transition-transform ${expandedBookingId === booking._id ? 'rotate-180' : ''}`} />
                         </div>
                      </div>

                      {expandedBookingId === booking._id && (
                        <div className="bg-gray-50/50 p-5 border-t border-gray-50 space-y-5">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Event Scope</p>
                              <p className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-100">{booking.eventDetails || 'Generic Hall Booking'}</p>
                            </div>
                            {booking.isGroup && (
                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Occurrence History</p>
                                 <div className="bg-white rounded-xl border border-gray-100 p-2 space-y-1.5 max-h-32 overflow-y-auto shadow-inner">
                                    {booking.groupBookings?.map(gb => (
                                      <div key={gb._id} className="flex justify-between items-center text-[10px] p-1.5 hover:bg-gray-50 rounded">
                                         <span className="font-mono font-bold text-gray-400">#{gb.bookingId}</span>
                                         <span className="font-black text-gray-800">{new Date(gb.bookingDates[0].startTime).toLocaleDateString()}</span>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                            )}
                        </div>
                      )}
                   </div>
                 ))
               ) : (
                 <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No matching records</p>
                 </div>
               )}
            </div>

            <div className="mt-8 flex justify-between items-center bg-gray-50 p-4 rounded-xl">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-5 py-2.5 bg-white text-gray-700 font-bold text-sm rounded-xl shadow-sm border border-gray-200 disabled:opacity-50 transition-all hover:bg-gray-50">
                Previous
              </button>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-5 py-2.5 bg-white text-gray-700 font-bold text-sm rounded-xl shadow-sm border border-gray-200 disabled:opacity-50 transition-all hover:bg-gray-50">
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
             <div className="hidden lg:block overflow-hidden shadow-sm border border-gray-100 rounded-xl">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                      <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timeline</th>
                      <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Financials</th>
                      <th className="py-4 px-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {reservations.length > 0 ? (
                      reservations.map((reservation) => (
                        <tr key={reservation._id} className="hover:bg-gray-50/50">
                          <td className="py-4 px-6 font-bold text-gray-900">{reservation.user?.fullName || reservation.walkInUserDetails?.fullName}</td>
                          <td className="py-4 px-6">
                            <div className="text-xs text-gray-600">
                               <div className="font-bold">{new Date(reservation.bookingDates[0].startTime).toLocaleDateString()}</div>
                               <div className="text-[10px] text-gray-400">{new Date(reservation.bookingDates[0].startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                             <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-blue-50 text-blue-600">{reservation.status}</span>
                          </td>
                          <td className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{reservation.paymentStatus}</td>
                          <td className="py-4 px-6 text-right">
                            {reservation.status === 'ACTIVE' && (
                              <button
                                onClick={() => { setSelectedReservationId(reservation.reservationId); setIsConversionModalOpen(true); }}
                                className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-4 py-2 rounded-lg hover:bg-emerald-100 transition-all uppercase"
                              >
                                Convert to Booking
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-gray-400 font-medium italic">No active reservations found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>

             {/* Mobile Reservations */}
             <div className="lg:hidden space-y-4">
                {reservations.length > 0 ? (
                   reservations.map(res => (
                     <div key={res._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md">
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="text-base font-black text-gray-900">{res.user?.fullName || res.walkInUserDetails?.fullName}</h3>
                           <span className="px-2 py-0.5 text-[8px] font-black bg-blue-50 text-blue-600 rounded-md uppercase tracking-widest">{res.status}</span>
                        </div>
                        <div className="flex justify-between items-end">
                           <div className="text-xs text-gray-500">
                              <p className="font-black text-gray-800">{new Date(res.bookingDates[0].startTime).toLocaleDateString()}</p>
                              <p className="uppercase tracking-tighter font-bold">{res.paymentStatus}</p>
                           </div>
                           {res.status === 'ACTIVE' && (
                              <button
                                onClick={() => { setSelectedReservationId(res.reservationId); setIsConversionModalOpen(true); }}
                                className="bg-primary text-white text-[10px] font-black px-5 py-2.5 rounded-xl uppercase tracking-widest active:scale-95 transition-all shadow-sm shadow-blue-200"
                              >
                                Convert
                              </button>
                            )}
                        </div>
                     </div>
                   ))
                ) : (
                  <div className="text-center py-10 text-gray-400 font-bold text-xs uppercase tracking-widest">No active reservations</div>
                )}
             </div>
          </div>
        )}
      </div>

      {isModalOpen && selectedBooking && (
        <AdminBookingDetailsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            booking={selectedBooking}
            halls={halls}
        />
      )}
      <AdminBookingModal
        key={isCreateModalOpen ? 'open' : 'closed'}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBooking}
      />
      {selectedReservationId && (
        <ConversionModal
          isOpen={isConversionModalOpen}
          onClose={() => setIsConversionModalOpen(false)}
          reservationId={selectedReservationId}
          onSuccess={fetchAllData}
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
