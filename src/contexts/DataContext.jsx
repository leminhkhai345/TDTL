import React, { createContext, useState, useEffect } from 'react';
import { getUsers, getBooks, getOrders, getReviews } from '../API/api';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [googleBooks, setGoogleBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, booksData, ordersData, reviewsData] = await Promise.all([
        getUsers().catch(err => {
          console.error('Failed to fetch users:', err.message);
          return { users: [], total: 0 };
        }),
        getBooks().catch(err => {
          console.error('Failed to fetch books:', err.message);
          return { books: [], total: 0 };
        }),
        getOrders().catch(err => {
          console.error('Failed to fetch orders:', err.message);
          return { orders: [], total: 0 };
        }),
        getReviews().catch(err => {
          console.error('Failed to fetch reviews:', err.message);
          return { reviews: [], total: 0 };
        }),
      ]);

      setUsers(usersData.users || usersData);
      setBooks(booksData.books || booksData);
      setOrders(ordersData.orders || ordersData);
      setReviews(reviewsData.reviews || reviewsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
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
        setGoogleBooks,
        orders,
        reviews,
        loading,
        error,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};