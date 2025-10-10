'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ComponentType } from 'react';

type Role = 'user' | 'venue-owner' | 'super-admin' | 'staff';

const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: Role[]
) => {
  const AuthComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.replace('/auth/login');
        } else if (!allowedRoles.includes(user.role)) {
          // Redirect to a relevant page based on role if they try to access a forbidden page
          if (user.role === 'super-admin') {
            router.replace('/admin/dashboard');
          } else if (user.role === 'venue-owner' || user.role === 'staff') {
            router.replace('/vendor/dashboard');
          } else {
            router.replace('/');
          }
        }
      }
    }, [user, loading, router]);

    if (loading || !user || !allowedRoles.includes(user.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;