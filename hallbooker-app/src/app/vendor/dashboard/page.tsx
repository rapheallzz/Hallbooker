"use client";
import withAuth from "@/components/auth/withAuth";
import type { NextPage } from "next";


const VendorDashboardPage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Vendor Dashboard</h1>
      <p>This is where you can manage your venues.</p>
    </div>
  );
};

export default withAuth(VendorDashboardPage, ["venue-owner"]);
