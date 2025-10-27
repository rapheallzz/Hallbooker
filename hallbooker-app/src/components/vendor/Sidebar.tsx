"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();

  const navLinks = [
    { href: "/vendor/dashboard", label: "Dashboard" },
    { href: "/vendor/dashboard/halls", label: "Halls" },
    { href: "/vendor/dashboard/bookings", label: "Bookings" },
    { href: "/vendor/dashboard/analytics", label: "Analytics" },
    { href: "/vendor/dashboard/staff", label: "Staff" },
    { href: "/vendor/dashboard/settings", label: "Settings" },
  ];

  return (
    <div
      className={`bg-primary text-white ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col transition-all duration-300`}
    >
      <div className="flex items-center justify-between h-20 px-4">
        <span className={`text-2xl font-bold ${!isOpen && "hidden"}`}>
          Vendor
        </span>
        <button onClick={toggleSidebar} className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-secondary ${
              pathname === link.href ? "bg-secondary" : ""
            }`}
          >
            <span className={`${!isOpen && "hidden"}`}>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
