// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import BrowseBooksPage from '../Pages/BrowseBooksPage';
import LoginPage from '../Pages/LoginPage';
import ExchangePage from '../Pages/ExchangePage';
import HomePage from '../Pages/HomePage';
import SignUpPage from '../Pages/SignUpPage';
import ProfilePage from '../Pages/ProfilePage';
import SettingsPage from '../Pages/SettingsPage';
import BookDetailsPage from '../Pages/BookDetailsPage';
import CartPage from '../Pages/CartPage';
import ExchangeHistoryPage from '../Pages/ExchangeHistoryPage';
import SellPage from '../Pages/SellPage';
import SellHistoryPage from '../Pages/SellHistoryPage';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { DataProvider } from '../src/contexts/DataContext'; // Thêm import
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CheckoutPage from '../Pages/CheckoutPage';
import OtpPage from '../Pages/OtpPage';
import AdminDashboard from '../Pages/AdminDashboard';
import AdminUsersPage from '../Pages/AdminUsersPage';
import AdminBooksPage from '../Pages/AdminBooksPage';
import AdminOrdersPage from '../Pages/AdminOrdersPage';
import AdminReviewsPage from '../Pages/AdminReviewsPage';
import AdminStatisticsPage from '../Pages/AdminStatisticsPage';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  return isLoggedIn && user?.role === 'admin' ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <DataProvider> {/* Thêm DataProvider */}
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowseBooksPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/exchange" element={<ProtectedRoute><ExchangePage /></ProtectedRoute>} />
              <Route path="/exchange-history" element={<ProtectedRoute><ExchangeHistoryPage /></ProtectedRoute>} />
              <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
              <Route path="/sell-history" element={<ProtectedRoute><SellHistoryPage /></ProtectedRoute>} />
              <Route path="/book-details/:bookId" element={<BookDetailsPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/books/:bookId" element={<BookDetailsPage />} />
              <Route path="/otp" element={<OtpPage />} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
              <Route path="/admin/books" element={<AdminRoute><AdminBooksPage /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
              <Route path="/admin/reviews" element={<AdminRoute><AdminReviewsPage /></AdminRoute>} />
              <Route path="/admin/statistics" element={<AdminRoute><AdminStatisticsPage /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </Router>
        </DataProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;