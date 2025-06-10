import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } from '../API/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      toast.error('Không thể tải số lượng thông báo');
      console.error('Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (pageNumber = 1, pageSize = 10, onlyUnread = false) => {
    if (!isLoggedIn) return { items: [], total: 0 };
    try {
      setLoading(true);
      const data = await getNotifications(pageNumber, pageSize, onlyUnread);
      setNotifications((prev) => (pageNumber === 1 ? data.items : [...prev, ...data.items]));
      return data;
    } catch (err) {
      toast.error('Không thể tải danh sách thông báo');
      console.error('Error fetching notifications:', err);
      return { items: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Không thể đánh dấu thông báo là đã đọc');
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      toast.error('Không thể đánh dấu tất cả là đã đọc');
      console.error('Error marking all notifications as read:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
      fetchNotifications();
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchNotifications(1, 10);
      }, 60000); // Cập nhật mỗi 60 giây
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);