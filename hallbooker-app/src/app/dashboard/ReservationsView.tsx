'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import ReservationCard from './ReservationCard';

const ReservationsView = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get('/reservations/my-reservations');
        setReservations(response.data.data);
      } catch (err) {
        setError('Failed to fetch reservations.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Reservations</h2>
      {reservations.length === 0 ? (
        <p>You have no reservations.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation._id} reservation={reservation} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsView;
