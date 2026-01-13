"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import api from "@/services/api";

// Define a type for the booking data for type safety
interface BookingDetails {
  _id: string;
  hall?: {
    _id: string;
    name: string;
    location: string;
  };
  bookingId?: string;
  reservationId?: string;
  startTime?: string;
  endTime?: string;
  bookingDates?: { startTime: string; endTime: string }[];
  totalPrice: number;
  selectedFacilities?: {
    facility: {
        name: string;
    }
    quantity: number;
    cost: number;
  }[];
}

const PaymentSuccessContent = () => {
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchDetails = async () => {
      const bookingId = searchParams.get("bookingId");
      const reservationId = searchParams.get("reservationId");
      const id = bookingId || reservationId;

      if (!id) {
        router.push("/");
        return;
      }

      const endpoint = `/bookings/search/${id}`;

      try {
        const response = await api.get(endpoint);
        setDetails(response.data.data);
      } catch (err) {
        console.error("Failed to fetch details", err);
        setError("Failed to load booking/reservation details.");
        // Optional: redirect on error after a delay
        // setTimeout(() => router.push('/'), 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [searchParams, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <p className="text-red-500 text-lg">{error}</p>
        <Link href="/" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Go to Homepage
        </Link>
      </div>
    );
  }

  if (!details) {
    return null; // Or some fallback UI
  }

  const displayId = details.reservationId || details.bookingId;
  const startTime = details.startTime || details.bookingDates?.[0]?.startTime;
  const endTime = details.endTime || details.bookingDates?.[0]?.endTime;
  const hallName = details.hall?.name || 'Not Available';
  const hallLocation = details.hall?.location || 'Not Available';

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h1>
          <p className="mt-2 text-md text-gray-600">
            Thank you. Your transaction was successful and your booking is confirmed.
          </p>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="col-span-1">
              <dt className="text-sm font-medium text-gray-500">Reference ID</dt>
              <dd className="mt-1 text-md text-gray-900">
                {displayId}
              </dd>
            </div>
            <div className="col-span-1">
              <dt className="text-sm font-medium text-gray-500">Hall Name</dt>
              <dd className="mt-1 text-md text-gray-900">
                {hallName}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-md text-gray-900">
                {hallLocation}
              </dd>
            </div>
            {startTime && (<div className="col-span-1">
              <dt className="text-sm font-medium text-gray-500">Start Time</dt>
              <dd className="mt-1 text-md text-gray-900">
                {new Date(startTime).toLocaleString()}
              </dd>
            </div>)}
            {endTime && (<div className="col-span-1">
              <dt className="text-sm font-medium text-gray-500">End Time</dt>
              <dd className="mt-1 text-md text-gray-900">
                {new Date(endTime).toLocaleString()}
              </dd>
            </div>)}
          </dl>

          {details.selectedFacilities && details.selectedFacilities.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">
                Selected Facilities
              </h3>
              <ul className="mt-4 border border-gray-200 rounded-md divide-y divide-gray-200">
                {details.selectedFacilities.map((facility, index) => (
                  <li
                    key={index}
                    className="pl-4 pr-6 py-3 flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 flex items-center">
                      <span className="font-medium text-gray-800">
                        {facility.facility.name} (x{facility.quantity})
                      </span>
                    </div>
                    <span className="text-gray-600">
                      ₦{facility.cost.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-end items-center">
              <p className="text-lg font-bold text-gray-900">Total Price:</p>
              <p className="ml-4 text-2xl font-bold text-primary">
                ₦{(details.totalPrice || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row-reverse sm:justify-start gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Print Receipt
          </button>
          <Link
            href="/bookings"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Go to My Bookings
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};


const PaymentSuccessPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    )
}

export default PaymentSuccessPage;