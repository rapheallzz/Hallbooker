"use client";
import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import withAuth from "@/components/auth/withAuth";
import { UIProvider } from "@/context/UIContext";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UIProvider>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
            {children}
          </main>
        </div>
      </div>
    </UIProvider>
  );
};

export default withAuth(AdminLayout, ["super-admin"]);
