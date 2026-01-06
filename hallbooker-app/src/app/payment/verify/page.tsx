'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyPaymentContent = () => {
  const [paymentStatus, setPaymentStatus] = useState<{ status: 'loading' | 'success' | 'error'; message: string }>({
    status: 'loading',
    message: 'Verifying your payment...',
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const reference = searchParams.get('paymentReference');
    if (reference) {
      const verify = async () => {
        try {
          const response = await api.get(`/payments/verify?paymentReference=${reference}`);
          if (response.data.success && response.data.data) {
            // On success, store booking data and redirect
            localStorage.setItem('bookingSuccessData', JSON.stringify(response.data.data));
            router.push('/booking/successdetails');
          } else {
            // Handle verification failure
            setPaymentStatus({ status: 'error', message: response.data.message || 'Payment verification failed.' });
          }
        } catch (error) {
          // Handle API call error
          setPaymentStatus({ status: 'error', message: 'An error occurred during payment verification.' });
        }
      };
      verify();
    } else {
      setPaymentStatus({ status: 'error', message: 'No payment reference found.' });
    }
  }, [searchParams, router]);

  // The UI will primarily show loading or error states.
  // The success state is handled by redirecting.
  if (paymentStatus.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="mb-6 flex justify-center">
            <Loader className="animate-spin text-blue-500" size={64} />
          </div>
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">Payment Verification</h1>
          <p className="text-gray-600 mb-8">{paymentStatus.message}</p>
        </div>
      </div>
    );
  }

  if (paymentStatus.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="mb-6 flex justify-center">
            <XCircle className="text-red-500" size={64} />
          </div>
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">Verification Failed</h1>
          <p className="text-gray-600 mb-8">{paymentStatus.message}</p>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#295FA7] hover:bg-[#204a8a] text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Fallback for success case before redirect, though it may not be visible for long
  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-md w-full">
            <div className="mb-6 flex justify-center">
                <CheckCircle className="text-green-500" size={64} />
            </div>
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">Payment Verified</h1>
            <p className="text-gray-600 mb-8">Redirecting...</p>
        </div>
      </div>
  );
};

const VerifyPaymentPage = () => {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-md w-full">
          <Loader className="animate-spin text-blue-500 mx-auto" size={64} />
          <h1 className="text-2xl font-semibold mt-4 text-gray-800">Loading...</h1>
        </div>
      </div>
    }>
      <VerifyPaymentContent />
    </Suspense>
  );
};

export default VerifyPaymentPage;
