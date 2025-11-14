"use client";
import React, { useState, useEffect, useMemo } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Search, Trash, Edit, Power, PowerOff, Eye, PlusCircle } from "lucide-react";
import Link from "next/link";
import HallModal from "@/components/vendor/HallModal";
import Tabs from "@/components/admin/Tabs"; // New Import

// Hall Interface
interface Hall {
  _id: string;
  name: string;
  location: string;
  owner: {
    fullName: string;
  };
  isOnlineBookingEnabled: boolean;
}

// Facility Interface
interface Facility {
  _id: string;
  name: string;
}

const HallManagementPage = () => {
  // Common State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("halls");

  // Halls State
  const [halls, setHalls] = useState<Hall[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | undefined>(undefined);

  // Facilities State
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchHalls(), fetchFacilities()]);
        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire("Error", "Could not fetch all necessary data.", "error");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // Halls Functions
  const fetchHalls = () => {
    return api.get("/halls")
      .then(response => {
        setHalls(response.data.data);
      })
      .catch(error => {
        console.error("Error fetching halls:", error);
        throw error; // Re-throw to be caught by Promise.all
      });
  };

  const filteredHalls = useMemo(() => {
    return halls
      .filter(hall => {
        if (statusFilter === "enabled") return hall.isOnlineBookingEnabled;
        if (statusFilter === "disabled") return !hall.isOnlineBookingEnabled;
        return true;
      })
      .filter(hall =>
        hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hall.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hall.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [halls, searchTerm, statusFilter]);

  const handleToggleBooking = async (hallId: string, currentState: boolean) => {
    const action = currentState ? "disable" : "enable";
    const result = await Swal.fire({
        title: `Are you sure you want to ${action} online booking?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, ${action} it!`,
    });

    if (result.isConfirmed) {
        try {
            await api.patch(`/halls/${hallId}/toggle-online-booking`);
            Swal.fire('Success!', `Online booking has been ${action}d.`, 'success');
            fetchHalls();
        } catch (error) {
            console.error(`Error toggling online booking:`, error);
            Swal.fire('Error', `Could not ${action} online booking.`, 'error');
        }
    }
  };

  const handleDeleteHall = async (hallId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the hall and all its data!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/halls/${hallId}`);
        Swal.fire('Deleted!', 'The hall has been deleted.', 'success');
        fetchHalls();
      } catch (error) {
        console.error("Error deleting hall:", error);
        Swal.fire('Error', 'Could not delete the hall.', 'error');
      }
    }
  };

  const handleCreateHall = async (formData: any) => {
    try {
      await api.post('/halls', formData);
      fetchHalls();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create hall:', error);
    }
  };

  const handleUpdateHall = async (formData: any) => {
    if (!editingHall) return;
    try {
      await api.put(`/halls/${editingHall._id}`, formData);
      fetchHalls();
      setIsModalOpen(false);
      setEditingHall(undefined);
    } catch (error) {
      console.error('Failed to update hall:', error);
    }
  };

  const openEditModal = (hall: Hall) => {
    setEditingHall(hall);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingHall(undefined);
    setIsModalOpen(true);
  };

  // Facilities Functions
  const fetchFacilities = () => {
    return api.get("/facilities")
      .then(response => {
        setFacilities(response.data.data);
      })
      .catch(error => {
        console.error("Error fetching facilities:", error);
        throw error; // Re-throw to be caught by Promise.all
      });
  };

  const handleAddFacility = async () => {
    const { value: name } = await Swal.fire({
      title: 'Add a new facility',
      input: 'text',
      inputLabel: 'Facility Name',
      inputPlaceholder: 'e.g., Air Conditioning',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'You need to write something!'
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
        if (!value) return 'You need to write something!'
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

  const tabs = [
      { label: "Halls", value: "halls" },
      { label: "Facilities", value: "facilities" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Conditionally render HallModal only for the halls tab */}
      {activeTab === 'halls' && (
        <HallModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingHall(undefined);
          }}
          onSubmit={editingHall ? handleUpdateHall : handleCreateHall}
          hall={editingHall}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Hall Management</h1>
        {activeTab === 'halls' && (
             <button
                onClick={handleOpenCreateModal}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90"
             >
                <PlusCircle size={20} />
                <span>Create Hall</span>
             </button>
        )}
        {activeTab === 'facilities' && (
            <button
                onClick={handleAddFacility}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90"
            >
                <PlusCircle size={20} />
                <span>Add Facility</span>
            </button>
        )}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-8">
        {activeTab === 'halls' && (
            <div className="bg-white p-6 shadow-lg rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-1/3">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, location, owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                        />
                    </div>
                    <div className="w-full md:w-1/4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full p-2 border border-gray-400 rounded-md"
                        >
                            <option value="">All Booking Statuses</option>
                            <option value="enabled">Booking Enabled</option>
                            <option value="disabled">Booking Disabled</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Online Booking</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                    {filteredHalls.map((hall) => (
                        <tr key={hall._id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{hall.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{hall.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{hall.owner.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                hall.isOnlineBookingEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {hall.isOnlineBookingEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/halls/${hall._id}`} passHref>
                                <button title="View Hall" className="text-blue-600 hover:text-blue-900 mr-3"><Eye size={18} /></button>
                            </Link>
                            <button onClick={() => openEditModal(hall)} title="Edit Hall" className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit size={18} /></button>
                            <button
                                onClick={() => handleToggleBooking(hall._id, hall.isOnlineBookingEnabled)}
                                title={hall.isOnlineBookingEnabled ? "Disable Booking" : "Enable Booking"}
                                className="text-yellow-600 hover:text-yellow-900 mr-3"
                            >
                                {hall.isOnlineBookingEnabled ? <PowerOff size={18} /> : <Power size={18} />}
                            </button>
                            <button onClick={() => handleDeleteHall(hall._id)} title="Delete Hall" className="text-red-600 hover:text-red-900">
                                <Trash size={18} />
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        )}
        {activeTab === 'facilities' && (
             <div className="bg-white p-6 shadow-lg rounded-lg">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
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
        )}
      </div>
    </div>
  );
};

export default withAuth(HallManagementPage, ["super-admin"]);
