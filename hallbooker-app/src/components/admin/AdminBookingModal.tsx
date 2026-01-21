
'use client';

import SharedBookingModal from '../shared/SharedBookingModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Record<string, unknown>, type: string) => void;
}

const AdminBookingModal: React.FC<BookingModalProps> = (props) => {
  return <SharedBookingModal {...props} userRole="admin" />;
};

export default AdminBookingModal;
