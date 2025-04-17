// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../Pages/HomePage"; // Trang chính
import LoginPage from "../Pages/LoginPage"; // Trang Login
import SignUpPage from "../Pages/SignUpPage"; // Trang Đăng ký
import Navbar from "../Components/Navbar"; // Thanh điều hướng
import BrowseBooks from "../Pages/BrowseBooksPage";
import OtpPage from "../Pages/OtpPage"; // Trang OTP
import BookDetailsPage from "../Pages/BookDetailsPage"; // Trang chi tiết sách
function App() {
  return (
    <Router>
       <Navbar />
       {/* <OtpPage/> */}
      <Routes>
        {/* Định nghĩa các route cho ứng dụng */}
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowseBooks />} />
        <Route path="/book-details/:bookId" element={<BookDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/otp" element={<OtpPage />} />
      </Routes>
    </Router>
  );
}

export default App;
