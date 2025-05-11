import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../src/API/api";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      toast.error("Invalid email format");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      toast.success(response.message || "A reset link has been sent to your email. Please check your inbox or spam folder.");
      navigate("/reset-password");
    } catch (err) {
      const errorMessage = err.message.includes("Lỗi HTTP 500")
        ? "Server error occurred. Please try again later or contact support."
        : err.message || "Failed to send reset password request";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-4xl font-bold mb-4">Forgot Your Password?</h1>
          <p className="text-lg mb-6">
            Enter your email to receive a reset token and regain access to your BookStore account.
          </p>
          <div className="flex justify-center">
            <img
              src="https://via.placeholder.com/300x200.png?text=Book+Illustration"
              alt="Book Illustration"
              className="w-3/4 h-auto opacity-90"
            />
          </div>
        </div>

        {/* Phần form bên phải */}
        <motion.div
          className="w-full lg:w-1/2 p-8 bg-white flex flex-col justify-center"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Request Password Reset</h2>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center"
            >
              <p>{error}</p>
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={inputVariants} className="relative">
              <label className="block font-medium mb-1 text-gray-700">Email</label>
              <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faEnvelope} className="ml-3 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value.trim());
                    setError("");
                  }}
                  className="w-full p-3 pl-4 border-0 focus:outline-none rounded-lg"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>
            <motion.div variants={inputVariants}>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Instructions"}
              </button>
            </motion.div>
          </form>
          <div className="text-center mt-6">
            <p>
              Remember your password?{" "}
              <Link to="/login" className="text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;