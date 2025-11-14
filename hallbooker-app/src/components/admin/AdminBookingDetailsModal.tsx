"use client";
import React from 'react';
import { X } from 'lucide-react';

interface Booking {
  _id: string;
  bookingId: string;
  hall: string;
  user: string;
  startTime: string;
  status: "pending" | "confirmed" | "cancelled";
  totalPrice: number;
}

interface Hall {
  _id: string;
  name: string;
}

interface AdminBookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  halls: Hall[];
}

const AdminBookingDetailsModal: React.FC<AdminBookingDetailsModalProps> = ({ isOpen, onClose, booking, halls }) => {
  if (!isOpen) return null;

  const hallName = halls.find(h => h._id === booking.hall)?.name || 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800">Booking ID</h3>
            <p className="text-gray-900">{booking.bookingId}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Hall</h3>
            <p className="text-gray-900">{hallName}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">User ID</h3>
            <p className="text-gray-900">{booking.user}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Date</h3>
            <p className="text-gray-900">{new Date(booking.startTime).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Total Price</h3>
            <p className="text-gray-900">${booking.totalPrice.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Status</h3>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
            }`}>
                {booking.status}
            </span>
          </div>
        </div>
        <div className="flex justify-end mt-8">
            <button onClick={onClose} className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingDetailsModal;
