"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { PlusCircle } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
}

// Assuming the subaccount object structure.
// The API docs don't specify a GET endpoint, so this is for potential future use.
interface Subaccount {
    _id: string;
    userId: string;
    percentageCharge: number;
    // other relevant fields
}

const SubaccountsPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  // Subaccounts state for future display/management functionality
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [percentageCharge, setPercentageCharge] = useState<number | ''>('');

  useEffect(() => {
    const fetchHallOwners = async () => {
      try {
        // Fetch all users and then filter for hall owners client-side.
        // A dedicated endpoint would be more efficient.
        const response = await api.get('/users?role=hall-owner');
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching hall owners:", error);
        Swal.fire("Error", "Could not fetch hall owners for subaccount creation.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchHallOwners();
    // In a real-world scenario, you'd also fetch existing subaccounts here.
  }, []);

  const handleCreateSubaccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || percentageCharge === '') {
        Swal.fire('Validation Error', 'Please select a hall owner and set a percentage charge.', 'error');
        return;
    }

    Swal.fire({
        title: 'Creating Subaccount...',
        didOpen: () => {
            Swal.showLoading();
        },
        allowOutsideClick: false
    });

    try {
        const payload = {
            userId: selectedUserId,
            percentageCharge: Number(percentageCharge),
        };
        await api.post('/subaccounts', payload);

        Swal.fire('Success!', 'Subaccount created successfully.', 'success');
        // Reset form
        setSelectedUserId('');
        setPercentageCharge('');
        // Here you would typically refetch the list of subaccounts
    } catch (error: any) {
        console.error("Error creating subaccount:", error);
        const errorMessage = error.response?.data?.message || 'Could not create the subaccount.';
        Swal.fire('Error', errorMessage, 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Manage Subaccounts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Subaccount Form */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-lg rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Subaccount</h2>
                <form onSubmit={handleCreateSubaccount} className="space-y-4">
                    <div>
                        <label htmlFor="hallOwner" className="block text-sm font-medium text-gray-700">Hall Owner</label>
                        <select
                            id="hallOwner"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            required
                        >
                            <option value="" disabled>Select a hall owner</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>{user.fullName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="percentageCharge" className="block text-sm font-medium text-gray-700">Percentage Charge (%)</label>
                        <input
                            type="number"
                            id="percentageCharge"
                            value={percentageCharge}
                            onChange={(e) => setPercentageCharge(Number(e.target.value))}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., 10"
                            min="0"
                            max="100"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90"
                    >
                        <PlusCircle size={20} />
                        <span>Create Subaccount</span>
                    </button>
                </form>
            </div>
        </div>

        {/* Display Subaccounts (Future implementation) */}
        <div className="lg:col-span-2">
            <div className="bg-white p-6 shadow-lg rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Existing Subaccounts</h2>
                <div className="text-center py-12 text-gray-500">
                    <p>Display and management of existing subaccounts will be available here in a future update.</p>
                </div>
                {/* A table or list of subaccounts would go here */}
            </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SubaccountsPage, ["super-admin"]);
