"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

// Define a type for the booking details for better type safety
interface BookingDetails {
  hall: {
    name: string;
  } | string;
  bookingDates?: {
    startTime: string;
    endTime: string;
  }[];
  startTime?: string;
  endTime?: string;
  totalAmount: number;
  paymentReference: string;
  selectedFacilities?: {
    name: string; // Corrected structure
    quantity: number;
  }[];
}

const BookingSuccessPage = () => {
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingData = localStorage.getItem("bookingSuccessData");
    if (bookingData) {
      try {
        setBookingDetails(JSON.parse(bookingData));
        // Clear the data after reading to prevent re-display on refresh
        localStorage.removeItem("bookingSuccessData");
      } catch (error) {
        console.error("Failed to parse booking data:", error);
        router.push("/");
      }
    } else {
      // If no booking data is found, redirect to the homepage
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  if (loading || !bookingDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  const {
    hall,
    totalAmount,
    paymentReference,
    selectedFacilities,
  } = bookingDetails;

  // Defensively get the hall name
  const hallName = typeof hall === 'object' && hall !== null ? hall.name : 'Hall';

  // Normalize booking dates
  const datesToDisplay = bookingDetails.bookingDates && bookingDetails.bookingDates.length > 0
    ? bookingDetails.bookingDates
    : (bookingDetails.startTime && bookingDetails.endTime
      ? [{ startTime: bookingDetails.startTime, endTime: bookingDetails.endTime }]
      : []);


  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg my-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
            Booking Successful!
          </h1>
          <p className="mt-2 text-md text-gray-600">
            Thank you for your payment. Your booking is confirmed.
          </p>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Booking Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Hall Name:</span>
              <span className="text-gray-900 font-semibold">{hallName}</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Booking Dates:</h3>
              {datesToDisplay.map((date, index) => (
                <div key={index} className="text-sm text-gray-800">
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(date.startTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {new Date(date.endTime).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {selectedFacilities && selectedFacilities.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">
                  Booked Facilities:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                  {selectedFacilities.map((item, index) => (
                    <li key={index}>
                      {item.name} (Quantity: {item.quantity})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">
                Total Amount Paid:
              </span>
              <span className="text-primary font-bold text-lg">
                ₦{totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">
                Payment Reference:
              </span>
              <span className="text-gray-900 font-mono text-sm">
                {paymentReference}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/bookings"
            className="w-full sm:w-auto text-center bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
          >
            View All My Bookings
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto text-center bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-300 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
