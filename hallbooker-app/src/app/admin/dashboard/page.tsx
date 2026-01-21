"use client";
import React from 'react';
import AdminEnhancedAnalytics from '@/components/admin/AdminEnhancedAnalytics';
import withAuth from "@/components/auth/withAuth";

const AdminDashboardPage = () => {
  return <AdminEnhancedAnalytics />;
};

export default withAuth(AdminDashboardPage, ["super-admin"]);
