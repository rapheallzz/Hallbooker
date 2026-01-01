'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import api from '@/services/api';
import { jwtDecode } from 'jwt-decode';

// Define the shape of the decoded token
interface DecodedToken {
  activeRole: string;
  // ... other properties from the token
}

const LoginPage = () => {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { ...formData, role });
      const { accessToken, user } = response.data.data || response.data;

      // The user's selected role on the login page should be the source of truth for the initial activeRole.
      // This overrides the potentially incorrect activeRole sent from the backend.
      const userWithActiveRole = {
        ...user,
        activeRole: role,
      };

      // Ensure the user object has a fullName property for consistency
      if (userWithActiveRole && !userWithActiveRole.fullName && userWithActiveRole.firstName && userWithActiveRole.lastName) {
        userWithActiveRole.fullName = `${userWithActiveRole.firstName} ${userWithActiveRole.lastName}`;
      }

      // The login function in AuthContext will now handle the redirect
      login(accessToken, userWithActiveRole);

    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">Login to your Account</h2>

        {/* Role selection tabs */}
        <div className="flex justify-center border-b space-x-8">
          <button
            className={`px-4 py-2 text-sm font-medium ${role === 'user' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setRole('user')}
          >
            User
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${role === 'hall-owner' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setRole('hall-owner')}
          >
            An Owner
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-sm text-center">
          <Link href="/auth/forgot-password"  className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot credentials?
          </Link>
        </div>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
