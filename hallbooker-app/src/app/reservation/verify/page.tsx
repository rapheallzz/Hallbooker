'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyReservationContent = () => {
  const [verificationStatus, setVerificationStatus] = useState<{ status: 'loading' | 'success' | 'error'; message: string }>({
    status: 'loading',
    message: 'Verifying your reservation...',
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const reference = searchParams.get('paymentReference');
    if (reference) {
      const verify = async () => {
        try {
          const response = await api.get(`/reservations/verify?paymentReference=${reference}`);
          if (response.data.success) {
            setVerificationStatus({ status: 'success', message: 'Your reservation has been confirmed successfully!' });
            setTimeout(() => {
              router.push('/bookings');
            }, 3000);
          } else {
            setVerificationStatus({ status: 'error', message: response.data.message || 'Reservation verification failed.' });
          }
        } catch (error) {
          setVerificationStatus({ status: 'error', message: 'An error occurred during reservation verification.' });
        }
      };
      verify();
    } else {
      setVerificationStatus({ status: 'error', message: 'No reservation reference found.' });
    }
  }, [searchParams, router]);

  const renderIcon = () => {
    switch (verificationStatus.status) {
      case 'loading':
        return <Loader className="animate-spin text-blue-500" size={64} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={64} />;
      case 'error':
        return <XCircle className="text-red-500" size={64} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-md w-full">
        <div className="mb-6 flex justify-center">
          {renderIcon()}
        </div>
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">Reservation Verification</h1>
        <p className="text-gray-600 mb-8">{verificationStatus.message}</p>
        <button
          onClick={() => router.push('/')}
          className="w-full bg-[#295FA7] hover:bg-[#204a8a] text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

const VerifyReservationPage = () => {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-md w-full">
          <Loader className="animate-spin text-blue-500 mx-auto" size={64} />
          <h1 className="text-2xl font-semibold mt-4 text-gray-800">Loading...</h1>
        </div>
      </div>
    }>
      <VerifyReservationContent />
    </Suspense>
  );
};

export default VerifyReservationPage;
