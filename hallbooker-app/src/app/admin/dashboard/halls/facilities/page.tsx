"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Edit, Trash, PlusCircle } from "lucide-react";

interface Facility {
  _id: string;
  name: string;
}

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const response = await api.get("/facilities");
      setFacilities(response.data.data);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      Swal.fire("Error", "Could not fetch facilities.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFacility = async () => {
    const { value: name } = await Swal.fire({
      title: 'Add a new facility',
      input: 'text',
      inputLabel: 'Facility Name',
      inputPlaceholder: 'e.g., Air Conditioning',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!'
        }
      }
    });

    if (name) {
      try {
        await api.post('/facilities', { name });
        Swal.fire('Success!', 'Facility added successfully.', 'success');
        fetchFacilities();
      } catch (error) {
        console.error("Error adding facility:", error);
        Swal.fire('Error', 'Could not add the facility.', 'error');
      }
    }
  };

  const handleEditFacility = async (facility: Facility) => {
    const { value: name } = await Swal.fire({
      title: 'Edit facility',
      input: 'text',
      inputValue: facility.name,
      inputLabel: 'Facility Name',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!'
        }
      }
    });

    if (name && name !== facility.name) {
      try {
        await api.patch(`/facilities/${facility._id}`, { name });
        Swal.fire('Success!', 'Facility updated successfully.', 'success');
        fetchFacilities();
      } catch (error) {
        console.error("Error updating facility:", error);
        Swal.fire('Error', 'Could not update the facility.', 'error');
      }
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/facilities/${facilityId}`);
            Swal.fire('Deleted!', 'The facility has been deleted.', 'success');
            fetchFacilities();
        } catch (error) {
            console.error("Error deleting facility:", error);
            Swal.fire('Error', 'Could not delete the facility.', 'error');
        }
    }
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Facilities</h1>
        <button
            onClick={handleAddFacility}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90"
        >
          <PlusCircle size={20} />
          <span>Add Facility</span>
        </button>
      </div>
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facilities.map((facility) => (
                <tr key={facility._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{facility.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditFacility(facility)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteFacility(facility._id)} className="text-red-600 hover:text-red-900">
                        <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {facilities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
                No facilities found. Click "Add Facility" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(FacilitiesPage, ["super-admin"]);
