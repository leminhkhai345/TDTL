// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../Components/Navbar"; // Import Navbar
import BrowseBooksPage from "../Pages/BrowseBooksPage";
import LoginPage from "../Pages/LoginPage";
import ExchangePage from "../Pages/ExchangePage";
import HomePage from "../Pages/HomePage";
import { useAuth, AuthProvider } from "../src/contexts/AuthContext"; // Import useAuth
import { Navigate } from "react-router-dom"; // Import Navigate
import { useEffect, useState } from "react"; // Import useEffect và useState
import SignUpPage from "../Pages/SignUpPage"; // Import SignUpPage
import ProfilePage from "../Pages/ProfilePage";
import SettingsPage from "../Pages/SettingsPage";
import BookDetailsPage from "../Pages/BookDetailsPage";
import { CartProvider } from "../src/contexts/CartContext"; // Import CartProvider
import CartPage from "../Pages/CartPage"; // Import CartPage
import Footer from "../Components/Footer"; // Import Footer
// Thêm vào <Routes>

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);
  return (
    <CartProvider>
    <Router>
      <Navbar />
      {/* Đặt AuthProvider ở đây để tất cả các component con đều có thể sử dụng context */}
      <Routes>
        {/* Trang chủ (HomePage) */}
        <Route path="/" element={<HomePage />} />

        {/* Trang BrowseBooksPage: Có thể xem mà không cần đăng nhập */}
        <Route path="/browse" element={<BrowseBooksPage />} />

        {/* Trang đăng nhập (LoginPage) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        {/* Trang ExchangePage yêu cầu đăng nhập */}
        <Route
          path="/exchange"
          element={isLoggedIn ? <ExchangePage /> : <Navigate to="/login" />}
        />

        <Route path="/book-details/:bookId" element={<BookDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/books/:bookId" element={<BookDetailsPage />} />
         <Route path="/cart" element={<CartPage />} /> {/* Thêm route cho giỏ hàng */}

        {/* Nếu không tìm thấy trang, chuyển hướng về trang chủ */}
      </Routes>
    </Router>
    </CartProvider>
  );
};
// Protected route component để kiểm tra đăng nhập

export default App;
