"use client";
import React, { useState } from "react";
import BookingsView from "./BookingsView";
import RecommendationsView from "./RecommendationsView";
import SettingsView from "./SettingsView";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
          <nav className="mt-4">
            <ul className="flex space-x-4 border-b">
              <li
                className={`cursor-pointer py-2 px-4 ${
                  activeTab === "bookings"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("bookings")}
              >
                My Bookings
              </li>
              <li
                className={`cursor-pointer py-2 px-4 ${
                  activeTab === "recommendations"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("recommendations")}
              >
                Recommended Halls
              </li>
              <li
                className={`cursor-pointer py-2 px-4 ${
                  activeTab === "settings"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                Profile Settings
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {activeTab === "bookings" && <BookingsView />}
        {activeTab === "recommendations" && <RecommendationsView />}
        {activeTab === "settings" && <SettingsView />}
      </main>
    </div>
  );
};

export default Dashboard;
