"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Edit, Trash, PlusCircle, ShieldCheck } from "lucide-react";
import TierModal from "@/components/admin/TierModal";
import Swal from "sweetalert2";

interface LicenseTier {
  _id?: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  maxHalls: number;
}

const LicenseTiersPage = () => {
  const [tiers, setTiers] = useState<LicenseTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Partial<LicenseTier> | undefined>(undefined);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/license-tiers");
      setTiers(response.data.data);
    } catch (error) {
      console.error("Error fetching license tiers:", error);
      Swal.fire("Error", "Could not fetch license tiers.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTier = () => {
    setSelectedTier(undefined);
    setIsModalOpen(true);
  };

  const handleEditTier = (tier: LicenseTier) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (tier: LicenseTier) => {
    try {
      if (tier._id) {
        await api.patch(`/license-tiers/${tier._id}`, tier);
        Swal.fire('Success!', 'License tier updated.', 'success');
      } else {
        await api.post('/license-tiers', tier);
        Swal.fire('Success!', 'New license tier created.', 'success');
      }
      fetchTiers();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving tier:", error);
      Swal.fire('Error', 'Could not save the tier.', 'error');
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the license tier.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/license-tiers/${tierId}`);
        Swal.fire('Deleted!', 'The license tier has been deleted.', 'success');
        fetchTiers();
      } catch (error) {
        console.error("Error deleting tier:", error);
        Swal.fire('Error', 'Could not delete the tier.', 'error');
      }
    }
  };


  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <TierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        tier={selectedTier}
      />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage License Tiers</h1>
        <button
            onClick={handleAddTier}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90"
        >
          <PlusCircle size={20} />
          <span>Add New Tier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tiers.map(tier => (
            <div key={tier._id} className="bg-white p-6 shadow-lg rounded-lg flex flex-col">
                <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{tier.name}</h2>
                    <p className="text-4xl font-extrabold text-primary mb-4">${tier.price}<span className="text-lg font-medium text-gray-500">/{tier.durationInDays} days</span></p>
                    <p className="text-sm text-gray-600 mb-4">Up to <span className="font-bold">{tier.maxHalls}</span> halls.</p>
                    <ul className="space-y-2">
                        {tier.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                                <ShieldCheck className="text-green-500 mr-2" size={18}/>
                                <span className="text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button onClick={() => handleEditTier(tier)} className="text-indigo-600 hover:text-indigo-900"><Edit size={20} /></button>
                    <button onClick={() => handleDeleteTier(tier._id)} className="text-red-600 hover:text-red-900"><Trash size={20} /></button>
                </div>
            </div>
        ))}
      </div>

      {tiers.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
            <h3 className="text-lg font-medium">No license tiers found.</h3>
            <p>Click "Add New Tier" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default withAuth(LicenseTiersPage, ["super-admin"]);
