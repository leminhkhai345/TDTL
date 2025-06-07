import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "../src/contexts/NotificationContext";

const NotificationsDropdown = ({ onClose }) => {
  const { notifications, loading, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadMore = async () => {
    const nextPage = page + 1;
    const data = await fetchNotifications(nextPage, pageSize);
    if (data.items.length > 0) setPage(nextPage);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark All as Read
          </button>
        )}
      </div>
      {loading ? (
        <div className="px-4 py-2 text-center text-gray-600">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="px-4 py-2 text-center text-gray-600">No notifications</div>
      ) : (
        <>
          {notifications.map((notification) => (
            <div
              key={notification.notificationId}
              className={`px-4 py-2 hover:bg-blue-100 ${notification.isRead ? "opacity-60" : ""}`}
            >
              <div className="flex items-start space-x-2">
                <FontAwesomeIcon
                  icon={faBell}
                  className={`mt-1 ${notification.isRead ? "text-gray-400" : "text-blue-600"}`}
                />
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  {notification.link && (
                    <Link
                      to={notification.link}
                      onClick={onClose}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                  )}
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.notificationId)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Mark as Read"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {notifications.length >= page * pageSize && (
            <div className="px-4 py-2 text-center">
              <button
                onClick={loadMore}
                className="text-sm text-blue-600 hover:underline"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsDropdown;