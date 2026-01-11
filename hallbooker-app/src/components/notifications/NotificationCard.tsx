
import { Check, Circle } from "lucide-react";

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
}

const NotificationCard = ({ notification, onMarkAsRead, onMarkAsUnread }: NotificationCardProps) => {
  return (
    <div
      className={`flex items-start p-4 sm:p-6 rounded-lg shadow-md transition-all duration-300 ${
        notification.isRead ? "bg-gray-50" : "bg-white"
      }`}
    >
      <div className="flex-shrink-0">
        {notification.isRead ? (
          <Check className="w-6 h-6 text-green-500" />
        ) : (
          <Circle className="w-6 h-6 text-blue-500" />
        )}
      </div>
      <div className="ml-4 flex-grow">
        <p className="text-md font-semibold text-gray-800">{notification.message}</p>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
        <div className="mt-2">
          {!notification.isRead ? (
            <button
              onClick={() => onMarkAsRead(notification._id)}
              className="text-sm text-primary hover:underline"
            >
              Mark as read
            </button>
          ) : (
            <button
              onClick={() => onMarkAsUnread(notification._id)}
              className="text-sm text-gray-500 hover:underline"
            >
              Mark as unread
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
