"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useState, useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";

import useScroll from "@/hooks/useScroll";
import CollapsedSearchBar from "./CollapsedSearchBar";

interface HeaderProps {
  onSearchClick: () => void;
}

const Header = ({ onSearchClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrolled = useScroll(100);
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          <div className="flex-shrink-0">
            <Link href="/" className={`text-2xl font-bold transition-colors ${scrolled ? 'text-primary' : 'text-white'}`}>
              HallBooker
            </Link>
          </div>

          {scrolled && (
            <div className="flex-grow">
              <CollapsedSearchBar onSearchClick={onSearchClick} />
            </div>
          )}

          <div className="flex items-center space-x-4">
            {!user ? (
              <Link
                href="/auth/register"
                className={`transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-gray-200'}`}
              >
                Become an owner
              </Link>
            ) : user.role !== 'venue-owner' ? (
              <button
                onClick={handleApply}
                disabled={loading}
                className={`transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-gray-200'}`}
              >
                {loading ? "Applying..." : "Become an owner"}
              </button>
            ) : null}

            {message && <p>{message}</p>}
            {user ? (
              <div className="flex items-center" ref={dropdownRef}>
                <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full" title={user.fullName || user.email}>
                  <span className="text-lg font-semibold text-gray-600">
                    {(user.fullName || user.email || '').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-800"
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
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm bg-primary"
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
