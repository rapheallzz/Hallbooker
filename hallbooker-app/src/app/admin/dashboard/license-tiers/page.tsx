"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Edit, Trash, PlusCircle, ShieldCheck } from "lucide-react";

interface LicenseTier {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  maxHalls: number;
}

const LicenseTiersPage = () => {
  const [tiers, setTiers] = useState<LicenseTier[]>([]);
  const [loading, setLoading] = useState(true);

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

  const showTierForm = async (tier: Partial<LicenseTier> = {}) => {
    const { value: formValues } = await Swal.fire({
      title: tier._id ? 'Edit License Tier' : 'Add New License Tier',
      html:
        `<input id="swal-name" class="swal2-input" placeholder="Name" value="${tier.name || ''}">` +
        `<input id="swal-price" type="number" class="swal2-input" placeholder="Price" value="${tier.price || ''}">` +
        `<input id="swal-duration" type="number" class="swal2-input" placeholder="Duration (days)" value="${tier.durationInDays || ''}">` +
        `<input id="swal-maxHalls" type="number" class="swal2-input" placeholder="Max Halls" value="${tier.maxHalls || ''}">` +
        `<textarea id="swal-features" class="swal2-textarea" placeholder="Features (one per line)">${(tier.features || []).join('\n')}</textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: tier._id ? 'Save Changes' : 'Create Tier',
      preConfirm: () => {
        const name = (document.getElementById('swal-name') as HTMLInputElement).value;
        const price = (document.getElementById('swal-price') as HTMLInputElement).value;
        const durationInDays = (document.getElementById('swal-duration') as HTMLInputElement).value;
        const maxHalls = (document.getElementById('swal-maxHalls') as HTMLInputElement).value;
        const features = (document.getElementById('swal-features') as HTMLTextAreaElement).value.split('\n').filter(f => f.trim() !== '');

        if (!name || !price || !durationInDays || !maxHalls) {
          Swal.showValidationMessage(`Please fill out all fields`);
          return null;
        }

        return {
          name,
          price: parseInt(price, 10),
          durationInDays: parseInt(durationInDays, 10),
          maxHalls: parseInt(maxHalls, 10),
          features
        };
      }
    });

    return formValues;
  }

  const handleAddTier = async () => {
    const formValues = await showTierForm();
    if (formValues) {
      try {
        await api.post('/license-tiers', formValues);
        Swal.fire('Success!', 'New license tier created.', 'success');
        fetchTiers();
      } catch (error) {
        console.error("Error adding tier:", error);
        Swal.fire('Error', 'Could not create the new tier.', 'error');
      }
    }
  };

  const handleEditTier = async (tier: LicenseTier) => {
    const formValues = await showTierForm(tier);
    if (formValues) {
      try {
        await api.patch(`/license-tiers/${tier._id}`, formValues);
        Swal.fire('Success!', 'License tier updated.', 'success');
        fetchTiers();
      } catch (error) {
        console.error("Error updating tier:", error);
        Swal.fire('Error', 'Could not update the tier.', 'error');
      }
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
            <div
              key={tier._id}
              className="bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg rounded-xl flex flex-col transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl"
            >
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-gray-800">{tier.name}</h2>
                        <span className="bg-primary/10 text-primary font-semibold text-xs px-3 py-1 rounded-full">
                            {tier.maxHalls} Halls
                        </span>
                    </div>
                    <p className="text-4xl font-extrabold text-primary my-4">${tier.price}<span className="text-lg font-medium text-gray-500">/{tier.durationInDays} days</span></p>

                    <p className="text-sm font-semibold text-gray-500 mb-3">FEATURES</p>
                    <ul className="space-y-2">
                        {Array.isArray(tier.features) && tier.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                                <ShieldCheck className="text-green-500 mr-3" size={18}/>
                                <span className="text-gray-700 text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button onClick={() => handleEditTier(tier)} className="text-gray-400 hover:text-indigo-600 transition-colors"><Edit size={20} /></button>
                    <button onClick={() => handleDeleteTier(tier._id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash size={20} /></button>
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
