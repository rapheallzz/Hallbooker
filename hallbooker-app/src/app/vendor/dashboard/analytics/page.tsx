"use client";
import React from 'react';
import EnhancedAnalytics from '@/components/vendor/EnhancedAnalytics';
import withAuth from '@/components/auth/withAuth';

const AnalyticsPage = () => {
  return <EnhancedAnalytics />;
};

export default withAuth(AnalyticsPage, ['hall-owner']);
