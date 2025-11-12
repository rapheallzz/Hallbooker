"use client";
import React from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const BookingCard = ({ booking }) => {
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
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-bold">{booking.hall.name}</h3>
      <p className="text-gray-600">Booking ID: {booking.bookingId}</p>
      <p className="text-gray-600">Date: {new Date(booking.checkInDate).toLocaleDateString()}</p>
      <button
        onClick={handleCancel}
        className="mt-4 bg-red-500 text-white p-2 rounded-md"
      >
        Cancel Booking
      </button>
    </div>
  );
};

export default BookingCard;
