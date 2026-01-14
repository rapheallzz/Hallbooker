'use client';

import React from 'react';
import { Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ReservationAnalytics {
  new: number;
  converted: number;
  expired: number;
  active: number;
}

interface ReservationAnalyticsCardProps {
  analytics: ReservationAnalytics;
}

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105">
    <div className="bg-gray-100 p-3 rounded-full"><Icon className="h-6 w-6 text-gray-600" /></div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const ReservationAnalyticsCard: React.FC<ReservationAnalyticsCardProps> = ({ analytics }) => {
  if (!analytics) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="New Reservations" value={analytics.new} icon={Briefcase} />
      <StatCard title="Converted Reservations" value={analytics.converted} icon={CheckCircle} />
      <StatCard title="Expired Reservations" value={analytics.expired} icon={XCircle} />
      <StatCard title="Active Reservations" value={analytics.active} icon={Clock} />
    </div>
  );
};

export default ReservationAnalyticsCard;
