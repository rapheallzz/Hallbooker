'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';

const VerifyEmailPage = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const router = useRouter();

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Please enter the verification token.');
      return;
    }

    try {
      await api.post('/auth/verify-email', { token });
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during verification.');
    }
  };

  const handleResendToken = async () => {
    setError('');
    setResendStatus('Sending...');
    try {
      await api.post('/auth/resend-verify-email');
      setResendStatus('A new verification token has been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while resending the token.');
      setResendStatus('');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side with background image */}
      <div
        className="hidden lg:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url(/hall_default.jpg)" }}
      >
      </div>

      {/* Right side with the form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">Verify Your Email</h2>
          <p className="text-center text-gray-600">
            A verification token has been sent to your email. Please enter it below.
          </p>
          <form className="space-y-6" onSubmit={handleVerifySubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Token</label>
              <input
                type="text"
                name="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {error && <p className="text-sm text-center text-red-600">{error}</p>}
            {success && <p className="text-sm text-center text-green-600">{success}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Verify Email
            </button>
          </form>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the token?{' '}
              <button
                onClick={handleResendToken}
                className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                disabled={resendStatus === 'Sending...'}
              >
                Resend Token
              </button>
            </p>
            {resendStatus && <p className="text-sm text-center text-green-600 mt-2">{resendStatus}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
