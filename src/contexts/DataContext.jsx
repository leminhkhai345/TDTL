import React, { createContext, useState, useEffect } from 'react';
import { getUsers, getOrders, getReviews, getAdminCategories } from '../API/api';
import { toast } from 'react-toastify';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [googleBooks, setGoogleBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') {
        setError('Access denied: Admin role required');
        toast.error('Access denied: Admin role required');
        return;
      }
      const [usersData, ordersData, reviewsData, categoriesData] = await Promise.all([
        getUsers().catch((err) => {
          toast.error('Failed to fetch users: ' + err.message);
          return { users: [], total: 0 };
        }),
        getOrders().catch((err) => {
          toast.error('Failed to fetch orders: ' + err.message);
          return { orders: [], total: 0 };
        }),
        getReviews().catch((err) => {
          toast.error('Failed to fetch reviews: ' + err.message);
          return { reviews: [], total: 0 };
        }),
        getAdminCategories().catch((err) => {
          toast.error('Failed to fetch categories: ' + err.message);
          return { categories: [], total: 0 };
        }),
      ]);

      setUsers(usersData.users || usersData);
      setOrders(ordersData.orders || ordersData);
      setReviews(reviewsData.reviews || reviewsData);
      setCategories(categoriesData.categories || categoriesData);
    } catch (err) {
      const errorMsg = err.message || 'Failed to load data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  return (
    <DataContext.Provider
      value={{
        users,
        books,
        googleBooks,
        setGoogleBooks,
        orders,
        reviews,
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