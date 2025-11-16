import React from "react";
import { CheckCircle } from 'lucide-react';

interface LicenseTier {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  maxHalls: number;
}

interface SubscriptionCardProps {
  tier: LicenseTier;
  isCurrent: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ tier, isCurrent, isRecommended, onSelect }) => {
  return (
    <div
      className={`border rounded-lg p-6 shadow-lg relative transition-transform transform hover:scale-105 cursor-pointer ${isCurrent ? 'border-secondary bg-secondary/10' : 'bg-white'} ${isRecommended ? 'border-primary' : ''}`}
      onClick={onSelect}
      data-testid={`subscription-card-${tier._id}`}
    >
      {isRecommended && <span className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Recommended</span>}
      <h3 className="text-xl font-bold text-primary mb-4">{tier.name}</h3>
      <p className="text-3xl font-extrabold text-gray-900 mb-2">₦{tier.price.toLocaleString()}</p>
      <p className="text-gray-500 mb-6">per {tier.durationInDays} days</p>

      <ul className="space-y-3 text-gray-700 mb-6">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
            <span>{feature}</span>
          </li>
        ))}
        <li className="flex items-center">
            <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
            <span>Up to {tier.maxHalls} halls</span>
        </li>
      </ul>

      <button
        className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors ${isCurrent ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
        disabled={isCurrent}
      >
        {isCurrent ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
};

export default SubscriptionCard;
