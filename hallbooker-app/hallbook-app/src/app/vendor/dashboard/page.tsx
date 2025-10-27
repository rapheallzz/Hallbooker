"use client";
import React from "react";

const DashboardPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-primary">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-2">Total Halls</h2>
          <p className="text-3xl">5</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-2">Total Bookings</h2>
          <p className="text-3xl">120</p>
        </div>
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-2">Revenue</h2>
          <p className="text-3xl">$50,000</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
