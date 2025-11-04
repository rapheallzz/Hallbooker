'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ComponentType } from 'react';

type Role = 'user' | 'hall-owner' | 'super-admin' | 'staff';

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
        } else if (!user.role || !user.role.some(role => allowedRoles.includes(role))) {
          // Redirect to a relevant page based on role if they try to access a forbidden page
          if (user.role && user.role.includes('super-admin')) {
            router.replace('/admin/dashboard');
          } else if (user.role && (user.role.includes('hall-owner') || user.role.includes('staff'))) {
            router.replace('/vendor/dashboard');
          } else {
            router.replace('/');
          }
        }
      }
    }, [user, loading, router]);

    // Render a loading state while checking auth and permissions
    if (loading || !user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      );
    }

    // Once loaded, if user doesn't have the right role, they will be redirected by the useEffect.
    // We can show a loading state or nothing while the redirect happens.
    if (!user.role || !user.role.some(role => allowedRoles.includes(role))) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Redirecting...</p>
        </div>
      );
    }

    // If everything is fine, render the component.
    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
