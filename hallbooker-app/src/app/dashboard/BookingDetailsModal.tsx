
"use client";
import React from 'react';
import { X } from 'lucide-react';
import { Booking, Hall } from '@/types';

interface BookingDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  if (!booking) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const hall = typeof booking.hall === 'object' ? (booking.hall as Hall) : null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Booking Details',
        text: `Check out my booking details:\nBooking ID: ${
          booking.bookingId
        }\nEvent: ${booking.eventDetails}\nHall: ${hall?.name || "N/A"}`,
        url: window.location.href,
      }).catch((error) => console.error("Error sharing", error));
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 p-0 lg:p-4">
      <div className="bg-white rounded-t-2xl lg:rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-6 lg:p-10" id="booking-details-content">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Booking Receipt</h2>
            <button onClick={onClose} className="lg:hidden text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 border-b pb-2 text-primary">Booking Information</h3>
              <div className="space-y-3 text-sm lg:text-base text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Booking ID:</span>
                  <span>{booking.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Event:</span>
                  <span>{booking.eventDetails}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>
                    {booking.bookingDates?.[0]?.startTime
                      ? new Date(booking.bookingDates[0].startTime).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time:</span>
                  <span>
                    {booking.bookingDates?.[0]
                      ? `${new Date(
                          booking.bookingDates[0].startTime
                        ).toLocaleTimeString()} - ${new Date(
                          booking.bookingDates[0].endTime
                        ).toLocaleTimeString()}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment Status:</span>
                  <span className="font-semibold text-green-600">{booking.paymentStatus}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-primary">
                Hall Details
              </h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Hall Name:</span>
                  <span>{hall?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Location:</span>
                  <span>{hall?.location || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl lg:text-2xl font-bold text-gray-800">
                <span>Total Price:</span>
                <span>₦{booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t p-4 lg:p-0 lg:border-t-0 lg:mt-8 flex flex-col lg:flex-row justify-end gap-3 lg:gap-4 px-6 lg:px-10 pb-6 lg:pb-10">
          <button
            className="w-full lg:w-auto px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            onClick={handlePrint}
          >
            Print Receipt
          </button>
          <button
            className="w-full lg:w-auto px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            onClick={handleShare}
          >
            Share Details
          </button>
          <button
            className="hidden lg:block px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="lg:hidden w-full px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-lg transition-colors"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
