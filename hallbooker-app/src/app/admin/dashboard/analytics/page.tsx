"use client";
import React from 'react';
import AdminEnhancedAnalytics from '@/components/admin/AdminEnhancedAnalytics';
import withAuth from "@/components/auth/withAuth";

const AnalyticsPage = () => {
  return <AdminEnhancedAnalytics />;
};

export default withAuth(AnalyticsPage, ["super-admin"]);
