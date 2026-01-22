"use client";
import React, { useState } from "react";
import BookingsView from "./BookingsView";
import RecommendationsView from "./RecommendationsView";
import SettingsView from "./SettingsView";
import ReservationsList from "@/components/ReservationsList";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <nav className="mt-20 lg:mt-24 -mx-4 px-4 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar border-b">
          <ul className="flex space-x-2 lg:space-x-4 whitespace-nowrap">
            <li
              className={`cursor-pointer py-3 lg:py-2 px-3 lg:px-4 text-sm lg:text-base font-medium transition-colors ${
                activeTab === "bookings"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("bookings")}
            >
              My Bookings
            </li>
            <li
              className={`cursor-pointer py-3 lg:py-2 px-3 lg:px-4 text-sm lg:text-base font-medium transition-colors ${
                activeTab === "reservations"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("reservations")}
            >
              My Reservations
            </li>
            <li
              className={`cursor-pointer py-3 lg:py-2 px-3 lg:px-4 text-sm lg:text-base font-medium transition-colors ${
                activeTab === "recommendations"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("recommendations")}
            >
              Recommended Halls
            </li>
            <li
              className={`cursor-pointer py-3 lg:py-2 px-3 lg:px-4 text-sm lg:text-base font-medium transition-colors ${
                activeTab === "settings"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              Profile Settings
            </li>
          </ul>
        </nav>
        <main className="py-8">
          {activeTab === "bookings" && <BookingsView />}
          {activeTab === "reservations" && <ReservationsList />}
          {activeTab === "recommendations" && <RecommendationsView />}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
