"use client";
import React from "react";
import { FaBookmark, FaRegLightbulb, FaCog } from "react-icons/fa";

const Sidebar = ({ activeView, setActiveView }) => {
  return (
    <div className="w-64 h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
      <nav>
        <ul>
          <li
            className={`flex items-center p-2 rounded-md cursor-pointer ${
              activeView === "bookings" ? "bg-primary text-white" : ""
            }`}
            onClick={() => setActiveView("bookings")}
          >
            <FaBookmark className="mr-2" />
            Bookings
          </li>
          <li
            className={`flex items-center p-2 mt-2 rounded-md cursor-pointer ${
              activeView === "recommendations" ? "bg-primary text-white" : ""
            }`}
            onClick={() => setActiveView("recommendations")}
          >
            <FaRegLightbulb className="mr-2" />
            Recommendations
          </li>
          <li
            className={`flex items-center p-2 mt-2 rounded-md cursor-pointer ${
              activeView === "settings" ? "bg-primary text-white" : ""
            }`}
            onClick={() => setActiveView("settings")}
          >
            <FaCog className="mr-2" />
            Settings
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
