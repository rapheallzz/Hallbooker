'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import StaffModal from '@/components/vendor/StaffModal';

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const StaffPage = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/my-staff');
      setStaff(response.data.data);
    } catch (err) {
      setError('Failed to fetch staff members.');
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
      fetchStaff(); // Refresh the list
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add staff:', error);
      // You can set an error state here to display in the UI
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        await api.delete(`/users/remove-staff/${staffId}`);
        fetchStaff(); // Refresh the list
      } catch (error) {
        console.error('Failed to remove staff:', error);
      }
    }
  };

  if (loading) return <p>Loading staff...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Manage Staff</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Add Staff
        </button>
      </div>

      <div className="bg-white p-4 shadow-lg rounded-lg">
        {staff.length === 0 ? (
          <p>No staff members found.</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Name</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Email</th>
                <th className="px-6 py-3 border-b-2 border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">{`${member.firstName} ${member.lastName}`}</td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">{member.email}</td>
                  <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-500">
                    <button
                      onClick={() => handleRemoveStaff(member.id)}
                      className="px-5 py-2 border-red-500 border text-red-500 rounded transition duration-300 hover:bg-red-500 hover:text-white focus:outline-none"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStaff}
      />
    </div>
  );
};

export default StaffPage;
