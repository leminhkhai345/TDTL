import React, { useState } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(email, password);
      if (result.success) {
        // Chuyển hướng dựa trên vai trò
        const redirectTo = result.role === 'Admin' ? '/admin' : '/';
        navigate(redirectTo);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to login. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleTryAgain = () => {
    setError("");
    setEmail("");
    setPassword("");
  };

  // Hiệu ứng animation cho form
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-5xl mx-auto shadow-2xl rounded-xl overflow-hidden">
        {/* Phần minh họa bên trái */}
        <div className="hidden lg:block w-1/2 bg-gradient-to-r from-blue-600 to-blue-800 p-10 text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome to BookStore</h1>
          <p className="text-lg mb-6">
            Log in to explore a world of books, exchange your favorites, and manage your collection with ease.
          </p>
          <div className="flex justify-center">
            <img
              src="https://via.placeholder.com/300x200.png?text=Book+Illustration"
              alt="Book Illustration"
              className="w-3/4 h-auto opacity-90"
            />
          </div>
        </div>

        {/* Phần form đăng nhập bên phải */}
        <motion.div
          className="w-full lg:w-1/2 p-8 bg-white flex flex-col justify-center"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Login to Your Account</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
              <p>{error}</p>
              <button
                onClick={handleTryAgain}
                className="mt-2 text-blue-600 hover:underline focus:outline-none"
              >
                Try Again
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div variants={inputVariants} className="relative">
              <label className="block font-medium mb-1 text-gray-700">Email</label>
              <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faEnvelope} className="ml-3 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 pl-4 border-0 focus:outline-none rounded-lg"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>
            <motion.div variants={inputVariants} className="relative">
              <label className="block font-medium mb-1 text-gray-700">Password</label>
              <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faLock} className="ml-3 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pl-4 border-0 focus:outline-none rounded-lg"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="mr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </motion.div>
            <motion.div variants={inputVariants}>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold text-lg rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                disabled={authLoading}
              >
                {authLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </motion.div>
          </form>
          <div className="text-center mt-6 space-y-2">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                Sign Up
              </Link>
            </p>
            <p>
              Forgot your password?{" "}
              <Link to="/forgot-password" className="text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                Request Password Reset
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;