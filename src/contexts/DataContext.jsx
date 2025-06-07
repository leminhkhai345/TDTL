import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUsers, getOrders, getCategories } from '../API/api'; // Thay getAdminCategories bằng getCategories
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { isLoggedIn, user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]); // Vẫn giữ state categories
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timeout = (promise, time) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API timeout')), time)
      ),
    ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Checking auth state:', { isLoggedIn, user });
      if (!isLoggedIn || !user || user.role?.toLowerCase() !== 'admin') {
        const errorMsg = 'Quyền truy cập bị từ chối: Yêu cầu vai trò admin';
        console.error(errorMsg);
        setError(errorMsg);
        toast.error(errorMsg + '. Vui lòng đăng nhập lại với tài khoản admin.');
        logout();
        window.location.href = '/login';
        return;
      }

      const usersPromise = timeout(getUsers(), 5000).catch((err) => {
        console.error('Error fetching users:', err.message);
        toast.error(`Không thể tải danh sách người dùng: ${err.message}`);
        return { users: [], total: 0 };
      });

      const ordersPromise = timeout(getOrders(), 5000).catch((err) => {
        console.error('Error fetching orders:', err.message);
        toast.error(`Không thể tải danh sách đơn hàng: ${err.message}`);
        return { orders: [], total: 0 };
      });


      // Thay getAdminCategories bằng getCategories
      const categoriesPromise = timeout(getCategories(), 5000).catch((err) => {
        console.error('Error fetching categories:', err.message);
        toast.error(`Không thể tải danh sách danh mục: ${err.message}`);
        return []; // getCategories trả về mảng
      });

      const [usersData, ordersData, categoriesData] = await Promise.all([
        usersPromise,
        ordersPromise,
        categoriesPromise,
      ]);

      console.log('API responses:', { usersData, ordersData, categoriesData });

      setUsers(Array.isArray(usersData.users) ? usersData.users : []);
      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []); // getCategories trả về mảng trực tiếp

      if (
        !usersData.users.length &&
        !ordersData.orders.length &&
        !categoriesData.length
      ) {
        setError('Không thể tải dữ liệu admin. Vui lòng kiểm tra kết nối hoặc API.');
        toast.warn('Dữ liệu admin rỗng. Vui lòng thử lại.');
      }
    } catch (err) {
      const errorMsg = err.message || 'Không thể tải dữ liệu';
      console.error('Fetch data error:', errorMsg, err);
      setError(errorMsg);
      toast.error(errorMsg);
      setUsers([]);
      setOrders([]);
      setCategories([]);
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
        logout();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
      console.log('Fetch data completed. Loading:', false);
    }
  };

  useEffect(() => {
    console.log('Initializing DataContext fetch...');
    if (isLoggedIn && user?.role?.toLowerCase() === 'admin') {
      fetchData();
    } else {
      console.log('Skipping fetch: Not logged in or not admin');
    }
  }, [isLoggedIn, user]);

  const refreshData = () => {
    console.log('Refreshing data...');
    fetchData();
  };

  return (
    <DataContext.Provider
      value={{
        users,
        orders,
        categories,
        loading,
        error,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};