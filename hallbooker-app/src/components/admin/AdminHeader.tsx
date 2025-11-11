"use client";
import React, { useState, useRef } from "react";
import { Search, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import NotificationIcon from "../notifications/NotificationIcon";
import NotificationDropdown from "../notifications/NotificationDropdown";

const AdminHeader = () => {
  const { user } = useAuth();
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);

  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(notificationDropdownRef, () =>
    setNotificationDropdownOpen(false)
  );

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Super Admin Dashboard</h1>
      </div>
      <div className="flex items-center w-1/3">
        <div className="relative w-full">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div
          className="relative"
          ref={notificationDropdownRef}
        >
          <button
            onClick={() =>
              setNotificationDropdownOpen(!notificationDropdownOpen)
            }
            className="text-gray-500 relative"
            data-testid="notification-button"
          >
            <NotificationIcon />
          </button>
          {notificationDropdownOpen && <NotificationDropdown />}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <UserIcon size={24} className="text-gray-600" />
          </div>
          {user && (
            <div>
              <p className="font-semibold text-sm text-gray-700">{user.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">Super Admin</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
