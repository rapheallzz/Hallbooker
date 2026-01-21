"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import HallModal from "@/components/vendor/HallModal";
import ReservationModal from "@/components/vendor/ReservationModal";
import { useUI } from "@/context/UIContext";
import { Calendar as CalendarIcon, ChevronDown, Edit, Trash2 } from "lucide-react";
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

interface Subscription {
  tier: {
    maxHalls: number;
    name: string;
  };
  status: string;
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
  const [subscription, setSubscription] = useState<Subscription | null>(null);
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
      console.error(err);
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
        console.error(err);
        setError('Failed to fetch data. Please try again.');
        setHalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreate = async (formData: Record<string, unknown>) => {
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

  const handleUpdate = async (formData: Record<string, unknown>) => {
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

  const handleCreateReservation = async (reservationData: Record<string, unknown>) => {
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
        hall.geoLocation?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [halls, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">Halls</h1>
        {user?.activeRole === "hall-owner" && (
          <button
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:bg-primary-dark transition-colors"
          >
            Create Hall
          </button>
        )}
      </div>

      {loading && <div className="text-center py-10">Loading halls...</div>}

      {error && <p className="text-red-600 mb-4 bg-red-50 p-4 rounded-lg border border-red-100">{error}</p>}

      {!loading && (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Demo Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHalls.length > 0 ? (
                  filteredHalls.map((hall) => (
                    <React.Fragment key={hall.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hall.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hall.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hall.capacity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hall.views || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hall.demoBookings}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(hall)}
                              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                              title="Edit Hall"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => openReservationModal(hall.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                              title="Block Dates"
                            >
                              <CalendarIcon size={18} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button onClick={() => handleToggle(hall.id)} className="p-1 text-gray-400 hover:text-gray-600">
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
                          <td colSpan={7} className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pricing</p>
                                <p className="text-sm text-gray-700">
                                  Daily: ₦{hall.pricing?.dailyRate?.toLocaleString() || 'N/A'}<br/>
                                  Hourly: ₦{hall.pricing?.hourlyRate?.toLocaleString() || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Hall Size</p>
                                <p className="text-sm text-gray-700">{hall.hallSize || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Parking</p>
                                <p className="text-sm text-gray-700">{hall.carParkCapacity ? `${hall.carParkCapacity} cars` : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Full Address</p>
                                <p className="text-sm text-gray-700 line-clamp-2">{hall.geoLocation?.address || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                      {searchTerm ? `No halls found matching "${searchTerm}"` : "No halls found. Create one to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredHalls.length > 0 ? (
              filteredHalls.map((hall) => (
                <div key={hall.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{hall.name}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditModal(hall)}
                          className="p-2 text-primary bg-primary/5 rounded-lg"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openReservationModal(hall.id)}
                          className="p-2 text-yellow-600 bg-yellow-50 rounded-lg"
                        >
                          <CalendarIcon size={18} />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <span className="truncate">{hall.location}</span>
                    </p>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100">
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Capacity</p>
                        <p className="text-sm font-bold text-gray-800">{hall.capacity}</p>
                      </div>
                      <div className="text-center border-x border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Views</p>
                        <p className="text-sm font-bold text-gray-800">{hall.views || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Demos</p>
                        <p className="text-sm font-bold text-gray-800">{hall.demoBookings}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(hall.id)}
                      className="w-full mt-3 flex items-center justify-center text-xs font-medium text-gray-500 py-1"
                    >
                      {expandedHallId === hall.id ? 'Show Less' : 'Show More Details'}
                      <ChevronDown
                        size={16}
                        className={`ml-1 transform transition-transform duration-200 ${
                          expandedHallId === hall.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {expandedHallId === hall.id && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 pt-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Pricing Details</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Daily Rate:</span>
                          <span className="font-bold text-gray-800">₦{hall.pricing?.dailyRate?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">Hourly Rate:</span>
                          <span className="font-bold text-gray-800">₦{hall.pricing?.hourlyRate?.toLocaleString() || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2">
                        <span className="text-gray-600">Hall Size:</span>
                        <span className="font-bold text-gray-800">{hall.hallSize || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2">
                        <span className="text-gray-600">Parking Capacity:</span>
                        <span className="font-bold text-gray-800">{hall.carParkCapacity ? `${hall.carParkCapacity} cars` : 'N/A'}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Full Address</p>
                        <p className="text-xs text-gray-700 leading-relaxed">{hall.geoLocation?.address || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-10 text-center text-gray-500 border border-dashed border-gray-300">
                 {searchTerm ? `No halls found matching "${searchTerm}"` : "No halls found. Create one to get started."}
              </div>
            )}
          </div>
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
