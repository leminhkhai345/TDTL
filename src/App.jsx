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
import ForgotPasswordPage from '../Pages/ForgotPasswordPage';
import ResetPasswordPage from '../Pages/ResetPasswordPage';
import InventoryPage from '../Pages/InventoryPage';
import CheckoutPage from '../Pages/CheckoutPage';
import OtpPage from '../Pages/OtpPage';
import AdminDashboard from '../Pages/AdminDashboard';
import AdminUsersPage from '../Pages/AdminUsersPage';
import AdminBooksPage from '../Pages/AdminBooksPage';
import AdminOrdersPage from '../Pages/AdminOrdersPage';
import AdminReviewsPage from '../Pages/AdminReviewsPage';
import AdminStatisticsPage from '../Pages/AdminStatisticsPage';
import AdminCategoriesPage from '../Pages/AdminCategoriesPage';
import OrderDetailsPage from '../Pages/OrderDetailsPage';
import ConfirmPaymentPage from '../Pages/ConfirmPaymentPage';
import MyPurchasesPage from '../Pages/MyPurchasesPage';
import MySalesPage from '../Pages/MySalesPage';
import MyListingsPage from '../Pages/MyListingsPage';
import NotFoundPage from '../Pages/NotFoundPage';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { DataProvider } from '../src/contexts/DataContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-gray-600 text-lg">Đang tải...</div>
    </div>
  );
  if (!isLoggedIn) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-gray-600 text-lg">Đang tải...</div>
    </div>
  );
  if (!isLoggedIn) return <Navigate to="/login" />;
  if (!isAdmin()) return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <DataProvider>
          <NotificationProvider>
            <Router>
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/otp" element={<OtpPage />} />
                <Route path="/browse" element={<ProtectedRoute><BrowseBooksPage /></ProtectedRoute>} />
                <Route path="/exchange" element={<ProtectedRoute><ExchangePage /></ProtectedRoute>} />
                <Route path="/exchange-history" element={<ProtectedRoute><ExchangeHistoryPage /></ProtectedRoute>} />
                <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
                <Route path="/sell-history" element={<ProtectedRoute><SellHistoryPage /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                <Route path="/books/:listingId" element={<ProtectedRoute><BookDetailsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
                <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
                <Route path="/orders/:orderId/confirm-payment" element={<ProtectedRoute><ConfirmPaymentPage /></ProtectedRoute>} />
                <Route path="/my-purchases" element={<ProtectedRoute><MyPurchasesPage /></ProtectedRoute>} />
                <Route path="/my-sales" element={<ProtectedRoute><MySalesPage /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                <Route path="/admin/books" element={<AdminRoute><AdminBooksPage /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
                <Route path="/admin/reviews" element={<AdminRoute><AdminReviewsPage /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
                <Route path="/admin/statistics" element={<AdminRoute><AdminStatisticsPage /></AdminRoute>} />
                <Route path="/admin/users/:userId/listings" element={<AdminRoute><MyListingsPage /></AdminRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <ToastContainer position="top-right" autoClose={3000} />
            </Router>
          </NotificationProvider>
        </DataProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;