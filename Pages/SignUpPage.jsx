// src/pages/SignUpPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SignUpForm from "../Components/SignUpForm";
import { useAuth } from "../src/contexts/AuthContext"; // Import useAuth từ context

const SignUpPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth(); // Lấy hàm register từ context

  const handleSignUpSubmit = async (name, email, phone, password, confirmPassword) => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const res = await register(name, email, phone, password); // Sử dụng register từ context

      if (res.success) {
        navigate("/login"); // Nếu đăng ký thành công, chuyển đến trang đăng nhập
      } else {
        setErrorMessage(res.message || "Đăng ký thất bại");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setErrorMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Sign Up</h2>

        <SignUpForm onSubmit={handleSignUpSubmit} errorMessage={errorMessage} />

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
