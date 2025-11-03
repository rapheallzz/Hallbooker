"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, User as UserIcon, Plus, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import useOnClickOutside from "@/hooks/useOnClickOutside";

const VendorHeader = () => {
  const { user } = useAuth();
  const { openHallModal, openStaffModal } = useUI();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
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
              </ul>
            </div>
          )}
        </div>
        <button className="text-gray-500 relative">
          <Bell size={24} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <UserIcon size={24} className="text-gray-600" />
          </div>
          {user && (
            <div>
              <p className="font-semibold text-sm text-gray-700">{user.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{(user.role[0] || '').replace('-', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
