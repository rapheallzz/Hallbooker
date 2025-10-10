'use client';

import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/context/AuthContext';

const VendorDashboardPage = () => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Vendor Dashboard</h1>
      <p className="mt-4">Welcome, Venue Owner/Staff!</p>
      <button
        onClick={logout}
        className="px-4 py-2 mt-8 text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default withAuth(VendorDashboardPage, ['venue-owner', 'staff']);