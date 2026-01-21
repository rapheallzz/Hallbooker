"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, LogOut, LayoutDashboard, UserCircle, Bell } from "lucide-react";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import useScroll from "@/hooks/useScroll";
import CollapsedSearchBar from "./CollapsedSearchBar";
import NotificationIcon from "./notifications/NotificationIcon";
import NotificationDropdown from "./notifications/NotificationDropdown";
import TermsOfServiceModal from "./TermsOfServiceModal";
import Swal from "sweetalert2";
import { getDashboardPath } from "@/utils/redirects";

const Header = () => {
  const { user, logout, updateToken, updateUserApplicationStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const scrolled = useScroll(100);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  useOnClickOutside(dropdownRef, () => setDropdownOpen(false));
  useOnClickOutside(notificationDropdownRef, () =>
    setNotificationDropdownOpen(false)
  );

  const handleApply = async () => {
    setLoading(true);
    try {
      await api.post("/users/apply-hall-owner", { hasReadTermsOfService: true });
      updateUserApplicationStatus("pending");
      Swal.fire({
        icon: "success",
        title: "Application Submitted!",
        text: "Your application to become a hall owner has been submitted successfully.",
      });
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const errorMessage = err.response?.data?.message || "An error occurred. Please try again.";
        Swal.fire({
          icon: "error",
          title: "Application Failed",
          text: errorMessage,
        });
    } finally {
      setLoading(false);
    }
  };

  const dashboardUrl = getDashboardPath(user?.activeRole || 'user');

  const handleRoleSwitch = async (role: string) => {
    Swal.fire({
      title: "Switching Role",
      text: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await api.post('/auth/switch-role', { role }, { timeout: 15000 }); // 15 second timeout
      const { accessToken } = response.data.data;
      Swal.close();
      updateToken(accessToken);

      // Redirect based on the new role
      const redirectPath = getDashboardPath(role);
      router.push(redirectPath);
    } catch (error: unknown) {
      const err = error as { code?: string; response?: { data?: { message?: string } } };
      let errorMessage = 'An error occurred. Please try again.';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'The request timed out. Please try again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Role Switch Failed',
        text: errorMessage,
      });
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

    // Hide button if user is a hall-owner or super-admin
    if (user.role?.includes('hall-owner') || user.role?.includes('super-admin')) {
      return null;
    }

    // Show button only to users with the "user" role
    if (user.role?.includes('user')) {
      if (user.hallOwnerApplication?.status === 'pending') {
        return (
          <button disabled className="text-gray-600 cursor-not-allowed">
            Pending
          </button>
        );
      }

      if (user.hallOwnerApplication?.status === 'not-applied' || !user.hallOwnerApplication?.status) {
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
              <CollapsedSearchBar />
            </div>
          )}

          <div className="hidden md:flex items-center space-x-4">
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
                                Switch Account
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

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <div className="relative mr-2">
                 <button
                    onClick={() =>
                      setNotificationDropdownOpen(!notificationDropdownOpen)
                    }
                    className="p-2"
                  >
                    <NotificationIcon />
                  </button>
                  {notificationDropdownOpen && (
                    <div className="absolute right-0 mt-2 z-[60]">
                       <NotificationDropdown />
                    </div>
                  )}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2 rounded-md ${scrolled ? 'text-gray-900' : 'text-gray-800 md:text-white'}`}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay & Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] md:hidden"
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl z-[101] md:hidden flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b">
                <span className="text-xl font-bold text-primary">HallBooker</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto py-6 px-4">
                {user ? (
                  <div className="space-y-6">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 pb-6 border-b">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-primary" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-gray-900 truncate">
                          {user.fullName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-2">
                      <Link
                        href={dashboardUrl}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <LayoutDashboard className="w-5 h-5 text-gray-500 group-hover:text-primary" />
                          <span className="font-medium text-gray-700 group-hover:text-primary">Dashboard</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>

                      {user.role && user.role.length > 1 && (
                        <div className="pt-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                            Switch Account
                          </p>
                          <div className="grid grid-cols-1 gap-1">
                            {user.role.map((role) => (
                              <button
                                key={role}
                                onClick={() => handleRoleSwitch(role)}
                                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                                  user.activeRole === role
                                    ? 'bg-primary/5 text-primary'
                                    : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <span className="capitalize">{role}</span>
                                {user.activeRole === role && (
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4">
                        {renderBecomeOwnerButton() && (
                           <div className="p-3">
                             {renderBecomeOwnerButton()}
                           </div>
                        )}
                      </div>
                    </nav>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">Log in to book halls and manage your reservations.</p>
                    <Link
                      href="/auth/login"
                      className="block w-full py-3 text-center bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block w-full py-3 text-center border-2 border-primary text-primary font-bold rounded-xl"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {user && (
                <div className="p-4 border-t mt-auto">
                  <button
                    onClick={logout}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Terms Modal for Mobile as well */}
      {isTermsModalOpen && (
        <TermsOfServiceModal
          onClose={() => setIsTermsModalOpen(false)}
          onContinue={() => {
            setIsTermsModalOpen(false);
            handleApply();
          }}
        />
      )}
    </header>
  );
};

export default Header;
