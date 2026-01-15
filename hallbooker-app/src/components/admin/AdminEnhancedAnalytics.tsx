'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/services/api';
import { format as formatDate } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { TrendingUp, TrendingDown, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-[300px] w-full rounded-md" /> });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

// Type definitions for the analytics data
interface PlatformRevenue { totalBookingRevenue: number; totalSubscriptionRevenue: number; grandTotal: number; }
interface CommissionAnalytics { commissionRate: string; totalCommission: number; commissionableRevenue: number; }
interface HallPerformance { _id: string; owner: { _id: string; fullName: string; email: string; }; name: string; revenue: number; bookingCount: number; viewCount: number; score: number; }
interface DataComparison { currentPeriod: { from: string; to: string; bookingRevenue: number; subscriptionRevenue: number; }; previousPeriod: { from: string; to: string; bookingRevenue: number; subscriptionRevenue: number; }; change: { bookingRevenuePercentage: string; subscriptionRevenuePercentage: string; }; }
interface AdminAnalyticsData { platformRevenue: PlatformRevenue; commissionAnalytics: CommissionAnalytics; hallPerformance: { mostActiveHalls: HallPerformance[]; inactiveHalls: any[]; }; dataComparison: DataComparison; }

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

const TrendIndicator = ({ percentage }: { percentage: string }) => {
    const isPositive = !percentage.startsWith('-');
    return <span className={`flex items-center text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}{percentage} vs last period</span>;
};

const AdminStatCard = ({ title, value, trend }: { title: string; value: string | number; trend?: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex-grow"><p className="text-sm text-gray-500">{title}</p><p className="text-3xl font-bold text-gray-800 my-2">{value}</p>{trend && <TrendIndicator percentage={trend} />}</div>
);

const AdminEnhancedAnalytics = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState([{ startDate: new Date(new Date().setDate(new Date().getDate() - 7)), endDate: new Date(), key: 'selection' }]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);
  useOnClickOutside(datePickerRef, () => setShowDatePicker(false));

  const fetchAdminAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate: formatDate(dateRange[0].startDate, 'yyyy-MM-dd'), endDate: formatDate(dateRange[0].endDate, 'yyyy-MM-dd') });
      const response = await api.get(`../v2/analytics/super-admin?${params.toString()}`);
      if (response.data?.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch');
      }
    } catch (err: any) { console.error(err); setData(null); }
    finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { fetchAdminAnalytics(); }, [fetchAdminAnalytics]);

  const topHallsData = data?.hallPerformance?.mostActiveHalls.slice(0, 5).map(hall => ({ name: hall.name, Revenue: hall.revenue })) || [];
  const revenueBreakdownData = data ? [
    { name: 'Booking Revenue', value: data.platformRevenue.totalBookingRevenue },
    { name: 'Subscription Revenue', value: data.platformRevenue.totalSubscriptionRevenue },
  ] : [];
  const COLORS = ['#295FA7', '#B68945'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div><h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1><p className="text-gray-500">A top-level overview of the platform's performance.</p></div>
      <div className="p-4 bg-white rounded-lg shadow-md flex items-center gap-4">
        <div className="relative" ref={datePickerRef}>
            <button onClick={() => setShowDatePicker(d => !d)} className="w-64 border rounded-md p-2 flex items-center justify-between"><CalendarIcon className="h-5 w-5 mr-2 text-gray-500"/><span>{`${formatDate(dateRange[0].startDate, "MMM d, yyyy")} - ${formatDate(dateRange[0].endDate, "MMM d, yyyy")}`}</span><ChevronDown className="h-5 w-5 text-gray-500"/></button>
            {showDatePicker && (<div className="absolute top-full mt-2 z-10 shadow-lg border rounded-md bg-white"><DateRange editableDateInputs={true} onChange={item => setDateRange([item.selection])} moveRangeOnFirstSelection={false} ranges={dateRange} /></div>)}
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10 animate-pulse">Loading Platform Analytics...</div>
      ) : !data ? (
        <div className="text-center p-10 text-red-500">Could not load platform analytics data. Please try adjusting the date range or refresh.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatCard title="Grand Total Revenue" value={formatCurrency(data.platformRevenue.grandTotal)} />
            <AdminStatCard title="Booking Revenue" value={formatCurrency(data.platformRevenue.totalBookingRevenue)} trend={data.dataComparison.change.bookingRevenuePercentage} />
            <AdminStatCard title="Subscription Revenue" value={formatCurrency(data.platformRevenue.totalSubscriptionRevenue)} trend={data.dataComparison.change.subscriptionRevenuePercentage} />
            <AdminStatCard title="Commission Earned" value={formatCurrency(data.commissionAnalytics.totalCommission)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 Halls by Revenue</h2>
                  <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topHallsData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-NG', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Bar dataKey="Revenue" fill="#295FA7" />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Sources</h2>
                  <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                          <Pie data={revenueBreakdownData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={(entry) => `${(entry.percent * 100).toFixed(0)}%`}>
                              {revenueBreakdownData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                          </Pie>
                          <Tooltip formatter={(value) => `${formatCurrency(value as number)}`} />
                          <Legend />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Most Active Halls</h2>
                  <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                          <thead><tr className="bg-gray-50"><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">#</th><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Hall</th><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th></tr></thead>
                          <tbody className="divide-y divide-gray-200">
                              {data.hallPerformance?.mostActiveHalls.map((hall, index) => (
                                  <tr key={hall._id}>
                                      <td className="p-3 text-sm font-semibold text-gray-700">{index + 1}</td>
                                      <td className="p-3"><div className="text-sm font-medium text-gray-900">{hall.name}</div><div className="text-xs text-gray-500">{hall.owner?.fullName ?? 'N/A'}</div></td>
                                      <td className="p-3 text-sm font-semibold text-gray-800">{formatCurrency(hall.revenue)}</td>
                                      <td className="p-3 text-sm text-center text-gray-600">{hall.bookingCount}</td>
                                  </tr>
                              ))}
                              {data.hallPerformance?.mostActiveHalls.length === 0 && (<tr><td colSpan={4} className="text-center py-10 text-gray-500">No active halls.</td></tr>)}
                          </tbody>
                      </table>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Inactive Halls</h2>
                  <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                          <thead><tr className="bg-gray-50"><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Hall Name</th><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                          <tbody className="divide-y divide-gray-200">
                              {data.hallPerformance?.inactiveHalls.map((hall) => (
                                  <tr key={hall.hallId}>
                                      <td className="p-3 text-sm font-medium text-gray-900">{hall.hallName}</td>
                                      <td className="p-3 text-sm text-gray-600">{hall.ownerName ?? 'N/A'}</td>
                                      <td className="p-3"><button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1 px-2 rounded">View Details</button></td>
                                  </tr>
                              ))}
                              {data.hallPerformance?.inactiveHalls.length === 0 && (<tr><td colSpan={3} className="text-center py-10 text-gray-500">No inactive halls.</td></tr>)}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminEnhancedAnalytics;
