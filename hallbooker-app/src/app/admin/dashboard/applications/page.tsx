"use client";
import React from "react";
import withAuth from "@/components/auth/withAuth";
import HallOwnerApplications from "@/components/admin/HallOwnerApplications";

const ApplicationsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-primary">Hall Owner Applications</h1>
      <HallOwnerApplications />
    </div>
  );
};

export default withAuth(ApplicationsPage, ["super-admin"]);
