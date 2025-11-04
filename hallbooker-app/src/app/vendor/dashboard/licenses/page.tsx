"use client";
import React from "react";
import SubscriptionCard from "@/components/vendor/SubscriptionCard";

// Demo data
const subscriptionTiers = [
  {
    tier: "Basic",
    price: "$99/mo",
    features: ["5 Hall Listings", "Basic Analytics", "Email Support"],
  },
  {
    tier: "Pro",
    price: "$199/mo",
    features: ["Unlimited Hall Listings", "Advanced Analytics", "Priority Support", "Featured Listings"],
  },
  {
    tier: "Enterprise",
    price: "$399/mo",
    features: ["Everything in Pro", "Dedicated Account Manager", "Custom Integrations"],
  },
];

const currentSubscription = {
  tier: "Pro",
  price: "$199/mo",
  features: ["Unlimited Hall Listings", "Advanced Analytics", "Priority Support", "Featured Listings"],
  status: "Active",
  renewalDate: "2024-12-01",
};

const subscriptionHistory = [
  { id: 1, tier: "Basic", date: "2023-01-01", amount: "$99", status: "Paid" },
  { id: 2, tier: "Pro", date: "2023-06-01", amount: "$199", status: "Paid" },
];

const LicensesPage = () => {
  const recommendedTier = "Pro"; // This would come from the API

  const handleSelectPlan = (tier: string) => {
    alert(`You have selected the ${tier} plan.`);
    // Here you would typically handle the API call to purchase or upgrade
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Licenses & Subscriptions</h1>

      {/* Recommended Subscription Section / Upgrade Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upgrade or Purchase a Subscription</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptionTiers.map((tier) => (
            <SubscriptionCard
              key={tier.tier}
              tier={tier.tier}
              price={tier.price}
              features={tier.features}
              isCurrent={currentSubscription.tier === tier.tier}
              isRecommended={recommendedTier === tier.tier}
              onSelect={() => handleSelectPlan(tier.tier)}
            />
          ))}
        </div>
      </div>


      {/* Current Subscription Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Current Subscription</h2>
        <div className="bg-white p-6 shadow-lg rounded-lg">
          {currentSubscription ? (
            <div>
              <h3 className="text-xl font-bold text-primary">{currentSubscription.tier}</h3>
              <p className="text-gray-600">Status: <span className="font-semibold text-green-600">{currentSubscription.status}</span></p>
              <p className="text-gray-600">Renews on: {currentSubscription.renewalDate}</p>
            </div>
          ) : (
            <p>You do not have an active subscription.</p>
          )}
        </div>
      </div>

      {/* Subscription History Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Subscription History</h2>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Date</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Tier</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Amount</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionHistory.length > 0 ? (
                subscriptionHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{item.date}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{item.tier}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{item.amount}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-gray-900">{item.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10">No subscription history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LicensesPage;
