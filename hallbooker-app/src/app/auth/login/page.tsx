'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      const { accessToken, user } = response.data.data || response.data;

      // Ensure the user object has a fullName property
      if (user && !user.fullName && user.firstName && user.lastName) {
        user.fullName = `${user.firstName} ${user.lastName}`;
      }

      login(accessToken, user);

      // Redirect based on role
      if (user.role.includes('super-admin')) {
        router.push('/admin/dashboard');
      } else if (user.role.includes('hall-owner') || user.role.includes('staff')) {
        router.push('/vendor/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Login to your Account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Login as</label>
            <div className="flex items-center mt-2 space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">User</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="hall-owner"
                  checked={formData.role === 'hall-owner'}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Hall Owner</span>
              </label>
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-600">
              {error}
              {error.includes('does not have the hall-owner role') && (
                <p>
                  Please sign in as a normal user and apply to become a hall owner.
                </p>
              )}
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;