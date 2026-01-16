'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { Building, Calendar, Briefcase, TrendingUp } from 'lucide-react';
import { format as formatDate } from 'date-fns';

interface Booking {
  _id: string;
  user: {
    fullName: string;
    email: string;
  } | null;
  walkInUserDetails?: {
    fullName: string;
    email: string;
    phone: string;
  };
  hall: {
    _id: string;
    name: string;
  };
  eventDetails: string;
  bookingDates: {
    startTime: string;
    endTime: string;
  }[];
  totalPrice: number;
  status: string;
}

interface AnalyticsData {
  overallStats: {
    totalBookings: {
      confirmed: number;
    };
  };
  recentBookings: {
    bookings: Booking[];
  };
}

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-gray-100 p-3 rounded-full"><Icon className="h-6 w-6 text-primary" /></div>
    <div><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold text-gray-800">{value}</p></div>
  </div>
);

const StaffDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [hallsCount, setHallsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, hallsRes] = await Promise.all([
        api.get('../v2/analytics/hall-owner?limit=5'),
        api.get('/halls/by-owner')
      ]);

      if (analyticsRes.data?.success) setData(analyticsRes.data.data);
      if (hallsRes.data?.success) setHallsCount(hallsRes.data.data.length);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Staff Dashboard</h1>
        <p className="text-gray-500">Welcome! Here is an overview of the halls and bookings you manage.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-24 rounded-lg"></div>
            <div className="bg-gray-200 h-24 rounded-lg"></div>
          </div>
          <div className="bg-gray-200 h-96 rounded-lg"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Total Managed Halls" value={hallsCount} icon={Building} />
            <StatCard title="Confirmed Bookings" value={data?.overallStats?.totalBookings?.confirmed || 0} icon={Briefcase} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Hall</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.recentBookings?.bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{booking.user?.fullName || booking.walkInUserDetails?.fullName || 'N/A'}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap text-sm text-gray-800">
                        {booking.hall?.name}
                      </td>
                      <td className="p-3 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(new Date(booking.bookingDates[0].startTime), 'MMM d, yyyy')}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentBookings?.bookings || data.recentBookings.bookings.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-gray-500">No bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffDashboard;
