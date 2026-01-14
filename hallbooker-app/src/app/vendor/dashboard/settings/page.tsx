"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import SubscriptionCard from "@/components/vendor/SubscriptionCard";
import axios from "axios";
import Swal from "sweetalert2";

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

interface LicenseTier {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  maxHalls: number;
}

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("licenses");

  // State for Bank Account
  const [bankAccount, setBankAccount] = useState<BankAccount>({ accountNumber: "", bankName: "", accountName: "" });
  const [bankLoading, setBankLoading] = useState(true);
  const [bankError, setBankError] = useState<string | null>(null);

  // State for Licenses
  const [licenseTiers, setLicenseTiers] = useState<LicenseTier[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [recommendedTier, setRecommendedTier] = useState<string | null>(null);
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [licenseError, setLicenseError] = useState<string | null>(null);

  const fetchLicenseData = async () => {
    setLicenseLoading(true);
    setLicenseError(null);
    try {
      const [tiersRes, subRes, historyRes, recommendRes] = await Promise.all([
        api.get("/license-tiers"),
        api.get("/licenses/my-subscription").catch(err => (err.response?.status === 404 ? null : Promise.reject(err))),
        api.get("/licenses/my-history"),
        api.get("/licenses/recommend").catch(err => (err.response?.status === 404 ? null : Promise.reject(err))),
      ]);
      setLicenseTiers(tiersRes.data.data);
      setCurrentSubscription(subRes ? subRes.data.data : null);
      setSubscriptionHistory(historyRes.data.data);
      if (recommendRes && recommendRes.data.data.recommendedTier) {
        setRecommendedTier(recommendRes.data.data.recommendedTier._id);
      }
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
        const response = await api.get("/users/me/bank-details");
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
      Swal.fire("Success!", "Bank account updated successfully!", "success");
    } catch (error) {
      console.error("Error updating bank account:", error);
      Swal.fire("Error!", "Failed to update bank account.", "error");
    }
  };

  const handleSelectPlan = async (tierId: string, tierName: string) => {
    const action = currentSubscription ? "upgrade" : "purchase";
    const result = await Swal.fire({
      title: `Confirm ${action}`,
      text: `Are you sure you want to ${action} the ${tierName} plan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: "No, cancel",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Processing...",
        text: "Please wait while we process your request.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const endpoint = currentSubscription ? "/licenses/upgrade" : "/licenses";
        const payload = currentSubscription ? { newTierId: tierId } : { tierId: tierId };
        const response = await api.post(endpoint, payload);

        const checkoutUrl = response.data.data.checkoutUrl;

        if (checkoutUrl) {
          Swal.close();
          window.location.href = checkoutUrl;
        } else {
          Swal.fire("Error!", "Could not retrieve payment link. Please try again.", "error");
        }
      } catch (error) {
        console.error(`Failed to ${action} plan:`, error);
        Swal.fire("Error!", `There was an error trying to ${action} the plan. Please try again.`, "error");
      }
    }
  };

  const getExpiryDate = (purchaseDate: string, durationInDays: number) => {
    const date = new Date(purchaseDate);
    date.setDate(date.getDate() + durationInDays);
    return date.toLocaleDateString();
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
                {licenseTiers.map((tier) => (
                  <SubscriptionCard key={tier._id} tier={tier} isCurrent={currentSubscription?.tier._id === tier._id} isRecommended={tier._id === recommendedTier} onSelect={() => handleSelectPlan(tier._id, tier.name)} />
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
                    {(() => {
                      const currentTierDetails = licenseTiers.find(t => t._id === currentSubscription.tier._id);
                      if (currentTierDetails) {
                        return <p className="text-gray-800">Expires on: {getExpiryDate(currentSubscription.purchaseDate, currentTierDetails.durationInDays)}</p>;
                      }
                      return null;
                    })()}
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
