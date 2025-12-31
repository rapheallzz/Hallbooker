"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import { PlusCircle, Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface PaymentMethod {
  _id: string;
  name: string;
}

interface PaymentStatus {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  fullName: string;
}

interface Subaccount {
  _id: string;
  userId: string;
  percentageCharge: number;
}

const PaymentSettingsTab = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([]);
  const [newMethod, setNewMethod] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      const [methodsRes, statusesRes] = await Promise.all([
        api.get("/admin/payment-methods"),
        api.get("/admin/payment-statuses"),
      ]);
      setPaymentMethods(Array.isArray(methodsRes.data.data) ? methodsRes.data.data : []);
      setPaymentStatuses(Array.isArray(statusesRes.data.data) ? statusesRes.data.data : []);
    } catch (error) {
      console.error("Error fetching payment data:", error);
      Swal.fire("Error", "Could not fetch payment data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethod) return;

    try {
      await api.post("/admin/payment-methods", { name: newMethod });
      Swal.fire("Success", "Payment method added.", "success");
      setNewMethod("");
      fetchPaymentData();
    } catch (error) {
      console.error("Error adding payment method:", error);
      Swal.fire("Error", "Could not add payment method.", "error");
    }
  };

  const handleRemoveMethod = async (methodId: string) => {
    try {
      await api.post("/admin/payment-methods/remove", { id: methodId });
      Swal.fire("Success", "Payment method removed.", "success");
      fetchPaymentData();
    } catch (error) {
      console.error("Error removing payment method:", error);
      Swal.fire("Error", "Could not remove payment method.", "error");
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus) return;

    try {
      await api.post("/admin/payment-statuses", { name: newStatus });
      Swal.fire("Success", "Payment status added.", "success");
      setNewStatus("");
      fetchPaymentData();
    } catch (error) {
      console.error("Error adding payment status:", error);
      Swal.fire("Error", "Could not add payment status.", "error");
    }
  };

  const handleRemoveStatus = async (statusId: string) => {
    try {
      await api.post("/admin/payment-statuses/remove", { id: statusId });
      Swal.fire("Success", "Payment status removed.", "success");
      fetchPaymentData();
    } catch (error) {
      console.error("Error removing payment status:", error);
      Swal.fire("Error", "Could not remove payment status.", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Payment Methods */}
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Methods</h2>
        <form onSubmit={handleAddMethod} className="flex gap-4 mb-4">
          <input
            type="text"
            value={newMethod}
            onChange={(e) => setNewMethod(e.target.value)}
            placeholder="New payment method"
            className="flex-grow p-2 border border-gray-300 rounded-md text-gray-600"
          />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">
            <PlusCircle size={20} />
          </button>
        </form>
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <div key={method._id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
              <span>{method.name}</span>
              <button onClick={() => handleRemoveMethod(method._id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Statuses */}
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Statuses</h2>
        <form onSubmit={handleAddStatus} className="flex gap-4 mb-4">
          <input
            type="text"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            placeholder="New payment status"
            className="flex-grow p-2 border border-gray-300 rounded-md text-gray-600"
          />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">
            <PlusCircle size={20} />
          </button>
        </form>
        <div className="space-y-2">
          {paymentStatuses.map((status) => (
            <div key={status._id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
              <span>{status.name}</span>
              <button onClick={() => handleRemoveStatus(status._id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SubaccountsTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationLoading, setValidationLoading] = useState(false);
  const [accountName, setAccountName] = useState('');

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [defaultSplitPercentage, setDefaultSplitPercentage] = useState<number | ''>('');

  const fetchSubaccountData = async () => {
    setLoading(true);
    try {
      const [usersRes, subaccountsRes, banksRes] = await Promise.all([
        api.get('/users?role=hall-owner'),
        api.get('/subaccounts'),
        api.get('/monnify/banks'),
      ]);
      setUsers(usersRes.data.data);
      setSubaccounts(Array.isArray(subaccountsRes.data.data) ? subaccountsRes.data.data : []);
      setBanks(banksRes.data.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      Swal.fire("Error", "Could not fetch required data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubaccountData();
  }, []);

  useEffect(() => {
    const validateAccount = async () => {
      if (accountNumber.length === 10 && selectedBankCode) {
        setValidationLoading(true);
        setAccountName('');
        try {
          const response = await api.post('/monnify/validate-account', {
            accountNumber,
            bankCode: selectedBankCode,
          });
          setAccountName(response.data.data.accountName);
        } catch (error) {
          console.error("Error validating account:", error);
          Swal.fire("Validation Error", "Could not validate the bank account.", "error");
        } finally {
          setValidationLoading(false);
        }
      }
    };
    validateAccount();
  }, [accountNumber, selectedBankCode]);

  const handleCreateSubaccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedBankCode || !accountNumber || !accountName || defaultSplitPercentage === '') {
        Swal.fire('Validation Error', 'Please fill all fields and validate the account.', 'error');
        return;
    }

    Swal.fire({
        title: 'Creating Subaccount...',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false
    });

    try {
        const payload = {
            userId: selectedUserId,
            bankCode: selectedBankCode,
            accountNumber,
            accountName,
            defaultSplitPercentage: Number(defaultSplitPercentage),
        };
        await api.post('/subaccounts', payload);

        Swal.fire('Success!', 'Subaccount created successfully.', 'success');
        setSelectedUserId('');
        setSelectedBankCode('');
        setAccountNumber('');
        setAccountName('');
        setDefaultSplitPercentage('');
        fetchSubaccountData();
    } catch (error: any) {
        console.error("Error creating subaccount:", error);
        const errorMessage = error.response?.data?.message || 'Could not create the subaccount.';
        Swal.fire('Error', errorMessage, 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Subaccount Form */}
      <div className="lg:col-span-1">
          <div className="bg-white p-6 shadow-lg rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Subaccount</h2>
              <form onSubmit={handleCreateSubaccount} className="space-y-4">
                  <div>
                      <label htmlFor="hallOwner" className="block text-sm font-medium text-gray-700">Hall Owner</label>
                      <select
                          id="hallOwner"
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-600"
                          required
                      >
                          <option value="" disabled>Select a hall owner</option>
                          {users.map(user => (
                              <option key={user._id} value={user._id}>{user.fullName}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label htmlFor="bank" className="block text-sm font-medium text-gray-700">Bank</label>
                      <select
                          id="bank"
                          value={selectedBankCode}
                          onChange={(e) => setSelectedBankCode(e.target.value)}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-600"
                          required
                      >
                          <option value="" disabled>Select a bank</option>
                          {banks.map((bank: any) => (
                              <option key={bank.code} value={bank.code}>{bank.name}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                      <div className="relative">
                          <input
                              type="text"
                              id="accountNumber"
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value)}
                              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-600"
                              placeholder="10 digits"
                              maxLength={10}
                              required
                          />
                          {validationLoading && <div className="absolute inset-y-0 right-0 flex items-center pr-3"><LoadingSpinner /></div>}
                      </div>
                  </div>
                  <div>
                      <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">Account Name</label>
                      <input
                          type="text"
                          id="accountName"
                          value={accountName}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800"
                          disabled
                      />
                  </div>
                  <div>
                      <label htmlFor="defaultSplitPercentage" className="block text-sm font-medium text-gray-700">Default Split Percentage (%)</label>
                      <input
                          type="number"
                          id="defaultSplitPercentage"
                          value={defaultSplitPercentage}
                          onChange={(e) => setDefaultSplitPercentage(Number(e.target.value))}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-600"
                          placeholder="e.g., 90"
                          min="0"
                          max="100"
                          required
                      />
                  </div>
                  <button
                      type="submit"
                      className="w-full bg-primary text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90"
                  >
                      <PlusCircle size={20} />
                      <span>Create Subaccount</span>
                  </button>
              </form>
          </div>
      </div>

      {/* Display Subaccounts */}
      <div className="lg:col-span-2">
          <div className="bg-white p-6 shadow-lg rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Existing Subaccounts</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall Owner</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage Charge</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subaccounts.map((subaccount) => (
                      <tr key={subaccount._id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{subaccount.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subaccount.percentageCharge}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
      </div>
    </div>
  );
};

const PaymentManagementPage = () => {
  const [activeTab, setActiveTab] = useState("settings");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Payment Management</h1>
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("settings")}
              className={`${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Payment Settings
            </button>
            <button
              onClick={() => setActiveTab("subaccounts")}
              className={`${
                activeTab === "subaccounts"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Subaccounts
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "settings" && <PaymentSettingsTab />}
          {activeTab === "subaccounts" && <SubaccountsTab />}
        </div>
      </div>
    </div>
  );
};

export default withAuth(PaymentManagementPage, ["super-admin"]);
