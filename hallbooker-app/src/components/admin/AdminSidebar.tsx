"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Building,
  Calendar,
  BarChart,
  Users,
  Settings,
  LogOut,
  Shield,
  DollarSign,
} from "lucide-react";

const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navLinks = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={24} />,
    },
    {
      href: "/admin/dashboard/halls",
      label: "Halls",
      icon: <Building size={24} />,
    },
    {
      href: "/admin/dashboard/bookings",
      label: "Bookings",
      icon: <Calendar size={24} />,
    },
    {
      href: "/admin/dashboard/analytics",
      label: "Analytics",
      icon: <BarChart size={24} />,
    },
    {
      href: "/admin/dashboard/users",
      label: "Users",
      icon: <Users size={24} />,
    },
    {
      href: "/admin/dashboard/license-tiers",
      label: "License Tiers",
      icon: <Shield size={24} />,
    },
    {
      href: "/admin/dashboard/payment-management",
      label: "Payment Management",
      icon: <DollarSign size={24} />,
    },
    {
      href: "/admin/dashboard/settings",
      label: "Settings",
      icon: <Settings size={24} />,
    },
  ];

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      <div className="flex-shrink-0 mb-8">
        <Link href="/">
          <span className="text-2xl font-bold text-primary">HB</span>
        </Link>
      </div>
      <nav className="flex-1 flex flex-col items-center space-y-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center justify-center h-12 w-12 rounded-lg transition-colors duration-200 ${
              pathname === link.href
                ? "bg-primary text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title={link.label}
          >
            {link.icon}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex items-center justify-center h-12 w-12 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <LogOut size={24} />
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
