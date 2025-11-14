"use client";
import React, { useState, useEffect } from 'react';
import withAuth from '@/components/auth/withAuth';
import api from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Building, BookOpen, DollarSign } from 'lucide-react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

interface AnalyticsSummary {
    totalUsers: number;
    totalHalls: number;
    totalBookings: number;
    totalRevenue: number;
    monthlyRevenue: { month: string; revenue: number }[];
}

const AdminDashboardPage = () => {
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // This would be your actual API call
                // const response = await api.get('/analytics/summary');
                // setAnalytics(response.data.data);

                // Mock data for demonstration
                const mockData: AnalyticsSummary = {
                    totalUsers: 450,
                    totalHalls: 78,
                    totalBookings: 124,
                    totalRevenue: 75300,
                    monthlyRevenue: [
                        { month: 'Jan', revenue: 6500 },
                        { month: 'Feb', revenue: 5900 },
                        { month: 'Mar', revenue: 8000 },
                        { month: 'Apr', revenue: 8100 },
                        { month: 'May', revenue: 5600 },
                        { month: 'Jun', revenue: 9500 },
                        { month: 'Jul', revenue: 11000 },
                    ],
                };
                setAnalytics(mockData);

            } catch (error) {
                console.error("Failed to fetch analytics summary:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-primary/10 p-4 rounded-full">
                {icon}
            </div>
            <div>
                <h2 className="text-sm font-semibold text-gray-600 mb-2">{title}</h2>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-primary">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Users" value={analytics?.totalUsers ?? 0} icon={<Users className="text-primary" size={28}/>} />
                <StatCard title="Total Halls" value={analytics?.totalHalls ?? 0} icon={<Building className="text-primary" size={28}/>} />
                <StatCard title="Total Bookings" value={analytics?.totalBookings ?? 0} icon={<BookOpen className="text-primary" size={28}/>} />
                <StatCard title="Total Revenue" value={`$${analytics?.totalRevenue.toLocaleString() ?? 0}`} icon={<DollarSign className="text-primary" size={28}/>} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={analytics?.monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#295FA7" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default withAuth(AdminDashboardPage, ["super-admin"]);
