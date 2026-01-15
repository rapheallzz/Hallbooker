"use client";
import React from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const BookingCard = ({ booking, onViewReceipt }) => {
  const handleCancel = async () => {
    try {
      await api.patch(`/bookings/${booking._id}/cancel`);
      Swal.fire("Cancelled!", "Your booking has been cancelled.", "success");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      Swal.fire("Oops...", "Something went wrong!", "error");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800">{booking.hall.name}</h3>
        <p className="text-gray-600 mt-2">Booking ID: {booking.bookingId}</p>
        <p className="text-gray-600">Date: {new Date(booking.bookingDates[0].startTime).toLocaleDateString()}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => onViewReceipt(booking.bookingId)}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 text-center"
          >
            View Receipt
          </button>
          <button
            onClick={handleCancel}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-300"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
