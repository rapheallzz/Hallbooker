"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface Hall {
  _id: string;
  name: string;
}

interface Reservation {
  _id: string;
  hall: Hall | string;
  bookingDates: { startTime: string, endTime: string }[];
  status: 'ACTIVE' | 'CONVERTED' | 'EXPIRED';
  totalPrice: number;
  reservationId: string;
}

const ReservationsList = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get('/reservations/my-reservations');
        const reservationsData = response.data.data.reservations || [];

        // Fetch hall details for each reservation
        const reservationsWithHallDetails = await Promise.all(
          (Array.isArray(reservationsData) ? reservationsData : []).map(async (reservation: Reservation) => {
            if (typeof reservation.hall === 'string') {
              try {
                const hallResponse = await api.get(`/halls/${reservation.hall}`);
                reservation.hall = hallResponse.data.data;
              } catch (hallError) {
                console.error(`Failed to fetch hall details for reservation ${reservation._id}`, hallError);
                // Keep the hall as an ID string if fetching fails
              }
            }
            return reservation;
          })
        );
        setReservations(reservationsWithHallDetails);
      } catch (err) {
        setError('Failed to fetch reservations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  const handleCompleteBooking = async (reservation: Reservation) => {
    setPaymentLoading(reservation.reservationId);
    try {
      const response = await api.post(`/reservations/${reservation.reservationId}/convert`);

      // Save the original reservation data to localStorage before redirecting
      localStorage.setItem('bookingConfirmation', JSON.stringify(reservation));

      const checkoutUrl = response.data.data.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = `${checkoutUrl}?type=conversion`;
      } else {
        setError('Could not retrieve payment URL.');
      }
    } catch (err) {
      setError('Failed to initiate payment.');
      console.error(err);
    } finally {
      setPaymentLoading(null);
    }
  };

  if (loading) {
    return <p>Loading reservations...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Reservations</h2>
      {reservations.length === 0 ? (
        <p>You have no reservations.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {typeof reservation.hall === 'object' ? reservation.hall.name : 'Hall details unavailable'}
                </h3>
                <p className="text-sm text-gray-600">
                  Date: {new Date(reservation.bookingDates[0].startTime).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Status: <span className={`font-semibold ${
                    reservation.status === 'ACTIVE' ? 'text-green-600' :
                    reservation.status === 'CONVERTED' ? 'text-blue-600' : 'text-red-600'
                  }`}>{reservation.status === 'CONVERTED' ? 'Fully Paid' : reservation.status}</span>
                </p>
                <p className="text-md font-semibold text-gray-900 mt-2">
                  Price: ₦{reservation.totalPrice.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {reservation.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCompleteBooking(reservation)}
                    disabled={paymentLoading === reservation.reservationId}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 w-full text-center"
                  >
                    {paymentLoading === reservation.reservationId ? 'Processing...' : 'Complete Booking'}
                  </button>
                )}
                <a
                  href={`/payment-success?id=${reservation.reservationId}&type=reservation`}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-center w-full"
                >
                  View Receipt
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsList;
