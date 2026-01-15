
"use client";
import React from 'react';

const BookingDetailsModal = ({ booking, onClose }) => {
  if (!booking) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Booking Details',
        text: `Check out my booking details:\nBooking ID: ${booking.bookingId}\nEvent: ${booking.eventDetails}\nHall: ${booking.hall.name}`,
        url: window.location.href,
      })
        .catch((error) => console.error('Error sharing', error));
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg w-11/12 md:w-1/2">
        <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
        <div id="booking-details-content">
          <p><strong>Booking ID:</strong> {booking.bookingId}</p>
          <p><strong>Event:</strong> {booking.eventDetails}</p>
          <p><strong>Hall:</strong> {booking.hall.name}</p>
          <p><strong>Location:</strong> {booking.hall.location}</p>
          <p><strong>Date:</strong> {new Date(booking.bookingDates[0].startTime).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {new Date(booking.bookingDates[0].startTime).toLocaleTimeString()} - {new Date(booking.bookingDates[0].endTime).toLocaleTimeString()}</p>
          <p><strong>Total Price:</strong> ${booking.totalPrice}</p>
          <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handlePrint}
          >
            Print
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md"
            onClick={handleShare}
          >
            Share
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
