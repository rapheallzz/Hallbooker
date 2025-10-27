"use client";
import React from "react";
import Sidebar from "@/components/vendor/Sidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import withAuth from "@/components/auth/withAuth";
import { UIProvider } from "@/context/UIContext";

const VendorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UIProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <VendorHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
            {children}
          </main>
        </div>
      </div>
    </UIProvider>
  );
};

export default withAuth(VendorLayout, ["venue-owner", "staff"]);