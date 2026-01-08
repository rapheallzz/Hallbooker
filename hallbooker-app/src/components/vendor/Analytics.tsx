"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { subDays, format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Data structures based on the new API response
interface OverallStats {
  totalRevenue: number;
  totalViews: number;
  totalDemoBookings: number;
  totalBookings: {
    confirmed: number;
    cancelled: number;
    pending: number;
  };
}

interface RevenueDetails {
  breakdownByHall: {
    totalRevenue: number;
    hallRevenue: number;
    facilityRevenue: number;
    hallId: string;
    hallName: string;
  }[];
}

interface RecentBooking {
  _id: string;
  user: {
    fullName: string;
  } | null;
  walkInUserDetails?: {
    fullName: string;
  };
  hall: {
    name: string;
  };
  eventDetails: string;
  bookingDates: {
    startTime: string;
    endTime: string;
  }[];
  totalPrice: number;
  status: string;
  bookingType: string;
  createdAt: string;
}

interface RecentBookings {
  bookings: RecentBooking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBookings: number;
  };
}

interface Kpis {
  bookingConversionRate: string;
  averageBookingValue: string;
  busiestDays: {
    day: string;
    count: number;
  }[];
}

interface AnalyticsData {
  overallStats: OverallStats;
  revenueDetails: RevenueDetails;
  recentBookings: RecentBookings;
  kpis: Kpis;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedHall, setSelectedHall] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", format(startDate, "yyyy-MM-dd"));
        if (endDate) params.append("endDate", format(endDate, "yyyy-MM-dd"));
        if (selectedHall) params.append("hallId", selectedHall);
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        const response = await api.get(`/v2/analytics/hall-owner?${params.toString()}`);
        setAnalytics(response.data.data);
      } catch (err) {
        setError("Failed to fetch analytics data. Please try again later.");
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate, selectedHall, page, limit]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!analytics) {
    return <div className="text-center p-4">No analytics data available.</div>;
  }

  const { overallStats, revenueDetails, recentBookings, kpis } = analytics;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Analytics Dashboard</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <DayPicker mode="single" selected={startDate} onSelect={setStartDate} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <DayPicker mode="single" selected={endDate} onSelect={setEndDate} />
        </div>
        <div>
          <label htmlFor="hall-select" className="block text-sm font-medium text-gray-700">
            Filter by Hall
          </label>
          <select
            id="hall-select"
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Halls</option>
            {revenueDetails.breakdownByHall.map((hall) => (
              <option key={hall.hallId} value={hall.hallId}>
                {hall.hallName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 shadow-lg rounded-lg text-center">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-gray-800">₦{overallStats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg text-center">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Total Views</h2>
          <p className="text-3xl font-bold text-gray-800">{overallStats.totalViews}</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg text-center">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Confirmed Bookings</h2>
          <p className="text-3xl font-bold text-gray-800">{overallStats.totalBookings.confirmed}</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg text-center">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Pending Bookings</h2>
          <p className="text-3xl font-bold text-gray-800">{overallStats.totalBookings.pending}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-gray-600">Revenue by Hall</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueDetails.breakdownByHall}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalRevenue"
                nameKey="hallName"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {revenueDetails.breakdownByHall.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-gray-600">Busiest Days</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpis.busiestDays}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Recent Bookings */}
      <div className="bg-white p-4 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-2 text-gray-600">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Customer</th>
                <th className="py-2 px-4 border-b">Hall</th>
                <th className="py-2 px-4 border-b">Event</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="py-2 px-4 border-b">{booking.user?.fullName || booking.walkInUserDetails?.fullName}</td>
                  <td className="py-2 px-4 border-b">{booking.hall.name}</td>
                  <td className="py-2 px-4 border-b">{booking.eventDetails}</td>
                  <td className="py-2 px-4 border-b">{format(new Date(booking.createdAt), "PPP")}</td>
                  <td className="py-2 px-4 border-b">₦{booking.totalPrice.toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <div>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4">
              Page {recentBookings.pagination.currentPage} of {recentBookings.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === recentBookings.pagination.totalPages}
              className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
