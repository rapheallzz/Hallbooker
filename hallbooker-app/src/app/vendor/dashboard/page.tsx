"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  totalHalls: number;
}

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/analytics/hall-owner");
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
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-primary">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Total Halls</h2>
          <p className="text-3xl font-bold text-gray-800">{analytics?.totalHalls}</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Total Bookings</h2>
          <p className="text-3xl font-bold text-gray-800">{analytics?.totalBookings}</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Revenue</h2>
          <p className="text-3xl font-bold text-gray-800">${analytics?.totalRevenue}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
