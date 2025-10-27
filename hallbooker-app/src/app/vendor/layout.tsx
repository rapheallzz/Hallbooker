"use client";
import React, { useState } from "react";
import Sidebar from "@/components/vendor/Sidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import withAuth from "@/components/auth/withAuth";

const VendorLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorHeader toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default withAuth(VendorLayout, ["venue-owner", "staff"]);