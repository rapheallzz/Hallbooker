"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import BookingsView from "./BookingsView";
import RecommendationsView from "./RecommendationsView";
import SettingsView from "./SettingsView";

const UserProfile = () => {
  const [activeView, setActiveView] = useState("bookings");

  return (
    <div className="flex">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 p-8">
        {activeView === "bookings" && <BookingsView />}
        {activeView === "recommendations" && <RecommendationsView />}
        {activeView === "settings" && <SettingsView />}
      </div>
    </div>
  );
};

export default UserProfile;
