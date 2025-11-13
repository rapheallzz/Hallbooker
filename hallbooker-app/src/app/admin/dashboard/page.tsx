"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import withAuth from "@/components/auth/withAuth";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  totalHalls: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/analytics/super-admin");
        setAnalytics(response.data.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-primary">Super Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-gray-800">{analytics?.totalUsers}</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Total Halls</h2>
          <p className="text-3xl font-bold text-gray-800">{analytics?.totalHalls}</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Total Bookings</h2>
          <p className="text-3xl font-bold text-gray-800">{analytics?.totalBookings}</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-gray-800">${analytics?.totalRevenue}</p>
        </div>
      </div>

      <div className="bg-white p-4 shadow-lg rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics?.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#295FA7" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default withAuth(AdminDashboardPage, ["super-admin"]);
