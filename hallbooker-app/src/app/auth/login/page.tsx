'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login, updateToken } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { ...formData, role });
      const { accessToken, user } = response.data.data || response.data;

      // Ensure the user object has a fullName property
      if (user && !user.fullName && user.firstName && user.lastName) {
        user.fullName = `${user.firstName} ${user.lastName}`;
      }

      login(accessToken, user);

      // If the user is a super-admin, automatically switch to the super-admin role
      if (user.role.includes('super-admin')) {
        try {
          const switchResponse = await api.post('/auth/switch-role', { role: 'super-admin' });
          const newAccessToken = switchResponse.data.data.accessToken;

          updateToken(newAccessToken);

          router.push('/admin/dashboard');
        } catch (switchErr) {
          console.error("Failed to switch to super-admin role:", switchErr);
          setError('Logged in, but failed to switch to super-admin role.');
          return; // Stop execution if role switch fails
        }
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
    <div className="flex min-h-screen">
      {/* Left side with background image */}
      <div
        className="hidden lg:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url(/hall_default.jpg)" }}
      >
        {/* You can add content here if needed, like a logo or tagline */}
      </div>

      {/* Right side with the login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
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
            {error && <p className="text-sm text-red-600">{error}</p>}
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
    </div>
  );
};

export default LoginPage;