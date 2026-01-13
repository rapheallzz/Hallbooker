
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';
import Swal from 'sweetalert2';

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string; // This should be the public-facing reservation ID (e.g., "RES-...")
  onSuccess: () => void;
}

const ConversionModal: React.FC<ConversionModalProps> = ({ isOpen, onClose, reservationId, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('online');

  const handleSubmit = async () => {
    Swal.fire({
      title: 'Converting Reservation...',
      text: 'Please wait.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const payload = paymentMethod === 'online' ? {} : { paymentMethod };
      const response = await api.post(`/reservations/${reservationId}/convert`, payload);

      if (paymentMethod === 'online') {
        Swal.fire({
          icon: 'success',
          title: 'Payment Link Generated!',
          text: `Share this link with the customer: ${response.data.data.paymentLink}`,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Reservation Converted!',
          text: 'The reservation has been successfully converted to a booking.',
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Conversion Failed',
        text: error.response?.data?.message || 'An unexpected error occurred.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Convert to Booking</h2>
        <div>
          <label className="block text-sm font-medium text-gray-800">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
          >
            <option value="online">Generate Payment Link</option>
            <option value="CASH">Cash</option>
            <option value="POS">POS</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>
        <div className="flex justify-end mt-8">
          <button onClick={handleSubmit} className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark">
            Confirm Conversion
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionModal;
