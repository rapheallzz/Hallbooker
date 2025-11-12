"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import React from "react";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthPage =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register");
  const isDashboardPage =
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/admin");

  if (isDashboardPage || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default LayoutWrapper;
