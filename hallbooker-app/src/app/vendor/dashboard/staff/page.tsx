'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import StaffModal from '@/components/vendor/StaffModal';
import { useUI } from '@/context/UIContext';
import withAuth from '@/components/auth/withAuth';
import Swal from 'sweetalert2';
import { Loader2, Trash2, Edit, Plus } from 'lucide-react';

interface Staff {
  _id: string;
  fullName: string;
  email: string;
}

const StaffContent = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  const { isStaffModalOpen, openStaffModal, closeStaffModal } = useUI();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/my-staff');
      setStaff(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch staff members. You can still add a new one.');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (formData: any) => {
    Swal.fire({
      title: 'Adding Staff Member...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await api.post('/users/add-staff', formData);
      await fetchStaff();
      closeStaffModal();
      Swal.fire({
        title: 'Success!',
        text: 'Staff member added successfully.',
        icon: 'success',
        confirmButtonColor: '#4F46E5',
      });
    } catch (error) {
      console.error('Failed to add staff:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add staff member. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4F46E5',
      });
    }
  };

  const handleUpdateStaff = async (formData: any) => {
    // The API schema does not seem to support staff updates, but this is how you would do it.
    console.log("Updating staff not yet supported by this UI.", formData);
    closeStaffModal();
  }

  const handleRemoveStaff = async (staffId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove them!',
      cancelButtonText: 'No, cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Removing...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await api.delete(`/users/remove-staff/${staffId}`);
        Swal.fire({
          title: 'Removed!',
          text: 'Staff member has been removed.',
          icon: 'success',
          confirmButtonColor: '#4F46E5',
        });
        fetchStaff();
      } catch (error) {
        console.error('Failed to remove staff:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to remove staff member. Please try again.',
          icon: 'error',
          confirmButtonColor: '#4F46E5',
        });
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingStaff(undefined);
    openStaffModal();
  };

  const handleOpenEditModal = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    openStaffModal();
  };

  const filteredStaff = useMemo(() => {
    if (!searchTerm) return staff;
    return staff.filter(
      (member) =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Manage Staff</h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Add Staff
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading staff members...</p>
        </div>
      )}

      {error && <p className="text-red-600 mb-4 bg-red-50 p-4 rounded-lg border border-red-100">{error}</p>}

      {!loading && (
         <div className="bg-white p-4 shadow-lg rounded-lg">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Name</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Email</th>
                <th className="px-6 py-3 border-b-2 border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((member) => (
                  <tr key={member._id}>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{member.fullName}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{member.email}</td>
                    <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-500 text-gray-900">
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className="px-5 py-2 border-primary border text-primary rounded transition duration-300 hover:bg-primary hover:text-white focus:outline-none"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveStaff(member._id)}
                        className="ml-2 px-5 py-2 border-red-500 border text-red-500 rounded transition duration-300 hover:bg-red-500 hover:text-white focus:outline-none"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-600">
                    {!error && (searchTerm ? `No staff members found matching "${searchTerm}"` : "No staff members found. Add one to get started.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          closeStaffModal();
          setEditingStaff(undefined);
        }}
        onSubmit={editingStaff ? handleUpdateStaff : handleAddStaff}
        staff={editingStaff}
      />
    </div>
  );
};

const StaffPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <StaffContent />
  </Suspense>
);

export default withAuth(StaffPage, ['hall-owner']);
