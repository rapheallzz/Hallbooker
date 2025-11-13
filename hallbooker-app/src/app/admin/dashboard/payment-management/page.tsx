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

const PaymentManagementPage = () => {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Payment Management</h1>
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
              className="flex-grow p-2 border border-gray-300 rounded-md"
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
              className="flex-grow p-2 border border-gray-300 rounded-md"
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
    </div>
  );
};

export default withAuth(PaymentManagementPage, ["super-admin"]);
