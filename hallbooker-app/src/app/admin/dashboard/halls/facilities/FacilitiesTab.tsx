"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import Swal from "sweetalert2";
import { PlusCircle, Edit, Trash } from "lucide-react";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface Facility {
  _id: string;
  name: string;
}

const FacilitiesTab = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [facilityName, setFacilityName] = useState("");

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

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingFacility ? `/facilities/${editingFacility._id}` : "/facilities";
    const method = editingFacility ? "put" : "post";

    try {
      await api[method](url, { name: facilityName });
      Swal.fire("Success", `Facility ${editingFacility ? "updated" : "created"} successfully!`, "success");
      fetchFacilities();
      closeModal();
    } catch (error) {
      console.error(`Error ${editingFacility ? "updating" : "creating"} facility:`, error);
      Swal.fire("Error", `Could not ${editingFacility ? "update" : "create"} facility.`, "error");
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the facility!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
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

  const openEditModal = (facility: Facility) => {
    setEditingFacility(facility);
    setFacilityName(facility.name);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingFacility(null);
    setFacilityName("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFacility(null);
    setFacilityName("");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg">
      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90"
        >
          <PlusCircle size={20} />
          <span>Add Facility</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{editingFacility ? "Edit" : "Create"} Facility</h2>
            <form onSubmit={handleModalSubmit}>
              <input
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="Facility Name"
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <div className="flex justify-end mt-6">
                <button type="button" onClick={closeModal} className="mr-4 px-4 py-2 rounded-lg text-gray-600 bg-gray-200 hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-opacity-90">
                  {editingFacility ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Facility Name
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facilities.map((facility) => (
              <tr key={facility._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {facility.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openEditModal(facility)} title="Edit Facility" className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeleteFacility(facility._id)} title="Delete Facility" className="text-red-600 hover:text-red-900">
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacilitiesTab;
