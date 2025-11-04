"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Check, Circle } from "lucide-react";

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.data);
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
      await api.post(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAsUnread = async (notificationId: string) => {
    try {
      await api.post(`/notifications/${notificationId}/unread`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as unread:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <div className="absolute right-0 w-80 mt-2 origin-top-right bg-white rounded-md shadow-lg z-50">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <button onClick={handleMarkAllAsRead} className="text-sm text-primary hover:underline">
          Mark all as read
        </button>
      </div>
      <div className="py-1 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start p-4 ${
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
      <div className="p-2 text-center border-t">
        <Link href="/notifications" className="text-sm text-primary hover:underline">
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
