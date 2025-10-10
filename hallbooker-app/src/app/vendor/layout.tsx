'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/context/AuthContext';

const VendorLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/vendor/dashboard' },
    { name: 'My Venues', href: '/vendor/venues' },
    { name: 'Add Venue', href: '/vendor/venues/new' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <Link href="/vendor/dashboard" className="text-2xl font-bold text-indigo-600">
            Vendor Portal
          </Link>
          <p className="mt-2 text-sm text-gray-600">Welcome, {user?.firstName}</p>
        </div>
        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-6 py-3 ${
                    pathname === item.href
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default withAuth(VendorLayout, ['venue-owner', 'staff']);