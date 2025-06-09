import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheckCircle, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
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
    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-96 bg-white text-gray-800 rounded-2xl shadow-2xl z-50 max-h-[28rem] overflow-y-auto border border-blue-200 animate-fade-in"
         style={{ minWidth: 320 }}>
      <div className="flex justify-between items-center px-5 py-3 border-b bg-gradient-to-r from-blue-100 via-white to-blue-100 rounded-t-2xl">
        <h3 className="font-semibold text-blue-800 text-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faBell} className="text-blue-500" />
          Notifications
        </h3>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow"
            title="Mark all as read"
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            Mark all as read
          </button>
        )}
      </div>
      {loading ? (
        <div className="px-5 py-8 text-center text-blue-600">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="px-5 py-8 text-center text-gray-500">No notifications</div>
      ) : (
        <>
          {notifications.map((notification) => (
            <div
              key={notification.notificationId}
              className={`px-5 py-4 border-b last:border-b-0 hover:bg-blue-50 transition-all flex gap-3 items-start ${
                notification.isRead ? "opacity-60" : ""
              }`}
            >
              <div className="flex-shrink-0">
                <FontAwesomeIcon
                  icon={faBell}
                  className={`text-xl mt-1 ${notification.isRead ? "text-gray-300" : "text-blue-600 animate-pulse"}`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{notification.message}</span>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.notificationId)}
                      className="text-blue-600 hover:text-blue-800 ml-1"
                      aria-label="Mark as read"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</span>
                  {notification.link && (
                    <Link
                      to={notification.link}
                      onClick={onClose}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
          {notifications.length >= page * pageSize && (
            <div className="px-5 py-3 text-center">
              <button
                onClick={loadMore}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeInDropdown 0.18s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeInDropdown {
          0% { opacity: 0; transform: translateY(-10px) scale(0.98);}
          100% { opacity: 1; transform: translateY(0) scale(1);}
        }
      `}</style>
    </div>
  );
};

export default NotificationsDropdown;