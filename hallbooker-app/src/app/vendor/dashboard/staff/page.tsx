'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import StaffModal from '@/components/vendor/StaffModal';
import { useUI } from '@/context/UIContext';

interface Staff {
  id: string;
  fullName: string;
  email: string;
}

const StaffPage = () => {
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
    try {
      await api.post('/users/add-staff', formData);
      fetchStaff();
      closeStaffModal();
    } catch (error) {
      console.error('Failed to add staff:', error);
    }
  };

  const handleUpdateStaff = async (formData: any) => {
    // The API schema does not seem to support staff updates, but this is how you would do it.
    console.log("Updating staff not yet supported by this UI.", formData);
    closeStaffModal();
  }

  const handleRemoveStaff = async (staffId: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        await api.delete(`/users/remove-staff/${staffId}`);
        fetchStaff();
      } catch (error) {
        console.error('Failed to remove staff:', error);
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

      {loading && <p>Loading staff...</p>}

      {error && <p className="text-red-600 mb-4">{error}</p>}

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
              {staff.length > 0 ? (
                staff.map((member) => (
                  <tr key={member.id}>
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
                        onClick={() => handleRemoveStaff(member.id)}
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
                    {!error && "No staff members found. Add one to get started."}
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

export default StaffPage;
