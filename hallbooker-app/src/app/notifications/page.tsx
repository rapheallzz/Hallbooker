"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Check, Circle } from "lucide-react";
import withAuth from "@/components/auth/withAuth";

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

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
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start p-4 border-b ${
                notification.isRead ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="flex-shrink-0">
                {notification.isRead ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
                {!notification.isRead ? (
                  <button onClick={() => handleMarkAsRead(notification._id)} className="text-xs text-primary hover:underline">
                    Mark as read
                  </button>
                ) : (
                  <button onClick={() => handleMarkAsUnread(notification._id)} className="text-xs text-gray-500 hover:underline">
                    Mark as unread
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-center text-gray-500">No notifications</p>
        )}
      </div>
    </div>
  );
};

export default withAuth(NotificationsPage, ["user", "hall-owner", "staff", "super-admin"]);
