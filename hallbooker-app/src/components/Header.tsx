"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              HallBooker
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={handleApply}
                disabled={loading}
                className="text-gray-600 hover:text-gray-900"
              >
                {loading ? "Applying..." : "Become a owner"}
              </button>
            ) : (
              <Link
                href="/auth/register"
                className="text-gray-600 hover:text-gray-900"
              >
                Become a owner
              </Link>
            )}

            {message && <p>{message}</p>}
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.firstName}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm bg-secondary"
                >
                  Logout
                </button>
              </>
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
