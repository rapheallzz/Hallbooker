'use client';

import React from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';

const ReservationCard = ({ reservation }) => {
  const handleConvert = async () => {
    try {
      const response = await api.post(`/reservations/${reservation._id}/convert`);
      const { checkoutUrl } = response.data.data;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        Swal.fire('Error', 'Could not retrieve payment URL.', 'error');
      }
    } catch (error) {
      console.error('Error converting reservation:', error);
      Swal.fire('Oops...', 'Something went wrong!', 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800">{reservation.hall.name}</h3>
        <p className="text-gray-600 mt-2">Reservation ID: {reservation.reservationId}</p>
        <p className="text-gray-600">
          Date:{' '}
          {new Date(
            reservation.bookingDates[0].startTime
          ).toLocaleDateString()}
        </p>
        <p className="text-gray-600">Status: {reservation.status}</p>
        <div className="mt-4 flex justify-end">
          {reservation.status === 'ACTIVE' && (
            <button
              onClick={handleConvert}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-300"
            >
              Complete Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;
