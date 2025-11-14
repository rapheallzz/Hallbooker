"use client";
import React, { useState, useEffect } from 'react';
import withAuth from '@/components/auth/withAuth';
import api from '@/services/api';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Book, Users, Clock } from 'lucide-react';

// Interfaces
interface AnalyticsData {
    totalRevenue: number;
    totalBookings: number;
    totalUsers: number;
    averageBookingValue: number;
    bookingsPerDay: { date: string; count: number }[];
}

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('all-time'); // e.g., '7-days', '30-days'

    useEffect(() => {
        fetchAnalytics();
    }, [timeframe]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // In a real app, the timeframe would be passed as a query param
            // const response = await api.get(`/analytics/platform?timeframe=${timeframe}`);
            // setAnalytics(response.data.data);

            // Using mock data for demonstration
            const mockData: AnalyticsData = {
                totalRevenue: 75300,
                totalBookings: 124,
                totalUsers: 450,
                averageBookingValue: 607.25,
                bookingsPerDay: [
                    { date: '2024-08-01', count: 5 },
                    { date: '2024-08-02', count: 8 },
                    { date: '2024-08-03', count: 3 },
                    { date: '2024-08-04', count: 12 },
                    { date: '2024-08-05', count: 7 },
                    { date: '2024-08-06', count: 9 },
                    { date: '2024-08-07', count: 4 },
                ],
            };
            setAnalytics(mockData);

        } catch (error) {
            console.error("Error fetching analytics data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!analytics) return <div className="text-center p-8">Failed to load analytics data.</div>;

    // Stat Card Component
    const StatCard = ({ icon, title, value, subtext }: any) => (
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Platform Analytics</h1>
                <div className="w-full md:w-auto mt-4 md:mt-0">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="block w-full md:w-1/3 p-2 border border-gray-400 rounded-md"
                    >
                        <option value="all-time">All Time</option>
                        <option value="30-days">Last 30 Days</option>
                        <option value="7-days">Last 7 Days</option>
                    </select>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<DollarSign className="text-primary" />}
                    title="Total Revenue"
                    value={`$${analytics.totalRevenue.toLocaleString()}`}
                />
                <StatCard
                    icon={<Book className="text-primary" />}
                    title="Total Bookings"
                    value={analytics.totalBookings}
                />
                <StatCard
                    icon={<Users className="text-primary" />}
                    title="Total Users"
                    value={analytics.totalUsers}
                />
                <StatCard
                    icon={<Clock className="text-primary" />}
                    title="Avg. Booking Value"
                    value={`$${analytics.averageBookingValue.toFixed(2)}`}
                />
            </div>

            {/* Bookings Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Bookings Activity</h2>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={analytics.bookingsPerDay}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#295FA7" name="Bookings" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default withAuth(AnalyticsPage, ["super-admin"]);
