'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';

const VerifyPaymentContent = () => {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) {
      const verify = async () => {
        try {
          const response = await api.get(`/payments/verify?reference=${reference}`);
          setPaymentStatus(response.data.message);
        } catch (error) {
          setPaymentStatus('Payment verification failed.');
        } finally {
          setLoading(false);
        }
      };
      verify();
    } else {
      setPaymentStatus('No payment reference found.');
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return <div>Verifying payment...</div>;
  }

  return (
    <div>
      <h1>Payment Status</h1>
      <p>{paymentStatus}</p>
    </div>
  );
};

const VerifyPaymentPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPaymentContent />
    </Suspense>
  );
};

export default VerifyPaymentPage;
