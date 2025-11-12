"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface LicenseTier {
  _id?: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  maxHalls: number;
}

interface TierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tier: LicenseTier) => void;
  tier?: Partial<LicenseTier>;
}

const TierModal: React.FC<TierModalProps> = ({ isOpen, onClose, onSubmit, tier }) => {
  const [formData, setFormData] = useState<Partial<LicenseTier>>({
    name: "",
    price: 0,
    durationInDays: 0,
    maxHalls: 0,
    features: [],
  });

  useEffect(() => {
    if (tier) {
      setFormData(tier);
    } else {
      setFormData({
        name: "",
        price: 0,
        durationInDays: 0,
        maxHalls: 0,
        features: [],
      });
    }
  }, [tier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, features: value.split('\\n') }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as LicenseTier);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{tier?._id ? "Edit License Tier" : "Add New License Tier"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">Duration (days)</label>
              <input
                type="number"
                name="durationInDays"
                value={formData.durationInDays}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Max Halls</label>
            <input
              type="number"
              name="maxHalls"
              value={formData.maxHalls}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Features (one per line)</label>
            <textarea
              name="features"
              value={formData.features?.join("\\n")}
              onChange={handleFeaturesChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
              rows={4}
            ></textarea>
          </div>
          <div className="flex justify-end mt-8">
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-primary hover:bg-opacity-90">
              {tier?._id ? "Save Changes" : "Create Tier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TierModal;
