"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Swal from "sweetalert2";
import api from "@/services/api";

// Define interfaces for the data structures
interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
}

interface BookingStatusData {
  name: string;
  value: number;
}

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  totalHalls: number;
  monthlyData: MonthlyData[];
  bookingStatusDistribution: BookingStatusData[];
}

interface Hall {
  _id: string;
  name: string;
}

interface HallAnalyticsData {
    totalRevenue: number;
    totalBookings: number;
    monthlyData: MonthlyData[];
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [hallAnalytics, setHallAnalytics] = useState<HallAnalyticsData | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hallLoading, setHallLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, hallsRes] = await Promise.all([
          api.get("/analytics/super-admin"),
          api.get("/halls"),
        ]);
        setAnalytics(analyticsRes.data.data);
        setHalls(hallsRes.data.data);
      } catch (error) {
        console.error("Error fetching initial analytics data:", error);
        Swal.fire("Error", "Could not fetch platform analytics.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedHall) {
      const fetchHallAnalytics = async () => {
        setHallLoading(true);
        try {
          const response = await api.get(`/analytics/halls/${selectedHall}`);
          setHallAnalytics(response.data.data);
        } catch (error) {
          console.error(`Error fetching analytics for hall ${selectedHall}:`, error);
          Swal.fire("Error", "Could not fetch analytics for the selected hall.", "error");
          setHallAnalytics(null);
        } finally {
            setHallLoading(false);
        }
      };
      fetchHallAnalytics();
    } else {
        setHallAnalytics(null);
    }
  }, [selectedHall]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Platform Analytics</h1>

      {/* Platform-wide stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Total Revenue</h2>
          <p className="text-4xl font-bold text-gray-800">${(analytics?.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Total Bookings</h2>
          <p className="text-4xl font-bold text-gray-800">{(analytics?.totalBookings || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Total Users</h2>
          <p className="text-4xl font-bold text-gray-800">{(analytics?.totalUsers || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Total Halls</h2>
          <p className="text-4xl font-bold text-gray-800">{(analytics?.totalHalls || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Revenue and Bookings Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.monthlyData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Booking Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                    data={analytics?.bookingStatusDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                >
                    {(analytics?.bookingStatusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Hall-specific analytics */}
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-primary">Drill-down by Hall</h2>
        <div className="mb-4">
            <select
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                className="block w-full md:w-1/3 p-2 border border-gray-300 rounded-md text-gray-600"
            >
                <option value="">Select a Hall</option>
                {halls.map((hall) => (
                <option key={hall._id} value={hall._id}>
                    {hall.name}
                </option>
                ))}
            </select>
        </div>

        {hallLoading ? <LoadingSpinner /> : hallAnalytics && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-800">${hallAnalytics.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Bookings</h3>
                    <p className="text-3xl font-bold text-gray-800">{hallAnalytics.totalBookings.toLocaleString()}</p>
                </div>
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Revenue for Selected Hall</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hallAnalytics.monthlyData}>
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
        )}
      </div>
    </div>
  );
};

export default withAuth(AnalyticsPage, ["super-admin"]);
