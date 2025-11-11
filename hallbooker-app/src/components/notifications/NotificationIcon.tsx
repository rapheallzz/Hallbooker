"use client";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const NotificationIcon = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        const notifications = Array.isArray(response.data.data) ? response.data.data : [];
        const unread = notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationIcon;
