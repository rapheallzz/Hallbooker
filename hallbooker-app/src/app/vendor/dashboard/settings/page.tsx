"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";

interface BankAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

const SettingsPage = () => {
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    accountNumber: "",
    bankName: "",
    accountName: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBankAccount = async () => {
      try {
        const response = await api.get("/users/bank-account");
        setBankAccount(response.data.data);
      } catch (error) {
        console.error("Error fetching bank account:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBankAccount();
  }, []);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-primary">Settings</h1>
      <div className="bg-white p-4 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4">Bank Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="accountName">
              Account Name
            </label>
            <input
              id="accountName"
              name="accountName"
              type="text"
              value={bankAccount.accountName}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="accountNumber">
              Account Number
            </label>
            <input
              id="accountNumber"
              name="accountNumber"
              type="text"
              value={bankAccount.accountNumber}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bankName">
              Bank Name
            </label>
            <input
              id="bankName"
              name="bankName"
              type="text"
              value={bankAccount.bankName}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
