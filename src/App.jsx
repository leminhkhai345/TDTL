import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../Components/Navbar";
import BrowseBooksPage from "../Pages/BrowseBooksPage";
import LoginPage from "../Pages/LoginPage";
import ExchangePage from "../Pages/ExchangePage";
import HomePage from "../Pages/HomePage";
import SignUpPage from "../Pages/SignUpPage";
import ProfilePage from "../Pages/ProfilePage";
import SettingsPage from "../Pages/SettingsPage";
import BookDetailsPage from "../Pages/BookDetailsPage";
import CartPage from "../Pages/CartPage";
import Footer from "../Components/Footer";
import ExchangeHistoryPage from "../Pages/ExchangeHistoryPage";
import SellPage from "../Pages/SellPage"; // Thêm SellPage
import SellHistoryPage from "../Pages/SellHistoryPage"; // Thêm SellHistoryPage
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { CartProvider } from "../src/contexts/CartContext";
import { Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // Thêm ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Thêm CSS cho toast
import CheckoutPage from "../Pages/CheckoutPage"; // Thêm CheckoutPage
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
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
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;