import React from "react";

interface SubscriptionCardProps {
  tier: string;
  price: string;
  features: string[];
  isCurrent?: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  tier,
  price,
  features,
  isCurrent,
  isRecommended,
  onSelect,
}) => {
  const cardClasses = `
    border-2 rounded-lg p-6 shadow-lg text-center
    ${isCurrent ? "border-secondary" : "border-gray-300"}
    ${isRecommended ? "transform scale-105 bg-blue-50" : "bg-white"}
  `;

  return (
    <div className={cardClasses}>
      {isRecommended && <span className="inline-block bg-primary text-white text-xs px-3 py-1 rounded-full uppercase font-semibold tracking-wide -mt-10 mb-4">Recommended</span>}
      <h3 className="text-2xl font-bold text-primary mb-2">{tier}</h3>
      <p className="text-4xl font-bold text-gray-900 mb-4">{price}</p>
      <ul className="text-left mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`w-full py-2 px-4 rounded-lg font-semibold text-white
          ${isCurrent ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-blue-700"}
        `}
      >
        {isCurrent ? "Current Plan" : "Choose Plan"}
      </button>
    </div>
  );
};

export default SubscriptionCard;
