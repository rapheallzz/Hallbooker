"use client";
import React from "react";
import { Booking } from "@/types";

interface BookingCardProps {
  booking: Booking;
  onViewReceipt: (id: string) => void;
  onReview: (booking: Booking) => void;
  isPast: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onViewReceipt, onReview, isPast }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800">
          {booking.hall ? booking.hall.name : "Hall details unavailable"}
        </h3>
        <p className="text-gray-600 mt-2">Booking ID: {booking.bookingId}</p>
        <p className="text-gray-600">
          Date:{" "}
          {booking.bookingDates?.[0]?.startTime
            ? new Date(booking.bookingDates[0].startTime).toLocaleDateString()
            : "N/A"}
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          {isPast && (
            <button
              onClick={() => onReview(booking)}
              disabled={!booking.hall}
              className={`py-2 px-4 rounded-md transition-colors duration-300 text-center flex-1 ${
                !booking.hall
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-opacity-90"
              }`}
            >
              Review Hall
            </button>
          )}
          <button
            onClick={() => onViewReceipt(booking.bookingId)}
            disabled={!booking.hall}
            className={`py-2 px-4 rounded-md transition-colors duration-300 text-center ${
              !booking.hall
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            View Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
