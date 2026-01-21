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
    { title: "New", value: analytics.new, icon: Briefcase },
    { title: "Converted", value: analytics.converted, icon: CheckCircle },
    { title: "Expired", value: analytics.expired, icon: XCircle },
    { title: "Active", value: analytics.active, icon: Clock },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 flex flex-col justify-center">
      <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider text-center">Reservations</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center space-x-2 p-1">
              <div className="bg-gray-50 p-2 rounded-full hidden sm:block">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-medium">{stat.title}</p>
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservationAnalyticsCard;
