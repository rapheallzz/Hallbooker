"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  } | string;
  bookingId?: string;
  reservationId?: string;
  startTime?: string;
  endTime?: string;
  bookingDates?: { startTime: string; endTime: string }[];
  totalPrice: number;
  selectedFacilities?: {
    name: string;
    quantity: number;
    cost: number;
  }[];
}

const BookingSuccessfulPage = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const storedBookingData = localStorage.getItem("bookingConfirmation");
      if (storedBookingData) {
        try {
          const data = JSON.parse(storedBookingData);

          // If hall is just an ID, fetch the full hall details
          if (data.hall && typeof data.hall === 'string') {
            try {
              const hallResponse = await api.get(`/halls/${data.hall}`);
              data.hall = hallResponse.data.data;
            } catch (hallError) {
              console.error("Failed to fetch hall details", hallError);
              // Proceed with just the ID
            }
          }

          setBookingDetails(data);
          localStorage.removeItem("bookingConfirmation");
        } catch (error) {
          console.error("Failed to parse booking data from localStorage", error);
          router.push("/");
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !bookingDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading booking details...</p>
      </div>
    );
  }

  const displayId = bookingDetails.reservationId || bookingDetails.bookingId;
  const startTime = bookingDetails.startTime || bookingDetails.bookingDates?.[0]?.startTime;
  const endTime = bookingDetails.endTime || bookingDetails.bookingDates?.[0]?.endTime;
  const hallName = typeof bookingDetails.hall === 'object' ? bookingDetails.hall.name : 'Not Available';
  const hallLocation = typeof bookingDetails.hall === 'object' ? bookingDetails.hall.location : 'Not Available';


  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
            Booking Confirmed!
          </h1>
          <p className="mt-2 text-md text-gray-600">
            Thank you. Your transaction was successful.
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

          {bookingDetails.selectedFacilities && bookingDetails.selectedFacilities.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">
                Selected Facilities
              </h3>
              <ul className="mt-4 border border-gray-200 rounded-md divide-y divide-gray-200">
                {bookingDetails.selectedFacilities.map((facility, index) => (
                  <li
                    key={index}
                    className="pl-4 pr-6 py-3 flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 flex items-center">
                      <span className="font-medium text-gray-800">
                        {facility.name} (x{facility.quantity})
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
                ₦{(bookingDetails.totalPrice || 0).toLocaleString()}
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

export default BookingSuccessfulPage;
