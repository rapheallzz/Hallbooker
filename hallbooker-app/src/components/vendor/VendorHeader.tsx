"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, User as UserIcon, Plus, ChevronDown, Building, Calendar, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useRouter } from "next/navigation";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import NotificationIcon from "../notifications/NotificationIcon";
import NotificationDropdown from "../notifications/NotificationDropdown";

const placeholders = [
  "Search for Hall names...",
  "Search for Booking IDs...",
  "Search for Customer names...",
  "Search for Staff members...",
];

const VendorHeader = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { openHallModal, openStaffModal, openBookingModal } = useUI();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));
  useOnClickOutside(notificationDropdownRef, () =>
    setNotificationDropdownOpen(false)
  );
  useOnClickOutside(searchRef, () => setShowSearchSuggestions(false));

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (path: string) => {
    if (searchQuery.trim()) {
      router.push(`${path}?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchSuggestions(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // Default to halls if on Enter
      handleSearch("/vendor/dashboard/halls");
    }
  };

  const suggestions = [
    { label: "Search in Halls", icon: Building, path: "/vendor/dashboard/halls" },
    { label: "Search in Bookings", icon: Calendar, path: "/vendor/dashboard/bookings" },
    { label: "Search in Staff", icon: Users, path: "/vendor/dashboard/staff" },
  ];

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      <div className="flex items-center w-1/3 relative" ref={searchRef}>
        <div className="relative w-full">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchSuggestions(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholders[placeholderIndex]}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full text-gray-600 transition-all duration-300"
          />
        </div>
        {showSearchSuggestions && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="p-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
              Suggestions
            </div>
            <ul>
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleSearch(s.path)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-primary/5 flex items-center space-x-3 transition-colors"
                  >
                    <s.icon size={18} className="text-gray-400" />
                    <span>{s.label} <span className="font-bold text-primary">&quot;{searchQuery}&quot;</span></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create</span>
            <ChevronDown size={16} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => {
                      openHallModal();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Create Hall
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      openStaffModal();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Add Staff
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      openBookingModal();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Walk-In/Recurring Booking
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
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
              <p className="text-xs text-gray-500 capitalize">{(user.activeRole || user.role[0] || '').replace('-', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
