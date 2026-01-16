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

const ReservationAnalyticsCard: React.FC<ReservationAnalyticsCardProps> = ({ analytics }) => {
  if (!analytics) {
    return null;
  }

  const stats = [
    { title: "New Reservations", value: analytics.new, icon: Briefcase },
    { title: "Converted Reservations", value: analytics.converted, icon: CheckCircle },
    { title: "Expired Reservations", value: analytics.expired, icon: XCircle },
    { title: "Active Reservations", value: analytics.active, icon: Clock },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Reservation Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center space-x-4 p-2">
              <div className="bg-gray-100 p-3 rounded-full">
                <Icon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservationAnalyticsCard;
