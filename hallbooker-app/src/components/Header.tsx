"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useState, useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import useScroll from "@/hooks/useScroll";
import CollapsedSearchBar from "./CollapsedSearchBar";
import NotificationIcon from "./notifications/NotificationIcon";
import NotificationDropdown from "./notifications/NotificationDropdown";
import TermsOfServiceModal from "./TermsOfServiceModal";

const Header = () => {
  const { user, logout, updateToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const scrolled = useScroll(100);
  useOnClickOutside(dropdownRef, () => setDropdownOpen(false));
  useOnClickOutside(notificationDropdownRef, () =>
    setNotificationDropdownOpen(false)
  );

  const handleApply = async () => {
    setLoading(true);
    setMessage("");
    try {
      await api.post("/users/apply-hall-owner", { hasReadTermsOfService: true });
      setMessage("Application successful!");
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
        setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const dashboardUrl = user?.role?.includes('hall-owner') ? '/vendor/dashboard' : '/bookings';

  const handleRoleSwitch = async (role: string) => {
    try {
      const response = await api.post('/auth/switch-role', { role });
      const { accessToken } = response.data.data;
      updateToken(accessToken);

      // Redirect based on the new role
      console.log(`Redirecting to /admin/dashboard for role: ${role}`);
      if (role === 'super-admin') {
        router.push('/admin/dashboard');
      } else if (role === 'hall-owner' || role === 'staff') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error("Failed to switch role", error.response?.data || error.message);
    }
  };

  const renderBecomeOwnerButton = () => {
    if (!user) {
      return (
        <Link href="/auth/register" className="text-gray-600 hover:text-gray-900">
          Become an owner
        </Link>
      );
    }

    if (user.role?.includes('hall-owner')) {
      return null; // Don't show the button if the user is already a hall owner
    }

    if (user.status === 'pending') {
      return (
        <button disabled className="text-gray-600 cursor-not-allowed">
          Pending
        </button>
      );
    }

    if (user.status === 'not-applied') {
      return (
        <button
          onClick={() => setIsTermsModalOpen(true)}
          disabled={loading}
          className="text-gray-600 hover:text-gray-900"
        >
          {loading ? "Applying..." : "Become an owner"}
        </button>
      );
    }

    return null;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent shadow-none'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              HallBooker
            </Link>
          </div>

          {scrolled && (
            <div className="flex-grow">
              <CollapsedSearchBar onSearchClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            </div>
          )}

          <div className="flex items-center space-x-4">
            {renderBecomeOwnerButton()}
            {message && <p>{message}</p>}
             {isTermsModalOpen && (
              <TermsOfServiceModal
                onClose={() => setIsTermsModalOpen(false)}
                onContinue={() => {
                  setIsTermsModalOpen(false);
                  handleApply();
                }}
              />
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <div
                  className="relative"
                  ref={notificationDropdownRef}
                >
                  <button
                    onClick={() =>
                      setNotificationDropdownOpen(!notificationDropdownOpen)
                    }
                  >
                    <NotificationIcon />
                  </button>
                  {notificationDropdownOpen && <NotificationDropdown />}
                </div>
                <div className="flex items-center" ref={dropdownRef}>
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full" title={user?.fullName || user?.email}>
                    <span className="text-lg font-semibold text-gray-600">
                      {(user?.fullName || user?.email || "").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      data-testid="user-dropdown-button"
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
                          {user.role && user.role.length > 1 && (
                            <div className="relative">
                              <button
                                onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                              >
                                Switch Role
                              </button>
                              {roleSwitchOpen && (
                                <div className="absolute left-full top-0 w-48 mt-[-2.5rem] origin-top-right bg-white rounded-md shadow-lg">
                                  <div className="py-1">
                                    {user.role.map((role) => (
                                      <button
                                        key={role}
                                        onClick={() => handleRoleSwitch(role)}
                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                      >
                                        {role}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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
