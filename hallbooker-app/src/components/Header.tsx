"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useState, useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";

const Header = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setDropdownOpen(false));

  const handleApply = async () => {
    setLoading(true);
    setMessage("");
    try {
      await api.post("/users/apply-hall-owner");
      setMessage("Application successful!");
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dashboardUrl = user?.role === 'venue-owner' ? '/vendor/dashboard' : '/bookings';

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-[theme(colors.primary)]">
              HallBooker
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!user ? (
              <Link
                href="/auth/register"
                className="text-gray-600 hover:text-gray-900"
              >
                Become an owner
              </Link>
            ) : user.role !== 'venue-owner' ? (
              <button
                onClick={handleApply}
                disabled={loading}
                className="text-gray-600 hover:text-gray-900"
              >
                {loading ? "Applying..." : "Become an owner"}
              </button>
            ) : null}

            {message && <p>{message}</p>}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center px-3 py-2 space-x-2 bg-gray-200 rounded-full"
                >
                  <span className="text-lg font-semibold text-gray-600">
                    {(user.firstName || user.email || '').charAt(0).toUpperCase()}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg">
                    <div className="py-1">
                      <Link
                        href={dashboardUrl}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm bg-[theme(colors.primary)]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
