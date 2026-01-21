"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

const PaymentFailedPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
          Payment Failed
        </h1>
        <p className="mt-2 text-md text-gray-600">
          We were unable to process your payment. Please try again or contact support if the problem persists.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
