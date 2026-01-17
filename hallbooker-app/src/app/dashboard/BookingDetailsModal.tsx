
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
        text: `Check out my booking details:\nBooking ID: ${
          booking.bookingId
        }\nEvent: ${booking.eventDetails}\nHall: ${booking.hall?.name || "N/A"}`,
        url: window.location.href,
      }).catch((error) => console.error("Error sharing", error));
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-11/12 md:w-1/2 max-w-2xl shadow-xl">
        <div id="booking-details-content">
          <h2 className="text-3xl font-bold mb-6 text-center border-b pb-4 text-gray-800">Booking Receipt</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-primary">Booking Information</h3>
              <div className="space-y-2 text-gray-700">
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
                  <span>{booking.hall?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Location:</span>
                  <span>{booking.hall?.location || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-2xl font-bold text-gray-800">
                <span>Total Price:</span>
                <span>₦{booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={handlePrint}
          >
            Print
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            onClick={handleShare}
          >
            Share
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
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
