"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import HallModal from "@/components/vendor/HallModal";
import ReservationModal from "@/components/vendor/ReservationModal";

interface Hall {
  id: string;
  name: string;
  location: string;
  capacity: number;
  isOnline: boolean;
  price: number;
}

const HallsPage = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [editingHall, setEditingHall] = useState<Hall | undefined>(undefined);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const response = await api.get("/halls/by-owner");
      setHalls(response.data.data);
    } catch (err) {
      setError('Failed to fetch your halls.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async (reservationData: any) => {
    try {
      await api.post(`/halls/${reservationData.hallId}/reservations`, reservationData);
      setIsReservationModalOpen(false);
      alert('Reservation created successfully!');
    } catch (error) {
      console.error('Failed to create reservation:', error);
      alert('Failed to create reservation.');
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  const handleCreate = async (formData: any) => {
    try {
      await api.post('/halls', formData);
      fetchHalls();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create hall:', error);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingHall) return;
    try {
      await api.put(`/halls/${editingHall.id}`, formData);
      fetchHalls();
      setIsModalOpen(false);
      setEditingHall(undefined);
    } catch (error) {
      console.error('Failed to update hall:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hall?')) {
      try {
        await api.delete(`/halls/${id}`);
        fetchHalls();
      } catch (error) {
        console.error('Failed to delete hall:', error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingHall(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (hall: Hall) => {
    setEditingHall(hall);
    setIsModalOpen(true);
  };

  const openReservationModal = (hallId: string) => {
    setSelectedHallId(hallId);
    setIsReservationModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Halls</h1>
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Create Hall
        </button>
      </div>
      <div className="bg-white p-4 shadow-lg rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {halls.map((hall) => (
              <tr key={hall.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {hall.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {hall.location}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {hall.capacity}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      hall.isOnline
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {hall.isOnline ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-500">
                  <button
                    onClick={() => openEditModal(hall)}
                    className="px-5 py-2 border-primary border text-primary rounded transition duration-300 hover:bg-primary hover:text-white focus:outline-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openReservationModal(hall.id)}
                    className="ml-2 px-5 py-2 border-yellow-500 border text-yellow-500 rounded transition duration-300 hover:bg-yellow-500 hover:text-white focus:outline-none"
                  >
                    Block Dates
                  </button>
                  <button
                    onClick={() => handleDelete(hall.id)}
                    className="ml-2 px-5 py-2 border-red-500 border text-red-500 rounded transition duration-300 hover:bg-red-500 hover:text-white focus:outline-none"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <HallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingHall ? handleUpdate : handleCreate}
        hall={editingHall}
      />
      {selectedHallId && (
        <ReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          onSubmit={handleCreateReservation}
          hallId={selectedHallId}
        />
      )}
    </div>
  );
};

export default HallsPage;
