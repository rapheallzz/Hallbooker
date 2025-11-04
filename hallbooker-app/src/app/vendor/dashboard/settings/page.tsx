"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import SubscriptionCard from "@/components/vendor/SubscriptionCard";
import axios from "axios";

// Interfaces for our data structures
interface BankAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

interface Tier {
  _id: string;
  name: string;
}

interface SubscriptionTier {
  tier: string;
  price: string;
  features: string[];
}

interface CurrentSubscription {
  tier: Tier;
  status: string;
  purchaseDate: string;
  price: number;
}

interface SubscriptionHistoryItem {
  _id: string;
  tier: Tier;
  purchaseDate: string;
  price: number;
  status: string;
}

// Hardcoded tiers as API for all tiers is not specified
const subscriptionTiersData: SubscriptionTier[] = [
  { tier: "Basic Package", price: "50,000", features: ["Up to 2 halls", "Basic Analytics", "Email Support"] },
  { tier: "Standard Package", price: "100,000", features: ["Up to 5 halls", "Standard Analytics", "Priority Support"] },
  { tier: "Premium Package", price: "200,000", features: ["Up to 10 halls", "Advanced Analytics", "24/7 Support", "Featured Listings"] },
];


const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("account");

  // State for Bank Account
  const [bankAccount, setBankAccount] = useState<BankAccount>({ accountNumber: "", bankName: "", accountName: "" });
  const [bankLoading, setBankLoading] = useState(true);
  const [bankError, setBankError] = useState<string | null>(null);

  // State for Licenses
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [recommendedTier, setRecommendedTier] = useState<string | null>(null);
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [licenseError, setLicenseError] = useState<string | null>(null);

  const fetchLicenseData = async () => {
    setLicenseLoading(true);
    setLicenseError(null);
    try {
      const [subRes, historyRes, recommendRes] = await Promise.all([
        api.get("/licenses/my-subscription"),
        api.get("/licenses/my-history"),
        api.get("/licenses/recommend"),
      ]);
      setCurrentSubscription(subRes.data.data);
      setSubscriptionHistory(historyRes.data.data);
      setRecommendedTier(recommendRes.data.data.recommendedTier.name);
    } catch (error) {
      console.error("Error fetching license data:", error);
      setLicenseError("Failed to load subscription details. Please try again later.");
    } finally {
      setLicenseLoading(false);
    }
  };

  useEffect(() => {
    const fetchBankData = async () => {
      setBankLoading(true);
      setBankError(null);
      try {
        const response = await api.get("/users/bank-account");
        setBankAccount(response.data.data || { accountNumber: "", bankName: "", accountName: "" });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setBankError("You do not have permission to view or edit bank account details.");
        } else {
          setBankError("Failed to load bank account details. Please try again later.");
        }
        console.error("Error fetching bank account:", error);
      } finally {
        setBankLoading(false);
      }
    };

    if (activeTab === "account") {
      fetchBankData();
    } else if (activeTab === "licenses") {
      fetchLicenseData();
    }
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch("/users/bank-account", bankAccount);
      alert("Bank account updated successfully!");
    } catch (error) {
      console.error("Error updating bank account:", error);
      alert("Failed to update bank account.");
    }
  };

  const handleSelectPlan = async (tier: string) => {
    const action = currentSubscription ? "upgrade" : "purchase";
    if (window.confirm(`Are you sure you want to ${action} the ${tier} plan?`)) {
      try {
        const endpoint = currentSubscription ? "/licenses/upgrade" : "/licenses";
        await api.post(endpoint, { tier });
        alert(`Successfully ${action}d the ${tier} plan!`);
        // Refresh data after action
        fetchLicenseData();
      } catch (error) {
        console.error(`Failed to ${action} plan:`, error);
        alert(`There was an error trying to ${action} the plan. Please try again.`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Settings</h1>
      <div className="flex border-b border-gray-300 mb-6">
        <button onClick={() => setActiveTab("account")} className={`py-2 px-4 text-lg ${activeTab === "account" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}>Bank Account</button>
        <button onClick={() => setActiveTab("licenses")} className={`py-2 px-4 text-lg ${activeTab === "licenses" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}>Licenses & Subscriptions</button>
      </div>

      <div>
        {activeTab === "account" && (
          bankLoading ? <div>Loading...</div> :
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Bank Account Details</h2>
            {bankError ? <div className="text-red-600 p-4 bg-red-100 rounded-md">{bankError}</div> :
            <form onSubmit={handleSubmit}>
              <div className="mb-4"><label className="block text-gray-700" htmlFor="accountName">Account Name</label><input id="accountName" name="accountName" type="text" value={bankAccount.accountName} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"/></div>
              <div className="mb-4"><label className="block text-gray-700" htmlFor="accountNumber">Account Number</label><input id="accountNumber" name="accountNumber" type="text" value={bankAccount.accountNumber} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"/></div>
              <div className="mb-4"><label className="block text-gray-700" htmlFor="bankName">Bank Name</label><input id="bankName" name="bankName" type="text" value={bankAccount.bankName} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"/></div>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">Save</button>
            </form>
            }
          </div>
        )}

        {activeTab === "licenses" && (
          licenseLoading ? <div>Loading subscription details...</div> :
          licenseError ? <div className="text-red-600">{licenseError}</div> :
          <div>
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upgrade or Purchase a Subscription</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {subscriptionTiersData.map((tier) => (
                  <SubscriptionCard key={tier.tier} tier={tier.tier} price={tier.price} features={tier.features} isCurrent={currentSubscription?.tier.name === tier.tier} isRecommended={tier.tier === recommendedTier} onSelect={() => handleSelectPlan(tier.tier)} />
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Current Subscription</h2>
              <div className="bg-white p-6 shadow-lg rounded-lg">
                {currentSubscription ? (
                  <>
                    <h3 className="text-xl font-bold text-primary">{currentSubscription.tier.name}</h3>
                    <p className="text-gray-800">Status: <span className="font-semibold text-green-600">{currentSubscription.status}</span></p>
                    <p className="text-gray-800">Purchased on: {new Date(currentSubscription.purchaseDate).toLocaleDateString()}</p>
                  </>
                ) : <p className="text-gray-800">No active subscription found.</p>}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Subscription History</h2>
              <div className="bg-white p-4 shadow-lg rounded-lg">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-primary">Date</th>
                      <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-primary">Tier</th>
                      <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-primary">Amount</th>
                      <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-primary">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionHistory.length > 0 ? subscriptionHistory.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 border-b text-gray-900">{new Date(item.purchaseDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 border-b text-gray-900">{item.tier.name}</td>
                        <td className="px-6 py-4 border-b text-gray-900">{item.price}</td>
                        <td className="px-6 py-4 border-b text-gray-900">{item.status}</td>
                      </tr>
                    )) : <tr><td colSpan={4} className="text-center py-10">No history found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
