"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import ReservationCard from "@/app/dashboard/ReservationCard";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation._id}
              reservation={reservation}
              onCompleteBooking={handleCompleteBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsList;
