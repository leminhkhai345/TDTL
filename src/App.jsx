import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import BrowseBooksPage from '../Pages/BrowseBooksPage';
import LoginPage from '../Pages/LoginPage';
import HomePage from '../Pages/HomePage';
import SignUpPage from '../Pages/SignUpPage';
import ProfilePage from '../Pages/ProfilePage';
import SettingsPage from '../Pages/SettingsPage';
import BookDetailsPage from '../Pages/BookDetailsPage';
import CartPage from '../Pages/CartPage';
import SellPage from '../Pages/SellPage';
import SellHistoryPage from '../Pages/SellHistoryPage';
import ForgotPasswordPage from '../Pages/ForgotPasswordPage';
import ResetPasswordPage from '../Pages/ResetPasswordPage';
import InventoryPage from '../Pages/InventoryPage';
import OtpPage from '../Pages/OtpPage';
import AdminDashboard from '../Pages/AdminDashboard';
import AdminUsersPage from '../Pages/AdminUsersPage';
import AdminBooksPage from '../Pages/AdminBooksPage';
import AdminOrdersPage from '../Pages/AdminOrdersPage';
import AdminStatisticsPage from '../Pages/AdminStatisticsPage';
import AdminCategoriesPage from '../Pages/AdminCategoriesPage';
import AdminPaymentMethodsPage from '../Pages/AdminPaymentMethodsPage';
import OrderDetailsPage from '../Pages/OrderDetailsPage';
import ConfirmPaymentPage from '../Pages/ConfirmPaymentPage';
import MyPurchasesPage from '../Pages/MyPurchasesPage';
import MySalesPage from '../Pages/MySalesPage';
import MyListingsPage from '../Pages/MyListingsPage';
import OrderPage from '../Pages/OrderPage';
import SellerProfilePage from '../Pages/SellerProfilePage';
import MyReviewsPage from '../Pages/MyReviewsPage';
import NotFoundPage from '../Pages/NotFoundPage';

import UserStatisticsPage from '../Pages/UserStatisticsPage';

import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { DataProvider } from '../src/contexts/DataContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, requiresAuth } = useAuth();
  const location = useLocation();

  if (!isLoggedIn && requiresAuth(location.pathname)) {
    toast.info('Please log in to access this page');
    return <Navigate to="/login" state={{ from: location }} />;
  }

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
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowseBooksPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/otp" element={<OtpPage />} />

                {/* Protected routes */}
                <Route path="/books/:listingId" element={
                  <ProtectedRoute>
                    <BookDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
                <Route path="/sell-history" element={<ProtectedRoute><SellHistoryPage /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/order" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
                <Route path="/my-listings" element={<MyListingsPage />} />
                <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
                <Route path="/orders/:orderId/confirm-payment" element={<ProtectedRoute><ConfirmPaymentPage /></ProtectedRoute>} />
                <Route path="/my-purchases" element={<ProtectedRoute><MyPurchasesPage /></ProtectedRoute>} />
                <Route path="/my-sales" element={<ProtectedRoute><MySalesPage /></ProtectedRoute>} />
                <Route path="/seller/:sellerId" element={<ProtectedRoute><SellerProfilePage /></ProtectedRoute>} />
                <Route path="/reviews" element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                <Route path="/admin/books" element={<AdminRoute><AdminBooksPage /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
                <Route path="/admin/payment-methods" element={<AdminRoute><AdminPaymentMethodsPage /></AdminRoute>} />
                <Route path="/admin/statistics" element={<AdminRoute><AdminStatisticsPage /></AdminRoute>} />
                <Route path="/admin/users/:userId/listings" element={<AdminRoute><MyListingsPage /></AdminRoute>} />
                <Route path="/statistics" element={<UserStatisticsPage />} />
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