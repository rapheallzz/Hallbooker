"use client";
import React from 'react';
import EnhancedAnalytics from '@/components/vendor/EnhancedAnalytics';
import StaffDashboard from '@/components/vendor/StaffDashboard';
import { useAuth } from '@/context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.activeRole === 'staff') {
    return <StaffDashboard />;
  }

  return <EnhancedAnalytics />;
};

export default DashboardPage;
