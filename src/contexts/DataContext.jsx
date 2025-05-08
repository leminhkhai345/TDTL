// src/contexts/DataContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getUsers, getBooks, getOrders, getReviews } from '../API/api';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]); // Sách từ mock API
  const [googleBooks, setGoogleBooks] = useState([]); // Sách từ Google Books API
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, booksData, ordersData, reviewsData] = await Promise.all([
        getUsers(),
        getBooks(),
        getOrders(),
        getReviews(),
      ]);

      setUsers(usersData.users || usersData);
      setBooks(booksData.books || booksData);
      setOrders(ordersData.orders || ordersData);
      setReviews(reviewsData.reviews || reviewsData);
    } catch (err) {
      console.error(err.message || 'Failed to load data');
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
        setGoogleBooks, // Hàm để cập nhật danh sách sách từ Google Books API
        orders,
        reviews,
        loading,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};