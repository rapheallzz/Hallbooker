"use client";
import React, { useState, useEffect, useMemo } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Search, Trash, Edit, Power, PowerOff, Eye } from "lucide-react";
import Link from "next/link";

interface Hall {
  _id: string;
  name: string;
  location: string;
  owner: {
    fullName: string;
  };
  isOnlineBookingEnabled: boolean;
  // Add any other relevant hall properties
}

const HallsPage = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(""); // "all", "enabled", "disabled"

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    setLoading(true);
    try {
      const response = await api.get("/halls");
      setHalls(response.data.data);
    } catch (error) {
      console.error("Error fetching halls:", error);
      Swal.fire("Error", "Could not fetch halls.", "error");
    } finally {
      setLoading(false);
    }
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
            fetchHalls(); // Refresh data
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
        fetchHalls(); // Refresh data
      } catch (error) {
        console.error("Error deleting hall:", error);
        Swal.fire('Error', 'Could not delete the hall.', 'error');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Manage Halls</h1>
      <div className="bg-white p-6 shadow-lg rounded-lg">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-1/3">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, location, owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
            </div>
            <div className="w-full md:w-1/4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Booking Statuses</option>
                    <option value="enabled">Booking Enabled</option>
                    <option value="disabled">Booking Disabled</option>
                </select>
            </div>
        </div>
        {/* Halls Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Online Booking</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHalls.map((hall) => (
                <tr key={hall._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{hall.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hall.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hall.owner.fullName}</td>
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
    </div>
  );
};

export default withAuth(HallsPage, ["super-admin"]);
