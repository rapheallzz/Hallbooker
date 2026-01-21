"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import withAuth from "@/components/auth/withAuth";
import NotificationCard from "@/components/notifications/NotificationCard";
import EmptyState from "@/components/EmptyState";
import { Notification } from "@/types";

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAsUnread = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/unread`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as unread:", error);
    }
  };

  return (
    <div className="container mx-auto py-10 pt-32 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : notifications.length > 0 ? (
        <div className="grid gap-4 md:gap-6">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onMarkAsUnread={handleMarkAsUnread}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="You're all caught up!" />
      )}
    </div>
  );
};

export default withAuth(NotificationsPage, ["user", "hall-owner", "staff", "super-admin"]);
