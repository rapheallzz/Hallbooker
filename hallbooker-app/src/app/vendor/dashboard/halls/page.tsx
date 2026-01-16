"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import HallModal from "@/components/vendor/HallModal";
import ReservationModal from "@/components/vendor/ReservationModal";
import { useUI } from "@/context/UIContext";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";

interface Hall {
  id: string;
  name: string;
  location: string;
  capacity: number;
  isOnline: boolean;
  price: number;
  demoBookings: number;
  views: number;
  pricing: {
    dailyRate?: number;
    hourlyRate?: number;
  };
  geoLocation: {
    address: string;
  };
  hallSize: string;
  carParkCapacity: number;
}

const HallsContent = () => {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingHall, setEditingHall] = useState<Hall | undefined>(undefined);
  const [subscription, setSubscription] = useState<any>(null);
  const { isHallModalOpen, openHallModal, closeHallModal } = useUI();
  const [expandedHallId, setExpandedHallId] = useState<string | null>(null);

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const response = await api.get("/halls/by-owner");
      setHalls(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch your halls. You can still create a new one.');
      setHalls([]); // Ensure halls is an empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hallsResponse, subscriptionResponse] = await Promise.all([
          api.get("/halls/by-owner"),
          api.get("/licenses/my-subscription").catch(() => ({ data: { data: null } })),
        ]);
        setHalls(hallsResponse.data.data);
        setSubscription(subscriptionResponse.data.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        setHalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreate = async (formData: any) => {
    Swal.fire({
      title: 'Creating Hall...',
      text: 'Please wait while we set up your new hall.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await api.post('/halls', formData);
      Swal.fire({
        icon: 'success',
        title: 'Hall Created!',
        text: 'Your new hall has been created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      fetchHalls();
      closeHallModal();
    } catch (error) {
      console.error('Failed to create hall:', error);
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: 'Something went wrong. Please try again.',
      });
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingHall) return;

    Swal.fire({
      title: 'Updating Hall...',
      text: 'Please wait while we save the changes.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await api.patch(`/halls/${editingHall.id}`, formData);
      Swal.fire({
        icon: 'success',
        title: 'Hall Updated!',
        text: 'The hall details have been successfully updated.',
        timer: 2000,
        showConfirmButton: false,
      });
      fetchHalls();
      closeHallModal();
      setEditingHall(undefined);
    } catch (error) {
      console.error('Failed to update hall:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Something went wrong. Please try again.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/halls/${id}`);
        Swal.fire(
          'Deleted!',
          'The hall has been deleted.',
          'success'
        );
        fetchHalls();
      } catch (error) {
        console.error('Failed to delete hall:', error);
        Swal.fire(
          'Error!',
          'Failed to delete the hall. Please try again.',
          'error'
        );
      }
    }
  };

  const handleCreateReservation = async (reservationData: any) => {
    Swal.fire({
      title: 'Creating Reservation...',
      text: 'Please wait while we block the dates.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await api.post(`/halls/${reservationData.hallId}/reservations`, reservationData);
      setIsReservationModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Reservation Created!',
        text: 'The dates have been successfully blocked.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Failed to create reservation:', error);
      Swal.fire({
        icon: 'error',
        title: 'Reservation Failed',
        text: 'Something went wrong. Please try again.',
      });
    }
  };

  const openEditModal = (hall: Hall) => {
    setEditingHall(hall);
    openHallModal();
  };

  const openReservationModal = (hallId: string) => {
    setSelectedHallId(hallId);
    setIsReservationModalOpen(true);
  };

  const handleToggle = (hallId: string) => {
    setExpandedHallId(expandedHallId === hallId ? null : hallId);
  };

  const handleOpenCreateModal = () => {
    if (subscription && halls.length >= subscription.tier.maxHalls) {
      Swal.fire({
        title: 'Upgrade Required',
        text: `You have reached the maximum number of halls (${subscription.tier.maxHalls}) for your current plan.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Upgrade Now',
        cancelButtonText: 'Later',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/vendor/dashboard/settings?tab=licenses');
        }
      });
    } else {
      setEditingHall(undefined);
      openHallModal();
    }
  };

  const filteredHalls = useMemo(() => {
    if (!searchTerm) return halls;
    return halls.filter(
      (hall) =>
        hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hall.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hall.geoLocation?.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [halls, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Halls</h1>
        {user?.activeRole === "hall-owner" && (
          <button
            onClick={handleOpenCreateModal}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Create Hall
          </button>
        )}
      </div>

      {loading && <div>Loading halls...</div>}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && (
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Name</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Location</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Capacity</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Views</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Demo Bookings</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Actions</th>
                <th className="px-6 py-3 border-b-2 border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {filteredHalls.length > 0 ? (
                filteredHalls.map((hall) => (
                  <React.Fragment key={hall.id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{hall.name}</td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{hall.location}</td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{hall.capacity}</td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{hall.views || 0}</td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{hall.demoBookings}</td>
                      <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-500 text-gray-900">
                        <button onClick={() => openEditModal(hall)} className="px-5 py-2 border-primary border text-primary rounded transition duration-300 hover:bg-primary hover:text-white focus:outline-none">Edit</button>
                        <button
                          onClick={() => openReservationModal(hall.id)}
                          className="ml-2 px-3 py-2 border-yellow-500 border text-yellow-500 rounded transition duration-300 hover:bg-yellow-500 hover:text-white focus:outline-none"
                          title="Block Dates"
                        >
                          <CalendarIcon size={18} />
                        </button>
                        {user?.activeRole === "hall-owner" && (
                          <button onClick={() => handleDelete(hall.id)} className="ml-2 px-5 py-2 border-red-500 border text-red-500 rounded transition duration-300 hover:bg-red-500 hover:text-white focus:outline-none">Delete</button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap text-center border-b border-gray-500">
                        <button onClick={() => handleToggle(hall.id)} className="focus:outline-none">
                          <ChevronDown
                            className={`transform transition-transform duration-200 ${
                              expandedHallId === hall.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                    {expandedHallId === hall.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="font-semibold text-gray-800">Pricing:</p>
                              <p className="text-gray-600">
                                Daily: ₦{hall.pricing?.dailyRate?.toLocaleString() || 'N/A'} | Hourly: ₦{hall.pricing?.hourlyRate?.toLocaleString() || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Hall Size:</p>
                              <p className="text-gray-600">{hall.hallSize || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Parking Capacity:</p>
                              <p className="text-gray-600">{hall.carParkCapacity ? `${hall.carParkCapacity} cars` : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Full Address:</p>
                              <p className="text-gray-600">{hall.geoLocation?.address || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    {!error && (searchTerm ? `No halls found matching "${searchTerm}"` : "No halls found. Create one to get started.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <HallModal
        isOpen={isHallModalOpen}
        onClose={() => {
          closeHallModal();
          setEditingHall(undefined);
        }}
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

const HallsPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HallsContent />
  </Suspense>
);

export default HallsPage;
