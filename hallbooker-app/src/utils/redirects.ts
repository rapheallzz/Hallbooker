export const getDashboardPath = (role: string | undefined): string => {
  if (!role) {
    return '/'; // Default path if role is not defined
  }

  switch (role) {
    case 'super-admin':
      return '/admin/dashboard';
    case 'hall-owner':
    case 'staff':
      return '/vendor/dashboard';
    case 'user':
      return '/bookings';
    default:
      return '/'; // Fallback for any other roles
  }
};
