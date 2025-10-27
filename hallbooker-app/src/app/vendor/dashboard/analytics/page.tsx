"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  totalHalls: number;
  bookingsByHall: { hallName: string; count: number }[];
}

const AnalyticsPage = () => {
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
      <h1 className="text-3xl font-bold mb-4 text-primary">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-2">Total Revenue</h2>
          <p className="text-3xl">${analytics?.totalRevenue}</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-2">Total Bookings</h2>
          <p className="text-3xl">{analytics?.totalBookings}</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-2">Total Halls</h2>
          <p className="text-3xl">{analytics?.totalHalls}</p>
        </div>
      </div>
      <div className="bg-white p-4 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-2">Bookings by Hall</h2>
        <ul>
          {analytics?.bookingsByHall.map((hall) => (
            <li key={hall.hallName} className="flex justify-between py-2 border-b">
              <span>{hall.hallName}</span>
              <span>{hall.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsPage;
