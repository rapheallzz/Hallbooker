
"use client";
import React from "react";
import { Reservation, Hall } from "@/types";

interface ReservationCardProps {
  reservation: Reservation;
  onCompleteBooking: (reservation: Reservation) => void;
  onViewReceipt: (id: string) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onCompleteBooking, onViewReceipt }) => {
  const hall = typeof reservation.hall === "object" ? (reservation.hall as Hall) : null;
  const hallName = hall ? hall.name : "Hall details unavailable";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800">
          {hallName}
        </h3>
        <p className="text-gray-600 mt-2">Reservation ID: {reservation.reservationId}</p>
        <p className="text-gray-600">
          Date:{" "}
          {reservation.bookingDates?.[0]?.startTime
            ? new Date(reservation.bookingDates[0].startTime).toLocaleDateString()
            : "N/A"}
        </p>
        <p className="text-sm text-gray-500">
          Status:{" "}
          <span
            className={`font-semibold ${
              reservation.status === "ACTIVE"
                ? "text-green-600"
                : reservation.status === "CONVERTED"
                ? "text-blue-600"
                : "text-red-600"
            }`}
          >
            {reservation.status === "CONVERTED" ? "Fully Paid" : reservation.status}
          </span>
        </p>
        <p className="text-md font-semibold text-gray-900 mt-2">
          Price: ₦{reservation.totalPrice.toLocaleString()}
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          {reservation.status === "ACTIVE" && (
            <button
              onClick={() => onCompleteBooking(reservation)}
              disabled={!hall}
              className={`px-4 py-2 rounded-md transition-colors ${
                !hall
                  ? "bg-primary/50 text-white cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              Complete Booking
            </button>
          )}
          <button
            onClick={() => onViewReceipt(reservation.reservationId)}
            disabled={!hall}
            className={`px-4 py-2 rounded-md transition-colors ${
              !hall
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

export default ReservationCard;
