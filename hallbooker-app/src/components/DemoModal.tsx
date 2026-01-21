import React from 'react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  whatsappNumber: string;
  address?: string;
}

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, phone, whatsappNumber, address }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4">Owner Contact Details</h2>
        <p className="mb-2">
          <strong>Phone:</strong> {phone}
        </p>
        <p className="mb-2">
          <strong>WhatsApp:</strong> {whatsappNumber}
        </p>
        {address && (
          <p className="mb-4">
            <strong>Address:</strong> {address}
          </p>
        )}
        <button
          onClick={onClose}
          className="w-full bg-[#295FA7] hover:bg-[#204a8a] text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DemoModal;
