"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import SubscriptionCard from "@/components/vendor/SubscriptionCard";
import SearchableBankSelect from "@/components/vendor/SearchableBankSelect";
import axios from "axios";
import { Edit2, Building2, User, Hash, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import withAuth from "@/components/auth/withAuth";

// Interfaces for our data structures
interface BankAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
  bankCode?: string;
}

interface Bank {
  name: string;
  code: string;
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
  const [bankAccount, setBankAccount] = useState<BankAccount>({ accountNumber: "", bankName: "", accountName: "", bankCode: "" });
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isAccountValidated, setIsAccountValidated] = useState(false);
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

  const fetchBankData = async () => {
    setBankLoading(true);
    setBankError(null);
    try {
      const [bankRes, banksListRes] = await Promise.all([
        api.get("/users/me/bank-details").catch(err => {
          if (err.response?.status === 404) return { data: { data: null } };
          throw err;
        }),
        api.get("/monnify/banks")
      ]);
      setBankAccount(bankRes.data.data || { accountNumber: "", bankName: "", accountName: "", bankCode: "" });
      setBanks(banksListRes.data.data || []);
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

  useEffect(() => {
    const validateAccount = async () => {
      if (bankAccount.accountNumber.length === 10 && bankAccount.bankCode) {
        setIsValidating(true);
        setIsAccountValidated(false);
        try {
          const response = await api.post("/monnify/validate-account", {
            accountNumber: bankAccount.accountNumber,
            bankCode: bankAccount.bankCode
          });
          if (response.data.data && response.data.data.accountName) {
            setBankAccount(prev => ({
              ...prev,
              accountName: response.data.data.accountName
            }));
            setIsAccountValidated(true);
          } else {
            Swal.fire({
              title: "Validation Failed",
              text: "Could not retrieve account name. Please check your bank and account number.",
              icon: "error",
              confirmButtonColor: "#4F46E5",
            });
          }
        } catch (error) {
          console.error("Validation error:", error);
          Swal.fire({
            title: "Validation Error",
            text: "Invalid account details or validation failed. Please try again.",
            icon: "error",
            confirmButtonColor: "#4F46E5",
          });
        } finally {
          setIsValidating(false);
        }
      } else {
        setIsAccountValidated(false);
      }
    };

    if (isEditing) {
      validateAccount();
    }
  }, [bankAccount.accountNumber, bankAccount.bankCode, isEditing]);

  useEffect(() => {
    if (activeTab === "account") {
      fetchBankData();
    } else if (activeTab === "licenses") {
      fetchLicenseData();
    }
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "accountNumber") {
      const sanitized = value.replace(/\D/g, "").slice(0, 10);
      setBankAccount((prev) => ({ ...prev, [name]: sanitized }));
    } else {
      setBankAccount((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAccountValidated) {
      Swal.fire({
        title: "Incomplete Details",
        text: "Please provide a valid account number and bank.",
        icon: "warning",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    Swal.fire({
      title: "Saving Details...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await api.patch("/users/me/bank-details", {
        bankCode: bankAccount.bankCode,
        accountNumber: bankAccount.accountNumber,
      });
      Swal.fire({
        title: "Success!",
        text: "Bank account updated successfully!",
        icon: "success",
        confirmButtonColor: "#4F46E5",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating bank account:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update bank account. Please try again.",
        icon: "error",
        confirmButtonColor: "#4F46E5",
      });
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
          bankLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading bank details...</p>
            </div>
          ) :
          <div className="bg-white p-8 shadow-sm rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Settlement Account</h2>
                <p className="text-gray-500 text-sm mt-1">This is where your payments will be disbursed.</p>
              </div>
              {!isEditing && !bankError && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Details
                </button>
              )}
            </div>

            {bankError ? (
              <div className="text-red-600 p-6 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center text-center">
                <p className="font-medium">{bankError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm font-bold underline"
                >
                  Try again
                </button>
              </div>
            ) : !isEditing ? (
              // View Mode
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    Bank Name
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{bankAccount.bankName || "Not Set"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <Hash className="w-4 h-4" />
                    Account Number
                  </div>
                  <p className="text-lg font-semibold text-gray-800 tracking-wider">{bankAccount.accountNumber || "Not Set"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    Account Name
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{bankAccount.accountName || "Not Set"}</p>
                </div>
                {(!bankAccount.bankName || !bankAccount.accountNumber) && (
                  <div className="md:col-span-3 mt-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                    >
                      Click here to add your bank details
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Select Bank</label>
                  <SearchableBankSelect
                    banks={banks}
                    selectedBankCode={bankAccount.bankCode}
                    onSelect={(bank) => setBankAccount(prev => ({ ...prev, bankCode: bank.code, bankName: bank.name }))}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="accountNumber" className="block text-sm font-semibold text-gray-700">Account Number</label>
                  <div className="relative">
                    <input
                      id="accountNumber"
                      name="accountNumber"
                      type="text"
                      placeholder="Enter 10-digit account number"
                      value={bankAccount.accountNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all tracking-widest text-lg font-medium"
                    />
                    {isValidating && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-medium">Validating...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Account Name</label>
                  <div className={`p-4 rounded-lg border bg-gray-50 min-h-[56px] flex items-center ${isAccountValidated ? 'border-green-200' : 'border-gray-200'}`}>
                    {bankAccount.accountName ? (
                      <p className={`font-bold ${isAccountValidated ? 'text-green-700' : 'text-gray-700'}`}>
                        {bankAccount.accountName}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic text-sm">Enter account details to verify name...</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={!isAccountValidated || isValidating}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold text-white transition-all ${!isAccountValidated || isValidating ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
                  >
                    Save Account Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchBankData();
                    }}
                    className="px-6 py-3 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
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

export default withAuth(SettingsPage, ["hall-owner"]);
