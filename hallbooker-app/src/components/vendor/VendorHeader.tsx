"use client";
import React from "react";
import { Menu, Search, Bell, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface VendorHeaderProps {
  toggleSidebar: () => void;
}

const VendorHeader: React.FC<VendorHeaderProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-gray-500 lg:hidden">
          <Menu size={24} />
        </button>
        <div className="relative ml-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
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
              <p className="font-semibold text-sm">{user.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('-', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
