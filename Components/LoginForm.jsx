// src/Components/LoginForm.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../src/contexts/AuthContext"; // Import useAuth từ context

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ context

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login(email, password); // Sử dụng login từ context

      if (res.success) {
        navigate("/profile"); // Nếu đăng nhập thành công, chuyển đến trang Profile
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Login
      </button>

      {error && <p className="text-red-500 text-center mt-2">{error}</p>}

      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
